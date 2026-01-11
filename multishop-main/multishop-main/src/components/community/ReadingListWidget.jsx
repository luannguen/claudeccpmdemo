import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function ReadingListWidget({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState([]);

  const { data: savedPosts = [] } = useQuery({
    queryKey: ['reading-list', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const saved = await base44.entities.SavedPost.list('-created_date', 20);
      return saved.filter(s => s.user_email === currentUser.email);
    },
    enabled: !!currentUser?.email
  });

  // Load reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('reading-reminders');
    if (stored) {
      setReminders(JSON.parse(stored));
    }
  }, []);

  const handleReminder = (postId, time) => {
    const newReminder = {
      postId,
      time: Date.now() + time,
      notified: false
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('reading-reminders', JSON.stringify(updated));
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-48 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform z-40 flex items-center justify-center"
        title="Danh sách đọc sau"
      >
        <Icon.Bookmark size={24} />
        {savedPosts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {savedPosts.length}
          </span>
        )}
      </button>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-20 right-6 bottom-24 w-80 bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Icon.Bookmark size={20} />
                Đọc sau
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <Icon.X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Icon.Bookmark size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có bài viết nào</p>
                </div>
              ) : (
                savedPosts.map(saved => (
                  <SavedPostCard
                    key={saved.id}
                    saved={saved}
                    onReminder={handleReminder}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Link
                to={createPageUrl('MySavedPosts')}
                className="block w-full text-center py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#689F38] transition-colors"
              >
                Xem tất cả
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SavedPostCard({ saved, onReminder }) {
  const { data: post } = useQuery({
    queryKey: ['post', saved.post_id],
    queryFn: async () => {
      const posts = await base44.entities.UserPost.list('-created_date', 500);
      return posts.find(p => p.id === saved.post_id);
    },
    enabled: !!saved.post_id
  });

  if (!post) return null;

  const postData = post.data || post;

  return (
    <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
      <Link
        to={createPageUrl('community') + `?post=${post.id}`}
        className="block mb-2"
      >
        <p className="text-sm text-gray-900 line-clamp-2 font-medium">
          {postData.content?.substring(0, 80)}...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {postData.author_name}
        </p>
      </Link>
      <div className="flex gap-1 mt-2">
        <button
          onClick={() => onReminder(post.id, 3600000)} // 1 hour
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Nhắc tôi sau 1 giờ"
        >
          1h
        </button>
        <button
          onClick={() => onReminder(post.id, 86400000)} // 1 day
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Nhắc tôi ngày mai"
        >
          1d
        </button>
      </div>
    </div>
  );
}