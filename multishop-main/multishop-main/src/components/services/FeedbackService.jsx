/**
 * FeedbackService - Xử lý feedback từ users
 * Service Layer - Business Logic Only
 * 
 * Version: 1.0.0
 * Last Updated: 2025-01-08
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONSTANTS ==========

const RATE_LIMITS = {
  GUEST_INTERVAL: 30 * 60 * 1000, // 30 phút
  USER_DAILY_LIMIT: 10,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 2000
};

const CATEGORY_LABELS = {
  bug: 'Báo lỗi',
  feature_request: 'Đề xuất tính năng',
  improvement: 'Cải thiện',
  ui_ux: 'Giao diện/Trải nghiệm',
  performance: 'Hiệu suất',
  other: 'Khác'
};

const PRIORITY_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp'
};

const STATUS_LABELS = {
  new: 'Mới',
  reviewing: 'Đang xem xét',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  rejected: 'Từ chối',
  duplicate: 'Trùng lặp'
};

// ========== HELPER FUNCTIONS ==========

function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    online: navigator.onLine
  };
}

function validateFeedbackData(data) {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Vui lòng nhập tiêu đề');
  }

  if (!data.description || data.description.trim().length < RATE_LIMITS.MIN_DESCRIPTION_LENGTH) {
    errors.push(`Mô tả phải có ít nhất ${RATE_LIMITS.MIN_DESCRIPTION_LENGTH} ký tự`);
  }

  if (data.description && data.description.length > RATE_LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Mô tả không được vượt quá ${RATE_LIMITS.MAX_DESCRIPTION_LENGTH} ký tự`);
  }

  if (!data.category) {
    errors.push('Vui lòng chọn loại feedback');
  }

  return errors;
}

async function checkRateLimit(userEmail) {
  try {
    if (!userEmail) return { allowed: true };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Optimized: filter by user_email only, then filter by date client-side
    const recentFeedbacks = await base44.entities.Feedback.filter(
      { user_email: userEmail },
      '-created_date',
      50
    );

    const last24h = recentFeedbacks.filter(f => 
      new Date(f.created_date) >= new Date(oneDayAgo)
    );

    if (last24h.length >= RATE_LIMITS.USER_DAILY_LIMIT) {
      return {
        allowed: false,
        message: `Bạn đã gửi ${RATE_LIMITS.USER_DAILY_LIMIT} feedback trong 24h. Vui lòng thử lại sau.`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { allowed: true }; // Cho phép nếu có lỗi
  }
}

// ========== MAIN SERVICE FUNCTIONS ==========

/**
 * Tạo feedback mới
 */
async function createFeedback(feedbackData) {
  try {
    // Validate
    const validationErrors = validateFeedbackData(feedbackData);
    if (validationErrors.length > 0) {
      return failure(validationErrors.join(', '), ErrorCodes.VALIDATION_ERROR);
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(feedbackData.user_email);
    if (!rateLimit.allowed) {
      return failure(rateLimit.message, ErrorCodes.FORBIDDEN);
    }

    // Chuẩn bị data
    const feedback = {
      ...feedbackData,
      page_url: window.location.href,
      browser_info: getBrowserInfo(),
      user_agent: navigator.userAgent,
      status: 'new',
      votes: 0,
      voted_by: []
    };

    // Tạo feedback
    const created = await base44.entities.Feedback.create(feedback);

    // Thông báo cho admin
    await notifyAdminNewFeedback(created);

    return success(created);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return failure('Không thể gửi feedback. Vui lòng thử lại.', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Lấy danh sách feedback (cho admin)
 */
async function listFeedbacks(filters = {}) {
  try {
    // Build query object, excluding empty values
    const query = {};

    if (filters.status && filters.status !== 'all' && filters.status !== '') {
      query.status = filters.status;
    }

    if (filters.category && filters.category !== 'all' && filters.category !== '') {
      query.category = filters.category;
    }

    if (filters.priority && filters.priority !== 'all' && filters.priority !== '') {
      query.priority = filters.priority;
    }

    // Get feedbacks
    let feedbacks;
    if (Object.keys(query).length > 0) {
      feedbacks = await base44.entities.Feedback.filter(query, '-created_date', 200);
    } else {
      feedbacks = await base44.entities.Feedback.list('-created_date', 200);
    }

    // Apply text search if provided
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      feedbacks = feedbacks.filter(f => 
        f.title?.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower) ||
        f.user_name?.toLowerCase().includes(searchLower)
      );
    }

    return success(feedbacks);
  } catch (error) {
    console.error('Error listing feedbacks:', error);
    return failure('Không thể tải danh sách feedback', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Cập nhật trạng thái feedback (admin only)
 */
async function updateFeedbackStatus(feedbackId, status, adminNote = '', adminResponse = '') {
  try {
    const user = await base44.auth.me();
    if (user.role !== 'admin') {
      return failure('Không có quyền thực hiện', ErrorCodes.FORBIDDEN);
    }

    const updateData = {
      status,
      reviewed_by: user.email,
      reviewed_date: new Date().toISOString()
    };

    if (adminNote) updateData.admin_note = adminNote;
    if (adminResponse) updateData.admin_response = adminResponse;

    await base44.entities.Feedback.update(feedbackId, updateData);

    // Nếu có response, gửi email cho user (optimized)
    if (adminResponse) {
      const feedbacks = await base44.entities.Feedback.filter({ id: feedbackId }, '-created_date', 1);
      const feedback = feedbacks[0];
      if (feedback?.user_email) {
        await notifyUserFeedbackResolved(feedback, adminResponse);
      }
    }

    return success({ message: 'Đã cập nhật trạng thái' });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return failure('Không thể cập nhật trạng thái', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Vote cho feedback
 */
async function voteFeedback(feedbackId, userEmail) {
  try {
    // Optimized: filter by id instead of list all
    const feedbacks = await base44.entities.Feedback.filter({ id: feedbackId }, '-created_date', 1);
    const feedback = feedbacks[0];
    
    if (!feedback) {
      return failure('Không tìm thấy feedback', ErrorCodes.NOT_FOUND);
    }

    const votedBy = feedback.voted_by || [];
    
    if (votedBy.includes(userEmail)) {
      // Bỏ vote
      await base44.entities.Feedback.update(feedbackId, {
        votes: (feedback.votes || 0) - 1,
        voted_by: votedBy.filter(email => email !== userEmail)
      });
      return success({ voted: false, votes: (feedback.votes || 0) - 1 });
    } else {
      // Thêm vote
      await base44.entities.Feedback.update(feedbackId, {
        votes: (feedback.votes || 0) + 1,
        voted_by: [...votedBy, userEmail]
      });
      return success({ voted: true, votes: (feedback.votes || 0) + 1 });
    }
  } catch (error) {
    console.error('Error voting feedback:', error);
    return failure('Không thể vote', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Đánh dấu spam
 */
async function markAsSpam(feedbackId) {
  try {
    const user = await base44.auth.me();
    if (user.role !== 'admin') {
      return failure('Không có quyền thực hiện', ErrorCodes.FORBIDDEN);
    }

    await base44.entities.Feedback.update(feedbackId, {
      is_spam: true,
      status: 'rejected'
    });

    return success({ message: 'Đã đánh dấu spam' });
  } catch (error) {
    console.error('Error marking spam:', error);
    return failure('Không thể đánh dấu spam', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Lấy thống kê feedback
 */
async function getFeedbackStats() {
  try {
    // Reduced limit from 1000 to 500 - stats should work with recent data
    const allFeedbacks = await base44.entities.Feedback.list('-created_date', 500);
    
    const stats = {
      total: allFeedbacks.length,
      byStatus: {},
      byCategory: {},
      byPriority: {},
      recentCount: 0
    };

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    allFeedbacks.forEach(f => {
      // By status
      stats.byStatus[f.status] = (stats.byStatus[f.status] || 0) + 1;
      
      // By category
      stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
      
      // By priority
      stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
      
      // Recent
      if (new Date(f.created_date) > sevenDaysAgo) {
        stats.recentCount++;
      }
    });

    return success(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    return failure('Không thể tải thống kê', ErrorCodes.SERVER_ERROR);
  }
}

// ========== NOTIFICATION HELPERS ==========

async function notifyAdminNewFeedback(feedback) {
  try {
    await base44.entities.AdminNotification.create({
      type: 'feedback_new',
      title: `Feedback mới: ${feedback.category}`,
      message: `${feedback.user_name || 'Guest'} đã gửi feedback: ${feedback.title}`,
      link: `/admin/feedback?id=${feedback.id}`,
      priority: feedback.priority === 'critical' ? 'high' : 'normal',
      is_read: false
    });
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}

async function notifyUserFeedbackResolved(feedback, response) {
  try {
    if (feedback.user_email) {
      await base44.integrations.Core.SendEmail({
        to: feedback.user_email,
        subject: `Phản hồi về feedback: ${feedback.title}`,
        body: `
          <h2>Cảm ơn bạn đã gửi feedback!</h2>
          <p>Chúng tôi đã xem xét và phản hồi về feedback của bạn:</p>
          <blockquote>${response}</blockquote>
          <p>Trạng thái: ${STATUS_LABELS[feedback.status]}</p>
          <p>Trân trọng,<br>Nông Sản Khỏe Team</p>
        `
      });
    }
  } catch (error) {
    console.error('Error notifying user:', error);
  }
}

// ========== EXPORTS ==========

const FeedbackService = {
  createFeedback,
  listFeedbacks,
  updateFeedbackStatus,
  voteFeedback,
  markAsSpam,
  getFeedbackStats,
  
  // Constants
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  RATE_LIMITS
};

export default FeedbackService;