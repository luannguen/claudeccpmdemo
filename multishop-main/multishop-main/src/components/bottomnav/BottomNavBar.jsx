/**
 * BottomNavBar Component
 * 
 * Context-aware bottom navigation cho mobile.
 * Tuân thủ kiến trúc 3 lớp - đây là UI Layer.
 * 
 * Features:
 * - Items thay đổi theo context của trang hiện tại
 * - 2 items cố định: Sản phẩm + Giỏ hàng
 * - 3 items động: Tùy theo trang
 * - Back to top button
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useBottomNav } from './useBottomNav';
import { BottomNavItem } from './BottomNavItem';

export function BottomNavBar({ currentPageName }) {
  const {
    navItems,
    showBackToTop,
    scrollToTop,
    handleItemAction,
    isItemActive,
    getBadgeCount
  } = useBottomNav(currentPageName);

  return (
    <>
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-20 left-4 z-50 w-9 h-9 bg-white/90 backdrop-blur-sm text-[#7CB342] rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-[#7CB342] hover:text-white transition-colors"
            aria-label="Về đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around py-1.5">
            <AnimatePresence mode="wait">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BottomNavItem
                    item={item}
                    isActive={isItemActive(item)}
                    badgeCount={getBadgeCount(item)}
                    onAction={handleItemAction}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <style>{`
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        `}</style>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16" />
    </>
  );
}

export default BottomNavBar;