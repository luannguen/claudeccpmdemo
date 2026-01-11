import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, DollarSign, AlertCircle, Eye, Edit, Trash2 } from "lucide-react";
import { getPreOrderStatusColor, getPreOrderStatusText } from "@/components/hooks/useAdminPreOrders";

export default function PreOrderCard({ preOrder, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {preOrder.product_image && (
            <img
              src={preOrder.product_image}
              alt={preOrder.preorder_name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold mb-1">{preOrder.preorder_name}</h3>
                <p className="text-sm text-gray-600">Sản phẩm gốc: {preOrder.product_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPreOrderStatusColor(preOrder.status)}`}>
                {getPreOrderStatusText(preOrder.status)}
              </span>
            </div>

            {preOrder.preorder_description && (
              <p className="text-gray-700 mb-4">{preOrder.preorder_description}</p>
            )}

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {preOrder.active_lots || 0}/{preOrder.total_lots || 0} lot đang bán
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Doanh thu: {(preOrder.total_revenue || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Đặt cọc: {preOrder.default_deposit_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Link
            to={createPageUrl(`AdminProductLots?preorder_id=${preOrder.id}`)}
            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Xem Lot ({preOrder.total_lots || 0})
          </Link>
          <button
            onClick={() => onEdit(preOrder)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </button>
          <button
            onClick={() => onDelete(preOrder.id)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}