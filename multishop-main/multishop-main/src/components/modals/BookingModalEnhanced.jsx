import React, { useState, useEffect } from "react";
import { Plus, Minus, Save, CheckCircle, Calendar, Clock, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EnhancedModal from "../EnhancedModal";

export default function BookingModalEnhanced({ isOpen, onClose, initialService }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '', email: '', phone: '', address: '', city: '', district: '',
    deliveryDate: '', deliveryTime: '', note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-booking'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    },
    retry: false
  });

  const { data: existingCustomer } = useQuery({
    queryKey: ['customer-info-booking', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const customers = await base44.entities.Customer.list('-created_date', 500);
      return customers.find(c => c.email === currentUser.email && !c.tenant_id);
    },
    enabled: !!currentUser?.email
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-booking'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    initialData: []
  });

  useEffect(() => {
    if (existingCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: existingCustomer.full_name || currentUser?.full_name || '',
        email: existingCustomer.email || currentUser?.email || '',
        phone: existingCustomer.phone || '',
        address: existingCustomer.address || '',
        city: existingCustomer.city || '',
        district: existingCustomer.district || ''
      }));
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.full_name || prev.customerName,
        email: currentUser.email || prev.email
      }));
    }
  }, [existingCustomer, currentUser]);

  useEffect(() => {
    if (isOpen && initialService && products.length > 0) {
      const product = products.find(p => {
        const productData = p?.data || p;
        return productData?.name === initialService;
      });
      if (product) {
        setSelectedProducts([{ ...product, quantity: 1 }]);
      }
    }
  }, [isOpen, initialService, products]);

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      ));
    }
  };

  const subtotal = selectedProducts.reduce((sum, p) => {
    const productData = p?.data || p;
    return sum + ((productData?.price || 0) * (p.quantity || 0));
  }, 0);
  const shippingFee = subtotal >= 200000 ? 0 : 30000;
  const discount = subtotal >= 500000 ? 50000 : 0;
  const total = subtotal + shippingFee - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
      const basePoints = Math.floor(total / 1000);
      
      const order = await base44.entities.Order.create({
        order_number: orderNumber,
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_district: formData.district,
        items: selectedProducts.map(product => {
          const productData = product?.data || product;
          return {
            product_id: product.id,
            product_name: productData?.name,
            quantity: product.quantity,
            unit_price: productData?.price,
            subtotal: (productData?.price || 0) * (product.quantity || 0)
          };
        }),
        subtotal, shipping_fee: shippingFee, discount_amount: discount, total_amount: total,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'pending',
        delivery_date: formData.deliveryDate,
        delivery_time: formData.deliveryTime,
        note: formData.note
      });

      setOrderResult({ orderNumber, total, items: selectedProducts, pointsEarned: basePoints });
      setCurrentStep(4);
    } catch (error) {
      console.error('Order error:', error);
      alert('Có lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (currentStep === 1) return 'Chọn Sản Phẩm';
    if (currentStep === 2) return 'Thông Tin Giao Hàng';
    if (currentStep === 3) return 'Xác Nhận';
    return 'Hoàn Tất';
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      maxWidth="4xl"
      persistPosition={false}
      positionKey="booking-modal"
      mobileFixed={true}
      enableDrag={false}
    >
      <div className="p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {products.map((product) => {
                const productData = product?.data || product;
                return (
                  <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#7CB342] transition-colors">
                    <h4 className="font-bold">{productData?.name}</h4>
                    <p className="text-xl font-bold text-[#7CB342]">
                      {(productData?.price || 0).toLocaleString('vi-VN')}đ
                    </p>
                    <button onClick={() => addProduct(product)}
                      className="w-full bg-[#7CB342] text-white py-2 rounded-lg mt-2 hover:bg-[#FF9800]">
                      <Plus className="w-4 h-4 inline mr-1" />Thêm
                    </button>
                  </div>
                );
              })}
            </div>

            {selectedProducts.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-bold mb-3">Đã chọn ({selectedProducts.length})</h4>
                {selectedProducts.map(product => {
                  const productData = product?.data || product;
                  return (
                    <div key={product.id} className="flex items-center justify-between mb-2">
                      <span className="text-sm">{productData?.name}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded-full"><Minus className="w-3 h-3 mx-auto" /></button>
                        <span className="font-bold">{product.quantity}</span>
                        <button onClick={() => updateQuantity(product.id, product.quantity + 1)}
                          className="w-6 h-6 bg-[#7CB342] text-white rounded-full"><Plus className="w-3 h-3 mx-auto" /></button>
                        <span className="font-bold text-[#7CB342] w-24 text-right">
                          {((productData?.price || 0) * product.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => setCurrentStep(2)} disabled={selectedProducts.length === 0}
              className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50">
              Tiếp Theo ({selectedProducts.length})
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            {existingCustomer && (
              <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                <Save className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">✅ Đã điền tự động</p>
                  <p className="text-sm text-green-700">Từ đơn trước</p>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" required value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="px-4 py-3 border rounded-xl" placeholder="Họ tên *" />
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-4 py-3 border rounded-xl" placeholder="Email *" disabled={!!currentUser} />
              <input type="tel" required value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="px-4 py-3 border rounded-xl" placeholder="SĐT *" />
              <input type="text" required value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="px-4 py-3 border rounded-xl" placeholder="Địa chỉ *" />
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(1)} className="flex-1 border py-3 rounded-xl">Quay Lại</button>
              <button onClick={() => setCurrentStep(3)} className="flex-1 bg-[#7CB342] text-white py-3 rounded-xl">Xem Lại</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <strong>Người nhận:</strong> {formData.customerName}<br/>
              <strong>SĐT:</strong> {formData.phone}<br/>
              <strong>Địa chỉ:</strong> {formData.address}
            </div>

            <div className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6">
              <div className="flex justify-between pt-3 border-t border-white/30 text-lg font-bold">
                <span>Tổng:</span><span>{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(2)} className="flex-1 border py-3 rounded-xl">Quay Lại</button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 bg-[#FF9800] text-white py-3 rounded-xl font-bold hover:bg-[#7CB342] disabled:opacity-50">
                {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && orderResult && (
          <div className="text-center py-8">
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-3">🎉 Thành Công!</h3>
            <p className="text-xl mb-2">Mã: <strong>#{orderResult.orderNumber}</strong></p>
            <button onClick={onClose} className="mt-6 bg-[#7CB342] text-white px-8 py-3 rounded-xl hover:bg-[#FF9800]">
              Đóng
            </button>
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}