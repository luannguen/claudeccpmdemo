# Naming Convention - Components, Variants, Tokens, Files

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Quy ước đặt tên trong toàn bộ codebase

---

## 1. File Naming

### 1.1. Components
```
// ✅ ĐÚNG - PascalCase
ProductCard.jsx
OrderFormDialog.jsx
UserFilterBar.jsx
DesignDocViewModal.jsx

// ❌ SAI
productCard.jsx       // camelCase
product-card.jsx      // kebab-case
ProductCardComponent.jsx // Redundant "Component"
```

### 1.2. Hooks
```
// ✅ ĐÚNG - camelCase, prefix "use"
useProducts.js
useProductList.js
useOrderCheckout.js
useDesignDocs.js

// ❌ SAI
ProductsHook.js
use-products.js
products.js
```

### 1.3. Services/Utils
```
// ✅ ĐÚNG - camelCase
productService.js
orderRepository.js
formatters.js
validators.js

// ❌ SAI
ProductService.js
product-service.js
```

### 1.4. Pages
```
// ✅ ĐÚNG - PascalCase
AdminProducts.jsx
ProductDetail.jsx
MyOrders.jsx
AdminDesignSystem.jsx

// ❌ SAI
admin-products.jsx
productdetail.jsx
```

### 1.5. Folders
```
// ✅ ĐÚNG - kebab-case
admin/design-system/
features/notification/
shared/ui/

// ❌ SAI
admin/DesignSystem/
features/Notification/
```

---

## 2. Component Naming

### 2.1. Descriptive Names
```jsx
// ✅ ĐÚNG - Tên mô tả rõ chức năng
<ProductListTable />
<OrderFormDialog />
<DesignDocCard />
<CustomerFilterBar />

// ❌ SAI - Tên chung chung
<List />
<Form />
<Card />
<Filter />
```

### 2.2. Suffix Convention
| Suffix | Meaning | Example |
|--------|---------|---------|
| `Card` | Card component | ProductCard, OrderCard |
| `Modal` | Modal dialog | OrderDetailModal, ConfirmModal |
| `Dialog` | Form dialog | CreateProductDialog |
| `Table` | Table view | OrdersTable, ProductsTable |
| `List` | List view | OrdersList, ProductsList |
| `Grid` | Grid view | ProductsGrid |
| `Form` | Form component | ProductForm, OrderForm |
| `Bar` | Toolbar/Navbar | FilterBar, ActionBar |
| `Widget` | Dashboard widget | StatsWidget, ChartWidget |

### 2.3. Prefix Convention
| Prefix | Meaning | Example |
|--------|---------|---------|
| `Admin` | Admin-only | AdminProducts, AdminOrders |
| `User` | User-facing | UserProfile, UserDashboard |
| `Enhanced` | Upgraded version | EnhancedModal, CheckoutModalEnhanced |

---

## 3. Props Naming

### 3.1. Boolean Props
```jsx
// ✅ ĐÚNG - is/has/can/should prefix
isLoading
hasError
canEdit
shouldShow
isDisabled
isOpen

// ❌ SAI
loading    // Ambiguous
error      // Could be object or boolean
editable
show
```

### 3.2. Event Handler Props
```jsx
// ✅ ĐÚNG - on prefix + PascalCase verb
onClick
onChange
onSubmit
onClose
onSave
onDelete
onEdit

// ❌ SAI
handleClick  // This is internal handler name
click
clickHandler
```

### 3.3. Data Props
```jsx
// ✅ ĐÚNG - Singular cho object, plural cho array
product      // Single product object
products     // Array of products
order
orders
selectedItem
selectedItems

// ❌ SAI
productData
productsList
```

---

## 4. State Variable Naming

### 4.1. useState Convention
```jsx
// ✅ ĐÚNG
const [isOpen, setIsOpen] = useState(false);
const [products, setProducts] = useState([]);
const [search, setSearch] = useState('');
const [selectedId, setSelectedId] = useState(null);

// ❌ SAI
const [open, setOpen] = useState(false); // Ambiguous
const [data, setData] = useState([]); // Too generic
```

### 4.2. Complex State
```jsx
// ✅ ĐÚNG - Descriptive object key
const [filters, setFilters] = useState({
  category: 'all',
  priceRange: [0, 1000000],
  status: 'active'
});

// ❌ SAI
const [state, setState] = useState({ ... }); // Too generic
```

---

## 5. Function Naming

### 5.1. Handler Functions
```jsx
// ✅ ĐÚNG - handle prefix
const handleSubmit = () => { ... }
const handleDelete = () => { ... }
const handleFilterChange = () => { ... }

// ❌ SAI
const onSubmit = () => { ... }  // Reserved for props
const submit = () => { ... }    // Ambiguous
const deleteProduct = () => { ... } // OK, but handleDelete preferred
```

### 5.2. Utility Functions
```jsx
// ✅ ĐÚNG - Verb + noun
formatPrice(price)
validateEmail(email)
calculateTotal(items)
filterByCategory(products, category)

// ❌ SAI
price(value)        // Ambiguous
emailValidator(email) // Noun first
total(items)        // Too short
```

### 5.3. API/Service Functions
```jsx
// ✅ ĐÚNG - CRUD verbs
const productAPI = {
  list: () => { ... },
  get: (id) => { ... },
  create: (data) => { ... },
  update: (id, data) => { ... },
  delete: (id) => { ... }
};

// ❌ SAI
fetchProducts()  // Use "list"
getProductList() // Use "list"
removeProduct()  // Use "delete"
```

---

## 6. CSS Class Naming

### 6.1. Tailwind Convention
```jsx
// ✅ ĐÚNG - Utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

// ❌ SAI - Custom classes when Tailwind exists
<div className="custom-flex-container">
```

### 6.2. Custom Classes (when needed)
```css
/* ✅ ĐÚNG - BEM-like */
.product-card { }
.product-card__image { }
.product-card__title { }
.product-card--featured { }

/* ❌ SAI */
.productCard { }  // camelCase
.card1 { }        // Numbered
```

---

## 7. Variable Naming

### 7.1. Constants
```javascript
// ✅ ĐÚNG - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const DEFAULT_PAGE_SIZE = 20;

// ❌ SAI
const apiBaseUrl = '...';  // camelCase
const MaxUploadSize = ...; // PascalCase
```

### 7.2. Config Objects
```javascript
// ✅ ĐÚNG - SCREAMING for config name, camelCase for keys
const ORDER_STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: 'amber' },
  confirmed: { label: 'Đã xác nhận', color: 'blue' }
};

const CATEGORY_CONFIG = {
  rules: { label: 'UI/UX Rules', icon: 'FileText' },
  tokens: { label: 'Design Tokens', icon: 'Sliders' }
};
```

---

## 8. Type/Interface Naming

### 8.1. DTO (Data Transfer Objects)
```typescript
// ✅ ĐÚNG - Suffix DTO
interface ProductDTO {
  id: string;
  name: string;
  price: number;
}

interface OrderCreateDTO {
  items: OrderItemDTO[];
  customer: CustomerDTO;
}

// ❌ SAI
interface Product { }        // Confuse với entity
interface IProduct { }       // Hungarian notation
interface ProductInterface { } // Redundant
```

### 8.2. Props Type
```typescript
// ✅ ĐÚNG - ComponentNameProps
interface ProductCardProps {
  product: ProductDTO;
  onAddToCart: (product: ProductDTO) => void;
}

// ❌ SAI
interface IProductCard { }
interface ProductCardPropsType { }
```

---

## 9. Entity/Database Naming

### 9.1. Entity Names
```
// ✅ ĐÚNG - PascalCase, singular
Product
Order
Customer
DesignDoc

// ❌ SAI
Products      // Plural
product       // lowercase
design_doc    // snake_case
```

### 9.2. Entity Fields
```json
// ✅ ĐÚNG - snake_case
{
  "product_id": "123",
  "product_name": "Rau cải",
  "created_date": "2026-01-08",
  "is_active": true
}

// ❌ SAI
{
  "productId": "...",    // camelCase
  "ProductName": "...",  // PascalCase
  "created-date": "..."  // kebab-case
}
```

---

## 10. Test File Naming

```
// ✅ ĐÚNG
productService.test.js
useProducts.test.js
ProductCard.test.jsx

// ❌ SAI
test-productService.js
productService.spec.js
```

---

## 11. Git Branch/Commit Naming

### 11.1. Branch Names
```bash
# ✅ ĐÚNG
feature/admin-design-system
fix/product-card-layout
refactor/notification-module

# ❌ SAI
new-feature
bug-fix
temp
```

### 11.2. Commit Messages
```bash
# ✅ ĐÚNG
feat: add Design System Documentation Package (ADMIN-F11)
fix: product card missing price display
refactor: extract checkout form components

# ❌ SAI
update
fixed bug
changes
```

---

## Naming Checklist

```
□ Files: PascalCase cho components/pages, camelCase cho hooks/utils?
□ Components: Descriptive name với suffix (Card, Modal, Table)?
□ Props: is/has/can cho boolean, on cho handlers?
□ States: Descriptive, với set prefix?
□ Functions: handle prefix cho handlers, verb+noun cho utils?
□ Constants: SCREAMING_SNAKE_CASE?
□ CSS: Tailwind utility hoặc BEM?
□ Entity fields: snake_case?
□ No generic names (data, item, temp)?
```

---

> **Ghi nhớ**: Files PascalCase/camelCase, components descriptive+suffix, props is/has/on, states descriptive, handlers handle*, constants SCREAMING, entity fields snake_case.