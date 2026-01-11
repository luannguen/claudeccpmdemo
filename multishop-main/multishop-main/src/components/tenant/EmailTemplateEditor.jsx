import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Eye, Save, RefreshCw, Send, CheckCircle,
  Smartphone, Monitor, Code
} from "lucide-react";

const DEFAULT_TEMPLATES = {
  order_confirmation: {
    name: "Xác Nhận Đơn Hàng",
    subject: "Đơn hàng {{order_number}} đã được xác nhận",
    body: `Xin chào {{customer_name}},

Cảm ơn bạn đã đặt hàng tại {{farm_name}}!

📦 Mã đơn hàng: {{order_number}}
💰 Tổng tiền: {{total_amount}}đ
📅 Ngày giao hàng dự kiến: {{delivery_date}}

Chi tiết đơn hàng:
{{order_items}}

Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận giao hàng.

Trân trọng,
{{farm_name}}
{{farm_phone}}`,
    variables: ["customer_name", "farm_name", "order_number", "total_amount", "delivery_date", "order_items", "farm_phone"]
  },
  order_shipped: {
    name: "Thông Báo Giao Hàng",
    subject: "Đơn hàng {{order_number}} đang được giao",
    body: `Xin chào {{customer_name}},

Đơn hàng của bạn đang trên đường giao đến!

📦 Mã đơn: {{order_number}}
🚚 Mã vận đơn: {{tracking_number}}
👤 Shipper: {{shipper_name}} - {{shipper_phone}}
📍 Địa chỉ giao: {{delivery_address}}

Vui lòng chuẩn bị nhận hàng trong khung giờ {{delivery_time}}.

Cảm ơn bạn đã tin tưởng {{farm_name}}!

Trân trọng,
{{farm_name}}`,
    variables: ["customer_name", "order_number", "tracking_number", "shipper_name", "shipper_phone", "delivery_address", "delivery_time", "farm_name"]
  },
  welcome: {
    name: "Email Chào Mừng",
    subject: "Chào mừng đến với {{farm_name}}!",
    body: `Xin chào {{customer_name}},

Chào mừng bạn đến với {{farm_name}} - trang trại organic 100% tự nhiên!

🌱 Chúng tôi cam kết mang đến cho bạn những sản phẩm tươi ngon, an toàn nhất.

Khám phá ngay:
- 🥬 Rau củ organic tươi hàng ngày
- 🍎 Trái cây sạch không hóa chất
- 🌾 Gạo & ngũ cốc hữu cơ

👉 Xem sản phẩm: {{website_url}}

Nhận ngay mã giảm giá 10% cho đơn đầu tiên:
Mã: WELCOME10

Trân trọng,
Đội ngũ {{farm_name}}`,
    variables: ["customer_name", "farm_name", "website_url"]
  }
};

export default function EmailTemplateEditor({ tenant, onSave }) {
  const [selectedTemplate, setSelectedTemplate] = useState('order_confirmation');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isSaving, setIsSaving] = useState(false);
  
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const currentTemplate = templates[selectedTemplate];

  const [subject, setSubject] = useState(currentTemplate.subject);
  const [body, setBody] = useState(currentTemplate.body);

  React.useEffect(() => {
    setSubject(currentTemplate.subject);
    setBody(currentTemplate.body);
  }, [selectedTemplate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedTemplates = {
        ...templates,
        [selectedTemplate]: {
          ...currentTemplate,
          subject,
          body
        }
      };
      
      if (onSave) {
        await onSave({ email_templates: updatedTemplates });
      }
      
      setTemplates(updatedTemplates);
      alert('✅ Đã lưu template!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const confirm = window.confirm('Bạn có chắc muốn reset về template mặc định?');
    if (confirm) {
      setSubject(DEFAULT_TEMPLATES[selectedTemplate].subject);
      setBody(DEFAULT_TEMPLATES[selectedTemplate].body);
    }
  };

  const insertVariable = (variable) => {
    setBody(body + `{{${variable}}}`);
  };

  const renderPreview = () => {
    // Replace variables with sample data
    let previewBody = body;
    const sampleData = {
      customer_name: "Nguyễn Văn A",
      farm_name: tenant?.organization_name || "Zero Farm",
      order_number: "ZF-2024-001",
      total_amount: "500,000",
      delivery_date: "20/01/2024",
      order_items: "- Rau xà lách: 2kg x 25,000đ\n- Cà chua: 1kg x 30,000đ",
      farm_phone: tenant?.phone || "0987654321",
      tracking_number: "VN123456789",
      shipper_name: "Nguyễn Văn B",
      shipper_phone: "0912345678",
      delivery_address: tenant?.address || "123 Đường ABC, Q.1, TP.HCM",
      delivery_time: "14:00 - 16:00",
      website_url: `https://zerofarm.vn/${tenant?.slug}`
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      previewBody = previewBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return (
      <div 
        className={`bg-white rounded-xl shadow-lg transition-all ${
          previewDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'
        }`}
      >
        <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] p-6 rounded-t-xl">
          <h3 className="text-white font-bold text-lg">{tenant?.organization_name || "Zero Farm"}</h3>
          <p className="text-white/80 text-sm">100% Organic</p>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-lg">
            {subject.replace(/{{(\w+)}}/g, (_, key) => sampleData[key] || `{{${key}}}`)}
          </h4>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {previewBody}
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-b-xl border-t">
          <p className="text-xs text-gray-500 text-center">
            © 2024 {tenant?.organization_name || "Zero Farm"}. All rights reserved.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#7CB342]" />
            Email Template Editor
          </h3>

          {/* Template Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              {Object.entries(templates).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Line */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Email subject..."
            />
          </div>

          {/* Variables */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Biến Động (Click để chèn)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTemplate.variables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none font-mono text-sm"
              placeholder="Email body..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu Template
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F0F0F] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#7CB342]" />
              Preview
            </h3>
            <div className="flex gap-2">
              {[
                { key: 'mobile', icon: Smartphone },
                { key: 'desktop', icon: Monitor }
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPreviewDevice(key)}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === key
                      ? 'bg-[#7CB342] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 flex justify-center">
            {renderPreview()}
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="font-bold text-blue-900 mb-4">🧪 Test Email</h4>
          <p className="text-sm text-blue-800 mb-4">
            Gửi email test để xem template trông như thế nào trong inbox thật
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Gửi Test
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h4 className="font-bold text-yellow-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Giữ subject line dưới 50 ký tự</li>
            <li>• Sử dụng emoji để thu hút chú ý</li>
            <li>• Cá nhân hóa với biến động</li>
            <li>• Kết thúc với CTA rõ ràng</li>
          </ul>
        </div>
      </div>
    </div>
  );
}