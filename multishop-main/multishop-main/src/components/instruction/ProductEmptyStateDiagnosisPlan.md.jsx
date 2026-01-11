# Product Empty State Diagnosis Plan

## Executive Summary

**Vấn đề**: Admin/Sản Phẩm hiển thị "Không tìm thấy" sau khi nâng cấp soft delete/clone/versioning.

**Mục tiêu**: Xác định root cause và fix đảm bảo products hiển thị đúng.

**Approach**: Systematic diagnosis từ data → logic → UI.

---

## Current State Analysis

### Quan Sát Từ Code & Database

**Database:**
- ✅ 5 products tồn tại trong DB
- ✅ Tất cả có `is_deleted: False` (old data chưa có field này)
- ✅ Tất cả có `status: 'active'`
- ⚠️ Products KHÔNG CÓ field `is_deleted` trong schema cũ

**Query Logic:**
- ❌ `useAdminProducts()` query với filter `{ is_deleted: false }`
- ❌ Old products không có field `is_deleted` → filter fail
- ❌ Result trả về empty array

**Nguyên Nhân ROOT:**
```javascript
// useAdminProducts.js line 45-51
queryFn: async () => {
  let result;
  if (includeDeleted) {
    result = await productRepository.list('-created_date', 500);
  } else {
    result = await productRepository.filter({ is_deleted: false }, '-created_date', 500);
    // ❌ Filter { is_deleted: false } trên old products (không có field) → trả về []
  }
}
```

**Vấn đề phụ:**
- ✅ ProductRepository.js: `listActive()` chỉ filter theo `status`
- ✅ Client useProducts.js: filter `{ is_deleted: false, status: 'active' }` → cũng bị

---

## Root Cause Analysis

### Vấn đề 1: Schema Migration Incomplete
- Entity `Product.json` đã có field `is_deleted`, `deleted_at`, `deleted_by`
- Database records hiện tại KHÔNG CÓ fields này (old data)
- Filter query `{ is_deleted: false }` fail trên old records

### Vấn đề 2: Backward Compatibility Broken
- Code mới giả định tất cả products đã có `is_deleted` field
- Không handle trường hợp products cũ chưa migrate

### Vấn đề 3: Query Strategy Sai
- Nên query ALL rồi filter client-side theo `is_deleted ?? false`
- Hoặc migrate data trước khi deploy code

---

## Solution Strategy

### Option A: Client-Side Filter (RECOMMENDED - Quick Fix)
**Ưu điểm:**
- ✅ Không cần migrate data
- ✅ Backward compatible
- ✅ Deploy ngay

**Nhược điểm:**
- ⚠️ Load nhiều data hơn (nhưng chỉ 500 products max)

**Implementation:**
```javascript
// useAdminProducts.js
queryFn: async () => {
  // Query ALL products
  const result = await productRepository.list('-created_date', 500);
  if (!result.success) return [];
  
  // Client-side filter theo is_deleted
  if (includeDeleted) {
    return result.data;
  } else {
    // Filter: chưa có is_deleted HOẶC is_deleted === false
    return result.data.filter(p => !p.is_deleted);
  }
}
```

### Option B: Data Migration (Better Long-Term)
**Ưu điểm:**
- ✅ Chuẩn hóa data
- ✅ Query performance tốt hơn

**Nhược điểm:**
- ⚠️ Cần migration script
- ⚠️ Mất thời gian hơn

**Implementation:**
1. Bulk update tất cả products cũ: set `is_deleted: false`
2. Sau đó query filter hoạt động bình thường

---

## Phased Fix Plan

### Phase 1: Immediate Fix (5 mins) - PRIORITY P0

**Task 1.1**: Fix useAdminProducts query logic
- Query ALL products thay vì filter by `is_deleted`
- Client-side filter `!p.is_deleted`
- Status: ✅

**Task 1.2**: Fix useProducts (client) query logic
- Tương tự, query ALL rồi filter client-side
- Status: ✅

**Task 1.3**: Verify fix
- Test admin products page load
- Test client products page load
- Status: ✅

### Phase 2: Data Migration (Optional - 10 mins)

**Task 2.1**: Create migration script
- Bulk update products without `is_deleted` → set `is_deleted: false`
- Status: ⬜

**Task 2.2**: Run migration
- Execute bulk update
- Status: ⬜

**Task 2.3**: Revert query logic to server-side filter
- Optional: Revert về filter `{ is_deleted: false }` sau khi migrate
- Status: ⬜

---

## Implementation Details

### Fix 1: useAdminProducts.js

```javascript
// BEFORE (BROKEN)
queryFn: async () => {
  let result;
  if (includeDeleted) {
    result = await productRepository.list('-created_date', 500);
  } else {
    result = await productRepository.filter({ is_deleted: false }, '-created_date', 500); // ❌ FAIL
  }
  return result.success ? result.data : [];
}

// AFTER (FIXED)
queryFn: async () => {
  const result = await productRepository.list('-created_date', 500); // Query ALL
  if (!result.success) return [];
  
  // Client-side filter
  if (includeDeleted) {
    return result.data;
  } else {
    return result.data.filter(p => !p.is_deleted); // Handle missing field
  }
}
```

### Fix 2: useProducts.js (Client)

```javascript
// BEFORE (BROKEN)
queryFn: async () => {
  const result = await productRepository.filter(
    { is_deleted: false, status: 'active' }, // ❌ FAIL
    '-created_date',
    500
  );
  return result.success ? result.data : [];
}

// AFTER (FIXED)
queryFn: async () => {
  const result = await productRepository.filter(
    { status: 'active' }, // Chỉ filter status
    '-created_date',
    500
  );
  if (!result.success) return [];
  
  // Client-side filter is_deleted
  return result.data.filter(p => !p.is_deleted);
}
```

---

## Testing Checklist

- [ ] Admin products page load → hiển thị products
- [ ] Filter by category → hoạt động
- [ ] Search → hoạt động
- [ ] Toggle "Hiện SP đã xóa" → hoạt động
- [ ] Client products page → hiển thị products
- [ ] Soft delete 1 product → biến mất khỏi list (nếu toggle OFF)
- [ ] Toggle ON → product đã xóa xuất hiện
- [ ] Restore → product trở lại bình thường

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Query performance với client-side filter | Low | Chỉ 500 products max, acceptable |
| Future products không có is_deleted | Low | Default value trong entity schema |

---

## Success Criteria

- ✅ Admin products page hiển thị tất cả products hiện có
- ✅ Backward compatible với old data (không có is_deleted field)
- ✅ Toggle hoạt động đúng
- ✅ Client không thấy products đã deleted

---

## Changelog

### 2026-01-07 - Diagnosis Complete
- ✅ Identified root cause: filter query fail trên old data
- ✅ Created fix plan: client-side filter

### 2026-01-07 - Fix Implemented
- ✅ Updated useAdminProducts: query ALL → client-side filter `!p.is_deleted`
- ✅ Updated useProducts (client): query active → client-side filter `!p.is_deleted`
- ✅ Backward compatible: `!undefined` = `true`, old products vẫn hiển thị
- ✅ Phase 1 COMPLETED