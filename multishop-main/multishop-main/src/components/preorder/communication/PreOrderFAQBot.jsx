/**
 * PreOrderFAQBot - FAQ chatbot cho preorder
 * Module 6: Customer Communication Hub
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, ChevronRight, MessageCircle, 
  Clock, Wallet, Truck, RefreshCw, X, Bot
} from 'lucide-react';

const PREORDER_FAQ = [
  {
    id: 'what-is-preorder',
    icon: HelpCircle,
    question: 'Bán trước là gì?',
    answer: 'Bán trước (Pre-Order) là hình thức đặt mua sản phẩm trước khi thu hoạch. Bạn đặt cọc trước, sản phẩm sẽ được giao sau khi thu hoạch. Ưu điểm là giá tốt hơn và đảm bảo có hàng.',
    category: 'general'
  },
  {
    id: 'when-delivery',
    icon: Truck,
    question: 'Khi nào tôi nhận được hàng?',
    answer: 'Hàng sẽ được giao trong vòng 3-7 ngày sau ngày thu hoạch dự kiến. Thời gian có thể thay đổi do điều kiện thời tiết. Chúng tôi sẽ thông báo khi sản phẩm sẵn sàng giao.',
    category: 'delivery'
  },
  {
    id: 'deposit-how',
    icon: Wallet,
    question: 'Đặt cọc như thế nào?',
    answer: 'Bạn thanh toán tiền cọc (30-100% tùy sản phẩm) khi đặt hàng. Phần còn lại sẽ thanh toán khi nhận hàng. Nếu không thanh toán cọc trong 3 ngày, đơn hàng sẽ tự động hủy.',
    category: 'payment'
  },
  {
    id: 'can-cancel',
    icon: RefreshCw,
    question: 'Tôi có thể hủy đơn không?',
    answer: 'Có, bạn có thể hủy miễn phí trước 7 ngày so với ngày thu hoạch. Sau thời gian này sẽ tính phí hủy 20%. Không được hủy khi sản phẩm đã vào giai đoạn sản xuất.',
    category: 'cancellation'
  },
  {
    id: 'refund-policy',
    icon: Wallet,
    question: 'Chính sách hoàn tiền?',
    answer: 'Hoàn 100% nếu: người bán hủy, lỗi chất lượng, giao trễ >30 ngày. Hoàn một phần nếu khách hủy sớm. Không hoàn nếu khách hủy muộn hoặc không nhận hàng.',
    category: 'refund'
  },
  {
    id: 'delay-what',
    icon: Clock,
    question: 'Nếu giao trễ thì sao?',
    answer: 'Chúng tôi sẽ thông báo ngay khi có thay đổi. Trễ mỗi tuần được giảm 5% đơn hàng. Trễ quá 30 ngày sẽ được hoàn tiền 100% tự động.',
    category: 'delivery'
  },
  {
    id: 'quality-issue',
    icon: HelpCircle,
    question: 'Chất lượng không như mong đợi?',
    answer: 'Bạn có 24 giờ sau khi nhận hàng để kiểm tra. Nếu có vấn đề, chụp ảnh/quay video gửi cho chúng tôi để được đổi hàng hoặc hoàn tiền.',
    category: 'quality'
  },
  {
    id: 'price-change',
    icon: Wallet,
    question: 'Tại sao giá thay đổi?',
    answer: 'Giá bán trước thường tăng dần theo thời gian gần ngày thu hoạch. Đặt sớm sẽ được giá tốt hơn. Sau khi đặt, giá đơn hàng của bạn không thay đổi.',
    category: 'payment'
  }
];

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'general', label: 'Chung' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'delivery', label: 'Giao hàng' },
  { key: 'cancellation', label: 'Hủy đơn' },
  { key: 'refund', label: 'Hoàn tiền' }
];

function FAQItem({ faq, isExpanded, onToggle }) {
  const Icon = faq.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-[#7CB342]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#7CB342]" />
        </div>
        <span className="flex-1 font-medium text-gray-800">{faq.question}</span>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="pl-11 text-sm text-gray-600 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PreOrderFAQBot({
  onContactSupport,
  variant = 'default', // default, compact, floating
  className = ''
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  const filteredFAQ = PREORDER_FAQ.filter(faq => {
    const matchCategory = category === 'all' || faq.category === category;
    const matchSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (variant === 'floating') {
    return (
      <>
        {/* Floating button */}
        <button
          onClick={() => setIsFloatingOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-[#7CB342] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#558B2F] transition-colors z-50"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        {/* Floating modal */}
        <AnimatePresence>
          {isFloatingOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 right-6 w-[360px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-bold">Hỏi đáp Bán trước</span>
                </div>
                <button onClick={() => setIsFloatingOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
                {PREORDER_FAQ.slice(0, 5).map(faq => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isExpanded={expandedId === faq.id}
                    onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  />
                ))}
              </div>

              {/* Contact support */}
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    onContactSupport?.();
                    setIsFloatingOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[#7CB342] font-medium hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  Liên hệ hỗ trợ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
        <div className="p-4 border-b flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#7CB342]" />
          <span className="font-semibold text-gray-800">Câu hỏi thường gặp</span>
        </div>
        <div className="divide-y max-h-[300px] overflow-y-auto">
          {PREORDER_FAQ.slice(0, 4).map(faq => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedId === faq.id}
              onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border-2 border-gray-100 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#7CB342]/10 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-[#7CB342]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Câu hỏi thường gặp về Bán trước</h3>
          <p className="text-sm text-gray-500">Tìm câu trả lời nhanh cho thắc mắc của bạn</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              category === cat.key
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-2">
        {filteredFAQ.map(faq => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isExpanded={expandedId === faq.id}
            onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
          />
        ))}
      </div>

      {/* Contact support */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700 mb-3">
          Không tìm thấy câu trả lời? Liên hệ đội hỗ trợ của chúng tôi.
        </p>
        <button
          onClick={onContactSupport}
          className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          Chat với hỗ trợ
        </button>
      </div>
    </div>
  );
}