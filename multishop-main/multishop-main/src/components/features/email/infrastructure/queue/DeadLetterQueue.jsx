/**
 * 📧 Dead Letter Queue - Store failed emails for retry/inspection
 * 
 * Emails land here when:
 * - Max retries exceeded
 * - Non-retryable error
 * - Manual inspection needed
 */

/**
 * @typedef {Object} DLQItem
 * @property {string} id
 * @property {Object} emailPayload
 * @property {string} error
 * @property {string} failedStage
 * @property {number} attempts
 * @property {number} addedAt
 * @property {Object} lastAttempt
 * @property {'pending'|'retrying'|'resolved'|'discarded'} status
 */

class DeadLetterQueue {
  constructor() {
    this.items = [];
    this.maxSize = 500;
  }

  /**
   * Add failed email to DLQ
   * @param {Object} params
   * @returns {string} DLQ item ID
   */
  add({ emailPayload, error, failedStage, attempts, pipelineResult }) {
    if (this.items.length >= this.maxSize) {
      // Remove oldest resolved/discarded items
      this.cleanup();
    }

    const item = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      emailPayload,
      error: error instanceof Error ? error.message : error,
      failedStage: failedStage || 'unknown',
      attempts: attempts || 1,
      addedAt: Date.now(),
      lastAttempt: {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : error,
        pipelineId: pipelineResult?.pipelineId
      },
      status: 'pending',
      retryCount: 0,
      metadata: {
        recipientEmail: emailPayload?.recipientEmail,
        emailType: emailPayload?.emailType,
        priority: emailPayload?.priority
      }
    };

    this.items.push(item);
    console.log(`📧 [DLQ] Added: ${item.id} (${item.error.substring(0, 50)}...)`);
    
    return item.id;
  }

  /**
   * Get all DLQ items
   * @param {Object} [filters]
   * @returns {DLQItem[]}
   */
  getAll(filters = {}) {
    let result = [...this.items];

    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }
    if (filters.emailType) {
      result = result.filter(item => item.metadata?.emailType === filters.emailType);
    }
    if (filters.since) {
      result = result.filter(item => item.addedAt >= filters.since);
    }

    // Sort by addedAt desc (newest first)
    result.sort((a, b) => b.addedAt - a.addedAt);

    return result;
  }

  /**
   * Get single item by ID
   * @param {string} id 
   * @returns {DLQItem|null}
   */
  getById(id) {
    return this.items.find(item => item.id === id) || null;
  }

  /**
   * Mark item for retry
   * @param {string} id 
   * @returns {DLQItem|null}
   */
  markForRetry(id) {
    const item = this.getById(id);
    if (!item) return null;

    item.status = 'retrying';
    item.retryCount++;
    console.log(`📧 [DLQ] Marked for retry: ${id}`);
    
    return item;
  }

  /**
   * Mark item as resolved
   * @param {string} id 
   * @param {string} [resolution]
   * @returns {boolean}
   */
  resolve(id, resolution = 'manual') {
    const item = this.getById(id);
    if (!item) return false;

    item.status = 'resolved';
    item.resolvedAt = Date.now();
    item.resolution = resolution;
    console.log(`📧 [DLQ] Resolved: ${id}`);
    
    return true;
  }

  /**
   * Discard item (won't retry)
   * @param {string} id 
   * @param {string} [reason]
   * @returns {boolean}
   */
  discard(id, reason = 'manual') {
    const item = this.getById(id);
    if (!item) return false;

    item.status = 'discarded';
    item.discardedAt = Date.now();
    item.discardReason = reason;
    console.log(`📧 [DLQ] Discarded: ${id}`);
    
    return true;
  }

  /**
   * Remove item from DLQ
   * @param {string} id 
   * @returns {boolean}
   */
  remove(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    console.log(`📧 [DLQ] Removed: ${id}`);
    return true;
  }

  /**
   * Get pending items for retry
   * @param {number} [limit=10]
   * @returns {DLQItem[]}
   */
  getPendingForRetry(limit = 10) {
    return this.items
      .filter(item => item.status === 'pending')
      .slice(0, limit);
  }

  /**
   * Get DLQ stats
   * @returns {Object}
   */
  getStats() {
    const stats = {
      total: this.items.length,
      pending: 0,
      retrying: 0,
      resolved: 0,
      discarded: 0,
      byEmailType: {},
      byError: {}
    };

    this.items.forEach(item => {
      stats[item.status]++;
      
      // By email type
      const type = item.metadata?.emailType || 'unknown';
      stats.byEmailType[type] = (stats.byEmailType[type] || 0) + 1;
      
      // By error (first word)
      const errorKey = item.error?.split(' ')[0] || 'unknown';
      stats.byError[errorKey] = (stats.byError[errorKey] || 0) + 1;
    });

    return stats;
  }

  /**
   * Cleanup old resolved/discarded items
   * @param {number} [olderThanMs=86400000] - Default: 24 hours
   */
  cleanup(olderThanMs = 86400000) {
    const cutoff = Date.now() - olderThanMs;
    const before = this.items.length;

    this.items = this.items.filter(item => {
      if (['resolved', 'discarded'].includes(item.status)) {
        const finishedAt = item.resolvedAt || item.discardedAt;
        return finishedAt > cutoff;
      }
      return true;
    });

    const removed = before - this.items.length;
    if (removed > 0) {
      console.log(`📧 [DLQ] Cleanup: removed ${removed} old items`);
    }
  }

  /**
   * Clear all items
   */
  clear() {
    this.items = [];
    console.log('📧 [DLQ] Cleared all items');
  }

  /**
   * Export items for debugging
   * @returns {Object}
   */
  export() {
    return {
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      items: this.items.map(item => ({
        id: item.id,
        recipientEmail: item.metadata?.recipientEmail,
        emailType: item.metadata?.emailType,
        error: item.error,
        failedStage: item.failedStage,
        attempts: item.attempts,
        status: item.status,
        addedAt: new Date(item.addedAt).toISOString()
      }))
    };
  }
}

// Singleton instance
export const deadLetterQueue = new DeadLetterQueue();

export default deadLetterQueue;