import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesCategoryFilter({
  categories,
  activeFilter,
  setActiveFilter,
  showFilters
}) {
  // Desktop: always visible, Mobile: toggle with showFilters
  const shouldShow = typeof window !== 'undefined' ? (showFilters || window.innerWidth >= 640) : true;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-4 overflow-hidden"
        >
          {/* Mobile: Horizontal scroll */}
          <div className="sm:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2 w-max">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === category.key
                      ? 'bg-[#7CB342] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Flex wrap */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-1.5 ${
                  activeFilter === category.key
                    ? 'bg-[#7CB342] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-[#7CB342]/10 hover:text-[#7CB342] border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}