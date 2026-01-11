import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, AlertCircle, Sparkles, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/community/PostCard";
import PostCardSkeleton from "@/components/community/PostCardSkeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MyLikedPosts() {
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['current-user-liked'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  const { data: likedPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['user-liked-posts', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const allPosts = await base44.entities.UserPost.list('-created_date', 200);
      return allPosts.filter(p => {
        const data = p.data || p;
        return (data.liked_by?.includes(currentUser.email) || 
                data.reacted_by?.[currentUser.email]) && 
               data.status === 'active';
      });
    },
    enabled: !!currentUser?.email,
    staleTime: 2 * 60 * 1000
  });

  const isLoading = userLoading || postsLoading;

  // Redirect if not logged in
  if (!userLoading && !currentUser) {
    base44.auth.redirectToLogin(window.location.href);
    return null;
  }

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to={createPageUrl('Community')}
            className="inline-flex items-center gap-2 text-[#7CB342] hover:text-[#FF9800] font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Cộng Đồng
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#0F0F0F]">
                Bài Viết Đã Thích
              </h1>
              <p className="text-gray-600">{likedPosts.length} bài viết</p>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <PostCardSkeleton key={i} />)}
          </div>
        )}

        {/* Posts */}
        {!isLoading && likedPosts.length > 0 && (
          <div className="space-y-4">
            {likedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <PostCard 
                  post={post} 
                  currentUser={currentUser}
                  onLoginRequired={() => {}}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && likedPosts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">
              Chưa Có Bài Viết Đã Thích
            </h3>
            <p className="text-gray-600 mb-6">
              Thả reaction cho các bài viết bạn yêu thích
            </p>
            <Link
              to={createPageUrl('Community')}
              className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Khám Phá Cộng Đồng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}