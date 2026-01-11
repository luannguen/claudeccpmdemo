/**
 * useOrderListBase - Base hook for order listing
 * 
 * Shared logic for both customer and admin order lists.
 * Provides: data fetching, filtering, stats, pagination
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderRepository } from '@/components/data';
import { useDebouncedValue } from '@/components/shared/utils';
import { OrderStatus } from '@/components/data/types';
import { Clock, CheckCircle, Package, Truck, XCircle, PackageX, Star, AlertCircle } from 'lucide-react';

// ========== STATUS CONFIGURATIONS ==========

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'yellow', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'blue', icon: CheckCircle },
  processing: { label: 'Đang chuẩn bị', color: 'purple', icon: Package },
  awaiting_harvest: { label: 'Chờ thu hoạch', color: 'amber', icon: Clock },
  harvest_ready: { label: 'Sẵn sàng', color: 'lime', icon: CheckCircle },
  shipping: { label: 'Đang giao', color: 'indigo', icon: Truck },
  delivered: { label: 'Đã giao', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'red', icon: XCircle },
  return_approved: { label: 'Đã duyệt trả', color: 'orange', icon: PackageX },
  returned_refunded: { label: 'Đã hoàn tiền', color: 'teal', icon: Star }
};

export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả", color: "gray" },
  { value: "pending", label: "Chờ xử lý", color: "yellow" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "processing", label: "Đang chuẩn bị", color: "purple" },
  { value: "shipping", label: "Đang giao", color: "indigo" },
  { value: "delivered", label: "Đã giao", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" }
];

export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'week', label: '7 ngày qua' },
  { value: 'month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'quarter', label: '3 tháng qua' },
  { value: 'year', label: 'Năm nay' }
];

// ========== DATE FILTER HELPER ==========

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

// ========== ORDER LIST BASE HOOK ==========

/**
 * Base order list hook
 * @param {Object} options
 * @param {string} [options.customerEmail] - Filter by customer email (for customer view)
 * @param {number} [options.limit=500] - Max orders to fetch
 * @param {string} [options.queryKey='orders-base'] - React Query key
 * @param {number} [options.staleTime=30000] - Cache time
 * @param {number} [options.refetchInterval] - Auto refetch interval
 */
export function useOrderListBase(options = {}) {
  const {
    customerEmail,
    limit = 500,
    queryKey = 'orders-base',
    staleTime = 30000,
    refetchInterval = 10000
  } = options;

  return useQuery({
    queryKey: [queryKey, customerEmail],
    queryFn: async () => {
      const result = customerEmail
        ? await orderRepository.listByCustomer(customerEmail, limit)
        : await orderRepository.list('-created_date', limit);
      return result.success ? result.data : [];
    },
    enabled: customerEmail ? !!customerEmail : true,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: true
  });
}

// ========== FILTER STATE HOOK ==========

/**
 * Manage filter state for order lists
 */
export function useOrderFilters(initialValues = {}) {
  const [searchTerm, setSearchTerm] = useState(initialValues.searchTerm || '');
  const [statusFilter, setStatusFilter] = useState(initialValues.status || 'all');
  const [dateRange, setDateRange] = useState(initialValues.dateRange || 'all');
  const [customStartDate, setCustomStartDate] = useState(initialValues.customStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(initialValues.customEndDate || '');
  const [sourceFilter, setSourceFilter] = useState(initialValues.source || 'all'); // platform/shops
  const [preorderFilter, setPreorderFilter] = useState(initialValues.preorder || 'all');

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSourceFilter('all');
    setPreorderFilter('all');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    sourceFilter,
    setSourceFilter,
    preorderFilter,
    setPreorderFilter,
    clearFilters
  };
}

// ========== FILTERED ORDERS HOOK ==========

/**
 * Apply filters to order list
 * @param {Array} orders - Raw order list
 * @param {Object} filters - Filter state from useOrderFilters
 */
export function useFilteredOrders(orders, filters) {
  const {
    debouncedSearch,
    statusFilter,
    dateRange,
    customStartDate,
    customEndDate,
    sourceFilter,
    preorderFilter
  } = filters;

  return useMemo(() => {
    if (!orders || orders.length === 0) return [];

    return orders.filter(order => {
      // Search filter
      const matchesSearch = !debouncedSearch || 
        order.order_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.customer_phone?.includes(debouncedSearch) ||
        order.shop_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.items?.some(item => item.product_name?.toLowerCase().includes(debouncedSearch.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

      // Date filter
      const matchesDate = filterByDateRange(order, dateRange, customStartDate, customEndDate);

      // Source filter (admin only)
      const matchesSource = sourceFilter === 'all' ||
        (sourceFilter === 'platform' && !order.shop_id) ||
        (sourceFilter === 'shops' && order.shop_id);

      // Preorder filter (admin only)
      const matchesPreorder = preorderFilter === 'all' ||
        (preorderFilter === 'preorder' && order.has_preorder_items) ||
        (preorderFilter === 'regular' && !order.has_preorder_items);

      return matchesSearch && matchesStatus && matchesDate && matchesSource && matchesPreorder;
    });
  }, [orders, debouncedSearch, statusFilter, dateRange, customStartDate, customEndDate, sourceFilter, preorderFilter]);
}

// ========== ORDER STATS HOOK ==========

/**
 * Calculate order statistics
 * @param {Array} orders - Order list
 */
export function useOrderStats(orders) {
  return useMemo(() => {
    const safeOrders = orders || [];
    
    return {
      total: safeOrders.length,
      pending: safeOrders.filter(o => o.order_status === 'pending').length,
      confirmed: safeOrders.filter(o => o.order_status === 'confirmed').length,
      processing: safeOrders.filter(o => o.order_status === 'processing').length,
      shipping: safeOrders.filter(o => o.order_status === 'shipping').length,
      delivered: safeOrders.filter(o => o.order_status === 'delivered').length,
      cancelled: safeOrders.filter(o => o.order_status === 'cancelled').length,
      platform: safeOrders.filter(o => !o.shop_id).length,
      shops: safeOrders.filter(o => o.shop_id).length,
      preorder: safeOrders.filter(o => o.has_preorder_items).length,
      totalRevenue: safeOrders
        .filter(o => o.order_status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };
  }, [orders]);
}

// ========== SELECTION HOOK (Admin) ==========

/**
 * Manage order selection for bulk actions
 */
export function useOrderSelection(orders) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = useCallback((orderId) => {
    setSelectedIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  }, [selectedIds.length, orders]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectedOrders = useMemo(() => 
    orders.filter(o => selectedIds.includes(o.id)),
    [orders, selectedIds]
  );

  return {
    selectedIds,
    selectedOrders,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected: selectedIds.length === orders.length && orders.length > 0,
    hasSelection: selectedIds.length > 0
  };
}

// ========== COMBINED HOOK FOR CUSTOMER ==========

/**
 * Full order list hook for customer "My Orders" page
 */
export function useOrderListCustomer(userEmail) {
  const { data: orders = [], isLoading, error, refetch } = useOrderListBase({
    customerEmail: userEmail,
    limit: 500,
    queryKey: 'my-orders',
    staleTime: 0,
    refetchInterval: 5000
  });

  const filters = useOrderFilters();
  const filteredOrders = useFilteredOrders(orders, filters);
  const stats = useOrderStats(orders);

  return {
    orders: filteredOrders,
    allOrders: orders,
    stats,
    isLoading,
    error,
    refetch,
    ...filters
  };
}

// ========== COMBINED HOOK FOR ADMIN ==========

/**
 * Full order list hook for admin pages
 */
export function useOrderListAdmin() {
  const { data: orders = [], isLoading, error, refetch } = useOrderListBase({
    limit: 500,
    queryKey: 'admin-orders',
    staleTime: 30000,
    refetchInterval: 10000
  });

  const filters = useOrderFilters();
  const filteredOrders = useFilteredOrders(orders, filters);
  const stats = useOrderStats(orders);
  const selection = useOrderSelection(filteredOrders);

  return {
    orders: filteredOrders,
    allOrders: orders,
    stats,
    selection,
    isLoading,
    error,
    refetch,
    ...filters
  };
}

// ========== HELPERS ==========

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(orderStatus) {
  const nonCancellable = ['delivered', 'cancelled', 'returned_refunded', 'return_approved'];
  return !nonCancellable.includes(orderStatus);
}

/**
 * Check if order can be returned
 */
export function canReturnOrder(orderStatus) {
  return ['delivered', 'completed'].includes(orderStatus);
}

/**
 * Get status display info
 */
export function getStatusInfo(status) {
  return ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: 'gray',
    icon: AlertCircle
  };
}

export default {
  useOrderListBase,
  useOrderFilters,
  useFilteredOrders,
  useOrderStats,
  useOrderSelection,
  useOrderListCustomer,
  useOrderListAdmin,
  ORDER_STATUS_CONFIG,
  STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  filterByDateRange,
  canCancelOrder,
  canReturnOrder,
  getStatusInfo
};