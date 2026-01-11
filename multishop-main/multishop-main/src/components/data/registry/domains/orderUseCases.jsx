/**
 * Order Domain Use Cases
 */

export const orderUseCases = [
  {
    id: 'order.list',
    domain: 'order',
    description: 'Danh sách đơn hàng (admin)',
    input: 'FilterParams',
    output: 'Result<OrderDTO[]>',
    service: 'orderRepository.list',
    hook: 'useAdminOrders',
    component: 'AdminOrders'
  },
  {
    id: 'order.listByCustomer',
    domain: 'order',
    description: 'Đơn hàng của khách hàng',
    input: 'string (email)',
    output: 'Result<OrderDTO[]>',
    service: 'orderRepository.listByCustomer',
    hook: 'useMyOrders',
    component: 'MyOrders'
  },
  {
    id: 'order.detail',
    domain: 'order',
    description: 'Chi tiết đơn hàng',
    input: 'string (id)',
    output: 'Result<OrderDTO>',
    service: 'orderRepository.getById',
    hook: 'useOrderDetail',
    component: 'OrderDetailModal'
  },
  {
    id: 'order.create',
    domain: 'order',
    description: 'Tạo đơn hàng mới',
    input: 'OrderCreateDTO',
    output: 'Result<OrderDTO>',
    service: 'orderRepository.createWithValidation',
    hook: 'useCheckout',
    component: 'CheckoutModal'
  },
  {
    id: 'order.updateStatus',
    domain: 'order',
    description: 'Cập nhật trạng thái đơn',
    input: '{ id, status }',
    output: 'Result<OrderDTO>',
    service: 'orderRepository.updateStatus',
    hook: 'useOrderActions',
    component: 'AdminOrders'
  },
  {
    id: 'order.cancel',
    domain: 'order',
    description: 'Hủy đơn hàng',
    input: '{ id, reason }',
    output: 'Result<OrderDTO>',
    service: 'orderRepository.cancel',
    hook: 'useOrderCancel',
    component: 'CancelOrderModal'
  },
  {
    id: 'order.stats',
    domain: 'order',
    description: 'Thống kê đơn hàng',
    input: 'void',
    output: 'Result<OrderStats>',
    service: 'orderRepository.getStats',
    hook: 'useOrderStats',
    component: 'AdminDashboard'
  },
  {
    id: 'order.processReferral',
    domain: 'order',
    description: 'Xử lý referral sau khi tạo order',
    input: '{ order, customerEmail, referralCode }',
    output: 'Result<void>',
    service: 'orderReferralBridge.processReferralAfterOrder',
    hook: 'useCheckout',
    component: 'CheckoutService'
  },
  {
    id: 'order.handleReturn',
    domain: 'order',
    description: 'Xử lý return/refund và reverse commission',
    input: '{ orderId, reason }',
    output: 'Result<void>',
    service: 'orderReferralBridge.handleOrderReturnRefund',
    hook: 'useOrderActions',
    component: 'OrderService, AdminOrders'
  }
];