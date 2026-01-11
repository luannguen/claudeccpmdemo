import React from 'react';
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '@/components/hooks/useAdminPaymentAnalytics';

export function RevenueLineChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Doanh Thu Theo Ngày</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={3} name="Doanh thu" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentMethodPieChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Phân Bổ Theo Phương Thức</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueLineChart;