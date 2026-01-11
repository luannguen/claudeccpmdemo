/**
 * 📧 Pipeline Result - Result wrapper for pipeline execution
 * 
 * Supports:
 * - Success: Email sent successfully
 * - Failure: Email failed (will be queued for retry or DLQ)
 * - Partial: Some stages succeeded, some failed
 */

/**
 * @typedef {'success'|'failure'|'partial'} ResultStatus
 */

/**
 * @typedef {Object} PipelineResultData
 * @property {ResultStatus} status
 * @property {string} pipelineId - Pipeline execution ID
 * @property {Object} context - Final context
 * @property {string} [messageId] - Provider message ID (if sent)
 * @property {string} [error] - Error message (if failed)
 * @property {Object} timing - Timing information
 * @property {Object[]} stageHistory - Stage execution history
 */

/**
 * Create success result
 * 
 * @param {Object} context - Final pipeline context
 * @param {string} [messageId] - Provider message ID
 * @returns {PipelineResultData}
 */
export function success(context, messageId = null) {
  return {
    status: 'success',
    pipelineId: context.id,
    messageId,
    recipientEmail: context.emailPayload?.recipientEmail,
    emailType: context.emailPayload?.emailType,
    provider: context.provider?.name || 'unknown',
    timing: {
      startTime: context.metadata.startTime,
      endTime: context.metadata.endTime || Date.now(),
      totalDuration: context.metadata.totalDuration || (Date.now() - context.metadata.startTime)
    },
    stageHistory: context.stageHistory,
    errors: []
  };
}

/**
 * Create failure result
 * 
 * @param {Object} context - Final pipeline context
 * @param {string|Error} error - Error that caused failure
 * @param {string} [failedStage] - Stage that failed
 * @returns {PipelineResultData}
 */
export function failure(context, error, failedStage = null) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return {
    status: 'failure',
    pipelineId: context.id,
    messageId: null,
    recipientEmail: context.emailPayload?.recipientEmail || context.event?.customerEmail,
    emailType: context.emailPayload?.emailType || context.event?.emailType,
    provider: context.provider?.name || null,
    error: errorMessage,
    failedStage,
    timing: {
      startTime: context.metadata.startTime,
      endTime: context.metadata.endTime || Date.now(),
      totalDuration: context.metadata.totalDuration || (Date.now() - context.metadata.startTime)
    },
    stageHistory: context.stageHistory,
    errors: context.errors,
    retryable: isRetryable(error, failedStage),
    retryCount: context.metadata.retryCount || 0
  };
}

/**
 * Create partial result (some stages succeeded)
 * 
 * @param {Object} context - Final pipeline context
 * @param {string} lastSuccessfulStage - Last stage that succeeded
 * @param {string|Error} error - Error in subsequent stage
 * @returns {PipelineResultData}
 */
export function partial(context, lastSuccessfulStage, error) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return {
    status: 'partial',
    pipelineId: context.id,
    messageId: null,
    recipientEmail: context.emailPayload?.recipientEmail,
    emailType: context.emailPayload?.emailType,
    provider: context.provider?.name || null,
    error: errorMessage,
    lastSuccessfulStage,
    timing: {
      startTime: context.metadata.startTime,
      endTime: context.metadata.endTime || Date.now(),
      totalDuration: context.metadata.totalDuration || (Date.now() - context.metadata.startTime)
    },
    stageHistory: context.stageHistory,
    errors: context.errors,
    retryable: true,
    retryCount: context.metadata.retryCount || 0
  };
}

/**
 * Determine if error is retryable
 * 
 * @param {string|Error} error 
 * @param {string} [stage] 
 * @returns {boolean}
 */
function isRetryable(error, stage) {
  const errorMessage = error instanceof Error ? error.message : error;
  const lowerError = errorMessage.toLowerCase();
  
  // Non-retryable errors
  const nonRetryable = [
    'invalid email',
    'template not found',
    'validation failed',
    'recipient blocked',
    'unsubscribed'
  ];
  
  if (nonRetryable.some(nr => lowerError.includes(nr))) {
    return false;
  }
  
  // Retryable errors (network, timeout, provider issues)
  const retryable = [
    'timeout',
    'network',
    'connection',
    'rate limit',
    'service unavailable',
    '5xx',
    'temporary'
  ];
  
  if (retryable.some(r => lowerError.includes(r))) {
    return true;
  }
  
  // Default: retry for send stage failures
  if (stage === 'SendExecutor' || stage === 'ProviderRouter') {
    return true;
  }
  
  return false;
}

/**
 * Check if result is successful
 * 
 * @param {PipelineResultData} result 
 * @returns {boolean}
 */
export function isSuccess(result) {
  return result.status === 'success';
}

/**
 * Check if result should be retried
 * 
 * @param {PipelineResultData} result 
 * @param {number} [maxRetries=3] 
 * @returns {boolean}
 */
export function shouldRetry(result, maxRetries = 3) {
  if (result.status === 'success') return false;
  if (!result.retryable) return false;
  if (result.retryCount >= maxRetries) return false;
  return true;
}

/**
 * Format result for logging
 * 
 * @param {PipelineResultData} result 
 * @returns {Object}
 */
export function toLogFormat(result) {
  return {
    pipelineId: result.pipelineId,
    status: result.status,
    recipientEmail: result.recipientEmail,
    emailType: result.emailType,
    provider: result.provider,
    messageId: result.messageId,
    error: result.error,
    duration: result.timing.totalDuration,
    stagesCompleted: result.stageHistory.filter(s => s.status === 'success').length,
    stagesTotal: result.stageHistory.length
  };
}

export default {
  success,
  failure,
  partial,
  isSuccess,
  shouldRetry,
  toLogFormat
};