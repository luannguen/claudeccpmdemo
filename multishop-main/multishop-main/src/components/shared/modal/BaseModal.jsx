/**
 * BaseModal - Base wrapper cho EnhancedModal
 * Cung cấp preset configs cho các use case phổ biến
 * 
 * USAGE:
 * import { BaseModal } from '@/components/shared/modal';
 * 
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Modal Title"
 *   size="md" // compact, sm, md, lg, xl, full
 * >
 *   {children}
 * </BaseModal>
 */

import React from 'react';
import EnhancedModal from '@/components/EnhancedModal';

// Size presets mapping to maxWidth
const SIZE_PRESETS = {
  compact: 'sm',   // 384px - Cho confirm dialog, mini form
  sm: 'md',        // 448px - Cho form đơn giản
  md: 'lg',        // 512px - Default cho hầu hết modal
  lg: '2xl',       // 672px - Cho form phức tạp, detail view
  xl: '4xl',       // 896px - Cho dashboard modal, table view
  full: '6xl'      // 1152px - Full content modal
};

// Feature presets cho các loại modal
const FEATURE_PRESETS = {
  // Modal form đơn giản - không cần drag/resize
  form: {
    showControls: false,
    enableDrag: false,
    enableResize: false
  },
  // Modal detail view - có controls đầy đủ
  detail: {
    showControls: true,
    enableDrag: true,
    enableResize: true
  },
  // Modal confirm/alert - compact, không drag
  alert: {
    showControls: false,
    enableDrag: false,
    enableResize: false
  },
  // Modal dashboard - full featured
  dashboard: {
    showControls: true,
    enableDrag: true,
    enableResize: true,
    persistPosition: true
  }
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  preset = 'form',
  // Override individual features
  showControls,
  enableDrag,
  enableResize,
  persistPosition,
  positionKey,
  className = '',
  zIndex = 100,
  onMinimize,
  // Custom icon for header (optional)
  icon: IconComponent,
  iconColor,
  // Footer actions (optional)
  footer
}) {
  // Merge preset with overrides
  const presetConfig = FEATURE_PRESETS[preset] || FEATURE_PRESETS.form;
  
  const finalConfig = {
    showControls: showControls ?? presetConfig.showControls,
    enableDrag: enableDrag ?? presetConfig.enableDrag,
    enableResize: enableResize ?? presetConfig.enableResize,
    persistPosition: persistPosition ?? presetConfig.persistPosition ?? false
  };

  const maxWidth = SIZE_PRESETS[size] || SIZE_PRESETS.md;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      showControls={finalConfig.showControls}
      enableDrag={finalConfig.enableDrag}
      enableResize={finalConfig.enableResize}
      persistPosition={finalConfig.persistPosition}
      positionKey={positionKey || `modal-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      className={className}
      zIndex={zIndex}
      onMinimize={onMinimize}
    >
      {/* Custom Header Icon */}
      {IconComponent && (
        <div className="px-6 pt-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor || 'bg-gray-100'}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {footer}
        </div>
      )}
    </EnhancedModal>
  );
}

// Named exports for convenience
export { BaseModal };