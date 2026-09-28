const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Executa requisições à API do CSSDeals.
 */
async function makeRequest(url, config = {}, defaultMaxRetries = 15) {
  const attempts = 3;

  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const requestConfig = {
      ...config,
      baseURL: 'https://cssdeals.com/api',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(config.headers || {})
      }
    };

    try {
      const response = await axios(url, requestConfig);
      
      // Valida se a resposta é um objeto JSON válido da API CSSDeals
      if (response.data && (response.data.code === 0 || response.data.code === '0' || response.data.code === 404)) {
        return response.data;
      }
      
      throw new Error(`Invalid response structure: ${typeof response.data === 'string' ? response.data.slice(0, 80) : JSON.stringify(response.data).slice(0, 80)}`);
    } catch (error) {
      lastError = error;

      // Se for 404 legítimo do endpoint de detalhes do produto, encerra
      if (error.response && error.response.status === 404 && url.startsWith('/product/')) {
        return { code: 404, msg: 'Product does not exist (HTTP 404)' };
      }

      // Se der 429, faz uma pausa até voltar (5 minutos) e tenta de novo
      if (error.response && error.response.status === 429) {
        logger.warn(`Rate limit (429) hit. Pausing for 15 minutes before retrying...`);
        await new Promise(resolve => setTimeout(resolve, 900000));
        attempt--;
        continue;
      }

      if (attempt < attempts) {
        logger.debug(`Attempt ${attempt}/${attempts} failed for ${url} (${error.message}). Retrying...`);
      }
    }
  }

  throw lastError || new Error(`Failed to request ${url} after ${attempts} attempts`);
}

async function getAllProducts(page = 1, pageSize = 99) {
  try {
    const data = await makeRequest('/product', {
      params: { fields: 1, page, pageSize }
    });
    return data;
  } catch (error) {
    logger.error(`Error fetching all products page ${page}: ${error.message}`);
    throw error;
  }
}

async function getProductDetails(productId) {
  try {
    const data = await makeRequest(`/product/${productId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching product details for ${productId}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getProductDetails
};
