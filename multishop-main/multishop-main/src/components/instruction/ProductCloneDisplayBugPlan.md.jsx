# Product Clone Display Bug - Diagnosis & Fix Plan

## Executive Summary

**Vấn đề**: Sau khi clone sản phẩm → UI CHỈ hiển thị 2 products (gốc + copy), các products khác biến mất.

**Root Cause**: React Query cache invalidation + refetch KHÔNG đồng bộ với UI state.

**Mục tiêu**: Fix để sau clone vẫn hiển thị TẤT CẢ products.

---

## Current State Analysis

### Database (Verified)
✅ **6 products tồn tại trong database:**
1. `[Copy] Rau Cải Xanh Organic` - ID: 695de689fc9d1d5c340f0338
2. `[Copy] Rau Cải Xanh Organic` - ID: 695de6879c4dbc8b078ff499
3. `Rau Cải Xanh Organic` (gốc) - ID: 690e9d8c8000bb35cb286e3d (clone_count: 1)
4. `Cà Chua Bi Cherry` - ID: 690e9d8c8000bb35cb286e3e
5. `Xoài Cát Hòa Lộc` - ID: 690e9d8c8000bb35cb286e3f
6. `Gạo ST25` - ID: 690e9d8c8000bb35cb286e40
7. `Chanh Dây` - ID: 690e9d8c8000bb35cb286e41

✅ Tất cả có `is_deleted: false`, `status: 'active'`

### Code Flow Analysis

**Clone Mutation Flow:**
```
User clicks "Sao Chép"
  ↓
handleClone(product)
  ↓
cloneMutation.mutate(product)
  ↓
mutationFn:
  1. cloneProduct(product) → data
  2. productRepository.create(cloneData)
  3. productRepository.update(original, { clone_count: +1 })
  ↓
onSuccess:
  1. invalidateQueries(['admin-panel-products'])
  2. invalidateQueries(['products-list'])
  3. addToast('Đã tạo bản sao...')
```

**Query Refetch:**
```
invalidateQueries(['admin-panel-products', false])
  ↓
useAdminProducts refetch:
  → productRepository.filter({ is_deleted: false }, ...)
  ↓
Should return ALL 6 products
```

### Vấn đề Phát Hiện

**❌ NGUYÊN NHÂN 1: React Query Cache Race Condition**
- `invalidateQueries()` là async
- `addToast()` chạy ngay (synchronous)
- UI có thể render TRƯỚC KHI refetch hoàn tất
- Trong khoảng thời gian này, cache cũ vẫn đang được dùng

**❌ NGUYÊN NHÂN 2: Query Key Mismatch**
```javascript
// Clone mutation invalidate:
invalidateQueries({ queryKey: ['admin-panel-products'] }) // ❌ Thiếu includeDeleted param

// Nhưng actual query key:
queryKey: ['admin-panel-products', includeDeleted] // ✅ Có 2 params

// → Invalidate KHÔNG MATCH đúng query đang active
```

**❌ NGUYÊN NHÂN 3: Stale Cache Still Active**
```javascript
staleTime: 5 * 60 * 1000 // 5 phút

// Sau invalidate, nếu trong vòng 5 phút
// Query KHÔNG refetch ngay mà dùng cache cũ
```

---

## Root Cause Summary

### Vấn đề Chính: Query Key Invalidation Không Chính Xác

```javascript
// useProductMutations.js - Line 81
const invalidateQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-panel-products'] }); // ❌ SAI
  //                                            ↑ Missing includeDeleted param
  queryClient.invalidateQueries({ queryKey: ['products-list'] });
};

// Actual query keys trong useAdminProducts:
queryKey: ['admin-panel-products', includeDeleted] // false hoặc true
//                                  ↑ Param bị miss

// → Invalidate fail → refetch không trigger → UI dùng cache cũ
```

---

## Solution Strategy

### Fix 1: Invalidate Đúng Query Key (RECOMMENDED)

```javascript
const invalidateQueries = () => {
  // Invalidate TẤT CẢ variants của query key
  queryClient.invalidateQueries({ 
    queryKey: ['admin-panel-products'],
    exact: false // Match tất cả ['admin-panel-products', *]
  });
  queryClient.invalidateQueries({ 
    queryKey: ['products-list'],
    exact: false
  });
};
```

### Fix 2: Force Refetch Ngay

```javascript
onSuccess: (newProduct) => {
  invalidateQueries();
  
  // Force refetch ngay thay vì dùng cache
  queryClient.refetchQueries({ 
    queryKey: ['admin-panel-products'],
    exact: false
  });
  
  addToast(`Đã tạo bản sao "${newProduct.name}"`, 'success');
};
```

### Fix 3: Optimistic Update (Advanced)

```javascript
cloneMutation = useMutation({
  mutationFn: async (product) => { /* ... */ },
  
  onMutate: async (product) => {
    // Optimistically add clone vào cache ngay
    await queryClient.cancelQueries({ queryKey: ['admin-panel-products'] });
    
    const previousProducts = queryClient.getQueryData(['admin-panel-products', false]);
    
    const newClone = {
      ...cloneProduct(product),
      id: `temp-${Date.now()}`,
      created_date: new Date().toISOString()
    };
    
    queryClient.setQueryData(['admin-panel-products', false], 
      [...(previousProducts || []), newClone]
    );
    
    return { previousProducts };
  },
  
  onError: (err, product, context) => {
    // Rollback nếu lỗi
    queryClient.setQueryData(['admin-panel-products', false], context.previousProducts);
  }
});
```

---

## Phased Fix Plan

### Phase 1: Immediate Fix (2 mins) - PRIORITY P0

**Task 1.1**: Fix invalidateQueries - exact: false
- Update `invalidateQueries()` với `exact: false`
- Match tất cả variants của query key
- Status: ⬜

**Task 1.2**: Test clone functionality
- Clone 1 product → verify tất cả products vẫn hiển thị
- Status: ⬜

### Phase 2: Improvement (Optional - 5 mins)

**Task 2.1**: Add refetchQueries sau invalidate
- Đảm bảo refetch ngay, không đợi user interaction
- Status: ⬜

**Task 2.2**: Consider optimistic update
- Nếu user experience cần cải thiện
- Status: ⬜

---

## Implementation Details

### Fix: useAdminProducts.js

```javascript
// BEFORE (BROKEN)
const invalidateQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-panel-products'] }); // ❌ Không match query có param
  queryClient.invalidateQueries({ queryKey: ['products-list'] });
};

// AFTER (FIXED)
const invalidateQueries = () => {
  queryClient.invalidateQueries({ 
    queryKey: ['admin-panel-products'],
    exact: false // ✅ Match ['admin-panel-products', false] VÀ ['admin-panel-products', true]
  });
  queryClient.invalidateQueries({ 
    queryKey: ['products-list'],
    exact: false
  });
};
```

**Giải thích:**
- `exact: false` → match tất cả query keys BẮT ĐẦU bằng `['admin-panel-products']`
- Bao gồm: `['admin-panel-products', false]`, `['admin-panel-products', true]`
- Đảm bảo refetch dù `includeDeleted` là true hay false

---

## Testing Checklist

- [ ] Admin products page load → hiển thị tất cả 6 products
- [ ] Clone 1 product → modal đóng, toast hiện
- [ ] **Sau clone: UI vẫn hiển thị TẤT CẢ products (6 + 1 = 7 total)**
- [ ] Clone lại → tổng 8 products hiển thị
- [ ] Filter by category → hoạt động
- [ ] Search → hoạt động
- [ ] Toggle "Hiện SP đã xóa" → không ảnh hưởng clone display

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Refetch slow trên network chậm | Medium | Thêm optimistic update (Phase 2) |
| Cache inconsistency | Low | exact: false đảm bảo invalidate toàn bộ |

---

## Success Criteria

- ✅ Clone product → TẤT CẢ products vẫn hiển thị (không mất)
- ✅ Refetch hoạt động đúng với tất cả query variants
- ✅ Toast notification rõ ràng
- ✅ UI responsive, không có delay

---

## Alternative Solutions (Considered)

### Option A: Remove includeDeleted từ query key
**Ưu điểm:**
- Đơn giản hơn, chỉ 1 cache entry

**Nhược điểm:**
- ❌ Mất tính năng cache riêng cho "show deleted" vs "hide deleted"
- ❌ Refetch không cần thiết khi toggle

**Verdict:** KHÔNG CHỌN - Keep current design tốt hơn

### Option B: Manual cache update
**Ưu điểm:**
- UI update ngay lập tức

**Nhược điểm:**
- ❌ Phức tạp, dễ bug
- ❌ Phải sync 2 query keys

**Verdict:** GIỮ LẠI cho Phase 2 (optimization)

---

## Changelog

### 2026-01-07 - Diagnosis Complete
- ✅ Identified root cause: query key mismatch khi invalidate
- ✅ Created fix plan: exact: false trong invalidateQueries
- ⬜ Implementation pending