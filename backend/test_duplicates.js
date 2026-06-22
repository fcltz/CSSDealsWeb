const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('id');

    if (error) throw error;

    console.log('Total rows in products table:', allProducts.length);

    const uniqueIds = new Set(allProducts.map(p => String(p.id)));
    console.log('Total unique IDs:', uniqueIds.size);

    // Let's count how many have duplicates
    const counts = {};
    for (const p of allProducts) {
      counts[p.id] = (counts[p.id] || 0) + 1;
    }

    const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
    console.log('Number of IDs with duplicates:', duplicates.length);
    console.log('Top duplicates:', duplicates.slice(0, 10));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
