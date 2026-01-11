import React, { useState } from "react";

// Hooks
import {
  useBlogPosts,
  useFilteredPosts,
  useFeaturedPosts,
  useRegularPosts
} from "@/components/hooks/useBlog";

// Components
import BlogHeader from "@/components/blog/BlogHeader";
import BlogFilters from "@/components/blog/BlogFilters";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogNewsletterCTA from "@/components/blog/BlogNewsletterCTA";
import BlogEmptyState from "@/components/blog/BlogEmptyState";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Data hooks
  const { data: posts = [], isLoading } = useBlogPosts();
  const filteredPosts = useFilteredPosts(posts, activeCategory, searchTerm);
  const featuredPosts = useFeaturedPosts(filteredPosts);
  const regularPosts = useRegularPosts(filteredPosts);

  // Handlers
  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
  };

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <BlogHeader />

        <BlogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
          </div>
        )}

        {/* Featured Posts */}
        {!isLoading && featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-8">Bài Viết Nổi Bật</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <BlogPostCard key={post.id} post={post} index={index} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {!isLoading && regularPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-8">Tất Cả Bài Viết</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <BlogPostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <BlogEmptyState onReset={handleResetFilters} />
        )}

        <BlogNewsletterCTA />
      </div>
    </div>
  );
}