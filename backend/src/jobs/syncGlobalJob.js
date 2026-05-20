const cssDealsApi = require('../integrations/cssDealsApi');
const productService = require('../services/productService');
const productQueue = require('../queue/productQueue');
const syncProductJob = require('./syncProductJob');
const logger = require('../utils/logger');

async function syncGlobalJob() {
  logger.info(`Starting global sync for all products`);
  
  try {
    const pageSize = 99;
    
    const firstPageRes = await cssDealsApi.getAllProducts(1, pageSize);
    if (firstPageRes.code !== 0 || !firstPageRes.data) {
      logger.warn(`Could not fetch first page globally`);
      return;
    }
    
    const total = parseInt(firstPageRes.data.total || '0', 10);
    const totalPages = Math.ceil(total / pageSize);
    
    logger.info(`Global Sync: Total items = ${total}, Total pages = ${totalPages}`);

    const existingIds = await productService.getExistingProductIds();
    const currentIds = new Set();
    
    processPage(firstPageRes.data.records, currentIds);

    for (let page = 2; page <= totalPages; page++) {
      try {
        const pageRes = await cssDealsApi.getAllProducts(page, pageSize);
        if (pageRes.code === 0 && pageRes.data && pageRes.data.records) {
          processPage(pageRes.data.records, currentIds);
        }
      } catch (err) {
        logger.error(`Failed to sync globally on page ${page}: ${err.message}`);
      }
    }

    await productService.markMissingProductsAsDeleted(currentIds);

  } catch (error) {
    logger.error(`Fatal error syncing globally: ${error.message}`);
  }
}

function processPage(records, currentIds) {
  if (!records || !Array.isArray(records)) return;

  for (const record of records) {
    const productId = String(record.id);
    currentIds.add(productId);
    productQueue.add(() => syncProductJob(record));
  }
}

module.exports = syncGlobalJob;
