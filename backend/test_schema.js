const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

async function test() {
  try {
    const response = await axios.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    console.log('OpenAPI tables:', Object.keys(response.data.paths));
    console.log('Products schema:', JSON.stringify(response.data.definitions.products, null, 2));
  } catch (err) {
    console.error('Error fetching:', err.message);
  }
}

test();
