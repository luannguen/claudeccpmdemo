import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Award, ShoppingBag, TrendingUp, ChevronRight } from "lucide-react";
import { tierColors, tierLabels } from "@/components/hooks/useMyProfile";

export default function ProfileSidebar({ user, userProfile, loyalty, myTenant }) {
  const loyaltyTier = loyalty?.tier || 'bronze';
  
  // Avatar có thể ở user (từ User entity) hoặc userProfile (từ UserProfile entity)
  const avatarUrl = user?.avatar_url || userProfile?.avatar_url;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.full_name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <h2 className="text-xl font-bold">{user?.full_name}</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        <Link
          to={createPageUrl(`UserProfile?user=${user?.email}`)}
          className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <User className="w-5 h-5" />
          Profile Cộng Đồng
        </Link>

        <div className={`bg-gradient-to-r ${tierColors[loyaltyTier]} text-white rounded-xl p-4 mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Hạng Thành Viên</span>
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{tierLabels[loyaltyTier]}</p>
          <p className="text-xs opacity-90 mt-1">{loyalty?.total_points || 0} điểm</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <ShoppingBag className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{loyalty?.total_orders_platform || 0}</p>
            <p className="text-xs text-gray-600">Đơn hàng</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">
              {((loyalty?.total_spent_platform || 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-600">Đã mua</p>
          </div>
        </div>
      </div>

      {myTenant && (
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-90">Shop Owner</p>
              <p className="font-bold">{myTenant.organization_name}</p>
            </div>
          </div>
          <Link to={createPageUrl(`ShopDashboard?tenant=${myTenant.id}`)} className="block w-full bg-white text-purple-600 py-3 rounded-xl font-medium text-center hover:bg-gray-100 transition-colors">
            Quản Lý Shop →
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold mb-4">Liên Kết Nhanh</h3>
        <div className="space-y-2">
          <Link to={createPageUrl('MyOrders')} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-sm">Đơn hàng của tôi</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to={createPageUrl('Services')} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-sm">Sản phẩm</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to={createPageUrl('Community')} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-sm">Cộng đồng</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}