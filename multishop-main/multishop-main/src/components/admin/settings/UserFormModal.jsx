import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Shield, Check, Info } from "lucide-react";
import { useRoleList } from "@/components/hooks/useRBAC";
import { Badge } from "@/components/ui/badge";
import { ROLE_NAME_MAP } from "@/components/hooks/useRBACPermissions";

// Fallback roles
const FALLBACK_ROLES = [
  { name: 'admin', display_name: 'Quản Trị Viên', description: 'Toàn quyền quản lý hệ thống', color: '#DC2626' },
  { name: 'manager', display_name: 'Quản Lý', description: 'Quản lý sản phẩm, đơn hàng, khách hàng', color: '#7C3AED' },
  { name: 'staff', display_name: 'Nhân Viên', description: 'Xử lý đơn hàng và sản phẩm', color: '#2563EB' },
  { name: 'accountant', display_name: 'Kế Toán', description: 'Xem báo cáo và đơn hàng', color: '#059669' },
  { name: 'user', display_name: 'Người Dùng', description: 'Khách hàng thông thường', color: '#6B7280' }
];

// Helper: normalize display_name -> name
const normalizeRoleName = (roleName, roles) => {
  // First check ROLE_NAME_MAP (display_name -> name)
  if (ROLE_NAME_MAP[roleName]) return ROLE_NAME_MAP[roleName];
  
  // Then check if it's already a valid role name
  if (roles.some(r => r.name === roleName)) return roleName;
  
  // Finally check if it matches a display_name in roles
  const found = roles.find(r => r.display_name === roleName);
  return found ? found.name : roleName;
};

export default function UserFormModal({ user, onClose, onSubmit, isSubmitting }) {
  // Lấy roles từ RBAC
  const { data: dbRoles = [] } = useRoleList();
  const roles = dbRoles.length > 0 ? dbRoles : FALLBACK_ROLES;

  // Get initial selected roles (hỗ trợ multi-role)
  // Normalize display_name -> name
  const getInitialRoles = (roles) => {
    let rawRoles = [];
    if (user?.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      rawRoles = user.custom_roles;
    } else if (user?.custom_role) {
      rawRoles = [user.custom_role];
    } else if (user?.role) {
      rawRoles = [user.role];
    } else {
      return ['user'];
    }
    
    // Normalize: convert display_name → name using helper
    return rawRoles.map(r => normalizeRoleName(r, roles));
  };

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    selectedRoles: []
  });
  
  // Update selectedRoles khi roles đã load
  useEffect(() => {
    if (roles.length > 0 && formData.selectedRoles.length === 0) {
      setFormData(prev => ({
        ...prev,
        selectedRoles: getInitialRoles(roles)
      }));
    }
  }, [roles, user]);

  // Toggle role selection (multi-select) - ALWAYS use role.name (NOT display_name)
  const toggleRole = (roleName) => {
    setFormData(prev => {
      const current = prev.selectedRoles;
      if (current.includes(roleName)) {
        // Không cho bỏ hết - phải có ít nhất 1 role
        if (current.length === 1) return prev;
        return { ...prev, selectedRoles: current.filter(r => r !== roleName) };
      } else {
        return { ...prev, selectedRoles: [...current, roleName] };
      }
    });
  };

  // Count permissions from selected roles
  const selectedRolesData = useMemo(() => {
    const matched = roles.filter(r => formData.selectedRoles.includes(r.name));
    const allPerms = new Set();
    matched.forEach(r => {
      (r.permissions || []).forEach(p => allPerms.add(p));
    });
    return {
      roles: matched,
      totalPermissions: allPerms.size,
      hasFullAccess: allPerms.has('*') || formData.selectedRoles.includes('admin')
    };
  }, [formData.selectedRoles, roles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit với custom_roles (array) thay vì custom_role (string)
    onSubmit({
      full_name: formData.full_name,
      email: formData.email,
      custom_roles: formData.selectedRoles,
      // Backward compatible: set custom_role = primary role (first one)
      role: formData.selectedRoles[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-[#0F0F0F]">
            {user ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ Tên *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              disabled={!!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai Trò * 
              <span className="text-xs text-gray-400 ml-2">(Chọn nhiều để gán đa vai trò)</span>
            </label>
            
            {/* Selected Roles Summary */}
            {formData.selectedRoles.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-blue-600 font-medium">Đã chọn:</span>
                  {formData.selectedRoles.map(roleName => {
                    const role = roles.find(r => r.name === roleName);
                    return (
                      <Badge 
                        key={roleName}
                        className="text-xs"
                        style={{ backgroundColor: `${role?.color}20`, color: role?.color }}
                      >
                        {role?.display_name || roleName}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  {selectedRolesData.hasFullAccess 
                    ? '🔑 Toàn quyền hệ thống' 
                    : `📋 ${selectedRolesData.totalPermissions} quyền được union từ ${formData.selectedRoles.length} vai trò`}
                </p>
              </div>
            )}
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {roles.map(role => {
                const isSelected = formData.selectedRoles.includes(role.name);
                return (
                  <div 
                    key={role.name} 
                    onClick={() => toggleRole(role.name)}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#7CB342] bg-[#7CB342]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Shield className="w-4 h-4" style={{ color: role.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#0F0F0F]">{role.display_name}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                      <p className="text-xs text-gray-400">{role.permissions?.length || 0} quyền</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#7CB342] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Info */}
            <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Multi-Role:</strong> User sẽ có tất cả quyền từ các vai trò được chọn (union permissions). 
                Phù hợp cho công ty nhỏ khi 1 người kiêm nhiều chức vụ.
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : (user ? 'Cập Nhật' : 'Mời Người Dùng')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}