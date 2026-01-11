import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useHapticFeedback } from './hooks/useHapticFeedback';

export default function LikeAnimationEnhanced({ isLiked, onToggle, count = 0 }) {
  const [particles, setParticles] = useState([]);
  const haptic = useHapticFeedback();

  const handleClick = () => {
    // Haptic feedback
    if (!isLiked) {
      haptic.light();
      
      // Generate particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 6) * i
      }));
      setParticles(newParticles);

      // Clear particles after animation
      setTimeout(() => setParticles([]), 1000);
    }

    onToggle();
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleClick}
        className="relative flex items-center gap-2 group"
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isLiked ? (
            <Icon.Heart size={24} className="text-red-500 fill-current" />
          ) : (
            <Icon.Heart size={24} className="text-gray-400 group-hover:text-red-400 transition-colors" />
          )}
        </motion.div>
        <span className={`font-medium ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
          {count}
        </span>
      </button>

      {/* Heart Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0.5
            }}
            animate={{
              x: Math.cos(particle.angle * Math.PI / 180) * 50,
              y: Math.sin(particle.angle * Math.PI / 180) * 50,
              opacity: 0,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <Icon.Heart size={12} className="text-red-400 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}