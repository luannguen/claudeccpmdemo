/**
 * CheckoutCustomerFormEnhanced
 * UI Layer - Presentation only
 * 
 * Features:
 * - Real-time validation
 * - Address autocomplete
 * - Phone format
 * - Visual feedback
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { VN_PROVINCES, VN_DISTRICTS, searchAddress } from '@/components/referral/vnAddressData';
import { customerValidationService } from '@/components/referral/services/customerValidationService';
import { cn } from '@/lib/utils';

function FormField({ 
  label, 
  icon: IconComponent, 
  required, 
  error, 
  touched,
  checking,
  success,
  hint,
  children 
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-1.5 text-xs">
        {IconComponent && <IconComponent size={13} className="text-gray-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
        {checking && <Icon.Spinner size={11} className="text-blue-500" />}
        {success && touched && !error && !checking && (
          <Icon.CheckCircle size={11} className="text-green-500" />
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <Icon.AlertCircle size={11} />
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
          'text-sm',
          error && touched ? 'border-red-400' : '',
          !error && touched && value ? 'border-green-400' : ''
        )}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onSelect(item.name);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CheckoutCustomerFormEnhanced({ 
  formData,
  errors,
  touched,
  checkingPhone,
  checkingEmail,
  handleChange,
  handleBlur,
  completionRate,
  currentUser,
  saveInfo,
  setSaveInfo
}) {
  const [provinceSuggestions, setProvinceSuggestions] = useState([]);
  const [districtSuggestions, setDistrictSuggestions] = useState([]);
  const [wardSuggestions, setWardSuggestions] = useState([]);
  
  // District options based on selected city
  const districtOptions = useMemo(() => {
    if (!formData.city) return [];
    const provinceCode = VN_PROVINCES.find(p => p.name === formData.city)?.code;
    return VN_DISTRICTS[provinceCode] || [];
  }, [formData.city]);
  
  const handleProvinceSearch = (query) => {
    handleChange('city', query);
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
    const cleaned = value.replace(/[^0-9+]/g, '');
    handleChange('phone', cleaned);
  };
  
  const formattedPhone = useMemo(() => 
    customerValidationService.formatPhoneDisplay(formData.phone),
    [formData.phone]
  );
  
  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <Icon.User size={16} className="text-[#7CB342]" />
        Thông Tin Nhận Hàng
      </h3>
      
      <div className="space-y-3">
        {/* Progress Indicator */}
        {completionRate > 0 && (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <Progress value={completionRate} className="flex-1 h-1.5" />
              <span className="text-xs text-gray-600 font-medium">
                {Math.round(completionRate)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Độ hoàn thiện thông tin</p>
          </div>
        )}
        
        {/* Row 1: Name + Email */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Họ tên"
            icon={Icon.User}
            required
            error={errors.name}
            touched={touched.name}
            success={!errors.name && formData.name}
          >
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Nguyễn Văn A"
              className={cn(
                'text-sm',
                errors.name && touched.name ? 'border-red-400' : '',
                !errors.name && touched.name && formData.name ? 'border-green-400' : ''
              )}
            />
          </FormField>
          
          <FormField
            label="Email"
            icon={Icon.Mail}
            required
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
              placeholder="email@example.com"
              disabled={!!currentUser}
              className={cn(
                'text-sm',
                errors.email && touched.email ? 'border-red-400' : '',
                !errors.email && touched.email && formData.email ? 'border-green-400' : '',
                currentUser ? 'bg-gray-50' : ''
              )}
            />
          </FormField>
        </div>

        {/* Row 2: Phone */}
        <FormField
          label="Số điện thoại"
          icon={Icon.Phone}
          required
          error={errors.phone}
          touched={touched.phone}
          checking={checkingPhone}
          success={!errors.phone && formData.phone}
          hint={formData.phone && !errors.phone && touched.phone ? `Format: ${formattedPhone}` : null}
        >
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="0987654321"
            maxLength={11}
            className={cn(
              'text-sm',
              errors.phone && touched.phone ? 'border-red-400' : '',
              !errors.phone && touched.phone && formData.phone ? 'border-green-400' : ''
            )}
          />
        </FormField>
        
        {/* Row 3: City + District */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Tỉnh/Thành phố"
            icon={Icon.MapPin}
            required
            error={errors.city}
            touched={touched.city}
            success={!errors.city && formData.city}
          >
            <AddressAutocomplete
              value={formData.city}
              onChange={handleProvinceSearch}
              onBlur={() => handleBlur('city')}
              placeholder="Hồ Chí Minh, Hà Nội..."
              suggestions={provinceSuggestions}
              onSelect={(name) => {
                handleChange('city', name);
                setProvinceSuggestions([]);
                handleChange('district', '');
                handleChange('ward', '');
              }}
              error={errors.city}
              touched={touched.city}
            />
          </FormField>
          
          <FormField
            label="Quận/Huyện"
            icon={Icon.Map}
            required
            error={errors.district}
            touched={touched.district}
            success={!errors.district && formData.district}
          >
            {districtOptions.length > 0 ? (
              <Select 
                value={formData.district} 
                onValueChange={(value) => handleChange('district', value)}
              >
                <SelectTrigger className={cn(
                  'text-sm',
                  errors.district && touched.district ? 'border-red-400' : '',
                  !errors.district && touched.district && formData.district ? 'border-green-400' : ''
                )}>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper" sideOffset={4}>
                  {districtOptions.map(d => (
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

        {/* Row 4: Ward */}
        <FormField
          label="Phường/Xã"
          icon={Icon.MapPin}
          error={errors.ward}
          touched={touched.ward}
          success={!errors.ward && formData.ward}
        >
          <AddressAutocomplete
            value={formData.ward}
            onChange={handleWardSearch}
            onBlur={() => handleBlur('ward')}
            placeholder="Phường Bến Nghé... (tùy chọn)"
            suggestions={wardSuggestions}
            onSelect={(name) => {
              handleChange('ward', name);
              setWardSuggestions([]);
            }}
            error={errors.ward}
            touched={touched.ward}
          />
        </FormField>

        {/* Row 5: Address */}
        <FormField
          label="Địa chỉ cụ thể"
          icon={Icon.Home}
          required
          error={errors.address}
          touched={touched.address}
          success={!errors.address && formData.address}
          hint="Số nhà, tên đường, toà nhà..."
        >
          <Input
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="Số 123, Đường ABC"
            className={cn(
              'text-sm',
              errors.address && touched.address ? 'border-red-400' : '',
              !errors.address && touched.address && formData.address ? 'border-green-400' : ''
            )}
          />
        </FormField>

        {/* Row 6: Note */}
        <div>
          <Label className="flex items-center gap-1.5 mb-1.5 text-xs">
            <Icon.FileText size={13} className="text-gray-500" />
            Ghi chú đơn hàng
          </Label>
          <Textarea
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            rows={2}
            className="resize-none text-sm"
            placeholder="Giao giờ hành chính, gọi trước 15 phút..."
          />
        </div>

        {/* Save Info Checkbox */}
        {currentUser && (
          <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]" 
            />
            <Icon.Save size={14} className="text-gray-500" />
            <span className="text-gray-700">Lưu thông tin cho lần sau</span>
          </label>
        )}
        
        {/* Security Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 text-xs text-green-700">
          <Icon.ShieldCheck size={14} />
          <span>Thông tin được mã hóa và bảo mật</span>
        </div>
      </div>
    </div>
  );
}