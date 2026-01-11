import React from "react";
import { ORDER_STATUS_OPTIONS } from "@/components/hooks/useOrderDetails";

/**
 * OrderDetailsUpdateForm - Form cập nhật trạng thái đơn hàng
 * 
 * Props:
 * - newStatus: string
 * - setNewStatus: function
 * - internalNote: string
 * - setInternalNote: function
 */
export default function OrderDetailsUpdateForm({ 
  newStatus, 
  setNewStatus, 
  internalNote, 
  setInternalNote 
}) {
  return (
    <div>
      <h3 className="font-bold mb-4">Cập Nhật</h3>
      <div className="space-y-4">
        {/* Status Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái</label>
          <select 
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            {ORDER_STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Internal Note */}
        <div>
          <label className="block text-sm font-medium mb-2">Ghi chú</label>
          <textarea 
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            placeholder="Ghi chú..." 
          />
        </div>
      </div>
    </div>
  );
}