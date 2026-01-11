import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/NotificationToast";

export default function PreOrderQuickActions({ analytics }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Run harvest check mutation
  const runHarvestCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('checkHarvestNotifications', { force: true });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-lots'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      addToast(
        `Đã kiểm tra ${data.results?.lotsChecked || 0} lots, gửi ${data.results?.harvestReminders || 0} thông báo`, 
        'success'
      );
    },
    onError: (error) => {
      addToast(error.message || 'Có lỗi khi chạy harvest check', 'error');
    }
  });

  // Update prices mutation
  const updatePricesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updatePreOrderLotPrices', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-lots'] });
      addToast(
        `Đã cập nhật giá cho ${data.updated || 0} lots`, 
        'success'
      );
    },
    onError: (error) => {
      addToast(error.message || 'Có lỗi khi cập nhật giá', 'error');
    }
  });

  const actions = [
    {
      icon: "Package",
      label: "Quản lý Lots",
      description: `${analytics.totalActiveLots} lots đang hoạt động`,
      url: createPageUrl("AdminProductLots"),
      color: "amber"
    },
    {
      icon: "Ban",
      label: "Yêu cầu hủy",
      description: `${analytics.pendingCancellations || 0} chờ xử lý`,
      url: createPageUrl("AdminPreOrderCancellations"),
      color: "red",
      badge: analytics.pendingCancellations
    },
    {
      icon: "Bell",
      label: "Check Harvest",
      description: "Kiểm tra lots sắp thu hoạch",
      onClick: () => runHarvestCheckMutation.mutate(),
      color: "green",
      isLoading: runHarvestCheckMutation.isPending
    },
    {
      icon: "TrendingUp",
      label: "Cập nhật giá",
      description: "Chạy price increase strategy",
      onClick: () => updatePricesMutation.mutate(),
      color: "blue",
      isLoading: updatePricesMutation.isPending
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Hành Động Nhanh</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const ActionIcon = Icon[action.icon];
          const colorClasses = {
            amber: "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700",
            red: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
            green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
            blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
          };

          const Component = action.url ? Link : 'button';
          
          return (
            <Component
              key={idx}
              to={action.url}
              onClick={action.onClick}
              disabled={action.isLoading}
              className={`relative ${colorClasses[action.color]} border-2 rounded-xl p-4 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {action.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              
              <ActionIcon size={24} className="mb-3" />
              <p className="font-bold text-sm mb-1">{action.label}</p>
              <p className="text-xs opacity-80">{action.description}</p>
              
              {action.isLoading && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                  <Icon.Spinner size={20} />
                </div>
              )}
            </Component>
          );
        })}
      </div>
    </div>
  );
}