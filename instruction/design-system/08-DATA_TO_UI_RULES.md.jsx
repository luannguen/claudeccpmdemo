# Data to UI Mapping Rules - Field Display & Priority

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Cách map data từ API → UI display

---

## 1. Field Priority & Display

### 1.1. Product Entity → UI Mapping

| Field (DB) | Display Priority | UI Component | Format |
|------------|------------------|--------------|--------|
| `name` | P0 (Critical) | H3, bold | Truncate 2 lines |
| `price` | P0 (Critical) | XL, bold, color | `formatPrice()` |
| `image_url` | P0 (Critical) | Image (square) | Lazy load |
| `rating_average` | P1 (High) | Stars + count | 1 decimal |
| `stock_quantity` | P1 (High) | Badge | "Còn X", "Hết hàng" |
| `description` | P2 (Medium) | Paragraph | Truncate hoặc expandable |
| `category` | P2 (Medium) | Badge | Capitalize |
| `tags` | P3 (Low) | Small badges | Max 3, +N more |
| `sku` | P3 (Low) | Mono text | Show on hover |
| `created_date` | P3 (Low) | Relative time | "2 ngày trước" |

### 1.2. Order Entity → UI Mapping

| Field (DB) | Display Priority | UI Component | Format |
|------------|------------------|--------------|--------|
| `order_number` | P0 | H4, mono | #ORD-12345 |
| `total_amount` | P0 | XL, bold | formatPrice |
| `order_status` | P0 | Badge (color-coded) | Vietnamese label |
| `customer_name` | P1 | Medium text | - |
| `items` | P1 | Table/List | Product name + qty |
| `shipping_address` | P2 | Paragraph | Collapsible on mobile |
| `payment_method` | P2 | Badge | Icon + label |
| `created_date` | P1 | Relative + absolute | "2h trước (08/01 14:30)" |

---

## 2. Data Formatting Rules

### 2.1. Currency (VND)
```javascript
// ✅ ĐÚNG
export const formatPrice = (price) => {
  if (!price && price !== 0) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Output: "123.456₫"
```

### 2.2. Numbers
```javascript
// Quantity, stock
export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Output: "1.234"
```

### 2.3. Percentage
```javascript
export const formatPercent = (decimal) => {
  if (!decimal && decimal !== 0) return '-';
  return `${(decimal * 100).toFixed(1)}%`;
};

// Input: 0.15 → Output: "15.0%"
```

### 2.4. Date/Time
```javascript
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Relative
export const formatRelative = (date) => {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: vi
  });
};
// Output: "2 giờ trước"

// Absolute
export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy');
};
// Output: "08/01/2026"

// Full datetime
export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};
// Output: "08/01/2026 14:30"
```

---

## 3. Missing Data Handling

### 3.1. Null/Undefined Values
```jsx
// ✅ ĐÚNG - Show placeholder
<p className="text-gray-400">
  {data.field || 'Chưa cập nhật'}
</p>

// ❌ SAI - Hiển thị "null" hoặc "undefined"
<p>{data.field}</p>
```

### 3.2. Empty Arrays
```jsx
// ✅ ĐÚNG - Check length
{items.length > 0 ? (
  <ul>{items.map(...)}</ul>
) : (
  <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
)}

// ❌ SAI - Render empty array
{items.map(...)} // Shows nothing, confusing
```

### 3.3. Optional Fields (Images, Descriptions)
```jsx
// Product image
<img 
  src={product.image_url || '/placeholder-product.png'} 
  alt={product.name}
/>

// Description
{product.description ? (
  <p className="text-gray-600">{product.description}</p>
) : (
  <p className="text-gray-400 italic text-sm">Chưa có mô tả</p>
)}
```

---

## 4. Conditional Display

### 4.1. Show Based on Status
```jsx
// Order status → UI elements
const statusConfig = {
  pending: {
    badge: { color: 'amber', label: 'Chờ xác nhận' },
    actions: ['confirm', 'cancel'],
    icon: <Clock />
  },
  confirmed: {
    badge: { color: 'blue', label: 'Đã xác nhận' },
    actions: ['ship', 'cancel'],
    icon: <CheckCircle />
  },
  shipping: {
    badge: { color: 'violet', label: 'Đang giao' },
    actions: ['complete'],
    icon: <Truck />
  },
  delivered: {
    badge: { color: 'green', label: 'Đã giao' },
    actions: ['return'],
    icon: <PackageCheck />
  }
};

const config = statusConfig[order.order_status];

<Badge className={`bg-${config.badge.color}-100 text-${config.badge.color}-700`}>
  {config.badge.label}
</Badge>
```

### 4.2. Show Based on Permissions
```jsx
// Admin-only actions
{user?.role === 'admin' && (
  <Button onClick={handleDelete}>
    <Trash className="w-4 h-4 mr-2" /> Xóa
  </Button>
)}

// Owner-only actions
{order.created_by === user.email && (
  <Button onClick={handleCancel}>Hủy đơn</Button>
)}
```

---

## 5. Data Aggregation for UI

### 5.1. Stats Cards
```javascript
// Aggregate từ order list
const stats = {
  totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
  totalOrders: orders.length,
  pendingOrders: orders.filter(o => o.order_status === 'pending').length,
  completedOrders: orders.filter(o => o.order_status === 'delivered').length
};
```

### 5.2. Group By Category
```javascript
const productsByCategory = products.reduce((acc, product) => {
  const cat = product.category;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(product);
  return acc;
}, {});

// Display
{Object.entries(productsByCategory).map(([category, items]) => (
  <div key={category}>
    <h3>{category}</h3>
    <ProductGrid products={items} />
  </div>
))}
```

---

## 6. Rich Data Display

### 6.1. Ratings Display
```jsx
function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">
        ({count || 0})
      </span>
    </div>
  );
}
```

### 6.2. Price Display (With Sale)
```jsx
function PriceDisplay({ price, salePrice }) {
  const hasDiscount = salePrice && salePrice < price;
  
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-violet-600">
        {formatPrice(salePrice || price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(price)}
          </span>
          <Badge className="bg-red-500 text-white">
            -{Math.round((1 - salePrice / price) * 100)}%
          </Badge>
        </>
      )}
    </div>
  );
}
```

### 6.3. Stock Display
```jsx
function StockBadge({ quantity, threshold = 10 }) {
  if (quantity === 0) {
    return <Badge className="bg-red-100 text-red-700">Hết hàng</Badge>;
  }
  if (quantity <= threshold) {
    return <Badge className="bg-amber-100 text-amber-700">Còn {quantity}</Badge>;
  }
  return <Badge className="bg-green-100 text-green-700">Còn hàng</Badge>;
}
```

---

## 7. Array Data Display

### 7.1. Tags (Max 3 + More)
```jsx
{product.tags?.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {product.tags.slice(0, 3).map(tag => (
      <Badge key={tag} variant="secondary" className="text-xs">
        {tag}
      </Badge>
    ))}
    {product.tags.length > 3 && (
      <span className="text-xs text-gray-400">
        +{product.tags.length - 3}
      </span>
    )}
  </div>
)}
```

### 7.2. Order Items (Summary)
```jsx
// Trong order card - chỉ show first 2
<div className="space-y-1 text-sm">
  {order.items.slice(0, 2).map(item => (
    <div key={item.product_id} className="flex justify-between">
      <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
      <span className="font-medium">{formatPrice(item.subtotal)}</span>
    </div>
  ))}
  {order.items.length > 2 && (
    <p className="text-gray-400 text-xs">
      +{order.items.length - 2} sản phẩm khác
    </p>
  )}
</div>
```

---

## 8. Computed Fields

### 8.1. Common Computations
```javascript
// Total từ items
const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

// Average rating
const avgRating = reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  : 0;

// Completion percentage
const progress = (completedTasks / totalTasks) * 100;
```

---

## Data-to-UI Checklist

```
□ Priority fields hiển thị trước?
□ Missing data có placeholder?
□ Format currency/number/date đúng?
□ Arrays có limit display (max 3-5)?
□ Computed fields cached?
□ Conditional display dựa status/role?
□ Rich display (ratings, stock, price with sale)?
□ Error handling cho missing/null data?
```

---

> **Ghi nhớ**: Priority P0→P1→P2→P3, missing data show placeholder, format currency/date/number, arrays limit 3-5 items, conditional display theo status/role, rich display cho rating/price/stock.