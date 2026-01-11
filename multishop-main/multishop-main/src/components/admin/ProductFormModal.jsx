import React, { useState } from "react";
import EnhancedModal from "../EnhancedModal";
import { Icon } from "@/components/ui/AnimatedIcon";

export default function ProductFormModal({ product, onClose, onSubmit, isSubmitting, categories }) {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || (categories.length > 1 ? categories[1].value : "vegetables"),
    description: product?.description || "",
    short_description: product?.short_description || "",
    price: product?.price || "",
    unit: product?.unit || "kg",
    sku: product?.sku || "",
    stock_quantity: product?.stock_quantity || 0,
    image_url: product?.image_url || "",
    gallery: product?.gallery || [],
    video_url: product?.video_url || "",
    video_thumbnail: product?.video_thumbnail || "",
    status: product?.status || "active",
    featured: product?.featured || false,
    commission_rate: product?.commission_rate || 3
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const addToGallery = () => {
    if (newGalleryUrl.trim()) {
      setFormData({
        ...formData,
        gallery: [...(formData.gallery || []), newGalleryUrl.trim()]
      });
      setNewGalleryUrl("");
    }
  };

  const removeFromGallery = (index) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <EnhancedModal
      isOpen={true}
      onClose={onClose}
      title={product ? `Sửa Sản Phẩm - v${product.current_version || 1}` : 'Thêm Sản Phẩm'}
      maxWidth="5xl"
      persistPosition={true}
      positionKey="product-form-modal"
    >
      {product && (
        <div className="flex gap-2 border-b px-6 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-[#7CB342] border-b-2 border-[#7CB342]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Thông Tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#7CB342] border-b-2 border-[#7CB342]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lịch Sử ({product.current_version || 1} versions)
          </button>
        </div>
      )}

      {(!product || activeTab === 'info') ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tên *</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Danh Mục *</label>
            <select value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              {categories.filter(c => c.value !== 'all').map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô Tả Ngắn</label>
          <input type="text" value={formData.short_description}
            onChange={(e) => setFormData({...formData, short_description: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="Mô tả 1 dòng..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô Tả Chi Tiết</label>
          <textarea value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Giá (VNĐ) *</label>
            <input type="number" required value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Đơn Vị *</label>
            <input type="text" required value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tồn Kho</label>
            <input type="number" value={formData.stock_quantity}
              onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <input type="text" value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Commission (%)</label>
            <input type="number" value={formData.commission_rate}
              onChange={(e) => setFormData({...formData, commission_rate: Number(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="0" max="100" step="0.5" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Trạng Thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="active">Đang Bán</option>
              <option value="inactive">Tạm Ngưng</option>
              <option value="out_of_stock">Hết Hàng</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-7">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 text-[#7CB342] rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium">Sản phẩm nổi bật</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Icon.Image className="w-4 h-4" />
            Ảnh Chính
          </label>
          <input type="url" value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="https://..." />
          {formData.image_url && (
            <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Icon.Image className="w-4 h-4" />
            Thư Viện Ảnh
          </label>
          <div className="flex gap-2 mb-3">
            <input type="url" value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToGallery(); } }}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="URL ảnh..." />
            <button type="button" onClick={addToGallery}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Icon.Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.gallery?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {formData.gallery.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Gallery ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeFromGallery(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Icon.X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Icon.Camera className="w-4 h-4" />
            Video Demo
          </label>
          <input type="url" value={formData.video_url}
            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="https://youtube.com/watch?v=..." />
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
                <Icon.Save className="w-5 h-5" />
                {product ? 'Cập Nhật' : 'Tạo Mới'}
              </>
            )}
          </button>
        </div>
      </form>
      ) : (
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <ProductVersionHistory productId={product.id} productName={product.name} />
        </div>
      )}
    </EnhancedModal>
  );
}

// Import version history component
import ProductVersionHistory from "./products/ProductVersionHistory";