/**
 * 📧 Email Core - Pipeline & Stages
 */

// Pipeline
export * from './pipeline';
export { createPipeline, createDefaultPipeline } from './pipeline/EmailPipeline';

// Stages
export * from './stages';

// Convenience: Create ready-to-use pipeline
import { createPipeline } from './pipeline/EmailPipeline';
import { 
  payloadNormalizer,
  templateSelector,
  templateRenderer,
  providerRouter,
  sendExecutor,
  resultHandler
} from './stages';

/**
 * Create a standard email pipeline with all stages
 * 
 * @param {Object} event - Event that triggered email
 * @param {Object} [options] - Pipeline options
 * @returns {Promise<Object>} Pipeline result
 */
export async function sendEmailViaPipeline(event, options = {}) {
  const result = await createPipeline({
    onStart: (ctx) => console.log(`📧 Pipeline started: ${ctx.id}`),
    onComplete: (res) => console.log(`📧 Pipeline completed: ${res.status}`),
    onError: (err, stage) => console.error(`❌ Pipeline error in ${stage}:`, err.message)
  })
    .withContext({ event, ...options })
    .through({ name: 'PayloadNormalizer', execute: payloadNormalizer })
    .through({ name: 'TemplateSelector', execute: templateSelector })
    .through({ name: 'TemplateRenderer', execute: templateRenderer })
    .through({ name: 'ProviderRouter', execute: providerRouter })
    .through({ name: 'SendExecutor', execute: sendExecutor })
    .through({ name: 'ResultHandler', execute: resultHandler, required: false })
    .execute();

  return result;
}

export default {
  createPipeline,
  sendEmailViaPipeline
};