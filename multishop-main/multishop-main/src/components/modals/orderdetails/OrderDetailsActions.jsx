import React from "react";
import { Printer, DollarSign } from "lucide-react";

/**
 * OrderDetailsActions - Các nút hành động admin
 * 
 * Props:
 * - onClose: function
 * - onPrint: function | null
 * - onRefund: function
 * - onUpdate: function
 * - canRefund: boolean
 */
export default function OrderDetailsActions({ 
  onClose, 
  onPrint, 
  onRefund, 
  onUpdate, 
  canRefund 
}) {
  return (
    <div className="flex gap-2">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 text-sm"
      >
        Đóng
      </button>
      
      {/* Print Button */}
      {onPrint && (
        <button
          onClick={onPrint}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
        >
          <Printer className="w-4 h-4" />
          In
        </button>
      )}
      
      {/* Refund Button */}
      {canRefund && (
        <button
          onClick={onRefund}
          className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
        >
          <DollarSign className="w-4 h-4" />
          Hoàn
        </button>
      )}
      
      {/* Update Button */}
      <button 
        onClick={onUpdate}
        className="flex-1 px-4 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] text-sm"
      >
        Cập Nhật
      </button>
    </div>
  );
}