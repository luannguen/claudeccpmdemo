/**
 * MilestoneTracker - Track và hiển thị milestones
 * UI Layer - Presentation only
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useMyAchievements, useCheckMilestones } from '@/components/hooks/useReferralGamification';
import { MILESTONES } from '@/components/services/ReferralGamificationService';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

function MilestoneCard({ milestone, isUnlocked, progress = 0 }) {
  const IconComponent = Icon[milestone.icon] || Icon.Star;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isUnlocked 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isUnlocked ? 'bg-amber-500' : 'bg-gray-200'
        }`}>
          <IconComponent size={24} className={isUnlocked ? 'text-white' : 'text-gray-400'} />
        </div>
        
        {isUnlocked && (
          <Badge className="bg-green-500">
            <Icon.Check size={12} className="mr-1" />
            Hoàn thành
          </Badge>
        )}
      </div>
      
      <h4 className="font-semibold mb-1">{milestone.title}</h4>
      <p className="text-xs text-gray-500 mb-2">
        Thưởng: {milestone.reward.toLocaleString('vi-VN')}đ
      </p>
      
      {!isUnlocked && progress > 0 && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">{progress}% hoàn thành</p>
        </div>
      )}
    </motion.div>
  );
}

export default function MilestoneTracker({ member }) {
  const { data: achievements = [] } = useMyAchievements(member.user_email);
  const checkMilestones = useCheckMilestones();
  
  // Auto-check on mount
  useEffect(() => {
    if (member?.id) {
      checkMilestones.mutate(member.id);
    }
  }, [member?.id]);
  
  const unlockedIds = achievements.map(a => a.achievement_id);
  
  const getProgress = (milestone) => {
    switch (milestone.id) {
      case 'first_customer':
      case 'five_customers':
        const customers = member.total_referred_customers || 0;
        return Math.min(100, (customers / milestone.threshold) * 100);
      
      case 'first_million':
      case 'ten_million':
        const revenue = member.total_referral_revenue || 0;
        return Math.min(100, (revenue / milestone.threshold) * 100);
      
      default:
        return 0;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.Award size={24} className="text-purple-600" />
          Thành Tựu & Mốc Quan Trọng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {MILESTONES.map(milestone => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isUnlocked={unlockedIds.includes(milestone.id)}
              progress={getProgress(milestone)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}