import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { showAdminAlert } from "@/components/AdminAlert";

const DEFAULT_CONFIG = {
  enabled: true,
  delay_hours: 1,
  min_cart_value: 100000,
  discount_enabled: true,
  discount_type: 'percentage',
  discount_value: 10,
  stats: {
    total_abandoned: 0,
    emails_sent: 0,
    recovered_count: 0,
    recovered_revenue: 0
  }
};

export function useAbandonedCartConfig() {
  const { data: configs = [] } = useQuery({
    queryKey: ['abandoned-cart-config'],
    queryFn: () => base44.entities.AbandonedCartConfig.list('-created_date', 1)
  });

  const config = configs[0] || DEFAULT_CONFIG;
  return config;
}

export function useAbandonedCarts() {
  return useQuery({
    queryKey: ['abandoned-carts'],
    queryFn: () => base44.entities.Cart.list('-last_activity', 500),
    refetchInterval: 30000
  });
}

export function useFilteredAbandonedCarts(carts, config, searchTerm) {
  return useMemo(() => {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - config.delay_hours * 60 * 60 * 1000);

    return carts.filter(cart => {
      if (cart.status !== 'active') return false;
      if ((cart.subtotal || 0) < config.min_cart_value) return false;
      
      const lastActivity = new Date(cart.last_activity || cart.created_date);
      if (lastActivity > cutoffTime) return false;

      const matchesSearch = !searchTerm || 
        cart.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.created_by?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [carts, config, searchTerm]);
}

export function useRecoveryRate(config) {
  return useMemo(() => {
    if (!config.stats?.emails_sent || config.stats.emails_sent === 0) return 0;
    return ((config.stats.recovered_count / config.stats.emails_sent) * 100).toFixed(1);
  }, [config]);
}

export function useSendRecoveryEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cart) => {
      await base44.functions.invoke('abandonedCartRecovery', { cartId: cart.id });
    },
    onSuccess: () => {
      showAdminAlert('✅ Đã gửi email khôi phục', 'success');
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    }
  });
}

export function useUpdateConfig(config, onSuccess) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      if (config.id) {
        return await base44.entities.AbandonedCartConfig.update(config.id, updates);
      } else {
        return await base44.entities.AbandonedCartConfig.create(updates);
      }
    },
    onSuccess: () => {
      showAdminAlert('✅ Đã lưu cấu hình', 'success');
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart-config'] });
      onSuccess?.();
    }
  });
}

export function useAbandonedCartsFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  return {
    searchTerm, setSearchTerm,
    showSettings, openSettings, closeSettings
  };
}