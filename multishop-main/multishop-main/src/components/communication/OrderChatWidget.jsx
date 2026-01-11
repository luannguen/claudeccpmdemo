import React, { useState } from 'react';
import { MessageSquare, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderChatBox from './OrderChatBox';
import EnhancedModal from '../EnhancedModal';

export default function OrderChatWidget({ order, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!order) return null;

  if (isFullscreen) {
    return (
      <EnhancedModal
        isOpen={true}
        onClose={() => setIsFullscreen(false)}
        title={`💬 Chat Đơn Hàng #${order.order_number || order.id?.slice(-6)}`}
        maxWidth="4xl"
      >
        <div className="h-[600px]">
          <OrderChatBox order={order} isAdmin={true} />
        </div>
      </EnhancedModal>
    );
  }

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">
                  Chat Đơn #{order.order_number || order.id?.slice(-6)}
                </p>
                <p className="text-xs opacity-90">{order.customer_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Phóng to"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Thu nhỏ"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="h-[500px]">
            <OrderChatBox order={order} isAdmin={true} />
          </div>
        </motion.div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#7CB342] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#FF9800] transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}