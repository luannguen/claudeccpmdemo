# 🎯 Notification Module - Event-Based Architecture Upgrade

> **Version**: 2.1.0  
> **Created**: 2025-01-21  
> **Updated**: 2025-01-21  
> **Status**: 📋 Planning Phase  
> **Previous**: Actor-Based (client/admin/tenant)  
> **Upgrade**: Full Event-Driven Architecture with Registry, Middleware, Analytics

---

## 📋 Executive Summary

### Vấn Đề Hiện Tại

**Module v1.0** đã chia theo **Actor** (client/admin/tenant) ✅ Tốt cho data isolation
**Nhưng thiếu**:
- ❌ Phân chia theo **Event** → Khó maintain khi thêm events mới
- ❌ **Event Registry** → Hard-coded routing, thêm event phải sửa nhiều file
- ❌ **Middleware Pipeline** → Không reuse logic (logging, rate-limit, dedupe)
- ❌ **Event Validation** → Không validate payload, dễ bug
- ❌ **User Preferences** → Không cho user tắt/bật từng loại notification
- ❌ **Analytics** → Không track event metrics
- ❌ **Priority Queue** → Tất cả xử lý đồng bộ, không async queue

**Ví dụ vấn đề**:
```javascript
// NotificationServiceFacade.js - 314 dòng
// Chứa TẤT CẢ events: order, payment, harvest, FOMO, review, stock, customer...
// → Khó tìm, khó sửa, khó test riêng từng event

static async notifyNewOrder() { ... }
static async notifyOrderStatusChange() { ... }
static async notifyPaymentConfirmed() { ... }
static async notifyHarvestReminder() { ... }
static async notifyLowStock() { ... }
static async notifyNewReview() { ... }
// ... 30+ methods lẫn lộn
```

### Giải Pháp: Full Event-Driven Architecture v2.1

**7 thành phần chính:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION ENGINE v2.1                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   EMITTER   │───▶│  REGISTRY   │───▶│  MIDDLEWARE CHAIN   │  │
│  │ emit(event) │    │ event→handler│   │ log→validate→dedupe │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                                        │               │
│         ▼                                        ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ PREFERENCES │    │   SCHEMAS   │    │   EVENT HANDLERS    │  │
│  │ user prefs  │    │ validation  │    │ commerce/farming/...│  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                                        │               │
│         ▼                                        ▼               │
│  ┌─────────────┐                       ┌─────────────────────┐  │
│  │  ANALYTICS  │◀──────────────────────│   PRIORITY QUEUE    │  │
│  │  tracking   │                       │ urgent/high/normal  │  │
│  └─────────────┘                       └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Lợi ích v2.1:**
- ✅ **Event Registry**: Đăng ký event→handler, tự động dispatch
- ✅ **Middleware Pipeline**: Reuse logic (log, validate, dedupe, rate-limit)
- ✅ **Schema Validation**: Validate payload trước khi xử lý
- ✅ **User Preferences**: Cho user tắt/bật từng loại notification
- ✅ **Priority Queue**: Async queue với priority levels
- ✅ **Analytics Tracking**: Track latency, success rate, volume
- ✅ **Grouped Handlers**: Chia theo domain (commerce, farming, social...)
- ✅ **Single Responsibility**: Mỗi file < 200 dòng, 1 concern rõ ràng

---

## 🎯 Target Architecture v2.1 - Full Event-Driven

### Cấu Trúc Mới

```
features/notification/
├── types/                              # DTOs, Constants (NÂNG CẤP)
│   ├── NotificationDTO.js
│   ├── NotificationTypes.js
│   ├── NotificationPriority.js
│   ├── EventTypes.js                   # ← NEW: Event type constants
│   └── index.js
│
├── core/                               # Core Engine (NÂNG CẤP LỚN)
│   ├── notificationEngine.js           # Enhanced với emit()
│   ├── notificationRouter.js
│   ├── priorityManager.js
│   ├── realtimePoller.js
│   ├── eventRegistry.js                # ← NEW: Event→Handler registry
│   ├── eventQueue.js                   # ← NEW: Priority queue
│   ├── eventMiddleware.js              # ← NEW: Middleware chain
│   └── index.js
│
├── domain/                             # Business Rules (NÂNG CẤP)
│   ├── notificationRules.js
│   ├── recipientResolver.js
│   ├── actionWorkflow.js
│   ├── soundPolicy.js
│   ├── eventSchemas.js                 # ← NEW: Event payload schemas
│   ├── userPreferences.js              # ← NEW: Per-user preferences
│   ├── deduplication.js                # ← NEW: Prevent duplicate notifs
│   └── index.js
│
├── data/                               # Repositories (GIỮ NGUYÊN)
│   ├── baseNotificationRepository.js
│   ├── userNotificationRepository.js
│   ├── adminNotificationRepository.js
│   ├── tenantNotificationRepository.js
│   └── index.js
│
├── hooks/                              # React Hooks (GIỮ NGUYÊN)
│   └── ...
│
├── ui/                                 # UI Components (GIỮ NGUYÊN)
│   └── ...
│
├── services/                           # ← REFACTOR MAJOR
│   ├── NotificationServiceFacade.js    # Slim orchestrator (~100 lines)
│   │
│   ├── events/                         # ← NEW: Domain-Grouped Handlers
│   │   ├── commerce/                   # Business transactions
│   │   │   ├── OrderEventNotifier.js
│   │   │   ├── PaymentEventNotifier.js
│   │   │   ├── InventoryEventNotifier.js
│   │   │   └── index.js
│   │   │
│   │   ├── farming/                    # Pre-order & harvest
│   │   │   ├── PreOrderEventNotifier.js
│   │   │   ├── HarvestEventNotifier.js # ← NEW: Split từ PreOrder
│   │   │   └── index.js
│   │   │
│   │   ├── social/                     # User interactions
│   │   │   ├── SocialEventNotifier.js
│   │   │   ├── CommunityEventNotifier.js
│   │   │   ├── ReviewEventNotifier.js
│   │   │   └── index.js
│   │   │
│   │   ├── crm/                        # Customer relationship
│   │   │   ├── CustomerEventNotifier.js
│   │   │   ├── ReferralEventNotifier.js
│   │   │   └── index.js
│   │   │
│   │   ├── saas/                       # Multi-tenant
│   │   │   ├── TenantEventNotifier.js
│   │   │   ├── SubscriptionEventNotifier.js # ← NEW: Split
│   │   │   ├── BillingEventNotifier.js      # ← NEW: Split
│   │   │   └── index.js
│   │   │
│   │   ├── system/                     # ← NEW: System events
│   │   │   ├── SystemEventNotifier.js
│   │   │   ├── SecurityEventNotifier.js
│   │   │   └── index.js
│   │   │
│   │   └── index.js                    # Export all handlers
│   │
│   ├── middleware/                     # ← NEW: Middleware modules
│   │   ├── loggingMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── dedupeMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── preferencesMiddleware.js
│   │   └── index.js
│   │
│   ├── analytics/                      # ← NEW: Event analytics
│   │   ├── EventTracker.js
│   │   ├── EventMetrics.js
│   │   └── index.js
│   │
│   └── index.js
│
├── adapters/                           # Backward Compatibility
│   └── ...
│
├── README.md
└── index.js                            # Public API
```

### So Sánh v1.0 vs v2.1

| Aspect | v1.0 | v2.1 |
|--------|------|------|
| Facade size | 314 lines | ~100 lines |
| Event routing | Hard-coded | Registry-based |
| Handler organization | None | Domain-grouped (6 groups) |
| Middleware | None | 5 reusable middlewares |
| Validation | None | Schema-based |
| User preferences | None | Per-event toggle |
| Analytics | None | Full tracking |
| Queue | Sync only | Priority async queue |
| Total handlers | 0 | 14 handlers |
| Total files (new) | 0 | ~25 new files |

---

## 🔧 Core Components v2.1 - Chi Tiết

### 1. 📝 Event Registry

**File**: `core/eventRegistry.js`

**Mục đích**: Đăng ký event → handler mapping, tự động dispatch

```javascript
/**
 * EventRegistry - Central registry for event→handler mapping
 * 
 * Benefits:
 * - Decouple event emitter from handlers
 * - Easy to add new events without changing facade
 * - Support multiple handlers per event
 * - Support wildcard patterns (order.*)
 */

class EventRegistry {
  constructor() {
    this.handlers = new Map();        // event → [handlers]
    this.wildcards = new Map();       // pattern → [handlers]
  }

  /**
   * Register handler for event
   * @example
   * registry.register('order.created', OrderEventNotifier.onOrderCreated);
   * registry.register('order.*', OrderAnalytics.track); // Wildcard
   */
  register(eventName, handler, options = {}) {
    const { priority = 0, once = false } = options;
    
    if (eventName.includes('*')) {
      // Wildcard pattern
      const pattern = eventName.replace('*', '(.*)');
      if (!this.wildcards.has(pattern)) {
        this.wildcards.set(pattern, []);
      }
      this.wildcards.get(pattern).push({ handler, priority, once });
    } else {
      // Exact match
      if (!this.handlers.has(eventName)) {
        this.handlers.set(eventName, []);
      }
      this.handlers.get(eventName).push({ handler, priority, once });
    }
    
    return () => this.unregister(eventName, handler); // Return unsubscribe fn
  }

  /**
   * Get all handlers for event (including wildcards)
   */
  getHandlers(eventName) {
    const handlers = [];
    
    // Exact match
    if (this.handlers.has(eventName)) {
      handlers.push(...this.handlers.get(eventName));
    }
    
    // Wildcard matches
    for (const [pattern, patternHandlers] of this.wildcards) {
      if (new RegExp(pattern).test(eventName)) {
        handlers.push(...patternHandlers);
      }
    }
    
    // Sort by priority (higher first)
    return handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if event has handlers
   */
  hasHandlers(eventName) {
    return this.getHandlers(eventName).length > 0;
  }

  /**
   * List all registered events
   */
  listEvents() {
    return [...this.handlers.keys(), ...this.wildcards.keys()];
  }
}

export const eventRegistry = new EventRegistry();
export default eventRegistry;
```

**Usage**:
```javascript
import { eventRegistry } from '../core/eventRegistry';

// Register at module init
eventRegistry.register('order.created', OrderEventNotifier.onOrderCreated);
eventRegistry.register('order.created', OrderAnalytics.trackOrderCreated, { priority: -1 }); // Run after
eventRegistry.register('order.*', AuditLogger.logOrderEvent); // All order events
```

---

### 2. 🔄 Event Middleware Pipeline

**File**: `core/eventMiddleware.js`

**Mục đích**: Chain of responsibility pattern cho cross-cutting concerns

```javascript
/**
 * EventMiddleware - Middleware chain for event processing
 * 
 * Order: logging → validation → dedupe → rateLimit → preferences → handler
 */

class EventMiddlewarePipeline {
  constructor() {
    this.middlewares = [];
  }

  /**
   * Add middleware to pipeline
   * @param middleware - fn(context, next) => Promise<void>
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this; // Chainable
  }

  /**
   * Execute middleware chain
   */
  async execute(context, finalHandler) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      } else {
        // All middlewares passed, call final handler
        await finalHandler(context);
      }
    };
    
    await next();
  }
}

export const eventMiddleware = new EventMiddlewarePipeline();
export default eventMiddleware;
```

**Middlewares Available**:

```javascript
// middleware/loggingMiddleware.js
export const loggingMiddleware = async (context, next) => {
  const start = Date.now();
  console.log(`📧 [${context.eventName}] Started`, context.payload);
  
  try {
    await next();
    console.log(`✅ [${context.eventName}] Completed in ${Date.now() - start}ms`);
  } catch (error) {
    console.error(`❌ [${context.eventName}] Failed:`, error);
    throw error;
  }
};

// middleware/validationMiddleware.js
export const validationMiddleware = async (context, next) => {
  const schema = eventSchemas[context.eventName];
  if (schema) {
    const errors = validatePayload(context.payload, schema);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
  await next();
};

// middleware/dedupeMiddleware.js
export const dedupeMiddleware = async (context, next) => {
  const dedupeKey = generateDedupeKey(context);
  if (await isDuplicate(dedupeKey)) {
    console.log(`⏭️ [${context.eventName}] Skipped (duplicate)`);
    return; // Skip
  }
  await markAsSent(dedupeKey);
  await next();
};

// middleware/rateLimitMiddleware.js
export const rateLimitMiddleware = async (context, next) => {
  const key = `ratelimit:${context.recipientEmail}:${context.eventName}`;
  if (await isRateLimited(key)) {
    console.log(`⏭️ [${context.eventName}] Rate limited for ${context.recipientEmail}`);
    return; // Skip
  }
  await incrementRateLimit(key);
  await next();
};

// middleware/preferencesMiddleware.js
export const preferencesMiddleware = async (context, next) => {
  const { recipientEmail, eventName } = context;
  const isEnabled = await userPreferences.isEnabled(recipientEmail, eventName);
  if (!isEnabled) {
    console.log(`⏭️ [${eventName}] Disabled by user preference`);
    return; // Skip
  }
  await next();
};
```

**Setup Pipeline**:
```javascript
// core/index.js
import { eventMiddleware } from './eventMiddleware';
import { loggingMiddleware, validationMiddleware, ... } from '../services/middleware';

eventMiddleware
  .use(loggingMiddleware)
  .use(validationMiddleware)
  .use(dedupeMiddleware)
  .use(rateLimitMiddleware)
  .use(preferencesMiddleware);
```

---

### 3. 📋 Event Schemas

**File**: `domain/eventSchemas.js`

**Mục đích**: Validate event payload trước khi xử lý

```javascript
/**
 * Event Schemas - Payload validation for each event type
 */

export const EventSchemas = {
  // ========== ORDER EVENTS ==========
  'order.created': {
    order: { required: true, type: 'object', properties: ['id', 'order_number', 'customer_email', 'total_amount'] },
    customer: { required: false, type: 'object' }
  },
  
  'order.status_changed': {
    order: { required: true, type: 'object' },
    oldStatus: { required: false, type: 'string' },
    newStatus: { required: true, type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'] }
  },
  
  // ========== PAYMENT EVENTS ==========
  'payment.verification_needed': {
    order: { required: true, type: 'object', properties: ['id', 'order_number', 'total_amount', 'customer_name'] }
  },
  
  'payment.confirmed': {
    order: { required: true, type: 'object' }
  },
  
  // ========== PRE-ORDER EVENTS ==========
  'harvest.reminder': {
    order: { required: true, type: 'object' },
    lot: { required: true, type: 'object', properties: ['id', 'lot_name', 'product_name', 'estimated_harvest_date'] },
    daysUntilHarvest: { required: true, type: 'number', min: 0 }
  },
  
  'harvest.ready': {
    order: { required: true, type: 'object' },
    lot: { required: true, type: 'object' }
  },
  
  'price.fomo': {
    lot: { required: true, type: 'object' },
    hoursUntilIncrease: { required: true, type: 'number' },
    currentPrice: { required: true, type: 'number' },
    nextPrice: { required: true, type: 'number' }
  },
  
  // ========== SOCIAL EVENTS ==========
  'social.liked': {
    post: { required: true, type: 'object' },
    liker: { required: true, type: 'object', properties: ['email', 'name'] },
    postAuthor: { required: true, type: 'object', properties: ['email'] }
  },
  
  'social.commented': {
    post: { required: true, type: 'object' },
    commenter: { required: true, type: 'object' },
    comment: { required: true, type: 'object' }
  },
  
  'social.mentioned': {
    post: { required: true, type: 'object' },
    mentionedUser: { required: true, type: 'object', properties: ['email'] },
    mentioner: { required: true, type: 'object' }
  },
  
  'social.followed': {
    follower: { required: true, type: 'object', properties: ['email', 'name'] },
    following: { required: true, type: 'object', properties: ['email'] }
  },
  
  // ========== REFERRAL EVENTS ==========
  'referral.commission_earned': {
    referrer: { required: true, type: 'object' },
    order: { required: true, type: 'object' },
    commission: { required: true, type: 'object', properties: ['amount', 'rate'] }
  },
  
  'referral.rank_upgraded': {
    member: { required: true, type: 'object' },
    oldRank: { required: true, type: 'string' },
    newRank: { required: true, type: 'string' }
  },
  
  // ========== TENANT EVENTS ==========
  'tenant.subscription_expiry_warning': {
    tenant: { required: true, type: 'object' },
    daysLeft: { required: true, type: 'number' }
  },
  
  'tenant.usage_limit_warning': {
    tenant: { required: true, type: 'object' },
    resource: { required: true, type: 'string' },
    percentage: { required: true, type: 'number', min: 0, max: 100 }
  }
};

/**
 * Validate payload against schema
 */
export function validatePayload(payload, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];
    
    // Required check
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value === undefined) continue;
    
    // Type check
    if (rules.type === 'object' && typeof value !== 'object') {
      errors.push(`${field} must be an object`);
    }
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    
    // Enum check
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
    
    // Min/Max check
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be >= ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} must be <= ${rules.max}`);
    }
    
    // Required properties check (for objects)
    if (rules.properties && typeof value === 'object') {
      for (const prop of rules.properties) {
        if (value[prop] === undefined) {
          errors.push(`${field}.${prop} is required`);
        }
      }
    }
  }
  
  return errors;
}

export default EventSchemas;
```

---

### 4. 👤 User Preferences

**File**: `domain/userPreferences.js`

**Mục đích**: Cho phép user tắt/bật từng loại notification

```javascript
/**
 * User Preferences - Per-user notification settings
 * 
 * Stored in User entity: preferences.notifications = { ... }
 */

import { base44 } from '@/api/base44Client';

// Default preferences (all enabled)
const DEFAULT_PREFERENCES = {
  // Order
  'order.created': true,
  'order.status_changed': true,
  
  // Payment
  'payment.confirmed': true,
  'payment.failed': true,
  
  // Social
  'social.liked': true,
  'social.commented': true,
  'social.mentioned': true,
  'social.followed': true,
  
  // Referral
  'referral.commission_earned': true,
  'referral.rank_upgraded': true,
  
  // System
  'system.maintenance': true,
  'promo': true,
  
  // Categories (can disable entire category)
  '_category.social': true,
  '_category.promo': true
};

class UserPreferencesService {
  constructor() {
    this.cache = new Map(); // email → preferences
  }

  /**
   * Check if user has enabled this event type
   */
  async isEnabled(userEmail, eventName) {
    if (!userEmail) return true; // Broadcast → always enabled
    
    const prefs = await this.getPreferences(userEmail);
    
    // Check category first
    const category = this._getCategory(eventName);
    if (category && prefs[`_category.${category}`] === false) {
      return false;
    }
    
    // Check specific event
    return prefs[eventName] !== false;
  }

  /**
   * Get user preferences (with caching)
   */
  async getPreferences(userEmail) {
    if (this.cache.has(userEmail)) {
      return this.cache.get(userEmail);
    }
    
    try {
      const user = await base44.auth.me();
      const prefs = user?.preferences?.notifications || {};
      const merged = { ...DEFAULT_PREFERENCES, ...prefs };
      this.cache.set(userEmail, merged);
      return merged;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userEmail, updates) {
    const current = await this.getPreferences(userEmail);
    const newPrefs = { ...current, ...updates };
    
    await base44.auth.updateMe({
      preferences: {
        notifications: newPrefs
      }
    });
    
    this.cache.set(userEmail, newPrefs);
    return newPrefs;
  }

  /**
   * Get category for event
   */
  _getCategory(eventName) {
    if (eventName.startsWith('social.')) return 'social';
    if (eventName.startsWith('promo')) return 'promo';
    if (eventName.startsWith('referral.')) return 'referral';
    return null;
  }

  /**
   * Clear cache for user
   */
  clearCache(userEmail) {
    this.cache.delete(userEmail);
  }
}

export const userPreferences = new UserPreferencesService();
export default userPreferences;
```

---

### 5. 📊 Event Analytics

**File**: `services/analytics/EventTracker.js`

**Mục đích**: Track event metrics để monitor và optimize

```javascript
/**
 * EventTracker - Track notification event metrics
 * 
 * Metrics:
 * - Total events emitted (per type)
 * - Success/failure rate
 * - Average latency
 * - Queue size (if async)
 */

class EventTracker {
  constructor() {
    this.metrics = new Map(); // eventName → { total, success, failed, latencySum }
    this.recentEvents = []; // Last 100 events for debugging
  }

  /**
   * Record event emission
   */
  recordEmit(eventName, { success, latency, error = null }) {
    // Update metrics
    if (!this.metrics.has(eventName)) {
      this.metrics.set(eventName, { total: 0, success: 0, failed: 0, latencySum: 0 });
    }
    
    const m = this.metrics.get(eventName);
    m.total++;
    m.latencySum += latency || 0;
    
    if (success) {
      m.success++;
    } else {
      m.failed++;
    }
    
    // Store recent event
    this.recentEvents.push({
      eventName,
      success,
      latency,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100
    if (this.recentEvents.length > 100) {
      this.recentEvents.shift();
    }
  }

  /**
   * Get stats for event type (supports wildcards)
   */
  getStats(pattern = '*') {
    const results = {};
    
    for (const [eventName, m] of this.metrics) {
      if (pattern === '*' || eventName.startsWith(pattern.replace('*', ''))) {
        results[eventName] = {
          total: m.total,
          success: m.success,
          failed: m.failed,
          successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(1) + '%' : 'N/A',
          avgLatency: m.total > 0 ? Math.round(m.latencySum / m.total) + 'ms' : 'N/A'
        };
      }
    }
    
    return results;
  }

  /**
   * Get summary stats
   */
  getSummary() {
    let total = 0, success = 0, failed = 0, latencySum = 0;
    
    for (const m of this.metrics.values()) {
      total += m.total;
      success += m.success;
      failed += m.failed;
      latencySum += m.latencySum;
    }
    
    return {
      totalEvents: total,
      successRate: total > 0 ? ((success / total) * 100).toFixed(1) + '%' : 'N/A',
      failureRate: total > 0 ? ((failed / total) * 100).toFixed(1) + '%' : 'N/A',
      avgLatency: total > 0 ? Math.round(latencySum / total) + 'ms' : 'N/A',
      eventTypes: this.metrics.size
    };
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(limit = 20) {
    return this.recentEvents.slice(-limit);
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear();
    this.recentEvents = [];
  }
}

export const eventTracker = new EventTracker();
export default eventTracker;
```

---

### 6. 📬 Priority Queue

**File**: `core/eventQueue.js`

**Mục đích**: Async processing với priority levels

```javascript
/**
 * EventQueue - Priority-based async queue for notifications
 * 
 * Priority levels:
 * - urgent: Process immediately (sync)
 * - high: Process in next tick
 * - normal: Batch process every 1s
 * - low: Batch process every 5s
 */

class EventQueue {
  constructor() {
    this.queues = {
      urgent: [],
      high: [],
      normal: [],
      low: []
    };
    
    this.processing = false;
    this.batchSize = 10;
    
    // Start background processors
    this._startProcessors();
  }

  /**
   * Add event to queue
   */
  enqueue(eventName, payload, options = {}) {
    const { priority = 'normal' } = options;
    
    const item = {
      eventName,
      payload,
      priority,
      enqueuedAt: Date.now()
    };
    
    if (priority === 'urgent') {
      // Process immediately
      return this._processItem(item);
    }
    
    this.queues[priority].push(item);
    return Promise.resolve();
  }

  /**
   * Process single item
   */
  async _processItem(item) {
    const { eventName, payload } = item;
    const handlers = eventRegistry.getHandlers(eventName);
    
    for (const { handler } of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`Queue handler failed for ${eventName}:`, error);
      }
    }
  }

  /**
   * Start background processors
   */
  _startProcessors() {
    // High priority: every 100ms
    setInterval(() => this._processQueue('high'), 100);
    
    // Normal priority: every 1s
    setInterval(() => this._processQueue('normal'), 1000);
    
    // Low priority: every 5s
    setInterval(() => this._processQueue('low'), 5000);
  }

  /**
   * Process queue by priority
   */
  async _processQueue(priority) {
    const queue = this.queues[priority];
    if (queue.length === 0) return;
    
    // Take batch
    const batch = queue.splice(0, this.batchSize);
    
    // Process in parallel
    await Promise.allSettled(
      batch.map(item => this._processItem(item))
    );
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      urgent: this.queues.urgent.length,
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      total: Object.values(this.queues).reduce((sum, q) => sum + q.length, 0)
    };
  }
}

export const eventQueue = new EventQueue();
export default eventQueue;
```

---

### 7. 🚀 Notification Engine v2.1

**File**: `core/notificationEngine.js` (UPGRADED)

**Mục đích**: Central engine với emit() method

```javascript
/**
 * NotificationEngine v2.1 - Central event emitter
 * 
 * Features:
 * - Registry-based handler lookup
 * - Middleware pipeline execution
 * - Priority queue support
 * - Analytics tracking
 */

import { eventRegistry } from './eventRegistry';
import { eventMiddleware } from './eventMiddleware';
import { eventQueue } from './eventQueue';
import { eventTracker } from '../services/analytics/EventTracker';
import { NotificationPriority } from '../types';

class NotificationEngine {
  
  /**
   * Emit an event
   * 
   * @example
   * await notificationEngine.emit('order.created', { order, customer });
   * await notificationEngine.emit('harvest.reminder', { order, lot, daysLeft }, { priority: 'high' });
   */
  async emit(eventName, payload, options = {}) {
    const { priority = 'normal', async = false } = options;
    const startTime = Date.now();
    
    try {
      // Check if handlers exist
      if (!eventRegistry.hasHandlers(eventName)) {
        console.warn(`No handlers registered for event: ${eventName}`);
        return { success: false, reason: 'no_handlers' };
      }
      
      // Build context
      const context = {
        eventName,
        payload,
        priority,
        emittedAt: new Date().toISOString()
      };
      
      // If async, use queue
      if (async && priority !== 'urgent') {
        await eventQueue.enqueue(eventName, payload, { priority });
        eventTracker.recordEmit(eventName, { success: true, latency: Date.now() - startTime });
        return { success: true, queued: true };
      }
      
      // Execute through middleware pipeline
      const handlers = eventRegistry.getHandlers(eventName);
      
      await eventMiddleware.execute(context, async (ctx) => {
        // Run all handlers
        for (const { handler, once } of handlers) {
          await handler(ctx.payload);
          
          // If once, unregister after execution
          if (once) {
            eventRegistry.unregister(eventName, handler);
          }
        }
      });
      
      // Track success
      eventTracker.recordEmit(eventName, { 
        success: true, 
        latency: Date.now() - startTime 
      });
      
      return { success: true };
      
    } catch (error) {
      // Track failure
      eventTracker.recordEmit(eventName, { 
        success: false, 
        latency: Date.now() - startTime,
        error 
      });
      
      console.error(`Event ${eventName} failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register event handler (shorthand)
   */
  on(eventName, handler, options = {}) {
    return eventRegistry.register(eventName, handler, options);
  }

  /**
   * Register one-time handler
   */
  once(eventName, handler) {
    return eventRegistry.register(eventName, handler, { once: true });
  }

  /**
   * Get engine stats
   */
  getStats() {
    return {
      events: eventTracker.getSummary(),
      queue: eventQueue.getStats(),
      registeredEvents: eventRegistry.listEvents().length
    };
  }
}

export const notificationEngine = new NotificationEngine();
export default notificationEngine;
```

**Usage**:
```javascript
import { notificationEngine } from '@/components/features/notification';

// Register handlers (at module init)
notificationEngine.on('order.created', OrderEventNotifier.onOrderCreated);
notificationEngine.on('order.*', OrderAnalytics.track, { priority: -1 });

// Emit events (from anywhere)
await notificationEngine.emit('order.created', { order, customer });
await notificationEngine.emit('harvest.reminder', { order, lot, daysLeft: 3 }, { priority: 'high' });

// Async (queued) processing
await notificationEngine.emit('promo.campaign', { users, promo }, { async: true, priority: 'low' });
```

---

## 📊 Event Analysis - Toàn Hệ Thống

### 1. 🛒 ORDER EVENTS (Cao nhất)
**Handler**: `OrderEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| order.created | Admin, User | High | Đơn hàng mới được tạo |
| order.confirmed | User | High | Admin xác nhận đơn |
| order.processing | User | Normal | Đang chuẩn bị hàng |
| order.shipped | User | High | Đã giao cho shipper |
| order.delivered | User, Admin | Normal | Đã giao thành công |
| order.cancelled | User, Admin | Normal | Đơn hàng bị hủy |
| order.returned | User, Admin | High | Yêu cầu trả hàng |

**Methods**:
```javascript
OrderEventNotifier.onOrderCreated(order, customer)
OrderEventNotifier.onOrderConfirmed(order)
OrderEventNotifier.onOrderShipped(order)
OrderEventNotifier.onOrderDelivered(order)
OrderEventNotifier.onOrderCancelled(order, reason)
```

---

### 2. 💳 PAYMENT EVENTS
**Handler**: `PaymentEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| payment.verification_needed | Admin | Urgent | Cần xác minh chuyển khoản |
| payment.confirmed | User, Admin | High | Thanh toán thành công |
| payment.failed | User, Admin | High | Thanh toán thất bại |
| deposit.received | User, Admin | High | Nhận tiền cọc |
| deposit.reminder | User | High | Nhắc nhở thanh toán còn lại |
| payment.refunded | User, Admin | Normal | Hoàn tiền |

**Methods**:
```javascript
PaymentEventNotifier.onPaymentNeedsVerification(order)
PaymentEventNotifier.onPaymentConfirmed(order)
PaymentEventNotifier.onPaymentFailed(order)
PaymentEventNotifier.onDepositReceived(order)
PaymentEventNotifier.onDepositReminder(order, daysLeft)
```

---

### 3. 🌾 PRE-ORDER EVENTS
**Handler**: `PreOrderEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| harvest.reminder | User | High | Sắp thu hoạch (3-5 ngày) |
| harvest.ready | User, Admin | High | Đã thu hoạch, sẵn sàng giao |
| harvest.upcoming | Admin | High | Admin chuẩn bị thu hoạch |
| price.fomo | User | High | Giá sắp tăng (FOMO) |
| price.increased | Admin | Normal | Giá đã tăng |
| lot.sold_out | Admin | High | Lot đã hết |
| cancellation.requested | Admin | High | Yêu cầu hủy pre-order |

**Methods**:
```javascript
PreOrderEventNotifier.onHarvestReminder(order, lot, daysLeft)
PreOrderEventNotifier.onHarvestReady(order, lot)
PreOrderEventNotifier.onPriceFomo(lot, hoursLeft, currentPrice, nextPrice)
PreOrderEventNotifier.onLotSoldOut(lot)
```

---

### 4. 📦 INVENTORY EVENTS
**Handler**: `InventoryEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| stock.low | Admin, Tenant | High | Sắp hết hàng |
| stock.out | Admin, Tenant | Urgent | Hết hàng |
| stock.restocked | Admin | Normal | Nhập hàng mới |
| stock.adjusted | Admin | Normal | Điều chỉnh tồn kho |

**Methods**:
```javascript
InventoryEventNotifier.onStockLow(product)
InventoryEventNotifier.onStockOut(product)
InventoryEventNotifier.onRestocked(product, quantity)
```

---

### 5. 👥 CUSTOMER EVENTS
**Handler**: `CustomerEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| customer.registered | Admin | Low | Khách hàng mới đăng ký |
| customer.first_order | Admin | Normal | Đơn đầu tiên |
| customer.milestone | User | Normal | Đạt mốc (10 đơn, 1M doanh số) |
| profile.updated | User | Low | Cập nhật thông tin |

**Methods**:
```javascript
CustomerEventNotifier.onCustomerRegistered(customer)
CustomerEventNotifier.onFirstOrder(customer, order)
CustomerEventNotifier.onMilestoneReached(customer, milestone)
```

---

### 6. 💬 SOCIAL EVENTS
**Handler**: `SocialEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| post.liked | User | Normal | Ai đó like bài viết |
| post.commented | User | Normal | Ai đó comment |
| user.mentioned | User | High | Được tag trong bài |
| user.followed | User | Normal | Có người follow |
| comment.replied | User | Normal | Reply comment |

**Methods**:
```javascript
SocialEventNotifier.onPostLiked(post, liker, postAuthor)
SocialEventNotifier.onPostCommented(post, commenter, postAuthor)
SocialEventNotifier.onUserMentioned(post, mentionedUser, mentioner)
SocialEventNotifier.onUserFollowed(follower, following)
```

---

### 7. ⭐ REVIEW EVENTS
**Handler**: `ReviewEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| review.created | Admin | Normal | Đánh giá mới |
| review.approved | User | Normal | Đánh giá được duyệt |
| review.rejected | User | Normal | Đánh giá bị từ chối |
| review.response | User | High | Shop trả lời đánh giá |

**Methods**:
```javascript
ReviewEventNotifier.onReviewCreated(review, product)
ReviewEventNotifier.onReviewResponse(review, response, reviewer)
```

---

### 8. 🎁 REFERRAL EVENTS
**Handler**: `ReferralEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| referral.registered | Admin | Normal | CTV mới đăng ký |
| referral.approved | User | High | Được duyệt làm CTV |
| referral.commission_earned | User | High | Nhận hoa hồng |
| referral.commission_paid | User | High | Hoa hồng đã chuyển |
| referral.rank_up | User | High | Lên cấp bậc mới |
| referral.customer_claimed | User | Normal | Claim khách cũ |

**Methods**:
```javascript
ReferralEventNotifier.onMemberRegistered(member)
ReferralEventNotifier.onMemberApproved(member)
ReferralEventNotifier.onCommissionEarned(referrer, order, commission)
ReferralEventNotifier.onRankUpgraded(member, oldRank, newRank)
```

---

### 9. 🏪 TENANT (SaaS) EVENTS
**Handler**: `TenantEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| tenant.created | Admin | Normal | Shop mới tạo |
| tenant.approved | Tenant | High | Shop được duyệt |
| subscription.expiry_warning | Tenant | Urgent | Sắp hết hạn (3 ngày) |
| subscription.expired | Tenant, Admin | Urgent | Đã hết hạn |
| subscription.renewed | Tenant | Normal | Gia hạn thành công |
| invoice.generated | Tenant | Normal | Hóa đơn mới |
| invoice.overdue | Tenant, Admin | Urgent | Hóa đơn quá hạn |
| usage.limit_warning | Tenant | High | Sắp đạt giới hạn (80%) |
| usage.limit_reached | Tenant | Urgent | Đã đạt giới hạn |
| commission.payout | Tenant | High | Nhận hoa hồng từ platform |

**Methods**:
```javascript
TenantEventNotifier.onShopCreated(tenant)
TenantEventNotifier.onShopApproved(tenant)
TenantEventNotifier.onSubscriptionExpiryWarning(tenant, daysLeft)
TenantEventNotifier.onUsageLimitWarning(tenant, resource, percentage)
TenantEventNotifier.onCommissionPayout(tenant, amount)
```

---

### 10. 📚 COMMUNITY EVENTS
**Handler**: `CommunityEventNotifier.js`

| Event | Actor | Priority | Description |
|-------|-------|----------|-------------|
| book.published | User, Followers | Normal | Sách mới xuất bản |
| book.chapter_added | Followers | Normal | Chapter mới |
| book.contributor_invited | User | High | Được mời cộng tác |
| discussion.replied | User | Normal | Reply trong discussion |
| collection.added | User | Normal | Được thêm vào collection |

**Methods**:
```javascript
CommunityEventNotifier.onBookPublished(book, author)
CommunityEventNotifier.onChapterAdded(book, chapter, followers)
CommunityEventNotifier.onContributorInvited(book, contributor)
```

---

## 🎨 Kiến Trúc Event-Based - Chi Tiết

### Pattern: Event Handler

**Mỗi Event Handler** có cấu trúc:

```javascript
/**
 * OrderEventNotifier - Handle all order-related notifications
 * 
 * Scope: Order lifecycle events (create, confirm, ship, deliver, cancel)
 * Actors: Client, Admin, Tenant (nếu shop order)
 */

import { NotificationServiceFacade } from '../NotificationServiceFacade';
import { createPageUrl } from '@/utils';

export class OrderEventNotifier {
  
  /**
   * Event: order.created
   * Triggered: Khi khách hàng đặt hàng (checkout success)
   * Actors: Admin (to review), User (confirmation)
   */
  static async onOrderCreated(order, customer) {
    const orderNumber = order.order_number;
    const amount = order.total_amount?.toLocaleString('vi-VN');
    const customerName = customer?.full_name || order.customer_name;
    
    // 1. Notify Admin
    await NotificationServiceFacade.notifyAdmin({
      type: 'new_order',
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `${customerName} đặt hàng ${amount}đ`,
      link: createPageUrl('AdminOrders'),
      priority: 'high',
      requiresAction: true,
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      metadata: {
        order_number: orderNumber,
        customer_name: customerName,
        amount: order.total_amount
      }
    });
    
    // 2. Notify Customer
    await NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'order_confirmed',
      title: '✅ Đơn Hàng Đã Được Xác Nhận',
      message: `Đơn hàng #${orderNumber} đang được xử lý`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: { order_number: orderNumber }
    });
    
    // 3. Notify Tenant (if shop order)
    if (order.tenant_id) {
      await NotificationServiceFacade.notifyTenant({
        tenantId: order.tenant_id,
        type: 'new_shop_order',
        title: `🛍️ Đơn Mới #${orderNumber}`,
        message: `${customerName} đặt hàng`,
        priority: 'high',
        requiresAction: true
      });
    }
  }
  
  /**
   * Event: order.status_changed
   * Triggered: Khi admin cập nhật trạng thái đơn
   * Actors: User (status update)
   */
  static async onOrderStatusChanged(order, oldStatus, newStatus) {
    const statusMessages = {
      confirmed: '✅ Đã xác nhận',
      processing: '📦 Đang chuẩn bị',
      shipping: '🚚 Đang giao',
      delivered: '🎉 Đã giao',
      cancelled: '❌ Đã hủy'
    };
    
    const message = statusMessages[newStatus];
    if (!message) return;
    
    await NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: `order_${newStatus}`,
      title: message,
      message: `Đơn hàng #${order.order_number} ${message.toLowerCase()}`,
      link: createPageUrl('MyOrders'),
      priority: ['shipped', 'delivered'].includes(newStatus) ? 'high' : 'normal'
    });
  }
}
```

---

### Pattern: Service Facade Routing

**NotificationServiceFacade v2.0** - Lightweight orchestrator:

```javascript
/**
 * NotificationServiceFacade v2.0
 * Orchestrator - Routes to event handlers
 */

import { OrderEventNotifier } from './events/OrderEventNotifier';
import { PaymentEventNotifier } from './events/PaymentEventNotifier';
import { PreOrderEventNotifier } from './events/PreOrderEventNotifier';
// ... other event handlers

export class NotificationServiceFacade {
  
  // ========== CORE METHODS (Base API) ==========
  
  static async notifyUser(params) { /* ... same as v1.0 */ }
  static async notifyAdmin(params) { /* ... same as v1.0 */ }
  static async notifyTenant(params) { /* ... same as v1.0 */ }
  
  // ========== EVENT ROUTING (NEW) ==========
  
  /**
   * Order Events - Delegate to OrderEventNotifier
   */
  static async notifyNewOrder(order, customer) {
    return OrderEventNotifier.onOrderCreated(order, customer);
  }
  
  static async notifyOrderStatusChange(order, newStatus) {
    return OrderEventNotifier.onOrderStatusChanged(order, null, newStatus);
  }
  
  /**
   * Payment Events - Delegate to PaymentEventNotifier
   */
  static async notifyPaymentVerificationNeeded(order) {
    return PaymentEventNotifier.onPaymentNeedsVerification(order);
  }
  
  static async notifyPaymentConfirmed(order) {
    return PaymentEventNotifier.onPaymentConfirmed(order);
  }
  
  /**
   * Pre-Order Events - Delegate to PreOrderEventNotifier
   */
  static async notifyHarvestReminder(order, lot, daysLeft) {
    return PreOrderEventNotifier.onHarvestReminder(order, lot, daysLeft);
  }
  
  static async notifyHarvestReady(order, lot) {
    return PreOrderEventNotifier.onHarvestReady(order, lot);
  }
  
  // ... other event delegations
}
```

**Lợi ích**:
- Facade giờ chỉ ~ 150 dòng (từ 314 dòng)
- Mỗi event handler ~ 100-200 dòng
- Clear separation of concerns
- Easy to find, edit, test

---

## 📋 Event Handlers Breakdown

### Event Handlers Cần Tạo (10 handlers)

| Handler | Events | Lines | Actor Coverage |
|---------|--------|-------|----------------|
| OrderEventNotifier | 7 | ~180 | Admin, User, Tenant |
| PaymentEventNotifier | 6 | ~150 | Admin, User |
| PreOrderEventNotifier | 7 | ~200 | Admin, User |
| InventoryEventNotifier | 4 | ~100 | Admin, Tenant |
| CustomerEventNotifier | 4 | ~100 | Admin, User |
| SocialEventNotifier | 5 | ~120 | User |
| ReviewEventNotifier | 4 | ~100 | Admin, User |
| ReferralEventNotifier | 6 | ~150 | Admin, User |
| TenantEventNotifier | 10 | ~200 | Admin, Tenant |
| CommunityEventNotifier | 5 | ~120 | User |

**Total**: 10 handlers, ~1420 lines (thay vì 1 file 970 dòng)

---

## 🎯 Refactor Plan v2.1 - Full Event-Driven Architecture

### 📊 Overview

| Phase | Mục Tiêu | Files | Lines | Time |
|-------|----------|-------|-------|------|
| Phase 1 | Core Infrastructure | 7 files | ~600 | 2h |
| Phase 2 | Event Handlers | 14 files | ~1800 | 4h |
| Phase 3 | Middleware Pipeline | 6 files | ~400 | 1.5h |
| Phase 4 | Analytics & Preferences | 4 files | ~350 | 1h |
| Phase 5 | Refactor Facade | 2 files | ~150 | 1h |
| Phase 6 | Public API & Docs | 3 files | ~200 | 1h |
| **Total** | | **~36 files** | **~3500** | **~10.5h** |

---

### Phase 1: Core Infrastructure (2 giờ)
**Mục tiêu**: Tạo event registry, queue, middleware engine

#### Task 1.1: Event Registry
**File**: `core/eventRegistry.js` (~120 lines)

```javascript
// Xem chi tiết ở section "Core Components v2.1"
// - register(eventName, handler, options)
// - getHandlers(eventName) - supports wildcards
// - unregister(eventName, handler)
// - listEvents()
```

#### Task 1.2: Event Queue
**File**: `core/eventQueue.js` (~100 lines)

```javascript
// Priority-based async queue
// - enqueue(eventName, payload, { priority })
// - _processQueue(priority)
// - getStats()
```

#### Task 1.3: Middleware Pipeline
**File**: `core/eventMiddleware.js` (~80 lines)

```javascript
// Chain of responsibility
// - use(middleware)
// - execute(context, finalHandler)
```

#### Task 1.4: Event Types Constants
**File**: `types/EventTypes.js` (~150 lines)

```javascript
// All event name constants
export const OrderEvents = {
  CREATED: 'order.created',
  CONFIRMED: 'order.confirmed',
  SHIPPED: 'order.shipped',
  DELIVERED: 'order.delivered',
  CANCELLED: 'order.cancelled',
  RETURNED: 'order.returned'
};

export const PaymentEvents = {
  VERIFICATION_NEEDED: 'payment.verification_needed',
  CONFIRMED: 'payment.confirmed',
  FAILED: 'payment.failed',
  DEPOSIT_RECEIVED: 'payment.deposit_received',
  DEPOSIT_REMINDER: 'payment.deposit_reminder',
  REFUNDED: 'payment.refunded'
};

// ... all other events
```

#### Task 1.5: Upgrade Notification Engine
**File**: `core/notificationEngine.js` (MODIFY ~200 lines)

```javascript
// Add emit() method
// - emit(eventName, payload, options)
// - on(eventName, handler)
// - once(eventName, handler)
// - getStats()
```

**Deliverables Phase 1**: 5 files, ~650 lines

---

### Phase 2: Event Handlers - Domain Grouped (4 giờ)
**Mục tiêu**: Tạo 14 event handlers trong 6 domain groups

#### Task 2.1: Commerce Domain (3 handlers)
**Folder**: `services/events/commerce/`

**Files**:
1. `OrderEventNotifier.js` (~180 lines)
   - onOrderCreated(order, customer)
   - onOrderConfirmed(order)
   - onOrderShipped(order)
   - onOrderDelivered(order)
   - onOrderCancelled(order, reason)
   - onOrderReturned(order, request)

2. `PaymentEventNotifier.js` (~150 lines)
   - onPaymentNeedsVerification(order)
   - onPaymentConfirmed(order)
   - onPaymentFailed(order, error)
   - onDepositReceived(order)
   - onDepositReminder(order, daysLeft)
   - onPaymentRefunded(order, amount)

3. `InventoryEventNotifier.js` (~100 lines)
   - onStockLow(product)
   - onStockOut(product)
   - onStockRestocked(product, quantity)
   - onStockAdjusted(product, change, reason)

4. `commerce/index.js` - Export all

#### Task 2.2: Farming Domain (2 handlers)
**Folder**: `services/events/farming/`

**Files**:
1. `PreOrderEventNotifier.js` (~120 lines)
   - onPreOrderCreated(order, lot)
   - onPriceFomo(lot, hoursLeft, currentPrice, nextPrice)
   - onPriceIncreased(lot, oldPrice, newPrice)
   - onLotSoldOut(lot)

2. `HarvestEventNotifier.js` (~150 lines)
   - onHarvestReminder(order, lot, daysUntilHarvest)
   - onHarvestReady(order, lot)
   - onHarvestUpcoming(lot, ordersCount, daysLeft)
   - onFinalPaymentReminder(order, remainingAmount)

3. `farming/index.js` - Export all

#### Task 2.3: Social Domain (3 handlers)
**Folder**: `services/events/social/`

**Files**:
1. `SocialEventNotifier.js` (~120 lines)
   - onPostLiked(post, liker, postAuthor)
   - onPostCommented(post, commenter, comment)
   - onUserMentioned(content, mentionedUser, mentioner)
   - onUserFollowed(follower, following)
   - onCommentReplied(comment, reply, replier)

2. `ReviewEventNotifier.js` (~100 lines)
   - onReviewCreated(review, product)
   - onReviewApproved(review)
   - onReviewRejected(review, reason)
   - onReviewResponse(review, response, reviewer)

3. `CommunityEventNotifier.js` (~120 lines)
   - onBookPublished(book, author)
   - onChapterAdded(book, chapter, followers)
   - onContributorInvited(book, contributor, inviter)
   - onDiscussionReplied(discussion, reply)
   - onCollectionUpdated(collection, addedBook)

4. `social/index.js` - Export all

#### Task 2.4: CRM Domain (2 handlers)
**Folder**: `services/events/crm/`

**Files**:
1. `CustomerEventNotifier.js` (~100 lines)
   - onCustomerRegistered(customer)
   - onFirstOrderPlaced(customer, order)
   - onMilestoneReached(customer, milestone) // 10 orders, 1M spent
   - onProfileUpdated(customer, changes)

2. `ReferralEventNotifier.js` (~150 lines)
   - onMemberRegistered(member)
   - onMemberApproved(member)
   - onMemberSuspended(member, reason)
   - onCommissionEarned(referrer, order, commission)
   - onCommissionPaid(referrer, amount, batchId)
   - onRankUpgraded(member, oldRank, newRank)
   - onCustomerClaimed(referrer, customer)

3. `crm/index.js` - Export all

#### Task 2.5: SaaS Domain (3 handlers)
**Folder**: `services/events/saas/`

**Files**:
1. `TenantEventNotifier.js` (~100 lines)
   - onShopCreated(tenant)
   - onShopApproved(tenant)
   - onShopSuspended(tenant, reason)
   - onNewShopOrder(tenant, order)

2. `SubscriptionEventNotifier.js` (~120 lines)
   - onSubscriptionCreated(tenant, plan)
   - onSubscriptionRenewed(tenant, plan)
   - onSubscriptionExpiryWarning(tenant, daysLeft)
   - onSubscriptionExpired(tenant)
   - onSubscriptionCancelled(tenant, reason)
   - onTrialEnding(tenant, daysLeft)

3. `BillingEventNotifier.js` (~100 lines)
   - onInvoiceGenerated(tenant, invoice)
   - onInvoiceOverdue(tenant, invoice)
   - onPaymentReceived(tenant, payment)
   - onCommissionPayout(tenant, amount)

4. `saas/index.js` - Export all

#### Task 2.6: System Domain (2 handlers)
**Folder**: `services/events/system/`

**Files**:
1. `SystemEventNotifier.js` (~80 lines)
   - onSystemMaintenance(message, scheduledAt)
   - onSystemAlert(level, message)
   - onFeatureAnnouncement(feature, description)

2. `SecurityEventNotifier.js` (~80 lines)
   - onSuspiciousActivity(user, activity)
   - onFraudDetected(entity, reason)
   - onPasswordChanged(user)
   - onLoginFromNewDevice(user, device)

3. `system/index.js` - Export all

#### Task 2.7: Master Index
**File**: `services/events/index.js`

```javascript
// Re-export by domain
export * from './commerce';
export * from './farming';
export * from './social';
export * from './crm';
export * from './saas';
export * from './system';

// Also export flat list for convenience
export { OrderEventNotifier } from './commerce/OrderEventNotifier';
export { PaymentEventNotifier } from './commerce/PaymentEventNotifier';
// ... all handlers
```

**Deliverables Phase 2**: 17 files (14 handlers + 3 index), ~1800 lines

---

### Phase 3: Middleware Pipeline (1.5 giờ)
**Mục tiêu**: Tạo 5 reusable middlewares

**Folder**: `services/middleware/`

#### Task 3.1: Logging Middleware
**File**: `loggingMiddleware.js` (~50 lines)

```javascript
export const loggingMiddleware = async (context, next) => {
  const start = Date.now();
  console.log(`📧 [${context.eventName}] Started`, context.payload);
  
  try {
    await next();
    console.log(`✅ [${context.eventName}] Completed in ${Date.now() - start}ms`);
  } catch (error) {
    console.error(`❌ [${context.eventName}] Failed:`, error);
    throw error;
  }
};
```

#### Task 3.2: Validation Middleware
**File**: `validationMiddleware.js` (~60 lines)

```javascript
import { EventSchemas, validatePayload } from '../../domain/eventSchemas';

export const validationMiddleware = async (context, next) => {
  const schema = EventSchemas[context.eventName];
  
  if (schema) {
    const errors = validatePayload(context.payload, schema);
    if (errors.length > 0) {
      console.error(`Validation failed for ${context.eventName}:`, errors);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
  
  await next();
};
```

#### Task 3.3: Deduplication Middleware
**File**: `dedupeMiddleware.js` (~80 lines)

```javascript
// Prevent duplicate notifications (within 5 min)
const recentNotifications = new Map();
const DEDUPE_WINDOW = 5 * 60 * 1000; // 5 minutes

export const dedupeMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  const recipientEmail = payload.recipientEmail || payload.order?.customer_email;
  
  if (!recipientEmail) {
    return next(); // Can't dedupe without recipient
  }
  
  const key = `${eventName}:${recipientEmail}:${JSON.stringify(payload.metadata || {})}`;
  const now = Date.now();
  
  // Clean old entries
  for (const [k, time] of recentNotifications) {
    if (now - time > DEDUPE_WINDOW) {
      recentNotifications.delete(k);
    }
  }
  
  if (recentNotifications.has(key)) {
    console.log(`⏭️ [${eventName}] Skipped (duplicate within 5min)`);
    return; // Skip duplicate
  }
  
  recentNotifications.set(key, now);
  await next();
};
```

#### Task 3.4: Rate Limit Middleware
**File**: `rateLimitMiddleware.js` (~80 lines)

```javascript
// Max 10 notifications per user per minute per event type
const rateLimits = new Map();
const MAX_PER_MINUTE = 10;
const WINDOW = 60 * 1000;

export const rateLimitMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  const recipientEmail = payload.recipientEmail || payload.order?.customer_email;
  
  if (!recipientEmail) {
    return next();
  }
  
  const key = `${eventName}:${recipientEmail}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 0, windowStart: now });
  }
  
  const limit = rateLimits.get(key);
  
  // Reset window if expired
  if (now - limit.windowStart > WINDOW) {
    limit.count = 0;
    limit.windowStart = now;
  }
  
  // Check limit
  if (limit.count >= MAX_PER_MINUTE) {
    console.warn(`⏭️ [${eventName}] Rate limited for ${recipientEmail}`);
    return; // Skip
  }
  
  limit.count++;
  await next();
};
```

#### Task 3.5: User Preferences Middleware
**File**: `preferencesMiddleware.js` (~60 lines)

```javascript
import { userPreferences } from '../../domain/userPreferences';

export const preferencesMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  const recipientEmail = payload.recipientEmail || payload.order?.customer_email;
  
  // Skip for admin/system notifications
  if (!recipientEmail || context.isAdminNotification) {
    return next();
  }
  
  const isEnabled = await userPreferences.isEnabled(recipientEmail, eventName);
  
  if (!isEnabled) {
    console.log(`⏭️ [${eventName}] Disabled by user preferences for ${recipientEmail}`);
    return; // Skip
  }
  
  await next();
};
```

#### Task 3.6: Middleware Index
**File**: `middleware/index.js`

```javascript
export { loggingMiddleware } from './loggingMiddleware';
export { validationMiddleware } from './validationMiddleware';
export { dedupeMiddleware } from './dedupeMiddleware';
export { rateLimitMiddleware } from './rateLimitMiddleware';
export { preferencesMiddleware } from './preferencesMiddleware';

// Default pipeline setup
export const setupDefaultPipeline = (middleware) => {
  middleware
    .use(loggingMiddleware)
    .use(validationMiddleware)
    .use(dedupeMiddleware)
    .use(rateLimitMiddleware)
    .use(preferencesMiddleware);
};
```

**Deliverables Phase 3**: 6 files, ~400 lines

---

### Phase 4: Analytics & Preferences (1 giờ)
**Mục tiêu**: Tạo tracking và user preferences

#### Task 4.1: Event Tracker
**File**: `services/analytics/EventTracker.js` (~120 lines)

```javascript
// Xem chi tiết ở section "Core Components v2.1"
// - recordEmit(eventName, { success, latency, error })
// - getStats(pattern)
// - getSummary()
// - getRecentEvents(limit)
```

#### Task 4.2: Event Metrics Dashboard Data
**File**: `services/analytics/EventMetrics.js` (~80 lines)

```javascript
import { eventTracker } from './EventTracker';

export class EventMetrics {
  /**
   * Get metrics for admin dashboard
   */
  static getDashboardMetrics() {
    const summary = eventTracker.getSummary();
    const byDomain = this.getMetricsByDomain();
    const topEvents = this.getTopEvents(10);
    const failingEvents = this.getFailingEvents();
    
    return {
      summary,
      byDomain,
      topEvents,
      failingEvents
    };
  }

  static getMetricsByDomain() {
    return {
      commerce: eventTracker.getStats('order.*'),
      payment: eventTracker.getStats('payment.*'),
      farming: eventTracker.getStats('harvest.*'),
      social: eventTracker.getStats('social.*'),
      referral: eventTracker.getStats('referral.*'),
      tenant: eventTracker.getStats('tenant.*')
    };
  }

  static getTopEvents(limit = 10) {
    const stats = eventTracker.getStats('*');
    return Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, limit)
      .map(([name, data]) => ({ name, ...data }));
  }

  static getFailingEvents() {
    const stats = eventTracker.getStats('*');
    return Object.entries(stats)
      .filter(([_, data]) => data.failed > 0)
      .map(([name, data]) => ({ name, ...data }));
  }
}
```

#### Task 4.3: User Preferences Service
**File**: `domain/userPreferences.js` (~100 lines)

```javascript
// Xem chi tiết ở section "Core Components v2.1"
// - isEnabled(userEmail, eventName)
// - getPreferences(userEmail)
// - updatePreferences(userEmail, updates)
```

#### Task 4.4: Analytics Index
**File**: `services/analytics/index.js`

```javascript
export { eventTracker, EventTracker } from './EventTracker';
export { EventMetrics } from './EventMetrics';
```

**Deliverables Phase 4**: 4 files, ~350 lines

---

### Phase 5: Refactor Facade & Integration (1 giờ)
**Mục tiêu**: Slim down facade, integrate all components

#### Task 5.1: Slim Down Facade
**File**: `services/NotificationServiceFacade.js` (REWRITE ~100 lines)

```javascript
/**
 * NotificationServiceFacade v2.1
 * 
 * Slim orchestrator - delegates to:
 * - notificationEngine.emit() for event-based
 * - repositories for direct actor notifications
 */

import { notificationEngine } from '../core';
import { OrderEvents, PaymentEvents, HarvestEvents, ... } from '../types/EventTypes';
import { userNotificationRepository, adminNotificationRepository, tenantNotificationRepository } from '../data';

export class NotificationServiceFacade {
  
  // ========== CORE ACTOR METHODS (Direct) ==========
  
  static async notifyUser(params) {
    return userNotificationRepository.create(params);
  }
  
  static async notifyAdmin(params) {
    // ... existing logic for admin recipients
    return adminNotificationRepository.create(params);
  }
  
  static async notifyTenant(params) {
    return tenantNotificationRepository.create(params);
  }
  
  // ========== EVENT ROUTING (via Engine) ==========
  
  // Order
  static async notifyNewOrder(order, customer) {
    return notificationEngine.emit(OrderEvents.CREATED, { order, customer });
  }
  
  static async notifyOrderStatusChange(order, newStatus) {
    const eventMap = {
      confirmed: OrderEvents.CONFIRMED,
      shipping: OrderEvents.SHIPPED,
      delivered: OrderEvents.DELIVERED,
      cancelled: OrderEvents.CANCELLED
    };
    return notificationEngine.emit(eventMap[newStatus], { order, newStatus });
  }
  
  // Payment
  static async notifyPaymentVerificationNeeded(order) {
    return notificationEngine.emit(PaymentEvents.VERIFICATION_NEEDED, { order });
  }
  
  static async notifyPaymentConfirmed(order) {
    return notificationEngine.emit(PaymentEvents.CONFIRMED, { order });
  }
  
  // Harvest
  static async notifyHarvestReminder(order, lot, daysUntilHarvest) {
    return notificationEngine.emit(HarvestEvents.REMINDER, { order, lot, daysUntilHarvest });
  }
  
  static async notifyHarvestReady(order, lot) {
    return notificationEngine.emit(HarvestEvents.READY, { order, lot });
  }
  
  // ... other convenience methods
}
```

#### Task 5.2: Register All Handlers
**File**: `services/registerHandlers.js` (~80 lines)

```javascript
/**
 * Register all event handlers at module initialization
 */

import { notificationEngine } from '../core';
import { OrderEvents, PaymentEvents, HarvestEvents, ... } from '../types/EventTypes';
import {
  OrderEventNotifier,
  PaymentEventNotifier,
  HarvestEventNotifier,
  InventoryEventNotifier,
  CustomerEventNotifier,
  SocialEventNotifier,
  ReviewEventNotifier,
  ReferralEventNotifier,
  TenantEventNotifier,
  SubscriptionEventNotifier,
  BillingEventNotifier,
  CommunityEventNotifier,
  SystemEventNotifier,
  SecurityEventNotifier
} from './events';

export function registerAllHandlers() {
  // Order Events
  notificationEngine.on(OrderEvents.CREATED, OrderEventNotifier.onOrderCreated);
  notificationEngine.on(OrderEvents.CONFIRMED, OrderEventNotifier.onOrderConfirmed);
  notificationEngine.on(OrderEvents.SHIPPED, OrderEventNotifier.onOrderShipped);
  notificationEngine.on(OrderEvents.DELIVERED, OrderEventNotifier.onOrderDelivered);
  notificationEngine.on(OrderEvents.CANCELLED, OrderEventNotifier.onOrderCancelled);
  
  // Payment Events
  notificationEngine.on(PaymentEvents.VERIFICATION_NEEDED, PaymentEventNotifier.onPaymentNeedsVerification);
  notificationEngine.on(PaymentEvents.CONFIRMED, PaymentEventNotifier.onPaymentConfirmed);
  notificationEngine.on(PaymentEvents.FAILED, PaymentEventNotifier.onPaymentFailed);
  
  // Harvest Events
  notificationEngine.on(HarvestEvents.REMINDER, HarvestEventNotifier.onHarvestReminder);
  notificationEngine.on(HarvestEvents.READY, HarvestEventNotifier.onHarvestReady);
  notificationEngine.on(HarvestEvents.UPCOMING, HarvestEventNotifier.onHarvestUpcoming);
  
  // ... register all other handlers
  
  console.log('✅ All notification handlers registered');
}

// Auto-register on import
registerAllHandlers();
```

**Deliverables Phase 5**: 2 files, ~180 lines

---

### Phase 6: Public API & Documentation (1 giờ)
**Mục tiêu**: Update exports và documentation

#### Task 6.1: Update Module Index
**File**: `features/notification/index.js` (MODIFY)

```javascript
// ========== EXISTING EXPORTS (keep) ==========
export { ... } from './types';
export { ... } from './core';
export { ... } from './domain';
export { ... } from './data';
export { ... } from './hooks';
export { ... } from './ui';
export { NotificationServiceFacade } from './services';

// ========== NEW v2.1 EXPORTS ==========

// Event Types
export { OrderEvents, PaymentEvents, HarvestEvents, ... } from './types/EventTypes';

// Event Engine
export { notificationEngine } from './core';

// Event Handlers (by domain)
export * from './services/events';

// Middleware
export * from './services/middleware';

// Analytics
export * from './services/analytics';

// User Preferences
export { userPreferences } from './domain/userPreferences';
```

#### Task 6.2: Update README
**File**: `features/notification/README.md` (MAJOR UPDATE)

Add sections:
- Event-Driven Architecture v2.1
- Event Registry & Engine
- Middleware Pipeline
- Event Handlers by Domain
- Analytics & Tracking
- User Preferences
- Migration Guide v1.0 → v2.1

#### Task 6.3: Create CHANGELOG
**File**: `features/notification/CHANGELOG.md`

```markdown
# Changelog

## [2.1.0] - 2025-01-21

### Added
- Event Registry pattern for dynamic handler registration
- Middleware pipeline (logging, validation, dedupe, rate-limit, preferences)
- 14 domain-grouped event handlers
- Event analytics and tracking
- User notification preferences
- Priority-based async queue
- Event schema validation

### Changed
- NotificationServiceFacade now delegates to event handlers
- Handlers organized by domain (commerce, farming, social, crm, saas, system)

### Deprecated
- Direct method calls in facade (still work, but use engine.emit() for new code)
```

**Deliverables Phase 6**: 3 files, ~200 lines

---

## 📋 Complete File List v2.1

### ✅ Phase 1: Core (6 files, ~450 lines) - DONE
| File | Lines | Status |
|------|-------|--------|
| core/eventRegistry.js | 120 | ✅ DONE |
| core/eventQueue.js | 110 | ✅ DONE |
| core/eventMiddleware.js | 60 | ✅ DONE |
| core/notificationEngine.js | 230 | ✅ UPDATED |
| core/index.js | 30 | ✅ UPDATED |
| types/EventTypes.js | 200 | ✅ DONE |
| domain/eventSchemas.js | 200 | ✅ DONE |

### ✅ Phase 2: Event Handlers (17 files, ~2000 lines) - DONE
| Domain | Files | Status |
|--------|-------|--------|
| commerce/ | OrderEventHandler (160), PaymentEventHandler (180), InventoryEventHandler (100), index | ✅ DONE |
| farming/ | HarvestEventHandler (250), PriceEventHandler (100), index | ✅ DONE |
| social/ | SocialEventHandler (160), ReviewEventHandler (130), index | ✅ DONE |
| crm/ | CustomerEventHandler (130), ReferralEventHandler (200), index | ✅ DONE |
| saas/ | TenantEventHandler (160), SubscriptionEventHandler (150), UsageEventHandler (110), index | ✅ DONE |
| system/ | SystemEventHandler (110), index | ✅ DONE |
| events/index.js | 50 | ✅ DONE |
| registerHandlers.js | 40 | ✅ DONE |

### ✅ Phase 3: Middleware (6 files, ~400 lines) - DONE
| File | Lines | Status |
|------|-------|--------|
| middleware/loggingMiddleware.js | 40 | ✅ DONE |
| middleware/validationMiddleware.js | 30 | ✅ DONE |
| middleware/dedupeMiddleware.js | 80 | ✅ DONE |
| middleware/rateLimitMiddleware.js | 100 | ✅ DONE |
| middleware/preferencesMiddleware.js | 90 | ✅ DONE |
| middleware/index.js | 60 | ✅ DONE |

### ✅ Phase 4: Analytics (1 file, ~150 lines) - DONE
| File | Lines | Status |
|------|-------|--------|
| analytics/EventTracker.js | 150 | ✅ DONE |

### ✅ Phase 5: Integration (4 files, ~100 lines) - DONE
| File | Status |
|------|--------|
| services/index.js | ✅ UPDATED |
| types/index.js | ✅ UPDATED |
| core/index.js | ✅ UPDATED |
| index.js (main) | ✅ UPDATED |

### ✅ Phase 6: Documentation (2 files) - DONE
| File | Status |
|------|--------|
| README.md | ✅ UPDATED (v2.1 usage, event examples, analytics) |
| MIGRATION-v2.1.md | ✅ NEW (Complete migration guide) |

### Grand Total
- **New Files**: 30 files ✅
- **Modified Files**: 7 files ✅
- **Total Lines**: ~3300 lines ✅
- **Actual Time**: ~4 hours
- **Status**: 100% Complete ✅

---

## ⚙️ Implementation Details

### Event Handler Template

**Template** cho mỗi handler:

```javascript
/**
 * [Event]EventNotifier
 * 
 * Domain: [Event domain description]
 * Events: [List of events]
 * Actors: [Client/Admin/Tenant coverage]
 */

import { NotificationServiceFacade } from '../NotificationServiceFacade';
import { createPageUrl } from '@/utils';

export class [Event]EventNotifier {
  
  /**
   * Event: [event.name]
   * Triggered: [When this happens]
   * Actors: [Who gets notified]
   */
  static async on[EventName]([params]) {
    // 1. Extract data
    const { ... } = params;
    
    // 2. Build notification data
    const notificationData = {
      type: '[type]',
      title: '[title]',
      message: '[message]',
      priority: '[priority]',
      link: createPageUrl('[page]'),
      metadata: { ... }
    };
    
    // 3. Notify actors
    if ([condition]) {
      await NotificationServiceFacade.notifyAdmin(notificationData);
    }
    
    if ([condition]) {
      await NotificationServiceFacade.notifyUser({
        recipientEmail: '[email]',
        ...notificationData
      });
    }
    
    if ([condition]) {
      await NotificationServiceFacade.notifyTenant({
        tenantId: '[id]',
        ...notificationData
      });
    }
    
    return { success: true };
  }
}
```

### Cross-Event Dependencies

**Quy tắc**: Event handlers KHÔNG import lẫn nhau

```javascript
// ❌ SAI - Circular risk
// OrderEventNotifier.js
import { PaymentEventNotifier } from './PaymentEventNotifier';

// PaymentEventNotifier.js
import { OrderEventNotifier } from './OrderEventNotifier'; // ← Circular!

// ✅ ĐÚNG - All delegate to Facade
// OrderEventNotifier.js
import { NotificationServiceFacade } from '../NotificationServiceFacade';
await NotificationServiceFacade.notifyUser({ ... }); // ← Through facade

// PaymentEventNotifier.js
import { NotificationServiceFacade } from '../NotificationServiceFacade';
await NotificationServiceFacade.notifyAdmin({ ... }); // ← Through facade
```

---

## 📈 Progress Tracking v2.1

### Overall Progress: 100% ✅ COMPLETE (6/6 phases)

| Phase | Mục Tiêu | Status | Files | Lines | Time | Completed |
|-------|----------|--------|-------|-------|------|-----------|
| Phase 1 | Core Infrastructure | ✅ DONE | 7/7 | 450 | 1h | 2025-01-21 |
| Phase 2 | Event Handlers | ✅ DONE | 17/17 | 2000 | 1.5h | 2025-01-21 |
| Phase 3 | Middleware Pipeline | ✅ DONE | 6/6 | 400 | 0.5h | 2025-01-21 |
| Phase 4 | Analytics | ✅ DONE | 1/1 | 150 | 0.3h | 2025-01-21 |
| Phase 5 | Integration & Exports | ✅ DONE | 4/4 | 100 | 0.2h | 2025-01-21 |
| Phase 6 | Documentation | ✅ DONE | 2/2 | 200 | 0.3h | 2025-01-21 |

**Total**: 37/37 files, ~3300/3580 lines, ~4h spent (instead of 12.5h estimated)

### Detailed Task Progress

#### ✅ Phase 1: Core Infrastructure - DONE
- [x] core/eventRegistry.js
- [x] core/eventQueue.js
- [x] core/eventMiddleware.js
- [x] core/notificationEngine.js (MODIFIED)
- [x] core/index.js (UPDATED)
- [x] types/EventTypes.js
- [x] domain/eventSchemas.js

#### ✅ Phase 2: Event Handlers - DONE
**Commerce Domain**
- [x] services/events/commerce/OrderEventHandler.js
- [x] services/events/commerce/PaymentEventHandler.js
- [x] services/events/commerce/InventoryEventHandler.js
- [x] services/events/commerce/index.js

**Farming Domain**
- [x] services/events/farming/HarvestEventHandler.js
- [x] services/events/farming/PriceEventHandler.js
- [x] services/events/farming/index.js

**Social Domain**
- [x] services/events/social/SocialEventHandler.js
- [x] services/events/social/ReviewEventHandler.js
- [x] services/events/social/index.js

**CRM Domain**
- [x] services/events/crm/CustomerEventHandler.js
- [x] services/events/crm/ReferralEventHandler.js
- [x] services/events/crm/index.js

**SaaS Domain**
- [x] services/events/saas/TenantEventHandler.js
- [x] services/events/saas/SubscriptionEventHandler.js
- [x] services/events/saas/UsageEventHandler.js
- [x] services/events/saas/index.js

**System Domain**
- [x] services/events/system/SystemEventHandler.js
- [x] services/events/system/index.js

**Master Index**
- [x] services/events/index.js
- [x] services/registerHandlers.js

#### ✅ Phase 3: Middleware Pipeline - DONE
- [x] services/middleware/loggingMiddleware.js
- [x] services/middleware/validationMiddleware.js
- [x] services/middleware/dedupeMiddleware.js
- [x] services/middleware/rateLimitMiddleware.js
- [x] services/middleware/preferencesMiddleware.js
- [x] services/middleware/index.js (with initializeMiddleware)

#### ✅ Phase 4: Analytics - DONE
- [x] services/analytics/EventTracker.js

#### ✅ Phase 5: Integration & Exports - DONE
- [x] services/index.js (UPDATED)
- [x] types/index.js (UPDATED)
- [x] core/index.js (UPDATED)
- [x] index.js main (UPDATED)

#### ⬜ Phase 6: Documentation - TODO
- [ ] README.md (UPDATE with v2.1 usage)
- [ ] Migration guide section in README

---

## ⚠️ Risk Assessment v2.1

### High Risk
1. **Breaking Existing Notifications**
   - **Risk**: Facade methods bị break khi refactor
   - **Mitigation**: Keep facade methods, delegate to engine.emit()
   - **Rollback**: Legacy facade code backup, can revert

2. **Event Handler Dependencies**
   - **Risk**: Handlers import chéo nhau → circular deps
   - **Mitigation**: Handlers only import from facade/repositories
   - **Testing**: Automated import graph check

3. **Middleware Order Matters**
   - **Risk**: Wrong middleware order → wrong behavior
   - **Mitigation**: Document clear order, unit test pipeline
   - **Order**: log → validate → dedupe → rateLimit → preferences

### Medium Risk
1. **Missing Event Coverage**
   - **Risk**: Có event chưa được cover
   - **Mitigation**: Scan legacy NotificationService, list all 30+ methods
   - **Action**: Map each method to event handler

2. **User Preferences Breaking**
   - **Risk**: User preferences not migrated
   - **Mitigation**: Default all to enabled, migrate gradually

3. **Analytics Overhead**
   - **Risk**: Tracking slows down notifications
   - **Mitigation**: Async tracking, sampling for high-volume

### Low Risk
1. **UI/Hooks Unaffected**: Không thay đổi gì ở UI/hooks layer
2. **Data Layer Unaffected**: Repositories giữ nguyên
3. **Backward Compatible**: Facade API không đổi

---

## ✅ Success Criteria v2.1

### Technical
- [ ] Event Registry functional with wildcard support
- [ ] Middleware pipeline with 5 middlewares
- [ ] 14 event handlers (6 domain groups)
- [ ] Each handler < 200 lines
- [ ] Zero circular dependencies
- [ ] Facade reduced to ~100 lines
- [ ] All legacy methods still work
- [ ] Event schemas validate payloads
- [ ] Analytics tracking all events
- [ ] User preferences per event type

### Performance
- [ ] Middleware overhead < 10ms per event
- [ ] Queue processing < 100ms for urgent
- [ ] No memory leaks in registry/queue

### Business
- [ ] All existing flows work unchanged
- [ ] No notification lost
- [ ] Easy to add new events
- [ ] Easy to disable event types per user

### Developer Experience
- [ ] Clear event naming: `domain.action` pattern
- [ ] Domain grouping makes navigation easy
- [ ] Comprehensive docs in README
- [ ] CHANGELOG for version tracking

---

## 🔄 Migration Strategy

### From v1.0 to v2.1

**Step 1: Install v2.1 alongside v1.0**
- All new code lives in `services/events/`, `services/middleware/`, `services/analytics/`
- Facade keeps backward compatible methods

**Step 2: Register handlers without breaking**
- `registerHandlers.js` runs on module init
- Facade methods delegate to `engine.emit()` internally

**Step 3: Gradual migration**
- New code uses `notificationEngine.emit()` directly
- Old code continues using `NotificationServiceFacade.notifyNewOrder()`
- Both work, same result

**Step 4: Add middleware benefits**
- Dedupe, rate-limit, preferences applied automatically
- No code change needed in consumers

**Step 5: Enable analytics**
- Start tracking all events
- Dashboard shows metrics
- Identify failing events

---

## 🚀 Next Steps

### Immediate: Approval
**Questions to confirm**:
1. ✅ 6 domain groups OK? (commerce, farming, social, crm, saas, system)
2. ✅ 14 handlers OK?
3. ✅ 5 middlewares OK?
4. ✅ Event registry + queue OK?
5. ✅ User preferences OK?
6. ✅ Analytics tracking OK?

### After Approval: Implementation Order

**Day 1 (4h): Core + Commerce**
1. Phase 1: Core Infrastructure (2h)
2. Phase 2 partial: Commerce handlers (2h)

**Day 2 (4h): Remaining Handlers**
1. Phase 2 continue: Farming, Social, CRM handlers (3h)
2. Phase 2 finish: SaaS, System handlers (1h)

**Day 3 (2.5h): Middleware + Analytics + Integration**
1. Phase 3: Middleware Pipeline (1.5h)
2. Phase 4: Analytics & Preferences (1h)

**Day 4 (2h): Facade + Docs + Testing**
1. Phase 5: Refactor Facade (1h)
2. Phase 6: Docs + Final testing (1h)

**Total: ~12.5 hours over 4 days**

---

## 📝 Changelog

### [2025-01-21] - v2.1 Implementation Progress
- ✅ Analyzed current facade (314 lines, mixed concerns)
- ✅ Designed Event Registry pattern
- ✅ Designed Middleware Pipeline (5 middlewares)
- ✅ Designed Priority Queue
- ✅ Designed Event Schemas validation
- ✅ Designed User Preferences per event
- ✅ Designed Analytics tracking
- ✅ Identified 6 domain groups, 14 handlers
- ✅ Mapped 60+ events total
- ✅ Created 6-phase refactor plan (~37 files, ~3500 lines)

**Phase 1: Core Infrastructure** ✅ DONE
- ✅ EventTypes.js - 60+ event constants, categories
- ✅ eventRegistry.js - Wildcard support, priority ordering
- ✅ eventQueue.js - Priority-based async queue
- ✅ eventMiddleware.js - Chain of responsibility pipeline
- ✅ eventSchemas.js - Payload validation
- ✅ notificationEngine.js upgraded - emit(), on(), once(), getStats()

**Phase 2: Event Handlers** ✅ DONE  
- ✅ Commerce: OrderEventHandler, PaymentEventHandler, InventoryEventHandler
- ✅ Farming: HarvestEventHandler, PriceEventHandler
- ✅ Social: SocialEventHandler, ReviewEventHandler
- ✅ CRM: CustomerEventHandler, ReferralEventHandler
- ✅ SaaS: TenantEventHandler, SubscriptionEventHandler, UsageEventHandler
- ✅ System: SystemEventHandler
- ✅ registerHandlers.js - Auto-init on import

**Phase 3: Middleware Pipeline** ✅ DONE
- ✅ loggingMiddleware.js
- ✅ validationMiddleware.js
- ✅ dedupeMiddleware.js
- ✅ rateLimitMiddleware.js
- ✅ preferencesMiddleware.js
- ✅ initializeMiddleware()

**Phase 4: Analytics** ✅ DONE
- ✅ EventTracker.js - emit count, success rate, latency, errors

**Phase 5: Integration** ✅ DONE
- ✅ Updated core/index.js exports
- ✅ Updated types/index.js exports
- ✅ Updated services/index.js exports
- ✅ Updated main index.js exports

**Phase 6: Documentation** ✅ DONE
- ✅ Updated README.md with v2.1 usage, event examples, analytics
- ✅ Created MIGRATION-v2.1.md - Complete migration guide

### [2025-01-21] - v2.0 Initial Planning (superseded by v2.1)
- ✅ Initial event-based concept
- ❌ Superseded by v2.1 with full infrastructure

---

## 📊 Architecture Diagram v2.1

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION MODULE v2.1                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     NOTIFICATION ENGINE                              │   │
│  │  ┌──────────┐   ┌──────────┐   ┌─────────────────────────────────┐  │   │
│  │  │  emit()  │──▶│ REGISTRY │──▶│      MIDDLEWARE PIPELINE        │  │   │
│  │  └──────────┘   │ event→   │   │ log→validate→dedupe→rate→prefs │  │   │
│  │                 │ handler  │   └─────────────────────────────────┘  │   │
│  │                 └──────────┘              │                         │   │
│  │                                           ▼                         │   │
│  │  ┌──────────┐                   ┌─────────────────┐                │   │
│  │  │  QUEUE   │◀──────────────────│ EVENT HANDLERS  │                │   │
│  │  │ priority │   async events    │ ┌─────────────┐ │                │   │
│  │  └──────────┘                   │ │  commerce/  │ │                │   │
│  │                                 │ │  farming/   │ │                │   │
│  │  ┌──────────┐                   │ │  social/    │ │                │   │
│  │  │ TRACKER  │◀──────────────────│ │  crm/       │ │                │   │
│  │  │ analytics│   track success   │ │  saas/      │ │                │   │
│  │  └──────────┘                   │ │  system/    │ │                │   │
│  │                                 │ └─────────────┘ │                │   │
│  └─────────────────────────────────┴─────────────────┴─────────────────┘   │
│                                           │                                 │
│                                           ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DOMAIN LAYER                                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │  SCHEMAS   │  │   USER     │  │ RECIPIENT   │  │    SOUND     │  │   │
│  │  │ validation │  │ PREFS      │  │ RESOLVER    │  │   POLICY     │  │   │
│  │  └────────────┘  └────────────┘  └─────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                           │                                 │
│                                           ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                   │   │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌────────────────────┐   │   │
│  │  │ USER NOTIF     │  │ ADMIN NOTIF     │  │ TENANT NOTIF       │   │   │
│  │  │ REPOSITORY     │  │ REPOSITORY      │  │ REPOSITORY         │   │   │
│  │  └────────────────┘  └─────────────────┘  └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                           │                                 │
│                                           ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ENTITIES                                     │   │
│  │      Notification    │    AdminNotification    │   (TenantNotif)    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

> **Lợi Ích v2.1**:  
> 1. **Event Registry**: Tự động dispatch, dễ thêm event mới  
> 2. **Middleware Pipeline**: Reuse cross-cutting logic (log, validate, dedupe)  
> 3. **Domain Grouping**: Tìm handler nhanh theo domain  
> 4. **Schema Validation**: Catch bugs sớm với payload validation  
> 5. **User Preferences**: Cho user control notification types  
> 6. **Analytics**: Monitor event success rate, latency  
> 7. **Priority Queue**: Async processing cho low-priority events  
> 8. **Maintainability**: 14 small handlers thay vì 1 big facade  
> 9. **Testability**: Unit test từng middleware, handler riêng  
> 10. **Scalability**: Easy horizontal scaling với queue