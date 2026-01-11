import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Store, Search, Eye, Ban, CheckCircle, Crown,
  Package, ShoppingCart, DollarSign, TrendingUp, Settings,
  Phone, Mail, MapPin, X, Edit, Calendar
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function TenantDetailModal({ tenant, onClose, onUpdate }) {
  const [commissionRate, setCommissionRate] = useState(tenant?.commission_rate || 3);
  const [notes, setNotes] = useState(tenant?.notes || '');

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['tenant-products', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 500);
      return products.filter(sp => sp.shop_id === tenant.id);
    },
    enabled: !!tenant?.id
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['tenant-orders', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 500);
      return allOrders.filter(o => o.shop_id === tenant.id);
    },
    enabled: !!tenant?.id
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.shop_revenue || 0), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (o.commission_total || 0), 0);

  const handleSave = () => {
    onUpdate(tenant.id, {
      commission_rate: commissionRate,
      notes: notes
    });
  };

  if (!tenant) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">{tenant.organization_name}</h2>
            <p className="text-sm text-gray-500">Shop Details</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{shopProducts.length}</p>
              <p className="text-xs text-gray-600">Sản phẩm</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <ShoppingCart className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{orders.length}</p>
              <p className="text-xs text-gray-600">Đơn hàng</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{totalRevenue.toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-gray-600">Doanh thu</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{totalCommission.toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-gray-600">Commission</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold mb-4">Thông Tin Owner</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{tenant.owner_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{tenant.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{tenant.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                step="0.1"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Plan</label>
              <input
                type="text"
                value={tenant.subscription_plan}
                disabled
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
              placeholder="Internal notes..."
            />
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">
              Đóng
            </button>
            <button onClick={handleSave} className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]">
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SuperAdminTenantsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null);

  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['super-admin-all-tenants'],
    queryFn: async () => {
      const result = await base44.entities.Tenant.list('-created_date', 500);
      return result;
    },
    staleTime: 5 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-all-tenants']);
      setSelectedTenant(null);
    }
  });

  const handleUpdateTenant = (id, data) => {
    updateTenantMutation.mutate({ id, data });
  };

  const handleSuspendTenant = (tenant) => {
    if (confirm(`Tạm ngưng shop "${tenant.organization_name}"?`)) {
      updateTenantMutation.mutate({
        id: tenant.id,
        data: { status: 'suspended' }
      });
    }
  };

  const handleActivateTenant = (tenant) => {
    updateTenantMutation.mutate({
      id: tenant.id,
      data: { status: 'active' }
    });
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.owner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && tenant.status === 'active') ||
      (statusFilter === "pending" && (!tenant.onboarding_completed || tenant.status === 'inactive')) ||
      (statusFilter === "suspended" && tenant.status === 'suspended');
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    pending: tenants.filter(t => !t.onboarding_completed || t.status === 'inactive').length,
    suspended: tenants.filter(t => t.status === 'suspended').length
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-600" />
              Quản Lý Shops
            </h1>
            <p className="text-gray-600">Tổng quan và quản lý tất cả shops trên platform</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Tổng Shops</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Pending</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Suspended</p>
          <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, slug..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`h-2 ${
                tenant.status === 'active' ? 'bg-green-500' :
                tenant.status === 'suspended' ? 'bg-red-500' : 'bg-orange-500'
              }`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {tenant.organization_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{tenant.organization_name}</h3>
                      <p className="text-xs text-gray-500">/{tenant.slug}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                    tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {tenant.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{tenant.owner_name}</span></div>
                  <div><span className="text-gray-500">Plan:</span> <span className="font-medium uppercase">{tenant.subscription_plan}</span></div>
                  <div><span className="text-gray-500">Commission:</span> <span className="font-medium text-blue-600">{tenant.commission_rate}%</span></div>
                  <div>
                    <span className="text-gray-500">Onboarding:</span> 
                    <span className={`font-medium ml-2 ${tenant.onboarding_completed ? 'text-green-600' : 'text-orange-600'}`}>
                      {tenant.onboarding_completed ? '✅ Complete' : `⏳ Step ${tenant.onboarding_step}/4`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={createPageUrl(`SuperAdminShopDetail?id=${tenant.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </Link>
                  {tenant.status === 'active' ? (
                    <button
                      onClick={() => handleSuspendTenant(tenant)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateTenant(tenant)}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredTenants.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy shop</p>
        </div>
      )}

      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onUpdate={handleUpdateTenant}
        />
      )}
    </div>
  );
}

export default function SuperAdminTenants() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminTenantsContent />
      </AdminLayout>
    </AdminGuard>
  );
}