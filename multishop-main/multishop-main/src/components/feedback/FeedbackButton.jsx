/**
 * FeedbackButton - Floating feedback button
 * UI Layer - Presentation Only
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <AnimatePresence>
          {!showModal && (
            <motion.button
              onClick={() => setShowModal(true)}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle size={24} />
              
              {/* Tooltip */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
                  >
                    Gửi feedback cho chúng tôi
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse animation */}
              <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}