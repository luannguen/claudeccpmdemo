import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard, { useAdminAuth } from "@/components/AdminGuard";

// Hooks
import {
  useAdminUsers,
  useWidgetConfig,
  useSoundConfig,
  useWidgetSettings,
  useSoundSettings,
  useUpdateUserMutation,
  useInviteUserMutation,
  useSaveWidgetSettings,
  useSaveSoundSettings
} from "@/components/hooks/useAdminSettings";

// Components
import SettingsHeader from "@/components/admin/settings/SettingsHeader";
import SettingsTabs from "@/components/admin/settings/SettingsTabs";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import WidgetSettings from "@/components/admin/settings/WidgetSettings";
import UsersSettings from "@/components/admin/settings/UsersSettings";
import SecuritySettings from "@/components/admin/settings/SecuritySettings";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import SystemSettings from "@/components/admin/settings/SystemSettings";
import UserFormModal from "@/components/admin/settings/UserFormModal";
import RBACSettingsTab from "@/components/admin/rbac/RBACSettingsTab";
import AIPersonalizationSettings from "@/components/admin/settings/AIPersonalizationSettings";

function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { user: currentUser } = useAdminAuth();

  // Data hooks
  const { data: users = [], isLoading } = useAdminUsers();
  const { data: widgetConfig } = useWidgetConfig();
  const { data: soundConfig } = useSoundConfig();

  const { widgetSettings, setWidgetSettings } = useWidgetSettings(widgetConfig);
  const { soundSettings, setSoundSettings } = useSoundSettings(soundConfig);

  // Mutations
  const updateUserMutation = useUpdateUserMutation(() => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  });

  const inviteUserMutation = useInviteUserMutation(() => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  });

  const saveWidgetSettingsMutation = useSaveWidgetSettings(widgetConfig, currentUser);
  const saveSoundSettingsMutation = useSaveSoundSettings(soundConfig, currentUser);

  // Handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (data) => {
    if (editingUser) {
      // UPDATE existing user
      const updateData = {};
      
      // Check full_name change
      if (data.full_name && data.full_name !== editingUser.full_name) {
        updateData.full_name = data.full_name;
      }
      
      // ALWAYS include custom_roles if provided (Multi-Role Assignment)
      if (data.custom_roles && Array.isArray(data.custom_roles) && data.custom_roles.length > 0) {
        updateData.custom_roles = data.custom_roles;
      }
      
      if (Object.keys(updateData).length === 0) {
        setIsUserModalOpen(false);
        setEditingUser(null);
        return;
      }
      
      updateUserMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      // INVITE new user
      if (!data.email) {
        return;
      }
      
      // Determine role: admin or user based on selected roles
      const adminRoles = ['admin', 'manager', 'staff', 'accountant', 'hr_manager', 'sales_manager', 
                         'content_manager', 'community_manager', 'booking_manager', 'loyalty_manager', 'system_admin'];
      const hasAdminRole = data.custom_roles?.some(r => adminRoles.includes(r));
      const inviteRole = hasAdminRole ? 'admin' : 'user';
      
      inviteUserMutation.mutate({
        email: data.email,
        role: inviteRole,
        full_name: data.full_name,
        custom_roles: data.custom_roles
      });
    }
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="max-w-full">
      <SettingsHeader />
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 overflow-x-auto">
        {activeTab === 'general' && <GeneralSettings />}

        {activeTab === 'widget' && (
          <WidgetSettings
            widgetSettings={widgetSettings}
            setWidgetSettings={setWidgetSettings}
            onSave={() => saveWidgetSettingsMutation.mutate(widgetSettings)}
            isSaving={saveWidgetSettingsMutation.isPending}
          />
        )}

        {activeTab === 'users' && (
          <UsersSettings
            users={users}
            isLoading={isLoading}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
          />
        )}

        {activeTab === 'rbac' && <RBACSettingsTab />}

        {activeTab === 'security' && <SecuritySettings />}

        {activeTab === 'notifications' && (
          <NotificationSettings
            soundSettings={soundSettings}
            setSoundSettings={setSoundSettings}
            onSave={() => saveSoundSettingsMutation.mutate(soundSettings)}
            isSaving={saveSoundSettingsMutation.isPending}
          />
        )}

        {activeTab === 'system' && <SystemSettings />}

        {activeTab === 'ai' && <AIPersonalizationSettings />}
      </div>

      {isUserModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={handleCloseModal}
          onSubmit={handleUserSubmit}
          isSubmitting={updateUserMutation.isPending || inviteUserMutation.isPending}
        />
      )}
    </div>
  );
}

export default function AdminSettings() {
  return (
    <AdminGuard requiredModule="settings" requiredPermission="settings.view">
      <AdminLayout>
        <AdminSettingsContent />
      </AdminLayout>
    </AdminGuard>
  );
}