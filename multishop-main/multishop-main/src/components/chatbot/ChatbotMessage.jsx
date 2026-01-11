/**
 * ChatbotMessage - Single message bubble component
 * 
 * UI Layer - Presentation only
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { MESSAGE_ROLES } from './chatbotService';

/**
 * @param {Object} props
 * @param {Object} props.message - Message object
 * @param {boolean} props.compact - Compact mode for mobile
 */
function ChatbotMessage({ message, compact = false }) {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const isBot = message.role === MESSAGE_ROLES.BOT;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-1.5 ${compact ? 'gap-1.5' : 'gap-2'} max-w-[85%]`}>
        {/* Bot Avatar */}
        {isBot && (
          <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0`}>
            <Bot className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
          </div>
        )}
        
        {/* Message Bubble */}
        <div 
          className={`
            ${compact ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'}
            ${isUser 
              ? 'bg-[#7CB342] text-white ml-1' 
              : 'bg-gray-100 text-gray-800'
            }
          `}
        >
          <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed whitespace-pre-wrap break-words`}>
            {message.content}
          </p>
          
          <p className={`text-xs mt-0.5 text-right ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
        
        {/* User Avatar */}
        {isUser && (
          <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0`}>
            <User className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ChatbotMessage);