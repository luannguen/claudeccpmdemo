import React, { useState, useMemo, useCallback } from "react";
import { Package, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/NotificationToast";

// Hooks
import {
  useAdminCategories,
  useAdminProducts,
  useFilteredProducts,
  useProductMutations,
  useBulkProductMutations
} from "@/components/hooks/useAdminProducts";

// ViewMode System
import {
  useViewModeState,
  DataViewRenderer,
  VIEW_MODES,
  LAYOUT_PRESETS
} from "@/components/shared/viewmode";

// Components
import ProductsHeader from "@/components/admin/products/ProductsHeader";
import ProductsFilters from "@/components/admin/products/ProductsFilters";
import ProductBulkActions from "@/components/admin/products/ProductBulkActions";
import ProductGridView from "@/components/admin/products/ProductGridView";
import ProductListView from "@/components/admin/products/ProductListView";
import ProductTableView from "@/components/admin/products/ProductTableView";

const AdminProductsContent = React.memo(function AdminProductsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // ViewMode hook (standalone, persisted)
  const { viewMode, setViewMode } = useViewModeState({
    storageKey: 'admin-products',
    defaultMode: VIEW_MODES.GRID,
    allowedModes: [VIEW_MODES.GRID, VIEW_MODES.LIST, VIEW_MODES.TABLE]
  });

  const { showConfirm, dialog, handleConfirm, handleCancel } = useConfirmDialog();
  const { addToast } = useToast();

  // Data hooks - always include deleted when status filter is "hidden"
  const categories = useAdminCategories();
  const includeDeleted = showDeleted || statusFilter === 'hidden';
  const { data: products = [], isLoading, isError } = useAdminProducts({ includeDeleted });
  const filteredProducts = useFilteredProducts(products, searchTerm, selectedCategory, statusFilter);
  
  // Mutations
  const { 
    createMutation, 
    updateMutation, 
    softDeleteMutation,
    restoreMutation,
    cloneMutation,
    deleteMutation 
  } = useProductMutations(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  });

  // Bulk mutations
  const {
    bulkSoftDeleteMutation,
    bulkRestoreMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation,
    bulkUpdateCategoryMutation,
    bulkToggleFeaturedMutation
  } = useBulkProductMutations();

  // Selection handlers
  const handleToggleSelect = useCallback((productId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  }, [filteredProducts, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Check if any selected product is deleted
  const hasDeletedSelected = useMemo(() => {
    return filteredProducts.some(p => selectedIds.has(p.id) && p.is_deleted);
  }, [filteredProducts, selectedIds]);

  // Bulk action handlers
  const handleBulkSoftDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Ẩn nhiều sản phẩm',
      message: `Ẩn ${selectedIds.size} sản phẩm đã chọn?`,
      type: 'warning',
      confirmText: 'Ẩn tất cả'
    });
    if (confirmed) {
      bulkSoftDeleteMutation.mutate([...selectedIds]);
      clearSelection();
    }
  };

  const handleBulkRestore = async () => {
    const confirmed = await showConfirm({
      title: 'Khôi phục nhiều sản phẩm',
      message: `Khôi phục ${selectedIds.size} sản phẩm đã chọn?`,
      type: 'info',
      confirmText: 'Khôi phục tất cả'
    });
    if (confirmed) {
      bulkRestoreMutation.mutate([...selectedIds]);
      clearSelection();
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa vĩnh viễn nhiều sản phẩm',
      message: `XÓA VĨNH VIỄN ${selectedIds.size} sản phẩm? Hành động này KHÔNG THỂ hoàn tác!`,
      type: 'danger',
      confirmText: 'Xóa vĩnh viễn'
    });
    if (confirmed) {
      bulkDeleteMutation.mutate([...selectedIds]);
      clearSelection();
    }
  };

  const handleBulkUpdateStatus = (status) => {
    bulkUpdateStatusMutation.mutate({ productIds: [...selectedIds], status });
    clearSelection();
  };

  const handleBulkUpdateCategory = (category) => {
    bulkUpdateCategoryMutation.mutate({ productIds: [...selectedIds], category });
    clearSelection();
  };

  const handleBulkToggleFeatured = (featured) => {
    bulkToggleFeaturedMutation.mutate({ productIds: [...selectedIds], featured });
    clearSelection();
  };

  // Handlers
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (product) => {
    const confirmed = await showConfirm({
      title: 'Ẩn sản phẩm',
      message: `Ẩn "${product.name}"? Bạn có thể khôi phục sau.`,
      type: 'warning',
      confirmText: 'Ẩn',
      cancelText: 'Hủy'
    });
    
    if (confirmed) {
      softDeleteMutation.mutate(product);
    }
  };

  const handleRestore = async (product) => {
    const confirmed = await showConfirm({
      title: 'Khôi phục sản phẩm',
      message: `Khôi phục "${product.name}"?`,
      type: 'info',
      confirmText: 'Khôi phục',
      cancelText: 'Hủy'
    });
    
    if (confirmed) {
      restoreMutation.mutate(product);
    }
  };

  const handleClone = async (product) => {
    cloneMutation.mutate(product);
  };

  const handlePermanentDelete = async (product) => {
    const confirmed = await showConfirm({
      title: 'Xóa vĩnh viễn',
      message: `XÓA VĨNH VIỄN "${product.name}"? Hành động này KHÔNG THỂ hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa Vĩnh Viễn',
      cancelText: 'Hủy'
    });
    
    if (confirmed) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ 
        id: editingProduct.id, 
        data,
        oldData: editingProduct // For version tracking
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <ProductsHeader 
        onAddNew={handleAddNew}
        showDeleted={showDeleted}
        onToggleDeleted={() => setShowDeleted(!showDeleted)}
      />

      {isError && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 text-center mb-8">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-orange-700 mb-4">Không thể tải. Thử lại.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800]"
          >
            Tải Lại
          </button>
        </div>
      )}

      <ProductsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categories}
      />

      {/* Bulk Actions Bar */}
      <ProductBulkActions
        selectedCount={selectedIds.size}
        hasDeletedSelected={hasDeletedSelected}
        onBulkSoftDelete={handleBulkSoftDelete}
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkUpdateCategory={handleBulkUpdateCategory}
        onBulkToggleFeatured={handleBulkToggleFeatured}
        onClearSelection={clearSelection}
        categories={categories}
        isLoading={bulkSoftDeleteMutation.isPending || bulkRestoreMutation.isPending || bulkDeleteMutation.isPending}
      />

      {/* Render theo view mode */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy</p>
        </div>
      ) : viewMode === VIEW_MODES.GRID ? (
        <ProductGridView 
          products={filteredProducts} 
          onEdit={handleEdit} 
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          onClone={handleClone}
          onPermanentDelete={handlePermanentDelete}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      ) : viewMode === VIEW_MODES.LIST ? (
        <ProductListView 
          products={filteredProducts} 
          onEdit={handleEdit} 
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          onClone={handleClone}
          onPermanentDelete={handlePermanentDelete}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      ) : (
        <ProductTableView 
          products={filteredProducts} 
          onEdit={handleEdit} 
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          onClone={handleClone}
          onPermanentDelete={handlePermanentDelete}
          categories={categories}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          categories={categories}
        />
      )}

      {/* Confirm Dialog - BẮT BUỘC render để showConfirm hoạt động */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </div>
  );
});

export default function AdminProducts() {
  return (
    <AdminGuard requiredModule="products" requiredPermission="products.view">
      <AdminLayout>
        <AdminProductsContent />
      </AdminLayout>
    </AdminGuard>
  );
}