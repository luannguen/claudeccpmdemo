import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Tìm kiếm...", 
  className = "",
  onClear
}) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] text-sm transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-gray-600" />
        </button>
      )}
    </div>
  );
}