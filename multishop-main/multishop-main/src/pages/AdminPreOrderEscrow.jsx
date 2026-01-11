/**
 * AdminPreOrderEscrow - Admin dashboard cho escrow/wallet management
 * Page - Admin only
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, AlertTriangle, CheckCircle, Filter, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Layout
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

// Components
import WalletStatusCard from '@/components/preorder/escrow/WalletStatusCard';
import TransactionList from '@/components/preorder/escrow/TransactionList';

// Hooks - from preorder module
import { usePendingRefunds, WALLET_STATUS } from '@/components/features/preorder';

export default function AdminPreOrderEscrow() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('wallets');

  // Fetch wallets
  const { data: allWallets = [], isLoading: loadingWallets } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: async () => await base44.entities.PaymentWallet.filter({}, '-created_date')
  });

  // Fetch pending refunds
  const { data: pendingRefunds = [], isLoading: loadingRefunds } = usePendingRefunds();

  // Filter wallets
  const filteredWallets = statusFilter === 'all' 
    ? allWallets 
    : allWallets.filter(w => w.status === statusFilter);

  // Stats
  const stats = {
    total_held: allWallets.reduce((sum, w) => sum + (w.total_held || 0), 0),
    pending_release: allWallets.filter(w => 
      [WALLET_STATUS.FULLY_HELD, WALLET_STATUS.DEPOSIT_HELD].includes(w.status)
    ).length,
    pending_refunds: pendingRefunds.length,
    disputed: allWallets.filter(w => w.status === WALLET_STATUS.DISPUTED).length
  };

  return (
    <AdminGuard>
      <AdminLayout currentPageName="AdminPreOrderEscrow">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Escrow</h1>
              <p className="text-sm text-gray-600">Ví giữ tiền & hoàn tiền</p>
            </div>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">Tổng đang giữ</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {stats.total_held.toLocaleString()}đ
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">Chờ release</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {stats.pending_release}
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-700">Chờ hoàn tiền</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {stats.pending_refunds}
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">Dispute</span>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {stats.disputed}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="wallets">
                <Wallet className="w-4 h-4 mr-2" />
                Ví Escrow
              </TabsTrigger>
              <TabsTrigger value="refunds">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yêu cầu hoàn tiền
                {stats.pending_refunds > 0 && (
                  <Badge className="ml-2 bg-red-500">{stats.pending_refunds}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="transactions">
                Giao dịch
              </TabsTrigger>
            </TabsList>

            {/* Wallets Tab */}
            <TabsContent value="wallets">
              <div className="mb-4 flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value={WALLET_STATUS.DEPOSIT_HELD}>Đã nhận cọc</SelectItem>
                    <SelectItem value={WALLET_STATUS.FULLY_HELD}>Đã thanh toán đủ</SelectItem>
                    <SelectItem value={WALLET_STATUS.DISPUTED}>Dispute</SelectItem>
                    <SelectItem value={WALLET_STATUS.REFUNDED}>Đã hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">
                  {filteredWallets.length} ví
                </span>
              </div>

              {loadingWallets ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có ví nào</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWallets.map(wallet => (
                    <WalletStatusCard key={wallet.id} wallet={wallet} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Refunds Tab */}
            <TabsContent value="refunds">
              {loadingRefunds ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : pendingRefunds.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có yêu cầu chờ duyệt</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRefunds.map(refund => (
                    <RefundRequestCard key={refund.id} refund={refund} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <RecentTransactionsView />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

function RefundRequestCard({ refund }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">#{refund.order_number}</h4>
          <p className="text-sm text-gray-600">{refund.customer_name}</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          {refund.refund_type}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Số tiền hoàn</p>
          <p className="font-bold text-purple-700">
            {refund.refund_amount.toLocaleString()}đ
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">% hoàn</p>
          <p className="font-bold text-gray-900">{refund.refund_percentage}%</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 bg-green-600">Duyệt</Button>
        <Button size="sm" variant="outline" className="flex-1">Từ chối</Button>
      </div>
    </div>
  );
}

function RecentTransactionsView() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => await base44.entities.WalletTransaction.filter({}, '-created_date', 50)
  });

  return (
    <div className="bg-white rounded-xl border">
      <TransactionList transactions={transactions} isLoading={isLoading} maxItems={20} />
    </div>
  );
}