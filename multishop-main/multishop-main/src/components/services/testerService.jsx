/**
 * Tester Service
 * 
 * Service layer cho Tester Portal.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";

// ========== TEST CASE STATUS CONFIG ==========
export const TEST_CASE_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  BLOCKED: 'blocked',
  READY_FOR_RETEST: 'ready_for_retest'
};

export const testCaseStatusConfig = {
  pending: { label: 'Chờ test', color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  passed: { label: 'Đạt', color: 'bg-green-100 text-green-700', icon: '✅' },
  failed: { label: 'Lỗi', color: 'bg-red-100 text-red-700', icon: '❌' },
  skipped: { label: 'Bỏ qua', color: 'bg-yellow-100 text-yellow-700', icon: '⏭️' },
  blocked: { label: 'Bị chặn', color: 'bg-orange-100 text-orange-700', icon: '🚫' },
  ready_for_retest: { label: 'Sẵn sàng test lại', color: 'bg-blue-100 text-blue-700', icon: '🔄' }
};

// ========== TESTER PROFILE SERVICE ==========
export const testerProfileService = {
  /**
   * Lấy profile của tester theo email
   */
  getByEmail: async (email) => {
    try {
      const profiles = await base44.entities.TesterProfile.filter({ user_email: email });
      if (!profiles.length) {
        return success(null);
      }
      return success(profiles[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo hoặc cập nhật profile tester
   */
  upsert: async (data) => {
    try {
      if (!data.user_email?.trim()) {
        return failure('Email không được trống', ErrorCodes.VALIDATION_ERROR);
      }

      const existing = await base44.entities.TesterProfile.filter({ user_email: data.user_email });
      
      if (existing.length) {
        const updated = await base44.entities.TesterProfile.update(existing[0].id, {
          ...data,
          last_active: new Date().toISOString()
        });
        return success(updated);
      } else {
        const created = await base44.entities.TesterProfile.create({
          ...data,
          total_tests_completed: 0,
          total_bugs_found: 0,
          total_passed: 0,
          total_failed: 0,
          last_active: new Date().toISOString()
        });
        return success(created);
      }
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật thống kê tester
   */
  updateStats: async (email, statsDelta) => {
    try {
      const profiles = await base44.entities.TesterProfile.filter({ user_email: email });
      if (!profiles.length) return success(null);

      const profile = profiles[0];
      const updated = await base44.entities.TesterProfile.update(profile.id, {
        total_tests_completed: (profile.total_tests_completed || 0) + (statsDelta.completed || 0),
        total_bugs_found: (profile.total_bugs_found || 0) + (statsDelta.bugs || 0),
        total_passed: (profile.total_passed || 0) + (statsDelta.passed || 0),
        total_failed: (profile.total_failed || 0) + (statsDelta.failed || 0),
        last_active: new Date().toISOString()
      });
      return success(updated);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== TESTER NOTIFICATION SERVICE ==========
export const testerNotificationService = {
  /**
   * Tạo thông báo cho tester
   */
  create: async (data) => {
    try {
      if (!data.recipient_email) {
        return failure('Recipient email không được trống', ErrorCodes.VALIDATION_ERROR);
      }

      const notification = await base44.entities.TesterNotification.create({
        ...data,
        is_read: false
      });
      return success(notification);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy danh sách thông báo của tester
   */
  listByEmail: async (email, limit = 50) => {
    try {
      const notifications = await base44.entities.TesterNotification.filter(
        { recipient_email: email },
        '-created_date',
        limit
      );
      return success(notifications);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Đánh dấu đã đọc
   */
  markAsRead: async (id) => {
    try {
      const updated = await base44.entities.TesterNotification.update(id, {
        is_read: true,
        read_date: new Date().toISOString()
      });
      return success(updated);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead: async (email) => {
    try {
      const unread = await base44.entities.TesterNotification.filter({
        recipient_email: email,
        is_read: false
      });
      
      await Promise.all(unread.map(n => 
        base44.entities.TesterNotification.update(n.id, {
          is_read: true,
          read_date: new Date().toISOString()
        })
      ));
      
      return success({ count: unread.length });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Gửi thông báo "Sẵn sàng test lại"
   */
  notifyReadyForRetest: async ({ featureId, featureName, testCaseId, testCaseTitle, testerEmail, devName, fixedVersion }) => {
    try {
      const notification = await base44.entities.TesterNotification.create({
        recipient_email: testerEmail,
        type: 'ready_for_retest',
        title: '🔄 Sẵn sàng test lại',
        message: `Test case "${testCaseTitle}" đã được sửa lỗi${fixedVersion ? ` trong ${fixedVersion}` : ''} và sẵn sàng để test lại.`,
        feature_id: featureId,
        feature_name: featureName,
        test_case_id: testCaseId,
        test_case_title: testCaseTitle,
        actor_name: devName,
        priority: 'high',
        is_read: false
      });
      return success(notification);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Gửi thông báo phản hồi từ developer
   */
  notifyDevResponse: async ({ featureId, featureName, testCaseId, testCaseTitle, testerEmail, devName, message }) => {
    try {
      const notification = await base44.entities.TesterNotification.create({
        recipient_email: testerEmail,
        type: 'dev_response',
        title: '💬 Phản hồi từ Developer',
        message: `${devName} đã phản hồi về test case "${testCaseTitle}": ${message.substring(0, 100)}...`,
        feature_id: featureId,
        feature_name: featureName,
        test_case_id: testCaseId,
        test_case_title: testCaseTitle,
        actor_name: devName,
        priority: 'normal',
        is_read: false
      });
      return success(notification);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== FEATURE TESTING SERVICE ==========
export const featureTestingService = {
  /**
   * Lấy danh sách features được gán cho tester
   */
  getAssignedFeatures: async (testerEmail) => {
    try {
      const features = await base44.entities.Feature.list('-updated_date');
      
      // Lọc features có tester được gán hoặc có test case được gán
      const assigned = features.filter(f => {
        // Guard: skip invalid features
        if (!f?.id) return false;
        
        const isAssignedToFeature = f.assigned_testers?.includes(testerEmail);
        const hasAssignedTestCase = f.test_cases?.some(tc => tc?.id && tc.assigned_tester === testerEmail);
        return isAssignedToFeature || hasAssignedTestCase;
      });
      
      // Ensure all assigned features have valid structure
      const validFeatures = assigned.map(f => ({
        ...f,
        test_cases: (f.test_cases || []).filter(tc => tc?.id) // Only keep test cases with valid id
      }));
      
      return success(validFeatures);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Đánh dấu test case sẵn sàng test lại (cho developer)
   */
  markReadyForRetest: async (featureId, testCaseId, devResponse) => {
    try {
      const features = await base44.entities.Feature.filter({ id: featureId });
      if (!features.length) {
        return failure('Feature không tồn tại', ErrorCodes.NOT_FOUND);
      }

      const feature = features[0];
      const testCases = [...(feature.test_cases || [])];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex === -1) {
        return failure('Test case không tồn tại', ErrorCodes.NOT_FOUND);
      }

      const tc = testCases[tcIndex];
      
      // Add to history
      const history = tc.test_history || [];
      history.push({
        status: 'ready_for_retest',
        tester: devResponse.responded_by,
        timestamp: new Date().toISOString(),
        note: `Developer đánh dấu sẵn sàng test lại. ${devResponse.message || ''}`,
        version: devResponse.fixed_in_version,
        dev_response: devResponse.message
      });

      testCases[tcIndex] = {
        ...tc,
        status: 'ready_for_retest',
        dev_response: {
          message: devResponse.message,
          fixed_in_version: devResponse.fixed_in_version,
          responded_at: new Date().toISOString(),
          responded_by: devResponse.responded_by
        },
        retest_count: (tc.retest_count || 0) + 1,
        test_history: history
      };

      const updated = await base44.entities.Feature.update(featureId, { 
        test_cases: testCases,
        version: devResponse.fixed_in_version || feature.version
      });

      // Gửi thông báo cho tester
      if (tc.tester_email) {
        await testerNotificationService.notifyReadyForRetest({
          featureId,
          featureName: feature.name,
          testCaseId,
          testCaseTitle: tc.title,
          testerEmail: tc.tester_email,
          devName: devResponse.responded_by,
          fixedVersion: devResponse.fixed_in_version
        });
      }

      return success(updated);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Gán tester cho test case
   */
  assignTesterToTestCase: async (featureId, testCaseId, testerEmail) => {
    try {
      const features = await base44.entities.Feature.filter({ id: featureId });
      if (!features.length) {
        return failure('Feature không tồn tại', ErrorCodes.NOT_FOUND);
      }

      const feature = features[0];
      const testCases = [...(feature.test_cases || [])];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex === -1) {
        return failure('Test case không tồn tại', ErrorCodes.NOT_FOUND);
      }

      testCases[tcIndex] = {
        ...testCases[tcIndex],
        assigned_tester: testerEmail
      };

      const updated = await base44.entities.Feature.update(featureId, { test_cases: testCases });

      // Gửi thông báo cho tester
      await testerNotificationService.create({
        recipient_email: testerEmail,
        type: 'test_case_assigned',
        title: '📋 Test Case mới được gán',
        message: `Bạn được gán test case "${testCases[tcIndex].title}" trong tính năng "${feature.name}"`,
        feature_id: featureId,
        feature_name: feature.name,
        test_case_id: testCaseId,
        test_case_title: testCases[tcIndex].title,
        priority: 'normal'
      });

      return success(updated);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Submit kết quả test (cho tester)
   */
  submitTestResult: async (featureId, testCaseId, result, testerInfo) => {
    try {
      // Validate
      if (!result.status) {
        return failure('Trạng thái không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (!testerInfo.email) {
        return failure('Email tester không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (result.status === 'failed' && !result.actual_result?.trim()) {
        return failure('Vui lòng mô tả kết quả thực tế khi test failed', ErrorCodes.VALIDATION_ERROR);
      }

      const features = await base44.entities.Feature.filter({ id: featureId });
      if (!features.length) {
        return failure('Feature không tồn tại', ErrorCodes.NOT_FOUND);
      }

      const feature = features[0];
      const testCases = [...(feature.test_cases || [])];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex === -1) {
        return failure('Test case không tồn tại', ErrorCodes.NOT_FOUND);
      }

      const tc = testCases[tcIndex];
      
      // Add to history
      const history = tc.test_history || [];
      history.push({
        status: result.status,
        tester: testerInfo.name,
        tester_email: testerInfo.email,
        timestamp: new Date().toISOString(),
        note: result.actual_result?.substring(0, 200),
        version: feature.version
      });

      testCases[tcIndex] = {
        ...tc,
        status: result.status,
        actual_result: result.actual_result,
        error_code: result.error_code,
        error_description: result.error_description,
        screenshots: result.screenshots || tc.screenshots,
        video_url: result.video_url || tc.video_url,
        tester_email: testerInfo.email,
        tester_name: testerInfo.name,
        tested_at: new Date().toISOString(),
        environment: result.environment,
        browser_info: result.browser_info,
        severity: result.severity,
        tested_version: feature.version,
        test_history: history
      };

      const updated = await base44.entities.Feature.update(featureId, { test_cases: testCases });

      // Update tester stats
      await testerProfileService.updateStats(testerInfo.email, {
        completed: 1,
        bugs: result.status === 'failed' ? 1 : 0,
        passed: result.status === 'passed' ? 1 : 0,
        failed: result.status === 'failed' ? 1 : 0
      });

      return success(updated);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Báo lỗi nhanh (Quick Bug Report)
   */
  quickBugReport: async (featureId, testCaseId, bugData, testerInfo) => {
    try {
      if (!bugData.description?.trim()) {
        return failure('Mô tả lỗi không được trống', ErrorCodes.VALIDATION_ERROR);
      }

      // Submit as failed test case
      return await featureTestingService.submitTestResult(
        featureId,
        testCaseId,
        {
          status: 'failed',
          actual_result: bugData.description,
          error_code: bugData.error_code || 'BUG_REPORT',
          error_description: bugData.title || 'Quick Bug Report',
          screenshots: bugData.screenshots || [],
          video_url: bugData.video_url,
          environment: bugData.environment || 'staging',
          browser_info: bugData.browser_info,
          severity: bugData.severity || 'major'
        },
        testerInfo
      );
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Bulk assign tester cho nhiều test cases
   */
  bulkAssignTester: async (assignments) => {
    try {
      // assignments = [{ featureId, testCaseIds: [], testerEmail }]
      const results = [];
      
      for (const assignment of assignments) {
        const { featureId, testCaseIds, testerEmail } = assignment;
        
        const featureResult = await featureTestingService.getFeatureById(featureId);
        if (!featureResult.success) {
          results.push({ featureId, success: false, message: featureResult.message });
          continue;
        }
        
        const feature = featureResult.data;
        const testCases = [...(feature.test_cases || [])];
        let assignedCount = 0;
        
        testCaseIds.forEach(tcId => {
          const tcIndex = testCases.findIndex(tc => tc.id === tcId);
          if (tcIndex !== -1) {
            testCases[tcIndex].assigned_tester = testerEmail;
            assignedCount++;
          }
        });
        
        // Update assigned_testers array nếu chưa có
        const assignedTesters = feature.assigned_testers || [];
        if (!assignedTesters.includes(testerEmail)) {
          assignedTesters.push(testerEmail);
        }
        
        await base44.entities.Feature.update(featureId, { 
          test_cases: testCases,
          assigned_testers: assignedTesters
        });
        
        results.push({ featureId, success: true, assignedCount });
      }
      
      // Send notification to testers
      const testerEmails = [...new Set(assignments.map(a => a.testerEmail))];
      for (const email of testerEmails) {
        const assignedFeatures = assignments.filter(a => a.testerEmail === email);
        const totalTestCases = assignedFeatures.reduce((sum, a) => sum + a.testCaseIds.length, 0);
        
        await testerNotificationService.create({
          recipient_email: email,
          type: 'bulk_assignment',
          title: '📋 Bạn được gán nhiều test cases',
          message: `Bạn được gán ${totalTestCases} test cases từ ${assignedFeatures.length} features`,
          priority: 'high'
        });
      }
      
      return success(results);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Helper: Get feature by ID
   */
  getFeatureById: async (featureId) => {
    try {
      const features = await base44.entities.Feature.filter({ id: featureId });
      if (!features.length) {
        return failure('Feature không tồn tại', ErrorCodes.NOT_FOUND);
      }
      return success(features[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy thống kê test của tester
   */
  getTesterStats: async (testerEmail, featureId = null) => {
    try {
      let features;
      if (featureId) {
        features = await base44.entities.Feature.filter({ id: featureId });
      } else {
        features = await base44.entities.Feature.list();
      }

      const stats = {
        total: 0,
        pending: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        ready_for_retest: 0,
        myTests: 0
      };

      features.forEach(f => {
        // Guard: skip features without valid id
        if (!f?.id) return;
        
        (f.test_cases || []).forEach(tc => {
          // Guard: skip test cases without valid id
          if (!tc?.id) return;
          
          stats.total++;
          const status = tc.status || 'pending';
          stats[status] = (stats[status] || 0) + 1;
          
          if (tc.tester_email === testerEmail || tc.assigned_tester === testerEmail) {
            stats.myTests++;
          }
        });
      });

      return success(stats);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

export default {
  testerProfileService,
  testerNotificationService,
  featureTestingService,
  TEST_CASE_STATUS,
  testCaseStatusConfig
};