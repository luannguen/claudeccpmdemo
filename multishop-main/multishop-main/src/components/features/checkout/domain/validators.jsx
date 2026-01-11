/**
 * Checkout Validators - Pure validation functions
 * Domain Layer - No external dependencies except types
 * 
 * @module features/checkout/domain/validators
 */

/**
 * Validate customer info fields
 * @param {import('../types/CheckoutDTO').CustomerInfoDTO} customerInfo
 * @returns {Object} Validation errors object (empty if valid)
 */
export function validateCustomerInfo(customerInfo) {
  const errors = {};
  
  if (!customerInfo.name?.trim()) {
    errors.name = 'Vui lòng nhập họ tên';
  }
  
  if (!customerInfo.email?.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!customerInfo.phone?.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  if (!customerInfo.address?.trim()) {
    errors.address = 'Vui lòng nhập địa chỉ';
  }
  
  if (!customerInfo.district?.trim()) {
    errors.district = 'Vui lòng nhập quận/huyện';
  }
  
  if (!customerInfo.city?.trim()) {
    errors.city = 'Vui lòng nhập thành phố';
  }
  
  return errors;
}

/**
 * Validate cart items and total
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {number} total
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateCart(cartItems, total) {
  if (!cartItems || cartItems.length === 0) {
    return {
      valid: false,
      error: 'Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.'
    };
  }
  
  if (total <= 0) {
    return {
      valid: false,
      error: 'Tổng đơn hàng không hợp lệ!'
    };
  }
  
  // Validate each item
  for (const item of cartItems) {
    if (!item.id || !item.name) {
      return {
        valid: false,
        error: 'Sản phẩm trong giỏ hàng không hợp lệ!'
      };
    }
    
    if (item.quantity < 1) {
      return {
        valid: false,
        error: `Số lượng "${item.name}" không hợp lệ!`
      };
    }
    
    if (item.is_preorder && item.moq && item.quantity < item.moq) {
      return {
        valid: false,
        error: `"${item.name}" yêu cầu đặt tối thiểu ${item.moq} sản phẩm!`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Validate lot availability (async - requires repository)
 * @param {Object} item - Cart item
 * @param {Object} lot - Lot data from repository
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateLotAvailability(item, lot) {
  if (!lot) {
    return {
      valid: false,
      error: `Lot "${item.name}" không còn tồn tại!`
    };
  }
  
  if (lot.available_quantity < item.quantity) {
    return {
      valid: false,
      error: `Lot "${item.name}" chỉ còn ${lot.available_quantity} sản phẩm!`
    };
  }
  
  if (lot.status !== 'active') {
    return {
      valid: false,
      error: `Lot "${item.name}" không còn mở bán!`
    };
  }
  
  return { valid: true };
}

/**
 * Check if customer info is complete
 * @param {import('../types/CheckoutDTO').CustomerInfoDTO} customerInfo
 * @returns {boolean}
 */
export function isCustomerInfoComplete(customerInfo) {
  return !!(
    customerInfo.name?.trim() &&
    customerInfo.email?.trim() &&
    customerInfo.phone?.trim() &&
    customerInfo.address?.trim() &&
    customerInfo.city?.trim() &&
    customerInfo.district?.trim()
  );
}

export default {
  validateCustomerInfo,
  validateCart,
  validateLotAvailability,
  isCustomerInfoComplete
};