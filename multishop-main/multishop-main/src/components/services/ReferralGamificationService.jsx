/**
 * ReferralGamificationService - Gamification logic
 * Data/Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '../data/types';

// ========== MILESTONE DEFINITIONS ==========

export const MILESTONES = [
  { id: 'first_customer', threshold: 1, title: 'Khách Hàng Đầu Tiên', icon: 'UserPlus', reward: 10000 },
  { id: 'five_customers', threshold: 5, title: '5 Khách Hàng', icon: 'Users', reward: 50000 },
  { id: 'first_million', threshold: 1000000, title: 'Triệu Đầu Tiên', icon: 'DollarSign', reward: 100000 },
  { id: 'ten_million', threshold: 10000000, title: '10 Triệu Doanh Số', icon: 'TrendingUp', reward: 500000 },
  { id: 'rank_upgrade', threshold: 0, title: 'Thăng Cấp Bậc', icon: 'Award', reward: 200000 },
  { id: 'top_10', threshold: 0, title: 'Top 10 CTV', icon: 'Trophy', reward: 300000 },
  { id: 'perfect_month', threshold: 0, title: 'Tháng Hoàn Hảo', icon: 'Star', reward: 1000000 }
];

// ========== CHECK MILESTONES ==========

export async function checkAndAwardMilestones(memberId) {
  try {
    const members = await base44.entities.ReferralMember.filter({ id: memberId });
    if (members.length === 0) return failure('Member not found', ErrorCodes.NOT_FOUND);
    
    const member = members[0];
    const achievements = await base44.entities.ReferralAchievement.filter({ user_email: member.user_email });
    const existingIds = achievements.map(a => a.achievement_id);
    const newAchievements = [];
    
    // Check each milestone
    for (const milestone of MILESTONES) {
      if (existingIds.includes(milestone.id)) continue;
      
      let achieved = false;
      
      switch (milestone.id) {
        case 'first_customer':
          achieved = member.total_referred_customers >= 1;
          break;
        case 'five_customers':
          achieved = member.total_referred_customers >= 5;
          break;
        case 'first_million':
          achieved = member.total_referral_revenue >= 1000000;
          break;
        case 'ten_million':
          achieved = member.total_referral_revenue >= 10000000;
          break;
        case 'rank_upgrade':
          achieved = member.seeder_rank !== 'nguoi_gieo_hat';
          break;
      }
      
      if (achieved) {
        const achievement = await base44.entities.ReferralAchievement.create({
          user_email: member.user_email,
          achievement_id: milestone.id,
          achievement_name: milestone.title,
          unlocked_date: new Date().toISOString(),
          tier: 'gold',
          points: milestone.reward,
          badge_icon: milestone.icon
        });
        
        newAchievements.push(achievement);
        
        // Notification
        await base44.entities.Notification.create({
          recipient_email: member.user_email,
          type: 'achievement',
          title: `🏆 Thành tựu mới: ${milestone.title}!`,
          message: `Chúc mừng! Bạn nhận ${milestone.reward.toLocaleString('vi-VN')}đ thưởng`,
          priority: 'high'
        });
      }
    }
    
    return success(newAchievements);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== LEADERBOARD ==========

export async function getRealtimeLeaderboard(period = 'all') {
  try {
    const members = await base44.entities.ReferralMember.filter({ status: 'active' }, '-total_referral_revenue', 50);
    
    let filtered = members;
    if (period === 'month') {
      filtered = members.sort((a, b) => (b.current_month_revenue || 0) - (a.current_month_revenue || 0));
    }
    
    const leaderboard = filtered.map((m, index) => ({
      rank: index + 1,
      id: m.id,
      name: m.full_name,
      email: m.user_email,
      code: m.referral_code,
      customers: m.total_referred_customers || 0,
      revenue: period === 'month' ? m.current_month_revenue || 0 : m.total_referral_revenue || 0,
      commission: m.unpaid_commission + m.total_paid_commission || 0,
      rank_level: m.seeder_rank,
      avatar: m.full_name?.charAt(0)?.toUpperCase()
    }));
    
    return success(leaderboard);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== PERFORMANCE INSIGHTS ==========

export async function getPerformanceInsights(memberId) {
  try {
    const members = await base44.entities.ReferralMember.filter({ id: memberId });
    if (members.length === 0) return failure('Member not found', ErrorCodes.NOT_FOUND);
    
    const member = members[0];
    const events = await base44.entities.ReferralEvent.filter({ referrer_id: memberId }, '-created_date', 200);
    const customers = await base44.entities.Customer.filter({ referrer_id: memberId });
    
    // Calculate metrics
    const avgOrderValue = events.length > 0 
      ? events.reduce((sum, e) => sum + (e.order_amount || 0), 0) / events.length 
      : 0;
    
    const conversionRate = customers.length > 0
      ? (customers.filter(c => (c.total_orders || 0) > 0).length / customers.length) * 100
      : 0;
    
    const repeatRate = customers.filter(c => (c.total_orders || 0) > 1).length;
    
    // Get all members for ranking
    const allMembers = await base44.entities.ReferralMember.list('-total_referral_revenue', 1000);
    const myRank = allMembers.findIndex(m => m.id === memberId) + 1;
    const percentile = ((allMembers.length - myRank) / allMembers.length) * 100;
    
    // Recommendations
    const recommendations = [];
    
    if (conversionRate < 30) {
      recommendations.push({
        type: 'warning',
        title: 'Tỷ lệ chuyển đổi thấp',
        message: 'Chỉ ' + conversionRate.toFixed(1) + '% khách hàng đã mua hàng. Hãy theo dõi và hỗ trợ họ tốt hơn.',
        action: 'contact_customers'
      });
    }
    
    if (repeatRate < 2) {
      recommendations.push({
        type: 'info',
        title: 'Tăng khách hàng quay lại',
        message: 'Chia sẻ chương trình ưu đãi và combo sản phẩm để khách mua lại.',
        action: 'share_promotions'
      });
    }
    
    if (percentile < 50) {
      recommendations.push({
        type: 'success',
        title: 'Bạn đang xuất sắc!',
        message: `Top ${percentile.toFixed(0)}% CTV hệ thống. Tiếp tục phát huy!`,
        action: null
      });
    }
    
    const nextRankConfig = getNextRankRequirement(member.seeder_rank);
    if (nextRankConfig) {
      recommendations.push({
        type: 'goal',
        title: `Hướng tới ${nextRankConfig.label}`,
        message: `Cần ${nextRankConfig.f1_required - (member.f1_with_purchases || 0)} F1 nữa để thăng cấp`,
        action: 'view_rank_progress'
      });
    }
    
    return success({
      avgOrderValue,
      conversionRate,
      repeatRate,
      myRank,
      totalMembers: allMembers.length,
      percentile,
      recommendations
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

function getNextRankRequirement(currentRank) {
  const ranks = {
    nguoi_gieo_hat: { next: 'hat_giong_khoe', label: 'Hạt Giống Khỏe', f1_required: 7 },
    hat_giong_khoe: { next: 'mam_khoe', label: 'Mầm Khỏe', f1_required: 7 },
    mam_khoe: { next: 'choi_khoe', label: 'Chồi Khỏe', f1_required: 7 },
    choi_khoe: { next: 'canh_khoe', label: 'Cành Khỏe', f1_required: 7 },
    canh_khoe: { next: 'cay_khoe', label: 'Cây Khỏe', f1_required: 7 },
    cay_khoe: { next: 'danh_hieu', label: 'Danh Hiệu', f1_required: 1 }
  };
  
  return ranks[currentRank] || null;
}

// ========== CUSTOMER JOURNEY ==========

export async function getCustomerJourney(customerId) {
  try {
    const customers = await base44.entities.Customer.filter({ id: customerId });
    if (customers.length === 0) return failure('Customer not found', ErrorCodes.NOT_FOUND);
    
    const customer = customers[0];
    
    // Get orders
    const orders = await base44.entities.Order.filter({ customer_email: customer.email }, '-created_date', 50);
    
    // Get activities
    const activities = await base44.entities.UserActivity.filter({ 
      created_by: customer.email 
    }, '-created_date', 100);
    
    // Build timeline
    const timeline = [];
    
    // Referred event
    if (customer.referred_date) {
      timeline.push({
        date: customer.referred_date,
        type: 'referred',
        title: 'Được giới thiệu',
        description: `Tham gia qua mã ${customer.referral_code_used}`,
        icon: 'UserPlus'
      });
    }
    
    // Orders
    orders.forEach(order => {
      timeline.push({
        date: order.created_date,
        type: 'order',
        title: `Đơn hàng #${order.order_number}`,
        description: `${order.total_amount.toLocaleString('vi-VN')}đ - ${order.order_status}`,
        icon: 'ShoppingCart',
        orderId: order.id
      });
    });
    
    // Key activities
    const viewCount = activities.filter(a => a.event_type === 'product_view').length;
    const cartAdds = activities.filter(a => a.event_type === 'product_add_to_cart').length;
    
    if (viewCount > 10) {
      timeline.push({
        date: activities[0]?.created_date,
        type: 'engagement',
        title: 'Tương tác tích cực',
        description: `Đã xem ${viewCount} sản phẩm`,
        icon: 'Eye'
      });
    }
    
    // Sort by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const insights = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0,
      daysSinceReferred: customer.referred_date 
        ? Math.floor((new Date() - new Date(customer.referred_date)) / (1000 * 60 * 60 * 24))
        : 0,
      engagement: {
        views: viewCount,
        cartAdds: cartAdds,
        purchases: orders.length
      },
      status: orders.length === 0 ? 'new' : orders.length >= 3 ? 'loyal' : 'active'
    };
    
    return success({ timeline, insights, customer });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  checkAndAwardMilestones,
  getRealtimeLeaderboard,
  getPerformanceInsights,
  getCustomerJourney,
  MILESTONES
};