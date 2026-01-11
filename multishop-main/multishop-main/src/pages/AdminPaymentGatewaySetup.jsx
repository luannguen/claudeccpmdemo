import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Key, Eye, EyeOff, Save, AlertCircle, CheckCircle,
  Smartphone, QrCode, Zap, ExternalLink, Copy, Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

const GATEWAY_CONFIGS = {
  vnpay: {
    name: 'VNPay',
    icon: CreditCard,
    color: 'blue',
    fields: [
      { key: 'VNPAY_TMN_CODE', label: 'TMN Code', type: 'text', required: true },
      { key: 'VNPAY_HASH_SECRET', label: 'Hash Secret', type: 'password', required: true },
      { key: 'APP_URL', label: 'Return URL', type: 'text', required: true, placeholder: 'https://yourdomain.com' }
    ],
    docs: 'https://sandbox.vnpayment.vn/apis/',
    instructions: `
**Bước 1:** Đăng ký tài khoản tại https://vnpay.vn

**Bước 2:** Lấy thông tin:
- TMN Code: Mã định danh website
- Hash Secret: Khóa bí mật để mã hóa

**Bước 3:** Cấu hình Webhook URL:
- IPN URL: \`https://yourdomain.com/api/payment/vnpay/ipn\`
- Return URL: \`https://yourdomain.com/payment/vnpay/callback\`

**Bước 4:** Test với Sandbox:
- Thẻ test: 9704 0000 0000 0018
- Tên: NGUYEN VAN A
- Ngày phát hành: 03/07
- OTP: 123456

**Lưu ý:**
- Sandbox URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
- Production URL: https://vnpayment.vn/paymentv2/vpcpay.html
    `
  },
  momo: {
    name: 'MoMo',
    icon: Smartphone,
    color: 'pink',
    fields: [
      { key: 'MOMO_PARTNER_CODE', label: 'Partner Code', type: 'text', required: true },
      { key: 'MOMO_ACCESS_KEY', label: 'Access Key', type: 'text', required: true },
      { key: 'MOMO_SECRET_KEY', label: 'Secret Key', type: 'password', required: true },
      { key: 'APP_URL', label: 'Return URL', type: 'text', required: true, placeholder: 'https://yourdomain.com' }
    ],
    docs: 'https://developers.momo.vn/',
    instructions: `
**Bước 1:** Đăng ký tại https://business.momo.vn/

**Bước 2:** Tạo app và lấy credentials:
- Partner Code
- Access Key  
- Secret Key

**Bước 3:** Cấu hình IPN URL:
- \`https://yourdomain.com/api/payment/momo/ipn\`

**Bước 4:** Test với Sandbox:
- Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
- Test SĐT: 0999999999

**Lưu ý:**
- Payment Gateway = All-in-One (AIO)
- Hỗ trợ: Ví MoMo, ATM, Visa/Master, BNPL
    `
  },
  vietqr: {
    name: 'VietQR (Free)',
    icon: QrCode,
    color: 'green',
    fields: [
      { key: 'BANK_CODE', label: 'Mã Ngân Hàng', type: 'text', required: true, placeholder: 'VCB, TCB, MB...' },
      { key: 'BANK_ACCOUNT_NUMBER', label: 'Số Tài Khoản', type: 'text', required: true },
      { key: 'BANK_ACCOUNT_NAME', label: 'Tên Tài Khoản', type: 'text', required: true }
    ],
    docs: 'https://img.vietqr.io/docs',
    instructions: `
**VietQR - Miễn Phí 100%**

Sử dụng API img.vietqr.io (không cần đăng ký)

**Bước 1:** Chuẩn bị thông tin:
- Mã ngân hàng (VCB, TCB, MB, ACB...)
- Số tài khoản
- Tên tài khoản

**Bước 2:** Hệ thống tự động tạo QR code

**Ngân hàng hỗ trợ:**
VCB, TCB, MB, VIB, ACB, TPB, BIDV, VTB, SHB, MSB, 
VPBank, ABBANK, SCB, OCB, SeABank, NamABank...

**Ưu điểm:**
✅ Hoàn toàn miễn phí
✅ Không cần API key
✅ Hỗ trợ 40+ ngân hàng
✅ QR chuẩn VietQR
✅ Khách quét = tự động điền thông tin

**Nhược điểm:**
❌ Phải xác nhận thủ công
❌ Không có auto-confirm
    `
  }
};

function GatewaySetupCard({ gateway, config }) {
  const [formData, setFormData] = useState(() => {
    const data = {};
    config.fields.forEach(field => {
      data[field.key] = '';
    });
    return data;
  });
  const [showSecrets, setShowSecrets] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const IconComp = config.icon;

  const handleSave = async () => {
    // Validate required fields
    const missingFields = config.fields.filter(f => f.required && !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      alert(`Vui lòng điền: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      // Save to PlatformConfig
      for (const field of config.fields) {
        if (formData[field.key]) {
          const existing = await base44.entities.PlatformConfig.list('-created_date', 100);
          const existingConfig = existing.find(c => c.config_key === field.key);

          if (existingConfig) {
            await base44.entities.PlatformConfig.update(existingConfig.id, {
              config_value: formData[field.key],
              last_modified_by: (await base44.auth.me()).email,
              last_modified_date: new Date().toISOString()
            });
          } else {
            await base44.entities.PlatformConfig.create({
              config_key: field.key,
              config_name: field.label,
              config_value: formData[field.key],
              config_type: 'string',
              category: 'payment',
              description: `${config.name} - ${field.label}`,
              is_public: false,
              is_editable: true,
              last_modified_by: (await base44.auth.me()).email
            });
          }
        }
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);

    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText(config.instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 border-${config.color}-200 overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white p-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <IconComp className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{config.name}</h3>
            <p className="text-sm opacity-90">Cấu hình tích hợp thanh toán</p>
          </div>
          <a
            href={config.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Docs
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {config.fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showSecrets[field.key] ? 'text' : field.type}
                value={formData[field.key]}
                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] pr-12"
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowSecrets({...showSecrets, [field.key]: !showSecrets[field.key]})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Đã lưu thành công!
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Lỗi! Thử lại
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu Cấu Hình
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7CB342]" />
              Hướng Dẫn Tích Hợp
            </h4>
            <button
              onClick={copyInstructions}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã copy' : 'Copy'}
            </button>
          </div>
          <div className="text-xs text-gray-700 space-y-2 whitespace-pre-line leading-relaxed">
            {config.instructions}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPaymentGatewaySetupContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cấu Hình Payment Gateway</h1>
        <p className="text-gray-600">Thiết lập tích hợp với các cổng thanh toán</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-blue-900 mb-2">💡 Hướng Dẫn Sử Dụng</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✅ <strong>VietQR:</strong> Miễn phí, dễ setup, phù hợp startup - Xác nhận thủ công</li>
              <li>✅ <strong>VNPay:</strong> Tự động xác nhận, hỗ trợ thẻ quốc tế - Cần đăng ký doanh nghiệp</li>
              <li>✅ <strong>MoMo:</strong> Phổ biến, UX tốt, BNPL - Cần đăng ký doanh nghiệp</li>
              <li>⚠️ <strong>Webhook URL:</strong> Cần domain công khai (không dùng localhost)</li>
              <li>🔐 <strong>Bảo mật:</strong> Không chia sẻ Secret Key với ai</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {Object.entries(GATEWAY_CONFIGS).map(([key, config]) => (
          <GatewaySetupCard key={key} gateway={key} config={config} />
        ))}
      </div>

      {/* Technical Notes */}
      <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Technical Notes
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-yellow-400 mb-1">Backend Functions Available:</p>
            <ul className="ml-4 space-y-1 text-gray-300">
              <li>• <code className="bg-white/10 px-2 py-0.5 rounded">paymentVNPay</code> - VNPay integration</li>
              <li>• <code className="bg-white/10 px-2 py-0.5 rounded">paymentMoMo</code> - MoMo integration</li>
              <li>• <code className="bg-white/10 px-2 py-0.5 rounded">generateVietQR</code> - QR generator (FREE)</li>
              <li>• <code className="bg-white/10 px-2 py-0.5 rounded">paymentAnalytics</code> - Analytics & reporting</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium text-yellow-400 mb-1">IPN/Webhook URLs:</p>
            <ul className="ml-4 space-y-1 text-gray-300">
              <li>• VNPay IPN: <code className="bg-white/10 px-2 py-0.5 rounded text-xs">https://yourdomain.com/api/payment/vnpay/ipn</code></li>
              <li>• MoMo IPN: <code className="bg-white/10 px-2 py-0.5 rounded text-xs">https://yourdomain.com/api/payment/momo/ipn</code></li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-yellow-400 mb-1">Auto-Confirm Flow:</p>
            <div className="ml-4 text-gray-300 text-xs">
              <p>1. Customer completes payment on gateway</p>
              <p>2. Gateway sends IPN webhook to server</p>
              <p>3. Server verifies signature</p>
              <p>4. Auto-update order: <code className="bg-white/10 px-1 rounded">payment_status = 'paid'</code>, <code className="bg-white/10 px-1 rounded">order_status = 'confirmed'</code></p>
              <p>5. Activity log created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentGatewaySetup() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPaymentGatewaySetupContent />
      </AdminLayout>
    </AdminGuard>
  );
}