/**
 * useAdminLots - Admin hooks for ProductLot management
 * 
 * Part of PreOrder Module
 */

import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lotRepository } from '../data';

/**
 * Fetch all lots for admin
 */
export function useProductLotsData() {
  return useQuery({
    queryKey: ['admin-product-lots'],
    queryFn: () => lotRepository.listLots('-created_date', 500)
  });
}

/**
 * Filter lots by preorder, search term and status
 */
export function useFilteredLots(lots, preorderId, searchTerm, statusFilter) {
  return useMemo(() => {
    let result = lots;

    if (preorderId) {
      result = result.filter(lot => lot.preorder_product_id === preorderId);
    }

    if (searchTerm) {
      result = result.filter(lot =>
        lot.lot_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.lot_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(lot => lot.status === statusFilter);
    }

    return result;
  }, [lots, preorderId, searchTerm, statusFilter]);
}

/**
 * Calculate lot stats
 */
export function useLotsStats(lots, preorderId) {
  return useMemo(() => {
    const relevantLots = preorderId ? lots.filter(l => l.preorder_product_id === preorderId) : lots;
    return {
      total: relevantLots.length,
      active: relevantLots.filter(l => l.status === 'active').length,
      soldOut: relevantLots.filter(l => l.status === 'sold_out').length,
      totalRevenue: relevantLots.reduce((sum, l) => sum + (l.total_revenue || 0), 0),
      totalYield: relevantLots.reduce((sum, l) => sum + (l.total_yield || 0), 0),
      totalSold: relevantLots.reduce((sum, l) => sum + (l.sold_quantity || 0), 0),
      totalAvailable: relevantLots.reduce((sum, l) => sum + (l.available_quantity || 0), 0)
    };
  }, [lots, preorderId]);
}

/**
 * Delete lot mutation
 */
export function useDeleteLot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => lotRepository.deleteLot(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-product-lots']);
    }
  });
}

/**
 * Filter state management for lots
 */
export function useAdminLotFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  return { searchTerm, setSearchTerm, statusFilter, setStatusFilter };
}

/**
 * Form modal state management
 */
export function useLotFormModal() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [previewLot, setPreviewLot] = useState(null);
  
  const openCreate = useCallback(() => {
    setEditingLot(null);
    setIsFormOpen(true);
  }, []);
  
  const openEdit = useCallback((lot) => {
    setEditingLot(lot);
    setIsFormOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingLot(null);
  }, []);
  
  const openPreview = useCallback((lot) => setPreviewLot(lot), []);
  const closePreview = useCallback(() => setPreviewLot(null), []);
  
  return { 
    isFormOpen, editingLot, previewLot,
    openCreate, openEdit, closeModal, openPreview, closePreview 
  };
}

// Status helpers
export const lotStatusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang bán' },
  { value: 'sold_out', label: 'Hết hàng' },
  { value: 'awaiting_harvest', label: 'Chờ thu hoạch' },
  { value: 'harvested', label: 'Đã thu hoạch' },
  { value: 'fulfilled', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
];

export function getLotStatusColor(status) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'sold_out': return 'bg-red-100 text-red-700';
    case 'awaiting_harvest': return 'bg-yellow-100 text-yellow-700';
    case 'harvested': return 'bg-blue-100 text-blue-700';
    case 'fulfilled': return 'bg-purple-100 text-purple-700';
    case 'cancelled': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getLotStatusText(status) {
  const map = {
    active: 'Đang bán',
    sold_out: 'Hết hàng',
    awaiting_harvest: 'Chờ thu hoạch',
    harvested: 'Đã thu hoạch',
    fulfilled: 'Đã giao',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
}

/**
 * Days until harvest calculator
 */
export function getAdminDaysUntilHarvest(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

/**
 * Sold percentage calculator
 */
export function getSoldPercentage(lot) {
  if (!lot.total_yield) return 0;
  return ((lot.sold_quantity || 0) / lot.total_yield) * 100;
}