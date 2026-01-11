import React, { useState } from 'react';
import { X, DollarSign, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { useToast } from '@/components/NotificationToast';

export default function PaymentRefundModal({ isOpen, onClose, order }) {
  const [refundAmount, setRefundAmount] = useState(order?.total_amount || 0);
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState('full'); // full, partial
  const queryClient = useQueryClient();
  const { showConfirm } = useConfirmDialog();
  const { addToast } = useToast();

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error('No order');

      // Update order
      await base44.entities.Order.update(order.id, {
        payment_status: 'refunded',
        order_status: 'cancelled',
        internal_note: `REFUND: ${refundReason} | Amount: ${refundAmount.toLocaleString('vi-VN')}đ`
      });

      // Create activity log
      await base44.entities.ActivityLog.create({
        user_email: (await base44.auth.me()).email,
        user_name: (await base44.auth.me()).full_name,
        action_type: 'update',
        entity_type: 'order',
        entity_id: order.id,
        entity_name: order.order_number,
        description: `Hoàn tiền ${refundAmount.toLocaleString('vi-VN')}đ`,
        old_values: {
          payment_status: order.payment_status,
          order_status: order.order_status
        },
        new_values: {
          payment_status: 'refunded',
          order_status: 'cancelled'
        },
        metadata: {
          refund_amount: refundAmount,
          refund_type: refundType,
          reason: refundReason
        }
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['payment-analytics']);
      addToast(`Đã hoàn tiền ${refundAmount.toLocaleString('vi-VN')}đ cho đơn #${order.order_number}`, 'success');
      onClose();
    },
    onError: (error) => {
      addToast('Lỗi: ' + error.message, 'error');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      addToast('Vui lòng nhập lý do hoàn tiền', 'warning');
      return;
    }
    if (refundAmount <= 0 || refundAmount > order.total_amount) {
      addToast('Số tiền hoàn không hợp lệ', 'warning');
      return;
    }
    const confirmed = await showConfirm({
      title: 'Xác Nhận Hoàn Tiền',
      message: `Hoàn ${refundAmount.toLocaleString('vi-VN')}đ cho đơn #${order.order_number}? Hành động này không thể hoàn tác.`,
      type: 'warning',
      confirmText: 'Xác Nhận Hoàn Tiền',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      refundMutation.mutate();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Hoàn Tiền
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Lưu ý khi hoàn tiền:</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Đơn hàng sẽ tự động chuyển sang "Đã hủy"</li>
                <li>Không thể hoàn tác sau khi xác nhận</li>
                <li>Cần chuyển tiền thủ công cho khách hàng</li>
              </ul>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-2">Đơn hàng:</p>
            <p className="font-bold">#{order.order_number}</p>
            <p className="text-sm text-gray-700 mt-1">
              Khách hàng: {order.customer_name}
            </p>
            <p className="text-lg font-bold text-[#7CB342] mt-2">
              Tổng: {order.total_amount.toLocaleString('vi-VN')}đ
            </p>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Loại hoàn tiền:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefundType('full');
                  setRefundAmount(order.total_amount);
                }}
                className={`p-3 border-2 rounded-lg transition-all ${
                  refundType === 'full' 
                    ? 'border-[#7CB342] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-bold text-sm">Hoàn toàn bộ</p>
                <p className="text-xs text-gray-600">{order.total_amount.toLocaleString('vi-VN')}đ</p>
              </button>
              <button
                type="button"
                onClick={() => setRefundType('partial')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  refundType === 'partial' 
                    ? 'border-[#7CB342] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-bold text-sm">Hoàn một phần</p>
                <p className="text-xs text-gray-600">Tùy chỉnh</p>
              </button>
            </div>
          </div>

          {/* Refund Amount */}
          {refundType === 'partial' && (
            <div>
              <label className="block text-sm font-medium mb-2">Số tiền hoàn (VNĐ):</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                max={order.total_amount}
                min={0}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Lý do hoàn tiền: *</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
              placeholder="VD: Khách hàng yêu cầu hủy, sản phẩm lỗi..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={refundMutation.isPending}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Xác Nhận Hoàn Tiền
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}