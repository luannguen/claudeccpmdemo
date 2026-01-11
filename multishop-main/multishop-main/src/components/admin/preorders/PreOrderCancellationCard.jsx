import React, { useState } from "react";
import { Clock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import { useToast } from "@/components/NotificationToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function PreOrderCancellationCard({ cancellation }) {
  const { dialog, showConfirm, handleConfirm, handleCancel } = useConfirmDialog();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const statusConfig = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
    completed: { label: 'Đã hoàn tiền', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800', icon: AlertCircle }
  };

  const policyLabels = {
    tier_1: '14+ ngày trước (100%)',
    tier_2: '7-14 ngày trước (80%)',
    tier_3: '3-7 ngày trước (50%)',
    tier_4: 'Dưới 3 ngày (0%)'
  };

  const statusInfo = statusConfig[cancellation.refund_status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async (transactionId) => {
      const adminUser = await base44.auth.me();

      await base44.entities.PreOrderCancellation.update(cancellation.id, {
        refund_status: 'completed',
        refund_date: new Date().toISOString(),
        refund_transaction_id: transactionId,
        processed_by: adminUser.email,
        timeline: [
          ...(cancellation.timeline || []),
          {
            status: 'refunded',
            timestamp: new Date().toISOString(),
            actor: adminUser.email,
            note: `Đã hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ. Mã GD: ${transactionId}`
          }
        ]
      });

      await base44.entities.Order.update(cancellation.order_id, {
        payment_status: 'refunded'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-preorder-cancellations'] });
      addToast('Đã xử lý hoàn tiền thành công', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Có lỗi khi xử lý hoàn tiền', 'error');
    }
  });

  // Override mutation
  const overrideRefundMutation = useMutation({
    mutationFn: async ({ newAmount, reason }) => {
      const adminUser = await base44.auth.me();
      const newPercentage = Math.round((newAmount / cancellation.original_deposit) * 100);
      const newPenalty = cancellation.original_deposit - newAmount;

      await base44.entities.PreOrderCancellation.update(cancellation.id, {
        refund_amount: newAmount,
        refund_percentage: newPercentage,
        penalty_amount: newPenalty,
        admin_override: true,
        admin_override_reason: reason,
        processed_by: adminUser.email,
        timeline: [
          ...(cancellation.timeline || []),
          {
            status: 'override',
            timestamp: new Date().toISOString(),
            actor: adminUser.email,
            note: `Override: Hoàn ${newAmount.toLocaleString('vi-VN')}đ (${newPercentage}%). Lý do: ${reason}`
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-preorder-cancellations'] });
      addToast('Đã override refund policy', 'success');
    }
  });

  const handleProcessRefund = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận hoàn tiền',
      message: `Hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ cho khách hàng ${cancellation.customer_name}?`,
      type: 'success',
      confirmText: 'Xác nhận hoàn tiền'
    });

    if (confirmed) {
      const transactionId = prompt('Nhập mã giao dịch chuyển khoản:');
      if (transactionId) {
        processRefundMutation.mutate(transactionId);
      }
    }
  };

  const handleOverride = async () => {
    const newAmount = prompt(
      `Nhập số tiền hoàn mới (Gốc: ${cancellation.original_deposit.toLocaleString('vi-VN')}đ):`,
      cancellation.refund_amount
    );
    if (!newAmount) return;

    const amount = parseInt(newAmount);
    if (isNaN(amount) || amount < 0 || amount > cancellation.original_deposit) {
      addToast('Số tiền không hợp lệ', 'error');
      return;
    }

    const reason = prompt('Lý do override:');
    if (!reason) return;

    overrideRefundMutation.mutate({ newAmount: amount, reason });
  };

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900">#{cancellation.order_number}</h3>
              {cancellation.admin_override && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                  Override
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{cancellation.customer_name}</p>
            <p className="text-xs text-gray-500">{cancellation.customer_phone}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
            <StatusIcon size={14} />
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Ngày hủy</p>
            <p className="font-semibold text-sm text-gray-900">
              {new Date(cancellation.cancellation_date).toLocaleDateString('vi-VN')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {cancellation.days_before_harvest} ngày trước thu hoạch
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Policy áp dụng</p>
            <p className="font-semibold text-sm text-amber-800">
              {policyLabels[cancellation.policy_tier] || cancellation.policy_tier}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Cọc gốc</p>
            <p className="font-bold text-gray-900">
              {cancellation.original_deposit.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Hoàn lại</p>
            <p className="font-bold text-green-600">
              {cancellation.refund_amount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-xs text-gray-500">({cancellation.refund_percentage}%)</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Phạt</p>
            <p className="font-bold text-red-600">
              {cancellation.penalty_amount.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>

        {cancellation.cancellation_reasons && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Lý do hủy:</p>
            <div className="flex flex-wrap gap-2">
              {cancellation.cancellation_reasons.map((reason, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                  {reason}
                </span>
              ))}
            </div>
            {cancellation.other_reason && (
              <p className="text-sm text-gray-600 mt-2 italic">"{cancellation.other_reason}"</p>
            )}
          </div>
        )}

        {cancellation.refund_status === 'pending' && cancellation.refund_amount > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleProcessRefund}
              className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Hoàn Tiền
            </button>
            <button
              onClick={handleOverride}
              className="px-4 py-2.5 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Override
            </button>
          </div>
        )}

        {cancellation.refund_status === 'completed' && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-800">
              <CheckCircle size={16} className="inline mr-2" />
              Đã hoàn tiền - Mã GD: <span className="font-mono font-semibold">{cancellation.refund_transaction_id}</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Xử lý bởi: {cancellation.processed_by} • {new Date(cancellation.refund_date).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog {...dialog} onConfirm={handleConfirm} onCancel={handleCancel} />
    </>
  );
}