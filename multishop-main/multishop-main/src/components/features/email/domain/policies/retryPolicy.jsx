/**
 * 📧 Retry Policy - Email Sending Retry Logic
 * 
 * Implements exponential backoff retry strategy for email sending.
 * Domain policy - không phụ thuộc infrastructure.
 */

/**
 * @typedef {Object} RetryConfig
 * @property {number} maxRetries - Maximum number of retry attempts
 * @property {number} baseDelayMs - Base delay in milliseconds
 * @property {number} maxDelayMs - Maximum delay cap
 * @property {number} multiplier - Exponential multiplier
 * @property {boolean} jitter - Add random jitter to prevent thundering herd
 */

/**
 * Default retry configuration
 * @type {RetryConfig}
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,    // 1 second
  maxDelayMs: 30000,    // 30 seconds max
  multiplier: 2,        // Double delay each retry
  jitter: true          // Add randomness
};

/**
 * Calculate delay for a given attempt using exponential backoff
 * 
 * @param {number} attempt - Current attempt number (1-based)
 * @param {RetryConfig} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
export function calculateDelay(attempt, config = DEFAULT_RETRY_CONFIG) {
  const { baseDelayMs, maxDelayMs, multiplier, jitter } = config;
  
  // Exponential backoff: baseDelay * multiplier^(attempt-1)
  let delay = baseDelayMs * Math.pow(multiplier, attempt - 1);
  
  // Cap at max delay
  delay = Math.min(delay, maxDelayMs);
  
  // Add jitter (±25%) to prevent thundering herd
  if (jitter) {
    const jitterRange = delay * 0.25;
    delay += Math.random() * jitterRange * 2 - jitterRange;
  }
  
  return Math.round(delay);
}

/**
 * Check if error is retryable
 * 
 * @param {Error|string} error - The error that occurred
 * @returns {boolean} Whether the error is retryable
 */
export function isRetryableError(error) {
  const message = typeof error === 'string' ? error : error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // Network/transient errors - RETRYABLE
  const retryablePatterns = [
    'network',
    'timeout',
    'econnreset',
    'enotfound',
    'socket hang up',
    'temporary',
    'rate limit',
    '429',         // Too Many Requests
    '500',         // Internal Server Error
    '502',         // Bad Gateway
    '503',         // Service Unavailable
    '504'          // Gateway Timeout
  ];
  
  for (const pattern of retryablePatterns) {
    if (lowerMessage.includes(pattern)) {
      return true;
    }
  }
  
  // Permanent errors - NOT RETRYABLE
  const permanentPatterns = [
    'invalid email',
    'invalid address',
    'authentication',
    'unauthorized',
    '400',         // Bad Request
    '401',         // Unauthorized
    '403',         // Forbidden
    '404'          // Not Found
  ];
  
  for (const pattern of permanentPatterns) {
    if (lowerMessage.includes(pattern)) {
      return false;
    }
  }
  
  // Default: retry on unknown errors
  return true;
}

/**
 * Execute an operation with retry logic
 * 
 * @param {Function} operation - Async function to execute
 * @param {RetryConfig} [config] - Retry configuration
 * @param {Function} [onRetry] - Callback on retry (attempt, error, delay)
 * @returns {Promise<any>} Result of the operation
 * @throws {Error} Last error if all retries exhausted
 */
export async function executeWithRetry(
  operation,
  config = DEFAULT_RETRY_CONFIG,
  onRetry = null
) {
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        console.warn(`❌ Non-retryable error, failing immediately:`, error.message);
        throw error;
      }
      
      // Check if we have more retries
      if (attempt >= config.maxRetries) {
        console.error(`❌ All ${config.maxRetries} retries exhausted`);
        break;
      }
      
      // Calculate delay
      const delay = calculateDelay(attempt, config);
      
      console.warn(`⚠️ Attempt ${attempt}/${config.maxRetries} failed: ${error.message}`);
      console.warn(`⏳ Retrying in ${delay}ms...`);
      
      // Callback
      if (onRetry) {
        onRetry(attempt, error, delay);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a configured retry policy instance
 * 
 * @param {Partial<RetryConfig>} customConfig - Custom configuration
 * @returns {Object} Retry policy with execute method
 */
export function createRetryPolicy(customConfig = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...customConfig };
  
  return {
    config,
    
    /**
     * Execute operation with this policy's configuration
     * @param {Function} operation - Async function to execute
     * @param {Function} [onRetry] - Retry callback
     */
    execute: (operation, onRetry) => executeWithRetry(operation, config, onRetry),
    
    /**
     * Calculate delay for an attempt
     * @param {number} attempt - Attempt number
     */
    getDelay: (attempt) => calculateDelay(attempt, config),
    
    /**
     * Check if error is retryable
     * @param {Error} error - Error to check
     */
    isRetryable: isRetryableError
  };
}

/**
 * Default retry policy instance for email sending
 */
export const emailRetryPolicy = createRetryPolicy({
  maxRetries: 3,
  baseDelayMs: 2000,    // 2 seconds
  maxDelayMs: 30000,    // 30 seconds
  multiplier: 2,
  jitter: true
});

export default {
  DEFAULT_RETRY_CONFIG,
  calculateDelay,
  isRetryableError,
  executeWithRetry,
  createRetryPolicy,
  emailRetryPolicy
};