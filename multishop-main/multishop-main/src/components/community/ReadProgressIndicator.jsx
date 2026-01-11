import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ReadProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const percentage = (scrollTop / trackLength) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    window.addEventListener('scroll', calculateProgress);
    calculateProgress();

    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#7CB342] to-[#558B2F]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Circular Progress (bottom right) */}
      {progress > 10 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-32 right-6 z-40"
        >
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90 w-12 h-12">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#e5e7eb"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#7CB342"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}