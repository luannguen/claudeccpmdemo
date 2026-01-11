/**
 * Event Tracker - Analytics cho notification events
 * 
 * Tracks:
 * - Emit count per event
 * - Success/failure rate
 * - Average latency
 * - Error patterns
 */

class EventTracker {
  constructor() {
    this.events = new Map(); // eventName → { emits, successes, failures, totalLatency, errors }
    this.recentEmits = [];   // Last 100 emits for debugging
    this.maxRecent = 100;
  }

  /**
   * Record emit attempt
   */
  recordEmit(eventName, result) {
    const { success, latency = 0, error = null, queued = false } = result;
    
    // Initialize if needed
    if (!this.events.has(eventName)) {
      this.events.set(eventName, {
        emits: 0,
        successes: 0,
        failures: 0,
        queued: 0,
        totalLatency: 0,
        errors: []
      });
    }
    
    const stats = this.events.get(eventName);
    stats.emits++;
    stats.totalLatency += latency;
    
    if (queued) {
      stats.queued++;
    } else if (success) {
      stats.successes++;
    } else {
      stats.failures++;
      if (error) {
        stats.errors.push({
          message: error.message || error,
          timestamp: new Date().toISOString()
        });
        // Keep last 10 errors
        if (stats.errors.length > 10) {
          stats.errors.shift();
        }
      }
    }
    
    // Add to recent
    this.recentEmits.push({
      eventName,
      success,
      queued,
      latency,
      timestamp: new Date().toISOString()
    });
    
    // Keep last N
    if (this.recentEmits.length > this.maxRecent) {
      this.recentEmits.shift();
    }
  }

  /**
   * Get stats for single event
   */
  getEventStats(eventName) {
    const stats = this.events.get(eventName);
    if (!stats) return null;
    
    return {
      ...stats,
      successRate: stats.emits > 0 
        ? Math.round((stats.successes / stats.emits) * 100) 
        : 0,
      avgLatency: stats.emits > 0 
        ? Math.round(stats.totalLatency / stats.emits) 
        : 0
    };
  }

  /**
   * Get summary of all events
   */
  getSummary() {
    const summary = {
      totalEmits: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      totalQueued: 0,
      avgLatency: 0,
      eventCount: this.events.size,
      topEvents: [],
      recentErrors: []
    };
    
    let totalLatency = 0;
    const eventStats = [];
    
    for (const [name, stats] of this.events) {
      summary.totalEmits += stats.emits;
      summary.totalSuccesses += stats.successes;
      summary.totalFailures += stats.failures;
      summary.totalQueued += stats.queued;
      totalLatency += stats.totalLatency;
      
      eventStats.push({
        name,
        emits: stats.emits,
        successRate: stats.emits > 0 
          ? Math.round((stats.successes / stats.emits) * 100) 
          : 0
      });
      
      // Collect recent errors
      summary.recentErrors.push(...stats.errors.map(e => ({
        event: name,
        ...e
      })));
    }
    
    summary.avgLatency = summary.totalEmits > 0 
      ? Math.round(totalLatency / summary.totalEmits) 
      : 0;
    
    // Top 5 events by emit count
    summary.topEvents = eventStats
      .sort((a, b) => b.emits - a.emits)
      .slice(0, 5);
    
    // Recent 10 errors
    summary.recentErrors = summary.recentErrors
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    return summary;
  }

  /**
   * Get recent emits for debugging
   */
  getRecentEmits(count = 20) {
    return this.recentEmits.slice(-count);
  }

  /**
   * Reset stats
   */
  reset() {
    this.events.clear();
    this.recentEmits = [];
    console.log('📊 Event tracker reset');
  }
}

// Singleton
export const eventTracker = new EventTracker();

// Export helper to get middleware stats (placeholder)
export const getMiddlewareStats = () => {
  return eventTracker.getSummary();
};

export default eventTracker;