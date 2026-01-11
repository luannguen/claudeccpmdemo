import React from "react";
import { motion } from "framer-motion";
import { X, Phone, Mail, MapPin, ShoppingBag, TrendingUp, Star, Award, Clock, MessageSquare } from "lucide-react";
import { customerTypes } from "@/components/hooks/useAdminCustomers";

export default function CustomerDetailModal({ customer, orders, onClose }) {
  if (!customer) return null;

  const safeOrders = orders || [];
  const customerOrders = safeOrders.filter(o => 
    o.customer_phone === customer.phone || o.customer_email === customer.email
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Chi Tiết Khách Hàng
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info Header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-3xl">
              {customer.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{customer.full_name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.customer_type === 'vip' ? 'bg-purple-100 text-purple-600' :
                  customer.customer_type === 'active' ? 'bg-green-100 text-green-600' :
                  customer.customer_type === 'new' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {customerTypes.find(t => t.value === customer.customer_type)?.icon} {customerTypes.find(t => t.value === customer.customer_type)?.label}
                </span>
                <span className="text-sm text-gray-500">
                  Tham gia: {new Date(customer.created_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
              <p className="text-sm text-blue-700">Đơn hàng</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{(customer.total_spent || 0).toLocaleString('vi-VN')}đ</p>
              <p className="text-sm text-green-700">Tổng chi</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <Star className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{customer.loyalty_points || 0}</p>
              <p className="text-sm text-purple-700">Điểm tích lũy</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <Award className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{(customer.avg_order_value || 0).toLocaleString('vi-VN')}đ</p>
              <p className="text-sm text-orange-700">Đơn TB</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Thông Tin Liên Hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{customer.email || 'Chưa có'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <span className="text-gray-700">
                  {[customer.address, customer.ward, customer.district, customer.city]
                    .filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Hoạt Động Gần Đây
            </h4>
            <div className="space-y-3">
              {customer.last_order_date && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    Mua hàng lần cuối: {new Date(customer.last_order_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {customer.first_order_date && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">
                    Mua hàng lần đầu: {new Date(customer.first_order_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          {customerOrders.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Đơn Hàng Gần Đây</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customerOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#7CB342]">{order.total_amount.toLocaleString('vi-VN')}đ</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Ghi Chú</h4>
                  <p className="text-sm text-yellow-800">{customer.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}