/**
 * Error State Component
 * Consistent error display across the app
 */

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Lock, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorCodes } from '@/components/data/types';
import { mapError } from '@/components/shared/errors';

/**
 * @typedef {Object} ErrorStateProps
 * @property {string|Object} error - Error message or error object
 * @property {string} [domain] - Domain for error mapping
 * @property {Function} [onRetry] - Retry callback
 * @property {string} [className] - Additional classes
 */

const iconMap = {
  [ErrorCodes.NETWORK_ERROR]: WifiOff,
  [ErrorCodes.UNAUTHORIZED]: Lock,
  [ErrorCodes.FORBIDDEN]: Lock,
  [ErrorCodes.NOT_FOUND]: FileX,
  default: AlertTriangle
};

export function ErrorState({ 
  error,
  domain,
  onRetry,
  className = ''
}) {
  // Parse error
  let errorCode = ErrorCodes.UNKNOWN;
  let errorMessage = 'Đã xảy ra lỗi không xác định';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.code) {
    errorCode = error.code;
    errorMessage = error.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Map to user-friendly message
  const { userMessage } = mapError(errorCode, { domain, fallback: errorMessage });

  // Get icon
  const Icon = iconMap[errorCode] || iconMap.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Đã xảy ra lỗi</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{userMessage}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
}

/**
 * Network error
 */
export function NetworkError({ onRetry }) {
  return (
    <ErrorState
      error={{ code: ErrorCodes.NETWORK_ERROR }}
      onRetry={onRetry}
    />
  );
}

/**
 * Not found error
 */
export function NotFoundError({ 
  title = 'Không tìm thấy',
  message = 'Nội dung bạn tìm kiếm không tồn tại hoặc đã bị xóa',
  onBack
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileX className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
      )}
    </div>
  );
}

/**
 * Unauthorized error
 */
export function UnauthorizedError({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Yêu cầu đăng nhập</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Vui lòng đăng nhập để tiếp tục sử dụng tính năng này
      </p>
      {onLogin && (
        <Button onClick={onLogin} className="bg-green-600 hover:bg-green-700">
          Đăng nhập
        </Button>
      )}
    </div>
  );
}

export default ErrorState;