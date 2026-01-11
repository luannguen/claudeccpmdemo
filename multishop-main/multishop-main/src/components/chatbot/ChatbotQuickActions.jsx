/**
 * ChatbotQuickActions - Quick action buttons
 * 
 * UI Layer - Presentation only
 */

import React, { memo } from 'react';

/**
 * @param {Object} props
 * @param {Array} props.actions - Quick action items
 * @param {Function} props.onAction - Action handler
 * @param {boolean} props.disabled - Disable buttons
 * @param {boolean} props.compact - Compact mode
 */
function ChatbotQuickActions({ actions = [], onAction, disabled = false, compact = false }) {
  if (!actions.length) return null;

  return (
    <div className={`${compact ? 'px-2 py-1.5' : 'px-4 py-2'} border-t border-gray-200 bg-gray-50`}>
      <div className={`flex ${compact ? 'gap-1.5 mb-1.5' : 'gap-2 mb-2'} overflow-x-auto scrollbar-hide`}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            disabled={disabled}
            className={`
              ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'}
              bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap
              hover:bg-[#FF9800] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(ChatbotQuickActions);