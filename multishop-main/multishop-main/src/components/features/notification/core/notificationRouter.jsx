/**
 * Notification Router
 * Routes notifications to correct entity based on actor
 */

/**
 * Get entity name based on actor
 */
export const getEntityName = (actor) => {
  const entityMap = {
    client: 'Notification',
    admin: 'AdminNotification',
    tenant: 'TenantNotification',
    tester: 'TesterNotification'
  };
  
  return entityMap[actor] || 'Notification';
};

/**
 * Get entity key for base44 SDK
 */
export const getEntityKey = (actor) => {
  return getEntityName(actor);
};

/**
 * Validate actor type
 */
export const isValidActor = (actor) => {
  return ['client', 'admin', 'tenant', 'tester'].includes(actor);
};

/**
 * Get default priority for actor
 */
export const getDefaultPriority = (actor) => {
  const priorityMap = {
    client: 'normal',
    admin: 'high',
    tenant: 'normal',
    tester: 'normal'
  };
  
  return priorityMap[actor] || 'normal';
};

export const notificationRouter = {
  getEntityName,
  getEntityKey,
  isValidActor,
  getDefaultPriority
};

export default notificationRouter;