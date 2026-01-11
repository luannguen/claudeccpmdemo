# Pre-Order Module

> **Version**: 2.0.0  
> **Last Updated**: 2025-01-19  
> **Status**: Production Ready

---

## 📋 Mục đích

Module Pre-Order quản lý toàn bộ quy trình đặt hàng trước cho nông sản:
- Quản lý ProductLot (lô hàng) và PreOrderProduct
- Xử lý đặt cọc, thanh toán, escrow
- Hủy đơn và hoàn tiền theo policy
- Dispute và compensation tự động
- Analytics và risk management

---

## 📁 Cấu trúc Module

```
components/features/preorder/
├── types/                    # DTOs và Constants
│   ├── PreOrderDTO.js        # Type definitions
│   └── index.js              # Public exports
├── domain/                   # Business Logic (Pure Functions)
│   ├── cancellationRules.js  # Quy tắc hủy đơn
│   ├── compensationRules.js  # Quy tắc bồi thường
│   ├── escrowRules.js        # Quy tắc escrow/wallet
│   ├── pricingRules.js       # Quy tắc giá động
│   ├── validators.js         # Validation logic
│   ├── fraudDetector.js      # Phát hiện gian lận
│   ├── analyticsCalculator.js # Tính toán analytics
│   ├── proofPackGenerator.js # Tạo proof pack
│   └── index.js              # Public exports
├── data/                     # Repositories (Data Access)
│   ├── lotRepository.js      # CRUD ProductLot
│   ├── preOrderProductRepository.js
│   ├── cancellationRepository.js
│   ├── walletRepository.js   # PaymentWallet
│   ├── transactionRepository.js
│   ├── compensationRepository.js
│   ├── disputeRepository.js
│   ├── riskRepository.js
│   ├── analyticsRepository.js
│   ├── proofPackRepository.js
│   └── index.js              # Public exports
├── hooks/                    # React Hooks (Feature Logic)
│   ├── usePreOrderLots.js    # Client-side lot management
│   ├── useCancellation.js    # Cancellation flow
│   ├── useEscrow.js          # Wallet/escrow operations
│   ├── useCompensation.js    # Auto compensation
│   ├── useDispute.js         # Dispute management
│   ├── useCart.js            # Add to cart logic
│   ├── useAdminPreOrders.js  # Admin preorder management
│   ├── useAdminLots.js       # Admin lot management
│   ├── useCampaigns.js       # Campaign (group buy, early bird)
│   ├── useRiskManagement.js  # Risk scoring
│   ├── useAnalytics.js       # Analytics dashboard
│   ├── useProofPack.js       # Proof pack generation
│   └── index.js              # Public exports
└── index.js                  # Module Public API
```

---

## 🔌 Cách sử dụng

### Import từ Module API

```javascript
// ✅ ĐÚNG - Import từ module index
import { 
  usePreOrderLots,
  useLotDetail,
  useAddToCart,
  useCancelPreOrder,
  WALLET_STATUS,
  CANCELLATION_POLICY
} from '@/components/features/preorder';

// ❌ SAI - Không import trực tiếp từ file internal
import { usePreOrderLots } from '@/components/features/preorder/hooks/usePreOrderLots';
```

### Ví dụ sử dụng Hooks

```javascript
// Client: Xem danh sách lot
function PreOrderPage() {
  const { data: lots, isLoading } = useActiveLots();
  const { category, setCategory } = useLotFilters();
  // ...
}

// Client: Xem chi tiết lot
function LotDetailPage({ lotId }) {
  const { lot, preOrder, product, isLoading } = useLotDetail(lotId);
  const { addToCart, isAdding } = useAddToCart();
  // ...
}

// Admin: Quản lý cancellations
function AdminCancellations() {
  const { data: cancellations } = useCancellationsList();
  const { processRefund } = useProcessRefund();
  // ...
}
```

### Sử dụng Domain Logic

```javascript
import { 
  calculateRefund,
  canCancelOrder,
  CANCELLATION_POLICY 
} from '@/components/features/preorder';

// Tính toán refund
const refund = calculateRefund({
  depositAmount: 500000,
  harvestDate: '2025-02-01',
  currentDate: new Date()
});

// Check có thể hủy không
const canCancel = canCancelOrder(order, lot);
```

---

## 📜 Luật riêng Module

### 1. Separation of Concerns

| Layer | Cho phép | Không cho phép |
|-------|----------|----------------|
| **types/** | Type definitions, constants | Logic, API calls |
| **domain/** | Pure functions, business rules | API calls, React hooks, side effects |
| **data/** | API calls (base44.entities.*) | Business logic, React state |
| **hooks/** | Orchestrate domain + data, React state | Direct API calls, complex logic |

### 2. Naming Conventions

```javascript
// Hooks: use + Action/Entity + Verb
usePreOrderLots     // Lấy danh sách lots
useLotDetail        // Lấy chi tiết lot
useCancelPreOrder   // Mutation hủy đơn
useProcessRefund    // Mutation xử lý refund

// Domain functions: verb + Noun
calculateRefund()
canCancelOrder()
validateOrder()

// Repository methods: CRUD verbs
lotRepository.getById()
lotRepository.getActive()
lotRepository.create()
lotRepository.update()
```

### 3. Error Handling

```javascript
// Domain: Throw errors với clear message
export function calculateRefund(params) {
  if (!params.depositAmount) {
    throw new Error('PREORDER_INVALID_DEPOSIT: depositAmount is required');
  }
  // ...
}

// Hooks: Catch và expose error state
const { mutate, error, isError } = useMutation({
  mutationFn: async (data) => {
    // Let errors bubble up to react-query
    return await repository.create(data);
  }
});
```

### 4. Constants Export

```javascript
// Types file export constants
export const WALLET_STATUS = { ... };
export const TRANSACTION_TYPE = { ... };

// Module index re-exports
export { WALLET_STATUS, TRANSACTION_TYPE } from './types';
```

### 5. Backward Compatibility

Khi refactor, tạo adapter files để maintain backward compatibility:

```javascript
// components/services/PreOrderCancellationServiceAdapter.js
export * from '@/components/features/preorder';

// Cho phép legacy imports vẫn hoạt động
import { processRefund } from '@/components/services/PreOrderCancellationService';
```

---

## 🔗 Dependencies

### Internal Dependencies
- `@/api/base44Client` - API client
- `@tanstack/react-query` - Data fetching
- `@/components/hooks/useConfirmDialog` - UI confirmations

### Entity Dependencies
- `ProductLot` - Lô hàng
- `PreOrderProduct` - Sản phẩm pre-order
- `PreOrderCancellation` - Hủy đơn
- `PaymentWallet` - Ví thanh toán
- `WalletTransaction` - Giao dịch
- `AutoCompensation` - Bồi thường tự động
- `DisputeTicket` - Khiếu nại
- `CustomerRiskProfile` - Hồ sơ rủi ro
- `PreOrderAnalytics` - Thống kê
- `OrderProofPack` - Chứng từ

---

## ⚠️ Lưu ý quan trọng

1. **Không import trực tiếp từ files internal** - Luôn import từ `index.js`
2. **Domain functions phải pure** - Không side effects, không API calls
3. **Hooks orchestrate, không implement logic** - Logic nặng đưa vào domain
4. **Repository chỉ CRUD** - Không business logic trong repository
5. **Tạo adapter khi refactor** - Đảm bảo backward compatibility

---

## 📝 Changelog

### v2.0.0 (2025-01-19)
- Full module refactor từ file-based sang feature-based
- Tách domain logic ra khỏi services
- Tạo repository pattern cho data access
- Tạo adapters cho backward compatibility