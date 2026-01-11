/**
 * ChatbotTrigger - Floating button to open chatbot
 * 
 * UI Layer - Presentation only
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Leaf } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isOpen - Chat is open (hide trigger)
 * @param {boolean} props.hideOnMobile - Hide on mobile (BottomNav handles it)
 */
function ChatbotTrigger({ onClick, isOpen = false, hideOnMobile = true }) {
  if (isOpen) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40
        bg-gradient-to-r from-[#7CB342] to-[#FF9800]
        text-white rounded-full shadow-lg
        items-center justify-center
        transition-all duration-300
        w-12 h-12
        ${hideOnMobile ? 'hidden lg:flex' : 'flex'}
      `}
      aria-label="Mở trợ lý ảo Zero Farm"
    >
      <MessageCircle className="w-5 h-5" />
      
      {/* Badge */}
      <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <Leaf className="w-2.5 h-2.5 text-white" />
      </div>
    </motion.button>
  );
}

export default memo(ChatbotTrigger);