import React from "react";
import { CreditCard } from "lucide-react";

const PAYMENT_METHODS = [
  { 
    value: 'cod', 
    label: 'Thanh toán khi nhận hàng (COD)', 
    description: 'Thanh toán bằng tiền mặt khi nhận hàng' 
  },
  { 
    value: 'bank_transfer', 
    label: 'Chuyển khoản ngân hàng', 
    description: 'Chuyển khoản trước khi giao hàng' 
  }
];

/**
 * ShopCheckoutPayment - Chọn phương thức thanh toán
 */
export default function ShopCheckoutPayment({ paymentMethod, setPaymentMethod, primaryColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
        Phương Thức Thanh Toán
      </h2>
      
      <div className="space-y-3">
        {PAYMENT_METHODS.map(method => (
          <label 
            key={method.value}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#7CB342] transition-colors"
          >
            <input
              type="radio"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-medium">{method.label}</p>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}