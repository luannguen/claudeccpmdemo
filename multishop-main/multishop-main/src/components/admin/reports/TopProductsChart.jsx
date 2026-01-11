import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TopProductsChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
        Top 10 Sản Phẩm Bán Chạy
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
          <Legend />
          <Bar dataKey="revenue" fill="#7CB342" name="Doanh thu (VNĐ)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}