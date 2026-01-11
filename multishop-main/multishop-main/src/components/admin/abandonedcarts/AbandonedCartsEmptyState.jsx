import React from "react";
import { ShoppingCart } from "lucide-react";

export default function AbandonedCartsEmptyState() {
  return (
    <div className="text-center py-12 bg-white rounded-xl">
      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Không có giỏ hàng bị bỏ quên</p>
    </div>
  );
}