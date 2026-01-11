/**
 * useEcardShop Hook
 * Quản lý sản phẩm trong gian hàng E-Card
 * 
 * ECARD-F16: E-Card Commerce Integration
 * - ReferralMember active → được chọn platform products
 * - Non-referral user → chỉ được chọn SP của mình
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/NotificationToast";
import { ecardShopRepository, MAX_ECARD_SHOP_PRODUCTS } from "../data/ecardShopRepository";

/**
 * Hook chính để quản lý gian hàng E-Card
 */
export function useEcardShop(profileId) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Lấy sản phẩm đã chọn trong gian hàng
  const { 
    data: shopProductIds = [], 
    isLoading: loadingShopProducts 
  } = useQuery({
    queryKey: ['ecard-shop-products', profileId],
    queryFn: () => ecardShopRepository.getShopProducts(profileId),
    enabled: !!profileId
  });

  // Lấy sản phẩm có thể chọn (ECARD-F16: check referral status)
  const { 
    data: availableData = { products: [], isReferralMember: false, member: null }, 
    isLoading: loadingUserProducts 
  } = useQuery({
    queryKey: ['ecard-available-products', user?.email],
    queryFn: () => ecardShopRepository.getAvailableProducts(user?.email),
    enabled: !!user?.email
  });
  
  const userProducts = availableData.products || [];
  const isReferralMember = availableData.isReferralMember || false;
  const referralMember = availableData.member || null;

  // Lấy chi tiết sản phẩm đã chọn
  const productIds = shopProductIds.map(p => p.product_id);
  const { 
    data: selectedProducts = [], 
    isLoading: loadingSelectedProducts 
  } = useQuery({
    queryKey: ['ecard-shop-selected', productIds],
    queryFn: () => ecardShopRepository.getProductsByIds(productIds),
    enabled: productIds.length > 0
  });

  // Sắp xếp theo display_order
  const sortedSelectedProducts = [...selectedProducts].sort((a, b) => {
    const orderA = shopProductIds.find(p => p.product_id === a.id)?.display_order || 0;
    const orderB = shopProductIds.find(p => p.product_id === b.id)?.display_order || 0;
    return orderA - orderB;
  });

  // Thêm sản phẩm
  const addProductMutation = useMutation({
    mutationFn: (productId) => ecardShopRepository.addProductToShop(profileId, productId, shopProductIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-shop-products', profileId] });
      addToast('Đã thêm sản phẩm vào gian hàng', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Không thể thêm sản phẩm', 'error');
    }
  });

  // Xóa sản phẩm
  const removeProductMutation = useMutation({
    mutationFn: (productId) => ecardShopRepository.removeProductFromShop(profileId, productId, shopProductIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-shop-products', profileId] });
      addToast('Đã xóa sản phẩm khỏi gian hàng', 'success');
    },
    onError: () => {
      addToast('Không thể xóa sản phẩm', 'error');
    }
  });

  // Sắp xếp lại
  const reorderMutation = useMutation({
    mutationFn: (newOrder) => ecardShopRepository.reorderProducts(profileId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-shop-products', profileId] });
    }
  });

  // Toggle bật/tắt gian hàng
  const toggleShopMutation = useMutation({
    mutationFn: (enabled) => ecardShopRepository.toggleShopEnabled(profileId, enabled),
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['ecard-profile'] });
      addToast(enabled ? 'Đã bật gian hàng' : 'Đã tắt gian hàng', 'success');
    }
  });

  return {
    // Data
    selectedProducts: sortedSelectedProducts,
    userProducts,
    shopProductIds,
    maxProducts: MAX_ECARD_SHOP_PRODUCTS,
    canAddMore: shopProductIds.length < MAX_ECARD_SHOP_PRODUCTS,
    
    // Referral status (ECARD-F16)
    isReferralMember,
    referralMember,
    
    // Loading
    isLoading: loadingShopProducts || loadingUserProducts || loadingSelectedProducts,
    
    // Actions
    addProduct: addProductMutation.mutate,
    removeProduct: removeProductMutation.mutate,
    reorderProducts: reorderMutation.mutate,
    toggleShop: toggleShopMutation.mutate,
    
    // Mutation states
    isAdding: addProductMutation.isPending,
    isRemoving: removeProductMutation.isPending,
    isReordering: reorderMutation.isPending
  };
}

/**
 * Hook để lấy sản phẩm gian hàng cho public view
 */
export function useEcardShopPublic(profile) {
  const shopEnabled = profile?.shop_enabled;
  const shopProductIds = profile?.shop_products || [];
  const productIds = shopProductIds.map(p => p.product_id);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['ecard-shop-public', productIds],
    queryFn: () => ecardShopRepository.getProductsByIds(productIds),
    enabled: shopEnabled && productIds.length > 0
  });

  // Sắp xếp theo display_order
  const sortedProducts = [...products].sort((a, b) => {
    const orderA = shopProductIds.find(p => p.product_id === a.id)?.display_order || 0;
    const orderB = shopProductIds.find(p => p.product_id === b.id)?.display_order || 0;
    return orderA - orderB;
  });

  return {
    products: sortedProducts,
    isLoading,
    shopEnabled,
    hasProducts: sortedProducts.length > 0
  };
}