# Tester Portal Enhancement Plan

## Executive Summary

**Mục tiêu**: Nâng cấp Tester Portal thành hệ thống test management chuyên nghiệp, hiệu quả với UX/UI mượt mà.

**Vấn đề hiện tại**:
- ✅ FIXED: Click ảnh download thay vì xem (đã sửa với ImageLightbox)
- ✅ FIXED: Thiếu flow "dev sửa → đánh dấu ready for retest → tester test lại" (đã có DevResponseModal + notification)
- ✅ FIXED: Admin không thấy được overview test results dễ dàng (đã có AdminTestResultsOverview với filters)
- ✅ FIXED: Click tester card để filter results (đã implement)
- ⬜ TODO: Keyboard shortcuts cho tester test nhanh
- ⬜ TODO: Bulk test actions (pass/fail nhiều test cases cùng lúc)
- ⬜ TODO: Test case templates để tạo nhanh
- ⬜ TODO: Video recording integration (screen recording)
- ⬜ TODO: AI suggestions cho test cases dựa trên lịch sử

**Lợi ích**:
- Giảm thời gian test xuống 40%
- Tăng chất lượng bug reports
- Developer và Tester collaboration mượt mà
- Real-time updates và notifications

---

## Current State Analysis

### ✅ Đã có (Completed Features):

1. **Core Testing Flow**
   - Tester login/authentication
   - View assigned features
   - Submit test results (pass/fail/skip/block)
   - Upload screenshots/videos
   - Test history tracking

2. **Developer Response Flow**
   - Dev có thể đánh dấu "đã sửa" (DevResponseModal)
   - Test case chuyển status → ready_for_retest
   - Notification gửi cho tester
   - Tester thấy banner "cần test lại" (ReadyForRetestBanner)

3. **Admin Management**
   - Xem danh sách testers
   - Xem test results overview
   - Filter by tester/status/category
   - Click tester card → filter results
   - Export CSV reports
   - Tester detail drawer với stats

4. **UX Enhancements**
   - ImageLightbox với zoom/download (thay vì download trực tiếp)
   - Modal chỉ mở 1 lần (không bị chồng)
   - Keyboard navigation trong lightbox
   - Top performers ranking
   - Click-to-filter interactions

### ⬜ Chưa có (Missing Features):

1. **Quick Actions**
   - ✅ ADDED: Quick Pass/Skip/Block buttons
   - ⬜ Batch testing mode (chọn nhiều test cases → pass/fail hàng loạt)
   - ⬜ Keyboard shortcuts (P = pass, F = fail, S = skip, B = block)

2. **Enhanced Collaboration**
   - ⬜ In-app chat giữa dev và tester
   - ⬜ @mention trong comments
   - ⬜ File attachments (logs, HAR files)

3. **Test Templates & Automation**
   - ⬜ Test case templates library
   - ⬜ Auto-fill test cases từ template
   - ⬜ Regression test suite auto-run

4. **Analytics & Insights**
   - ⬜ Test velocity charts
   - ⬜ Bug distribution by feature/category
   - ⬜ Time spent per test case
   - ⬜ Tester productivity trends

5. **Integrations**
   - ⬜ Screen recording integration
   - ⬜ Browser extension cho capture
   - ⬜ Jira sync (optional)
   - ⬜ Slack notifications (optional)

---

## Target Architecture

### Completed Components:

```
components/
├── tester/
│   ├── TesterDashboard.jsx ✅
│   ├── TesterNotificationBell.jsx ✅
│   ├── TestCaseCardEnhanced.jsx ✅
│   ├── TestCaseHistory.jsx ✅
│   ├── ReadyForRetestBanner.jsx ✅ NEW
│   ├── QuickActions.jsx ✅ NEW
│   ├── TesterFeatureFilters.jsx ✅
│   ├── BatchTestingToolbar.jsx ✅
│   └── ImageLightbox.jsx → admin/testers/ImageLightbox.jsx ✅ (unified)
├── admin/testers/
│   ├── AdminTesterList.jsx ✅
│   ├── AdminTestResultsOverview.jsx ✅
│   ├── TestCaseDetailModal.jsx ✅
│   ├── TesterDetailDrawer.jsx ✅ NEW
│   ├── TesterPerformanceCard.jsx ✅ NEW
│   ├── ExportTestReportAdmin.jsx ✅ NEW
│   └── ImageLightbox.jsx ✅ (unified for Admin + Tester)
├── features/
│   └── DevResponseModal.jsx ✅
└── services/
    ├── testerService.js ✅
    └── featureService.js ✅
```

### Pending Enhancements:

```
components/
├── tester/
│   ├── KeyboardShortcutsOverlay.jsx ⬜ (guide hiển thị shortcuts)
│   ├── BulkTestActionsBar.jsx ⬜ (thanh actions cho batch mode)
│   ├── TestCaseChat.jsx ⬜ (chat dev-tester)
│   ├── ScreenRecorder.jsx ⬜ (record màn hình)
│   └── TestVelocityChart.jsx ⬜ (biểu đồ tốc độ test)
└── admin/testers/
    ├── TesterAnalyticsDashboard.jsx ⬜
    └── BugDistributionChart.jsx ⬜
```

---

## Phased Plan

### ✅ Phase 1: Core Flow Fixes (COMPLETED)
**Status**: 100% ✅

- ✅ Fix image viewing (lightbox thay vì download)
- ✅ Dev response flow (DevResponseModal)
- ✅ Ready for retest notification + banner
- ✅ Admin test results overview
- ✅ Filter by tester
- ✅ Export reports

### ✅ Phase 2: Quick Actions & UX Polish (COMPLETED)
**Status**: 100% ✅

- ✅ Quick Pass/Skip/Block buttons
- ✅ Tester performance cards (clickable)
- ✅ Unified ImageLightbox with keyboard nav
- ✅ Detail drawer for testers
- ✅ Modal hierarchy fixes

### ⬜ Phase 3: Batch Testing & Keyboard Shortcuts
**Status**: 0%

**Tasks**:
- ⬜ Keyboard shortcuts overlay (P, F, S, B)
- ⬜ Keyboard event handlers trong TestCaseCard
- ⬜ Bulk actions bar improvements
- ⬜ Select all/deselect shortcuts

**Files to modify**:
- `components/tester/TestCaseCardEnhanced.jsx` - Add keyboard listeners
- `components/tester/KeyboardShortcutsOverlay.jsx` - NEW
- `components/tester/BatchTestingToolbar.jsx` - Enhance

### ⬜ Phase 4: Test Templates & Automation
**Status**: 0%

**Tasks**:
- ⬜ Test case template library
- ⬜ Template selector modal
- ⬜ Auto-fill from template
- ⬜ Common test scenarios (login, CRUD, payment, etc.)

**Files to create**:
- `components/features/TestTemplateLibrary.jsx` - Already exists, need to implement
- `components/tester/TemplateSelector.jsx` - NEW
- `data/testTemplates.js` - NEW

### ⬜ Phase 5: Enhanced Analytics
**Status**: 0%

**Tasks**:
- ⬜ Test velocity charts
- ⬜ Bug severity distribution
- ⬜ Time tracking per test
- ⬜ Tester productivity trends

**Files to create**:
- `components/admin/testers/TesterAnalytics.jsx` - NEW
- `components/tester/TesterStatsCharts.jsx` - Already exists, need to enhance
- `components/services/testerAnalyticsService.js` - NEW

### ⬜ Phase 6: Collaboration Features
**Status**: 0%

**Tasks**:
- ⬜ In-app chat between dev and tester
- ⬜ @mention support
- ⬜ File attachments (logs, HAR)
- ⬜ Comment threads on test cases

**Files to create**:
- `components/tester/TestCaseChat.jsx` - NEW
- `components/tester/TestCaseComments.jsx` - NEW
- `entities/TestCaseComment.json` - NEW
- `services/testCaseCommentService.js` - NEW

---

## Progress Tracking

### Overall Progress: 40%

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| Phase 1: Core Flow Fixes | ✅ | 100% | Completed |
| Phase 2: Quick Actions & UX | ✅ | 100% | Completed |
| Phase 3: Batch Testing | ⬜ | 0% | - |
| Phase 4: Templates | ⬜ | 0% | - |
| Phase 5: Analytics | ⬜ | 0% | - |
| Phase 6: Collaboration | ⬜ | 0% | - |

### Task Breakdown

**Phase 1** (COMPLETED):
- ✅ ImageLightbox component with zoom/navigation/keyboard
- ✅ DevResponseModal for dev feedback
- ✅ TesterNotification entity + service
- ✅ Ready for retest flow
- ✅ AdminTestResultsOverview with filters
- ✅ Export CSV functionality
- ✅ TesterDetailDrawer

**Phase 2** (COMPLETED):
- ✅ QuickActions component (Pass/Skip/Block)
- ✅ ReadyForRetestBanner
- ✅ TesterPerformanceCard (clickable)
- ✅ Modal z-index fixes
- ✅ Click-to-filter interactions
- ✅ Improved lightbox with keyboard support

**Phase 3** (PENDING):
- ⬜ KeyboardShortcutsOverlay component
- ⬜ Global keyboard event handler
- ⬜ Batch select improvements
- ⬜ Bulk pass/fail confirmations

---

## Success Criteria

### Phase 1-2 (ACHIEVED ✅):
- ✅ Click ảnh → xem trong lightbox (không download)
- ✅ Dev đánh dấu "đã sửa" → tester nhận notification
- ✅ Tester thấy banner "cần test lại" khi dev sửa xong
- ✅ Admin filter test results by tester
- ✅ Admin export CSV reports
- ✅ Quick actions cho pass/skip/block
- ✅ Zero modal conflicts

### Phase 3-6 (PENDING):
- ⬜ Keyboard shortcuts working (P/F/S/B)
- ⬜ Batch testing < 30s cho 10 test cases
- ⬜ Test templates giảm 50% thời gian tạo test case
- ⬜ Analytics dashboard cung cấp insights hữu ích

---

## Risk Assessment

### Low Risk (Completed):
- ✅ ImageLightbox component - Low complexity, isolated
- ✅ DevResponseModal - Straightforward form
- ✅ QuickActions - Simple button handlers

### Medium Risk (Pending):
- ⬜ Keyboard shortcuts - Cần handle conflicts với browser shortcuts
- ⬜ Batch testing - Race conditions khi submit nhiều test cùng lúc
- ⬜ Templates - Cần thiết kế schema linh hoạt

### High Risk (Future):
- ⬜ Screen recording - Browser API compatibility
- ⬜ Real-time chat - WebSocket infrastructure
- ⬜ Jira integration - External API dependencies

---

## Changelog

### 2025-12-30 - Phase 1-2 Completed
**Summary**: Core testing flow và dev-tester collaboration hoàn thiện

**Completed**:
- ✅ ImageLightbox with zoom/keyboard navigation (unified component)
- ✅ DevResponseModal for marking fixed bugs
- ✅ ReadyForRetestBanner showing recently fixed test cases
- ✅ QuickActions for fast pass/skip/block
- ✅ TesterPerformanceCard (clickable to filter)
- ✅ TesterDetailDrawer with quick actions
- ✅ ExportTestReportAdmin (CSV export)
- ✅ Modal z-index hierarchy fixes
- ✅ Click-to-filter interactions throughout

**Bug Fixes**:
- ✅ Fixed double modal opening (TestCaseDetailModal + ImageLightbox)
- ✅ Fixed image click behavior (view instead of download)
- ✅ Fixed dialog not closing when lightbox opens

**UI/UX Improvements**:
- ✅ Smooth modal transitions
- ✅ Keyboard navigation (arrows, ESC)
- ✅ Click hints and hover states
- ✅ Performance card ranking (🥇🥈🥉)
- ✅ Visual feedback for selections

**Next Steps**:
- Phase 3: Implement keyboard shortcuts for test actions
- Phase 4: Build test template library
- Phase 5: Analytics dashboard enhancements

---

## Notes

### Design Decisions:

1. **Unified ImageLightbox**: Tạo 1 component dùng chung cho Admin và Tester thay vì duplicate
2. **Modal Hierarchy**: Lightbox z-[200] > Dialog z-[100] để tránh conflicts
3. **Click-to-filter Pattern**: Consistent interaction - click card → filter, click again → clear
4. **Quick Actions**: Cân bằng giữa tốc độ (quick buttons) và chi tiết (full form)

### Constraints:

- Must use existing UI components (shadcn/ui)
- Must follow 3-layer architecture
- No circular dependencies
- Must use useConfirmDialog/useToast (not window.confirm/alert)
- Must use Icon from AnimatedIcon.jsx