/**
 * 📧 Pipeline Context - Immutable context passed through stages
 * 
 * Context chứa tất cả data cần thiết cho pipeline:
 * - event (input)
 * - emailPayload (normalized)
 * - template (selected)
 * - renderedContent (rendered)
 * - provider (routed)
 * - result (final)
 * 
 * Mỗi stage nhận context và trả về context mới (immutable updates)
 */

/**
 * @typedef {Object} StageHistoryEntry
 * @property {string} stage - Stage name
 * @property {number} startTime - Start timestamp
 * @property {number} endTime - End timestamp
 * @property {number} duration - Duration in ms
 * @property {'success'|'error'|'skipped'} status
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} PipelineContextData
 * @property {string} id - Unique pipeline execution ID
 * @property {Object} event - Original event that triggered pipeline
 * @property {Object} [emailPayload] - Normalized email payload
 * @property {Object} [template] - Selected template
 * @property {Object} [renderedContent] - Rendered subject & body
 * @property {Object} [provider] - Selected provider
 * @property {Object} [sendResult] - Provider send result
 * @property {Object} metadata - Pipeline metadata
 * @property {StageHistoryEntry[]} stageHistory - History of stage executions
 */

/**
 * Generate unique ID for pipeline execution
 */
function generatePipelineId() {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial pipeline context
 * 
 * @param {Object} event - Triggering event
 * @param {Object} [options] - Additional options
 * @returns {PipelineContextData}
 */
export function createContext(event, options = {}) {
  return {
    id: generatePipelineId(),
    event,
    emailPayload: null,
    template: null,
    renderedContent: null,
    provider: null,
    sendResult: null,
    metadata: {
      startTime: Date.now(),
      endTime: null,
      priority: options.priority || 'normal', // 'high' | 'normal' | 'low'
      source: options.source || 'event', // 'event' | 'manual' | 'retry'
      retryCount: options.retryCount || 0,
      maxRetries: options.maxRetries || 3,
      ...options.metadata
    },
    stageHistory: [],
    errors: []
  };
}

/**
 * Update context with new data (immutable)
 * 
 * @param {PipelineContextData} context - Current context
 * @param {Partial<PipelineContextData>} updates - Updates to apply
 * @returns {PipelineContextData} - New context
 */
export function updateContext(context, updates) {
  return {
    ...context,
    ...updates,
    metadata: {
      ...context.metadata,
      ...(updates.metadata || {})
    },
    stageHistory: updates.stageHistory || context.stageHistory,
    errors: updates.errors || context.errors
  };
}

/**
 * Add stage execution to history
 * 
 * @param {PipelineContextData} context 
 * @param {StageHistoryEntry} stageEntry 
 * @returns {PipelineContextData}
 */
export function addStageToHistory(context, stageEntry) {
  return updateContext(context, {
    stageHistory: [...context.stageHistory, stageEntry]
  });
}

/**
 * Add error to context
 * 
 * @param {PipelineContextData} context 
 * @param {string} stage 
 * @param {Error|string} error 
 * @returns {PipelineContextData}
 */
export function addError(context, stage, error) {
  const errorEntry = {
    stage,
    message: error instanceof Error ? error.message : error,
    timestamp: Date.now()
  };
  
  return updateContext(context, {
    errors: [...context.errors, errorEntry]
  });
}

/**
 * Finalize context (set end time)
 * 
 * @param {PipelineContextData} context 
 * @returns {PipelineContextData}
 */
export function finalizeContext(context) {
  const endTime = Date.now();
  return updateContext(context, {
    metadata: {
      ...context.metadata,
      endTime,
      totalDuration: endTime - context.metadata.startTime
    }
  });
}

/**
 * Check if context has errors
 * 
 * @param {PipelineContextData} context 
 * @returns {boolean}
 */
export function hasErrors(context) {
  return context.errors.length > 0;
}

/**
 * Get recipient email from context
 * 
 * @param {PipelineContextData} context 
 * @returns {string|null}
 */
export function getRecipientEmail(context) {
  return context.emailPayload?.recipientEmail || 
         context.event?.customerEmail || 
         context.event?.recipientEmail ||
         null;
}

/**
 * Get email type from context
 * 
 * @param {PipelineContextData} context 
 * @returns {string|null}
 */
export function getEmailType(context) {
  return context.emailPayload?.emailType || 
         context.event?.emailType ||
         null;
}

export default {
  createContext,
  updateContext,
  addStageToHistory,
  addError,
  finalizeContext,
  hasErrors,
  getRecipientEmail,
  getEmailType
};