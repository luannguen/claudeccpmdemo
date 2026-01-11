import React from "react";
import { motion } from "framer-motion";
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, 
  Users, Star, Percent, Wallet 
} from "lucide-react";

const formatCurrency = (amount) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export default function ShopDetailStats({ 
  productsCount = 0, 
  ordersCount = 0, 
  totalRevenue = 0, 
  totalCommission = 0,
  pendingCommission = 0,
  shopRevenue = 0,
  customersCount = 0,
  averageRating = 0
}) {
  const stats = [
    { 
      label: "Sản phẩm", 
      value: productsCount, 
      icon: Package, 
      color: "blue",
      format: "number"
    },
    { 
      label: "Đơn hàng", 
      value: ordersCount, 
      icon: ShoppingCart, 
      color: "green",
      format: "number"
    },
    { 
      label: "Tổng doanh thu", 
      value: totalRevenue, 
      icon: DollarSign, 
      color: "purple",
      format: "currency"
    },
    { 
      label: "Shop nhận", 
      value: shopRevenue, 
      icon: Wallet, 
      color: "emerald",
      format: "currency"
    },
    { 
      label: "Commission đã trả", 
      value: totalCommission, 
      icon: TrendingUp, 
      color: "orange",
      format: "currency"
    },
    { 
      label: "Commission chờ", 
      value: pendingCommission, 
      icon: Percent, 
      color: "amber",
      format: "currency"
    },
    { 
      label: "Khách hàng", 
      value: customersCount, 
      icon: Users, 
      color: "indigo",
      format: "number"
    },
    { 
      label: "Đánh giá TB", 
      value: averageRating, 
      icon: Star, 
      color: "yellow",
      format: "rating"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[stat.color]}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stat.format === "currency" ? formatCurrency(stat.value) : 
             stat.format === "rating" ? stat.value.toFixed(1) : 
             stat.value.toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}