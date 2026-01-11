/**
 * 📧 Queue Processor - Background worker for email queue
 * 
 * Processes emails from queue respecting:
 * - Priority order
 * - Rate limits
 * - Retry policies
 */

import { emailQueue } from './EmailQueue';
import { deadLetterQueue } from './DeadLetterQueue';
import { sendEmailViaPipeline } from '../../core';

/**
 * @typedef {Object} ProcessorConfig
 * @property {number} batchSize - Emails per batch
 * @property {number} intervalMs - Interval between batches
 * @property {number} maxRetries - Max retries before DLQ
 * @property {number} rateLimit - Emails per minute
 */

class QueueProcessor {
  constructor() {
    this.config = {
      batchSize: 5,
      intervalMs: 2000,
      maxRetries: 3,
      rateLimit: 30 // per minute
    };
    
    this.running = false;
    this.intervalId = null;
    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      startedAt: null,
      lastProcessedAt: null
    };
    
    // Rate limiting
    this.sentThisMinute = 0;
    this.minuteStart = Date.now();
  }

  /**
   * Start processor
   * @param {Partial<ProcessorConfig>} [config]
   */
  start(config = {}) {
    if (this.running) {
      console.warn('⚠️ [QueueProcessor] Already running');
      return;
    }

    this.config = { ...this.config, ...config };
    this.running = true;
    this.stats.startedAt = Date.now();

    console.log('📧 [QueueProcessor] Starting...', this.config);

    this.intervalId = setInterval(() => {
      this.processBatch();
    }, this.config.intervalMs);

    // Process immediately
    this.processBatch();
  }

  /**
   * Stop processor
   */
  stop() {
    if (!this.running) return;

    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('📧 [QueueProcessor] Stopped', this.getStats());
  }

  /**
   * Process a batch of emails
   */
  async processBatch() {
    if (!this.running) return;

    // Check rate limit
    this.checkRateLimit();
    const availableSlots = this.getRateLimitSlots();
    
    if (availableSlots <= 0) {
      console.log('📧 [QueueProcessor] Rate limit reached, waiting...');
      return;
    }

    const batchSize = Math.min(this.config.batchSize, availableSlots);
    const batch = [];

    // Dequeue items
    for (let i = 0; i < batchSize; i++) {
      const item = emailQueue.dequeue();
      if (!item) break;
      batch.push(item);
    }

    if (batch.length === 0) return;

    console.log(`📧 [QueueProcessor] Processing batch of ${batch.length} emails`);

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(item => this.processItem(item))
    );

    // Update stats
    results.forEach((result, index) => {
      this.stats.processed++;
      this.sentThisMinute++;
      
      if (result.status === 'fulfilled' && result.value.success) {
        this.stats.succeeded++;
      } else {
        this.stats.failed++;
      }
    });

    this.stats.lastProcessedAt = Date.now();
  }

  /**
   * Process single queue item
   * @param {Object} item 
   * @returns {Promise<Object>}
   */
  async processItem(item) {
    try {
      const result = await sendEmailViaPipeline(item.emailPayload, {
        source: 'queue',
        retryCount: item.attempts - 1,
        maxRetries: this.config.maxRetries,
        metadata: item.metadata
      });

      if (result.status === 'success') {
        console.log(`✅ [QueueProcessor] Sent: ${item.id}`);
        return { success: true, result };
      }

      // Failed - check if should retry
      if (result.retryable && item.attempts < this.config.maxRetries) {
        // Re-queue with backoff
        const delay = Math.min(1000 * Math.pow(2, item.attempts), 60000);
        emailQueue.enqueue(item.emailPayload, item.priority, {
          scheduledAt: Date.now() + delay,
          metadata: { ...item.metadata, previousAttempts: item.attempts }
        });
        console.log(`🔄 [QueueProcessor] Re-queued: ${item.id} (delay: ${delay}ms)`);
      } else {
        // Move to DLQ
        deadLetterQueue.add({
          emailPayload: item.emailPayload,
          error: result.error,
          failedStage: result.failedStage,
          attempts: item.attempts,
          pipelineResult: result
        });
        console.log(`💀 [QueueProcessor] Moved to DLQ: ${item.id}`);
      }

      return { success: false, result };
    } catch (error) {
      console.error(`❌ [QueueProcessor] Error processing ${item.id}:`, error);
      
      // Unexpected error - move to DLQ
      deadLetterQueue.add({
        emailPayload: item.emailPayload,
        error: error.message,
        failedStage: 'QueueProcessor',
        attempts: item.attempts
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Check and reset rate limit counter
   */
  checkRateLimit() {
    const now = Date.now();
    if (now - this.minuteStart >= 60000) {
      this.sentThisMinute = 0;
      this.minuteStart = now;
    }
  }

  /**
   * Get available rate limit slots
   * @returns {number}
   */
  getRateLimitSlots() {
    return Math.max(0, this.config.rateLimit - this.sentThisMinute);
  }

  /**
   * Get processor stats
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      running: this.running,
      queueSize: emailQueue.size(),
      dlqSize: deadLetterQueue.getStats().total,
      rateLimit: {
        limit: this.config.rateLimit,
        used: this.sentThisMinute,
        available: this.getRateLimitSlots()
      },
      uptime: this.stats.startedAt 
        ? Date.now() - this.stats.startedAt 
        : 0
    };
  }

  /**
   * Process DLQ retries
   * @param {number} [limit=10]
   */
  async retryFromDLQ(limit = 10) {
    const pending = deadLetterQueue.getPendingForRetry(limit);
    
    if (pending.length === 0) {
      console.log('📧 [QueueProcessor] No pending DLQ items');
      return { processed: 0 };
    }

    console.log(`📧 [QueueProcessor] Retrying ${pending.length} DLQ items`);

    let succeeded = 0;
    let failed = 0;

    for (const item of pending) {
      deadLetterQueue.markForRetry(item.id);
      
      try {
        const result = await sendEmailViaPipeline(item.emailPayload, {
          source: 'dlq_retry',
          retryCount: item.attempts + item.retryCount
        });

        if (result.status === 'success') {
          deadLetterQueue.resolve(item.id, 'retry_success');
          succeeded++;
        } else {
          // Still failed - update attempt count
          item.attempts++;
          item.lastAttempt = {
            timestamp: Date.now(),
            error: result.error
          };
          item.status = 'pending';
          failed++;
        }
      } catch (error) {
        item.status = 'pending';
        item.lastAttempt = {
          timestamp: Date.now(),
          error: error.message
        };
        failed++;
      }
    }

    console.log(`📧 [QueueProcessor] DLQ retry: ${succeeded} succeeded, ${failed} failed`);
    return { processed: pending.length, succeeded, failed };
  }
}

// Singleton instance
export const queueProcessor = new QueueProcessor();

export default queueProcessor;