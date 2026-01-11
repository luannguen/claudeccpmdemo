/**
 * Pre-Order Policy Module - Public API
 * Module 1 + Module 4: Policy System & Transparency UI
 */

// Policy Modal
export { default as PreOrderPolicyModal } from './PreOrderPolicyModal';

// Transparency UI Components
export { default as PreOrderTermsBadge } from './PreOrderTermsBadge';
export { default as DeliveryEstimateCard } from './DeliveryEstimateCard';
export { default as RiskDisclosure } from './RiskDisclosure';
export { default as RefundPolicyAccordion } from './RefundPolicyAccordion';

// Default policy template
export const DEFAULT_PREORDER_POLICY = {
  name: 'Chính sách bán trước nông sản',
  version: '1.0',
  summary: 'Đặt trước nông sản tươi với giá ưu đãi. Thanh toán cọc 30-100%, hoàn tiền nếu không giao được hàng.',
  deposit_rules: {
    min_percentage: 30,
    max_percentage: 100,
    payment_deadline_days: 3,
    auto_cancel_if_unpaid: true
  },
  cancellation_rules: {
    customer_can_cancel: true,
    free_cancel_before_days: 7,
    cancel_fee_percentage: 20,
    no_cancel_after_status: 'in_production'
  },
  refund_rules: {
    full_refund_cases: ['seller_cancel', 'quality_issue', 'delivery_failed', 'delay_over_30_days'],
    partial_refund_cases: ['customer_cancel_early'],
    no_refund_cases: ['customer_cancel_late', 'customer_no_response'],
    refund_processing_days: 7
  },
  delay_compensation: {
    notify_after_days: 3,
    discount_per_week_delay: 5,
    max_delay_days: 30,
    auto_refund_after_max_delay: true
  },
  quality_guarantee: {
    inspection_period_hours: 24,
    replacement_available: true,
    photo_evidence_required: true
  },
  risk_disclosure: [
    'Thời gian giao hàng có thể thay đổi do điều kiện thời tiết',
    'Sản lượng thực tế có thể chênh lệch ±10% so với dự kiến',
    'Giá có thể tăng theo thời gian gần ngày thu hoạch'
  ],
  faq: [
    {
      question: 'Khi nào tôi nhận được hàng?',
      answer: 'Hàng sẽ được giao trong vòng 3-7 ngày sau ngày thu hoạch dự kiến.'
    },
    {
      question: 'Tôi có thể hủy đơn không?',
      answer: 'Có, bạn có thể hủy miễn phí trước 7 ngày so với ngày thu hoạch. Sau đó sẽ tính phí hủy 20%.'
    },
    {
      question: 'Nếu hàng giao trễ thì sao?',
      answer: 'Chúng tôi sẽ thông báo và áp dụng giảm giá 5% mỗi tuần trễ. Trễ quá 30 ngày sẽ hoàn tiền 100%.'
    },
    {
      question: 'Chất lượng không như mong đợi thì sao?',
      answer: 'Bạn có 24 giờ sau khi nhận hàng để kiểm tra. Nếu có vấn đề, cung cấp ảnh/video để được đổi hoặc hoàn tiền.'
    }
  ]
};