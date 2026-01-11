import React, { useState, useMemo } from "react";
import { Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import CustomerFormModal from "@/components/admin/CustomerFormModal";

// Hooks
import {
  useAdminCustomers,
  useCustomerOrders,
  useFilteredCustomers,
  useCustomerStats,
  useCustomerMutations,
  useExportCustomers
} from "@/components/hooks/useAdminCustomers";
import { useReassignCustomer } from "@/components/hooks/useReferralCustomerRegistration";

// ViewMode System
import {
  useViewModeState,
  DataViewRenderer,
  VIEW_MODES,
  LAYOUT_PRESETS
} from "@/components/shared/viewmode";

// Components
import CustomersHeader from "@/components/admin/customers/CustomersHeader";
import CustomersStats from "@/components/admin/customers/CustomersStats";
import CustomersCharts from "@/components/admin/customers/CustomersCharts";
import CustomersFilters from "@/components/admin/customers/CustomersFilters";
import CustomerCard from "@/components/admin/customers/CustomerCard";
import CustomerDetailModal from "@/components/admin/customers/CustomerDetailModal";
import ReassignCustomerModal from "@/components/admin/customers/ReassignCustomerModal";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const AdminCustomersContent = React.memo(function AdminCustomersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [reassigningCustomer, setReassigningCustomer] = useState(null);

  // Get current user for admin email
  const { data: currentUser } = useQuery({
    queryKey: ['current-admin-user'],
    queryFn: () => base44.auth.me()
  });
  
  // ViewMode hook (standalone, persisted) - currently grid only
  const { viewMode } = useViewModeState({
    storageKey: 'admin-customers',
    defaultMode: VIEW_MODES.GRID,
    allowedModes: [VIEW_MODES.GRID]
  });

  // Data hooks
  const { data: customers = [], isLoading } = useAdminCustomers();
  const { data: orders = [] } = useCustomerOrders();
  const filteredCustomers = useFilteredCustomers(customers, searchTerm, typeFilter, sourceFilter);
  const stats = useCustomerStats(customers);
  const exportCustomers = useExportCustomers(filteredCustomers);

  // Mutations
  const { createMutation, updateMutation, deleteMutation } = useCustomerMutations(() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  });
  
  const reassignMutation = useReassignCustomer();

  // Handlers
  const handleAddNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Xóa khách hàng này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleReassignSubmit = (data) => {
    reassignMutation.mutate({
      ...data,
      adminEmail: currentUser?.email || 'admin'
    }, {
      onSuccess: () => setReassigningCustomer(null)
    });
  };

  return (
    <div>
      <div className="mb-8">
        <CustomersHeader onAddNew={handleAddNew} onExport={exportCustomers} />
        <CustomersStats stats={stats} />
        <CustomersCharts stats={stats} />
      </div>

      <CustomersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
      />

      <DataViewRenderer
        data={filteredCustomers}
        viewMode={viewMode}
        isLoading={isLoading}
        components={useMemo(() => ({
          [VIEW_MODES.GRID]: {
            item: CustomerCard,
            wrapper: LAYOUT_PRESETS.customerGrid
          }
        }), [])}
        itemProps={useMemo(() => ({
          onView: setViewingCustomer,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onReassign: setReassigningCustomer
        }), [setViewingCustomer, handleEdit, handleDelete])}
        loadingState={
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        }
        emptyState={
          <div className="text-center py-12 bg-white rounded-2xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Không tìm thấy khách hàng</p>
            <button
              onClick={handleAddNew}
              className="text-[#7CB342] font-medium hover:underline"
            >
              Thêm khách hàng đầu tiên
            </button>
          </div>
        }
        keyExtractor={(customer) => customer.id}
      />

      {isModalOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {viewingCustomer && (
        <CustomerDetailModal
          customer={viewingCustomer}
          orders={orders}
          onClose={() => setViewingCustomer(null)}
        />
      )}

      {reassigningCustomer && (
        <ReassignCustomerModal
          customer={reassigningCustomer}
          isOpen={!!reassigningCustomer}
          onClose={() => setReassigningCustomer(null)}
          onSubmit={handleReassignSubmit}
          isSubmitting={reassignMutation.isPending}
        />
      )}
    </div>
  );
});

export default function AdminCustomers() {
  return (
    <AdminGuard requiredModule="customers" requiredPermission="customers.view">
      <AdminLayout>
        <AdminCustomersContent />
      </AdminLayout>
    </AdminGuard>
  );
}