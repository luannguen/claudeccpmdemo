import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <h1 className="text-[150px] md:text-[200px] font-serif font-bold text-[#7CB342]/20 leading-none">
              404
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Leaf className="w-24 h-24 text-[#7CB342]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0F0F0F] mb-4">
            Trang Không Tồn Tại
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Xin lỗi, chúng tôi không tìm thấy trang bạn đang tìm kiếm. <br />
            Có thể trang đã bị xóa hoặc đường dẫn không chính xác.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to={createPageUrl('Home')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7CB342] text-white rounded-full font-medium hover:bg-[#FF9800] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Về Trang Chủ
          </Link>
          <Link
            to={createPageUrl('Services')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[#7CB342] text-[#7CB342] rounded-full font-medium hover:bg-[#7CB342] hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Xem Sản Phẩm
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-600 mb-4">Có thể bạn đang tìm:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={createPageUrl('Services')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#7CB342] hover:text-white transition-colors"
            >
              Sản Phẩm
            </Link>
            <Link
              to={createPageUrl('Blog')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#7CB342] hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              to={createPageUrl('Contact')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#7CB342] hover:text-white transition-colors"
            >
              Liên Hệ
            </Link>
            <Link
              to={createPageUrl('Gallery')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#7CB342] hover:text-white transition-colors"
            >
              Thư Viện
            </Link>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-gray-500 text-sm"
        >
          <p>Cần hỗ trợ? Liên hệ hotline:</p>
          <a
            href="tel:+84987654321"
            className="text-[#7CB342] font-bold text-lg hover:underline"
          >
            098 765 4321
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}