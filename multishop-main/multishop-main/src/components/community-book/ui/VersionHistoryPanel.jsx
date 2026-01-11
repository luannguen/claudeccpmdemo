/**
 * VersionHistoryPanel - Display and manage chapter versions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useChapterVersions } from '../hooks/useChapterVersions';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

const CHANGE_TYPE_LABELS = {
  create: { label: 'Tạo mới', color: 'bg-green-100 text-green-700', icon: '✨' },
  edit: { label: 'Chỉnh sửa', color: 'bg-blue-100 text-blue-700', icon: '✏️' },
  restore: { label: 'Khôi phục', color: 'bg-purple-100 text-purple-700', icon: '⏪' },
  merge: { label: 'Gộp', color: 'bg-orange-100 text-orange-700', icon: '🔀' }
};

function VersionCard({ 
  version, 
  isCurrent, 
  isSelected,
  compareMode,
  onSelect,
  onRestore,
  onView
}) {
  const changeType = CHANGE_TYPE_LABELS[version.change_type] || CHANGE_TYPE_LABELS.edit;
  const timeAgo = formatDistanceToNow(new Date(version.created_date), { addSuffix: true, locale: vi });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-xl border-2 transition-all ${
        isCurrent 
          ? 'border-[#7CB342] bg-[#7CB342]/5' 
          : isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Version Number / Checkbox */}
        {compareMode ? (
          <button
            onClick={() => onSelect(version.id)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            {isSelected && <Icon.Check size={14} />}
          </button>
        ) : (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCurrent ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {version.version_number}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${changeType.color}`}>
              {changeType.icon} {changeType.label}
            </span>
            {isCurrent && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#7CB342] text-white">
                Hiện tại
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            {version.change_summary || `Phiên bản ${version.version_number}`}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{version.author_name}</span>
            <span>•</span>
            <span>{timeAgo}</span>
            {version.diff_stats && (
              <>
                <span>•</span>
                <span className="text-green-600">+{version.diff_stats.additions}</span>
                <span className="text-red-600">-{version.diff_stats.deletions}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compareMode && !isCurrent && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onView?.(version)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Xem nội dung"
            >
              <Icon.Eye size={16} />
            </button>
            <button
              onClick={() => onRestore?.(version.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Khôi phục"
            >
              <Icon.RefreshCw size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VersionHistoryPanel({
  chapterId,
  currentUser,
  onViewVersion,
  onClose
}) {
  const { showConfirm } = useConfirmDialog();
  
  const {
    versions,
    currentVersion,
    isLoading,
    compareMode,
    selectedVersions,
    comparisonResult,
    isComparing,
    toggleCompareMode,
    selectVersionForCompare,
    handleRestore,
    isRestoring
  } = useChapterVersions(chapterId, currentUser);

  const confirmRestore = async (versionId) => {
    const confirmed = await showConfirm({
      title: 'Khôi phục phiên bản',
      message: 'Bạn có chắc muốn khôi phục phiên bản này? Nội dung hiện tại sẽ được lưu thành phiên bản mới trước khi khôi phục.',
      type: 'warning',
      confirmText: 'Khôi phục'
    });

    if (confirmed) {
      handleRestore(versionId);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon.Clock size={20} />
          Lịch Sử Phiên Bản ({versions.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCompareMode}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              compareMode 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {compareMode ? 'Hủy so sánh' : 'So sánh'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon.X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Compare Instructions */}
      {compareMode && (
        <div className="p-3 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-700">
            📊 Chọn 2 phiên bản để so sánh ({selectedVersions.length}/2 đã chọn)
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="p-8 text-center">
          <Icon.Spinner size={32} className="text-[#7CB342] mx-auto" />
          <p className="mt-2 text-gray-500">Đang tải...</p>
        </div>
      )}

      {/* Versions List */}
      {!isLoading && (
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {versions.map((version, index) => (
              <VersionCard
                key={version.id}
                version={version}
                isCurrent={version.is_current}
                isSelected={selectedVersions.includes(version.id)}
                compareMode={compareMode}
                onSelect={selectVersionForCompare}
                onRestore={confirmRestore}
                onView={onViewVersion}
              />
            ))}
          </AnimatePresence>

          {versions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon.Clock size={32} className="mx-auto mb-2 opacity-50" />
              Chưa có lịch sử phiên bản
            </div>
          )}
        </div>
      )}

      {/* Comparison Result */}
      {compareMode && selectedVersions.length === 2 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {isComparing ? (
            <div className="text-center py-4">
              <Icon.Spinner size={24} className="text-blue-600 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Đang so sánh...</p>
            </div>
          ) : comparisonResult && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Kết quả so sánh</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  +{comparisonResult.diff.additions} dòng thêm
                </span>
                <span className="text-red-600">
                  -{comparisonResult.diff.deletions} dòng xóa
                </span>
              </div>
              <button
                onClick={() => onViewVersion?.({ 
                  comparison: true, 
                  v1: comparisonResult.version1, 
                  v2: comparisonResult.version2 
                })}
                className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Xem chi tiết so sánh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Restoring Indicator */}
      {isRestoring && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <Icon.Spinner size={32} className="text-purple-600 mx-auto" />
            <p className="mt-2 text-gray-600">Đang khôi phục...</p>
          </div>
        </div>
      )}
    </div>
  );
}