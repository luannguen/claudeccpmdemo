import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Plus, Edit, Trash2, Eye, Copy, Send, CheckCircle,
  AlertCircle, Search, Filter, X, Code, Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { showAdminAlert } from "@/components/AdminAlert";
import EmailTemplateFormModal from "@/components/admin/EmailTemplateFormModal";
import EmailTemplatePreviewModal from "@/components/admin/EmailTemplatePreviewModal";
import TestEmailModal from "@/components/admin/TestEmailModal";

const templateTypes = [
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

function TemplateCard({ template, onEdit, onDelete, onPreview, onTest, onSetDefault }) {
  const typeInfo = templateTypes.find(t => t.value === template.type) || templateTypes[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-200"
    >
      {/* Preview Image */}
      {template.preview_image && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{typeInfo.icon}</span>
              <h3 className="font-bold text-lg">{template.name}</h3>
              {template.is_default && (
                <span className="px-2 py-0.5 bg-[#7CB342] text-white rounded-full text-xs font-medium">
                  Mặc định
                </span>
              )}
              {!template.is_active && (
                <span className="px-2 py-0.5 bg-gray-400 text-white rounded-full text-xs font-medium">
                  Tắt
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
            {template.description && (
              <p className="text-xs text-gray-500">{template.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Loại</p>
            <p className="text-sm font-medium">{typeInfo.label}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Đã dùng</p>
            <p className="text-sm font-medium">{template.usage_count || 0} lần</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(template)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Xem
          </button>
          <button
            onClick={() => onTest(template)}
            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-1"
          >
            <Send className="w-4 h-4" />
            Test
          </button>
          <button
            onClick={() => onEdit(template)}
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!template.is_default && (
            <button
              onClick={() => onSetDefault(template)}
              className="px-3 py-2 bg-[#7CB342]/10 text-[#7CB342] rounded-lg text-sm font-medium hover:bg-[#7CB342]/20"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(template)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AdminEmailTemplatesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [testTemplate, setTestTemplate] = useState(null);

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 500),
    staleTime: 30000
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      showAdminAlert('✅ Đã tạo template thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowForm(false);
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      showAdminAlert('✅ Đã cập nhật template', 'success');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowForm(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  // Delete mutation
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

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (template) => {
      // Unset all defaults for this type
      const sameTypeTemplates = templates.filter(t => t.type === template.type && t.is_default);
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

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || template.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [templates, searchTerm, typeFilter]);

  const handleSubmit = (data) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = (template) => {
    if (confirm(`Bạn có chắc muốn xóa template "${template.name}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Email Templates</h1>
            <p className="text-gray-600">Quản lý mẫu email gửi tự động</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo Template Mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Tổng templates</p>
            <p className="text-2xl font-bold">{templates.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.is_active).length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Mặc định</p>
            <p className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.is_default).length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Tổng gửi</p>
            <p className="text-2xl font-bold text-purple-600">
              {templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, tiêu đề..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            >
              {templateTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            {(searchTerm || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải templates...</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={(t) => setPreviewTemplate(t)}
              onTest={(t) => setTestTemplate(t)}
              onSetDefault={(t) => setDefaultMutation.mutate(t)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Chưa có template nào</h3>
          <p className="text-gray-600 mb-6">Tạo template đầu tiên để bắt đầu</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
          >
            Tạo Template
          </button>
        </div>
      )}

      {/* Modals */}
      <EmailTemplateFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        template={editingTemplate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <EmailTemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />

      <TestEmailModal
        isOpen={!!testTemplate}
        onClose={() => setTestTemplate(null)}
        template={testTemplate}
      />
    </div>
  );
}

export default function AdminEmailTemplates() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminEmailTemplatesContent />
      </AdminLayout>
    </AdminGuard>
  );
}