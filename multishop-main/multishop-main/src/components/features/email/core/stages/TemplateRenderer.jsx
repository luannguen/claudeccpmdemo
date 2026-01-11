/**
 * 📧 Template Renderer Stage
 * 
 * Stage 3: Render template with variables
 * 
 * Input: context.template, context.emailPayload.variables
 * Output: context.renderedContent { subject, body }
 */

import { templateEngine } from '../../domain/services/templateEngine';

/**
 * Render template with variables
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function templateRenderer(context) {
  const { template, emailPayload } = context;
  
  if (!template) {
    throw new Error('Template not available. Run TemplateSelector first.');
  }
  
  if (!emailPayload) {
    throw new Error('Email payload not available. Run PayloadNormalizer first.');
  }

  console.log(`📧 [TemplateRenderer] Rendering template: ${template.name}`);

  const { variables } = emailPayload;

  try {
    // Render subject
    const subject = templateEngine.render(template.subject, variables);
    
    // Render body
    const body = templateEngine.render(template.body, variables);

    // Validate rendered content
    if (!subject || subject.trim() === '') {
      throw new Error('Rendered subject is empty');
    }
    
    if (!body || body.trim() === '') {
      throw new Error('Rendered body is empty');
    }

    console.log(`📧 [TemplateRenderer] Rendered subject: ${subject.substring(0, 50)}...`);

    return {
      renderedContent: {
        subject: subject.trim(),
        body: body.trim(),
        plainText: stripHtml(body).trim(),
        renderedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ [TemplateRenderer] Render failed:`, error.message);
    
    // Return error template instead of failing
    return {
      renderedContent: {
        subject: `Thông báo từ Farmer Smart`,
        body: getErrorTemplate(error.message),
        plainText: `Có lỗi xảy ra khi render email. Vui lòng liên hệ hỗ trợ.`,
        renderedAt: new Date().toISOString(),
        renderError: error.message
      }
    };
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get error template for render failures
 */
function getErrorTemplate(errorMessage) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f44336; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">Thông Báo</h2>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
        <p>Bạn có thông báo mới từ Farmer Smart.</p>
        <p style="color: #666; font-size: 12px;">
          Nếu bạn cần hỗ trợ, vui lòng liên hệ chúng tôi.
        </p>
      </div>
    </div>
  `;
}

export default templateRenderer;