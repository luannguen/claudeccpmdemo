/**
 * useCheckoutForm - Form validation hook
 * Hooks Layer - Single Goal: Customer form state & validation
 * 
 * @module features/checkout/hooks/useCheckoutForm
 */

import { useState, useCallback, useEffect } from 'react';
import { validators } from '../domain';
import { useDebouncedValue } from '@/components/shared/utils/debounce';

/**
 * Manage checkout customer form
 * @param {Object} options
 * @param {Object} [options.initialData] - Initial form values
 * @param {Object} [options.existingCustomer] - Existing customer data
 * @param {Object} [options.mergedProfile] - Merged profile from useProfileWithCustomer
 * @returns {Object} Form state and handlers
 */
export function useCheckoutForm({ initialData = {}, existingCustomer, mergedProfile } = {}) {
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
  
  // Load from merged profile or existing customer
  useEffect(() => {
    if (mergedProfile?.shipping) {
      const { shipping } = mergedProfile;
      setFormData(prev => ({
        ...prev,
        name: shipping.full_name || prev.name,
        email: shipping.email || prev.email,
        phone: shipping.phone || prev.phone,
        city: shipping.city || prev.city,
        district: shipping.district || prev.district,
        ward: shipping.ward || prev.ward,
        address: shipping.address || prev.address
      }));
    } else if (existingCustomer) {
      setFormData(prev => ({
        ...prev,
        name: existingCustomer.full_name || prev.name,
        email: existingCustomer.email || prev.email,
        phone: existingCustomer.phone || prev.phone,
        city: existingCustomer.city || prev.city,
        district: existingCustomer.district || prev.district,
        ward: existingCustomer.ward || prev.ward,
        address: existingCustomer.address || prev.address
      }));
    }
  }, [mergedProfile, existingCustomer?.id]);
  
  // Real-time phone validation
  useEffect(() => {
    if (!debouncedPhone || !touched.phone) return;
    
    setCheckingPhone(true);
    if (!/^[0-9]{10,11}$/.test(debouncedPhone.replace(/\s/g, ''))) {
      setErrors(prev => ({ ...prev, phone: 'Số điện thoại không hợp lệ' }));
    } else {
      setErrors(prev => ({ ...prev, phone: null }));
    }
    setCheckingPhone(false);
  }, [debouncedPhone, touched.phone]);
  
  // Real-time email validation
  useEffect(() => {
    if (!debouncedEmail || !touched.email) return;
    
    setCheckingEmail(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
    setCheckingEmail(false);
  }, [debouncedEmail, touched.email]);
  
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const validateAll = useCallback(() => {
    const validationErrors = validators.validateCustomerInfo(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
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
  
  // Computed values
  const hasErrors = Object.values(errors).some(e => e);
  const requiredFieldsFilled = !!(
    formData.name?.trim() && 
    formData.email?.trim() && 
    formData.phone?.trim() && 
    formData.city?.trim() && 
    formData.district?.trim() && 
    formData.address?.trim()
  );
  
  // Count filled required fields (note is optional)
  const requiredFields = ['name', 'email', 'phone', 'city', 'district', 'address'];
  const filledCount = requiredFields.filter(k => formData[k]?.trim()).length;
  const completionRate = (filledCount / requiredFields.length) * 100;
  
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
    isValid: !hasErrors && requiredFieldsFilled,
    isComplete: validators.isCustomerInfoComplete(formData),
    completionRate
  };
}

export default useCheckoutForm;