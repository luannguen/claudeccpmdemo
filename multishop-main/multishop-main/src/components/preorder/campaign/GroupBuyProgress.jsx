/**
 * GroupBuyProgress - Progress bar cho group buy campaign
 * UI Layer
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

export default function GroupBuyProgress({ campaign }) {
  if (!campaign?.group_buy_config) return null;

  const config = campaign.group_buy_config;
  const progress = config.threshold_orders > 0 
    ? (config.current_orders / config.threshold_orders) * 100 
    : 0;
  const remaining = Math.max(0, config.threshold_orders - config.current_orders);
  const isUnlocked = config.is_unlocked;

  React.useEffect(() => {
    if (isUnlocked && progress >= 100) {
      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isUnlocked]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${
        isUnlocked 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
      }`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isUnlocked ? 'bg-green-500' : 'bg-purple-500'
            }`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Group Buy</h3>
              <p className="text-xs text-gray-600">Mua cùng nhau - Giảm giá nhiều hơn!</p>
            </div>
          </div>

          <AnimatePresence>
            {isUnlocked && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">Mở khóa!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              {config.current_orders}/{config.threshold_orders} đơn
            </span>
            {!isUnlocked && (
              <span className="text-purple-700 font-semibold">
                Còn {remaining} đơn nữa!
              </span>
            )}
          </div>
          
          <Progress 
            value={progress} 
            className={`h-3 ${
              isUnlocked ? 'bg-green-200' : 'bg-purple-200'
            }`}
          />
        </div>

        {/* Bonus info */}
        {config.bonus_type && (
          <div className={`p-4 rounded-xl ${
            isUnlocked ? 'bg-green-100' : 'bg-white/70'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Gift className={`w-5 h-5 ${
                isUnlocked ? 'text-green-600' : 'text-purple-600'
              }`} />
              <span className={`font-semibold ${
                isUnlocked ? 'text-green-900' : 'text-purple-900'
              }`}>
                {isUnlocked ? 'Ưu đãi đã mở khóa!' : 'Ưu đãi khi đủ người:'}
              </span>
            </div>
            
            <p className={`text-lg font-bold ${
              isUnlocked ? 'text-green-700' : 'text-purple-700'
            }`}>
              {config.bonus_type === 'discount_percent' && `Giảm ${config.bonus_value}%`}
              {config.bonus_type === 'discount_fixed' && `Giảm ${config.bonus_value.toLocaleString()}đ`}
              {config.bonus_type === 'free_shipping' && 'Miễn phí vận chuyển'}
              {config.bonus_type === 'bonus_quantity' && `Tặng thêm ${config.bonus_value}%`}
            </p>

            {config.unlock_message && (
              <p className="text-sm text-gray-700 mt-2">{config.unlock_message}</p>
            )}
          </div>
        )}

        {/* Live participants */}
        {config.progress_visible && config.current_orders > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>
              {config.current_orders} người đã tham gia
              {!isUnlocked && ` - Chỉ cần ${remaining} người nữa!`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}