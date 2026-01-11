/**
 * Contributor Repository
 * Data layer for BookContributor entity
 */

import { base44 } from '@/api/base44Client';

// Role-based default permissions
const ROLE_PERMISSIONS = {
  owner: {
    can_add_chapter: true,
    can_edit_chapter: true,
    can_delete_chapter: true,
    can_publish_chapter: true,
    can_invite_others: true,
    can_edit_book_settings: true
  },
  editor: {
    can_add_chapter: true,
    can_edit_chapter: true,
    can_delete_chapter: true,
    can_publish_chapter: true,
    can_invite_others: true,
    can_edit_book_settings: false
  },
  contributor: {
    can_add_chapter: true,
    can_edit_chapter: false,
    can_delete_chapter: false,
    can_publish_chapter: false,
    can_invite_others: false,
    can_edit_book_settings: false
  },
  viewer: {
    can_add_chapter: false,
    can_edit_chapter: false,
    can_delete_chapter: false,
    can_publish_chapter: false,
    can_invite_others: false,
    can_edit_book_settings: false
  }
};

export const contributorRepository = {
  /**
   * List contributors for a book
   */
  listByBook: async (bookId) => {
    const all = await base44.entities.BookContributor.filter(
      { book_id: bookId },
      '-created_date',
      100
    );
    return all;
  },

  /**
   * List pending invitations for a user
   */
  listPendingForUser: async (userEmail) => {
    const all = await base44.entities.BookContributor.filter(
      { user_email: userEmail, status: 'pending' },
      '-created_date',
      50
    );
    return all;
  },

  /**
   * List all contributions by a user
   */
  listByUser: async (userEmail) => {
    const all = await base44.entities.BookContributor.filter(
      { user_email: userEmail, status: 'accepted' },
      '-created_date',
      100
    );
    return all;
  },

  /**
   * Get contributor record
   */
  get: async (bookId, userEmail) => {
    const all = await base44.entities.BookContributor.filter(
      { book_id: bookId, user_email: userEmail },
      '-created_date',
      1
    );
    return all[0] || null;
  },

  /**
   * Get by ID
   */
  getById: async (id) => {
    return await base44.entities.BookContributor.get(id);
  },

  /**
   * Invite a contributor
   */
  invite: async (bookId, userData, inviterEmail, role = 'contributor', note = '') => {
    const existing = await contributorRepository.get(bookId, userData.email);
    
    if (existing) {
      // Re-invite if previously rejected/removed
      if (existing.status === 'rejected' || existing.status === 'removed') {
        return await base44.entities.BookContributor.update(existing.id, {
          status: 'pending',
          role,
          invited_by: inviterEmail,
          invited_date: new Date().toISOString(),
          note,
          permissions: ROLE_PERMISSIONS[role]
        });
      }
      return existing; // Already invited or member
    }

    return await base44.entities.BookContributor.create({
      book_id: bookId,
      user_email: userData.email,
      user_name: userData.name || userData.full_name,
      user_avatar: userData.avatar,
      role,
      status: 'pending',
      invited_by: inviterEmail,
      invited_date: new Date().toISOString(),
      note,
      permissions: ROLE_PERMISSIONS[role],
      chapters_contributed: 0,
      words_contributed: 0
    });
  },

  /**
   * Accept invitation
   */
  accept: async (contributorId) => {
    return await base44.entities.BookContributor.update(contributorId, {
      status: 'accepted',
      accepted_date: new Date().toISOString()
    });
  },

  /**
   * Reject invitation
   */
  reject: async (contributorId) => {
    return await base44.entities.BookContributor.update(contributorId, {
      status: 'rejected'
    });
  },

  /**
   * Remove contributor
   */
  remove: async (contributorId) => {
    return await base44.entities.BookContributor.update(contributorId, {
      status: 'removed'
    });
  },

  /**
   * Update role and permissions
   */
  updateRole: async (contributorId, newRole) => {
    return await base44.entities.BookContributor.update(contributorId, {
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole]
    });
  },

  /**
   * Update custom permissions
   */
  updatePermissions: async (contributorId, permissions) => {
    return await base44.entities.BookContributor.update(contributorId, {
      permissions
    });
  },

  /**
   * Record contribution
   */
  recordContribution: async (contributorId, wordsAdded) => {
    const contributor = await base44.entities.BookContributor.get(contributorId);
    return await base44.entities.BookContributor.update(contributorId, {
      chapters_contributed: (contributor.chapters_contributed || 0) + 1,
      words_contributed: (contributor.words_contributed || 0) + wordsAdded,
      last_contribution_date: new Date().toISOString()
    });
  },

  /**
   * Check if user has permission
   */
  hasPermission: async (bookId, userEmail, permission) => {
    const contributor = await contributorRepository.get(bookId, userEmail);
    if (!contributor || contributor.status !== 'accepted') return false;
    return contributor.permissions?.[permission] || false;
  },

  /**
   * Get user's role in a book
   */
  getUserRole: async (bookId, userEmail) => {
    const contributor = await contributorRepository.get(bookId, userEmail);
    if (!contributor || contributor.status !== 'accepted') return null;
    return contributor.role;
  }
};

export { ROLE_PERMISSIONS };
export default contributorRepository;