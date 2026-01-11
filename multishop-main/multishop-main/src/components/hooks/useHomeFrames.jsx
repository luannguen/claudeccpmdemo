/**
 * useHomeFrames - Hook lấy danh sách HomeFrame từ entity
 * 
 * Data Layer - Fetch frames và sort theo order
 * 
 * Homepage scroll-driven stage hiển thị TẤT CẢ frames active, không giới hạn số lượng
 * Mỗi frame render động dựa trên data từ DB
 */

import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook for CLIENT-SIDE homepage - lấy TẤT CẢ frames active, sorted by order
 */
export function useHomeFrames() {
  return useQuery({
    queryKey: ['homeFrames', 'client'],
    queryFn: async () => {
      // Lấy tất cả frames active, sorted by order
      const allFrames = await base44.entities.HomeFrame.filter({ is_active: true }, 'order');
      return allFrames.sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
}

/**
 * Hook for ADMIN - lấy TẤT CẢ frames (kể cả inactive)
 * Dùng trong AdminHomeFrames để quản lý CRUD
 */
export function useAllHomeFrames() {
  return useQuery({
    queryKey: ['homeFrames', 'admin', 'all'],
    queryFn: async () => {
      const frames = await base44.entities.HomeFrame.list('order', 100);
      return frames;
    },
    staleTime: 30 * 1000, // Cache 30 giây cho admin
  });
}