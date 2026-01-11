import React from 'react';
import { TrendingUp, Package, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PopularLotsTable({ popularLots, topSellingLots }) {
  if (!popularLots?.length && !topSellingLots?.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Lot Phổ Biến
        </h3>
        <div className="text-center py-8 text-gray-500">
          Chưa có dữ liệu lot
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Top Lot Bán Chạy
        </h3>
        <Link 
          to={createPageUrl('AdminProductLots')}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-3 font-medium">Lot</th>
              <th className="pb-3 font-medium text-center">Đã Bán</th>
              <th className="pb-3 font-medium text-right">Doanh Thu</th>
              <th className="pb-3 font-medium text-center">Thu Hoạch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {popularLots.map((lot, index) => (
              <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{lot.name}</p>
                      <p className="text-xs text-gray-500">{lot.productName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-gray-900">{lot.soldQuantity}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="font-bold text-green-600">
                    {lot.revenue >= 1000000 
                      ? `${(lot.revenue / 1000000).toFixed(1)}M`
                      : `${(lot.revenue / 1000).toFixed(0)}K`
                    }
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {formatDate(lot.harvestDate)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Tổng đã bán</p>
          <p className="font-bold text-gray-900">
            {popularLots.reduce((sum, l) => sum + l.soldQuantity, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tổng doanh thu</p>
          <p className="font-bold text-green-600">
            {(popularLots.reduce((sum, l) => sum + l.revenue, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">TB/Lot</p>
          <p className="font-bold text-amber-600">
            {popularLots.length > 0 
              ? Math.round(popularLots.reduce((sum, l) => sum + l.soldQuantity, 0) / popularLots.length)
              : 0
            }
          </p>
        </div>
      </div>
    </div>
  );
}