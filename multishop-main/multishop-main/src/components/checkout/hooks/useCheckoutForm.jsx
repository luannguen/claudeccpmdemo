/**
 * useCheckoutForm Hook
 * Feature Logic Layer
 * 
 * Single Goal: Quản lý form checkout với validation real-time
 */

import { useState, useCallback, useEffect } from 'react';
import { customerValidationService } from '@/components/referral/services/customerValidationService';
import { useDebouncedValue } from '@/components/shared/utils/debounce';
import { useToast } from '@/components/NotificationToast';
import { useProfileWithCustomer } from '@/components/hooks/useCustomerSync';

export function useCheckoutForm({ initialData = {}, existingCustomer, userEmail }) {
  const { addToast } = useToast();
  
  // Get merged profile with Customer data
  const { data: mergedProfile } = useProfileWithCustomer(userEmail);
  
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    city: initialData.city || '',
    district: initialData.district || '',
    ward: initialData.ward || '',
    address: initialData.address || '',
    note: initialData.note || ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const debouncedPhone = useDebouncedValue(formData.phone, 500);
  const debouncedEmail = useDebouncedValue(formData.email, 500);
  
  // Load from merged profile (User.preferences > Customer > existingCustomer)
  useEffect(() => {
    if (mergedProfile?.shipping) {
      const { shipping } = mergedProfile;
      setFormData({
        name: shipping.full_name || initialData.name || '',
        email: shipping.email || initialData.email || '',
        phone: shipping.phone || '',
        city: shipping.city || '',
        district: shipping.district || '',
        ward: shipping.ward || '',
        address: shipping.address || '',
        note: ''
      });
    } else if (existingCustomer) {
      setFormData({
        name: existingCustomer.full_name || '',
        email: existingCustomer.email || '',
        phone: existingCustomer.phone || '',
        city: existingCustomer.city || '',
        district: existingCustomer.district || '',
        ward: existingCustomer.ward || '',
        address: existingCustomer.address || '',
        note: ''
      });
    }
  }, [mergedProfile, existingCustomer?.id]);
  
  // Real-time phone validation
  useEffect(() => {
    if (!debouncedPhone || !touched.phone) return;
    
    const checkPhone = async () => {
      setCheckingPhone(true);
      
      const formatResult = customerValidationService.validatePhone(debouncedPhone);
      if (!formatResult.success) {
        setErrors(prev => ({ ...prev, phone: formatResult.message }));
      } else {
        setErrors(prev => ({ ...prev, phone: null }));
      }
      
      setCheckingPhone(false);
    };
    
    checkPhone();
  }, [debouncedPhone, touched.phone]);
  
  // Real-time email validation
  useEffect(() => {
    if (!debouncedEmail || !touched.email) return;
    
    const checkEmail = async () => {
      setCheckingEmail(true);
      
      const formatResult = customerValidationService.validateEmail(debouncedEmail);
      if (!formatResult.success) {
        setErrors(prev => ({ ...prev, email: formatResult.message }));
      } else {
        setErrors(prev => ({ ...prev, email: null }));
      }
      
      setCheckingEmail(false);
    };
    
    checkEmail();
  }, [debouncedEmail, touched.email]);
  
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const validateAll = useCallback(() => {
    const newErrors = {};
    
    // Name
    const nameResult = customerValidationService.validateName(formData.name);
    if (!nameResult.success) newErrors.name = nameResult.message;
    
    // Phone
    const phoneResult = customerValidationService.validatePhone(formData.phone);
    if (!phoneResult.success) newErrors.phone = phoneResult.message;
    
    // Email
    const emailResult = customerValidationService.validateEmail(formData.email);
    if (!emailResult.success) newErrors.email = emailResult.message;
    
    // Address
    const addressResult = customerValidationService.validateAddress(
      formData.city,
      formData.district,
      formData.ward,
      formData.address
    );
    if (!addressResult.success) {
      Object.assign(newErrors, addressResult.data || {
        city: 'Vui lòng chọn tỉnh/thành phố',
        district: 'Vui lòng chọn quận/huyện',
        address: 'Vui lòng nhập địa chỉ cụ thể'
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  const reset = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      district: '',
      ward: '',
      address: '',
      note: ''
    });
    setErrors({});
    setTouched({});
  }, []);
  
  const hasErrors = Object.values(errors).some(e => e);
  const hasTouched = Object.keys(touched).length > 0;
  const requiredFieldsFilled = formData.name && formData.email && formData.phone && 
                                formData.city && formData.district && formData.address;
  
  return {
    formData,
    errors,
    touched,
    checkingPhone,
    checkingEmail,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setErrors,
    isValid: !hasErrors && hasTouched && requiredFieldsFilled,
    completionRate: hasTouched ? (Object.keys(touched).filter(k => !errors[k] && formData[k]).length / 7) * 100 : 0
  };
}