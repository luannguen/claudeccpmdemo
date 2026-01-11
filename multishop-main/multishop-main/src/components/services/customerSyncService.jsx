/**
 * Customer Sync Service
 * Data/Service Layer
 * 
 * Single Goal: Sync data giữa Customer entity và User profile
 * 
 * Pattern: Lazy Sync
 * - Customer = Master data (single source of truth)
 * - User.preferences = Cached + editable
 * - Sync on-demand (login, checkout, profile view)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONSTANTS ==========

const SYNC_FIELDS = ['full_name', 'phone', 'city', 'district', 'ward', 'address'];

// ========== SYNC OPERATIONS ==========

/**
 * Sync Customer data → User.preferences
 * @param {string} userEmail
 * @returns {Promise<Result<Object>>}
 */
export async function syncCustomerToUserProfile(userEmail) {
  try {
    if (!userEmail) {
      return failure('Email không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Get Customer data
    const customers = await base44.entities.Customer.filter({ email: userEmail });
    const customer = customers.find(c => !c.tenant_id); // Platform customer
    
    if (!customer) {
      return failure('Không tìm thấy Customer', ErrorCodes.NOT_FOUND);
    }
    
    // Get current User
    const user = await base44.auth.me();
    if (!user) {
      return failure('Không tìm thấy User', ErrorCodes.UNAUTHORIZED);
    }
    
    // Check if manually edited
    const currentPrefs = user.preferences || {};
    if (currentPrefs.shipping_manually_edited && !currentPrefs.allow_auto_sync) {
      return success({
        synced: false,
        reason: 'User đã tắt auto-sync',
        data: currentPrefs.default_shipping
      });
    }
    
    // Prepare sync data
    const syncedShipping = {
      full_name: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      district: customer.district,
      ward: customer.ward,
      address: customer.address
    };
    
    // Update User.preferences
    const updatedPreferences = {
      ...currentPrefs,
      default_shipping: syncedShipping,
      customer_synced_at: new Date().toISOString(),
      customer_last_id: customer.id,
      allow_auto_sync: currentPrefs.allow_auto_sync ?? true
    };
    
    await base44.auth.updateMe({ preferences: updatedPreferences });
    
    return success({
      synced: true,
      data: syncedShipping,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return failure(err.message || 'Lỗi sync data', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get merged profile (User + Customer data)
 * @param {string} userEmail
 * @returns {Promise<Result<Object>>}
 */
export async function getUserProfileWithCustomerData(userEmail) {
  try {
    if (!userEmail) {
      return failure('Email không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Get User
    const user = await base44.auth.me();
    if (!user) {
      return failure('Chưa đăng nhập', ErrorCodes.UNAUTHORIZED);
    }
    
    // Get Customer
    const customers = await base44.entities.Customer.filter({ email: userEmail });
    const customer = customers.find(c => !c.tenant_id);
    
    // Merge data - priority: User.preferences > Customer
    const preferences = user.preferences || {};
    const defaultShipping = preferences.default_shipping || {};
    
    const mergedProfile = {
      // User info
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      
      // Shipping info (ưu tiên User.preferences nếu đã edit)
      shipping: {
        full_name: defaultShipping.full_name || customer?.full_name || user.full_name,
        phone: defaultShipping.phone || customer?.phone || user.phone,
        email: defaultShipping.email || customer?.email || user.email,
        city: defaultShipping.city || customer?.city || '',
        district: defaultShipping.district || customer?.district || '',
        ward: defaultShipping.ward || customer?.ward || '',
        address: defaultShipping.address || customer?.address || ''
      },
      
      // Metadata
      customer_exists: !!customer,
      customer_id: customer?.id,
      referrer_id: customer?.referrer_id,
      is_referred_customer: customer?.is_referred_customer || false,
      synced_at: preferences.customer_synced_at,
      manually_edited: preferences.shipping_manually_edited || false,
      allow_auto_sync: preferences.allow_auto_sync ?? true
    };
    
    return success(mergedProfile);
  } catch (err) {
    return failure(err.message || 'Lỗi lấy profile', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Update User shipping preferences (manual edit by user)
 * @param {Object} shippingData
 * @returns {Promise<Result<Object>>}
 */
export async function updateUserShippingPreferences(shippingData) {
  try {
    const user = await base44.auth.me();
    if (!user) {
      return failure('Chưa đăng nhập', ErrorCodes.UNAUTHORIZED);
    }
    
    const currentPrefs = user.preferences || {};
    
    const updatedPreferences = {
      ...currentPrefs,
      default_shipping: {
        ...shippingData,
        updated_at: new Date().toISOString()
      },
      shipping_manually_edited: true,
      shipping_manual_edit_count: (currentPrefs.shipping_manual_edit_count || 0) + 1
    };
    
    await base44.auth.updateMe({ preferences: updatedPreferences });
    
    return success(updatedPreferences.default_shipping);
  } catch (err) {
    return failure(err.message || 'Lỗi cập nhật', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Toggle auto-sync preference
 * @param {boolean} enabled
 * @returns {Promise<Result<boolean>>}
 */
export async function toggleAutoSync(enabled) {
  try {
    const user = await base44.auth.me();
    if (!user) {
      return failure('Chưa đăng nhập', ErrorCodes.UNAUTHORIZED);
    }
    
    const updatedPreferences = {
      ...(user.preferences || {}),
      allow_auto_sync: enabled
    };
    
    await base44.auth.updateMe({ preferences: updatedPreferences });
    
    return success(enabled);
  } catch (err) {
    return failure(err.message || 'Lỗi cập nhật', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Check if sync needed
 * @param {string} userEmail
 * @returns {Promise<Result<Object>>}
 */
export async function checkSyncNeeded(userEmail) {
  try {
    const user = await base44.auth.me();
    if (!user || user.email !== userEmail) {
      return failure('Unauthorized', ErrorCodes.UNAUTHORIZED);
    }
    
    const customers = await base44.entities.Customer.filter({ email: userEmail });
    const customer = customers.find(c => !c.tenant_id);
    
    if (!customer) {
      return success({ needed: false, reason: 'No customer record' });
    }
    
    const prefs = user.preferences || {};
    const lastSync = prefs.customer_synced_at;
    const customerUpdated = customer.updated_date;
    
    // Check if customer updated after last sync
    const needed = !lastSync || 
                   new Date(customerUpdated) > new Date(lastSync) ||
                   !prefs.default_shipping;
    
    return success({
      needed,
      lastSync,
      customerUpdated,
      customer_id: customer.id,
      auto_sync_enabled: prefs.allow_auto_sync ?? true
    });
  } catch (err) {
    return failure(err.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  syncCustomerToUserProfile,
  getUserProfileWithCustomerData,
  updateUserShippingPreferences,
  toggleAutoSync,
  checkSyncNeeded
};