
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Leaf, ArrowRight, Check, X, Sparkles, Building2, 
  Mail, Phone, MapPin, User, Globe 
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    description: 'Dùng thử miễn phí 14 ngày',
    features: [
      '10 sản phẩm',
      '50 đơn hàng/tháng',
      '2 nhân viên',
      '100MB lưu trữ',
      'Hỗ trợ cơ bản'
    ],
    color: 'from-gray-400 to-gray-600'
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 299000,
    description: 'Dành cho trang trại nhỏ',
    features: [
      '50 sản phẩm',
      '200 đơn hàng/tháng',
      '5 nhân viên',
      '500MB lưu trữ',
      'Domain riêng',
      'Hỗ trợ ưu tiên'
    ],
    popular: true,
    color: 'from-[#7CB342] to-[#5a8f31]'
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 599000,
    description: 'Dành cho doanh nghiệp',
    features: [
      'Không giới hạn sản phẩm',
      'Không giới hạn đơn hàng',
      '20 nhân viên',
      '5GB lưu trữ',
      'Domain riêng',
      'Xóa branding',
      'Báo cáo nâng cao',
      'API access'
    ],
    color: 'from-[#FF9800] to-[#ff6b00]'
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 0,
    priceLabel: 'Liên hệ',
    description: 'Giải pháp tùy chỉnh',
    features: [
      'Tất cả tính năng Pro',
      'Không giới hạn nhân viên',
      'Không giới hạn lưu trữ',
      'White-label hoàn toàn',
      'Nhiều địa điểm',
      'Tích hợp ERP',
      'Dedicated support'
    ],
    color: 'from-purple-600 to-purple-800'
  }
];

export default function TenantSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    organizationName: '',
    slug: '',
    businessType: 'farm',
    industry: 'vegetables',
    
    // Step 2: Owner Info
    ownerName: '',
    ownerEmail: '',
    phone: '',
    address: '',
    
    // Step 3: Plan Selection (handled separately)
  });

  const handleSlugChange = (orgName) => {
    const slug = orgName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    setFormData({ ...formData, organizationName: orgName, slug });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create tenant
      const tenant = await base44.entities.Tenant.create({
        organization_name: formData.organizationName,
        slug: formData.slug,
        owner_email: formData.ownerEmail,
        owner_name: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        business_type: formData.businessType,
        industry: formData.industry,
        subscription_plan: selectedPlan,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        onboarding_step: 1,
        onboarding_completed: false, // Added from outline
        status: 'active',
        commission_rate: 3 // Added from outline
      });

      // Create tenant user (owner) - link to current user if logged in, or use email
      const currentUser = await base44.auth.me().catch(() => null);
      
      await base44.entities.TenantUser.create({
        tenant_id: tenant.id,
        user_email: currentUser?.email || formData.ownerEmail,
        user_name: currentUser?.full_name || formData.ownerName,
        tenant_role: 'owner',
        permissions: ['*'],
        invitation_status: 'accepted',
        accepted_at: new Date().toISOString(),
        status: 'active'
      });

      // Create subscription
      const plan = PLANS.find(p => p.key === selectedPlan);
      await base44.entities.Subscription.create({
        tenant_id: tenant.id,
        plan_name: selectedPlan,
        plan_display_name: plan.name,
        billing_cycle: 'monthly',
        price: plan.price,
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_start: new Date().toISOString(), // Added from outline
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Added from outline
        features: {
          max_products: selectedPlan === 'free' ? 10 : selectedPlan === 'starter' ? 50 : 999999,
          max_orders_per_month: selectedPlan === 'free' ? 50 : selectedPlan === 'starter' ? 200 : 999999,
          max_users: selectedPlan === 'free' ? 2 : selectedPlan === 'starter' ? 5 : selectedPlan === 'pro' ? 20 : 999999,
          max_storage_mb: selectedPlan === 'free' ? 100 : selectedPlan === 'starter' ? 500 : selectedPlan === 'pro' ? 5000 : 999999,
          custom_domain: selectedPlan !== 'free',
          remove_branding: selectedPlan === 'pro' || selectedPlan === 'enterprise',
          priority_support: selectedPlan !== 'free',
          advanced_analytics: selectedPlan === 'pro' || selectedPlan === 'enterprise',
          api_access: selectedPlan === 'pro' || selectedPlan === 'enterprise'
        }
      });

      // If user is not logged in, redirect to login with next URL
      if (!currentUser) {
        const nextUrl = `${window.location.origin}${createPageUrl(`TenantOnboarding?tenant=${tenant.id}`)}`;
        base44.auth.redirectToLogin(nextUrl);
        return;
      }

      // Try to send welcome email (but don't fail signup if it doesn't work)
      try {
        await base44.integrations.Core.SendEmail({
          from_name: 'Zero Farm Platform',
          to: formData.ownerEmail,
          subject: `🎉 Chào mừng ${formData.organizationName} đến với Zero Farm!`,
          body: `
Xin chào ${formData.ownerName},

Chúc mừng bạn đã đăng ký thành công nền tảng Zero Farm!

🌱 Thông tin tài khoản:
- Tên doanh nghiệp: ${formData.organizationName}
- Gói dịch vụ: ${plan.name}
- Thời gian dùng thử: 14 ngày

🚀 Các bước tiếp theo:
1. Chọn sản phẩm từ catalog
2. Tùy chỉnh thương hiệu
3. Hoàn tất onboarding
4. Bắt đầu bán hàng!

🔗 Tiếp tục thiết lập: ${window.location.origin}${createPageUrl(`TenantOnboarding?tenant=${tenant.id}`)}

Nếu cần hỗ trợ, hãy liên hệ: support@zerofarm.vn

Chúc bạn thành công!
Zero Farm Team
          `
        });
      } catch (emailError) {
        console.log('Email sending failed (non-critical):', emailError);
      }

      // Redirect to tenant onboarding
      navigate(createPageUrl(`TenantOnboarding?tenant=${tenant.id}`));
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên Doanh Nghiệp/Trang Trại *
        </label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          placeholder="VD: Trang Trại Xanh Đà Lạt"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Trang Web *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">zerofarm.vn/</span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
            placeholder="trang-trai-xanh"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          URL này sẽ là địa chỉ website của bạn
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại Hình *
          </label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          >
            <option value="farm">Trang Trại</option>
            <option value="cooperative">Hợp Tác Xã</option>
            <option value="distributor">Nhà Phân Phối</option>
            <option value="retailer">Cửa Hàng Bán Lẻ</option>
            <option value="restaurant">Nhà Hàng/Quán Ăn</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lĩnh Vực *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          >
            <option value="vegetables">Rau Củ</option>
            <option value="fruits">Trái Cây</option>
            <option value="livestock">Chăn Nuôi</option>
            <option value="seafood">Hải Sản</option>
            <option value="mixed">Hỗn Hợp</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Họ Tên Chủ Sở Hữu *
        </label>
        <input
          type="text"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          placeholder="Nguyễn Văn A"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.ownerEmail}
          onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số Điện Thoại *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          placeholder="0987654321"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Địa Chỉ
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors resize-none"
          rows={3}
          placeholder="Địa chỉ trang trại/cửa hàng"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif font-bold text-[#0F0F0F] mb-2">
          Chọn Gói Phù Hợp
        </h3>
        <p className="text-gray-600">
          Dùng thử miễn phí 14 ngày • Không cần thẻ tín dụng
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.key}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPlan(plan.key)}
            className={`relative border-3 rounded-2xl p-6 cursor-pointer transition-all ${
              selectedPlan === plan.key
                ? 'border-[#7CB342] bg-[#7CB342]/5 shadow-xl'
                : 'border-gray-200 hover:border-[#7CB342]/50'
            } ${plan.popular ? 'ring-2 ring-[#7CB342]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7CB342] text-white px-4 py-1 rounded-full text-sm font-bold">
                PHỔ BIẾN NHẤT
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">{plan.name}</h4>
              {selectedPlan === plan.key && (
                <div className="w-6 h-6 bg-[#7CB342] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

            <div className="mb-6">
              {plan.priceLabel ? (
                <p className="text-3xl font-bold">{plan.priceLabel}</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">
                    {plan.price.toLocaleString('vi-VN')}đ
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm text-gray-500">/tháng</p>
                  )}
                </>
              )}
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#7CB342] mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const canProceed = () => {
    if (step === 1) {
      return formData.organizationName && formData.slug;
    }
    if (step === 2) {
      return formData.ownerName && formData.ownerEmail && formData.phone;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-10 h-10 text-[#7CB342]" />
            <h1 className="text-3xl font-serif font-bold">Zero Farm Platform</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Tạo website bán hàng cho trang trại của bạn trong 5 phút
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                s === step ? 'bg-[#7CB342] text-white scale-110' :
                s < step ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? <Check className="w-6 h-6" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-8 h-8 text-[#7CB342]" />
                <div>
                  <h2 className="text-2xl font-serif font-bold">Thông Tin Doanh Nghiệp</h2>
                  <p className="text-gray-600">Bước 1/3</p>
                </div>
              </div>
              {renderStep1()}
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <User className="w-8 h-8 text-[#7CB342]" />
                <div>
                  <h2 className="text-2xl font-serif font-bold">Thông Tin Chủ Sở Hữu</h2>
                  <p className="text-gray-600">Bước 2/3</p>
                </div>
              </div>
              {renderStep2()}
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-8 h-8 text-[#7CB342]" />
                <div>
                  <h2 className="text-2xl font-serif font-bold">Chọn Gói Dịch Vụ</h2>
                  <p className="text-gray-600">Bước 3/3</p>
                </div>
              </div>
              {renderStep3()}
            </>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl font-medium hover:border-[#7CB342] transition-colors disabled:opacity-50"
              >
                Quay Lại
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Tiếp Theo
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang Tạo Tài Khoản...
                  </>
                ) : (
                  <>
                    Bắt Đầu Dùng Thử
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Dùng thử 14 ngày miễn phí
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Không cần thẻ tín dụng
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Hủy bất cứ lúc nào
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
