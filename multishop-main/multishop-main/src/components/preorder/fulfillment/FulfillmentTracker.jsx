/**
 * FulfillmentTracker - Track partial/split shipments
 * UI Layer
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, CheckCircle, Clock, Truck, 
  MapPin, Phone, Image, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-gray-100 text-gray-700', icon: Clock },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  ready_to_ship: { label: 'Sẵn sàng giao', color: 'bg-blue-100 text-blue-700', icon: Package },
  in_transit: { label: 'Đang vận chuyển', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  partial_delivered: { label: 'Giao một phần', color: 'bg-purple-100 text-purple-700', icon: Package },
  failed_delivery: { label: 'Giao thất bại', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

function FulfillmentCard({ fulfillment, sequence }) {
  const statusConfig = STATUS_CONFIG[fulfillment.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const deliveredPercent = fulfillment.total_items_shipped > 0 && fulfillment.items?.[0]?.ordered_quantity
    ? ((fulfillment.total_items_shipped / fulfillment.items[0].ordered_quantity) * 100).toFixed(0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              Đợt giao #{sequence}
            </h4>
            <p className="text-xs text-gray-500">{fulfillment.fulfillment_number}</p>
          </div>
        </div>
        <Badge className={statusConfig.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Items summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Đã giao</p>
          <p className="font-bold text-blue-600">{fulfillment.total_items_shipped || 0}</p>
        </div>
        {fulfillment.total_items_remaining > 0 && (
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">Còn lại</p>
            <p className="font-bold text-amber-700">{fulfillment.total_items_remaining}</p>
          </div>
        )}
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-700">Giá trị</p>
          <p className="font-bold text-purple-700">
            {(fulfillment.shipment_value || 0).toLocaleString()}đ
          </p>
        </div>
      </div>

      {/* Progress */}
      {deliveredPercent > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Tiến độ giao hàng</span>
            <span>{deliveredPercent}%</span>
          </div>
          <Progress value={parseFloat(deliveredPercent)} className="h-2" />
        </div>
      )}

      {/* Tracking */}
      {fulfillment.tracking_number && (
        <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg mb-3">
          <Truck className="w-4 h-4 text-cyan-600" />
          <span className="text-sm text-cyan-800">
            MVĐ: {fulfillment.tracking_number}
          </span>
        </div>
      )}

      {/* Dates */}
      <div className="space-y-1 text-xs text-gray-600">
        {fulfillment.shipped_date && (
          <div className="flex justify-between">
            <span>Ngày xuất kho:</span>
            <span className="font-medium text-gray-900">
              {format(new Date(fulfillment.shipped_date), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        )}
        {fulfillment.estimated_delivery_date && (
          <div className="flex justify-between">
            <span>Dự kiến giao:</span>
            <span className="font-medium text-blue-600">
              {format(new Date(fulfillment.estimated_delivery_date), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        )}
        {fulfillment.delivered_date && (
          <div className="flex justify-between">
            <span>Đã giao:</span>
            <span className="font-medium text-green-600">
              {format(new Date(fulfillment.delivered_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </span>
          </div>
        )}
      </div>

      {/* Remaining action */}
      {fulfillment.remaining_action && fulfillment.total_items_remaining > 0 && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            <span className="font-medium">Phần còn lại: </span>
            {fulfillment.remaining_action === 'ship_next_batch' && 'Sẽ giao đợt tiếp theo'}
            {fulfillment.remaining_action === 'refund_remaining' && 'Hoàn tiền phần thiếu'}
            {fulfillment.remaining_action === 'transfer_to_lot' && 'Chuyển sang lot khác'}
            {fulfillment.remaining_action === 'waiting_harvest' && 'Chờ thu hoạch'}
          </p>
        </div>
      )}

      {/* Delivery proof */}
      {fulfillment.delivery_proof && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Bằng chứng giao hàng</span>
          </div>
          {fulfillment.delivery_proof.receiver_name && (
            <p className="text-xs text-green-700">
              Người nhận: {fulfillment.delivery_proof.receiver_name}
            </p>
          )}
          {fulfillment.delivery_proof.photo_urls?.length > 0 && (
            <div className="flex gap-1 mt-2">
              {fulfillment.delivery_proof.photo_urls.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Proof ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer confirmation */}
      {fulfillment.customer_confirmation?.confirmed && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Khách đã xác nhận
              </span>
            </div>
            {fulfillment.customer_confirmation.rating && (
              <div className="flex items-center gap-1">
                {[...Array(fulfillment.customer_confirmation.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
            )}
          </div>
          {fulfillment.customer_confirmation.feedback && (
            <p className="text-xs text-emerald-700 mt-2">
              "{fulfillment.customer_confirmation.feedback}"
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function FulfillmentList({ fulfillments = [], orderData }) {
  if (fulfillments.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chưa có thông tin giao hàng</p>
      </div>
    );
  }

  // Sort by sequence
  const sorted = [...fulfillments].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sorted.map((fulfillment) => (
          <FulfillmentCard
            key={fulfillment.id}
            fulfillment={fulfillment}
            sequence={fulfillment.sequence}
          />
        ))}
      </AnimatePresence>

      {/* Summary */}
      {sorted.length > 1 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Tổng kết giao hàng
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Tổng đợt giao:</span>
              <span className="font-semibold text-blue-900 ml-2">{sorted.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Đã hoàn tất:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {sorted.filter(f => f.status === 'delivered').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FulfillmentCard;