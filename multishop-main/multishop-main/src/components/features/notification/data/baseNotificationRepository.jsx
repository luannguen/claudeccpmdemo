/**
 * Base Notification Repository
 * CRUD operations for any notification entity
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

/**
 * Create base repository for notification entity
 */
export const createNotificationRepository = (entityName) => {
  return {
    /**
     * List notifications
     */
    async list(limit = 50) {
      try {
        const data = await base44.entities[entityName].list('-created_date', limit);
        return success(data);
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Filter notifications
     */
    async filter(query, limit = 50) {
      try {
        const data = await base44.entities[entityName].filter(query, '-created_date', limit);
        return success(data);
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Get by ID
     */
    async getById(id) {
      try {
        const all = await base44.entities[entityName].list('-created_date', 500);
        const item = all.find(n => n.id === id);
        
        if (!item) {
          return failure('Notification not found', ErrorCodes.NOT_FOUND);
        }
        
        return success(item);
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Update notification
     */
    async update(id, data) {
      try {
        const updated = await base44.entities[entityName].update(id, data);
        return success(updated);
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Delete notification
     */
    async delete(id) {
      try {
        await base44.entities[entityName].delete(id);
        return success({ deleted: true });
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Bulk delete
     */
    async bulkDelete(ids) {
      try {
        await Promise.all(ids.map(id => base44.entities[entityName].delete(id)));
        return success({ deleted: ids.length });
      } catch (error) {
        return failure(error.message, ErrorCodes.SERVER_ERROR);
      }
    }
  };
};

export default createNotificationRepository;