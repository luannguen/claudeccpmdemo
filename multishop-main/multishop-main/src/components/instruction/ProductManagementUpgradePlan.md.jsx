# Product Management Upgrade Plan
## Soft Delete, Clone & Versioning Features

> **Version**: 1.0.0  
> **Created**: 2026-01-07  
> **Status**: 🔄 In Progress

---

## 📋 Executive Summary

### Mục Tiêu
Nâng cấp hệ thống quản lý sản phẩm với 3 tính năng quan trọng:
1. **Soft Delete** (Inactive/Archive) - Ẩn sản phẩm thay vì xóa vĩnh viễn
2. **Product Clone** - Tạo bản sao sản phẩm nhanh chóng
3. **Product Versioning** - Quản lý phiên bản sản phẩm theo timeline

### Vấn Đề Hiện Tại
- ❌ Xóa cứng (hard delete) → mất dữ liệu vĩnh viễn, không khôi phục
- ❌ Không thể tạm ẩn sản phẩm (seasonal products, out of stock tạm thời)
- ❌ Tạo sản phẩm tương tự phải nhập lại toàn bộ → mất thời gian
- ❌ Không theo dõi được lịch sử thay đổi sản phẩm (giá, mô tả, spec)
- ❌ Không thể rollback về version cũ khi cần

### Giải Pháp (Best Practices 2026)
✅ **Soft Delete Pattern** với `is_deleted` + `deleted_at` + `deleted_by`  
✅ **Clone Pattern** với metadata gốc, prefix "[Copy]"  
✅ **Versioning Pattern** với snapshot-based versioning (không dùng diff)  
✅ **Filter defaults** - Client chỉ load `is_deleted=false` và `status=active`  
✅ **Admin controls** - Toggle show/hide deleted, restore, permanent delete  

### Lợi Ích
- 🛡️ Bảo toàn dữ liệu - có thể khôi phục
- ⚡ Tạo sản phẩm nhanh - clone thay vì nhập lại
- 📊 Audit trail - biết ai sửa gì, khi nào
- 🔄 Rollback - khôi phục version cũ khi cần
- 📈 Analytics - phân tích xu hướng thay đổi giá, spec

---

## 🏗️ Target Architecture

### 1. Entity Schema Updates

#### Product Entity (Soft Delete)
```javascript
{
  // ... existing fields
  
  // Soft Delete
  "is_deleted": {
    "type": "boolean",
    "default": false,
    "description": "Đánh dấu đã xóa (soft delete)"
  },
  "deleted_at": {
    "type": "string",
    "format": "date-time",
    "description": "Thời điểm xóa"
  },
  "deleted_by": {
    "type": "string",
    "description": "Email admin đã xóa"
  },
  
  // Clone Metadata
  "cloned_from_id": {
    "type": "string",
    "description": "ID sản phẩm gốc (nếu là clone)"
  },
  "clone_count": {
    "type": "number",
    "default": 0,
    "description": "Số lần được clone"
  },
  
  // Versioning
  "current_version": {
    "type": "number",
    "default": 1,
    "description": "Version hiện tại"
  },
  "last_modified_by": {
    "type": "string",
    "description": "Email admin sửa cuối"
  }
}
```

#### ProductVersion Entity (NEW)
```javascript
{
  "name": "ProductVersion",
  "type": "object",
  "properties": {
    "product_id": {
      "type": "string",
      "description": "ID sản phẩm gốc"
    },
    "version_number": {
      "type": "number",
      "description": "Số version (1, 2, 3...)"
    },
    "snapshot": {
      "type": "object",
      "description": "Snapshot toàn bộ dữ liệu sản phẩm tại thời điểm này"
    },
    "change_summary": {
      "type": "string",
      "description": "Tóm tắt thay đổi"
    },
    "changed_fields": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Danh sách field đã thay đổi"
    },
    "changed_by": {
      "type": "string",
      "description": "Email admin thực hiện"
    }
  },
  "required": ["product_id", "version_number", "snapshot"]
}
```

### 2. Module Structure (KHÔNG tạo module mới - extend existing)

```
components/
├── data/
│   └── repositories/
│       ├── productRepository.js (✅ ĐÃ CÓ - extend)
│       └── productVersionRepository.js (🆕 NEW)
│
├── hooks/
│   ├── useAdminProducts.js (✅ ĐÃ CÓ - extend)
│   └── useProductVersions.js (🆕 NEW)
│
├── admin/
│   ├── ProductFormModal.jsx (✅ ĐÃ CÓ - extend)
│   └── products/
│       ├── ProductsHeader.jsx (✅ ĐÃ CÓ - extend với filter deleted)
│       ├── ProductCloneButton.jsx (🆕 NEW)
│       ├── ProductVersionHistory.jsx (🆕 NEW)
│       └── ProductRestoreModal.jsx (🆕 NEW)
│
└── shared/
    └── utils/
        └── productHelpers.js (🆕 NEW - clone logic, diff detection)
```

---

## 📝 Phased Implementation Plan

### Phase 1: Soft Delete (Priority: P0) - 60 mins
**Mục tiêu**: Ẩn sản phẩm thay vì xóa cứng

**Tasks**:
- ✅ Update Product entity schema (is_deleted, deleted_at, deleted_by)
- ✅ Modify productRepository.list() - filter `is_deleted=false` by default
- ✅ Add toggleDelete mutation (soft delete/restore)
- ✅ Update ProductFormModal - add "Trạng thái" dropdown (active, inactive, out_of_stock)
- ✅ Update ProductsHeader - add "Hiện sản phẩm đã xóa" toggle
- ✅ Update delete handler - confirm + soft delete
- ✅ Add restore action trong table/grid/list views

**Acceptance Criteria**:
- [ ] Client không load products với `is_deleted=true`
- [ ] Admin có thể toggle hiện/ẩn deleted products
- [ ] Soft delete có confirm dialog
- [ ] Restore có confirm + toast
- [ ] Deleted products có visual indicator (opacity, badge)

---

### Phase 2: Product Clone (Priority: P0) - 45 mins
**Mục tiêu**: Clone sản phẩm nhanh với 1 click

**Tasks**:
- ✅ Add cloneProduct mutation
- ✅ Create ProductCloneButton component
- ✅ Update clone logic:
  - Copy all fields except (id, created_date, updated_date)
  - Prefix name với "[Copy]"
  - Set `cloned_from_id`, increment `clone_count` của product gốc
  - Auto-generate new SKU (append `-C1`, `-C2`...)
- ✅ Add clone action trong table/grid/list views
- ✅ Toast notification "Đã tạo bản sao {name}"

**Acceptance Criteria**:
- [ ] Clone button visible trong product cards/rows
- [ ] Cloned product có tên "[Copy] Original Name"
- [ ] SKU auto-increment unique
- [ ] Gallery, video clone chính xác
- [ ] Toast hiển thị tên product cloned

---

### Phase 3: Product Versioning (Priority: P1) - 90 mins
**Mục tiêu**: Track lịch sử thay đổi sản phẩm

**Tasks**:
- ✅ Create ProductVersion entity
- ✅ Create productVersionRepository
- ✅ Auto-save version khi update product (hook vào updateMutation)
- ✅ Detect changed fields (compare old vs new)
- ✅ Create ProductVersionHistory component
  - Timeline view
  - Diff viewer
  - Restore to version button
- ✅ Add "Lịch Sử" tab trong ProductFormModal hoặc detail view
- ✅ Implement restore to version logic

**Acceptance Criteria**:
- [ ] Mỗi update tạo 1 version snapshot
- [ ] Version history hiển thị timeline rõ ràng
- [ ] Diff viewer highlight changed fields
- [ ] Restore version có confirm
- [ ] Restored version tạo version mới (không overwrite)

---

## 🗂️ File Breakdown

### Files Cần Sửa (Extend)
| File | Changes | Lines Estimate |
|------|---------|----------------|
| `entities/Product.json` | Add soft delete, clone, version fields | +40 lines |
| `hooks/useAdminProducts.js` | Add filter deleted, clone, restore mutations | +60 lines |
| `components/admin/ProductFormModal.jsx` | Add status dropdown, version history tab | +30 lines |
| `admin/products/ProductsHeader.jsx` | Add "Show Deleted" toggle | +20 lines |
| `admin/products/ProductTableView.jsx` | Add clone, restore actions | +30 lines |

### Files Mới Tạo
| File | Purpose | Lines Estimate |
|------|---------|----------------|
| `entities/ProductVersion.json` | Version snapshot entity | ~60 lines |
| `data/repositories/productVersionRepository.js` | Version CRUD | ~120 lines |
| `hooks/useProductVersions.js` | Version hooks | ~100 lines |
| `admin/products/ProductCloneButton.jsx` | Clone button component | ~40 lines |
| `admin/products/ProductVersionHistory.jsx` | Version timeline UI | ~180 lines |
| `admin/products/ProductRestoreModal.jsx` | Restore confirm modal | ~80 lines |
| `shared/utils/productHelpers.js` | Clone logic, diff detection | ~100 lines |

**Total**: 7 files mới, 5 files sửa

---

## 📊 Progress Tracking

### Phase 1: Soft Delete (60 mins)
| Task | Status | Owner | Time |
|------|--------|-------|------|
| Update Product schema | ⬜ | AI | 5 min |
| Modify productRepository filter | ⬜ | AI | 10 min |
| Add soft delete mutation | ⬜ | AI | 15 min |
| Update ProductFormModal | ⬜ | AI | 10 min |
| Update ProductsHeader toggle | ⬜ | AI | 10 min |
| Update delete handler | ⬜ | AI | 5 min |
| Add restore UI | ⬜ | AI | 5 min |

### Phase 2: Product Clone (45 mins)
| Task | Status | Owner | Time |
|------|--------|-------|------|
| Add clone mutation | ⬜ | AI | 15 min |
| Create ProductCloneButton | ⬜ | AI | 10 min |
| Implement clone logic | ⬜ | AI | 15 min |
| Add clone actions to views | ⬜ | AI | 5 min |

### Phase 3: Versioning (90 mins)
| Task | Status | Owner | Time |
|------|--------|-------|------|
| Create ProductVersion entity | ⬜ | AI | 5 min |
| Create productVersionRepository | ⬜ | AI | 20 min |
| Auto-save version hook | ⬜ | AI | 20 min |
| Create ProductVersionHistory UI | ⬜ | AI | 30 min |
| Implement restore version | ⬜ | AI | 15 min |

---

## ⚠️ Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Query performance khi filter deleted | Medium | Medium | Add index trên `is_deleted`, cache products |
| Version entity lớn nhanh | High | High | Limit 50 versions/product, auto-prune old versions |
| Clone tạo duplicate SKU | Medium | Low | Auto-append suffix unique |
| Restore version conflict | Low | Low | Create new version thay vì overwrite |

---

## ✅ Success Criteria

### Soft Delete
- [ ] Client không thấy products với `is_deleted=true`
- [ ] Admin có toggle filter deleted
- [ ] Restore thành công, product trở về active
- [ ] Performance không giảm (query < 500ms)

### Clone
- [ ] Clone < 2s response time
- [ ] Tất cả fields clone chính xác
- [ ] SKU không duplicate
- [ ] Toast message rõ ràng

### Versioning
- [ ] Mỗi update tạo version
- [ ] Version history load < 1s
- [ ] Diff viewer highlight chính xác
- [ ] Restore không mất data

---

## 🔄 Implementation Best Practices (Modern 2026)

### 1. Soft Delete Pattern
**Approach**: Flag-based với metadata đầy đủ

```javascript
// ✅ BEST: Comprehensive soft delete
{
  is_deleted: false,
  deleted_at: null,
  deleted_by: null,
  deletion_reason: null // Optional: lý do xóa
}

// ❌ AVOID: Simple flag only
{ is_deleted: false } // Thiếu metadata
```

**Filter Pattern**:
```javascript
// Client - chỉ load active
list({ is_deleted: false, status: 'active' })

// Admin - có option load deleted
list(showDeleted ? {} : { is_deleted: false })
```

### 2. Clone Pattern
**Approach**: Smart clone với auto-incrementing

```javascript
// ✅ BEST: Clone với metadata tracking
const cloneProduct = (original) => ({
  ...original,
  id: undefined, // Let DB generate
  name: `[Copy] ${original.name}`,
  sku: `${original.sku}-C${original.clone_count + 1}`,
  slug: `${original.slug}-copy-${Date.now()}`,
  cloned_from_id: original.id,
  created_date: new Date(),
  total_sold: 0, // Reset stats
  rating_average: original.rating_average, // Keep rating
  rating_count: 0 // But reset count
});

// Update original
update(original.id, { 
  clone_count: original.clone_count + 1 
});
```

### 3. Versioning Pattern
**Approach**: Full snapshot (không dùng delta/diff)

**Lý do chọn snapshot thay vì diff**:
- ✅ Đơn giản - không cần rebuild từ diff chain
- ✅ Reliable - 1 version = 1 state hoàn chỉnh
- ✅ Fast read - không cần merge diffs
- ❌ Storage nhiều hơn - nhưng acceptable với limit 50 versions

```javascript
// ✅ BEST: Full snapshot
const saveVersion = (product) => ({
  product_id: product.id,
  version_number: product.current_version,
  snapshot: { ...product }, // Full snapshot
  changed_fields: detectChangedFields(oldProduct, newProduct),
  change_summary: generateSummary(changedFields),
  changed_by: currentUser.email
});

// ❌ AVOID: Delta/Diff pattern
{
  version: 2,
  diff: { price: { old: 100, new: 120 } } // Phức tạp khi restore
}
```

**Version Pruning Strategy**:
```javascript
// Auto-delete versions > 50
if (versionCount > 50) {
  deleteOldestVersions(productId, versionCount - 50);
}
```

### 4. UI/UX Best Practices

**Soft Delete Indicator**:
```javascript
// Visual cues
{product.is_deleted && (
  <div className="opacity-50 relative">
    <Badge variant="destructive">Đã Xóa</Badge>
    {/* Product card */}
  </div>
)}
```

**Clone Confirmation**:
```javascript
// Immediate clone (no confirm needed - undo-able)
handleClone → Clone → Toast "Đã tạo bản sao" + Undo button
```

**Version Timeline**:
```javascript
// Timeline vertical với diff highlights
<VersionTimeline>
  {versions.map(v => (
    <VersionItem>
      <Time>{v.created_date}</Time>
      <ChangedFields>{v.changed_fields.join(', ')}</ChangedFields>
      <RestoreButton />
    </VersionItem>
  ))}
</VersionTimeline>
```

---

## 🔧 Technical Decisions

### Decision 1: Soft Delete vs Archive Table
**Chosen**: Soft delete flag trong cùng table  
**Lý do**:
- Đơn giản hơn (1 entity thay vì 2)
- Query dễ hơn (filter by flag)
- Restore nhanh hơn (update flag vs move rows)

### Decision 2: Clone Strategy
**Chosen**: Full copy + auto-incrementing SKU  
**Lý do**:
- Tránh conflict SKU
- Traceable (biết clone từ đâu)
- Flexible (clone có thể edit độc lập)

### Decision 3: Versioning Strategy
**Chosen**: Snapshot-based (không dùng diff)  
**Lý do**:
- Simple to implement
- Reliable restore
- Easy to query specific version
- Trade-off storage for simplicity (acceptable)

### Decision 4: Version Limit
**Chosen**: 50 versions/product  
**Lý do**:
- Balance storage vs history
- Auto-prune old versions
- Keep recent history

---

## 🔀 Migration Strategy

### Existing Products
```javascript
// Tất cả products hiện tại:
{
  is_deleted: false,
  deleted_at: null,
  deleted_by: null,
  cloned_from_id: null,
  clone_count: 0,
  current_version: 1
}
```

**Migration Steps**:
1. Update schema → auto-populate defaults
2. Không cần migrate data (defaults đủ)
3. Create version 1 cho all existing products (optional)

---

## 📦 API Changes

### New Mutations
```javascript
// Soft Delete
productRepository.softDelete(id, { 
  deleted_by: user.email 
})

// Restore
productRepository.restore(id)

// Clone
productRepository.clone(id) → { success, data: newProduct }

// Versioning
productVersionRepository.save(productId, snapshot, changedFields)
productVersionRepository.list(productId) → versions[]
productVersionRepository.restore(versionId) → updated product
```

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Clone time | < 2s | Time to create clone |
| Version save time | < 1s | Auto-save on update |
| Version history load | < 1s | Load 50 versions |
| Restore success rate | > 99% | No data loss |
| User adoption (clone) | > 30% products | Clone usage rate |

---

## 📅 Changelog

### 2026-01-07 - Plan Created
- ✅ Analyzed requirements
- ✅ Researched best practices (Shopify, WooCommerce patterns)
- ✅ Designed architecture
- ✅ Created phased plan
- ⬜ Implementation pending

---

## 🚀 Implementation Notes

### Priority Order
1. **Phase 1** (Soft Delete) - Immediate business value
2. **Phase 2** (Clone) - High productivity gain
3. **Phase 3** (Versioning) - Long-term data governance

### Quick Wins
- Soft delete + Clone có thể ship trong 1 session
- Versioning có thể ship sau (không blocking)

### Testing Focus
- [ ] Soft delete → restore workflow
- [ ] Clone → edit độc lập không ảnh hưởng gốc
- [ ] Version → restore → verify data integrity

---

> **Next Steps**: Implement Phase 1 (Soft Delete) first, then Phase 2 (Clone), finally Phase 3 (Versioning)