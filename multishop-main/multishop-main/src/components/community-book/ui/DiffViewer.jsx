/**
 * DiffViewer - Display differences between two versions
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';

/**
 * Simple line-by-line diff algorithm
 */
function computeDiff(oldText, newText) {
  const oldLines = (oldText || '').split('\n');
  const newLines = (newText || '').split('\n');
  
  const result = [];
  let oldIndex = 0;
  let newIndex = 0;
  
  // Simple LCS-based diff
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      // Remaining new lines are additions
      result.push({ type: 'add', content: newLines[newIndex], lineNumber: newIndex + 1 });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Remaining old lines are deletions
      result.push({ type: 'remove', content: oldLines[oldIndex], lineNumber: oldIndex + 1 });
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      // Lines match
      result.push({ type: 'same', content: oldLines[oldIndex], lineNumber: newIndex + 1 });
      oldIndex++;
      newIndex++;
    } else {
      // Check if old line exists later in new
      const oldInNew = newLines.slice(newIndex).indexOf(oldLines[oldIndex]);
      // Check if new line exists later in old
      const newInOld = oldLines.slice(oldIndex).indexOf(newLines[newIndex]);
      
      if (oldInNew === -1 && newInOld === -1) {
        // Both changed - show as remove then add
        result.push({ type: 'remove', content: oldLines[oldIndex], lineNumber: oldIndex + 1 });
        result.push({ type: 'add', content: newLines[newIndex], lineNumber: newIndex + 1 });
        oldIndex++;
        newIndex++;
      } else if (oldInNew !== -1 && (newInOld === -1 || oldInNew <= newInOld)) {
        // New lines were added
        result.push({ type: 'add', content: newLines[newIndex], lineNumber: newIndex + 1 });
        newIndex++;
      } else {
        // Old line was removed
        result.push({ type: 'remove', content: oldLines[oldIndex], lineNumber: oldIndex + 1 });
        oldIndex++;
      }
    }
  }
  
  return result;
}

function DiffLine({ line, showLineNumbers = true }) {
  const bgColor = {
    add: 'bg-green-50 border-l-4 border-green-500',
    remove: 'bg-red-50 border-l-4 border-red-500',
    same: 'bg-white'
  }[line.type];
  
  const textColor = {
    add: 'text-green-800',
    remove: 'text-red-800 line-through',
    same: 'text-gray-700'
  }[line.type];
  
  const prefix = {
    add: '+',
    remove: '-',
    same: ' '
  }[line.type];

  return (
    <div className={`flex ${bgColor} font-mono text-sm`}>
      {showLineNumbers && (
        <span className="w-12 flex-shrink-0 px-2 py-1 text-gray-400 text-right border-r border-gray-200 select-none">
          {line.lineNumber}
        </span>
      )}
      <span className={`w-6 flex-shrink-0 px-1 py-1 text-center ${
        line.type === 'add' ? 'text-green-600' : 
        line.type === 'remove' ? 'text-red-600' : 
        'text-gray-400'
      }`}>
        {prefix}
      </span>
      <pre className={`flex-1 px-2 py-1 whitespace-pre-wrap break-all ${textColor}`}>
        {line.content || ' '}
      </pre>
    </div>
  );
}

export default function DiffViewer({
  version1,
  version2,
  viewMode = 'unified', // unified | split
  onClose
}) {
  const diff = useMemo(() => {
    if (!version1 || !version2) return [];
    return computeDiff(version1.content, version2.content);
  }, [version1, version2]);

  const stats = useMemo(() => {
    const additions = diff.filter(d => d.type === 'add').length;
    const deletions = diff.filter(d => d.type === 'remove').length;
    return { additions, deletions };
  }, [diff]);

  if (!version1 || !version2) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Icon.AlertCircle size={32} className="mx-auto mb-2" />
        Không thể so sánh phiên bản
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Icon.FileText size={20} />
            So sánh phiên bản
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            v{version1.version_number} → v{version2.version_number}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-medium">
              +{stats.additions} thêm
            </span>
            <span className="text-red-600 font-medium">
              -{stats.deletions} xóa
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Icon.X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Version Info */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="text-sm">
          <p className="font-medium text-gray-900">Phiên bản {version1.version_number}</p>
          <p className="text-gray-500">{version1.author_name}</p>
          <p className="text-xs text-gray-400">{version1.change_summary}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-900">Phiên bản {version2.version_number}</p>
          <p className="text-gray-500">{version2.author_name}</p>
          <p className="text-xs text-gray-400">{version2.change_summary}</p>
        </div>
      </div>

      {/* Diff Content */}
      <div className="max-h-[500px] overflow-y-auto">
        {diff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Icon.CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
            Không có sự khác biệt
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {diff.map((line, index) => (
              <DiffLine key={index} line={line} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {diff.length} dòng thay đổi
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        )}
      </div>
    </motion.div>
  );
}