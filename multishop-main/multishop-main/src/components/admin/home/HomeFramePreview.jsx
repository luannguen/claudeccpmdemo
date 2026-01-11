/**
 * HomeFramePreview - Preview homepage với device toggle
 */

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/AnimatedIcon";
import EnhancedModal from "@/components/EnhancedModal";

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' }
};

export default function HomeFramePreview({ frames, device, onDeviceChange, onClose }) {
  const deviceConfig = DEVICE_SIZES[device];

  return (
    <EnhancedModal
      isOpen={true}
      onClose={onClose}
      title="Xem trước Homepage"
      maxWidth="7xl"
    >
      {/* Device Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        {Object.entries(DEVICE_SIZES).map(([key, config]) => (
          <Button
            key={key}
            variant={device === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDeviceChange(key)}
            className={device === key ? 'bg-[#7CB342]' : ''}
          >
            {key === 'desktop' && <Icon.Presentation size={16} className="mr-1" />}
            {key === 'tablet' && <Icon.Layers size={16} className="mr-1" />}
            {key === 'mobile' && <Icon.Phone size={16} className="mr-1" />}
            {config.label}
          </Button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="flex justify-center bg-gray-900 rounded-lg p-4 min-h-[500px]">
        <motion.div
          className="bg-white rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: deviceConfig.width,
            maxWidth: '100%',
            height: device === 'desktop' ? '70vh' : deviceConfig.height,
            maxHeight: '70vh'
          }}
          animate={{ width: deviceConfig.width }}
          transition={{ duration: 0.3 }}
        >
          <iframe
            src="/"
            className="w-full h-full border-0"
            title="Homepage Preview"
          />
        </motion.div>
      </div>

      {/* Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Preview đang hiển thị homepage với {frames.filter(f => f.is_active).length} frames đang bật</p>
        <p className="text-xs mt-1">Lưu ý: Scroll trong iframe để xem các frames</p>
      </div>
    </EnhancedModal>
  );
}