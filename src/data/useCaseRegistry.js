/**
 * Registry of all use cases in the application.
 * Follows the format:
 * {
 *   id: 'domain.action',
 *   domain: 'domain',
 *   description: 'Description',
 *   input: 'DTOType',
 *   output: 'Result<Type>',
 *   service: 'service.method',
 *   hook: 'useHook',
 * }
 */
export const useCaseRegistry = [
    {
        id: 'product.list',
        domain: 'product',
        description: 'List all products from inventory',
        input: 'void',
        output: 'Result<ProductDTO[]>',
        service: 'productService.list',
        hook: 'useProductList',
    }
];
