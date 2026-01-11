import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function RevenueTrendChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#7CB342]" />
        Xu Hướng Doanh Thu
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={2} name="Doanh thu" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}