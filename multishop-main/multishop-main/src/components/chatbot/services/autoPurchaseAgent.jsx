/**
 * Auto Purchase Agent
 * 
 * Voice-first auto purchase flow for elderly users
 * User says "mua 1 kg gạo" → Bot auto-completes the order
 * 
 * Architecture: Service Layer
 * @see AI-CODING-RULES.jsx - Section 4: Data/Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { chatbotProductAPI } from './chatbotProductService';
import simpleLang from './simpleLangAgent';

// ========== PURCHASE INTENTS ==========

const PURCHASE_PATTERNS = {
  // "mua 1 kg gạo", "lấy 2 bó rau"
  BUY_PRODUCT: /^(mua|đặt|lấy|thêm|cho|order)\s+(\d+)?\s*(kg|g|bó|gói|chai|lon|hộp|cái|túi)?\s*(.+)/i,
  
  // "mua lại gạo", "mua thêm rau"
  BUY_AGAIN: /^(mua lại|mua thêm|đặt lại|order lại)\s+(.+)/i,
  
  // "mua lại đơn trước", "đặt lại đơn cũ"
  REORDER_LAST: /(mua lại|đặt lại|order lại)\s*(đơn|order|đơn hàng)?\s*(trước|cũ|gần nhất|cuối)/i,
  
  // "xác nhận", "đồng ý", "ok", "được", "đặt", "đặt đi"
  CONFIRM: /^(xác nhận|đồng ý|ok|được|đặt|đặt đi|đặt luôn|đặt ngay|đặt hàng|confirm|yes|oke|ờ|ừ|vâng|có|rồi|ok luôn|được luôn)$/i,
  
  // "hủy", "thôi", "không"
  CANCEL: /^(hủy|thôi|không|cancel|no|ko|k|đừng)$/i,
  
  // "sửa", "thay đổi"
  EDIT: /^(sửa|thay đổi|chỉnh|edit|change)/i
};

// ========== AUTO PURCHASE STATE ==========

const autoPurchaseStates = new Map();

export const AUTO_PURCHASE_STEPS = {
  IDLE: 'idle',
  FINDING_PRODUCT: 'finding_product',
  PENDING_CONFIRM: 'pending_confirm',
  COLLECTING_INFO: 'collecting_info',
  CONFIRMED: 'confirmed'
};

function getAutoPurchaseState(userEmail) {
  return autoPurchaseStates.get(userEmail) || null;
}

function setAutoPurchaseState(userEmail, state) {
  autoPurchaseStates.set(userEmail, {
    ...state,
    updatedAt: Date.now()
  });
}

function clearAutoPurchaseState(userEmail) {
  autoPurchaseStates.delete(userEmail);
}

// ========== INTENT DETECTION ==========

/**
 * Check if message is a purchase intent
 */
export function isPurchaseIntent(query) {
  const q = query.toLowerCase().trim();
  
  return (
    PURCHASE_PATTERNS.BUY_PRODUCT.test(q) ||
    PURCHASE_PATTERNS.BUY_AGAIN.test(q) ||
    PURCHASE_PATTERNS.REORDER_LAST.test(q)
  );
}

/**
 * Check if in auto purchase flow
 */
export function isInAutoPurchaseFlow(userEmail) {
  const state = getAutoPurchaseState(userEmail);
  return state && state.step !== AUTO_PURCHASE_STEPS.IDLE;
}

/**
 * Check if message is confirm/cancel in flow
 */
export function isFlowResponse(query) {
  const q = query.toLowerCase().trim();
  return (
    PURCHASE_PATTERNS.CONFIRM.test(q) ||
    PURCHASE_PATTERNS.CANCEL.test(q) ||
    PURCHASE_PATTERNS.EDIT.test(q)
  );
}

// ========== MAIN HANDLER ==========

/**
 * Handle auto purchase query
 */
export async function handleAutoPurchase(query, options = {}) {
  const { userEmail, userContext = {} } = options;
  const q = query.toLowerCase().trim();
  
  // Check if user is responding to pending order
  const existingState = getAutoPurchaseState(userEmail);
  if (existingState?.step === AUTO_PURCHASE_STEPS.PENDING_CONFIRM) {
    return handlePendingConfirmResponse(userEmail, q, existingState);
  }
  
  // Check for reorder last order
  if (PURCHASE_PATTERNS.REORDER_LAST.test(q)) {
    return handleReorderLast(userEmail, userContext);
  }
  
  // Check for buy again (specific product)
  if (PURCHASE_PATTERNS.BUY_AGAIN.test(q)) {
    const match = q.match(PURCHASE_PATTERNS.BUY_AGAIN);
    const productQuery = match[2];
    return handleBuyAgain(userEmail, productQuery, userContext);
  }
  
  // Check for direct buy
  if (PURCHASE_PATTERNS.BUY_PRODUCT.test(q)) {
    return handleDirectBuy(userEmail, q, userContext);
  }
  
  return failure('Không hiểu yêu cầu mua hàng', ErrorCodes.VALIDATION_ERROR);
}

// ========== PURCHASE HANDLERS ==========

/**
 * Handle "mua 1 kg gạo" - Direct buy
 */
async function handleDirectBuy(userEmail, query, userContext) {
  const match = query.match(PURCHASE_PATTERNS.BUY_PRODUCT);
  if (!match) {
    return failure('Không hiểu yêu cầu', ErrorCodes.VALIDATION_ERROR);
  }
  
  const quantity = parseInt(match[2]) || 1;
  const unit = match[3] || '';
  const productQuery = match[4]?.trim();
  
  if (!productQuery) {
    return success({
      content: '🤔 Bác muốn mua gì ạ? Ví dụ: "Mua 1 kg gạo ST25"',
      contentType: 'markdown',
      voiceText: 'Bác muốn mua gì ạ? Nói rõ tên sản phẩm giúp cháu nhé.',
      suggestedActions: ['🍚 Mua gạo', '🥬 Mua rau', '🍎 Mua trái cây']
    });
  }
  
  // Find product
  const searchResult = await chatbotProductAPI.searchProducts(productQuery, 1);
  
  if (!searchResult.success || searchResult.data.length === 0) {
    return success({
      content: `😅 Cháu không tìm thấy "${productQuery}". Bác thử tên khác nhé!\n\nVí dụ: gạo ST25, rau cải, bắp cải...`,
      contentType: 'markdown',
      voiceText: `Cháu không tìm thấy ${productQuery}. Bác thử tên khác nhé.`,
      suggestedActions: ['🍚 Xem gạo', '🥬 Xem rau', '🔍 Tìm sản phẩm']
    });
  }
  
  const product = searchResult.data[0];
  
  // Create pending order
  return createPendingOrder(userEmail, [{
    ...product,
    quantity: quantity
  }], userContext);
}

/**
 * Handle "mua lại gạo" - Buy again specific product
 */
async function handleBuyAgain(userEmail, productQuery, userContext) {
  // First, try to find from past orders
  let product = null;
  let lastQuantity = 1;
  
  try {
    const orders = await base44.entities.Order.filter({
      customer_email: userEmail,
      order_status: 'delivered'
    });
    
    if (orders.length > 0) {
      // Find product in past orders
      for (const order of orders.slice(0, 5)) {
        const item = order.items?.find(i => 
          i.product_name?.toLowerCase().includes(productQuery.toLowerCase())
        );
        if (item) {
          lastQuantity = item.quantity;
          // Get current product info
          const searchResult = await chatbotProductAPI.searchProducts(item.product_name, 1);
          if (searchResult.success && searchResult.data.length > 0) {
            product = searchResult.data[0];
          }
          break;
        }
      }
    }
  } catch (e) {
    console.error('Error finding past orders:', e);
  }
  
  // If not found in orders, search normally
  if (!product) {
    const searchResult = await chatbotProductAPI.searchProducts(productQuery, 1);
    if (searchResult.success && searchResult.data.length > 0) {
      product = searchResult.data[0];
    }
  }
  
  if (!product) {
    return success({
      content: `😅 Cháu không tìm thấy "${productQuery}". Bác kiểm tra lại tên sản phẩm nhé!`,
      contentType: 'markdown',
      voiceText: `Không tìm thấy ${productQuery}. Bác thử tên khác.`,
      suggestedActions: ['🔍 Tìm sản phẩm', '📦 Xem đơn cũ']
    });
  }
  
  return createPendingOrder(userEmail, [{
    ...product,
    quantity: lastQuantity
  }], userContext);
}

/**
 * Handle "mua lại đơn trước" - Reorder last order
 */
async function handleReorderLast(userEmail, userContext) {
  try {
    const orders = await base44.entities.Order.filter({
      customer_email: userEmail
    });
    
    // Sort by date and get most recent
    const sortedOrders = orders
      .filter(o => o.order_status !== 'cancelled')
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    if (sortedOrders.length === 0) {
      return success({
        content: '📦 Bác chưa có đơn hàng nào trước đây. Mua sắm sản phẩm mới nhé!',
        contentType: 'markdown',
        voiceText: 'Bác chưa có đơn hàng nào. Thử tìm sản phẩm mới nhé.',
        suggestedActions: ['🍚 Xem gạo', '🥬 Xem rau', '🔍 Tìm sản phẩm']
      });
    }
    
    const lastOrder = sortedOrders[0];
    
    // Convert order items to cart items
    const items = await Promise.all(
      (lastOrder.items || []).map(async (item) => {
        // Get current product info
        const searchResult = await chatbotProductAPI.getProductById(item.product_id);
        if (searchResult.success && searchResult.data) {
          return {
            ...searchResult.data,
            quantity: item.quantity
          };
        }
        return {
          id: item.product_id,
          name: item.product_name,
          price: item.unit_price,
          unit: 'sản phẩm',
          quantity: item.quantity
        };
      })
    );
    
    return createPendingOrder(userEmail, items.filter(Boolean), userContext, lastOrder);
    
  } catch (error) {
    console.error('Reorder error:', error);
    return success({
      content: '❌ Có lỗi khi lấy đơn hàng cũ. Bác thử lại sau nhé!',
      contentType: 'markdown',
      voiceText: 'Có lỗi xảy ra. Bác thử lại sau nhé.'
    });
  }
}

// ========== PENDING ORDER ==========

/**
 * Create pending order for confirmation
 * AUTO-COMPLETE: Tự động lấy thông tin từ profile, đơn cũ → 1 chạm xác nhận
 */
async function createPendingOrder(userEmail, items, userContext, fromOrder = null) {
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 200000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  
  // AUTO-FETCH: Lấy thông tin từ nhiều nguồn
  let customerInfo = null;
  let address = null;
  
  try {
    // 1. Từ đơn hàng cũ (nếu có)
    if (fromOrder) {
      customerInfo = {
        name: fromOrder.customer_name,
        phone: fromOrder.customer_phone
      };
      address = fromOrder.shipping_address;
    }
    
    // 2. Từ Customer entity
    if (!customerInfo || !address) {
      const customers = await base44.entities.Customer.filter({
        email: userEmail
      });
      if (customers.length > 0) {
        const customer = customers[0];
        if (!customerInfo) {
          customerInfo = {
            name: customer.full_name,
            phone: customer.phone
          };
        }
        if (!address && customer.address) {
          address = [customer.address, customer.district, customer.city]
            .filter(Boolean).join(', ');
        }
      }
    }
    
    // 3. Từ User entity (base44 auth)
    if (!customerInfo) {
      const user = await base44.auth.me();
      if (user) {
        customerInfo = {
          name: user.full_name || customerInfo?.name,
          phone: user.phone || customerInfo?.phone
        };
      }
    }
    
    // 4. Từ đơn hàng gần nhất của user
    if (!address) {
      const recentOrders = await base44.entities.Order.filter({
        customer_email: userEmail
      });
      const lastDelivered = recentOrders
        .filter(o => o.order_status === 'delivered' && o.shipping_address)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
      
      if (lastDelivered) {
        address = lastDelivered.shipping_address;
        if (!customerInfo) {
          customerInfo = {
            name: lastDelivered.customer_name,
            phone: lastDelivered.customer_phone
          };
        }
      }
    }
    
  } catch (e) {
    console.error('Error auto-fetching customer info:', e);
  }
  
  // Save state
  const state = {
    step: AUTO_PURCHASE_STEPS.PENDING_CONFIRM,
    items,
    subtotal,
    shippingFee,
    total,
    customerInfo,
    address,
    paymentMethod: 'cod',
    fromOrder: fromOrder?.order_number
  };
  
  setAutoPurchaseState(userEmail, state);
  
  // Format order preview
  const itemsList = items.slice(0, 5).map(item => 
    `• ${item.name} x${item.quantity} = ${simpleLang.friendlyPrice(item.price * item.quantity)}`
  ).join('\n');
  
  const moreItems = items.length > 5 ? `\n... và ${items.length - 5} món nữa` : '';
  
  // Check if we have all info to auto-complete
  const canAutoComplete = customerInfo && address;
  
  let content = `🛒 **Đơn hàng của bác:**\n\n${itemsList}${moreItems}\n\n`;
  content += `💰 **Tạm tính:** ${simpleLang.friendlyPrice(subtotal)}\n`;
  content += `🚚 **Phí ship:** ${shippingFee === 0 ? 'Miễn phí 🎉' : simpleLang.friendlyPrice(shippingFee)}\n`;
  content += `💚 **Tổng:** ${simpleLang.friendlyPrice(total)}\n\n`;
  
  if (canAutoComplete) {
    content += `---\n👤 **Người nhận:** ${customerInfo.name}\n`;
    content += `📞 **SĐT:** ${customerInfo.phone}\n`;
    content += `📍 **Địa chỉ:** ${address}\n`;
    content += `💳 **Thanh toán:** Tiền mặt khi nhận\n\n`;
    content += `✅ Bác nói **"Đặt"** hoặc **"OK"** để đặt hàng ngay!`;
  } else {
    // Thiếu thông tin - nhưng vẫn cố gắng lấy từ các nguồn khác
    const missing = [];
    if (!customerInfo?.name) missing.push('tên');
    if (!customerInfo?.phone) missing.push('số điện thoại');
    if (!address) missing.push('địa chỉ');
    
    content += `📝 Bác cho cháu biết ${missing.join(', ')} nhé!`;
    
    // Update state to collecting info
    setAutoPurchaseState(userEmail, {
      ...state,
      step: AUTO_PURCHASE_STEPS.COLLECTING_INFO
    });
  }
  
  const voiceText = canAutoComplete
    ? `Đơn hàng ${items.length} món, tổng ${simpleLang.friendlyPrice(total)}, giao đến ${address}. Bác nói đặt hoặc ok để đặt hàng ngay.`
    : `Đơn hàng ${items.length} món, tổng ${simpleLang.friendlyPrice(total)}. Bác cho cháu biết thông tin giao hàng nhé.`;
  
  return success({
    content,
    contentType: 'markdown',
    autoPurchaseStep: state.step,
    orderPreview: state,
    suggestedActions: canAutoComplete 
      ? ['✅ Đặt ngay', '✏️ Sửa', '❌ Hủy']
      : ['📝 Nhập thông tin'],
    voiceText
  });
}

/**
 * Handle response when pending confirm
 */
async function handlePendingConfirmResponse(userEmail, query, state) {
  // Check confirm
  if (PURCHASE_PATTERNS.CONFIRM.test(query)) {
    // Check if we have all info
    if (!state.customerInfo || !state.address) {
      return success({
        content: '📝 Bác chưa cho cháu thông tin giao hàng. Cho cháu biết:\n• Tên\n• Số điện thoại\n• Địa chỉ',
        contentType: 'markdown',
        voiceText: 'Bác cho cháu biết tên, số điện thoại và địa chỉ nhé.',
        suggestedActions: ['📝 Nhập thông tin']
      });
    }
    
    // Submit order!
    return submitAutoPurchaseOrder(userEmail, state);
  }
  
  // Check cancel
  if (PURCHASE_PATTERNS.CANCEL.test(query)) {
    clearAutoPurchaseState(userEmail);
    return success({
      content: '❌ Đã hủy đơn hàng. Bác mua sắm tiếp nhé!',
      contentType: 'markdown',
      voiceText: 'Đã hủy đơn hàng. Bác mua sắm tiếp nhé.',
      suggestedActions: ['🛒 Mua sắm', '🔍 Tìm sản phẩm']
    });
  }
  
  // Check edit
  if (PURCHASE_PATTERNS.EDIT.test(query)) {
    // Dispatch event to open cart modal
    if (typeof window !== 'undefined') {
      // Add items to cart
      state.items.forEach(item => {
        window.dispatchEvent(new CustomEvent('add-to-cart', {
          detail: { ...item }
        }));
      });
      
      // Open cart
      setTimeout(() => {
        window.dispatchEvent(new Event('open-cart'));
      }, 100);
    }
    
    clearAutoPurchaseState(userEmail);
    
    return success({
      content: '✏️ Cháu đã thêm vào giỏ hàng. Bác chỉnh sửa trong giỏ nhé!',
      contentType: 'markdown',
      voiceText: 'Cháu đã mở giỏ hàng. Bác chỉnh sửa rồi đặt nhé.',
      action: { type: 'open_cart' }
    });
  }
  
  // Collecting info - try to parse
  if (state.step === AUTO_PURCHASE_STEPS.COLLECTING_INFO || !state.customerInfo || !state.address) {
    return handleCollectInfo(userEmail, query, state);
  }
  
  // Repeat prompt
  return success({
    content: '🤔 Bác nói **"Xác nhận"** để đặt hàng, hoặc **"Hủy"** nếu không muốn đặt nữa nhé!',
    contentType: 'markdown',
    voiceText: 'Bác nói xác nhận để đặt hàng, hoặc hủy nếu không muốn.',
    suggestedActions: ['✅ Xác nhận', '❌ Hủy']
  });
}

/**
 * Handle collecting customer info
 */
async function handleCollectInfo(userEmail, input, state) {
  // Try to parse name, phone, address from input
  const phoneRegex = /0\d{9,10}/;
  const phoneMatch = input.match(phoneRegex);
  
  let name = state.customerInfo?.name;
  let phone = state.customerInfo?.phone || (phoneMatch ? phoneMatch[0] : null);
  let address = state.address;
  
  // Extract name (if no phone in text, it might be name)
  if (!phone && !state.customerInfo?.name && input.length < 50 && !input.match(/\d/)) {
    name = input.trim();
  }
  
  // If has phone, extract name from remaining text
  if (phoneMatch && !name) {
    const remaining = input.replace(phoneMatch[0], '').trim();
    if (remaining.length > 2 && remaining.length < 50) {
      name = remaining.replace(/[,.\-:]/g, '').trim();
    }
  }
  
  // If longer text with numbers/commas, might be address
  if (input.length > 20 && (input.includes(',') || input.match(/\d/) || input.match(/đường|phường|quận|tp|huyện|xã/i))) {
    address = input;
  }
  
  // Update state
  const updatedState = {
    ...state,
    customerInfo: { name, phone },
    address
  };
  setAutoPurchaseState(userEmail, updatedState);
  
  // Check what's missing
  const missing = [];
  if (!name) missing.push('tên');
  if (!phone) missing.push('số điện thoại');
  if (!address) missing.push('địa chỉ');
  
  if (missing.length > 0) {
    return success({
      content: `📝 Bác cho cháu biết thêm **${missing.join(', ')}** nhé!${name ? `\n\n👤 Tên: ${name}` : ''}${phone ? `\n📞 SĐT: ${phone}` : ''}${address ? `\n📍 Địa chỉ: ${address}` : ''}`,
      contentType: 'markdown',
      voiceText: `Bác cho cháu biết ${missing.join(', ')} nhé.`,
      suggestedActions: ['📝 Tiếp tục nhập']
    });
  }
  
  // All info collected - show final confirm
  let content = `✅ **Xác nhận đơn hàng:**\n\n`;
  content += updatedState.items.slice(0, 3).map(item => 
    `• ${item.name} x${item.quantity}`
  ).join('\n');
  if (updatedState.items.length > 3) {
    content += `\n... và ${updatedState.items.length - 3} món nữa`;
  }
  content += `\n\n👤 **Người nhận:** ${name}`;
  content += `\n📞 **SĐT:** ${phone}`;
  content += `\n📍 **Địa chỉ:** ${address}`;
  content += `\n💚 **Tổng:** ${simpleLang.friendlyPrice(updatedState.total)}`;
  content += `\n\nBác nói **"Xác nhận"** để đặt hàng nhé!`;
  
  // Update step
  setAutoPurchaseState(userEmail, {
    ...updatedState,
    step: AUTO_PURCHASE_STEPS.PENDING_CONFIRM
  });
  
  return success({
    content,
    contentType: 'markdown',
    voiceText: `Đơn hàng cho ${name}, tổng ${simpleLang.friendlyPrice(updatedState.total)}. Bác nói xác nhận để đặt.`,
    suggestedActions: ['✅ Xác nhận', '✏️ Sửa', '❌ Hủy']
  });
}

// ========== SUBMIT ORDER ==========

async function submitAutoPurchaseOrder(userEmail, state) {
  try {
    const orderNumber = `ZF${Date.now().toString().slice(-8)}`;
    
    const order = await base44.entities.Order.create({
      order_number: orderNumber,
      customer_name: state.customerInfo.name,
      customer_phone: state.customerInfo.phone,
      customer_email: userEmail,
      shipping_address: state.address,
      items: state.items.map(item => ({
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
    
    // Clear state
    clearAutoPurchaseState(userEmail);
    
    // Dispatch clear cart event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('clear-cart'));
    }
    
    return success({
      content: `🎉 **Đặt hàng thành công!**\n\n📋 **Mã đơn:** ${orderNumber}\n👤 **Người nhận:** ${state.customerInfo.name}\n📞 **SĐT:** ${state.customerInfo.phone}\n📍 **Giao đến:** ${state.address}\n💚 **Tổng:** ${simpleLang.friendlyPrice(state.total)}\n\n📞 Cháu sẽ gọi xác nhận trong 15 phút nhé!\n🚚 Hàng giao trong 1-2 ngày.\n\nCảm ơn bác! 💚`,
      contentType: 'markdown',
      orderId: order.id,
      orderNumber,
      voiceText: `Đặt hàng thành công! Mã đơn ${orderNumber}. Tổng ${simpleLang.friendlyPrice(state.total)}. Cháu sẽ gọi xác nhận sớm nhé.`,
      suggestedActions: ['📦 Xem đơn hàng', '🛒 Mua thêm']
    });
    
  } catch (error) {
    console.error('Auto purchase order error:', error);
    return success({
      content: '❌ Có lỗi khi đặt hàng. Bác thử lại hoặc gọi hotline 098 765 4321 nhé!',
      contentType: 'markdown',
      voiceText: 'Có lỗi xảy ra. Bác gọi hotline hỗ trợ nhé.'
    });
  }
}

// ========== EXPORTS ==========

export default {
  AUTO_PURCHASE_STEPS,
  isPurchaseIntent,
  isInAutoPurchaseFlow,
  isFlowResponse,
  handleAutoPurchase,
  getAutoPurchaseState,
  clearAutoPurchaseState
};