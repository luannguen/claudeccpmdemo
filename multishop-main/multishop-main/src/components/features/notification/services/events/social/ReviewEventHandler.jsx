/**
 * Review Event Handler - Social domain
 * 
 * Handles: review.created, review.approved, review.rejected, review.response_added
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { ReviewEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle new review created
 */
export const handleReviewCreated = async (payload) => {
  const { review, product } = payload;

  console.log('⭐ [ReviewEventHandler] review.created:', product?.name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'new_review',
    recipients: null,
    payload: {
      title: `⭐ Đánh Giá Mới Cho ${product?.name || 'Sản phẩm'}`,
      message: `${review.customer_name} đã đánh giá ${review.rating} sao`,
      link: createPageUrl('AdminReviews'),
      priority: 'normal',
      metadata: {
        review_id: review.id,
        product_id: review.product_id,
        product_name: product?.name,
        rating: review.rating,
        customer_name: review.customer_name,
        has_images: (review.images?.length || 0) > 0,
        has_videos: (review.videos?.length || 0) > 0
      }
    },
    routing: {
      related_entity_type: 'Review',
      related_entity_id: review.id
    }
  });
};

/**
 * Handle review approved
 */
export const handleReviewApproved = async (payload) => {
  const { review, product } = payload;

  console.log('✅ [ReviewEventHandler] review.approved:', review.id);

  if (review.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'review_approved',
      recipients: review.customer_email,
      payload: {
        title: '✅ Đánh Giá Đã Được Duyệt',
        message: `Đánh giá của bạn cho sản phẩm "${product?.name}" đã được duyệt và hiển thị công khai`,
        link: createPageUrl('ProductDetail') + `?id=${review.product_id}`,
        priority: 'normal',
        metadata: {
          review_id: review.id,
          product_id: review.product_id,
          product_name: product?.name
        }
      }
    });
  }
};

/**
 * Handle review rejected
 */
export const handleReviewRejected = async (payload) => {
  const { review, product, reason } = payload;

  console.log('❌ [ReviewEventHandler] review.rejected:', review.id);

  if (review.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'review_rejected',
      recipients: review.customer_email,
      payload: {
        title: '❌ Đánh Giá Không Được Duyệt',
        message: reason || `Đánh giá của bạn cho sản phẩm "${product?.name}" không được duyệt`,
        link: createPageUrl('MyOrders'),
        priority: 'normal',
        metadata: {
          review_id: review.id,
          product_id: review.product_id,
          reason
        }
      }
    });
  }
};

/**
 * Handle seller response added
 */
export const handleReviewResponseAdded = async (payload) => {
  const { review, product, response } = payload;

  console.log('💬 [ReviewEventHandler] review.response_added:', review.id);

  if (review.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'review_response',
      recipients: review.customer_email,
      payload: {
        title: '💬 Phản Hồi Từ Người Bán',
        message: `Người bán đã phản hồi đánh giá của bạn cho sản phẩm "${product?.name}"`,
        link: createPageUrl('ProductDetail') + `?id=${review.product_id}`,
        priority: 'normal',
        metadata: {
          review_id: review.id,
          product_id: review.product_id,
          response_preview: response?.slice(0, 100)
        }
      }
    });
  }
};

/**
 * Register all review event handlers
 */
export const registerReviewHandlers = (registry) => {
  registry.register(ReviewEvents.CREATED, handleReviewCreated, { priority: 6 });
  registry.register(ReviewEvents.APPROVED, handleReviewApproved, { priority: 5 });
  registry.register(ReviewEvents.REJECTED, handleReviewRejected, { priority: 5 });
  registry.register(ReviewEvents.RESPONSE_ADDED, handleReviewResponseAdded, { priority: 5 });
  
  console.log('✅ Review event handlers registered');
};

export default {
  handleReviewCreated,
  handleReviewApproved,
  handleReviewRejected,
  handleReviewResponseAdded,
  registerReviewHandlers
};