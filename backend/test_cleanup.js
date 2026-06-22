const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function cleanup() {
  try {
    let allIds = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    console.log('Fetching all product IDs...');
    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .range(from, from + limit - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allIds.push(...data.map(p => String(p.id)));
        from += limit;
        if (data.length < limit) {
          hasMore = false;
        }
      }
    }

    console.log('Total fetched rows:', allIds.length);
    const counts = {};
    for (const id of allIds) {
      counts[id] = (counts[id] || 0) + 1;
    }

    const duplicates = Object.entries(counts)
      .filter(([id, count]) => count > 1)
      .map(([id]) => id);

    console.log('Total duplicate IDs found:', duplicates.length);

    if (duplicates.length === 0) {
      console.log('No duplicates found. Database is clean!');
      return;
    }

    // Process a few duplicates first as a test
    const testSlice = duplicates.slice(0, 5);
    console.log('Testing cleanup on 5 IDs:', testSlice);

    for (const id of testSlice) {
      // 1. Get all rows for this ID
      const { data: rows, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', id);

      if (fetchErr) throw fetchErr;

      console.log(`ID ${id} has ${rows.length} rows.`);

      // 2. Determine the latest row based on last_seen
      let latestRow = rows[0];
      for (const row of rows) {
        const latestTime = latestRow.last_seen ? new Date(latestRow.last_seen).getTime() : 0;
        const rowTime = row.last_seen ? new Date(row.last_seen).getTime() : 0;
        if (rowTime > latestTime) {
          latestRow = row;
        }
      }

      // 3. Delete all rows with this ID
      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;

      // 4. Re-insert the latest row
      // Remove fields that database will auto-populate or we don't want to re-insert if they are null
      const { error: insErr } = await supabase
        .from('products')
        .insert(latestRow);

      if (insErr) {
        console.error(`Failed to re-insert product ${id}:`, insErr);
      } else {
        console.log(`Cleaned up duplicate ID ${id} successfully. Kept row with last_seen: ${latestRow.last_seen}`);
      }
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

cleanup();
