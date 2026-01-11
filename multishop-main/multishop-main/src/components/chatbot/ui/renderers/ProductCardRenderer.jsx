/**
 * Product Card Renderer for Chatbot
 * 
 * Architecture: UI Layer
 * - Thin wrapper that normalizes data and delegates to ChatbotProductList
 * 
 * @see AI-CODING-RULES.jsx - Section 2: UI Layer
 */

import React, { memo } from 'react';
import { ChatbotProductList } from './ChatbotProductCard';

/**
 * Normalize product data to consistent format
 * @param {Object} p - Raw product
 * @returns {Object} Normalized product
 */
function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id || String(Math.random()),
    name: p.name || 'Sản phẩm',
    image_url: p.image_url || p.image || '',
    price: p.price || 0,
    sale_price: p.sale_price || p.salePrice || null,
    unit: p.unit || 'sản phẩm',
    rating_average: p.rating_average || p.rating || 5,
    total_sold: p.total_sold || 0,
    stock_quantity: p.stock_quantity ?? (p.inStock === false ? 0 : 100),
    featured: p.featured || false,
    category: p.category || '',
    description: p.description || p.short_description || '',
    gallery: p.gallery || []
  };
}

/**
 * ProductCardRenderer - Wrapper component
 */
function ProductCardRenderer({ data }) {
  const normalizedData = {
    ...data,
    products: (data?.products || []).map(normalizeProduct).filter(Boolean)
  };

  return <ChatbotProductList data={normalizedData} />;
}

export default memo(ProductCardRenderer);