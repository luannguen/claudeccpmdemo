/**
 * PortfolioGallery - Public view of portfolios
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolioList, usePortfolioDetail } from '../hooks/usePortfolio';
import PortfolioCard, { CATEGORY_CONFIG } from './PortfolioCard';

export default function PortfolioGallery({ profileId, themeColor = '#7CB342', maxItems }) {
  const { data: portfolios = [], isLoading } = usePortfolioList(profileId);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filteredPortfolios = filter === 'all' 
    ? portfolios 
    : portfolios.filter(p => p.category === filter);

  // Limit items for public view
  const displayedPortfolios = maxItems && !showAll 
    ? filteredPortfolios.slice(0, maxItems)
    : filteredPortfolios;

  const categories = ['all', ...new Set(portfolios.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Icon.Spinner size={32} style={{ color: themeColor }} />
      </div>
    );
  }

  if (portfolios.length === 0) {
    return null; // Don't show section if no portfolios
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Portfolio</h3>
        <Badge variant="outline">{portfolios.length} dự án</Badge>
      </div>

      {/* Filters */}
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => {
            const cfg = cat === 'all' ? { label: 'Tất cả' } : CATEGORY_CONFIG[cat] || {};
            return (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat)}
                className={filter === cat ? 'bg-[#7CB342] hover:bg-[#689F38]' : ''}
              >
                {cfg.label || cat}
              </Button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedPortfolios.map((item, idx) => (
            <PortfolioCard
              key={item.id}
              portfolio={item}
              index={idx}
              onClick={() => setSelectedId(item.id)}
              themeColor={themeColor}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show More */}
      {maxItems && filteredPortfolios.length > maxItems && !showAll && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Xem thêm ({filteredPortfolios.length - maxItems} dự án)
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <PortfolioDetailModal 
        id={selectedId} 
        onClose={() => setSelectedId(null)} 
        themeColor={themeColor}
      />
    </div>
  );
}

function PortfolioDetailModal({ id, onClose, themeColor = '#7CB342' }) {
  const { portfolio, isLoading, like, isLiking } = usePortfolioDetail(id);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    await like();
    setLiked(true);
  };

  if (!id) return null;

  const categoryConfig = CATEGORY_CONFIG[portfolio?.category] || CATEGORY_CONFIG.other;

  return (
    <Dialog open={!!id} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Icon.Spinner size={32} style={{ color: themeColor }} />
          </div>
        ) : portfolio ? (
          <>
            <DialogHeader>
              <DialogTitle>{portfolio.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Cover Image */}
              {portfolio.cover_image && (
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={portfolio.cover_image} 
                    alt={portfolio.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={categoryConfig.color}>
                  {categoryConfig.label}
                </Badge>
                {portfolio.client_name && (
                  <span className="text-sm text-gray-500">
                    Khách hàng: {portfolio.client_name}
                  </span>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-400 ml-auto">
                  <span className="flex items-center gap-1">
                    <Icon.Eye size={14} />
                    {portfolio.view_count || 0}
                  </span>
                  <button 
                    className={`flex items-center gap-1 transition-colors ${
                      liked ? 'text-pink-500' : 'hover:text-pink-500'
                    }`}
                    onClick={handleLike}
                    disabled={isLiking || liked}
                  >
                    <Icon.Heart size={14} />
                    {(portfolio.like_count || 0) + (liked ? 1 : 0)}
                  </button>
                </div>
              </div>

              {/* Description */}
              {portfolio.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">
                    {portfolio.description}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {portfolio.gallery?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hình ảnh</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {portfolio.gallery.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {portfolio.video_url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Video</h4>
                  <a 
                    href={portfolio.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: themeColor }}
                  >
                    <Icon.Video size={16} />
                    Xem video demo
                  </a>
                </div>
              )}

              {/* Skills */}
              {portfolio.skills?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Công nghệ sử dụng</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {portfolio.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {portfolio.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Testimonial */}
              {portfolio.testimonial?.content && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <Icon.MessageCircle size={24} style={{ color: themeColor }} className="mb-2" />
                  <p className="text-gray-600 italic mb-3">"{portfolio.testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    {portfolio.testimonial.author_avatar && (
                      <img 
                        src={portfolio.testimonial.author_avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {portfolio.testimonial.author_name}
                      </p>
                      {portfolio.testimonial.author_title && (
                        <p className="text-sm text-gray-500">
                          {portfolio.testimonial.author_title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* External Link */}
              {portfolio.external_link && (
                <div className="pt-4 border-t">
                  <a 
                    href={portfolio.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Icon.ExternalLink size={16} />
                    Xem dự án
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy portfolio
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { PortfolioDetailModal };