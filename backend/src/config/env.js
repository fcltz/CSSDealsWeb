const dotenv = require('dotenv');
dotenv.config();

const rawInterval = process.env.AUTO_PING_INTERVAL;
const parsedInterval = rawInterval ? parseInt(rawInterval, 10) : NaN;

module.exports = {
  PORT: process.env.PORT || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  AUTO_PING_URL: process.env.AUTO_PING_URL || null,
  AUTO_PING_INTERVAL: !isNaN(parsedInterval) ? parsedInterval : null,
  CRAWLER_INTERVAL: parseInt(process.env.CRAWLER_INTERVAL || '300000', 10),
};
