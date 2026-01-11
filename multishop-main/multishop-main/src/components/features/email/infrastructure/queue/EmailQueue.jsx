/**
 * 📧 Email Queue - Priority queue for email sending
 * 
 * In-memory implementation (upgrade to Redis later)
 * Priority: high > normal > low
 */

/**
 * @typedef {Object} QueueItem
 * @property {string} id
 * @property {Object} emailPayload
 * @property {'high'|'normal'|'low'} priority
 * @property {number} addedAt
 * @property {number} [scheduledAt]
 * @property {number} attempts
 */

class EmailQueue {
  constructor() {
    this.queues = {
      high: [],
      normal: [],
      low: []
    };
    this.processing = false;
    this.maxSize = 1000;
  }

  /**
   * Add email to queue
   * @param {Object} emailPayload 
   * @param {'high'|'normal'|'low'} priority 
   * @param {Object} [options]
   * @returns {string} Queue item ID
   */
  enqueue(emailPayload, priority = 'normal', options = {}) {
    const queueKey = ['high', 'normal', 'low'].includes(priority) ? priority : 'normal';
    
    if (this.size() >= this.maxSize) {
      console.warn('⚠️ [EmailQueue] Queue full, rejecting email');
      throw new Error('Email queue is full');
    }

    const item = {
      id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      emailPayload,
      priority: queueKey,
      addedAt: Date.now(),
      scheduledAt: options.scheduledAt || null,
      attempts: 0,
      metadata: options.metadata || {}
    };

    this.queues[queueKey].push(item);
    console.log(`📧 [EmailQueue] Enqueued: ${item.id} (${queueKey})`);
    
    return item.id;
  }

  /**
   * Get next item from queue (priority order)
   * @returns {QueueItem|null}
   */
  dequeue() {
    const now = Date.now();

    // Check high priority first
    for (const priority of ['high', 'normal', 'low']) {
      const queue = this.queues[priority];
      
      // Find first item that's ready (not scheduled or past scheduled time)
      const readyIndex = queue.findIndex(item => 
        !item.scheduledAt || item.scheduledAt <= now
      );

      if (readyIndex !== -1) {
        const item = queue.splice(readyIndex, 1)[0];
        item.attempts++;
        console.log(`📧 [EmailQueue] Dequeued: ${item.id} (attempt ${item.attempts})`);
        return item;
      }
    }

    return null;
  }

  /**
   * Peek at next item without removing
   * @returns {QueueItem|null}
   */
  peek() {
    const now = Date.now();

    for (const priority of ['high', 'normal', 'low']) {
      const queue = this.queues[priority];
      const readyItem = queue.find(item => 
        !item.scheduledAt || item.scheduledAt <= now
      );
      if (readyItem) return readyItem;
    }

    return null;
  }

  /**
   * Get queue size
   * @param {'high'|'normal'|'low'|'all'} [priority='all']
   * @returns {number}
   */
  size(priority = 'all') {
    if (priority === 'all') {
      return this.queues.high.length + this.queues.normal.length + this.queues.low.length;
    }
    return this.queues[priority]?.length || 0;
  }

  /**
   * Get queue stats
   * @returns {Object}
   */
  getStats() {
    return {
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      total: this.size(),
      maxSize: this.maxSize,
      processing: this.processing
    };
  }

  /**
   * Clear queue
   * @param {'high'|'normal'|'low'|'all'} [priority='all']
   */
  clear(priority = 'all') {
    if (priority === 'all') {
      this.queues.high = [];
      this.queues.normal = [];
      this.queues.low = [];
    } else if (this.queues[priority]) {
      this.queues[priority] = [];
    }
    console.log(`📧 [EmailQueue] Cleared: ${priority}`);
  }

  /**
   * Remove specific item
   * @param {string} itemId 
   * @returns {boolean}
   */
  remove(itemId) {
    for (const priority of ['high', 'normal', 'low']) {
      const index = this.queues[priority].findIndex(item => item.id === itemId);
      if (index !== -1) {
        this.queues[priority].splice(index, 1);
        console.log(`📧 [EmailQueue] Removed: ${itemId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get all items (for inspection)
   * @returns {QueueItem[]}
   */
  getAll() {
    return [
      ...this.queues.high,
      ...this.queues.normal,
      ...this.queues.low
    ];
  }
}

// Singleton instance
export const emailQueue = new EmailQueue();

export default emailQueue;