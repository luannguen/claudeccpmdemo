
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingCart, Leaf, Phone, Mail, MapPin, Menu, X,
  Plus, Minus, Search, Filter, Star, Heart, Share2
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function TenantPublicSite() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const tenantSlug = urlParams.get('slug');
  
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tenant by slug
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['public-tenant', tenantSlug],
    queryFn: async () => {
      if (!tenantSlug) throw new Error('No tenant slug');
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.slug === tenantSlug);
    },
    enabled: !!tenantSlug
  });

  // Fetch tenant products
  const { data: products = [] } = useQuery({
    queryKey: ['public-products', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const allProducts = await base44.entities.Product.list('-created_date', 500);
      return allProducts.filter(p => p.tenant_id === tenant.id && p.status === 'active');
    },
    enabled: !!tenant?.id
  });

  const branding = tenant?.branding || {
    primary_color: '#7CB342',
    secondary_color: '#FF9800',
    font_family: 'Playfair Display'
  };

  // Check if branding should be removed (Pro+ feature)
  const showBranding = tenant?.subscription_plan === 'free' || 
                       tenant?.subscription_plan === 'starter' ||
                       !tenant?.settings?.remove_branding;

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? {...item, quantity: newQuantity} : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">Không tìm thấy trang trại này</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: branding.font_family }}>
      <style>{`
        :root {
          --primary: ${branding.primary_color};
          --secondary: ${branding.secondary_color};
        }
      `}</style>

      {/* Header */}
      <nav className="sticky top-0 bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
              )}
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: branding.primary_color }}
                >
                  {tenant.organization_name}
                </h1>
                <p className="text-xs text-gray-600">100% Hữu Cơ</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#products" className="text-gray-700 hover:text-[var(--primary)] transition-colors">
                Sản Phẩm
              </a>
              <a href="#about" className="text-gray-700 hover:text-[var(--primary)] transition-colors">
                Về Chúng Tôi
              </a>
              <a href="#contact" className="text-gray-700 hover:text-[var(--primary)] transition-colors">
                Liên Hệ
              </a>
            </div>

            <button 
              className="relative p-2 rounded-full hover:bg-gray-100"
              style={{ color: branding.primary_color }}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: branding.secondary_color }}
                >
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="py-20 text-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primary_color}15 0%, ${branding.secondary_color}15 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
            style={{ color: branding.primary_color }}
          >
            Thực Phẩm Tươi Ngon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Trực tiếp từ trang trại đến tay bạn
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: branding.primary_color }}
          >
            Khám Phá Ngay
          </motion.button>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-6 py-16">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
                style={{ borderColor: branding.primary_color + '33' }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
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
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {product.featured && (
                    <span 
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: branding.secondary_color }}
                    >
                      HOT
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description || product.short_description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: branding.primary_color }}
                      >
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                    {product.rating_average && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{product.rating_average}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    <Plus className="w-5 h-5" />
                    Thêm Vào Giỏ
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed right-6 bottom-6 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-md w-full max-h-[600px] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Giỏ Hàng ({cart.length})</h3>
            <button onClick={() => setCart([])} className="text-gray-500 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-sm" style={{ color: branding.primary_color }}>
                    {item.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg hover:opacity-80 flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Tổng cộng:</span>
              <span className="text-2xl font-bold" style={{ color: branding.primary_color }}>
                {cartTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button
              className="w-full py-4 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: branding.primary_color }}
            >
              Đặt Hàng Ngay
            </button>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div id="contact" className="py-16" style={{ backgroundColor: branding.primary_color + '10' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: branding.primary_color }}>
            Liên Hệ Với Chúng Tôi
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: branding.primary_color }}
              >
                <Phone className="w-8 h-8" />
              </div>
              <p className="font-medium text-gray-900">{tenant.phone || 'N/A'}</p>
            </div>
            <div>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: branding.primary_color }}
              >
                <Mail className="w-8 h-8" />
              </div>
              <p className="font-medium text-gray-900">{tenant.owner_email}</p>
            </div>
            <div>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: branding.primary_color }}
              >
                <MapPin className="w-8 h-8" />
              </div>
              <p className="font-medium text-gray-900">{tenant.address || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-8 h-8" style={{ color: branding.primary_color }} />
            <h3 className="text-2xl font-bold">{tenant.organization_name}</h3>
          </div>
          <p className="text-gray-400 mb-6">
            © 2024 {tenant.organization_name}. All rights reserved.
          </p>
          {showBranding && (
            <p className="text-sm text-gray-500">
              Powered by <span style={{ color: branding.primary_color }}>Zero Farm Platform</span>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
