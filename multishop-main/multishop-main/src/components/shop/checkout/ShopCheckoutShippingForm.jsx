import React from "react";
import { MapPin } from "lucide-react";

/**
 * ShopCheckoutShippingForm - Form địa chỉ giao hàng
 */
export default function ShopCheckoutShippingForm({ 
  formData, 
  updateField, 
  saveInfo, 
  setSaveInfo, 
  currentUser, 
  primaryColor 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
        Địa Chỉ Giao Hàng
      </h2>
      
      <div className="space-y-4">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2">Địa chỉ chi tiết *</label>
          <input
            type="text"
            required
            value={formData.shipping_address}
            onChange={(e) => updateField('shipping_address', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="Số nhà, tên đường..."
          />
        </div>
        
        {/* Ward, District, City */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phường/Xã</label>
            <input
              type="text"
              value={formData.shipping_ward}
              onChange={(e) => updateField('shipping_ward', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Phường 1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
            <input
              type="text"
              required
              value={formData.shipping_district}
              onChange={(e) => updateField('shipping_district', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Quận 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thành phố *</label>
            <input
              type="text"
              required
              value={formData.shipping_city}
              onChange={(e) => updateField('shipping_city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Hồ Chí Minh"
            />
          </div>
        </div>
        
        {/* Note */}
        <div>
          <label className="block text-sm font-medium mb-2">Ghi chú</label>
          <textarea
            value={formData.note}
            onChange={(e) => updateField('note', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="Ghi chú cho đơn hàng (tùy chọn)"
          />
        </div>

        {/* Save info checkbox */}
        {currentUser && (
          <label className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="w-5 h-5 text-[#7CB342] rounded mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-900">
                💾 Lưu thông tin cho lần mua sau
              </p>
              <p className="text-sm text-gray-600">
                Thông tin của bạn sẽ được điền tự động trong các đơn hàng tiếp theo
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}