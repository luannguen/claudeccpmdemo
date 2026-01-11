import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, Eye, CreditCard, Calendar, 
  Filter, Search, X, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import InvoiceGenerator, { InvoicePreview } from "@/components/billing/InvoiceGenerator";
import PaymentGateway from "@/components/billing/PaymentGateway";

function InvoiceModal({ invoice, tenant, onClose, onPaymentComplete }) {
  const [showPayment, setShowPayment] = useState(false);

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
              Hóa Đơn #{invoice.invoice_number}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showPayment ? (
            <>
              <InvoicePreview invoice={invoice} tenant={tenant} />
              
              <div className="flex gap-4 mt-6">
                <div className="flex-1">
                  <InvoiceGenerator 
                    invoice={invoice} 
                    tenant={tenant}
                  />
                </div>
                {invoice.status !== 'paid' && (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="px-6 py-2 bg-[#7CB342] text-white rounded-lg font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Thanh Toán Ngay
                  </button>
                )}
              </div>
            </>
          ) : (
            <div>
              <button
                onClick={() => setShowPayment(false)}
                className="mb-6 text-gray-600 hover:text-[#7CB342] flex items-center gap-2"
              >
                ← Quay lại xem hóa đơn
              </button>
              <PaymentGateway 
                invoice={invoice} 
                tenant={tenant}
                onPaymentComplete={() => {
                  setShowPayment(false);
                  if (onPaymentComplete) onPaymentComplete();
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function TenantInvoices() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch tenant
  const { data: tenant } = useQuery({
    queryKey: ['tenant-invoices-info', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['tenant-invoices', tenantId],
    queryFn: async () => {
      const allInvoices = await base44.entities.Invoice.list('-created_date', 500);
      return allInvoices.filter(inv => inv.tenant_id === tenantId);
    },
    enabled: !!tenantId
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent' || i.status === 'draft').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalPaid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0),
    totalPending: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total_amount, 0)
  };

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F]">
                Hóa Đơn & Thanh Toán
              </h1>
              <p className="text-gray-600">Quản lý hóa đơn và lịch sử thanh toán</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
              className="text-gray-600 hover:text-[#7CB342] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Tổng Hóa Đơn</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
            <p className="text-sm text-green-700 mb-1">Đã Thanh Toán</p>
            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-xs text-green-600 mt-1">{stats.totalPaid.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Chờ Thanh Toán</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-yellow-600 mt-1">{stats.totalPending.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-lg border border-red-200">
            <p className="text-sm text-red-700 mb-1">Quá Hạn</p>
            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo số hóa đơn..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Draft</option>
              <option value="sent">Đã gửi</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có hóa đơn nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Số HĐ</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Hạn TT</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Gói</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Số Tiền</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng Thái</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = invoice.status === 'paid' ? CheckCircle :
                                    invoice.status === 'overdue' ? AlertCircle : Clock;
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-mono font-bold">{invoice.invoice_number}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(invoice.due_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase">
                          {invoice.plan_name}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-[#7CB342]">
                        {invoice.total_amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {invoice.status === 'paid' ? 'Đã TT' :
                           invoice.status === 'overdue' ? 'Quá hạn' :
                           invoice.status === 'sent' ? 'Chờ TT' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          tenant={tenant}
          onClose={() => setSelectedInvoice(null)}
          onPaymentComplete={() => {
            queryClient.invalidateQueries(['tenant-invoices']);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}