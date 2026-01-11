/**
 * ReferralLeaderboard - Bảng xếp hạng người giới thiệu
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { motion } from 'framer-motion';

const MEDAL_COLORS = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-gray-400 to-slate-500',
  3: 'from-orange-400 to-amber-600'
};

function LeaderboardItem({ member, rank, isCurrentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl ${
        isCurrentUser ? 'bg-amber-50 border-2 border-amber-300' : 'bg-gray-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
        rank <= 3 
          ? `bg-gradient-to-br ${MEDAL_COLORS[rank]} text-white shadow-lg`
          : 'bg-white text-gray-600'
      }`}>
        {rank <= 3 ? <Icon.Trophy size={24} /> : `#${rank}`}
      </div>
      
      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
        <span className="text-xl font-bold text-white">
          {member.full_name?.charAt(0)?.toUpperCase()}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{member.full_name}</p>
          {isCurrentUser && (
            <Badge className="bg-amber-500 text-white">Bạn</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">{member.referral_code}</p>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">
          {((member.total_referral_revenue || 0) / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-gray-500">{member.total_referred_customers || 0} khách</p>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-bold text-amber-600">
          {((member.unpaid_commission || 0) + (member.total_paid_commission || 0)) / 1000}K
        </p>
        <p className="text-xs text-gray-500">Hoa hồng</p>
      </div>
    </motion.div>
  );
}

export default function ReferralLeaderboard({ members, currentUserEmail, period = 'all' }) {
  const sortedMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => (b.total_referral_revenue || 0) - (a.total_referral_revenue || 0))
      .slice(0, 20);
  }, [members, period]);
  
  const currentUserRank = sortedMembers.findIndex(m => m.user_email === currentUserEmail) + 1;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon.Trophy size={20} className="text-amber-500" />
            Bảng Xếp Hạng
          </CardTitle>
          {currentUserRank > 0 && (
            <Badge className="bg-amber-500 text-white">
              Hạng #{currentUserRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedMembers.map((member, index) => (
            <LeaderboardItem
              key={member.id}
              member={member}
              rank={index + 1}
              isCurrentUser={member.user_email === currentUserEmail}
            />
          ))}
          
          {sortedMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon.Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}