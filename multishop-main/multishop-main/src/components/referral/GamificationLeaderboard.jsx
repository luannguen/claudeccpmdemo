/**
 * GamificationLeaderboard - Realtime leaderboard với animations
 * UI Layer - Presentation only
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLeaderboard } from '@/components/hooks/useReferralGamification';
import { motion } from 'framer-motion';

const MEDAL_COLORS = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-400 to-orange-600'
};

function LeaderboardItem({ item, currentUserEmail }) {
  const isMe = item.email === currentUserEmail;
  const medal = item.rank <= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: item.rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl ${
        isMe ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300' : 'bg-white hover:bg-gray-50'
      } transition-all`}
    >
      <div className="flex items-center gap-3 flex-1">
        {medal ? (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${MEDAL_COLORS[item.rank]} flex items-center justify-center shadow-lg`}>
            <Icon.Trophy size={20} className="text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
            {item.rank}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{item.name}</p>
            {isMe && <Badge className="bg-amber-500">Bạn</Badge>}
          </div>
          <p className="text-xs text-gray-500">{item.code}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">
          {(item.revenue / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-gray-500">{item.customers} khách</p>
      </div>
    </motion.div>
  );
}

export default function GamificationLeaderboard({ currentUserEmail }) {
  const [period, setPeriod] = React.useState('all');
  const { data: leaderboard = [], isLoading } = useLeaderboard(period);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.Trophy size={24} className="text-amber-500" />
          Bảng Xếp Hạng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={setPeriod} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="month">Tháng này</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon.Trophy size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Chưa có dữ liệu xếp hạng</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 20).map(item => (
              <LeaderboardItem 
                key={item.id} 
                item={item} 
                currentUserEmail={currentUserEmail}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}