/**
 * RolePermissionEditor - Component chỉnh sửa quyền cho role
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SYSTEM_MODULES, PERMISSION_ACTIONS } from "@/components/services/rbacService";

export default function RolePermissionEditor({ 
  role, 
  permissions = [], 
  onSave, 
  onClose,
  isSaving 
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions([...role.permissions]);
    }
  }, [role]);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const toggleModule = (moduleCode) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleCode]: !prev[moduleCode]
    }));
  };

  const isPermissionSelected = (permCode) => {
    if (selectedPermissions.includes('*')) return true;
    const [module] = permCode.split('.');
    if (selectedPermissions.includes(`${module}.*`)) return true;
    return selectedPermissions.includes(permCode);
  };

  const togglePermission = (permCode) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permCode)) {
        return prev.filter(p => p !== permCode);
      } else {
        return [...prev, permCode];
      }
    });
  };

  const toggleModuleAll = (moduleCode) => {
    const modulePerms = permissionsByModule[moduleCode] || [];
    const allSelected = modulePerms.every(p => isPermissionSelected(p.code));
    
    setSelectedPermissions(prev => {
      if (allSelected) {
        // Remove all permissions of this module
        return prev.filter(p => !p.startsWith(`${moduleCode}.`));
      } else {
        // Add all permissions of this module
        const newPerms = modulePerms.map(p => p.code);
        const filtered = prev.filter(p => !p.startsWith(`${moduleCode}.`));
        return [...filtered, ...newPerms];
      }
    });
  };

  const handleSave = () => {
    onSave({ roleId: role.id, permissions: selectedPermissions });
  };

  const getModuleStats = (moduleCode) => {
    const modulePerms = permissionsByModule[moduleCode] || [];
    const selected = modulePerms.filter(p => isPermissionSelected(p.code)).length;
    return { selected, total: modulePerms.length };
  };

  const moduleInfo = SYSTEM_MODULES.find(m => m.code === 'dashboard') || {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${role?.color}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: role?.color }} />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#0F0F0F]">
                Phân Quyền: {role?.display_name}
              </h3>
              <p className="text-sm text-gray-500">{role?.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {role?.is_system && role?.name === 'admin' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700">
              <p className="font-medium">⚠️ Role Admin có toàn quyền hệ thống và không thể thay đổi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {SYSTEM_MODULES.map(module => {
                const stats = getModuleStats(module.code);
                const isExpanded = expandedModules[module.code];
                const modulePerms = permissionsByModule[module.code] || [];
                
                return (
                  <div 
                    key={module.code}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Module Header */}
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleModule(module.code)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-medium text-[#0F0F0F]">{module.name}</span>
                        <span className="text-sm text-gray-500">
                          ({stats.selected}/{stats.total})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModuleAll(module.code);
                          }}
                          className="text-sm text-[#7CB342] hover:underline"
                        >
                          {stats.selected === stats.total ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                    </div>

                    {/* Permissions */}
                    {isExpanded && modulePerms.length > 0 && (
                      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {modulePerms.map(perm => (
                          <label 
                            key={perm.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <Checkbox
                              checked={isPermissionSelected(perm.code)}
                              onCheckedChange={() => togglePermission(perm.code)}
                            />
                            <span className="text-sm">
                              {PERMISSION_ACTIONS.find(a => a.code === perm.action)?.name || perm.action}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {isExpanded && modulePerms.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Chưa có quyền nào cho module này
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || (role?.is_system && role?.name === 'admin')}
            className="bg-[#7CB342] hover:bg-[#689F38]"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}