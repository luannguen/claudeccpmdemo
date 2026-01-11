/**
 * ReferralAchievements - Gamification achievements system
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { motion } from 'framer-motion';


const ACHIEVEMENTS = [
  {
    id: 'first_referral',
    icon: 'Star',
    title: 'Người Đầu Tiên',
    description: 'Giới thiệu khách hàng đầu tiên',
    requirement: (member) => member.total_referred_customers >= 1,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'five_referrals',
    icon: 'Users',
    title: 'Bạn Có Duyên',
    description: 'Giới thiệu 5 khách hàng',
    requirement: (member) => member.total_referred_customers >= 5,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'ten_referrals',
    icon: 'Trophy',
    title: 'Chuyên Gia Giới Thiệu',
    description: 'Giới thiệu 10 khách hàng',
    requirement: (member) => member.total_referred_customers >= 10,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'first_million',
    icon: 'DollarSign',
    title: 'Triệu Đầu Tiên',
    description: 'Doanh số đạt 1 triệu đồng',
    requirement: (member) => member.total_referral_revenue >= 1000000,
    color: 'from-green-600 to-emerald-600'
  },
  {
    id: 'ten_million',
    icon: 'Sparkles',
    title: 'Bạc Tỷ',
    description: 'Doanh số đạt 10 triệu đồng',
    requirement: (member) => member.total_referral_revenue >= 10000000,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'hundred_million',
    icon: 'Award',
    title: 'Đại Gia',
    description: 'Doanh số đạt 100 triệu đồng',
    requirement: (member) => member.total_referral_revenue >= 100000000,
    color: 'from-indigo-600 to-purple-600'
  },
  {
    id: 'monthly_top_3',
    icon: 'Zap',
    title: 'Top Tháng',
    description: 'Lọt Top 3 trong tháng',
    requirement: (member, allMembers) => {
      const sorted = [...allMembers].sort((a, b) => 
        (b.current_month_revenue || 0) - (a.current_month_revenue || 0)
      );
      return sorted.findIndex(m => m.id === member.id) < 3;
    },
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'perfect_month',
    icon: 'Heart',
    title: 'Tháng Hoàn Hảo',
    description: '30+ đơn trong 1 tháng',
    requirement: (member, allMembers, events) => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthEvents = events.filter(e => 
        e.referrer_id === member.id && e.period_month === thisMonth
      );
      return monthEvents.length >= 30;
    },
    color: 'from-pink-500 to-rose-500'
  }
];

function AchievementBadge({ achievement, unlocked }) {
  const IconComponent = Icon[achievement.icon] || Icon.Star;
  
  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className={`relative p-6 rounded-2xl text-center ${
        unlocked 
          ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg`
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      {unlocked && (
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Icon.CheckCircle size={24} className="text-green-500 bg-white rounded-full" />
        </motion.div>
      )}
      
      <div className="mb-3">
        <IconComponent size={48} className="mx-auto" />
      </div>
      <h4 className="font-bold text-sm mb-1">{achievement.title}</h4>
      <p className="text-xs opacity-80">{achievement.description}</p>
    </motion.div>
  );
}

export default function ReferralAchievements({ member, allMembers = [], events = [] }) {
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: achievement.requirement(member, allMembers, events)
    }));
  }, [member, allMembers, events]);
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = Math.round((unlockedCount / achievements.length) * 100);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon.Award size={20} className="text-amber-500" />
            Thành Tựu ({unlockedCount}/{achievements.length})
          </CardTitle>
          <Badge className="bg-amber-500 text-white">
            {progress}% Hoàn thành
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={achievement.unlocked}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}