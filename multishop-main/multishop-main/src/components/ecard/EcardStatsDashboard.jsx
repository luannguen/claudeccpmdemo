/**
 * EcardStatsDashboard - Compact stats bar cho E-Card
 * UPDATED: Lấy dữ liệu thật từ database (profile, connections, gifts)
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";

export default function EcardStatsDashboard({ profile }) {
  // Fetch real-time connection count
  const { data: connectionsCount = 0 } = useQuery({
    queryKey: ['ecard-connections-count', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return 0;
      const connections = await base44.entities.UserConnection.filter({ 
        initiator_user_id: profile.user_id,
        status: 'accepted'
      });
      return connections?.length || 0;
    },
    enabled: !!profile?.user_id,
    staleTime: 60 * 1000 // 1 minute cache
  });

  // Fetch real-time gifts received count
  const { data: giftsCount = 0 } = useQuery({
    queryKey: ['ecard-gifts-count', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return 0;
      const gifts = await base44.entities.GiftTransaction.filter({ 
        receiver_user_id: profile.user_id
      });
      return gifts?.length || 0;
    },
    enabled: !!profile?.user_id,
    staleTime: 60 * 1000
  });

  const stats = [
    { value: profile?.view_count || 0, label: 'Lượt xem', IconComp: Icon.Eye, color: 'text-blue-500' },
    { value: connectionsCount, label: 'Kết nối', IconComp: Icon.Users, color: 'text-green-500' },
    { value: giftsCount, label: 'Quà nhận', IconComp: Icon.Gift, color: 'text-purple-500' },
    { value: profile?.share_count || 0, label: 'Chia sẻ', IconComp: Icon.Share, color: 'text-orange-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm flex-shrink-0"
        >
          <stat.IconComp size={16} className={stat.color} />
          <span className="font-semibold text-gray-900">{stat.value}</span>
          <span className="text-xs text-gray-500 hidden sm:inline">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}