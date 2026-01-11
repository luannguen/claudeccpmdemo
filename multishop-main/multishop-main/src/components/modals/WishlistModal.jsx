import React from 'react';
import { Heart, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Hooks
import {
  useWishlistState,
  useWishlistProducts,
  useWishlistLots,
  useWishlistItems,
  useWishlistActions
} from '@/components/hooks/useWishlist';

// Components
import WishlistItemCard from './wishlist/WishlistItemCard';
import WishlistEmptyState from './wishlist/WishlistEmptyState';

export default function WishlistModal({ isOpen, onClose }) {
  const { wishlistIds, setWishlistIds } = useWishlistState(isOpen);
  const { data: allProducts = [] } = useWishlistProducts(isOpen);
  const { data: allLots = [] } = useWishlistLots(isOpen);
  const wishlistItems = useWishlistItems(wishlistIds, allProducts, allLots);
  const { removeFromWishlist, addToCart, clearAll } = useWishlistActions(wishlistIds, setWishlistIds);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal - Mobile: bottom sheet fixed, Desktop: centered */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 max-h-[85vh] md:inset-x-auto md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[80vh] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                <h2 className="text-lg font-bold">Yêu Thích ({wishlistItems.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                {wishlistItems.length > 0 && (
                  <button onClick={clearAll}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlistItems.length === 0 ? (
                <WishlistEmptyState onClose={onClose} />
              ) : (
                <div className="space-y-3">
                  {wishlistItems.map((item) => (
                    <WishlistItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={addToCart}
                      onRemove={removeFromWishlist}
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <Link 
                  to={createPageUrl('MyWishlist')}
                  onClick={onClose}
                  className="block w-full text-center py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
                >
                  Xem Tất Cả
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}