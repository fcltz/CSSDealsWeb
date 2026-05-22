const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const logger = require('../utils/logger');

const cssDealsApi = axios.create({
  baseURL: 'https://cssdeals.com/api',
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9'
  }
});

axiosRetry(cssDealsApi, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`Retrying request to ${requestConfig.url} (Attempt ${retryCount}): ${error.message}`);
  }
});

async function getAllProducts(page = 1, pageSize = 99) {
  try {
    const response = await cssDealsApi.get('/product', {
      params: { fields: 1, page, pageSize }
    });
    return response.data;
  } catch (error) {
    logger.error(`Error fetching all products page ${page}: ${error.message}`);
    throw error;
  }
}

async function getProductDetails(productId) {
  try {
    const response = await cssDealsApi.get(`/product/${productId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching product details for ${productId}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getProductDetails
};
