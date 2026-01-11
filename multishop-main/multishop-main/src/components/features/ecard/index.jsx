/**
 * E-Card Module - Public API
 * 
 * E-Card Hub: profile, connections, gifts, extensions, cache, analytics
 * 
 * @module features/ecard
 */

// ========== CACHE (PRIMARY - USE THIS) ==========
export { useEcardCache } from './hooks/useEcardCache';
export { ecardCacheRepository } from './data/ecardCacheRepository';
export { EMPTY_CACHE, isCacheStale, CACHE_STALE_TIME_MS } from './types/EcardCacheDTO';

// ========== ANALYTICS ==========
export { useEcardAnalytics } from './hooks/useEcardAnalytics';
export { useTrackEcardView, trackShare, trackConnection } from './hooks/useTrackEcardView';
export { analyticsRepository } from './data/analyticsRepository';

// ========== BIRTHDAY REMINDERS ==========
export { useBirthdayReminders } from './hooks/useBirthdayReminders';
export { birthdayRepository } from './data/birthdayRepository';

// ========== CONNECTION GROUPS ==========
export { useConnectionGroups } from './hooks/useConnectionGroups';
export { connectionGroupRepository } from './data/connectionGroupRepository';

// ========== VERIFICATION ==========
export { useVerification, useAdminVerification } from './hooks/useVerification';
export { verificationRepository } from './data/verificationRepository';

// ========== CHAT (ENHANCED) ==========
export { useConnectionChat } from './hooks/useConnectionChat';
export { useQuickReplies } from './hooks/useQuickReplies';
export { chatRepository } from './data/chatRepository';
export { quickReplyRepository } from './data/quickReplyRepository';

// ========== RECOMMENDATIONS ==========
export { useConnectionRecommendations, useGenerateRecommendations, useRecommendationStats } from './hooks/useConnectionRecommendations';
export { recommendationRepository } from './data/recommendationRepository';
export { default as connectionMatcher } from './domain/connectionMatcher';

// ========== SHARE LINKS ==========
export { useShareLinks, useShareLinkAnalytics } from './hooks/useShareLinks';
export { shareLinkRepository } from './data/shareLinkRepository';

// ========== PORTFOLIO ==========
export { usePortfolioList, useMyPortfolios, useFeaturedPortfolios, usePortfolioDetail, usePortfolioStats } from './hooks/usePortfolio';
export { portfolioRepository } from './data/portfolioRepository';

// ========== OFFLINE MODE ==========
export { 
  useNetworkStatus, 
  useOfflineProfile, 
  useOfflineMyProfile, 
  useOfflineConnections, 
  useOfflineQueue,
  useOfflineStats 
} from './hooks/useOfflineMode';
export { offlineStorage, isIndexedDBSupported, OFFLINE_ACTIONS } from './domain/offlineStorage';

// ========== HOOKS ==========
export { useUserStats } from './hooks/useUserStats';
export { useExperienceSettings } from './hooks/useExperienceSettings';
export { useExperiencePreview } from './hooks/useExperiencePreview';

// ========== UI COMPONENTS ==========
export { default as ExperienceSettingsCard } from './ui/ExperienceSettingsCard';
export { default as EcardExtensionsPanel } from './ui/EcardExtensionsPanel';
export { default as ExperienceTestPlayModal } from './ui/ExperienceTestPlayModal';
export { default as ThemePreviewStyles } from './ui/ThemePreviewStyles';
export { default as EcardAnalyticsDashboard } from './ui/EcardAnalyticsDashboard';
export { default as BirthdayWidget, BirthdayBadge } from './ui/BirthdayWidget';
export { default as GroupFilter, GroupManagerButton } from './ui/GroupFilter';
export { default as GroupManagerModal } from './ui/GroupManagerModal';
export { default as VerificationBadges, VerifiedBadge } from './ui/VerificationBadges';
export { default as VerificationRequestForm } from './ui/VerificationRequestForm';
export { default as QuickReplyPicker } from './ui/QuickReplyPicker';
export { default as ConnectionRecommendationsWidget, RecommendationCard } from './ui/ConnectionRecommendationsWidget';
export { default as ShareLinkManager } from './ui/ShareLinkManager';
export { default as PortfolioCard } from './ui/PortfolioCard';
export { default as PortfolioManager } from './ui/PortfolioManager';
export { default as PortfolioGallery, PortfolioDetailModal } from './ui/PortfolioGallery';
export { default as OfflineStatusBar, OfflineIndicator, SaveOfflineButton } from './ui/OfflineStatusBar';
export { default as OfflineManager } from './ui/OfflineManager';

// ========== ECARD SHOP / COMMERCE ==========
export { useEcardShop, useEcardShopPublic } from './hooks/useEcardShop';
export { ecardShopRepository, MAX_ECARD_SHOP_PRODUCTS } from './data/ecardShopRepository';
export { default as EcardShopSection, ProductCard as EcardProductCard } from './ui/EcardShopSection';
export { default as EcardShopManager } from './ui/EcardShopManager';
export { default as QuickBuyModal } from './ui/QuickBuyModal';

// ========== DATA (internal use preferred) ==========
export { userStatsRepository } from './data/userStatsRepository';