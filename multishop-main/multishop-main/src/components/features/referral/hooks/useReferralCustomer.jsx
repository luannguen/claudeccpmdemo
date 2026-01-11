/**
 * useReferralCustomer Hook
 * Hooks Layer - Customer registration and management
 * 
 * @module features/referral/hooks/useReferralCustomer
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { memberRepository, customerRepository, auditRepository } from '../data';
import { validatePhone, canRegisterCustomer } from '../domain';

/**
 * Register customer for a referrer (CTV đăng ký KH)
 */
export function useRegisterCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ referrerId, customerPhone, customerName, customerEmail }) => {
      // Validate phone
      const phoneValidation = validatePhone(customerPhone);
      if (!phoneValidation.valid) {
        throw new Error(phoneValidation.error);
      }
      const cleanPhone = phoneValidation.cleanPhone;
      
      // Get referrer
      const referrer = await memberRepository.getById(referrerId);
      if (!referrer || referrer.status !== 'active') {
        throw new Error('Tài khoản CTV không hợp lệ');
      }
      
      // Check existing customer by phone
      const existingByPhone = await customerRepository.getByPhone(cleanPhone);
      
      if (existingByPhone) {
        const check = canRegisterCustomer(existingByPhone, referrerId);
        if (!check.canRegister) {
          throw new Error(check.reason);
        }
        
        // Assign to referrer
        await customerRepository.assignReferrer(
          existingByPhone.id, 
          referrerId, 
          referrer.referral_code
        );
        
        // Update name/email if provided
        if (customerName || customerEmail) {
          await customerRepository.update(existingByPhone.id, {
            full_name: customerName || existingByPhone.full_name,
            email: customerEmail || existingByPhone.email,
            customer_source: 'manual_registration'
          });
        }
        
        // Increment counter
        await memberRepository.incrementReferredCount(referrerId);
        
        return { customer: existingByPhone, isNew: false };
      }
      
      // Create new customer
      const newCustomer = await customerRepository.create({
        full_name: customerName,
        email: customerEmail,
        phone: cleanPhone,
        referrer_id: referrerId,
        referral_code_used: referrer.referral_code,
        referred_date: new Date().toISOString(),
        is_referred_customer: true,
        customer_source: 'manual_registration',
        status: 'active',
        referral_locked: false
      });
      
      // Increment counter
      await memberRepository.incrementReferredCount(referrerId);
      
      // Log
      await auditRepository.logCustomerRegistration(
        newCustomer.id,
        customerEmail,
        referrer.full_name,
        customerName,
        cleanPhone
      );
      
      return { customer: newCustomer, isNew: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referred-customers'] });
      queryClient.invalidateQueries({ queryKey: ['referral-member-current'] });
    }
  });
}

/**
 * Reassign customer to different referrer (Admin only)
 */
export function useReassignCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, newReferrerId, adminEmail, reason }) => {
      // Get customer
      const customers = await base44.entities.Customer.filter({ id: customerId });
      if (customers.length === 0) {
        throw new Error('Không tìm thấy khách hàng');
      }
      const customer = customers[0];
      const oldReferrerId = customer.referrer_id;
      
      // Get new referrer
      const newReferrer = await memberRepository.getById(newReferrerId);
      if (!newReferrer) {
        throw new Error('CTV mới không hợp lệ');
      }
      
      // Reassign
      await customerRepository.reassign(customerId, newReferrerId, newReferrer.referral_code);
      
      // Update counters
      if (oldReferrerId) {
        const oldReferrer = await memberRepository.getById(oldReferrerId);
        if (oldReferrer) {
          await memberRepository.update(oldReferrerId, {
            total_referred_customers: Math.max(0, (oldReferrer.total_referred_customers || 0) - 1)
          });
        }
      }
      
      await memberRepository.incrementReferredCount(newReferrerId);
      
      // Log
      await auditRepository.logCustomerReassignment(
        customerId,
        customer.full_name,
        oldReferrerId,
        newReferrer.full_name,
        adminEmail,
        reason
      );
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Lock customer to referrer after first order
 */
export function useLockCustomer() {
  return useMutation({
    mutationFn: async (customerId) => {
      const isLocked = await customerRepository.isLocked(customerId);
      if (isLocked) return { success: true, alreadyLocked: true };
      
      await customerRepository.lockToReferrer(customerId);
      return { success: true, alreadyLocked: false };
    }
  });
}

/**
 * Apply referral code to a customer (during checkout)
 */
export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerEmail, referralCode }) => {
      // Validate code
      const referrer = await memberRepository.getActiveByCode(referralCode);
      if (!referrer) {
        throw new Error('Mã giới thiệu không hợp lệ hoặc không hoạt động');
      }
      
      // Check self-referral
      if (customerEmail === referrer.user_email) {
        throw new Error('Bạn không thể sử dụng mã giới thiệu của chính mình');
      }
      
      // Check customer
      const existingCustomer = await customerRepository.getByEmail(customerEmail);
      if (existingCustomer?.referral_locked) {
        throw new Error('Bạn đã sử dụng mã giới thiệu trước đó');
      }
      
      // Apply referral
      if (existingCustomer) {
        await customerRepository.assignReferrer(
          existingCustomer.id,
          referrer.id,
          referralCode.toUpperCase()
        );
      }
      
      // Increment counter
      if (!existingCustomer?.referrer_id) {
        await memberRepository.incrementReferredCount(referrer.id);
      }
      
      return {
        success: true,
        referrer: {
          id: referrer.id,
          name: referrer.full_name,
          code: referrer.referral_code
        }
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referral-member'] });
    }
  });
}

export default {
  useRegisterCustomer,
  useReassignCustomer,
  useLockCustomer,
  useApplyReferralCode
};