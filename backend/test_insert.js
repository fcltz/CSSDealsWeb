const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    const testProduct = {
      id: '999999999999999999',
      title: 'Test insert string bigint',
      category_id: '15',
      cssbuy_order_id: '12345678',
      creator_id: '181',
      last_seen: new Date().toISOString()
    };

    console.log('Inserting test product...');
    const { error: insErr } = await supabase
      .from('products')
      .insert(testProduct);

    if (insErr) throw insErr;
    console.log('SUCCESS: Inserted product successfully!');

    // Let's clean it up
    await supabase.from('products').delete().eq('id', '999999999999999999');
    console.log('Cleaned up test product.');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
