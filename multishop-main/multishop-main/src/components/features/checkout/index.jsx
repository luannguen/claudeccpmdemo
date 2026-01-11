/**
 * Checkout Module - Public API
 * 
 * All external code should import from this file only.
 * Do NOT import from internal subfolders directly.
 * 
 * @module features/checkout
 * 
 * @example
 * import { useCheckout, CheckoutModal } from '@/components/features/checkout';
 */

// ========== HOOKS ==========
export { 
  useCheckout,
  useCheckoutState,
  useCheckoutCart,
  useCheckoutForm,
  useCheckoutOrder,
  useCheckoutCalculations,
  useCheckoutData,
  useCheckoutUser,
  useExistingCustomer,
  usePaymentMethods
} from './hooks';

// ========== UI COMPONENTS ==========
export { 
  CheckoutModal,
  CartStep,
  PaymentStep,
  ConfirmStep,
  SuccessView
} from './ui';

// ========== TYPES ==========
export {
  PAYMENT_METHODS,
  CHECKOUT_STEPS,
  ORDER_STATUS,
  PAYMENT_STATUS
} from './types';

// ========== DOMAIN (Internal use recommended) ==========
// Export for advanced use cases only
export { 
  validators,
  priceCalculator,
  depositCalculator,
  checkoutRules,
  cartHelpers
} from './domain';

// ========== DATA (Internal use only) ==========
// Not exported - use hooks instead