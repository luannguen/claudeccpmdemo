import React, { useState, useEffect } from "react";
import EnhancedModal from "../EnhancedModal";
import { 
  Save, QrCode, Wallet, CreditCard, Smartphone, 
  Building2, Banknote 
} from "lucide-react";

const ICON_OPTIONS = [
  { name: 'QrCode', icon: QrCode, label: 'QR Code' },
  { name: 'Wallet', icon: Wallet, label: 'Ví' },
  { name: 'CreditCard', icon: CreditCard, label: 'Thẻ' },
  { name: 'Smartphone', icon: Smartphone, label: 'Mobile' },
  { name: 'Building2', icon: Building2, label: 'Ngân hàng' },
  { name: 'Banknote', icon: Banknote, label: 'Tiền mặt' }
];

export default function PaymentMethodFormModal({ isOpen, onClose, method, onSave }) {
  const [formData, setFormData] = useState(method || {
    method_id: '',
    method_name: '',
    description: '',
    icon_name: 'Wallet',
    fee: 0,
    fee_type: 'fixed',
    fee_percent: 0,
    is_active: true,
    is_default: false,
    is_recommended: false,
    display_order: 0,
    min_order_amount: 0,
    max_order_amount: 0,
    payment_config: {},
    instructions: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (method) setFormData(method);
  }, [method]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      alert('Có lỗi: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={method ? 'Chỉnh Sửa Phương Thức' : 'Thêm Phương Thức Mới'}
      maxWidth="3xl"
      persistPosition={true}
      positionKey="payment-method-modal"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID Phương Thức *</label>
            <input type="text" required value={formData.method_id}
              onChange={(e) => setFormData({...formData, method_id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')})}
              disabled={!!method}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] disabled:bg-gray-50"
              placeholder="bank_transfer" />
            <p className="text-xs text-gray-500 mt-1">Chỉ dùng a-z, 0-9, _</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tên Hiển Thị *</label>
            <input type="text" required value={formData.method_name}
              onChange={(e) => setFormData({...formData, method_name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Chuyển Khoản Ngân Hàng" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô Tả</label>
          <input type="text" value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            placeholder="Quét mã QR hoặc chuyển khoản" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Icon</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ICON_OPTIONS.map(opt => {
              const IconComp = opt.icon;
              return (
                <button key={opt.name} type="button"
                  onClick={() => setFormData({...formData, icon_name: opt.name})}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.icon_name === opt.name
                      ? 'border-[#7CB342] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <IconComp className={`w-6 h-6 mx-auto mb-1 ${
                    formData.icon_name === opt.name ? 'text-[#7CB342]' : 'text-gray-600'
                  }`} />
                  <p className="text-xs text-center">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại Phí</label>
            <select value={formData.fee_type}
              onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]">
              <option value="fixed">Cố định (VNĐ)</option>
              <option value="percent">Phần trăm (%)</option>
            </select>
          </div>
          {formData.fee_type === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Phí (VNĐ)</label>
              <input type="number" value={formData.fee}
                onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="10000" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Phí (%)</label>
              <input type="number" step="0.1" value={formData.fee_percent}
                onChange={(e) => setFormData({...formData, fee_percent: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="2.5" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Thứ Tự</label>
            <input type="number" value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]" />
            <span className="font-medium">Hoạt động</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={formData.is_default}
              onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]" />
            <span className="font-medium">Mặc định</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={formData.is_recommended}
              onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]" />
            <span className="font-medium">Đề xuất</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hướng Dẫn Thanh Toán</label>
          <textarea value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            placeholder="Bước 1: Mở app ngân hàng..." />
        </div>

        {formData.method_id === 'bank_transfer' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Cấu Hình Ngân Hàng
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <input type="text" value={formData.payment_config?.bank_name || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  payment_config: {...formData.payment_config, bank_name: e.target.value}
                })}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7CB342] focus:outline-none"
                placeholder="Vietcombank" />
              <input type="text" value={formData.payment_config?.bank_id || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  payment_config: {...formData.payment_config, bank_id: e.target.value}
                })}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7CB342] focus:outline-none"
                placeholder="VCB" />
              <input type="text" value={formData.payment_config?.account_number || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  payment_config: {...formData.payment_config, account_number: e.target.value}
                })}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7CB342] focus:outline-none"
                placeholder="1234567890" />
              <input type="text" value={formData.payment_config?.account_name || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  payment_config: {...formData.payment_config, account_name: e.target.value}
                })}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7CB342] focus:outline-none"
                placeholder="ZERO FARM" />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button type="submit" disabled={isSaving}
            className="flex-1 bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}