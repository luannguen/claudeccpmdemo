/**
 * Page Service - CMS Service Layer
 * 
 * Quản lý CRUD cho Page và SiteConfig entities.
 * Tuân thủ Result pattern theo AI-CODING-RULES.
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";

// ========== PAGE SERVICE ==========

export const pageService = {
  /**
   * Lấy danh sách tất cả trang
   */
  list: async (sort = '-created_date') => {
    try {
      const pages = await base44.entities.Page.list(sort);
      return success(pages);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy danh sách trang đã publish (optimized)
   */
  listPublished: async () => {
    try {
      const pages = await base44.entities.Page.filter(
        { status: 'published' },
        '-menu_order',
        100
      );
      return success(pages);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy trang theo slug (optimized)
   */
  getBySlug: async (slug) => {
    try {
      if (!slug) {
        return failure('Slug không được để trống', ErrorCodes.VALIDATION_ERROR);
      }
      const pages = await base44.entities.Page.filter({ slug }, '-created_date', 1);
      if (!pages.length) {
        return failure('Không tìm thấy trang', ErrorCodes.NOT_FOUND);
      }
      return success(pages[0]);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy trang theo ID (optimized)
   */
  getById: async (id) => {
    try {
      if (!id) {
        return failure('ID không được để trống', ErrorCodes.VALIDATION_ERROR);
      }
      const pages = await base44.entities.Page.filter({ id }, '-created_date', 1);
      if (!pages.length) {
        return failure('Không tìm thấy trang', ErrorCodes.NOT_FOUND);
      }
      return success(pages[0]);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo trang mới
   */
  create: async (data) => {
    try {
      // Validate required fields
      if (!data.slug) {
        return failure('Slug không được để trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (!data.title) {
        return failure('Tiêu đề không được để trống', ErrorCodes.VALIDATION_ERROR);
      }

      // Check slug unique
      const allPages = await base44.entities.Page.list('-created_date', 500);
      const existing = allPages.find(p => p.slug === data.slug);
      if (existing) {
        return failure('Slug đã tồn tại', ErrorCodes.VALIDATION_ERROR);
      }

      // Create page
      const page = await base44.entities.Page.create({
        ...data,
        status: data.status || 'draft',
        template: data.template || 'default',
        sections: data.sections || [],
        show_in_menu: data.show_in_menu || false,
        menu_order: data.menu_order || 0
      });

      return success(page);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật trang
   */
  update: async (id, data) => {
    try {
      if (!id) {
        return failure('ID không được để trống', ErrorCodes.VALIDATION_ERROR);
      }

      // If changing slug, check unique
      if (data.slug) {
        const allPages = await base44.entities.Page.list('-created_date', 500);
        const existing = allPages.find(p => p.slug === data.slug);
        if (existing && existing.id !== id) {
          return failure('Slug đã tồn tại', ErrorCodes.VALIDATION_ERROR);
        }
      }

      const page = await base44.entities.Page.update(id, data);
      return success(page);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Xóa trang
   */
  delete: async (id) => {
    try {
      if (!id) {
        return failure('ID không được để trống', ErrorCodes.VALIDATION_ERROR);
      }
      await base44.entities.Page.delete(id);
      return success({ deleted: true });
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Publish trang
   */
  publish: async (id) => {
    try {
      const page = await base44.entities.Page.update(id, {
        status: 'published',
        published_date: new Date().toISOString()
      });
      return success(page);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Unpublish trang
   */
  unpublish: async (id) => {
    try {
      const page = await base44.entities.Page.update(id, {
        status: 'draft'
      });
      return success(page);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== SITE CONFIG SERVICE ==========

export const siteConfigService = {
  /**
   * Lấy config chính (optimized - filter instead of list all)
   */
  getMainConfig: async () => {
    try {
      const configs = await base44.entities.SiteConfig.filter(
        { config_key: 'main' },
        '-created_date',
        1
      );
      
      if (!configs.length) {
        console.log('📋 No main config found, returning defaults');
        return success(getDefaultSiteConfig());
      }
      return success(configs[0]);
    } catch (err) {
      console.error('❌ getMainConfig error:', err);
      // Return default config on error instead of failing
      return success(getDefaultSiteConfig());
    }
  },

  /**
   * Cập nhật hoặc tạo config (optimized)
   */
  saveConfig: async (data) => {
    try {
      const configs = await base44.entities.SiteConfig.filter({ config_key: 'main' }, '-created_date', 1);
      const existingConfig = configs[0];
      
      if (existingConfig) {
        // Deep merge with existing data to preserve other fields
        const mergedData = deepMerge(existingConfig, data);
        // Remove id and config_key from update data
        const { id, config_key, created_date, updated_date, created_by, ...updateData } = mergedData;
        
        console.log('📝 Saving SiteConfig:', updateData);
        const config = await base44.entities.SiteConfig.update(existingConfig.id, updateData);
        return success(config);
      } else {
        // Create new
        const config = await base44.entities.SiteConfig.create({
          config_key: 'main',
          ...data
        });
        return success(config);
      }
    } catch (err) {
      console.error('❌ SiteConfig save error:', err);
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// Helper function for deep merge
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

// ========== DEFAULT CONFIG ==========

function getDefaultSiteConfig() {
  return {
    config_key: 'main',
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
}

export default { pageService, siteConfigService, deepMerge };