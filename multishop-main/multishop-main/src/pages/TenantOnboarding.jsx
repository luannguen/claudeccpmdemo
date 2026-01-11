import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, CheckCircle, ArrowRight, Package, Palette, 
  Rocket, Upload, Plus, X, Sparkles, Store, TrendingUp, ShoppingCart,
  Copy, ExternalLink, Tag, Info
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TenantGuard from "@/components/TenantGuard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 1, title: "Chào Mừng", icon: Sparkles },
  { id: 2, title: "Chọn Sản Phẩm", icon: ShoppingCart },
  { id: 3, title: "Thương Hiệu", icon: Palette },
  { id: 4, title: "Hoàn Tất", icon: Store }
];

function TenantOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPricing, setProductPricing] = useState({});
  const [branding, setBranding] = useState({
    logo_url: '',
    primary_color: '#7CB342',
    secondary_color: '#FF9800'
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(null);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-onboarding', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  const { data: platformProducts = [] } = useQuery({
    queryKey: ['platform-products-onboarding'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    initialData: []
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-onboarding']);
    }
  });

  const createShopProductMutation = useMutation({
    mutationFn: (productData) => base44.entities.ShopProduct.create(productData)
  });

  useEffect(() => {
    if (!tenantId) {
      navigate(createPageUrl('TenantSignup'));
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenant && tenant.onboarding_step) {
      setCurrentStep(tenant.onboarding_step);
    }
    if (tenant && tenant.branding) {
      setBranding(tenant.branding);
    }
  }, [tenant]);

  const handleNextStep = async () => {
    setIsSubmitting(true);
    
    try {
      if (currentStep === 2 && selectedProducts.length > 0) {
        // Save selected products as ShopProducts
        for (const productId of selectedProducts) {
          const platformProduct = platformProducts.find(p => p.id === productId);
          const pricing = productPricing[productId] || {};
          
          await createShopProductMutation.mutateAsync({
            shop_id: tenantId,
            shop_name: tenant.organization_name,
            platform_product_id: productId,
            platform_product_name: platformProduct?.name,
            shop_price: pricing.price || platformProduct?.price || 0,
            commission_rate: platformProduct?.commission_rate || 3,
            shop_stock_quantity: pricing.stock || 100,
            is_active: true,
            status: 'active',
            listed_date: new Date().toISOString()
          });
        }
      }

      await updateTenantMutation.mutateAsync({
        id: tenantId,
        data: { 
          onboarding_step: currentStep + 1,
          ...(currentStep === 3 && { branding })
        }
      });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error advancing step:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateTenantMutation.mutateAsync({
        id: tenantId,
        data: {
          onboarding_completed: true,
          onboarding_step: STEPS.length,
          status: 'active'
        }
      });

      // Show welcome modal instead of alert
      setShowWelcomeModal(true);
    } catch (error) {
      console.error('Complete onboarding error:', error);
      alert('Có lỗi xảy ra khi hoàn tất setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      const newPricing = { ...productPricing };
      delete newPricing[productId];
      setProductPricing(newPricing);
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const updateProductPricing = (productId, field, value) => {
    setProductPricing({
      ...productPricing,
      [productId]: {
        ...(productPricing[productId] || {}),
        [field]: value
      }
    });
  };

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-[#0F0F0F]">
        Chào Mừng Đến Với Zero Farm!
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Chúc mừng bạn đã đăng ký thành công! <strong className="text-[#7CB342]">{tenant.organization_name}</strong>
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
        <h3 className="font-bold text-blue-900 mb-4">🎉 Bạn đã nhận được:</h3>
        <ul className="text-left space-y-2 text-blue-800">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            14 ngày dùng thử miễn phí gói {tenant.subscription_plan.toUpperCase()}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Website riêng tại: <code className="bg-white px-2 py-1 rounded">zerofarm.vn/{tenant.slug}</code>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Truy cập vào 500+ sản phẩm organic từ catalog
          </li>
        </ul>
      </div>
      <p className="text-gray-600">
        Hãy cùng thiết lập shop của bạn trong 3 bước đơn giản!
      </p>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Chọn Sản Phẩm Cho Shop
        </h2>
        <p className="text-gray-600">
          Browse catalog và chọn sản phẩm bạn muốn bán
        </p>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <h3 className="font-bold text-green-900 mb-3">
            ✅ Đã chọn {selectedProducts.length} sản phẩm
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedProducts.map(productId => {
              const product = platformProducts.find(p => p.id === productId);
              const pricing = productPricing[productId] || {};
              return (
                <div key={productId} className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product?.name}</p>
                    <p className="text-xs text-gray-500">
                      {pricing.price ? `${pricing.price.toLocaleString('vi-VN')}đ` : 'Chưa set giá'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleProductSelection(productId)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Catalog */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-[#0F0F0F] mb-4">Platform Product Catalog</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {platformProducts.filter(p => p.status === 'active').map((product) => {
            const isSelected = selectedProducts.includes(product.id);
            const pricing = productPricing[product.id] || {};
            
            return (
              <div
                key={product.id}
                className={`border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#7CB342] bg-green-50'
                    : 'border-gray-200 hover:border-[#7CB342]'
                }`}
              >
                {/* Product Image */}
                {product.image_url && (
                  <div className="w-full h-40 bg-gray-100 relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#7CB342] border-[#7CB342]'
                        : 'bg-white border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                )}
                
                <div className="p-4" onClick={() => toggleProductSelection(product.id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                      )}
                      <p className="text-lg font-bold text-[#7CB342]">
                        {product.price.toLocaleString('vi-VN')}đ
                        <span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        placeholder="Giá bán của bạn"
                        value={pricing.price || ''}
                        onChange={(e) => updateProductPricing(product.id, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                        min={product.min_price || 0}
                      />
                      {product.min_price && (
                        <p className="text-xs text-gray-500">Tối thiểu: {product.min_price.toLocaleString('vi-VN')}đ</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProducts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-800">
            💡 Chọn ít nhất 1 sản phẩm để tiếp tục (hoặc bỏ qua để thêm sau)
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Tùy Chỉnh Thương Hiệu
        </h2>
        <p className="text-gray-600">
          Cá nhân hóa website với màu sắc và logo của bạn
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Color Pickers */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-[#0F0F0F] mb-4">Màu Chủ Đạo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu chính
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                  className="w-16 h-16 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu phụ
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                  className="w-16 h-16 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-[#0F0F0F] mb-4">Logo</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#7CB342] transition-colors">
            {branding.logo_url ? (
              <div>
                <img src={branding.logo_url} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
                <button
                  onClick={() => setBranding({...branding, logo_url: ''})}
                  className="text-red-500 text-sm hover:underline"
                >
                  Xóa logo
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Tải logo lên</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const { data } = await base44.integrations.Core.UploadFile({ file });
                        setBranding({...branding, logo_url: data.file_url});
                      } catch (error) {
                        alert('Lỗi upload file: ' + error.message);
                      }
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block mt-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg cursor-pointer hover:bg-[#5a8f31] transition-colors"
                >
                  Chọn file
                </label>
                <input
                  type="url"
                  placeholder="Hoặc nhập URL..."
                  value={branding.logo_url}
                  onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
                  className="mt-4 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-bold text-[#0F0F0F] mb-4">Xem Trước Storefront</h3>
        <div className="border-2 border-gray-200 rounded-xl p-6" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-3 mb-4">
              {branding.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
              )}
              <h4 className="text-xl font-bold" style={{ color: branding.primary_color }}>
                {tenant.organization_name}
              </h4>
            </div>
            <button
              style={{ backgroundColor: branding.primary_color, color: 'white' }}
              className="px-6 py-2 rounded-lg font-medium"
            >
              Mua Ngay
            </button>
            <button
              style={{ backgroundColor: branding.secondary_color, color: 'white' }}
              className="ml-3 px-6 py-2 rounded-lg font-medium"
            >
              Xem Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-3xl p-8 shadow-xl max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Store className="w-10 h-10 text-green-600" />
      </div>

      <h2 className="text-3xl font-serif font-bold mb-4">
        🎉 Setup Hoàn Tất!
      </h2>

      <p className="text-gray-600 mb-8">
        Shop của bạn đã được setup với <strong className="text-[#7CB342]">{selectedProducts.length} sản phẩm</strong>!
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <Package className="w-8 h-8 text-[#7CB342] mx-auto mb-2" />
          <h4 className="font-bold mb-1">Quản Lý Sản Phẩm</h4>
          <p className="text-sm text-gray-600">Thêm, sửa, xóa sản phẩm</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-bold mb-1">Nhận Đơn Hàng</h4>
          <p className="text-sm text-gray-600">Xử lý & giao hàng</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-bold mb-1">Theo Dõi Doanh Thu</h4>
          <p className="text-sm text-gray-600">Analytics & reports</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-[#7CB342]" />
            <h1 className="text-2xl font-serif font-bold">Zero Farm Platform</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all ${
                      isCompleted ? 'bg-green-500 text-white scale-110' :
                      isCurrent ? 'bg-[#7CB342] text-white scale-125' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${
                      isCurrent ? 'text-[#7CB342]' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              {currentStep > 1 && currentStep < STEPS.length && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                  className="px-6 py-4 border-2 border-gray-200 rounded-xl font-medium hover:border-[#7CB342] transition-colors disabled:opacity-50"
                >
                  Quay Lại
                </button>
              )}
              
              {currentStep < STEPS.length - 1 && (
                <button
                  onClick={handleSkipStep}
                  disabled={isSubmitting}
                  className="px-6 py-4 text-gray-600 hover:text-[#7CB342] font-medium transition-colors disabled:opacity-50"
                >
                  Bỏ Qua
                </button>
              )}
              
              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? 'Bắt Đầu' : 'Tiếp Theo'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Vào Dashboard
                      <Rocket className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!showProductDetail} onOpenChange={() => setShowProductDetail(null)}>
        <DialogContent className="max-w-2xl">
          {showProductDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{showProductDetail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {showProductDetail.image_url && (
                  <img 
                    src={showProductDetail.image_url} 
                    alt={showProductDetail.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Badge>{showProductDetail.category}</Badge>
                  <Badge variant="outline">{showProductDetail.unit}</Badge>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#7CB342]">
                    {showProductDetail.price.toLocaleString('vi-VN')}đ
                    <span className="text-base text-gray-500 font-normal">/{showProductDetail.unit}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Mô tả</h4>
                  <p className="text-gray-600">{showProductDetail.description || 'Chưa có mô tả'}</p>
                </div>
                {showProductDetail.min_price && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <Info className="w-4 h-4 inline mr-1" />
                      Giá bán tối thiểu: {showProductDetail.min_price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={!!showProductDetail} onOpenChange={() => setShowProductDetail(null)}>
        <DialogContent className="max-w-2xl">
          {showProductDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{showProductDetail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {showProductDetail.image_url && (
                  <img 
                    src={showProductDetail.image_url} 
                    alt={showProductDetail.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Badge>{showProductDetail.category}</Badge>
                  <Badge variant="outline">{showProductDetail.unit}</Badge>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#7CB342]">
                    {showProductDetail.price.toLocaleString('vi-VN')}đ
                    <span className="text-base text-gray-500 font-normal">/{showProductDetail.unit}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Mô tả</h4>
                  <p className="text-gray-600">{showProductDetail.description || 'Chưa có mô tả'}</p>
                </div>
                {showProductDetail.min_price && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <Info className="w-4 h-4 inline mr-1" />
                      Giá bán tối thiểu: {showProductDetail.min_price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-serif font-bold mb-2">
                🎉 Chúc Mừng! Shop Đã Sẵn Sàng!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-center text-gray-600">
              <strong className="text-[#7CB342]">{tenant?.organization_name}</strong> đã được setup hoàn tất với {selectedProducts.length} sản phẩm!
            </p>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                🌐 Storefront Của Bạn
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${createPageUrl(`ShopPublicStorefront?shop=${tenant?.slug}`)}`}
                  className="flex-1 px-4 py-3 bg-white border-2 border-green-300 rounded-xl text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${createPageUrl(`ShopPublicStorefront?shop=${tenant?.slug}`)}`);
                  }}
                  className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  title="Copy link"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <a
                  href={createPageUrl(`ShopPublicStorefront?shop=${tenant?.slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  title="Mở storefront"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <Package className="w-8 h-8 text-[#7CB342] mx-auto mb-2" />
                <h4 className="font-bold text-sm mb-1">Quản Lý SP</h4>
                <p className="text-xs text-gray-600">Thêm, sửa, xóa</p>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm mb-1">Đơn Hàng</h4>
                <p className="text-xs text-gray-600">Xử lý & giao</p>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm mb-1">Doanh Thu</h4>
                <p className="text-xs text-gray-600">Báo cáo</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcomeModal(false);
                navigate(createPageUrl(`ShopDashboard?tenant=${tenantId}`));
              }}
              className="w-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all flex items-center justify-center gap-2"
            >
              Vào Dashboard
              <Rocket className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TenantOnboardingPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <TenantOnboarding />
    </TenantGuard>
  );
}