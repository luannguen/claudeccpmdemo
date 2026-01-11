# Referral Module

> **Version**: 2.0.0  
> **Last Updated**: 2025-01-19  
> **Status**: Production Ready

---

## 📋 Mục đích

Module Referral quản lý hệ thống giới thiệu khách hàng (affiliate/referral):
- Quản lý thành viên referral (Seeder)
- Theo dõi commission và thanh toán
- Hệ thống rank và tier
- Đăng ký khách hàng qua referral code
- Tích hợp checkout flow
- Phát hiện gian lận

---

## 📁 Cấu trúc Module

```
components/features/referral/
├── types/                    # DTOs và Constants
│   ├── ReferralDTO.js        # Type definitions
│   └── index.js              # Public exports
├── domain/                   # Business Logic (Pure Functions)
│   ├── codeGenerator.js      # Tạo referral code
│   ├── validators.js         # Validation logic
│   ├── commissionCalculator.js # Tính commission
│   ├── rankManager.js        # Quản lý rank/tier
│   ├── fraudDetector.js      # Phát hiện gian lận
│   ├── memberRules.js        # Quy tắc thành viên
│   └── index.js              # Public exports
├── data/                     # Repositories (Data Access)
│   ├── memberRepository.js   # CRUD ReferralMember
│   ├── eventRepository.js    # CRUD ReferralEvent
│   ├── settingRepository.js  # Referral settings
│   ├── customerRepository.js # Customer data
│   ├── auditRepository.js    # Audit logs
│   └── index.js              # Public exports
├── hooks/                    # React Hooks (Feature Logic)
│   ├── useReferralMember.js  # Member management
│   ├── useReferralCommission.js # Commission tracking
│   ├── useReferralAdmin.js   # Admin operations
│   ├── useReferralCustomer.js # Customer registration
│   ├── useReferralCheckout.js # Checkout integration
│   ├── useReferralRank.js    # Rank/tier management
│   └── index.js              # Public exports
├── ui/                       # UI Components
│   ├── member/
│   │   └── SeederRankProgress.jsx
│   ├── commission/
│   │   └── CommissionTracker.jsx
│   ├── customer/
│   │   └── RegisterCustomerModal.jsx
│   ├── share/
│   │   └── ReferralQRCode.jsx
│   └── index.js              # Public exports
└── index.js                  # Module Public API
```

---

## 🔌 Cách sử dụng

### Import từ Module API

```javascript
// ✅ ĐÚNG - Import từ module index
import { 
  useMyReferralMember,
  useReferralCommissions,
  useRegisterCustomer,
  calculateCommission,
  REFERRAL_RANKS
} from '@/components/features/referral';

// UI Components
import { 
  SeederRankProgress,
  CommissionTracker,
  ReferralQRCode 
} from '@/components/features/referral';
```

### Ví dụ sử dụng

```javascript
// Seeder Dashboard
function MyReferralsPage() {
  const { member, isLoading } = useMyReferralMember();
  const { commissions } = useReferralCommissions(member?.id);
  const { currentRank, progress } = useReferralRank(member?.id);
  
  return (
    <>
      <SeederRankProgress rank={currentRank} progress={progress} />
      <CommissionTracker commissions={commissions} />
    </>
  );
}

// Checkout Integration
function CheckoutForm() {
  const { applyReferralCode, referralDiscount } = useReferralCheckout();
  
  const handleApply = async (code) => {
    await applyReferralCode(code);
  };
}

// Admin: Quản lý members
function AdminReferralMembers() {
  const { members, filters, setFilters } = useReferralMembersList();
  const { updateMember, approveMember } = useReferralAdminMutations();
}
```

---

## 📜 Luật riêng Module

### 1. Commission Calculation

```javascript
// Luôn sử dụng domain function để tính commission
import { calculateCommission } from '@/components/features/referral';

const commission = calculateCommission({
  orderAmount: 1000000,
  commissionRate: 5, // %
  memberTier: 'gold'
});

// KHÔNG tính trực tiếp trong component
// ❌ const commission = orderAmount * 0.05;
```

### 2. Referral Code Validation

```javascript
// Validate referral code trước khi apply
import { validateReferralCode } from '@/components/features/referral';

const { isValid, error, member } = await validateReferralCode(code);
if (!isValid) {
  showError(error);
  return;
}
```

### 3. Fraud Detection

```javascript
// Check fraud signals trước khi approve commission
import { detectFraudSignals } from '@/components/features/referral';

const signals = detectFraudSignals({
  member,
  customer,
  order
});

if (signals.riskScore > 70) {
  // Flag for manual review
}
```

### 4. Checkout Integration

Module này tích hợp với Checkout module qua bridge:

```javascript
// components/features/bridges/checkoutReferralBridge.js
import { applyReferralToOrder } from '@/components/features/referral';
import { updateOrderTotal } from '@/components/features/checkout';

export async function processReferralAtCheckout(order, referralCode) {
  const discount = await applyReferralToOrder(order, referralCode);
  return updateOrderTotal(order, discount);
}
```

---

## 🔗 Dependencies

### Internal Dependencies
- `@/api/base44Client` - API client
- `@tanstack/react-query` - Data fetching
- `@/components/features/checkout` - Checkout integration

### Entity Dependencies
- `ReferralMember` - Thành viên referral
- `ReferralEvent` - Sự kiện (order, commission)
- `ReferralSetting` - Cấu hình hệ thống
- `ReferralAuditLog` - Audit logs
- `Customer` - Khách hàng

---

## ⚠️ Lưu ý quan trọng

1. **Commission phải qua domain calculation** - Không hardcode rate
2. **Validate code trước khi apply** - Tránh invalid codes
3. **Check fraud signals** - Đặc biệt với high-value orders
4. **Audit mọi thay đổi quan trọng** - Commission, rank changes
5. **Tích hợp checkout qua bridge** - Không import trực tiếp

---

## 📝 Changelog

### v2.0.0 (2025-01-19)
- Full module refactor
- Tách domain logic
- Tạo repository pattern
- UI components modularization