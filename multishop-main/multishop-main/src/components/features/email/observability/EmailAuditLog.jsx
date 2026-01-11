/**
 * 📧 Email Audit Log - Detailed audit trail per stage
 * 
 * Logs every stage execution for debugging and compliance
 */

/**
 * @typedef {Object} AuditEntry
 * @property {string} id
 * @property {string} pipelineId
 * @property {string} stage
 * @property {'success'|'error'|'skipped'} status
 * @property {number} timestamp
 * @property {number} duration
 * @property {Object} [data]
 * @property {string} [error]
 */

class EmailAuditLog {
  constructor() {
    this.entries = [];
    this.maxEntries = 5000;
    this.retention = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Log stage execution
   * @param {Object} params
   */
  logStage({ pipelineId, stage, status, data, error, duration }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      pipelineId,
      stage,
      status,
      timestamp: Date.now(),
      duration: duration || 0,
      data: data || null,
      error: error instanceof Error ? error.message : error || null
    };

    this.entries.push(entry);

    // Trim if needed
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * Log pipeline completion
   * @param {Object} pipelineResult 
   */
  logPipelineComplete(pipelineResult) {
    this.logStage({
      pipelineId: pipelineResult.pipelineId,
      stage: 'PIPELINE_COMPLETE',
      status: pipelineResult.status === 'success' ? 'success' : 'error',
      data: {
        messageId: pipelineResult.messageId,
        recipientEmail: pipelineResult.recipientEmail,
        emailType: pipelineResult.emailType,
        provider: pipelineResult.provider
      },
      error: pipelineResult.error,
      duration: pipelineResult.timing?.totalDuration
    });
  }

  /**
   * Get logs for pipeline
   * @param {string} pipelineId 
   * @returns {AuditEntry[]}
   */
  getByPipelineId(pipelineId) {
    return this.entries.filter(e => e.pipelineId === pipelineId);
  }

  /**
   * Get logs by stage
   * @param {string} stage 
   * @param {number} [limit=100]
   * @returns {AuditEntry[]}
   */
  getByStage(stage, limit = 100) {
    return this.entries
      .filter(e => e.stage === stage)
      .slice(-limit);
  }

  /**
   * Get recent errors
   * @param {number} [limit=50]
   * @returns {AuditEntry[]}
   */
  getRecentErrors(limit = 50) {
    return this.entries
      .filter(e => e.status === 'error')
      .slice(-limit)
      .reverse();
  }

  /**
   * Search logs
   * @param {Object} filters 
   * @returns {AuditEntry[]}
   */
  search(filters = {}) {
    let results = [...this.entries];

    if (filters.pipelineId) {
      results = results.filter(e => e.pipelineId === filters.pipelineId);
    }
    if (filters.stage) {
      results = results.filter(e => e.stage === filters.stage);
    }
    if (filters.status) {
      results = results.filter(e => e.status === filters.status);
    }
    if (filters.since) {
      results = results.filter(e => e.timestamp >= filters.since);
    }
    if (filters.until) {
      results = results.filter(e => e.timestamp <= filters.until);
    }

    return results;
  }

  /**
   * Get stats
   * @returns {Object}
   */
  getStats() {
    const stats = {
      total: this.entries.length,
      byStage: {},
      byStatus: { success: 0, error: 0, skipped: 0 },
      errorRate: 0
    };

    this.entries.forEach(entry => {
      // By stage
      if (!stats.byStage[entry.stage]) {
        stats.byStage[entry.stage] = { success: 0, error: 0, skipped: 0 };
      }
      stats.byStage[entry.stage][entry.status]++;

      // By status
      stats.byStatus[entry.status]++;
    });

    // Calculate error rate
    const total = stats.byStatus.success + stats.byStatus.error;
    stats.errorRate = total > 0 
      ? Math.round((stats.byStatus.error / total) * 100) 
      : 0;

    return stats;
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const cutoff = Date.now() - this.retention;
    const before = this.entries.length;

    this.entries = this.entries.filter(e => e.timestamp > cutoff);

    const removed = before - this.entries.length;
    if (removed > 0) {
      console.log(`📧 [AuditLog] Cleanup: removed ${removed} old entries`);
    }
  }

  /**
   * Export logs
   * @param {Object} [filters]
   * @returns {Object}
   */
  export(filters = {}) {
    const logs = this.search(filters);
    
    return {
      exportedAt: new Date().toISOString(),
      filters,
      count: logs.length,
      entries: logs.map(e => ({
        pipelineId: e.pipelineId,
        stage: e.stage,
        status: e.status,
        timestamp: new Date(e.timestamp).toISOString(),
        duration: e.duration,
        error: e.error,
        data: e.data
      }))
    };
  }

  /**
   * Clear all logs
   */
  clear() {
    this.entries = [];
    console.log('📧 [AuditLog] Cleared all entries');
  }
}

// Singleton instance
export const emailAuditLog = new EmailAuditLog();

export default emailAuditLog;