import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, TrendingUp, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductLotFormModal({ isOpen, onClose, lot, preorderId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    preorder_product_id: preorderId || "",
    lot_name: "",
    lot_code: "",
    estimated_harvest_date: "",
    total_yield: 0,
    initial_price: 0,
    max_price: 0,
    price_increase_strategy: {
      type: "linear",
      rate_per_day: 5000
    },
    deposit_percentage: 100,
    harvest_location: "",
    notes: "",
    status: "active"
  });

  const [stepPrices, setStepPrices] = useState([]);

  const { data: preOrders = [] } = useQuery({
    queryKey: ['preorders-for-lot'],
    queryFn: () => base44.entities.PreOrderProduct.filter({ status: 'active' }, '-created_date', 500),
    enabled: isOpen && !preorderId
  });

  useEffect(() => {
    if (lot) {
      setFormData({
        preorder_product_id: lot.preorder_product_id || "",
        lot_name: lot.lot_name || "",
        lot_code: lot.lot_code || "",
        estimated_harvest_date: lot.estimated_harvest_date || "",
        total_yield: lot.total_yield || 0,
        moq: lot.moq || 1,
        initial_price: lot.initial_price || 0,
        max_price: lot.max_price || 0,
        price_increase_strategy: lot.price_increase_strategy || { type: "linear", rate_per_day: 5000 },
        deposit_percentage: lot.deposit_percentage || 100,
        harvest_location: lot.harvest_location || "",
        notes: lot.notes || "",
        status: lot.status || "active"
      });

      if (lot.price_increase_strategy?.type === 'step' && lot.price_increase_strategy?.steps) {
        setStepPrices(lot.price_increase_strategy.steps);
      }
    } else {
      setFormData({
        preorder_product_id: preorderId || "",
        lot_name: "",
        lot_code: "",
        estimated_harvest_date: "",
        total_yield: 0,
        moq: 1,
        initial_price: 0,
        max_price: 0,
        price_increase_strategy: { type: "linear", rate_per_day: 5000 },
        deposit_percentage: 100,
        harvest_location: "",
        notes: "",
        status: "active"
      });
      setStepPrices([]);
    }
  }, [lot, preorderId, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      let strategy = data.price_increase_strategy;
      if (strategy.type === 'step') {
        strategy = { ...strategy, steps: stepPrices };
      }

      // ✅ Step 1: Fetch PreOrderProduct
      const preOrderList = await base44.entities.PreOrderProduct.list('-created_date', 500);
      const preOrder = preOrderList.find(p => p.id === data.preorder_product_id);
      
      if (!preOrder) {
        throw new Error('Không tìm thấy phiên bán trước');
      }
      
      if (!preOrder.product_id) {
        throw new Error('Phiên bán trước chưa có product_id. Vui lòng cập nhật lại PreOrderProduct');
      }

      // ✅ Step 2: Fetch Product entity
      const productList = await base44.entities.Product.list('-created_date', 500);
      const product = productList.find(p => p.id === preOrder.product_id);
      
      if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID: ${preOrder.product_id}`);
      }

      const productImage = product.image_url || "";
      const productGallery = Array.isArray(product.gallery) ? product.gallery : [];
      const productName = product.name || "";
      
      if (!productImage) {
        console.warn('⚠️ Product không có image_url');
      }

      const payload = {
        ...data,
        price_increase_strategy: strategy,
        product_id: preOrder.product_id,
        product_name: productName,
        product_image: productImage,
        product_gallery: productGallery,
        current_price: lot?.current_price || data.initial_price,
        available_quantity: lot?.available_quantity ?? data.total_yield,
        sold_quantity: lot?.sold_quantity || 0,
        total_revenue: lot?.total_revenue || 0
      };

      console.log('✅ ProductLot payload:', { 
        product_id: payload.product_id,
        product_name: payload.product_name, 
        product_image: payload.product_image,
        gallery_count: payload.product_gallery.length
      });

      if (lot) {
        return base44.entities.ProductLot.update(lot.id, payload);
      } else {
        return base44.entities.ProductLot.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-product-lots']);
      queryClient.invalidateQueries(['admin-preorders']);
      queryClient.invalidateQueries(['public-product-lots']);
      queryClient.invalidateQueries(['lot-detail']);
      alert('✅ Đã lưu lot thành công!');
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error saving lot:', error);
      alert(`❌ Lỗi: ${error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const addStepPrice = () => {
    setStepPrices([...stepPrices, { date: "", price: 0 }]);
  };

  const removeStepPrice = (index) => {
    setStepPrices(stepPrices.filter((_, i) => i !== index));
  };

  const updateStepPrice = (index, field, value) => {
    const updated = [...stepPrices];
    updated[index][field] = field === 'price' ? parseFloat(value) : value;
    setStepPrices(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">
                {lot ? 'Chỉnh sửa Lot' : 'Tạo Lot mới'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!preorderId && (
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn phiên bán trước *</label>
                  <select
                    required
                    value={formData.preorder_product_id}
                    onChange={(e) => setFormData({ ...formData, preorder_product_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  >
                    <option value="">-- Chọn phiên bán trước --</option>
                    {preOrders.map(po => (
                      <option key={po.id} value={po.id}>
                        {po.preorder_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Lot *</label>
                  <input
                    type="text"
                    required
                    value={formData.lot_name}
                    onChange={(e) => setFormData({ ...formData, lot_name: e.target.value })}
                    placeholder="VD: Lô thu hoạch tháng 12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mã Lot</label>
                  <input
                    type="text"
                    value={formData.lot_code}
                    onChange={(e) => setFormData({ ...formData, lot_code: e.target.value })}
                    placeholder="VD: LOT-2025-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày thu hoạch dự kiến *</label>
                  <input
                    type="date"
                    required
                    value={formData.estimated_harvest_date}
                    onChange={(e) => setFormData({ ...formData, estimated_harvest_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tổng sản lượng *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_yield}
                    onChange={(e) => setFormData({ ...formData, total_yield: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Số lượng đặt tối thiểu (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.moq || 1}
                  onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Khách hàng phải đặt tối thiểu số lượng này. Để = tổng sản lượng nếu muốn bán nguyên lô.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#7CB342]" />
                  Cấu hình Tăng giá
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá khởi điểm (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.initial_price}
                      onChange={(e) => setFormData({ ...formData, initial_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Giá trần (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.max_price}
                      onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Chiến lược tăng giá</label>
                  <select
                    value={formData.price_increase_strategy.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      price_increase_strategy: {
                        ...formData.price_increase_strategy,
                        type: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  >
                    <option value="linear">Tăng tuyến tính</option>
                    <option value="step">Tăng theo bước</option>
                    <option value="exponential">Tăng lũy thừa</option>
                  </select>
                </div>

                {formData.price_increase_strategy.type === 'linear' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Tăng mỗi ngày (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price_increase_strategy.rate_per_day}
                      onChange={(e) => setFormData({
                        ...formData,
                        price_increase_strategy: {
                          ...formData.price_increase_strategy,
                          rate_per_day: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                    />
                  </div>
                )}

                {formData.price_increase_strategy.type === 'step' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Các bước tăng giá</label>
                      <button
                        type="button"
                        onClick={addStepPrice}
                        className="text-[#7CB342] hover:text-[#6fa038] flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm bước
                      </button>
                    </div>

                    <div className="space-y-2">
                      {stepPrices.map((step, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="date"
                            value={step.date}
                            onChange={(e) => updateStepPrice(index, 'date', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Ngày"
                          />
                          <input
                            type="number"
                            value={step.price}
                            onChange={(e) => updateStepPrice(index, 'price', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Giá"
                          />
                          <button
                            type="button"
                            onClick={() => removeStepPrice(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đặt cọc (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.deposit_percentage}
                    onChange={(e) => setFormData({ ...formData, deposit_percentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  >
                    <option value="active">Đang bán</option>
                    <option value="sold_out">Hết hàng</option>
                    <option value="awaiting_harvest">Chờ thu hoạch</option>
                    <option value="harvested">Đã thu hoạch</option>
                    <option value="fulfilled">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vị trí thu hoạch</label>
                <input
                  type="text"
                  value={formData.harvest_location}
                  onChange={(e) => setFormData({ ...formData, harvest_location: e.target.value })}
                  placeholder="VD: Vườn A - Đà Lạt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
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
                  className="flex-1 bg-[#7CB342] text-white px-6 py-3 rounded-lg hover:bg-[#6fa038] transition-colors disabled:opacity-50"
                >
                  {mutation.isPending ? 'Đang lưu...' : (lot ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}