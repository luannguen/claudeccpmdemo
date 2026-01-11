import React from 'react';
import { Search, Grid3x3, List, Table2 } from 'lucide-react';
import { PAYMENT_STATUSES } from '@/components/hooks/useAdminPaymentVerification';

export default function VerificationFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
        >
          {PAYMENT_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Table2 className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}