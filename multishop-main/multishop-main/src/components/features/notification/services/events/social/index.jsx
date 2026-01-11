
/**
 * Social Event Handlers - Public API
 * 
 * Domain: Social, Review, Community
 */

export { registerSocialHandlers, handlePostLiked, handlePostCommented, handleUserMentioned, handleUserFollowed, handleCommentReplied } from './SocialEventHandler';
export { registerReviewHandlers, handleReviewCreated, handleReviewApproved, handleReviewRejected, handleReviewResponseAdded } from './ReviewEventHandler';

/**
 * Register all social domain handlers (uses static imports from above)
 */
export const registerSocialDomainHandlers = (registry) => {
  registerSocialHandlers(registry);
  registerReviewHandlers(registry);
  
  // Social domain handlers registered
};
