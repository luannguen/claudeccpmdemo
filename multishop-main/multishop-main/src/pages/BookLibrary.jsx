/**
 * BookLibrary Page
 * Browse and discover community books
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';

import {
  useBookLibrary,
  BookCard,
  BookLibraryFilters,
  CreateBookModal,
  BOOK_CATEGORY_LABELS
} from '@/components/community-book';

export default function BookLibrary() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const {
    books,
    featuredBooks,
    myBooks,
    isLoading,
    isError,
    searchQuery,
    categoryFilter,
    sortBy,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleCreateBook,
    handleLikeBook,
    handleForkBook,
    isCreating
  } = useBookLibrary(currentUser);

  const handleViewBook = (book) => {
    navigate(createPageUrl('BookDetail') + `?id=${book.id}`);
  };

  const handleEditBook = (book) => {
    navigate(createPageUrl('BookEditor') + `?id=${book.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3"
          >
            <span className="text-4xl">📚</span>
            Thư Viện Sách Cộng Đồng
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mt-2 max-w-2xl mx-auto"
          >
            Khám phá và đọc những cuốn sách được viết bởi cộng đồng. 
            Bạn cũng có thể tạo sách của riêng mình!
          </motion.p>
        </div>

        {/* Create Button */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!currentUser) {
                base44.auth.redirectToLogin(window.location.href);
                return;
              }
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Icon.Plus size={20} />
            Tạo Sách Mới
          </motion.button>
        </div>

        {/* Featured Books */}
        {featuredBooks.length > 0 && !searchQuery && categoryFilter === 'all' && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon.Star size={24} className="text-yellow-500" />
              Sách Nổi Bật
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featuredBooks.slice(0, 6).map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BookCard
                    book={book}
                    currentUser={currentUser}
                    onView={handleViewBook}
                    onLike={handleLikeBook}
                    onFork={handleForkBook}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* My Books */}
        {currentUser && myBooks.length > 0 && !searchQuery && categoryFilter === 'all' && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon.User size={24} className="text-[#7CB342]" />
              Sách Của Tôi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBooks.slice(0, 3).map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BookCard
                    book={book}
                    currentUser={currentUser}
                    onView={handleEditBook}
                    onLike={handleLikeBook}
                    showStatus
                    compact
                  />
                </motion.div>
              ))}
              {myBooks.length > 3 && (
                <button
                  onClick={() => navigate(createPageUrl('MyBooks'))}
                  className="p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#7CB342] transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-[#7CB342]"
                >
                  <Icon.ArrowRight size={20} />
                  Xem tất cả ({myBooks.length})
                </button>
              )}
            </div>
          </section>
        )}

        {/* Filters */}
        <BookLibraryFilters
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          onSearchChange={handleSearch}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          totalBooks={books.length}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Icon.Spinner size={48} className="text-[#7CB342]" />
            <p className="mt-4 text-gray-500">Đang tải sách...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <Icon.AlertCircle size={48} className="text-red-500 mx-auto" />
            <p className="mt-4 text-gray-600">Có lỗi xảy ra. Vui lòng thử lại.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && books.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon.FileText size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Không tìm thấy sách phù hợp' 
                : 'Chưa có sách nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Thử thay đổi từ khóa hoặc bộ lọc'
                : 'Hãy là người đầu tiên tạo sách cho cộng đồng!'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors"
              >
                Tạo Sách Đầu Tiên
              </button>
            )}
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !isError && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
            <AnimatePresence>
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <BookCard
                    book={book}
                    currentUser={currentUser}
                    onView={handleViewBook}
                    onLike={handleLikeBook}
                    onFork={handleForkBook}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      <CreateBookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          const book = await handleCreateBook(data);
          if (book) {
            navigate(createPageUrl('BookEditor') + `?id=${book.id}`);
          }
          return book;
        }}
        isSubmitting={isCreating}
      />
    </div>
  );
}