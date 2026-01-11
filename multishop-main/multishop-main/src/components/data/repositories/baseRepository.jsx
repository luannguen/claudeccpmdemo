/**
 * Base Repository - Foundation for all entity repositories
 * Provides common CRUD operations with Result<T> pattern
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '../types';

// Try to import error logger
let trackApiCall = () => {};
try {
  const ErrorLogger = require('@/components/shared/errors/ErrorLogger');
  if (ErrorLogger?.trackApiCall) {
    trackApiCall = ErrorLogger.trackApiCall;
  }
} catch (e) {
  // ErrorLogger not available
}

/**
 * Create a base repository for an entity
 * @param {string} entityName - Name of the entity (e.g., 'Product', 'Order')
 * @returns {Object} Repository with CRUD methods
 */
export function createBaseRepository(entityName) {
  const entity = base44.entities[entityName];
  
  if (!entity) {
    console.error(`Entity "${entityName}" not found in base44.entities`);
  }

  return {
    /**
     * List all items with optional sorting
     * @param {string} [sortBy='-created_date'] - Sort field
     * @param {number} [limit=100] - Max items
     * @returns {Promise<Result>}
     */
    async list(sortBy = '-created_date', limit = 100) {
      try {
        trackApiCall('LIST', entityName, 'pending');
        const data = await entity.list(sortBy, limit);
        trackApiCall('LIST', entityName, 'success');
        return success(data);
      } catch (err) {
        trackApiCall('LIST', entityName, 'error');
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Filter items by query
     * Note: Base44 SDK filter() có thể gặp lỗi với một số query phức tạp
     * Nên dùng list() + filter client-side cho reliability
     * @param {Object} query - Filter query
     * @param {string} [sortBy='-created_date'] - Sort field
     * @param {number} [limit=100] - Max items
     * @returns {Promise<Result>}
     */
    async filter(query, sortBy = '-created_date', limit = 100) {
      try {
        // Fallback: list all then filter client-side để tránh SDK errors
        const allData = await entity.list(sortBy, Math.max(limit * 5, 500));
        const filtered = allData.filter(item => {
          return Object.entries(query).every(([key, value]) => {
            if (value === undefined || value === null) return true;
            // Check both top-level và nested trong item.data (Base44 entity structure)
            const itemValue = item[key] !== undefined ? item[key] : item.data?.[key];
            return itemValue === value;
          });
        }).slice(0, limit);
        return success(filtered);
      } catch (err) {
        // Wrap error message properly
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Get single item by ID
     * @param {string} id
     * @returns {Promise<Result>}
     */
    async getById(id) {
      try {
        if (!id) {
          return failure('ID is required', ErrorCodes.VALIDATION_ERROR);
        }
        // Use list then find instead of filter to avoid SDK issues
        const allItems = await entity.list('-created_date', 1000);
        const item = allItems.find(i => i.id === id);
        if (!item) {
          return failure('Item not found', ErrorCodes.NOT_FOUND);
        }
        return success(item);
      } catch (err) {
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Create new item
     * @param {Object} data
     * @returns {Promise<Result>}
     */
    async create(data) {
      try {
        trackApiCall('CREATE', entityName, 'pending');
        const item = await entity.create(data);
        trackApiCall('CREATE', entityName, 'success');
        return success(item);
      } catch (err) {
        trackApiCall('CREATE', entityName, 'error');
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Create multiple items
     * @param {Array} items
     * @returns {Promise<Result>}
     */
    async bulkCreate(items) {
      try {
        const result = await entity.bulkCreate(items);
        return success(result);
      } catch (err) {
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Update item
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Result>}
     */
    async update(id, data) {
      try {
        if (!id) {
          return failure('ID is required', ErrorCodes.VALIDATION_ERROR);
        }
        trackApiCall('UPDATE', entityName, 'pending');
        const item = await entity.update(id, data);
        trackApiCall('UPDATE', entityName, 'success');
        return success(item);
      } catch (err) {
        trackApiCall('UPDATE', entityName, 'error');
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Delete item
     * @param {string} id
     * @returns {Promise<Result>}
     */
    async delete(id) {
      try {
        if (!id) {
          return failure('ID is required', ErrorCodes.VALIDATION_ERROR);
        }
        trackApiCall('DELETE', entityName, 'pending');
        await entity.delete(id);
        trackApiCall('DELETE', entityName, 'success');
        return success({ id, deleted: true });
      } catch (err) {
        trackApiCall('DELETE', entityName, 'error');
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    },

    /**
     * Get entity schema
     * @returns {Promise<Result>}
     */
    async getSchema() {
      try {
        const schema = await entity.schema();
        return success(schema);
      } catch (err) {
        const errorMsg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        return failure(errorMsg, ErrorCodes.SERVER_ERROR);
      }
    }
  };
}

/**
 * Create repository with custom methods
 * @param {string} entityName
 * @param {Function} customMethods - Function that receives base repo and returns custom methods
 * @returns {Object}
 */
export function createRepository(entityName, customMethods = () => ({})) {
  const baseRepo = createBaseRepository(entityName);
  const custom = customMethods(baseRepo);
  
  return {
    ...baseRepo,
    ...custom
  };
}