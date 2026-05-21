const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendNewProductNotification(product, retryCount = 0) {
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_CHANNEL_ID) {
    return;
  }
  
  if (retryCount > 5) {
    logger.error(`Discord notification failed for product ${product.id} after 5 retries.`);
    return;
  }
  
  try {
    const title = product.title || 'Novo Produto';
    const priceVal = product.skus?.[0]?.price;
    const priceStr = priceVal !== undefined ? `¥ ${priceVal}` : 'N/A';
    const cssdealsLink = product.product_url || '#';
    const sourceLink = product.source_link || '#';
    const images = Array.isArray(product.images) ? product.images : [];
    
    // Horário formatado em GMT-3 (America/Sao_Paulo)
    const timeStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    // Construindo o embed principal
    const embedPrincipal = {
      title: title,
      url: cssdealsLink,
      color: 5814783, // Um azul bem bonito
      fields: [
        { name: 'Preço', value: priceStr, inline: true },
        { name: 'CSSDeals Link', value: `[Clique aqui](${cssdealsLink})`, inline: true },
        { name: 'Source Link', value: `[Clique aqui](${sourceLink})`, inline: true },
        { name: 'Horário do Cadastro (GMT-3)', value: timeStr, inline: false }
      ]
    };
    
    if (images.length > 0) {
      embedPrincipal.image = { url: images[0] };
    }
    
    const embeds = [embedPrincipal];
    
    // Adiciona as outras imagens (até mais 3, totalizando 4 no grid do Discord)
    for (let i = 1; i < Math.min(images.length, 4); i++) {
      embeds.push({
        url: cssdealsLink,
        image: { url: images[i] }
      });
    }
    
    await axios.post(
      `https://discord.com/api/v10/channels/${env.DISCORD_CHANNEL_ID}/messages`,
      { embeds },
      {
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Discord channel notification sent successfully for product ${product.id}`);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = (error.response.data.retry_after || 1) * 1000;
      logger.warn(`Discord rate limit hit. Retrying in ${retryAfter}ms (attempt ${retryCount + 1})...`);
      await sleep(retryAfter);
      return sendNewProductNotification(product, retryCount + 1);
    }
    
    logger.error(`Error sending Discord channel message: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

module.exports = {
  sendNewProductNotification
};
