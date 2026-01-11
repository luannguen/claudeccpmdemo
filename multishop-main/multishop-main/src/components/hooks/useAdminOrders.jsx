import { useMemo, useCallback, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderRepository } from "@/components/data";
import { useDebouncedValue } from "@/components/shared/utils";
// ✅ MIGRATED v2.2: Event-driven email + Push notifications
import { NotificationServiceFacade } from '@/components/features/notification';
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
import { showAdminAlert } from "@/components/AdminAlert";

export const statusOptions = [
  { value: "all", label: "Tất cả", color: "gray" },
  { value: "pending", label: "Chờ xử lý", color: "yellow" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "processing", label: "Đang chuẩn bị", color: "purple" },
  { value: "shipping", label: "Đang giao", color: "indigo" },
  { value: "delivered", label: "Đã giao", color: "green" },
  { value: "return_approved", label: "Đã duyệt trả", color: "orange" },
  { value: "returned_refunded", label: "Đã hoàn tiền", color: "teal" },
  { value: "cancelled", label: "Đã hủy", color: "red" }
];

export const dateRangeOptions = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'week', label: '7 ngày qua' },
  { value: 'month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'quarter', label: '3 tháng qua' },
  { value: 'year', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chọn' }
];

export function filterByDateRange(order, dateRange, customStart, customEnd) {
  if (dateRange === 'all') return true;
  
  const orderDate = new Date(order.created_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch(dateRange) {
    case 'today':
      return orderDate >= today;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return orderDate >= yesterday && orderDate < today;
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    case 'month':
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return orderDate >= lastMonth && orderDate <= lastMonthEnd;
    case 'quarter':
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return orderDate >= threeMonthsAgo;
    case 'year':
      return orderDate.getFullYear() === now.getFullYear();
    case 'custom':
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return orderDate >= start && orderDate <= end;
    default:
      return true;
  }
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: async () => {
      const result = await orderRepository.list('-created_date', 500);
      return result.success ? result.data : [];
    },
    staleTime: 30000,
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });
}

// Re-export useDebouncedValue from shared utils
export { useDebouncedValue as useDebouncedSearch } from "@/components/shared/utils";

export function useOrderStats(orders) {
  return useMemo(() => ({
    total: orders.length,
    platform: orders.filter(o => !o.shop_id).length,
    shops: orders.filter(o => o.shop_id).length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    shipping: orders.filter(o => o.order_status === 'shipping').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length
  }), [orders]);
}

export function useFilteredOrders(orders, filters) {
  const { debouncedSearch, statusFilter, sourceFilter, preorderFilter, dateRange, customStartDate, customEndDate } = filters;
  
  return useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.customer_phone?.includes(debouncedSearch) ||
        order.order_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.shop_name?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "platform" && !order.shop_id) ||
        (sourceFilter === "shops" && order.shop_id);
      
      const matchesPreorder =
        preorderFilter === "all" ||
        (preorderFilter === "preorder" && order.has_preorder_items) ||
        (preorderFilter === "regular" && !order.has_preorder_items);
      
      const matchesDate = filterByDateRange(order, dateRange, customStartDate, customEndDate);

      return matchesSearch && matchesStatus && matchesSource && matchesPreorder && matchesDate;
    });
  }, [orders, debouncedSearch, statusFilter, sourceFilter, preorderFilter, dateRange, customStartDate, customEndDate]);
}

export function useOrderUpdateMutation(orders, onSuccess) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updates }) => {
      const order = orders.find(o => o.id === orderId);
      const oldStatus = order?.order_status;
      
      const result = await orderRepository.update(orderId, updates);
      if (!result.success) throw new Error(result.message);
      
      // ✅ MIGRATED v2.2: Event-driven email + Push notifications
      if (updates.order_status && updates.order_status !== oldStatus) {
        const newStatus = updates.order_status;
        const updatedOrder = result.data;

        // 1. Push notifications (in-app)
        NotificationServiceFacade.notifyOrderStatusChange(updatedOrder, newStatus)
          .catch(err => console.error('Push notification error:', err));

        // 2. Publish event → Email Pipeline handles email
        const eventType = {
          'shipping': EMAIL_EVENT_TYPES.ORDER_SHIPPED,
          'delivered': EMAIL_EVENT_TYPES.ORDER_DELIVERED,
          'cancelled': EMAIL_EVENT_TYPES.ORDER_CANCELLED
        }[newStatus];

        if (eventType) {
          eventBus.publish(eventType, {
            orderId: updatedOrder.id,
            order: updatedOrder,
            reason: updates.cancellation_reason || updates.internal_note
          });
          console.log(`✅ ${eventType} event published → Email Pipeline`);
        }
      }
      
      return result.data;
    },
    onSuccess: async () => {
      showAdminAlert('✅ Đã cập nhật đơn hàng', 'success');
      await queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      onSuccess?.();
    },
    onError: (error) => {
      showAdminAlert('❌ Có lỗi: ' + error.message, 'error');
    }
  });
}

export function useOrderSelection(displayedOrders) {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const toggleOrderSelection = useCallback((orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.length === displayedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(displayedOrders.map(o => o.id));
    }
  }, [selectedOrders.length, displayedOrders]);

  const clearSelection = useCallback(() => {
    setSelectedOrders([]);
  }, []);

  return { selectedOrders, toggleOrderSelection, toggleSelectAll, clearSelection };
}