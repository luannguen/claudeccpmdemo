# Component Specifications - Props, States, Variants

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Chi tiết specs của từng component trong design system

---

## 1. Button Component

### 1.1. Import
```jsx
import { Button } from '@/components/ui/button';
```

### 1.2. Variants
| Variant | Usage | Background | Border |
|---------|-------|------------|--------|
| default | Primary action | Violet-600 | None |
| outline | Secondary action | Transparent | Violet-600 |
| ghost | Tertiary action | Transparent | None |
| destructive | Delete, cancel | Red-600 | None |
| link | Text link | Transparent | None |

### 1.3. Sizes
| Size | Padding | Font | Height |
|------|---------|------|--------|
| sm | 8px 12px | 14px | 32px |
| md | 12px 16px | 16px | 40px |
| lg | 16px 24px | 18px | 48px |

### 1.4. States
```jsx
// Default
<Button variant="default">Click me</Button>

// Hover
hover:bg-violet-700 hover:shadow-lg

// Active
active:scale-98

// Disabled
<Button disabled>Disabled</Button>

// Loading
<Button disabled>
  <Spinner className="mr-2" /> Loading...
</Button>
```

### 1.5. Props
```typescript
{
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
}
```

---

## 2. Card Component

### 2.1. Import
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
```

### 2.2. Structure
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### 2.3. Variants
```jsx
// Default
<Card className="border shadow-md">

// Hover effect
<Card className="hover:shadow-lg transition-shadow">

// Selected/Active
<Card className="border-2 border-violet-600 bg-violet-50">

// Ghost (no border)
<Card className="border-0 shadow-none">
```

### 2.4. Props
- `onClick`: Clickable card
- `className`: Custom styles

---

## 3. Badge Component

### 3.1. Import
```jsx
import { Badge } from '@/components/ui/badge';
```

### 3.2. Variants
| Variant | Background | Text |
|---------|------------|------|
| default | Violet-600 | White |
| secondary | Gray-100 | Gray-900 |
| outline | Transparent | Gray-700 |
| destructive | Red-100 | Red-700 |
| success | Green-100 | Green-700 |

### 3.3. Usage
```jsx
<Badge variant="default">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="success">Active</Badge>
```

---

## 4. Input Component

### 4.1. Import
```jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
```

### 4.2. Types
```jsx
<Input type="text" />
<Input type="email" />
<Input type="password" />
<Input type="number" />
<Input type="search" />
<Input type="date" />
```

### 4.3. States
```jsx
// Default
<Input placeholder="Enter text..." />

// Focus
focus:ring-2 focus:ring-violet-500

// Error
<Input className="border-red-500 focus:ring-red-500" />

// Disabled
<Input disabled />
```

### 4.4. With Label
```jsx
<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input id="email" type="email" required />
  {error && <p className="text-sm text-red-500">{error}</p>}
</div>
```

---

## 5. Modal Components

### 5.1. EnhancedModal
```jsx
import EnhancedModal from '@/components/EnhancedModal';

<EnhancedModal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  maxWidth="4xl"        // sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full
  showControls={true}   // Maximize, minimize buttons
  enableDrag={true}     // Draggable
  enableResize={true}   // Resizable
  persistPosition={false}
  positionKey="my-modal"
>
  {content}
</EnhancedModal>
```

### 5.2. BaseModal (Wrapper with Presets)
```jsx
import { BaseModal } from '@/components/shared/modal';

<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Form Modal"
  size="md"        // compact, sm, md, lg, xl, full
  preset="form"    // form, detail, alert, dashboard
>
  {content}
</BaseModal>
```

### 5.3. Presets
| Preset | Features | Use Case |
|--------|----------|----------|
| form | Compact, no drag | Create/edit forms |
| detail | Full controls | View details |
| alert | Minimal | Confirm/alert |
| dashboard | Persist position | Dashboard widgets |

---

## 6. Select Component

### 6.1. Import
```jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

### 6.2. Usage
```jsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## 7. Tabs Component

### 7.1. Import
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

### 7.2. Structure
```jsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content 1
  </TabsContent>
  <TabsContent value="tab2">
    Content 2
  </TabsContent>
</Tabs>
```

---

## 8. Dialog/AlertDialog

### 8.1. AlertDialog (Confirm actions)
```jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
      <AlertDialogDescription>
        Hành động này không thể hoàn tác.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction className="bg-red-600">Xóa</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 9. DropdownMenu

### 9.1. Import & Usage
```jsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleEdit}>
      <Pencil className="w-4 h-4 mr-2" /> Sửa
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash className="w-4 h-4 mr-2 text-red-500" /> Xóa
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 10. Toast/Notification

### 10.1. useToast Hook
```jsx
import { useToast } from '@/components/NotificationToast';

const { addToast } = useToast();

addToast('Đã lưu thành công', 'success');
addToast('Có lỗi xảy ra', 'error');
addToast('Cảnh báo', 'warning');
addToast('Thông tin', 'info');
```

### 10.2. Toast Types
| Type | Background | Icon |
|------|------------|------|
| success | Green-50 | CheckCircle |
| error | Red-50 | XCircle |
| warning | Amber-50 | AlertTriangle |
| info | Blue-50 | Info |

### 10.3. Best Practices
```jsx
// ✅ ĐÚNG - Rõ ràng, hữu ích
addToast('Đã thêm "Rau cải xanh" vào giỏ hàng', 'success');

// ❌ SAI - Chung chung
addToast('Success', 'success');
```

---

## 11. Loading States

### 11.1. LoadingState Component
```jsx
import { LoadingState } from '@/components/shared/ui';

if (isLoading) return <LoadingState />;
```

### 11.2. Skeleton
```jsx
// Product card skeleton
<div className="space-y-3">
  <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />
  <div className="h-4 bg-gray-200 animate-pulse rounded" />
  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
</div>
```

### 11.3. Spinner
```jsx
import { Icon } from '@/components/ui/AnimatedIcon.jsx';

<Icon.Spinner size={24} className="text-violet-600" />
```

---

## 12. EmptyState Component

### 12.1. Structure
```jsx
import { EmptyState } from '@/components/shared/ui';

<EmptyState
  icon={<Package className="w-16 h-16 text-gray-300" />}
  title="Chưa có sản phẩm"
  message="Thêm sản phẩm đầu tiên để bắt đầu"
  action={<Button onClick={onCreate}>Tạo sản phẩm</Button>}
/>
```

---

## 13. AnimatedIcon Component

### 13.1. Import & Usage
```jsx
import { Icon } from '@/components/ui/AnimatedIcon.jsx';

// Preset icons với animation
<Icon.Spinner />        // Loading spinner
<Icon.CheckCircle />    // Success
<Icon.AlertCircle />    // Alert
<Icon.Trash />          // Delete
<Icon.Edit />           // Edit
<Icon.Plus />           // Add
```

### 13.2. Available Icons
**Status**: Spinner, CheckCircle, AlertCircle, AlertTriangle, Info  
**Actions**: Bell, Send, Plus, Minus, Trash, Edit, Save, Copy, Download, Upload  
**Business**: DollarSign, Wallet, TrendingUp, Award, Trophy, Star, BarChart  
**Users**: User, Users, UserPlus, Heart, ThumbsUp, MessageCircle  
**UI**: Search, Filter, Menu, Grid, List, Settings, Bookmark

**Full list**: xem `AnimatedIcon.jsx` line 278-443

---

## 14. Form Components

### 14.1. Form Layout
```jsx
<form className="space-y-6">
  {/* Field */}
  <div className="space-y-2">
    <Label htmlFor="name">Tên *</Label>
    <Input id="name" required />
  </div>
  
  {/* Actions */}
  <div className="flex justify-end gap-3">
    <Button variant="outline" onClick={onCancel}>Hủy</Button>
    <Button type="submit">Lưu</Button>
  </div>
</form>
```

### 14.2. Validation Display
```jsx
// Inline error
<Input 
  className={error ? 'border-red-500' : ''}
  aria-invalid={!!error}
/>
{error && (
  <p className="text-sm text-red-500 flex items-center gap-1">
    <AlertCircle className="w-4 h-4" />
    {error}
  </p>
)}
```

---

## 15. Table Component

### 15.1. Structure
```jsx
<div className="bg-white rounded-xl border overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="text-left p-4 font-medium text-gray-700">Name</th>
        <th className="text-left p-4 font-medium text-gray-700">Status</th>
        <th className="text-right p-4 font-medium text-gray-700">Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id} className="border-b hover:bg-gray-50">
          <td className="p-4">{row.name}</td>
          <td className="p-4"><Badge>{row.status}</Badge></td>
          <td className="p-4 text-right">
            <Button variant="ghost" size="sm">Edit</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 16. Checkbox & Radio

### 16.1. Checkbox
```jsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
  <Label htmlFor="terms">Đồng ý điều khoản</Label>
</div>
```

### 16.2. Radio Group
```jsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option1" id="opt1" />
    <Label htmlFor="opt1">Option 1</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option2" id="opt2" />
    <Label htmlFor="opt2">Option 2</Label>
  </div>
</RadioGroup>
```

---

## 17. Switch Component

```jsx
import { Switch } from '@/components/ui/switch';

<div className="flex items-center gap-2">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

---

## 18. Slider Component

```jsx
import { Slider } from '@/components/ui/slider';

<Slider
  value={[value]}
  onValueChange={([v]) => setValue(v)}
  min={0}
  max={100}
  step={1}
/>
```

---

## 19. Progress Component

```jsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} className="h-2" />
```

---

## 20. Tooltip Component

```jsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Thông tin thêm</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 21. Popover Component

```jsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    {/* Content */}
  </PopoverContent>
</Popover>
```

---

## Component Checklist

Khi tạo component mới:
```
□ Props interface rõ ràng?
□ Có variants/sizes cần thiết?
□ States (hover, active, disabled, loading) đầy đủ?
□ Accessible (aria-*, keyboard)?
□ Responsive?
□ Animation timing hợp lý?
□ Reuse component có sẵn trước?
□ Đặt tên theo convention?
```

---

> **Ghi nhớ**: Button có 5 variants, Card có header/content/footer, Badge semantic colors, Input validation inline, Modal dùng EnhancedModal/BaseModal, Icon chỉ từ AnimatedIcon.