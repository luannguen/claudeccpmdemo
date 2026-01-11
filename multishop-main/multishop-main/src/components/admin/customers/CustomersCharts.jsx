import React from "react";
import { BarChart3, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function CustomersCharts({ stats }) {
  const chartData = [
    { name: 'Khách mới', value: stats.byType.new, color: '#2196F3' },
    { name: 'Hoạt động', value: stats.byType.active, color: '#7CB342' },
    { name: 'VIP', value: stats.byType.vip, color: '#FF9800' },
    { name: 'Không hoạt động', value: stats.byType.inactive, color: '#9E9E9E' }
  ];

  const sourceData = [
    { name: 'Đơn hàng', value: stats.bySource.order },
    { name: 'Giỏ hàng', value: stats.bySource.cart },
    { name: 'Thủ công', value: stats.bySource.manual }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#7CB342]" />
          Phân Loại Khách Hàng
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#7CB342]" />
          Nguồn Khách Hàng
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sourceData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#7CB342" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}