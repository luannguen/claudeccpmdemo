import React from 'react';

export default function TransactionsTable({ transactions }) {
  if (!transactions?.transactions?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Giao Dịch Gần Đây</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Mã đơn</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Khách hàng</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Phương thức</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">Số tiền</th>
              <th className="text-center p-3 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {transactions.transactions.slice(0, 20).map((tx) => (
              <tr key={tx.order_id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-sm font-mono">{tx.order_number}</td>
                <td className="p-3 text-sm">{tx.customer_name}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tx.payment_method === 'bank_transfer' ? 'bg-blue-100 text-blue-700' :
                    tx.payment_method === 'cod' ? 'bg-gray-100 text-gray-700' :
                    tx.payment_method === 'momo' ? 'bg-pink-100 text-pink-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {tx.payment_method}
                  </span>
                </td>
                <td className="p-3 text-sm text-right font-bold">
                  {(tx.amount || 0).toLocaleString('vi-VN')}đ
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tx.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    tx.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {tx.payment_status}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {new Date(tx.created_date).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}