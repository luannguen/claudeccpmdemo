/**
 * 🎯 Loyalty Service - Business logic cho hệ thống loyalty
 * 
 * Service Layer - Tuân thủ AI-CODING-RULES
 * - Trả về Result<T>
 * - Dùng ErrorCodes
 * - KHÔNG import service khác (dùng loyaltyCore)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import loyaltyCore from './loyaltyCore';
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';

// ========== ACCOUNT MANAGEMENT ==========

/**
 * Lấy hoặc tạo loyalty account cho user
 */
async function getOrCreateAccount(userEmail, userName) {
  try {
    // Use list + find instead of filter to avoid SDK issues
    const allAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const accounts = allAccounts.filter(a => a.user_email === userEmail);
    
    if (accounts.length > 0) {
      return success(accounts[0]);
    }
    
    // Tạo mới với welcome bonus
    const account = await base44.entities.LoyaltyAccount.create({
      user_email: userEmail,
      user_name: userName,
      total_points: loyaltyCore.POINTS_CONFIG.welcomeBonus,
      lifetime_points: loyaltyCore.POINTS_CONFIG.welcomeBonus,
      tier: 'bronze',
      tier_benefits: loyaltyCore.getTierBenefits('bronze'),
      points_history: [{
        date: new Date().toISOString(),
        points: loyaltyCore.POINTS_CONFIG.welcomeBonus,
        type: 'bonus',
        description: 'Điểm chào mừng thành viên mới',
        expiration_date: loyaltyCore.createExpirationDate()
      }],
      status: 'active'
    });
    
    return success(account);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Cập nhật tier dựa trên lifetime points
 */
async function updateTier(accountId, lifetimePoints) {
  try {
    const newTier = loyaltyCore.calculateTier(lifetimePoints);
    const tierProgress = loyaltyCore.calculateTierProgress(lifetimePoints);
    const pointsToNext = loyaltyCore.pointsToNextTier(lifetimePoints);
    const tierBenefits = loyaltyCore.getTierBenefits(newTier);
    
    await base44.entities.LoyaltyAccount.update(accountId, {
      tier: newTier,
      tier_progress: tierProgress,
      points_to_next_tier: pointsToNext,
      tier_benefits: tierBenefits
    });
    
    return success({ tier: newTier, upgraded: true });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== EARN POINTS ==========

/**
 * Tích điểm khi đơn hàng hoàn thành
 */
async function earnPointsFromOrder(orderId, customerEmail, customerName, orderAmount) {
  try {
    // Get account
    const accountResult = await getOrCreateAccount(customerEmail, customerName);
    if (!accountResult.success) return accountResult;
    
    const account = accountResult.data;
    
    // Kiểm tra đã tích điểm chưa - use list + find
    const allOrders = await base44.entities.Order.list('-created_date', 200);
    const orders = allOrders.filter(o => o.id === orderId);
    if (orders.length === 0 || orders[0].loyalty_processed) {
      return failure('Đơn hàng không hợp lệ hoặc đã tích điểm', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Tính điểm bonus từ referral (nếu có)
    let referralBonus = 0;
    const allMembers = await base44.entities.ReferralMember.list('-created_date', 500);
    const referralMembers = allMembers.filter(m => m.user_email === customerEmail);
    if (referralMembers.length > 0) {
      referralBonus = loyaltyCore.getReferralRankBonus(referralMembers[0].seeder_rank);
    }
    
    // Tính điểm earned
    const earnedPoints = loyaltyCore.calculateEarnedPoints(orderAmount, account.tier, referralBonus);
    
    // Update account
    const newTotalPoints = account.total_points + earnedPoints;
    const newLifetimePoints = account.lifetime_points + earnedPoints;
    
    const history = [...(account.points_history || []), {
      date: new Date().toISOString(),
      points: earnedPoints,
      type: 'earned',
      description: `Tích điểm từ đơn hàng`,
      order_id: orderId,
      expiration_date: loyaltyCore.createExpirationDate()
    }];
    
    await base44.entities.LoyaltyAccount.update(account.id, {
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      points_history: history,
      total_orders_platform: (account.total_orders_platform || 0) + 1,
      total_spent_platform: (account.total_spent_platform || 0) + orderAmount,
      last_order_date: new Date().toISOString(),
      first_order_date: account.first_order_date || new Date().toISOString()
    });
    
    // Update tier nếu cần
    const tierResult = await updateTier(account.id, newLifetimePoints);
    
    // 📧 Check if tier upgraded and send email
    if (tierResult.success && tierResult.data.tier !== account.tier) {
      eventBus.publish(EMAIL_EVENT_TYPES.TIER_UPGRADED, {
        userEmail: customerEmail,
        userName: customerName,
        newTier: tierResult.data.tier,
        benefits: loyaltyCore.getTierBenefits(tierResult.data.tier)
      });
    }
    
    // Mark order processed
    await base44.entities.Order.update(orderId, {
      loyalty_points_earned: earnedPoints,
      loyalty_tier_at_time: account.tier,
      loyalty_processed: true
    });
    
    return success({ earnedPoints, newTotalPoints, tier: account.tier });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== REDEEM POINTS ==========

/**
 * Tiêu điểm để giảm giá đơn hàng
 */
async function redeemPoints(customerEmail, points, orderAmount) {
  try {
    const allAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const accounts = allAccounts.filter(a => a.user_email === customerEmail);
    if (accounts.length === 0) {
      return failure('Tài khoản loyalty không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const account = accounts[0];
    
    // Validate redemption
    const validation = loyaltyCore.validateRedemption(points, orderAmount, account.total_points);
    if (!validation.valid) {
      return failure(validation.error, ErrorCodes.VALIDATION_ERROR);
    }
    
    // Update account (chưa trừ điểm thật, đợi order completed)
    return success({
      discountAmount: validation.discountAmount,
      pointsToRedeem: points,
      accountId: account.id
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Confirm tiêu điểm sau khi order completed
 */
async function confirmRedemption(accountId, points, orderId) {
  try {
    const allAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const accounts = allAccounts.filter(a => a.id === accountId);
    if (accounts.length === 0) {
      return failure('Account không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const account = accounts[0];
    const newTotalPoints = account.total_points - points;
    
    const history = [...(account.points_history || []), {
      date: new Date().toISOString(),
      points: -points,
      type: 'redeemed',
      description: `Tiêu điểm mua hàng`,
      order_id: orderId
    }];
    
    await base44.entities.LoyaltyAccount.update(accountId, {
      total_points: newTotalPoints,
      points_used: (account.points_used || 0) + points,
      points_history: history
    });
    
    return success({ newTotalPoints });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== ADMIN OPERATIONS ==========

/**
 * Admin điều chỉnh điểm
 */
async function adjustPoints(accountId, points, reason, adminEmail) {
  try {
    if (!accountId || typeof points !== 'number') {
      return failure('Dữ liệu không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }
    
    const allAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const accounts = allAccounts.filter(a => a.id === accountId);
    if (accounts.length === 0) {
      return failure('Account không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const account = accounts[0];
    const newTotalPoints = Math.max(0, account.total_points + points);
    const newLifetimePoints = points > 0 ? account.lifetime_points + points : account.lifetime_points;
    
    const history = [...(account.points_history || []), {
      date: new Date().toISOString(),
      points: points,
      type: 'adjusted',
      description: `Admin điều chỉnh: ${reason || 'Không ghi chú'}`,
      expiration_date: points > 0 ? loyaltyCore.createExpirationDate() : null
    }];
    
    await base44.entities.LoyaltyAccount.update(accountId, {
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      points_history: history
    });
    
    // Update tier nếu cần
    if (points > 0) {
      await updateTier(accountId, newLifetimePoints);
    }
    
    return success({ newTotalPoints, newLifetimePoints });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Process points expiration
 */
async function processExpiredPoints() {
  try {
    const accounts = await base44.entities.LoyaltyAccount.list('-updated_date', 500);
    const now = new Date();
    let processedCount = 0;
    
    for (const account of accounts) {
      const history = account.points_history || [];
      let expiredPoints = 0;
      
      const updatedHistory = history.map(entry => {
        if (entry.type === 'earned' && entry.expiration_date) {
          const expDate = new Date(entry.expiration_date);
          if (expDate <= now && entry.points > 0) {
            expiredPoints += entry.points;
            return { ...entry, points: 0, expired: true };
          }
        }
        return entry;
      });
      
      if (expiredPoints > 0) {
        updatedHistory.push({
          date: new Date().toISOString(),
          points: -expiredPoints,
          type: 'expired',
          description: 'Điểm hết hạn tự động'
        });
        
        const newTotalPoints = Math.max(0, account.total_points - expiredPoints);
        
        await base44.entities.LoyaltyAccount.update(account.id, {
          total_points: newTotalPoints,
          points_history: updatedHistory
        });
        
        processedCount++;
        
        // Notify user (push notification)
        if (expiredPoints > 0) {
          await base44.entities.Notification.create({
            recipient_email: account.user_email,
            type: 'loyalty_points_expired',
            title: '⏰ Điểm loyalty đã hết hạn',
            message: `${expiredPoints} điểm của bạn đã hết hạn. Hãy sử dụng điểm trước khi mất nhé!`,
            priority: 'normal'
          });
        }
      }
    }
    
    // Send warning emails for accounts with points expiring in 7 days
    for (const account of accounts) {
      const { expiringPoints, nextExpirationDate } = loyaltyCore.calculateExpiringPoints(account.points_history || []);
      
      if (expiringPoints > 0 && nextExpirationDate) {
        const daysUntilExpiry = Math.ceil((new Date(nextExpirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        // Send email reminder at 7 days, 3 days, 1 day
        if ([7, 3, 1].includes(daysUntilExpiry)) {
          eventBus.publish(EMAIL_EVENT_TYPES.POINTS_EXPIRING_SOON, {
            userEmail: account.user_email,
            userName: account.user_name,
            points: expiringPoints,
            expiryDate: nextExpirationDate
          });
        }
      }
    }
    
    return success({ processedAccounts: processedCount });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Update expiring points warning
 */
async function updateExpiringPointsWarning(accountId) {
  try {
    const allAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const accounts = allAccounts.filter(a => a.id === accountId);
    if (accounts.length === 0) return failure('Account not found', ErrorCodes.NOT_FOUND);
    
    const account = accounts[0];
    const { expiringPoints, nextExpirationDate } = loyaltyCore.calculateExpiringPoints(account.points_history || []);
    
    await base44.entities.LoyaltyAccount.update(accountId, {
      points_expiring_soon: expiringPoints,
      next_expiration_date: nextExpirationDate
    });
    
    return success({ expiringPoints, nextExpirationDate });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== STATS ==========

async function getLoyaltyStats() {
  try {
    const accounts = await base44.entities.LoyaltyAccount.list('-updated_date', 1000);
    
    const stats = {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.status === 'active').length,
      totalPointsIssued: accounts.reduce((sum, a) => sum + (a.lifetime_points || 0), 0),
      totalPointsRedeemed: accounts.reduce((sum, a) => sum + (a.points_used || 0), 0),
      totalPointsActive: accounts.reduce((sum, a) => sum + (a.total_points || 0), 0),
      byTier: {
        bronze: accounts.filter(a => a.tier === 'bronze').length,
        silver: accounts.filter(a => a.tier === 'silver').length,
        gold: accounts.filter(a => a.tier === 'gold').length,
        platinum: accounts.filter(a => a.tier === 'platinum').length
      },
      avgPointsPerAccount: Math.round(accounts.reduce((sum, a) => sum + (a.total_points || 0), 0) / accounts.length),
      topMembers: [...accounts]
        .filter(a => a.status === 'active')
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 10)
    };
    
    return success(stats);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== EXPORTS ==========

export const loyaltyService = {
  getOrCreateAccount,
  updateTier,
  earnPointsFromOrder,
  redeemPoints,
  confirmRedemption,
  adjustPoints,
  processExpiredPoints,
  updateExpiringPointsWarning,
  getLoyaltyStats
};

export default loyaltyService;