/**
 * useConfirmDialog - Hook để hiển thị confirm dialog thay thế window.confirm()
 * Tuân thủ kiến trúc 3 lớp: UI Layer không dùng popup native
 */

import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: null
  });

  const showConfirm = useCallback(({
    title = 'Xác nhận',
    message,
    type = 'info',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
  }) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: (confirmed) => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(confirmed);
        }
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    dialog.onConfirm?.(true);
  }, [dialog.onConfirm]);

  const handleCancel = useCallback(() => {
    dialog.onConfirm?.(false);
  }, [dialog.onConfirm]);

  return {
    dialog,
    showConfirm,
    handleConfirm,
    handleCancel
  };
}