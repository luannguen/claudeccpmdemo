/**
 * 📦 Customer Return Modal - Self-service return request
 * 
 * ✅ Features:
 * - Select items to return (full or partial)
 * - Choose return reason
 * - Upload evidence photos/videos
 * - Select refund method (bank transfer, store credit, original)
 * - Real-time status updates
 * - Mobile-optimized
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Package, CheckCircle, Upload, Camera, Video, 
  CreditCard, Wallet, DollarSign, AlertCircle, ChevronRight
} from 'lucide-react';
import ReturnService from './ReturnService';
import EnhancedModal from '../EnhancedModal';
import { createPageUrl } from '@/utils';

const RETURN_REASONS = [
  { value: 'wrong_item', label: 'Gửi nhầm sản phẩm', icon: Package },
  { value: 'damaged', label: 'Hàng bị hư hỏng', icon: AlertCircle },
  { value: 'defective', label: 'Hàng lỗi/không hoạt động', icon: AlertCircle },
  { value: 'not_as_described', label: 'Không đúng mô tả', icon: Package },
  { value: 'quality_issue', label: 'Chất lượng không tốt', icon: Package },
  { value: 'changed_mind', label: 'Đổi ý không muốn nữa', icon: Package },
  { value: 'late_delivery', label: 'Giao hàng quá trễ', icon: Package },
  { value: 'other', label: 'Lý do khác', icon: Package }
];

const REFUND_METHODS = [
  { value: 'original_payment', label: 'Hoàn về PT gốc', description: 'Về tài khoản/thẻ ban đầu', icon: CreditCard, bonus: '' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', description: 'Chuyển về TK khác', icon: DollarSign, bonus: '' },
  { value: 'store_credit', label: 'Tích điểm mua sau', description: 'Tích lũy dùng cho đơn kế', icon: Wallet, bonus: '+5% bonus' }
];

export default function CustomerReturnModal({ isOpen, onClose, order }) {
  const [step, setStep] = useState(1); // 1: items, 2: reason, 3: evidence, 4: refund method
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [evidenceVideos, setEvidenceVideos] = useState([]);
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleItemToggle = (itemIndex) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.itemIndex === itemIndex);
      
      if (exists) {
        return prev.filter(i => i.itemIndex !== itemIndex);
      } else {
        const item = order.items[itemIndex];
        return [...prev, {
          itemIndex,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          return_amount: item.subtotal,
          reason: returnReason
        }];
      }
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const url = await ReturnService.uploadEvidence(file);
        setEvidencePhotos(prev => [...prev, url]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm muốn trả');
      return;
    }
    if (!returnReason) {
      alert('Vui lòng chọn lý do trả hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      await ReturnService.createReturnRequest({
        order,
        returnItems: selectedItems,
        returnType: selectedItems.length === order.items.length ? 'full' : 'partial',
        returnReason,
        reasonDetail,
        evidencePhotos,
        evidenceVideos,
        refundMethod,
        customerNotes: reasonDetail
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.href = createPageUrl('MyReturns');
      }, 2000);
    } catch (error) {
      console.error('Return request failed:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Yêu Cầu Trả Hàng"
      maxWidth="3xl"
      persistPosition={true}
    >
      <div className="p-6">
        {success ? (
          <div className="text-center py-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Gửi Yêu Cầu Thành Công!</h3>
            <p className="text-gray-600">Chúng tôi sẽ xem xét và phản hồi trong vòng 24h.</p>
          </div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s === step ? 'bg-[#7CB342] text-white scale-110' :
                    s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  } transition-all`}>
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && <div className={`w-16 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Select Items */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Chọn sản phẩm muốn trả</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {order.items?.map((item, idx) => {
                    const isSelected = selectedItems.some(i => i.itemIndex === idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleItemToggle(idx)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-[#7CB342] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-[#7CB342] border-[#7CB342]' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold">{item.product_name}</p>
                            <p className="text-sm text-gray-600">SL: {item.quantity} x {item.unit_price.toLocaleString()}đ</p>
                          </div>
                          <p className="font-bold text-[#7CB342]">{item.subtotal.toLocaleString()}đ</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Tiếp Theo <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Select Reason */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Lý do trả hàng</h3>
                <div className="grid grid-cols-2 gap-3">
                  {RETURN_REASONS.map(reason => {
                    const Icon = reason.icon;
                    return (
                      <button
                        key={reason.value}
                        onClick={() => setReturnReason(reason.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          returnReason === reason.value ? 'border-[#7CB342] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${returnReason === reason.value ? 'text-[#7CB342]' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-center">{reason.label}</p>
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="Mô tả chi tiết (không bắt buộc)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7CB342] focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-medium">Quay Lại</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!returnReason}
                    className="flex-[2] bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2">
                    Tiếp Theo <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Evidence */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Hình ảnh/Video chứng minh (khuyến nghị)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700 mb-1">Chọn ảnh từ thiết bị</p>
                    <p className="text-sm text-gray-500">Hỗ trợ JPG, PNG. Tối đa 5 ảnh</p>
                  </label>
                </div>
                {evidencePhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {evidencePhotos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img src={photo} alt="Evidence" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => setEvidencePhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-medium">Quay Lại</button>
                  <button onClick={() => setStep(4)} className="flex-[2] bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] flex items-center justify-center gap-2">
                    Tiếp Theo <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Refund Method */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Hình thức hoàn tiền</h3>
                <div className="space-y-3">
                  {REFUND_METHODS.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        onClick={() => setRefundMethod(method.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          refundMethod === method.value ? 'border-[#7CB342] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${refundMethod === method.value ? 'text-[#7CB342]' : 'text-gray-400'}`} />
                          <div className="flex-1 text-left">
                            <p className="font-bold">{method.label} {method.bonus && <span className="text-xs text-green-600">({method.bonus})</span>}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${refundMethod === method.value ? 'bg-[#7CB342] border-[#7CB342]' : 'border-gray-300'}`}>
                            {refundMethod === method.value && <CheckCircle className="w-full h-full text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-900"><strong>Lưu ý:</strong> Thời gian hoàn tiền: 3-7 ngày làm việc</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-medium">Quay Lại</button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </EnhancedModal>
  );
}