const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const logger = require('./utils/logger');
const { startAutoPing } = require('./utils/autoPing');
const { startCrawler } = require('./crawler/index');
const { startImageMigration } = require('./scripts/migrateImages');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const productQueue = require('./queue/productQueue');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', authRoutes);

// Health Check & Crawler Status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/crawler/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    queuePending: productQueue.jobs.length,
    isProcessing: productQueue.isProcessing
  });
});

// Inicialização
app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  
  // Inicia serviços background
  startAutoPing();
  startCrawler();
  
  // Inicia migração de imagens existentes em background (Desativado conforme solicitação de rodar apenas para produtos novos)
  // startImageMigration().catch(err => {
  //   logger.error(`Error in background image migration: ${err.message}`);
  // });
});
