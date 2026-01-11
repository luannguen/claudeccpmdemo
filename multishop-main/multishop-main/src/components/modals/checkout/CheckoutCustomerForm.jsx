import React, { useState, useEffect } from 'react';
import { User, Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import ReferralService from '@/components/services/ReferralService';

export default function CheckoutCustomerForm({ 
  customerInfo, 
  setCustomerInfo, 
  errors, 
  currentUser,
  saveInfo,
  setSaveInfo 
}) {
  const [referralCode, setReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const handleChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  // Auto-check referral code from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      validateReferralCode(refParam);
    }
  }, []);

  // Validate referral code
  const validateReferralCode = async (code) => {
    if (!code || code.length < 4) {
      setReferralValidation(null);
      setCustomerInfo(prev => ({ ...prev, referral_code: null }));
      return;
    }

    setIsValidating(true);
    try {
      const result = await ReferralService.validateReferralCode(code);
      
      if (result.valid) {
        // Check self-referral
        if (customerInfo.email && result.referrer.user_email === customerInfo.email) {
          setReferralValidation({ 
            valid: false, 
            error: 'Không thể dùng mã của chính mình' 
          });
          setCustomerInfo(prev => ({ ...prev, referral_code: null }));
        } else {
          setReferralValidation({ 
            valid: true, 
            referrerName: result.referrer.full_name 
          });
          setCustomerInfo(prev => ({ ...prev, referral_code: code.toUpperCase() }));
        }
      } else {
        setReferralValidation({ valid: false, error: result.error });
        setCustomerInfo(prev => ({ ...prev, referral_code: null }));
      }
    } catch (err) {
      console.error('Referral validation error:', err);
      setReferralValidation({ valid: false, error: 'Lỗi kiểm tra mã' });
      setCustomerInfo(prev => ({ ...prev, referral_code: null }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleReferralCodeChange = (value) => {
    setReferralCode(value.toUpperCase());
    if (value.length >= 4) {
      validateReferralCode(value);
    } else {
      setReferralValidation(null);
      setCustomerInfo(prev => ({ ...prev, referral_code: null }));
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-[#7CB342]" />
        Thông Tin Nhận Hàng
      </h3>
      
      <div className="space-y-3">
        {/* Row 1: Name + Email */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Họ tên"
            value={customerInfo.name}
            onChange={(v) => handleChange('name', v)}
            error={errors.name}
            placeholder="Nguyễn Văn A"
            required
          />
          <FormField
            label="Email"
            type="email"
            value={customerInfo.email}
            onChange={(v) => handleChange('email', v)}
            error={errors.email}
            placeholder="email@example.com"
            disabled={!!currentUser}
            required
          />
        </div>

        {/* Row 2: Phone + City */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Số điện thoại"
            type="tel"
            value={customerInfo.phone}
            onChange={(v) => handleChange('phone', v)}
            error={errors.phone}
            placeholder="0987654321"
            required
          />
          <FormField
            label="Tỉnh/Thành phố"
            value={customerInfo.city}
            onChange={(v) => handleChange('city', v)}
            error={errors.city}
            placeholder="TP. Hồ Chí Minh"
            required
          />
        </div>

        {/* Row 3: District + Ward */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Quận/Huyện"
            value={customerInfo.district}
            onChange={(v) => handleChange('district', v)}
            error={errors.district}
            placeholder="Quận 1"
            required
          />
          <FormField
            label="Phường/Xã"
            value={customerInfo.ward}
            onChange={(v) => handleChange('ward', v)}
            placeholder="Phường Bến Nghé"
          />
        </div>

        {/* Row 4: Address */}
        <FormField
          label="Địa chỉ cụ thể"
          value={customerInfo.address}
          onChange={(v) => handleChange('address', v)}
          error={errors.address}
          placeholder="Số 123, Đường ABC"
          required
        />

        {/* Row 5: Note */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Ghi chú đơn hàng</label>
          <textarea 
            value={customerInfo.note}
            onChange={(e) => handleChange('note', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] resize-none"
            placeholder="Giao giờ hành chính, gọi trước 15 phút..." 
          />
        </div>

        {/* Referral Code */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <label className="text-xs font-medium text-gray-700">
              Mã Giới Thiệu (Tùy chọn)
            </label>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-amber-300 rounded-lg 
                         focus:outline-none focus:border-amber-500 uppercase tracking-wider
                         font-medium"
                placeholder="VD: ABC1234"
                maxLength={10}
              />
              {/* Validation Icon */}
              {isValidating && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
              {!isValidating && referralValidation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {referralValidation.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Validation Message */}
          {referralValidation && !isValidating && (
            <p className={`text-xs mt-1.5 ${referralValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
              {referralValidation.valid 
                ? `✓ Được giới thiệu bởi: ${referralValidation.referrerName}`
                : `✗ ${referralValidation.error}`
              }
            </p>
          )}
          {!referralCode && (
            <p className="text-xs text-gray-500 mt-1.5">
              Nhập mã giới thiệu để người giới thiệu nhận hoa hồng
            </p>
          )}
        </div>

        {/* Save Info Checkbox */}
        {currentUser && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]" 
            />
            <span className="text-gray-700">Lưu thông tin cho lần sau</span>
          </label>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, error, placeholder, type = 'text', required, disabled }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        {label} {required && '*'}
      </label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:border-[#7CB342] ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${disabled ? 'bg-gray-50' : ''}`}
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}