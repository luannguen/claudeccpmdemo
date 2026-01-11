/**
 * Shared Utils - Central Exports
 */

export {
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhone,
  formatNumber,
  formatPercent,
  truncateText,
  generateSlug
} from './formatters';

export {
  debounce,
  useDebouncedValue,
  useDebouncedCallback,
  throttle,
  useThrottledCallback
} from './debounce';

/**
 * Filter items by search term
 * @param {Array} items
 * @param {string} search
 * @param {string|string[]} fields - Fields to search in
 * @returns {Array}
 */
export function filterBySearch(items, search, fields = ['name']) {
  if (!search?.trim()) return items;
  
  const term = search.toLowerCase();
  const searchFields = Array.isArray(fields) ? fields : [fields];

  return items.filter(item => 
    searchFields.some(field => 
      item[field]?.toLowerCase?.().includes(term)
    )
  );
}

/**
 * Sort items by field
 * @param {Array} items
 * @param {string} field
 * @param {'asc'|'desc'} order
 * @returns {Array}
 */
export function sortByField(items, field, order = 'desc') {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    const comparison = typeof aVal === 'string' 
      ? aVal.localeCompare(bVal)
      : aVal - bVal;
      
    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Group items by field
 * @param {Array} items
 * @param {string} field
 * @returns {Object}
 */
export function groupByField(items, field) {
  return items.reduce((groups, item) => {
    const key = item[field] || 'other';
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Paginate items
 * @param {Array} items
 * @param {number} page
 * @param {number} limit
 * @returns {{ items: Array, total: number, totalPages: number }}
 */
export function paginateItems(items, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  const paginatedItems = items.slice(start, start + limit);
  
  return {
    items: paginatedItems,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
    page,
    limit
  };
}