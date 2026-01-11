import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Star, Edit, Trash2 } from 'lucide-react';
import { getIconComponent } from '@/components/hooks/useAdminPaymentMethods';

export default function PaymentMethodCard({
  method,
  onToggleActive,
  onSetDefault,
  onEdit,
  onDelete
}) {
  const IconComp = getIconComponent(method.icon_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
        method.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              method.is_active ? 'bg-[#7CB342] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <IconComp className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{method.method_name}</h3>
              <p className="text-xs text-gray-600 font-mono">{method.method_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {method.is_default && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Mặc định
              </span>
            )}
            {method.is_recommended && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                Đề xuất
              </span>
            )}
          </div>
        </div>

        {method.description && (
          <p className="text-sm text-gray-600 mb-4">{method.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Phí</p>
            <p className="font-bold">
              {method.fee_type === 'fixed' 
                ? `${method.fee.toLocaleString('vi-VN')}đ`
                : `${method.fee_percent}%`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Thứ tự</p>
            <p className="font-bold">{method.display_order}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(method)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              method.is_active 
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {method.is_active ? <><EyeOff className="w-4 h-4" />Ẩn</> : <><Eye className="w-4 h-4" />Hiện</>}
          </button>

          {!method.is_default && method.is_active && (
            <button
              onClick={() => onSetDefault(method)}
              className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Đặt Mặc Định
            </button>
          )}

          <button
            onClick={() => onEdit(method)}
            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium text-sm hover:bg-purple-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(method)}
            disabled={method.is_default}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}