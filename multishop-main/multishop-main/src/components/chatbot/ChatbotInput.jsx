/**
 * ChatbotInput - Message input component
 * 
 * UI Layer - Presentation only
 */

import React, { memo, forwardRef } from 'react';
import { Send } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onSend - Send handler
 * @param {Function} props.onKeyPress - Key press handler
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.compact - Compact mode
 * @param {string} props.placeholder - Placeholder text
 */
const ChatbotInput = forwardRef(function ChatbotInput(
  { 
    value, 
    onChange, 
    onSend, 
    onKeyPress, 
    disabled = false, 
    compact = false,
    placeholder = "Hỏi về sản phẩm..." 
  }, 
  ref
) {
  return (
    <div className={`${compact ? 'p-2' : 'p-4'} border-t border-gray-200`}>
      <div className={`flex ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 
            ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            border border-gray-200 rounded-full
            focus:outline-none focus:border-[#7CB342]
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        <button
          onClick={onSend}
          disabled={!value?.trim() || disabled}
          className={`
            ${compact ? 'w-8 h-8' : 'w-10 h-10'}
            bg-gradient-to-r from-[#7CB342] to-[#FF9800]
            text-white rounded-full
            flex items-center justify-center
            hover:scale-110 transition-transform
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
          aria-label="Gửi tin nhắn"
        >
          <Send className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>
      </div>
    </div>
  );
});

export default memo(ChatbotInput);