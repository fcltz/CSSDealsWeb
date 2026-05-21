const cssDealsApi = require('../integrations/cssDealsApi');
const productService = require('../services/productService');
const imageService = require('../services/imageService');
const logger = require('../utils/logger');

async function syncProductJob(productSummary) {
  try {
    const productId = productSummary.id;
    const detailResponse = await cssDealsApi.getProductDetails(productId);
    
    if (detailResponse.code !== 0 || !detailResponse.data) {
      logger.warn(`Failed to fetch details for product ${productId}`);
      return;
    }

    const data = detailResponse.data;
    const imagesUrls = (data.images || []).map(img => img.url);

    // Verifica se o produto já existe no banco de dados e se ele já possui imagens salvas
    const existingImages = await productService.getProductImages(productId);
    const hasImages = existingImages && Array.isArray(existingImages) && existingImages.length > 0;

    let processedImages;
    if (!hasImages) {
      logger.info(`Product ${productId} is new or has no images in DB. Processing and uploading images to Supabase.`);
      processedImages = await imageService.processProductImages(data.id, imagesUrls);
    } else {
      logger.debug(`Product ${productId} already exists with images. Preserving existing images.`);
      processedImages = existingImages;
    }

    const productData = {
      id: String(data.id),
      code: data.code,
      title: data.title,
      description: data.description,
      category_id: String(data.categoryId),
      category_name: data.category?.name || '',
      source_link: data.sourceLink,
      product_url: data.url,
      images: processedImages,
      skus: data.skus || [],
      cssbuy_order_id: data.cssbuyOrderId,
      cssbuy_order_no: data.cssbuyOrderNo,
      creator_id: data.creatorId
    };

    await productService.upsertProduct(productData);
    logger.debug(`Product ${productId} synced successfully with optimized images.`);
  } catch (error) {
    logger.error(`Error in syncProductJob for ID ${productSummary?.id}: ${error.message}`);
  }
}

module.exports = syncProductJob;
