/**
 * 📋 Return Policy Modal - Hiển thị chính sách đổi trả
 * User PHẢI đọc và đồng ý trước khi tạo yêu cầu
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, CheckCircle, AlertCircle, Clock, Package, 
  Shield, Camera, FileText, ArrowRight
} from 'lucide-react';
import EnhancedModal from '../EnhancedModal';

const RETURN_POLICY = {
  title: "Chính Sách Đổi Trả & Hoàn Tiền",
  
  conditions: [
    {
      title: "⏰ Thời Gian Đổi Trả",
      items: [
        "Trong vòng 7 ngày kể từ khi nhận hàng",
        "Đơn hàng có giá trị trên 200.000đ được miễn phí đổi trả",
        "Sản phẩm tươi sống: 24 giờ kể từ khi nhận"
      ]
    },
    {
      title: "📦 Điều Kiện Sản Phẩm",
      items: [
        "Còn nguyên tem, nhãn mác, bao bì",
        "Chưa qua sử dụng hoặc bị hư hỏng do khách hàng",
        "Có đầy đủ phụ kiện, quà tặng kèm theo (nếu có)",
        "Sản phẩm tươi sống: còn tình trạng tốt, chưa hết hạn"
      ]
    },
    {
      title: "✅ Trường Hợp Được Chấp Nhận",
      items: [
        "Giao nhầm sản phẩm, thiếu hàng",
        "Sản phẩm bị lỗi, hư hỏng do nhà sản xuất",
        "Sản phẩm không đúng mô tả",
        "Chất lượng không đảm bảo"
      ],
      highlight: true
    },
    {
      title: "❌ Trường Hợp Không Được Chấp Nhận",
      items: [
        "Sản phẩm đã qua sử dụng",
        "Không còn nguyên tem, bao bì",
        "Hư hỏng do lỗi khách hàng",
        "Sản phẩm tươi sống đã quá hạn do khách giữ lâu"
      ],
      warning: true
    },
    {
      title: "📸 Yêu Cầu Chứng Minh",
      items: [
        "Ảnh chụp rõ toàn bộ sản phẩm",
        "Ảnh tem nhãn, mã vạch (nếu còn)",
        "Ảnh lỗi hư hỏng (nếu có)",
        "Video unboxing (khuyến nghị cho sản phẩm giá trị cao)"
      ]
    },
    {
      title: "💰 Hình Thức Hoàn Tiền",
      items: [
        "Hoàn tiền về phương thức thanh toán gốc (3-7 ngày)",
        "Chuyển khoản ngân hàng (1-3 ngày)",
        "Tích điểm mua sau (ngay lập tức + 5% bonus)"
      ]
    },
    {
      title: "🚚 Vận Chuyển Trả Hàng",
      items: [
        "Miễn phí ship trả hàng nếu lỗi từ shop",
        "Khách chịu phí ship nếu đổi ý (30.000đ)",
        "Mã vận đơn sẽ được cung cấp sau khi duyệt"
      ]
    }
  ],

  important_notes: [
    "⚠️ Vui lòng quay video unboxing khi nhận hàng để làm bằng chứng khi cần đổi trả",
    "⚠️ Không chấp nhận đổi trả sản phẩm đã giảm giá trên 50%",
    "⚠️ Thời gian xử lý yêu cầu: 24-48 giờ làm việc"
  ]
};

export default function ReturnPolicyModal({ isOpen, onClose, onAgree }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isBottom) setHasScrolled(true);
  };

  const handleAgree = () => {
    if (!hasScrolled) {
      alert('⚠️ Vui lòng đọc hết chính sách trước khi đồng ý');
      return;
    }
    if (!agreedToTerms) {
      alert('⚠️ Vui lòng tích vào ô đồng ý điều khoản');
      return;
    }
    onAgree();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="3xl"
      zIndex={110}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{RETURN_POLICY.title}</h2>
          <p className="text-sm text-gray-600">Vui lòng đọc kỹ trước khi gửi yêu cầu trả hàng</p>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolled && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">
              📜 Vui lòng cuộn xuống đọc hết chính sách
            </p>
          </div>
        )}

        {/* Policy Content - Scrollable */}
        <div 
          onScroll={handleScroll}
          className="max-h-[50vh] overflow-y-auto space-y-6 mb-6 pr-2"
        >
          {RETURN_POLICY.conditions.map((section, idx) => (
            <div 
              key={idx}
              className={`rounded-xl p-4 ${
                section.highlight ? 'bg-green-50 border-2 border-green-200' :
                section.warning ? 'bg-red-50 border-2 border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}
            >
              <h3 className={`font-bold mb-3 ${
                section.highlight ? 'text-green-900' :
                section.warning ? 'text-red-900' :
                'text-gray-900'
              }`}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      section.highlight ? 'text-green-600' :
                      section.warning ? 'text-red-600' :
                      'text-gray-400'
                    }`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Important Notes */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Lưu Ý Quan Trọng
            </h3>
            <ul className="space-y-2">
              {RETURN_POLICY.important_notes.map((note, i) => (
                <li key={i} className="text-sm text-orange-900 font-medium">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scroll Progress */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] transition-all duration-300 ${
              hasScrolled ? 'w-full' : 'w-0'
            }`} />
          </div>
          {hasScrolled && (
            <p className="text-xs text-green-600 mt-1 text-center font-medium">
              ✅ Bạn đã đọc hết chính sách
            </p>
          )}
        </div>

        {/* Agreement Checkbox */}
        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
          agreedToTerms ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342] mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-gray-800">
            <strong>Tôi đã đọc và đồng ý</strong> với các điều khoản đổi trả hàng của Farmer Smart. 
            Tôi cam kết cung cấp thông tin trung thực và hình ảnh chứng minh chính xác.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleAgree}
            disabled={!hasScrolled || !agreedToTerms}
            className="flex-[2] bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Đồng Ý & Tiếp Tục
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
}