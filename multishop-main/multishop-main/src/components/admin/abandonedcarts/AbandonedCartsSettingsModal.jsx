import React, { useState } from "react";

export default function AbandonedCartsSettingsModal({ config, onSave, onClose }) {
  const [formData, setFormData] = useState({
    enabled: config.enabled ?? true,
    delay_hours: config.delay_hours ?? 1,
    min_cart_value: config.min_cart_value ?? 100000,
    discount_enabled: config.discount_enabled ?? true,
    discount_type: config.discount_type ?? 'percentage',
    discount_value: config.discount_value ?? 10,
    urgency_hours: config.urgency_hours ?? 24,
    email_subject: config.email_subject ?? '🛒 Bạn đã quên giỏ hàng của mình?'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...config, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Cấu Hình Khôi Phục Giỏ Hàng</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <label className="font-medium">Bật tính năng</label>
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-6 h-6"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Thời gian chờ (giờ)</label>
            <input
              type="number"
              value={formData.delay_hours}
              onChange={(e) => setFormData({ ...formData, delay_hours: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 rounded-lg"
              min="1"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Giá trị giỏ hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={formData.min_cart_value}
              onChange={(e) => setFormData({ ...formData, min_cart_value: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 rounded-lg"
              min="0"
              step="10000"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium">Gửi mã giảm giá</label>
            <input
              type="checkbox"
              checked={formData.discount_enabled}
              onChange={(e) => setFormData({ ...formData, discount_enabled: e.target.checked })}
              className="w-6 h-6"
            />
          </div>

          {formData.discount_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Loại giảm giá</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Giá trị</label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                  min="0"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium mb-2">Urgency (giờ)</label>
            <input
              type="number"
              value={formData.urgency_hours}
              onChange={(e) => setFormData({ ...formData, urgency_hours: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 rounded-lg"
              min="1"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Tiêu đề email</label>
            <input
              type="text"
              value={formData.email_subject}
              onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
              className="w-full px-4 py-2 border-2 rounded-lg"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 rounded-lg font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#7CB342] text-white rounded-lg font-medium hover:bg-[#FF9800]"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}