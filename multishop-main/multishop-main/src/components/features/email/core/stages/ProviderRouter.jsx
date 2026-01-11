/**
 * 📧 Provider Router Stage
 * 
 * Stage 4: Route to appropriate email provider
 * 
 * Input: context.emailPayload.priority
 * Output: context.provider (selected provider instance)
 */

import { base44EmailProvider } from '../../infrastructure/providers/Base44EmailProvider';

/**
 * Route to appropriate provider
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function providerRouter(context) {
  const { emailPayload, metadata } = context;
  
  if (!emailPayload) {
    throw new Error('Email payload not available. Run PayloadNormalizer first.');
  }

  const { priority } = emailPayload;
  const isRetry = metadata?.retryCount > 0;

  console.log(`📧 [ProviderRouter] Routing email (priority: ${priority}, retry: ${isRetry})`);

  // Get available providers
  const providers = getAvailableProviders();

  // Select provider based on priority and availability
  const selectedProvider = await selectProvider(providers, priority, isRetry);

  if (!selectedProvider) {
    throw new Error('No available email provider');
  }

  console.log(`📧 [ProviderRouter] Selected provider: ${selectedProvider.name}`);

  return {
    provider: selectedProvider
  };
}

/**
 * Get list of available providers
 * In future, this can check health and load balance
 */
function getAvailableProviders() {
  // Currently only Base44 provider
  // Future: Add SendGrid, AWS SES, etc.
  return [
    {
      instance: base44EmailProvider,
      name: 'Base44',
      priority: 1, // Primary provider
      supportsHighPriority: true,
      supportsBulk: false,
      rateLimit: 100, // emails per minute
      healthy: true
    }
  ];
}

/**
 * Select best provider for email
 */
async function selectProvider(providers, emailPriority, isRetry) {
  // Filter healthy providers
  const healthyProviders = providers.filter(p => p.healthy);

  if (healthyProviders.length === 0) {
    console.warn('⚠️ [ProviderRouter] No healthy providers available');
    return null;
  }

  // For high priority, prefer providers that support it
  if (emailPriority === 'high') {
    const highPriorityProviders = healthyProviders.filter(p => p.supportsHighPriority);
    if (highPriorityProviders.length > 0) {
      return highPriorityProviders[0].instance;
    }
  }

  // For retries, could use different provider (failover)
  if (isRetry && healthyProviders.length > 1) {
    // Use secondary provider for retry
    return healthyProviders[1].instance;
  }

  // Default: use primary provider
  const primaryProvider = healthyProviders.find(p => p.priority === 1) || healthyProviders[0];
  return primaryProvider.instance;
}

export default providerRouter;