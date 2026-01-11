import React from "react";
import { BarChart3, Target } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

export default function DashboardCharts({ dailyData, categoryRevenue }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#7CB342]" />
          Xu Hướng Doanh Thu 7 Ngày
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={2} name="Doanh thu" />
            <Line type="monotone" dataKey="orders" stroke="#FF9800" strokeWidth={2} name="Đơn hàng" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#7CB342]" />
          Doanh Thu Theo Danh Mục
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {Object.keys(categoryRevenue).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}