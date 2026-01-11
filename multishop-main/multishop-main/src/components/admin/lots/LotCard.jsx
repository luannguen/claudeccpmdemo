import React from "react";
import { TrendingUp, Eye, Edit, Trash2 } from "lucide-react";
import { getLotStatusColor, getLotStatusText, getDaysUntilHarvest, getSoldPercentage } from "@/components/hooks/useAdminProductLots";

export default function LotCard({ lot, onEdit, onDelete, onPreview }) {
  const daysUntilHarvest = getDaysUntilHarvest(lot.estimated_harvest_date);
  const soldPercentage = getSoldPercentage(lot);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">{lot.lot_name}</h3>
              {lot.lot_code && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {lot.lot_code}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{lot.product_name}</p>
            {lot.available_quantity < (lot.moq || 1) && lot.available_quantity > 0 && (
              <p className="text-xs text-yellow-600 font-medium mt-1">
                ⚠️ Dưới MOQ ({lot.available_quantity}/{lot.moq})
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLotStatusColor(lot.status)}`}>
            {getLotStatusText(lot.status)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              Đã bán: {lot.sold_quantity || 0}/{lot.total_yield}
            </span>
            <span className="font-medium">{soldPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] h-2 rounded-full transition-all"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">Giá hiện tại</div>
            <div className="font-bold text-[#7CB342]">
              {lot.current_price?.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Giá trần</div>
            <div className="font-bold text-gray-900">
              {lot.max_price?.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Ngày thu hoạch</div>
            <div className="font-medium">
              {new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Còn lại</div>
            <div className={`font-medium ${daysUntilHarvest < 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysUntilHarvest > 0 ? `${daysUntilHarvest} ngày` : 'Đã đến'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Số lượng còn</div>
            <div className={`font-bold ${
              lot.available_quantity === 0 ? 'text-red-600' :
              lot.available_quantity < (lot.moq || 1) ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {lot.available_quantity}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Doanh thu</div>
            <div className="font-bold text-purple-600">
              {((lot.total_revenue || 0) / 1000).toFixed(0)}k
            </div>
          </div>
        </div>

        {/* Price Strategy Badge */}
        {lot.price_increase_strategy?.type && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {lot.price_increase_strategy.type === 'linear' ? 'Tăng tuyến tính' :
               lot.price_increase_strategy.type === 'step' ? 'Tăng theo bước' :
               'Tăng lũy thừa'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(lot)}
            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            Xem giá
          </button>
          <button
            onClick={() => onEdit(lot)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </button>
          <button
            onClick={() => onDelete(lot.id)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}