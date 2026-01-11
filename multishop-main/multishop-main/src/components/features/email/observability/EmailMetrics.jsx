/**
 * 📧 Email Metrics - Collect and expose email metrics
 * 
 * Tracks:
 * - Sent/failed count per type
 * - Provider performance
 * - Send latency
 * - Queue depth
 */

class EmailMetrics {
  constructor() {
    this.counters = {
      sent: {},
      failed: {},
      byProvider: {},
      byType: {}
    };
    
    this.latencies = [];
    this.maxLatencyHistory = 1000;
  }

  /**
   * Increment sent counter
   * @param {string} emailType 
   * @param {string} provider 
   */
  incrementSent(emailType, provider) {
    // By type
    if (!this.counters.byType[emailType]) {
      this.counters.byType[emailType] = { sent: 0, failed: 0 };
    }
    this.counters.byType[emailType].sent++;

    // By provider
    if (!this.counters.byProvider[provider]) {
      this.counters.byProvider[provider] = { sent: 0, failed: 0 };
    }
    this.counters.byProvider[provider].sent++;

    // Total
    this.counters.sent.total = (this.counters.sent.total || 0) + 1;
  }

  /**
   * Increment failed counter
   * @param {string} emailType 
   * @param {string} provider 
   * @param {string} error 
   */
  incrementFailed(emailType, provider, error) {
    // By type
    if (!this.counters.byType[emailType]) {
      this.counters.byType[emailType] = { sent: 0, failed: 0 };
    }
    this.counters.byType[emailType].failed++;

    // By provider
    if (!this.counters.byProvider[provider]) {
      this.counters.byProvider[provider] = { sent: 0, failed: 0 };
    }
    this.counters.byProvider[provider].failed++;

    // Total
    this.counters.failed.total = (this.counters.failed.total || 0) + 1;

    // By error type (first word)
    const errorKey = error?.split(' ')[0] || 'unknown';
    this.counters.failed[errorKey] = (this.counters.failed[errorKey] || 0) + 1;
  }

  /**
   * Record send latency
   * @param {number} latencyMs 
   * @param {string} emailType 
   */
  recordLatency(latencyMs, emailType) {
    this.latencies.push({
      latency: latencyMs,
      emailType,
      timestamp: Date.now()
    });

    // Trim history
    if (this.latencies.length > this.maxLatencyHistory) {
      this.latencies.shift();
    }
  }

  /**
   * Get average latency
   * @param {string} [emailType] - Filter by email type
   * @param {number} [last=100] - Last N records
   * @returns {number}
   */
  getAverageLatency(emailType = null, last = 100) {
    let records = this.latencies.slice(-last);
    
    if (emailType) {
      records = records.filter(r => r.emailType === emailType);
    }

    if (records.length === 0) return 0;

    const sum = records.reduce((acc, r) => acc + r.latency, 0);
    return Math.round(sum / records.length);
  }

  /**
   * Get p95 latency
   * @param {number} [last=100]
   * @returns {number}
   */
  getP95Latency(last = 100) {
    const records = this.latencies.slice(-last);
    if (records.length === 0) return 0;

    const sorted = records.map(r => r.latency).sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index] || 0;
  }

  /**
   * Get success rate
   * @param {string} [emailType]
   * @returns {number} Percentage (0-100)
   */
  getSuccessRate(emailType = null) {
    if (emailType) {
      const typeStats = this.counters.byType[emailType];
      if (!typeStats) return 0;
      
      const total = typeStats.sent + typeStats.failed;
      if (total === 0) return 0;
      
      return Math.round((typeStats.sent / total) * 100);
    }

    const totalSent = this.counters.sent.total || 0;
    const totalFailed = this.counters.failed.total || 0;
    const total = totalSent + totalFailed;
    
    if (total === 0) return 0;
    return Math.round((totalSent / total) * 100);
  }

  /**
   * Get full metrics summary
   * @returns {Object}
   */
  getSummary() {
    return {
      counters: {
        totalSent: this.counters.sent.total || 0,
        totalFailed: this.counters.failed.total || 0,
        byType: this.counters.byType,
        byProvider: this.counters.byProvider,
        failureReasons: Object.entries(this.counters.failed)
          .filter(([key]) => key !== 'total')
          .map(([reason, count]) => ({ reason, count }))
      },
      latency: {
        average: this.getAverageLatency(),
        p95: this.getP95Latency(),
        recordCount: this.latencies.length
      },
      successRate: this.getSuccessRate()
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters = {
      sent: {},
      failed: {},
      byProvider: {},
      byType: {}
    };
    this.latencies = [];
    console.log('📧 [EmailMetrics] Reset all metrics');
  }
}

// Singleton instance
export const emailMetrics = new EmailMetrics();

export default emailMetrics;