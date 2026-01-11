/**
 * Validation Middleware - Validate event payload against schema
 */

import { getSchema, validatePayload } from '../../domain/eventSchemas';

export const validationMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  
  // Get schema for this event
  const schema = getSchema(eventName);
  
  if (schema) {
    const errors = validatePayload(payload, schema);
    
    if (errors.length > 0) {
      console.warn(`⚠️ Validation warnings for ${eventName}:`, errors);
      // Store warnings but don't block - just log
      context.validationWarnings = errors;
    }
  }
  
  await next();
};

export default validationMiddleware;