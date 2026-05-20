const cron = require('node-cron');
const env = require('../config/env');
const syncGlobalJob = require('../jobs/syncGlobalJob');
const logger = require('../utils/logger');

let isRunning = false;

function startCrawler() {
  logger.info(`Starting Crawler with CRON schedule: ${env.CRAWLER_CRON}`);

  cron.schedule(env.CRAWLER_CRON, async () => {
    if (isRunning) {
      logger.info('Crawler is already running. Skipping this cycle.');
      return;
    }

    isRunning = true;
    try {
      await runGlobalSync();
    } catch (err) {
      logger.error(`Crawler execution error: ${err.message}`);
    } finally {
      isRunning = false;
    }
  });
}

async function runGlobalSync() {
  logger.info('Starting full global sync cycle');
  
  await syncGlobalJob();
  
  logger.info('Finished full global sync cycle');
}

module.exports = { startCrawler };
