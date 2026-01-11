import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { logTypes } from "@/components/hooks/useAdminInventory";

export default function InventoryLogModal({ onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    type: "import",
    quantity: "",
    unit_cost: "",
    supplier: "",
    reference_number: "",
    note: ""
  });

  const { data: products = [] } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100),
    initialData: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProduct = products.find(p => p.id === formData.product_id);
    onSubmit({
      ...formData,
      product_name: selectedProduct?.name,
      quantity: Number(formData.quantity),
      unit_cost: Number(formData.unit_cost),
      total_cost: Number(formData.quantity) * Number(formData.unit_cost),
      stock_before: selectedProduct?.stock_quantity || 0,
      stock_after: (selectedProduct?.stock_quantity || 0) +
        (formData.type === 'import' ? Number(formData.quantity) : -Number(formData.quantity))
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Thêm Phiếu Xuất Nhập Kho
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sản Phẩm *</label>
              <select
                required
                value={formData.product_id}
                onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                <option value="">Chọn sản phẩm...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Tồn: {product.stock_quantity || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại Giao Dịch *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                {logTypes.filter(t => t.value !== 'all').map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số Lượng *</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn Giá</label>
              <input
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà Cung Cấp</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số Chứng Từ</label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi Chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            />
          </div>

          {formData.quantity && formData.unit_cost && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Tổng giá trị</p>
              <p className="text-2xl font-bold text-blue-600">
                {(Number(formData.quantity) * Number(formData.unit_cost)).toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Tạo Phiếu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}