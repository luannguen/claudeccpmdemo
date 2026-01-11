import React, { useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import CategoryFormModal from "@/components/admin/CategoryFormModal";

// Hooks
import {
  useAdminCategories,
  useFilteredCategories,
  useCategoryMutations,
  useCategoryModalState
} from "@/components/hooks/useAdminCategories";

// Components
import CategoriesHeader from "@/components/admin/categories/CategoriesHeader";
import CategoriesFilters from "@/components/admin/categories/CategoriesFilters";
import CategoryGridView from "@/components/admin/categories/CategoryGridView";
import CategoryListView from "@/components/admin/categories/CategoryListView";
import CategoryTableView from "@/components/admin/categories/CategoryTableView";
import CategoriesEmptyState from "@/components/admin/categories/CategoriesEmptyState";
import CategoriesErrorState from "@/components/admin/categories/CategoriesErrorState";
import CategoriesLoadingState from "@/components/admin/categories/CategoriesLoadingState";

const AdminCategoriesContent = React.memo(function AdminCategoriesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Data hooks
  const { data: categories = [], isLoading, isError } = useAdminCategories();
  const filteredCategories = useFilteredCategories(categories, searchTerm);
  const { isModalOpen, editingCategory, openCreate, openEdit, closeModal } = useCategoryModalState();
  const { createMutation, updateMutation, deleteMutation } = useCategoryMutations(closeModal);

  // Handlers
  const handleSubmit = useCallback((data) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingCategory, createMutation, updateMutation]);

  const handleDelete = useCallback((cat) => {
    if (confirm(`Xóa danh mục "${cat.name}"?\n\nCảnh báo: Điều này có thể ảnh hưởng đến sản phẩm.`)) {
      deleteMutation.mutate(cat.id);
    }
  }, [deleteMutation]);

  // Render view based on viewMode
  const renderCategoryView = () => {
    if (viewMode === "grid") {
      return <CategoryGridView categories={filteredCategories} onEdit={openEdit} onDelete={handleDelete} />;
    }
    if (viewMode === "list") {
      return <CategoryListView categories={filteredCategories} onEdit={openEdit} onDelete={handleDelete} />;
    }
    return <CategoryTableView categories={filteredCategories} onEdit={openEdit} onDelete={handleDelete} />;
  };

  return (
    <div>
      <CategoriesHeader onAddClick={openCreate} />

      {isError && <CategoriesErrorState />}

      <CategoriesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalCount={filteredCategories.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {isLoading ? (
        <CategoriesLoadingState />
      ) : (
        <>
          {filteredCategories.length > 0 ? (
            renderCategoryView()
          ) : (
            <CategoriesEmptyState />
          )}
        </>
      )}

      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
});

export default function AdminCategories() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminCategoriesContent />
      </AdminLayout>
    </AdminGuard>
  );
}