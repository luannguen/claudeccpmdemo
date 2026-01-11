import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, Eye, CheckCircle, XCircle, Loader2, CheckSquare, Square, Printer } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import EnhancedModal from "@/components/EnhancedModal";
import OrderPrintTemplate from "@/components/admin/OrderPrintTemplate";
import BulkOrderActions from "@/components/admin/BulkOrderActions";
import PaymentVerificationModal from "@/components/admin/PaymentRefundModal";

// Hooks
import {
  useVerificationOrders,
  useBankConfig,
  useVerificationStats,
  useFilteredOrders,
  useVerificationMutations,
  useVerificationState,
  useInfiniteScroll,
  PAYMENT_STATUSES
} from "@/components/hooks/useAdminPaymentVerification";

// Components
import VerificationStats from "@/components/admin/payment/VerificationStats";
import VerificationFilters from "@/components/admin/payment/VerificationFilters";

// Local Verification Modal Component
function VerificationModal({ isOpen, order, bankConfig, onClose, onVerify, onReject }) {
  const [note, setNote] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { showToast } = require('@/components/Toast');

  const handleVerify = async () => {
    setIsProcessing(true);
    await onVerify(order.id, note);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!note.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }
    setIsProcessing(true);
    await onReject(order.id, note);
    setIsProcessing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Đã copy vào clipboard!', 'success');
  };

  if (!order) return null;

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} title="Xác Minh Thanh Toán" maxWidth="3xl">
      <div className="p-6 space-y-6">
        {/* Order Info */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Thông Tin Đơn Hàng</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Khách hàng</p>
              <p className="font-bold text-lg">{order.customer_name}</p>
              <p className="text-sm text-gray-700">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-bold text-3xl text-[#7CB342]">
                {(order.total_amount || 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="VD: Đã kiểm tra sao kê..."
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Từ Chối
          </button>
          <button
            onClick={handleVerify}
            disabled={isProcessing}
            className="flex-1 px-6 py-4 bg-[#7CB342] text-white rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Xác Nhận
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
}

function AdminPaymentVerificationContent() {
  const state = useVerificationState();
  const printRef = useRef();

  // Data
  const { data: orders = [], isLoading } = useVerificationOrders();
  const { data: bankConfig } = useBankConfig();
  const stats = useVerificationStats(orders);
  const filteredOrders = useFilteredOrders(orders, state.searchTerm, state.statusFilter);
  
  const displayedOrders = useMemo(() => {
    return filteredOrders.slice(0, state.displayCount);
  }, [filteredOrders, state.displayCount]);

  const hasMore = state.displayCount < filteredOrders.length;
  const loadMoreRef = useInfiniteScroll(hasMore, filteredOrders.length, state.setDisplayCount);

  // Mutations
  const { verifyMutation, rejectMutation } = useVerificationMutations();

  const handleVerify = async (orderId, note) => {
    await verifyMutation.mutateAsync({ orderId, note });
    state.setSelectedOrder(null);
  };

  const handleReject = async (orderId, note) => {
    await rejectMutation.mutateAsync({ orderId, note });
    state.setSelectedOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintBulk = (orderIds) => {
    const ordersToPrint = orders.filter(o => orderIds.includes(o.id));
    state.setPrintOrders(ordersToPrint);
    state.setShowPrintPreview(true);
    setTimeout(() => handlePrint(), 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2">Xác Minh Thanh Toán</h1>
        <p className="text-gray-600">Chuyển khoản • {filteredOrders.length} giao dịch</p>
        
        {!bankConfig && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Chưa cấu hình tài khoản ngân hàng!</strong>
            </p>
          </div>
        )}
      </div>

      <VerificationStats stats={stats} />

      <VerificationFilters
        searchTerm={state.searchTerm}
        setSearchTerm={state.setSearchTerm}
        statusFilter={state.statusFilter}
        setStatusFilter={state.setStatusFilter}
        viewMode={state.viewMode}
        setViewMode={state.setViewMode}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto" />
        </div>
      ) : displayedOrders.length > 0 ? (
        <>
          {state.viewMode === 'table' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">
                      <button onClick={() => state.toggleSelectAll(displayedOrders)}>
                        {state.selectedOrders.length === displayedOrders.length ? 
                          <CheckSquare className="w-5 h-5 text-[#7CB342]" /> : 
                          <Square className="w-5 h-5 text-gray-400" />
                        }
                      </button>
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-600">Mã ĐH</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-600">Khách hàng</th>
                    <th className="text-right p-4 text-xs font-medium text-gray-600">Số tiền</th>
                    <th className="text-center p-4 text-xs font-medium text-gray-600">Trạng thái</th>
                    <th className="text-center p-4 text-xs font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order) => {
                    const statusColor = 
                      order.payment_status === 'awaiting_verification' ? 'yellow' :
                      order.payment_status === 'paid' ? 'green' :
                      order.payment_status === 'failed' ? 'red' : 'blue';

                    return (
                      <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <button onClick={() => state.toggleOrderSelection(order.id)}>
                            {state.selectedOrders.includes(order.id) ? 
                              <CheckSquare className="w-5 h-5 text-[#7CB342]" /> : 
                              <Square className="w-5 h-5 text-gray-300" />
                            }
                          </button>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-sm font-medium">#{order.order_number}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-bold text-xl text-[#7CB342]">
                            {(order.total_amount || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              statusColor === 'green' ? 'bg-green-100 text-green-700' :
                              statusColor === 'red' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'}`}
                          >
                            {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {order.payment_status === 'awaiting_verification' && (
                            <button
                              onClick={() => state.setSelectedOrder(order)}
                              className="px-4 py-2 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#FF9800] flex items-center gap-2 mx-auto"
                            >
                              <Eye className="w-4 h-4" />
                              Xác Minh
                            </button>
                          )}
                          {order.payment_status === 'paid' && (
                            <span className="text-green-600 text-sm flex items-center gap-1 justify-center">
                              <CheckCircle className="w-4 h-4" />
                              Đã xác nhận
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin mx-auto" />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không có giao dịch cần xác minh</p>
        </div>
      )}

      {/* Verification Modal */}
      {state.selectedOrder && (
        <VerificationModal
          isOpen={!!state.selectedOrder}
          order={state.selectedOrder}
          bankConfig={bankConfig}
          onClose={() => state.setSelectedOrder(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}

      {/* Bulk Actions */}
      <BulkOrderActions
        selectedOrders={state.selectedOrders}
        onClearSelection={state.clearSelection}
        onPrintBulk={handlePrintBulk}
      />
    </div>
  );
}

export default function AdminPaymentVerification() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin', 'accountant', 'manager']}>
      <AdminLayout>
        <AdminPaymentVerificationContent />
      </AdminLayout>
    </AdminGuard>
  );
}