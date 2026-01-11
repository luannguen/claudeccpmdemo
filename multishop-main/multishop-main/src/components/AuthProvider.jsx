import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAutoSyncOnLogin } from "./hooks/useCustomerSync";
import { processPendingInviteOnLogin, hasPendingInviteCode } from "./ecard/hooks/useInviteAccept.jsx";
import { createPageUrl } from "@/utils";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingInviteProcessed, setPendingInviteProcessed] = useState(false);
  
  // Safe navigation hook (may not be available in all contexts)
  let navigate;
  try {
    navigate = useNavigate();
  } catch {
    navigate = null;
  }
  
  // Auto-sync Customer → User on login
  useAutoSyncOnLogin(user?.email);

  // Check auth ONCE on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check if authenticated (no API call if not)
      const isAuth = await base44.auth.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Trigger auto-sync check (will run in background)
        if (currentUser?.email) {
          import('./hooks/useCustomerSync').then(({ useAutoSyncOnLogin }) => {
            // Hook will handle auto-sync if needed
          });
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process pending invite after authentication check and redirect to MyEcard
  useEffect(() => {
    const handlePendingInvite = async () => {
      // Only process once, when user is loaded and has pending invite
      if (user && hasPendingInviteCode() && !isLoading && !pendingInviteProcessed) {
        console.log('🔗 Processing pending invite after login...');
        setPendingInviteProcessed(true); // Prevent duplicate processing
        
        const result = await processPendingInviteOnLogin();
        
        if (result.success) {
          console.log('✅ Pending invite processed successfully:', result.inviterProfile?.display_name);
          
          // Redirect to MyEcard (connections list) after successful connection
          // Use setTimeout to ensure state updates and navigation work properly
          setTimeout(() => {
            if (navigate) {
              navigate(createPageUrl("MyEcard"), { 
                replace: true,
                state: { 
                  autoConnected: true,
                  connectedTo: result.inviterProfile?.display_name 
                }
              });
            } else {
              // Fallback: direct location change
              window.location.href = createPageUrl("MyEcard");
            }
          }, 100);
        } else if (result.reason === 'self_connection') {
          console.log('ℹ️ Cannot connect to self');
          // Redirect to own ecard
          setTimeout(() => {
            if (navigate) {
              navigate(createPageUrl("MyEcard"), { replace: true });
            }
          }, 100);
        }
      }
    };
    
    handlePendingInvite();
  }, [user, isLoading, pendingInviteProcessed, navigate]);

  const login = async (email, password) => {
    // Your login logic here
    await checkAuth();
  };

  const logout = async () => {
    await base44.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    
    // Import normalize function dynamically to avoid circular dependency
    const ROLE_NAME_MAP = {
      'Quản Trị Viên': 'admin',
      'Quản Lý': 'manager',
      'Nhân Viên': 'staff',
      'Kế Toán': 'accountant',
      'Người Dùng': 'user',
      'Chủ Shop': 'owner',
      'Quản Lý Hệ Thống': 'system_admin',
      'Quản Lý Nhân Sự': 'hr_manager',
      'Quản Lý Bán Hàng': 'sales_manager',
      'Quản Lý Nội Dung': 'content_manager',
      'Quản Lý Test': 'test_manager',
      'Quản Lý Cộng Đồng': 'community_manager',
      'Quản Lý Giao Diện': 'ui_manager',
      'Quản Lý Loyalty': 'loyalty_manager',
      'Quản Lý Lịch Hẹn': 'booking_manager',
      'Nhân Viên Test': 'tester',
      'Biên Tập Viên': 'content_editor',
    };
    
    const normalizeRole = (r) => ROLE_NAME_MAP[r] || r;
    
    // Get all effective roles (hỗ trợ Multi-Role Assignment)
    let effectiveRoles = [];
    if (user.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      effectiveRoles = user.custom_roles.map(normalizeRole);
    } else if (user.custom_role) {
      effectiveRoles = [normalizeRole(user.custom_role)];
    } else if (user.role) {
      effectiveRoles = [user.role];
    } else {
      effectiveRoles = ['user'];
    }
    
    // Check if any of user's roles match required roles
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return effectiveRoles.some(userRole => requiredRoles.includes(userRole));
  };

  // Note: hasPermission is kept for basic check
  // For full RBAC, use usePermissionCheck() from useAdminNavigation
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Import normalize function dynamically to avoid circular dependency
    const ROLE_NAME_MAP = {
      'Quản Trị Viên': 'admin',
      'Quản Lý': 'manager',
      'Nhân Viên': 'staff',
      'Kế Toán': 'accountant',
      'Người Dùng': 'user',
      'Chủ Shop': 'owner',
      'Quản Lý Hệ Thống': 'system_admin',
      'Quản Lý Nhân Sự': 'hr_manager',
      'Quản Lý Bán Hàng': 'sales_manager',
      'Quản Lý Nội Dung': 'content_manager',
      'Quản Lý Test': 'test_manager',
      'Quản Lý Cộng Đồng': 'community_manager',
      'Quản Lý Giao Diện': 'ui_manager',
      'Quản Lý Loyalty': 'loyalty_manager',
      'Quản Lý Lịch Hẹn': 'booking_manager',
      'Nhân Viên Test': 'tester',
      'Biên Tập Viên': 'content_editor',
    };
    
    const normalizeRole = (r) => ROLE_NAME_MAP[r] || r;
    
    // Get effective roles for permission check (normalized)
    let effectiveRoles = [];
    if (user.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      effectiveRoles = user.custom_roles.map(normalizeRole);
    } else if (user.custom_role) {
      effectiveRoles = [normalizeRole(user.custom_role)];
    } else if (user.role) {
      effectiveRoles = [user.role];
    }
    
    // Admin/super_admin have full access
    if (effectiveRoles.includes('admin') || effectiveRoles.includes('super_admin') || user.role === 'admin') {
      return true;
    }
    
    // Basic permission check - for detailed RBAC use usePermissionCheck hook
    const basicPermissions = {
      manager: ['orders', 'products', 'customers', 'inventory', 'reports'],
      staff: ['orders', 'products'],
      owner: ['all'],
      accountant: ['orders', 'reports'],
      system_admin: ['all'],
      hr_manager: ['users', 'settings'],
      sales_manager: ['orders', 'customers', 'reports'],
      content_manager: ['cms', 'community'],
      test_manager: ['features', 'testers'],
      tester: ['features'],
    };

    // Check if any of user's roles has the permission
    return effectiveRoles.some(role => {
      const perms = basicPermissions[role] || [];
      return perms.includes('all') || perms.includes(permission);
    });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
    refreshAuth: checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}