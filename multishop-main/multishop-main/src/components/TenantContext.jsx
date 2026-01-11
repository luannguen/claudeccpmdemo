import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const location = useLocation();
  const [currentTenantId, setCurrentTenantId] = useState(null);

  // Get tenant ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tenantId = urlParams.get('tenant');
    if (tenantId) {
      setCurrentTenantId(tenantId);
    }
  }, [location.search]);

  // Fetch current tenant data
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['current-tenant', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === currentTenantId);
    },
    enabled: !!currentTenantId,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ['current-subscription', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;
      const subs = await base44.entities.Subscription.list('-created_date', 100);
      return subs.find(s => s.tenant_id === currentTenantId);
    },
    enabled: !!currentTenantId,
    staleTime: 5 * 60 * 1000
  });

  // Helper functions
  const hasFeature = (featureName) => {
    if (!subscription?.features) return false;
    return subscription.features[featureName] === true;
  };

  const canCreateProduct = () => {
    if (!tenant?.limits || !tenant?.usage) return true;
    return tenant.usage.products_count < tenant.limits.max_products;
  };

  const canCreateOrder = () => {
    if (!tenant?.limits || !tenant?.usage) return true;
    return tenant.usage.orders_this_month < tenant.limits.max_orders_per_month;
  };

  const canAddUser = () => {
    if (!tenant?.limits || !tenant?.usage) return true;
    return tenant.usage.users_count < tenant.limits.max_users;
  };

  const getRemainingProducts = () => {
    if (!tenant?.limits || !tenant?.usage) return 0;
    return tenant.limits.max_products - tenant.usage.products_count;
  };

  const getRemainingOrders = () => {
    if (!tenant?.limits || !tenant?.usage) return 0;
    return tenant.limits.max_orders_per_month - tenant.usage.orders_this_month;
  };

  const getRemainingUsers = () => {
    if (!tenant?.limits || !tenant?.usage) return 0;
    return tenant.limits.max_users - tenant.usage.users_count;
  };

  const isTrialExpired = () => {
    if (!subscription) return false;
    if (subscription.status !== 'trial') return false;
    return new Date() > new Date(subscription.trial_ends_at);
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trial';
  };

  const value = {
    // State
    tenantId: currentTenantId,
    tenant,
    subscription,
    isLoading: tenantLoading,
    
    // Actions
    setTenantId: setCurrentTenantId,
    
    // Feature checks
    hasFeature,
    
    // Limit checks
    canCreateProduct,
    canCreateOrder,
    canAddUser,
    getRemainingProducts,
    getRemainingOrders,
    getRemainingUsers,
    
    // Status checks
    isTrialExpired,
    isSubscriptionActive,
    
    // Quick access
    plan: tenant?.subscription_plan,
    branding: tenant?.branding,
    settings: tenant?.settings,
    limits: tenant?.limits,
    usage: tenant?.usage
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

// Hook for easier usage limit checking
export function useTenantLimits() {
  const tenant = useTenant();
  
  const checkLimit = (type) => {
    switch(type) {
      case 'product':
        if (!tenant.canCreateProduct()) {
          throw new Error(`Đã đạt giới hạn ${tenant.limits?.max_products} sản phẩm. Vui lòng nâng cấp gói để thêm nhiều sản phẩm hơn.`);
        }
        break;
      case 'order':
        if (!tenant.canCreateOrder()) {
          throw new Error(`Đã đạt giới hạn ${tenant.limits?.max_orders_per_month} đơn hàng/tháng. Vui lòng nâng cấp gói.`);
        }
        break;
      case 'user':
        if (!tenant.canAddUser()) {
          throw new Error(`Đã đạt giới hạn ${tenant.limits?.max_users} nhân viên. Vui lòng nâng cấp gói.`);
        }
        break;
      default:
        break;
    }
  };

  const showUpgradePrompt = (type) => {
    const messages = {
      product: `Bạn đã sử dụng ${tenant.usage?.products_count}/${tenant.limits?.max_products} sản phẩm.`,
      order: `Bạn đã có ${tenant.usage?.orders_this_month}/${tenant.limits?.max_orders_per_month} đơn hàng tháng này.`,
      user: `Bạn đã có ${tenant.usage?.users_count}/${tenant.limits?.max_users} nhân viên.`
    };
    
    return {
      message: messages[type],
      canUpgrade: tenant.plan !== 'enterprise',
      upgradeUrl: `/TenantBilling?tenant=${tenant.tenantId}`
    };
  };

  return {
    checkLimit,
    showUpgradePrompt,
    canCreateProduct: tenant.canCreateProduct(),
    canCreateOrder: tenant.canCreateOrder(),
    canAddUser: tenant.canAddUser(),
    remainingProducts: tenant.getRemainingProducts(),
    remainingOrders: tenant.getRemainingOrders(),
    remainingUsers: tenant.getRemainingUsers()
  };
}