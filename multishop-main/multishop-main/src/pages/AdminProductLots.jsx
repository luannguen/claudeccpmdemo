import React from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import { usePreOrderDetail } from "@/components/hooks/useAdminPreOrders";
import {
  useProductLotsData,
  useFilteredLots,
  useLotsStats,
  useDeleteLot,
  useLotFilters,
  useLotFormModal
} from "@/components/hooks/useAdminProductLots";

// Components
import LotsHeader from "@/components/admin/lots/LotsHeader";
import LotsStats from "@/components/admin/lots/LotsStats";
import LotsFilters from "@/components/admin/lots/LotsFilters";
import LotCard from "@/components/admin/lots/LotCard";
import LotsEmptyState from "@/components/admin/lots/LotsEmptyState";
import LotsLoadingState from "@/components/admin/lots/LotsLoadingState";
import ProductLotFormModal from "@/components/admin/ProductLotFormModal";
import PriceStrategyPreview from "@/components/admin/PriceStrategyPreview";

export default function AdminProductLots() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preorderId = searchParams.get('preorder_id');

  // Data hooks
  const { data: lots = [], isLoading } = useProductLotsData();
  const { data: preOrder } = usePreOrderDetail(preorderId);
  
  // UI hooks
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useLotFilters();
  const { 
    isFormOpen, editingLot, previewLot,
    openCreate, openEdit, closeModal, openPreview, closePreview 
  } = useLotFormModal();
  
  // Derived data
  const filteredLots = useFilteredLots(lots, preorderId, searchTerm, statusFilter);
  const stats = useLotsStats(lots, preorderId);
  
  // Mutations
  const deleteMutation = useDeleteLot();

  const handleDelete = async (id) => {
    // Using confirm temporarily - should migrate to useConfirmDialog
    if (window.confirm('Bạn có chắc muốn xóa lot này?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <LotsHeader preOrder={preOrder} />
          <LotsStats stats={stats} />
          <LotsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onCreateNew={openCreate}
          />

          {isLoading ? (
            <LotsLoadingState />
          ) : filteredLots.length === 0 ? (
            <LotsEmptyState onCreateNew={openCreate} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLots.map(lot => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onPreview={openPreview}
                />
              ))}
            </div>
          )}

          <ProductLotFormModal
            isOpen={isFormOpen}
            onClose={closeModal}
            lot={editingLot}
            preorderId={preorderId}
          />

          {previewLot && (
            <PriceStrategyPreview
              lot={previewLot}
              onClose={closePreview}
            />
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}