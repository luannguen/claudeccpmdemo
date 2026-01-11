import React, { useState } from "react";
import EnhancedModal from "../EnhancedModal";
import { Send, Mail, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { showAdminAlert } from "@/components/AdminAlert";

export default function TestEmailModal({ isOpen, onClose, template }) {
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      console.log('🧪 [TEST EMAIL] Starting test send...');
      console.log('🧪 Template:', template.name);
      console.log('🧪 Recipient:', testEmail);

      // Sample data for testing
      const sampleData = {
        order_number: 'TEST-' + Date.now().toString().slice(-6),
        customer_name: 'Khách Hàng Test',
        customer_email: testEmail,
        customer_phone: '0987654321',
        total_amount: '1,250,000',
        shipping_address: '123 Đường Test, Phường ABC, Quận 1, TP.HCM',
        order_date: new Date().toLocaleDateString('vi-VN'),
        tracking_number: 'TEST123456',
        payment_method: 'Chuyển khoản ngân hàng',
        shop_name: 'Farmer Smart',
        items: '[3 sản phẩm test]'
      };

      console.log('🧪 Sample data:', sampleData);

      // Replace variables
      let emailContent = template.html_content;
      let emailSubject = template.subject;
      
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        emailContent = emailContent.replace(regex, value);
        emailSubject = emailSubject.replace(regex, value);
      });

      console.log('🧪 Final subject:', emailSubject);
      console.log('🧪 Content length:', emailContent.length);

      const emailPayload = {
        from_name: 'Farmer Smart (TEST)',
        to: testEmail,
        subject: '[TEST] ' + emailSubject,
        body: emailContent
      };

      console.log('🧪 Calling SendEmail integration...');
      console.log('🧪 Payload:', { ...emailPayload, body: '[HTML content]' });

      const response = await base44.integrations.Core.SendEmail(emailPayload);

      console.log('✅ SendEmail response:', response);
      console.log('✅ Email sent successfully!');

      showAdminAlert('✅ Email test đã được gửi! Kiểm tra hộp thư (và spam folder)', 'success');
      onClose();
    } catch (error) {
      console.error('❌ [TEST EMAIL] Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      showAdminAlert('❌ Lỗi: ' + error.message + ' - Xem console để biết chi tiết', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!template) return null;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi Email Test"
      maxWidth="md"
    >
      <form onSubmit={handleSendTest} className="p-6 space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">Template: {template.name}</p>
              <p className="text-sm text-blue-700">Subject: {template.subject}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Nhận Test *</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            placeholder="your.email@example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Email test sẽ sử dụng dữ liệu mẫu. Kiểm tra hộp thư và spam folder sau khi gửi.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="flex-1 px-4 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi Test
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}