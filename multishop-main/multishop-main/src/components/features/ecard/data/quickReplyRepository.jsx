/**
 * Quick Reply Template Repository
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

// Default system templates
const SYSTEM_TEMPLATES = [
  {
    title: 'Chào hỏi',
    content: 'Xin chào! Rất vui được kết nối với bạn. Mong chúng ta có thể hợp tác tốt đẹp!',
    category: 'greeting',
    is_system: true
  },
  {
    title: 'Cảm ơn',
    content: 'Cảm ơn bạn rất nhiều! Tôi rất trân trọng điều này.',
    category: 'thanks',
    is_system: true
  },
  {
    title: 'Theo dõi',
    content: 'Chào bạn, tôi muốn follow up về cuộc trò chuyện trước đó của chúng ta. Bạn có thời gian để trao đổi thêm không?',
    category: 'follow_up',
    is_system: true
  },
  {
    title: 'Chúc sinh nhật',
    content: 'Chúc mừng sinh nhật! 🎂 Chúc bạn một ngày thật vui vẻ và tràn đầy niềm vui!',
    category: 'birthday',
    is_system: true
  }
];

/**
 * Get all templates for user
 */
export const getTemplates = async (userEmail) => {
  const userTemplates = await base44.entities.QuickReplyTemplate.filter(
    { created_by: userEmail },
    '-use_count',
    100
  );
  
  // Merge with system templates
  const systemTemplates = SYSTEM_TEMPLATES.map((t, idx) => ({
    ...t,
    id: `system_${idx}`,
    use_count: 0
  }));
  
  return [...systemTemplates, ...userTemplates];
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (userEmail, category) => {
  const all = await getTemplates(userEmail);
  return all.filter(t => t.category === category);
};

/**
 * Create custom template
 */
export const createTemplate = async (data) => {
  return base44.entities.QuickReplyTemplate.create({
    ...data,
    is_system: false,
    use_count: 0
  });
};

/**
 * Update template
 */
export const updateTemplate = async (templateId, data) => {
  // Can't update system templates
  if (templateId.startsWith('system_')) return null;
  return base44.entities.QuickReplyTemplate.update(templateId, data);
};

/**
 * Delete template
 */
export const deleteTemplate = async (templateId) => {
  // Can't delete system templates
  if (templateId.startsWith('system_')) return null;
  return base44.entities.QuickReplyTemplate.delete(templateId);
};

/**
 * Increment use count
 */
export const incrementUseCount = async (templateId) => {
  // Skip system templates
  if (templateId.startsWith('system_')) return null;
  
  const templates = await base44.entities.QuickReplyTemplate.filter({ id: templateId });
  if (!templates || templates.length === 0) return null;
  
  const template = templates[0];
  return base44.entities.QuickReplyTemplate.update(templateId, {
    use_count: (template.use_count || 0) + 1
  });
};

export const quickReplyRepository = {
  getTemplates,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUseCount,
  SYSTEM_TEMPLATES
};

export default quickReplyRepository;