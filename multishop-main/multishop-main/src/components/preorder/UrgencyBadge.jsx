/**
 * UrgencyBadge - Badge hiển thị độ khẩn cấp của lot
 * UI Layer - Presentation only
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  Flame, Clock, AlertTriangle, TrendingUp, 
  Sparkles, Zap, Users, Calendar 
} from "lucide-react";

export default function UrgencyBadge({ 
  type, // "low_stock" | "price_increase" | "ending_soon" | "popular" | "new" | "last_chance"
  value, // Giá trị hiển thị (vd: % còn lại, số ngày, % tăng giá)
  className = ""
}) {
  const configs = {
    low_stock: {
      icon: AlertTriangle,
      text: value ? `Còn ${value}%` : 'SẮP HẾT',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      animate: true
    },
    price_increase: {
      icon: TrendingUp,
      text: value ? `+${value}%` : 'Giá tăng',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      animate: false
    },
    ending_soon: {
      icon: Clock,
      text: value ? `Còn ${value} ngày` : 'Sắp kết thúc',
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
      animate: true
    },
    popular: {
      icon: Flame,
      text: value ? `${value} người đã đặt` : 'Bán chạy',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      animate: false
    },
    new: {
      icon: Sparkles,
      text: 'MỚI',
      bgColor: 'bg-purple-500',
      textColor: 'text-white',
      animate: false
    },
    last_chance: {
      icon: Zap,
      text: 'CƠ HỘI CUỐI',
      bgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      textColor: 'text-white',
      animate: true
    },
    preorder: {
      icon: Calendar,
      text: 'BÁN TRƯỚC',
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-white',
      animate: false
    }
  };

  const config = configs[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.span
      animate={config.animate ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className={`${config.bgColor} ${config.textColor} px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </motion.span>
  );
}

/**
 * UrgencyBadgeStack - Stack nhiều badge
 */
export function UrgencyBadgeStack({ 
  lot, 
  className = "",
  maxBadges = 3 
}) {
  const badges = [];

  // Calculate values
  const daysUntilHarvest = lot.estimated_harvest_date 
    ? Math.ceil((new Date(lot.estimated_harvest_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  const availablePercent = lot.total_yield > 0 
    ? (lot.available_quantity / lot.total_yield) * 100 
    : 100;
  
  const priceIncrease = lot.initial_price && lot.current_price && lot.initial_price > 0
    ? ((lot.current_price - lot.initial_price) / lot.initial_price * 100).toFixed(0)
    : 0;

  // Pre-order badge always shows
  badges.push({ type: 'preorder' });

  // Low stock
  if (availablePercent <= 20 && availablePercent > 0) {
    badges.push({ type: 'low_stock', value: Math.round(availablePercent) });
  }

  // Ending soon
  if (daysUntilHarvest !== null && daysUntilHarvest > 0 && daysUntilHarvest <= 7) {
    badges.push({ type: 'ending_soon', value: daysUntilHarvest });
  }

  // Price increase
  if (priceIncrease > 0) {
    badges.push({ type: 'price_increase', value: priceIncrease });
  }

  // Last chance (both low stock and ending soon)
  if (availablePercent <= 10 && daysUntilHarvest <= 3) {
    // Replace with last_chance
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <UrgencyBadge type="last_chance" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {badges.slice(0, maxBadges).map((badge, i) => (
        <UrgencyBadge key={i} type={badge.type} value={badge.value} />
      ))}
    </div>
  );
}