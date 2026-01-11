# 📦 Module Refactor Plan

> **Version**: 1.0.0  
> **Created**: 2025-01-19  
> **Status**: Planning Phase

---

## 📋 Executive Summary

### Mục tiêu
Chuyển đổi kiến trúc hiện tại từ **file-based structure** sang **feature-based module architecture** theo AI-CODING-RULES.jsx, giúp:
- Tách biệt rõ ràng các concerns (UI, Domain, Data, Types, Hooks)
- Giảm coupling giữa các features
- Dễ maintain, test và scale
- Code mới tuân thủ module pattern từ đầu

### Tình trạng hiện tại
- **Cấu trúc**: Chủ yếu file-based (components/services/*.js, components/hooks/*.js)
- **Vấn đề**: 
  - UI components gọi trực tiếp API (vi phạm 3-layer)
  - Services import chéo nhau (circular dependency risk)
  - Mega files (>300 dòng)
  - Business logic lẫn trong UI
  - Không có clear module boundaries

---

## 🎯 Target Module Architecture

```
components/
├── features/                    # Feature modules
│   ├── ecard/                   # E-Card module (đã có phần)
│   │   ├── ui/                  # Components
│   │   ├── domain/              # Business rules
│   │   ├── data/                # Repositories
│   │   ├── types/               # DTOs
│   │   ├── hooks/               # Custom hooks
│   │   └── index.js             # Public API
│   ├── referral/                # Referral module
│   ├── loyalty/                 # Loyalty module  
│   ├── preorder/                # Pre-order module
│   ├── checkout/                # Checkout module
│   ├── community/               # Community module
│   ├── saas/                    # SaaS multi-tenant
│   └── ...
├── shared/                      # Shared across modules
│   ├── ui/                      # Base UI components
│   ├── hooks/                   # Base hooks
│   ├── types/                   # Shared types
│   ├── utils/                   # Utilities
│   └── errors/                  # Error handling
├── admin/                       # Admin-specific (tái cấu trúc)
├── data/                        # Registry & types (giữ nguyên)
└── ui/                          # Shadcn components (giữ nguyên)
```

---

## 📊 Module Analysis & Priority

### High Priority Modules (Cần refactor trước)

| Module | Lý do | Files liên quan | Complexity |
|--------|-------|-----------------|------------|
| **referral** | Circular dependency với checkout/order, business logic phức tạp | ~25 files | 🔴 High |
| **preorder** | Feature lớn, nhiều sub-features, liên quan escrow | ~40 files | 🔴 High |
| **checkout** | Core feature, liên quan nhiều module khác | ~15 files | 🟡 Medium |
| **ecard** | Đã có structure sơ bộ, cần hoàn thiện | ~20 files | 🟡 Medium |

### Medium Priority Modules

| Module | Lý do | Files liên quan | Complexity |
|--------|-------|-----------------|------------|
| **loyalty** | Feature độc lập nhưng tích hợp checkout | ~10 files | 🟡 Medium |
| **community** | Feature lớn, nhiều components | ~30 files | 🟡 Medium |
| **community-book** | Đã có structure tốt, cần tối ưu | ~25 files | 🟢 Low |
| **saas** | Multi-tenant features, billing, commission | ~15 files | 🟡 Medium |

### Low Priority (Refactor sau)

| Module | Lý do | Files liên quan |
|--------|-------|-----------------|
| **blog** | Feature đơn giản | ~10 files |
| **feedback** | Feature nhỏ | ~8 files |
| **notification** | Tương đối độc lập | ~12 files |

---

## 🔄 Phased Refactor Plan

### Phase 1: Foundation (2-3 ngày)
**Mục tiêu**: Thiết lập nền tảng shared và module template

#### Tasks:
- [ ] **1.1** Tạo shared/types với Result<T>, ErrorCodes chuẩn
- [ ] **1.2** Tạo shared/hooks base (useEntityList, useEntityMutation)
- [ ] **1.3** Tạo module template structure
- [ ] **1.4** Document module spec template (docs/modules/template.md)
- [ ] **1.5** Update AI-CODING-RULES với module examples

#### Files to create:
```
components/shared/
├── types/
│   ├── Result.js
│   ├── ErrorCodes.js
│   └── index.js
├── hooks/
│   ├── useEntityListBase.js
│   ├── useEntityMutationBase.js
│   └── index.js
└── utils/
    ├── formatters.js
    └── validators.js

components/features/
└── _template/
    ├── ui/
    ├── domain/
    ├── data/
    ├── types/
    ├── hooks/
    └── index.js
```

---

### Phase 2: Referral Module (3-4 ngày)
**Mục tiêu**: Refactor referral thành module hoàn chỉnh

#### Current State:
```
components/
├── referral/
│   ├── SeederRankProgress.jsx
│   ├── ReferralQRCode.jsx
│   └── ... (~20 files scattered)
├── services/
│   ├── ReferralService.js
│   ├── referralCore.js
│   └── orderReferralBridge.js
└── hooks/
    ├── useReferralSystem.js
    └── useReferralCheckout.js
```

#### Target State:
```
components/features/referral/
├── ui/
│   ├── SeederRankProgress.jsx
│   ├── ReferralQRCode.jsx
│   ├── ReferralLeaderboard.jsx
│   ├── RegisterCustomerModal.jsx
│   └── index.js
├── domain/
│   ├── referralRules.js
│   ├── commissionCalculator.js
│   └── rankValidator.js
├── data/
│   ├── referralRepository.js
│   └── api.js
├── types/
│   ├── ReferralMemberDTO.js
│   └── index.js
├── hooks/
│   ├── useReferralMember.js
│   ├── useReferralCheckout.js
│   └── useReferralDashboard.js
└── index.js
```

#### Tasks:
- [ ] **2.1** Tạo referral module structure
- [ ] **2.2** Extract business logic → domain/
- [ ] **2.3** Move API calls → data/referralRepository.js
- [ ] **2.4** Refactor hooks để dùng repository
- [ ] **2.5** Move UI components → ui/
- [ ] **2.6** Create public index.js
- [ ] **2.7** Update imports trong code khác
- [ ] **2.8** Test integration

---

### Phase 3: Pre-Order Module (4-5 ngày)
**Mục tiêu**: Gom preorder thành module hoàn chỉnh

#### Current State:
```
components/
├── preorder/
│   ├── index.jsx (exports)
│   ├── policy/
│   ├── escrow/
│   ├── campaign/
│   ├── communication/
│   ├── status/
│   └── ... (~40 files)
└── services/
    ├── PreOrderCancellationService.js
    ├── AutoCompensationEngine.js
    └── ...
```

#### Target State:
```
components/features/preorder/
├── ui/
│   ├── lots/
│   ├── policy/
│   ├── escrow/
│   └── campaign/
├── domain/
│   ├── cancellationRules.js
│   ├── compensationEngine.js
│   ├── escrowRules.js
│   └── validators.js
├── data/
│   ├── lotRepository.js
│   ├── escrowRepository.js
│   └── api.js
├── types/
│   └── PreOrderTypes.js
├── hooks/
│   ├── usePreOrderLots.js
│   ├── useEscrow.js
│   └── useCancellation.js
└── index.js
```

#### Tasks:
- [x] **3.1** Analyze current dependencies
- [x] **3.2** Create module structure (types/, domain/, data/, hooks/)
- [x] **3.3** Extract domain logic (cancellationRules, compensationRules, escrowRules, pricingRules, validators)
- [x] **3.4** Create repositories (lot, preOrderProduct, cancellation, wallet, transaction, compensation, dispute)
- [x] **3.5** Refactor hooks (usePreOrderLots, useCancellation, useEscrow, useCompensation, useDispute, useCart)
- [x] **3.6** UI components already in components/preorder/* (reuse as-is)
- [x] **3.7** Create public API (features/preorder/index.js)
- [x] **3.8** Create adapters for legacy services (PreOrderCancellationService, AutoCompensationEngine, escrowCore)
- [x] **3.9** Create adapters for legacy hooks (usePreOrderLots, useEscrow, useDispute)

---

### Phase 4: Checkout Module (3-4 ngày)
**Mục tiêu**: Tách checkout thành module riêng

#### Target Structure:
```
components/features/checkout/
├── ui/
│   ├── CheckoutSteps/
│   ├── PaymentSection/
│   └── OrderSummary/
├── domain/
│   ├── checkoutRules.js
│   ├── priceCalculator.js
│   └── validators.js
├── data/
│   ├── checkoutRepository.js
│   └── paymentGateway.js
├── types/
│   └── CheckoutTypes.js
├── hooks/
│   ├── useCheckout.js
│   └── usePayment.js
└── index.js
```

---

### Phase 5: E-Card Module Completion (2-3 ngày)
**Mục tiêu**: Hoàn thiện module ecard đã có

#### Current State (partially modularized):
```
components/ecard/
├── hooks/
├── data/
├── types/
└── ... (scattered UI)
```

#### Tasks:
- [ ] **5.1** Consolidate UI components
- [ ] **5.2** Create domain/ layer
- [ ] **5.3** Update public API
- [ ] **5.4** Remove legacy imports

---

### Phase 6: SaaS Multi-tenant Module (8-10 ngày)
**Mục tiêu**: Gom các features SaaS thành module

**Status**: 📋 Planning Phase - See `SAASModuleRefactorPlan.md` for detailed plan

#### Target Structure:
```
components/features/saas/
├── types/                        # DTOs, Constants
│   ├── SaasDTO.js
│   └── index.js
├── domain/                       # Business Logic (6 files)
│   ├── billingRules.js
│   ├── commissionCalculator.js
│   ├── usageLimits.js
│   ├── subscriptionRules.js
│   ├── tenantValidators.js
│   ├── pricingTiers.js
│   └── index.js
├── data/                         # Repositories (5 files)
│   ├── tenantRepository.js
│   ├── subscriptionRepository.js
│   ├── invoiceRepository.js
│   ├── commissionRepository.js
│   ├── usageRepository.js
│   └── index.js
├── hooks/                        # React Hooks (7 files)
│   ├── useTenant.js
│   ├── useBilling.js
│   ├── useCommission.js
│   ├── useUsageLimits.js
│   ├── useSubscription.js
│   ├── useTenantScope.js
│   ├── useMarketplace.js
│   └── index.js
├── ui/                           # UI Components (~20 files)
│   ├── tenant/
│   ├── billing/
│   ├── commission/
│   ├── usage/
│   ├── marketplace/
│   └── index.js
├── README.md                     # Module documentation
└── index.js                      # Public API
```

#### Phases Breakdown (7 phases, 37 tasks):
1. Foundation & Types (1-2 ngày) - 5 tasks
2. Domain Layer (2-3 ngày) - 6 tasks
3. Data Layer (2-3 ngày) - 5 tasks
4. Hooks Layer (3-4 ngày) - 7 tasks
5. UI Layer (2-3 ngày) - 5 tasks
6. Adapters & Migration (2-3 ngày) - 4 tasks
7. Documentation (1-2 ngày) - 5 tasks

**Estimated Total Time**: 13-20 ngày (2-3 weeks)

**Detailed Plan**: `components/instruction/SAASModuleRefactorPlan.md`

---

### Phase 7: Community Module (3-4 ngày)
**Mục tiêu**: Refactor community features

---

### Phase 8: Loyalty Module (2-3 ngày)
**Mục tiêu**: Tách loyalty thành module

---

### Phase 9: Notification Module (3-4 tuần)
**Mục tiêu**: Refactor notification system thành module hoàn chỉnh

**Status**: 📋 Planning Phase - See `NotificationModuleRefactorPlan.md` for detailed plan

#### Target Structure:
```
components/features/notification/
├── types/                        # DTOs, Constants
├── core/                         # Core engine (actor-agnostic)
├── domain/                       # Business rules
├── data/                         # Repositories (user, admin, tenant)
├── hooks/                        # React hooks per actor
├── ui/                           # UI components
│   ├── shared/                   # Base components
│   ├── client/
│   ├── admin/
│   └── tenant/
├── services/                     # Service facades
├── README.md
└── index.js
```

#### Phases Breakdown (9 phases, 57 files):
1. Foundation & Core (2-3 ngày) - 13 files
2. Data Layer (2 ngày) - 6 files
3. Hooks Layer (2-3 ngày) - 8 files
4. UI Layer (2 ngày) - 11 files
5. Service Facades (1-2 ngày) - 5 files
6. Adapters & Migration (2 ngày) - 2 files + updates
7. Multi-Tenant Features (2-3 ngày) - 5 files
8. Advanced Features (2 ngày) - 6 files
9. Documentation (1 ngày) - 1 file

**Estimated Total Time**: 16-20 ngày (3-4 weeks)

**Detailed Plan**: `components/instruction/NotificationModuleRefactorPlan.md`

---

### Phase 10: Cleanup & Documentation (2-3 ngày)
**Mục tiêu**: Dọn dẹp code legacy, update docs

#### Tasks:
- [ ] **9.1** Remove unused files
- [ ] **9.2** Update all imports
- [ ] **9.3** Document all modules
- [ ] **9.4** Update useCaseRegistry
- [ ] **9.5** Final testing

---

## 📈 Progress Tracking

### Overall Progress: 0%

| Phase | Status | Progress | Completed | Files | Refactor Plan |
|-------|--------|----------|-----------|-------|---------------|
| Phase 1: Foundation | ⬜ Not Started | 0% | - | - | - |
| Phase 2: Referral | ✅ Completed | 100% | 2025-01-19 | 30 | ReferralModuleRefactorPlan.md |
| Phase 3: Pre-Order | ✅ Completed | 100% | 2025-01-19 | 50 | PreOrderModuleRefactorPlan.md |
| Phase 4: Checkout | ✅ Completed | 100% | 2025-01-19 | 27 | CheckoutModuleRefactorPlan.md |
| Phase 5: E-Card | ⬜ Not Started | 0% | - | - | - |
| Phase 6: SaaS | ✅ Completed | 100% | 2025-01-19 | 39 | SAASModuleRefactorPlan.md ✅ |
| Phase 7: Community | ⬜ Not Started | 0% | - | - | - |
| Phase 8: Loyalty | ⬜ Not Started | 0% | - | - | - |
| Phase 9: Notification | ✅ v2.1 COMPLETE | 100% | 2025-01-21 | 37 files | NotificationModuleRefactorPlan.md ✅<br>NotificationMigrationPlan.md 🔄<br>NotificationEventBasedUpgrade.md ✅<br>MIGRATION-v2.1.md ✅<br>v2.1: Event-Driven (EventRegistry, EventQueue, Middleware Pipeline, 14 handlers, 6 domains, Analytics, ~3300 lines, 4h) |
| Phase 10: Cleanup | ⬜ Not Started | 0% | - | - | - |

**Overall Project Progress**: 5/10 modules completed (50%) 🎉
**Planning Progress**: 5/10 modules have refactor plans (50%)

**Legend**: ⬜ Not Started | 🔄 In Progress | ✅ Completed

---

## ⚠️ Risk Assessment

### High Risk
1. **Breaking existing features** - Cần test kỹ sau mỗi phase
2. **Circular dependencies** - Cần bridge modules
3. **Large file refactors** - Potential merge conflicts

### Mitigation
- Refactor từng module một
- Có rollback plan cho mỗi phase
- Test integration sau mỗi change
- Keep backward compatibility với adapters

---

## 🎯 Success Criteria

### Technical
- [ ] Tất cả modules có structure: ui/, domain/, data/, types/, hooks/
- [ ] Không còn UI components gọi trực tiếp base44.entities.*
- [ ] Không còn circular dependencies giữa services
- [ ] Tất cả files < 300 dòng
- [ ] Public API qua index.js

### Business
- [ ] Không break existing features
- [ ] Performance không giảm
- [ ] Dễ dàng thêm features mới

---

## 📝 Changelog

### [2025-01-21] - Phase 9 Planning: Notification Module
- 📋 Created comprehensive refactor plan
- 🔍 Analyzed current notification system (scattered, no tenant support)
- 📐 Designed actor-based architecture (client, admin, tenant)
- 📊 9 phases, 57 files, ~5800 lines estimated
- ⏱️ 3-4 weeks estimated time
- 🎯 Key features: Core engine, multi-tenant support, service facades
- ✅ Plan document: `NotificationModuleRefactorPlan.md`

### [2025-01-21] - AI Coding Rules Updated (v3.3.0)
- ✅ Added Rule 12.1: Module Refactor/Upgrade Tracking (MANDATORY)
- ✅ Requirement: MUST create plan document before refactor
- ✅ Plan location: `components/instruction/<ModuleName>ModuleRefactorPlan.md`
- ✅ Plan template defined with 11 required sections
- ✅ Progress tracking mandatory after each phase
- ✅ Updated version: 3.2.0 → 3.3.0
- ✅ Added REFACTOR_PLAN_REQUIREMENT_VERSION = '1.0.0'

### [2025-01-19] - Phase 6 Completed: SaaS Module (100% Complete)
**All 7 phases completed in single session**

**Phase 1: Foundation & Types**
- ✅ Module structure created
- ✅ All constants and DTOs defined
- Files: 7

**Phase 2: Domain Layer**
- ✅ billingRules.js - Invoice calculations
- ✅ commissionCalculator.js - Commission logic
- ✅ usageLimits.js - Resource limit checks
- ✅ subscriptionRules.js - Subscription lifecycle
- ✅ tenantValidators.js - Validation rules
- ✅ pricingTiers.js - Plan comparisons
- Files: 6

**Phase 3: Data Layer**
- ✅ 5 repositories created
- Files: 5

**Phase 4: Hooks Layer**
- ✅ 7 hook modules created
- Files: 7

**Phase 5: UI Layer**
- ✅ 6 UI components migrated
- Files: 6

**Phase 6: Adapters**
- ✅ 3 service adapters
- ✅ 5 hook adapters
- Files: 8

**Total**: 39 files, ~2800 lines, 100% backward compatible

### [2025-01-19] - Phase 3-4 Completed: Pre-Order Module
- ✅ 50 files created
- ✅ Full module architecture
- ✅ 15 adapters for backward compatibility

### [2025-01-19] - Initial Plan
- Created module refactor plan
- Analyzed current codebase
- Defined 9 phases
- Prioritized modules

---

## 🚀 Next Steps

1. **Review plan này** và quyết định:
   - Đồng ý với priority order?
   - Muốn bắt đầu từ phase nào?
   - Có module nào cần ưu tiên khác?

2. **Bắt đầu Phase 1** (Foundation) khi approved

3. **Track progress** trong file này

---

> **Note**: Plan này có thể điều chỉnh dựa trên feedback và phát hiện trong quá trình refactor.