/**
 * BookReaderPage - Single page renderer
 * Render một trang trong Book Reader
 * Kế thừa logic render markdown từ PostCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PAGE_TYPES, THEME_STYLES } from './types';
import { Icon } from '@/components/ui/AnimatedIcon';

/**
 * Markdown renderer với full support
 * Kế thừa từ PostCard + mở rộng cho Book Reader
 */
function MarkdownContent({ text, theme, fontSize, lineHeight }) {
  const styles = THEME_STYLES[theme];
  
  if (!text) return null;
  

  
  // Custom text renderer để xử lý hashtags/mentions
  const renderTextWithHashtags = (children) => {
    return React.Children.map(children, child => {
      if (typeof child !== 'string') return child;
      
      const parts = child.split(/(#[\w\u0080-\uFFFF]+|@[\w\u0080-\uFFFF]+)/g);
      
      return parts.map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <span key={i} className="text-[#7CB342] font-medium cursor-pointer hover:underline">
              {part}
            </span>
          );
        }
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-blue-600 font-medium cursor-pointer hover:underline">
              {part}
            </span>
          );
        }
        return part;
      });
    });
  };
  
  return (
    <div 
      className={`prose prose-gray max-w-none ${styles.text}`}
      style={{ fontSize: `${fontSize}px`, lineHeight }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-3 text-inherit border-b border-gray-200 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-5 mb-2 text-inherit flex items-center gap-2">
            <span className="w-1 h-6 bg-[#7CB342] rounded-full flex-shrink-0"></span>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-4 mb-2 text-inherit">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="my-3 leading-relaxed text-inherit">
            {renderTextWithHashtags(children)}
          </p>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#7CB342] pl-4 py-2 my-4 bg-green-50/50 rounded-r-lg italic">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="my-3 ml-4 space-y-1 list-disc text-inherit">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 ml-4 space-y-1 list-decimal text-inherit">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-inherit">{renderTextWithHashtags(children)}</li>
        ),
        code: ({ inline, className, children, ...props }) => {
          if (inline) {
            return (
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[#7CB342] text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto my-4">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
        // Tables - với remarkGfm
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#7CB342]/10">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 bg-white/50">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 text-left text-sm font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2.5 text-sm">
            {children}
          </td>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#7CB342] hover:underline">
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-inherit">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-inherit">{children}</em>
        ),
        hr: () => (
          <hr className="my-6 border-t-2 border-gray-200" />
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt || ''} className="rounded-xl max-w-full h-auto my-4 shadow-md" />
        )
      }}
    >
      {text}
    </ReactMarkdown>
    </div>
  );
}

// Text Page với Markdown support
function TextPage({ page, theme, fontSize, lineHeight, isFocusMode = false }) {
  const styles = THEME_STYLES[theme];
  
  return (
    <div className={`h-full flex flex-col justify-start overflow-y-auto ${styles.bg} ${
      isFocusMode 
        ? 'max-w-2xl mx-auto px-8 py-12' 
        : 'px-6 py-8'
    }`}>
      {page.sectionTitle && !isFocusMode && (
        <h2 className={`text-xl font-bold mb-4 text-[#7CB342] flex items-center gap-2`}>
          <Icon.FileText size={20} />
          {page.sectionTitle}
        </h2>
      )}
      <MarkdownContent 
        text={page.text} 
        theme={theme} 
        fontSize={fontSize} 
        lineHeight={lineHeight}
      />
    </div>
  );
}

// Media Page (Images)
function MediaPage({ page, theme }) {
  const styles = THEME_STYLES[theme];
  
  if (page.videoUrl) {
    // Video embed
    const getEmbedUrl = (url) => {
      const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      
      return url;
    };
    
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={getEmbedUrl(page.videoUrl)}
            className="w-full h-full"
            allowFullScreen
            title="Video"
          />
        </div>
      </div>
    );
  }
  
  // Images
  const images = page.images || [];
  const gridClass = images.length === 1 ? 'grid-cols-1' :
                    images.length === 2 ? 'grid-cols-2' :
                    images.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2';
  
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className={`grid ${gridClass} gap-3 w-full max-w-2xl`}>
        {images.map((img, idx) => (
          <div 
            key={idx}
            className={`relative rounded-xl overflow-hidden shadow-lg ${
              images.length === 3 && idx === 0 ? 'col-span-2' : ''
            }`}
            style={{ aspectRatio: images.length === 1 ? '16/9' : '1/1' }}
          >
            <img 
              src={img} 
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Poll Page
function PollPage({ page, theme, currentUser, onVote }) {
  const styles = THEME_STYLES[theme];
  const poll = page.poll;
  const userEmail = currentUser?.email || '';
  const hasVoted = poll.options?.some(opt => opt.voters?.includes(userEmail));
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Icon.BarChart size={24} className="text-blue-600" />
          <h3 className={`text-xl font-bold ${styles.text}`}>{poll.question}</h3>
        </div>
        
        <div className="space-y-3">
          {poll.options?.map((option, idx) => {
            const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes * 100).toFixed(0) : 0;
            const userVoted = option.voters?.includes(userEmail);
            
            return (
              <button
                key={idx}
                onClick={() => !hasVoted && onVote?.(idx)}
                disabled={hasVoted && !userVoted}
                className={`w-full text-left p-4 rounded-xl transition-all relative overflow-hidden ${
                  userVoted 
                    ? 'bg-blue-500 text-white' 
                    : hasVoted
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-500'
                }`}
              >
                {hasVoted && (
                  <div 
                    className="absolute inset-0 bg-blue-100"
                    style={{ width: `${percentage}%`, opacity: 0.3 }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="font-medium">{option.text}</span>
                  {hasVoted && (
                    <span className="font-bold">{percentage}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <p className={`text-sm mt-4 ${styles.secondary}`}>
          {totalVotes} lượt bình chọn
        </p>
      </div>
    </div>
  );
}

// Products Page - Enhanced Grid View
function ProductsPage({ page, theme, onProductClick, onAddToCart }) {
  const styles = THEME_STYLES[theme];
  const products = page.products || [];
  
  // Grid columns based on product count
  const getGridCols = () => {
    if (products.length === 1) return 'grid-cols-1 max-w-xs';
    if (products.length === 2) return 'grid-cols-2 max-w-md';
    if (products.length <= 4) return 'grid-cols-2 max-w-lg';
    return 'grid-cols-2 sm:grid-cols-3 max-w-2xl';
  };
  
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#7CB342]/10 flex items-center justify-center">
          <Icon.ShoppingBag size={20} className="text-[#7CB342]" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${styles.text}`}>Sản phẩm liên quan</h3>
          <p className={`text-sm ${styles.secondary}`}>{products.length} sản phẩm được đề cập</p>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className={`grid ${getGridCols()} gap-4 mx-auto w-full`}>
        {products.map((product, idx) => (
          <ProductGridCard
            key={idx}
            product={product}
            theme={theme}
            onQuickView={() => onProductClick?.(product)}
            onAddToCart={() => onAddToCart?.(product)}
          />
        ))}
      </div>
      
      {/* CTA */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${styles.secondary}`}>
          Nhấn vào sản phẩm để xem chi tiết
        </p>
      </div>
    </div>
  );
}

// Product Grid Card - Reusable product card cho Book Reader
function ProductGridCard({ product, theme, onQuickView, onAddToCart }) {
  const styles = THEME_STYLES[theme];
  
  const handleQuickView = (e) => {
    e?.stopPropagation();
    // Dispatch global event để QuickViewModal bắt được
    window.dispatchEvent(new CustomEvent('quick-view-product', { 
      detail: { 
        product: {
          id: product.product_id,
          name: product.product_name,
          image_url: product.product_image,
          price: product.product_price,
          video_url: product.product_video,
          unit: 'kg',
          short_description: 'Sản phẩm từ bài viết cộng đồng',
          rating_average: 5,
          rating_count: 0,
          total_sold: 0
        }
      }
    }));
  };
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Dispatch global add-to-cart event
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: product.product_id,
        name: product.product_name,
        price: product.product_price,
        unit: 'kg',
        image_url: product.product_image,
        quantity: 1
      } 
    }));
    
    // Toast feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg z-[200] animate-bounce';
    toast.innerHTML = '✅ Đã thêm vào giỏ!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };
  
  return (
    <div
      onClick={handleQuickView}
      className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {product.product_image ? (
          <img 
            src={product.product_image}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Icon.Image size={32} className="text-gray-300" />
          </div>
        )}
        
        {/* Video badge */}
        {product.product_video && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <Icon.Play size={12} />
            Video
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Icon.Eye size={18} className="text-gray-700" />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 bg-[#7CB342] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Icon.ShoppingCart size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h4 className={`font-medium text-sm line-clamp-2 ${styles.text}`}>
          {product.product_name}
        </h4>
        
        {product.product_price && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[#7CB342] font-bold">
              {product.product_price.toLocaleString()}đ
            </span>
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 bg-[#7CB342]/10 rounded-lg flex items-center justify-center hover:bg-[#7CB342]/20 transition-colors"
            >
              <Icon.Plus size={16} className="text-[#7CB342]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function BookReaderPage({ 
  page, 
  theme, 
  fontSize, 
  lineHeight,
  currentUser,
  onVote,
  onProductClick,
  isActive,
  direction,
  isFocusMode = false
}) {
  if (!page) return null;
  
  const pageVariants = {
    enter: (direction) => ({
      x: direction === 'next' ? 300 : -300,
      opacity: 0,
      rotateY: direction === 'next' ? -15 : 15
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0
    },
    exit: (direction) => ({
      x: direction === 'next' ? -300 : 300,
      opacity: 0,
      rotateY: direction === 'next' ? 15 : -15
    })
  };
  
  const renderPageContent = () => {
    switch (page.type) {
      case PAGE_TYPES.TEXT:
        return <TextPage page={page} theme={theme} fontSize={fontSize} lineHeight={lineHeight} isFocusMode={isFocusMode} />;
      case PAGE_TYPES.MEDIA:
        return <MediaPage page={page} theme={theme} />;
      case PAGE_TYPES.POLL:
        return <PollPage page={page} theme={theme} currentUser={currentUser} onVote={onVote} />;
      case PAGE_TYPES.PRODUCTS:
        return <ProductsPage page={page} theme={theme} onProductClick={onProductClick} onAddToCart={onProductClick} />;
      default:
        return <TextPage page={page} theme={theme} fontSize={fontSize} lineHeight={lineHeight} isFocusMode={isFocusMode} />;
    }
  };
  
  return (
    <motion.div
      className={`absolute inset-0 backface-hidden ${
        isFocusMode ? 'flex items-center justify-center' : ''
      }`}
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
      style={{ perspective: 1000 }}
    >
      {renderPageContent()}
    </motion.div>
  );
}