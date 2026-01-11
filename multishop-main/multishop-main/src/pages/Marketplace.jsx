import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Store, Search, MapPin, Star, TrendingUp, Package, 
  Eye, ShoppingCart, Filter, Grid, List, Award
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useMarketplaceBrowser } from "@/components/hooks/useMarketplace";
import ShopCard from "@/components/marketplace/ShopCard";
import ShopFilter from "@/components/marketplace/ShopFilter";

export default function Marketplace() {
  const [viewMode, setViewMode] = useState("grid");
  
  // Use the new marketplace hook
  const {
    shops: filteredShops,
    featuredShops,
    isLoading,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalShops
  } = useMarketplaceBrowser();

  // Top shops (featured or by rating)
  const topShops = featuredShops.length > 0 
    ? featuredShops 
    : [...filteredShops].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-full px-4 py-2 mb-4">
            <Store className="w-4 h-4 text-[#7CB342]" />
            <span className="text-sm font-medium text-gray-700">Zero Farm Marketplace</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-4">
            Khám Phá Trang Trại
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {filteredShops.length} trang trại organic đang hoạt động trên Zero Farm
          </p>
        </motion.div>

        {/* Filters - Using new component */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col gap-4">
            <ShopFilter
              filters={filters}
              onFilterChange={updateFilter}
              onReset={resetFilters}
              totalResults={totalShops}
            />
            
            {/* View Mode Toggle */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-colors ${viewMode === "grid" ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-colors ${viewMode === "list" ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Shops Banner */}
        {topShops.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6" />
              🏆 Top Shops Bán Chạy
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {topShops.map((shop, index) => (
                <Link
                  key={shop.id}
                  to={createPageUrl(`ShopPublicStorefront?shop=${shop.slug}`)}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{shop.organization_name}</p>
                      <p className="text-xs opacity-80">{shop.productCount} sản phẩm</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-90">Đã bán:</span>
                    <span className="font-bold">{shop.totalSold}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Shops Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy shop</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}