const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

// Rotas de Autenticação
router.post('/auth/register', authController.signUp);
router.post('/auth/login', authController.signIn);

// Rotas de Perfil (Protegidas)
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile/discord', requireAuth, authController.updateDiscordId);
router.put('/profile/plan', requireAuth, authController.updatePlan);
router.put('/profile/filters', requireAuth, authController.updateAlertFilters);

module.exports = router;
