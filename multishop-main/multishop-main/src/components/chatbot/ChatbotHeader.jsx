/**
 * ChatbotHeader - Chat window header
 * 
 * UI Layer - Presentation only
 */

import React, { memo } from 'react';
import { X, Bot, Trash2 } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onClear - Clear history handler
 * @param {boolean} props.compact - Compact mode
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 */
function ChatbotHeader({ 
  onClose, 
  onClear,
  compact = false,
  title = "Trợ Lý Zero Farm",
  subtitle = "Tư Vấn Organic • Online"
}) {
  return (
    <div className={`
      bg-gradient-to-r from-[#7CB342] to-[#FF9800] 
      text-white 
      ${compact ? 'p-2.5' : 'p-4'}
      flex items-center justify-between flex-shrink-0
    `}>
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 rounded-full flex items-center justify-center relative`}>
          <Bot className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          {/* Online indicator */}
          <div className={`absolute -bottom-1 -right-1 ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} bg-green-400 rounded-full border-2 border-white`} />
        </div>
        
        {/* Title */}
        <div>
          <h3 className={`font-serif ${compact ? 'text-sm' : 'text-base'} font-bold`}>
            {title}
          </h3>
          {!compact && (
            <p className="text-xs opacity-90">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        {onClear && (
          <button
            onClick={onClear}
            className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors`}
            aria-label="Xóa lịch sử chat"
            title="Xóa lịch sử"
          >
            <Trash2 className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          </button>
        )}
        <button
          onClick={onClose}
          className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors`}
          aria-label="Đóng chat"
        >
          <X className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>
      </div>
    </div>
  );
}

export default memo(ChatbotHeader);