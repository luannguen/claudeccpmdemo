
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, X, Upload, Settings, Palette, Globe, 
  Shield, Trash2, AlertCircle, CheckCircle, Eye,
  EyeOff, Copy, ExternalLink, RefreshCw, Mail // Added Mail icon
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ThemeEditor from "@/components/tenant/ThemeEditor";
import EmailTemplateEditor from "@/components/tenant/EmailTemplateEditor"; // Added EmailTemplateEditor import
import TenantGuard from "@/components/TenantGuard";

const TABS = [
  { id: 'general', label: 'Thông Tin Chung', icon: Settings },
  { id: 'branding', label: 'Thương Hiệu', icon: Palette },
  { id: 'emails', label: 'Email Templates', icon: Mail }, // Added 'emails' tab
  { id: 'domain', label: 'Domain & URL', icon: Globe },
  { id: 'features', label: 'Tính Năng', icon: Shield },
  { id: 'danger', label: 'Nguy Hiểm', icon: AlertCircle }
];

function TenantSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  // Form states
  const [generalData, setGeneralData] = useState({
    organization_name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    business_type: 'farm',
    industry: 'vegetables'
  });

  const [brandingData, setBrandingData] = useState({
    logo_url: '',
    favicon_url: '',
    primary_color: '#7CB342',
    secondary_color: '#FF9800',
    font_family: 'Playfair Display'
  });

  const [domainData, setDomainData] = useState({
    slug: '',
    custom_domain: ''
  });

  const [featuresData, setFeaturesData] = useState({
    enable_community: true,
    enable_blog: true,
    enable_reviews: true
  });

  // Fetch tenant data
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-settings']);
      setSaveMessage({ type: 'success', text: 'Đã lưu thành công!' });
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (error) => {
      setSaveMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  });

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => {
      alert('Tài khoản đã được xóa.');
      navigate(createPageUrl('Home'));
    }
  });

  useEffect(() => {
    if (!tenantId) {
      navigate(createPageUrl('TenantSignup'));
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenant) {
      setGeneralData({
        organization_name: tenant.organization_name || '',
        owner_name: tenant.owner_name || '',
        owner_email: tenant.owner_email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        business_type: tenant.business_type || 'farm',
        industry: tenant.industry || 'vegetables'
      });

      setBrandingData(tenant.branding || {
        logo_url: '',
        favicon_url: '',
        primary_color: '#7CB342',
        secondary_color: '#FF9800',
        font_family: 'Playfair Display'
      });

      setDomainData({
        slug: tenant.slug || '',
        custom_domain: tenant.domain || ''
      });

      setFeaturesData(tenant.settings || {
        enable_community: true,
        enable_blog: true,
        enable_reviews: true
      });
    }
  }, [tenant]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateTenantMutation.mutateAsync({
        id: tenantId,
        data: generalData
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDomain = async () => {
    setIsSaving(true);
    try {
      await updateTenantMutation.mutateAsync({
        id: tenantId,
        data: {
          slug: domainData.slug,
          domain: domainData.custom_domain
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    try {
      await updateTenantMutation.mutateAsync({
        id: tenantId,
        data: { settings: featuresData }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTenant = () => {
    const confirmation = prompt(
      'Nhập "XÓA VĨNH VIỄN" để xác nhận xóa tài khoản. Hành động này không thể hoàn tác!'
    );
    
    if (confirmation === 'XÓA VĨNH VIỄN') {
      deleteTenantMutation.mutate(tenantId);
    }
  };

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Doanh Nghiệp/Trang Trại *
              </label>
              <input
                type="text"
                value={generalData.organization_name}
                onChange={(e) => setGeneralData({...generalData, organization_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="VD: Trang Trại Xanh Đà Lạt"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Chủ Sở Hữu *
                </label>
                <input
                  type="text"
                  value={generalData.owner_name}
                  onChange={(e) => setGeneralData({...generalData, owner_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={generalData.owner_email}
                  onChange={(e) => setGeneralData({...generalData, owner_email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={generalData.phone}
                  onChange={(e) => setGeneralData({...generalData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Hình
                </label>
                <select
                  value={generalData.business_type}
                  onChange={(e) => setGeneralData({...generalData, business_type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                >
                  <option value="farm">Trang Trại</option>
                  <option value="cooperative">Hợp Tác Xã</option>
                  <option value="distributor">Nhà Phân Phối</option>
                  <option value="retailer">Cửa Hàng</option>
                  <option value="restaurant">Nhà Hàng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa Chỉ
              </label>
              <textarea
                value={generalData.address}
                onChange={(e) => setGeneralData({...generalData, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        );

      case 'branding':
        return (
          <ThemeEditor 
            tenant={tenant}
            initialBrandingData={brandingData}
            onSave={async (themeData) => {
              // The ThemeEditor's internal save button will trigger this
              // The ThemeEditor might handle its own isSaving state.
              // We'll let the mutation's onSuccess/onError handle the saveMessage feedback.
              await updateTenantMutation.mutateAsync({
                id: tenantId,
                data: { branding: themeData }
              });
              // After successful save, the queryClient.invalidateQueries will refetch tenant data,
              // and the useEffect will update brandingData in this parent component.
              // So, no explicit setBrandingData(themeData) needed here, as the query invalidation handles state sync.
            }}
          />
        );

      case 'emails': // New email templates tab
        return (
          <EmailTemplateEditor
            tenant={tenant}
            onSave={async (emailData) => {
              await updateTenantMutation.mutateAsync({
                id: tenantId,
                data: { email_templates: emailData.email_templates }
              });
            }}
          />
        );

      case 'domain':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">zerofarm.vn/</span>
                <input
                  type="text"
                  value={domainData.slug}
                  onChange={(e) => setDomainData({...domainData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://zerofarm.vn/${domainData.slug}`);
                    alert('Đã copy URL!');
                  }}
                  className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
                <a
                  href={`https://zerofarm.vn/${domainData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Đây là địa chỉ website công khai của bạn
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain {tenant.subscription_plan === 'free' && (
                  <span className="text-xs text-orange-600 ml-2">(Yêu cầu gói Starter+)</span>
                )}
              </label>
              <input
                type="text"
                value={domainData.custom_domain}
                onChange={(e) => setDomainData({...domainData, custom_domain: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="yourdomain.com"
                disabled={tenant.subscription_plan === 'free'}
              />
              <p className="text-sm text-gray-500 mt-2">
                Sử dụng tên miền riêng của bạn (VD: trangtrai.vn)
              </p>
            </div>

            {domainData.custom_domain && tenant.subscription_plan !== 'free' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-2">📋 Hướng dẫn cấu hình DNS:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Đăng nhập vào nhà cung cấp domain của bạn</li>
                  <li>Thêm CNAME record: <code className="bg-white px-2 py-1 rounded">@ → zerofarm.vn</code></li>
                  <li>Đợi 24-48 giờ để DNS cập nhật</li>
                </ol>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveDomain}
                disabled={isSaving}
                className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'enable_community', label: 'Cộng Đồng', desc: 'Cho phép khách hàng đăng bài, bình luận' },
                { key: 'enable_blog', label: 'Blog', desc: 'Hiển thị blog và tin tức' },
                { key: 'enable_reviews', label: 'Đánh Giá', desc: 'Cho phép khách hàng đánh giá sản phẩm' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.label}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <button
                    onClick={() => setFeaturesData({...featuresData, [feature.key]: !featuresData[feature.key]})}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      featuresData[feature.key] ? 'bg-[#7CB342]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        featuresData[feature.key] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveFeatures}
                disabled={isSaving}
                className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    Xóa Tài Khoản Vĩnh Viễn
                  </h3>
                  <p className="text-red-700 mb-4">
                    Hành động này sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm:
                  </p>
                  <ul className="list-disc list-inside text-red-700 space-y-1 mb-4">
                    <li>Tất cả sản phẩm</li>
                    <li>Tất cả đơn hàng</li>
                    <li>Tất cả khách hàng</li>
                    <li>Tất cả cài đặt và branding</li>
                    <li>Website của bạn sẽ bị gỡ xuống</li>
                  </ul>
                  <p className="text-red-900 font-bold mb-4">
                    ⚠️ Hành động này KHÔNG THỂ HOÀN TÁC!
                  </p>
                  <button
                    onClick={handleDeleteTenant}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa Tài Khoản Vĩnh Viễn
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F]">
                Cài Đặt
              </h1>
              <p className="text-gray-600">Quản lý thông tin và cài đặt trang trại</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
              className="text-gray-600 hover:text-[#7CB342] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Save Message */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#7CB342] text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h2 className="text-xl font-serif font-bold text-[#0F0F0F] mb-6">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TenantSettingsPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <TenantSettings />
    </TenantGuard>
  );
}
