import { useState, useEffect, useCallback } from 'react';

// ========== STATUS OPTIONS ==========

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang chuẩn bị" },
  // Pre-Order specific
  { value: "awaiting_harvest", label: "🌾 Chờ thu hoạch", preorderOnly: true },
  { value: "harvest_ready", label: "🌿 Sẵn sàng giao", preorderOnly: true },
  { value: "partial_payment", label: "💰 Đã cọc, chờ TT", preorderOnly: true },
  // Regular
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "return_approved", label: "Đã duyệt trả" },
  { value: "returned_refunded", label: "Đã hoàn tiền" },
  { value: "cancelled", label: "Đã hủy" }
];

// Helper to filter options based on order type
export function getStatusOptionsForOrder(order) {
  const hasPreorder = order?.has_preorder_items;
  return ORDER_STATUS_OPTIONS.filter(opt => 
    !opt.preorderOnly || hasPreorder
  );
}

// ========== STATE HOOK ==========

export function useOrderDetailsState(order) {
  const [newStatus, setNewStatus] = useState(order?.order_status || "pending");
  const [internalNote, setInternalNote] = useState(order?.internal_note || "");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Reset khi order thay đổi
  useEffect(() => {
    if (order) {
      setNewStatus(order.order_status || "pending");
      setInternalNote(order.internal_note || "");
    }
  }, [order?.id]);

  return {
    newStatus, setNewStatus,
    internalNote, setInternalNote,
    showRefundModal, setShowRefundModal,
    activeTab, setActiveTab
  };
}

// ========== ACTIONS HOOK ==========

export function useOrderDetailsActions(order, state, onUpdateStatus, onClose, onPrint) {
  const handleUpdateStatus = useCallback(() => {
    if (!order) return;
    onUpdateStatus(order.id, {
      order_status: state.newStatus,
      internal_note: state.internalNote
    });
  }, [order, state.newStatus, state.internalNote, onUpdateStatus]);

  const handlePrint = useCallback(() => {
    if (onPrint && order) {
      onPrint(order);
      onClose();
    }
  }, [order, onPrint, onClose]);

  const openRefundModal = useCallback(() => {
    state.setShowRefundModal(true);
  }, [state]);

  const closeRefundModal = useCallback(() => {
    state.setShowRefundModal(false);
  }, [state]);

  return {
    handleUpdateStatus,
    handlePrint,
    openRefundModal,
    closeRefundModal
  };
}

// ========== PERMISSIONS HOOK ==========

export function useOrderPermissions(order) {
  const canRefund = order?.payment_status === 'paid' && order?.order_status !== 'cancelled';
  
  return { canRefund };
}