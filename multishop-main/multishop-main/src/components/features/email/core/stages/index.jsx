/**
 * 📧 Pipeline Stages - Exports
 */

export { payloadNormalizer, default as PayloadNormalizer } from './PayloadNormalizer';
export { templateSelector, default as TemplateSelector } from './TemplateSelector';
export { templateRenderer, default as TemplateRenderer } from './TemplateRenderer';
export { providerRouter, default as ProviderRouter } from './ProviderRouter';
export { sendExecutor, default as SendExecutor } from './SendExecutor';
export { resultHandler, default as ResultHandler } from './ResultHandler';

/**
 * Get all stages in order
 */
export function getDefaultStages() {
  return {
    payloadNormalizer: require('./PayloadNormalizer').default,
    templateSelector: require('./TemplateSelector').default,
    templateRenderer: require('./TemplateRenderer').default,
    providerRouter: require('./ProviderRouter').default,
    sendExecutor: require('./SendExecutor').default,
    resultHandler: require('./ResultHandler').default
  };
}