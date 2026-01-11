import React from 'react';

export default function TopCustomersList({ customers }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
        Top 10 Khách Hàng VIP
      </h3>
      <div className="space-y-3">
        {customers.map((customer, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              idx === 0 ? 'bg-yellow-500 text-white' :
              idx === 1 ? 'bg-gray-400 text-white' :
              idx === 2 ? 'bg-orange-500 text-white' :
              'bg-gray-300 text-gray-600'
            }`}>
              #{idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{customer.name}</p>
              <p className="text-sm text-gray-500 truncate">{customer.email}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#7CB342]">{customer.revenue.toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-gray-500">{customer.orders} đơn</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}