# 🎁 Gift Module

> **Version**: 2.0.0  
> **Last Updated**: 2026-01-01  
> **Status**: ✅ Production Ready

---

## 📋 Overview

Gift module quản lý toàn bộ flow **tặng quà**, **nhận quà**, **đổi quà** với vận hành thương mại đầy đủ:
- Buyer **mua quà** (thanh toán trước) → **tặng** người nhận
- Receiver **đổi quà** → lúc đó mới tạo **FulfillmentOrder** cho admin
- Hỗ trợ instant, scheduled delivery, redeem-required

---

## 🏗️ Architecture

```
features/gift/
├── ui/                        # UI Components
│   ├── SendGiftModal.jsx      # 4-step wizard (Product → Options → Payment → Success)
│   ├── RedeemGiftModal.jsx    # Redeem form (địa chỉ, phone)
│   ├── SwapGiftModal.jsx      # Swap to different product
│   ├── GiftCard.jsx           # Gift display card
│   ├── steps/
│   │   ├── ProductSelectionStep.jsx   # Step 1: Search/filter products
│   │   ├── GiftOptionsStep.jsx        # Step 2: Delivery, occasion, message
│   │   ├── PaymentStep.jsx            # Step 3: Payment methods
│   │   └── SuccessStep.jsx            # Step 4: Success screen
│   └── admin/
│       ├── GiftAnalyticsWidget.jsx
│       └── GiftTransactionTable.jsx
├── domain/                    # Business Logic
│   ├── giftStateMachine.js    # State transitions & validation
│   ├── giftRules.js           # Business rules
│   ├── deliveryPolicies.js    # Delivery modes & occasions
│   └── validators.js          # Input validation
├── data/                      # Data Access Layer
│   ├── giftOrderRepository.js       # GiftOrder CRUD
│   ├── giftTransactionRepository.js # GiftTransaction CRUD
│   └── fulfillmentBridge.js         # Create Order for admin
├── types/                     # DTOs & Types
│   ├── GiftDTO.js
│   └── index.js
├── hooks/                     # Orchestration Hooks
│   ├── useGiftOrder.js        # Order creation & payment
│   ├── useGiftSend.js         # Send gift flow
│   ├── useGiftInbox.js        # Receiver inbox
│   ├── useSentGifts.js        # Sender history
│   ├── useGiftRedeem.js       # Redeem flow
│   └── useGiftAdmin.js        # Admin analytics
├── services/                  # External integrations
│   └── giftNotificationHandler.js
└── index.js                   # PUBLIC API
```

---

## 📦 Entities

### GiftOrder (Đơn mua quà)

**Purpose**: Tracking payment cho việc mua quà

```javascript
{
  id,
  buyer_user_id,
  buyer_email,
  buyer_name,
  status: 'draft' | 'pending_payment' | 'paid' | 'cancelled' | 'refunded',
  payment_method: 'bank_transfer' | 'momo' | 'vnpay',
  payment_id,
  paid_at,
  items: [{ product_id, product_name, product_image, price, quantity }],
  subtotal,
  discount,
  total_amount,
  gift_transaction_ids: []
}
```

### GiftTransaction (Quà tặng / Asset)

**Purpose**: Quà tặng với lifecycle đầy đủ

```javascript
{
  id,
  gift_order_id,              // Link to payment order
  sender_user_id,
  sender_name,
  sender_email,
  receiver_user_id,
  receiver_name,
  receiver_email,
  receiver_phone,             // Set when redeemed
  receiver_shipping_address,  // Set when redeemed
  connection_id,
  item_id,                    // Product ID
  item_type: 'product' | 'service',
  item_name,
  item_image,
  item_value,
  message,                    // Lời nhắn
  occasion: 'birthday' | 'anniversary' | 'holiday' | 'thank_you' | 'congratulations' | 'other',
  status: 'pending_payment' | 'paid' | 'sent' | 'redeemable' | 'redeemed' | 
          'fulfillment_created' | 'delivered' | 'swapped' | 'cancelled' | 'expired',
  delivery_mode: 'instant' | 'scheduled' | 'redeem_required',
  scheduled_delivery_date,
  redemption_code: 'GIFT-XXXXXXXX',
  redeemed_at,
  fulfillment_order_id,       // Order ID cho admin
  can_swap: true | false,
  swapped_from_gift_id,
  sent_date,
  expires_at                  // 90 days from sent_date
}
```

---

## 🎯 State Machine

### GiftOrder Flow
```
DRAFT → PENDING_PAYMENT → PAID → (creates GiftTransaction)
                       ↓
                   CANCELLED/REFUNDED
```

### GiftTransaction Flow
```
PAID → SENT → REDEEMABLE → REDEEMED → FULFILLMENT_CREATED → DELIVERED
        ↓         ↓            ↓
    CANCELLED  EXPIRED     SWAPPED
```

**Rules:**
- `PAID`: Sau khi GiftOrder thanh toán
- `SENT`: Đã notify receiver
- `REDEEMABLE`: 
  - Instant: ngay sau SENT
  - Scheduled: đến `scheduled_delivery_date`
  - Redeem_required: ngay sau SENT
- `REDEEMED`: Receiver xác nhận địa chỉ → tạo FulfillmentOrder
- `FULFILLMENT_CREATED`: Admin nhận đơn giao hàng
- `DELIVERED`: Admin confirm giao xong

---

## 🚀 Public API (How to Use)

### Hooks

```javascript
import { 
  useGiftOrder,      // Order creation & payment
  useGiftSend,       // Send gift wizard
  useGiftInbox,      // Receiver inbox (active + history)
  useSentGifts,      // Sender history
  useGiftRedeem,     // Redeem flow
  useGiftAdmin       // Admin analytics
} from '@/components/features/gift';
```

### UI Components

```javascript
import { 
  SendGiftModal,     // 4-step wizard
  RedeemGiftModal,   // Redeem with shipping info
  SwapGiftModal,     // Swap to different product
  GiftCard           // Display gift card
} from '@/components/features/gift';
```

### Admin UI

```javascript
import { 
  GiftAnalyticsWidget,
  GiftTransactionTable 
} from '@/components/features/gift';
```

### Domain Rules

```javascript
import { 
  canRedeem,         // Check if gift can be redeemed
  canSwap,           // Check if gift can be swapped
  isExpired,         // Check if gift expired
  canTransition      // Validate status transition
} from '@/components/features/gift';
```

---

## 💡 Usage Examples

### Example 1: Send Gift (Client)

```javascript
import { SendGiftModal } from '@/components/features/gift';

export function ConnectionDetail({ connection }) {
  const [showGiftModal, setShowGiftModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowGiftModal(true)}>
        Gửi quà
      </Button>

      <SendGiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        connection={connection}
        onSent={() => {
          // Refresh data
          queryClient.invalidateQueries(['sentGifts']);
        }}
      />
    </>
  );
}
```

### Example 2: Gift Inbox (Receiver)

```javascript
import { useGiftInbox, GiftCard, RedeemGiftModal } from '@/components/features/gift';

export function MyGifts() {
  const { activeGifts, historyGifts, isLoading } = useGiftInbox();
  const [selectedGift, setSelectedGift] = useState(null);

  return (
    <div>
      <h2>Quà chờ đổi ({activeGifts.length})</h2>
      {activeGifts.map(gift => (
        <GiftCard
          key={gift.id}
          gift={gift}
          view="received"
          onRedeem={(g) => setSelectedGift(g)}
        />
      ))}

      <RedeemGiftModal
        isOpen={!!selectedGift}
        onClose={() => setSelectedGift(null)}
        gift={selectedGift}
        onRedeemed={() => {
          // Gift moved to history
          setSelectedGift(null);
        }}
      />
    </div>
  );
}
```

### Example 3: Admin Fulfillment Orders

```javascript
// When gift is redeemed, FulfillmentOrder is auto-created
// Admin sees it in normal Orders list with note "🎁 Quà tặng từ X"

import { useAdminOrders } from '@/components/hooks/useAdminOrders';

export function AdminOrders() {
  const { orders } = useAdminOrders();
  
  // Filter gift orders
  const giftOrders = orders.filter(o => o.order_number?.startsWith('GIFT-'));
  
  return (
    <OrderTable orders={giftOrders} />
  );
}
```

---

## 🎨 Flow Details

### Flow A: Instant Gift (Tặng ngay)

1. Buyer: Chọn quà → Options (delivery_mode=instant) → Thanh toán
2. **Payment success**:
   - `GiftOrder.status = PAID`
   - Create `GiftTransaction(status=PAID)`
   - `→ SENT` (notify receiver)
   - `→ REDEEMABLE` (instant)
3. Receiver: Nhận notify → mở inbox → redeem
4. **Redeem**:
   - Nhập địa chỉ, phone
   - `GiftTransaction → REDEEMED`
   - Create `Order(GIFT-xxx)` for admin
   - `GiftTransaction → FULFILLMENT_CREATED`
5. Admin: Process order → deliver
6. `GiftTransaction → DELIVERED`

### Flow B: Scheduled Gift (Tặng theo ngày)

1. Buyer: Chọn quà → Options (delivery_mode=scheduled, date=X) → Thanh toán
2. **Payment success**:
   - `GiftTransaction → PAID → SENT`
   - **NOT YET REDEEMABLE** (locked until date X)
3. **Scheduler job** (daily):
   - Check gifts with `scheduled_delivery_date <= today` AND `status=SENT`
   - `→ REDEEMABLE` + notify receiver
4. Receiver: redeem (same as Flow A)

### Flow C: Redeem Required (Mặc định)

1. Buyer: Chọn quà → Options (delivery_mode=redeem_required) → Thanh toán
2. **Payment success**:
   - `GiftTransaction → PAID → SENT → REDEEMABLE` (ngay)
   - Notify receiver
3. Receiver: **Phải thao tác redeem** để chọn địa chỉ
4. Tạo FulfillmentOrder cho admin

---

## ⚙️ Configuration

### Delivery Modes

```javascript
DELIVERY_MODE = {
  INSTANT: 'instant',              // Giao ngay
  SCHEDULED: 'scheduled',          // Giao vào ngày cụ thể
  REDEEM_REQUIRED: 'redeem_required' // Người nhận phải đổi quà (default)
}
```

### Occasions

```javascript
OCCASION = {
  BIRTHDAY: 'birthday',
  ANNIVERSARY: 'anniversary',
  HOLIDAY: 'holiday',
  THANK_YOU: 'thank_you',
  CONGRATULATIONS: 'congratulations',
  OTHER: 'other'
}
```

### Constants

```javascript
GIFT_EXPIRY_DAYS = 90           // Gift expires after 90 days
PAYMENT_METHODS = ['bank_transfer', 'momo', 'vnpay'] // NO COD
```

---

## 🔄 State Transitions

### Valid Transitions

```javascript
canTransition(from, to) // Validate state change

PAID → SENT
SENT → REDEEMABLE, EXPIRED, CANCELLED
REDEEMABLE → REDEEMED, SWAPPED, EXPIRED, CANCELLED
REDEEMED → FULFILLMENT_CREATED
FULFILLMENT_CREATED → DELIVERED
```

### Terminal States

```javascript
isTerminalStatus(status) // Check if final state

DELIVERED, SWAPPED, CANCELLED, EXPIRED
```

---

## 🎯 Business Rules

### Gift Rules (domain/giftRules.js)

```javascript
canSendGift(sender, receiver)    // Validate sender/receiver
canRedeemGift(gift)              // Check if redeemable
canSwapGift(gift)                // Check if swappable
isGiftExpired(gift)              // Check expiry
```

### Validators (domain/validators.js)

```javascript
validateReceiver(receiver)       // Validate receiver info
validateGiftOrderItems(items)    // Validate order items
validateShippingInfo(info)       // Validate shipping address
validateDeliveryMode(mode, date) // Validate delivery config
```

---

## 🔌 Integration Points

### With Order Module (Bridge)

```javascript
// data/fulfillmentBridge.js
createFulfillmentOrder(gift, shippingInfo) → Order

// Creates Order for admin when gift is redeemed
// Order has special note: "🎁 Quà tặng từ X"
```

### With Notification Module

```javascript
// services/giftNotificationHandler.js
notifyGiftReceived(gift)
notifyGiftRedeemed(gift)
notifyGiftDelivered(gift)
notifyGiftExpiringSoon(gift)
notifyGiftExpired(gift)
notifyGiftSwapped(originalGift, newGift)
```

---

## 📅 Scheduled Tasks (Required)

### Task: Process Scheduled Deliveries

**Function**: `functions/processScheduledGifts.js`

```javascript
// Run daily at 00:00
// Check gifts with:
//   - status = 'sent'
//   - delivery_mode = 'scheduled'
//   - scheduled_delivery_date <= today

// For each:
//   - Update status to 'redeemable'
//   - Notify receiver
```

**Schedule**: Daily at midnight

---

## 🎨 UI/UX Design Principles

### SendGiftModal - Wizard Flow (4 Steps)

**Step 1: Product Selection**
- Search + filter by category
- Virtualized list (20 items/page)
- Card view: image, name, price
- Selected product sticky footer

**Step 2: Gift Options**
- Delivery mode selector (instant/scheduled/redeem)
- Date picker (if scheduled)
- Occasion chips (birthday, anniversary, ...)
- Message textarea with placeholder
- Can swap toggle

**Step 3: Payment**
- Order summary card
- Payment method selector (NO COD)
- Total amount prominent
- Back/Pay buttons

**Step 4: Success**
- Success animation
- Gift preview card
- Redemption code display
- Info box: next steps

### RedeemGiftModal

- Gift details (item, sender, message)
- Shipping form (phone, address, city, district, ward)
- Delivery date/time picker
- Confirm button → Creates FulfillmentOrder

### GiftCard

**Active gift (redeemable)**:
- Green border, prominent CTA
- "Đổi quà" / "Đổi sang quà khác" buttons
- Expiry countdown

**History gift (delivered/expired)**:
- Gray tone, no CTA
- Status badge
- View details only

---

## ⚠️ Important Notes

### 1. NO Fulfillment Order Before Redeem

**CRITICAL**: 
- Không tạo Order cho admin khi buyer thanh toán
- Chỉ tạo Order KHI receiver redeem (confirm địa chỉ)
- Tránh đơn ảo, sai địa chỉ

### 2. Payment Before Gift

**Flow bắt buộc**:
```
GiftOrder.PAID → Create GiftTransaction → SENT → REDEEMABLE
```

Không cho phép "tạo gift trước, thanh toán sau"

### 3. Idempotency

**All mutations must be idempotent**:
- `createFromOrder(order, config)` - Check existing gift for order
- `redeemGift(giftId, info)` - Check already redeemed
- `swapGift(giftId, newProduct)` - Check already swapped

### 4. Expiry Policy

**Default**: 90 days from `sent_date`

**Action on expiry**:
- Scheduled job marks `EXPIRED`
- Notify both sender & receiver
- Refund policy (configurable)

### 5. Mobile Responsive

**Wizard modal on mobile**:
- Full screen
- Swipe gestures enabled
- Bottom navigation
- Touch-friendly buttons

---

## 🧪 Testing Checklist

- [ ] Send instant gift → receiver sees in inbox
- [ ] Send scheduled gift → locked until date
- [ ] Redeem gift → creates Order with correct info
- [ ] Swap gift → new gift appears, old marked swapped
- [ ] Gift expires → status updated, both parties notified
- [ ] Payment fails → no gift created
- [ ] Duplicate payment webhook → idempotent

---

## 🔧 Dependencies

**Internal**:
- `@/components/ui/AnimatedIcon` - Icon system
- `@/components/EnhancedModal` - Modal base
- `@/components/NotificationToast` - Toast notifications
- `@/api/base44Client` - API client

**External Modules**:
- Order module (via fulfillmentBridge)
- Notification module (via giftNotificationHandler)

**No circular dependencies**: Gift module does not import Order/Notification internals

---

## 📊 Analytics & Admin

### Admin Views

1. **Gift Analytics Widget**
   - Total gifts sent/redeemed
   - Active gifts count
   - Revenue from gifts
   - Popular gift products

2. **Gift Transaction Table**
   - All gift transactions
   - Filter by status, date
   - Search by redemption code
   - Export functionality

3. **Fulfillment Orders**
   - Regular Order list with filter
   - `order_number LIKE 'GIFT-%'`
   - Special icon/badge for gift orders

---

## 🎁 Gift Lifecycle Summary

```
┌──────────────────────────────────────────────────────────────┐
│ BUYER FLOW                                                   │
├──────────────────────────────────────────────────────────────┤
│ 1. Open SendGiftModal (from ConnectionDetail)               │
│ 2. Step 1: Choose product (search/filter)                   │
│ 3. Step 2: Set options (delivery, occasion, message)        │
│ 4. Step 3: Pay (bank_transfer/momo/vnpay)                   │
│ 5. Payment success → Gift created & sent                    │
├──────────────────────────────────────────────────────────────┤
│ RECEIVER FLOW                                                │
├──────────────────────────────────────────────────────────────┤
│ 1. Receive notification "Bạn nhận được quà!"                │
│ 2. Open Gift Inbox → see REDEEMABLE gifts                   │
│ 3. Click "Đổi quà" → RedeemGiftModal                        │
│ 4. Fill shipping info (phone, address, delivery date)       │
│ 5. Confirm → Gift REDEEMED → FulfillmentOrder created       │
├──────────────────────────────────────────────────────────────┤
│ ADMIN FLOW                                                   │
├──────────────────────────────────────────────────────────────┤
│ 1. See new Order (GIFT-xxx) in admin panel                  │
│ 2. Prepare product                                          │
│ 3. Ship to receiver address                                 │
│ 4. Mark delivered → Gift DELIVERED                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Module Boundaries

### What This Module DOES

✅ Gift order creation & payment  
✅ Gift lifecycle management (send, redeem, swap)  
✅ Gift inbox for receiver  
✅ Gift history for sender  
✅ Gift expiry tracking  
✅ Fulfillment order creation (bridge)

### What This Module DOES NOT

❌ Product catalog management → Product module  
❌ Payment gateway integration → Payment module  
❌ Order fulfillment → Order module  
❌ User connection management → E-Card module  
❌ Notification delivery → Notification module

**Communication**: Via public API only, no deep imports

---

## 🚧 Roadmap (Future)

- [ ] Support service gifts (not just products)
- [ ] Gift bundles (multiple items)
- [ ] Recurring gifts (subscriptions)
- [ ] Gift cards (monetary value)
- [ ] Group gifting (multiple senders)
- [ ] AI gift suggestions
- [ ] Gift wrapping options
- [ ] Video message attachments

---

## 📞 Support

**Issues**: Check AI-CODING-RULES.jsx for module architecture guidelines  
**Module Owner**: Gift Team  
**Last Reviewed**: 2026-01-01