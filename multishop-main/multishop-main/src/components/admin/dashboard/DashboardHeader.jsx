import React from "react";
import { Leaf, Download } from "lucide-react";

const dateRangeLabels = {
  today: 'Hôm nay',
  week: '7 ngày',
  month: '30 ngày',
  year: 'Năm'
};

export default function DashboardHeader({ dateRange, setDateRange, onExport }) {
  return (
    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-3">
        <Leaf className="w-8 h-8 text-[#7CB342]" />
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
            Tổng Quan Hệ Thống
          </h1>
          <p className="text-gray-600">Dashboard Analytics & Insights</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {['today', 'week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-[#7CB342] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {dateRangeLabels[range]}
          </button>
        ))}
        
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}