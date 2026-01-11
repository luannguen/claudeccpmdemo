/**
 * Logging Middleware - Log all events for debugging/audit
 */

export const loggingMiddleware = async (context, next) => {
  const { eventName, priority, emittedAt, recipientEmail } = context;
  
  console.log(`📨 [${new Date().toISOString()}] Event: ${eventName}`);
  console.log(`   Priority: ${priority}, Recipient: ${recipientEmail || 'broadcast'}`);
  
  const startTime = Date.now();
  
  try {
    await next();
    
    const duration = Date.now() - startTime;
    console.log(`✅ [${eventName}] completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${eventName}] failed after ${duration}ms:`, error.message);
    throw error;
  }
};

export default loggingMiddleware;