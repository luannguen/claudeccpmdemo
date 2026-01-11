import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { orderRepository } from "@/components/data";
import { useDebouncedValue } from "@/components/shared/utils";
import { Clock, CheckCircle, Package, Truck, XCircle, PackageX, Star } from "lucide-react";

export const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'yellow', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'blue', icon: CheckCircle },
  processing: { label: 'Đang chuẩn bị', color: 'purple', icon: Package },
  shipping: { label: 'Đang giao', color: 'indigo', icon: Truck },
  delivered: { label: 'Đã giao', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'red', icon: XCircle },
  return_approved: { label: 'Đã duyệt trả', color: 'orange', icon: PackageX },
  returned_refunded: { label: 'Đã hoàn tiền', color: 'green', icon: Star }
};

export const dateRangeOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'quarter', label: '3 tháng' },
  { value: 'year', label: 'Năm nay' }
];

export function useCurrentUser() {
  return useQuery({
    queryKey: ['my-orders-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000
  });
}

export function useMyOrdersList(userEmail) {
  return useQuery({
    queryKey: ['my-orders-list', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const result = await orderRepository.listByCustomer(userEmail, 500);
      return result.success ? result.data : [];
    },
    enabled: !!userEmail,
    staleTime: 0,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true
  });
}

export function filterByDateRange(order, dateRange) {
  if (dateRange === 'all') return true;
  
  const orderDate = new Date(order.created_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch(dateRange) {
    case 'today':
      return orderDate >= today;
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
    default:
      return true;
  }
}

export function useFilteredOrders(orders, statusFilter, dateRange, searchTerm) {
  return useMemo(() => {
    const safeOrders = orders || [];
    return safeOrders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
      const matchesDate = filterByDateRange(order, dateRange);
      const matchesSearch = !searchTerm.trim() || 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [orders, statusFilter, dateRange, searchTerm]);
}

export function useOrderStats(orders) {
  return useMemo(() => {
    const safeOrders = orders || [];
    return {
      total: safeOrders.length,
      pending: safeOrders.filter(o => o.order_status === 'pending').length,
      shipping: safeOrders.filter(o => o.order_status === 'shipping').length,
      delivered: safeOrders.filter(o => o.order_status === 'delivered').length
    };
  }, [orders]);
}

export function useOrderFilters() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDateRange('all');
    setStatusFilter('all');
  }, []);
  
  // NOTE: viewMode đã được chuyển sang useViewModeState trong component
  // để persist vào localStorage và tái sử dụng across pages
  
  return {
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    searchTerm, setSearchTerm,
    clearFilters
  };
}

export function useOrderModals() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showOrderSelector, setShowOrderSelector] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);

  const handleReturnClick = useCallback((order = null) => {
    if (order) {
      setOrderToReturn(order);
      setShowReturnPolicy(true);
    } else {
      setShowReturnPolicy(true);
    }
  }, []);

  const handlePolicyAgree = useCallback(() => {
    setShowReturnPolicy(false);
    if (orderToReturn) {
      setShowReturnModal(true);
    } else {
      setShowOrderSelector(true);
    }
  }, [orderToReturn]);

  const handleOrderSelected = useCallback((order) => {
    setShowOrderSelector(false);
    setOrderToReturn(order);
    setShowReturnModal(true);
  }, []);

  const closeReturnPolicy = useCallback(() => {
    setShowReturnPolicy(false);
    setOrderToReturn(null);
  }, []);

  const closeReturnModal = useCallback(() => {
    setShowReturnModal(false);
    setOrderToReturn(null);
  }, []);

  return {
    selectedOrder, setSelectedOrder,
    showReturnPolicy, showOrderSelector, showReturnModal,
    orderToReturn,
    handleReturnClick, handlePolicyAgree, handleOrderSelected,
    closeReturnPolicy, closeReturnModal,
    setShowOrderSelector
  };
}

export function canReturnOrder(orderStatus) {
  return ['delivered', 'completed'].includes(orderStatus);
}