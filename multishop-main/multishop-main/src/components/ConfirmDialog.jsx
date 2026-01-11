import React from 'react';
import EnhancedModal from './EnhancedModal';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const dialogConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    confirmBg: 'bg-red-500 hover:bg-red-600',
    cancelBg: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    confirmBg: 'bg-green-500 hover:bg-green-600',
    cancelBg: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
    cancelBg: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    confirmBg: 'bg-blue-500 hover:bg-blue-600',
    cancelBg: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'info', // danger, success, warning, info
  showCancel = true
}) {
  const config = dialogConfig[type] || dialogConfig.info;

  const handleConfirm = () => {
    // Only call onConfirm - the parent component is responsible for closing
    // Don't call onClose here as it may reset state before onConfirm completes
    onConfirm();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={config.icon}
      iconColor={config.iconColor}
      maxWidth="md"
      positionKey="confirm-dialog"
    >
      <div className="p-6 space-y-6">
        <p className="text-gray-700 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${config.cancelBg}`}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-colors ${config.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
}

/**
 * Helper function to show confirm dialog
 * Returns a promise that resolves to true/false
 */
export function showConfirmDialog({ title, message, confirmText, cancelText, type = 'info' }) {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const cleanup = () => {
      document.body.removeChild(container);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    // This would need React.render, but for simplicity, we'll use component directly
    // In practice, you'd use this component in React context
    window.dispatchEvent(new CustomEvent('show-confirm-dialog', {
      detail: { title, message, confirmText, cancelText, type, onConfirm: handleConfirm, onCancel: handleCancel }
    }));
  });
}