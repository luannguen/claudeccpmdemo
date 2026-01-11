import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, Bookmark } from "lucide-react";
import PostCard from "@/components/community/PostCard";
import { base44 } from "@/api/base44Client";

export default function ProfilePostsList({ 
  activeTab, 
  posts, 
  savedPostsData, 
  currentUser, 
  isOwnProfile 
}) {
  const handleLoginRequired = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (activeTab === 'posts') {
    return (
      <AnimatePresence>
        {posts.length > 0 ? (
          posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PostCard
                post={post}
                currentUser={currentUser}
                onLoginRequired={handleLoginRequired}
                onEdit={() => {}}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Grid className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa Có Bài Viết</h3>
            <p className="text-gray-600">
              {isOwnProfile ? 'Hãy chia sẻ câu chuyện của bạn với cộng đồng!' : 'Người dùng này chưa đăng bài viết nào.'}
            </p>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (activeTab === 'saved') {
    return (
      <AnimatePresence>
        {savedPostsData.length > 0 ? (
          savedPostsData.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PostCard
                post={post}
                currentUser={currentUser}
                onLoginRequired={handleLoginRequired}
                onEdit={() => {}}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Bookmark className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa Có Bài Viết Đã Lưu</h3>
            <p className="text-gray-600">Lưu bài viết yêu thích để xem lại sau.</p>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}