# 🔔 Notification Module

> **Version**: 2.1.0 (Event-Driven Architecture)  
> **Last Updated**: 2025-01-21  
> **Architecture**: Event Registry + Middleware Pipeline + Domain Handlers

## 📋 Mục Đích

Module notification cung cấp hệ thống thông báo tập trung cho 3 actor chính:
- **Client (User)**: Khách hàng, người dùng cuối
- **Admin**: Quản trị viên, nhân viên
- **Tenant**: Chủ shop, quản lý tenant

## 📁 Cấu Trúc v2.1

```
features/notification/
├── types/                    # DTOs, Constants, Enums
│   ├── NotificationDTO.js
│   ├── NotificationTypes.js
│   ├── NotificationPriority.js
│   ├── EventTypes.js         # ✨ NEW: 60+ event constants
│   └── index.js
├── core/                     # Core Engine (Enhanced)
│   ├── notificationEngine.js # ✨ UPGRADED: emit(), on(), once()
│   ├── notificationRouter.js
│   ├── priorityManager.js
│   ├── realtimePoller.js
│   ├── eventRegistry.js      # ✨ NEW: Event→Handler registry
│   ├── eventQueue.js         # ✨ NEW: Priority queue
│   ├── eventMiddleware.js    # ✨ NEW: Middleware pipeline
│   └── index.js
├── domain/                   # Business Rules
│   ├── notificationRules.js
│   ├── recipientResolver.js
│   ├── actionWorkflow.js
│   ├── soundPolicy.js
│   ├── eventSchemas.js       # ✨ NEW: Payload validation
│   └── index.js
├── data/                     # Repositories (unchanged)
│   └── ...
├── hooks/                    # React Hooks (unchanged)
│   └── ...
├── ui/                       # UI Components (unchanged)
│   └── ...
├── services/                 # ✨ MAJOR REFACTOR
│   ├── NotificationServiceFacade.js # Slim orchestrator
│   ├── events/               # ✨ NEW: Domain-grouped handlers
│   │   ├── commerce/         # Order, Payment, Inventory
│   │   ├── farming/          # Harvest, Price
│   │   ├── social/           # Social, Review
│   │   ├── crm/              # Customer, Referral
│   │   ├── saas/             # Tenant, Subscription, Usage
│   │   ├── system/           # System alerts
│   │   └── index.js
│   ├── middleware/           # ✨ NEW: Reusable middlewares
│   │   ├── loggingMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── dedupeMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── preferencesMiddleware.js
│   │   └── index.js
│   ├── analytics/            # ✨ NEW: Event tracking
│   │   ├── EventTracker.js
│   │   └── index.js
│   ├── registerHandlers.js   # ✨ NEW: Auto-init
│   └── index.js
├── adapters/                 # Backward Compatibility
│   └── ...
├── README.md
└── index.js                  # Public API
```

## 🚀 Cách Sử Dụng

### Import từ Module

```javascript
// ✅ ĐÚNG - Import từ public API
import { 
  useClientNotifications,
  useAdminNotifications,
  useTenantNotifications,
  NotificationServiceFacade,
  ClientNotificationBell,
  AdminNotificationBell,
  TenantNotificationBell,
  // v2.1 additions
  notificationEngine,
  OrderEvents,
  PaymentEvents,
  eventTracker
} from '@/components/features/notification';

// ❌ SAI - Import sâu vào nội bộ module
import { userNotificationRepository } from '@/components/features/notification/data/userNotificationRepository';
```

### Hooks

```javascript
// Client notifications (10s polling)
function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useClientNotifications(user.email);
  // ...
}

// Admin notifications (3s polling)
function AdminDashboard() {
  const { notifications, urgentCount, markAllAsRead } = useAdminNotifications(admin.email);
  // ...
}

// Tenant notifications (5s polling, tenant-scoped)
function ShopDashboard() {
  const { notifications, pendingActions } = useTenantNotifications(user.email, tenantId);
  // ...
}
```

### UI Components

```jsx
// Client
<ClientNotificationBell currentUser={user} />

// Admin
<AdminNotificationBell user={admin} />

// Tenant
<TenantNotificationBell userEmail={user.email} tenantId={tenant.id} />
```

### Creating Notifications v2.1

#### Option 1: Event-Based (Recommended)

```javascript
import { notificationEngine, OrderEvents, PaymentEvents } from '@/components/features/notification';

// Emit events - handlers auto-execute
await notificationEngine.emit(OrderEvents.CREATED, { order, customer });
await notificationEngine.emit(PaymentEvents.CONFIRMED, { order });
await notificationEngine.emit('harvest.reminder', { order, lot, daysUntilHarvest: 3 });

// Async processing (low-priority)
await notificationEngine.emit('price.fomo', { lot, hoursLeft: 12 }, { async: true, priority: 'low' });

// Register custom handler
notificationEngine.on('order.delivered', async (payload) => {
  console.log('Order delivered:', payload.order.id);
});

// One-time handler
notificationEngine.once('system.maintenance', async (payload) => {
  console.log('Maintenance alert received');
});
```

#### Option 2: Service Facade (Legacy Compatible)

```javascript
import { NotificationServiceFacade } from '@/components/features/notification';

// Notify user
await NotificationServiceFacade.notifyUser({
  recipientEmail: 'user@example.com',
  type: 'order_confirmed',
  title: '✅ Đơn Hàng Đã Xác Nhận',
  message: 'Đơn hàng #12345 đang được xử lý',
  priority: 'high'
});

// Convenience methods (auto-delegate to engine)
await NotificationServiceFacade.notifyNewOrder(order, customer);
await NotificationServiceFacade.notifyOrderStatusChange(order, 'shipping');
await NotificationServiceFacade.notifyPaymentConfirmed(order);
```

### Event Types Available

```javascript
import { 
  OrderEvents,      // order.created, order.shipped, etc.
  PaymentEvents,    // payment.confirmed, payment.failed
  HarvestEvents,    // harvest.reminder, harvest.ready
  PriceEvents,      // price.fomo, price.increased
  SocialEvents,     // social.post_liked, social.user_followed
  ReferralEvents,   // referral.commission_earned, referral.rank_upgraded
  // ... and more
} from '@/components/features/notification';
```

## 📐 Quy Tắc Module

### 1. UI chỉ sử dụng Hooks
```javascript
// ✅ ĐÚNG
const { notifications } = useClientNotifications(email);

// ❌ SAI - UI gọi trực tiếp repository
const notifications = await userNotificationRepository.list();
```

### 2. Hooks orchestrate Domain + Data
```javascript
// Hook sử dụng repository và domain rules
const result = await repository.listForUser(email);
const sorted = priorityManager.sortByPriority(result.data);
```

### 3. Service Facade cho Business Logic
```javascript
// Service che giấu complexity
await NotificationServiceFacade.notifyNewOrder(order, customer);
// Bên trong: resolve recipients, create notification, trigger side effects
```

### 4. Tenant Isolation
```javascript
// Tenant notifications PHẢI có tenant_id
await NotificationServiceFacade.notifyTenant({
  tenantId: 'tenant-123', // BẮT BUỘC
  // ...
});
```

### 5. Priority-Based Behavior
| Priority | Polling | Sound | Browser Notify |
|----------|---------|-------|----------------|
| urgent   | 1s      | ✅    | ✅             |
| high     | 3s      | ✅    | ✅             |
| normal   | 5s      | ❌    | ❌             |
| low      | 10s     | ❌    | ❌             |

## 🔄 Migration từ Legacy

### Notification Service
```javascript
// OLD:
import NotificationService from '@/components/notifications/NotificationService';
NotificationService.notifyNewOrder(order, customer);

// NEW (adapter - backward compatible):
import { NotificationServiceAdapter as NotificationService } from '@/components/features/notification';
NotificationService.notifyNewOrder(order, customer);

// NEW (direct - recommended):
import { NotificationServiceFacade } from '@/components/features/notification';
NotificationServiceFacade.notifyNewOrder(order, customer);
```

### useRealTimeNotifications
```javascript
// OLD:
import { useRealTimeNotifications } from '@/components/notifications/useRealTimeNotifications';
const { notifications } = useRealTimeNotifications({ userEmail, isAdmin: true });

// NEW (adapter):
import { useRealTimeNotificationsAdapter as useRealTimeNotifications } from '@/components/features/notification';

// NEW (direct - recommended):
import { useAdminNotifications } from '@/components/features/notification';
const { notifications } = useAdminNotifications(adminEmail);
```

## 📊 Entities

| Entity | Actor | Mô tả |
|--------|-------|-------|
| Notification | Client | Thông báo cho user |
| AdminNotification | Admin | Thông báo cho admin |
| TenantNotification | Tenant | Thông báo cho shop owner (NEW) |

## ⚠️ Lưu Ý Quan Trọng

1. **Broadcast**: `recipient_email = null` sẽ broadcast đến tất cả actors của loại đó
2. **Tenant Isolation**: Tenant notifications PHẢI có `tenant_id`
3. **requires_action**: Thông báo cần xử lý sẽ hiển thị khác biệt
4. **Optimistic Updates**: Mark as read được update ngay trên UI
5. **Sound Alerts**: Chỉ urgent/high priority mới có sound

## 🎯 Polling Intervals

| Actor | Default | With Urgent |
|-------|---------|-------------|
| Client | 10s | 5s |
| Admin | 3s | 1.5s |
| Tenant | 5s | 3s |

---

## 🆕 What's New in v2.1

### Event-Driven Architecture

**Before v1.0**:
```javascript
// Facade có 30+ methods lẫn lộn
NotificationServiceFacade.notifyNewOrder(order, customer);
NotificationServiceFacade.notifyPaymentConfirmed(order);
NotificationServiceFacade.notifyHarvestReady(order, lot);
// ... 27 more methods
```

**Now v2.1**:
```javascript
// Event-based, auto-routed
notificationEngine.emit('order.created', { order, customer });
notificationEngine.emit('payment.confirmed', { order });
notificationEngine.emit('harvest.ready', { order, lot });

// Handlers auto-registered by domain
// commerce/ → handles order, payment, inventory
// farming/  → handles harvest, price
// social/   → handles like, comment, follow
// crm/      → handles customer, referral
// saas/     → handles tenant, subscription
// system/   → handles alerts
```

### Key Features

1. **Event Registry** - Dynamic handler registration
2. **Middleware Pipeline** - Logging, validation, dedupe, rate-limit, preferences
3. **Priority Queue** - Async processing for low-priority events
4. **Event Schemas** - Payload validation before processing
5. **Analytics** - Track emit count, success rate, latency
6. **User Preferences** - Let users disable specific notification types
7. **Domain Grouping** - 14 handlers in 6 domain groups

### Migration from v1.0 to v2.1

**No Breaking Changes** - All v1.0 facade methods still work:

```javascript
// v1.0 method - still works
await NotificationServiceFacade.notifyNewOrder(order, customer);

// Internally delegates to:
await notificationEngine.emit('order.created', { order, customer });
```

**New Code Should Use**:
```javascript
// Direct event emission (recommended)
await notificationEngine.emit('order.created', { order, customer });
```

### Analytics & Monitoring

```javascript
import { eventTracker, notificationEngine } from '@/components/features/notification';

// Get overall stats
const stats = eventTracker.getSummary();
console.log(stats);
// {
//   totalEvents: 1523,
//   successRate: '98.2%',
//   avgLatency: '45ms',
//   eventTypes: 28
// }

// Get event-specific stats
const orderStats = eventTracker.getEventStats('order.created');
console.log(orderStats);
// {
//   emits: 145,
//   successes: 143,
//   failures: 2,
//   successRate: 98,
//   avgLatency: 32
// }

// Engine stats
const engineStats = await notificationEngine.getStats();
console.log(engineStats);
// {
//   events: { totalEvents: 1523, ... },
//   queue: { urgent: 0, high: 2, normal: 15, low: 8 },
//   registry: { exactEvents: 25, wildcardPatterns: 3 }
// }
```

---

> **Xem thêm**: 
> - `NotificationModuleRefactorPlan.md` - Module architecture details
> - `NotificationEventBasedUpgrade.md` - v2.1 upgrade plan & implementation