
/**
 * useCheckout - Legacy adapter for backward compatibility
 * 
 * @deprecated Use '@/components/features/checkout' instead
 * 
 * @example
 * // NEW WAY (recommended)
 * import { useCheckout, CheckoutModal } from '@/components/features/checkout';
 * 
 * // OLD WAY (still works for backward compatibility)
 * import { useCheckout } from '@/components/hooks/useCheckout';
 */

// Re-export everything from the new module
export { 
  useCheckout,
  useCheckoutState,
  useCheckoutCart as useCheckoutCartActions,
  useCheckoutForm,
  useCheckoutOrder as useCheckoutOrderActions,
  useCheckoutCalculations,
  useCheckoutUser,
  useExistingCustomer,
  usePaymentMethods as usePaymentMethodsData
} from '@/components/features/checkout';

// Default export
export { useCheckout as default } from '@/components/features/checkout';
