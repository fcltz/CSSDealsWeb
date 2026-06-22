const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    console.log('--- PRODUCTS TIMESTAMP CHECK ---');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, title, created_at, updated_at')
      .limit(5);

    if (prodError) throw prodError;
    console.log('Sample Products:', products);

    console.log('\n--- PROFILES TIMESTAMP CHECK ---');
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, email, created_at, updated_at')
      .limit(5);

    if (profError) throw profError;
    console.log('Sample Profiles:', profiles);

  } catch (err) {
    console.error('Error:', err);
  }
}

test();
