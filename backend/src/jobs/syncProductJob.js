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
      // 1. Notificação global no canal do servidor
      discordService.sendNewProductNotification(productData).catch(err => {
        logger.error(`Error sending global Discord notification: ${err.message}`);
      });

      // 2. Notificações personalizadas por DM para usuários com planos ativos
      (async () => {
        try {
          const supabaseClient = require('../database/supabaseClient');
          if (!supabaseClient) return;

          // Busca perfis ativos que têm discord_id e plano diferente de 'free'
          const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('discord_id, alert_categories, alert_sizes')
            .neq('plan', 'free')
            .not('discord_id', 'is', null);

          if (error) {
            logger.error(`Error fetching profiles for Discord DMs: ${error.message}`);
            return;
          }

          if (profiles && profiles.length > 0) {
            // Extrair todos os tamanhos disponíveis do produto (em minúsculo)
            const productSizes = new Set();
            if (Array.isArray(productData.skus)) {
              productData.skus.forEach(sku => {
                if (sku.size) {
                  productSizes.add(String(sku.size).trim().toLowerCase());
                } else if (sku.skuNames) {
                  const matchSize = sku.skuNames.match(/Size:([^;]+)/i);
                  if (matchSize) {
                    productSizes.add(matchSize[1].trim().toLowerCase());
                  }
                }
              });
            }

            const productCategoryId = String(productData.category_id || '').trim();

            for (const profile of profiles) {
              const discordId = profile.discord_id ? String(profile.discord_id).trim() : '';
              if (!discordId) continue;

              // Filtro por Categoria:
              // Se alert_categories estiver configurado (não vazio), o produto precisa coincidir com pelo menos uma selecionada
              const alertCategories = Array.isArray(profile.alert_categories) ? profile.alert_categories : [];
              if (alertCategories.length > 0) {
                const matchCategory = alertCategories.some(catId => String(catId).trim() === productCategoryId);
                if (!matchCategory) {
                  logger.debug(`User ${discordId} filtered out by category preference (Product: ${productCategoryId}).`);
                  continue;
                }
              }

              // Filtro por Tamanho específico para a categoria do produto:
              const alertSizesObj = (profile.alert_sizes && typeof profile.alert_sizes === 'object' && !Array.isArray(profile.alert_sizes)) 
                ? profile.alert_sizes 
                : {};
              
              // Verifica se há tamanhos configurados especificamente para a categoria do produto
              const categorySizes = Array.isArray(alertSizesObj[productCategoryId]) ? alertSizesObj[productCategoryId] : [];
              
              if (categorySizes.length > 0) {
                const normalizedCategorySizes = categorySizes.map(s => String(s).trim().toLowerCase());
                let matchSize = false;
                for (const size of normalizedCategorySizes) {
                  if (productSizes.has(size)) {
                    matchSize = true;
                    break;
                  }
                }
                if (!matchSize) {
                  logger.debug(`User ${discordId} filtered out by size preference for category ${productCategoryId}. Product sizes: [${Array.from(productSizes).join(', ')}].`);
                  continue;
                }
              }

              // Passou nos filtros! Envia notificação
              discordService.sendDirectProductNotification(discordId, productData).catch(err => {
                logger.error(`Error sending DM to ${discordId}: ${err.message}`);
              });
            }
          }
        } catch (err) {
          logger.error(`Error in personal Discord DM loop: ${err.message}`);
        }
      })();
    }
  } catch (error) {
    logger.error(`Error in syncProductJob for ID ${productSummary?.id}: ${error.message}`);
  }
}

module.exports = syncProductJob;
