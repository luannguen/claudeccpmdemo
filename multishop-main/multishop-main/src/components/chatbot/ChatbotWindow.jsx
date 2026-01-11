/**
 * ChatbotWindow - Main chat window container
 * 
 * UI Layer - Composes smaller components
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotHeader from './ChatbotHeader';
import ChatbotMessageEnhanced from './ui/ChatbotMessageEnhanced';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';
import ChatbotQuickActions from './ChatbotQuickActions';
import ChatbotInput from './ChatbotInput';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Window open state
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.messages - Message list
 * @param {string} props.inputText - Input value
 * @param {Function} props.setInputText - Input change handler
 * @param {Function} props.onSend - Send handler
 * @param {Function} props.onKeyPress - Key press handler
 * @param {boolean} props.isTyping - Bot typing state
 * @param {Array} props.quickActions - Quick action items
 * @param {Function} props.onQuickAction - Quick action handler
 * @param {Function} props.onClear - Clear history handler
 * @param {Object} props.inputRef - Input ref
 * @param {Object} props.messagesEndRef - Scroll ref
 * @param {boolean} props.compact - Compact mode (mobile)
 */
function ChatbotWindow({
  isOpen,
  onClose,
  messages,
  inputText,
  setInputText,
  onSend,
  onKeyPress,
  isTyping,
  quickActions,
  onQuickAction,
  onClear,
  inputRef,
  messagesEndRef,
  compact = false
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            fixed z-50 flex flex-col overflow-hidden
            bg-white border border-[#7CB342]/20
            ${compact 
              ? 'bottom-2 right-2 w-[calc(100%-1rem)] max-w-sm h-[70vh] rounded-2xl shadow-xl' 
              : 'bottom-4 right-4 w-96 h-[600px] rounded-3xl shadow-2xl'
            }
          `}
        >
          {/* Header */}
          <ChatbotHeader 
            onClose={onClose}
            onClear={onClear}
            compact={compact}
          />

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto ${compact ? 'p-2 space-y-2' : 'p-4 space-y-4'}`}>
            {messages.map((message) => (
              <ChatbotMessageEnhanced 
                key={message.id} 
                message={message}
                compact={compact}
                onAddToCart={(product) => {
                  window.dispatchEvent(new CustomEvent('add-to-cart', {
                    detail: {
                      id: product.id,
                      name: product.name,
                      price: product.sale_price || product.salePrice || product.price,
                      unit: product.unit || 'sản phẩm',
                      image_url: product.image_url || product.image,
                      quantity: 1
                    }
                  }));
                }}
                onAction={(action) => {
                  if (action.type === 'suggestion') {
                    onQuickAction?.({ prompt: action.label });
                  }
                }}
              />
            ))}
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && <ChatbotTypingIndicator compact={compact} />}
            </AnimatePresence>
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <ChatbotQuickActions
            actions={quickActions}
            onAction={onQuickAction}
            disabled={isTyping}
            compact={compact}
          />

          {/* Input */}
          <ChatbotInput
            ref={inputRef}
            value={inputText}
            onChange={setInputText}
            onSend={onSend}
            onKeyPress={onKeyPress}
            disabled={isTyping}
            compact={compact}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(ChatbotWindow);