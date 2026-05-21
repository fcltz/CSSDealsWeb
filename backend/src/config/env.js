const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  AUTO_PING_URL: process.env.AUTO_PING_URL,
  AUTO_PING_INTERVAL: parseInt(process.env.AUTO_PING_INTERVAL || '300000', 10),
  CRAWLER_INTERVAL: parseInt(process.env.CRAWLER_INTERVAL || '300000', 10),
};
