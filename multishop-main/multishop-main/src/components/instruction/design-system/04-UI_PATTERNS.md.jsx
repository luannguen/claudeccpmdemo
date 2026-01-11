# UI Patterns Library - Reusable Design Patterns

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Common UI patterns: Product Card, List/Grid, Modal, Navigation, States

---

## 1. Product Card Pattern (5 Required Elements)

### 1.1. Anatomy (BẮT BUỘC)
```jsx
<Card className="product-card overflow-hidden hover:shadow-lg transition-all">
  {/* 1. IMAGE - Square aspect ratio, lazy load */}
  <div className="aspect-square overflow-hidden bg-gray-100">
    <img 
      src={product.image_url} 
      alt={product.name}
      className="w-full h-full object-cover hover:scale-105 transition-transform"
      loading="lazy"
    />
  </div>
  
  <CardContent className="p-4">
    {/* 2. TITLE - Max 2 lines, truncate */}
    <h3 className="font-semibold line-clamp-2 mb-2">
      {product.name}
    </h3>
    
    {/* 3. PRICE - Bold, prominent */}
    <p className="text-xl font-bold text-violet-600 mb-2">
      {formatPrice(product.price)}
    </p>
    
    {/* 4. RATING - Stars + count */}
    <div className="flex items-center gap-1 mb-3">
      <Stars rating={product.rating} size={16} />
      <span className="text-sm text-gray-500">({product.review_count})</span>
    </div>
    
    {/* 5. CTA - Add to cart button */}
    <Button className="w-full" onClick={() => addToCart(product)}>
      <ShoppingCart className="w-4 h-4 mr-2" />
      Thêm vào giỏ
    </Button>
  </CardContent>
</Card>
```

### 1.2. Variants

**Compact Card** (list view):
```jsx
<div className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
  <img src={image} className="w-20 h-20 rounded object-cover" />
  <div className="flex-1">
    <h3 className="font-medium line-clamp-1">{name}</h3>
    <p className="text-lg font-bold text-violet-600">{price}</p>
  </div>
  <Button size="sm">Thêm</Button>
</div>
```

**Featured Card** (hero):
```jsx
<Card className="relative overflow-hidden">
  <Badge className="absolute top-4 right-4 z-10 bg-red-500">Sale 20%</Badge>
  <img src={image} className="w-full h-64 object-cover" />
  {/* ... rest */}
</Card>
```

---

## 2. List vs Grid Pattern

### 2.1. Grid View (Browsing)
**Khi nào dùng:**
- Browsing products
- Visual content (images)
- Homepage, category pages

```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => <ProductCard key={item.id} product={item} />)}
</div>
```

### 2.2. List View (Comparison)
**Khi nào dùng:**
- Detailed comparison
- Admin tables
- Search results with metadata

```jsx
<div className="space-y-2">
  {items.map(item => <ProductListItem key={item.id} product={item} />)}
</div>
```

### 2.3. View Mode Toggle
```jsx
const [viewMode, setViewMode] = useState('grid');

<div className="flex gap-1 border rounded-lg">
  <Button 
    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
    size="sm"
    onClick={() => setViewMode('grid')}
  >
    <Grid className="w-4 h-4" />
  </Button>
  <Button 
    variant={viewMode === 'list' ? 'default' : 'ghost'} 
    size="sm"
    onClick={() => setViewMode('list')}
  >
    <List className="w-4 h-4" />
  </Button>
</div>
```

---

## 3. Modal Patterns

### 3.1. Form Modal
**Use case**: Create/Edit forms

```jsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Tạo sản phẩm"
  size="md"
  preset="form"
>
  <form className="space-y-4 p-6">
    {/* Fields */}
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline" onClick={onClose}>Hủy</Button>
      <Button type="submit">Lưu</Button>
    </div>
  </form>
</BaseModal>
```

### 3.2. Detail Modal
**Use case**: View full details, expandable content

```jsx
<EnhancedModal
  isOpen={isOpen}
  onClose={onClose}
  title="Chi tiết đơn hàng"
  maxWidth="5xl"
  showControls={true}
  enableDrag={true}
>
  <div className="p-6">
    <Tabs>
      <TabsList>
        <TabsTrigger value="info">Thông tin</TabsTrigger>
        <TabsTrigger value="items">Sản phẩm</TabsTrigger>
        <TabsTrigger value="history">Lịch sử</TabsTrigger>
      </TabsList>
      {/* Tab contents */}
    </Tabs>
  </div>
</EnhancedModal>
```

### 3.3. Confirm Modal
**Use case**: Dangerous actions (delete, cancel)

```jsx
<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
      <AlertDialogDescription>
        Xóa "{item.name}"? Hành động này không thể hoàn tác.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction className="bg-red-600" onClick={handleDelete}>
        Xóa
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 4. Bottom Navigation Pattern

### 4.1. Structure (Mobile)
```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
  <div className="flex justify-around py-2">
    {navItems.slice(0, 5).map(item => (
      <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-2">
        <item.icon className={`w-6 h-6 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
        <span className={`text-xs ${isActive ? 'text-violet-600 font-medium' : 'text-gray-500'}`}>
          {item.label}
        </span>
        {item.badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    ))}
  </div>
</nav>
```

### 4.2. Rules
- **Max 5 items** (usability)
- **Active state rõ ràng** (color + icon fill)
- **Icon + label** (không chỉ icon)
- **Badge** cho notifications

---

## 5. Filter & Search Pattern

### 5.1. Search Bar
```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Tìm kiếm sản phẩm..."
    className="pl-10"
  />
</div>
```

### 5.2. Filter Panel
```jsx
<div className="flex flex-wrap gap-4">
  <Select value={category} onValueChange={setCategory}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Danh mục" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tất cả</SelectItem>
      <SelectItem value="fruits">Trái cây</SelectItem>
    </SelectContent>
  </Select>
  
  <Select value={sortBy} onValueChange={setSortBy}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Sắp xếp" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="price_asc">Giá tăng dần</SelectItem>
      <SelectItem value="price_desc">Giá giảm dần</SelectItem>
    </SelectContent>
  </Select>
  
  <Button variant="outline" onClick={resetFilters}>
    <X className="w-4 h-4 mr-2" /> Reset
  </Button>
</div>
```

---

## 6. Pagination Pattern

### 6.1. Simple Pagination
```jsx
<div className="flex items-center justify-between mt-6">
  <p className="text-sm text-gray-500">
    Hiển thị {start}-{end} / {total}
  </p>
  <div className="flex gap-2">
    <Button variant="outline" onClick={prevPage} disabled={page === 1}>
      Trước
    </Button>
    <Button variant="outline" onClick={nextPage} disabled={page === totalPages}>
      Sau
    </Button>
  </div>
</div>
```

---

## 7. Stats Card Pattern

```jsx
<Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-violet-600 font-medium">Tổng đơn hàng</p>
        <p className="text-3xl font-bold text-violet-900 mt-1">1,234</p>
        <p className="text-xs text-green-600 mt-1">
          <TrendingUp className="w-3 h-3 inline" /> +12% so với tháng trước
        </p>
      </div>
      <div className="w-12 h-12 bg-violet-200 rounded-full flex items-center justify-center">
        <ShoppingCart className="w-6 h-6 text-violet-600" />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 8. Accordion Pattern

```jsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Content 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Content 2
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 9. Breadcrumb Pattern

```jsx
<nav className="flex items-center gap-2 text-sm">
  <Link to="/" className="text-gray-500 hover:text-gray-700">
    Trang chủ
  </Link>
  <ChevronRight className="w-4 h-4 text-gray-400" />
  <Link to="/products" className="text-gray-500 hover:text-gray-700">
    Sản phẩm
  </Link>
  <ChevronRight className="w-4 h-4 text-gray-400" />
  <span className="text-gray-900 font-medium">
    Chi tiết
  </span>
</nav>
```

---

## 10. Bulk Actions Pattern

```jsx
const [selectedIds, setSelectedIds] = useState(new Set());

// Toolbar khi có selection
{selectedIds.size > 0 && (
  <div className="flex items-center gap-3 p-3 bg-violet-100 rounded-lg">
    <span className="text-sm font-medium text-violet-900">
      {selectedIds.size} đã chọn
    </span>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Bulk Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleBulkDelete}>
          Xóa tất cả
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBulkExport}>
          Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
      <X className="w-4 h-4" />
    </Button>
  </div>
)}
```

---

## Pattern Checklist

Khi implement pattern:
```
□ Product card có đủ 5 elements?
□ Grid responsive mobile-first?
□ Modal dùng EnhancedModal/BaseModal?
□ Bottom nav max 5 items?
□ Filter có reset option?
□ Pagination hiển thị range?
□ Stats card có icon + trend?
□ Bulk actions có confirm?
```

---

> **Ghi nhớ**: Product card 5 elements bắt buộc, grid responsive, modal presets, bottom nav max 5, filter có reset, pagination có range, stats có trend indicator.