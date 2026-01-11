import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Eye, AlertCircle,
  Package, Building2, Search, Store
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function SuperAdminApprovalsContent() {
  const [activeTab, setActiveTab] = useState("tenants");
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['approvals-tenants'],
    queryFn: async () => {
      const all = await base44.entities.Tenant.list('-created_date', 500);
      return all.filter(t => !t.onboarding_completed || t.status === 'inactive');
    },
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const { data: shopProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['approvals-shop-products'],
    queryFn: async () => {
      const all = await base44.entities.ShopProduct.list('-created_date', 500);
      return all.filter(sp => sp.approval_status === 'pending');
    },
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const { data: platformProducts = [] } = useQuery({
    queryKey: ['platform-products-for-approval'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 30 * 1000
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvals-tenants']);
      queryClient.invalidateQueries(['super-admin-all-tenants']);
    }
  });

  const updateShopProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopProduct.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvals-shop-products']);
      queryClient.invalidateQueries(['my-shop-products-list']);
    }
  });

  const handleApproveTenant = (tenant) => {
    if (confirm(`Phê duyệt shop "${tenant.organization_name}"?`)) {
      updateTenantMutation.mutate({
        id: tenant.id,
        data: {
          status: 'active',
          onboarding_completed: true
        }
      });
    }
  };

  const handleRejectTenant = (tenant) => {
    const reason = prompt(`Lý do từ chối shop "${tenant.organization_name}":`);
    if (reason) {
      updateTenantMutation.mutate({
        id: tenant.id,
        data: {
          status: 'suspended',
          notes: `Rejected: ${reason}`,
          metadata: { rejection_reason: reason, rejected_date: new Date().toISOString() }
        }
      });
    }
  };

  const handleApproveProduct = (shopProduct) => {
    if (confirm('Phê duyệt sản phẩm này?')) {
      updateShopProductMutation.mutate({
        id: shopProduct.id,
        data: {
          approval_status: 'approved',
          status: 'active',
          is_active: true
        }
      });
    }
  };

  const handleRejectProduct = (shopProduct) => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      updateShopProductMutation.mutate({
        id: shopProduct.id,
        data: {
          approval_status: 'rejected',
          status: 'rejected',
          is_active: false,
          notes: `Rejected: ${reason}`
        }
      });
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = shopProducts.filter(sp =>
    sp.platform_product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-[#7CB342]" />
          Approvals & Moderation
        </h1>
        <p className="text-gray-600">Duyệt shops mới và sản phẩm</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "tenants"
                ? "text-[#7CB342] border-b-2 border-[#7CB342] bg-green-50"
                : "text-gray-600 hover:text-[#7CB342]"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5" />
              Pending Shops ({filteredTenants.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "products"
                ? "text-[#7CB342] border-b-2 border-[#7CB342] bg-green-50"
                : "text-gray-600 hover:text-[#7CB342]"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Pending Products ({filteredProducts.length})
            </div>
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === "tenants" ? "Tìm shop..." : "Tìm sản phẩm..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
        </div>
      </div>

      {activeTab === "tenants" && (
        <div>
          {tenantsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">✅ Không có shop cần duyệt</p>
              <p className="text-sm text-gray-400 mt-2">Tất cả shops đã hoàn tất onboarding</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {tenant.organization_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{tenant.organization_name}</h3>
                        <p className="text-xs text-gray-500">/{tenant.slug}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Owner:</span>
                      <span className="font-medium">{tenant.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Email:</span>
                      <span className="font-medium text-blue-600 truncate">{tenant.owner_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Phone:</span>
                      <span className="font-medium">{tenant.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Plan:</span>
                      <span className="font-medium uppercase">{tenant.subscription_plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Đăng ký:</span>
                      <span className="font-medium">{new Date(tenant.created_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Onboarding:</span>
                      <span className={`font-medium ${tenant.onboarding_completed ? 'text-green-600' : 'text-orange-600'}`}>
                        {tenant.onboarding_completed ? '✅ Completed' : `⏳ Step ${tenant.onboarding_step || 1}/4`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveTenant(tenant)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Phê Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectTenant(tenant)}
                      className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Từ Chối
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div>
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Package className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">✅ Không có sản phẩm cần duyệt</p>
              <p className="text-sm text-gray-400 mt-2">Tất cả sản phẩm đã được phê duyệt</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((shopProduct) => {
                const platformProduct = platformProducts.find(p => p.id === shopProduct.platform_product_id);
                return (
                  <motion.div
                    key={shopProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-200"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {platformProduct?.image_url ? (
                        <img src={platformProduct.image_url} alt={shopProduct.platform_product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{shopProduct.platform_product_name}</h3>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Shop:</span>
                          <span className="font-medium">{shopProduct.shop_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Giá shop:</span>
                          <span className="font-bold text-[#7CB342]">
                            {shopProduct.shop_price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Giá platform:</span>
                          <span className="text-gray-600">
                            {platformProduct?.price?.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Commission:</span>
                          <span className="font-medium text-blue-600">
                            {shopProduct.commission_rate || 3}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveProduct(shopProduct)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-xl font-medium hover:bg-green-600 transition-colors text-sm"
                        >
                          ✓ Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectProduct(shopProduct)}
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
                        >
                          ✗ Từ chối
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminApprovals() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminApprovalsContent />
      </AdminLayout>
    </AdminGuard>
  );
}