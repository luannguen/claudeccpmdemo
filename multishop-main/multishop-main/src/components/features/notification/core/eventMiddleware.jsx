/**
 * Event Middleware Pipeline - Chain of responsibility for event processing
 * 
 * Order: logging → validation → dedupe → rateLimit → preferences → handler
 */

class EventMiddlewarePipeline {
  constructor() {
    this.middlewares = [];
  }

  /**
   * Add middleware to pipeline
   * 
   * @param {Function} middleware - fn(context, next) => Promise<void>
   * @returns {EventMiddlewarePipeline} For chaining
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      console.error('Middleware must be a function');
      return this;
    }
    
    this.middlewares.push(middleware);
    console.log(`✅ Middleware registered (total: ${this.middlewares.length})`);
    return this; // Chainable
  }

  /**
   * Execute middleware chain
   * 
   * @param {Object} context - Event context
   * @param {Function} finalHandler - Handler to execute after all middlewares
   */
  async execute(context, finalHandler) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        
        try {
          await middleware(context, next);
        } catch (error) {
          console.error(`Middleware ${index} failed:`, error);
          throw error; // Stop pipeline on error
        }
      } else {
        // All middlewares passed, call final handler
        await finalHandler(context);
      }
    };
    
    await next();
  }

  /**
   * Get middleware count
   */
  getCount() {
    return this.middlewares.length;
  }

  /**
   * Clear all middlewares
   */
  clear() {
    this.middlewares = [];
    console.log('🗑️ Middleware pipeline cleared');
  }
}

// Singleton instance
export const eventMiddleware = new EventMiddlewarePipeline();

export default eventMiddleware;