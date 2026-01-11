import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { userService } from "@/components/services/userService";
import { showAdminAlert } from "@/components/AdminAlert";

export const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Toàn quyền quản lý hệ thống' },
  { value: 'manager', label: 'Manager', description: 'Quản lý sản phẩm, đơn hàng, khách hàng' },
  { value: 'staff', label: 'Staff', description: 'Xử lý đơn hàng và sản phẩm' },
  { value: 'accountant', label: 'Accountant', description: 'Xem báo cáo và đơn hàng' },
  { value: 'user', label: 'User', description: 'Khách hàng thông thường' }
];

export const settingsTabs = [
  { id: 'general', name: 'Tổng Quan', icon: 'Settings' },
  { id: 'widget', name: 'Review Widget', icon: 'Star' },
  { id: 'users', name: 'Người Dùng', icon: 'Users' },
  { id: 'rbac', name: 'Phân Quyền RBAC', icon: 'Shield' },
  { id: 'security', name: 'Bảo Mật', icon: 'Lock' },
  { id: 'notifications', name: 'Thông Báo', icon: 'Bell' },
  { id: 'system', name: 'Hệ Thống', icon: 'Database' }
];

export function useAdminUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    initialData: []
  });
}

export function useWidgetConfig() {
  return useQuery({
    queryKey: ['review-widget-config-admin'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter(
        { config_key: 'review_widget_settings' },
        '-created_date',
        1
      );
      return configs[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000
  });
}

export function useSoundConfig() {
  return useQuery({
    queryKey: ['notification-sound-config'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter(
        { config_key: 'notification_sound_settings' },
        '-created_date',
        1
      );
      return configs[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000
  });
}

export function useWidgetSettings(widgetConfig) {
  const [widgetSettings, setWidgetSettings] = useState({
    enabled: true,
    initial_delay: 5000,
    display_duration: 4000,
    interval: 12000,
    max_views_per_session: 3,
    position: 'bottom-left',
    auto_dismiss: true
  });

  useEffect(() => {
    if (widgetConfig) {
      try {
        const parsed = JSON.parse(widgetConfig.config_value);
        setWidgetSettings(parsed);
      } catch (error) {
        console.error('Error parsing widget config:', error);
      }
    }
  }, [widgetConfig]);

  return { widgetSettings, setWidgetSettings };
}

export function useSoundSettings(soundConfig) {
  const [soundSettings, setSoundSettings] = useState({
    enabled: false,
    sound_url: ''
  });

  useEffect(() => {
    if (soundConfig) {
      try {
        const parsed = JSON.parse(soundConfig.config_value);
        setSoundSettings(parsed);
      } catch (error) {
        console.error('Error parsing sound config:', error);
      }
    }
  }, [soundConfig]);

  return { soundSettings, setSoundSettings };
}

export function useUpdateUserMutation(onSuccess, onError) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      // Sử dụng userService để xử lý RBAC role đúng cách
      const result = await userService.update(id, data);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showAdminAlert('Đã cập nhật người dùng thành công!', 'success');
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Update user error:', error);
      showAdminAlert(error.message || 'Không thể cập nhật người dùng', 'error');
      onError?.(error);
    }
  });
}

export function useInviteUserMutation(onSuccess, onError) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role, full_name, custom_roles }) => {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Email không hợp lệ');
      }
      
      // Determine Base44 role: custom_roles chứa admin-level role → role='admin', else 'user'
      const ALL_ADMIN_ROLES = ['admin', 'super_admin', 'manager', 'staff', 'accountant', 'owner', 'system_admin', 'hr_manager', 'sales_manager', 'content_manager', 'test_manager', 'community_manager', 'ui_manager', 'loyalty_manager', 'booking_manager', 'tester', 'content_editor'];
      const hasAdminRole = custom_roles?.some(r => ALL_ADMIN_ROLES.includes(r));
      const base44Role = hasAdminRole ? 'admin' : 'user';
      
      // Invite user via base44 SDK (creates user immediately)
      await base44.users.inviteUser(email, base44Role);
      
      // Wait for user to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the newly created user and update with custom_roles + full_name
      const users = await base44.entities.User.list('-created_date', 20);
      const newUser = users.find(u => u.email === email);
      
      if (newUser) {
        const updateData = {};
        
        if (full_name) {
          updateData.full_name = full_name;
        }
        
        if (custom_roles && custom_roles.length > 0) {
          updateData.custom_roles = custom_roles;
          updateData.custom_role = custom_roles[0];
        }
        
        if (Object.keys(updateData).length > 0) {
          await userService.update(newUser.id, updateData);
        }
        
        return { email, role: base44Role, full_name, custom_roles, userId: newUser.id };
      }
      
      return { email, role: base44Role, full_name, custom_roles };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showAdminAlert(`Đã mời ${data.email} thành công!`, 'success');
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Invite user error:', error);
      const errorMsg = error.message?.includes('already exists') 
        ? 'Email này đã tồn tại trong hệ thống'
        : error.message || 'Không thể mời người dùng';
      showAdminAlert(errorMsg, 'error');
      onError?.(error);
    }
  });
}

export function useSaveWidgetSettings(widgetConfig, currentUser) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      if (widgetConfig) {
        return await base44.entities.PlatformConfig.update(widgetConfig.id, {
          config_value: JSON.stringify(settings),
          last_modified_by: currentUser?.email,
          last_modified_date: new Date().toISOString()
        });
      } else {
        return await base44.entities.PlatformConfig.create({
          config_key: 'review_widget_settings',
          config_name: 'Review Widget Settings',
          config_value: JSON.stringify(settings),
          config_type: 'json',
          category: 'general',
          description: 'Cấu hình popup đánh giá khách hàng',
          is_public: false,
          is_editable: true,
          last_modified_by: currentUser?.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['review-widget-config-admin']);
      queryClient.invalidateQueries(['review-widget-config']);
      showAdminAlert('Đã lưu cài đặt Review Widget', 'success');
    }
  });
}

export function useSaveSoundSettings(soundConfig, currentUser) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      if (soundConfig) {
        return await base44.entities.PlatformConfig.update(soundConfig.id, {
          config_value: JSON.stringify(settings),
          last_modified_by: currentUser?.email,
          last_modified_date: new Date().toISOString()
        });
      } else {
        return await base44.entities.PlatformConfig.create({
          config_key: 'notification_sound_settings',
          config_name: 'Notification Sound Settings',
          config_value: JSON.stringify(settings),
          config_type: 'json',
          category: 'notifications',
          description: 'Cấu hình âm thanh thông báo',
          is_public: false,
          is_editable: true,
          last_modified_by: currentUser?.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-sound-config']);
      showAdminAlert('Đã lưu cài đặt âm thanh thông báo', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  });
}