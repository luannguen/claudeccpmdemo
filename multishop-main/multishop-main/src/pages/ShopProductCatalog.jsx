
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Search, Plus, X, TrendingUp, Star, CheckCircle, Store
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ShopLayout from "@/components/ShopLayout";
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PricingCalculator from "@/components/shop/PricingCalculator";
import BulkPricingEditor from "@/components/shop/BulkPricingEditor";

function AddProductModal({ product, onClose, shopId, shopName }) {
  const [step, setStep] = useState(1);
  const [proposedPrice, setProposedPrice] = useState(product?.price || 0);
  const [bulkPricing, setBulkPricing] = useState([]);
  const [useBulkPricing, setUseBulkPricing] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(100);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const listProductMutation = useMutation({
    mutationFn: (data) => base44.entities.ShopProduct.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shop-my-products']);
      queryClient.invalidateQueries(['my-shop-products-list']);
      onClose();
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await listProductMutation.mutateAsync({
        shop_id: shopId,
        shop_name: shopName,
        platform_product_id: product.id,
        platform_product_name: product.name,
        shop_price: product.is_fixed_price ? product.price : proposedPrice,
        bulk_pricing: useBulkPricing ? bulkPricing : null,
        shop_stock_quantity: stockQuantity,
        commission_rate: product.commission_rate,
        listed_date: new Date().toISOString(),
        notes: notes,
        is_active: true,
        status: 'active'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h3 className="text-xl font-bold mb-4">Thông Tin Sản Phẩm</h3>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">
            Giá Platform: {product.price.toLocaleString('vi-VN')}đ / {product.unit}
          </p>
          {product.min_price && (
            <p className="text-xs text-gray-500 mt-1">
              Giá tối thiểu: {product.min_price.toLocaleString('vi-VN')}đ
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Tỷ lệ hoa hồng: {product.commission_rate}%
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-xl font-bold mb-6">Thiết Lập Giá Bán</h3>
      <PricingCalculator
        platformProduct={product}
        onPriceSet={(price) => {
          setProposedPrice(price);
          if (!product.is_fixed_price) {
            setStep(3);
          } else {
            setStep(4);
          }
        }}
        initialPrice={proposedPrice}
      />
      {!product.is_fixed_price && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useBulkPricing}
              onChange={(e) => setUseBulkPricing(e.target.checked)}
              className="w-5 h-5 text-[#7CB342] rounded"
            />
            <div>
              <p className="font-medium text-gray-900">Bật Bulk Pricing (Tùy chọn)</p>
              <p className="text-sm text-gray-600">Thiết lập giá giảm dần theo số lượng mua</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Thiết Lập Bulk Pricing</h3>
      {useBulkPricing ? (
        <BulkPricingEditor
          basePrice={proposedPrice}
          unit={product.unit}
          onSave={(tiers) => {
            setBulkPricing(tiers);
            setStep(4);
          }}
          initialTiers={bulkPricing}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa bật Bulk Pricing cho sản phẩm này.</p>
          <button
            onClick={() => setStep(4)}
            className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]"
          >
            Tiếp Tục (Bỏ Qua Bước Này)
          </button>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Kho Hàng & Ghi Chú</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số Lượng Cam Kết ({product.unit})
        </label>
        <input
          type="number"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi Chú (Tùy chọn)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
          rows={3}
          placeholder="Ghi chú về sản phẩm của bạn..."
        />
      </div>
      <div className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6">
        <h4 className="font-bold text-lg mb-4">📋 Tóm Tắt</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sản phẩm:</span>
            <span className="font-bold">{product.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Giá bán:</span>
            <span className="font-bold">{proposedPrice.toLocaleString('vi-VN')}đ/{product.unit}</span>
          </div>
          {useBulkPricing && bulkPricing.length > 0 && (
            <div className="flex justify-between">
              <span>Bulk pricing:</span>
              <span className="font-bold">{bulkPricing.length} tiers</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Số lượng:</span>
            <span className="font-bold">{stockQuantity} {product.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>Hoa hồng:</span>
            <span className="font-bold">{product.commission_rate}%</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold hover:bg-[#7CB342] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Xác Nhận & List Sản Phẩm
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">Thêm Sản Phẩm Vào Shop</h2>
              <p className="text-sm text-gray-500">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${s === step ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
              {step === 1 ? 'Đóng' : 'Quay Lại'}
            </button>
            {step < 4 && step !== 2 && (
              <button onClick={() => setStep(step + 1)} className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]">
                Tiếp Theo
              </button>
            )}
            {step === 2 && product.is_fixed_price && (
              <button onClick={() => setStep(4)} className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]">
                Tiếp Theo
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ShopProductCatalogContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const queryClient = useQueryClient();
  const { tenant, tenantId } = useTenantAccess();

  const { data: platformProducts = [], isLoading } = useQuery({
    queryKey: ['platform-products-catalog'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    initialData: []
  });

  const { data: myShopProducts = [] } = useQuery({
    queryKey: ['my-shop-products-list', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 500);
      return products.filter(sp => sp.shop_id === tenantId);
    },
    enabled: !!tenantId
  });

  const filteredProducts = platformProducts.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const isActive = product.status === 'active' && product.is_platform_product;
    const alreadyAdded = myShopProducts.some(sp => sp.platform_product_id === product.id);
    return matchesSearch && matchesCategory && isActive && !alreadyAdded;
  });

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy shop</h2>
        <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại thông tin.</p>
        <Link to={createPageUrl('TenantSignup')} className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors">
          <Plus className="w-5 h-5" />
          Đăng Ký Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">Danh Mục Platform</h1>
            <p className="text-gray-600">Browse và thêm sản phẩm vào shop của bạn</p>
          </div>
          <Link to={createPageUrl(`ShopMyProducts?tenant=${tenantId}`)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Sản Phẩm Của Tôi →
          </Link>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shop của bạn</p>
              <p className="font-bold text-gray-900">{tenant.organization_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="font-bold text-blue-600">{tenant.commission_rate || 3}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã thêm</p>
              <p className="font-bold text-green-600">{myShopProducts.length} sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
            <option value="all">Tất cả danh mục</option>
            <option value="vegetables">Rau Củ</option>
            <option value="fruits">Trái Cây</option>
            <option value="rice">Gạo & Ngũ Cốc</option>
            <option value="processed">Chế Biến</option>
            <option value="combo">Combo</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
              <div className="relative h-48 bg-gray-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-[#FF9800] text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Hot
                  </span>
                )}
                <span className="absolute top-3 right-3 px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.short_description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Giá Platform</p>
                    <p className="text-lg font-bold text-[#7CB342]">{product.price.toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-gray-500">/ {product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Đã bán</p>
                    <p className="font-bold text-blue-600">{product.total_sold || 0}</p>
                  </div>
                </div>
                {product.min_price && (
                  <p className="text-xs text-gray-500 mb-3">Giá tối thiểu: {product.min_price.toLocaleString('vi-VN')}đ</p>
                )}
                <button onClick={() => setSelectedProduct(product)} className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Thêm Vào Shop
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
        </div>
      )}

      {selectedProduct && tenant && (
        <AddProductModal
          product={selectedProduct}
          shopId={tenant.id}
          shopName={tenant.organization_name}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default function ShopProductCatalog() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopProductCatalogContent />
      </ShopLayout>
    </TenantGuard>
  );
}
