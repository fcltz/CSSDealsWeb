const cssDealsApi = require('../integrations/cssDealsApi');
const productService = require('../services/productService');
const discordService = require('../services/discordService');
const logger = require('../utils/logger');

async function syncProductJob(productSummary) {
  try {
    const productId = productSummary.id;
    let detailResponse;
    try {
      detailResponse = await cssDealsApi.getProductDetails(productId);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        detailResponse = { code: 404, msg: 'Product does not exist (HTTP 404)' };
      } else {
        throw error;
      }
    }
    
    if (detailResponse && detailResponse.code === 404) {
      logger.info(`Product ${productId} details do not exist (code 404). Deleting from DB.`);
      await productService.deleteProduct(productId);
      return;
    }
    
    if (!detailResponse || detailResponse.code !== 0 || !detailResponse.data) {
      logger.warn(`Failed to fetch details for product ${productId}: ${detailResponse?.msg || 'Unknown error'}`);
      return;
    }

    const data = detailResponse.data;
    const imagesUrls = (data.images || []).map(img => img.url);

    const productData = {
      id: String(data.id),
      code: data.code,
      title: data.title,
      description: data.description,
      category_id: String(data.categoryId),
      category_name: data.category?.name || '',
      source_link: data.sourceLink,
      product_url: data.url,
      images: imagesUrls,
      skus: data.skus || [],
      cssbuy_order_id: data.cssbuyOrderId,
      cssbuy_order_no: data.cssbuyOrderNo,
      creator_id: data.creatorId
    };

    // Verifica se o produto já existe no banco de dados ANTES do upsert
    const existingProduct = await productService.getProduct(productId);
    const isNewProduct = !existingProduct;

    await productService.upsertProduct(productData);
    logger.debug(`Product ${productId} synced successfully.`);
    
    if (isNewProduct) {
      discordService.sendNewProductNotification(productData).catch(err => {
        logger.error(`Error sending Discord notification: ${err.message}`);
      });
    }
  } catch (error) {
    logger.error(`Error in syncProductJob for ID ${productSummary?.id}: ${error.message}`);
  }
}

module.exports = syncProductJob;
