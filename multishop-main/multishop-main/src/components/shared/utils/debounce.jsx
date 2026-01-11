/**
 * Debounce utilities
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  
  const debouncedFn = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  debouncedFn.cancel = () => clearTimeout(timeoutId);
  
  return debouncedFn;
}

/**
 * Hook to debounce a value
 * @param {*} value
 * @param {number} delay - Delay in ms
 * @returns {*} Debounced value
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to debounce a callback
 * @param {Function} callback
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced callback
 */
export function useDebouncedCallback(callback, delay = 300) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef();

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Throttle function (limit calls to once per interval)
 * @param {Function} fn
 * @param {number} interval - Interval in ms
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastCall = 0;
  let timeoutId;

  return (...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Hook to throttle a callback
 * @param {Function} callback
 * @param {number} interval - Interval in ms
 * @returns {Function}
 */
export function useThrottledCallback(callback, interval = 300) {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef(0);
  const timeoutRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastCallRef.current);

    if (remaining <= 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      lastCallRef.current = now;
      callbackRef.current(...args);
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, remaining);
    }
  }, [interval]);
}

export default {
  debounce,
  useDebouncedValue,
  useDebouncedCallback,
  throttle,
  useThrottledCallback
};