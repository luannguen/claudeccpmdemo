import React from 'react';
import { Sprout, ShoppingBag } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = {
  preorder: '#F59E0B', // amber
  regular: '#7CB342'   // green
};

export default function PreOrderRevenueChart({ analytics }) {
  if (!analytics) return null;

  const { dailyPreorderData, revenueComparison } = analytics;

  // Pie chart data
  const pieData = [
    { name: 'Pre-Order', value: revenueComparison.preorder, color: COLORS.preorder },
    { name: 'Đơn Thường', value: revenueComparison.regular, color: COLORS.regular }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Revenue Trend: Pre-Order vs Regular */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-amber-500" />
          So Sánh Doanh Thu 7 Ngày
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyPreorderData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${(value/1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Bar dataKey="preorder" name="Pre-Order" fill={COLORS.preorder} radius={[4, 4, 0, 0]} />
            <Bar dataKey="regular" name="Đơn Thường" fill={COLORS.regular} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Distribution Pie */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-green-600" />
          Phân Bố Doanh Thu
        </h3>
        <div className="flex items-center">
          <ResponsiveContainer width="60%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                contentStyle={{ borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex-1 space-y-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-gray-500">
                    {revenueComparison.preorder + revenueComparison.regular > 0
                      ? Math.round((item.value / (revenueComparison.preorder + revenueComparison.regular)) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}