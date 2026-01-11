import React from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, Package, Users, Heart,
  TrendingUp, TrendingDown, AlertCircle, Award
} from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";

export default function DashboardKPICards({ analytics, wishlistStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <DollarSign className="w-6 h-6" />
          </motion.div>
          <span className={`flex items-center text-sm font-medium ${
            analytics.revenueGrowth >= 0 ? 'text-white' : 'text-red-200'
          }`}>
            {analytics.revenueGrowth >= 0 ? <Icon.TrendingUp size={16} /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(analytics.revenueGrowth).toFixed(1)}%
          </span>
        </div>
        <p className="text-white/80 text-sm mb-1">Tổng Doanh Thu</p>
        <p className="text-3xl font-bold">
          {analytics.totalRevenue.toLocaleString('vi-VN')}đ
        </p>
        <p className="text-white/60 text-xs mt-2">
          Trung bình: {analytics.avgOrderValue.toLocaleString('vi-VN')}đ/đơn
        </p>
      </motion.div>

      {/* Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, y: -2 }}
          >
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </motion.div>
          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
            {analytics.pendingOrders} chờ
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-1">Tổng Đơn Hàng</p>
        <p className="text-3xl font-bold text-[#0F0F0F]">{analytics.totalOrders}</p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-green-600">✓ {analytics.deliveredOrders}</span>
          <span className="text-red-600">✗ {analytics.cancelledOrders}</span>
          <span className="text-gray-500">
            {analytics.totalOrders > 0 ? ((analytics.deliveredOrders / analytics.totalOrders) * 100).toFixed(0) : 0}% thành công
          </span>
        </div>
      </motion.div>

      {/* Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <Package className="w-6 h-6 text-purple-600" />
          </motion.div>
          {analytics.lowStockProducts > 0 && (
            <motion.span 
              className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon.AlertCircle size={12} />
              {analytics.lowStockProducts}
            </motion.span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-1">Tổng Sản Phẩm</p>
        <p className="text-3xl font-bold text-[#0F0F0F]">{analytics.totalProducts}</p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-green-600">{analytics.activeProducts} hoạt động</span>
          <span className="text-red-600">{analytics.outOfStockProducts} hết hàng</span>
        </div>
      </motion.div>

      {/* Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Users className="w-6 h-6 text-orange-600" />
          </motion.div>
          <span className="flex items-center text-green-600 text-sm font-medium">
            <Icon.TrendingUp size={16} />
            +{analytics.newCustomers}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-1">Khách Hàng</p>
        <p className="text-3xl font-bold text-[#0F0F0F]">{analytics.totalCustomers}</p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-purple-600 flex items-center gap-1">
            <Icon.Award size={12} />
            {analytics.vipCustomers} VIP
          </span>
          <span className="text-gray-500">{analytics.conversionRate.toFixed(1)}% conversion</span>
        </div>
      </motion.div>

      {/* Wishlist */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Icon.Heart size={24} />
          </motion.div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Yêu Thích</span>
        </div>
        <p className="text-white/80 text-sm mb-1">Tổng Yêu Thích</p>
        <p className="text-3xl font-bold mb-2">{wishlistStats.total}</p>
        <p className="text-white/60 text-xs mt-2">{wishlistStats.unique_products} sản phẩm unique</p>
      </motion.div>
    </div>
  );
}