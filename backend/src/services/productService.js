const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { getGMT3ISOString } = require('../utils/date');

async function getExistingProductIds() {
  if (!supabase) return new Set();

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id::text');

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
    const now = getGMT3ISOString();
    productData.last_seen = now;

    const existing = await getProduct(productData.id);

    if (existing) {
      // Set updated_at on updates
      productData.updated_at = now;
      // If created_at doesn't exist on the database row, backfill it
      if (!existing.created_at) {
        productData.created_at = now;
      } else {
        delete productData.created_at;
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', String(productData.id));

      if (error) throw error;
    } else {
      // New product: set both created_at and updated_at
      productData.created_at = now;
      productData.updated_at = now;

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;
    }
  } catch (error) {
    logger.error(`Error upserting product ${productData.id}: ${error.message}`);
  }
}

async function markMissingProductsAsDeleted(currentProductIds) {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id::text');

    if (error) throw error;

    const dbIds = new Set(data.map(p => p.id));
    const idsToDelete = [...dbIds].filter(id => !currentProductIds.has(id));

    if (idsToDelete.length > 0) {
      logger.info(`Deleting ${idsToDelete.length} removed products globally`);
      const chunkSize = 100;
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        await supabase
          .from('products')
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
      .from('products')
      .select('images')
      .eq('id', String(id))
      .limit(1);

    if (error) throw error;

    return data && data.length > 0 ? data[0].images : null;
  } catch (error) {
    logger.error(`Error fetching images for product ${id}: ${error.message}`);
    return null;
  }
}

async function deleteProduct(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', String(id));

    if (error) throw error;
    logger.info(`Product ${id} deleted successfully from database.`);
  } catch (error) {
    logger.error(`Error deleting product ${id}: ${error.message}`);
  }
}

async function getProduct(id) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id::text, created_at')
      .eq('id', String(id))
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    logger.error(`Error fetching product ${id}: ${error.message}`);
    return null;
  }
}

module.exports = {
  getExistingProductIds,
  upsertProduct,
  markMissingProductsAsDeleted,
  getProductImages,
  deleteProduct,
  getProduct
};

