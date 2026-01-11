import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreOrderProductFormModal({ isOpen, onClose, preOrder }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    product_id: "",
    preorder_name: "",
    preorder_description: "",
    default_deposit_percentage: 100,
    display_on_preorder_page: true,
    status: "active"
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-preorder'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }, '-created_date', 500),
    enabled: isOpen
  });

  useEffect(() => {
    if (preOrder) {
      setFormData({
        product_id: preOrder.product_id || "",
        preorder_name: preOrder.preorder_name || "",
        preorder_description: preOrder.preorder_description || "",
        default_deposit_percentage: preOrder.default_deposit_percentage || 100,
        display_on_preorder_page: preOrder.display_on_preorder_page ?? true,
        status: preOrder.status || "active"
      });
    } else {
      setFormData({
        product_id: "",
        preorder_name: "",
        preorder_description: "",
        default_deposit_percentage: 100,
        display_on_preorder_page: true,
        status: "active"
      });
    }
  }, [preOrder, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const selectedProduct = products.find(p => p.id === data.product_id);
      const payload = {
        ...data,
        product_name: selectedProduct?.name || "",
        product_image: selectedProduct?.image_url || "",
        total_lots: preOrder?.total_lots || 0,
        active_lots: preOrder?.active_lots || 0,
        total_revenue: preOrder?.total_revenue || 0
      };

      if (preOrder) {
        return base44.entities.PreOrderProduct.update(preOrder.id, payload);
      } else {
        return base44.entities.PreOrderProduct.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-preorders']);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {preOrder ? 'Chỉnh sửa phiên bán trước' : 'Tạo phiên bán trước mới'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Chọn sản phẩm *</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên phiên bán trước *</label>
                <input
                  type="text"
                  required
                  value={formData.preorder_name}
                  onChange={(e) => setFormData({ ...formData, preorder_name: e.target.value })}
                  placeholder="VD: Mật ong hoa cà phê - Phiên đặt trước Đặc biệt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả phiên bán trước</label>
                <textarea
                  value={formData.preorder_description}
                  onChange={(e) => setFormData({ ...formData, preorder_description: e.target.value })}
                  placeholder="Mô tả đặc biệt cho phiên bán trước này..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phần trăm đặt cọc (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.default_deposit_percentage}
                  onChange={(e) => setFormData({ ...formData, default_deposit_percentage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Mặc định: 100% (thanh toán toàn bộ)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="display_on_preorder_page"
                  checked={formData.display_on_preorder_page}
                  onChange={(e) => setFormData({ ...formData, display_on_preorder_page: e.target.checked })}
                  className="w-4 h-4 text-[#7CB342] border-gray-300 rounded focus:ring-[#7CB342]"
                />
                <label htmlFor="display_on_preorder_page" className="text-sm font-medium">
                  Hiển thị trên trang bán trước
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-[#7CB342] text-white px-6 py-3 rounded-lg hover:bg-[#6fa038] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? 'Đang lưu...' : (preOrder ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}