import React from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, Activity } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function DashboardQuickActions({ analytics }) {
  const actions = [
    {
      to: "AdminProducts",
      icon: Package,
      iconColor: "text-[#7CB342]",
      title: "Quản Lý Sản Phẩm",
      description: "Thêm, sửa, xóa sản phẩm"
    },
    {
      to: "AdminOrders",
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      title: "Quản Lý Đơn Hàng",
      description: `Xử lý ${analytics.pendingOrders} đơn hàng mới`
    },
    {
      to: "AdminCustomers",
      icon: Users,
      iconColor: "text-orange-600",
      title: "Khách Hàng",
      description: `+${analytics.newCustomers} khách hàng mới`
    },
    {
      to: "AdminInventory",
      icon: Activity,
      iconColor: "text-purple-600",
      title: "Kho Hàng",
      description: `${analytics.lowStockProducts} sản phẩm sắp hết`
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.to}
            to={createPageUrl(action.to)}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:border-[#7CB342] transition-all group hover:scale-105"
          >
            <Icon className={`w-8 h-8 ${action.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
            <h4 className="font-bold text-[#0F0F0F] mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}