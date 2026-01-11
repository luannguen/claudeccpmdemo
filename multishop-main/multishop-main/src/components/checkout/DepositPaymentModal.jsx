import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { useToast } from "@/components/NotificationToast";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DepositPaymentModal({ order, isOpen, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Chuyển Khoản Ngân Hàng",
      icon: "Banknote",
      description: "Chuyển khoản và upload ảnh xác nhận"
    },
    {
      id: "momo",
      name: "MoMo",
      icon: "Wallet",
      description: "Thanh toán qua ví MoMo"
    },
    {
      id: "vnpay",
      name: "VNPay",
      icon: "CreditCard",
      description: "Thanh toán qua cổng VNPay"
    }
  ];

  const updateDepositMutation = useMutation({
    mutationFn: async ({ orderId, status, proofUrl = null }) => {
      await base44.entities.Order.update(orderId, {
        deposit_status: status,
        deposit_paid_date: status === 'paid' ? new Date().toISOString() : undefined,
        payment_status: status === 'paid' ? 'deposit_paid' : 'pending',
        order_status: status === 'paid' ? 'confirmed' : 'pending',
        internal_note: proofUrl ? `Đã upload proof: ${proofUrl}` : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      addToast('Đã cập nhật trạng thái thanh toán', 'success');
      onClose();
    },
    onError: (error) => {
      addToast(error.message || 'Có lỗi khi cập nhật', 'error');
      setIsProcessing(false);
    }
  });

  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);

    try {
      if (selectedMethod === "bank_transfer") {
        // Upload proof of payment
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) {
            setIsProcessing(false);
            return;
          }

          // Upload file
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          
          // Update order with proof
          updateDepositMutation.mutate({ 
            orderId: order.id, 
            status: 'paid',
            proofUrl: file_url 
          });
        };

        fileInput.click();
      } else if (selectedMethod === "momo") {
        // Call MoMo payment function
        const response = await base44.functions.invoke('paymentMoMo', {
          orderId: order.id,
          amount: order.deposit_amount,
          orderInfo: `Cọc đơn hàng ${order.order_number}`
        });

        if (response.data.payUrl) {
          window.location.href = response.data.payUrl;
        }
      } else if (selectedMethod === "vnpay") {
        // Call VNPay payment function
        const response = await base44.functions.invoke('paymentVNPay', {
          orderId: order.id,
          amount: order.deposit_amount,
          orderInfo: `Cọc đơn hàng ${order.order_number}`
        });

        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        }
      }
    } catch (error) {
      addToast(error.message || 'Có lỗi khi thanh toán', 'error');
      setIsProcessing(false);
    }
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center md:p-4"
          >
            <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Mobile drag handle */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">💰 Thanh Toán Cọc</h2>
                  <p className="text-sm text-gray-600 mt-1">Đơn hàng #{order.order_number}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon.X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Amount Info */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Số tiền cọc:</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {order.deposit_amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Còn lại khi nhận hàng:</span>
                    <span className="font-semibold text-gray-900">
                      {order.remaining_amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Chọn phương thức:</h3>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const MethodIcon = Icon[method.icon];
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedMethod === method.id
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedMethod === method.id ? 'bg-amber-100' : 'bg-gray-100'
                            }`}>
                              <MethodIcon size={20} className={
                                selectedMethod === method.id ? 'text-amber-600' : 'text-gray-600'
                              } />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{method.name}</p>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                            {selectedMethod === method.id && (
                              <Icon.CheckCircle size={24} className="text-amber-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Transfer Info */}
                {selectedMethod === "bank_transfer" && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Thông tin chuyển khoản:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Ngân hàng:</span>
                        <span className="font-semibold text-blue-900">Vietcombank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Số tài khoản:</span>
                        <span className="font-semibold text-blue-900">1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Chủ TK:</span>
                        <span className="font-semibold text-blue-900">FARMER SMART</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Nội dung:</span>
                        <span className="font-semibold text-blue-900">{order.order_number}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-3">
                      * Sau khi chuyển khoản, vui lòng upload ảnh xác nhận
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Icon.Spinner size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Icon.CreditCard size={20} />
                      Thanh Toán Ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}