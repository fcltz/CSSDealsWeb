const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');

const PRODUCT_FIELDS = 'id::text, code, title, description, category_id::text, category_name, source_link, product_url, cssbuy_order_id::text, cssbuy_order_no, creator_id::text, images, skus, created_at, updated_at, last_seen';

async function getUserPlan(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'free';
  }
  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return 'free';

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    return profile?.plan || 'free';
  } catch (err) {
    return 'free';
  }
}

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'recent', minPrice, maxPrice, size } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase.from('products').select(PRODUCT_FIELDS, { count: 'exact' });

    const userPlan = await getUserPlan(req);
    if (userPlan === 'free' && false) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      query = query.lte('created_at', thirtyMinutesAgo);
    }

    if (category && category !== 'all' && category !== '[]') {
      let categoryIds = [];
      if (Array.isArray(category)) {
        categoryIds = category;
      } else if (typeof category === 'string') {
        categoryIds = category.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }
    }

    if (search) {
      query = query.textSearch('title', search, { type: 'websearch' });
    }

    if (minPrice !== undefined && minPrice !== '') {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        query = query.gte('skus->0->price', minVal);
      }
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        query = query.lte('skus->0->price', maxVal);
      }
    }

    if (size) {
      const sizeVariants = [
        size,
        size.toLowerCase(),
        size.toUpperCase(),
        size.charAt(0).toUpperCase() + size.slice(1).toLowerCase()
      ];
      const uniqueVariants = Array.from(new Set(sizeVariants));
      const orConditions = uniqueVariants.map(v => `skus.cs.[{"size":"${v}"}]`);
      query = query.or(orConditions.join(','));
    }

    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    logger.error(`Error in getProducts: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('products').select(PRODUCT_FIELDS).eq('id', id).limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = data[0];

    const userPlan = await getUserPlan(req);
    if (userPlan === 'free' && false) {
      const productTime = new Date(product.created_at).getTime();
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (productTime > thirtyMinutesAgo) {
        return res.status(403).json({ 
          success: false, 
          message: 'Este produto foi cadastrado há menos de 30 minutos. Assine um plano pago para ter acesso imediato!' 
        });
      }
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`Error in getProductById: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categoriesList = [
      { id: '32', name: 'Hoodie' },
      { id: '40', name: 'Socks' },
      { id: '45', name: 'Suitcase' },
      { id: '11', name: 'Shoes' },
      { id: '33', name: 'Down Jacket' },
      { id: '12', name: 'Coat' },
      { id: '14', name: 'T-shirts' },
      { id: '15', name: 'Pants' },
      { id: '26', name: 'Hat & Bags' },
      { id: '34', name: 'Suit' },
      { id: '35', name: 'Long Sleeve' },
      { id: '39', name: 'Accessories' },
      { id: '27', name: 'Belt & Glasses' },
      { id: '30', name: 'Gloves & Scarf' },
      { id: '31', name: 'Underwear & Sleepwear' },
      { id: '44', name: 'Perfume' },
      { id: '37', name: 'Toy' },
      { id: '16', name: 'Accessories (Misc)' },
      { id: '36', name: 'Sports Goods' },
      { id: '38', name: 'Phone Case' },
      { id: '20', name: 'Watches' },
      { id: '21', name: 'Cell Phone' },
      { id: '22', name: 'Earphone' },
      { id: '23', name: 'Computer Accessories' },
      { id: '24', name: 'Audio & Video' }
    ];

    // Sort alphabetically for better UX
    categoriesList.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ success: true, data: categoriesList });
  } catch (error) {
    logger.error(`Error in getCategories: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ success: true, data: { totalProducts: count } });
  } catch (error) {
    logger.error(`Error in getStats: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getStats
};
