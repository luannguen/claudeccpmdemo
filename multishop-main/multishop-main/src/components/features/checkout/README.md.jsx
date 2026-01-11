# Checkout Module

> **Version**: 2.0.0  
> **Last Updated**: 2025-01-19  
> **Status**: Production Ready

---

## 📋 Mục đích

Module Checkout quản lý toàn bộ quy trình thanh toán:
- Cart management và validation
- Customer form handling
- Price calculation (deposit, discounts, loyalty)
- Order creation
- Payment processing
- Tích hợp Referral và Loyalty

---

## 📁 Cấu trúc Module

```
components/features/checkout/
├── types/                    # DTOs và Constants
│   ├── CheckoutDTO.js        # Type definitions
│   └── index.js              # Public exports
├── domain/                   # Business Logic (Pure Functions)
│   ├── validators.js         # Form & cart validation
│   ├── priceCalculator.js    # Price calculations
│   ├── depositCalculator.js  # Deposit amount logic
│   ├── checkoutRules.js      # Business rules
│   ├── cartHelpers.js        # Cart utilities
│   └── index.js              # Public exports
├── data/                     # Repositories (Data Access)
│   ├── orderRepository.js    # CRUD Order
│   ├── customerRepository.js # Customer data
│   ├── lotRepository.js      # ProductLot data
│   ├── paymentRepository.js  # Payment records
│   └── index.js              # Public exports
├── hooks/                    # React Hooks (Feature Logic)
│   ├── useCheckoutState.js   # Checkout state management
│   ├── useCheckoutCart.js    # Cart operations
│   ├── useCheckoutCalculations.js # Price hooks
│   ├── useCheckoutForm.js    # Form management
│   ├── useCheckoutData.js    # Data fetching
│   ├── useCheckoutOrder.js   # Order creation
│   ├── useCheckout.js        # Main orchestrator hook
│   └── index.js              # Public exports
├── ui/                       # UI Components
│   ├── steps/
│   │   ├── CartStep.jsx
│   │   ├── PaymentStep.jsx
│   │   ├── ConfirmStep.jsx
│   │   └── SuccessView.jsx
│   ├── CheckoutModal.jsx     # Main checkout modal
│   └── index.js              # Public exports
└── index.js                  # Module Public API
```

---

## 🔌 Cách sử dụng

### Import từ Module API

```javascript
// ✅ ĐÚNG - Import từ module index
import { 
  useCheckout,
  useCheckoutCart,
  calculateTotal,
  calculateDeposit,
  validateCart,
  CheckoutModal
} from '@/components/features/checkout';
```

### Ví dụ sử dụng

```javascript
// Main Checkout Flow
function ProductPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const { cart, addToCart, removeFromCart } = useCheckoutCart();
  
  return (
    <>
      <AddToCartButton onClick={() => addToCart(product)} />
      <CheckoutModal 
        open={showCheckout} 
        onClose={() => setShowCheckout(false)}
        cart={cart}
      />
    </>
  );
}

// Using Checkout Hook
function CheckoutPage() {
  const {
    step,
    cart,
    customer,
    totals,
    isProcessing,
    goToNext,
    goToPrev,
    submitOrder
  } = useCheckout();
  
  return (
    <CheckoutSteps step={step}>
      <CartStep cart={cart} totals={totals} />
      <PaymentStep customer={customer} />
      <ConfirmStep onSubmit={submitOrder} />
    </CheckoutSteps>
  );
}
```

### Price Calculations

```javascript
import { 
  calculateTotal,
  calculateDeposit,
  applyDiscounts 
} from '@/components/features/checkout';

// Calculate order total
const total = calculateTotal(cartItems);

// Calculate deposit for pre-order
const deposit = calculateDeposit(total, depositPercentage);

// Apply discounts (referral, loyalty, coupons)
const finalTotal = applyDiscounts(total, {
  referralDiscount: 50000,
  loyaltyPoints: 100,
  couponCode: 'SAVE10'
});
```

---

## 📜 Luật riêng Module

### 1. Cart Validation

```javascript
// Luôn validate cart trước khi proceed
import { validateCart } from '@/components/features/checkout';

const { isValid, errors } = validateCart(cart);
if (!isValid) {
  errors.forEach(e => showError(e.message));
  return;
}
```

### 2. Price Calculation Flow

```javascript
// Thứ tự tính giá:
// 1. Base total (quantity × unit_price)
// 2. Apply coupons
// 3. Apply referral discount
// 4. Apply loyalty points
// 5. Calculate deposit (if pre-order)
// 6. Add shipping

const totals = calculateCheckoutTotals({
  items: cart,
  couponCode,
  referralCode,
  loyaltyPoints,
  shippingMethod
});
```

### 3. Form Validation

```javascript
// Validate customer form
import { validateCustomerForm } from '@/components/features/checkout';

const { isValid, errors } = validateCustomerForm(formData);
// Errors format: { field: 'message' }
```

### 4. Integration with Other Modules

Checkout tích hợp với Referral và Loyalty qua bridges:

```javascript
// Referral integration
import { processReferralAtCheckout } from '@/components/features/bridges/checkoutReferralBridge';

// Loyalty integration  
import { processLoyaltyAtCheckout } from '@/components/features/bridges/checkoutLoyaltyBridge';

// Usage in checkout hook
const handleCheckout = async () => {
  let total = calculateTotal(cart);
  
  if (referralCode) {
    total = await processReferralAtCheckout(order, referralCode);
  }
  
  if (loyaltyPoints > 0) {
    total = await processLoyaltyAtCheckout(order, loyaltyPoints);
  }
  
  return createOrder({ ...order, total });
};
```

### 5. Order Creation

```javascript
// Order creation flow
const { createOrder } = useCheckoutOrder();

const order = await createOrder({
  items: cart,
  customer: customerData,
  payment: paymentMethod,
  totals: calculatedTotals,
  referralCode,
  loyaltyPointsUsed
});

// Order sẽ tự động:
// - Create Order record
// - Create PaymentWallet (if pre-order)
// - Update inventory
// - Create ReferralEvent (if referral)
// - Deduct LoyaltyPoints (if used)
```

---

## 🔗 Dependencies

### Internal Dependencies
- `@/api/base44Client` - API client
- `@tanstack/react-query` - Data fetching
- `@/components/features/referral` - Referral integration
- `@/components/features/preorder` - Pre-order deposit logic

### Entity Dependencies
- `Order` - Đơn hàng
- `Customer` - Khách hàng
- `Product` / `ProductLot` - Sản phẩm
- `Coupon` - Mã giảm giá
- `PaymentWallet` - Ví thanh toán (pre-order)

---

## ⚠️ Lưu ý quan trọng

1. **Validate cart trước mỗi step** - Cart có thể thay đổi
2. **Recalculate totals khi có thay đổi** - Discounts, quantities
3. **Handle payment failures gracefully** - Retry logic
4. **Tích hợp modules qua bridges** - Không import trực tiếp
5. **Create PaymentWallet cho pre-orders** - Escrow flow

---

## 📝 Changelog

### v2.0.0 (2025-01-19)
- Full module refactor
- Tách domain logic (validators, calculators)
- Multi-step checkout UI
- Bridge pattern cho module integration