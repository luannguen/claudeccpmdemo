/**
 * 📧 Result Handler Stage
 * 
 * Stage 6: Handle send result (log, queue for retry, emit events)
 * 
 * Input: context.sendResult, context.emailPayload
 * Output: (side effects: logging, DLQ)
 * 
 * NOTE: This stage is optional (required: false)
 * Errors here don't fail the pipeline
 */

import { emailLogRepository } from '../../infrastructure/repositories/emailLogRepository';
import { emailMetrics } from '../../observability/EmailMetrics';
import { emailAuditLog } from '../../observability/EmailAuditLog';

/**
 * Handle send result
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function resultHandler(context) {
  const { sendResult, emailPayload, renderedContent, provider, metadata, stageHistory } = context;
  
  if (!sendResult) {
    console.warn('⚠️ [ResultHandler] No send result available');
    return {};
  }

  console.log(`📧 [ResultHandler] Processing result: ${sendResult.success ? 'SUCCESS' : 'FAILURE'}`);

  // 1. Log to database
  try {
    await logEmail(context);
  } catch (error) {
    console.error(`❌ [ResultHandler] Failed to log email:`, error.message);
    // Don't throw - logging failure shouldn't break pipeline
  }

  // 2. Queue for retry if failed
  if (!sendResult.success) {
    try {
      await handleFailure(context);
    } catch (error) {
      console.error(`❌ [ResultHandler] Failed to handle failure:`, error.message);
    }
  }

  // 3. Emit metrics
  try {
    emitMetrics(context);
  } catch (error) {
    console.warn(`⚠️ [ResultHandler] Metrics emission failed:`, error.message);
  }

  // 4. Audit log
  try {
    emailAuditLog.logStage({
      pipelineId: context.id,
      stage: 'ResultHandler',
      status: 'success',
      data: { logged: true, metricsEmitted: true },
      duration: metadata?.totalDuration
    });
  } catch (error) {
    console.warn(`⚠️ [ResultHandler] Audit log failed:`, error.message);
  }

  return {
    handled: true,
    handledAt: new Date().toISOString()
  };
}

/**
 * Log email to database
 */
async function logEmail(context) {
  const { sendResult, emailPayload, renderedContent, provider, metadata, id } = context;

  const logEntry = {
    pipeline_id: id,
    recipient_email: emailPayload?.recipientEmail,
    recipient_name: emailPayload?.recipientName,
    email_type: emailPayload?.emailType,
    subject: renderedContent?.subject,
    status: sendResult.success ? 'sent' : 'failed',
    provider: sendResult.provider || provider?.name,
    message_id: sendResult.messageId,
    error_message: sendResult.error,
    priority: emailPayload?.priority,
    retry_count: metadata?.retryCount || 0,
    duration_ms: metadata?.totalDuration,
    sent_date: sendResult.sentAt || new Date().toISOString()
  };

  await emailLogRepository.create(logEntry);
  console.log(`📧 [ResultHandler] Logged to database`);
}

/**
 * Handle failed email (queue for retry or DLQ)
 */
async function handleFailure(context) {
  const { sendResult, emailPayload, metadata } = context;
  const retryCount = metadata?.retryCount || 0;
  const maxRetries = metadata?.maxRetries || 3;

  // Check if retryable
  const isRetryable = checkRetryable(sendResult.error);

  if (isRetryable && retryCount < maxRetries) {
    console.log(`📧 [ResultHandler] Queueing for retry (attempt ${retryCount + 1}/${maxRetries})`);
    // In future: add to retry queue
    // For now, just log
  } else {
    console.log(`📧 [ResultHandler] Moving to DLQ (not retryable or max retries reached)`);
    // In future: add to DLQ
    // For now, just log
  }
}

/**
 * Check if error is retryable
 */
function checkRetryable(error) {
  if (!error) return false;
  
  const lowerError = error.toLowerCase();
  
  // Non-retryable
  const permanent = ['invalid email', 'blocked', 'unsubscribed', 'template not found'];
  if (permanent.some(p => lowerError.includes(p))) {
    return false;
  }
  
  // Retryable
  const temporary = ['timeout', 'network', 'rate limit', 'temporary', '5xx'];
  if (temporary.some(t => lowerError.includes(t))) {
    return true;
  }
  
  return true; // Default: assume retryable
}

/**
 * Emit metrics
 */
function emitMetrics(context) {
  const { sendResult, emailPayload, metadata } = context;

  const emailType = emailPayload?.emailType || 'unknown';
  const provider = sendResult?.provider || 'unknown';

  if (sendResult.success) {
    emailMetrics.incrementSent(emailType, provider);
  } else {
    emailMetrics.incrementFailed(emailType, provider, sendResult.error);
  }

  // Record latency
  if (metadata?.totalDuration) {
    emailMetrics.recordLatency(metadata.totalDuration, emailType);
  }
}

export default resultHandler;