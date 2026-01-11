/**
 * RefundPolicyAccordion - Hiển thị chính sách hoàn tiền dạng accordion
 * Module 4: Transparency UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Clock, Wallet, FileText
} from 'lucide-react';

const DEFAULT_REFUND_POLICY = {
  full_refund_cases: [
    { code: 'seller_cancel', label: 'Người bán hủy đơn', description: 'Hoàn 100% trong 3-5 ngày' },
    { code: 'quality_issue', label: 'Lỗi chất lượng', description: 'Cần cung cấp ảnh/video chứng minh' },
    { code: 'delivery_failed', label: 'Không giao được', description: 'Sau 3 lần liên hệ không thành công' },
    { code: 'delay_over_30_days', label: 'Trễ >30 ngày', description: 'Tự động hoàn tiền' }
  ],
  partial_refund_cases: [
    { code: 'customer_cancel_early', label: 'Khách hủy sớm', description: 'Hoàn 80-100% tùy thời điểm' }
  ],
  no_refund_cases: [
    { code: 'customer_cancel_late', label: 'Hủy sau khi vào sản xuất', description: 'Đã cam kết nguồn hàng' },
    { code: 'customer_no_response', label: 'Không nhận hàng', description: 'Không liên lạc được sau 7 ngày' }
  ],
  processing_days: 7
};

function RefundSection({ title, icon: Icon, color, items, isOpen, onToggle }) {
  const colorClasses = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', header: 'bg-green-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', header: 'bg-amber-100' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', header: 'bg-red-100' }
  };
  const classes = colorClasses[color] || colorClasses.green;

  return (
    <div className={`border-2 ${classes.border} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${classes.header} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${classes.text}`} />
          <span className={`font-semibold ${classes.text}`}>{title}</span>
          <span className={`px-2 py-0.5 ${classes.bg} rounded-full text-xs`}>
            {items.length} trường hợp
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${classes.bg}`}
          >
            <div className="p-4 space-y-3">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    color === 'green' ? 'bg-green-500' : 
                    color === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RefundPolicyAccordion({ 
  policy = DEFAULT_REFUND_POLICY,
  variant = 'default', // default, compact
  defaultOpenSection = null,
  className = ''
}) {
  const [openSection, setOpenSection] = useState(defaultOpenSection);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="w-5 h-5 text-[#7CB342]" />
          <h3 className="font-semibold text-gray-800">Chính sách hoàn tiền</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Hoàn 100%: Lỗi người bán, chất lượng, trễ &gt;30 ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Hoàn 1 phần: Khách hủy trong thời gian cho phép</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Không hoàn: Hủy sau khi vào sản xuất</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Xử lý trong {policy.processing_days || 7} ngày làm việc
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-6 h-6 text-[#7CB342]" />
        <h2 className="text-lg font-bold text-gray-800">Chính sách hoàn tiền</h2>
      </div>

      <RefundSection
        title="Hoàn tiền 100%"
        icon={CheckCircle}
        color="green"
        items={policy.full_refund_cases || DEFAULT_REFUND_POLICY.full_refund_cases}
        isOpen={openSection === 'full'}
        onToggle={() => toggleSection('full')}
      />

      <RefundSection
        title="Hoàn tiền một phần"
        icon={AlertCircle}
        color="amber"
        items={policy.partial_refund_cases || DEFAULT_REFUND_POLICY.partial_refund_cases}
        isOpen={openSection === 'partial'}
        onToggle={() => toggleSection('partial')}
      />

      <RefundSection
        title="Không hoàn tiền"
        icon={XCircle}
        color="red"
        items={policy.no_refund_cases || DEFAULT_REFUND_POLICY.no_refund_cases}
        isOpen={openSection === 'no'}
        onToggle={() => toggleSection('no')}
      />

      {/* Processing time */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Thời gian xử lý</p>
            <p className="text-sm text-blue-600">
              Hoàn tiền trong vòng {policy.processing_days || 7} ngày làm việc kể từ khi xác nhận yêu cầu
            </p>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
        <FileText className="w-4 h-4" />
        <span>Liên hệ CSKH để được hỗ trợ xử lý hoàn tiền</span>
      </div>
    </div>
  );
}