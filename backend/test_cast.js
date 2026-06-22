const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id::text')
      .limit(5);

    if (error) throw error;
    console.log('Data with cast to text:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
