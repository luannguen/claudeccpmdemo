/**
 * SeederRankProgress Component
 * UI Layer - Displays seeder rank progression with visual tree
 * 
 * @module features/referral/ui/member
 */

import React from 'react';
import { CheckCircle, Lock, Sprout, Leaf, TreeDeciduous, Award as AwardIcon, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RANK_ORDER, RANK_CONFIG } from '../../types';

const RANK_ICONS = {
  nguoi_gieo_hat: Sprout,
  hat_giong_khoe: Sprout,
  mam_khoe: Leaf,
  choi_khoe: Leaf,
  canh_khoe: TreeDeciduous,
  cay_khoe: TreeDeciduous,
  danh_hieu: Crown
};

const RANK_GRADIENTS = {
  nguoi_gieo_hat: 'from-gray-200 to-gray-300',
  hat_giong_khoe: 'from-green-300 to-green-400',
  mam_khoe: 'from-lime-300 to-lime-400',
  choi_khoe: 'from-emerald-300 to-emerald-400',
  canh_khoe: 'from-teal-300 to-teal-400',
  cay_khoe: 'from-amber-300 to-amber-400',
  danh_hieu: 'from-purple-400 to-purple-500'
};

function RankNode({ rankKey, config, isCurrentRank, isAchieved, isNext, member }) {
  const Icon = RANK_ICONS[rankKey] || Sprout;
  const gradient = RANK_GRADIENTS[rankKey] || 'from-gray-200 to-gray-300';
  const display = RANK_CONFIG[rankKey];
  
  // Calculate progress for next rank
  let progress = 0;
  let progressText = '';
  
  if (isNext && config) {
    const f1Required = config.f1_required || 0;
    const f1RankRequired = config.f1_rank_required;
    
    if (f1RankRequired) {
      const f1CountAtRank = member[`f1_at_${f1RankRequired}`] || 0;
      progress = Math.min(100, (f1CountAtRank / f1Required) * 100);
      progressText = `${f1CountAtRank}/${f1Required} F1`;
    } else if (f1Required > 0) {
      const f1WithPurchases = member.f1_with_purchases || 0;
      progress = Math.min(100, (f1WithPurchases / f1Required) * 100);
      progressText = `${f1WithPurchases}/${f1Required} F1`;
    }
  }
  
  return (
    <div className={`relative flex flex-col items-center ${isCurrentRank ? 'scale-110 z-10' : ''}`}>
      <div className={`
        relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
        ${isAchieved ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-gray-100'}
        ${isCurrentRank ? 'ring-4 ring-offset-2 ring-green-400 animate-pulse' : ''}
        ${isNext ? 'border-2 border-dashed border-gray-300' : ''}
      `}>
        {isAchieved ? (
          <Icon className="w-7 h-7 text-white drop-shadow" />
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
        
        {isAchieved && !isCurrentRank && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
        
        {isCurrentRank && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <AwardIcon className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <div className={`mt-2 text-center ${isCurrentRank ? 'font-bold' : ''}`}>
        <p className={`text-xs ${isAchieved ? display.color : 'text-gray-400'}`}>
          {config?.label || display.label}
        </p>
        {config?.bonus > 0 && (
          <Badge variant="outline" className={`mt-1 text-[10px] ${isAchieved ? display.color.replace('text-', 'bg-') : 'bg-gray-50'}`}>
            +{config.bonus}%
          </Badge>
        )}
      </div>
      
      {isNext && progress > 0 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 text-center">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1">{progressText}</p>
        </div>
      )}
    </div>
  );
}

export default function SeederRankProgress({ member, rankConfig }) {
  if (!member || !rankConfig) return null;
  
  const currentRankIndex = RANK_ORDER.indexOf(member.seeder_rank || 'nguoi_gieo_hat');
  const currentRankDisplay = RANK_CONFIG[member.seeder_rank] || RANK_CONFIG.nguoi_gieo_hat;
  const currentConfig = rankConfig[member.seeder_rank] || rankConfig.nguoi_gieo_hat;
  
  return (
    <div className="py-6">
      <div className="relative">
        <div className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-gray-200 via-green-300 to-gray-200 rounded-full" />
        
        <div 
          className="absolute top-8 left-8 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.max(0, (currentRankIndex / (RANK_ORDER.length - 1)) * 100)}%`,
            maxWidth: 'calc(100% - 4rem)'
          }}
        />
        
        <div className="relative flex justify-between items-start px-4">
          {RANK_ORDER.map((rankKey, index) => (
            <RankNode
              key={rankKey}
              rankKey={rankKey}
              config={rankConfig[rankKey]}
              isCurrentRank={index === currentRankIndex}
              isAchieved={index <= currentRankIndex}
              isNext={index === currentRankIndex + 1}
              member={member}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-12 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${RANK_GRADIENTS[member.seeder_rank] || 'from-gray-200 to-gray-300'} flex items-center justify-center shadow-lg`}>
            {(() => {
              const CurrentIcon = RANK_ICONS[member.seeder_rank] || Sprout;
              return <CurrentIcon className="w-7 h-7 text-white" />;
            })()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Cấp bậc hiện tại</p>
            <p className="text-xl font-bold text-green-700">
              {currentConfig?.label || 'Người Gieo Hạt'}
            </p>
            {member.seeder_rank_bonus > 0 && (
              <p className="text-sm text-green-600">
                Bonus hoa hồng: +{member.seeder_rank_bonus}%
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">F1 đã mua hàng</p>
            <p className="text-2xl font-bold text-green-600">{member.f1_with_purchases || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}