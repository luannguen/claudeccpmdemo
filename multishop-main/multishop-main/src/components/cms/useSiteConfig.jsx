/**
 * useSiteConfig Hook - Lấy cấu hình website cho client
 * 
 * Hook này được sử dụng ở phía client để lấy thông tin cấu hình
 * như contact info, business hours, social links, etc.
 */

import { useSiteConfig as useBaseSiteConfig } from "@/components/hooks/useCMSPages";

// Default values khi chưa có config
const defaultConfig = {
  site_name: 'Zero Farm',
  site_tagline: 'Nông Sản Sạch - Từ Trang Trại Đến Bàn Ăn',
  site_description: 'Zero Farm cung cấp nông sản hữu cơ, rau củ sạch từ trang trại đến bàn ăn gia đình bạn.',
  contact_info: {
    address: 'Đường Trần Hưng Đạo',
    address_detail: 'Phường 10, Thành Phố Đà Lạt',
    city: 'Đà Lạt',
    province: 'Lâm Đồng',
    phone: '098 765 4321',
    phone_label: 'Hotline Đặt Hàng',
    email: 'info@zerofarm.vn',
    email_label: 'Email Liên Hệ',
    hotline: '098 765 4321'
  },
  business_hours: {
    weekday: '7:00 - 18:00',
    saturday: '7:00 - 17:00',
    sunday: '8:00 - 16:00',
    note: 'Đặt hàng online 24/7'
  },
  social_links: {
    facebook: '#',
    instagram: '#',
    youtube: '',
    tiktok: '',
    zalo: ''
  },
  seo_defaults: {
    title_suffix: ' | Zero Farm',
    default_description: 'Zero Farm - Nông sản hữu cơ chất lượng cao từ Đà Lạt',
    default_keywords: 'nông sản sạch, rau hữu cơ, organic, đà lạt',
    og_image: ''
  },
  hero_config: {
    title: 'Nông Sản Sạch Từ Đà Lạt',
    subtitle: 'Từ trang trại đến bàn ăn - Chất lượng là ưu tiên hàng đầu',
    background_image: '',
    cta_text: 'Khám Phá Ngay',
    cta_link: '/Services'
  },
  footer_config: {
    copyright_text: '© 2024 Zero Farm. All rights reserved.',
    show_newsletter: true,
    newsletter_title: 'Đăng ký nhận tin'
  },
  features: {
    enable_blog: true,
    enable_community: true,
    enable_preorder: true,
    enable_referral: true,
    enable_chat: true
  }
};

/**
 * Hook lấy site config với fallback values
 */
export function useSiteSettings() {
  const { data: config, isLoading, error } = useBaseSiteConfig();
  
  // Log error for debugging
  if (error) {
    console.warn('⚠️ useSiteSettings error:', error);
  }
  
  // Safely merge with default values - handle null/undefined config
  const safeConfig = config && typeof config === 'object' ? config : {};
  
  const mergedConfig = {
    ...defaultConfig,
    ...safeConfig,
    contact_info: { ...defaultConfig.contact_info, ...(safeConfig.contact_info || {}) },
    business_hours: { ...defaultConfig.business_hours, ...(safeConfig.business_hours || {}) },
    social_links: { ...defaultConfig.social_links, ...(safeConfig.social_links || {}) },
    seo_defaults: { ...defaultConfig.seo_defaults, ...(safeConfig.seo_defaults || {}) },
    hero_config: { ...defaultConfig.hero_config, ...(safeConfig.hero_config || {}) },
    footer_config: { ...defaultConfig.footer_config, ...(safeConfig.footer_config || {}) },
    features: { ...defaultConfig.features, ...(safeConfig.features || {}) }
  };

  return {
    config: mergedConfig,
    isLoading,
    error,
    // Shortcuts
    siteName: mergedConfig.site_name,
    siteTagline: mergedConfig.site_tagline,
    contact: mergedConfig.contact_info,
    hours: mergedConfig.business_hours,
    social: mergedConfig.social_links,
    seo: mergedConfig.seo_defaults,
    hero: mergedConfig.hero_config,
    footer: mergedConfig.footer_config,
    features: mergedConfig.features
  };
}

/**
 * Hook check feature enabled
 */
export function useFeatureEnabled(featureName) {
  const { features } = useSiteSettings();
  return features?.[`enable_${featureName}`] ?? true;
}

export default useSiteSettings;