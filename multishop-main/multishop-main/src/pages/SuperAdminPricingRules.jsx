import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, DollarSign, Percent, TrendingUp, Save,
  AlertCircle, CheckCircle, Lock, Package, Tag
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function SuperAdminPricingRulesContent() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Fetch current config
  const { data: configs = [] } = useQuery({
    queryKey: ['platform-config'],
    queryFn: () => base44.entities.PlatformConfig.list('-created_date', 100),
    initialData: []
  });

  const [rules, setRules] = useState({
    default_commission_rate: 3,
    min_commission_rate: 1,
    max_commission_rate: 20,
    volume_discount_enabled: true,
    volume_tiers: [
      { min_revenue: 0, max_revenue: 10000000, commission_rate: 3 },
      { min_revenue: 10000000, max_revenue: 50000000, commission_rate: 2.5 },
      { min_revenue: 50000000, max_revenue: null, commission_rate: 2 }
    ],
    category_commission: {
      vegetables: 3,
      fruits: 3,
      rice: 2.5,
      processed: 4,
      combo: 3.5
    },
    min_price_margin: 0,
    allow_below_platform_price: false,
    auto_approve_products: false,
    require_bulk_pricing: false
  });

  React.useEffect(() => {
    const rulesConfig = configs.find(c => c.config_key === 'pricing_rules');
    if (rulesConfig) {
      try {
        const parsed = JSON.parse(rulesConfig.config_value);
        setRules({ ...rules, ...parsed });
      } catch (e) {
        console.error('Failed to parse pricing rules', e);
      }
    }
  }, [configs]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data) => {
      const existing = configs.find(c => c.config_key === 'pricing_rules');
      if (existing) {
        return base44.entities.PlatformConfig.update(existing.id, {
          config_value: JSON.stringify(data),
          last_modified_date: new Date().toISOString()
        });
      } else {
        return base44.entities.PlatformConfig.create({
          config_key: 'pricing_rules',
          config_name: 'Pricing Rules',
          config_value: JSON.stringify(data),
          config_type: 'json',
          category: 'pricing',
          description: 'Platform-wide pricing rules and commission structure'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-config']);
      setSaveMessage({ type: 'success', text: 'Đã lưu rules thành công!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveConfigMutation.mutateAsync(rules);
    } finally {
      setIsSaving(false);
    }
  };

  const updateVolumeTier = (index, field, value) => {
    const newTiers = [...rules.volume_tiers];
    newTiers[index][field] = value;
    setRules({ ...rules, volume_tiers: newTiers });
  };

  const updateCategoryCommission = (category, rate) => {
    setRules({
      ...rules,
      category_commission: {
        ...rules.category_commission,
        [category]: rate
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
              Pricing Rules & Commission
            </h1>
            <p className="text-gray-600">Cấu hình quy tắc giá và hoa hồng toàn platform</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Đang lưu...' : 'Lưu Rules'}
          </button>
        </div>

        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{saveMessage.text}</p>
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Default Commission */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#7CB342]" />
            Commission Mặc Định
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ Lệ Commission Mặc Định (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rules.default_commission_rate}
                onChange={(e) => setRules({ ...rules, default_commission_rate: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Áp dụng cho tất cả sản phẩm mới nếu không có cấu hình riêng
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rules.min_commission_rate}
                  onChange={(e) => setRules({ ...rules, min_commission_rate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rules.max_commission_rate}
                  onChange={(e) => setRules({ ...rules, max_commission_rate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Commission */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#7CB342]" />
            Commission Theo Danh Mục
          </h3>

          <div className="space-y-3">
            {Object.entries(rules.category_commission).map(([category, rate]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 capitalize">
                  {category === 'vegetables' ? '🥬 Rau Củ' :
                   category === 'fruits' ? '🍎 Trái Cây' :
                   category === 'rice' ? '🌾 Gạo & Ngũ Cốc' :
                   category === 'processed' ? '🥫 Chế Biến' :
                   '📦 Combo'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => updateCategoryCommission(category, Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Discount */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F0F0F] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#7CB342]" />
              Volume-Based Commission (Doanh thu càng cao, commission càng thấp)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rules.volume_discount_enabled}
                onChange={(e) => setRules({ ...rules, volume_discount_enabled: e.target.checked })}
                className="w-5 h-5 text-[#7CB342] rounded"
              />
              <span className="text-sm font-medium text-gray-700">Bật</span>
            </label>
          </div>

          {rules.volume_discount_enabled && (
            <div className="space-y-3">
              {rules.volume_tiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Doanh thu từ (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={tier.min_revenue}
                        onChange={(e) => updateVolumeTier(index, 'min_revenue', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                        disabled={index > 0}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Đến (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={tier.max_revenue || ''}
                        onChange={(e) => updateVolumeTier(index, 'max_revenue', e.target.value ? Number(e.target.value) : null)}
                        placeholder="∞"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                        disabled={index === rules.volume_tiers.length - 1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Commission (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={tier.commission_rate}
                        onChange={(e) => updateVolumeTier(index, 'commission_rate', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Policies */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#7CB342]" />
            Chính Sách Giá & Sản Phẩm
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={rules.allow_below_platform_price}
                onChange={(e) => setRules({ ...rules, allow_below_platform_price: e.target.checked })}
                className="w-5 h-5 text-[#7CB342] rounded mt-0.5"
              />
              <div>
                <p className="font-medium text-gray-900">Cho phép shop bán thấp hơn giá platform</p>
                <p className="text-sm text-gray-600">Shop có thể set giá thấp hơn giá platform (không khuyến khích)</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={rules.auto_approve_products}
                onChange={(e) => setRules({ ...rules, auto_approve_products: e.target.checked })}
                className="w-5 h-5 text-[#7CB342] rounded mt-0.5"
              />
              <div>
                <p className="font-medium text-gray-900">Tự động duyệt sản phẩm mới của shop</p>
                <p className="text-sm text-gray-600">Bỏ qua bước approval khi shop list sản phẩm</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={rules.require_bulk_pricing}
                onChange={(e) => setRules({ ...rules, require_bulk_pricing: e.target.checked })}
                className="w-5 h-5 text-[#7CB342] rounded mt-0.5"
              />
              <div>
                <p className="font-medium text-gray-900">Yêu cầu shops thiết lập bulk pricing</p>
                <p className="text-sm text-gray-600">Khuyến khích shops tạo ưu đãi cho khách mua số lượng lớn</p>
              </div>
            </label>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Margin Tối Thiểu (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rules.min_price_margin}
                onChange={(e) => setRules({ ...rules, min_price_margin: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
              <p className="text-sm text-blue-700 mt-2">
                Shop phải set giá ít nhất cao hơn platform price X%. VD: 5% → min_price = platform_price * 1.05
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">📊 Tóm Tắt Rules</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-1">Commission Mặc Định</p>
              <p className="text-3xl font-bold">{rules.default_commission_rate}%</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-1">Volume Discount</p>
              <p className="text-3xl font-bold">{rules.volume_discount_enabled ? 'Bật' : 'Tắt'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-1">Auto Approve</p>
              <p className="text-3xl font-bold">{rules.auto_approve_products ? 'Bật' : 'Tắt'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPricingRules() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminPricingRulesContent />
      </AdminLayout>
    </AdminGuard>
  );
}