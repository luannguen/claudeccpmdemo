# 🔧 E-Card Connection "Unknown" Bug Fix Plan

**Mã lỗi**: ECARD-BUG-001  
**Priority**: P0 (Critical UX bug)  
**Trạng thái**: 🔄 In Progress  
**Created**: 2026-01-07  
**Owner**: Tech Team

---

## 📊 Executive Summary

### Vấn đề
Connections trong E-Card hiển thị "Unknown" thay vì tên người dùng do `target_name = null` trong database.

### Nguyên nhân gốc rễ
1. **Repository**: Không validate `targetProfile.display_name` khi tạo connection
2. **Hook enrichment**: Chỉ fix `avatar` và `slug`, bỏ sót `target_name`
3. **Deduplication**: Có thể chọn connection mới thiếu data thay vì connection cũ đầy đủ
4. **Fallback yếu**: Không có fallback khi profile không có `display_name`

### Giải pháp
- Fix enrichment logic để fetch và update `target_name`
- Add validation và fallback mạnh mẽ
- Migrate data cũ bằng script
- Add prevention mechanism

---

## 🎯 Current State Analysis

### Database Evidence
```javascript
// Records có target_name = null
{
  initiator_user_id: '69100e8e5fcf93ce5875d018',
  target_user_id: '69100d8b766a5738235f45ce',
  target_name: null, // ← NULL
  target_avatar: null,
  target_slug: 'nguyenzeroluan-1767231841990',
  care_level: 'normal'
}
```

### Code Issues

**File**: `components/ecard/data/connectionRepository.js`
```javascript
// Line 178-192 - THIẾU validation
target_name: targetProfile.display_name, // ← Nếu null → connection có target_name = null
```

**File**: `components/ecard/hooks/useConnections.js`
```javascript
// Line 98-124 - BỎ SÓT enrich target_name
return {
  ...conn,
  target_avatar: avatar,
  target_slug: slug,
  target_name: conn.target_name || cached?.display_name || null // ← Chỉ fallback cache
};
```

---

## ✅ Target Architecture

### 1. Enrichment Strategy (3-tier fallback)
```javascript
target_name = 
  conn.target_name ||                          // Existing data
  fetchedProfile?.display_name ||              // Live fetch
  cached?.display_name ||                      // Cache
  conn.target_email?.split('@')[0] ||         // Email prefix
  'Người dùng'                                 // Ultimate fallback
```

### 2. Validation at Create
```javascript
// In createBidirectionalConnection
if (!targetProfile.display_name && !targetProfile.email) {
  throw new Error('INVALID_PROFILE_DATA');
}

const targetName = targetProfile.display_name || 
                   targetProfile.email.split('@')[0] || 
                   'Người dùng';
```

### 3. Background Healing
```javascript
// Auto-update connections with null target_name
if (!conn.target_name && profile) {
  base44.entities.UserConnection.update(conn.id, {
    target_name: profile.display_name || profile.email?.split('@')[0]
  }).catch(() => {});
}
```

---

## 📝 Phased Plan

### **Phase 1: Fix Enrichment Logic** ✅
- [x] T1.1: Update enrichment để fetch `target_name`
- [x] T1.2: Add 3-tier fallback cho `target_name`
- [x] T1.3: Background update connections thiếu name

### **Phase 2: Fix Repository Validation** ✅
- [x] T2.1: Add validation `display_name` tại `createBidirectionalConnection`
- [x] T2.2: Add fallback `email.split('@')[0]` khi tạo
- [x] T2.3: Add error handling rõ ràng

### **Phase 3: Data Migration** 🔄
- [ ] T3.1: Tạo function `fixUnknownConnections` (backend)
- [ ] T3.2: Batch update connections có `target_name = null`
- [ ] T3.3: Log kết quả migration

### **Phase 4: Prevention** 🔄
- [ ] T4.1: Add test case "Create connection với profile thiếu display_name"
- [ ] T4.2: Add monitoring/alert cho connections thiếu data

---

## 📁 File Breakdown

### Files to Modify
- ✅ `components/ecard/hooks/useConnections.js` - Fix enrichment
- ✅ `components/ecard/data/connectionRepository.js` - Add validation
- 🔄 `functions/fixUnknownConnections.js` - Data migration script

---

## 🧪 Test Cases

| ID | Scenario | Expected | Status |
|----|----------|----------|--------|
| TC1 | Connection với profile đầy đủ | Hiển thị đúng tên | ✅ Pass |
| TC2 | Connection với profile thiếu display_name | Fallback email prefix | 🔄 Pending |
| TC3 | Connection cũ có target_name = null | Auto-heal thành tên đúng | 🔄 Pending |
| TC4 | Profile không tồn tại | Hiển thị "Người dùng" | 🔄 Pending |

---

## 🎯 Success Criteria
- ✅ KHÔNG còn connection nào hiển thị "Unknown"
- ✅ Enrichment fetch đầy đủ name, avatar, slug
- ✅ Fallback chain 3 tiers hoạt động
- ✅ Data cũ được migrate clean

---

## 📊 Progress Tracking

| Phase | Tasks | Status | Progress |
|-------|-------|--------|----------|
| Phase 1 | Fix Enrichment Logic | ✅ Done | 100% |
| Phase 2 | Fix Repository Validation | ✅ Done | 100% |
| Phase 3 | Data Migration | 🔄 In Progress | 0% |
| Phase 4 | Prevention | ⬜ Todo | 0% |

**Overall**: 50%

---

## 📝 Changelog

### 2026-01-07
- ✅ Phân tích root cause
- ✅ Tạo fix plan
- 🔄 Implementing Phase 1-2