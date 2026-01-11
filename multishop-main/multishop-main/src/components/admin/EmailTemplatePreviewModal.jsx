import React from "react";
import EnhancedModal from "../EnhancedModal";
import { Mail } from "lucide-react";

export default function EmailTemplatePreviewModal({ isOpen, onClose, template }) {
  if (!template) return null;

  // Sample data for preview
  const sampleData = {
    order_number: 'FS20241115001',
    customer_name: 'Nguyễn Văn A',
    customer_email: 'customer@example.com',
    customer_phone: '0987654321',
    total_amount: '1,250,000',
    shipping_address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    order_date: new Date().toLocaleDateString('vi-VN'),
    tracking_number: 'VN123456789',
    payment_method: 'bank_transfer',
    shop_name: 'Farmer Smart',
    items: '[3 sản phẩm]'
  };

  // Replace variables in content
  let previewContent = template.html_content;
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    previewContent = previewContent.replace(regex, value);
  });

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-[#7CB342]" />
          <div>
            <h2 className="font-bold text-xl">{template.name}</h2>
            <p className="text-sm text-gray-600 font-normal">{template.subject}</p>
          </div>
        </div>
      }
      maxWidth="4xl"
    >
      <div className="p-6">
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ Preview với dữ liệu mẫu - Email thực tế sẽ thay thế biến bằng dữ liệu đơn hàng
          </p>
        </div>

        {/* Email Preview */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Email Preview</span>
            </div>
            <div className="text-xs text-gray-500">
              Subject: <span className="font-medium text-gray-700">{template.subject}</span>
            </div>
          </div>
          
          <div 
            className="p-6 max-h-[600px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
}