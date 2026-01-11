# 🔔 Real-Time Notification System

## Architecture

### 📁 File Structure
```
components/notifications/
  ├── NotificationService.jsx         # Centralized notification creator
  ├── useRealTimeNotifications.jsx    # Real-time polling hook
  ├── NotificationBellEnhanced.jsx    # User notification UI
  ├── AdminNotificationBellEnhanced.jsx # Admin notification UI
  └── README.md                        # This file
```

---

## 🚀 How It Works

### 1️⃣ **NotificationService** (Backend Logic)
Creates notifications for different events:

```javascript
import NotificationService from '@/components/notifications/NotificationService';

// ✅ New Order
await NotificationService.notifyNewOrder(order, customer);

// ✅ Payment Verification
await NotificationService.notifyPaymentVerificationNeeded(order);

// ✅ Order Status Change
await NotificationService.notifyOrderStatusChange(order, 'shipping');

// ✅ New Review
await NotificationService.notifyNewReview(review, product);

// ✅ Low Stock
await NotificationService.notifyLowStock(product);
```

### 2️⃣ **useRealTimeNotifications** (Data Sync)
Real-time polling hook with intelligent caching:

```javascript
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
} = useRealTimeNotifications(userEmail, {
  isAdmin: true,
  refetchInterval: 3000 // 3s for admin, 10s for users
});
```

**Features:**
- ✅ Auto-polling every 3-10s
- ✅ Browser notifications (when permitted)
- ✅ Sound alerts on new notifications
- ✅ Optimistic updates
- ✅ Background refetch

### 3️⃣ **UI Components**
- **NotificationBellEnhanced**: For regular users
- **AdminNotificationBellEnhanced**: For admin panel

---

## 🔧 Integration Guide

### Client-Side (when creating orders, reviews, etc.)

```javascript
import NotificationService from '@/components/notifications/NotificationService';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After creating order
const order = await base44.entities.Order.create(orderData);

// ✅ Send notifications (MUST await)
await NotificationService.notifyNewOrder(order, customerInfo);

// ✅ Force admin queries to refresh
queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
queryClient.refetchQueries({ queryKey: ['admin-notifications-realtime'] });
```

### Admin Panel

```javascript
import AdminNotificationBellEnhanced from '@/components/notifications/AdminNotificationBellEnhanced';

<AdminNotificationBellEnhanced user={currentUser} />
```

### User Panel

```javascript
import NotificationBellEnhanced from '@/components/notifications/NotificationBellEnhanced';

<NotificationBellEnhanced currentUser={currentUser} />
```

---

## 📊 Real-Time Sync Strategy

1. **Polling Intervals:**
   - Admin: 3 seconds (instant updates)
   - Users: 10 seconds (battery-friendly)

2. **Query Invalidation:**
   - After any order/payment action → invalidate ALL notification queries
   - Force immediate refetch for admin queries

3. **Optimistic Updates:**
   - Mark as read → instant UI update, then sync to DB

4. **Browser Notifications:**
   - Request permission on first load
   - Show native notifications for new items (when app not focused)

---

## 🐛 Debugging

Enable console logs:
```javascript
// Check notification creation
console.log('🔔 Creating notifications for order:', order.order_number);

// Check admin recipients
console.log('👨‍💼 Admin recipients:', recipients);

// Check query invalidation
console.log('🔄 Invalidating queries...');
```

---

## 🎯 Performance Optimization

✅ **What's Optimized:**
- Memoized components (React.memo)
- Efficient polling (staleTime, refetchInterval)
- Optimistic updates (instant UI feedback)
- Batch operations (bulk mark as read)

⚠️ **What to Avoid:**
- Don't increase polling frequency > 3s for admin
- Don't create notifications in loops
- Don't forget to invalidate queries after notification creation

---

## 📈 Future Enhancements

- [ ] WebSocket support (replace polling)
- [ ] Push notifications (via service worker)
- [ ] Email notifications integration
- [ ] SMS notifications for urgent items
- [ ] Notification grouping/batching
- [ ] Rich notification templates

---

## ✅ Checklist for New Notification Types

1. Add new `type` to entity schema (`entities/AdminNotification.json`)
2. Add icon config to `NOTIFICATION_CONFIG`
3. Create method in `NotificationService`
4. Call from relevant action (e.g., order creation)
5. Invalidate queries after creation
6. Test real-time sync

---

**Last Updated:** 2024-01-14
**Version:** 2.0 (Real-time with aggressive polling)