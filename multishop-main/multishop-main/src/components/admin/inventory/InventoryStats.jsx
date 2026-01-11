import React from "react";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

export default function InventoryStats({ productsCount, lowStockCount, logsCount }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-1">Tổng Sản Phẩm</p>
        <p className="text-2xl font-bold text-[#0F0F0F]">{productsCount}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-1">Sắp Hết Hàng</p>
        <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-1">Giao Dịch</p>
        <p className="text-2xl font-bold text-[#0F0F0F]">{logsCount}</p>
      </div>
    </div>
  );
}