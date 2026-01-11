
import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function TenantGuard({ children, requireTenantId = true }) {
  const location = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Get tenant ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');

  // Fetch tenant
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant-guard', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Fetch tenant user relationship
  const { data: tenantUser, isLoading: tenantUserLoading } = useQuery({
    queryKey: ['tenant-user-access', user?.email, tenantId],
    queryFn: async () => {
      if (!user?.email || !tenantId) return null;
      
      const tenantUsers = await base44.entities.TenantUser.list('-created_date', 500);
      return tenantUsers.find(tu => 
        tu.user_email === user.email && 
        tu.tenant_id === tenantId &&
        tu.status === 'active'
      );
    },
    enabled: !!user?.email && !!tenantId,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Show loading only on first check
  if (authLoading || (requireTenantId && (tenantLoading || tenantUserLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={createPageUrl("AdminLogin")} replace />;
  }

  // Require tenant ID but not provided
  if (requireTenantId && !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Thiếu Tenant ID</h2>
          <p className="text-gray-600 mb-6">
            Không tìm thấy thông tin tenant. Vui lòng truy cập qua link đúng hoặc chọn shop từ danh sách.
          </p>
          <div className="space-y-3">
            {user?.email && (
              <FindMyShopButton userEmail={user.email} />
            )}
            <Link
              to={createPageUrl("TenantSignup")}
              className="block bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
            >
              Đăng Ký Shop Mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tenant not found
  if (requireTenantId && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Không Tìm Thấy Shop</h2>
          <p className="text-gray-600 mb-6">
            Shop này không tồn tại hoặc đã bị xóa.
          </p>
          <div className="space-y-3">
            {user?.email && (
              <FindMyShopButton userEmail={user.email} />
            )}
            <Link
              to={createPageUrl("TenantSignup")}
              className="block bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
            >
              Đăng Ký Shop Mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FALLBACK CHECK: If user is owner by email, allow access even without TenantUser record
  const isOwnerByEmail = tenant && user?.email === tenant.owner_email;
  
  // Check if user has access via TenantUser OR is owner by email
  const hasAccess = tenantUser || isOwnerByEmail;

  if (requireTenantId && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 Không Có Quyền Truy Cập</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào tenant này. 
            Vui lòng liên hệ chủ shop để được cấp quyền.
          </p>
          <div className="space-y-4">
            {user?.email && (
              <FindMyShopButton userEmail={user.email} />
            )}
            <Link
              to={createPageUrl("TenantSignup")}
              className="block bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
            >
              Đăng Ký Shop Mới
            </Link>
            <p className="text-sm text-gray-500">
              Email của bạn: {user?.email}
            </p>
            <p className="text-sm text-gray-500">
              Tenant owner: {tenant?.owner_email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // All good - render children
  return <>{children}</>;
}

// Helper component to find user's shop
function FindMyShopButton({ userEmail }) {
  const { data: myTenant, isLoading } = useQuery({
    queryKey: ['find-my-shop', userEmail],
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.owner_email === userEmail);
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <button className="block w-full bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-medium" disabled>
        Đang tìm shop của bạn...
      </button>
    );
  }

  if (myTenant) {
    return (
      <Link
        to={createPageUrl(`ShopDashboard?tenant=${myTenant.id}`)}
        className="block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        ✅ Vào Shop Của Tôi: {myTenant.organization_name}
      </Link>
    );
  }

  return null;
}

// Hook để sử dụng trong components
export function useTenantAccess() {
  const location = useLocation();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');

  const { data: tenant } = useQuery({
    queryKey: ['tenant-access-hook', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000
  });

  const { data: tenantUser } = useQuery({
    queryKey: ['tenant-user-access-hook', user?.email, tenantId],
    queryFn: async () => {
      if (!user?.email || !tenantId) return null;
      const tenantUsers = await base44.entities.TenantUser.list('-created_date', 500);
      return tenantUsers.find(tu => 
        tu.user_email === user.email && 
        tu.tenant_id === tenantId &&
        tu.status === 'active'
      );
    },
    enabled: !!user?.email && !!tenantId,
    staleTime: 10 * 60 * 1000
  });

  const isOwnerByEmail = tenant && user?.email === tenant.owner_email;
  const isOwner = tenantUser?.tenant_role === 'owner' || isOwnerByEmail;
  const isAdmin = tenantUser?.tenant_role === 'admin' || tenantUser?.tenant_role === 'owner' || isOwnerByEmail;
  
  const hasPermission = (permission) => {
    // Owner by email has all permissions
    if (isOwnerByEmail) return true;
    
    if (!tenantUser) return false;
    if (tenantUser.tenant_role === 'owner') return true;
    
    // Check if has wildcard permission
    if (tenantUser.permissions?.includes('*')) return true;
    
    return tenantUser.permissions?.includes(permission) || false;
  };

  return {
    tenant,
    tenantUser,
    tenantId,
    isOwner,
    isAdmin,
    hasPermission,
    role: tenantUser?.tenant_role || (isOwnerByEmail ? 'owner' : null)
  };
}
