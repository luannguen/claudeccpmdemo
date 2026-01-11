/**
 * Feature Service
 * 
 * Service layer cho quản lý tính năng hệ thống.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";

// ========== CONSTANTS ==========
export const FEATURE_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  COMPLETED: 'completed',
  DEPRECATED: 'deprecated'
};

export const FEATURE_CATEGORY = {
  CORE: 'core',
  ADMIN: 'admin',
  CLIENT: 'client',
  PAYMENT: 'payment',
  CMS: 'cms',
  NOTIFICATION: 'notification',
  REFERRAL: 'referral',
  ORDER: 'order',
  PRODUCT: 'product',
  CUSTOMER: 'customer',
  INTEGRATION: 'integration',
  FEEDBACK: 'feedback',
  OTHER: 'other'
};

export const FEATURE_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const TEST_CASE_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  BLOCKED: 'blocked',
  READY_FOR_RETEST: 'ready_for_retest'
};

// ========== STATUS DISPLAY CONFIG ==========
export const statusConfig = {
  planned: { label: 'Kế hoạch', color: 'bg-gray-100 text-gray-700', icon: '📋' },
  in_progress: { label: 'Đang phát triển', color: 'bg-blue-100 text-blue-700', icon: '🔧' },
  testing: { label: 'Đang test', color: 'bg-yellow-100 text-yellow-700', icon: '🧪' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: '✅' },
  deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-700', icon: '⛔' }
};

export const categoryConfig = {
  core: { label: 'Core System', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-indigo-100 text-indigo-700' },
  client: { label: 'Client', color: 'bg-teal-100 text-teal-700' },
  payment: { label: 'Thanh toán', color: 'bg-emerald-100 text-emerald-700' },
  cms: { label: 'CMS', color: 'bg-cyan-100 text-cyan-700' },
  notification: { label: 'Thông báo', color: 'bg-orange-100 text-orange-700' },
  referral: { label: 'Giới thiệu', color: 'bg-pink-100 text-pink-700' },
  order: { label: 'Đơn hàng', color: 'bg-amber-100 text-amber-700' },
  product: { label: 'Sản phẩm', color: 'bg-lime-100 text-lime-700' },
  customer: { label: 'Khách hàng', color: 'bg-sky-100 text-sky-700' },
  integration: { label: 'Tích hợp', color: 'bg-violet-100 text-violet-700' },
  feedback: { label: 'Feedback', color: 'bg-rose-100 text-rose-700' },
  other: { label: 'Khác', color: 'bg-slate-100 text-slate-700' }
};

export const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500 text-white' },
  high: { label: 'High', color: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', color: 'bg-blue-500 text-white' },
  low: { label: 'Low', color: 'bg-gray-400 text-white' }
};

// ========== SERVICE ==========
export const featureService = {
  /**
   * Lấy danh sách tất cả tính năng
   */
  list: async (sortBy = '-created_date') => {
    try {
      const features = await base44.entities.Feature.list(sortBy);
      return success(features);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy tính năng theo ID
   */
  getById: async (id) => {
    try {
      const features = await base44.entities.Feature.filter({ id });
      if (!features.length) {
        return failure('Không tìm thấy tính năng', ErrorCodes.NOT_FOUND);
      }
      return success(features[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo tính năng mới
   */
  create: async (data) => {
    try {
      // Validate
      if (!data.name?.trim()) {
        return failure('Tên tính năng không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (!data.category) {
        return failure('Danh mục không được trống', ErrorCodes.VALIDATION_ERROR);
      }

      const feature = await base44.entities.Feature.create({
        ...data,
        name: data.name.trim(),
        test_cases: data.test_cases || [],
        acceptance_criteria: data.acceptance_criteria || [],
        related_pages: data.related_pages || [],
        related_components: data.related_components || [],
        tags: data.tags || []
      });
      
      return success(feature);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật tính năng
   */
  update: async (id, data) => {
    try {
      if (!id) {
        return failure('ID không hợp lệ', ErrorCodes.VALIDATION_ERROR);
      }

      const feature = await base44.entities.Feature.update(id, data);
      return success(feature);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Xóa tính năng (với cascade cleanup related data)
   */
  delete: async (id) => {
    try {
      // Step 1: Cleanup related TesterNotifications
      const relatedNotifications = await base44.entities.TesterNotification.filter({ feature_id: id });
      for (const notif of relatedNotifications) {
        await base44.entities.TesterNotification.delete(notif.id);
      }

      // Step 2: Delete feature
      await base44.entities.Feature.delete(id);
      
      return success(null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy thống kê tính năng
   */
  getStats: async () => {
    try {
      const features = await base44.entities.Feature.list();
      
      const stats = {
        total: features.length,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        testCoverage: { total: 0, passed: 0, failed: 0, pending: 0 }
      };

      features.forEach(f => {
        // By status
        stats.byStatus[f.status] = (stats.byStatus[f.status] || 0) + 1;
        // By category
        stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
        // By priority
        stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
        // Test coverage
        if (f.test_cases?.length) {
          f.test_cases.forEach(tc => {
            stats.testCoverage.total++;
            if (tc.status === 'passed') stats.testCoverage.passed++;
            else if (tc.status === 'failed') stats.testCoverage.failed++;
            else stats.testCoverage.pending++;
          });
        }
      });

      return success(stats);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật test case status
   */
  updateTestCase: async (featureId, testCaseId, status) => {
    try {
      const result = await featureService.getById(featureId);
      if (!result.success) return result;

      const feature = result.data;
      const testCases = feature.test_cases || [];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex === -1) {
        return failure('Test case không tồn tại', ErrorCodes.NOT_FOUND);
      }

      testCases[tcIndex].status = status;
      
      return await featureService.update(featureId, { test_cases: testCases });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo public link cho tester
   */
  generatePublicLink: async (featureId) => {
    try {
      const token = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      
      await base44.entities.Feature.update(featureId, {
        public_token: token,
        is_public: true
      });

      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/FeaturesPublic?token=${token}`;
      
      return success({ token, url: publicUrl });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Hủy public link
   */
  revokePublicLink: async (featureId) => {
    try {
      await base44.entities.Feature.update(featureId, {
        public_token: null,
        is_public: false
      });
      return success(null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật full test case (với screenshots, error info, etc.)
   */
  updateTestCaseFull: async (featureId, testCaseId, updates) => {
    try {
      const result = await featureService.getById(featureId);
      if (!result.success) return result;

      const feature = result.data;
      const testCases = [...(feature.test_cases || [])];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex === -1) {
        return failure('Test case không tồn tại', ErrorCodes.NOT_FOUND);
      }

      // Add to history
      const history = testCases[tcIndex].test_history || [];
      history.push({
        status: updates.status,
        tester: updates.tester_name || updates.tester_email,
        timestamp: new Date().toISOString(),
        note: updates.actual_result?.substring(0, 100)
      });

      testCases[tcIndex] = {
        ...testCases[tcIndex],
        ...updates,
        test_history: history,
        tested_at: new Date().toISOString()
      };

      return await featureService.update(featureId, { test_cases: testCases });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

export default featureService;