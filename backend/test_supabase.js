const productService = require('./src/services/productService');
const logger = require('./src/utils/logger');
require('dotenv').config();

async function verify() {
  try {
    console.log('Testing getProduct for existing product with duplicates (190746335846395904)...');
    const pExisting = await productService.getProduct('190746335846395904');
    console.log('Result:', pExisting);
    if (pExisting && typeof pExisting.id === 'string' && pExisting.id === '190746335846395904') {
      console.log('SUCCESS: Product fetched correctly with string ID!');
    } else {
      console.error('FAIL: Product fetched incorrectly or not found.');
    }

    console.log('\nTesting getProduct for non-existing product (999999999999)...');
    const pNonExisting = await productService.getProduct('999999999999');
    console.log('Result:', pNonExisting);
    if (pNonExisting === null) {
      console.log('SUCCESS: Returned null for non-existing product without errors!');
    } else {
      console.error('FAIL: Expected null, got:', pNonExisting);
    }
  } catch (err) {
    console.error('Error during verification:', err);
  }
}

verify();
