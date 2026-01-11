/**
 * ConnectionRecommendationsWidget - Display recommended connections
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConnectionRecommendations } from '../hooks/useConnectionRecommendations';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const REASON_CONFIG = {
  same_company: { icon: 'Building', color: 'bg-purple-100 text-purple-700' },
  same_industry: { icon: 'Briefcase', color: 'bg-blue-100 text-blue-700' },
  mutual_connections: { icon: 'Users', color: 'bg-green-100 text-green-700' },
  same_location: { icon: 'MapPin', color: 'bg-amber-100 text-amber-700' },
  common_tags: { icon: 'Tag', color: 'bg-pink-100 text-pink-700' },
  similar_profile: { icon: 'User', color: 'bg-gray-100 text-gray-700' }
};

export default function ConnectionRecommendationsWidget({ maxItems = 5 }) {
  const { 
    recommendations, 
    isLoading, 
    dismiss, 
    isDismissing,
    refresh 
  } = useConnectionRecommendations();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center py-8">
          <Icon.Spinner size={32} className="text-[#7CB342]" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Icon.Users size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có gợi ý kết nối</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => refresh()}
          >
            <Icon.RefreshCw size={14} className="mr-2" />
            Làm mới
          </Button>
        </div>
      </div>
    );
  }

  const displayItems = recommendations.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon.Sparkles size={20} className="text-[#7CB342]" />
          <h3 className="font-semibold text-gray-900">Gợi ý kết nối</h3>
          <Badge variant="outline" className="bg-[#7CB342]/10 text-[#7CB342]">
            {recommendations.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => refresh()}
        >
          <Icon.RefreshCw size={14} />
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="divide-y">
        <AnimatePresence>
          {displayItems.map((rec, idx) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              index={idx}
              onDismiss={() => dismiss(rec.id)}
              isDismissing={isDismissing}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* View All */}
      {recommendations.length > maxItems && (
        <div className="p-3 border-t text-center">
          <Link 
            to={createPageUrl('MyEcard') + '?tab=recommendations'}
            className="text-sm text-[#7CB342] hover:underline"
          >
            Xem tất cả {recommendations.length} gợi ý
          </Link>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation, index, onDismiss, isDismissing }) {
  const { 
    recommended_name, 
    recommended_avatar, 
    recommended_title, 
    recommended_company,
    recommended_slug,
    score, 
    match_reasons 
  } = recommendation;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link to={createPageUrl('EcardView') + `?slug=${recommended_slug}`}>
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={recommended_avatar} />
            <AvatarFallback className="bg-[#7CB342]/10 text-[#7CB342]">
              {getInitials(recommended_name)}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link 
                to={createPageUrl('EcardView') + `?slug=${recommended_slug}`}
                className="font-medium text-gray-900 hover:text-[#7CB342] transition-colors"
              >
                {recommended_name}
              </Link>
              {recommended_title && (
                <p className="text-sm text-gray-500 truncate">
                  {recommended_title}
                  {recommended_company && ` • ${recommended_company}`}
                </p>
              )}
            </div>

            {/* Match Score */}
            <div className="flex items-center gap-1 bg-[#7CB342]/10 px-2 py-1 rounded-full">
              <Icon.Target size={12} className="text-[#7CB342]" />
              <span className="text-xs font-medium text-[#7CB342]">{score}%</span>
            </div>
          </div>

          {/* Match Reasons */}
          {match_reasons && match_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {match_reasons.slice(0, 3).map((reason, idx) => {
                const config = REASON_CONFIG[reason.type] || REASON_CONFIG.similar_profile;
                const ReasonIcon = Icon[config.icon];
                
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.color}`}
                  >
                    {ReasonIcon && <ReasonIcon size={10} />}
                    {reason.value || reason.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Link to={createPageUrl('EcardView') + `?slug=${recommended_slug}`}>
              <Button size="sm" className="bg-[#7CB342] hover:bg-[#689F38] text-white h-8">
                <Icon.UserPlus size={14} className="mr-1" />
                Kết nối
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-gray-600 h-8"
              onClick={onDismiss}
              disabled={isDismissing}
            >
              <Icon.X size={14} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { RecommendationCard };