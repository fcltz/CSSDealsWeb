const discordService = require('../services/discordService');
const logger = require('../utils/logger');

// Produto mockado para teste
const mockProduct = {
  id: 'test-123',
  title: 'Tênis de Corrida Ultra Confortável - Teste de Alerta',
  product_url: 'https://cssbuy.com/item-test-123.html',
  source_link: 'https://weidian.com/item.html?itemID=123',
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
  ],
  skus: [
    { price: 299 }
  ]
};

async function runTest() {
  // Substitua pelo seu ID de usuário do Discord para fazer o teste manual se necessário
  const testDiscordUserId = process.argv[2];

  if (!testDiscordUserId) {
    logger.warn('Uso: node src/scripts/testDiscordDm.js <SEU_DISCORD_USER_ID>');
    logger.warn('Pulando teste real pois nenhum ID de usuário foi fornecido.');
    return;
  }

  logger.info(`Iniciando teste de envio de DM para o ID: ${testDiscordUserId}...`);
  try {
    await discordService.sendDirectProductNotification(testDiscordUserId, mockProduct);
    logger.info('Fluxo do teste concluído. Verifique o log acima para possíveis erros.');
  } catch (error) {
    logger.error('Erro na execução do teste:', error.message);
  }
}

runTest();
