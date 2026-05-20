const cssDealsApi = require('../integrations/cssDealsApi');
const productService = require('../services/productService');
const productQueue = require('../queue/productQueue');
const syncProductJob = require('./syncProductJob');
const logger = require('../utils/logger');

async function syncCategoryJob(categoryId) {
  logger.info(`Starting sync for category ${categoryId}`);
  
  try {
    const pageSize = 99;
    
    const firstPageRes = await cssDealsApi.getProductsByCategory(categoryId, 1, pageSize);
    if (firstPageRes.code !== 0 || !firstPageRes.data) {
      logger.warn(`Could not fetch first page for category ${categoryId}`);
      return;
    }
    
    const total = parseInt(firstPageRes.data.total || '0', 10);
    const totalPages = Math.ceil(total / pageSize);
    
    logger.info(`Category ${categoryId}: Total items = ${total}, Total pages = ${totalPages}`);

    const existingIds = await productService.getExistingProductIds(String(categoryId));
    const currentIds = new Set();
    
    processPage(firstPageRes.data.records, existingIds, currentIds);

    for (let page = 2; page <= totalPages; page++) {
      try {
        const pageRes = await cssDealsApi.getProductsByCategory(categoryId, page, pageSize);
        if (pageRes.code === 0 && pageRes.data && pageRes.data.records) {
          processPage(pageRes.data.records, existingIds, currentIds);
        }
      } catch (err) {
        logger.error(`Failed to sync category ${categoryId} page ${page}: ${err.message}`);
      }
    }

    await productService.markMissingProductsAsDeleted(String(categoryId), currentIds);

  } catch (error) {
    logger.error(`Fatal error syncing category ${categoryId}: ${error.message}`);
  }
}

function processPage(records, existingIds, currentIds) {
  if (!records || !Array.isArray(records)) return;

  for (const record of records) {
    const productId = String(record.id);
    currentIds.add(productId);
    productQueue.add(() => syncProductJob(record));
  }
}

module.exports = syncCategoryJob;
