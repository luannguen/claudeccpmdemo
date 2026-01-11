import React from "react";
import { BarChart3 } from "lucide-react";
import { logTypes } from "@/components/hooks/useAdminInventory";

export default function InventoryLogsTable({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Sản phẩm</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Loại</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">Số lượng</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">Tồn trước</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">Tồn sau</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600">
                  {new Date(log.created_date).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <p className="font-medium">{log.product_name}</p>
                  {log.supplier && <p className="text-xs text-gray-500">NCC: {log.supplier}</p>}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    log.type === 'import' ? 'bg-green-100 text-green-600' :
                    log.type === 'export' ? 'bg-blue-100 text-blue-600' :
                    log.type === 'damage' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {logTypes.find(t => t.value === log.type)?.label}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className={`font-bold ${
                    log.type === 'import' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {log.type === 'import' ? '+' : '-'}{log.quantity}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-600">{log.stock_before || 0}</td>
                <td className="p-4 text-right">
                  <span className="font-bold text-[#7CB342]">{log.stock_after || 0}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {log.note || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có giao dịch nào</p>
        </div>
      )}
    </div>
  );
}