/**
 * Checkout Agent
 * 
 * Handles in-chat checkout flow with step-by-step guidance
 * Voice-friendly, elderly-friendly
 * 
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import simpleLang from './simpleLangAgent';

// ========== CHECKOUT STEPS ==========

export const CHECKOUT_STEPS = {
  CART_REVIEW: 'cart_review',
  CUSTOMER_INFO: 'customer_info',
  ADDRESS: 'address',
  PAYMENT: 'payment',
  CONFIRM: 'confirm',
  SUCCESS: 'success'
};

const STEP_MESSAGES = {
  [CHECKOUT_STEPS.CART_REVIEW]: {
    title: '🛒 Bước 1: Xem lại giỏ hàng',
    voice: 'Bác xem lại giỏ hàng nhé. Có đúng những món bác muốn mua không?',
    actions: ['✅ Đúng rồi, tiếp tục', '✏️ Sửa giỏ hàng', '❌ Hủy']
  },
  [CHECKOUT_STEPS.CUSTOMER_INFO]: {
    title: '👤 Bước 2: Thông tin người nhận',
    voice: 'Bác cho cháu biết tên và số điện thoại để giao hàng nhé.',
    actions: ['📝 Nhập thông tin', '👤 Dùng thông tin cũ']
  },
  [CHECKOUT_STEPS.ADDRESS]: {
    title: '📍 Bước 3: Địa chỉ giao hàng',
    voice: 'Bác cho cháu địa chỉ giao hàng nhé. Ghi rõ số nhà, đường, phường xã.',
    actions: ['📍 Nhập địa chỉ', '🏠 Dùng địa chỉ cũ']
  },
  [CHECKOUT_STEPS.PAYMENT]: {
    title: '💳 Bước 4: Chọn cách trả tiền',
    voice: 'Bác muốn trả tiền bằng cách nào? Trả tiền mặt khi nhận hàng hay chuyển khoản?',
    actions: ['💵 Trả tiền mặt', '🏦 Chuyển khoản']
  },
  [CHECKOUT_STEPS.CONFIRM]: {
    title: '✅ Bước 5: Xác nhận đơn hàng',
    voice: 'Bác kiểm tra lại đơn hàng lần cuối nhé. Đúng hết rồi thì nhấn Đặt hàng.',
    actions: ['🎉 Đặt hàng', '↩️ Quay lại sửa']
  },
  [CHECKOUT_STEPS.SUCCESS]: {
    title: '🎉 Đặt hàng thành công!',
    voice: 'Chúc mừng bác! Đơn hàng đã được ghi nhận. Cháu sẽ gọi điện xác nhận sớm nhé!',
    actions: ['📦 Xem đơn hàng', '🛒 Mua thêm']
  }
};

// ========== STATE MANAGEMENT ==========

// In-memory checkout state (per user)
const checkoutStates = new Map();

export function getCheckoutState(userEmail) {
  return checkoutStates.get(userEmail) || null;
}

export function setCheckoutState(userEmail, state) {
  checkoutStates.set(userEmail, {
    ...state,
    updatedAt: Date.now()
  });
}

export function clearCheckoutState(userEmail) {
  checkoutStates.delete(userEmail);
}

// ========== CHECKOUT HANDLERS ==========

/**
 * Start checkout flow
 */
export async function startCheckout(userEmail, cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return success({
      content: '🛒 **Giỏ hàng trống!**\n\nBác chưa có món hàng nào. Tìm sản phẩm trước nhé!',
      contentType: 'markdown',
      suggestedActions: ['🔍 Tìm rau củ', '🍚 Tìm gạo', '🥬 Xem tất cả']
    });
  }
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 200000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  
  // Initialize checkout state
  setCheckoutState(userEmail, {
    step: CHECKOUT_STEPS.CART_REVIEW,
    cartItems,
    subtotal,
    shippingFee,
    total,
    customerInfo: null,
    address: null,
    paymentMethod: null
  });
  
  // Format cart summary
  const itemList = cartItems.slice(0, 5).map(item => 
    `• ${item.name} x${item.quantity} = ${simpleLang.friendlyPrice(item.price * item.quantity)}`
  ).join('\n');
  
  const moreItems = cartItems.length > 5 ? `\n... và ${cartItems.length - 5} món nữa` : '';
  
  const stepInfo = STEP_MESSAGES[CHECKOUT_STEPS.CART_REVIEW];
  
  const content = `${stepInfo.title}

${itemList}${moreItems}

---
💰 **Tạm tính:** ${simpleLang.friendlyPrice(subtotal)}
🚚 **Phí ship:** ${shippingFee === 0 ? 'Miễn phí 🎉' : simpleLang.friendlyPrice(shippingFee)}
💚 **Tổng cộng:** ${simpleLang.friendlyPrice(total)}

${stepInfo.voice}`;

  return success({
    content,
    contentType: 'markdown',
    checkoutStep: CHECKOUT_STEPS.CART_REVIEW,
    suggestedActions: stepInfo.actions,
    voiceText: stepInfo.voice
  });
}

/**
 * Handle checkout step response
 */
export async function handleCheckoutResponse(userEmail, response) {
  const state = getCheckoutState(userEmail);
  
  if (!state) {
    return success({
      content: '❓ Bác chưa bắt đầu đặt hàng. Nhấn "Thanh toán" để bắt đầu nhé!',
      contentType: 'text',
      suggestedActions: ['🛒 Thanh toán giỏ hàng']
    });
  }
  
  const lowerResponse = response.toLowerCase();
  
  // Handle cancel
  if (lowerResponse.includes('hủy') || lowerResponse.includes('thôi')) {
    clearCheckoutState(userEmail);
    return success({
      content: '❌ Đã hủy đơn hàng. Bác quay lại mua sắm nhé!',
      contentType: 'text',
      suggestedActions: ['🛒 Tiếp tục mua', '🔍 Tìm sản phẩm']
    });
  }
  
  // Handle back
  if (lowerResponse.includes('quay lại') || lowerResponse.includes('sửa')) {
    return goToPreviousStep(userEmail);
  }
  
  // Process based on current step
  switch (state.step) {
    case CHECKOUT_STEPS.CART_REVIEW:
      if (lowerResponse.includes('đúng') || lowerResponse.includes('tiếp')) {
        return goToStep(userEmail, CHECKOUT_STEPS.CUSTOMER_INFO);
      }
      break;
      
    case CHECKOUT_STEPS.CUSTOMER_INFO:
      // Parse customer info from response
      if (lowerResponse.includes('thông tin cũ') && state.savedCustomerInfo) {
        setCheckoutState(userEmail, { ...state, customerInfo: state.savedCustomerInfo });
        return goToStep(userEmail, CHECKOUT_STEPS.ADDRESS);
      }
      
      // Try to extract name and phone
      const parsed = parseCustomerInfo(response);
      if (parsed.name && parsed.phone) {
        setCheckoutState(userEmail, { ...state, customerInfo: parsed });
        return goToStep(userEmail, CHECKOUT_STEPS.ADDRESS);
      }
      
      return success({
        content: '📝 Bác cho cháu biết:\n\n• **Tên:** (VD: Nguyễn Văn A)\n• **Số điện thoại:** (VD: 0912345678)\n\nBác gõ cả tên và số điện thoại nhé!',
        contentType: 'markdown',
        voiceText: 'Bác gõ tên và số điện thoại nhé. Ví dụ: Nguyễn Văn A, không chín một hai ba bốn năm sáu bảy tám.'
      });
      
    case CHECKOUT_STEPS.ADDRESS:
      if (lowerResponse.includes('địa chỉ cũ') && state.savedAddress) {
        setCheckoutState(userEmail, { ...state, address: state.savedAddress });
        return goToStep(userEmail, CHECKOUT_STEPS.PAYMENT);
      }
      
      // Save address if provided
      if (response.length > 10) {
        setCheckoutState(userEmail, { ...state, address: response });
        return goToStep(userEmail, CHECKOUT_STEPS.PAYMENT);
      }
      
      return success({
        content: '📍 Bác ghi địa chỉ đầy đủ nhé:\n\n**Ví dụ:** 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM\n\nGhi rõ số nhà để shipper tìm dễ hơn ạ!',
        contentType: 'markdown',
        voiceText: 'Bác ghi địa chỉ đầy đủ nhé, có số nhà, tên đường, phường xã.'
      });
      
    case CHECKOUT_STEPS.PAYMENT:
      let paymentMethod = 'cod';
      if (lowerResponse.includes('chuyển') || lowerResponse.includes('bank')) {
        paymentMethod = 'bank_transfer';
      }
      setCheckoutState(userEmail, { ...state, paymentMethod });
      return goToStep(userEmail, CHECKOUT_STEPS.CONFIRM);
      
    case CHECKOUT_STEPS.CONFIRM:
      if (lowerResponse.includes('đặt') || lowerResponse.includes('xác nhận')) {
        return submitOrder(userEmail);
      }
      break;
  }
  
  // Default: repeat current step
  return repeatCurrentStep(userEmail);
}

/**
 * Go to specific checkout step
 */
function goToStep(userEmail, step) {
  const state = getCheckoutState(userEmail);
  setCheckoutState(userEmail, { ...state, step });
  
  const stepInfo = STEP_MESSAGES[step];
  
  let content = `${stepInfo.title}\n\n`;
  
  // Add step-specific content
  switch (step) {
    case CHECKOUT_STEPS.CUSTOMER_INFO:
      content += '📝 Bác nhập **Tên** và **Số điện thoại** nhé!\n\n';
      content += '**Ví dụ:** Nguyễn Văn A, 0912345678';
      break;
      
    case CHECKOUT_STEPS.ADDRESS:
      content += '📍 Bác nhập **Địa chỉ giao hàng** đầy đủ nhé!\n\n';
      content += '**Ví dụ:** 123 Nguyễn Huệ, Phường 1, Quận 1, TP.HCM';
      break;
      
    case CHECKOUT_STEPS.PAYMENT:
      content += 'Bác chọn cách trả tiền:\n\n';
      content += '💵 **Tiền mặt:** Trả khi nhận hàng\n';
      content += '🏦 **Chuyển khoản:** Chuyển trước, ship giao sau';
      break;
      
    case CHECKOUT_STEPS.CONFIRM:
      content += formatOrderSummary(state);
      break;
  }
  
  return success({
    content,
    contentType: 'markdown',
    checkoutStep: step,
    suggestedActions: stepInfo.actions,
    voiceText: stepInfo.voice
  });
}

/**
 * Go to previous step
 */
function goToPreviousStep(userEmail) {
  const state = getCheckoutState(userEmail);
  const steps = Object.values(CHECKOUT_STEPS);
  const currentIndex = steps.indexOf(state.step);
  
  if (currentIndex > 0) {
    return goToStep(userEmail, steps[currentIndex - 1]);
  }
  
  return repeatCurrentStep(userEmail);
}

/**
 * Repeat current step
 */
function repeatCurrentStep(userEmail) {
  const state = getCheckoutState(userEmail);
  return goToStep(userEmail, state.step);
}

/**
 * Submit order
 */
async function submitOrder(userEmail) {
  const state = getCheckoutState(userEmail);
  
  if (!state || !state.customerInfo || !state.address) {
    return success({
      content: '❌ Thiếu thông tin. Bác điền đầy đủ nhé!',
      contentType: 'text'
    });
  }
  
  try {
    // Create order
    const orderNumber = `ZF${Date.now().toString().slice(-8)}`;
    
    const order = await base44.entities.Order.create({
      order_number: orderNumber,
      customer_name: state.customerInfo.name,
      customer_phone: state.customerInfo.phone,
      customer_email: userEmail,
      shipping_address: state.address,
      items: state.cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      })),
      subtotal: state.subtotal,
      shipping_fee: state.shippingFee,
      total_amount: state.total,
      payment_method: state.paymentMethod || 'cod',
      payment_status: 'pending',
      order_status: 'pending'
    });
    
    // Clear checkout state and cart
    clearCheckoutState(userEmail);
    
    // Dispatch event to clear cart
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('clear-cart'));
    }
    
    const stepInfo = STEP_MESSAGES[CHECKOUT_STEPS.SUCCESS];
    
    return success({
      content: `${stepInfo.title}

📋 **Mã đơn hàng:** ${orderNumber}

${formatOrderSummary(state)}

---
📞 Cháu sẽ gọi điện xác nhận trong 15 phút nhé!
🚚 Hàng giao trong 1-2 ngày.

Cảm ơn bác đã mua hàng! 💚`,
      contentType: 'markdown',
      checkoutStep: CHECKOUT_STEPS.SUCCESS,
      orderId: order.id,
      orderNumber,
      suggestedActions: stepInfo.actions,
      voiceText: stepInfo.voice
    });
    
  } catch (error) {
    console.error('Order submit error:', error);
    return success({
      content: '❌ Có lỗi khi đặt hàng. Bác thử lại hoặc gọi hotline 098 765 4321 nhé!',
      contentType: 'text'
    });
  }
}

// ========== HELPERS ==========

function parseCustomerInfo(text) {
  // Try to extract name and phone
  const phoneRegex = /0\d{9,10}/;
  const phoneMatch = text.match(phoneRegex);
  
  // Name is everything except the phone
  let name = text;
  if (phoneMatch) {
    name = text.replace(phoneMatch[0], '').trim();
  }
  
  // Clean up name
  name = name.replace(/[,.\-:]/g, '').trim();
  
  return {
    name: name || null,
    phone: phoneMatch ? phoneMatch[0] : null
  };
}

function formatOrderSummary(state) {
  const items = state.cartItems.slice(0, 3).map(item => 
    `• ${item.name} x${item.quantity}`
  ).join('\n');
  
  const more = state.cartItems.length > 3 ? `\n... và ${state.cartItems.length - 3} món nữa` : '';
  
  return `📦 **Đơn hàng:**
${items}${more}

👤 **Người nhận:** ${state.customerInfo?.name || 'Chưa có'}
📞 **SĐT:** ${state.customerInfo?.phone || 'Chưa có'}
📍 **Địa chỉ:** ${state.address || 'Chưa có'}
💳 **Thanh toán:** ${state.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}

💰 **Tổng tiền:** ${simpleLang.friendlyPrice(state.total)}`;
}

/**
 * Check if query is checkout-related
 */
export function isCheckoutIntent(query) {
  const keywords = [
    'thanh toán', 'checkout', 'đặt hàng', 'mua hàng', 'trả tiền',
    'giỏ hàng', 'mua ngay', 'order', 'đặt ngay'
  ];
  
  const lower = query.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

export default {
  CHECKOUT_STEPS,
  startCheckout,
  handleCheckoutResponse,
  getCheckoutState,
  clearCheckoutState,
  isCheckoutIntent
};