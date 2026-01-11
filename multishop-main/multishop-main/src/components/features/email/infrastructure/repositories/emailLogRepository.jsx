/**
 * 📧 Email Log Repository - Communication Log Data Access
 * 
 * Repository for logging sent emails.
 * Infrastructure layer - phụ thuộc Base44 SDK.
 */

import { base44 } from '@/api/base44Client';

/**
 * Email Log Repository
 */
export const emailLogRepository = {
  /**
   * Log a sent communication
   * @param {Object} logData - Log entry data
   * @returns {Promise<Object|null>} Created log entry or null
   */
  create: async (logData) => {
    try {
      // asServiceRole doesn't work in frontend, use regular entities API
      const log = await base44.entities.CommunicationLog.create({
        ...logData,
        sent_date: logData.sent_date || new Date().toISOString()
      });
      console.log('📝 Communication logged:', log.id);
      return log;
    } catch (error) {
      console.error('❌ Failed to log communication:', error);
      return null;
    }
  },

  /**
   * List communication logs
   * @param {Object} [options]
   * @param {number} [options.limit=100] - Max logs to return
   * @param {string} [options.type] - Filter by type
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.customerEmail] - Filter by customer email
   * @returns {Promise<Array>}
   */
  list: async (options = {}) => {
    try {
      const { limit = 100, type, status, customerEmail } = options;
      
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (customerEmail) filter.customer_email = customerEmail;
      
      if (Object.keys(filter).length > 0) {
        return await base44.entities.CommunicationLog.filter(filter, '-sent_date', limit);
      }
      
      return await base44.entities.CommunicationLog.list('-sent_date', limit);
    } catch (error) {
      console.error('❌ Failed to list communication logs:', error);
      return [];
    }
  },

  /**
   * Get logs for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>}
   */
  getByOrderId: async (orderId) => {
    try {
      return await base44.entities.CommunicationLog.filter(
        { order_id: orderId },
        '-sent_date',
        50
      );
    } catch (error) {
      console.error('❌ Failed to get logs for order:', error);
      return [];
    }
  },

  /**
   * Get logs for a customer
   * @param {string} email - Customer email
   * @param {number} [limit=50] - Max logs
   * @returns {Promise<Array>}
   */
  getByCustomerEmail: async (email, limit = 50) => {
    try {
      return await base44.entities.CommunicationLog.filter(
        { customer_email: email },
        '-sent_date',
        limit
      );
    } catch (error) {
      console.error('❌ Failed to get logs for customer:', error);
      return [];
    }
  },

  /**
   * Get failed logs for retry
   * @param {number} [limit=100] - Max logs
   * @returns {Promise<Array>}
   */
  getFailedLogs: async (limit = 100) => {
    try {
      return await base44.entities.CommunicationLog.filter(
        { status: 'failed' },
        '-sent_date',
        limit
      );
    } catch (error) {
      console.error('❌ Failed to get failed logs:', error);
      return [];
    }
  },

  /**
   * Update log status
   * @param {string} id - Log ID
   * @param {string} status - New status
   * @param {string} [errorMessage] - Error message if failed
   * @returns {Promise<boolean>}
   */
  updateStatus: async (id, status, errorMessage = null) => {
    try {
      const updateData = { status };
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }
      await base44.entities.CommunicationLog.update(id, updateData);
      return true;
    } catch (error) {
      console.error('❌ Failed to update log status:', error);
      return false;
    }
  },

  /**
   * Get statistics for email logs
   * @param {Object} [options]
   * @param {string} [options.startDate] - Start date for filtering
   * @param {string} [options.endDate] - End date for filtering
   * @returns {Promise<Object>} Statistics
   */
  getStats: async (options = {}) => {
    try {
      const logs = await emailLogRepository.list({ limit: 1000 });
      
      const stats = {
        total: logs.length,
        sent: 0,
        failed: 0,
        byType: {},
        byChannel: {}
      };

      for (const log of logs) {
        // Count by status
        if (log.status === 'sent') {
          stats.sent++;
        } else if (log.status === 'failed') {
          stats.failed++;
        }

        // Count by type
        const type = log.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by channel
        const channel = log.channel || 'email';
        stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get email stats:', error);
      return {
        total: 0,
        sent: 0,
        failed: 0,
        byType: {},
        byChannel: {}
      };
    }
  }
};

export default emailLogRepository;