# 🏢 SaaS Module

> **Version**: 1.0.0  
> **Status**: Phase 1 Complete (Foundation & Types)  
> **Last Updated**: 2025-01-19

---

## 📋 Mục đích (Purpose)

Module SaaS quản lý toàn bộ tính năng multi-tenant platform:
- **Tenant Management**: Quản lý shops/tenants
- **Billing & Invoicing**: Tự động hóa hóa đơn, thanh toán
- **Commission Processing**: Tính hoa hồng từ orders
- **Usage Metering**: Theo dõi và enforce giới hạn theo plan
- **Subscription Lifecycle**: Quản lý trial, renew, suspend
- **Marketplace**: Browse shops, featured shops

---

## 📁 Cấu trúc (Structure)

```
features/saas/
├── types/                        # DTOs & Constants
│   ├── SaasDTO.js                # All type definitions
│   └── index.js                  # Public exports
├── domain/                       # Business Logic (Pure Functions)
│   ├── billingRules.js           # Invoice calculation, due dates
│   ├── commissionCalculator.js   # Commission calculation
│   ├── usageLimits.js            # Plan limits & enforcement
│   ├── subscriptionRules.js      # Subscription lifecycle
│   ├── tenantValidators.js       # Tenant validation
│   ├── pricingTiers.js           # Plan pricing & features
│   └── index.js
├── data/                         # Repositories (API calls)
│   ├── tenantRepository.js
│   ├── subscriptionRepository.js
│   ├── invoiceRepository.js
│   ├── commissionRepository.js
│   ├── usageRepository.js
│   └── index.js
├── hooks/                        # React Hooks (Orchestration)
│   ├── useTenant.js
│   ├── useBilling.js
│   ├── useCommission.js
│   ├── useUsageLimits.js
│   ├── useSubscription.js
│   ├── useTenantScope.js
│   ├── useMarketplace.js
│   └── index.js
├── ui/                           # UI Components
│   ├── tenant/
│   ├── billing/
│   ├── commission/
│   ├── usage/
│   ├── marketplace/
│   └── index.js
├── README.md                     # This file
└── index.js                      # Public API
```

---

## 🚀 Cách sử dụng (Usage)

### Import từ Module Public API

```javascript
// ✅ ĐÚNG - Import từ module public API
import { 
  // Constants
  COMMISSION_STATUS,
  INVOICE_STATUS,
  PLAN_LIMITS,
  PLAN_PRICES,
  RESOURCE_TYPES,
  
  // Domain functions
  calculateCommission,
  calculateInvoiceAmounts,
  checkResourceLimit,
  validateTenantData,
  
  // Repositories
  tenantRepository,
  invoiceRepository,
  commissionRepository,
  
  // Hooks
  useTenantList,
  useBilling,
  useCommission,
  useUsageLimits,
  useTenantScope,
  useMarketplace,
  
  // UI Components
  InvoiceCard,
  UsageLimitBadge,
  CommissionReport,
  ShopCard,
  ShopFilter,
  
} from '@/components/features/saas';

// ❌ SAI - Import sâu vào nội bộ module
import { calculateCommission } from '@/components/features/saas/domain/commissionCalculator';
```

### Sử dụng Constants

```javascript
import { 
  COMMISSION_STATUS, 
  INVOICE_STATUS,
  PLAN_NAMES,
  PLAN_LIMITS 
} from '@/components/features/saas';

// Check commission status
if (commission.status === COMMISSION_STATUS.APPROVED) {
  // ...
}

// Get plan limits
const freeLimits = PLAN_LIMITS[PLAN_NAMES.FREE];
console.log(freeLimits.max_products); // 50
```

---

## 📜 Luật riêng module (Module Rules)

### 1. Domain Layer - Pure Functions Only
```javascript
// ✅ ĐÚNG - Pure function, không side effects
export function calculateCommission(orderAmount, commissionRate) {
  const commissionAmount = Math.round(orderAmount * (commissionRate / 100));
  return {
    commission_amount: commissionAmount,
    shop_revenue: orderAmount - commissionAmount
  };
}

// ❌ SAI - Có side effects (API call)
export async function calculateCommission(orderId) {
  const order = await base44.entities.Order.get(orderId); // Side effect!
  return order.total * 0.03;
}
```

### 2. Data Layer - API Calls Only
```javascript
// ✅ ĐÚNG - Chỉ gọi API, không business logic
export async function createInvoice(invoiceData) {
  return await base44.entities.Invoice.create(invoiceData);
}

// ❌ SAI - Có business logic
export async function createInvoice(subscription) {
  const total = subscription.price * 1.1; // Business logic!
  return await base44.entities.Invoice.create({ total });
}
```

### 3. Hooks - Orchestrate Domain + Data
```javascript
// ✅ ĐÚNG - Hook orchestrate domain và data
export function useCreateCommission() {
  return useMutation({
    mutationFn: async ({ order, tenant }) => {
      // 1. Domain: Calculate
      const calc = calculateCommission(order.total_amount, tenant.commission_rate);
      
      // 2. Data: Save
      return await commissionRepository.create({
        order_id: order.id,
        ...calc
      });
    }
  });
}
```

### 4. Tenant Isolation Critical
- Mọi query PHẢI được scope by tenant
- Không cho phép cross-tenant data access
- SuperAdmin có thể switch tenant context

### 5. Usage Limits Enforcement
- Check limits TRƯỚC khi tạo resource
- Block action nếu at/over limit
- Show upgrade prompt khi near limit (80%)

---

## 🔗 Dependencies

### Internal Dependencies
- `@/api/base44Client` - API client
- `@tanstack/react-query` - Data fetching
- `@/components/shared/ui` - Shared UI components
- `features/checkout` - Order integration

### Entity Dependencies
- `Tenant` - Shop/tenant information
- `Subscription` - Subscription records
- `Invoice` - Billing invoices
- `Commission` - Commission records
- `ShopProduct` - Shop products
- `Order` - Orders with commission

---

## ⚠️ Lưu ý quan trọng (Important Notes)

### Security
- **Tenant Isolation**: Data PHẢI được isolate giữa các tenant
- **Permission Check**: Verify user có quyền trước mọi operation
- **Rate Limiting**: Enforce usage limits trước khi process

### Performance
- Cache tenant data (staleTime: 5-10 phút)
- Pagination cho list queries
- Lazy load invoice details

### Backend Functions
Module sử dụng các backend functions:
- `calculateOrderCommission` - Tính commission cho order
- `processMonthlyCommissionSettlement` - Settlement hàng tháng
- `generateMonthlyInvoices` - Tạo invoice tự động
- `sendBillingReminders` - Gửi email nhắc thanh toán
- `processSubscriptionRenewal` - Renew/suspend subscription
- `suspendExpiredTenants` - Suspend tenant quá hạn
- `updateTenantUsage` - Cập nhật usage counts

---

## 📊 Progress Tracking

| Phase | Status | Tasks | Files |
|-------|--------|-------|-------|
| Phase 1: Foundation & Types | ✅ Complete | 5/5 | 7 |
| Phase 2: Domain Layer | ✅ Complete | 6/6 | 6 |
| Phase 3: Data Layer | ✅ Complete | 5/5 | 5 |
| Phase 4: Hooks Layer | ✅ Complete | 7/7 | 7 |
| Phase 5: UI Layer | ✅ Complete | 5/5 | 6 |
| Phase 6: Adapters & Migration | ✅ Complete | 4/4 | 8 |
| Phase 7: Documentation | 🔄 In Progress | 1/5 | 1 |

**Overall Progress**: 33/37 tasks (89%)

---

## 📝 Changelog

### [2025-01-19] - Phases 1-6 Complete
**Phase 1: Foundation & Types**
- ✅ Created module structure (types/, domain/, data/, hooks/, ui/)
- ✅ Defined all constants and type definitions
- Files: 7

**Phase 2: Domain Layer**
- ✅ billingRules.js - Invoice calculations, due dates, reminders
- ✅ commissionCalculator.js - Commission calculations, aggregations
- ✅ usageLimits.js - Resource limit checks, upgrade suggestions
- ✅ subscriptionRules.js - Subscription lifecycle rules
- ✅ tenantValidators.js - Tenant validation, access control
- ✅ pricingTiers.js - Plan comparison, pricing calculations
- Files: 6

**Phase 3: Data Layer**
- ✅ tenantRepository.js - Tenant CRUD operations
- ✅ subscriptionRepository.js - Subscription management
- ✅ invoiceRepository.js - Invoice operations
- ✅ commissionRepository.js - Commission tracking
- ✅ usageRepository.js - Usage tracking
- Files: 5

**Phase 4: Hooks Layer**
- ✅ useTenant.js - Tenant management hooks
- ✅ useBilling.js - Billing & invoice hooks
- ✅ useCommission.js - Commission tracking hooks
- ✅ useUsageLimits.js - Usage enforcement hooks
- ✅ useSubscription.js - Subscription lifecycle hooks
- ✅ useTenantScope.js - Multi-tenant isolation hooks
- ✅ useMarketplace.js - Marketplace browsing hooks
- Files: 7

**Phase 5: UI Layer**
- ✅ InvoiceCard - Invoice display with status
- ✅ CommissionReport - Shop commission report
- ✅ UsageLimitBadge - Usage limit indicator
- ✅ UpgradePromptModal - Upgrade CTA modal
- ✅ ShopCard - Marketplace shop card
- ✅ ShopFilter - Marketplace filters
- Files: 6

**Phase 6: Adapters**
- ✅ Service adapters (3 files)
- ✅ Hook adapters (5 files)
- ✅ Full backward compatibility maintained
- Files: 8

**Total Files Created**: 39 files
**Architecture**: ✅ Clean separation of concerns achieved