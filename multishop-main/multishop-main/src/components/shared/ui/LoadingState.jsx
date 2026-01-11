/**
 * Loading State Component
 * Consistent loading indicator across the app
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * @typedef {Object} LoadingStateProps
 * @property {string} [message] - Loading message
 * @property {'sm'|'md'|'lg'|'full'} [size] - Size variant
 * @property {string} [className] - Additional classes
 */

export function LoadingState({ 
  message = 'Đang tải...', 
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-16',
    full: 'min-h-[400px]'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    full: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <Loader2 className={`${iconSizes[size]} animate-spin text-green-600`} />
      {message && (
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}

/**
 * Loading overlay for modals/cards
 */
export function LoadingOverlay({ message = 'Đang xử lý...' }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading for buttons/small areas
 */
export function InlineLoading({ className = '' }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />;
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton({ className = '', variant = 'text' }) {
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-48 w-full',
    image: 'h-32 w-full'
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
}

/**
 * Card skeleton for lists
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton variant="title" />
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" />
        </div>
      ))}
    </div>
  );
}

export default LoadingState;