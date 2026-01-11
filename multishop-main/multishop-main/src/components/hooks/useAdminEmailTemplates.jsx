import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { showAdminAlert } from '@/components/AdminAlert';

// ✅ Template Types Config
export const TEMPLATE_TYPES = [
  { value: 'all', label: 'Tất cả', icon: '📧' },
  { value: 'order_confirmation', label: 'Xác nhận đơn', icon: '✅' },
  { value: 'shipping_notification', label: 'Đang giao', icon: '🚚' },
  { value: 'delivery_confirmation', label: 'Đã giao', icon: '🎉' },
  { value: 'payment_confirmed', label: 'Thanh toán', icon: '💳' },
  { value: 'order_cancelled', label: 'Đã hủy', icon: '❌' },
  { value: 'payment_failed', label: 'TT thất bại', icon: '⚠️' },
  { value: 'review_request', label: 'Yêu cầu review', icon: '⭐' },
  { value: 'welcome_email', label: 'Chào mừng', icon: '👋' },
  { value: 'custom', label: 'Tùy chỉnh', icon: '⚙️' }
];

/**
 * Hook fetch email templates
 */
export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 500),
    staleTime: 30000
  });
}

/**
 * Hook tính stats cho templates
 */
export function useTemplateStats(templates = []) {
  return useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    defaults: templates.filter(t => t.is_default).length,
    totalUsage: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)
  }), [templates]);
}

/**
 * Hook filter templates
 */
export function useFilteredTemplates(templates, filters) {
  const { searchTerm, typeFilter } = filters;

  return useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || template.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [templates, searchTerm, typeFilter]);
}

/**
 * Hook mutations cho email templates
 */
export function useTemplateMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      showAdminAlert('✅ Đã tạo template thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      showAdminAlert('✅ Đã cập nhật template', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      showAdminAlert('✅ Đã xóa template', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async ({ template, allTemplates }) => {
      // Unset all defaults for this type
      const sameTypeTemplates = allTemplates.filter(t => t.type === template.type && t.is_default);
      await Promise.all(
        sameTypeTemplates.map(t => base44.entities.EmailTemplate.update(t.id, { is_default: false }))
      );
      
      // Set new default
      return base44.entities.EmailTemplate.update(template.id, { is_default: true });
    },
    onSuccess: () => {
      showAdminAlert('✅ Đã đặt làm mặc định', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return { createMutation, updateMutation, deleteMutation, setDefaultMutation };
}

/**
 * Hook quản lý state filters và modals
 */
export function useTemplatesState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [testTemplate, setTestTemplate] = useState(null);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const hasFilters = searchTerm || typeFilter !== 'all';

  return {
    filters: { searchTerm, typeFilter },
    setSearchTerm,
    setTypeFilter,
    resetFilters,
    hasFilters,
    showForm,
    setShowForm,
    editingTemplate,
    setEditingTemplate,
    previewTemplate,
    setPreviewTemplate,
    testTemplate,
    setTestTemplate
  };
}

export default useEmailTemplates;