import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { showAdminAlert } from '@/components/AdminAlert';
// ✅ MIGRATED v2.2: Event-driven email + Push notifications
import { NotificationServiceFacade } from '@/components/features/notification';
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';

// ✅ Payment Status Config
export const PAYMENT_STATUSES = [
  { value: "all", label: "Tất cả", color: "gray" },
  { value: "awaiting_confirmation", label: "Mới tạo", color: "blue" },
  { value: "awaiting_verification", label: "Chờ xác minh", color: "yellow" },
  { value: "paid", label: "Đã xác nhận", color: "green" },
  { value: "failed", label: "Thất bại", color: "red" }
];

/**
 * Hook fetch orders for verification (bank transfer only)
 */
export function useVerificationOrders() {
  return useQuery({
    queryKey: ['payment-verification-orders'],
    queryFn: async () => {
      const result = await base44.entities.Order.list('-created_date', 500);
      return (result || []).filter(o => o.payment_method === 'bank_transfer');
    },
    staleTime: 5 * 1000,
    refetchOnMount: 'always',
    refetchInterval: 15 * 1000
  });
}

/**
 * Hook fetch bank config
 */
export function useBankConfig() {
  return useQuery({
    queryKey: ['bank-config-verification'],
    queryFn: async () => {
      try {
        const configs = await base44.entities.PlatformConfig.list('-created_date', 100);
        const bankConf = configs.find(c => c.config_key === 'bank_account_settings');
        return bankConf ? JSON.parse(bankConf.config_value) : null;
      } catch (error) {
        console.error('Error loading bank config:', error);
        return null;
      }
    }
  });
}

/**
 * Hook tính stats cho verification
 */
export function useVerificationStats(orders = []) {
  return useMemo(() => {
    const safeOrders = orders || [];
    return {
      total: safeOrders.length,
      awaiting_verification: safeOrders.filter(o => o.payment_status === 'awaiting_verification').length,
      awaiting_confirmation: safeOrders.filter(o => o.payment_status === 'awaiting_confirmation').length,
      paid: safeOrders.filter(o => o.payment_status === 'paid').length,
      failed: safeOrders.filter(o => o.payment_status === 'failed').length,
      total_amount: safeOrders.filter(o => o.payment_status === 'awaiting_verification')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };
  }, [orders]);
}

/**
 * Hook filter orders
 */
export function useFilteredOrders(orders, searchTerm, statusFilter) {
  return useMemo(() => {
    const safeOrders = orders || [];
    return safeOrders.filter(order => {
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);
}

/**
 * Hook mutations cho verification
 * ✅ MIGRATED v2.2: Event-driven email + Push notifications
 */
export function useVerificationMutations() {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async ({ orderId, note, order }) => {
      await base44.entities.Order.update(orderId, {
        payment_status: 'paid',
        order_status: 'confirmed',
        internal_note: note ? `[PAYMENT VERIFIED] ${note}` : '[PAYMENT VERIFIED] Đã xác nhận thanh toán qua sao kê'
      });
      return order; // Return order for onSuccess
    },
    onSuccess: (order) => {
      showAdminAlert('✅ Đã xác minh thanh toán thành công', 'success');
      queryClient.invalidateQueries(['payment-verification-orders']);
      queryClient.invalidateQueries(['admin-all-orders']);
      queryClient.invalidateQueries(['my-orders-list']);

      // ✅ Publish PAYMENT_CONFIRMED event → Email Pipeline
      if (order) {
        eventBus.publish(EMAIL_EVENT_TYPES.PAYMENT_CONFIRMED, {
          orderId: order.id,
          order: { ...order, payment_status: 'paid', order_status: 'confirmed' }
        });
        console.log('✅ PAYMENT_CONFIRMED event published → Email Pipeline');

        // Push notification (in-app)
        NotificationServiceFacade.notifyPaymentConfirmed?.(order)
          .catch(err => console.error('Push notification error:', err));
      }
    },
    onError: (error) => {
      showAdminAlert('❌ Có lỗi xảy ra: ' + error.message, 'error');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, note, order }) => {
      await base44.entities.Order.update(orderId, {
        payment_status: 'failed',
        order_status: 'cancelled',
        internal_note: `[PAYMENT REJECTED] ${note}`
      });
      return order; // Return order for onSuccess
    },
    onSuccess: (order) => {
      showAdminAlert('✅ Đã từ chối thanh toán', 'warning');
      queryClient.invalidateQueries(['payment-verification-orders']);
      queryClient.invalidateQueries(['admin-all-orders']);
      queryClient.invalidateQueries(['my-orders-list']);

      // ✅ Publish PAYMENT_FAILED event → Email Pipeline
      if (order) {
        eventBus.publish(EMAIL_EVENT_TYPES.PAYMENT_FAILED, {
          orderId: order.id,
          order: { ...order, payment_status: 'failed', order_status: 'cancelled' }
        });
        console.log('✅ PAYMENT_FAILED event published → Email Pipeline');
      }
    },
    onError: (error) => {
      showAdminAlert('❌ Có lỗi xảy ra: ' + error.message, 'error');
    }
  });

  return { verifyMutation, rejectMutation };
}

/**
 * Hook quản lý state cho verification page
 */
export function useVerificationState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("awaiting_verification");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [displayCount, setDisplayCount] = useState(50);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printOrders, setPrintOrders] = useState([]);

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = (displayedOrders) => {
    if (selectedOrders.length === displayedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(displayedOrders.map(o => o.id));
    }
  };

  const clearSelection = () => setSelectedOrders([]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    viewMode,
    setViewMode,
    selectedOrders,
    setSelectedOrders,
    toggleOrderSelection,
    toggleSelectAll,
    clearSelection,
    displayCount,
    setDisplayCount,
    showPrintPreview,
    setShowPrintPreview,
    printOrders,
    setPrintOrders
  };
}

/**
 * Hook infinite scroll
 */
export function useInfiniteScroll(hasMore, filteredCount, setDisplayCount) {
  const loadMoreRef = useRef();

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 50, filteredCount));
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredCount, setDisplayCount]);

  return loadMoreRef;
}

export default useVerificationOrders;