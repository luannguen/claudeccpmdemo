/**
 * Contributor Domain Rules
 * Business logic for collaboration
 */

import { ROLE_PERMISSIONS } from '../data/contributorRepository';

// Roles hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = ['viewer', 'contributor', 'editor', 'owner'];

export const CONTRIBUTOR_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  REMOVED: 'removed'
};

export const CONTRIBUTOR_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

export const ROLE_LABELS = {
  owner: 'Chủ sách',
  editor: 'Biên tập viên',
  contributor: 'Người đóng góp',
  viewer: 'Người xem'
};

export const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã tham gia',
  rejected: 'Đã từ chối',
  removed: 'Đã rời'
};

/**
 * Check if user can invite others to the book
 */
export function canInviteToBook(book, userEmail, userRole) {
  if (!book || !userEmail) return false;
  
  // Owner can always invite
  if (book.author_email === userEmail) return true;
  
  // Check role permission
  if (userRole === CONTRIBUTOR_ROLES.OWNER || userRole === CONTRIBUTOR_ROLES.EDITOR) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can change another user's role
 */
export function canChangeRole(currentUserRole, targetRole, newRole) {
  const currentLevel = ROLE_HIERARCHY.indexOf(currentUserRole);
  const targetLevel = ROLE_HIERARCHY.indexOf(targetRole);
  const newLevel = ROLE_HIERARCHY.indexOf(newRole);
  
  // Can only change roles lower than own
  // Cannot promote to same or higher level
  return currentLevel > targetLevel && currentLevel > newLevel;
}

/**
 * Check if user can remove a contributor
 */
export function canRemoveContributor(currentUserRole, targetRole) {
  if (targetRole === CONTRIBUTOR_ROLES.OWNER) return false;
  
  const currentLevel = ROLE_HIERARCHY.indexOf(currentUserRole);
  const targetLevel = ROLE_HIERARCHY.indexOf(targetRole);
  
  return currentLevel > targetLevel;
}

/**
 * Get available roles for inviting (based on inviter's role)
 */
export function getInvitableRoles(inviterRole) {
  const inviterLevel = ROLE_HIERARCHY.indexOf(inviterRole);
  
  // Can only invite to roles lower than own (excluding owner)
  return ROLE_HIERARCHY
    .slice(0, inviterLevel)
    .filter(role => role !== CONTRIBUTOR_ROLES.OWNER);
}

/**
 * Validate invite data
 */
export function validateInvite(data) {
  const errors = [];
  
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email không được để trống' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' });
  }
  
  if (!data.role || !ROLE_HIERARCHY.includes(data.role)) {
    errors.push({ field: 'role', message: 'Vai trò không hợp lệ' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get permission description
 */
export function getPermissionLabel(permission) {
  const labels = {
    can_add_chapter: 'Thêm chương mới',
    can_edit_chapter: 'Chỉnh sửa chương',
    can_delete_chapter: 'Xóa chương',
    can_publish_chapter: 'Xuất bản chương',
    can_invite_others: 'Mời người khác',
    can_edit_book_settings: 'Chỉnh sửa cài đặt sách'
  };
  return labels[permission] || permission;
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
}

/**
 * Check if contributor is active
 */
export function isActiveContributor(contributor) {
  return contributor?.status === CONTRIBUTOR_STATUS.ACCEPTED;
}

/**
 * Get role badge styling
 */
export function getRoleBadge(role) {
  const badges = {
    owner: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '👑' },
    editor: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✏️' },
    contributor: { color: 'bg-green-100 text-green-700 border-green-200', icon: '✍️' },
    viewer: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '👀' }
  };
  return badges[role] || badges.viewer;
}

/**
 * Get status badge styling
 */
export function getStatusBadge(status) {
  const badges = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Chờ phản hồi' },
    accepted: { color: 'bg-green-100 text-green-700', label: 'Đã tham gia' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Đã từ chối' },
    removed: { color: 'bg-gray-100 text-gray-500', label: 'Đã rời' }
  };
  return badges[status] || badges.pending;
}