import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";

/**
 * DragToCartOverlay - Overlay cho tính năng kéo thả sản phẩm vào giỏ/wishlist
 * 
 * @param {Boolean} isActive - Đang trong chế độ drag
 * @param {Object} dragPosition - Vị trí hiện tại của item đang kéo { x, y }
 * @param {Object} product - Thông tin sản phẩm đang kéo
 */
export default function DragToCartOverlay({ 
  isActive = false, 
  dragPosition = { x: 0, y: 0 },
  product = null,
  onDropToCart,
  onDropToWishlist
}) {
  const [dropZones, setDropZones] = useState({
    cart: { x: 0, y: 0, width: 0, height: 0 },
    wishlist: { x: 0, y: 0, width: 0, height: 0 }
  });

  const cartRef = useRef(null);
  const wishlistRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const updateDropZones = () => {
      if (cartRef.current) {
        const rect = cartRef.current.getBoundingClientRect();
        setDropZones(prev => ({
          ...prev,
          cart: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
        }));
      }
      if (wishlistRef.current) {
        const rect = wishlistRef.current.getBoundingClientRect();
        setDropZones(prev => ({
          ...prev,
          wishlist: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
        }));
      }
    };

    updateDropZones();
    window.addEventListener('resize', updateDropZones);
    return () => window.removeEventListener('resize', updateDropZones);
  }, [isActive]);

  const isOverCart = () => {
    if (!isActive || !dragPosition) return false;
    const { x, y } = dragPosition;
    const { cart } = dropZones;
    return (
      x >= cart.x && 
      x <= cart.x + cart.width && 
      y >= cart.y && 
      y <= cart.y + cart.height
    );
  };

  const isOverWishlist = () => {
    if (!isActive || !dragPosition) return false;
    const { x, y } = dragPosition;
    const { wishlist } = dropZones;
    return (
      x >= wishlist.x && 
      x <= wishlist.x + wishlist.width && 
      y >= wishlist.y && 
      y <= wishlist.y + wishlist.height
    );
  };

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[140] pointer-events-none"
          />

          {/* Drop Zones */}
          <div className="fixed inset-0 z-[145] pointer-events-none">
            {/* Cart Drop Zone */}
            <motion.div
              ref={cartRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isOverCart() ? 1.2 : 1, 
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-24 right-6"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isOverCart() 
                  ? 'bg-green-500 shadow-2xl scale-110' 
                  : 'bg-white shadow-xl'
              }`}>
                <ShoppingCart className={`w-10 h-10 ${
                  isOverCart() ? 'text-white' : 'text-green-600'
                }`} />
              </div>
              <p className="text-center text-xs font-medium mt-2 text-white drop-shadow-lg">
                Giỏ hàng
              </p>
            </motion.div>

            {/* Wishlist Drop Zone */}
            <motion.div
              ref={wishlistRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isOverWishlist() ? 1.2 : 1, 
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-24 left-6"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isOverWishlist() 
                  ? 'bg-pink-500 shadow-2xl scale-110' 
                  : 'bg-white shadow-xl'
              }`}>
                <Heart className={`w-10 h-10 ${
                  isOverWishlist() ? 'text-white fill-white' : 'text-pink-600'
                }`} />
              </div>
              <p className="text-center text-xs font-medium mt-2 text-white drop-shadow-lg">
                Yêu thích
              </p>
            </motion.div>
          </div>

          {/* Dragging Ghost */}
          {product && dragPosition && (
            <motion.div
              style={{
                position: 'fixed',
                left: dragPosition.x,
                top: dragPosition.y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
              className="z-[150]"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-3 border-2 border-[#7CB342] w-32">
                {product.product_image && (
                  <img 
                    src={product.product_image} 
                    alt={product.product_name}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-xs font-medium text-gray-900 line-clamp-2">
                  {product.product_name}
                </p>
              </div>
            </motion.div>
          )}

          {/* Instruction */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-[145] pointer-events-none"
          >
            <div className="bg-white rounded-full px-6 py-3 shadow-2xl border-2 border-[#7CB342]">
              <p className="text-sm font-medium text-gray-900">
                Kéo đến biểu tượng để thêm
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}