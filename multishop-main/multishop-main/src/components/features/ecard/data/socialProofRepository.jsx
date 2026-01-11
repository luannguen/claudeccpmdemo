/**
 * socialProofRepository - ECARD-F17: Micro Social Proof
 * Data layer để aggregate social proof stats cho E-Card
 */

import { base44 } from "@/api/base44Client";

export const socialProofRepository = {
  /**
   * Lấy social proof stats cho một E-Card profile
   * Đếm số order và gift liên quan đến E-Card đó
   */
  getStats: async (profileId, userEmail) => {
    if (!profileId && !userEmail) {
      return {
        totalOrders: 0,
        totalGifts: 0,
        hasReferral: false
      };
    }

    try {
      // Đếm số orders có referrer từ E-Card này
      // Orders được đặt qua referral link của E-Card owner
      let orderCount = 0;
      if (userEmail) {
        const orders = await base44.entities.Order.filter({
          created_by: userEmail
        });
        // Chỉ đếm orders thành công (delivered, shipping, processing)
        const successStatuses = ['delivered', 'shipping', 'processing', 'confirmed'];
        orderCount = orders.filter(o => successStatuses.includes(o.order_status)).length;
      }

      // Đếm số gifts đã gửi/nhận qua E-Card
      let giftCount = 0;
      if (userEmail) {
        const gifts = await base44.entities.GiftTransaction.filter({
          sender_email: userEmail,
          status: 'completed'
        });
        giftCount = gifts.length;
      }

      // Check xem có referral member active không
      let hasReferral = false;
      if (userEmail) {
        const members = await base44.entities.ReferralMember.filter({
          user_email: userEmail,
          status: 'active'
        });
        hasReferral = members.length > 0;
      }

      return {
        totalOrders: orderCount,
        totalGifts: giftCount,
        hasReferral
      };
    } catch (error) {
      console.error('[SocialProofRepository] Error fetching stats:', error);
      return {
        totalOrders: 0,
        totalGifts: 0,
        hasReferral: false
      };
    }
  },

  /**
   * Lấy stats từ EcardProfile cache (nếu có)
   * Dùng connection_count, gifts_received, gifts_sent
   */
  getStatsFromCache: (profile) => {
    if (!profile) {
      return {
        connectionCount: 0,
        giftsReceived: 0,
        giftsSent: 0
      };
    }

    return {
      connectionCount: profile.connection_count || 0,
      giftsReceived: profile.gifts_received || 0,
      giftsSent: profile.gifts_sent || 0
    };
  }
};

export default socialProofRepository;