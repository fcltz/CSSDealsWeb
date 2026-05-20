const axios = require('axios');
const env = require('../config/env');
const logger = require('./logger');

function startAutoPing() {
  if (!env.AUTO_PING_URL) {
    logger.info('AutoPing desativado: AUTO_PING_URL não configurada.');
    return;
  }

  logger.info(`AutoPing iniciado para a URL: ${env.AUTO_PING_URL} com intervalo de ${env.AUTO_PING_INTERVAL}ms`);

  setInterval(async () => {
    try {
      await axios.get(env.AUTO_PING_URL, { timeout: 10000 });
      logger.info('Ping enviado com sucesso.');
    } catch (error) {
      logger.error(`Ping falhou: ${error.message}`);
    }
  }, env.AUTO_PING_INTERVAL);
}

module.exports = { startAutoPing };
