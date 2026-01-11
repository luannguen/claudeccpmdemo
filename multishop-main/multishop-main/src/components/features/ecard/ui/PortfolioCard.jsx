/**
 * PortfolioCard - Display single portfolio item
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Badge } from '@/components/ui/badge';

const CATEGORY_CONFIG = {
  project: { label: 'Dự án', color: 'bg-blue-100 text-blue-700' },
  product: { label: 'Sản phẩm', color: 'bg-green-100 text-green-700' },
  service: { label: 'Dịch vụ', color: 'bg-purple-100 text-purple-700' },
  case_study: { label: 'Case Study', color: 'bg-amber-100 text-amber-700' },
  achievement: { label: 'Thành tựu', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Khác', color: 'bg-gray-100 text-gray-700' }
};

export default function PortfolioCard({ 
  portfolio, 
  onClick, 
  onEdit,
  onDelete,
  onToggleFeatured,
  showActions = false,
  index = 0 
}) {
  const {
    title,
    short_description,
    cover_image,
    category,
    tags,
    is_featured,
    view_count,
    like_count,
    status,
    external_link
  } = portfolio;

  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Cover Image */}
      <div 
        className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {cover_image ? (
          <img 
            src={cover_image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7CB342]/20 to-[#7CB342]/5">
            <Icon.Image size={48} className="text-gray-300" />
          </div>
        )}

        {/* Featured Badge */}
        {is_featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-white">
              <Icon.Star size={12} className="mr-1" />
              Nổi bật
            </Badge>
          </div>
        )}

        {/* Status Badge */}
        {status === 'draft' && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Nháp</Badge>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium">Xem chi tiết</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            className="font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-[#7CB342] transition-colors"
            onClick={onClick}
          >
            {title}
          </h3>
          {external_link && (
            <a 
              href={external_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#7CB342]"
            >
              <Icon.ExternalLink size={16} />
            </a>
          )}
        </div>

        {short_description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {short_description}
          </p>
        )}

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={categoryConfig.color}>{categoryConfig.label}</Badge>
          {tags?.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Icon.Eye size={14} />
              {view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Icon.Heart size={14} />
              {like_count || 0}
            </span>
          </div>

          {showActions && (
            <div className="flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFeatured?.(portfolio.id); }}
                className={`p-1.5 rounded-lg transition-colors ${
                  is_featured 
                    ? 'text-yellow-500 bg-yellow-50' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Icon.Star size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(portfolio); }}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Icon.Edit size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(portfolio.id); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Icon.Trash size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export { CATEGORY_CONFIG };