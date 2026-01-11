/**
 * QuickBuyModal - Mua nhanh 1-2 bước
 * - Auto-fill từ user profile nếu đăng nhập
 * - Option lưu thông tin vào profile
 * - COD/QR chuyển khoản
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/NotificationToast";
import { useQuery } from "@tanstack/react-query";
import { ReferralBadgeWithTooltip, ReferralInfoIcon } from "./ReferralTooltip";

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: 'Banknote' },
  { id: 'bank_transfer', label: 'Chuyển khoản QR', icon: 'QrCode' }
];

export default function QuickBuyModal({ product, referrerProfile, themeColor = '#7CB342', onClose }) {
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: Info, 2: Confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  
  // Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ['quick-buy-current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    retry: false
  });

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    payment_method: 'cod',
    quantity: 1
  });

  // Auto-fill form từ user profile khi load
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customer_name: currentUser.full_name || prev.customer_name,
        customer_phone: currentUser.phone || prev.customer_phone,
        shipping_address: currentUser.preferences?.shipping_address || prev.shipping_address
      }));
    }
  }, [currentUser]);

  const unitPrice = product.sale_price || product.price;
  const totalAmount = unitPrice * formData.quantity;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.customer_name.trim()) {
      addToast('Vui lòng nhập họ tên', 'warning');
      return false;
    }
    if (!formData.customer_phone.trim() || !/^0\d{9}$/.test(formData.customer_phone)) {
      addToast('Số điện thoại không hợp lệ', 'warning');
      return false;
    }
    if (!formData.shipping_address.trim()) {
      addToast('Vui lòng nhập địa chỉ nhận hàng', 'warning');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Lưu thông tin vào profile nếu user đăng nhập và check "Ghi nhớ"
      if (saveToProfile && currentUser) {
        const updates = {};
        if (formData.customer_phone && formData.customer_phone !== currentUser.phone) {
          updates.phone = formData.customer_phone;
        }
        if (formData.shipping_address) {
          updates.preferences = {
            ...(currentUser.preferences || {}),
            shipping_address: formData.shipping_address
          };
        }
        if (Object.keys(updates).length > 0) {
          await base44.auth.updateMe(updates);
        }
      }

      // Tra cứu ReferralMember từ user_id của referrerProfile
      let referralData = {};
      if (referrerProfile?.user_id) {
        const referrers = await base44.entities.ReferralMember.filter({
          user_id: referrerProfile.user_id,
          status: 'active'
        });
        
        if (referrers.length > 0) {
          const referrer = referrers[0];
          referralData = {
            referrer_id: referrer.id,
            referral_code_applied: referrer.referral_code
          };
        }
      }

      // Tạo order
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: currentUser?.email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
        items: [{
          product_id: product.id,
          product_name: product.name,
          quantity: formData.quantity,
          unit_price: unitPrice,
          subtotal: totalAmount,
          image_url: product.image_url
        }],
        subtotal: totalAmount,
        total_amount: totalAmount,
        order_status: 'pending',
        payment_status: 'pending',
        note: `Đặt qua E-Card của ${referrerProfile?.display_name || 'người dùng'}`,
        ...referralData
      };

      const newOrder = await base44.entities.Order.create(orderData);
      
      // Trigger referral processing nếu có referral
      if (referralData.referrer_id && currentUser?.email) {
        try {
          const { processReferralAfterOrder } = await import('@/components/services/orderReferralBridge');
          await processReferralAfterOrder(newOrder, currentUser.email, referralData.referral_code_applied);
        } catch (err) {
          console.error('Referral processing error:', err);
        }
      }
      
      setOrderSuccess(true);
      addToast('Đặt hàng thành công!', 'success');
      
    } catch (err) {
      addToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {orderSuccess ? 'Đặt hàng thành công' : 'Mua nhanh'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <Icon.X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {orderSuccess ? (
              <SuccessView 
                key="success"
                product={product}
                totalAmount={totalAmount}
                formData={formData}
                onClose={onClose}
                themeColor={themeColor}
              />
            ) : step === 1 ? (
              <Step1Form
                key="step1"
                product={product}
                formData={formData}
                onChange={handleChange}
                totalAmount={totalAmount}
                themeColor={themeColor}
                currentUser={currentUser}
                saveToProfile={saveToProfile}
                onSaveToProfileChange={setSaveToProfile}
              />
            ) : (
              <Step2Confirm
                key="step2"
                product={product}
                formData={formData}
                totalAmount={totalAmount}
                referrerProfile={referrerProfile}
                themeColor={themeColor}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {!orderSuccess && (
          <div className="p-4 border-t bg-gray-50">
            {step === 1 ? (
              <Button
                onClick={handleNext}
                className="w-full py-3 text-white font-medium"
                style={{ backgroundColor: themeColor }}
              >
                Tiếp tục
                <Icon.ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <Icon.ChevronLeft size={18} className="mr-1" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 text-white font-medium"
                  style={{ backgroundColor: themeColor }}
                >
                  {isSubmitting ? (
                    <>
                      <Icon.Spinner size={18} className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Icon.Check size={18} className="mr-1" />
                      Xác nhận đặt hàng
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Step1Form({ product, formData, onChange, totalAmount, themeColor, currentUser, saveToProfile, onSaveToProfileChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Product Summary */}
      <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <Icon.Package size={24} className="text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h4>
          <p className="font-bold mt-1" style={{ color: themeColor }}>
            {(product.sale_price || product.price).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Logged in indicator */}
      {currentUser && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <Icon.UserCheck size={16} className="text-green-600" />
          <span className="text-sm text-green-700">
            Đăng nhập: <strong>{currentUser.full_name || currentUser.email}</strong>
          </span>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Số lượng</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange('quantity', Math.max(1, formData.quantity - 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <Icon.Minus size={16} />
          </button>
          <span className="w-12 text-center font-medium">{formData.quantity}</span>
          <button
            onClick={() => onChange('quantity', Math.min(10, formData.quantity + 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <Icon.Plus size={16} />
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Họ tên *</label>
          <Input
            value={formData.customer_name}
            onChange={(e) => onChange('customer_name', e.target.value)}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại *</label>
          <Input
            value={formData.customer_phone}
            onChange={(e) => onChange('customer_phone', e.target.value)}
            placeholder="0912345678"
            type="tel"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Địa chỉ nhận hàng *</label>
          <Input
            value={formData.shipping_address}
            onChange={(e) => onChange('shipping_address', e.target.value)}
            placeholder="Số nhà, đường, phường, quận, thành phố"
          />
        </div>
      </div>

      {/* Save to profile checkbox */}
      {currentUser && (
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="save-profile"
            checked={saveToProfile}
            onCheckedChange={onSaveToProfileChange}
          />
          <label htmlFor="save-profile" className="text-sm text-gray-600 cursor-pointer">
            Ghi nhớ thông tin cho lần sau
          </label>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Thanh toán</label>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => {
            const MethodIcon = Icon[method.icon];
            const isSelected = formData.payment_method === method.id;
            return (
              <button
                key={method.id}
                onClick={() => onChange('payment_method', method.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-current bg-opacity-10' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : {}}
              >
                <MethodIcon size={20} style={{ color: isSelected ? themeColor : '#6B7280' }} />
                <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-700'}`}
                  style={isSelected ? { color: themeColor } : {}}>
                  {method.label}
                </span>
                {isSelected && <Icon.Check size={18} className="ml-auto" style={{ color: themeColor }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <span className="text-gray-600">Tổng thanh toán</span>
        <span className="text-xl font-bold" style={{ color: themeColor }}>
          {totalAmount.toLocaleString('vi-VN')}đ
        </span>
      </div>
    </motion.div>
  );
}

function Step2Confirm({ product, formData, totalAmount, referrerProfile, themeColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <Icon.ShoppingBag size={32} style={{ color: themeColor }} />
        </div>
        <h4 className="font-semibold text-gray-900">Xác nhận đơn hàng</h4>
        <p className="text-sm text-gray-500">Vui lòng kiểm tra thông tin trước khi đặt hàng</p>
      </div>

      {/* Order Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Sản phẩm</span>
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Số lượng</span>
          <span className="font-medium text-gray-900">{formData.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Đơn giá</span>
          <span className="font-medium text-gray-900">
            {(product.sale_price || product.price).toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="font-medium text-gray-900">Tổng cộng</span>
          <span className="font-bold" style={{ color: themeColor }}>
            {totalAmount.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Customer Info Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex gap-2">
          <Icon.User size={16} className="text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-700">{formData.customer_name}</span>
        </div>
        <div className="flex gap-2">
          <Icon.Phone size={16} className="text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-700">{formData.customer_phone}</span>
        </div>
        <div className="flex gap-2">
          <Icon.MapPin size={16} className="text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-700">{formData.shipping_address}</span>
        </div>
        <div className="flex gap-2">
          <Icon.Banknote size={16} className="text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-700">
            {formData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản QR'}
          </span>
        </div>
      </div>

      {/* Referral Note với Transparency Tooltip - ECARD-F20 */}
      {referrerProfile && (
        <div className="flex justify-center">
          <ReferralBadgeWithTooltip
            referrerName={referrerProfile.display_name}
            themeColor={themeColor}
            variant="subtle"
          />
        </div>
      )}
    </motion.div>
  );
}

function SuccessView({ product, totalAmount, formData, onClose, themeColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${themeColor}15` }}
      >
        <Icon.CheckCircle size={48} style={{ color: themeColor }} />
      </div>
      
      <h4 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h4>
      <p className="text-gray-600 mb-6">
        Chúng tôi sẽ liên hệ qua số {formData.customer_phone} để xác nhận đơn hàng.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Sản phẩm</span>
          <span className="font-medium">{product.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Số lượng</span>
          <span className="font-medium">{formData.quantity}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-medium">Tổng thanh toán</span>
          <span className="font-bold" style={{ color: themeColor }}>
            {totalAmount.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <Button
        onClick={onClose}
        className="w-full py-3 text-white font-medium"
        style={{ backgroundColor: themeColor }}
      >
        Đóng
      </Button>
    </motion.div>
  );
}