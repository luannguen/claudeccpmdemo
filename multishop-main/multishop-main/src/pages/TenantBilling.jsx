import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Calendar, Download, Receipt, ArrowUpRight,
  CheckCircle, XCircle, Clock, Crown, AlertCircle, X,
  Zap, Star, TrendingUp, Gift, RefreshCw
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TenantGuard from "@/components/TenantGuard";

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    features: ['10 sản phẩm', '50 đơn hàng/tháng', '2 nhân viên', '100MB lưu trữ'],
    color: 'from-gray-400 to-gray-600'
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 299000,
    features: ['50 sản phẩm', '200 đơn hàng/tháng', '5 nhân viên', '500MB lưu trữ', 'Domain riêng'],
    popular: true,
    color: 'from-[#7CB342] to-[#5a8f31]'
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 599000,
    features: ['Unlimited sản phẩm & đơn', '20 nhân viên', '5GB lưu trữ', 'Xóa branding', 'API access'],
    color: 'from-[#FF9800] to-[#ff6b00]'
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 0,
    priceLabel: 'Liên hệ',
    features: ['Tất cả Pro features', 'Unlimited users & storage', 'White-label', 'Dedicated support'],
    color: 'from-purple-600 to-purple-800'
  }
];

function UpgradeModal({ isOpen, onClose, currentPlan, onUpgrade }) {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [billingCycle, setBillingCycle] = useState('monthly');

  if (!isOpen) return null;

  const plan = PLANS.find(p => p.key === selectedPlan);
  const price = billingCycle === 'yearly' ? plan?.price * 10 : plan?.price;
  const discount = billingCycle === 'yearly' ? 20 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Nâng Cấp Gói Dịch Vụ
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hàng năm
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {PLANS.filter(p => p.key !== 'free' && p.key !== currentPlan).map((plan) => (
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
                    <CheckCircle className="w-6 h-6 text-[#7CB342]" />
                  )}
                </div>

                <div className="mb-6">
                  {plan.priceLabel ? (
                    <p className="text-3xl font-bold">{plan.priceLabel}</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">
                        {(billingCycle === 'yearly' ? plan.price * 10 : plan.price).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-sm text-gray-500">/{billingCycle === 'yearly' ? 'năm' : 'tháng'}</p>
                      {billingCycle === 'yearly' && (
                        <p className="text-xs text-green-600 mt-1">Tiết kiệm 20%</p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#7CB342] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-4">📋 Tóm Tắt Đơn Hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gói:</span>
                <span className="font-bold">{PLANS.find(p => p.key === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Chu kỳ:</span>
                <span>{billingCycle === 'yearly' ? 'Hàng năm' : 'Hàng tháng'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{discount}%</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-[#7CB342]">{(price || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onUpgrade(selectedPlan, billingCycle)}
            disabled={!selectedPlan}
            className="w-full mt-6 bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Xác Nhận Nâng Cấp
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TenantBilling() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch tenant data
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant-billing', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription-billing', tenantId],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.list('-created_date', 100);
      return subs.find(s => s.tenant_id === tenantId);
    },
    enabled: !!tenantId
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription-billing']);
      queryClient.invalidateQueries(['tenant-billing']);
    }
  });

  const handleUpgrade = async (planKey, billingCycle) => {
    const plan = PLANS.find(p => p.key === planKey);
    const price = billingCycle === 'yearly' ? plan.price * 10 : plan.price;

    try {
      await updateSubscriptionMutation.mutateAsync({
        id: subscription.id,
        data: {
          plan_name: planKey,
          plan_display_name: plan.name,
          billing_cycle: billingCycle,
          price: price,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
        }
      });

      // Update tenant
      await base44.entities.Tenant.update(tenantId, {
        subscription_plan: planKey,
        subscription_status: 'active'
      });

      setShowUpgradeModal(false);
      alert('Nâng cấp thành công! 🎉');
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleCancelSubscription = async () => {
    const confirm = window.confirm('Bạn có chắc muốn hủy subscription? Bạn vẫn có thể sử dụng đến hết chu kỳ hiện tại.');
    if (!confirm) return;

    try {
      await updateSubscriptionMutation.mutateAsync({
        id: subscription.id,
        data: {
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString()
        }
      });
      alert('Đã đặt lịch hủy subscription.');
    } catch (error) {
      alert('Có lỗi xảy ra.');
    }
  };

  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    const endDate = subscription.status === 'trial'
      ? new Date(subscription.trial_ends_at)
      : new Date(subscription.current_period_end);
    const now = new Date();
    const diff = endDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [subscription]);

  const currentPlan = PLANS.find(p => p.key === tenant?.subscription_plan);

  if (tenantLoading || !tenant || !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F]">
                Thanh Toán & Gói Dịch Vụ
              </h1>
              <p className="text-gray-600">Quản lý subscription và hóa đơn</p>
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <div className={`bg-gradient-to-br ${currentPlan?.color} text-white rounded-3xl p-8 shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-10 h-10" />
                  <div>
                    <p className="text-white/80 text-sm">Gói Hiện Tại</p>
                    <h2 className="text-3xl font-bold">{currentPlan?.name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">
                    {subscription.status === 'trial' ? 'Dùng thử' : 'Đang hoạt động'}
                  </p>
                  <p className="text-2xl font-bold">
                    {currentPlan?.price > 0
                      ? `${currentPlan.price.toLocaleString('vi-VN')}đ/tháng`
                      : 'Miễn phí'}
                  </p>
                </div>
              </div>

              <div className="bg-white/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90">
                    {subscription.status === 'trial' ? 'Thời gian dùng thử còn lại' : 'Chu kỳ tiếp theo'}
                  </span>
                  <span className="font-bold">{daysRemaining} ngày</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${Math.max(10, (daysRemaining / 30) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Nâng Cấp
                </button>
                {subscription.status !== 'trial' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="bg-white/20 backdrop-blur text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
                  >
                    Hủy Gói
                  </button>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">Mức Sử Dụng</h3>
              <div className="space-y-6">
                {[
                  { label: 'Sản phẩm', current: tenant.usage?.products_count || 0, max: tenant.limits?.max_products || 10, icon: '📦' },
                  { label: 'Đơn hàng tháng này', current: tenant.usage?.orders_this_month || 0, max: tenant.limits?.max_orders_per_month || 50, icon: '🛍️' },
                  { label: 'Nhân viên', current: tenant.usage?.users_count || 1, max: tenant.limits?.max_users || 2, icon: '👥' },
                  { label: 'Lưu trữ', current: tenant.usage?.storage_used_mb || 0, max: tenant.limits?.max_storage_mb || 100, icon: '💾', unit: 'MB' }
                ].map((item, idx) => {
                  const percentage = (item.current / item.max) * 100;
                  const isNearLimit = percentage >= 80;

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <span>{item.icon}</span>
                          {item.label}
                        </span>
                        <span className={`text-sm font-bold ${isNearLimit ? 'text-red-600' : 'text-gray-700'}`}>
                          {item.current} / {item.max} {item.unit || ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isNearLimit ? 'bg-red-500' : 'bg-[#7CB342]'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isNearLimit && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Gần đạt giới hạn</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0F0F0F]">Lịch Sử Thanh Toán</h3>
                <button className="text-[#7CB342] text-sm font-medium hover:underline flex items-center gap-1">
                  Xem tất cả
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-12 text-gray-400">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có lịch sử thanh toán</p>
                <p className="text-sm mt-2">Các hóa đơn sẽ hiển thị tại đây</p>
              </div>
            </div>
          </div>

          {/* Right Column - Plan Comparison */}
          <div className="space-y-6">
            {/* All Plans */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">Các Gói Dịch Vụ</h3>
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.key}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      plan.key === tenant.subscription_plan
                        ? 'border-[#7CB342] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{plan.name}</h4>
                      {plan.key === tenant.subscription_plan && (
                        <span className="text-xs bg-[#7CB342] text-white px-2 py-1 rounded-full">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[#7CB342] mb-3">
                      {plan.priceLabel || `${plan.price.toLocaleString('vi-VN')}đ`}
                      {!plan.priceLabel && <span className="text-sm text-gray-500">/tháng</span>}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-[#0F0F0F] mb-2">💡 Cần Tư Vấn?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Liên hệ với đội ngũ của chúng tôi để được tư vấn gói phù hợp nhất
              </p>
              <button className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors">
                Chat Ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={tenant.subscription_plan}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

export default function TenantBillingPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <TenantBilling />
    </TenantGuard>
  );
}