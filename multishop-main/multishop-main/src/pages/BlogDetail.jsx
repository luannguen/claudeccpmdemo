import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";

// Hooks
import {
  useBlogPost,
  useBlogPosts,
  useRelatedPosts,
  useUpdateViews
} from "@/components/hooks/useBlog";

// Components
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogDetailMeta from "@/components/blog/BlogDetailMeta";
import BlogDetailContent from "@/components/blog/BlogDetailContent";
import BlogShareSection from "@/components/blog/BlogShareSection";
import BlogRelatedPosts from "@/components/blog/BlogRelatedPosts";
import BlogDetailCTA from "@/components/blog/BlogDetailCTA";
import { BookReaderView } from "@/components/community/bookreader";

export default function BlogDetail() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const postId = urlParams.get('id');
  
  const [showBookReader, setShowBookReader] = useState(false);

  // Data hooks
  const { data: post, isLoading } = useBlogPost(postId);
  const { data: allPosts = [] } = useBlogPosts();
  const relatedPosts = useRelatedPosts(allPosts, post, postId);
  const updateViewsMutation = useUpdateViews(post, postId);

  // Update view count
  useEffect(() => {
    if (postId && post) {
      const timer = setTimeout(() => {
        updateViewsMutation.mutate(postId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [postId, post]);
  
  // Transform blog post to UserPost format for BookReader
  const blogAsPost = post ? {
    id: post.id,
    created_date: post.created_date,
    data: {
      content: post.content,
      author_name: post.author || 'Admin',
      author_avatar: null,
      images: post.featured_image ? [post.featured_image] : [],
      video_url: null,
      poll: null,
      product_links: []
    }
  } : null;

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Không Tìm Thấy Bài Viết</h1>
          <Link
            to={createPageUrl("Blog")}
            className="text-[#7CB342] hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Back Button & Book Reader Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            to={createPageUrl("Blog")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại Blog
          </Link>
          
          <button
            onClick={() => setShowBookReader(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Chế độ đọc sách</span>
          </button>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <BlogDetailHeader post={post} />

          <div className="p-8 md:p-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-6 leading-tight">
              {post.title}
            </h1>

            <BlogDetailMeta post={post} />
            <BlogDetailContent post={post} />
            <BlogShareSection shareUrl={shareUrl} shareTitle={shareTitle} />
          </div>
        </motion.article>

        <BlogRelatedPosts posts={relatedPosts} />
        <BlogDetailCTA />
      </div>
      
      {/* Book Reader Modal */}
      <AnimatePresence>
        {showBookReader && blogAsPost && (
          <BookReaderView
            post={blogAsPost}
            currentUser={null}
            onClose={() => setShowBookReader(false)}
            initialSettings={{ viewMode: 'focus' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}