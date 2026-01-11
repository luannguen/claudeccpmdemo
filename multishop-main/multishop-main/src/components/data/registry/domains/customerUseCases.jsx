/**
 * Customer Domain Use Cases
 */

export const customerUseCases = [
  // ========== CUSTOMER SYNC ==========
  
  {
    id: 'customer.sync_to_user',
    domain: 'customer',
    description: 'Sync Customer data to User profile',
    input: 'userEmail: string',
    output: 'Result<{ synced: boolean, data: Object }>',
    service: 'customerSyncService.syncCustomerToUserProfile',
    hook: 'useManualSync',
    relatedEntities: ['Customer', 'User'],
    tags: ['sync', 'profile']
  },
  
  {
    id: 'customer.get_merged_profile',
    domain: 'customer',
    description: 'Get merged User + Customer profile',
    input: 'userEmail: string',
    output: 'Result<MergedProfile>',
    service: 'customerSyncService.getUserProfileWithCustomerData',
    hook: 'useProfileWithCustomer',
    relatedEntities: ['Customer', 'User'],
    tags: ['sync', 'profile', 'read']
  },
  
  {
    id: 'customer.update_shipping_preferences',
    domain: 'customer',
    description: 'Update User shipping preferences (manual)',
    input: 'shippingData: Object',
    output: 'Result<Object>',
    service: 'customerSyncService.updateUserShippingPreferences',
    hook: 'useUpdateShippingPreferences',
    relatedEntities: ['User'],
    tags: ['update', 'profile', 'shipping']
  },
  
  {
    id: 'customer.toggle_auto_sync',
    domain: 'customer',
    description: 'Toggle auto-sync Customer → User',
    input: 'enabled: boolean',
    output: 'Result<boolean>',
    service: 'customerSyncService.toggleAutoSync',
    hook: 'useToggleAutoSync',
    relatedEntities: ['User'],
    tags: ['settings', 'sync']
  },
  
  {
    id: 'customer.check_sync_needed',
    domain: 'customer',
    description: 'Check if sync needed based on timestamps',
    input: 'userEmail: string',
    output: 'Result<{ needed: boolean, reason: string }>',
    service: 'customerSyncService.checkSyncNeeded',
    hook: 'useAutoSyncOnLogin',
    relatedEntities: ['Customer', 'User'],
    tags: ['sync', 'check']
  },
  

  {
    id: 'customer.list',
    domain: 'customer',
    description: 'Danh sách khách hàng',
    input: 'FilterParams',
    output: 'Result<CustomerDTO[]>',
    service: 'customerRepository.list',
    hook: 'useAdminCustomers',
    component: 'AdminCustomers'
  },
  {
    id: 'customer.detail',
    domain: 'customer',
    description: 'Chi tiết khách hàng',
    input: 'string (id)',
    output: 'Result<CustomerDTO>',
    service: 'customerRepository.getById',
    hook: 'useCustomerDetail',
    component: 'CustomerDetailModal'
  },
  {
    id: 'customer.search',
    domain: 'customer',
    description: 'Tìm kiếm khách hàng',
    input: 'string (searchTerm)',
    output: 'Result<CustomerDTO[]>',
    service: 'customerRepository.search',
    hook: 'useCustomerSearch',
    component: 'AdminCustomers'
  },
  {
    id: 'customer.createOrGet',
    domain: 'customer',
    description: 'Tạo hoặc lấy khách hàng',
    input: 'CustomerDTO',
    output: 'Result<CustomerDTO>',
    service: 'customerRepository.createOrGet',
    hook: 'useCheckout',
    component: 'CheckoutModal'
  },
  {
    id: 'customer.stats',
    domain: 'customer',
    description: 'Thống kê khách hàng',
    input: 'void',
    output: 'Result<CustomerStats>',
    service: 'customerRepository.getStats',
    hook: 'useCustomerStats',
    component: 'AdminDashboard, AdminCustomers'
  }
];