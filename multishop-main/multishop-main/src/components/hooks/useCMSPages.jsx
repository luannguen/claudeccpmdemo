/**
 * CMS Pages Hooks
 * 
 * Hooks cho quản lý Page và SiteConfig.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageService, siteConfigService } from "@/components/services/pageService";
import { showAdminAlert } from "@/components/AdminAlert";

// ========== PAGE HOOKS ==========

/**
 * Hook lấy danh sách tất cả trang (Admin)
 */
export function useAdminPages() {
  return useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const result = await pageService.list('-created_date');
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 30000
  });
}

/**
 * Hook lấy danh sách trang đã publish (Client)
 */
export function usePublishedPages() {
  return useQuery({
    queryKey: ['published-pages'],
    queryFn: async () => {
      const result = await pageService.listPublished();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 60000
  });
}

/**
 * Hook lấy trang theo slug
 */
export function usePageBySlug(slug) {
  return useQuery({
    queryKey: ['page', slug],
    queryFn: async () => {
      if (!slug) return null;
      const result = await pageService.getBySlug(slug);
      if (!result.success) {
        if (result.code === 'NOT_FOUND') return null;
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!slug,
    staleTime: 30000
  });
}

/**
 * Hook lấy trang theo ID
 */
export function usePageById(id) {
  return useQuery({
    queryKey: ['page-by-id', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await pageService.getById(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
    staleTime: 30000
  });
}

/**
 * Hook CRUD cho Page
 */
export function usePageMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await pageService.create(data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['published-pages'] });
      showAdminAlert('✅ Đã tạo trang mới', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await pageService.update(id, data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['published-pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.slug] });
      showAdminAlert('✅ Đã cập nhật trang', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await pageService.delete(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['published-pages'] });
      showAdminAlert('✅ Đã xóa trang', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (id) => {
      const result = await pageService.publish(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['published-pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.slug] });
      showAdminAlert('✅ Đã xuất bản trang', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id) => {
      const result = await pageService.unpublish(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['published-pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.slug] });
      showAdminAlert('✅ Đã gỡ xuất bản trang', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return {
    createPage: createMutation.mutateAsync,
    updatePage: updateMutation.mutateAsync,
    deletePage: deleteMutation.mutateAsync,
    publishPage: publishMutation.mutateAsync,
    unpublishPage: unpublishMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

// ========== SITE CONFIG HOOKS ==========

/**
 * Hook lấy SiteConfig
 */
export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      try {
        const result = await siteConfigService.getMainConfig();
        if (!result.success) {
          console.warn('⚠️ useSiteConfig: service failed, using empty object');
          return {};
        }
        return result.data || {};
      } catch (err) {
        console.error('❌ useSiteConfig error:', err);
        return {}; // Return empty object on error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
    retry: 1,
    retryDelay: 2000
  });
}

/**
 * Hook cập nhật SiteConfig
 */
export function useSiteConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      console.log('💾 useSiteConfigMutation called with:', Object.keys(data));
      const result = await siteConfigService.saveConfig(data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      // Don't show alert here - LiveEditContext handles it
    },
    onError: (error) => {
      console.error('❌ useSiteConfigMutation error:', error);
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });
}

// ========== COMPUTED HOOKS ==========

/**
 * Hook lấy menu pages
 */
export function useMenuPages() {
  const { data: pages = [], ...rest } = usePublishedPages();
  
  const menuPages = pages
    .filter(p => p.show_in_menu)
    .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  
  return { data: menuPages, ...rest };
}

/**
 * Hook thống kê pages
 */
export function usePageStats(pages = []) {
  return {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    draft: pages.filter(p => p.status === 'draft').length,
    archived: pages.filter(p => p.status === 'archived').length
  };
}