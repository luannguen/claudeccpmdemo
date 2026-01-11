/**
 * 📧 Email Template Repository - Data Access for Templates
 * 
 * Repository pattern for email template CRUD operations.
 * Infrastructure layer - phụ thuộc Base44 SDK.
 */

import { base44 } from '@/api/base44Client';

/**
 * Email Template Repository
 */
export const emailTemplateRepository = {
  /**
   * List all templates
   * @param {Object} [options]
   * @param {number} [options.limit=500] - Maximum templates to return
   * @returns {Promise<Array>} List of templates
   */
  list: async (options = {}) => {
    try {
      const { limit = 500 } = options;
      const templates = await base44.entities.EmailTemplate.list('-created_date', limit);
      return templates;
    } catch (error) {
      console.error('❌ Failed to list email templates:', error);
      return [];
    }
  },

  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object|null>}
   */
  getById: async (id) => {
    try {
      const templates = await base44.entities.EmailTemplate.filter({ id }, '-created_date', 1);
      return templates[0] || null;
    } catch (error) {
      console.error('❌ Failed to get template:', error);
      return null;
    }
  },

  /**
   * Get active template by type
   * @param {string} type - Email type (order_confirmation, shipping_notification, etc.)
   * @returns {Promise<Object|null>} Template or null
   */
  getByType: async (type) => {
    try {
      const templates = await base44.entities.EmailTemplate.filter(
        { type, is_active: true },
        '-created_date',
        100
      );

      // Prefer default template
      const defaultTemplate = templates.find(t => t.is_default);
      if (defaultTemplate) {
        return defaultTemplate;
      }

      // Fallback to first active
      return templates[0] || null;
    } catch (error) {
      console.error(`❌ Failed to get template for type ${type}:`, error);
      return null;
    }
  },

  /**
   * Get all active templates for a type
   * @param {string} type - Email type
   * @returns {Promise<Array>}
   */
  getAllByType: async (type) => {
    try {
      return await base44.entities.EmailTemplate.filter(
        { type, is_active: true },
        '-created_date',
        100
      );
    } catch (error) {
      console.error(`❌ Failed to get templates for type ${type}:`, error);
      return [];
    }
  },

  /**
   * Get default template for a type
   * @param {string} type - Email type
   * @returns {Promise<Object|null>}
   */
  getDefault: async (type) => {
    try {
      const templates = await base44.entities.EmailTemplate.filter(
        { type, is_active: true, is_default: true },
        '-created_date',
        1
      );
      return templates[0] || null;
    } catch (error) {
      console.error(`❌ Failed to get default template for ${type}:`, error);
      return null;
    }
  },

  /**
   * Create a new template
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Created template
   */
  create: async (data) => {
    try {
      const template = await base44.entities.EmailTemplate.create({
        ...data,
        usage_count: 0
      });
      console.log('✅ Email template created:', template.id);
      return template;
    } catch (error) {
      console.error('❌ Failed to create template:', error);
      throw error;
    }
  },

  /**
   * Update a template
   * @param {string} id - Template ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated template
   */
  update: async (id, data) => {
    try {
      const template = await base44.entities.EmailTemplate.update(id, data);
      console.log('✅ Email template updated:', id);
      return template;
    } catch (error) {
      console.error('❌ Failed to update template:', error);
      throw error;
    }
  },

  /**
   * Delete a template
   * @param {string} id - Template ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      await base44.entities.EmailTemplate.delete(id);
      console.log('✅ Email template deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete template:', error);
      return false;
    }
  },

  /**
   * Set a template as default for its type
   * @param {string} id - Template ID
   * @returns {Promise<boolean>}
   */
  setAsDefault: async (id) => {
    try {
      // Get the template to find its type
      const template = await emailTemplateRepository.getById(id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Unset all defaults for this type
      const sameTypeTemplates = await base44.entities.EmailTemplate.filter(
        { type: template.type, is_default: true },
        '-created_date',
        100
      );

      for (const t of sameTypeTemplates) {
        if (t.id !== id) {
          await base44.entities.EmailTemplate.update(t.id, { is_default: false });
        }
      }

      // Set new default
      await base44.entities.EmailTemplate.update(id, { is_default: true });
      console.log('✅ Template set as default:', id);
      return true;
    } catch (error) {
      console.error('❌ Failed to set template as default:', error);
      return false;
    }
  },

  /**
   * Increment usage count for a template
   * @param {string} id - Template ID
   */
  incrementUsage: async (id) => {
    try {
      const template = await emailTemplateRepository.getById(id);
      if (template) {
        await base44.entities.EmailTemplate.update(id, {
          usage_count: (template.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to increment template usage:', error.message);
      // Non-critical, don't throw
    }
  }
};

export default emailTemplateRepository;