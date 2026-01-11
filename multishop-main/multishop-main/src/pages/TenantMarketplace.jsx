import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Store, Search, TrendingUp, Award, Filter, 
  MapPin, Star, ExternalLink, Users, Package
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function TenantMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Fetch all active tenants
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['marketplace-tenants'],
    queryFn: async () => {
      const allTenants = await base44.entities.Tenant.list('-created_date', 500);
      return allTenants.filter(t => t.status === 'active' && t.onboarding_completed);
    },
    initialData: []
  });

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tenant.business_type === categoryFilter;
    const matchesIndustry = industryFilter === 'all' || tenant.industry === industryFilter;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const featuredTenants = filteredTenants.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold mb-6"
          >
            Khám Phá Trang Trại Organic
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-8"
          >
            Kết nối trực tiếp với {tenants.length}+ trang trại sạch khắp Việt Nam
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm trang trại, địa điểm..."
                className="w-full pl-14 pr-4 py-5 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả loại hình</option>
              <option value="farm">🌾 Trang Trại</option>
              <option value="cooperative">🤝 Hợp Tác Xã</option>
              <option value="distributor">🚚 Nhà Phân Phối</option>
              <option value="retailer">🏪 Cửa Hàng</option>
              <option value="restaurant">🍽️ Nhà Hàng</option>
            </select>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả lĩnh vực</option>
              <option value="vegetables">🥬 Rau Củ</option>
              <option value="fruits">🍎 Trái Cây</option>
              <option value="livestock">🐄 Chăn Nuôi</option>
              <option value="seafood">🐟 Hải Sản</option>
              <option value="mixed">🌱 Hỗn Hợp</option>
            </select>
          </div>
        </div>

        {/* Featured Tenants */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy trang trại nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
              >
                {/* Cover Image */}
                <div 
                  className="h-48 relative"
                  style={{ 
                    background: tenant.branding?.primary_color 
                      ? `linear-gradient(135deg, ${tenant.branding.primary_color}30 0%, ${tenant.branding.secondary_color || '#FF9800'}30 100%)`
                      : 'linear-gradient(135deg, #7CB34230 0%, #FF980030 100%)'
                  }}
                >
                  {tenant.branding?.logo_url && (
                    <img 
                      src={tenant.branding.logo_url} 
                      alt={tenant.organization_name}
                      className="absolute inset-0 w-full h-full object-contain p-8"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {tenant.subscription_plan !== 'free' && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        PREMIUM
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7CB342] transition-colors">
                    {tenant.organization_name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{tenant.address || 'Việt Nam'}</span>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                      {tenant.industry?.replace('_', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {tenant.business_type?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">{tenant.usage?.products_count || 0}</p>
                      <p className="text-xs text-gray-500">Sản phẩm</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">5.0</p>
                      <p className="text-xs text-gray-500">Đánh giá</p>
                    </div>
                  </div>

                  <a
                    href={`/TenantPublicSite?slug=${tenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium text-center hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Xem Trang Trại
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}