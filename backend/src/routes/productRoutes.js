const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.get('/categories', productController.getCategories);
router.get('/stats', productController.getStats);

module.exports = router;
