# UX Flows - User Journey Diagrams

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Common user flows: Browse, Search, Cart, Checkout, Profile

---

## 1. Browse → Add to Cart Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER LANDS → Product Grid                                │
├─────────────────────────────────────────────────────────────┤
│ 2. BROWSE → Scroll, filter by category                      │
├─────────────────────────────────────────────────────────────┤
│ 3. CLICK PRODUCT → Quick View Modal opens                   │
│    - Product image gallery                                   │
│    - Title, price, rating                                    │
│    - Quantity selector                                       │
│    - Add to cart button (primary CTA)                        │
├─────────────────────────────────────────────────────────────┤
│ 4. SELECT QUANTITY → Update price preview                   │
├─────────────────────────────────────────────────────────────┤
│ 5. CLICK "Thêm vào giỏ"                                     │
│    → Loading indicator (button disabled)                    │
│    → Success: Toast "Đã thêm [Tên SP] vào giỏ"            │
│    → Cart badge updates (+1)                                 │
│    → Modal stays open (user có thể add more)                │
├─────────────────────────────────────────────────────────────┤
│ 6. USER CAN:                                                 │
│    - Continue browsing (close modal)                         │
│    - Go to cart (CTA in toast or nav)                        │
│    - Add more quantity                                       │
└─────────────────────────────────────────────────────────────┘
```

### Error Handling
- **Out of stock**: Disable button, show message
- **Network error**: Toast error, retry button
- **Already in cart**: Update quantity, toast "Đã tăng số lượng"

---

## 2. Search → Filter Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ENTERS SEARCH                                        │
│    Input: "rau cải"                                          │
├─────────────────────────────────────────────────────────────┤
│ 2. DEBOUNCE 300ms                                            │
│    → Không gọi API mỗi keystroke                            │
├─────────────────────────────────────────────────────────────┤
│ 3. SEARCH API CALLED                                         │
│    → Loading spinner in search bar                           │
├─────────────────────────────────────────────────────────────┤
│ 4. RESULTS DISPLAYED                                         │
│    - Result count: "Tìm thấy 24 sản phẩm"                  │
│    - Filter options appear (category, price range, rating)   │
│    - Product grid with results                               │
├─────────────────────────────────────────────────────────────┤
│ 5. USER APPLIES FILTERS                                      │
│    - Category: "Rau củ"                                     │
│    - Price: 10k-50k                                          │
│    - Rating: 4+ stars                                        │
│    → Results update (client-side filter hoặc re-fetch)      │
├─────────────────────────────────────────────────────────────┤
│ 6. REFINED RESULTS                                           │
│    - "8 sản phẩm phù hợp"                                   │
│    - Active filters shown as badges                          │
│    - Clear all filters option                                │
└─────────────────────────────────────────────────────────────┘
```

### Empty Results
```jsx
if (results.length === 0) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16 text-gray-300" />}
      title="Không tìm thấy sản phẩm"
      message="Thử thay đổi từ khóa hoặc bộ lọc"
      action={<Button onClick={clearFilters}>Xóa bộ lọc</Button>}
    />
  );
}
```

---

## 3. Checkout Flow (5 Steps)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CART REVIEW                                          │
│ - List items trong giỏ                                       │
│ - Quantity adjustment (+ / -)                                │
│ - Remove item option                                         │
│ - Subtotal preview                                           │
│ - CTA: "Tiến hành thanh toán" (disabled if cart empty)      │
├─────────────────────────────────────────────────────────────┤
│ STEP 2: CUSTOMER INFO                                        │
│ - Full name *                                                │
│ - Email *                                                    │
│ - Phone *                                                    │
│ - (Auto-fill if logged in)                                   │
│ - Validation inline                                          │
│ - CTA: "Tiếp tục"                                           │
├─────────────────────────────────────────────────────────────┤
│ STEP 3: SHIPPING ADDRESS                                     │
│ - Address *                                                  │
│ - City/District/Ward dropdown *                              │
│ - Note (optional)                                            │
│ - Delivery date/time picker                                  │
│ - Shipping fee calculation (auto)                            │
│ - CTA: "Tiếp tục"                                           │
├─────────────────────────────────────────────────────────────┤
│ STEP 4: PAYMENT METHOD                                       │
│ - COD (default)                                              │
│ - Bank Transfer                                              │
│ - MoMo / VNPay                                               │
│ - Order summary (final)                                      │
│ - Total amount (prominent)                                   │
│ - CTA: "Đặt hàng" (large, prominent)                        │
├─────────────────────────────────────────────────────────────┤
│ STEP 5: CONFIRMATION                                         │
│ - Success icon + message                                     │
│ - Order number                                               │
│ - Estimated delivery                                         │
│ - Payment instructions (if bank transfer)                    │
│ - CTAs: "Xem đơn hàng" / "Tiếp tục mua sắm"                │
└─────────────────────────────────────────────────────────────┘
```

### Progress Indicator
```jsx
<div className="flex items-center justify-between mb-8">
  {steps.map((step, idx) => (
    <div key={idx} className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        idx < currentStep ? 'bg-green-500 text-white' :
        idx === currentStep ? 'bg-violet-600 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {idx < currentStep ? <Check /> : idx + 1}
      </div>
      <span className={`text-sm ${idx === currentStep ? 'font-medium' : ''}`}>
        {step}
      </span>
      {idx < steps.length - 1 && (
        <div className="w-12 h-0.5 bg-gray-200 mx-2" />
      )}
    </div>
  ))}
</div>
```

---

## 4. Authentication Flow

### 4.1. Login
```
User enters email + password
  → Validation (frontend)
  → Submit API
  → Loading state
  → Success: Redirect to dashboard / previous page
  → Error: Show error message inline
```

### 4.2. Register
```
User fills form (name, email, phone, password)
  → Validation inline (as user types)
  → Terms checkbox required
  → Submit
  → Success: Auto-login + redirect
  → Error: Show specific field errors
```

---

## 5. Profile Edit Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VIEW PROFILE                                              │
│    - Display current info (read-only)                        │
│    - "Chỉnh sửa" button                                     │
├─────────────────────────────────────────────────────────────┤
│ 2. CLICK "Chỉnh sửa"                                        │
│    → Form fields become editable                             │
│    → Actions: "Lưu" / "Hủy" appear                         │
├─────────────────────────────────────────────────────────────┤
│ 3. EDIT FIELDS                                               │
│    - Validation real-time (onBlur)                           │
│    - Unsaved changes warning if navigate away               │
├─────────────────────────────────────────────────────────────┤
│ 4. CLICK "Lưu"                                              │
│    → Loading state                                           │
│    → Success: Toast + return to view mode                   │
│    → Error: Show error, stay in edit mode                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Error Recovery Flows

### 6.1. Network Error
```
Action fails (network timeout)
  → Error toast: "Không thể kết nối. Vui lòng thử lại."
  → Retry button in error state
  → Retry count: max 3 times
  → After 3 fails: "Vui lòng kiểm tra kết nối"
```

### 6.2. Validation Error
```
Form submit with invalid data
  → Highlight error fields (red border)
  → Scroll to first error
  → Show inline error messages
  → Focus first error field
  → User fixes → inline validation clears
```

### 6.3. Permission Error (403)
```
User không có quyền
  → Redirect to error page
  → Message: "Bạn không có quyền truy cập"
  → CTA: "Về trang chủ" / "Liên hệ admin"
```

---

## 7. Notification Flow

### 7.1. Real-time Notification
```
Event happens (new order, message)
  → Backend pushes notification
  → Bell icon badge updates (+1)
  → Optional: Browser notification (if permission granted)
  → User clicks bell
    → Dropdown opens
    → Show list of unread (max 5)
    → "Xem tất cả" link
  → User clicks notification
    → Navigate to detail page
    → Mark as read
```

---

## 8. File Upload Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLICK UPLOAD AREA                                         │
│    → File picker opens                                       │
├─────────────────────────────────────────────────────────────┤
│ 2. SELECT FILE                                               │
│    → Validate: file type, size                              │
│    → Show error if invalid                                   │
├─────────────────────────────────────────────────────────────┤
│ 3. UPLOAD STARTS                                             │
│    → Progress bar (0-100%)                                   │
│    → Cancel button                                           │
├─────────────────────────────────────────────────────────────┤
│ 4. UPLOAD COMPLETE                                           │
│    → Success icon + preview                                  │
│    → Replace/Remove options                                  │
│    → Error: Show error message, retry option                │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow Design Principles

1. **Clear next steps**: User luôn biết phải làm gì tiếp theo
2. **Progress indication**: Hiện progress khi multi-step
3. **Error recovery**: Luôn có cách retry hoặc undo
4. **Success confirmation**: Feedback rõ ràng khi action thành công
5. **Cancel option**: Luôn cho phép user cancel/back

---

> **Ghi nhớ**: Browse có quick view, search có debounce, checkout 5 steps với progress, error có retry, notification real-time với badge, file upload có progress bar.