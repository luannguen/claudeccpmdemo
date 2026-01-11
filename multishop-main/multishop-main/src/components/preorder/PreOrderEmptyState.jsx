import React from "react";
import { Package } from "lucide-react";

export default function PreOrderEmptyState() {
  return (
    <div className="text-center py-20">
      <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">Chưa có lot nào đang bán</h3>
      <p className="text-gray-600">Vui lòng quay lại sau</p>
    </div>
  );
}