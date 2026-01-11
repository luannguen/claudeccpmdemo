# Feedback & Features Module - Comprehensive Audit Plan

## 📋 Executive Summary

**Phạm vi**: Kiểm tra và bổ sung tính năng cho Admin Feedback và Features Registry (TestCase).

**Vấn đề phát hiện**:

### Feedback Module (Admin)
1. ✅ FeedbackThreadView đã có avatar, images, quote
2. ✅ FeedbackImageUpload với validation (5MB, 5 files)
3. ✅ FeedbackCommentItem hiển thị đầy đủ
4. ✅ FeedbackReplyForm có quote, images
5. ⚠️ FeedbackWorkflowManager thiếu quick actions (reply, view detail)
6. ⚠️ FeedbackAnalyticsDashboard thiếu sentiment trend chart
7. ⚠️ FeedbackExportTools thiếu filter trước khi export
8. ⚠️ FeedbackCard không hiển thị unread badge

### Features/TestCase Module
1. ⚠️ Thiếu danh mục "feedback" trong Feature category
2. ⚠️ TestCase thiếu field attachments/screenshots trong form
3. ⚠️ FeaturesRegistry public view thiếu sentiment/rating
4. ⚠️ Không có liên kết feedback → feature (khi bug được report)
5. ⚠️ Thiếu bulk import test cases
6. ⚠️ TestCase không có notification khi status change

**Kế hoạch bổ sung**:

---

## 🎯 Phase 1: Feedback Admin Enhancements (Current Session)

### 1.1 FeedbackWorkflowManager - Quick Actions
- [ ] Add "View Detail" button → mở FeedbackThreadView modal
- [ ] Add "Quick Reply" inline form
- [ ] Show unread indicator cho feedback có response mới
- [ ] Hiển thị số comments trong mỗi card

### 1.2 FeedbackExportTools - Filter Support
- [ ] Add filter selection before export (status, category, date range)
- [ ] Include comments count in export
- [ ] Export với sentiment analysis

### 1.3 FeedbackCard Enhancement
- [ ] Badge "Mới" cho feedback chưa đọc
- [ ] Hiển thị số votes
- [ ] Preview avatar người gửi

---

## 🎯 Phase 2: Features/TestCase Enhancements

### 2.1 Add "feedback" Category
- [ ] Update Feature entity category enum
- [ ] Update featureService categoryConfig

### 2.2 Feedback ↔ Feature Linking
- [ ] Add field `linked_feedback_ids` trong Feature entity
- [ ] UI để link feedback bug → feature
- [ ] Auto-suggest link khi feedback category = "bug"

### 2.3 TestCase Attachments
- [ ] Add screenshots upload trong TestCase form
- [ ] Add video URL field
- [ ] Preview attachments trong expanded view

### 2.4 TestCase Notifications
- [ ] Notify assigned tester khi test case được gán
- [ ] Notify dev khi test case failed
- [ ] Notify admin khi all tests passed

---

## 📊 Database Schema Updates

### Feature Entity - Add feedback category
```json
"category": {
  "enum": [...existing..., "feedback"]
}

"linked_feedback_ids": {
  "type": "array",
  "items": { "type": "string" },
  "description": "IDs của feedback liên quan"
}
```

---

## ✅ Tasks - Phase 1 (Executing Now)

| # | Task | File | Status |
|---|------|------|--------|
| 1 | Add quick actions to WorkflowManager | FeedbackWorkflowManager.jsx | ✅ |
| 2 | Add filter to ExportTools | FeedbackExportTools.jsx | ✅ |
| 3 | Enhance FeedbackCard | AdminFeedback.js | ✅ |
| 4 | Add "feedback" to Feature category | entities/Feature.json | ✅ |
| 5 | Update featureService categoryConfig | featureService.js | ✅ |
| 6 | Create FeedbackLinkToFeature component | FeedbackLinkToFeature.jsx | ✅ |
| 7 | Add sentiment trend chart | FeedbackAnalyticsDashboard.jsx | ✅ |
| 8 | Create TestCaseFormEnhanced | TestCaseFormEnhanced.jsx | ✅ |
| 9 | Add attachments field to Feature entity | entities/Feature.json | ✅ |

---

## 📝 Changelog

### 2025-12-30 - v1.0.0 - Initial Audit
- Created comprehensive audit plan
- Identified 12 enhancement areas
- Started Phase 1 implementation

### 2025-12-30 - v1.1.0 - Phase 1 Completed ✅
- ✅ FeedbackWorkflowManager: Added quick actions (view detail, quick reply inline)
- ✅ FeedbackWorkflowManager: Show comments count, votes, unread badge
- ✅ FeedbackExportTools: Added filters (status, category, date range)
- ✅ FeedbackExportTools: Include comments count, sentiment in export
- ✅ FeedbackCard: Show unread badge, votes, link to feature button
- ✅ Feature entity: Added "feedback" category + linked_feedback_ids field
- ✅ Feature entity: Added attachments field to test_cases
- ✅ FeatureService: Updated categoryConfig with "feedback"
- ✅ FeedbackLinkToFeature: New component to link/create feature from feedback
- ✅ FeedbackAnalyticsDashboard: Added sentiment trend chart (7 days)
- ✅ TestCaseFormEnhanced: Support screenshots, attachments, video URL upload

---

**Status**: ✅ Phase 1 Completed (100%)
**Last Updated**: 2025-12-30