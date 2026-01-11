import React from "react";
import { motion } from "framer-motion";

export default function ServicesCallToAction() {
  const handleOrderNow = () => {
    const cart = JSON.parse(localStorage.getItem('zerofarm-cart') || '[]');
    if (cart.length > 0) {
      window.dispatchEvent(new CustomEvent('open-checkout-modal', { detail: { cartItems: cart } }));
    } else {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="text-center mt-20"
    >
      <div className="bg-gradient-to-br from-white to-[#F5F9F3] rounded-3xl p-12 shadow-xl border-2 border-[#7CB342]/20">
        <h2 className="font-serif text-[length:var(--font-h2)] font-bold text-[#0F0F0F] mb-4">
          Đặt Hàng Giao Trong Ngày
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-[1.618] text-lg">
          Đặt hàng trước 9h sáng để nhận sản phẩm tươi ngon trong ngày. 
          Miễn phí giao hàng cho đơn từ 200.000đ trong nội thành.
        </p>
        <button 
          onClick={handleOrderNow}
          className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-10 py-4 rounded-full font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-lg"
        >
          Đặt Hàng Ngay
        </button>
      </div>
    </motion.div>
  );
}