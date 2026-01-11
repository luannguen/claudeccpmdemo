/**
 * AddToCollectionButton - Add book to collection dropdown
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useBookCollections } from '../hooks/useBookCollections';

export default function AddToCollectionButton({
  bookId,
  currentUser,
  onCreateNew,
  variant = 'default' // 'default', 'compact', 'icon'
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    myCollections,
    addBookToCollection,
    isLoading
  } = useBookCollections(currentUser);

  const handleAddToCollection = async (collectionId) => {
    await addBookToCollection(collectionId, bookId);
    setIsOpen(false);
  };

  // Check if book is already in collection
  const isInCollection = (collection) => {
    return collection.book_ids?.includes(bookId);
  };

  if (!currentUser) return null;

  const buttonContent = variant === 'icon' ? (
    <Icon.Plus size={18} />
  ) : variant === 'compact' ? (
    <span className="text-sm">+ Collection</span>
  ) : (
    <span className="flex items-center gap-2">
      <Icon.Layers size={18} />
      Thêm vào bộ sưu tập
    </span>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          variant === 'icon'
            ? 'p-2 hover:bg-purple-50 rounded-lg text-purple-600'
            : variant === 'compact'
              ? 'px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg'
              : 'px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors'
        }`}
      >
        {buttonContent}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100">
                <h4 className="font-medium text-gray-900 text-sm">Thêm vào bộ sưu tập</h4>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <Icon.Spinner size={20} className="text-purple-500 mx-auto" />
                  </div>
                ) : myCollections.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Chưa có bộ sưu tập nào
                  </div>
                ) : (
                  myCollections.map(collection => {
                    const alreadyAdded = isInCollection(collection);
                    return (
                      <button
                        key={collection.id}
                        onClick={() => !alreadyAdded && handleAddToCollection(collection.id)}
                        disabled={alreadyAdded}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                          alreadyAdded
                            ? 'bg-purple-50 cursor-default'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {collection.cover_image ? (
                            <img src={collection.cover_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Icon.Layers size={16} className="text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {collection.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {collection.books_count} sách
                          </p>
                        </div>
                        {alreadyAdded && (
                          <Icon.Check size={16} className="text-purple-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Create new */}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCreateNew?.();
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium"
                >
                  <Icon.Plus size={16} />
                  Tạo bộ sưu tập mới
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}