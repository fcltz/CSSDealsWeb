const axios = require('axios');
const env = require('../config/env');
const logger = require('./logger');

function startAutoPing() {
  if (!env.AUTO_PING_URL || !env.AUTO_PING_URL.length || !env.AUTO_PING_INTERVAL) {
    logger.info('AutoPing desativado: AUTO_PING_URL ou AUTO_PING_INTERVAL não configuradas.');
    return;
  }

  const urls = env.AUTO_PING_URL.map(url => {
    const base = url.replace(/\/+$/, '');
    return `${base}/api/health`;
  });
  logger.info(`AutoPing iniciado para ${urls.length} URL(s) com intervalo de ${env.AUTO_PING_INTERVAL}ms:`);
  urls.forEach((url, i) => logger.info(`  [${i + 1}] ${url}`));

  setInterval(async () => {
    const results = await Promise.allSettled(
      urls.map(url => axios.get(url, { timeout: 10000 }))
    );
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Ping falhou para ${urls[i]}: ${result.reason.message}`);
      }
    });
  }, env.AUTO_PING_INTERVAL);
}

module.exports = { startAutoPing };
