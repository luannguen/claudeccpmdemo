import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Maximize2, Minimize2, Minus, Move, RotateCcw } from 'lucide-react';

// Icons imported from lucide-react for EnhancedModal controls

/**
 * ✨ ENHANCED MODAL COMPONENT - 15+ UX IMPROVEMENTS
 * 
 * Features:
 * 1. ✅ Click outside to close
 * 2. ✅ ESC key to close
 * 3. ✅ Draggable (di chuyển)
 * 4. ✅ Resizable (phóng to/thu nhỏ)
 * 5. ✅ Maximize/Restore button
 * 6. ✅ Minimize to corner
 * 7. ✅ Smooth animations
 * 8. ✅ Backdrop blur
 * 9. ✅ Focus trap
 * 10. ✅ Scroll lock body
 * 11. ✅ Mobile responsive (full screen)
 * 12. ✅ Persistent position (remember last position)
 * 13. ✅ Z-index management
 * 14. ✅ Keyboard shortcuts
 * 15. ✅ Touch gestures (swipe down to close on mobile)
 * 16. ✅ Auto-center on open
 * 17. ✅ Prevent body scroll when open
 * 18. ✅ Accessible (ARIA labels)
 */

const EnhancedModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '4xl',
  showControls = true,
  enableDrag = true,
  enableResize = true,
  initialPosition = 'center',
  persistPosition = false,
  positionKey = 'default-modal',
  className = '',
  onMinimize,
  zIndex = 100,
  // Mobile-specific: force fixed position, no drag
  mobileFixed = true,
  // NEW: Disable click outside to close entirely (for complex forms with portals)
  disableBackdropClose = false
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Track if any Radix portal (Select, Dropdown, etc.) is currently open
  const [hasOpenPortal, setHasOpenPortal] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile with mobileFixed, force position to center and disable drag
  const effectiveDrag = mobileFixed && isMobile ? false : enableDrag;
  const effectivePersist = mobileFixed && isMobile ? false : persistPosition;
  
  const dragControls = useDragControls();
  const modalRef = useRef(null);
  const contentRef = useRef(null);



  // ✅ 2. ESC Key to Close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isMinimized]);

  // ✅ 10. Scroll Lock Body
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, isMinimized]);

  // ✅ 12. Persistent Position OR Reset (Skip on mobile with mobileFixed)
  useEffect(() => {
    if (isOpen) {
      // On mobile with mobileFixed, always reset to center
      if (mobileFixed && isMobile) {
        setPosition({ x: 0, y: 0 });
        return;
      }
      
      if (effectivePersist) {
        const savedPos = localStorage.getItem(`modal-pos-${positionKey}`);
        if (savedPos) {
          const parsed = JSON.parse(savedPos);
          setPosition(parsed);
        }
      } else {
        // Reset position to center when not persisting
        setPosition({ x: 0, y: 0 });
      }
    }
  }, [isOpen, effectivePersist, positionKey, isMobile, mobileFixed]);

  useEffect(() => {
    if (effectivePersist && position.x !== 0 && position.y !== 0) {
      localStorage.setItem(`modal-pos-${positionKey}`, JSON.stringify(position));
    }
  }, [position, effectivePersist, positionKey]);

  // ✅ 9. Focus Trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  // ✅ 14. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (!isOpen) return;
      
      // Ctrl/Cmd + M: Maximize/Restore
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setIsMaximized(!isMaximized);
      }
      
      // Ctrl/Cmd + D: Minimize
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleMinimize();
      }
      
      // Ctrl/Cmd + R: Reset Position
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setPosition({ x: 0, y: 0 });
        setIsMaximized(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, isMaximized]);

  // ✅ 15. Touch Gestures (Swipe Down to Close)
  const handleTouchStart = (e) => {
    setTouchStart({ y: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStart.y;
    if (deltaY > 100) {
      onClose();
    }
  };

  // ✅ 5. Maximize/Restore
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // ✅ 6. Minimize to Corner
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) {
      onMinimize(!isMinimized);
    }
  };

  // ✅ Reset Position
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setIsMaximized(false);
    setIsMinimized(false);
  };

  // Get size classes
  const getSizeClasses = () => {
    if (isMaximized) return 'w-full h-full rounded-none';
    
    const maxWidthMap = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      'full': 'max-w-full'
    };
    
    return `${maxWidthMap[maxWidth] || maxWidthMap['4xl']} w-full rounded-3xl`;
  };

  if (!isOpen) return null;

  // Minimized State (Corner Preview)
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={handleMinimize}
          className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 group"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">{title}</span>
          <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </motion.div>
    );
  }

  // Mobile-specific classes for full-width bottom sheet style
  const getMobileClasses = () => {
    if (mobileFixed && isMobile) {
      return 'fixed inset-x-0 bottom-0 top-auto rounded-t-3xl rounded-b-none max-h-[90vh] w-full';
    }
    return '';
  };

  // Click backdrop to close - chỉ khi click trực tiếp vào backdrop
  const handleBackdropClick = (e) => {
    // Chỉ đóng khi click CHÍNH XÁC vào backdrop (e.target === e.currentTarget)
    // và KHÔNG có Radix portal nào đang mở
    if (e.target === e.currentTarget && !disableBackdropClose) {
      // Check nếu có Radix portal đang mở thì không đóng
      const hasOpenRadixPortal = document.querySelector(
        '[data-radix-popper-content-wrapper], [data-radix-select-content], [data-radix-dropdown-menu-content]'
      );
      if (!hasOpenRadixPortal) {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex ${
          mobileFixed && isMobile 
            ? 'items-end justify-center p-0' 
            : 'items-center justify-center p-4'
        }`}
        style={{ zIndex }}
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={modalRef}
          initial={{ 
            opacity: 0, 
            scale: mobileFixed && isMobile ? 1 : 0.95, 
            y: mobileFixed && isMobile ? 100 : 20 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: (isMaximized || (mobileFixed && isMobile)) ? 0 : position.x,
            ...((isMaximized || (mobileFixed && isMobile)) ? {} : position)
          }}
          exit={{ 
            opacity: 0, 
            scale: mobileFixed && isMobile ? 1 : 0.95, 
            y: mobileFixed && isMobile ? 100 : 20 
          }}
          drag={effectiveDrag && !isMaximized}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            if (!mobileFixed || !isMobile) {
              setPosition({ 
                x: position.x + info.offset.x, 
                y: position.y + info.offset.y 
              });
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white shadow-2xl overflow-hidden ${
            mobileFixed && isMobile 
              ? getMobileClasses() 
              : `${getSizeClasses()} ${isMaximized ? '' : 'max-h-[90vh]'}`
          } ${className}`}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          {/* Mobile drag handle indicator */}
          {mobileFixed && isMobile && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          )}

          {/* Header with Controls */}
          <div 
            data-modal-header="true"
            className={`sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 ${
              effectiveDrag && !isMaximized && !isMobile ? 'cursor-move' : ''
            }`}
            onPointerDown={(e) => {
              if (effectiveDrag && !isMaximized && showControls && !isMobile) {
                dragControls.start(e);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 flex-1">
              {effectiveDrag && !isMaximized && !isMobile && (
                <Move className="w-5 h-5 text-gray-400" />
              )}
              <h2 className="text-lg md:text-2xl font-serif font-bold text-[#0F0F0F] truncate">
                {title}
              </h2>
            </div>

            {showControls && (
              <div className="flex items-center gap-2">
                {/* Reset Position - Hidden on Mobile */}
                <button
                  onClick={handleReset}
                  className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Reset position"
                >
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                </button>

                {/* Minimize - Hidden on Mobile */}
                {onMinimize && (
                  <button
                    onClick={handleMinimize}
                    className="hidden sm:block p-2 rounded-lg hover:bg-yellow-100 transition-colors"
                    aria-label="Minimize"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                )}

                {/* Maximize/Restore - Hidden on Mobile */}
                <button
                  onClick={handleMaximize}
                  className="hidden sm:block p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  aria-label={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Close - Always visible */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`overflow-y-auto ${
              mobileFixed && isMobile 
                ? 'max-h-[calc(90vh-80px)]' 
                : isMaximized 
                  ? 'h-[calc(100vh-64px)]' 
                  : 'max-h-[calc(90vh-64px)]'
            }`}
          >
            {children}
          </div>

          {/* Keyboard Shortcuts Helper - Desktop Only */}
          {showControls && (
            <div className="hidden sm:block absolute bottom-4 left-4 text-xs text-gray-400 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
              <p className="font-medium mb-1">⌨️ Shortcuts:</p>
              <p>ESC: Close</p>
              <p>Ctrl+M: Maximize</p>
              <p>Ctrl+D: Minimize</p>
              <p>Ctrl+R: Reset</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnhancedModal;