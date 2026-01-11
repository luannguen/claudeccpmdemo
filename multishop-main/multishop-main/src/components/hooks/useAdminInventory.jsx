import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const logTypes = [
  { value: "all", label: "Tất cả" },
  { value: "import", label: "Nhập kho" },
  { value: "export", label: "Xuất kho" },
  { value: "adjustment", label: "Điều chỉnh" },
  { value: "damage", label: "Hư hỏng" },
  { value: "return", label: "Trả hàng" }
];

export function useInventoryLogs() {
  return useQuery({
    queryKey: ['inventory-logs'],
    queryFn: async () => {
      const result = await base44.entities.InventoryLog.list('-created_date', 100);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useInventoryProducts() {
  return useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const result = await base44.entities.Product.list('-created_date', 100);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useFilteredLogs(inventoryLogs, searchTerm, typeFilter) {
  return useMemo(() => {
    return (inventoryLogs || []).filter(log => {
      const matchesSearch = log.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || log.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [inventoryLogs, searchTerm, typeFilter]);
}

export function useLowStockProducts(products) {
  return useMemo(() => {
    return (products || []).filter(p =>
      (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)
    );
  }, [products]);
}

export function useCreateInventoryLog(products, onSuccess) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const log = await base44.entities.InventoryLog.create(data);

      const product = products.find(p => p.id === data.product_id);
      if (product) {
        await base44.entities.Product.update(product.id, {
          stock_quantity: data.stock_after
        });
      }

      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-logs']);
      queryClient.invalidateQueries(['inventory-products']);
      queryClient.invalidateQueries(['admin-products']);
      onSuccess?.();
    }
  });
}