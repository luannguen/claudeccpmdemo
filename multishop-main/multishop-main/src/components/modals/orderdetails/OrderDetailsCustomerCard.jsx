import React from "react";
import { Package, Phone, Mail, MapPin } from "lucide-react";

/**
 * OrderDetailsCustomerCard - Thông tin khách hàng
 * 
 * Props:
 * - order: object
 */
export default function OrderDetailsCustomerCard({ order }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-[#7CB342]" />
        Thông Tin Khách Hàng
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer */}
        <InfoItem icon={Phone}>
          <p className="text-sm text-gray-500">Khách hàng</p>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-600">{order.customer_phone}</p>
        </InfoItem>

        {/* Email */}
        <InfoItem icon={Mail}>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{order.customer_email}</p>
        </InfoItem>

        {/* Address */}
        <InfoItem icon={MapPin} className="md:col-span-2">
          <p className="text-sm text-gray-500">Địa chỉ</p>
          <p className="font-medium">{order.shipping_address}</p>
        </InfoItem>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, children, className = "" }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="w-5 h-5 text-gray-400 mt-1" />
      <div>{children}</div>
    </div>
  );
}