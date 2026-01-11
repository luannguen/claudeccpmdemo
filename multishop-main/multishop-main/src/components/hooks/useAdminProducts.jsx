import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository, createBaseRepository } from "@/components/data";
import { useDebouncedValue } from "@/components/shared/utils";
import { useToast } from "@/components/NotificationToast";
import { cloneProduct, detectChangedFields, generateChangeSummary } from "@/components/shared/utils/productHelpers";

// Category repository
const categoryRepository = createBaseRepository('Category');

const DEFAULT_CATEGORIES = [
  { value: "all", label: "Tất cả" },
  { value: "vegetables", label: "Rau Củ" },
  { value: "fruits", label: "Trái Cây" },
  { value: "rice", label: "Gạo & Ngũ Cốc" },
  { value: "processed", label: "Chế Biến" },
  { value: "combo", label: "Combo" }
];

export function useAdminCategories() {
  const { data: result } = useQuery({
    queryKey: ['admin-panel-categories'],
    queryFn: () => categoryRepository.filter({ status: 'active' }, 'display_order', 50),
    staleTime: 15 * 60 * 1000
  });

  return useMemo(() => {
    const dbCategories = result?.success ? result.data : [];
    const cats = [{ value: "all", label: "Tất cả" }];
    
    if (!dbCategories || dbCategories.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    
    dbCategories.forEach(cat => {
      cats.push({ value: cat.key, label: cat.name });
    });
    
    return cats;
  }, [result]);
}

export function useAdminProducts(options = {}) {
  const { includeDeleted = false } = options;
  
  return useQuery({
    queryKey: ['admin-panel-products', includeDeleted],
    queryFn: async () => {
      // Query với filter chính xác
      let result;
      if (includeDeleted) {
        result = await productRepository.list('-created_date', 500);
      } else {
        result = await productRepository.filter({ is_deleted: false }, '-created_date', 500);
      }
      return result.success ? result.data : [];
    },
    staleTime: 5 * 60 * 1000
  });
}

export function useFilteredProducts(products, searchTerm, selectedCategory, statusFilter = 'all') {
  return useMemo(() => {
    const safeProducts = products || [];
    if (safeProducts.length === 0) return [];
    
    return safeProducts.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      // Status filter: all, active, inactive, hidden (is_deleted)
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = product.status === 'active' && !product.is_deleted;
      } else if (statusFilter === 'inactive') {
        matchesStatus = product.status === 'inactive' && !product.is_deleted;
      } else if (statusFilter === 'hidden') {
        matchesStatus = product.is_deleted === true;
      } else if (statusFilter === 'featured') {
        matchesStatus = product.featured === true && !product.is_deleted;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, statusFilter]);
}

// Bulk mutations hook
export function useBulkProductMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-panel-products'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['products-list'], exact: false });
  };

  // Bulk soft delete
  const bulkSoftDeleteMutation = useMutation({
    mutationFn: async (productIds) => {
      const results = await Promise.all(
        productIds.map(id => 
          productRepository.update(id, { is_deleted: true, deleted_at: new Date().toISOString() })
        )
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể ẩn`);
      return results;
    },
    onSuccess: (_, productIds) => {
      invalidateQueries();
      addToast(`Đã ẩn ${productIds.length} sản phẩm`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể ẩn sản phẩm', 'error');
    }
  });

  // Bulk restore
  const bulkRestoreMutation = useMutation({
    mutationFn: async (productIds) => {
      const results = await Promise.all(
        productIds.map(id => 
          productRepository.update(id, { is_deleted: false, deleted_at: null, deleted_by: null })
        )
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể khôi phục`);
      return results;
    },
    onSuccess: (_, productIds) => {
      invalidateQueries();
      addToast(`Đã khôi phục ${productIds.length} sản phẩm`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể khôi phục', 'error');
    }
  });

  // Bulk delete permanent
  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds) => {
      const results = await Promise.all(
        productIds.map(id => productRepository.delete(id))
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể xóa`);
      return results;
    },
    onSuccess: (_, productIds) => {
      invalidateQueries();
      addToast(`Đã xóa vĩnh viễn ${productIds.length} sản phẩm`, 'warning');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể xóa', 'error');
    }
  });

  // Bulk update status
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ productIds, status }) => {
      const results = await Promise.all(
        productIds.map(id => productRepository.update(id, { status }))
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể cập nhật`);
      return results;
    },
    onSuccess: (_, { productIds, status }) => {
      invalidateQueries();
      const statusLabel = status === 'active' ? 'Hoạt động' : 'Ngừng bán';
      addToast(`Đã chuyển ${productIds.length} sản phẩm sang "${statusLabel}"`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể cập nhật trạng thái', 'error');
    }
  });

  // Bulk update category
  const bulkUpdateCategoryMutation = useMutation({
    mutationFn: async ({ productIds, category }) => {
      const results = await Promise.all(
        productIds.map(id => productRepository.update(id, { category }))
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể cập nhật`);
      return results;
    },
    onSuccess: (_, { productIds }) => {
      invalidateQueries();
      addToast(`Đã cập nhật danh mục cho ${productIds.length} sản phẩm`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể cập nhật danh mục', 'error');
    }
  });

  // Bulk toggle featured
  const bulkToggleFeaturedMutation = useMutation({
    mutationFn: async ({ productIds, featured }) => {
      const results = await Promise.all(
        productIds.map(id => productRepository.update(id, { featured }))
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} sản phẩm không thể cập nhật`);
      return results;
    },
    onSuccess: (_, { productIds, featured }) => {
      invalidateQueries();
      addToast(`Đã ${featured ? 'bật' : 'tắt'} nổi bật cho ${productIds.length} sản phẩm`, 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể cập nhật', 'error');
    }
  });

  return {
    bulkSoftDeleteMutation,
    bulkRestoreMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation,
    bulkUpdateCategoryMutation,
    bulkToggleFeaturedMutation
  };
}

export function useProductMutations(onSuccess) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidateQueries = () => {
    // Invalidate TẤT CẢ variants của query (bao gồm cả includeDeleted: true/false)
    queryClient.invalidateQueries({ 
      queryKey: ['admin-panel-products'],
      exact: false // Match ['admin-panel-products', *]
    });
    queryClient.invalidateQueries({ 
      queryKey: ['products-list'],
      exact: false
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await productRepository.createWithValidation(data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (newProduct) => {
      invalidateQueries();
      addToast(`Đã tạo sản phẩm "${newProduct.name}"`, 'success');
      onSuccess?.();
    },
    onError: () => {
      addToast('Không thể tạo sản phẩm. Vui lòng thử lại.', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldData }) => {
      // Detect changes và save version nếu có
      if (oldData) {
        const changedFields = detectChangedFields(oldData, data);
        
        if (changedFields.length > 0) {
          // Save version snapshot
          await productRepository._base44.entities.ProductVersion.create({
            product_id: id,
            version_number: oldData.current_version || 1,
            snapshot: oldData,
            changed_fields: changedFields,
            change_summary: generateChangeSummary(changedFields),
            changed_by: oldData.last_modified_by
          });
        }
        
        // Increment version
        data.current_version = (oldData.current_version || 1) + 1;
      }
      
      const result = await productRepository.update(id, data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (updatedProduct) => {
      invalidateQueries();
      addToast(`Đã cập nhật "${updatedProduct.name}"`, 'success');
      onSuccess?.();
    },
    onError: () => {
      addToast('Không thể cập nhật. Vui lòng thử lại.', 'error');
    }
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (product) => {
      const result = await productRepository.update(product.id, {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (_, product) => {
      invalidateQueries();
      addToast(`Đã ẩn sản phẩm "${product.name}"`, 'success');
    },
    onError: () => {
      addToast('Không thể ẩn sản phẩm. Vui lòng thử lại.', 'error');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (product) => {
      const result = await productRepository.update(product.id, {
        is_deleted: false,
        deleted_at: null,
        deleted_by: null
      });
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (_, product) => {
      invalidateQueries();
      addToast(`Đã khôi phục "${product.name}"`, 'success');
    },
    onError: () => {
      addToast('Không thể khôi phục. Vui lòng thử lại.', 'error');
    }
  });

  const cloneMutation = useMutation({
    mutationFn: async (product) => {
      const cloneData = cloneProduct(product);
      
      // Create clone
      const result = await productRepository.create(cloneData);
      if (!result.success) throw new Error(result.message);
      
      // Update original clone count
      await productRepository.update(product.id, {
        clone_count: (product.clone_count || 0) + 1
      });
      
      return result.data;
    },
    onSuccess: (newProduct) => {
      invalidateQueries();
      addToast(`Đã tạo bản sao "${newProduct.name}"`, 'success');
    },
    onError: () => {
      addToast('Không thể sao chép. Vui lòng thử lại.', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await productRepository.delete(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateQueries();
      addToast('Đã xóa vĩnh viễn', 'warning');
    },
    onError: () => {
      addToast('Không thể xóa. Vui lòng thử lại.', 'error');
    }
  });

  return { 
    createMutation, 
    updateMutation, 
    softDeleteMutation,
    restoreMutation,
    cloneMutation,
    deleteMutation 
  };
}