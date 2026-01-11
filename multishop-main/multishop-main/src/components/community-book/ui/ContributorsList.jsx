/**
 * ContributorsList - Display and manage book contributors
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { 
  ROLE_LABELS, 
  getRoleBadge, 
  getStatusBadge,
  CONTRIBUTOR_ROLES 
} from '../domain/contributorRules';

function ContributorCard({ 
  contributor, 
  isOwner,
  currentUserRole,
  onChangeRole, 
  onRemove,
  canManage = false
}) {
  const [showMenu, setShowMenu] = useState(false);
  const roleBadge = getRoleBadge(contributor.role);
  const statusBadge = getStatusBadge(contributor.status);
  const isPending = contributor.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-white rounded-xl border-2 ${
        isPending ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
          {contributor.user_avatar ? (
            <img src={contributor.user_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            contributor.user_name?.[0]?.toUpperCase() || '?'
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate">
              {contributor.user_name || contributor.user_email}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
              {roleBadge.icon} {ROLE_LABELS[contributor.role]}
            </span>
            {isPending && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{contributor.user_email}</p>
          
          {/* Stats */}
          {contributor.chapters_contributed > 0 && (
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{contributor.chapters_contributed} chương</span>
              <span>{contributor.words_contributed?.toLocaleString()} từ</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canManage && contributor.role !== CONTRIBUTOR_ROLES.OWNER && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon.MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px] z-10"
                >
                  {/* Change Role */}
                  {currentUserRole === CONTRIBUTOR_ROLES.OWNER && (
                    <>
                      <p className="px-3 py-1 text-xs text-gray-500">Đổi vai trò</p>
                      {['editor', 'contributor', 'viewer'].map(role => {
                        if (role === contributor.role) return null;
                        return (
                          <button
                            key={role}
                            onClick={() => {
                              onChangeRole?.(contributor, role);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                          >
                            <span>{getRoleBadge(role).icon}</span>
                            {ROLE_LABELS[role]}
                          </button>
                        );
                      })}
                      <div className="border-t border-gray-100 my-1" />
                    </>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => {
                      onRemove?.(contributor);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
                  >
                    <Icon.Trash size={14} />
                    Xóa khỏi sách
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ContributorsList({
  contributors = [],
  pendingInvites = [],
  bookOwner,
  currentUserRole,
  canManage = false,
  onChangeRole,
  onRemove,
  onInvite
}) {
  const allContributors = [
    // Owner first
    ...(bookOwner ? [{
      id: 'owner',
      user_email: bookOwner.email,
      user_name: bookOwner.name,
      user_avatar: bookOwner.avatar,
      role: CONTRIBUTOR_ROLES.OWNER,
      status: 'accepted'
    }] : []),
    // Active contributors
    ...contributors.filter(c => c.role !== CONTRIBUTOR_ROLES.OWNER),
    // Pending invites
    ...pendingInvites
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon.Users size={20} />
          Cộng Tác Viên ({contributors.length + 1})
        </h3>
        {canManage && onInvite && (
          <button
            onClick={onInvite}
            className="px-3 py-1.5 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-1"
          >
            <Icon.UserPlus size={14} />
            Mời
          </button>
        )}
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-yellow-700 font-medium mb-2 flex items-center gap-1">
            <Icon.Clock size={14} />
            Đang chờ phản hồi ({pendingInvites.length})
          </p>
        </div>
      )}

      {/* Contributors List */}
      <div className="space-y-2">
        {allContributors.map((contributor, index) => (
          <ContributorCard
            key={contributor.id || contributor.user_email}
            contributor={contributor}
            isOwner={contributor.role === CONTRIBUTOR_ROLES.OWNER}
            currentUserRole={currentUserRole}
            canManage={canManage && contributor.role !== CONTRIBUTOR_ROLES.OWNER}
            onChangeRole={onChangeRole}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Empty State */}
      {allContributors.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Icon.Users size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Chưa có cộng tác viên</p>
        </div>
      )}
    </div>
  );
}