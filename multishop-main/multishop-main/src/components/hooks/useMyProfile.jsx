import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const tierColors = {
  bronze: 'from-orange-400 to-orange-600',
  silver: 'from-gray-300 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600'
};

export const tierLabels = {
  bronze: 'Đồng',
  silver: 'Bạc',
  gold: 'Vàng',
  platinum: 'Bạch Kim'
};

export function useProfileUser() {
  return useQuery({
    queryKey: ['my-profile-user'],
    queryFn: () => base44.auth.me()
  });
}

export function useLoyaltyAccount(userEmail) {
  return useQuery({
    queryKey: ['my-loyalty-account', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const accounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
      return accounts.find(la => la.user_email === userEmail);
    },
    enabled: !!userEmail
  });
}

export function useCustomerRecord(userEmail) {
  return useQuery({
    queryKey: ['my-customer-record', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const customers = await base44.entities.Customer.list('-created_date', 500);
      return customers.find(c => c.email === userEmail && !c.tenant_id);
    },
    enabled: !!userEmail
  });
}

export function useMyOrders(userEmail) {
  return useQuery({
    queryKey: ['my-orders', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const orders = await base44.entities.Order.list('-created_date', 500);
      return orders.filter(o => o.customer_email === userEmail);
    },
    enabled: !!userEmail
  });
}

export function useMyTenant(userEmail) {
  return useQuery({
    queryKey: ['my-tenant-profile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.owner_email === userEmail);
    },
    enabled: !!userEmail
  });
}

export function useUserProfileData(userEmail) {
  return useQuery({
    queryKey: ['user-profile-myprofile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === userEmail);
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });
}

export function useProfileForm(customer, user) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', address: '', city: '', district: '', ward: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        district: customer.district || '',
        ward: customer.ward || ''
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, full_name: user.full_name || '' }));
    }
  }, [customer, user]);

  return { isEditing, setIsEditing, formData, setFormData };
}

export function useUpdateCustomer(customer, user) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      if (customer) {
        return await base44.entities.Customer.update(customer.id, data);
      } else {
        return await base44.entities.Customer.create({
          tenant_id: null,
          email: user.email,
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          district: data.district,
          ward: data.ward,
          customer_source: 'manual',
          status: 'active'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-customer-record']);
      alert('Cập nhật thành công!');
    }
  });
}

export function getTierProgress(loyaltyTier, totalOrders) {
  const thresholds = { bronze: 2, silver: 5, gold: 10, platinum: Infinity };
  const threshold = thresholds[loyaltyTier] || 10;
  return Math.min((totalOrders / threshold) * 100, 100);
}

export function getTierThreshold(tier) {
  const thresholds = { bronze: 2, silver: 5, gold: 10, platinum: '∞' };
  return thresholds[tier] || 10;
}