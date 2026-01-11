import React from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Loader2, Package, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PreOrderCancellationCard from "@/components/admin/preorders/PreOrderCancellationCard";

export default function AdminPreOrderCancellations() {
  // Fetch cancellations
  const { data: cancellations = [], isLoading } = useQuery({
    queryKey: ['admin-preorder-cancellations'],
    queryFn: async () => {
      const data = await base44.entities.PreOrderCancellation.filter({}, '-created_date', 200);
      return data;
    }
  });

  // Stats
  const stats = {
    total: cancellations.length,
    pending: cancellations.filter(c => c.refund_status === 'pending').length,
    processing: cancellations.filter(c => c.refund_status === 'processing').length,
    completed: cancellations.filter(c => c.refund_status === 'completed').length,
    totalRefunded: cancellations
      .filter(c => c.refund_status === 'completed')
      .reduce((sum, c) => sum + (c.refund_amount || 0), 0)
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 size={48} className="animate-spin text-[#7CB342]" />
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚫 Quản Lý Hủy Pre-Order</h1>
            <p className="text-gray-600">Xử lý yêu cầu hoàn tiền từ khách hàng</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Package className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600">Chờ xử lý</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Loader2 className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  <p className="text-sm text-gray-600">Đang xử lý</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Hoàn thành</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {(stats.totalRefunded / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">Đã hoàn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cancellations.map((cancel) => (
              <PreOrderCancellationCard key={cancel.id} cancellation={cancel} />
            ))}
          </div>

          {cancellations.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Chưa có yêu cầu hủy nào</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}