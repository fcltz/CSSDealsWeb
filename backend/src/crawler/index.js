const env = require('../config/env');
const syncGlobalJob = require('../jobs/syncGlobalJob');
const logger = require('../utils/logger');

// Intervalo de espera entre o fim de um ciclo e o início do próximo
const SYNC_INTERVAL = env.CRAWLER_INTERVAL;

function startCrawler() {
  logger.info(`Starting Crawler (Continuous Loop with ${SYNC_INTERVAL / 1000}s interval)...`);

  async function runCycle() {
    try {
      logger.info('Starting full global sync cycle');
      await syncGlobalJob();
      logger.info('Finished full global sync cycle');
    } catch (err) {
      logger.error(`Crawler execution error: ${err.message}`);
    } finally {
      logger.info(`Waiting ${SYNC_INTERVAL / 1000}s before next sync cycle...`);
      setTimeout(runCycle, SYNC_INTERVAL);
    }
  }

  // Inicia o primeiro ciclo de atualização imediatamente na inicialização
  runCycle();
}

module.exports = { startCrawler };
