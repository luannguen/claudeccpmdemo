# Migration Guide: v1.0 → v2.1

> **Backward Compatible**: No breaking changes - all v1.0 code continues to work

---

## 📊 What Changed

### Architecture Evolution

**v1.0**: Actor-based (client/admin/tenant)
```
NotificationServiceFacade (314 lines)
├── notifyUser()
├── notifyAdmin()
├── notifyTenant()
├── notifyNewOrder()
├── notifyPaymentConfirmed()
└── ... 25+ more methods
```

**v2.1**: Event-driven with domain handlers
```
NotificationEngine (emit)
├── EventRegistry (event→handler mapping)
├── EventQueue (priority-based async)
├── Middleware Pipeline (5 middlewares)
├── Event Handlers (14 handlers, 6 domains)
└── Analytics Tracker
```

---

## 🔄 Migration Paths

### Path 1: Keep Using v1.0 (No Change)

```javascript
// ✅ Still works - No changes needed
import { NotificationServiceFacade } from '@/components/features/notification';

await NotificationServiceFacade.notifyNewOrder(order, customer);
await NotificationServiceFacade.notifyPaymentConfirmed(order);
await NotificationServiceFacade.notifyHarvestReminder(order, lot, 3);
```

**Benefit**: Zero migration effort  
**Trade-off**: Miss v2.1 benefits (analytics, dedupe, preferences)

---

### Path 2: Gradual Migration (Recommended)

**Step 1**: Keep existing code, add new features with v2.1

```javascript
// Old code - keep as-is
await NotificationServiceFacade.notifyNewOrder(order, customer);

// New code - use event-based
import { notificationEngine, OrderEvents } from '@/components/features/notification';
await notificationEngine.emit(OrderEvents.CREATED, { order, customer });
```

**Step 2**: Migrate high-value flows first

Priority order:
1. Order/Payment events (high volume)
2. Harvest/PreOrder events (complex)
3. Social events (user engagement)
4. Admin notifications
5. System events

**Step 3**: Migrate file-by-file

```javascript
// BEFORE (CheckoutService.js)
import NotificationService from '@/components/notifications/NotificationService';

const processCheckout = async (order) => {
  // ... checkout logic
  await NotificationService.notifyNewOrder(order, customer);
};

// AFTER (CheckoutService.js)
import { notificationEngine, OrderEvents } from '@/components/features/notification';

const processCheckout = async (order) => {
  // ... checkout logic
  await notificationEngine.emit(OrderEvents.CREATED, { order, customer });
};
```

---

### Path 3: Full Migration (Advanced)

**For new projects or major refactor**

1. Replace all facade calls with `engine.emit()`
2. Remove legacy adapters
3. Add custom handlers for business-specific events
4. Enable user preferences
5. Set up analytics dashboard

---

## 🎯 Event Mapping Reference

### From Facade Methods to Events

| v1.0 Facade Method | v2.1 Event | Payload |
|-------------------|------------|---------|
| `notifyNewOrder(order, customer)` | `OrderEvents.CREATED` | `{ order, customer }` |
| `notifyOrderStatusChange(order, status)` | `OrderEvents.SHIPPED` | `{ order, newStatus }` |
| `notifyPaymentVerificationNeeded(order)` | `PaymentEvents.VERIFICATION_NEEDED` | `{ order }` |
| `notifyPaymentConfirmed(order)` | `PaymentEvents.CONFIRMED` | `{ order }` |
| `notifyPaymentFailed(order)` | `PaymentEvents.FAILED` | `{ order }` |
| `notifyDepositReceived(order)` | `PaymentEvents.DEPOSIT_RECEIVED` | `{ order }` |
| `notifyHarvestReminder(order, lot, days)` | `HarvestEvents.REMINDER` | `{ order, lot, daysUntilHarvest }` |
| `notifyHarvestReady(order, lot)` | `HarvestEvents.READY` | `{ order, lot }` |
| `notifyAdminUpcomingHarvest(lot, days, count)` | `HarvestEvents.UPCOMING` | `{ lot, daysLeft, ordersCount }` |
| `notifyFinalPaymentReminder(order, lot, days)` | `HarvestEvents.FINAL_PAYMENT_REMINDER` | `{ order, lot, daysUntilDelivery }` |
| `notifyPriceIncrease(lot, hours, curr, next)` | `PriceEvents.FOMO` | `{ lot, hoursUntilIncrease, currentPrice, nextPrice }` |
| `notifyPriceIncreased(lot, old, new)` | `PriceEvents.INCREASED` | `{ lot, oldPrice, newPrice }` |
| `notifyLowStock(product)` | `InventoryEvents.LOW_STOCK` | `{ product }` |
| `notifyNewCustomer(customer)` | `CustomerEvents.REGISTERED` | `{ customer }` |
| `notifyNewReview(review, product)` | `ReviewEvents.CREATED` | `{ review, product }` |

---

## 💡 Best Practices

### DO ✅

1. **Use event constants**
   ```javascript
   import { OrderEvents } from '@/components/features/notification';
   await notificationEngine.emit(OrderEvents.CREATED, payload);
   ```

2. **Validate payload in development**
   ```javascript
   // Middleware auto-validates, but good to check schema first
   import { getSchema, validatePayload } from '@/components/features/notification';
   const schema = getSchema('order.created');
   const errors = validatePayload(payload, schema);
   if (errors.length > 0) console.warn('Payload issues:', errors);
   ```

3. **Use async for low-priority**
   ```javascript
   await notificationEngine.emit('promo.campaign', payload, { async: true, priority: 'low' });
   ```

4. **Check analytics periodically**
   ```javascript
   import { eventTracker } from '@/components/features/notification';
   const failingEvents = eventTracker.getSummary().topEvents.filter(e => e.successRate < 90);
   ```

### DON'T ❌

1. **Don't import handlers directly**
   ```javascript
   // ❌ BAD
   import { handleOrderCreated } from '@/components/features/notification/services/events/commerce/OrderEventHandler';
   
   // ✅ GOOD
   import { notificationEngine, OrderEvents } from '@/components/features/notification';
   await notificationEngine.emit(OrderEvents.CREATED, payload);
   ```

2. **Don't skip payload validation**
   ```javascript
   // ❌ BAD - Missing required fields
   await notificationEngine.emit('order.created', { order: null });
   
   // ✅ GOOD - Complete payload
   await notificationEngine.emit('order.created', { order, customer });
   ```

3. **Don't use magic strings**
   ```javascript
   // ❌ BAD
   await notificationEngine.emit('order_created', payload); // Wrong name
   
   // ✅ GOOD
   await notificationEngine.emit(OrderEvents.CREATED, payload);
   ```

---

## 🔍 Troubleshooting

### Event not firing?

**Check 1**: Handlers registered?
```javascript
import { eventRegistry } from '@/components/features/notification';
console.log(eventRegistry.listEvents());
```

**Check 2**: Payload valid?
```javascript
import { getSchema, validatePayload } from '@/components/features/notification';
const errors = validatePayload(payload, getSchema(eventName));
console.log('Validation errors:', errors);
```

**Check 3**: Rate limited?
```javascript
import { getRateLimitStats } from '@/components/features/notification';
console.log('Rate limits:', getRateLimitStats());
```

**Check 4**: User disabled?
```javascript
// Check middleware logs in console
// Look for: "🔕 User has disabled [event]"
```

### Analytics

**View event stats**:
```javascript
import { eventTracker } from '@/components/features/notification';

// Overall
console.log('Summary:', eventTracker.getSummary());

// Per event
console.log('Order stats:', eventTracker.getEventStats('order.created'));

// Recent emits
console.log('Recent:', eventTracker.getRecentEmits(10));
```

**View engine stats**:
```javascript
import { notificationEngine } from '@/components/features/notification';

const stats = await notificationEngine.getStats();
console.log('Engine:', stats);
```

---

## 📚 Learn More

- **NotificationEventBasedUpgrade.md** - Full v2.1 design & implementation
- **NotificationModuleRefactorPlan.md** - Module architecture details
- **components/features/notification/services/events/** - Domain handler implementations