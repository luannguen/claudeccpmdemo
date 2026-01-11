import React from "react";
import { User, Edit, Save, X } from "lucide-react";

export default function ProfilePersonalInfo({ 
  user, customer, isEditing, setIsEditing, 
  formData, setFormData, onSave, isSaving 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-[#7CB342]" />
          Thông Tin Cá Nhân
        </h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-[#7CB342] hover:bg-green-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <X className="w-4 h-4" />
              Hủy
            </button>
            <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              Lưu
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            {isEditing ? (
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.full_name || user?.full_name || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            {isEditing ? (
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.phone || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
            {isEditing ? (
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.city || '-'}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
            {isEditing ? (
              <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.district || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
            {isEditing ? (
              <input type="text" value={formData.ward} onChange={(e) => setFormData({...formData, ward: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.ward || '-'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ chi tiết</label>
          {isEditing ? (
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-xl">{customer?.address || '-'}</p>
          )}
        </div>
      </div>
    </div>
  );
}