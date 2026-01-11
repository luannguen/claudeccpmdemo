# Information Architecture - Content Priority & Placement Rules

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Content hierarchy, placement rules, navigation structure

---

## 1. Visual Hierarchy Principles

### 1.1. F-Pattern (Desktop)
Users scan theo pattern chữ F:
```
┌────────────────────────────┐
│ ████████████               │  ← Top horizontal bar (logo, nav)
│ ████                       │
│ ██████████                 │  ← Second horizontal (hero, key info)
│ ███                        │
│ ████                       │  ← Vertical left column (sidebar, menu)
│ ██                         │
└────────────────────────────┘
```

**Placement priority:**
1. Top-left: Logo, brand
2. Top-right: User actions, cart, login
3. Left sidebar: Navigation, filters
4. Center: Main content
5. Right sidebar: Recommendations, ads

### 1.2. Z-Pattern (Landing Pages)
```
┌────────────────────────────┐
│ █████          ████        │  ← Logo → CTA
│           ↘                │
│               ↘            │  ← Diagonal scan
│                   ↘        │
│ Content              ████  │  ← Body → CTA
└────────────────────────────┘
```

---

## 2. Content Priority Levels

### 2.1. Level 1: Critical (Must See Immediately)
- **Product page**: Image, Title, Price, Add to Cart
- **Checkout**: Total amount, Payment method, Order button
- **Dashboard**: Key metrics (revenue, orders today)

**Styling:**
- Font size: xl-3xl (20-30px)
- Weight: Bold (700)
- Color: High contrast (Gray-900, Violet-600)
- Position: Above fold

### 2.2. Level 2: Important (Should See)
- **Product page**: Description, Rating, Shipping info
- **Checkout**: Customer form, shipping address
- **Dashboard**: Charts, recent orders

**Styling:**
- Font size: base-lg (16-18px)
- Weight: Medium-Regular (500-400)
- Color: Gray-700
- Position: Just below fold

### 2.3. Level 3: Supporting (Nice to Have)
- **Product page**: Related products, reviews
- **Checkout**: Terms & conditions, policies
- **Dashboard**: Activity logs, notifications

**Styling:**
- Font size: sm-base (14-16px)
- Weight: Regular (400)
- Color: Gray-500
- Position: Lower sections, collapsible

---

## 3. Above the Fold Rules

**Mobile viewport: ~600px height**
**Desktop viewport: ~800px height**

### 3.1. Must Have Above Fold

**Homepage:**
- Hero image/video
- Value proposition (1 line)
- Primary CTA
- Key categories (max 4)

**Product List:**
- Search bar
- Filter options (collapsed is OK)
- First 2-4 products

**Product Detail:**
- Product image (main)
- Title, price
- Add to cart button
- Rating

**Checkout:**
- Progress indicator
- Current step content
- Total amount
- Next step button

---

## 4. Navigation Architecture

### 4.1. Primary Navigation (Always Visible)
```jsx
<nav>
  <div className="container flex items-center justify-between">
    {/* Left: Logo + Main nav */}
    <div className="flex items-center gap-8">
      <Logo />
      <NavLinks items={['Sản phẩm', 'Blog', 'Về chúng tôi']} />
    </div>
    
    {/* Right: User actions */}
    <div className="flex items-center gap-4">
      <SearchButton />
      <CartButton badge={cartCount} />
      <UserMenu />
    </div>
  </div>
</nav>
```

### 4.2. Secondary Navigation
- Breadcrumb
- Category filters
- Sort options

### 4.3. Mobile Navigation
**Bottom Nav** (5 items max):
- Home
- Categories
- Cart
- Profile
- More (overflow)

---

## 5. Content Placement Rules

### 5.1. Product Page Layout
```
┌─────────────────────────────────────────────────┐
│ Breadcrumb                                      │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  IMAGE GALLERY   │  TITLE (H1)                  │
│  (60% width)     │  PRICE (large, bold)         │
│                  │  RATING + REVIEWS            │
│                  │  QUANTITY SELECTOR           │
│                  │  ADD TO CART (prominent)     │
│                  │                              │
│                  │  SHORT DESCRIPTION           │
│                  │  SHIPPING INFO               │
│                  │                              │
├──────────────────┴──────────────────────────────┤
│ TABS: Description | Specs | Reviews             │
├─────────────────────────────────────────────────┤
│ RELATED PRODUCTS                                │
└─────────────────────────────────────────────────┘
```

### 5.2. Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ HEADER: Title, Date Range, Actions             │
├─────────────────────────────────────────────────┤
│ KPI CARDS (4 cols)                              │
│ [Revenue] [Orders] [Customers] [Products]       │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  MAIN CHART      │  QUICK STATS                 │
│  (Revenue)       │  - Top products              │
│  (70%)           │  - Recent orders             │
│                  │  (30%)                       │
├──────────────────┴──────────────────────────────┤
│ DETAILED TABLE                                  │
└─────────────────────────────────────────────────┘
```

### 5.3. Form Layout
```
┌─────────────────────────────────────────────────┐
│ TITLE + Description                             │
├─────────────────────────────────────────────────┤
│ Required fields first                           │
│ - Name *                                        │
│ - Email *                                       │
│ - Phone *                                       │
├─────────────────────────────────────────────────┤
│ Optional fields (collapsible)                   │
│ - Company                                       │
│ - Notes                                         │
├─────────────────────────────────────────────────┤
│ ACTIONS (right-aligned)                         │
│                          [Cancel] [Submit]      │
└─────────────────────────────────────────────────┘
```

---

## 6. Sidebar Rules

### 6.1. Left Sidebar (Navigation)
- Width: 240-280px desktop
- Collapsed: 64px (icon only)
- Mobile: Overlay drawer

### 6.2. Right Sidebar (Context)
- Width: 320-360px
- Content: Related info, filters, widgets
- Mobile: Bottom sheet hoặc hidden

---

## 7. Card Grid Architecture

### 7.1. Responsive Grid
```jsx
// Homepage: Featured products
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

// Category page: All products
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

// Admin dashboard: Widgets
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 7.2. Aspect Ratios
- Product images: **1:1** (square)
- Blog thumbnails: **16:9**
- Profile avatars: **1:1** (circle)
- Hero images: **21:9** hoặc **16:9**

---

## 8. Typography Hierarchy

### 8.1. Page Structure
```
H1 (Page title)           - 32px, bold
  H2 (Section heading)    - 24px, semibold
    H3 (Subsection)       - 20px, semibold
      Body                - 16px, regular
      Small               - 14px, regular
```

### 8.2. Content Density
- **Tight**: Admin tables (gap-2, text-sm)
- **Normal**: Product grids (gap-4, text-base)
- **Relaxed**: Blog posts (gap-6, text-lg, leading-relaxed)

---

## 9. Mobile-Specific Rules

### 9.1. Sticky Elements
- **Header**: Sticky top (logo + cart + menu)
- **Bottom nav**: Fixed bottom
- **CTA button**: Sticky bottom (product detail page)

### 9.2. Touch Zones
```
┌─────────────────────────┐
│ Safe zone (hard to      │  ← Top 20%
│ reach with thumb)       │
├─────────────────────────┤
│ Comfortable zone        │  ← Middle 60%
│ (easy to reach)         │
├─────────────────────────┤
│ Primary action zone     │  ← Bottom 20%
│ (thumb rests here)      │
└─────────────────────────┘
```

**Placement:**
- Primary CTA: Bottom 1/3
- Secondary actions: Middle
- Info/labels: Top

---

## 10. Scroll Behavior

### 10.1. Infinite Scroll vs Pagination
**Infinite scroll:**
- Social feeds (posts, comments)
- Image galleries
- Search results (with "Load more" trigger)

**Pagination:**
- Admin tables
- Product lists (có filter)
- Blog archives

### 10.2. Scroll-to-Top
- Hiện khi scroll > 400px
- Position: fixed bottom-right (desktop), bottom-center (mobile)
- Smooth scroll animation

---

## 11. Whitespace Strategy

### 11.1. Breathing Room
- Card padding: **24px** (comfortable)
- Section spacing: **48-64px**
- Paragraph spacing: **16px**

### 11.2. Density Levels
| Context | Gap | Padding |
|---------|-----|---------|
| Compact (admin tables) | 8px | 12px |
| Normal (product grids) | 16px | 16px |
| Relaxed (landing pages) | 24px | 24px |

---

## 12. Content Width Constraints

### 12.1. Max Widths
```css
--max-width-prose: 65ch;    /* Blog posts, articles */
--max-width-form:  640px;   /* Forms */
--max-width-content: 1280px; /* Main content */
--max-width-wide: 1536px;   /* Dashboard */
```

### 12.2. Reading Width
- **Optimal**: 50-75 characters per line
- **Max**: 90 characters
- **Min**: 40 characters

---

## 13. Information Scent

### 13.1. Clarity Principles
**Mỗi element phải trả lời:**
1. **What is this?** → Label, title
2. **Why should I care?** → Value proposition, benefit
3. **What can I do?** → CTA, actions

### 13.2. Example
```jsx
// ❌ BAD - Unclear
<Button>Click here</Button>

// ✅ GOOD - Clear intent
<Button>Thêm vào giỏ hàng</Button>
```

---

## IA Checklist

Khi thiết kế page mới:
```
□ Content priority (1-2-3) rõ ràng?
□ Above fold có đủ critical info?
□ Navigation structure logic?
□ Mobile: Primary CTA trong thumb zone?
□ Whitespace đủ breathing room?
□ Content width tối ưu cho đọc?
□ Labels/CTAs rõ ràng về intent?
□ Scroll behavior phù hợp?
```

---

> **Ghi nhớ**: F-pattern desktop, Z-pattern landing, 3 levels priority, above fold critical only, thumb zone cho mobile CTA, 50-75ch reading width, labels rõ intent.