/**
 * Request Queue Service
 * 
 * ENHANCEMENT #2: Gộp nhiều request liên tiếp, tránh spam LLM
 * Debounce + Queue management
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const QUEUE_CONFIG = {
  debounceMs: 300,          // Wait 300ms before processing
  maxQueueSize: 5,          // Max pending messages
  mergeWindowMs: 500,       // Merge messages within 500ms
  priorityBoost: {          // Priority for certain intents
    order_status: 2,
    product_query: 1,
    greeting: 0
  }
};

// ========== REQUEST QUEUE CLASS ==========

class RequestQueue {
  constructor() {
    this.queue = [];
    this.debounceTimer = null;
    this.processing = false;
    this.onProcess = null;
  }

  /**
   * Add request to queue with debounce
   */
  enqueue(request, priority = 1) {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const now = Date.now();
    
    // Check if we can merge with last request
    const lastRequest = this.queue[this.queue.length - 1];
    if (lastRequest && (now - lastRequest.timestamp) < QUEUE_CONFIG.mergeWindowMs) {
      // Merge: keep the longer/more complete message
      if (request.message.length > lastRequest.message.length) {
        lastRequest.message = request.message;
        lastRequest.timestamp = now;
      }
    } else {
      // Add new request
      if (this.queue.length >= QUEUE_CONFIG.maxQueueSize) {
        // Remove oldest low-priority item
        this.queue.sort((a, b) => a.priority - b.priority);
        this.queue.shift();
      }

      this.queue.push({
        ...request,
        timestamp: now,
        priority,
        id: `req_${now}_${Math.random().toString(36).substr(2, 5)}`
      });
    }

    // Schedule processing after debounce
    this.debounceTimer = setTimeout(() => {
      this.processNext();
    }, QUEUE_CONFIG.debounceMs);

    return this.queue.length;
  }

  /**
   * Process next item in queue
   */
  async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Sort by priority (higher first) then timestamp (older first)
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.timestamp - b.timestamp;
    });

    const request = this.queue.shift();

    try {
      if (this.onProcess) {
        await this.onProcess(request);
      }
    } catch (error) {
      console.error('Queue process error:', error);
    } finally {
      this.processing = false;
      
      // Process next if queue not empty
      if (this.queue.length > 0) {
        setTimeout(() => this.processNext(), 50);
      }
    }
  }

  /**
   * Set processor callback
   */
  setProcessor(callback) {
    this.onProcess = callback;
  }

  /**
   * Clear queue
   */
  clear() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.queue = [];
    this.processing = false;
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.processing,
      oldestRequest: this.queue.length > 0 ? this.queue[0].timestamp : null
    };
  }

  /**
   * Cancel pending request by ID
   */
  cancel(requestId) {
    const index = this.queue.findIndex(r => r.id === requestId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }
}

// ========== SINGLETON INSTANCE ==========

let queueInstance = null;

export function getRequestQueue() {
  if (!queueInstance) {
    queueInstance = new RequestQueue();
  }
  return queueInstance;
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Create a debounced message sender
 */
export function createDebouncedSender(processor) {
  const queue = getRequestQueue();
  queue.setProcessor(processor);
  
  return {
    send: (message, options = {}) => {
      const priority = QUEUE_CONFIG.priorityBoost[options.intent] || 1;
      return queue.enqueue({ message, ...options }, priority);
    },
    cancel: (requestId) => queue.cancel(requestId),
    clear: () => queue.clear(),
    getStats: () => queue.getStats()
  };
}

/**
 * Simple debounce function
 */
export function debounce(fn, delay = QUEUE_CONFIG.debounceMs) {
  let timer = null;
  
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function - max 1 call per interval
 */
export function throttle(fn, interval = 1000) {
  let lastCall = 0;
  let timer = null;
  
  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    
    if (remaining <= 0) {
      lastCall = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

export default {
  getRequestQueue,
  createDebouncedSender,
  debounce,
  throttle,
  QUEUE_CONFIG
};