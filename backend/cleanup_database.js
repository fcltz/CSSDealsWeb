const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const PRODUCT_FIELDS = 'id::text, code, title, description, category_id::text, category_name, source_link, product_url, cssbuy_order_id::text, cssbuy_order_no, creator_id::text, images, skus, created_at, updated_at, last_seen';

async function main() {
  try {
    console.log('Starting database cleanup script...');
    
    let allProducts = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    console.log('Step 1: Fetching all products from database...');
    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .range(from, from + limit - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...data);
        console.log(`Fetched ${allProducts.length} rows...`);
        from += limit;
        if (data.length < limit) {
          hasMore = false;
        }
      }
    }

    console.log(`Total rows fetched: ${allProducts.length}`);

    console.log('Step 2: Processing duplicates and keeping the latest row for each unique ID...');
    const uniqueProductsMap = {};
    let duplicateCount = 0;

    for (const product of allProducts) {
      const id = product.id;
      if (!id) continue;

      const existing = uniqueProductsMap[id];
      if (existing) {
        duplicateCount++;
        // Compare last_seen to keep the latest one
        const existingTime = existing.last_seen ? new Date(existing.last_seen).getTime() : 0;
        const currentTime = product.last_seen ? new Date(product.last_seen).getTime() : 0;
        if (currentTime > existingTime) {
          uniqueProductsMap[id] = product;
        }
      } else {
        uniqueProductsMap[id] = product;
      }
    }

    const uniqueProducts = Object.values(uniqueProductsMap);
    console.log(`Unique products count: ${uniqueProducts.length}`);
    console.log(`Duplicate rows found: ${duplicateCount}`);

    // Step 3: Backup to file
    const backupPath = path.join(__dirname, 'backup_products.json');
    console.log(`Step 3: Creating JSON backup file at ${backupPath}...`);
    fs.writeFileSync(backupPath, JSON.stringify(uniqueProducts, null, 2), 'utf8');
    console.log('Backup written successfully!');

    // Step 4: Delete all rows in products
    console.log('Step 4: Deleting all existing rows in products table...');
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .neq('id', '0'); // Delete all

    if (delErr) throw delErr;
    console.log('All rows deleted successfully!');

    // Step 5: Re-insert unique products in batches
    console.log('Step 5: Re-inserting unique products in batches of 1000...');
    const batchSize = 1000;
    for (let i = 0; i < uniqueProducts.length; i += batchSize) {
      const batch = uniqueProducts.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)...`);
      
      const { error: insErr } = await supabase
        .from('products')
        .insert(batch);

      if (insErr) {
        console.error(`Error inserting batch starting at index ${i}:`, insErr);
        throw insErr;
      }
    }

    console.log('Cleanup finished successfully!');
    console.log(`Database is now clean with ${uniqueProducts.length} unique products.`);
  } catch (err) {
    console.error('CRITICAL ERROR DURING CLEANUP:', err);
  }
}

main();
