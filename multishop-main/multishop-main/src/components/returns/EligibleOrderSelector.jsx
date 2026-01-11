/**
 * 📦 Eligible Order Selector - Chọn đơn hàng đủ điều kiện trả
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import EnhancedModal from '../EnhancedModal';

export default function EligibleOrderSelector({ isOpen, onClose, orders, onSelectOrder }) {
  const eligibleOrders = orders.filter(o => 
    ['delivered', 'completed'].includes(o.order_status)
  );

  const getOrderDaysAgo = (order) => {
    const orderDate = new Date(order.created_date);
    const daysSince = Math.floor((Date.now() - orderDate) / (1000 * 60 * 60 * 24));
    return daysSince;
  };

  const isEligible = (order) => {
    const daysAgo = getOrderDaysAgo(order);
    return daysAgo <= 7;
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn Đơn Hàng Cần Trả"
      maxWidth="2xl"
      zIndex={120}
    >
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">
          Chọn đơn hàng bạn muốn trả. Chỉ các đơn đã giao trong vòng 7 ngày được chấp nhận.
        </p>

        {eligibleOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Không có đơn hàng đủ điều kiện</h3>
            <p className="text-sm text-gray-600">
              Chỉ đơn hàng đã giao trong vòng 7 ngày mới có thể trả hàng
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {eligibleOrders.map(order => {
              const daysAgo = getOrderDaysAgo(order);
              const canReturn = isEligible(order);
              
              return (
                <motion.button
                  key={order.id}
                  onClick={() => canReturn && onSelectOrder(order)}
                  disabled={!canReturn}
                  whileHover={canReturn ? { scale: 1.02 } : {}}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    canReturn 
                      ? 'border-gray-200 hover:border-[#7CB342] hover:bg-green-50 cursor-pointer' 
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_date).toLocaleDateString('vi-VN')} ({daysAgo} ngày trước)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#7CB342]">
                        {order.total_amount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-gray-600">{order.items?.length} sản phẩm</p>
                    </div>
                  </div>

                  {canReturn ? (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đủ điều kiện trả hàng
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Quá hạn trả hàng (chỉ được trả trong 7 ngày)
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}