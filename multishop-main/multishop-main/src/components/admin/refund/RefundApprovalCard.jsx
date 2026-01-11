/**
 * RefundApprovalCard - Card duyệt/từ chối refund request
 * UI Layer
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

const REFUND_TYPE_LABELS = {
  customer_cancel: 'Khách hủy',
  seller_cancel: 'Seller hủy',
  delay_compensation: 'Bồi thường trễ',
  quality_issue: 'Vấn đề chất lượng',
  shortage: 'Thiếu hàng',
  policy_auto: 'Tự động theo policy'
};

export default function RefundApprovalCard({ refund, onApprove, onReject }) {
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleApprove = async () => {
    const confirmed = await showConfirm({
      title: 'Duyệt hoàn tiền',
      message: `Xác nhận duyệt hoàn ${refund.refund_amount.toLocaleString()}đ cho ${refund.customer_name}?`,
      type: 'success',
      confirmText: 'Duyệt'
    });

    if (confirmed) {
      setIsProcessing(true);
      try {
        await onApprove(refund.id, reviewNote);
        addToast('Đã duyệt yêu cầu hoàn tiền', 'success');
      } catch (error) {
        addToast('Không thể duyệt', 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      addToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Từ chối hoàn tiền',
      message: `Xác nhận từ chối yêu cầu của ${refund.customer_name}?`,
      type: 'danger',
      confirmText: 'Từ chối'
    });

    if (confirmed) {
      setIsProcessing(true);
      try {
        await onReject(refund.id, reviewNote);
        addToast('Đã từ chối yêu cầu', 'info');
      } catch (error) {
        addToast('Không thể từ chối', 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const isAutoApproved = refund.auto_approved;
  const isOverdue = refund.is_overdue;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border-2 rounded-xl p-4 shadow-sm ${
          isOverdue ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">#{refund.order_number}</h4>
              {isAutoApproved && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">Auto</Badge>
              )}
              {isOverdue && (
                <Badge className="bg-red-100 text-red-700 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Quá hạn
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{refund.customer_name}</p>
            <p className="text-xs text-gray-500">{refund.customer_email}</p>
          </div>
          
          <Badge variant="outline">
            {REFUND_TYPE_LABELS[refund.refund_type] || refund.refund_type}
          </Badge>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Tổng đã trả</p>
            <p className="font-bold text-gray-900">
              {refund.original_amount?.toLocaleString()}đ
            </p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">Hoàn lại</p>
            <p className="font-bold text-purple-700">
              {refund.refund_amount?.toLocaleString()}đ
            </p>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">Phạt/giữ</p>
            <p className="font-bold text-amber-700">
              {(refund.penalty_amount || 0).toLocaleString()}đ
            </p>
          </div>
        </div>

        {/* Policy info */}
        {refund.policy_applied && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-1">
              Policy: {refund.policy_applied.policy_version}
            </p>
            <p className="text-xs text-blue-700">
              {refund.policy_applied.rule_description}
            </p>
          </div>
        )}

        {/* Reason */}
        {refund.reason_detail && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">Lý do:</p>
            <p className="text-sm text-gray-900">{refund.reason_detail}</p>
          </div>
        )}

        {/* Evidence */}
        {refund.evidence_urls && refund.evidence_urls.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Chứng cứ:</p>
            <div className="flex gap-2">
              {refund.evidence_urls.slice(0, 3).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                >
                  <img
                    src={url}
                    alt={`Evidence ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bank account (if refund via bank) */}
        {refund.bank_account && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
            <p className="text-gray-600">Tài khoản nhận:</p>
            <p className="font-medium text-gray-900">
              {refund.bank_account.account_name}
            </p>
            <p className="text-gray-700">
              {refund.bank_account.bank_name} - {refund.bank_account.account_number}
            </p>
          </div>
        )}

        {/* Review note */}
        <div className="mb-4">
          <label className="text-xs text-gray-600 mb-1 block">Ghi chú duyệt:</label>
          <Textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Nhập ghi chú (bắt buộc nếu từ chối)..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Duyệt
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Từ chối
          </Button>
        </div>

        {/* SLA deadline */}
        {refund.sla_deadline && (
          <p className={`text-xs text-center mt-3 ${
            isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
          }`}>
            Deadline: {format(new Date(refund.sla_deadline), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </p>
        )}
      </motion.div>

      <ConfirmDialogComponent />
    </>
  );
}