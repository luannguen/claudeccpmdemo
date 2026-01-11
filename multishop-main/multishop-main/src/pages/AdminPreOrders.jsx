import React from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  usePreOrdersData,
  usePreOrderLots,
  useFilteredPreOrders,
  usePreOrderStats,
  useDeletePreOrder,
  usePreOrderFilters,
  usePreOrderFormModal
} from "@/components/hooks/useAdminPreOrders";

// Components
import PreOrdersHeader from "@/components/admin/preorders/PreOrdersHeader";
import PreOrdersStats from "@/components/admin/preorders/PreOrdersStats";
import PreOrdersFilters from "@/components/admin/preorders/PreOrdersFilters";
import PreOrderCard from "@/components/admin/preorders/PreOrderCard";
import PreOrdersEmptyState from "@/components/admin/preorders/PreOrdersEmptyState";
import PreOrdersLoadingState from "@/components/admin/preorders/PreOrdersLoadingState";
import PreOrderProductFormModal from "@/components/admin/PreOrderProductFormModal";

export default function AdminPreOrders() {
  // Data hooks
  const { data: preOrders = [], isLoading } = usePreOrdersData();
  const { data: lots = [] } = usePreOrderLots();
  
  // UI hooks
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = usePreOrderFilters();
  const { isFormOpen, editingPreOrder, openCreate, openEdit, closeModal } = usePreOrderFormModal();
  
  // Derived data
  const filteredPreOrders = useFilteredPreOrders(preOrders, searchTerm, statusFilter);
  const stats = usePreOrderStats(preOrders, lots);
  
  // Mutations
  const deleteMutation = useDeletePreOrder();

  const handleDelete = async (id) => {
    // Using confirm temporarily - should migrate to useConfirmDialog
    if (window.confirm('Bạn có chắc muốn xóa phiên bán trước này?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <PreOrdersHeader />
          <PreOrdersStats stats={stats} />
          <PreOrdersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onCreateNew={openCreate}
          />

          {isLoading ? (
            <PreOrdersLoadingState />
          ) : filteredPreOrders.length === 0 ? (
            <PreOrdersEmptyState onCreateNew={openCreate} />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPreOrders.map(preOrder => (
                <PreOrderCard
                  key={preOrder.id}
                  preOrder={preOrder}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <PreOrderProductFormModal
            isOpen={isFormOpen}
            onClose={closeModal}
            preOrder={editingPreOrder}
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}