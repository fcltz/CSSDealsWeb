const supabase = require('../database/supabaseClient');
const sharp = require('sharp');
const axios = require('axios');
const logger = require('../utils/logger');

const BUCKET = 'produtos';

// Garantir que o bucket público existe no Supabase
async function ensureBucketExists() {
  if (!supabase) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const bucketExists = buckets.find(b => b.id === BUCKET);
    if (!bucketExists) {
      logger.info(`Bucket "${BUCKET}" not found. Creating it...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg'],
      });
      if (createError) throw createError;
      logger.info(`Bucket "${BUCKET}" created successfully.`);
    }
  } catch (error) {
    logger.error(`Error ensuring storage bucket exists: ${error.message}`);
  }
}

// Inicializa a verificação do bucket
ensureBucketExists();

async function baixarImagem(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });
    return Buffer.from(response.data);
  } catch (error) {
    logger.error(`Error downloading image ${url}: ${error.message}`);
    return null;
  }
}

async function comprimir(buffer) {
  try {
    return await sharp(buffer)
      .rotate()
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    logger.error(`Error compressing image with sharp: ${error.message}`);
    return buffer;
  }
}

async function uploadImagem(produtoId, index, buffer) {
  if (!supabase) {
    logger.warn('Supabase client not initialized, skipping image upload');
    return null;
  }
  
  const path = `${produtoId}/${index}.webp`;
  
  try {
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: 'image/webp',
        upsert: true
      });
      
    if (uploadError) {
      logger.error(`Error uploading image to storage (${path}): ${uploadError.message}`);
      return null;
    }
    
    const { data } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (error) {
    logger.error(`Unexpected error uploading image (${path}): ${error.message}`);
    return null;
  }
}

async function processProductImages(produtoId, images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  // Verifica se já migrou analisando a primeira imagem
  const firstImage = images[0];
  const supabaseUrl = supabase ? supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl.split('/storage/v1')[0] : '';
  
  if (supabaseUrl && firstImage && firstImage.includes(supabaseUrl)) {
    logger.debug(`Images for product ${produtoId} already processed (Supabase URL detected)`);
    return images;
  }
  
  logger.info(`Processing ${images.length} images for product ${produtoId}`);
  const newUrls = [];
  
  for (let i = 0; i < images.length; i++) {
    const originalUrl = images[i];
    
    // Pula se já for uma imagem do Supabase
    if (supabaseUrl && originalUrl.includes(supabaseUrl)) {
      newUrls.push(originalUrl);
      continue;
    }
    
    logger.debug(`Downloading image ${i + 1}/${images.length} for product ${produtoId}`);
    const originalBuffer = await baixarImagem(originalUrl);
    
    if (!originalBuffer) {
      newUrls.push(originalUrl);
      continue;
    }
    
    const compressedBuffer = await comprimir(originalBuffer);
    const uploadedUrl = await uploadImagem(produtoId, i, compressedBuffer);
    
    if (uploadedUrl) {
      newUrls.push(uploadedUrl);
      logger.debug(`Image ${i + 1} processed and uploaded successfully`);
    } else {
      newUrls.push(originalUrl);
    }
  }
  
  return newUrls;
}

module.exports = {
  baixarImagem,
  comprimir,
  uploadImagem,
  processProductImages
};
