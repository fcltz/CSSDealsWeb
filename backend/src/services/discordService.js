const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

let dmChannelId = null;

async function getDmChannelId() {
  if (dmChannelId) return dmChannelId;
  
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_USER_ID) {
    return null;
  }
  
  try {
    const response = await axios.post(
      'https://discord.com/api/v10/users/@me/channels',
      { recipient_id: env.DISCORD_USER_ID },
      {
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    dmChannelId = response.data.id;
    return dmChannelId;
  } catch (error) {
    logger.error(`Error creating Discord DM channel: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    return null;
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendNewProductNotification(product, retryCount = 0) {
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_USER_ID) {
    return;
  }
  
  if (retryCount > 5) {
    logger.error(`Discord notification failed for product ${product.id} after 5 retries.`);
    return;
  }
  
  const channelId = await getDmChannelId();
  if (!channelId) {
    logger.warn('Could not send Discord notification: DM channel not created.');
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
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      { embeds },
      {
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Discord DM notification sent successfully for product ${product.id}`);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = (error.response.data.retry_after || 1) * 1000;
      logger.warn(`Discord rate limit hit. Retrying in ${retryAfter}ms (attempt ${retryCount + 1})...`);
      await sleep(retryAfter);
      return sendNewProductNotification(product, retryCount + 1);
    }
    
    logger.error(`Error sending Discord DM message: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

module.exports = {
  sendNewProductNotification
};
