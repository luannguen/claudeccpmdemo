/**
 * UI Component: Register Customer Modal Enhanced
 * 
 * Features:
 * - Real-time validation & duplicate check
 * - Autocomplete địa chỉ VN
 * - Phone format auto
 * - Security checks
 * - Better UX
 * 
 * Architecture: UI Layer - presentation only
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCustomerRegistrationForm } from './hooks/useCustomerRegistrationForm';
import { VN_PROVINCES, VN_DISTRICTS, searchAddress } from './vnAddressData';
import { customerValidationService } from './services/customerValidationService';
import { useToast } from '@/components/NotificationToast';
import { cn } from '@/lib/utils';

function FormField({ 
  label, 
  icon: IconComponent, 
  required, 
  error, 
  touched,
  checking,
  success: isSuccess,
  children 
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-2">
        {IconComponent && <IconComponent size={14} className="text-gray-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
        {checking && <Icon.Spinner size={12} className="text-blue-500" />}
        {isSuccess && touched && !error && !checking && (
          <Icon.CheckCircle size={12} className="text-green-500" />
        )}
      </Label>
      {children}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <Icon.AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function AddressAutocomplete({ value, onChange, onBlur, placeholder, suggestions, onSelect, error, touched }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false);
            onBlur?.();
          }, 200);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={cn(
          error && touched ? 'border-red-400' : '',
          !error && touched && value ? 'border-green-400' : ''
        )}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onSelect(item.name);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterCustomerModalEnhanced({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  const { addToast } = useToast();
  
  const {
    formData,
    errors,
    touched,
    checkingPhone,
    checkingEmail,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setErrors
  } = useCustomerRegistrationForm({});
  
  const [provinceSuggestions, setProvinceSuggestions] = useState([]);
  const [districtSuggestions, setDistrictSuggestions] = useState([]);
  const [wardSuggestions, setWardSuggestions] = useState([]);
  
  // District options based on selected province
  const districtOptions = useMemo(() => {
    if (!formData.province) return [];
    const provinceCode = VN_PROVINCES.find(p => p.name === formData.province)?.code;
    return VN_DISTRICTS[provinceCode] || [];
  }, [formData.province]);
  
  const handleProvinceSearch = (query) => {
    handleChange('province', query);
    if (query.length >= 2) {
      const results = searchAddress(query, 'province');
      setProvinceSuggestions(results);
    } else {
      setProvinceSuggestions([]);
    }
  };
  
  const handleDistrictSearch = (query) => {
    handleChange('district', query);
    if (query.length >= 2) {
      const results = searchAddress(query, 'district');
      setDistrictSuggestions(results);
    } else {
      setDistrictSuggestions([]);
    }
  };
  
  const handleWardSearch = (query) => {
    handleChange('ward', query);
    if (query.length >= 2) {
      const results = searchAddress(query, 'ward');
      setWardSuggestions(results);
    } else {
      setWardSuggestions([]);
    }
  };
  
  const handlePhoneChange = (value) => {
    // Auto-format phone while typing
    const cleaned = value.replace(/[^0-9+]/g, '');
    handleChange('phone', cleaned);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      addToast('Vui lòng điền đầy đủ thông tin hợp lệ', 'warning');
      return;
    }
    
    // Final duplicate checks
    const phoneCheck = await customerValidationService.checkPhoneDuplicate(formData.phone);
    if (!phoneCheck.success) {
      setErrors(prev => ({ ...prev, phone: phoneCheck.message }));
      addToast(phoneCheck.message, 'error');
      return;
    }
    
    if (formData.email) {
      const emailCheck = await customerValidationService.checkEmailDuplicate(formData.email);
      if (!emailCheck.success) {
        setErrors(prev => ({ ...prev, email: emailCheck.message }));
        addToast(emailCheck.message, 'error');
        return;
      }
    }
    
    // Fraud detection
    const fraudCheck = await customerValidationService.detectFraudPatterns(formData);
    if (fraudCheck.score > 20) {
      addToast('Thông tin có dấu hiệu bất thường, vui lòng kiểm tra lại', 'warning');
    }
    
    onSubmit({
      full_name: formData.name.trim(),
      phone: formData.phone.replace(/\s/g, ''),
      email: formData.email?.trim() || null,
      shipping_city: formData.province,
      shipping_district: formData.district,
      shipping_ward: formData.ward,
      shipping_address: formData.address_detail.trim(),
      note: formData.note?.trim() || null
    });
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };
  
  const formattedPhone = useMemo(() => 
    customerValidationService.formatPhoneDisplay(formData.phone),
    [formData.phone]
  );
  
  const hasErrors = Object.values(errors).some(e => e);
  const hasTouched = Object.values(touched).some(t => t);
  const isFormValid = !hasErrors && hasTouched && formData.name && formData.phone && formData.province && formData.district;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.UserPlus size={20} className="text-[#7CB342]" />
            Đăng Ký Khách Hàng Mới
          </DialogTitle>
          <DialogDescription>
            Nhập đầy đủ thông tin để đăng ký khách hàng vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-medium mb-1 flex items-center gap-1">
              <Icon.Info size={14} />
              Lưu ý quan trọng:
            </p>
            <ul className="space-y-1 ml-5 list-disc">
              <li>Số điện thoại là duy nhất, không thể trùng với KH đã tồn tại</li>
              <li>Khách hàng sẽ được gán vĩnh viễn cho bạn</li>
              <li>Mọi đơn hàng sau này sẽ tính hoa hồng cho bạn</li>
            </ul>
          </div>
          
          {/* Section: Thông Tin Nhân Hàng */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 border-b pb-2">
              <Icon.User size={16} />
              Thông Tin Nhân Hàng
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                label="Họ tên"
                icon={Icon.User}
                required
                error={errors.name}
                touched={touched.name}
                success={!errors.name}
              >
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Nguyễn Văn A"
                  className={cn(
                    errors.name && touched.name ? 'border-red-400' : '',
                    !errors.name && touched.name && formData.name ? 'border-green-400' : ''
                  )}
                  autoFocus
                />
              </FormField>
              
              {/* Email */}
              <FormField
                label="Email"
                icon={Icon.Mail}
                error={errors.email}
                touched={touched.email}
                checking={checkingEmail}
                success={!errors.email && formData.email}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="email@example.com (tùy chọn)"
                  className={cn(
                    errors.email && touched.email ? 'border-red-400' : '',
                    !errors.email && touched.email && formData.email ? 'border-green-400' : ''
                  )}
                />
              </FormField>
            </div>
            
            {/* Phone */}
            <FormField
              label="Số điện thoại"
              icon={Icon.Phone}
              required
              error={errors.phone}
              touched={touched.phone}
              checking={checkingPhone}
              success={!errors.phone}
            >
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="0987654321"
                className={cn(
                  errors.phone && touched.phone ? 'border-red-400' : '',
                  !errors.phone && touched.phone && formData.phone ? 'border-green-400' : ''
                )}
              />
              {formData.phone && !errors.phone && touched.phone && (
                <p className="text-xs text-gray-500 mt-1">
                  Format: {formattedPhone}
                </p>
              )}
            </FormField>
          </div>
          
          {/* Section: Địa Chỉ Giao Hàng */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 border-b pb-2">
              <Icon.MapPin size={16} />
              Địa Chỉ Giao Hàng
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Province */}
              <FormField
                label="Tỉnh/Thành phố"
                icon={Icon.Map}
                required
                error={errors.province}
                touched={touched.province}
              >
                <AddressAutocomplete
                  value={formData.province}
                  onChange={handleProvinceSearch}
                  onBlur={() => handleBlur('province')}
                  placeholder="Hồ Chí Minh, Hà Nội..."
                  suggestions={provinceSuggestions}
                  onSelect={(name) => {
                    handleChange('province', name);
                    setProvinceSuggestions([]);
                    handleChange('district', ''); // Reset district when province changes
                  }}
                  error={errors.province}
                  touched={touched.province}
                />
              </FormField>
              
              {/* District */}
              <FormField
                label="Quận/Huyện"
                icon={Icon.MapPin}
                required
                error={errors.district}
                touched={touched.district}
              >
                {districtOptions.length > 0 ? (
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => handleChange('district', value)}
                  >
                    <SelectTrigger className={cn(
                      errors.district && touched.district ? 'border-red-400' : '',
                      !errors.district && touched.district && formData.district ? 'border-green-400' : ''
                    )}>
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.filter(d => d && d.trim()).map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <AddressAutocomplete
                    value={formData.district}
                    onChange={handleDistrictSearch}
                    onBlur={() => handleBlur('district')}
                    placeholder="Quận 1, Cầu Giấy..."
                    suggestions={districtSuggestions}
                    onSelect={(name) => {
                      handleChange('district', name);
                      setDistrictSuggestions([]);
                    }}
                    error={errors.district}
                    touched={touched.district}
                  />
                )}
              </FormField>
            </div>
            
            {/* Ward */}
            <FormField
              label="Phường/Xã"
              icon={Icon.MapPin}
              required
              error={errors.ward}
              touched={touched.ward}
            >
              <AddressAutocomplete
                value={formData.ward}
                onChange={handleWardSearch}
                onBlur={() => handleBlur('ward')}
                placeholder="Phường Bến Nghé, Phường 1..."
                suggestions={wardSuggestions}
                onSelect={(name) => {
                  handleChange('ward', name);
                  setWardSuggestions([]);
                }}
                error={errors.ward}
                touched={touched.ward}
              />
            </FormField>
            
            {/* Detail */}
            <FormField
              label="Địa chỉ cụ thể"
              icon={Icon.Home}
              required
              error={errors.detail}
              touched={touched.detail}
            >
              <Input
                value={formData.address_detail}
                onChange={(e) => handleChange('address_detail', e.target.value)}
                onBlur={() => handleBlur('detail')}
                placeholder="Số 123, Đường ABC..."
                className={cn(
                  errors.detail && touched.detail ? 'border-red-400' : '',
                  !errors.detail && touched.detail && formData.address_detail ? 'border-green-400' : ''
                )}
              />
            </FormField>
          </div>
          
          {/* Note */}
          <FormField
            label="Ghi chú đơn hàng"
            icon={Icon.FileText}
            error={errors.note}
            touched={touched.note}
          >
            <Textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Giao giờ hành chính, gọi trước 15 phút..."
              rows={3}
              className="resize-none"
            />
          </FormField>
          
          {/* Security Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <p className="font-medium mb-1 flex items-center gap-1">
              <Icon.Shield size={14} />
              Bảo mật:
            </p>
            <p>Thông tin khách hàng được mã hóa và bảo vệ theo tiêu chuẩn an toàn.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid || checkingPhone || checkingEmail}
              className="flex-1 bg-[#7CB342] hover:bg-[#5a8f31]"
            >
              {isSubmitting ? (
                <>
                  <Icon.Spinner size={16} className="mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Icon.UserPlus size={16} className="mr-2" />
                  Đăng ký khách hàng
                </>
              )}
            </Button>
          </div>
          
          {/* Form Progress Indicator */}
          {hasTouched && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${(Object.keys(touched).filter(k => !errors[k]).length / 7) * 100}%` 
                  }}
                />
              </div>
              <span>
                {Object.keys(touched).filter(k => !errors[k]).length}/7 hợp lệ
              </span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}