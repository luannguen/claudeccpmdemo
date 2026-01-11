/**
 * Recipient Resolver
 * Resolves notification recipients based on actor and broadcast rules
 */

import { base44 } from '@/api/base44Client';

/**
 * Resolve admin recipients
 * IMPORTANT: base44.asServiceRole ONLY works in backend functions
 * In frontend, we return empty array and rely on broadcast (recipient_email = null)
 */
export const resolveAdmins = async ({ roles = ['admin', 'super_admin', 'manager', 'staff'] } = {}) => {
  try {
    // NOTE: asServiceRole doesn't work in frontend, will throw error
    // Return empty to trigger broadcast mode (recipient_email = null)
    console.log('👨‍💼 [recipientResolver] resolveAdmins - returning empty for broadcast mode');
    return [];
  } catch (error) {
    console.error('❌ Failed to resolve admins:', error.message);
    return [];
  }
};

/**
 * Resolve tenant admins/users
 */
export const resolveTenantUsers = async (tenantId, { roles = ['owner', 'admin'] } = {}) => {
  try {
    const tenantUsers = await base44.asServiceRole.entities.TenantUser.filter({ tenant_id: tenantId });
    
    let filtered = tenantUsers;
    if (roles.length > 0) {
      filtered = tenantUsers.filter(tu => roles.includes(tu.role));
    }
    
    const emails = filtered.map(tu => tu.user_email);
    console.log(`🏪 Resolved ${emails.length} tenant users for ${tenantId}:`, emails);
    return emails;
  } catch (error) {
    console.error(`❌ Failed to resolve tenant users for ${tenantId}:`, error.message);
    
    // Fallback: get tenant owner
    try {
      const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: tenantId });
      if (tenants.length > 0) {
        return [tenants[0].owner_email];
      }
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError.message);
    }
    
    return [];
  }
};

/**
 * Resolve all platform users (USE WITH CAUTION)
 */
export const resolveAllUsers = async () => {
  try {
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const emails = users.map(u => u.email);
    console.warn(`⚠️ Broadcasting to ALL ${emails.length} platform users`);
    return emails;
  } catch (error) {
    console.error('❌ Failed to resolve all users:', error.message);
    return [];
  }
};

/**
 * Resolve testers
 */
export const resolveTesters = async () => {
  try {
    const testers = await base44.asServiceRole.entities.TesterProfile.filter({ status: 'active' });
    const emails = testers.map(t => t.user_email);
    console.log(`🧪 Resolved ${emails.length} testers`);
    return emails;
  } catch (error) {
    console.error('❌ Failed to resolve testers:', error.message);
    return [];
  }
};

/**
 * Main resolver function
 */
export const resolve = async ({ actor, tenantId = null, roles = null }) => {
  switch (actor) {
    case 'admin':
      return resolveAdmins({ roles: roles || ['admin', 'super_admin', 'manager', 'staff'] });
    
    case 'tenant':
      if (!tenantId) {
        console.error('❌ Tenant ID required for tenant notifications');
        return [];
      }
      return resolveTenantUsers(tenantId, { roles: roles || ['owner', 'admin'] });
    
    case 'tester':
      return resolveTesters();
    
    case 'client':
      // Client notifications are always targeted, not broadcast
      console.warn('⚠️ Client notifications should have explicit recipient');
      return [];
    
    default:
      console.error('❌ Unknown actor:', actor);
      return [];
  }
};

export const recipientResolver = {
  resolve,
  resolveAdmins,
  resolveTenantUsers,
  resolveAllUsers,
  resolveTesters
};

export default recipientResolver;