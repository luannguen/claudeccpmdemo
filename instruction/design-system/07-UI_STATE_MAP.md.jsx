# UI State Map - Loading, Empty, Error, Success, Disabled

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Comprehensive UI state handling guide

---

## 1. State Machine Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         IDLE                                 │
│                           ↓                                  │
│                       LOADING                                │
│                     ↙    ↓    ↘                             │
│              SUCCESS   EMPTY   ERROR                         │
│                 ↓        ↓       ↓                           │
│              IDLE     IDLE   RETRY/IDLE                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Loading States

### 2.1. Full Page Loading
```jsx
import { LoadingState } from '@/components/shared/ui';

if (isLoading) return <LoadingState />;

// Hoặc custom
<div className="flex items-center justify-center min-h-screen">
  <Icon.Spinner size={40} className="text-violet-600" />
</div>
```

### 2.2. Component Loading (Skeleton)
```jsx
// Product card skeleton
<Card>
  <div className="w-full h-48 bg-gray-200 animate-pulse rounded-t-lg" />
  <CardContent className="space-y-3 p-4">
    <div className="h-4 bg-gray-200 animate-pulse rounded" />
    <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
    <div className="h-10 bg-gray-200 animate-pulse rounded" />
  </CardContent>
</Card>
```

### 2.3. Inline Loading (Buttons, Actions)
```jsx
// Button loading
<Button disabled={isLoading}>
  {isLoading && <Icon.Spinner size={16} className="mr-2" />}
  {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
</Button>

// Inline spinner
<div className="flex items-center gap-2 text-gray-500">
  <Icon.Spinner size={16} />
  <span>Đang tải...</span>
</div>
```

### 2.4. Progressive Loading
```jsx
// Load critical content first
<div>
  {/* Critical: Always show */}
  <ProductImage />
  <ProductTitle />
  <ProductPrice />
  
  {/* Non-critical: Lazy load */}
  <Suspense fallback={<SkeletonReviews />}>
    <ProductReviews />
  </Suspense>
</div>
```

---

## 3. Empty States

### 3.1. Empty List/Grid
```jsx
import { EmptyState } from '@/components/shared/ui';

<EmptyState
  icon={<Package className="w-16 h-16 text-gray-300" />}
  title="Chưa có sản phẩm"
  message="Thêm sản phẩm đầu tiên để bắt đầu bán hàng"
  action={<Button onClick={onCreate}>Tạo sản phẩm</Button>}
/>
```

### 3.2. Empty Search Results
```jsx
<EmptyState
  icon={<Search className="w-16 h-16 text-gray-300" />}
  title="Không tìm thấy kết quả"
  message={`Không tìm thấy "${searchQuery}". Thử từ khóa khác.`}
  action={
    <Button variant="outline" onClick={clearSearch}>
      Xóa tìm kiếm
    </Button>
  }
/>
```

### 3.3. Empty Cart
```jsx
<EmptyState
  icon={<ShoppingCart className="w-16 h-16 text-gray-300" />}
  title="Giỏ hàng trống"
  message="Chưa có sản phẩm nào trong giỏ hàng của bạn"
  action={
    <Link to="/products">
      <Button>Mua sắm ngay</Button>
    </Link>
  }
/>
```

### 3.4. Empty State Anatomy
**Cấu trúc bắt buộc:**
1. **Icon**: 64px, gray-300
2. **Title**: text-lg, font-medium, gray-900
3. **Message**: text-sm, gray-500
4. **Action**: Button (if có action)

---

## 4. Error States

### 4.1. Network Error
```jsx
import { ErrorState } from '@/components/shared/ui';

<ErrorState
  error={error}
  message="Không thể kết nối đến server"
  onRetry={refetch}
/>

// Custom
<div className="flex flex-col items-center justify-center py-12">
  <Icon.AlertCircle size={48} className="text-red-500 mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    Lỗi kết nối
  </h3>
  <p className="text-gray-500 mb-6">
    Không thể tải dữ liệu. Vui lòng thử lại.
  </p>
  <Button onClick={retry}>
    <Icon.RefreshCw size={16} className="mr-2" /> Thử lại
  </Button>
</div>
```

### 4.2. Validation Error (Form)
```jsx
<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={errors.email ? 'border-red-500' : ''}
  />
  {errors.email && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <Icon.AlertCircle size={14} />
      {errors.email}
    </p>
  )}
</div>
```

### 4.3. Permission Error (403)
```jsx
<div className="flex flex-col items-center justify-center min-h-screen">
  <Icon.Ban size={64} className="text-red-500 mb-4" />
  <h2 className="text-2xl font-bold mb-2">Không có quyền truy cập</h2>
  <p className="text-gray-500 mb-6">
    Bạn không có quyền xem trang này.
  </p>
  <Button onClick={() => navigate('/')}>
    Về trang chủ
  </Button>
</div>
```

### 4.4. Not Found (404)
```jsx
<div className="flex flex-col items-center justify-center min-h-screen">
  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
  <h2 className="text-2xl font-bold mb-2">Không tìm thấy trang</h2>
  <p className="text-gray-500 mb-6">
    Trang bạn tìm kiếm không tồn tại.
  </p>
  <Button onClick={() => navigate('/')}>
    Về trang chủ
  </Button>
</div>
```

---

## 5. Success States

### 5.1. Success Toast
```jsx
addToast('Đã tạo sản phẩm thành công', 'success');
```

### 5.2. Success Page (Checkout)
```jsx
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
    <Icon.CheckCircle size={32} className="text-green-600" />
  </div>
  <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
  <p className="text-gray-500 mb-2">Mã đơn hàng: #{orderNumber}</p>
  <p className="text-sm text-gray-500 mb-6">
    Chúng tôi sẽ liên hệ xác nhận trong 24h
  </p>
  <div className="flex gap-3">
    <Button variant="outline" onClick={() => navigate('/my-orders')}>
      Xem đơn hàng
    </Button>
    <Button onClick={() => navigate('/')}>
      Tiếp tục mua sắm
    </Button>
  </div>
</div>
```

### 5.3. Inline Success
```jsx
// After save
<div className="flex items-center gap-2 text-green-600">
  <Icon.CheckCircle size={16} />
  <span className="text-sm">Đã lưu tự động</span>
</div>
```

---

## 6. Disabled States

### 6.1. Button Disabled
```jsx
<Button 
  disabled={!canSubmit}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  Submit
</Button>
```

### 6.2. Input Disabled
```jsx
<Input
  disabled
  value={value}
  className="bg-gray-50 text-gray-500 cursor-not-allowed"
/>
```

### 6.3. Card Disabled (Out of Stock)
```jsx
<Card className="relative opacity-60">
  <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center rounded-lg">
    <Badge className="bg-gray-700 text-white">Hết hàng</Badge>
  </div>
  {/* Card content */}
</Card>
```

---

## 7. Pending States

### 7.1. Pending Approval
```jsx
<Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
  <Icon.Clock size={14} />
  Chờ duyệt
</Badge>
```

### 7.2. Processing State
```jsx
<div className="flex items-center gap-2 text-blue-600">
  <Icon.Spinner size={16} />
  <span className="text-sm">Đang xử lý đơn hàng...</span>
</div>
```

---

## 8. Transition States

### 8.1. Optimistic Update
```jsx
// Immediately update UI, rollback if fails
const handleLike = async () => {
  setLiked(true); // Optimistic
  try {
    await api.likePost(postId);
  } catch (error) {
    setLiked(false); // Rollback
    addToast('Không thể like', 'error');
  }
};
```

### 8.2. Fade In Animation
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

---

## 9. Multi-State Component Example

```jsx
function ProductList() {
  const { products, isLoading, error, refetch } = useProducts();

  // LOADING
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <SkeletonProductCard key={i} />)}
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <ErrorState
        error={error}
        message="Không thể tải sản phẩm"
        onRetry={refetch}
      />
    );
  }

  // EMPTY
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-16 h-16 text-gray-300" />}
        title="Chưa có sản phẩm"
        message="Thêm sản phẩm để bắt đầu"
        action={<Button onClick={onCreate}>Tạo sản phẩm</Button>}
      />
    );
  }

  // SUCCESS (has data)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## State Handling Checklist

```
□ Loading state có skeleton hoặc spinner?
□ Empty state có icon + message + CTA?
□ Error state có retry option?
□ Success state có confirmation?
□ Disabled state có visual feedback?
□ Optimistic updates có rollback?
□ Transitions smooth (300ms)?
□ Multi-state logic rõ ràng?
```

---

> **Ghi nhớ**: Loading→Success/Empty/Error, skeleton cho lists, empty có icon+message+CTA, error có retry, disabled opacity-50, success có confirmation, optimistic update có rollback.