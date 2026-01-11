import React from "react";
import { AlertCircle } from "lucide-react";

export default function CategoriesErrorState() {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 text-center mb-8">
      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
      <p className="text-orange-700 mb-4">Không thể tải. Thử lại.</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800]"
      >
        Tải Lại
      </button>
    </div>
  );
}