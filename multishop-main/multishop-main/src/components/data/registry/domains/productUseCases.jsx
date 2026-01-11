/**
 * Product Domain Use Cases
 */

export const productUseCases = [
  {
    id: 'product.list',
    domain: 'product',
    description: 'Danh sách sản phẩm với filter, sort, pagination',
    input: 'FilterParams',
    output: 'Result<ProductDTO[]>',
    service: 'productRepository.list',
    hook: 'useProductList',
    component: 'AdminProducts, Services'
  },
  {
    id: 'product.listActive',
    domain: 'product',
    description: 'Danh sách sản phẩm đang bán (client)',
    input: 'void',
    output: 'Result<ProductDTO[]>',
    service: 'productRepository.listActive',
    hook: 'useProducts',
    component: 'Services, Home'
  },
  {
    id: 'product.detail',
    domain: 'product',
    description: 'Chi tiết sản phẩm',
    input: 'string (id)',
    output: 'Result<ProductDTO>',
    service: 'productRepository.getById',
    hook: 'useProductDetail',
    component: 'ProductDetail, QuickViewModal'
  },
  {
    id: 'product.create',
    domain: 'product',
    description: 'Tạo sản phẩm mới',
    input: 'ProductCreateDTO',
    output: 'Result<ProductDTO>',
    service: 'productRepository.createWithValidation',
    hook: 'useProductForm',
    component: 'ProductFormModal'
  },
  {
    id: 'product.update',
    domain: 'product',
    description: 'Cập nhật sản phẩm',
    input: 'ProductDTO',
    output: 'Result<ProductDTO>',
    service: 'productRepository.update',
    hook: 'useProductForm',
    component: 'ProductFormModal'
  },
  {
    id: 'product.delete',
    domain: 'product',
    description: 'Xóa sản phẩm',
    input: 'string (id)',
    output: 'Result<void>',
    service: 'productRepository.delete',
    hook: 'useProductCRUD',
    component: 'AdminProducts'
  },
  {
    id: 'product.search',
    domain: 'product',
    description: 'Tìm kiếm sản phẩm',
    input: 'string (searchTerm)',
    output: 'Result<ProductDTO[]>',
    service: 'productRepository.search',
    hook: 'useProductSearch',
    component: 'SearchBar'
  },
  {
    id: 'product.lowStock',
    domain: 'product',
    description: 'Sản phẩm sắp hết hàng',
    input: 'number (threshold)',
    output: 'Result<ProductDTO[]>',
    service: 'productRepository.getLowStock',
    hook: 'useLowStockProducts',
    component: 'AdminInventory'
  }
];