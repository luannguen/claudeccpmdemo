import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Store, ShoppingCart, Star, TrendingUp, Package, MapPin, Phone, Mail, Search, Filter, ArrowLeft, Heart, Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ShopStorefront() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const urlParams = new URLSearchParams(window.location.search);
  const shopSlug = urlParams.get('shop');
  const queryClient = useQueryClient();

  // Get shop info
  const { data: shop, isLoading: loadingShop } = useQuery({
    queryKey: ['shop-storefront', shopSlug],
    queryFn: async () => {
      if (!shopSlug) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.slug === shopSlug && t.status === 'active');
    },
    enabled: !!shopSlug
  });

  // Get shop products
  const { data: shopProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-storefront-products', shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      const listings = await base44.entities.ShopProduct.list('-created_date', 500);
      return listings.filter(sp => sp.shop_id === shop.id && sp.is_active && sp.status === 'active');
    },
    enabled: !!shop?.id
  });

  // Get platform product details for each listing
  const { data: platformProducts = [] } = useQuery({
    queryKey: ['platform-products-for-shop'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
  });

  const enrichedProducts = useMemo(() => {
    return shopProducts.map(shopProduct => {
      const platformProduct = platformProducts.find(p => p.id === shopProduct.platform_product_id);
      return {
        ...shopProduct,
        image_url: platformProduct?.image_url,
        description: platformProduct?.description,
        category: platformProduct?.category,
        unit: platformProduct?.unit
      };
    });
  }, [shopProducts, platformProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = enrichedProducts;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.platform_product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    return filtered;
  }, [enrichedProducts, searchTerm, categoryFilter]);

  const shopStats = useMemo(() => {
    return {
      totalProducts: shopProducts.length,
      totalSold: shopProducts.reduce((sum, p) => sum + (p.total_sold || 0), 0),
      avgRating: shopProducts.length > 0 
        ? (shopProducts.reduce((sum, p) => sum + (p.rating_average || 0), 0) / shopProducts.length).toFixed(1)
        : 5
    };
  }, [shopProducts]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ product }) => {
      if (!user?.email) {
        alert('Vui lòng đăng nhập để mua hàng');
        return;
      }

      return await base44.entities.Cart.create({
        user_email: user.email,
        product_id: product.platform_product_id,
        product_name: product.platform_product_name,
        shop_id: product.shop_id,
        shop_name: product.shop_name,
        price: product.shop_price,
        quantity: 1,
        image_url: product.image_url,
        unit: product.unit
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      alert('Đã thêm vào giỏ hàng!');
    }
  });

  if (!shopSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Vui lòng chọn shop</p>
          <Link to={createPageUrl('Marketplace')} className="text-[#7CB342] hover:underline">
            ← Về Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy shop</p>
          <Link to={createPageUrl('Marketplace')} className="text-[#7CB342] hover:underline">
            ← Về Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = shop.branding?.primary_color || '#7CB342';
  const secondaryColor = shop.branding?.secondary_color || '#FF9800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Shop Header / Cover */}
      <div className="relative h-64 bg-gradient-to-br overflow-hidden" style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <Link
            to={createPageUrl('Marketplace')}
            className="absolute top-6 left-4 text-white/90 hover:text-white transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Marketplace
          </Link>

          <div className="flex items-end gap-6 w-full">
            {/* Shop Logo */}
            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white">
              {shop.branding?.logo_url ? (
                <img src={shop.branding.logo_url} alt={shop.organization_name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-16 h-16" style={{ color: primaryColor }} />
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1 text-white pb-2">
              <h1 className="text-4xl font-serif font-bold mb-2 drop-shadow-lg">{shop.organization_name}</h1>
              <p className="text-white/90 text-lg mb-3 drop-shadow">
                {shop.industry === 'vegetables' && '🥬 Chuyên rau củ sạch'}
                {shop.industry === 'fruits' && '🍓 Chuyên trái cây tươi'}
                {shop.industry === 'mixed' && '🌿 Đa dạng sản phẩm organic'}
                {shop.industry === 'livestock' && '🥩 Chuyên thịt sạch'}
                {shop.industry === 'seafood' && '🐟 Chuyên hải sản tươi'}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {shop.address && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <MapPin className="w-4 h-4" />
                    <span>{shop.address}</span>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <Phone className="w-4 h-4" />
                    <span>{shop.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Stats */}
            <div className="hidden lg:flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{shopStats.totalProducts}</p>
                <p className="text-xs text-white/80">Sản phẩm</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{shopStats.totalSold}</p>
                <p className="text-xs text-white/80">Đã bán</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white flex items-center justify-center gap-1">
                  {shopStats.avgRating} <Star className="w-4 h-4 fill-current" />
                </p>
                <p className="text-xs text-white/80">Đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 -mt-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>{shopStats.totalProducts}</p>
            <p className="text-xs text-gray-600">Sản phẩm</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-2xl font-bold" style={{ color: secondaryColor }}>{shopStats.totalSold}</p>
            <p className="text-xs text-gray-600">Đã bán</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-1" style={{ color: primaryColor }}>
              {shopStats.avgRating} <Star className="w-4 h-4 fill-current" />
            </p>
            <p className="text-xs text-gray-600">Đánh giá</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="vegetables">Rau Củ</option>
              <option value="fruits">Trái Cây</option>
              <option value="rice">Gạo & Ngũ Cốc</option>
              <option value="processed">Chế Biến</option>
              <option value="combo">Combo</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.platform_product_name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-serif text-lg font-bold text-[#0F0F0F] mb-2 line-clamp-2">
                    {product.platform_product_name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description || 'Sản phẩm chất lượng cao'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Giá:</span>
                      <span className="font-bold text-xl" style={{ color: primaryColor }}>
                        {product.shop_price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {product.total_sold || 0} đã bán
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        {product.rating_average || 5}/5
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCartMutation.mutate({ product })}
                    disabled={addToCartMutation.isPending}
                    className="w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = secondaryColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm Vào Giỏ
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loadingProducts && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          </div>
        )}
      </div>

      {/* Shop Footer Info */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-serif font-bold mb-6">Về {shop.organization_name}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Thông tin liên hệ</h3>
              <div className="space-y-3">
                {shop.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="text-gray-900">{shop.address}</p>
                    </div>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="text-sm text-gray-500">Điện thoại</p>
                      <a href={`tel:${shop.phone}`} className="text-gray-900 hover:underline">{shop.phone}</a>
                    </div>
                  </div>
                )}
                {shop.owner_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${shop.owner_email}`} className="text-gray-900 hover:underline">{shop.owner_email}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Lĩnh vực hoạt động</h3>
              <p className="text-gray-600 mb-4">
                {shop.business_type === 'farm' && 'Trang trại'}
                {shop.business_type === 'cooperative' && 'Hợp tác xã'}
                {shop.business_type === 'distributor' && 'Nhà phân phối'}
                {shop.business_type === 'retailer' && 'Cửa hàng bán lẻ'}
                {shop.business_type === 'restaurant' && 'Nhà hàng'}
              </p>
              <p className="text-gray-600 text-sm">
                Gia nhập Zero Farm Marketplace: {new Date(shop.created_date).toLocaleDateString('vi-VN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}