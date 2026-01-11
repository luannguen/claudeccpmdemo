import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== STATUS CONFIG ==========

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'yellow', iconName: 'Clock' },
  confirmed: { label: 'Đã xác nhận', color: 'blue', iconName: 'CheckCircle' },
  processing: { label: 'Đang chuẩn bị', color: 'purple', iconName: 'Package' },
  // Pre-Order specific statuses
  awaiting_harvest: { label: 'Chờ thu hoạch', color: 'amber', iconName: 'Sprout' },
  harvest_ready: { label: 'Sẵn sàng giao', color: 'lime', iconName: 'Leaf' },
  partial_payment: { label: 'Đã cọc', color: 'orange', iconName: 'Wallet' },
  // Regular statuses
  shipping: { label: 'Đang giao', color: 'indigo', iconName: 'Truck' },
  delivered: { label: 'Đã giao', color: 'green', iconName: 'CheckCircle' },
  cancelled: { label: 'Đã hủy', color: 'red', iconName: 'XCircle' },
  return_approved: { label: 'Đã duyệt trả', color: 'orange', iconName: 'PackageX' },
  returned_refunded: { label: 'Đã hoàn tiền', color: 'green', iconName: 'DollarSign' }
};

// ========== ORDER DETAIL STATE ==========

export function useOrderDetailState() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  return {
    showCancelModal, setShowCancelModal,
    showMessageCenter, setShowMessageCenter,
    activeTab, setActiveTab
  };
}

// ========== CURRENT USER ==========

export function useOrderDetailUser() {
  return useQuery({
    queryKey: ['current-user-order-detail'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });
}

// ========== ORDER STATUS HELPERS ==========

export function useOrderStatus(order) {
  return useMemo(() => {
    const statusKey = order?.order_status || 'pending';
    const status = ORDER_STATUS_CONFIG[statusKey] || ORDER_STATUS_CONFIG.pending;
    const canCancel = order ? ['pending', 'confirmed'].includes(order.order_status) : false;
    return { status, canCancel };
  }, [order]);
}

// ========== CANCEL MUTATION ==========

export function useCancelOrderMutation(order, onClose) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason) => {
      if (!order) return;
      return await base44.entities.Order.update(order.id, {
        order_status: 'cancelled',
        internal_note: `Khách hủy: ${reason}`,
        cancelled_date: new Date().toISOString()
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      await queryClient.refetchQueries({ queryKey: ['my-orders-list'], type: 'active' });
      onClose();
      showSuccessToast('✅ Đã hủy đơn hàng thành công');
    }
  });
}

// ========== CANCEL ORDER STATE ==========

export const CANCEL_REASONS = [
  { id: 'changed_mind', label: 'Tôi đổi ý, không muốn mua nữa' },
  { id: 'found_better_price', label: 'Tìm được giá tốt hơn ở nơi khác' },
  { id: 'wrong_item', label: 'Đặt nhầm sản phẩm' },
  { id: 'delivery_too_long', label: 'Thời gian giao hàng quá lâu' },
  { id: 'payment_issue', label: 'Có vấn đề với thanh toán' },
  { id: 'duplicate_order', label: 'Đặt trùng đơn hàng' },
  { id: 'other', label: 'Lý do khác' }
];

export function useCancelOrderState() {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonToggle = (reasonId) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId) 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const reset = () => {
    setSelectedReasons([]);
    setOtherReason('');
    setIsSubmitting(false);
  };

  const buildFinalReason = () => {
    const reasonTexts = selectedReasons.map(id => {
      const reason = CANCEL_REASONS.find(r => r.id === id);
      if (id === 'other') return `Khác: ${otherReason}`;
      return reason?.label;
    });
    return reasonTexts.join('; ');
  };

  const validate = () => {
    if (selectedReasons.length === 0) {
      alert('Vui lòng chọn ít nhất một lý do hủy');
      return false;
    }
    if (selectedReasons.includes('other') && !otherReason.trim()) {
      alert('Vui lòng nhập lý do khác');
      return false;
    }
    return true;
  };

  return {
    selectedReasons, setSelectedReasons,
    otherReason, setOtherReason,
    isSubmitting, setIsSubmitting,
    handleReasonToggle, reset, buildFinalReason, validate
  };
}

// ========== UTILITIES ==========

function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
  toast.innerHTML = `<span class="font-medium">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}