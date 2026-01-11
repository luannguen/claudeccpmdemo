import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const customerTypes = [
  { value: "all", label: "Tất cả", icon: "👥" },
  { value: "new", label: "Khách mới", icon: "🆕" },
  { value: "active", label: "Hoạt động", icon: "✅" },
  { value: "vip", label: "VIP", icon: "⭐" },
  { value: "inactive", label: "Không hoạt động", icon: "💤" }
];

export const customerSources = [
  { value: "all", label: "Tất cả nguồn" },
  { value: "order", label: "Từ đơn hàng" },
  { value: "cart", label: "Từ giỏ hàng" },
  { value: "manual", label: "Thêm thủ công" }
];

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const result = await base44.entities.Customer.list('-created_date', 200);
      return result || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: ['admin-orders-for-customers'],
    queryFn: async () => {
      const result = await base44.entities.Order.list('-created_date', 200);
      return result || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}

export function useFilteredCustomers(customers, searchTerm, typeFilter, sourceFilter) {
  return useMemo(() => {
    const safeCustomers = customers || [];
    return safeCustomers.filter(customer => {
      const matchesSearch = 
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || customer.customer_type === typeFilter;
      const matchesSource = sourceFilter === "all" || customer.customer_source === sourceFilter;
      return matchesSearch && matchesType && matchesSource;
    });
  }, [customers, searchTerm, typeFilter, sourceFilter]);
}

export function useCustomerStats(customers) {
  return useMemo(() => {
    const safeCustomers = customers || [];
    const total = safeCustomers.length;
    const byType = {
      new: safeCustomers.filter(c => c.customer_type === 'new').length,
      active: safeCustomers.filter(c => c.customer_type === 'active').length,
      vip: safeCustomers.filter(c => c.customer_type === 'vip').length,
      inactive: safeCustomers.filter(c => c.customer_type === 'inactive').length
    };
    const bySource = {
      order: safeCustomers.filter(c => c.customer_source === 'order').length,
      cart: safeCustomers.filter(c => c.customer_source === 'cart').length,
      manual: safeCustomers.filter(c => c.customer_source === 'manual').length
    };
    const totalRevenue = safeCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgOrderValue = safeCustomers.reduce((sum, c) => sum + (c.avg_order_value || 0), 0) / (total || 1);

    return { total, byType, bySource, totalRevenue, avgOrderValue };
  }, [customers]);
}

export function useCustomerMutations(onSuccess) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create({
      ...data,
      customer_source: 'manual'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-customers']);
      onSuccess?.();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-customers']);
      onSuccess?.();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-customers'])
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useExportCustomers(filteredCustomers) {
  return useCallback(() => {
    const safeFiltered = filteredCustomers || [];
    const csv = [
      ['Họ tên', 'Email', 'Điện thoại', 'Phân loại', 'Tổng đơn', 'Tổng chi tiêu', 'Điểm tích lũy'].join(','),
      ...safeFiltered.map(c => [
        c.full_name,
        c.email || '',
        c.phone,
        c.customer_type,
        c.total_orders || 0,
        c.total_spent || 0,
        c.loyalty_points || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredCustomers]);
}