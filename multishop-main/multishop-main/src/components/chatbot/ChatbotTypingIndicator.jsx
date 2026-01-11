/**
 * ChatbotTypingIndicator - Shows bot is typing
 * 
 * UI Layer - Presentation only
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

function ChatbotTypingIndicator({ compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className={`flex items-start ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-[#7CB342] flex items-center justify-center`}>
          <Bot className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
        </div>
        <div className={`bg-gray-100 ${compact ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'}`}>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gray-400 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatbotTypingIndicator);