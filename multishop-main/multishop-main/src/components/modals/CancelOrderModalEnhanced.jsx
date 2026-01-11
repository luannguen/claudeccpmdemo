import React, { useMemo } from 'react';
import EnhancedModal from '../EnhancedModal';
import { XCircle, AlertTriangle, Sprout } from 'lucide-react';

// Hooks
import { useCancelOrderState } from '@/components/hooks/useOrderDetail';

// Components
import CancelReasonSelector from './order/CancelReasonSelector';
import PreOrderCancellationPolicy from './order/PreOrderCancellationPolicy';

// Services
import PreOrderCancellationService, { PREORDER_CANCEL_REASONS } from '@/components/services/PreOrderCancellationService';

export default function CancelOrderModalEnhanced({ isOpen, onClose, order, onConfirm }) {
  const {
    selectedReasons,
    otherReason, setOtherReason,
    isSubmitting, setIsSubmitting,
    handleReasonToggle, reset, buildFinalReason, validate
  } = useCancelOrderState();

  // Check if preorder and calculate refund
  const isPreorder = order?.has_preorder_items;
  const refundCalc = useMemo(() => {
    if (!isPreorder || !order) return null;
    const harvestDate = order.items?.find(i => i.estimated_harvest_date)?.estimated_harvest_date;
    if (!harvestDate) return null;
    return PreOrderCancellationService.calculateRefund(order, harvestDate);
  }, [order, isPreorder]);

  if (!order) return null;

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const finalReason = buildFinalReason();

    try {
      if (isPreorder) {
        // Use PreOrder Cancellation Service
        await PreOrderCancellationService.cancelPreOrder({
          order,
          cancellationReasons: selectedReasons,
          otherReason,
          refundMethod: 'original_payment'
        });
      } else {
        // Regular order cancellation
        await onConfirm(finalReason);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Hủy Đơn Hàng"
      subtitle={`#${order.order_number || order.id?.slice(-8)}`}
      icon={XCircle}
      iconColor="text-red-600"
      maxWidth="lg"
      positionKey="cancel-order-modal"
      mobileFixed={true}
      enableDrag={false}
      persistPosition={false}
    >
      <div className="p-6 space-y-6">
        {/* Pre-Order Badge */}
        {isPreorder && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">Đơn hàng Pre-Order</span>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-900 mb-1">Lưu ý</p>
            <p className="text-sm text-yellow-800">
              {isPreorder 
                ? 'Việc hủy đơn Pre-Order có thể bị tính phí tùy theo thời điểm hủy và ngày thu hoạch.'
                : 'Sau khi hủy đơn, bạn không thể khôi phục lại. Nếu muốn mua lại, vui lòng đặt đơn mới.'
              }
            </p>
          </div>
        </div>

        {/* PreOrder Cancellation Policy */}
        {isPreorder && refundCalc && (
          <PreOrderCancellationPolicy order={order} refundCalc={refundCalc} />
        )}

        {/* Order Summary - Regular Orders */}
        {!isPreorder && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Tổng đơn hàng:</span>
              <span className="text-xl font-bold text-[#7CB342]">
                {(order.total_amount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {(order.items || []).length} sản phẩm • Đặt ngày {new Date(order.created_date).toLocaleDateString('vi-VN')}
            </div>
          </div>
        )}

        {/* Reasons Selection */}
        <CancelReasonSelector
          selectedReasons={selectedReasons}
          onReasonToggle={handleReasonToggle}
          otherReason={otherReason}
          setOtherReason={setOtherReason}
          reasons={isPreorder ? PREORDER_CANCEL_REASONS : undefined}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedReasons.length === 0}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Xác Nhận Hủy
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </EnhancedModal>
  );
}