import React from "react";
import { Search } from "lucide-react";
import { customerTypes, customerSources } from "@/components/hooks/useAdminCustomers";

export default function CustomersFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  sourceFilter,
  setSourceFilter
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
        >
          {customerTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
        >
          {customerSources.map(source => (
            <option key={source.value} value={source.value}>{source.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}