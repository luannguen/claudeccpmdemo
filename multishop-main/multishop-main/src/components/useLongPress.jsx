import { useState, useRef, useCallback } from 'react';

/**
 * useLongPress Hook - Phát hiện các cử chỉ tương tác
 * 
 * @param {Function} onLongPress - Callback khi long press thành công (không di chuyển)
 * @param {Function} onLongPressSwipeUp - Callback khi long press + vuốt lên
 * @param {Function} onClick - Callback cho click/tap thông thường
 * @param {Number} threshold - Ngưỡng di chuyển ngang tối đa (px) - Default: 10
 * @param {Number} longPressDuration - Thời gian giữ để kích hoạt long press (ms) - Default: 500
 * @returns {Object} { handlers, isLongPressing, progress }
 */
export default function useLongPress({
  onLongPress,
  onLongPressSwipeUp,
  onClick,
  threshold = 10,
  longPressDuration = 500
} = {}) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const longPressTriggeredRef = useRef(false);
  const clickTimeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setIsLongPressing(false);
    setProgress(0);
    longPressTriggeredRef.current = false;
  }, []);

  const startLongPress = useCallback((clientX, clientY) => {
    startPosRef.current = { x: clientX, y: clientY };
    currentPosRef.current = { x: clientX, y: clientY };
    longPressTriggeredRef.current = false;
    
    setIsLongPressing(true);
    setProgress(0);

    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / longPressDuration) * 100, 100);
      setProgress(newProgress);
    }, 16); // ~60fps

    // Long press timer
    timerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Check if user swiped up during long press
      const deltaY = currentPosRef.current.y - startPosRef.current.y;
      const deltaX = Math.abs(currentPosRef.current.x - startPosRef.current.x);
      
      // Swipe up detected (vertical > 40px up and horizontal < threshold)
      if (deltaY < -40 && deltaX < threshold * 1.5) {
        onLongPressSwipeUp?.();
      } else {
        onLongPress?.();
      }
      
      clearTimers();
    }, longPressDuration);
  }, [longPressDuration, threshold, onLongPress, onLongPressSwipeUp, clearTimers]);

  const checkMovement = useCallback((clientX, clientY) => {
    const deltaX = Math.abs(clientX - startPosRef.current.x);
    const deltaY = clientY - startPosRef.current.y;
    
    currentPosRef.current = { x: clientX, y: clientY };
    
    // Cancel if moved too much horizontally
    if (deltaX > threshold) {
      clearTimers();
      return;
    }
    
    // Cancel if moved down too much
    if (deltaY > threshold) {
      clearTimers();
    }
  }, [threshold, clearTimers]);

  const endLongPress = useCallback(() => {
    const wasLongPress = longPressTriggeredRef.current;
    const deltaX = Math.abs(currentPosRef.current.x - startPosRef.current.x);
    const deltaY = Math.abs(currentPosRef.current.y - startPosRef.current.y);
    
    // If not a long press and minimal movement, treat as click
    if (!wasLongPress && deltaX < threshold && deltaY < threshold && onClick) {
      clickTimeoutRef.current = setTimeout(() => {
        onClick?.();
      }, 50);
    }
    
    clearTimers();
  }, [onClick, clearTimers, threshold]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length > 1) return; // Ignore multi-touch
    const touch = e.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  }, [startLongPress]);

  const handleTouchMove = useCallback((e) => {
    if (!isLongPressing || e.touches.length > 1) return;
    const touch = e.touches[0];
    checkMovement(touch.clientX, touch.clientY);
  }, [isLongPressing, checkMovement]);

  const handleTouchEnd = useCallback((e) => {
    endLongPress();
  }, [endLongPress]);

  // Mouse handlers (for desktop testing)
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    startLongPress(e.clientX, e.clientY);
  }, [startLongPress]);

  const handleMouseMove = useCallback((e) => {
    if (!isLongPressing) return;
    checkMovement(e.clientX, e.clientY);
  }, [isLongPressing, checkMovement]);

  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    endLongPress();
  }, [endLongPress]);

  const handleMouseLeave = useCallback(() => {
    if (isLongPressing) {
      clearTimers();
    }
  }, [isLongPressing, clearTimers]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave
    },
    isLongPressing,
    progress
  };
}