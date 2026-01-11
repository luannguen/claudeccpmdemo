import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Search, CheckCircle, Clock, Wallet, DollarSign } from "lucide-react";
import moment from "moment";

const formatCurrency = (amount) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  calculated: "bg-blue-100 text-blue-700",
  approved: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const statusLabels = {
  pending: "Chờ tính",
  calculated: "Đã tính",
  approved: "Đã duyệt",
  paid: "Đã trả",
  cancelled: "Đã hủy"
};

export default function ShopCommissionTable({ commissions = [], isLoading }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCommissions = commissions.filter(c => 
    statusFilter === "all" || c.status === statusFilter
  );

  // Summary stats
  const stats = {
    total: commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    pending: commissions.filter(c => ['pending', 'calculated'].includes(c.status))
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    approved: commissions.filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    paid: commissions.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
          </div>
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Hoa Hồng Commission
        </h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-yellow-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-700">Chờ xử lý</span>
            </div>
            <p className="font-bold text-yellow-800">{formatCurrency(stats.pending)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-700">Đã duyệt</span>
            </div>
            <p className="font-bold text-purple-800">{formatCurrency(stats.approved)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Đã trả</span>
            </div>
            <p className="font-bold text-green-800">{formatCurrency(stats.paid)}</p>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#7CB342]"
        >
          <option value="all">Tất cả trạng thái ({commissions.length})</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label} ({commissions.filter(c => c.status === value).length})
            </option>
          ))}
        </select>
      </div>

      {filteredCommissions.length === 0 ? (
        <div className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có bản ghi hoa hồng</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn hàng</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá trị đơn</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tỷ lệ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tháng</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCommissions.map((commission, idx) => (
                <motion.tr
                  key={commission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{commission.order_number}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(commission.order_amount)}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {commission.commission_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-bold text-orange-600 text-sm">{formatCurrency(commission.commission_amount)}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[commission.status]}`}>
                      {statusLabels[commission.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-600">{commission.period_month || 'N/A'}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tổng hoa hồng:</span>
          <span className="text-lg font-bold text-orange-600">{formatCurrency(stats.total)}</span>
        </div>
      </div>
    </div>
  );
}