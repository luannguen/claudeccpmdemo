/**
 * 📧 Email Pipeline - Main orchestrator for email sending
 * 
 * Composes stages into a pipeline:
 * Event → Normalize → Select Template → Render → Route Provider → Send → Handle Result
 * 
 * Features:
 * - Composable stages (add/remove/reorder)
 * - Error boundaries per stage
 * - Hooks (onStart, onStageComplete, onComplete, onError)
 * - Immutable context updates
 */

import { 
  createContext, 
  updateContext, 
  addStageToHistory, 
  addError,
  finalizeContext 
} from './PipelineContext';
import * as PipelineResult from './PipelineResult';

/**
 * @typedef {Object} PipelineHooks
 * @property {function(Object): void} [onStart] - Called when pipeline starts
 * @property {function(string, Object): void} [onStageComplete] - Called after each stage
 * @property {function(Object): void} [onComplete] - Called when pipeline completes
 * @property {function(Error, string, Object): void} [onError] - Called on error
 */

/**
 * @typedef {Object} StageDefinition
 * @property {string} name - Stage name
 * @property {function(Object): Promise<Object>} execute - Stage execution function
 * @property {boolean} [required=true] - If false, errors are logged but pipeline continues
 */

/**
 * Create a new email pipeline
 * 
 * @param {Object} [options] - Pipeline options
 * @returns {Object} Pipeline builder
 */
export function createPipeline(options = {}) {
  const stages = [];
  const hooks = {
    onStart: options.onStart || null,
    onStageComplete: options.onStageComplete || null,
    onComplete: options.onComplete || null,
    onError: options.onError || null
  };
  
  let pipelineContext = null;

  const pipeline = {
    /**
     * Set initial context from event
     * @param {Object} eventOrOptions - Event object or { event, ...options }
     * @returns {Object} Pipeline builder
     */
    withContext(eventOrOptions) {
      if (eventOrOptions.event) {
        pipelineContext = createContext(eventOrOptions.event, eventOrOptions);
      } else {
        pipelineContext = createContext(eventOrOptions);
      }
      return pipeline;
    },

    /**
     * Add a stage to pipeline
     * @param {StageDefinition|function} stage - Stage definition or execute function
     * @returns {Object} Pipeline builder
     */
    through(stage) {
      if (typeof stage === 'function') {
        stages.push({
          name: stage.name || `Stage_${stages.length + 1}`,
          execute: stage,
          required: true
        });
      } else {
        stages.push({
          name: stage.name,
          execute: stage.execute,
          required: stage.required !== false
        });
      }
      return pipeline;
    },

    /**
     * Add optional stage (errors don't stop pipeline)
     * @param {StageDefinition|function} stage 
     * @returns {Object} Pipeline builder
     */
    optionally(stage) {
      const stageDef = typeof stage === 'function' 
        ? { name: stage.name || `OptionalStage_${stages.length + 1}`, execute: stage }
        : stage;
      
      stages.push({
        ...stageDef,
        required: false
      });
      return pipeline;
    },

    /**
     * Execute the pipeline
     * @returns {Promise<PipelineResultData>}
     */
    async execute() {
      if (!pipelineContext) {
        throw new Error('Pipeline context not set. Call withContext() first.');
      }

      console.log(`📧 [Pipeline] Starting execution: ${pipelineContext.id}`);
      
      // Call onStart hook
      if (hooks.onStart) {
        try {
          hooks.onStart(pipelineContext);
        } catch (e) {
          console.warn('[Pipeline] onStart hook error:', e);
        }
      }

      let currentContext = pipelineContext;
      let lastSuccessfulStage = null;

      // Execute each stage
      for (const stage of stages) {
        const stageStart = Date.now();
        
        try {
          console.log(`📧 [Pipeline] Executing stage: ${stage.name}`);
          
          // Execute stage
          const result = await stage.execute(currentContext);
          
          // Update context with stage result
          if (result && typeof result === 'object') {
            currentContext = updateContext(currentContext, result);
          }
          
          // Record success in history
          const stageEnd = Date.now();
          currentContext = addStageToHistory(currentContext, {
            stage: stage.name,
            startTime: stageStart,
            endTime: stageEnd,
            duration: stageEnd - stageStart,
            status: 'success'
          });
          
          lastSuccessfulStage = stage.name;
          
          // Call onStageComplete hook
          if (hooks.onStageComplete) {
            try {
              hooks.onStageComplete(stage.name, currentContext);
            } catch (e) {
              console.warn('[Pipeline] onStageComplete hook error:', e);
            }
          }
          
        } catch (error) {
          console.error(`❌ [Pipeline] Stage ${stage.name} failed:`, error.message);
          
          // Record error in history
          const stageEnd = Date.now();
          currentContext = addStageToHistory(currentContext, {
            stage: stage.name,
            startTime: stageStart,
            endTime: stageEnd,
            duration: stageEnd - stageStart,
            status: 'error',
            error: error.message
          });
          
          currentContext = addError(currentContext, stage.name, error);
          
          // Call onError hook
          if (hooks.onError) {
            try {
              hooks.onError(error, stage.name, currentContext);
            } catch (e) {
              console.warn('[Pipeline] onError hook error:', e);
            }
          }
          
          // If required stage fails, stop pipeline
          if (stage.required) {
            currentContext = finalizeContext(currentContext);
            
            const failureResult = lastSuccessfulStage
              ? PipelineResult.partial(currentContext, lastSuccessfulStage, error)
              : PipelineResult.failure(currentContext, error, stage.name);
            
            // Call onComplete hook
            if (hooks.onComplete) {
              try {
                hooks.onComplete(failureResult);
              } catch (e) {
                console.warn('[Pipeline] onComplete hook error:', e);
              }
            }
            
            return failureResult;
          }
          
          // Optional stage failed - continue
          console.warn(`⚠️ [Pipeline] Optional stage ${stage.name} failed, continuing...`);
        }
      }

      // Pipeline completed successfully
      currentContext = finalizeContext(currentContext);
      
      const successResult = PipelineResult.success(
        currentContext,
        currentContext.sendResult?.messageId
      );
      
      console.log(`✅ [Pipeline] Completed: ${currentContext.id} (${currentContext.metadata.totalDuration}ms)`);
      
      // Call onComplete hook
      if (hooks.onComplete) {
        try {
          hooks.onComplete(successResult);
        } catch (e) {
          console.warn('[Pipeline] onComplete hook error:', e);
        }
      }
      
      return successResult;
    },

    /**
     * Get current stages
     * @returns {StageDefinition[]}
     */
    getStages() {
      return [...stages];
    },

    /**
     * Get current context (for debugging)
     * @returns {Object|null}
     */
    getContext() {
      return pipelineContext;
    }
  };

  return pipeline;
}

/**
 * Create default email pipeline with standard stages
 * 
 * @param {Object} stages - Stage implementations
 * @param {Object} [hooks] - Pipeline hooks
 * @returns {function(Object): Object} Pipeline factory
 */
export function createDefaultPipeline(stages, hooks = {}) {
  const {
    payloadNormalizer,
    templateSelector,
    templateRenderer,
    providerRouter,
    sendExecutor,
    resultHandler
  } = stages;

  return (event, options = {}) => {
    return createPipeline(hooks)
      .withContext({ event, ...options })
      .through({ name: 'PayloadNormalizer', execute: payloadNormalizer })
      .through({ name: 'TemplateSelector', execute: templateSelector })
      .through({ name: 'TemplateRenderer', execute: templateRenderer })
      .through({ name: 'ProviderRouter', execute: providerRouter })
      .through({ name: 'SendExecutor', execute: sendExecutor })
      .through({ name: 'ResultHandler', execute: resultHandler, required: false });
  };
}

export default {
  createPipeline,
  createDefaultPipeline
};