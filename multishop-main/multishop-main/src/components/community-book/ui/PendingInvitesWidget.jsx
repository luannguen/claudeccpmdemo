/**
 * PendingInvitesWidget - Shows pending book invitations for current user
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon';
import { createPageUrl } from '@/utils';
import { ROLE_LABELS, getRoleBadge } from '../domain/contributorRules';
import { usePendingInvites } from '../hooks/useBookCollaboration';

export default function PendingInvitesWidget({ userEmail }) {
  const navigate = useNavigate();
  const {
    pendingInvites,
    pendingCount,
    isLoading,
    handleAccept,
    handleReject,
    isAccepting,
    isRejecting
  } = usePendingInvites(userEmail);

  if (isLoading || pendingCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Icon.Mail size={18} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Lời Mời Cộng Tác</h3>
          <p className="text-xs text-gray-600">
            Bạn có {pendingCount} lời mời đang chờ
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {pendingInvites.slice(0, 3).map((invite, index) => {
            const roleBadge = getRoleBadge(invite.role);
            
            return (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-3 border border-gray-100"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      📚 Sách #{invite.book_id?.slice(-6)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                        {roleBadge.icon} {ROLE_LABELS[invite.role]}
                      </span>
                      <span className="text-xs text-gray-500">
                        từ {invite.invited_by?.split('@')[0]}
                      </span>
                    </div>
                    {invite.note && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        "{invite.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleReject(invite.id)}
                      disabled={isRejecting}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Từ chối"
                    >
                      <Icon.X size={16} />
                    </button>
                    <button
                      onClick={() => handleAccept(invite.id)}
                      disabled={isAccepting}
                      className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      title="Chấp nhận"
                    >
                      {isAccepting ? (
                        <Icon.Spinner size={16} />
                      ) : (
                        <Icon.CheckCircle size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {pendingCount > 3 && (
          <button
            onClick={() => navigate(createPageUrl('BookLibrary') + '?tab=invites')}
            className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Xem tất cả {pendingCount} lời mời →
          </button>
        )}
      </div>
    </motion.div>
  );
}