import React, { useState } from 'react';
import { 
  CheckSquare, Trash2, Printer, Download, Edit, 
  Package, Truck, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BulkOrderActions({ 
  selectedOrders = [], 
  onClearSelection,
  onPrintBulk 
}) {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ status, note }) => {
      const updates = selectedOrders.map(orderId => 
        base44.entities.Order.update(orderId, {
          order_status: status,
          internal_note: note || `Bulk update to ${status}`
        })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-orders']);
      alert(`✅ Đã cập nhật ${selectedOrders.length} đơn hàng!`);
      onClearSelection();
      setShowBulkMenu(false);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const deletes = selectedOrders.map(orderId => 
        base44.entities.Order.delete(orderId)
      );
      return Promise.all(deletes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-orders']);
      alert(`✅ Đã xóa ${selectedOrders.length} đơn hàng!`);
      onClearSelection();
    }
  });

  const handleBulkStatus = (status) => {
    if (confirm(`Cập nhật ${selectedOrders.length} đơn sang "${status}"?`)) {
      bulkUpdateMutation.mutate({ status });
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`⚠️ XÓA ${selectedOrders.length} đơn hàng? Không thể hoàn tác!`)) {
      bulkDeleteMutation.mutate();
    }
  };

  const handleBulkPrint = () => {
    onPrintBulk?.(selectedOrders);
  };

  const handleExport = async () => {
    setIsBulkProcessing(true);
    try {
      const allOrders = await base44.entities.Order.list('-created_date', 5000);
      const selected = allOrders.filter(o => selectedOrders.includes(o.id));
      
      const csv = [
        ['Mã ĐH', 'Khách hàng', 'SĐT', 'Email', 'Địa chỉ', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày'].join(','),
        ...selected.map(o => [
          o.order_number,
          o.customer_name,
          o.customer_phone,
          o.customer_email,
          `"${o.shipping_address}"`,
          o.total_amount,
          o.payment_method,
          o.order_status,
          new Date(o.created_date).toLocaleDateString('vi-VN')
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Lỗi export: ' + error.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  if (selectedOrders.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white rounded-2xl shadow-2xl px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6" />
            <span className="font-bold">{selectedOrders.length} đơn đã chọn</span>
          </div>

          <div className="h-6 w-px bg-white/30"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors"
            >
              Hành Động ▼
            </button>

            <button
              onClick={handleBulkPrint}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              In
            </button>

            <button
              onClick={handleExport}
              disabled={isBulkProcessing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isBulkProcessing ? 'Đang xuất...' : 'Export'}
            </button>

            <button
              onClick={onClearSelection}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg font-medium text-sm transition-colors"
            >
              Bỏ Chọn
            </button>
          </div>
        </div>

        {/* Bulk Menu */}
        {showBulkMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[250px]">
            <button
              onClick={() => handleBulkStatus('confirmed')}
              className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-left"
            >
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Xác nhận tất cả
            </button>
            <button
              onClick={() => handleBulkStatus('processing')}
              className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-left"
            >
              <Package className="w-4 h-4 text-purple-600" />
              Đang chuẩn bị
            </button>
            <button
              onClick={() => handleBulkStatus('shipping')}
              className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-left"
            >
              <Truck className="w-4 h-4 text-indigo-600" />
              Đang giao hàng
            </button>
            <button
              onClick={() => handleBulkStatus('delivered')}
              className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-left"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              Đã giao
            </button>
            <div className="border-t my-1"></div>
            <button
              onClick={handleBulkDelete}
              className="w-full px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-sm text-left text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}