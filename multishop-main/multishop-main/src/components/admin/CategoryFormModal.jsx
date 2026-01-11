import React, { useState } from "react";
import EnhancedModal from "../EnhancedModal";
import { Save } from "lucide-react";

const emojiList = ["🥬", "🍓", "🌾", "🥫", "🎁", "🥑", "🥕", "🍅", "🥒", "🌽", "🥔", "🍆", "🥦", "🍄", "🌶️", "🫑", "🥗"];

export default function CategoryFormModal({ category, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    key: category?.key || "",
    name: category?.name || "",
    icon: category?.icon || "📦",
    image_url: category?.image_url || "",
    description: category?.description || "",
    display_order: category?.display_order || 0,
    status: category?.status || "active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.key)) {
      alert('Key chỉ được chứa chữ thường, số và dấu gạch ngang (-)');
      return;
    }
    onSubmit(formData);
  };

  return (
    <EnhancedModal
      isOpen={true}
      onClose={onClose}
      title={category ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
      maxWidth="2xl"
      persistPosition={true}
      positionKey="category-form-modal"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Key (Slug) *</label>
            <input type="text" required value={formData.key}
              onChange={(e) => setFormData({...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="vegetables, fruits, rice..." 
              disabled={!!category} />
            <p className="text-xs text-gray-500 mt-1">Chỉ chữ thường, số và dấu gạch ngang</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tên Hiển Thị *</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Rau Củ, Trái Cây..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Icon Emoji</label>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-4xl">
              {formData.icon}
            </div>
            <input type="text" value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="🥬" />
          </div>
          <div className="flex flex-wrap gap-2">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({...formData, icon: emoji})}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                  formData.icon === emoji 
                    ? 'bg-[#7CB342] text-white ring-2 ring-[#7CB342] ring-offset-2' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL Ảnh</label>
          <input type="url" value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="https://..." />
          {formData.image_url && (
            <img src={formData.image_url} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô Tả</label>
          <textarea value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            placeholder="Mô tả danh mục..." />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Thứ Tự Hiển Thị</label>
            <input type="number" value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Trạng Thái</label>
            <select value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
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
                {category ? 'Cập Nhật' : 'Tạo Mới'}
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}