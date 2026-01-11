/**
 * Product Helpers - Clone, Diff Detection, Version Utils
 * Domain Logic - Pure functions
 */

/**
 * Clone product với metadata đầy đủ
 * @param {Object} original - Product gốc
 * @returns {Object} Cloned product data
 */
export const cloneProduct = (original) => {
  const cloneNumber = (original.clone_count || 0) + 1;
  
  return {
    // Copy all fields
    ...original,
    
    // Clear identity fields
    id: undefined,
    created_date: undefined,
    updated_date: undefined,
    
    // Modify for clone
    name: `[Copy] ${original.name}`,
    sku: original.sku ? `${original.sku}-C${cloneNumber}` : undefined,
    slug: original.slug ? `${original.slug}-copy-${Date.now()}` : undefined,
    
    // Clone metadata
    cloned_from_id: original.id,
    
    // Reset stats
    total_sold: 0,
    rating_count: 0,
    total_listed_by_shops: 0,
    
    // Keep quality indicators
    rating_average: original.rating_average || 5,
    
    // Reset version
    current_version: 1,
    
    // Clear deletion flags
    is_deleted: false,
    deleted_at: null,
    deleted_by: null
  };
};

/**
 * Detect changed fields giữa 2 versions
 * @param {Object} oldData - Data cũ
 * @param {Object} newData - Data mới
 * @returns {string[]} Array of changed field names
 */
export const detectChangedFields = (oldData, newData) => {
  const changedFields = [];
  const fieldsToCheck = [
    'name', 'description', 'short_description', 'price', 'sale_price',
    'stock_quantity', 'status', 'category', 'unit', 'sku',
    'image_url', 'gallery', 'video_url', 'featured', 'commission_rate'
  ];
  
  fieldsToCheck.forEach(field => {
    const oldVal = oldData?.[field];
    const newVal = newData?.[field];
    
    // Array comparison
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields.push(field);
      }
    } 
    // Primitive comparison
    else if (oldVal !== newVal) {
      changedFields.push(field);
    }
  });
  
  return changedFields;
};

/**
 * Generate change summary từ changed fields
 * @param {string[]} changedFields - Danh sách field thay đổi
 * @returns {string} Human-readable summary
 */
export const generateChangeSummary = (changedFields) => {
  if (changedFields.length === 0) return 'Không có thay đổi';
  
  const fieldLabels = {
    name: 'Tên',
    description: 'Mô tả',
    short_description: 'Mô tả ngắn',
    price: 'Giá',
    sale_price: 'Giá khuyến mãi',
    stock_quantity: 'Tồn kho',
    status: 'Trạng thái',
    category: 'Danh mục',
    unit: 'Đơn vị',
    sku: 'SKU',
    image_url: 'Ảnh chính',
    gallery: 'Thư viện ảnh',
    video_url: 'Video',
    featured: 'Nổi bật',
    commission_rate: 'Hoa hồng'
  };
  
  const labels = changedFields
    .map(f => fieldLabels[f] || f)
    .join(', ');
  
  return `Cập nhật: ${labels}`;
};

/**
 * Validate product data trước khi save
 * @param {Object} data - Product data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateProductData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Tên sản phẩm không được trống');
  }
  
  if (!data.category) {
    errors.push('Danh mục không được trống');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('Giá phải lớn hơn 0');
  }
  
  if (!data.unit || data.unit.trim().length === 0) {
    errors.push('Đơn vị không được trống');
  }
  
  if (data.sku && data.sku.length > 50) {
    errors.push('SKU không được dài quá 50 ký tự');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format product cho display
 * @param {Object} product - Product entity
 * @returns {Object} Formatted product
 */
export const formatProductForDisplay = (product) => {
  return {
    ...product,
    displayPrice: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(product.price),
    displaySalePrice: product.sale_price
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.sale_price)
      : null,
    isOnSale: product.sale_price && product.sale_price < product.price,
    isLowStock: product.stock_quantity <= (product.low_stock_threshold || 10),
    isOutOfStock: product.stock_quantity === 0
  };
};