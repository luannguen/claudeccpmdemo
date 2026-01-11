import React from 'react';
import { Search, Shield } from 'lucide-react';

export default function ReviewsFilters({ filters, setters }) {
  const { searchTerm, statusFilter, ratingFilter, verifiedFilter } = filters;
  const { setSearchTerm, setStatusFilter, setRatingFilter, setVerifiedFilter } = setters;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên KH, sản phẩm, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="approved">✅ Đã duyệt</option>
          <option value="pending">⏳ Chờ duyệt</option>
          <option value="rejected">❌ Từ chối</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] text-sm"
        >
          <option value="all">Tất cả sao</option>
          {[5, 4, 3, 2, 1].map(star => (
            <option key={star} value={star}>{`${star} ⭐`}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
        />
        <span className="text-gray-700 flex items-center gap-1">
          <Shield className="w-4 h-4 text-green-600" />
          Chỉ hiện đã mua
        </span>
      </label>
    </div>
  );
}