const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const logger = require('../utils/logger');

let supabase = null;

if (env.SUPABASE_URL && env.SUPABASE_KEY) {
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: {
      persistSession: false,
    }
  });
} else {
  logger.warn('Supabase credentials missing! Supabase client not initialized.');
}

module.exports = supabase;
