/**
 * 🌾 Pre-Order Module - Complete Public API
 * 
 * Tính năng Bán trước toàn diện với 6 modules:
 * - Module 1: Policy System (Chính sách)
 * - Module 2: Enhanced Order Status Flow
 * - Module 3: Automated Notification Timeline
 * - Module 4: Transparency UI Components
 * - Module 5: Capacity Management
 * - Module 6: Customer Communication Hub
 */

// ============================================
// MODULE 1 + 4: Policy & Transparency UI
// ============================================
export {
  PreOrderPolicyModal,
  PreOrderTermsBadge,
  DeliveryEstimateCard,
  RiskDisclosure,
  RefundPolicyAccordion,
  DEFAULT_PREORDER_POLICY
} from './policy';

// ============================================
// MODULE 2: Enhanced Order Status Flow
// ============================================
export {
  OrderStatusTimeline,
  PreOrderStatusBadge,
  DepositStatusCard,
  PREORDER_STATUS_FLOW,
  STATUS_INDEX_MAP,
  STATUS_CONFIG
} from './status';

// ============================================
// MODULE 3: Automated Notification Timeline
// ============================================
export {
  PreOrderNotificationScheduler,
  NotificationPreferences,
  NOTIFICATION_TYPES
} from './notifications';

// ============================================
// MODULE 5: Capacity Management
// ============================================
export {
  LotCapacityIndicator,
  HarvestBufferInfo
} from './capacity';

// ============================================
// MODULE 6: Customer Communication Hub
// ============================================
export {
  PreOrderMessageThread,
  PreOrderFAQBot
} from './communication';

// ============================================
// EXISTING COMPONENTS (Legacy)
// ============================================
export { default as CountdownTimer } from './CountdownTimer';
export { default as SoldProgressBar } from './SoldProgressBar';
export { default as UrgencyBadge } from './UrgencyBadge';
export { default as PriceHistoryChart } from './PriceHistoryChart';
export { default as HarvestNotificationToggle } from './HarvestNotificationToggle';
export { default as PreOrderHero } from './PreOrderHero';
export { default as PreOrderFilters } from './PreOrderFilters';
export { default as PreOrderLotsGrid } from './PreOrderLotsGrid';
export { default as PreOrderLoadingState } from './PreOrderLoadingState';
export { default as PreOrderEmptyState } from './PreOrderEmptyState';
export { default as PreOrderLotCard } from './PreOrderLotCard';
export { default as LotDetailGallery } from './LotDetailGallery';
export { default as LotDetailInfo } from './LotDetailInfo';
export { default as LotDetailQuantity } from './LotDetailQuantity';
export { default as LotDetailActions } from './LotDetailActions';
export { default as LotDetailRelated } from './LotDetailRelated';
export { default as LotDetailCertifications } from './LotDetailCertifications';
export { default as LotDetailModal } from './LotDetailModal';

// ============================================
// MODULE 7: Escrow & Wallet Management
// ============================================
export { default as WalletStatusCard } from './escrow/WalletStatusCard';
export { default as TransactionList } from './escrow/TransactionList';

// ============================================
// MODULE 8: Dispute Management
// ============================================
export { default as DisputeForm } from './dispute/DisputeForm';
export { default as ResolutionSelector } from './dispute/ResolutionSelector';
export { default as DisputeTimeline } from './dispute/DisputeTimeline';

// ============================================
// MODULE 9: Fulfillment Tracking
// ============================================
export { default as FulfillmentTracker, FulfillmentList } from './fulfillment/FulfillmentTracker';

// ============================================
// MODULE 10: Analytics UI
// ============================================
export { default as PreOrderFunnelChart } from './analytics/PreOrderFunnelChart';
export { default as CancellationInsights } from './analytics/CancellationInsights';
export { default as DelayMetricsCard } from './analytics/DelayMetricsCard';
export { default as DemandForecastWidget } from './analytics/DemandForecastWidget';

// ============================================
// MODULE 11: Campaigns & Growth
// ============================================
export { GroupBuyProgress, EarlyBirdBadge } from './campaign';