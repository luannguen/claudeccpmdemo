/**
 * useCheckoutData - Data fetching hook
 * Hooks Layer - Single Goal: Fetch checkout data
 * 
 * @module features/checkout/hooks/useCheckoutData
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { customerRepository, paymentRepository } from '../data';

/**
 * Get current authenticated user
 */
export function useCheckoutUser() {
  return useQuery({
    queryKey: ['checkout-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get existing customer by email
 * @param {string} userEmail
 */
export function useExistingCustomer(userEmail) {
  return useQuery({
    queryKey: ['checkout-customer', userEmail],
    queryFn: () => customerRepository.findByEmail(userEmail),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get active payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['checkout-payment-methods'],
    queryFn: paymentRepository.getActivePaymentMethods,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Combined checkout data hook
 */
export function useCheckoutData() {
  const userQuery = useCheckoutUser();
  const customerQuery = useExistingCustomer(userQuery.data?.email);
  const paymentMethodsQuery = usePaymentMethods();
  
  return {
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    
    customer: customerQuery.data,
    isLoadingCustomer: customerQuery.isLoading,
    
    paymentMethods: paymentMethodsQuery.data || [],
    isLoadingPaymentMethods: paymentMethodsQuery.isLoading,
    
    isLoading: userQuery.isLoading || customerQuery.isLoading || paymentMethodsQuery.isLoading
  };
}

export default useCheckoutData;