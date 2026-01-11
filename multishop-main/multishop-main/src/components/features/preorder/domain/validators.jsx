/**
 * Pre-Order Validators - Domain Logic
 * 
 * Pure validation functions
 */

/**
 * Validate lot purchase
 */
export function validateLotPurchase(lot, quantity) {
  const errors = [];
  
  if (!lot) {
    errors.push('Lot không tồn tại');
    return { valid: false, errors };
  }
  
  if (lot.status !== 'active') {
    errors.push('Lot không còn mở bán');
  }
  
  if (quantity <= 0) {
    errors.push('Số lượng phải lớn hơn 0');
  }
  
  if (lot.moq && quantity < lot.moq) {
    errors.push(`Số lượng tối thiểu là ${lot.moq} ${lot.unit || 'kg'}`);
  }
  
  if (quantity > lot.available_quantity) {
    errors.push(`Chỉ còn ${lot.available_quantity} ${lot.unit || 'kg'} có sẵn`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate cancellation request
 */
export function validateCancellationRequest(order, reasons) {
  const errors = [];
  
  if (!order) {
    errors.push('Đơn hàng không tồn tại');
    return { valid: false, errors };
  }
  
  const nonCancellableStatuses = ['cancelled', 'delivered', 'shipping', 'returned_refunded'];
  if (nonCancellableStatuses.includes(order.order_status)) {
    errors.push('Đơn hàng không thể hủy với trạng thái hiện tại');
  }
  
  if (!reasons || reasons.length === 0) {
    errors.push('Vui lòng chọn ít nhất một lý do hủy');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate refund request
 */
export function validateRefundRequest(wallet, amount) {
  const errors = [];
  
  if (!wallet) {
    errors.push('Không tìm thấy ví thanh toán');
    return { valid: false, errors };
  }
  
  if (amount <= 0) {
    errors.push('Số tiền hoàn phải lớn hơn 0');
  }
  
  if (amount > (wallet.total_held || 0)) {
    errors.push('Số tiền hoàn vượt quá số dư trong ví');
  }
  
  const blockedStatuses = ['released_to_seller', 'cancelled'];
  if (blockedStatuses.includes(wallet.status)) {
    errors.push('Ví đã được release hoặc hủy, không thể hoàn tiền');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate deposit payment
 */
export function validateDepositPayment(wallet, amount) {
  const errors = [];
  
  if (!wallet) {
    errors.push('Không tìm thấy ví thanh toán');
    return { valid: false, errors };
  }
  
  if (amount <= 0) {
    errors.push('Số tiền cọc phải lớn hơn 0');
  }
  
  if (wallet.status !== 'pending_deposit') {
    errors.push('Đơn hàng đã được đặt cọc');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate lot data for creation
 */
export function validateLotData(data) {
  const errors = [];
  
  if (!data.lot_name?.trim()) {
    errors.push('Tên lot không được trống');
  }
  
  if (!data.preorder_product_id) {
    errors.push('Phải chọn sản phẩm pre-order');
  }
  
  if (!data.total_yield || data.total_yield <= 0) {
    errors.push('Sản lượng dự kiến phải lớn hơn 0');
  }
  
  if (!data.initial_price || data.initial_price <= 0) {
    errors.push('Giá khởi điểm phải lớn hơn 0');
  }
  
  if (!data.estimated_harvest_date) {
    errors.push('Phải có ngày thu hoạch dự kiến');
  } else {
    const harvestDate = new Date(data.estimated_harvest_date);
    if (harvestDate <= new Date()) {
      errors.push('Ngày thu hoạch phải trong tương lai');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate dispute submission
 */
export function validateDisputeSubmission(data) {
  const errors = [];
  
  if (!data.dispute_type) {
    errors.push('Vui lòng chọn loại vấn đề');
  }
  
  if (!data.customer_description?.trim()) {
    errors.push('Vui lòng mô tả chi tiết vấn đề');
  }
  
  if (data.customer_description && data.customer_description.length < 20) {
    errors.push('Mô tả phải có ít nhất 20 ký tự');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}