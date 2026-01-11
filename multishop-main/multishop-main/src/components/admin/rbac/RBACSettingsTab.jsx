/**
 * RBACSettingsTab - Tab quản lý phân quyền trong Settings
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Plus, Edit, Trash2, Key, Users, 
  Settings, RefreshCw, ChevronRight, AlertCircle, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBACManagement } from "@/components/hooks/useRBAC";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import { useToast } from "@/components/NotificationToast";
import RoleFormModal from "./RoleFormModal";
import RolePermissionEditor from "./RolePermissionEditor";
import RBACQuickGuide from "./RBACQuickGuide";

export default function RBACSettingsTab() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);

  const {
    roles,
    permissions,
    modules,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    initializeRoles,
    initializePermissions,
    isMutating
  } = useRBACManagement();
  
  const { showConfirm } = useConfirmDialog();
  const { addToast } = useToast();

  // Handlers
  const handleAddRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role) => {
    if (role.is_system) {
      addToast('Không thể xóa role hệ thống', 'error');
      return;
    }
    const confirmed = await showConfirm({
      title: 'Xóa Role',
      message: `Bạn có chắc muốn xóa role "${role.display_name}"?`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      deleteRole(role.id);
    }
  };

  const handleRoleSubmit = (data) => {
    if (editingRole) {
      updateRole({ id: editingRole.id, data });
    } else {
      createRole(data);
    }
    setShowRoleModal(false);
    setEditingRole(null);
  };

  const handleEditPermissions = (role) => {
    setSelectedRoleForPermissions(role);
    setShowPermissionEditor(true);
  };

  const handleSavePermissions = (data) => {
    updateRolePermissions(data);
    setShowPermissionEditor(false);
    setSelectedRoleForPermissions(null);
  };



  // Stats
  const stats = [
    { label: 'Roles', value: roles.length, icon: Shield, color: 'text-purple-600 bg-purple-100' },
    { label: 'Permissions', value: permissions.length, icon: Key, color: 'text-blue-600 bg-blue-100' },
    { label: 'Modules', value: modules.length, icon: Settings, color: 'text-green-600 bg-green-100' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="roles" className="space-y-6">
      {/* Header với Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#0F0F0F]">Phân Quyền RBAC</h3>
          <p className="text-sm text-gray-600">Quản lý roles và permissions (Tự động khởi tạo)</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddRole}
            className="bg-[#7CB342] hover:bg-[#689F38]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Role
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="roles" className="gap-2">
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </TabsTrigger>
        <TabsTrigger value="guide" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Hướng Dẫn
        </TabsTrigger>
      </TabsList>

      {/* Tab: Roles Management */}
      <TabsContent value="roles" className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F0F0F]">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box - Chỉ show khi đang load lần đầu */}
        {isLoading && roles.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 animate-spin" />
            <div>
              <p className="font-medium text-blue-800">Đang khởi tạo RBAC...</p>
              <p className="text-sm text-blue-700">
                Hệ thống tự động tạo 15 roles và 168 permissions. Vui lòng đợi...
              </p>
            </div>
          </div>
        )}

        {/* Roles Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-[#0F0F0F] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#7CB342]" />
              Danh Sách Roles ({roles.length}/15)
            </h4>
          </div>

          {roles.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tự động khởi tạo roles... Vui lòng refresh trang.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Shield className="w-5 h-5" style={{ color: role.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0F0F0F]">{role.display_name}</span>
                        {role.is_system && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Hệ Thống
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{role.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">Level: {role.level}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {role.permissions?.length || 0} quyền
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPermissions(role)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Quyền
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!role.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </TabsContent>

        {/* Tab: Quick Guide */}
        <TabsContent value="guide" className="space-y-6">
        <RBACQuickGuide />
        </TabsContent>

        {/* Modals */}
      {showRoleModal && (
        <RoleFormModal
          role={editingRole}
          onClose={() => {
            setShowRoleModal(false);
            setEditingRole(null);
          }}
          onSubmit={handleRoleSubmit}
          isSubmitting={isMutating}
        />
      )}

      {showPermissionEditor && selectedRoleForPermissions && (
        <RolePermissionEditor
          role={selectedRoleForPermissions}
          permissions={permissions}
          onSave={handleSavePermissions}
          onClose={() => {
            setShowPermissionEditor(false);
            setSelectedRoleForPermissions(null);
          }}
          isSaving={isMutating}
        />
      )}
    </Tabs>
  );
}