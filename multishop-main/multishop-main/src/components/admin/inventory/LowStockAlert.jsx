import React from "react";
import { AlertTriangle } from "lucide-react";

export default function LowStockAlert({ lowStockProducts }) {
  if (!lowStockProducts || lowStockProducts.length === 0) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-xl mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-orange-800 mb-2">Cảnh Báo Tồn Kho Thấp</h3>
          <div className="space-y-1">
            {lowStockProducts.map(product => (
              <p key={product.id} className="text-sm text-orange-700">
                • {product.name}: <strong>{product.stock_quantity || 0}</strong> {product.unit} (ngưỡng: {product.low_stock_threshold || 10})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}