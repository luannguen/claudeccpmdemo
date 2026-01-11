import React from "react";
import { Zap, Heart } from "lucide-react";

export default function DashboardTopProducts({ topProducts, wishlistStats, products }) {
  return (
    <>
      {/* Top Selling Products */}
      <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F0F0F]">Sản Phẩm Bán Chạy</h3>
          <Zap className="w-5 h-5 text-[#FF9800]" />
        </div>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.quantity} đã bán</p>
              </div>
              <span className="text-sm font-bold text-[#7CB342]">
                {product.revenue.toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Wishlisted Products */}
      <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F0F0F]">Sản Phẩm Yêu Thích</h3>
          <Heart className="w-5 h-5 text-red-500 fill-current" />
        </div>
        {wishlistStats.top.length > 0 ? (
          <div className="space-y-4">
            {wishlistStats.top.map((item, index) => {
              const product = (products || []).find(p => p.id === item.product_id);
              const productName = product?.name || 'Sản phẩm không rõ';
              return (
                <div key={item.product_id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{productName}</p>
                    <p className="text-xs text-gray-500">{item.wishlist_count} lượt yêu thích</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu sản phẩm yêu thích.</p>
          </div>
        )}
      </div>
    </>
  );
}