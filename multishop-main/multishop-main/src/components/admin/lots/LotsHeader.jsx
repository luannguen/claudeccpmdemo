import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function LotsHeader({ preOrder }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Link
          to={createPageUrl('AdminPreOrders')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {preOrder ? `Lot của "${preOrder.preorder_name}"` : 'Quản lý Lot sản phẩm'}
          </h1>
          <p className="text-gray-600">Quản lý các lot thu hoạch và cơ chế tăng giá</p>
        </div>
      </div>
    </div>
  );
}