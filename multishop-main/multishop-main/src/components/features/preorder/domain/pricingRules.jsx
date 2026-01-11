/**
 * Pre-Order Pricing Rules - Domain Logic
 * 
 * Pure business logic for lot pricing calculations
 * KHÔNG import service/repository
 */

/**
 * Calculate days until harvest
 */
export function getDaysUntilHarvest(harvestDate) {
  if (!harvestDate) return 0;
  return Math.ceil((new Date(harvestDate) - new Date()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate price increase percentage from initial
 */
export function getPriceIncreasePercent(initialPrice, currentPrice) {
  if (!initialPrice || !currentPrice) return 0;
  return ((currentPrice - initialPrice) / initialPrice * 100);
}

/**
 * Calculate discount percentage from max price
 */
export function getDiscountPercent(currentPrice, maxPrice) {
  if (!currentPrice || !maxPrice || currentPrice >= maxPrice) return 0;
  return Math.round(((maxPrice - currentPrice) / maxPrice) * 100);
}

/**
 * Calculate available percentage
 */
export function getAvailablePercent(availableQty, totalYield) {
  if (!availableQty || !totalYield) return 0;
  return (availableQty / totalYield) * 100;
}

/**
 * Calculate sold percentage
 */
export function getSoldPercent(soldQty, totalYield) {
  if (!soldQty || !totalYield) return 0;
  return (soldQty / totalYield) * 100;
}

/**
 * Calculate deposit amount for a quantity
 */
export function calculateDeposit(unitPrice, quantity, depositPercentage = 100) {
  const total = unitPrice * quantity;
  return Math.round(total * depositPercentage / 100);
}

/**
 * Calculate remaining payment after deposit
 */
export function calculateRemainingPayment(totalAmount, depositAmount) {
  return Math.max(0, totalAmount - depositAmount);
}

/**
 * Check if lot has low stock (urgency indicator)
 */
export function isLowStock(availableQty, totalYield, threshold = 20) {
  const availablePercent = getAvailablePercent(availableQty, totalYield);
  return availablePercent <= threshold;
}

/**
 * Check if lot is near harvest (urgency indicator)
 */
export function isNearHarvest(harvestDate, daysThreshold = 7) {
  const daysUntil = getDaysUntilHarvest(harvestDate);
  return daysUntil > 0 && daysUntil <= daysThreshold;
}

/**
 * Get urgency level for lot
 */
export function getUrgencyLevel(lot) {
  const lowStock = isLowStock(lot.available_quantity, lot.total_yield);
  const nearHarvest = isNearHarvest(lot.estimated_harvest_date);
  
  if (lowStock && nearHarvest) return 'critical';
  if (lowStock || nearHarvest) return 'high';
  return 'normal';
}

/**
 * Format price for display (Vietnamese)
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '-';
  return price.toLocaleString('vi-VN') + 'đ';
}

/**
 * Format weight with unit
 */
export function formatWeight(weight, unit = 'kg') {
  if (!weight && weight !== 0) return '-';
  return `${weight.toLocaleString('vi-VN')} ${unit}`;
}

/**
 * Get best gallery images
 */
export function getLotGallery(lot, product, preOrder) {
  const images = [];
  
  if (lot?.product_image) images.push(lot.product_image);
  if (lot?.product_gallery?.length) images.push(...lot.product_gallery);
  if (images.length === 0 && product?.image_url) images.push(product.image_url);
  if (images.length === 0 && product?.gallery?.length) images.push(...product.gallery);
  if (images.length === 0 && preOrder?.product_image) images.push(preOrder.product_image);
  
  return [...new Set(images)]; // Remove duplicates
}