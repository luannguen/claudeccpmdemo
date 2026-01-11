import React from 'react';
import { Phone, MapPin } from 'lucide-react';

export default function OrderCustomerInfo({ order }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
      <ContactCard order={order} />
      <ShippingCard order={order} />
    </div>
  );
}

function ContactCard({ order }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
      <h4 className="font-bold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
        <Phone className="w-4 h-4 text-[#7CB342]" />
        Liên Hệ
      </h4>
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <p><strong>Tên:</strong> {order.customer_name}</p>
        <p><strong>SĐT:</strong> {order.customer_phone}</p>
        <p className="truncate"><strong>Email:</strong> {order.customer_email}</p>
      </div>
    </div>
  );
}

function ShippingCard({ order }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
      <h4 className="font-bold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
        <MapPin className="w-4 h-4 text-[#7CB342]" />
        Giao Hàng
      </h4>
      <p className="text-xs sm:text-sm leading-relaxed">
        {order.shipping_address}
        {order.shipping_ward && `, ${order.shipping_ward}`}
        {order.shipping_district && `, ${order.shipping_district}`}
        {order.shipping_city && `, ${order.shipping_city}`}
      </p>
    </div>
  );
}