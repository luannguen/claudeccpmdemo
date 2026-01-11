import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, DollarSign, Tag, Percent, Save, Plus, Edit, Trash2, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function ConfigFormModal({ config, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    config_key: config?.config_key || "",
    config_name: config?.config_name || "",
    config_value: config?.config_value || "",
    config_type: config?.config_type || "string",
    category: config?.category || "general",
    description: config?.description || "",
    is_public: config?.is_public || false,
    is_editable: config?.is_editable !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-[#0F0F0F]">
            {config ? 'Sửa Config' : 'Thêm Config'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key *</label>
              <input
                type="text"
                required
                value={formData.config_key}
                onChange={(e) => setFormData({...formData, config_key: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                disabled={!!config}
                placeholder="default_commission_rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên Hiển Thị *</label>
              <input
                type="text"
                required
                value={formData.config_name}
                onChange={(e) => setFormData({...formData, config_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="Tỷ lệ hoa hồng mặc định"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu Dữ Liệu</label>
              <select
                value={formData.config_type}
                onChange={(e) => setFormData({...formData, config_type: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
                <option value="array">Array</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh Mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                <option value="commission">Commission</option>
                <option value="pricing">Pricing</option>
                <option value="marketplace">Marketplace</option>
                <option value="payment">Payment</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá Trị *</label>
            <input
              type="text"
              required
              value={formData.config_value}
              onChange={(e) => setFormData({...formData, config_value: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder={formData.config_type === 'number' ? '3' : 'Giá trị config'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.config_type === 'json' && 'Nhập JSON hợp lệ'}
              {formData.config_type === 'boolean' && 'Nhập: true hoặc false'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô Tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                className="w-5 h-5 text-[#7CB342] rounded focus:ring-[#7CB342]"
              />
              <span className="text-sm font-medium text-gray-700">Public (Shops xem được)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_editable}
                onChange={(e) => setFormData({...formData, is_editable: e.target.checked})}
                className="w-5 h-5 text-[#7CB342] rounded focus:ring-[#7CB342]"
              />
              <span className="text-sm font-medium text-gray-700">Có thể chỉnh sửa</span>
            </label>
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
              {isSubmitting ? 'Đang lưu...' : (config ? 'Cập Nhật' : 'Tạo Mới')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SuperAdminConfigContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['platform-configs'],
    queryFn: () => base44.entities.PlatformConfig.list('category', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlatformConfig.create({
      ...data,
      last_modified_by: 'admin',
      last_modified_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-configs']);
      setIsModalOpen(false);
      setEditingConfig(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlatformConfig.update(id, {
      ...data,
      last_modified_by: 'admin',
      last_modified_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-configs']);
      setIsModalOpen(false);
      setEditingConfig(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['platform-configs'])
  });

  const filteredConfigs = configs.filter(config => 
    categoryFilter === "all" || config.category === categoryFilter
  );

  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const cat = config.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(config);
    return acc;
  }, {});

  const handleSubmit = (data) => {
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categoryLabels = {
    commission: { label: 'Commission', icon: DollarSign, color: 'green' },
    pricing: { label: 'Pricing', icon: Tag, color: 'blue' },
    marketplace: { label: 'Marketplace', icon: Settings, color: 'purple' },
    payment: { label: 'Payment', icon: Percent, color: 'orange' },
    general: { label: 'General', icon: Settings, color: 'gray' }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
              Platform Configuration
            </h1>
            <p className="text-gray-600">Cấu hình hệ thống marketplace</p>
          </div>
          <button
            onClick={() => {
              setEditingConfig(null);
              setIsModalOpen(true);
            }}
            className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm Config
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === "all"
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {Object.entries(categoryLabels).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                categoryFilter === key
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configs */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => {
            const catInfo = categoryLabels[category] || categoryLabels.general;
            return (
              <div key={category} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-${catInfo.color}-50 border-b border-${catInfo.color}-200 p-4 flex items-center gap-3`}>
                  <catInfo.icon className={`w-6 h-6 text-${catInfo.color}-600`} />
                  <h3 className={`text-lg font-bold text-${catInfo.color}-900`}>
                    {catInfo.label}
                  </h3>
                  <span className={`ml-auto text-sm font-medium text-${catInfo.color}-700`}>
                    {categoryConfigs.length} configs
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {categoryConfigs.map((config) => (
                    <div key={config.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-[#0F0F0F]">{config.config_name}</h4>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {config.config_key}
                            </code>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              config.config_type === 'number' ? 'bg-blue-100 text-blue-700' :
                              config.config_type === 'boolean' ? 'bg-green-100 text-green-700' :
                              config.config_type === 'json' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {config.config_type}
                            </span>
                            {config.is_public && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                Public
                              </span>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-sm text-gray-600 mb-1">Giá trị:</p>
                            <code className="text-base font-mono text-[#7CB342]">
                              {config.config_value}
                            </code>
                          </div>

                          {config.description && (
                            <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                          )}

                          {config.last_modified_date && (
                            <p className="text-xs text-gray-400">
                              Cập nhật: {new Date(config.last_modified_date).toLocaleString('vi-VN')}
                              {config.last_modified_by && ` bởi ${config.last_modified_by}`}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {config.is_editable !== false && (
                            <button
                              onClick={() => {
                                setEditingConfig(config);
                                setIsModalOpen(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Xóa config này?')) {
                                deleteMutation.mutate(config.id);
                              }
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredConfigs.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có config nào</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ConfigFormModal
          config={editingConfig}
          onClose={() => {
            setIsModalOpen(false);
            setEditingConfig(null);
          }}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

export default function SuperAdminConfig() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminConfigContent />
      </AdminLayout>
    </AdminGuard>
  );
}