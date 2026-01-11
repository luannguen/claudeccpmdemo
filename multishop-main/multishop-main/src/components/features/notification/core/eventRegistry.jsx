/**
 * Event Registry - Central registry for event→handler mapping
 * 
 * Features:
 * - Register event handlers dynamically
 * - Wildcard pattern support (order.*)
 * - Multiple handlers per event
 * - Priority ordering
 * - One-time handlers
 */

class EventRegistry {
  constructor() {
    this.handlers = new Map();        // eventName → [{ handler, priority, once }]
    this.wildcards = new Map();       // pattern → [{ handler, priority, once }]
  }

  /**
   * Register handler for event
   * 
   * @param {string} eventName - Event name or wildcard (order.*, social.*)
   * @param {Function} handler - Handler function
   * @param {Object} options - { priority: 0, once: false }
   * @returns {Function} Unsubscribe function
   */
  register(eventName, handler, options = {}) {
    const { priority = 0, once = false } = options;
    
    if (!eventName || typeof handler !== 'function') {
      console.error('Invalid registration:', { eventName, handler });
      return () => {};
    }
    
    const handlerInfo = { handler, priority, once };
    
    if (eventName.includes('*')) {
      // Wildcard pattern
      const pattern = eventName.replace('*', '(.*)');
      
      if (!this.wildcards.has(pattern)) {
        this.wildcards.set(pattern, []);
      }
      this.wildcards.get(pattern).push(handlerInfo);
      
      console.log(`📝 Registered wildcard: ${eventName} (pattern: ${pattern})`);
    } else {
      // Exact match
      if (!this.handlers.has(eventName)) {
        this.handlers.set(eventName, []);
      }
      this.handlers.get(eventName).push(handlerInfo);
      
      console.log(`📝 Registered: ${eventName}`);
    }
    
    // Return unsubscribe function
    return () => this.unregister(eventName, handler);
  }

  /**
   * Unregister handler
   */
  unregister(eventName, handler) {
    if (eventName.includes('*')) {
      const pattern = eventName.replace('*', '(.*)');
      const handlers = this.wildcards.get(pattern);
      if (handlers) {
        const index = handlers.findIndex(h => h.handler === handler);
        if (index !== -1) {
          handlers.splice(index, 1);
          console.log(`🗑️ Unregistered wildcard: ${eventName}`);
        }
      }
    } else {
      const handlers = this.handlers.get(eventName);
      if (handlers) {
        const index = handlers.findIndex(h => h.handler === handler);
        if (index !== -1) {
          handlers.splice(index, 1);
          console.log(`🗑️ Unregistered: ${eventName}`);
        }
      }
    }
  }

  /**
   * Get all handlers for event (including wildcards)
   * 
   * @param {string} eventName - Event name
   * @returns {Array} Handlers sorted by priority (higher first)
   */
  getHandlers(eventName) {
    const handlers = [];
    
    // 1. Exact match
    if (this.handlers.has(eventName)) {
      handlers.push(...this.handlers.get(eventName));
    }
    
    // 2. Wildcard matches
    for (const [pattern, patternHandlers] of this.wildcards) {
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(eventName)) {
        handlers.push(...patternHandlers);
      }
    }
    
    // 3. Sort by priority (higher first)
    return handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if event has handlers
   */
  hasHandlers(eventName) {
    return this.getHandlers(eventName).length > 0;
  }

  /**
   * List all registered events (exact + patterns)
   */
  listEvents() {
    const exact = [...this.handlers.keys()];
    const patterns = [...this.wildcards.keys()];
    return { exact, patterns };
  }

  /**
   * Get registration stats
   */
  getStats() {
    let totalHandlers = 0;
    
    for (const handlers of this.handlers.values()) {
      totalHandlers += handlers.length;
    }
    
    for (const handlers of this.wildcards.values()) {
      totalHandlers += handlers.length;
    }
    
    return {
      exactEvents: this.handlers.size,
      wildcardPatterns: this.wildcards.size,
      totalHandlers
    };
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.handlers.clear();
    this.wildcards.clear();
    console.log('🗑️ Event registry cleared');
  }
}

// Singleton instance
export const eventRegistry = new EventRegistry();

export default eventRegistry;