/**
 * ShopCard.jsx
 * Card hiển thị shop trong marketplace
 * 
 * Phase 5 - Task 5.1 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Package, ShoppingBag, BadgeCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';

export default function ShopCard({ shop, variant = 'default' }) {
  const rating = shop.average_rating || 0;
  const reviewCount = shop.review_count || 0;
  const productsCount = shop.products_count || 0;
  
  if (variant === 'compact') {
    return (
      <Link 
        to={createPageUrl(`ShopStorefront?shop=${shop.slug || shop.id}`)}
        className="block"
      >
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:border-[#7CB342] hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            {shop.logo ? (
              <img 
                src={shop.logo} 
                alt={shop.organization_name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {shop.organization_name?.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 truncate">{shop.organization_name}</h3>
                {shop.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
                <span>•</span>
                <span>{productsCount} sản phẩm</span>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`ShopStorefront?shop=${shop.slug || shop.id}`)}
      className="block"
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#7CB342] hover:shadow-xl transition-all group"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 relative">
          {shop.banner_image && (
            <img 
              src={shop.banner_image} 
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          
          {shop.is_featured && (
            <Badge className="absolute top-3 left-3 bg-[#FF9800] text-white">
              ⭐ Nổi bật
            </Badge>
          )}
          
          {/* Logo */}
          <div className="absolute -bottom-8 left-4">
            {shop.logo ? (
              <img 
                src={shop.logo} 
                alt={shop.organization_name}
                className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-xl flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                {shop.organization_name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-10">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 group-hover:text-[#7CB342] transition-colors">
                  {shop.organization_name}
                </h3>
                {shop.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
              </div>
              
              {shop.address && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {shop.address}
                </p>
              )}
            </div>
          </div>
          
          {shop.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {shop.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {productsCount}
              </span>
              {shop.orders_count > 0 && (
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  {shop.orders_count}
                </span>
              )}
            </div>
          </div>
          
          {/* Categories */}
          {shop.business_type && (
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {shop.business_type}
              </Badge>
              {shop.industry && (
                <Badge variant="outline" className="text-xs">
                  {shop.industry}
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}