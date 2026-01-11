import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, Store, RefreshCw, Settings, AlertCircle
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Components
import ShopInfoCard from "@/components/superadmin/shop/ShopInfoCard";
import ShopDetailStats from "@/components/superadmin/shop/ShopDetailStats";
import ShopProductsTable from "@/components/superadmin/shop/ShopProductsTable";
import ShopOrdersTable from "@/components/superadmin/shop/ShopOrdersTable";
import ShopCommissionTable from "@/components/superadmin/shop/ShopCommissionTable";

function SuperAdminShopDetailContent() {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview"); // overview | products | orders | commission

  // Fetch tenant
  const { data: tenant, isLoading: tenantLoading, isError: tenantError } = useQuery({
    queryKey: ['super-admin-shop-detail', shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const tenants = await base44.entities.Tenant.filter({ id: shopId });
      return tenants[0] || null;
    },
    enabled: !!shopId
  });

  // Fetch shop products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['super-admin-shop-products', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const allProducts = await base44.entities.ShopProduct.list('-created_date', 500);
      return allProducts.filter(p => p.shop_id === shopId);
    },
    enabled: !!shopId
  });

  // Fetch shop orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['super-admin-shop-orders', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 1000);
      return allOrders.filter(o => o.shop_id === shopId);
    },
    enabled: !!shopId
  });

  // Fetch commissions
  const { data: commissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ['super-admin-shop-commissions', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const allCommissions = await base44.entities.Commission.list('-created_date', 500);
      return allCommissions.filter(c => c.shop_id === shopId);
    },
    enabled: !!shopId
  });

  // Calculate stats
  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCommission = commissions.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const pendingCommission = commissions.filter(c => ['pending', 'calculated', 'approved'].includes(c.status))
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const shopRevenue = totalRevenue - totalCommission;
    
    // Unique customers
    const customerEmails = new Set(orders.map(o => o.customer_email).filter(Boolean));
    
    // Average rating (placeholder - would need reviews entity)
    const averageRating = 4.5;

    return {
      productsCount: products.length,
      ordersCount: orders.length,
      totalRevenue,
      totalCommission,
      pendingCommission,
      shopRevenue,
      customersCount: customerEmails.size,
      averageRating
    };
  }, [products, orders, commissions]);

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-shop-detail', shopId]);
    }
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(['super-admin-shop-detail', shopId]);
    queryClient.invalidateQueries(['super-admin-shop-products', shopId]);
    queryClient.invalidateQueries(['super-admin-shop-orders', shopId]);
    queryClient.invalidateQueries(['super-admin-shop-commissions', shopId]);
  };

  // Loading state
  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error state
  if (tenantError || !tenant) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy Shop</h2>
        <p className="text-gray-500 mb-6">Shop này không tồn tại hoặc đã bị xóa.</p>
        <Link
          to={createPageUrl("SuperAdminTenants")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={createPageUrl("SuperAdminTenants")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0F0F0F] flex items-center gap-3">
              <Store className="w-7 h-7 text-[#7CB342]" />
              {tenant.organization_name}
            </h1>
            <p className="text-gray-500 text-sm">Chi tiết shop và thống kê kinh doanh</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '📊 Tổng quan' },
          { id: 'products', label: '📦 Sản phẩm' },
          { id: 'orders', label: '🛒 Đơn hàng' },
          { id: 'commission', label: '💰 Hoa hồng' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#7CB342] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <ShopDetailStats {...stats} />

          {/* Info + Quick Tables */}
          <div className="grid lg:grid-cols-3 gap-6">
            <ShopInfoCard 
              tenant={tenant} 
              onEdit={() => {/* TODO: Open edit modal */}} 
            />
            <div className="lg:col-span-2 space-y-6">
              <ShopOrdersTable 
                orders={orders.slice(0, 10)} 
                isLoading={ordersLoading}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <ShopProductsTable 
          products={products} 
          isLoading={productsLoading}
        />
      )}

      {activeTab === 'orders' && (
        <ShopOrdersTable 
          orders={orders} 
          isLoading={ordersLoading}
        />
      )}

      {activeTab === 'commission' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ShopCommissionTable 
              commissions={commissions} 
              isLoading={commissionsLoading}
            />
          </div>
          <ShopInfoCard 
            tenant={tenant} 
            onEdit={() => {}} 
          />
        </div>
      )}
    </div>
  );
}

export default function SuperAdminShopDetail() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminShopDetailContent />
      </AdminLayout>
    </AdminGuard>
  );
}