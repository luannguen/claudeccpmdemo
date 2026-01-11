import React from 'react';
import { Star } from 'lucide-react';

const SEGMENT_STYLES = {
  'Champions': 'bg-purple-100 text-purple-600',
  'Loyal': 'bg-green-100 text-green-600',
  'Potential Loyalist': 'bg-blue-100 text-blue-600',
  'At Risk': 'bg-orange-100 text-orange-600',
  'Needs Attention': 'bg-yellow-100 text-yellow-600',
  'Lost': 'bg-red-100 text-red-600'
};

const RANK_STYLES = [
  'bg-yellow-500 text-white',
  'bg-gray-400 text-white',
  'bg-orange-500 text-white'
];

export default function TopCustomersTable({ customers }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-[#7CB342]" />
        Top 10 Customers by CLV
      </h3>
      <div className="space-y-3">
        {customers.map((customer, idx) => (
          <div key={customer.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              idx < 3 ? RANK_STYLES[idx] : 'bg-gray-300 text-gray-600'
            }`}>
              #{idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{customer.full_name}</p>
              <p className="text-sm text-gray-600">
                {customer.email || customer.phone}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-600">{Math.round(customer.clv).toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-gray-500">CLV</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                SEGMENT_STYLES[customer.segment] || 'bg-gray-100 text-gray-600'
              }`}>
                {customer.segment}
              </span>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>RFM: {customer.rfmScore.toFixed(1)}</p>
              <p className="text-xs">F:{customer.frequency} | M:{(customer.monetary/1000000).toFixed(1)}M</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}