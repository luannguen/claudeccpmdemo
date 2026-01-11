/**
 * Event Queue - Priority-based async queue for notifications
 * 
 * Priority levels:
 * - urgent: Process immediately (sync)
 * - high: Process every 100ms
 * - normal: Batch process every 1s
 * - low: Batch process every 5s
 */

import { eventRegistry } from './eventRegistry';

class EventQueue {
  constructor() {
    this.queues = {
      urgent: [],
      high: [],
      normal: [],
      low: []
    };
    
    this.processing = false;
    this.batchSize = 10;
    this.started = false;
  }

  /**
   * Add event to queue
   * 
   * @param {string} eventName
   * @param {Object} payload
   * @param {Object} options - { priority: 'normal' }
   * @returns {Promise<void>}
   */
  async enqueue(eventName, payload, options = {}) {
    const { priority = 'normal' } = options;
    
    const item = {
      eventName,
      payload,
      priority,
      enqueuedAt: Date.now()
    };
    
    // Urgent → process immediately (sync)
    if (priority === 'urgent') {
      return this._processItem(item);
    }
    
    // Add to queue
    if (this.queues[priority]) {
      this.queues[priority].push(item);
    } else {
      console.warn(`Invalid priority: ${priority}, defaulting to normal`);
      this.queues.normal.push(item);
    }
    
    // Start processors if not started
    if (!this.started) {
      this._startProcessors();
    }
  }

  /**
   * Process single item
   */
  async _processItem(item) {
    const { eventName, payload } = item;
    const latency = Date.now() - item.enqueuedAt;
    
    // Get handlers from registry
    const handlers = eventRegistry.getHandlers(eventName);
    
    if (handlers.length === 0) {
      console.warn(`No handlers for queued event: ${eventName}`);
      return;
    }
    
    // Execute all handlers
    for (const { handler, once } of handlers) {
      try {
        await handler(payload);
        
        // Remove one-time handler after execution
        if (once) {
          eventRegistry.unregister(eventName, handler);
        }
      } catch (error) {
        console.error(`Queue handler failed for ${eventName}:`, error);
      }
    }
    
    console.log(`✅ Queued event processed: ${eventName} (latency: ${latency}ms)`);
  }

  /**
   * Start background processors
   */
  _startProcessors() {
    if (this.started) return;
    this.started = true;
    
    // High priority: every 100ms
    setInterval(() => this._processQueue('high'), 100);
    
    // Normal priority: every 1s
    setInterval(() => this._processQueue('normal'), 1000);
    
    // Low priority: every 5s
    setInterval(() => this._processQueue('low'), 5000);
    
    console.log('⚡ Event queue processors started');
  }

  /**
   * Process queue by priority
   */
  async _processQueue(priority) {
    const queue = this.queues[priority];
    if (queue.length === 0) return;
    
    // Take batch
    const batch = queue.splice(0, this.batchSize);
    
    // Process in parallel
    await Promise.allSettled(
      batch.map(item => this._processItem(item))
    );
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      urgent: this.queues.urgent.length,
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      total: Object.values(this.queues).reduce((sum, q) => sum + q.length, 0)
    };
  }

  /**
   * Clear all queues
   */
  clear() {
    this.queues = {
      urgent: [],
      high: [],
      normal: [],
      low: []
    };
    console.log('🗑️ Event queues cleared');
  }
}

// Singleton instance
export const eventQueue = new EventQueue();

export default eventQueue;