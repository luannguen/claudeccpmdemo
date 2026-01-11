import React, { useState } from "react";
import EnhancedModal from "../EnhancedModal";
import { Save } from "lucide-react";

const customerTypes = [
  { value: "new", label: "Khách mới" },
  { value: "active", label: "Hoạt động" },
  { value: "vip", label: "VIP" },
  { value: "inactive", label: "Không hoạt động" }
];

export default function CustomerFormModal({ customer, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    full_name: customer?.full_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    district: customer?.district || "",
    ward: customer?.ward || "",
    customer_type: customer?.customer_type || "new",
    notes: customer?.notes || "",
    status: customer?.status || "active",
    birth_date: customer?.birth_date || "",
    gender: customer?.gender || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <EnhancedModal
      isOpen={true}
      onClose={onClose}
      title={customer ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng'}
      maxWidth="2xl"
      persistPosition={true}
      positionKey="customer-form-modal"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Họ Tên *</label>
            <input type="text" required value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Số Điện Thoại *</label>
            <input type="tel" required value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ngày Sinh</label>
            <input type="date" value={formData.birth_date}
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Địa Chỉ</label>
          <input type="text" value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phường/Xã</label>
            <input type="text" value={formData.ward}
              onChange={(e) => setFormData({...formData, ward: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
            <input type="text" value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thành Phố</label>
            <input type="text" value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phân Loại</label>
            <select value={formData.customer_type}
              onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              {customerTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Giới Tính</label>
            <select value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              <option value="">Chọn</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Trạng Thái</label>
            <select value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="blocked">Chặn</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ghi Chú</label>
          <textarea value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none" />
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button type="button" onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {customer ? 'Cập Nhật' : 'Tạo Mới'}
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}