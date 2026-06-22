const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    let allIds = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    console.log('Fetching all product IDs in batches of 1000...');
    while (hasMore && allIds.length < 20000) {
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
    const uniqueIds = new Set(allIds);
    console.log('Unique IDs in fetched sample:', uniqueIds.size);

    const counts = {};
    for (const id of allIds) {
      counts[id] = (counts[id] || 0) + 1;
    }

    const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
    console.log('Number of IDs with duplicates in sample:', duplicates.length);
    console.log('Duplicate counts summary:');
    const sortedDuplicates = duplicates.sort((a, b) => b[1] - a[1]);
    console.log(sortedDuplicates.slice(0, 20));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
