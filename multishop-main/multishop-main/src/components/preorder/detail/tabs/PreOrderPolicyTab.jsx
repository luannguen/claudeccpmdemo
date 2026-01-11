/**
 * PreOrderPolicyTab - Tab chính sách (deposit, cancel, refund)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, RefreshCw, AlertTriangle, Shield, 
  ChevronDown, ChevronUp, HelpCircle, CheckCircle2
} from 'lucide-react';
import { RiskDisclosure, RefundPolicyAccordion, DEFAULT_PREORDER_POLICY } from '@/components/preorder/policy';
import { PreOrderFAQBot } from '@/components/preorder/communication';

// Mini expandable
function PolicyItem({ title, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="font-medium text-sm text-gray-800">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-sm text-gray-600">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreOrderPolicyTab({ lot }) {
  const policy = DEFAULT_PREORDER_POLICY;

  return (
    <div className="space-y-3">
      {/* Deposit policy */}
      <PolicyItem 
        title="Quy định đặt cọc" 
        icon={Wallet} 
        iconColor="text-orange-500"
        defaultOpen={true}
      >
        <ul className="space-y-2 mt-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Đặt cọc từ {policy.deposit_rules.min_percentage}% - {policy.deposit_rules.max_percentage}% giá trị đơn hàng</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Thanh toán cọc trong {policy.deposit_rules.payment_deadline_days} ngày</span>
          </li>
          {policy.deposit_rules.auto_cancel_if_unpaid && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>Đơn tự động hủy nếu không thanh toán cọc đúng hạn</span>
            </li>
          )}
        </ul>
      </PolicyItem>

      {/* Cancellation policy */}
      <PolicyItem 
        title="Chính sách hủy đơn" 
        icon={RefreshCw} 
        iconColor="text-blue-500"
      >
        <ul className="space-y-2 mt-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Hủy miễn phí trước {policy.cancellation_rules.free_cancel_before_days} ngày so với ngày thu hoạch</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span>Phí hủy {policy.cancellation_rules.cancel_fee_percentage}% sau thời gian miễn phí</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>Không được hủy khi đã vào giai đoạn sản xuất</span>
          </li>
        </ul>
      </PolicyItem>

      {/* Refund policy */}
      <PolicyItem 
        title="Chính sách hoàn tiền" 
        icon={Wallet} 
        iconColor="text-green-500"
      >
        <div className="mt-2 space-y-3">
          <div>
            <p className="font-medium text-gray-700 mb-1">Hoàn 100%:</p>
            <ul className="text-xs space-y-1 text-gray-500">
              <li>• Người bán hủy đơn</li>
              <li>• Lỗi chất lượng sản phẩm</li>
              <li>• Giao hàng thất bại</li>
              <li>• Trễ hơn 30 ngày</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Thời gian xử lý:</p>
            <p className="text-xs text-gray-500">{policy.refund_rules.refund_processing_days} ngày làm việc</p>
          </div>
        </div>
      </PolicyItem>

      {/* Risk disclosure - collapsed by default */}
      <PolicyItem 
        title="Lưu ý quan trọng" 
        icon={AlertTriangle} 
        iconColor="text-amber-500"
      >
        <RiskDisclosure variant="list" />
      </PolicyItem>

      {/* FAQ mini */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Câu hỏi thường gặp</span>
        </div>
        <PreOrderFAQBot variant="compact" />
      </div>
    </div>
  );
}