
/**
 * System Event Handlers - Public API
 * 
 * Domain: System, Security
 */

export { registerSystemHandlers, handleMaintenance, handleSystemAlert, handleFeatureAnnouncement } from './SystemEventHandler';

/**
 * Register all system domain handlers (uses static imports from above)
 */
export const registerSystemDomainHandlers = (registry) => {
  registerSystemHandlers(registry);
  
  // System domain handlers registered
};
