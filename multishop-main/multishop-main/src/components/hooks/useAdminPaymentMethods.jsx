import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { QrCode, Wallet, CreditCard, Smartphone, Building2, Banknote } from 'lucide-react';
import { showToast } from '@/components/Toast';

// ✅ Icon Options Config
export const ICON_OPTIONS = [
  { name: 'QrCode', icon: QrCode, label: 'QR Code' },
  { name: 'Wallet', icon: Wallet, label: 'Ví' },
  { name: 'CreditCard', icon: CreditCard, label: 'Thẻ' },
  { name: 'Smartphone', icon: Smartphone, label: 'Mobile' },
  { name: 'Building2', icon: Building2, label: 'Ngân hàng' },
  { name: 'Banknote', icon: Banknote, label: 'Tiền mặt' }
];

/**
 * Hook fetch payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods-admin'],
    queryFn: async () => {
      return await base44.entities.PaymentMethod.list('display_order', 50);
    },
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook tính stats cho payment methods
 */
export function usePaymentMethodStats(methods = []) {
  return {
    total: methods.length,
    active: methods.filter(m => m.is_active).length,
    defaultMethod: methods.find(m => m.is_default)?.method_name || 'Chưa đặt',
    recommended: methods.filter(m => m.is_recommended).length
  };
}

/**
 * Hook mutations cho payment methods
 */
export function usePaymentMethodMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PaymentMethod.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods-admin']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PaymentMethod.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods-admin']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentMethod.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods-admin']);
    }
  });

  return { createMutation, updateMutation, deleteMutation };
}

/**
 * Hook quản lý state modal
 */
export function usePaymentMethodsState() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const openModal = (method = null) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  return {
    isModalOpen,
    editingMethod,
    openModal,
    closeModal
  };
}

/**
 * Get icon component by name
 */
export function getIconComponent(iconName) {
  const found = ICON_OPTIONS.find(opt => opt.name === iconName);
  return found ? found.icon : Wallet;
}

/**
 * Save payment method with default handling
 */
export async function savePaymentMethod(data, editingMethod, paymentMethods, mutations) {
  const { createMutation, updateMutation } = mutations;

  // If setting as default, unset others
  if (data.is_default) {
    const updates = paymentMethods
      .filter(m => editingMethod ? m.id !== editingMethod.id : true)
      .filter(m => m.is_default)
      .map(m => base44.entities.PaymentMethod.update(m.id, { is_default: false }));
    await Promise.all(updates);
  }

  if (editingMethod) {
    await updateMutation.mutateAsync({ id: editingMethod.id, data });
  } else {
    await createMutation.mutateAsync(data);
  }
}

/**
 * Toggle payment method active status
 */
export async function toggleMethodActive(method, updateMutation) {
  await updateMutation.mutateAsync({
    id: method.id,
    data: { is_active: !method.is_active }
  });
}

/**
 * Set method as default
 */
export async function setMethodAsDefault(method, paymentMethods, updateMutation) {
  // Unset all defaults
  const updates = paymentMethods
    .filter(m => m.id !== method.id && m.is_default)
    .map(m => base44.entities.PaymentMethod.update(m.id, { is_default: false }));
  await Promise.all(updates);

  // Set this as default
  await updateMutation.mutateAsync({
    id: method.id,
    data: { is_default: true, is_active: true }
  });
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(method, deleteMutation) {
  if (method.is_default) {
    showToast('Không thể xóa phương thức mặc định', 'warning');
    return false;
  }
  if (confirm(`Xóa phương thức "${method.method_name}"?`)) {
    await deleteMutation.mutateAsync(method.id);
    showToast('Đã xóa phương thức thanh toán', 'success');
    return true;
  }
  return false;
}

export default usePaymentMethods;