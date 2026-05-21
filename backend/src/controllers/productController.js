const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'recent', minPrice, maxPrice } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase.from('productsv2').select('*', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
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
    const { data, error } = await supabase.from('productsv2').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Product not found' });
      throw error;
    }

    res.json({ success: true, data });
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
    const { count, error } = await supabase.from('productsv2').select('*', { count: 'exact', head: true });
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
