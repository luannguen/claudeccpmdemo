/**
 * PreOrderPolicyModal - Modal hiển thị chính sách bán trước
 * Module 1: Policy System
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Shield, Clock, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronDown, ChevronUp,
  Wallet, RefreshCw, Ban, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ReactMarkdown from 'react-markdown';

const SECTION_ICONS = {
  deposit: Wallet,
  cancellation: Ban,
  refund: RefreshCw,
  delay: Clock,
  quality: Award,
  risk: AlertTriangle
};

function PolicySection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#7CB342]" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="pt-4 text-sm text-gray-600 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-medium text-gray-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          {question}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-3 pl-6 text-sm text-gray-600"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreOrderPolicyModal({ 
  isOpen, 
  onClose, 
  policy, 
  onAccept,
  requireAcceptance = true 
}) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen || !policy) return null;

  const handleAccept = () => {
    if (requireAcceptance && !accepted) return;
    onAccept?.();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{policy.name}</h2>
                  <p className="text-white/80 text-sm">Phiên bản {policy.version} • Có hiệu lực từ {policy.effective_date}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-green-50 border-b">
            <p className="text-green-800 text-sm leading-relaxed">{policy.summary}</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Deposit Rules */}
            {policy.deposit_rules && (
              <PolicySection title="Quy định đặt cọc" icon={SECTION_ICONS.deposit} defaultOpen>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Tỷ lệ cọc: <strong>{policy.deposit_rules.min_percentage}% - {policy.deposit_rules.max_percentage}%</strong></li>
                  <li>Thời hạn thanh toán cọc: <strong>{policy.deposit_rules.payment_deadline_days} ngày</strong> sau khi đặt hàng</li>
                  {policy.deposit_rules.auto_cancel_if_unpaid && (
                    <li className="text-amber-600">Đơn hàng sẽ tự động hủy nếu không thanh toán cọc đúng hạn</li>
                  )}
                </ul>
              </PolicySection>
            )}

            {/* Cancellation Rules */}
            {policy.cancellation_rules && (
              <PolicySection title="Quy định hủy đơn" icon={SECTION_ICONS.cancellation}>
                <ul className="list-disc pl-4 space-y-1">
                  {policy.cancellation_rules.customer_can_cancel ? (
                    <>
                      <li>Hủy <strong>miễn phí</strong> trước <strong>{policy.cancellation_rules.free_cancel_before_days} ngày</strong> so với ngày thu hoạch</li>
                      <li>Sau thời gian trên: phí hủy <strong>{policy.cancellation_rules.cancel_fee_percentage}%</strong> giá trị đơn hàng</li>
                      <li className="text-red-600">Không được hủy sau khi đơn hàng ở trạng thái "{policy.cancellation_rules.no_cancel_after_status}"</li>
                    </>
                  ) : (
                    <li className="text-red-600">Không được hủy đơn hàng bán trước sau khi xác nhận</li>
                  )}
                </ul>
              </PolicySection>
            )}

            {/* Refund Rules */}
            {policy.refund_rules && (
              <PolicySection title="Quy định hoàn tiền" icon={SECTION_ICONS.refund}>
                <div className="space-y-3">
                  {policy.refund_rules.full_refund_cases?.length > 0 && (
                    <div>
                      <p className="font-medium text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Hoàn 100%:
                      </p>
                      <ul className="list-disc pl-6">
                        {policy.refund_rules.full_refund_cases.map((c, i) => (
                          <li key={i}>{formatRefundCase(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {policy.refund_rules.partial_refund_cases?.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-700">Hoàn một phần:</p>
                      <ul className="list-disc pl-6">
                        {policy.refund_rules.partial_refund_cases.map((c, i) => (
                          <li key={i}>{formatRefundCase(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {policy.refund_rules.no_refund_cases?.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700">Không hoàn tiền:</p>
                      <ul className="list-disc pl-6">
                        {policy.refund_rules.no_refund_cases.map((c, i) => (
                          <li key={i}>{formatRefundCase(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs">
                    * Thời gian xử lý hoàn tiền: {policy.refund_rules.refund_processing_days} ngày làm việc
                  </p>
                </div>
              </PolicySection>
            )}

            {/* Delay Compensation */}
            {policy.delay_compensation && (
              <PolicySection title="Bồi thường khi giao trễ" icon={SECTION_ICONS.delay}>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Thông báo nếu trễ hơn <strong>{policy.delay_compensation.notify_after_days} ngày</strong></li>
                  <li>Giảm giá <strong>{policy.delay_compensation.discount_per_week_delay}%</strong> mỗi tuần giao trễ</li>
                  <li>Trễ tối đa cho phép: <strong>{policy.delay_compensation.max_delay_days} ngày</strong></li>
                  {policy.delay_compensation.auto_refund_after_max_delay && (
                    <li className="text-green-600">Tự động hoàn tiền 100% nếu vượt quá thời gian trễ tối đa</li>
                  )}
                </ul>
              </PolicySection>
            )}

            {/* Quality Guarantee */}
            {policy.quality_guarantee && (
              <PolicySection title="Đảm bảo chất lượng" icon={SECTION_ICONS.quality}>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Thời gian kiểm tra: <strong>{policy.quality_guarantee.inspection_period_hours} giờ</strong> sau khi nhận hàng</li>
                  {policy.quality_guarantee.replacement_available && (
                    <li className="text-green-600">Hỗ trợ đổi hàng nếu có vấn đề chất lượng</li>
                  )}
                  {policy.quality_guarantee.photo_evidence_required && (
                    <li>Yêu cầu cung cấp ảnh/video làm bằng chứng khi khiếu nại</li>
                  )}
                </ul>
              </PolicySection>
            )}

            {/* Risk Disclosure */}
            {policy.risk_disclosure?.length > 0 && (
              <PolicySection title="Lưu ý rủi ro" icon={SECTION_ICONS.risk}>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <ul className="space-y-2">
                    {policy.risk_disclosure.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </PolicySection>
            )}

            {/* FAQ */}
            {policy.faq?.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  Câu hỏi thường gặp
                </h3>
                <div className="space-y-1">
                  {policy.faq.map((item, i) => (
                    <FAQItem key={i} question={item.question} answer={item.answer} />
                  ))}
                </div>
              </div>
            )}

            {/* Full Content (if any) */}
            {policy.full_content && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{policy.full_content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            {requireAcceptance && (
              <label className="flex items-start gap-3 mb-4 cursor-pointer">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={setAccepted}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Tôi đã đọc, hiểu và đồng ý với các điều khoản của chính sách bán trước này.
                </span>
              </label>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Đóng
              </Button>
              {onAccept && (
                <Button 
                  onClick={handleAccept}
                  disabled={requireAcceptance && !accepted}
                  className="flex-1 bg-[#7CB342] hover:bg-[#558B2F]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đồng ý & Tiếp tục
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper to format refund case codes
function formatRefundCase(code) {
  const map = {
    'seller_cancel': 'Người bán hủy đơn',
    'quality_issue': 'Vấn đề chất lượng sản phẩm',
    'delivery_failed': 'Không giao được hàng',
    'delay_over_30_days': 'Giao trễ hơn 30 ngày',
    'customer_cancel_early': 'Khách hủy trong thời gian cho phép',
    'customer_cancel_late': 'Khách hủy sau thời gian cho phép',
    'customer_no_response': 'Khách không phản hồi nhận hàng'
  };
  return map[code] || code;
}