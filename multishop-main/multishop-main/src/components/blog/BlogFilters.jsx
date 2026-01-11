import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { blogCategories } from "@/components/hooks/useBlog";

export default function BlogFilters({ searchTerm, setSearchTerm, activeCategory, setActiveCategory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-12"
    >
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#7CB342] transition-colors"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-4">
        {blogCategories.map((category) => (
          <button
            key={category.value}
            onClick={() => setActiveCategory(category.value)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeCategory === category.value
                ? 'bg-[#7CB342] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-[#7CB342]/10 hover:text-[#7CB342] border border-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}