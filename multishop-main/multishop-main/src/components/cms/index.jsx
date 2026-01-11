/**
 * CMS Components & Hooks - Central Exports
 * 
 * Hệ thống CMS cho quản lý nội dung trang và cấu hình website.
 */

// Page Renderer
export {
  default as DynamicPageRenderer,
  PageHeader,
  PageContent,
  PageLoading,
  PageNotFound,
  useCMSContent
} from './DynamicPageRenderer';

// Site Config
export {
  default as useSiteSettings,
  useSiteSettings as useSiteConfig,
  useFeatureEnabled
} from './useSiteConfig';

// Re-export hooks from useCMSPages
export {
  useAdminPages,
  usePublishedPages,
  usePageBySlug,
  usePageById,
  usePageMutations,
  useSiteConfig as useBaseSiteConfig,
  useSiteConfigMutation,
  useMenuPages,
  usePageStats
} from '@/components/hooks/useCMSPages';

// Re-export service
export { pageService, siteConfigService } from '@/components/services/pageService';