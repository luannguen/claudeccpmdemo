/**
 * 📧 Provider Manager - Manage multiple providers with failover
 * 
 * Features:
 * - Health checks
 * - Automatic failover
 * - Load balancing (future)
 * - Usage tracking
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {IEmailProvider} instance
 * @property {string} name
 * @property {number} priority - 1 = highest
 * @property {boolean} [enabled=true]
 * @property {number} [rateLimit=100] - Per minute
 */

class ProviderManager {
  constructor() {
    this.providers = [];
    this.healthStatus = new Map();
    this.usageStats = new Map();
    this.healthCheckInterval = null;
  }

  /**
   * Register a provider
   * @param {ProviderConfig} config 
   */
  register(config) {
    const provider = {
      instance: config.instance,
      name: config.name || config.instance.name,
      priority: config.priority || 10,
      enabled: config.enabled !== false,
      rateLimit: config.rateLimit || 100
    };

    this.providers.push(provider);
    this.providers.sort((a, b) => a.priority - b.priority);

    // Initialize stats
    this.healthStatus.set(provider.name, { healthy: true, lastCheck: Date.now() });
    this.usageStats.set(provider.name, { sent: 0, failed: 0, lastMinute: 0 });

    console.log(`📧 [ProviderManager] Registered: ${provider.name} (priority: ${provider.priority})`);
  }

  /**
   * Get provider for sending
   * @param {'high'|'normal'|'low'} priority 
   * @returns {IEmailProvider|null}
   */
  async getProvider(priority = 'normal') {
    // Filter to healthy, enabled providers
    const available = this.providers.filter(p => {
      const health = this.healthStatus.get(p.name);
      const usage = this.usageStats.get(p.name);
      
      return p.enabled && 
             health?.healthy !== false &&
             usage.lastMinute < p.rateLimit;
    });

    if (available.length === 0) {
      console.error('❌ [ProviderManager] No available providers');
      return null;
    }

    // High priority emails use primary provider
    if (priority === 'high') {
      return available[0].instance;
    }

    // Normal/low can use any available
    return available[0].instance;
  }

  /**
   * Mark provider as used (for rate limiting)
   * @param {string} providerName 
   */
  recordUsage(providerName, success = true) {
    const stats = this.usageStats.get(providerName);
    if (!stats) return;

    stats.lastMinute++;
    if (success) {
      stats.sent++;
    } else {
      stats.failed++;
    }

    // Reset counter every minute
    if (!stats.lastReset || Date.now() - stats.lastReset > 60000) {
      stats.lastMinute = 1;
      stats.lastReset = Date.now();
    }
  }

  /**
   * Health check a provider
   * @param {string} providerName 
   */
  async checkHealth(providerName) {
    const provider = this.providers.find(p => p.name === providerName);
    if (!provider) return;

    try {
      // Simple health check (provider can implement checkHealth() method)
      const healthy = provider.instance.checkHealth 
        ? await provider.instance.checkHealth()
        : true;

      this.healthStatus.set(providerName, {
        healthy,
        lastCheck: Date.now()
      });

      return healthy;
    } catch (error) {
      console.error(`❌ [ProviderManager] Health check failed for ${providerName}:`, error.message);
      
      this.healthStatus.set(providerName, {
        healthy: false,
        lastCheck: Date.now(),
        error: error.message
      });

      return false;
    }
  }

  /**
   * Run health checks on all providers
   */
  async checkAllHealth() {
    console.log('📧 [ProviderManager] Running health checks...');
    
    const results = await Promise.allSettled(
      this.providers.map(p => this.checkHealth(p.name))
    );

    const healthy = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    console.log(`📧 [ProviderManager] Health: ${healthy}/${this.providers.length} providers healthy`);
  }

  /**
   * Start periodic health checks
   * @param {number} [intervalMs=60000] - 1 minute
   */
  startHealthChecks(intervalMs = 60000) {
    if (this.healthCheckInterval) {
      console.warn('⚠️ [ProviderManager] Health checks already running');
      return;
    }

    this.checkAllHealth(); // Run immediately
    this.healthCheckInterval = setInterval(() => {
      this.checkAllHealth();
    }, intervalMs);

    console.log(`📧 [ProviderManager] Started health checks (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('📧 [ProviderManager] Stopped health checks');
    }
  }

  /**
   * Get manager stats
   * @returns {Object}
   */
  getStats() {
    return {
      providers: this.providers.map(p => ({
        name: p.name,
        priority: p.priority,
        enabled: p.enabled,
        health: this.healthStatus.get(p.name),
        usage: this.usageStats.get(p.name)
      }))
    };
  }

  /**
   * Enable/disable provider
   */
  setProviderEnabled(providerName, enabled) {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      provider.enabled = enabled;
      console.log(`📧 [ProviderManager] ${providerName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
}

// Singleton instance
export const providerManager = new ProviderManager();

export default providerManager;