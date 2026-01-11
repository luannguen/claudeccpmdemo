import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, LogIn, AlertCircle, TrendingUp, Clock, Star, Hash, Filter, Users, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CreatePostModal from "@/components/community/CreatePostModal";
import PostCard from "@/components/community/PostCard";

function LoginPromptModal({ isOpen, onClose, action }) {
  if (!isOpen) return null;

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="w-16 h-16 bg-[#7CB342]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-[#7CB342]" />
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-[#0F0F0F] mb-2">
          Đăng Nhập Để {action}
        </h3>
        
        <p className="text-gray-600 mb-8">
          Bạn cần đăng nhập hoặc tạo tài khoản để có thể {action.toLowerCase()} trong cộng đồng Zero Farm.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Đăng Nhập / Đăng Ký
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Để Sau
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          🌱 Tham gia cộng đồng Zero Farm để chia sẻ trải nghiệm và nhận ưu đãi đặc biệt!
        </p>
      </motion.div>
    </div>
  );
}

export default function Community() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState({ isOpen: false, action: '' });
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['user-posts'],
    queryFn: async () => {
      const result = await base44.entities.UserPost.list('-created_date', 100);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
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

  const filteredAndSortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    let filtered = posts.filter(p => {
      const data = p.data || p;
      const statusCheck = !data.status || data.status === 'active';
      return statusCheck;
    });

    if (filter === 'my-posts' && currentUser) {
      filtered = filtered.filter(p => p.created_by === currentUser.email);
    }

    // Sort
    if (sortBy === 'trending') {
      filtered.sort((a, b) => {
        const scoreA = (a.data?.engagement_score || 0);
        const scoreB = (b.data?.engagement_score || 0);
        return scoreB - scoreA;
      });
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => {
        const likesA = (a.data?.likes_count || 0);
        const likesB = (b.data?.likes_count || 0);
        return likesB - likesA;
      });
    } else {
      // Recent (default)
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return filtered;
  }, [posts, filter, sortBy, currentUser]);

  const stats = useMemo(() => {
    return {
      total: filteredAndSortedPosts.length,
      totalEngagement: filteredAndSortedPosts.reduce((sum, p) => sum + ((p.data || p).engagement_score || 0), 0),
      totalViews: filteredAndSortedPosts.reduce((sum, p) => sum + ((p.data || p).views_count || 0), 0)
    };
  }, [filteredAndSortedPosts]);

  const handleCreatePost = () => {
    if (!currentUser) {
      setLoginPrompt({ isOpen: true, action: 'Viết Bài' });
      return;
    }
    setEditingPost(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPost = (post) => {
    if (!currentUser) {
      setLoginPrompt({ isOpen: true, action: 'Chỉnh Sửa' });
      return;
    }
    setEditingPost(post);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Page Header - Refined */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#7CB342]" />
            <span className="text-sm font-medium text-gray-700">Cộng Đồng Zero Farm</span>
          </div>
          
          <h1 className="font-serif font-medium text-4xl md:text-5xl text-[#0F0F0F] mb-4 leading-tight">
            Kết Nối & Chia Sẻ
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {stats.total} bài viết • {stats.totalEngagement} tương tác
          </p>
        </motion.div>

        {/* Create Post Button - Refined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <button
            onClick={handleCreatePost}
            className="w-full bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-[#7CB342] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-500 text-left flex-1 text-sm">
              {currentUser ? `${currentUser.full_name} ơi, bạn đang nghĩ gì?` : 'Đăng nhập để chia sẻ...'}
            </span>
          </button>
        </motion.div>

        {/* Refined Filters & Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentUser && (
                <>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'all'
                        ? 'bg-[#7CB342] text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Tất Cả
                  </button>
                  <button
                    onClick={() => setFilter('my-posts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'my-posts'
                        ? 'bg-[#7CB342] text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Của Tôi
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Sắp xếp
            </button>
          </div>

          {/* Sort Options - Dropdown Style */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm"
              >
                <p className="text-xs font-medium text-gray-500 mb-3">SẮP XẾP THEO</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSortBy('recent');
                      setShowFilters(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      sortBy === 'recent'
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className={`w-5 h-5 ${sortBy === 'recent' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${sortBy === 'recent' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Mới nhất
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('trending');
                      setShowFilters(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      sortBy === 'trending'
                        ? 'bg-orange-50 border-2 border-orange-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 ${sortBy === 'trending' ? 'text-orange-600' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${sortBy === 'trending' ? 'text-orange-600' : 'text-gray-700'}`}>
                      Nổi bật
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('popular');
                      setShowFilters(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      sortBy === 'popular'
                        ? 'bg-purple-50 border-2 border-purple-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${sortBy === 'popular' ? 'text-purple-600' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${sortBy === 'popular' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Phổ biến
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-8">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <p className="text-orange-700 mb-4">Không thể tải bài viết. Vui lòng thử lại sau.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#7CB342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#FF9800] transition-colors"
            >
              Tải Lại
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Đang tải bài viết...</p>
          </div>
        )}

        {/* Posts Feed */}
        {!isLoading && !isError && (
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <PostCard 
                  post={post} 
                  currentUser={currentUser}
                  onLoginRequired={(action) => setLoginPrompt({ isOpen: true, action })}
                  onEdit={handleEditPost}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State - Refined */}
        {!isLoading && !isError && filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-[#7CB342]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#7CB342]" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">
              Chưa Có Bài Viết
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {filter === 'my-posts' 
                ? 'Bạn chưa có bài viết nào. Hãy chia sẻ điều gì đó!' 
                : 'Hãy là người đầu tiên chia sẻ!'}
            </p>
            <button
              onClick={handleCreatePost}
              className="bg-[#7CB342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#FF9800] transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Bài Viết
            </button>
          </div>
        )}

        {/* Modals */}
        {currentUser && (
          <CreatePostModal 
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingPost(null);
            }}
            currentUser={currentUser}
            editingPost={editingPost}
          />
        )}
        
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={() => setLoginPrompt({ isOpen: false, action: '' })}
          action={loginPrompt.action}
        />
      </div>
    </div>
  );
}