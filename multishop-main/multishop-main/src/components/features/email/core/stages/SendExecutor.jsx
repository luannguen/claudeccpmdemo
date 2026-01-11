/**
 * 📧 Send Executor Stage
 * 
 * Stage 5: Execute email send via provider
 * 
 * Input: context.provider, context.renderedContent, context.emailPayload
 * Output: context.sendResult { success, messageId, error }
 */

import { retryWithBackoff } from '../../domain/policies/retryPolicy';

/**
 * Execute email send
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function sendExecutor(context) {
  const { provider, renderedContent, emailPayload, metadata } = context;
  
  if (!provider) {
    throw new Error('Provider not available. Run ProviderRouter first.');
  }
  
  if (!renderedContent) {
    throw new Error('Rendered content not available. Run TemplateRenderer first.');
  }
  
  if (!emailPayload) {
    throw new Error('Email payload not available. Run PayloadNormalizer first.');
  }

  const { recipientEmail, recipientName, priority } = emailPayload;
  const { subject, body } = renderedContent;

  console.log(`📧 [SendExecutor] Sending to ${recipientEmail} via ${provider.name}`);

  const sendParams = {
    to: recipientEmail,
    toName: recipientName,
    subject,
    body,
    priority,
    metadata: {
      pipelineId: context.id,
      emailType: emailPayload.emailType,
      retryCount: metadata?.retryCount || 0
    }
  };

  try {
    // Apply retry policy for transactional emails
    const shouldRetry = priority === 'high';
    const maxRetries = shouldRetry ? 3 : 1;

    let result;
    
    if (shouldRetry && maxRetries > 1) {
      // Use retry policy
      result = await retryWithBackoff(
        () => provider.send(sendParams),
        {
          maxRetries,
          baseDelay: 1000,
          maxDelay: 10000
        }
      );
    } else {
      // Single attempt
      result = await provider.send(sendParams);
    }

    if (result.success) {
      console.log(`✅ [SendExecutor] Sent successfully: ${result.messageId || 'no-id'}`);
    } else {
      console.warn(`⚠️ [SendExecutor] Send returned failure: ${result.error}`);
    }

    return {
      sendResult: {
        success: result.success,
        messageId: result.messageId,
        provider: provider.name,
        sentAt: new Date().toISOString(),
        error: result.error || null
      }
    };
  } catch (error) {
    console.error(`❌ [SendExecutor] Send failed:`, error.message);
    
    return {
      sendResult: {
        success: false,
        messageId: null,
        provider: provider.name,
        sentAt: new Date().toISOString(),
        error: error.message
      }
    };
  }
}

export default sendExecutor;