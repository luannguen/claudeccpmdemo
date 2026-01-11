import React from "react";
import { 
  Book, CreditCard, Smartphone, QrCode, Code, ExternalLink,
  CheckCircle, Zap, Shield, TrendingUp, AlertTriangle
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

const INTEGRATION_GUIDES = {
  vietqr: {
    name: 'VietQR - Miễn Phí',
    icon: QrCode,
    color: 'green',
    difficulty: 'Dễ',
    cost: 'Miễn phí',
    setup_time: '5 phút',
    pros: [
      'Hoàn toàn miễn phí, không phí giao dịch',
      'Không cần đăng ký API key',
      'Hỗ trợ 40+ ngân hàng Việt Nam',
      'QR code chuẩn VietQR',
      'Tự động điền thông tin chuyển khoản',
      'Dễ setup, phù hợp startup'
    ],
    cons: [
      'Phải xác nhận thủ công',
      'Không có webhook/IPN',
      'Rủi ro khách chuyển sai số tiền',
      'Admin phải check bank thường xuyên'
    ],
    steps: `
**Bước 1: Cấu hình trong Admin**
1. Vào Admin → Thanh Toán → Phương Thức
2. Tạo/Sửa "Chuyển Khoản Ngân Hàng"
3. Điền thông tin:
   - Mã ngân hàng: VCB, TCB, MB, ACB...
   - Số tài khoản
   - Tên tài khoản

**Bước 2: Test**
1. Khách đặt hàng, chọn "Chuyển Khoản"
2. Hệ thống tự động tạo QR code
3. Khách quét QR → app ngân hàng tự điền
4. Khách chuyển khoản → Bấm "Đã thanh toán"
5. Admin vào "Xác Minh Thanh Toán" để confirm

**Bước 3: Production**
✅ Sẵn sàng sử dụng ngay!
    `,
    code: `// ✅ Function đã có: generateVietQR

// Cách dùng:
const response = await base44.functions.invoke('generateVietQR', {
  bankCode: 'VCB',        // Mã ngân hàng
  accountNumber: '123',   // Số TK
  accountName: 'SHOP',    // Tên TK
  amount: 500000,         // Số tiền
  description: 'ORD-123'  // Nội dung CK
});

// Response:
{
  qrCodeUrl: "https://img.vietqr.io/image/VCB-123-compact2.png?amount=500000&addInfo=ORD-123",
  bankInfo: {...}
}

// ✅ Component đã có: VietQRDisplay
<VietQRDisplay
  orderNumber="ORD-123"
  amount={500000}
  onPaymentConfirmed={handleConfirm}
/>`
  },
  vnpay: {
    name: 'VNPay',
    icon: CreditCard,
    color: 'blue',
    difficulty: 'Trung bình',
    cost: '1.5-3% phí GD',
    setup_time: '1-2 tuần',
    pros: [
      'Tự động xác nhận qua webhook (IPN)',
      'Hỗ trợ thẻ quốc tế (Visa/Master)',
      'ATM, Internet Banking, QR Pay',
      'Uy tín, bảo mật cao',
      'Dashboard quản lý giao dịch',
      'Test sandbox đầy đủ'
    ],
    cons: [
      'Cần ĐKKD, giấy phép',
      'Phí giao dịch 1.5-3%',
      'Thời gian duyệt 1-2 tuần',
      'Cần domain công khai (HTTPS)'
    ],
    steps: `
**Bước 1: Đăng ký VNPay**
1. Truy cập: https://vnpay.vn
2. Đăng ký tài khoản doanh nghiệp
3. Chuẩn bị:
   - ĐKKD (Đăng ký kinh doanh)
   - CMND/CCCD người đại diện
   - Giấy phép kinh doanh (nếu có)
4. Đợi duyệt: 7-14 ngày

**Bước 2: Lấy Credentials**
1. Đăng nhập VNPay Merchant Portal
2. Lấy:
   - TMN Code (Mã website)
   - Hash Secret (Khóa bí mật)
3. Cấu hình Return URL & IPN URL

**Bước 3: Setup trên Admin**
1. Vào Admin → Thanh Toán → Gateway Setup
2. Tab "VNPay"
3. Điền TMN Code, Hash Secret, APP_URL
4. Lưu

**Bước 4: Test Sandbox**
1. Sử dụng thẻ test:
   - Số thẻ: 9704 0000 0000 0018
   - Tên: NGUYEN VAN A
   - Ngày: 03/07
   - OTP: 123456
2. Test full flow: Tạo đơn → VNPay → Callback → Auto-confirm

**Bước 5: Production**
1. Chuyển sang Production URL
2. Update APP_URL sang domain thật (HTTPS)
3. Cấu hình IPN URL trên VNPay portal:
   https://yourdomain.com/api/payment/vnpay/ipn
4. Go live!
    `,
    code: `// ✅ Function đã có: paymentVNPay

// 1. CREATE PAYMENT
const response = await base44.functions.invoke('paymentVNPay', {
  orderId: 'ORD-123',
  amount: 500000,
  orderInfo: 'Đơn hàng Zero Farm',
  returnUrl: 'https://yourdomain.com/payment/vnpay/callback',
  ipAddr: '127.0.0.1'
});

// Response:
{
  success: true,
  paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  txnRef: "ORD-123"
}

// 2. REDIRECT
window.location.href = response.data.paymentUrl;

// 3. IPN WEBHOOK (Auto-called by VNPay)
// Function tự động:
// - Verify signature
// - Update order: payment_status = 'paid'
// - Update order: order_status = 'confirmed'
// - Create activity log

// ✅ Component đã có: VNPayButton
<VNPayButton
  orderId="ORD-123"
  amount={500000}
  orderInfo="Đơn hàng"
  onSuccess={handleSuccess}
  onError={handleError}
/>`
  },
  momo: {
    name: 'MoMo',
    icon: Smartphone,
    color: 'pink',
    difficulty: 'Trung bình',
    cost: '2-3% phí GD',
    setup_time: '1-2 tuần',
    pros: [
      'Phổ biến, 30M+ users',
      'UX tốt, thanh toán nhanh',
      'QR code + App redirect + Deep link',
      'Hỗ trợ BNPL (Buy Now Pay Later)',
      'Webhook auto-confirm',
      'Dashboard analytics'
    ],
    cons: [
      'Cần ĐKKD',
      'Phí 2-3%',
      'Thời gian duyệt 7-14 ngày',
      'Cần domain công khai'
    ],
    steps: `
**Bước 1: Đăng ký MoMo Business**
1. Truy cập: https://business.momo.vn
2. Đăng ký tài khoản doanh nghiệp
3. Chuẩn bị giấy tờ tương tự VNPay
4. Đợi duyệt: 7-14 ngày

**Bước 2: Tạo App và Lấy Credentials**
1. Đăng nhập MoMo Business Portal
2. Tạo App mới
3. Lấy:
   - Partner Code
   - Access Key
   - Secret Key
4. Cấu hình IPN URL

**Bước 3: Setup trên Admin**
1. Vào Admin → Thanh Toán → Gateway Setup
2. Tab "MoMo"
3. Điền Partner Code, Access Key, Secret Key, APP_URL
4. Lưu

**Bước 4: Test Sandbox**
1. Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
2. Test SĐT: 0999999999
3. Test full flow

**Bước 5: Production**
1. Chuyển endpoint: https://payment.momo.vn/v2/gateway/api/create
2. Cấu hình IPN: https://yourdomain.com/api/payment/momo/ipn
3. Go live!
    `,
    code: `// ✅ Function đã có: paymentMoMo

// 1. CREATE PAYMENT
const response = await base44.functions.invoke('paymentMoMo', {
  orderId: 'ORD-123',
  amount: 500000,
  orderInfo: 'Đơn hàng Zero Farm',
  returnUrl: 'https://yourdomain.com/payment/momo/callback',
  ipnUrl: 'https://yourdomain.com/api/payment/momo/ipn'
});

// Response:
{
  success: true,
  payUrl: "https://test-payment.momo.vn/...",
  qrCodeUrl: "https://...",     // QR code image
  deeplink: "momo://...",        // Open MoMo app
  deeplinkMiniApp: "..."
}

// 2. OPTIONS:
// A. Desktop: Show QR code
// B. Mobile: Redirect to payUrl or deeplink

// 3. IPN WEBHOOK (Auto-called by MoMo)
// Function tự động confirm order

// ✅ Component đã có: MoMoButton
<MoMoButton
  orderId="ORD-123"
  amount={500000}
  orderInfo="Đơn hàng"
  showQR={true}  // true = QR, false = redirect
  onSuccess={handleSuccess}
/>`
  }
};

function IntegrationCard({ guide }) {
  const [showCode, setShowCode] = React.useState(false);
  const IconComp = guide.icon;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 border-${guide.color}-200 overflow-hidden`}>
      <div className={`bg-gradient-to-r from-${guide.color}-500 to-${guide.color}-600 text-white p-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <IconComp className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{guide.name}</h3>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="px-2 py-1 bg-white/20 rounded-full">⚡ {guide.difficulty}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full">💰 {guide.cost}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full">⏱️ {guide.setup_time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Pros & Cons */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ưu điểm
            </h4>
            <ul className="space-y-1">
              {guide.pros.map((pro, idx) => (
                <li key={idx} className="text-xs text-green-700 flex items-start gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Nhược điểm
            </h4>
            <ul className="space-y-1">
              {guide.cons.map((con, idx) => (
                <li key={idx} className="text-xs text-red-700 flex items-start gap-2">
                  <span className="flex-shrink-0">✗</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Steps */}
        <div>
          <button
            onClick={() => setShowCode(false)}
            className={`px-4 py-2 rounded-lg font-medium text-sm mr-2 ${
              !showCode ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Hướng Dẫn Setup
          </button>
          <button
            onClick={() => setShowCode(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              showCode ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Code Examples
          </button>
        </div>

        {!showCode ? (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <pre className="text-xs text-gray-800 whitespace-pre-line leading-relaxed">
              {guide.steps}
            </pre>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-4">
            <pre className="text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
              {guide.code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPaymentDocumentationContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hướng Dẫn Tích Hợp Payment</h1>
        <p className="text-gray-600">Tài liệu kỹ thuật và best practices</p>
      </div>

      {/* Quick Comparison */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">⚡ So Sánh Nhanh</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3">Tiêu chí</th>
                <th className="text-center p-3">VietQR</th>
                <th className="text-center p-3">VNPay</th>
                <th className="text-center p-3">MoMo</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              <tr className="border-b border-white/10">
                <td className="p-3">Chi phí</td>
                <td className="text-center p-3">✅ Miễn phí</td>
                <td className="text-center p-3">⚠️ 1.5-3%</td>
                <td className="text-center p-3">⚠️ 2-3%</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Tự động confirm</td>
                <td className="text-center p-3">❌ Thủ công</td>
                <td className="text-center p-3">✅ Auto</td>
                <td className="text-center p-3">✅ Auto</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Thời gian setup</td>
                <td className="text-center p-3">✅ 5 phút</td>
                <td className="text-center p-3">⚠️ 1-2 tuần</td>
                <td className="text-center p-3">⚠️ 1-2 tuần</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Yêu cầu</td>
                <td className="text-center p-3">✅ Chỉ TK ngân hàng</td>
                <td className="text-center p-3">⚠️ ĐKKD</td>
                <td className="text-center p-3">⚠️ ĐKKD</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Thẻ quốc tế</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Khuyến nghị</td>
                <td className="text-center p-3">🌱 Startup</td>
                <td className="text-center p-3">🏢 SME/Enterprise</td>
                <td className="text-center p-3">🛍️ eCommerce</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Guides */}
      <div className="space-y-6 mb-8">
        {Object.entries(INTEGRATION_GUIDES).map(([key, guide]) => (
          <IntegrationCard key={key} guide={guide} />
        ))}
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Code className="w-6 h-6 text-yellow-400" />
          Kiến Trúc Hệ Thống
        </h2>
        
        <div className="bg-black/30 rounded-xl p-6 font-mono text-xs overflow-x-auto">
          <pre className="text-green-400">{`
┌──────────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                              │
└──────────────────────────────────────────────────────────────────┘

1️⃣ Khách chọn sản phẩm → Add to cart
   ↓
2️⃣ Click "Mua Ngay" → Checkout modal opens
   ↓
3️⃣ Điền thông tin → Chọn payment method
   ↓
4️⃣ PAYMENT FLOW (Tùy method):

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    VietQR       │  │     VNPay       │  │      MoMo       │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ 1. Show QR      │  │ 1. Redirect     │  │ 1. QR/Redirect  │
│ 2. User scan    │  │ 2. User pays    │  │ 2. User pays    │
│ 3. User clicks  │  │ 3. Callback     │  │ 3. Callback     │
│    "Đã TT"      │  │ 4. IPN webhook  │  │ 4. IPN webhook  │
│ 4. Wait admin   │  │ 5. Auto-confirm │  │ 5. Auto-confirm │
│    verify       │  │ ✅ DONE         │  │ ✅ DONE         │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND FUNCTIONS                              │
└──────────────────────────────────────────────────────────────────┘

📦 generateVietQR (Public)
   - Input: bankCode, accountNumber, amount, description
   - Output: QR code URL (img.vietqr.io)
   - No webhook

📦 paymentVNPay
   - POST /create → Generate payment URL
   - POST /callback → Verify return
   - POST /ipn → Webhook handler (AUTO-CONFIRM)

📦 paymentMoMo
   - POST /create → Generate payment request
   - POST /callback → Verify return
   - POST /ipn → Webhook handler (AUTO-CONFIRM)

📦 paymentAnalytics
   - GET ?action=overview → Stats
   - GET ?action=transactions → History
   - GET ?action=refunds → Refund tracking
   - GET ?action=daily → Daily breakdown

┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE ENTITIES                              │
└──────────────────────────────────────────────────────────────────┘

📊 Order
   - payment_status: pending → paid → refunded
   - order_status: pending → confirmed → shipping → delivered
   - payment_method: bank_transfer | vnpay | momo | cod

📊 PaymentMethod
   - method_id, method_name, fee, is_active, is_default
   - payment_config (bank details, API keys - via PlatformConfig)

📊 ActivityLog
   - Track all payment actions
   - Auto-created by IPN webhooks

┌──────────────────────────────────────────────────────────────────┐
│                     SECURITY                                     │
└──────────────────────────────────────────────────────────────────┘

🔐 Secrets (Environment Variables):
   - VNPAY_TMN_CODE
   - VNPAY_HASH_SECRET
   - MOMO_PARTNER_CODE
   - MOMO_ACCESS_KEY
   - MOMO_SECRET_KEY
   - APP_URL (for callbacks)

🔐 Signature Verification:
   - VNPay: HMAC-SHA512
   - MoMo: HMAC-SHA256
   - ✅ All webhooks verified before DB update

🔐 Service Role:
   - Webhooks use base44.asServiceRole (admin privileges)
   - Only after signature verification
          `}</pre>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <a
          href="https://sandbox.vnpayment.vn/apis/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white rounded-xl p-4 hover:bg-blue-600 transition-colors flex items-center justify-between group"
        >
          <div>
            <p className="font-bold">VNPay Docs</p>
            <p className="text-xs opacity-90">Official API</p>
          </div>
          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>

        <a
          href="https://developers.momo.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-500 text-white rounded-xl p-4 hover:bg-pink-600 transition-colors flex items-center justify-between group"
        >
          <div>
            <p className="font-bold">MoMo Docs</p>
            <p className="text-xs opacity-90">Developer Portal</p>
          </div>
          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>

        <a
          href="https://img.vietqr.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white rounded-xl p-4 hover:bg-green-600 transition-colors flex items-center justify-between group"
        >
          <div>
            <p className="font-bold">VietQR API</p>
            <p className="text-xs opacity-90">Free QR Generator</p>
          </div>
          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );
}

export default function AdminPaymentDocumentation() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPaymentDocumentationContent />
      </AdminLayout>
    </AdminGuard>
  );
}