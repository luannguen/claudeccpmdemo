import React from "react";
import { User } from "lucide-react";

/**
 * ShopCheckoutCustomerForm - Form thông tin khách hàng
 */
export default function ShopCheckoutCustomerForm({ formData, updateField, currentUser, primaryColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="w-5 h-5" style={{ color: primaryColor }} />
        Thông Tin Khách Hàng
      </h2>
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Họ và tên *</label>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => updateField('customer_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="Nguyễn Văn A"
          />
        </div>
        
        {/* Email & Phone */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.customer_email}
              onChange={(e) => updateField('customer_email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="email@example.com"
              disabled={!!currentUser}
            />
            {currentUser && (
              <p className="text-xs text-gray-500 mt-1">Email từ tài khoản của bạn</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
            <input
              type="tel"
              required
              value={formData.customer_phone}
              onChange={(e) => updateField('customer_phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="0901234567"
            />
          </div>
        </div>
      </div>
    </div>
  );
}