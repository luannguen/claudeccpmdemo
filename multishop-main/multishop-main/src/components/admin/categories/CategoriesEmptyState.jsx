import React from "react";
import { Tag } from "lucide-react";

export default function CategoriesEmptyState() {
  return (
    <div className="text-center py-12">
      <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Không tìm thấy danh mục</p>
    </div>
  );
}