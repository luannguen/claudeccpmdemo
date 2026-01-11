/**
 * useCustomerRegistrationForm Hook
 * Feature Logic Layer
 * 
 * Single Goal: Quản lý form đăng ký KH với validation & duplicate check
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import { customerValidationService } from '../services/customerValidationService';
import { useDebouncedValue } from '@/components/shared/utils/debounce';

export function useCustomerRegistrationForm({ onSuccess, referrerId }) {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address_detail: '',
    note: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const debouncedPhone = useDebouncedValue(formData.phone, 500);
  const debouncedEmail = useDebouncedValue(formData.email, 500);
  
  // Real-time phone validation & duplicate check
  useEffect(() => {
    if (!debouncedPhone || !touched.phone) return;
    
    const checkPhone = async () => {
      setCheckingPhone(true);
      
      // Format validation
      const formatResult = customerValidationService.validatePhone(debouncedPhone);
      if (!formatResult.success) {
        setErrors(prev => ({ ...prev, phone: formatResult.message }));
        setCheckingPhone(false);
        return;
      }
      
      // Duplicate check
      const dupResult = await customerValidationService.checkPhoneDuplicate(formatResult.data);
      if (!dupResult.success) {
        setErrors(prev => ({ ...prev, phone: dupResult.message }));
      } else {
        setErrors(prev => ({ ...prev, phone: null }));
      }
      
      setCheckingPhone(false);
    };
    
    checkPhone();
  }, [debouncedPhone, touched.phone]);
  
  // Real-time email validation & duplicate check
  useEffect(() => {
    if (!debouncedEmail || !touched.email) return;
    
    const checkEmail = async () => {
      setCheckingEmail(true);
      
      // Format validation
      const formatResult = customerValidationService.validateEmail(debouncedEmail);
      if (!formatResult.success) {
        setErrors(prev => ({ ...prev, email: formatResult.message }));
        setCheckingEmail(false);
        return;
      }
      
      // Duplicate check (only if email provided)
      if (formatResult.data) {
        const dupResult = await customerValidationService.checkEmailDuplicate(formatResult.data);
        if (!dupResult.success) {
          setErrors(prev => ({ ...prev, email: dupResult.message }));
        } else {
          setErrors(prev => ({ ...prev, email: null }));
        }
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
      formData.province,
      formData.district,
      formData.ward,
      formData.address_detail
    );
    if (!addressResult.success) {
      Object.assign(newErrors, addressResult.data || {});
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  const reset = useCallback(() => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      ward: '',
      address_detail: '',
      note: ''
    });
    setErrors({});
    setTouched({});
  }, []);
  
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
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
}