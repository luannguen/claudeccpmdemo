import React, { useState, useEffect, useRef } from "react";

/**
 * Flip3DCarousel - Base component cho hiệu ứng 3D Coverflow
 * 
 * @param {Array} data - Mảng dữ liệu để render
 * @param {Function} renderItem - Function(item, isCenter) để render mỗi slide
 * @param {Number} initialIndex - Index khởi tạo
 * @param {Number} width - Chiều rộng carousel
 * @param {Number} height - Chiều cao carousel  
 * @param {Boolean} autoplay - Bật tự động chuyển
 * @param {Number} interval - Khoảng thời gian autoplay (ms)
 * @param {Function} onSlideChange - Callback(index) khi slide thay đổi
 */
export default function Flip3DCarousel({
  data = [],
  renderItem,
  initialIndex = 0,
  width = 900,
  height = 340,
  autoplay = false,
  interval = 3500,
  onSlideChange
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const mountedRef = useRef(false);
  const rootId = useRef(`flip3d-${Math.random().toString(36).slice(2, 9)}`);
  const autoplayRef = useRef(null);

  // Inject CSS một lần khi component mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const css = `
      /* Flip3DCarousel Base Styles */
      .${rootId.current} { 
        --w: ${width}px; 
        --h: ${height}px; 
        position: relative; 
        width: 100%; 
        max-width: var(--w); 
        height: var(--h); 
        perspective: 1400px; 
        margin: 16px auto; 
        touch-action: manipulation;
        user-select: none;
      }
      
      .${rootId.current} .viewport { 
        width: 100%; 
        height: 100%; 
        position: relative; 
        transform-style: preserve-3d; 
      }
      
      .${rootId.current} .slides { 
        height: 100%; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        position: absolute; 
        inset: 0; 
      }
      
      .${rootId.current} .slide { 
        position: absolute; 
        width: 60%; 
        height: 85%; 
        top: 7%; 
        left: 20%; 
        border-radius: 16px; 
        overflow: visible;
        box-shadow: 0 12px 32px rgba(0,0,0,0.3); 
        transition: transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms; 
        backface-visibility: hidden; 
        background: transparent;
        border: none;
      }

      /* Positioning Classes */
      .${rootId.current} .slide.center { 
        transform: translateX(0) translateZ(160px) rotateY(0deg) scale(1.05); 
        z-index: 40; 
      }
      
      .${rootId.current} .slide.left { 
        transform-origin: right center; 
        transform: translateX(-220px) translateZ(40px) rotateY(35deg) scale(0.9); 
        z-index: 30; 
        opacity: 0.95; 
      }
      
      .${rootId.current} .slide.right { 
        transform-origin: left center; 
        transform: translateX(220px) translateZ(40px) rotateY(-35deg) scale(0.9); 
        z-index: 30; 
        opacity: 0.95; 
      }
      
      .${rootId.current} .slide.leftFar { 
        transform-origin: right center; 
        transform: translateX(-420px) translateZ(-60px) rotateY(45deg) scale(0.75); 
        z-index: 20; 
        opacity: 0.6; 
      }
      
      .${rootId.current} .slide.rightFar { 
        transform-origin: left center; 
        transform: translateX(420px) translateZ(-60px) rotateY(-45deg) scale(0.75); 
        z-index: 20; 
        opacity: 0.6; 
      }

      .${rootId.current} .slide.far {
        opacity: 0;
        pointer-events: none;
      }

      /* Controls */
      .${rootId.current} .controls { 
        position: absolute; 
        inset: 0; 
        pointer-events: none; 
      }
      
      .${rootId.current} .btn-nav { 
        pointer-events: all; 
        position: absolute; 
        top: 50%; 
        transform: translateY(-50%); 
        width: 56px; 
        height: 56px; 
        border-radius: 12px; 
        display: grid; 
        place-items: center; 
        background: rgba(124, 179, 66, 0.15); 
        backdrop-filter: blur(8px); 
        border: 1px solid rgba(124, 179, 66, 0.2); 
        cursor: pointer; 
        transition: all 0.2s ease; 
        color: #7CB342;
      }
      
      .${rootId.current} .btn-nav:hover { 
        transform: translateY(-50%) scale(1.1); 
        background: rgba(124, 179, 66, 0.25); 
        box-shadow: 0 8px 24px rgba(124, 179, 66, 0.3);
      }
      
      .${rootId.current} .btn-nav.left { left: 12px; }
      .${rootId.current} .btn-nav.right { right: 12px; }

      /* Dots */
      .${rootId.current} .dots { 
        position: absolute; 
        left: 50%; 
        transform: translateX(-50%); 
        bottom: 14px; 
        display: flex; 
        gap: 8px; 
        pointer-events: all;
      }
      
      .${rootId.current} .dot { 
        width: 12px; 
        height: 12px; 
        border-radius: 999px; 
        background: rgba(255,255,255,0.3); 
        border: 1px solid rgba(124, 179, 66, 0.3); 
        cursor: pointer; 
        transition: all 0.2s; 
      }
      
      .${rootId.current} .dot.active { 
        width: 36px; 
        border-radius: 20px; 
        background: linear-gradient(90deg, #7CB342, #FF9800); 
      }

      /* Responsive */
      @media (max-width: 900px) { 
        .${rootId.current} { --w: calc(100vw - 32px); } 
        .${rootId.current} .slide { width: 78%; height: 82%; left: 11%; } 
      }
      
      @media (max-width: 640px) { 
        .${rootId.current} { --h: 320px; }
        .${rootId.current} .slide { width: 85%; height: 85%; left: 7.5%; top: 5%; } 
        .${rootId.current} .btn-nav { display: none; } 
      }
    `;

    const style = document.createElement("style");
    style.setAttribute("data-flip3d", rootId.current);
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      const el = document.querySelector(`style[data-flip3d="${rootId.current}"]`);
      if (el) el.remove();
    };
  }, [width, height]);

  // Navigation functions
  const prev = () => {
    setCurrentIndex((i) => {
      const newIndex = (i - 1 + data.length) % data.length;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  };

  const next = () => {
    setCurrentIndex((i) => {
      const newIndex = (i + 1) % data.length;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  };

  // Get position class for slide i relative to currentIndex
  const getPositionClass = (i) => {
    const n = data.length;
    if (n === 1) return "center";
    const diff = ((i - currentIndex) % n + n) % n;

    if (diff === 0) return "center";
    if (diff === 1) return "right";
    if (diff === 2) return "rightFar";
    if (diff === n - 1) return "left";
    if (diff === n - 2) return "leftFar";
    return "far";
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) < minSwipeDistance) return;
    
    if (distance > 0) {
      next(); // Swipe left
    } else {
      prev(); // Swipe right
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, data.length]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || data.length <= 1) return;
    
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      next();
    }, interval);
    
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, interval, data.length, currentIndex]);

  if (!data || data.length === 0) return null;

  return (
    <div className={rootId.current} aria-roledescription="carousel">
      <div 
        className="viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="slides">
          {data.map((item, i) => {
            const cls = getPositionClass(i);
            const isCenter = cls === "center";
            
            return (
              <div 
                key={i} 
                className={`slide ${cls}`} 
                aria-hidden={!isCenter}
              >
                {renderItem ? renderItem(item, isCenter, i) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="controls" aria-hidden={false}>
        {data.length > 1 && (
          <>
            <button 
              className="btn-nav left" 
              onClick={prev} 
              aria-label="previous slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M15 18L9 12L15 6" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>

            <button 
              className="btn-nav right" 
              onClick={next} 
              aria-label="next slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M9 6L15 12L9 18" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>

            <div className="dots">
              {data.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i === currentIndex ? "active" : ""}`} 
                  onClick={() => goToSlide(i)} 
                  aria-label={`go to slide ${i + 1}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}