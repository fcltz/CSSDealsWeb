const supabase = require('../database/supabaseClient');
const imageService = require('../services/imageService');
const logger = require('../utils/logger');
const pLimit = require('p-limit').default;

async function processarProduto(produto) {
  try {
    const imagens = produto.images;
    if (!imagens || !Array.isArray(imagens) || imagens.length === 0) {
      return;
    }

    // Baixa, comprime e faz o upload
    const novasImagens = await imageService.processProductImages(produto.id, imagens);

    // Se as URLs mudaram (ou seja, se novos uploads foram feitos), atualiza o banco de dados
    const urlsChanged = JSON.stringify(imagens) !== JSON.stringify(novasImagens);
    if (urlsChanged) {
      const { error } = await supabase
        .from('products')
        .update({ images: novasImagens })
        .eq('id', produto.id);

      if (error) {
        logger.error(`Error updating product ${produto.id} in DB: ${error.message}`);
      } else {
        logger.info(`Product ${produto.id} images migrated successfully.`);
      }
    } else {
      logger.info(`Product ${produto.id} images already migrated.`);
    }
  } catch (error) {
    logger.error(`Error processing product ${produto?.id}: ${error.message}`);
  }
}

async function iniciar() {
  if (!supabase) {
    logger.error('Supabase client not initialized, migration cannot start.');
    return;
  }

  logger.info('Starting image migration for existing products...');

  let pagina = 0;
  const limite = 50;
  const concurrency = 5; // Limita a concorrência a 5 produtos por vez

  const limit = pLimit(concurrency);

  while (true) {
    const inicio = pagina * limite;
    const fim = inicio + limite - 1;

    logger.info(`Fetching batch ${pagina + 1} (range ${inicio} to ${fim})...`);

    const { data: produtos, error } = await supabase
      .from('products')
      .select('id::text, images')
      .range(inicio, fim);

    if (error) {
      logger.error(`Error fetching products batch: ${error.message}`);
      break;
    }

    if (!produtos || produtos.length === 0) {
      logger.info('All products processed. Migration finished!');
      break;
    }

    logger.info(`Processing ${produtos.length} products in batch ${pagina + 1}...`);

    const tasks = produtos.map(produto => limit(() => processarProduto(produto)));
    await Promise.all(tasks);

    pagina++;
  }
}

if (require.main === module) {
  iniciar();
}

module.exports = {
  startImageMigration: iniciar
};
