import React from "react";
import { Search } from "lucide-react";

export default function AbandonedCartsSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo email..."
          className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
        />
      </div>
    </div>
  );
}