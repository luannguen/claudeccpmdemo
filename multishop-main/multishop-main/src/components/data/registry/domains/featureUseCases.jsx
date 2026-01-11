/**
 * Feature Domain Use Cases
 */

export const featureUseCases = [
  {
    id: 'feature.list',
    domain: 'feature',
    description: 'Danh sách tính năng hệ thống',
    input: 'void',
    output: 'Result<FeatureDTO[]>',
    service: 'featureService.list',
    hook: 'useFeatureList',
    component: 'Features'
  },
  {
    id: 'feature.detail',
    domain: 'feature',
    description: 'Chi tiết tính năng',
    input: 'string (id)',
    output: 'Result<FeatureDTO>',
    service: 'featureService.getById',
    hook: 'useFeatureDetail',
    component: 'FeatureFormModal'
  },
  {
    id: 'feature.create',
    domain: 'feature',
    description: 'Tạo tính năng mới',
    input: 'FeatureCreateDTO',
    output: 'Result<FeatureDTO>',
    service: 'featureService.create',
    hook: 'useFeatureMutations',
    component: 'FeatureFormModal'
  },
  {
    id: 'feature.update',
    domain: 'feature',
    description: 'Cập nhật tính năng',
    input: 'FeatureUpdateDTO',
    output: 'Result<FeatureDTO>',
    service: 'featureService.update',
    hook: 'useFeatureMutations',
    component: 'FeatureFormModal'
  },
  {
    id: 'feature.delete',
    domain: 'feature',
    description: 'Xóa tính năng',
    input: 'string (id)',
    output: 'Result<void>',
    service: 'featureService.delete',
    hook: 'useFeatureMutations',
    component: 'Features'
  },
  {
    id: 'feature.stats',
    domain: 'feature',
    description: 'Thống kê tính năng',
    input: 'void',
    output: 'Result<FeatureStats>',
    service: 'featureService.getStats',
    hook: 'useFeatureStats',
    component: 'Features'
  },
  {
    id: 'feature.updateTestCase',
    domain: 'feature',
    description: 'Cập nhật trạng thái test case',
    input: '{ featureId, testCaseId, status }',
    output: 'Result<FeatureDTO>',
    service: 'featureService.updateTestCase',
    hook: 'useFeatureMutations',
    component: 'Features'
  },
  {
    id: 'feature.generatePublicLink',
    domain: 'feature',
    description: 'Tạo public link cho tester',
    input: 'string (featureId)',
    output: 'Result<{ token, url }>',
    service: 'featureService.generatePublicLink',
    hook: 'useFeatureMutations',
    component: 'Features'
  },
  {
    id: 'feature.revokePublicLink',
    domain: 'feature',
    description: 'Hủy public link',
    input: 'string (featureId)',
    output: 'Result<void>',
    service: 'featureService.revokePublicLink',
    hook: 'useFeatureMutations',
    component: 'Features'
  },
  {
    id: 'feature.updateTestCaseFull',
    domain: 'feature',
    description: 'Cập nhật test case đầy đủ (screenshots, error info)',
    input: '{ featureId, testCaseId, updates }',
    output: 'Result<FeatureDTO>',
    service: 'featureService.updateTestCaseFull',
    hook: 'useFeatureMutations',
    component: 'FeaturesPublic, TestCaseFormEnhanced'
  },
  // ========== TESTER PORTAL USE CASES ==========
  {
    id: 'tester.profile.get',
    domain: 'tester',
    description: 'Lấy profile tester theo email',
    input: 'string (email)',
    output: 'Result<TesterProfileDTO>',
    service: 'testerProfileService.getByEmail',
    hook: 'useTesterProfile',
    component: 'TesterPortal'
  },
  {
    id: 'tester.profile.upsert',
    domain: 'tester',
    description: 'Tạo hoặc cập nhật profile tester',
    input: 'TesterProfileDTO',
    output: 'Result<TesterProfileDTO>',
    service: 'testerProfileService.upsert',
    hook: 'useTesterProfile',
    component: 'TesterPortal'
  },
  {
    id: 'tester.notifications.list',
    domain: 'tester',
    description: 'Danh sách thông báo của tester',
    input: 'string (email)',
    output: 'Result<TesterNotificationDTO[]>',
    service: 'testerNotificationService.listByEmail',
    hook: 'useTesterNotifications',
    component: 'TesterNotificationBell'
  },
  {
    id: 'tester.notifications.markAsRead',
    domain: 'tester',
    description: 'Đánh dấu thông báo đã đọc',
    input: 'string (id)',
    output: 'Result<TesterNotificationDTO>',
    service: 'testerNotificationService.markAsRead',
    hook: 'useTesterNotifications',
    component: 'TesterNotificationBell'
  },
  {
    id: 'tester.feature.markReadyForRetest',
    domain: 'tester',
    description: 'Đánh dấu test case sẵn sàng test lại (dev action)',
    input: '{ featureId, testCaseId, devResponse }',
    output: 'Result<FeatureDTO>',
    service: 'featureTestingService.markReadyForRetest',
    hook: 'useFeatureMutations',
    component: 'Features'
  },
  {
    id: 'tester.feature.submitTestResult',
    domain: 'tester',
    description: 'Submit kết quả test',
    input: '{ featureId, testCaseId, result, testerInfo }',
    output: 'Result<FeatureDTO>',
    service: 'featureTestingService.submitTestResult',
    hook: 'useFeatureTesting',
    component: 'TestCaseCardEnhanced'
  },
  {
    id: 'tester.feature.quickBugReport',
    domain: 'tester',
    description: 'Báo lỗi nhanh',
    input: '{ featureId, testCaseId, bugData, testerInfo }',
    output: 'Result<FeatureDTO>',
    service: 'featureTestingService.quickBugReport',
    hook: 'useFeatureTesting',
    component: 'QuickBugReportModal'
  },
  {
    id: 'tester.dashboard',
    domain: 'tester',
    description: 'Dashboard cá nhân của tester',
    input: 'string (testerEmail)',
    output: 'Result<TesterDashboardDTO>',
    service: 'featureTestingService.getAssignedFeatures',
    hook: 'useTesterDashboard',
    component: 'TesterDashboard'
  }
];