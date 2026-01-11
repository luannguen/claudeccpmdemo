import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Import error logger (will be loaded dynamically to avoid circular deps)
let logError = (error, context) => console.error('Error:', error, context);

// Try to load error logger
try {
  const ErrorLogger = require('@/components/shared/errors/ErrorLogger');
  if (ErrorLogger && ErrorLogger.logError) {
    logError = ErrorLogger.logError;
  }
} catch (e) {
  // ErrorLogger not available, use console
}

// ========== ERROR FALLBACK UI (Function Component with hooks) ==========
function ErrorFallbackUI({ error, errorId, errorInfo, onRetry, onReload }) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const handleGoHome = () => {
    navigate(createPageUrl('Home'));
  };

  const handleCopyError = () => {
    const errorReport = `
=== Error Report ===
ID: ${errorId}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
UserAgent: ${navigator.userAgent}

Error: ${error?.toString()}

Stack:
${error?.stack || 'N/A'}

Component Stack:
${errorInfo?.componentStack || 'N/A'}
==================
    `.trim();
    
    navigator.clipboard.writeText(errorReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          Oops! Có Lỗi Xảy Ra
        </h1>
        
        <p className="text-gray-600 mb-4">
          Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
        </p>

        {/* Error ID for support reference */}
        <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6 inline-block">
          <span className="text-xs text-gray-500">Mã lỗi: </span>
          <span className="text-sm font-mono font-medium text-gray-700">{errorId}</span>
        </div>

        {/* Show error in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                <Bug className="w-3 h-3" /> Dev Info
              </span>
              <button
                onClick={handleCopyError}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-red-800 font-mono break-all">
              {error.toString()}
            </p>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử Lại
          </button>
          <button
            onClick={onReload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tải Lại
          </button>
        </div>
        
        <button
          onClick={handleGoHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          Về Trang Chủ
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Nếu lỗi tiếp tục, vui lòng liên hệ hỗ trợ với mã lỗi trên.
        </p>
      </div>
    </div>
  );
}

// ========== ERROR BOUNDARY (Class Component) ==========
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log to centralized error service
    logError(error, {
      componentStack: errorInfo?.componentStack,
      errorId: this.state.errorId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  handleReload = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleRetry = () => {
    // Try to recover by clearing error state
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorId, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error, errorId, onRetry: this.handleRetry })
          : fallback;
      }

      // Default error UI with React Router navigation
      return (
        <ErrorFallbackUI
          error={error}
          errorId={errorId}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return children;
  }
}

// ========== FUNCTIONAL WRAPPER WITH HOOKS ==========

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary(Component, fallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Section-level error boundary for non-critical parts
 */
export function ErrorSection({ children, fallback }) {
  return (
    <ErrorBoundary 
      fallback={fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">Không thể tải phần này</p>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;