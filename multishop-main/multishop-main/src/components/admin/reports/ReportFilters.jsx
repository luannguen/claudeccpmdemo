import React from 'react';

const RANGES = [
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'quarter', label: '3 tháng' },
  { key: 'year', label: 'Năm' },
];

export default function ReportFilters({ dateRange, setDateRange }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng Thời Gian
        </label>
        <div className="flex gap-2">
          {RANGES.map((range) => (
            <button
              key={range.key}
              onClick={() => setDateRange(range.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range.key
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}