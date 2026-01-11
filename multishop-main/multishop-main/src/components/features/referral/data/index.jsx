/**
 * Referral Data Layer - Public Exports
 * Repositories for data access
 * 
 * @module features/referral/data
 */

export { memberRepository } from './memberRepository';
export { eventRepository } from './eventRepository';
export { settingRepository } from './settingRepository';
export { customerRepository } from './customerRepository';
export { auditRepository } from './auditRepository';

// Default export as namespaced object
import { memberRepository } from './memberRepository';
import { eventRepository } from './eventRepository';
import { settingRepository } from './settingRepository';
import { customerRepository } from './customerRepository';
import { auditRepository } from './auditRepository';

export const repositories = {
  member: memberRepository,
  event: eventRepository,
  setting: settingRepository,
  customer: customerRepository,
  audit: auditRepository
};

export default repositories;