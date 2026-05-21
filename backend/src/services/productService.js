const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');

async function getExistingProductIds() {
  if (!supabase) return new Set();
  
  try {
    const { data, error } = await supabase
      .from('productsv1')
      .select('id');
      
    if (error) throw error;
    
    return new Set(data.map(p => p.id));
  } catch (error) {
    logger.error(`Error fetching existing product IDs globally: ${error.message}`);
    return new Set();
  }
}

async function upsertProduct(productData) {
  if (!supabase) {
    logger.debug(`[MOCK] Upserting product ${productData.id} - ${productData.title}`);
    return;
  }
  
  try {
    productData.last_seen = new Date().toISOString();

    const { error } = await supabase
      .from('productsv1')
      .upsert(productData, { onConflict: 'id' });
      
    if (error) throw error;
  } catch (error) {
    logger.error(`Error upserting product ${productData.id}: ${error.message}`);
  }
}

async function markMissingProductsAsDeleted(currentProductIds) {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('productsv1')
      .select('id');
      
    if (error) throw error;
    
    const dbIds = new Set(data.map(p => p.id));
    const idsToDelete = [...dbIds].filter(id => !currentProductIds.has(id));
    
    if (idsToDelete.length > 0) {
      logger.info(`Deleting ${idsToDelete.length} removed products globally`);
      const chunkSize = 100;
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        await supabase
          .from('productsv1')
          .delete()
          .in('id', chunk);
      }
    }
  } catch (error) {
    logger.error(`Error deleting missing products globally: ${error.message}`);
  }
}
async function getProductImages(id) {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('productsv1')
      .select('images')
      .eq('id', String(id))
      .maybeSingle();
      
    if (error) throw error;
    
    return data ? data.images : null;
  } catch (error) {
    logger.error(`Error fetching images for product ${id}: ${error.message}`);
    return null;
  }
}

module.exports = {
  getExistingProductIds,
  upsertProduct,
  markMissingProductsAsDeleted,
  getProductImages
};
