import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Facebook, Link2, MessageCircle, CheckCircle } from "lucide-react";

/**
 * QuickShareMenu - Menu chia sẻ nhanh cho sản phẩm
 * Kích hoạt bằng long press + swipe right
 */
export default function QuickShareMenu({ product, isOpen, onClose, position = { x: 0, y: 0 } }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform) => {
    const productUrl = `${window.location.origin}/product/${product.product_id}`;
    const shareText = `Xem ${product.product_name} - ${(product.product_price || 0).toLocaleString('vi-VN')}đ`;

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      
      case 'zalo':
        window.open(
          `https://page.zalo.me/share?url=${encodeURIComponent(productUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      
      case 'copy':
        try {
          await navigator.clipboard.writeText(productUrl);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            onClose?.();
          }, 1500);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
      
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: product.product_name,
              text: shareText,
              url: productUrl
            });
          } catch (err) {
            console.error('Share failed:', err);
          }
        }
    }
    
    if (platform !== 'copy') {
      setTimeout(() => onClose?.(), 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
          />

          {/* Menu */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)'
            }}
            className="bg-white rounded-2xl shadow-2xl p-4 z-[160] border-2 border-[#7CB342]/20"
          >
            <div className="text-center mb-4">
              <h4 className="font-bold text-sm text-gray-900 mb-1">Chia sẻ sản phẩm</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{product.product_name}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700">Facebook</span>
              </button>

              {/* Zalo */}
              <button
                onClick={() => handleShare('zalo')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700">Zalo</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleShare('copy')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {copied ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Link2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-gray-700">
                  {copied ? 'Đã copy!' : 'Copy'}
                </span>
              </button>

              {/* More (Native Share) */}
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-700">Khác</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}