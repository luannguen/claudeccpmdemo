/**
 * OfflineStatusBar - Display offline/sync status
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { useNetworkStatus, useOfflineQueue } from '../hooks/useOfflineMode';

export function OfflineStatusBar() {
  const { isOnline, isOffline } = useNetworkStatus();
  const { pendingCount, isSyncing, syncNow } = useOfflineQueue();

  return (
    <AnimatePresence>
      {(isOffline || pendingCount > 0) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-center gap-3 ${
            isOffline 
              ? 'bg-amber-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}
        >
          {isOffline ? (
            <>
              <Icon.WifiOff size={18} />
              <span className="text-sm font-medium">
                Bạn đang offline. Dữ liệu sẽ được đồng bộ khi có mạng.
              </span>
              {pendingCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {pendingCount} thay đổi chờ
                </span>
              )}
            </>
          ) : (
            <>
              {isSyncing ? (
                <>
                  <Icon.Spinner size={18} />
                  <span className="text-sm font-medium">
                    Đang đồng bộ {pendingCount} thay đổi...
                  </span>
                </>
              ) : (
                <>
                  <Icon.Cloud size={18} />
                  <span className="text-sm font-medium">
                    {pendingCount} thay đổi chờ đồng bộ
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs bg-white/20 hover:bg-white/30 border-0"
                    onClick={syncNow}
                  >
                    <Icon.RefreshCw size={14} className="mr-1" />
                    Đồng bộ ngay
                  </Button>
                </>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact offline indicator for headers
 */
export function OfflineIndicator() {
  const { isOffline } = useNetworkStatus();
  const { pendingCount } = useOfflineQueue();

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      isOffline 
        ? 'bg-amber-100 text-amber-700' 
        : 'bg-blue-100 text-blue-700'
    }`}>
      {isOffline ? (
        <>
          <Icon.WifiOff size={12} />
          <span>Offline</span>
        </>
      ) : (
        <>
          <Icon.Cloud size={12} />
          <span>{pendingCount}</span>
        </>
      )}
    </div>
  );
}

/**
 * Save for offline button
 */
export function SaveOfflineButton({ 
  profile, 
  isSaved, 
  onSave, 
  onRemove,
  isSaving = false 
}) {
  if (!profile) return null;

  return (
    <Button
      variant={isSaved ? 'secondary' : 'outline'}
      size="sm"
      onClick={() => isSaved ? onRemove?.(profile.id) : onSave?.(profile)}
      disabled={isSaving}
      className={isSaved ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
    >
      {isSaving ? (
        <Icon.Spinner size={14} className="mr-1" />
      ) : isSaved ? (
        <Icon.CheckCircle size={14} className="mr-1" />
      ) : (
        <Icon.Download size={14} className="mr-1" />
      )}
      {isSaved ? 'Đã lưu offline' : 'Lưu offline'}
    </Button>
  );
}

export default OfflineStatusBar;