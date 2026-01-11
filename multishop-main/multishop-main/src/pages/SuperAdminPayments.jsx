import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Search, CheckCircle, XCircle, Clock, 
  Eye, Filter, Download, RefreshCw, Image as ImageIcon,
  Building2, Calendar, CreditCard, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function PaymentDetailsModal({ payment, onClose, onVerify }) {
  const [isVerifying, setIsVerifying] = useState(false);

  if (!payment) return null;

  const handleVerify = async (newStatus) => {
    setIsVerifying(true);
    try {
      await onVerify(payment.id, newStatus);
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Chi Tiết Thanh Toán
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-mono font-bold">{payment.transaction_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số Tiền</p>
              <p className="text-2xl font-bold text-[#7CB342]">
                {payment.amount.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phương Thức</p>
              <p className="font-medium capitalize">{payment.payment_method.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày Thanh Toán</p>
              <p className="font-medium">{new Date(payment.payment_date).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Payer Info */}
          {payment.payer_info && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-[#0F0F0F] mb-3">Thông Tin Người Thanh Toán</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Tên:</strong> {payment.payer_info.name}</p>
                <p><strong>Email:</strong> {payment.payer_info.email}</p>
                <p><strong>SĐT:</strong> {payment.payer_info.phone}</p>
                {payment.payer_info.account_number && (
                  <p><strong>STK:</strong> {payment.payer_info.account_number}</p>
                )}
              </div>
            </div>
          )}

          {/* Transfer Proof */}
          {payment.bank_transfer_proof && (
            <div>
              <h3 className="font-bold text-[#0F0F0F] mb-3">Chứng Từ Chuyển Khoản</h3>
              <img 
                src={payment.bank_transfer_proof} 
                alt="Transfer proof"
                className="w-full max-h-96 object-contain rounded-xl border"
              />
            </div>
          )}

          {/* Verification Actions */}
          {payment.status === 'pending' && payment.payment_method === 'bank_transfer' && (
            <div className="flex gap-4">
              <button
                onClick={() => handleVerify('completed')}
                disabled={isVerifying}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Xác Nhận Thanh Toán
              </button>
              <button
                onClick={() => handleVerify('failed')}
                disabled={isVerifying}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Từ Chối
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SuperAdminPaymentsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['super-admin-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 1000),
    initialData: []
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['payments-tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date', 500),
    initialData: []
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Payment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-payments']);
    }
  });

  const filteredPayments = payments.filter(p => {
    const tenant = tenants.find(t => t.id === p.tenant_id);
    const matchesSearch = 
      p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || p.payment_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = useMemo(() => ({
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  }), [payments]);

  const handleVerifyPayment = async (paymentId, newStatus) => {
    const data = {
      status: newStatus,
      confirmed_date: new Date().toISOString(),
      verified_by: 'admin@zerofarm.vn'
    };

    if (newStatus === 'completed') {
      // Also update related invoice and subscription
      const payment = payments.find(p => p.id === paymentId);
      if (payment?.invoice_id) {
        await base44.entities.Invoice.update(payment.invoice_id, {
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_id: paymentId
        });
      }
      if (payment?.subscription_id) {
        await base44.entities.Subscription.update(payment.subscription_id, {
          status: 'active',
          last_payment_date: new Date().toISOString(),
          last_payment_amount: payment.amount
        });
      }
    }

    await updatePaymentMutation.mutateAsync({ id: paymentId, data });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Payment Transactions
        </h1>
        <p className="text-gray-600">Quản lý & xác minh thanh toán</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Tổng GD</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Thành Công</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Đang Chờ</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-lg border border-red-200">
          <p className="text-sm text-red-700 mb-1">Thất Bại</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Đã Thu</p>
          <p className="text-lg font-bold text-blue-600">{(stats.totalAmount / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Chờ Thu</p>
          <p className="text-lg font-bold text-purple-600">{(stats.pendingAmount / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm TXN ID, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">All Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
          </select>
          <button className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Tenant</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">TXN ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenant_id);
                const StatusIcon = payment.status === 'completed' ? CheckCircle :
                                  payment.status === 'failed' ? XCircle : Clock;
                
                return (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium">{tenant?.organization_name || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-sm">{payment.transaction_id}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-[#7CB342]">
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có giao dịch nào</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onVerify={async (id, status) => {
            await handleVerifyPayment(id, status);
            queryClient.invalidateQueries(['super-admin-payments']);
          }}
        />
      )}
    </div>
  );
}

export default function SuperAdminPayments() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminPaymentsContent />
      </AdminLayout>
    </AdminGuard>
  );
}