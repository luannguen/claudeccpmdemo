import React from "react";
import { Loader2 } from "lucide-react";

export default function AbandonedCartsLoadingState() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Đang tải...</p>
    </div>
  );
}