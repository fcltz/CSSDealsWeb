const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

async function test() {
  try {
    // We can query using RPC if there's any or we can try custom SQL if allowed. 
    // In PostgREST, we can't run arbitrary SQL directly unless there is a function.
    // Let's check if there are functions exposed.
    const response = await axios.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    console.log('RPC paths:', Object.keys(response.data.paths).filter(p => p.startsWith('/rpc')));
  } catch (err) {
    console.error('Error fetching:', err.message);
  }
}

test();
