import React, { useState, useEffect } from "react";
import EnhancedModal from "../EnhancedModal";
import { Code, Eye, Save, X } from "lucide-react";

const templateTypes = [
  { value: 'order_confirmation', label: '✅ Xác nhận đơn hàng' },
  { value: 'shipping_notification', label: '🚚 Thông báo giao hàng' },
  { value: 'delivery_confirmation', label: '🎉 Xác nhận đã giao' },
  { value: 'payment_confirmed', label: '💳 Xác nhận thanh toán' },
  { value: 'order_cancelled', label: '❌ Đơn hàng bị hủy' },
  { value: 'payment_failed', label: '⚠️ Thanh toán thất bại' },
  { value: 'review_request', label: '⭐ Yêu cầu đánh giá' },
  { value: 'welcome_email', label: '👋 Email chào mừng' },
  { value: 'custom', label: '⚙️ Tùy chỉnh' }
];

const availableVariables = [
  '{{order_number}}', '{{customer_name}}', '{{customer_email}}',
  '{{customer_phone}}', '{{total_amount}}', '{{shipping_address}}',
  '{{order_date}}', '{{tracking_number}}', '{{items}}',
  '{{payment_method}}', '{{shop_name}}'
];

export default function EmailTemplateFormModal({ isOpen, onClose, onSubmit, template, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'order_confirmation',
    subject: '',
    html_content: '',
    description: '',
    variables: [],
    is_active: true,
    is_default: false
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'order_confirmation',
        subject: template.subject || '',
        html_content: template.html_content || '',
        description: template.description || '',
        variables: template.variables || [],
        is_active: template.is_active ?? true,
        is_default: template.is_default ?? false
      });
    } else {
      setFormData({
        name: '',
        type: 'order_confirmation',
        subject: '',
        html_content: '',
        description: '',
        variables: [],
        is_active: true,
        is_default: false
      });
    }
  }, [template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('html-content-textarea');
    const cursorPos = textarea.selectionStart;
    const textBefore = formData.html_content.substring(0, cursorPos);
    const textAfter = formData.html_content.substring(cursorPos);
    
    setFormData({
      ...formData,
      html_content: textBefore + variable + textAfter
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
    }, 0);
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Chỉnh Sửa Template' : 'Tạo Template Mới'}
      maxWidth="6xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên Template *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                placeholder="VD: Xác nhận đơn hàng - Phiên bản 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Loại Template *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                required
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tiêu Đề Email *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                placeholder="VD: ✅ Xác nhận đơn hàng #{{order_number}}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô Tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] resize-none"
                placeholder="Mô tả ngắn về template..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-[#7CB342] rounded"
                />
                <span className="text-sm font-medium">Kích hoạt</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-5 h-5 text-[#7CB342] rounded"
                />
                <span className="text-sm font-medium">Đặt làm mặc định</span>
              </label>
            </div>

            {/* Available Variables */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Biến có thể dùng
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map(variable => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono hover:bg-blue-100 transition-colors"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - HTML Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Nội Dung HTML *</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {showPreview ? 'Ẩn preview' : 'Xem preview'}
              </button>
            </div>

            <textarea
              id="html-content-textarea"
              value={formData.html_content}
              onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] font-mono text-sm resize-none"
              placeholder="Nhập HTML email tại đây..."
              required
            />

            {showPreview && (
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-auto">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {template ? 'Cập Nhật' : 'Tạo Template'}
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}