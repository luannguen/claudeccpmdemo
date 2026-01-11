# Gift Flow Refactor Plan

## Executive Summary

**Mục tiêu**: Refactor hệ thống quà tặng thành module độc lập theo Clean Architecture.

**Vấn đề**:
- Code gift rải rác trong ecard/
- Logic không tách biệt (UI + domain + data lẫn lộn)
- Không có state machine cho gift lifecycle
- Khó maintain và extend

**Giải pháp**: Tạo module `features/gift/` với đầy đủ layers.

---

## Progress Tracking

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| 1. Foundation | ✅ Done | 100% | Entities + Types created |
| 2. Data Layer | ✅ Done | 100% | Repositories + Bridge |
| 3. Domain Logic | ✅ Done | 100% | State machine + Rules |
| 4. Hooks | ✅ Done | 100% | All 5 hooks (including admin) |
| 5. UI Components | ✅ Done | 100% | All modals + cards + steps |
| 6. Integration | ✅ Done | 100% | MyEcard + ConnectionDetailModal |
| 7. Admin | ✅ Done | 100% | AdminGifts page + Dashboard widget |
| 8. Cleanup | ✅ Done | 100% | Legacy deprecated |

---

## Target Architecture

```
features/gift/
├── data/                    # Data Layer
│   ├── giftOrderRepository.js
│   ├── giftTransactionRepository.js
│   ├── fulfillmentBridge.js
│   └── index.js
├── domain/                  # Domain Logic
│   ├── giftStateMachine.js
│   ├── giftRules.js
│   ├── deliveryPolicies.js
│   ├── validators.js
│   └── index.js
├── hooks/                   # Application Layer
│   ├── useGiftOrder.js
│   ├── useGiftSend.js
│   ├── useGiftInbox.js
│   ├── useGiftRedeem.js
│   ├── useGiftAdmin.js
│   └── index.js
├── services/                # Services
│   ├── giftNotificationHandler.js
│   └── index.js
├── types/                   # Types & Constants
│   ├── GiftDTO.js
│   └── index.js
├── ui/                      # UI Components
│   ├── SendGiftModal.jsx
│   ├── RedeemGiftModal.jsx
│   ├── SwapGiftModal.jsx
│   ├── GiftCard.jsx
│   ├── admin/               # Admin UI
│   │   ├── GiftAnalyticsWidget.jsx
│   │   ├── GiftTransactionTable.jsx
│   │   └── index.js
│   ├── steps/
│   │   ├── ProductSelectionStep.jsx
│   │   ├── GiftOptionsStep.jsx
│   │   ├── PaymentStep.jsx
│   │   ├── SuccessStep.jsx
│   │   └── index.js
│   └── index.js
└── index.js                 # Public API
```

---

## Phased Plan

### Phase 1: Foundation ✅ DONE
- [x] Create GiftOrder entity schema
- [x] Create GiftTransaction entity schema
- [x] Create types/GiftDTO.js with all enums and DTOs

### Phase 2: Data Layer ✅ DONE
- [x] Create giftOrderRepository.js
- [x] Create giftTransactionRepository.js
- [x] Create fulfillmentBridge.js for order integration
- [x] Create data/index.js exports

### Phase 3: Domain Logic ✅ DONE
- [x] Create giftStateMachine.js (state transitions)
- [x] Create giftRules.js (business rules)
- [x] Create deliveryPolicies.js
- [x] Create validators.js
- [x] Create domain/index.js exports

### Phase 4: Hooks ✅ DONE
- [x] Create useGiftOrder.js (checkout flow)
- [x] Create useGiftSend.js (send gift from connection)
- [x] Create useGiftInbox.js (received gifts)
- [x] Create useGiftRedeem.js (redeem flow)
- [x] Create useGiftAdmin.js (admin management)
- [x] Create hooks/index.js exports

### Phase 5: UI Components ✅ DONE
- [x] Create SendGiftModal (4-step wizard)
- [x] Create ProductSelectionStep
- [x] Create GiftOptionsStep
- [x] Create PaymentStep
- [x] Create SuccessStep
- [x] Create RedeemGiftModal
- [x] Create SwapGiftModal
- [x] Create GiftCard

### Phase 6: Integration ✅ DONE
- [x] Create GiftsTabNew using new module
- [x] Add Gift tab to ConnectionDetailModal
- [x] Update MyEcard to use GiftsTabNew
- [x] Create giftNotificationHandler service
- [x] Refactor hooks to use notification service

### Phase 7: Admin & Dashboard ✅ DONE
- [x] Create useGiftAdmin hook with full analytics
- [x] Create GiftAnalyticsWidget for dashboard
- [x] Create GiftTransactionTable for admin management
- [x] Create AdminGifts page
- [x] Add "Quà Tặng" tab to AdminDashboard

### Phase 8: Cleanup & Migration ✅ DONE
- [x] Add @deprecated to legacy GiftsTab
- [x] Add @deprecated to legacy GiftCard
- [x] Add @deprecated to legacy useGifts hook
- [x] Update public API exports

---

## Success Criteria

1. ✅ Gift module self-contained in features/gift/
2. ✅ Clean separation: ui/, domain/, data/, hooks/
3. ✅ Public API via index.js only
4. ✅ No circular dependencies
5. ✅ Notification handling via service
6. ✅ Admin views implemented (AdminGifts + Dashboard widget)
7. ✅ Legacy code deprecated

---

## Public API (index.js)

```javascript
// Hooks
export { useGiftOrder, useGiftSend, useGiftInbox, useGiftRedeem, useGiftAdmin } from './hooks';

// UI Components
export { SendGiftModal, RedeemGiftModal, SwapGiftModal, GiftCard } from './ui';

// Admin UI Components
export { GiftAnalyticsWidget, GiftTransactionTable } from './ui/admin';

// Types & Constants
export { GIFT_STATUS, GIFT_ORDER_STATUS, DELIVERY_MODE, OCCASION } from './types';

// Domain rules
export { canRedeem, canSwap, isExpired, canTransition } from './domain/giftStateMachine';

// Notification handlers
export { notifyGiftReceived, notifyGiftRedeemed, notifyGiftDelivered } from './services/giftNotificationHandler';
```

---

## CHANGELOG

### 2026-01-01
- ✅ Phase 8 DONE: Cleanup & Migration complete
- Marked legacy GiftsTab, GiftCard, useGifts as @deprecated
- All legacy files have migration instructions

- ✅ Phase 7 DONE: Admin dashboard and management
- Created useGiftAdmin hook with full analytics
- Created GiftAnalyticsWidget for dashboard
- Created GiftTransactionTable for admin management
- Created AdminGifts page

- ✅ Phase 6 DONE: Full integration with MyEcard and ConnectionDetailModal
- Created giftNotificationHandler service
- Refactored hooks to use notification service
- SendGiftModal now uses new 4-step gift module

### 2025-12-31
- ✅ Phase 5 DONE: All UI components created
- ✅ Phase 4 DONE: All hooks created (order, send, inbox, redeem)
- ✅ Phase 3 DONE: Domain logic with state machine
- ✅ Phase 2 DONE: Data layer repositories
- ✅ Phase 1 DONE: Foundation types and entities

---

## Migration Guide

### From legacy to new module

```javascript
// ❌ OLD - Legacy import
import GiftsTab from '@/components/ecard/GiftsTab';
import GiftCard from '@/components/ecard/GiftCard';
import { useGifts } from '@/components/ecard';

// ✅ NEW - Module import
import GiftsTabNew from '@/components/ecard/GiftsTabNew';
import { GiftCard, useGiftInbox, useGiftSend } from '@/components/features/gift';
```

### For admin features

```javascript
import { 
  useGiftAdmin, 
  GiftAnalyticsWidget, 
  GiftTransactionTable 
} from '@/components/features/gift';
``