/**
 * SmartNotificationPanel - Smart notifications for milestones
 * UI Layer - Presentation only
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SmartNotificationPanel({ member, events }) {
  const [notifications, setNotifications] = React.useState([]);
  
  useEffect(() => {
    const smartNotifs = [];
    
    // Near milestone
    const revenue = member.total_referral_revenue || 0;
    if (revenue >= 900000 && revenue < 1000000) {
      smartNotifs.push({
        id: 'near-million',
        type: 'goal',
        icon: 'Target',
        title: 'Sắp đạt Triệu Đầu Tiên!',
        message: `Chỉ còn ${(1000000 - revenue).toLocaleString('vi-VN')}đ nữa thôi!`,
        action: 'share_more'
      });
    }
    
    // Inactive customers
    const customers = member.total_referred_customers || 0;
    const withOrders = member.f1_with_purchases || 0;
    const inactive = customers - withOrders;
    
    if (inactive >= 3) {
      smartNotifs.push({
        id: 'inactive-customers',
        type: 'reminder',
        icon: 'AlertCircle',
        title: `${inactive} khách chưa mua hàng`,
        message: 'Hãy liên hệ và hỗ trợ họ đặt đơn đầu tiên!',
        action: 'view_customers'
      });
    }
    
    // Perfect streak
    const thisMonthOrders = events.filter(e => {
      const month = new Date().toISOString().slice(0, 7);
      return e.period_month === month;
    });
    
    if (thisMonthOrders.length >= 5) {
      const allSuccess = thisMonthOrders.every(e => e.status === 'calculated' || e.status === 'paid');
      if (allSuccess) {
        smartNotifs.push({
          id: 'perfect-month',
          type: 'celebration',
          icon: 'Sparkles',
          title: 'Tháng Hoàn Hảo!',
          message: `${thisMonthOrders.length} đơn thành công, không lỗi!`,
          action: null
        });
      }
    }
    
    setNotifications(smartNotifs);
  }, [member, events]);
  
  const handleClick = (notif) => {
    if (notif.type === 'celebration') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {notifications.map(notif => {
          const IconComp = Icon[notif.icon] || Icon.Bell;
          const config = {
            goal: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
            reminder: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
            celebration: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' }
          };
          
          const style = config[notif.type] || config.reminder;
          
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => handleClick(notif)}
              className={`p-4 rounded-xl border-2 ${style.bg} ${style.border} cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <IconComp size={24} className={style.text} />
                <div className="flex-1">
                  <p className={`font-semibold ${style.text}`}>{notif.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}