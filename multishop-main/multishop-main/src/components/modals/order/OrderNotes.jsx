import React from 'react';

export function OrderNote({ note }) {
  if (!note) return null;
  
  return (
    <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-gray-600 mb-1">Ghi chú:</p>
      <p className="text-sm font-medium">{note}</p>
    </div>
  );
}

export function OrderCancelNote({ note, orderStatus }) {
  if (!note || orderStatus !== 'cancelled') return null;
  
  return (
    <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200">
      <p className="text-xs sm:text-sm text-red-600 mb-1 font-medium">Lý do hủy:</p>
      <p className="text-sm text-red-900">{note.replace('Khách hủy: ', '')}</p>
    </div>
  );
}