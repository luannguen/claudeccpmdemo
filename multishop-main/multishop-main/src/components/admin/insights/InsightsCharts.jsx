import React from 'react';
import { Users, Award, Calendar } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

export function SegmentPieChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#7CB342]" />
        Customer Segmentation (RFM)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CLVBarChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-[#7CB342]" />
        CLV Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
          <Legend />
          <Bar dataKey="count" fill="#7CB342" name="Số khách hàng" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CohortLineChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#7CB342]" />
        Customer Acquisition Cohorts (Last 12 Months)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="customers" stroke="#7CB342" strokeWidth={2} name="Khách hàng mới" />
          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF9800" strokeWidth={2} name="Doanh thu (VNĐ)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomerStatusCards({ newCustomers, returningCustomers, churnedCustomers }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-4">Khách Mới (30 ngày)</h4>
        <p className="text-4xl font-bold text-blue-600 mb-2">{newCustomers}</p>
        <p className="text-sm text-blue-700">Khách hàng đăng ký lần đầu</p>
      </div>

      <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
        <h4 className="font-bold text-green-900 mb-4">Khách Quay Lại (30 ngày)</h4>
        <p className="text-4xl font-bold text-green-600 mb-2">{returningCustomers}</p>
        <p className="text-sm text-green-700">Đã mua ít nhất 2 lần</p>
      </div>

      <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
        <h4 className="font-bold text-red-900 mb-4">Khách Churn (90+ ngày)</h4>
        <p className="text-4xl font-bold text-red-600 mb-2">{churnedCustomers}</p>
        <p className="text-sm text-red-700">Không mua hàng trong 90 ngày</p>
      </div>
    </div>
  );
}