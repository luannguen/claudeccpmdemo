/**
 * SuccessStep - Step 4 of gift wizard
 * Show success message and gift details
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';

export default function SuccessStep({ result, receiver, onClose }) {
  const gift = result?.gift;

  return (
    <div className="p-6 text-center space-y-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 mx-auto bg-[#7CB342]/10 rounded-full flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Icon.CheckCircle size={48} className="text-[#7CB342]" />
        </motion.div>
      </motion.div>

      {/* Message */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quà đã được gửi!
        </h2>
        <p className="text-gray-600">
          Quà của bạn đã được gửi đến <span className="font-medium text-[#7CB342]">{receiver?.target_name}</span>
        </p>
      </div>

      {/* Gift Card Preview */}
      {gift && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#7CB342]/10 to-[#7CB342]/5 rounded-2xl p-6 max-w-sm mx-auto"
        >
          <div className="flex items-center gap-4">
            <img
              src={gift.item_image}
              alt={gift.item_name}
              className="w-20 h-20 rounded-xl object-cover shadow-lg"
            />
            <div className="text-left">
              <p className="font-bold text-gray-900">{gift.item_name}</p>
              <p className="text-[#7CB342] font-bold">
                {gift.item_value?.toLocaleString('vi-VN')}đ
              </p>
              {gift.message && (
                <p className="text-sm text-gray-500 italic mt-1 line-clamp-2">
                  "{gift.message}"
                </p>
              )}
            </div>
          </div>

          {/* Redemption Code */}
          {gift.redemption_code && (
            <div className="mt-4 pt-4 border-t border-[#7CB342]/20">
              <p className="text-xs text-gray-500 mb-1">Mã đổi quà</p>
              <p className="font-mono text-lg font-bold text-[#7CB342] tracking-wider">
                {gift.redemption_code}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 rounded-xl p-4 text-left text-sm"
      >
        <div className="flex gap-3">
          <Icon.Info size={20} className="text-blue-500 flex-shrink-0" />
          <div className="text-blue-700">
            <p className="font-medium mb-1">Tiếp theo</p>
            <ul className="space-y-1 text-blue-600">
              <li>• {receiver?.target_name} sẽ nhận được thông báo về quà</li>
              <li>• Họ có thể đổi quà và nhập địa chỉ nhận hàng</li>
              <li>• Quà có hiệu lực 90 ngày</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          onClick={() => onClose?.()}
          className="w-full bg-[#7CB342] hover:bg-[#689F38]"
        >
          <Icon.CheckCircle size={18} className="mr-2" />
          Hoàn tất
        </Button>
      </motion.div>
    </div>
  );
}