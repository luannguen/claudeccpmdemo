import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'];

export default function CategoryChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-[#7CB342]" />
        Doanh Thu Theo Danh Mục
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}