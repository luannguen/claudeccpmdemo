import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  useInventoryLogs,
  useInventoryProducts,
  useFilteredLogs,
  useLowStockProducts,
  useCreateInventoryLog
} from "@/components/hooks/useAdminInventory";

// Components
import InventoryHeader from "@/components/admin/inventory/InventoryHeader";
import InventoryStats from "@/components/admin/inventory/InventoryStats";
import LowStockAlert from "@/components/admin/inventory/LowStockAlert";
import InventoryFilters from "@/components/admin/inventory/InventoryFilters";
import InventoryLogsTable from "@/components/admin/inventory/InventoryLogsTable";
import InventoryLogModal from "@/components/admin/inventory/InventoryLogModal";

function AdminInventoryContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data hooks
  const { data: inventoryLogs = [], isLoading } = useInventoryLogs();
  const { data: products = [] } = useInventoryProducts();
  const filteredLogs = useFilteredLogs(inventoryLogs, searchTerm, typeFilter);
  const lowStockProducts = useLowStockProducts(products);

  // Mutations
  const createMutation = useCreateInventoryLog(products, () => setIsModalOpen(false));

  return (
    <div>
      <InventoryHeader onAddNew={() => setIsModalOpen(true)} />

      <InventoryStats
        productsCount={products.length}
        lowStockCount={lowStockProducts.length}
        logsCount={inventoryLogs.length}
      />

      <LowStockAlert lowStockProducts={lowStockProducts} />

      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <InventoryLogsTable logs={filteredLogs} isLoading={isLoading} />

      {isModalOpen && (
        <InventoryLogModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}

export default function AdminInventory() {
  return (
    <AdminGuard requiredModule="inventory" requiredPermission="inventory.view">
      <AdminLayout>
        <AdminInventoryContent />
      </AdminLayout>
    </AdminGuard>
  );
}