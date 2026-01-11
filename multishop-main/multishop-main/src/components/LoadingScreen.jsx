import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function LoadingScreen({ onLoadingComplete }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white"
        >
          <div className="text-center">
            {/* Animated Leaf Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              className="mb-8 flex justify-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 bg-[#7CB342] rounded-full flex items-center justify-center shadow-lg"
              >
                <Leaf className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-2">
                ZERO FARM
              </h1>
              <p className="font-sans text-sm md:text-base text-[#7CB342] tracking-[0.3em] uppercase mb-8">
                Trang Trại Organic
              </p>
            </motion.div>

            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-sans text-gray-500 text-sm md:text-base"
            >
              Đang tải sản phẩm tươi ngon...
            </motion.p>

            {/* Loading Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-1 bg-[#7CB342] rounded-full mx-auto mt-8"
            />

            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    y: [-50, -200],
                    x: [0, (i % 2 === 0 ? 50 : -50)]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: '10%'
                  }}
                >
                  <Leaf className="w-8 h-8 text-[#7CB342]" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}