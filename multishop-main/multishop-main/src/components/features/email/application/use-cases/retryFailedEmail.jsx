/**
 * 📧 Retry Failed Email Use-Case
 * 
 * Retry emails from Dead Letter Queue
 */

import { deadLetterQueue } from '../../infrastructure/queue/DeadLetterQueue';
import { queueProcessor } from '../../infrastructure/queue/QueueProcessor';
import { sendEmailViaPipeline } from '../../core';

/**
 * Retry a single failed email
 * 
 * @param {string} dlqItemId - DLQ item ID
 * @returns {Promise<Object>}
 */
export async function retrySingleEmail(dlqItemId) {
  const item = deadLetterQueue.getById(dlqItemId);
  
  if (!item) {
    return {
      success: false,
      error: 'DLQ item not found'
    };
  }

  if (item.status !== 'pending') {
    return {
      success: false,
      error: `Item status is ${item.status}, cannot retry`
    };
  }

  console.log(`📧 [RetryFailedEmail] Retrying: ${dlqItemId}`);
  
  deadLetterQueue.markForRetry(dlqItemId);

  try {
    const result = await sendEmailViaPipeline(item.emailPayload, {
      source: 'manual_retry',
      retryCount: item.attempts + item.retryCount
    });

    if (result.status === 'success') {
      deadLetterQueue.resolve(dlqItemId, 'manual_retry_success');
      console.log(`✅ [RetryFailedEmail] Success: ${dlqItemId}`);
      return {
        success: true,
        messageId: result.messageId,
        dlqItemId
      };
    }

    // Still failed
    item.status = 'pending';
    item.lastAttempt = {
      timestamp: Date.now(),
      error: result.error
    };
    
    console.log(`❌ [RetryFailedEmail] Still failed: ${dlqItemId}`);
    return {
      success: false,
      error: result.error,
      dlqItemId
    };
  } catch (error) {
    item.status = 'pending';
    console.error(`❌ [RetryFailedEmail] Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      dlqItemId
    };
  }
}

/**
 * Retry all pending failed emails
 * 
 * @param {number} [limit=50]
 * @returns {Promise<Object>}
 */
export async function retryAllPending(limit = 50) {
  console.log(`📧 [RetryFailedEmail] Retrying all pending (limit: ${limit})`);
  
  return queueProcessor.retryFromDLQ(limit);
}

/**
 * Discard a failed email (won't retry)
 * 
 * @param {string} dlqItemId 
 * @param {string} [reason]
 * @returns {Object}
 */
export function discardFailedEmail(dlqItemId, reason = 'manual_discard') {
  const success = deadLetterQueue.discard(dlqItemId, reason);
  
  return {
    success,
    dlqItemId,
    message: success ? 'Discarded' : 'Item not found'
  };
}

/**
 * Get failed emails summary
 * 
 * @returns {Object}
 */
export function getFailedEmailsSummary() {
  const stats = deadLetterQueue.getStats();
  const pending = deadLetterQueue.getPendingForRetry(100);

  return {
    stats,
    pendingCount: pending.length,
    pendingItems: pending.slice(0, 20).map(item => ({
      id: item.id,
      recipientEmail: item.metadata?.recipientEmail,
      emailType: item.metadata?.emailType,
      error: item.error,
      attempts: item.attempts,
      addedAt: new Date(item.addedAt).toISOString()
    }))
  };
}

export default {
  retrySingleEmail,
  retryAllPending,
  discardFailedEmail,
  getFailedEmailsSummary
};