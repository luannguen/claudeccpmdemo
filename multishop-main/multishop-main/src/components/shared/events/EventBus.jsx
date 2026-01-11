/**
 * 📡 Event Bus - Lightweight pub/sub system
 * 
 * Cho phép modules giao tiếp loose coupling qua events.
 * Tuân thủ: Section 19.5 - Cross-Module Communication
 */

/**
 * Simple in-memory event bus
 */
class EventBus {
  constructor() {
    this.subscribers = new Map(); // eventType → Set<handler>
    this.eventHistory = []; // For debugging
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to an event
   * 
   * @param {string} eventType - Event type to listen to
   * @param {Function} handler - Handler function (async)
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType).add(handler);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publish an event
   * 
   * @param {string} eventType - Event type
   * @param {Object} payload - Event payload data
   * @returns {Promise<void>}
   */
  async publish(eventType, payload) {
    // Add to history
    this.eventHistory.push({
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    const handlers = this.subscribers.get(eventType);
    
    if (!handlers || handlers.size === 0) {
      return;
    }
    
    // Execute all handlers (fire-and-forget for performance)
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`❌ EventBus: Handler failed for ${eventType}:`, error);
        // Continue executing other handlers even if one fails
      }
    });
    
    // Wait for all handlers (or use fire-and-forget)
    await Promise.allSettled(promises);
  }

  /**
   * Clear all subscribers (for testing)
   */
  clear() {
    this.subscribers.clear();
    this.eventHistory = [];
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType);
    }
    return this.eventHistory;
  }

  /**
   * Get subscriber count for an event type
   */
  getSubscriberCount(eventType) {
    return this.subscribers.get(eventType)?.size || 0;
  }

  /**
   * List all registered event types
   */
  getRegisteredEvents() {
    return Array.from(this.subscribers.keys());
  }
}

/**
 * Global event bus singleton
 */
export const eventBus = new EventBus();

export default eventBus;