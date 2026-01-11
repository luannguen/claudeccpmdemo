/**
 * Checkout Step Renderer
 * 
 * Visual checkout progress for in-chat purchase flow
 * Shows steps, order preview, and action buttons
 * 
 * Architecture: UI Layer
 * @see AI-CODING-RULES.jsx - Section 2: UI Layer
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, User, MapPin, CreditCard, CheckCircle, 
  ChevronRight, Package, Truck, Phone, Edit2, X
} from 'lucide-react';

// ========== CHECKOUT STEPS CONFIG ==========

const STEPS = [
  { id: 'cart_review', label: 'Giỏ hàng', icon: ShoppingCart },
  { id: 'customer_info', label: 'Thông tin', icon: User },
  { id: 'address', label: 'Địa chỉ', icon: MapPin },
  { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  { id: 'confirm', label: 'Xác nhận', icon: CheckCircle }
];

const STEP_INDEX = {
  cart_review: 0,
  customer_info: 1,
  address: 2,
  payment: 3,
  confirm: 4,
  success: 5
};

// ========== COMPONENTS ==========

/**
 * Progress bar showing checkout steps
 */
function CheckoutProgressBar({ currentStep }) {
  const currentIndex = STEP_INDEX[currentStep] || 0;
  
  return (
    <div className="flex items-center justify-between w-full mb-4 px-1">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-[#7CB342] text-white ring-2 ring-[#7CB342]/30' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[9px] mt-1 ${isCurrent ? 'text-[#7CB342] font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            
            {index < STEPS.length - 1 && (
              <div 
                className={`
                  flex-1 h-0.5 mx-1
                  ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Order preview card
 */
function OrderPreviewCard({ orderPreview }) {
  const { items = [], subtotal, shippingFee, total, customerInfo, address, paymentMethod } = orderPreview || {};
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };
  
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
      {/* Items */}
      <div className="space-y-1">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 truncate flex-1">{item.name}</span>
            <span className="text-gray-500 ml-2">x{item.quantity}</span>
            <span className="text-gray-800 font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-xs text-gray-400">... và {items.length - 3} món nữa</p>
        )}
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200 my-2" />
      
      {/* Totals */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Phí ship</span>
          <span className={shippingFee === 0 ? 'text-green-600' : ''}>
            {shippingFee === 0 ? 'Miễn phí 🎉' : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-[#7CB342]">
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      
      {/* Customer Info (if available) */}
      {customerInfo && (
        <>
          <div className="border-t border-gray-200 my-2" />
          <div className="space-y-1 text-sm">
            {customerInfo.name && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{customerInfo.name}</span>
              </div>
            )}
            {customerInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{customerInfo.phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <span className="text-xs">{address}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Success animation
 */
function OrderSuccessAnimation({ orderNumber }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3"
      >
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-green-600 mb-1">Đặt hàng thành công!</h3>
        <p className="text-sm text-gray-600">Mã đơn: <span className="font-bold">{orderNumber}</span></p>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500"
      >
        <Truck className="w-4 h-4" />
        <span>Giao hàng trong 1-2 ngày</span>
      </motion.div>
    </motion.div>
  );
}

// ========== MAIN COMPONENT ==========

/**
 * Checkout Step Renderer
 * Renders based on checkoutStep prop in message
 */
function CheckoutStepRenderer({ message, onAction }) {
  const { checkoutStep, orderPreview, orderNumber, orderId } = message;
  
  // If success step
  if (checkoutStep === 'success' && orderNumber) {
    return (
      <div className="space-y-3">
        <OrderSuccessAnimation orderNumber={orderNumber} />
        
        <div className="flex gap-2">
          <button
            onClick={() => onAction?.({ type: 'view_order', orderId })}
            className="flex-1 py-2 bg-[#7CB342] text-white text-sm rounded-lg font-medium hover:bg-[#5a8f31] transition-colors flex items-center justify-center gap-1"
          >
            <Package className="w-4 h-4" />
            Xem đơn hàng
          </button>
          <button
            onClick={() => onAction?.({ type: 'send_prompt', prompt: 'Tìm sản phẩm' })}
            className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mua thêm
          </button>
        </div>
      </div>
    );
  }
  
  // Normal checkout steps
  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {checkoutStep && checkoutStep !== 'idle' && (
        <CheckoutProgressBar currentStep={checkoutStep} />
      )}
      
      {/* Order Preview */}
      {orderPreview && (
        <OrderPreviewCard orderPreview={orderPreview} />
      )}
    </div>
  );
}

export default memo(CheckoutStepRenderer);
export { CheckoutProgressBar, OrderPreviewCard, OrderSuccessAnimation };