/**
 * Referral Domain Use Cases
 */

export const referralUseCases = [
  {
    id: 'referral.listMembers',
    domain: 'referral',
    description: 'Danh sách thành viên giới thiệu',
    input: 'FilterParams',
    output: 'Result<ReferralMemberDTO[]>',
    service: 'referralMemberRepository.list',
    hook: 'useReferralMembers',
    component: 'AdminReferralMembers'
  },
  {
    id: 'referral.myMember',
    domain: 'referral',
    description: 'Thông tin referral của user hiện tại',
    input: 'void',
    output: 'Result<ReferralMemberDTO>',
    service: 'referralMemberRepository.getByEmail',
    hook: 'useMyReferralMember',
    component: 'MyReferrals'
  },
  {
    id: 'referral.register',
    domain: 'referral',
    description: 'Đăng ký tham gia chương trình',
    input: 'ReferralRegisterDTO',
    output: 'Result<ReferralMemberDTO>',
    service: 'referralMemberRepository.create',
    hook: 'useRegisterReferralMember',
    component: 'MyReferrals'
  },
  {
    id: 'referral.validateCode',
    domain: 'referral',
    description: 'Kiểm tra mã giới thiệu',
    input: 'string (code)',
    output: '{ valid, member? }',
    service: 'referralMemberRepository.validateCode',
    hook: 'useValidateReferralCode',
    component: 'CheckoutModal, ReferralCodeInput'
  },
  {
    id: 'referral.approve',
    domain: 'referral',
    description: 'Duyệt thành viên',
    input: 'string (id)',
    output: 'Result<ReferralMemberDTO>',
    service: 'referralMemberRepository.approve',
    hook: 'useApproveMember',
    component: 'AdminReferralMembers'
  },
  {
    id: 'referral.suspend',
    domain: 'referral',
    description: 'Đình chỉ thành viên',
    input: '{ id, reason }',
    output: 'Result<ReferralMemberDTO>',
    service: 'referralMemberRepository.suspend',
    hook: 'useSuspendMember',
    component: 'AdminReferralMembers'
  },
  {
    id: 'referral.processPayout',
    domain: 'referral',
    description: 'Thanh toán hoa hồng',
    input: '{ memberIds }',
    output: 'Result<void>',
    service: 'referralMemberRepository.processPayout',
    hook: 'useProcessPayout',
    component: 'AdminReferralMembers'
  },
  {
    id: 'referral.stats',
    domain: 'referral',
    description: 'Thống kê referral',
    input: 'void',
    output: 'Result<ReferralStats>',
    service: 'referralMemberRepository.getStats',
    hook: 'useReferralStats',
    component: 'AdminReferrals'
  },
  {
    id: 'referral.settings',
    domain: 'referral',
    description: 'Cấu hình chương trình',
    input: 'void',
    output: 'Result<ReferralSettingDTO>',
    service: 'referralSettingRepository.getMainSettings',
    hook: 'useReferralSettings',
    component: 'AdminReferralSettings, MyReferrals'
  },
  {
    id: 'referral.leaderboard',
    domain: 'referral',
    description: 'Bảng xếp hạng realtime',
    input: 'string (period)',
    output: 'Result<LeaderboardEntry[]>',
    service: 'ReferralGamificationService.getRealtimeLeaderboard',
    hook: 'useLeaderboard',
    component: 'GamificationLeaderboard'
  },
  {
    id: 'referral.checkMilestones',
    domain: 'referral',
    description: 'Kiểm tra và trao thành tựu',
    input: 'string (memberId)',
    output: 'Result<Achievement[]>',
    service: 'ReferralGamificationService.checkAndAwardMilestones',
    hook: 'useCheckMilestones',
    component: 'MilestoneTracker'
  },
  {
    id: 'referral.performanceInsights',
    domain: 'referral',
    description: 'Phân tích hiệu suất & gợi ý',
    input: 'string (memberId)',
    output: 'Result<PerformanceInsights>',
    service: 'ReferralGamificationService.getPerformanceInsights',
    hook: 'usePerformanceInsights',
    component: 'PerformanceInsights'
  },
  {
    id: 'referral.customerJourney',
    domain: 'referral',
    description: 'Hành trình khách hàng',
    input: 'string (customerId)',
    output: 'Result<CustomerJourney>',
    service: 'ReferralGamificationService.getCustomerJourney',
    hook: 'useCustomerJourney',
    component: 'CustomerJourneyViewer'
  },
  {
    id: 'referral.autoCapture',
    domain: 'referral',
    description: 'Tự động bắt ref code từ URL',
    input: 'void (from URL params)',
    output: 'void (save to cookie)',
    service: 'ReferralLinkHandler',
    hook: 'useReferralCheckout',
    component: 'ReferralLinkHandler, CheckoutModal'
  },
  {
    id: 'referral.setCustomRate',
    domain: 'referral',
    description: 'Admin set custom commission rate cho CTV',
    input: '{ memberId, rate, adminEmail, note }',
    output: 'Result<void>',
    service: 'referralMemberRepository.setCustomRate',
    hook: 'useSetCustomRate',
    component: 'AdminReferralMembers, CustomRateModal'
  },
  {
    id: 'referral.disableCustomRate',
    domain: 'referral',
    description: 'Admin tắt custom rate',
    input: '{ memberId, adminEmail }',
    output: 'Result<void>',
    service: 'referralMemberRepository.disableCustomRate',
    hook: 'useDisableCustomRate',
    component: 'AdminReferralMembers'
  },
  {
    id: 'referral.claimCustomer',
    domain: 'referral',
    description: 'CTV claim KH cũ (retroactive)',
    input: '{ referrerId, customerEmail }',
    output: 'Result<ClaimRequest>',
    service: 'ReferralClaimService.requestClaimCustomer',
    hook: 'useRequestClaim',
    component: 'MyReferrals, ClaimCustomerModal'
  },
  {
    id: 'referral.approveClaim',
    domain: 'referral',
    description: 'Admin duyệt claim KH cũ',
    input: '{ claimRequestId, adminEmail }',
    output: 'Result<void>',
    service: 'ReferralClaimService.approveCustomerClaim',
    hook: 'useApproveClaim',
    component: 'AdminNotifications, ClaimApprovalCard'
  },
  {
    id: 'referral.rejectClaim',
    domain: 'referral',
    description: 'Admin từ chối claim',
    input: '{ claimRequestId, adminEmail, reason }',
    output: 'Result<void>',
    service: 'ReferralClaimService.rejectCustomerClaim',
    hook: 'useRejectClaim',
    component: 'AdminNotifications, ClaimApprovalCard'
  },
  {
    id: 'referral.reverseCommission',
    domain: 'referral',
    description: 'Auto reverse commission khi return/refund',
    input: '{ orderId, reason }',
    output: 'Result<ReversalEvent>',
    service: 'CommissionReversalService.reverseOrderCommission',
    hook: 'useCommissionReversal',
    component: 'AdminOrders, OrderService'
  },
  {
    id: 'referral.requestWithdrawal',
    domain: 'referral',
    description: 'CTV yêu cầu rút tiền',
    input: '{ referrerId, amount, bankInfo }',
    output: 'Result<Withdrawal>',
    service: 'WithdrawalService.requestWithdrawal',
    hook: 'useRequestWithdrawal',
    component: 'MyReferrals, WithdrawalRequestModal'
  },
  {
    id: 'referral.approveWithdrawal',
    domain: 'referral',
    description: 'Admin duyệt rút tiền',
    input: '{ withdrawalId, adminEmail, note }',
    output: 'Result<void>',
    service: 'WithdrawalService.approveWithdrawal',
    hook: 'useApproveWithdrawal',
    component: 'AdminWithdrawals'
  },
  {
    id: 'referral.checkTierProgress',
    domain: 'referral',
    description: 'Check và alert tier progress',
    input: '{ referrerId, newRevenue }',
    output: 'Result<TierAlert>',
    service: 'TierAlertService.checkTierProgress',
    hook: 'useTierAlert',
    component: 'MyReferrals, TierProgressAlert'
  },
  {
    id: 'referral.bulkApprove',
    domain: 'referral',
    description: 'Admin bulk approve members',
    input: '{ memberIds, adminEmail }',
    output: 'Result<BulkResult>',
    service: 'BulkReferralActionsService.bulkApproveMembers',
    hook: 'useBulkApprove',
    component: 'AdminReferralMembers, BulkActionsToolbar'
  },
  {
    id: 'referral.bulkPayout',
    domain: 'referral',
    description: 'Admin bulk payout',
    input: '{ memberIds, adminEmail }',
    output: 'Result<BulkResult>',
    service: 'BulkReferralActionsService.bulkPayoutMembers',
    hook: 'useBulkPayout',
    component: 'AdminReferralMembers, BulkActionsToolbar'
  },
  {
    id: 'referral.bulkSuspend',
    domain: 'referral',
    description: 'Admin bulk suspend',
    input: '{ memberIds, adminEmail, reason }',
    output: 'Result<BulkResult>',
    service: 'BulkReferralActionsService.bulkSuspendMembers',
    hook: 'useBulkSuspend',
    component: 'AdminReferralMembers, BulkActionsToolbar'
  }
];