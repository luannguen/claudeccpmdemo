# Feedback Module - Audit & Enhancement Plan

## 📋 Executive Summary

**Mục tiêu**: Nâng cấp toàn diện hệ thống Feedback với UX tốt hơn, realtime notification, và media support.

**Vấn đề hiện tại**:
- ❌ Client không nhận được notification khi admin phản hồi
- ❌ Không hỗ trợ upload ảnh trong comment/reply
- ❌ Không có quote/reply thread
- ❌ Avatar không hiển thị đúng
- ❌ Modal notification tràn ra ngoài màn hình

**Giải pháp**:
- ✅ Realtime notification với polling 15s
- ✅ Upload ảnh với validation (max 5MB, max 5 files)
- ✅ Quote comment và reply thread
- ✅ Avatar từ UserProfile entity
- ✅ Modal position fixed (right-aligned)

---

## 🎯 Target Architecture

### Database Schema

```
Feedback (entity)
├── user_email, user_name
├── title, description, category, priority
├── screenshot_url
├── status, admin_response, admin_note
├── user_read_response (boolean)
├── reviewed_by, reviewed_date
└── rating (1-4 emoji)

FeedbackComment (entity) - UPDATED
├── feedback_id
├── author_email, author_name, author_avatar ✅ NEW
├── content
├── images[] ✅ NEW
├── quoted_comment_id ✅ NEW
├── quoted_content, quoted_author_name ✅ NEW
├── is_admin, is_internal
└── created_date
```

### Component Structure

```
components/feedback/
├── FeedbackImageUpload.jsx ✅ NEW
├── FeedbackCommentItem.jsx ✅ NEW
├── FeedbackReplyForm.jsx ✅ NEW
├── ImageLightbox.jsx ✅ NEW
├── FeedbackThreadView.jsx ✅ UPDATED
├── FeedbackQuickCreateModal.jsx
├── FeedbackRealTimeNotification.jsx ✅ UPDATED
└── EnhancedMediaUpload.jsx ✅ UPDATED (validation)
```

---

## 📝 Phased Plan

### Phase 1: Database & Entity ✅ COMPLETED
- ✅ Update FeedbackComment entity (images, quote, avatar)
- ✅ Add validation cho image uploads

### Phase 2: UI Components ✅ COMPLETED
- ✅ FeedbackImageUpload - Upload với validation
- ✅ FeedbackCommentItem - Hiển thị comment với avatar/images/quote
- ✅ FeedbackReplyForm - Form reply với image upload và quote
- ✅ ImageLightbox - Xem ảnh full screen

### Phase 3: Service & Hooks ✅ COMPLETED
- ✅ Update useAddFeedbackComment - Hỗ trợ images, quote, avatar
- ✅ Update useFeedbackNotifications - Polling 15s
- ✅ Auto create notification khi admin reply

### Phase 4: Client & Admin Views ✅ COMPLETED
- ✅ MyFeedback.js - Client view với avatar, quote, images
- ✅ FeedbackThreadView.jsx - Admin view với full features
- ✅ Fix notification modal position (right-aligned)

### Phase 5: Notification Flow ✅ COMPLETED
- ✅ Client gửi feedback → Admin nhận notification
- ✅ Admin reply → User nhận notification
- ✅ Badge "có phản hồi mới" trên card
- ✅ Auto mark as read khi mở modal

---

## ✅ Task Breakdown

| Task | Status | Component | Notes |
|------|--------|-----------|-------|
| Update FeedbackComment entity | ✅ | entities/FeedbackComment.json | Added images, quote, avatar |
| Create FeedbackImageUpload | ✅ | components/feedback/FeedbackImageUpload.jsx | Validation: 5MB, 5 files max |
| Create FeedbackCommentItem | ✅ | components/feedback/FeedbackCommentItem.jsx | Avatar, images, quote display |
| Create FeedbackReplyForm | ✅ | components/feedback/FeedbackReplyForm.jsx | Form with image upload, quote |
| Create ImageLightbox | ✅ | components/feedback/ImageLightbox.jsx | Full screen image preview |
| Update FeedbackThreadView | ✅ | components/feedback/FeedbackThreadView.jsx | Quote, images, avatar |
| Update MyFeedback client | ✅ | pages/MyFeedback.js | Full thread with images, quote |
| Update useAddFeedbackComment | ✅ | components/hooks/useFeedback.js | Support images, quote, avatar |
| Update notification polling | ✅ | components/hooks/useFeedbackEnhanced.js | 15s interval |
| Fix modal position | ✅ | components/features/notification/ui/shared/NotificationBellBase.jsx | Right-aligned |
| Update EnhancedMediaUpload | ✅ | components/feedback/EnhancedMediaUpload.jsx | Add validation |

---

## 🔍 Success Criteria

✅ **Validation**:
- Chỉ cho phép JPG, PNG, GIF, WebP (images)
- Max 5MB mỗi file
- Max 5 ảnh mỗi lần upload
- Error messages rõ ràng khi vi phạm

✅ **Avatar Display**:
- Hiển thị avatar từ UserProfile entity
- Fallback về ký tự đầu nếu không có avatar
- Admin avatar màu xanh lá, user avatar màu xanh dương

✅ **Quote Feature**:
- Quote comment để reply thread
- Preview quoted content trong form
- Hiển thị quote trong comment item

✅ **Notification Flow**:
- Client gửi → Admin nhận notification
- Admin reply → User nhận notification + badge
- Polling 15s để realtime
- Auto mark read khi mở modal

✅ **UI/UX**:
- Modal notification right-aligned (không tràn)
- Image lightbox zoom full screen
- Ctrl+Enter để gửi nhanh
- Loading states rõ ràng

---

## 📊 Changelog

### 2025-12-30 - v1.0.0 - Initial Enhancement
- ✅ Added image upload support với validation
- ✅ Added quote/reply threading
- ✅ Added avatar display từ UserProfile
- ✅ Fixed notification modal position
- ✅ Improved realtime notification flow
- ✅ Added image lightbox viewer

---

## 🎓 Key Learnings

1. **Avatar Management**: Phải fetch từ UserProfile entity, không phải User entity
2. **Validation Layer**: Client-side validation quan trọng để UX tốt
3. **Quote Threading**: Cache quoted content để tránh query cascade
4. **Notification Position**: Fixed position với right-0 cho modal dropdown
5. **Image Preview**: Lightbox component tách riêng để reuse

---

## 🚀 Future Enhancements

- [ ] Rich text editor cho feedback description
- [ ] Emoji reactions cho comments
- [ ] File attachments (PDF, documents)
- [ ] Video preview trong modal
- [ ] @mention users trong comments
- [ ] Real-time typing indicators
- [ ] Search/filter comments
- [ ] Export feedback reports

---

**Status**: ✅ Phase 1-5 Completed (100%)
**Last Updated**: 2025-12-30
**Next Review**: When adding new features to feedback system