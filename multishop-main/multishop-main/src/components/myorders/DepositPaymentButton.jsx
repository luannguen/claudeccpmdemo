import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import DepositPaymentModal from "@/components/checkout/DepositPaymentModal";

export default function DepositPaymentButton({ order }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for orders with pending deposit
  if (!order || order.deposit_status !== 'pending' || !order.deposit_amount) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
      >
        <Icon.CreditCard size={20} />
        Thanh Toán Cọc {order.deposit_amount.toLocaleString('vi-VN')}đ
      </button>

      <DepositPaymentModal
        order={order}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}