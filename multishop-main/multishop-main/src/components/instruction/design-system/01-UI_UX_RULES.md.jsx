# UI/UX Design Rules - Complete Ruleset

> **Version**: 2.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Quy tắc thiết kế UI/UX toàn diện cho hệ thống

---

## 1. Mobile-First Principles

### 1.1. Design for Mobile First
- **Luôn thiết kế cho mobile trước**, sau đó scale up cho tablet/desktop
- Breakpoints: Mobile (0-768px) → Tablet (768-1024px) → Desktop (1024px+)
- Touch targets tối thiểu: **44x44px** (Apple HIG standard)

### 1.2. Touch-Friendly Interactions
- Spacing giữa các interactive elements: tối thiểu **8px**
- Primary actions nằm trong tầm tay cái (bottom 1/3 của screen)
- Swipe gestures: left/right cho navigation, down cho refresh

### 1.3. Responsive Layout
```jsx
// ✅ ĐÚNG - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ SAI - Desktop first
<div className="grid-cols-3 md:grid-cols-1">
```

---

## 2. Typography System

### 2.1. Font Families
- **Headings**: Inter Bold (600-800)
- **Body**: Inter Regular (400)
- **Small text**: Inter Regular (400)
- **Monospace**: JetBrains Mono (code, technical data)

### 2.2. Type Scale
| Element | Size | Line Height | Weight |
|---------|------|-------------|--------|
| H1 | 32px (2xl) | 1.2 | 700 |
| H2 | 24px (xl) | 1.3 | 600 |
| H3 | 20px (lg) | 1.4 | 600 |
| Body | 16px (base) | 1.6 | 400 |
| Small | 14px (sm) | 1.5 | 400 |
| Tiny | 12px (xs) | 1.4 | 400 |

### 2.3. Typography Rules
- Body text: **16px minimum** (dễ đọc trên mobile)
- Line length: **50-75 characters** (optimal readability)
- Line height: **1.5-1.6** cho body text
- Letter spacing: default (không cần adjust)

---

## 3. Spacing System

### 3.1. Base Unit: 4px
Mọi spacing phải là bội số của **4px**:

```
4px  (space-1)
8px  (space-2)  → Tight spacing
12px (space-3)  → Compact
16px (space-4)  → Default gap
24px (space-6)  → Medium gap
32px (space-8)  → Large gap
48px (space-12) → Section spacing
64px (space-16) → Major sections
```

### 3.2. Component Internal Spacing
- **Padding**: 12-16px (compact), 16-24px (comfortable)
- **Gap**: 16px default, 12px compact, 24px spacious
- **Margin**: 0 (prefer gap/padding trong parent)

### 3.3. Layout Spacing
```jsx
// ✅ Card spacing
<Card className="p-6">        // Internal padding: 24px
  <div className="space-y-4"> // Vertical gap: 16px
    {content}
  </div>
</Card>

// ✅ Grid gap
<div className="grid grid-cols-2 gap-4"> // 16px gap
```

---

## 4. Color System

### 4.1. Primary Colors
```css
--violet-50:  #F5F3FF;
--violet-100: #EDE9FE;
--violet-600: #7C3AED; /* Primary */
--violet-700: #6D28D9; /* Primary hover */
--violet-900: #4C1D95; /* Primary dark */
```

### 4.2. Semantic Colors
| Purpose | Color | Usage |
|---------|-------|-------|
| Success | Green-500 (#10B981) | Order success, approved |
| Error | Red-500 (#EF4444) | Validation errors, failed |
| Warning | Amber-500 (#F59E0B) | Warnings, pending review |
| Info | Blue-500 (#3B82F6) | Informational messages |

### 4.3. Neutral Colors
```css
--gray-50:  #F9FAFB; /* Background */
--gray-100: #F3F4F6; /* Surface */
--gray-200: #E5E7EB; /* Border */
--gray-500: #6B7280; /* Text secondary */
--gray-900: #111827; /* Text primary */
```

### 4.4. Color Usage Rules
- **Text on white**: Gray-900 (primary), Gray-500 (secondary)
- **Interactive elements**: Violet-600, hover: Violet-700
- **Backgrounds**: White, Gray-50, gradient (subtle)
- **Borders**: Gray-200 default, color-300 for emphasis

---

## 5. Product Card Anatomy (BẮT BUỘC)

**5 thành phần bắt buộc:**

```jsx
<Card className="product-card">
  {/* 1. IMAGE - Square ratio, lazy load */}
  <img src={image} alt={title} className="aspect-square" loading="lazy" />
  
  {/* 2. TITLE - Max 2 lines, truncate */}
  <h3 className="line-clamp-2 font-medium">{title}</h3>
  
  {/* 3. PRICE - Bold, prominent */}
  <p className="text-xl font-bold text-gray-900">{price}</p>
  
  {/* 4. RATING - Stars + count */}
  <div className="flex items-center gap-1">
    <Stars rating={rating} />
    <span className="text-sm text-gray-500">({reviewCount})</span>
  </div>
  
  {/* 5. CTA - Add to cart */}
  <Button>Thêm vào giỏ</Button>
</Card>
```

**CẤM:**
- ❌ Thiếu bất kỳ element nào trong 5 thành phần
- ❌ Price không nổi bật
- ❌ CTA không rõ ràng

---

## 6. Grid & Layout Rules

### 6.1. Grid Configuration
```jsx
// ✅ Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### 6.2. Grid vs List
- **Grid**: Browsing, visual products, homepage
- **List**: Comparison, admin tables, search results
- **Toggle**: Cho phép user chọn view mode

### 6.3. Empty Columns
- ❌ KHÔNG để ô trống trong grid (dùng auto-fill hoặc hide incomplete rows)

---

## 7. Modal & Dialog Rules

### 7.1. Modal Types
| Type | Use Case | Props |
|------|----------|-------|
| Form | Create/Edit | Compact, không drag |
| Detail | View full info | Drag + resize |
| Alert | Confirm/Warning | Minimal, centered |
| Dashboard | Widget | Persist position |

### 7.2. Modal Best Practices
```jsx
// ✅ ĐÚNG - Dùng EnhancedModal hoặc BaseModal
import EnhancedModal from '@/components/EnhancedModal';

<EnhancedModal
  isOpen={isOpen}
  onClose={onClose}
  title="Chi tiết"
  maxWidth="4xl"
>
  {content}
</EnhancedModal>

// ❌ SAI - Tự viết modal từ đầu
```

### 7.3. Click Outside & ESC
- **Luôn** cho phép đóng modal bằng click outside hoặc ESC
- Trừ khi là critical action (payment, confirmation)

---

## 8. Loading, Empty, Error States

### 8.1. Loading State
```jsx
// ✅ ĐÚNG - Dùng component chuẩn
import { LoadingState } from '@/components/shared/ui';

if (isLoading) return <LoadingState />;

// Hoặc skeleton cho list/grid
<SkeletonProductCard />
```

### 8.2. Empty State
**Cấu trúc:**
1. Icon (gray-300, size 64px)
2. Heading (text-lg, font-medium)
3. Description (text-gray-500)
4. CTA button (nếu có action)

```jsx
<EmptyState
  icon={<Package className="w-16 h-16 text-gray-300" />}
  title="Chưa có sản phẩm"
  message="Thêm sản phẩm đầu tiên để bắt đầu"
  action={<Button onClick={onCreate}>Tạo sản phẩm</Button>}
/>
```

### 8.3. Error State
```jsx
<ErrorState
  error={error}
  onRetry={refetch}
  message="Không thể tải dữ liệu"
/>
```

---

## 9. Navigation Patterns

### 9.1. Bottom Navigation (Mobile)
- **Max 5 items**
- Icon + label
- Active state: color + underline/background
- Badge cho notifications

### 9.2. Breadcrumb
```jsx
<Breadcrumb>
  <BreadcrumbItem>Home</BreadcrumbItem>
  <BreadcrumbItem>Products</BreadcrumbItem>
  <BreadcrumbItem active>Detail</BreadcrumbItem>
</Breadcrumb>
```

### 9.3. CẤM
- ❌ Hamburger menu ẩn main navigation (chỉ dùng cho secondary items)
- ❌ Carousel cho product list (làm giảm conversion)

---

## 10. CTA & Conversion Optimization

### 10.1. Primary CTA
- **Color**: Violet-600 (primary brand)
- **Size**: Medium/Large (px-6 py-3)
- **Contrast**: Đảm bảo WCAG AA
- **Position**: Dễ thấy, không bị che khuất

### 10.2. CTA Hierarchy
1. **Primary**: 1 CTA chính (Mua ngay, Đặt hàng)
2. **Secondary**: 1-2 CTAs phụ (Thêm vào giỏ, Xem thêm)
3. **Tertiary**: Links, ghost buttons

### 10.3. Button States
```jsx
// Loading
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Xác nhận'}
</Button>

// Success
<Button className="bg-green-600">
  <CheckCircle /> Thành công
</Button>
```

---

## 11. Icons & Visual Elements

### 11.1. Icon System
**CHỈ dùng:** `Icon` từ `@/components/ui/AnimatedIcon.jsx`

```jsx
// ✅ ĐÚNG
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
<Icon.CheckCircle />

// ❌ SAI
import { CheckCircle } from 'lucide-react';
```

### 11.2. Icon Sizes
- Small: 16px (inline với text)
- Medium: 20-24px (buttons, cards)
- Large: 32-40px (empty states, headers)
- Huge: 64px+ (hero, splash screens)

### 11.3. Icon Colors
- **Match text color** (inherit)
- Status icons: success (green), error (red), warning (amber)

---

## 12. Forms & Input

### 12.1. Form Layout
```jsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Email *</Label>
    <Input type="email" required />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
  
  <div className="flex justify-end gap-3">
    <Button variant="outline">Hủy</Button>
    <Button type="submit">Lưu</Button>
  </div>
</form>
```

### 12.2. Validation
- **Inline errors**: Hiện ngay dưới field
- **Color**: Red-500
- **Icon**: AlertCircle (16px)
- **Message**: Rõ ràng, hướng dẫn sửa

### 12.3. Required Fields
- Đánh dấu bằng `*` (asterisk)
- Validation khi submit hoặc blur

---

## 13. Accessibility (A11Y)

### 13.1. WCAG AA Compliance
- **Contrast ratio**: 4.5:1 cho text, 3:1 cho large text
- **Focus visible**: Outline rõ ràng khi focus
- **Keyboard navigation**: Tab order hợp lý

### 13.2. Alt Text
```jsx
// ✅ ĐÚNG
<img src={url} alt="Rau cải xanh hữu cơ 500g" />

// ❌ SAI
<img src={url} alt="image" />
```

### 13.3. ARIA Labels
```jsx
<button aria-label="Đóng modal">
  <X />
</button>
```

---

## 14. Animation & Transitions

### 14.1. Timing
- **Fast**: 150ms (hover, focus)
- **Medium**: 300ms (modal open/close, page transitions)
- **Slow**: 500ms (complex animations)

### 14.2. Easing
```css
ease-in-out  /* Default */
ease-out     /* Exit animations */
ease-in      /* Enter animations */
```

### 14.3. Framer Motion
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

---

## 15. Shadows & Elevation

### 15.1. Shadow Scale
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);   /* Subtle */
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);    /* Cards */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);  /* Modals */
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15); /* Dropdowns */
```

### 15.2. Usage
- Cards: shadow-md
- Hover: shadow-lg
- Modals: shadow-xl
- Dropdowns: shadow-xl

---

## 16. Z-Index Scale

```
0    - Base layer
10   - Sticky headers
50   - Dropdowns
60   - Sticky elements
90   - Modal backdrop
100  - Modal content
150  - Toast notifications
200  - Tooltips
250  - Critical alerts
```

**Rule**: Không hardcode z-index, dùng scale trên

---

## 17. Information Hierarchy

### 17.1. Content Priority
1. **Hero/Title** (largest, bold)
2. **Key info** (price, status, date)
3. **Supporting info** (description, meta)
4. **Actions** (CTAs)

### 17.2. Visual Weight
- Bold: Headings, prices, CTAs
- Regular: Body text, descriptions
- Light: Meta info, timestamps

---

## 18. Forbidden Patterns

### 18.1. KHÔNG BAO GIỜ
- ❌ **Carousel cho product list** (làm giảm conversion)
- ❌ **Auto-play video có âm thanh**
- ❌ **Hidden navigation** (hamburger menu cho primary nav)
- ❌ **Infinite scroll không có "Load more"**
- ❌ **Modal popup ngay khi vào trang**
- ❌ **Text dưới 14px trên mobile**

### 18.2. Anti-Patterns
```jsx
// ❌ SAI - Carousel product list
<Carousel>{products.map(...)}</Carousel>

// ✅ ĐÚNG - Grid với scroll hoặc pagination
<div className="grid grid-cols-2 gap-4">
  {products.slice(0, 6).map(...)}
</div>
<Button>Xem thêm</Button>
```

---

## 19. Performance Guidelines

### 19.1. Image Optimization
- **Lazy loading**: `loading="lazy"` cho images dưới fold
- **Aspect ratio**: Đặt trước để tránh layout shift
- **WebP**: Ưu tiên WebP với fallback

```jsx
<img 
  src={imageUrl} 
  alt={title}
  loading="lazy"
  className="aspect-square object-cover"
/>
```

### 19.2. Code Splitting
- Route-based splitting tự động (React Router)
- Lazy load heavy components (charts, editors)

---

## 20. Conversion-Focused Design

### 20.1. Product Page
**Must have:**
1. Large product image (gallery)
2. Clear price (bold, prominent)
3. Add to cart button (always visible)
4. Ratings & reviews (social proof)
5. Shipping info
6. Return policy

### 20.2. Checkout Flow
**Steps:**
1. Cart review
2. Customer info
3. Shipping
4. Payment
5. Confirmation

**Rules:**
- Progress indicator visible
- Edit previous steps dễ dàng
- No surprise costs
- Security badges

---

## 21. Data Display Rules

### 21.1. Missing Data
```jsx
// ✅ ĐÚNG - Hiển thị placeholder
<span className="text-gray-400">Chưa cập nhật</span>

// ❌ SAI - Để trống hoặc "null"
<span>{data.field}</span> // undefined hiện ra
```

### 21.2. Number Formatting
```javascript
// Price
formatPrice(123456) // "123.456₫"

// Quantity
formatNumber(1234) // "1.234"

// Percentage
formatPercent(0.15) // "15%"
```

### 21.3. Date Formatting
```javascript
// Relative: "2 giờ trước", "5 ngày trước"
formatRelative(date)

// Absolute: "08/01/2026 14:30"
format(date, 'dd/MM/yyyy HH:mm')
```

---

## 22. Responsive Breakpoints

```jsx
// Tailwind breakpoints
sm:  640px   // Small tablets portrait
md:  768px   // Tablets landscape / small laptops
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

### Usage
```jsx
<div className="
  text-base      // Mobile
  md:text-lg     // Tablet+
  lg:text-xl     // Desktop+
">
```

---

## 23. Micro-Interactions

### 23.1. Hover States
- Buttons: Darken color + shadow increase
- Cards: Border color + shadow increase
- Links: Underline + color change

### 23.2. Active States
- Buttons: Darken more + scale(0.98)
- Toggle: Background color change
- Selection: Border + background highlight

---

## 24. Notification & Toast

### 24.1. Toast Messages
**Rules:**
- Rõ ràng, hữu ích (không chỉ "Thành công")
- Auto-dismiss sau 3-5s
- Position: top-right hoặc bottom-center (mobile)

```javascript
// ✅ ĐÚNG
addToast('Đã thêm "Rau cải xanh" vào giỏ hàng', 'success');

// ❌ SAI
addToast('Success', 'success');
```

### 24.2. Toast Types
- Success: Green background
- Error: Red background
- Warning: Amber background
- Info: Blue background

---

## 25. Consistency Rules

### 25.1. Component Reuse
- **KHÔNG tạo variant mới** của Button/Card/Badge nếu đã có sẵn
- **Dùng design system** có sẵn (shadcn/ui)

### 25.2. Naming Convention
- Components: PascalCase (`ProductCard`)
- CSS classes: kebab-case (`product-card`)
- Files: PascalCase.jsx (`ProductCard.jsx`)

---

## Checklist Khi Thiết Kế UI Mới

```
□ Mobile-first? Touch targets ≥ 44px?
□ Typography scale đúng?
□ Spacing theo bội số 4px?
□ Colors theo palette đã định?
□ Product card có đủ 5 elements?
□ Loading/Empty/Error states?
□ Accessible (contrast, focus, alt text)?
□ Animation timing hợp lý?
□ Dùng components có sẵn?
□ Toast messages rõ ràng?
□ No forbidden patterns?
```

---

> **Ghi nhớ**: Mobile-first, 5-element product card, spacing 4px base, primary Violet-600, no carousel cho products, meaningful toast messages.