/**
 * 🔄 Admin Returns Management - Real-time, full-featured
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PackageX, Search, Filter, TrendingUp, Clock, CheckCircle, 
  XCircle, DollarSign, Eye, Check, X, Truck, Package
} from 'lucide-react';
import { useRealTimeReturns } from '@/components/returns/useRealTimeReturns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import ReturnDetailModal from '@/components/returns/ReturnDetailModal';
import AdminReturnCard from '@/components/returns/AdminReturnCard';

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả', color: 'gray' },
  { value: 'pending', label: 'Chờ duyệt', color: 'yellow' },
  { value: 'approved', label: 'Đã duyệt', color: 'blue' },
  { value: 'received', label: 'Đã nhận', color: 'green' },
  { value: 'refunded', label: 'Đã hoàn tiền', color: 'green' },
  { value: 'rejected', label: 'Từ chối', color: 'red' }
];

function AdminReturnsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['admin-user-returns'],
    queryFn: async () => await base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });

  const { returns, stats, isLoading, updateStatus } = useRealTimeReturns(
    currentUser?.email,
    { 
      isAdmin: true, 
      refetchInterval: 2000,
      enabled: !!currentUser 
    }
  );

  // Filter returns
  const filteredReturns = returns.filter(r => {
    const matchSearch = !searchTerm || 
      r.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleViewDetail = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setIsDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <PackageX className="w-8 h-8 text-[#7CB342]" />
              Quản Lý Trả Hàng & Hoàn Tiền
            </h1>
            <p className="text-gray-600 mt-1">Xử lý yêu cầu trả hàng từ khách hàng</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hoàn tiền</p>
                <p className="text-2xl font-bold text-green-600">{stats.refunded}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã đơn, tên, email..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#7CB342] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {STATUS_FILTERS.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    statusFilter === filter.value
                      ? `bg-${filter.color}-500 text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Returns List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không có yêu cầu nào</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Thử thay đổi bộ lọc' 
                : 'Chưa có yêu cầu trả hàng nào'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReturns.map((returnRequest) => (
              <AdminReturnCard
                key={returnRequest.id}
                returnRequest={returnRequest}
                onView={handleViewDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedReturn && (
        <ReturnDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedReturn(null);
          }}
          returnRequest={selectedReturn}
          isAdmin={true}
        />
      )}
    </AdminLayout>
  );
}

export default function AdminReturns() {
  return (
    <AdminGuard allowedRoles={['admin', 'super_admin', 'manager']}>
      <AdminReturnsContent />
    </AdminGuard>
  );
}