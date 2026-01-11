import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, ShoppingCart, Star, MapPin, Phone, Mail, Search, 
  Menu, X, Heart, Facebook, Instagram, Package, TrendingUp,
  Leaf, Award, Shield, Clock, ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ShopPublicStorefront() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const shopSlug = urlParams.get('shop');
  const queryClient = useQueryClient();

  // Get shop info
  const { data: shop, isLoading: loadingShop } = useQuery({
    queryKey: ['shop-public-storefront', shopSlug],
    queryFn: async () => {
      if (!shopSlug) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.slug === shopSlug && t.status === 'active');
    },
    enabled: !!shopSlug
  });

  // Get shop products
  const { data: shopProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-public-products', shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      const listings = await base44.entities.ShopProduct.list('-created_date', 500);
      return listings.filter(sp => sp.shop_id === shop.id && sp.is_active && sp.status === 'active');
    },
    enabled: !!shop?.id
  });

  // Get platform product details
  const { data: platformProducts = [] } = useQuery({
    queryKey: ['platform-products-for-shop-public'],
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
    queryKey: ['current-user-shop-public'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Add to cart - store in localStorage with shop context
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem(`shop-cart-${shop.id}`) || '[]');
    const existing = cart.find(item => item.id === product.platform_product_id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.platform_product_id,
        shop_product_id: product.id,
        name: product.platform_product_name,
        price: product.shop_price,
        image_url: product.image_url,
        unit: product.unit,
        quantity: 1,
        shop_id: shop.id,
        shop_name: shop.organization_name
      });
    }
    
    localStorage.setItem(`shop-cart-${shop.id}`, JSON.stringify(cart));
    alert('Đã thêm vào giỏ hàng!');
  };

  if (!shopSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy shop</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={`?shop=${shopSlug}`} className="flex items-center gap-3">
              {shop.branding?.logo_url ? (
                <img src={shop.branding.logo_url} alt={shop.organization_name} className="h-10" />
              ) : (
                <div className="flex items-center gap-2">
                  <Store className="w-8 h-8" style={{ color: primaryColor }} />
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
                    {shop.organization_name}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#products" className="text-gray-700 hover:text-gray-900">Sản Phẩm</a>
              <a href="#about" className="text-gray-700 hover:text-gray-900">Về Chúng Tôi</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900">Liên Hệ</a>
              <button
                onClick={() => {
                  const cart = JSON.parse(localStorage.getItem(`shop-cart-${shop.id}`) || '[]');
                  if (cart.length === 0) {
                    alert('Giỏ hàng trống');
                  } else {
                    window.location.href = createPageUrl(`ShopCheckout?shop=${shopSlug}`);
                  }
                }}
                className="relative p-2 text-gray-700 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {(() => {
                  const cart = JSON.parse(localStorage.getItem(`shop-cart-${shop.id}`) || '[]');
                  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
                  return count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  );
                })()}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#products" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                  Sản Phẩm
                </a>
                <a href="#about" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                  Về Chúng Tôi
                </a>
                <a href="#contact" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                  Liên Hệ
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden" style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-serif font-bold mb-4 drop-shadow-lg">
              {shop.organization_name}
            </h1>
            <p className="text-xl mb-6 drop-shadow">
              {shop.industry === 'vegetables' && '🥬 Chuyên rau củ sạch, organic 100%'}
              {shop.industry === 'fruits' && '🍓 Chuyên trái cây tươi ngon'}
              {shop.industry === 'mixed' && '🌿 Đa dạng sản phẩm organic cao cấp'}
              {shop.industry === 'livestock' && '🥩 Chuyên thịt sạch, an toàn'}
              {shop.industry === 'seafood' && '🐟 Chuyên hải sản tươi sống'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Package className="w-5 h-5" />
                <span>{shopStats.totalProducts} Sản phẩm</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
                <span>{shopStats.totalSold} Đã bán</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-current" />
                <span>{shopStats.avgRating}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Leaf className="w-10 h-10 text-green-600" />
              <div>
                <p className="font-bold text-sm">100% Organic</p>
                <p className="text-xs text-gray-600">Không hóa chất</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-600" />
              <div>
                <p className="font-bold text-sm">An Toàn</p>
                <p className="text-xs text-gray-600">Chứng nhận VietGAP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-orange-600" />
              <div>
                <p className="font-bold text-sm">Giao Nhanh</p>
                <p className="text-xs text-gray-600">Trong 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-purple-600" />
              <div>
                <p className="font-bold text-sm">Chất Lượng</p>
                <p className="text-xs text-gray-600">Đảm bảo hoàn tiền</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-serif font-bold mb-8 text-center">Sản Phẩm Của Chúng Tôi</h2>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
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
                      <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                        {product.shop_price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
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
                    onClick={() => addToCart(product)}
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

      {/* About Section */}
      <div id="about" className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">Về {shop.organization_name}</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-96 flex items-center justify-center">
                <Store className="w-32 h-32 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Cam Kết Chất Lượng</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Chúng tôi tự hào là một trong những {shop.business_type === 'farm' && 'trang trại'}
                {shop.business_type === 'cooperative' && 'hợp tác xã'}
                {shop.business_type === 'distributor' && 'nhà phân phối'}
                {shop.business_type === 'retailer' && 'cửa hàng bán lẻ'} hàng đầu 
                chuyên cung cấp sản phẩm organic chất lượng cao. Mọi sản phẩm đều được 
                kiểm tra kỹ lưỡng và đảm bảo nguồn gốc xuất xứ rõ ràng.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">100% Organic</h4>
                    <p className="text-sm text-gray-600">Sản phẩm được trồng và thu hoạch theo tiêu chuẩn hữu cơ</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Chứng Nhận VietGAP</h4>
                    <p className="text-sm text-gray-600">Đạt tiêu chuẩn nông nghiệp an toàn quốc gia</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Dịch Vụ Tận Tâm</h4>
                    <p className="text-sm text-gray-600">Hỗ trợ khách hàng 24/7, giao hàng nhanh chóng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif font-bold mb-8 text-center">Liên Hệ Với Chúng Tôi</h2>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            {shop.address && (
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="font-bold mb-1">Địa chỉ</h3>
                  <p className="text-gray-700">{shop.address}</p>
                </div>
              </div>
            )}
            
            {shop.phone && (
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="font-bold mb-1">Điện thoại</h3>
                  <a href={`tel:${shop.phone}`} className="text-gray-700 hover:underline">
                    {shop.phone}
                  </a>
                </div>
              </div>
            )}
            
            {shop.owner_email && (
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <a href={`mailto:${shop.owner_email}`} className="text-gray-700 hover:underline">
                    {shop.owner_email}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-bold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${primaryColor}20` }}>
                <Facebook className="w-5 h-5" style={{ color: primaryColor }} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${primaryColor}20` }}>
                <Instagram className="w-5 h-5" style={{ color: primaryColor }} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F0F0F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold mb-2">{shop.organization_name}</h3>
            <p className="text-gray-400">
              Powered by <Link to="/" className="text-[#7CB342] hover:underline">Zero Farm</Link> Marketplace
            </p>
          </div>
          
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <Link to={createPageUrl('Marketplace')} className="hover:text-white">
              Marketplace
            </Link>
            <a href="#products" className="hover:text-white">Sản Phẩm</a>
            <a href="#about" className="hover:text-white">Về Chúng Tôi</a>
            <a href="#contact" className="hover:text-white">Liên Hệ</a>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            © {new Date().getFullYear()} {shop.organization_name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}