/**
 * Data Layer - Central Exports
 * All repositories and types should be imported from here
 */

// ========== TYPES & UTILITIES ==========
export {
  // Result pattern
  success,
  failure,
  ErrorCodes,
  
  // Pagination
  DEFAULT_PAGINATION,
  
  // Status enums
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ReferralStatus,
  SeederRank,
  
  // UI configs
  OrderStatusConfig,
  SeederRankConfig
} from './types';

// ========== BASE REPOSITORY ==========
export {
  createBaseRepository,
  createRepository
} from './repositories/baseRepository';

// ========== USE CASE REGISTRY ==========
export {
  useCaseRegistry,
  findUseCase,
  findUseCasesByDomain,
  findUseCaseByHook,
  getAllDomains,
  hasUseCase,
  getRepositoryForUseCase,
  getHookForUseCase
} from './useCaseRegistry';

// ========== ENTITY REPOSITORIES ==========
export { productRepository } from './repositories/productRepository';
export { orderRepository } from './repositories/orderRepository';
export { customerRepository } from './repositories/customerRepository';
export { 
  referralMemberRepository,
  referralEventRepository,
  referralSettingRepository 
} from './repositories/referralRepository';
export { 
  notificationRepository,
  adminNotificationRepository 
} from './repositories/notificationRepository';

// ========== QUICK ACCESS ==========
import { productRepository } from './repositories/productRepository';
import { orderRepository } from './repositories/orderRepository';
import { customerRepository } from './repositories/customerRepository';
import { 
  referralMemberRepository,
  referralEventRepository,
  referralSettingRepository 
} from './repositories/referralRepository';
import { 
  notificationRepository,
  adminNotificationRepository 
} from './repositories/notificationRepository';

/**
 * All repositories in one object
 * Usage: repositories.product.list()
 */
export const repositories = {
  product: productRepository,
  order: orderRepository,
  customer: customerRepository,
  referral: {
    member: referralMemberRepository,
    event: referralEventRepository,
    setting: referralSettingRepository
  },
  notification: {
    user: notificationRepository,
    admin: adminNotificationRepository
  }
};

export default repositories;