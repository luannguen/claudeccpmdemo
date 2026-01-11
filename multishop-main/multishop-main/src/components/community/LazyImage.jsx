import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LazyImage({ src, alt, className, onClick, priority = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const imgRef = React.useRef(null);

  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className={className} onClick={onClick}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      
      {/* Actual image - only load when in view */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            setIsLoaded(true);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}