import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Building2, Smartphone, Upload, 
  CheckCircle, Loader
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PaymentGateway({ invoice, tenant, onPaymentComplete }) {
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferProof, setTransferProof] = useState(null);
  const [payerInfo, setPayerInfo] = useState({
    name: tenant?.owner_name || '',
    email: tenant?.owner_email || '',
    phone: tenant?.phone || ''
  });

  const PAYMENT_METHODS = [
    {
      key: 'bank_transfer',
      name: 'Chuyển Khoản Ngân Hàng',
      icon: Building2,
      color: 'blue'
    },
    {
      key: 'momo',
      name: 'Ví MoMo',
      icon: Smartphone,
      color: 'pink'
    },
    {
      key: 'vnpay',
      name: 'VNPay',
      icon: CreditCard,
      color: 'orange'
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setTransferProof(file_url);
    } catch (error) {
      alert('Không thể upload file.');
    }
  };

  const handleSubmitPayment = async () => {
    if (selectedMethod === 'bank_transfer' && !transferProof) {
      alert('Vui lòng upload chứng từ!');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        tenant_id: tenant?.id,
        invoice_id: invoice.id,
        subscription_id: invoice.subscription_id,
        payment_method: selectedMethod,
        amount: invoice.total_amount,
        status: selectedMethod === 'bank_transfer' ? 'pending' : 'processing',
        payment_date: new Date().toISOString(),
        payer_info: payerInfo,
        bank_transfer_proof: transferProof,
        transaction_id: `TXN-${Date.now()}`
      };

      const payment = await base44.entities.Payment.create(paymentData);

      if (selectedMethod === 'bank_transfer') {
        await base44.entities.Invoice.update(invoice.id, {
          status: 'sent',
          payment_id: payment.id
        });
        alert('✅ Đã nhận chứng từ! Chúng tôi sẽ xác nhận trong 24h.');
      } else {
        setTimeout(async () => {
          await base44.entities.Payment.update(payment.id, {
            status: 'completed',
            confirmed_date: new Date().toISOString()
          });

          await base44.entities.Invoice.update(invoice.id, {
            status: 'paid',
            paid_date: new Date().toISOString()
          });

          await base44.entities.Subscription.update(invoice.subscription_id, {
            status: 'active',
            last_payment_date: new Date().toISOString()
          });

          if (onPaymentComplete) onPaymentComplete();
        }, 2000);
      }

      if (onPaymentComplete && selectedMethod === 'bank_transfer') {
        onPaymentComplete();
      }
    } catch (error) {
      alert('Có lỗi xảy ra.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-[#0F0F0F] mb-4">Chọn Phương Thức Thanh Toán</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedMethod(method.key)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedMethod === method.key
                  ? 'border-[#7CB342] bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <h4 className="font-bold">{method.name}</h4>
            </motion.div>
          );
        })}
      </div>

      {selectedMethod === 'bank_transfer' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold mb-4">Thông Tin Chuyển Khoản</h4>
          <div className="space-y-2 text-sm mb-4">
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>STK:</strong> 0123456789</p>
            <p><strong>Chủ TK:</strong> ZERO FARM</p>
            <p><strong>Số tiền:</strong> {invoice.total_amount.toLocaleString('vi-VN')}đ</p>
            <p><strong>Nội dung:</strong> {invoice.invoice_number}</p>
          </div>

          <label className="block text-sm font-medium mb-2">Upload Chứng Từ *</label>
          <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            id="transfer-proof"
          />
          <label
            htmlFor="transfer-proof"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-100"
          >
            <Upload className="w-5 h-5" />
            {transferProof ? 'Đã upload ✓' : 'Click để upload'}
          </label>
          {transferProof && (
            <img src={transferProof} alt="Proof" className="mt-3 max-h-40 rounded-lg" />
          )}
        </div>
      )}

      <button
        onClick={handleSubmitPayment}
        disabled={isProcessing || (selectedMethod === 'bank_transfer' && !transferProof)}
        className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Thanh Toán
          </>
        )}
      </button>
    </div>
  );
}