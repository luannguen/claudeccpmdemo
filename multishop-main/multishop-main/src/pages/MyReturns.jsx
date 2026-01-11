/**
 * 📦 My Returns - Customer view of return requests
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PackageX, Plus, Search, Clock, CheckCircle, 
  XCircle, DollarSign, ArrowLeft, Package
} from 'lucide-react';
import { useRealTimeReturns } from '@/components/returns/useRealTimeReturns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CustomerReturnModal from '@/components/returns/CustomerReturnModal';
import ReturnDetailModal from '@/components/returns/ReturnDetailModal';
import ReturnStatusTracker from '@/components/returns/ReturnStatusTracker';
import ReturnPolicyModal from '@/components/returns/ReturnPolicyModal';
import EligibleOrderSelector from '@/components/returns/EligibleOrderSelector';

const STATUS_LABELS = {
  pending: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
  approved: { label: 'Đã duyệt', color: 'blue', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: 'red', icon: XCircle },
  shipping_back: { label: 'Đang gửi về', color: 'blue', icon: Package },
  received: { label: 'Đã nhận', color: 'green', icon: CheckCircle },
  refunded: { label: 'Đã hoàn tiền', color: 'green', icon: DollarSign },
  completed: { label: 'Hoàn tất', color: 'green', icon: CheckCircle }
};

export default function MyReturns() {
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showOrderSelector, setShowOrderSelector] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-returns'],
    queryFn: async () => await base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });

  const { returns, stats, isLoading } = useRealTimeReturns(
    currentUser?.email,
    { 
      isAdmin: false, 
      refetchInterval: 3000,
      enabled: !!currentUser 
    }
  );

  const { data: myOrders = [] } = useQuery({
    queryKey: ['my-orders-returns', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      console.log('🔍 Fetching orders for returns...', currentUser.email);
      const orders = await base44.entities.Order.list('-created_date', 200);
      const filtered = orders.filter(o => 
        o.customer_email === currentUser.email && 
        ['delivered', 'completed'].includes(o.order_status)
      );
      console.log('✅ Eligible orders:', filtered.length);
      return filtered;
    },
    enabled: !!currentUser,
    staleTime: 0
  });

  const safeReturns = returns || [];
  
  const filteredReturns = safeReturns.filter(r => 
    !searchTerm || 
    r.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReturn = () => {
    setShowReturnPolicy(true);
  };

  const handlePolicyAgree = () => {
    setShowReturnPolicy(false);
    setShowOrderSelector(true);
  };

  const handleOrderSelected = (order) => {
    setShowOrderSelector(false);
    setOrderToReturn(order);
    setShowReturnModal(true);
  };

  const handleViewDetail = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setIsDetailOpen(true);
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={createPageUrl('MyOrders')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7CB342] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đơn hàng
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <PackageX className="w-8 h-8 text-[#7CB342]" />
                Yêu Cầu Trả Hàng Của Tôi
              </h1>
              <p className="text-gray-600 mt-1">Quản lý các yêu cầu trả hàng và hoàn tiền</p>
            </div>
            <button
              onClick={handleCreateReturn}
              className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Yêu Cầu Mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-400">
            <p className="text-sm text-gray-600 mb-1">Tổng yêu cầu</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600 mb-1">Chờ duyệt</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-400">
            <p className="text-sm text-gray-600 mb-1">Đã duyệt</p>
            <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-400">
            <p className="text-sm text-gray-600 mb-1">Đã hoàn tiền</p>
            <p className="text-2xl font-bold text-green-600">{stats.refunded}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#7CB342] focus:outline-none"
            />
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có yêu cầu trả hàng</h3>
            <p className="text-gray-600 mb-6">
              Bạn có thể tạo yêu cầu trả hàng cho các đơn đã nhận
            </p>
            <Link
              to={createPageUrl('MyOrders')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg"
            >
              <Package className="w-5 h-5" />
              Xem Đơn Hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((returnRequest) => {
              const statusInfo = STATUS_LABELS[returnRequest.status] || STATUS_LABELS.pending;
              const Icon = statusInfo.icon;

              return (
                <motion.div
                  key={returnRequest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Đơn hàng #{returnRequest.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(returnRequest.created_date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold bg-${statusInfo.color}-100 text-${statusInfo.color}-700 flex items-center gap-2 w-fit`}>
                        <Icon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Số tiền hoàn:</p>
                        <p className="text-xl font-bold text-[#7CB342]">
                          {returnRequest.total_return_amount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lý do trả hàng:</p>
                        <p className="font-medium text-gray-900">{returnRequest.return_reason}</p>
                      </div>
                    </div>

                    {/* Status Tracker */}
                    <ReturnStatusTracker returnRequest={returnRequest} />

                    <button
                      onClick={() => handleViewDetail(returnRequest)}
                      className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReturnPolicyModal
        isOpen={showReturnPolicy}
        onClose={() => setShowReturnPolicy(false)}
        onAgree={handlePolicyAgree}
      />

      <EligibleOrderSelector
        isOpen={showOrderSelector}
        onClose={() => setShowOrderSelector(false)}
        orders={myOrders}
        onSelectOrder={handleOrderSelected}
      />

      {showReturnModal && orderToReturn && (
        <CustomerReturnModal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setOrderToReturn(null);
          }}
          order={orderToReturn}
        />
      )}

      {isDetailOpen && selectedReturn && (
        <ReturnDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedReturn(null);
          }}
          returnRequest={selectedReturn}
          isAdmin={false}
        />
      )}
    </div>
  );
}