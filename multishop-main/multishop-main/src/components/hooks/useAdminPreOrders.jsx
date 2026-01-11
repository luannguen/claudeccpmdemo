import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function usePreOrdersData() {
  return useQuery({
    queryKey: ['admin-preorders'],
    queryFn: () => base44.entities.PreOrderProduct.list('-created_date', 500)
  });
}

export function usePreOrderLots() {
  return useQuery({
    queryKey: ['admin-product-lots'],
    queryFn: () => base44.entities.ProductLot.list('-created_date', 500)
  });
}

export function usePreOrderDetail(preorderId) {
  return useQuery({
    queryKey: ['preorder-detail', preorderId],
    queryFn: () => base44.entities.PreOrderProduct.filter({ id: preorderId }, '-created_date', 1).then(data => data[0]),
    enabled: !!preorderId
  });
}

export function useFilteredPreOrders(preOrders, searchTerm, statusFilter) {
  return useMemo(() => {
    return preOrders.filter(po => {
      const matchSearch = po.preorder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [preOrders, searchTerm, statusFilter]);
}

export function usePreOrderStats(preOrders, lots) {
  return useMemo(() => ({
    total: preOrders.length,
    active: preOrders.filter(p => p.status === 'active').length,
    totalRevenue: preOrders.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
    activeLots: lots.filter(l => l.status === 'active').length
  }), [preOrders, lots]);
}

export function useDeletePreOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => base44.entities.PreOrderProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-preorders']);
    }
  });
}

export function usePreOrderFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  return { searchTerm, setSearchTerm, statusFilter, setStatusFilter };
}

export function usePreOrderFormModal() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPreOrder, setEditingPreOrder] = useState(null);
  
  const openCreate = useCallback(() => {
    setEditingPreOrder(null);
    setIsFormOpen(true);
  }, []);
  
  const openEdit = useCallback((preOrder) => {
    setEditingPreOrder(preOrder);
    setIsFormOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingPreOrder(null);
  }, []);
  
  return { isFormOpen, editingPreOrder, openCreate, openEdit, closeModal };
}

// Status helpers
export const preOrderStatusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'completed', label: 'Hoàn thành' }
];

export function getPreOrderStatusColor(status) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'inactive': return 'bg-gray-100 text-gray-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getPreOrderStatusText(status) {
  const map = {
    active: 'Đang bán',
    inactive: 'Tạm dừng',
    completed: 'Hoàn thành'
  };
  return map[status] || status;
}