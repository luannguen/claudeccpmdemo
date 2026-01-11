/**
 * useHapticFeedback Hook
 * Provides haptic feedback for mobile devices
 */

export function useHapticFeedback() {
  const vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const light = () => vibrate(10);
  const medium = () => vibrate(20);
  const heavy = () => vibrate(30);
  const success = () => vibrate([10, 50, 10]);
  const error = () => vibrate([30, 100, 30, 100, 30]);
  const selection = () => vibrate(5);

  return {
    light,
    medium,
    heavy,
    success,
    error,
    selection
  };
}