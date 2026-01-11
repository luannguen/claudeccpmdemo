/**
 * Chatbot Product Service
 * 
 * Architecture: Data/Service Layer
 * - All API calls for product-related chatbot features
 * - Returns Result<T> pattern
 * - DTO mapping happens here
 * 
 * @see AI-CODING-RULES.jsx - Section 4: Data/Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== DTOs ==========

/**
 * @typedef {Object} ChatbotProductDTO
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} [sale_price]
 * @property {string} unit
 * @property {string} [image_url]
 * @property {string[]} [gallery]
 * @property {string} [description]
 * @property {string} [category]
 * @property {number} rating_average
 * @property {number} rating_count
 * @property {number} total_sold
 * @property {number} stock_quantity
 * @property {boolean} inStock
 * @property {boolean} featured
 * @property {string[]} [tags]
 */

/**
 * Map raw product entity to ChatbotProductDTO
 * @param {Object} raw - Raw product from API
 * @returns {ChatbotProductDTO}
 */
function mapToProductDTO(raw) {
  return {
    id: raw.id,
    name: raw.name || 'Sản phẩm',
    price: raw.price || 0,
    sale_price: raw.sale_price || null,
    unit: raw.unit || 'sản phẩm',
    image_url: raw.image_url || '',
    gallery: raw.gallery || [],
    description: raw.short_description || raw.description || '',
    category: raw.category || '',
    rating_average: raw.rating_average || 5,
    rating_count: raw.rating_count || 0,
    total_sold: raw.total_sold || 0,
    stock_quantity: raw.stock_quantity ?? 100,
    inStock: raw.status !== 'out_of_stock' && (raw.stock_quantity ?? 100) > 0,
    featured: raw.featured || false,
    tags: raw.tags || [],
    slug: raw.slug || ''
  };
}

// ========== API METHODS ==========

/**
 * Search products by keywords
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Result<ChatbotProductDTO[]>>}
 */
export async function searchProducts(query, limit = 5) {
  try {
    if (!query || query.trim().length < 1) {
      return failure('Query không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }

    const allProducts = await base44.entities.Product.filter({ status: 'active' });
    
    const keywords = query.toLowerCase().split(/\s+/);
    const scored = allProducts.map(p => {
      const text = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      const score = keywords.filter(kw => text.includes(kw)).length;
      return { product: p, score };
    });

    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => mapToProductDTO(item.product));

    return success(results);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get products by category
 * @param {string} category - Category slug
 * @param {number} limit - Max results
 * @returns {Promise<Result<ChatbotProductDTO[]>>}
 */
export async function getProductsByCategory(category, limit = 6) {
  try {
    if (!category) {
      return failure('Category không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }

    const products = await base44.entities.Product.filter({
      category,
      status: 'active'
    });

    const results = products.slice(0, limit).map(mapToProductDTO);
    return success(results);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get featured/popular products
 * @param {number} limit - Max results
 * @returns {Promise<Result<ChatbotProductDTO[]>>}
 */
export async function getFeaturedProducts(limit = 4) {
  try {
    const products = await base44.entities.Product.filter({
      status: 'active',
      featured: true
    });

    const sorted = products.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
    const results = sorted.slice(0, limit).map(mapToProductDTO);
    
    return success(results);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get product by ID
 * @param {string} productId 
 * @returns {Promise<Result<ChatbotProductDTO>>}
 */
export async function getProductById(productId) {
  try {
    if (!productId) {
      return failure('Product ID không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }

    const products = await base44.entities.Product.filter({ id: productId });
    
    if (products.length === 0) {
      return failure('Không tìm thấy sản phẩm', ErrorCodes.NOT_FOUND);
    }

    return success(mapToProductDTO(products[0]));
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== CATEGORY MAPPING ==========

const CATEGORY_KEYWORDS = {
  'rau': 'vegetables',
  'củ': 'vegetables',
  'quả': 'fruits',
  'trái cây': 'fruits',
  'gạo': 'rice',
  'combo': 'combo',
  'chế biến': 'processed'
};

/**
 * Detect category from query
 * @param {string} query 
 * @returns {string|null}
 */
export function detectCategory(query) {
  const lowerQuery = query.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      return category;
    }
  }
  return null;
}

/**
 * Check if query is asking for featured/popular products
 * @param {string} query 
 * @returns {boolean}
 */
export function isFeaturedQuery(query) {
  return /phổ biến|bán chạy|hot|popular|best seller|gợi ý|recommend/i.test(query);
}

// ========== EXPORT ==========

export const chatbotProductAPI = {
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getProductById,
  detectCategory,
  isFeaturedQuery,
  mapToProductDTO
};

export default chatbotProductAPI;