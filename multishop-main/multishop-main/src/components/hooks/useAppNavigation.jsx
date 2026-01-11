import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { createPageUrl } from '@/utils';

/**
 * ✅ Custom hook để xử lý navigation trong app
 * Sử dụng React Router thay vì window.location.href để tránh reload page
 */
export function useAppNavigation() {
  const navigate = useNavigate();

  // Navigate to a page by name
  const navigateToPage = useCallback((pageName, params = {}) => {
    let url = createPageUrl(pageName);
    
    // Add query params if provided
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    navigate(url);
  }, [navigate]);

  // Navigate to a direct URL
  const navigateToUrl = useCallback((url) => {
    navigate(url);
  }, [navigate]);

  // Navigate to user profile
  const navigateToUserProfile = useCallback((userEmail) => {
    navigate(createPageUrl('UserProfile') + `?user=${encodeURIComponent(userEmail)}`);
  }, [navigate]);

  // Navigate to product detail
  const navigateToProduct = useCallback((productId) => {
    window.scrollTo(0, 0);
    navigate(createPageUrl('ProductDetail') + `?id=${productId}`);
  }, [navigate]);

  // Navigate to lot detail
  const navigateToLotDetail = useCallback((lotId) => {
    navigate(createPageUrl('PreOrderProductDetail') + `?lotId=${lotId}`);
  }, [navigate]);

  // Navigate back
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigate,
    navigateToPage,
    navigateToUrl,
    navigateToUserProfile,
    navigateToProduct,
    navigateToLotDetail,
    goBack
  };
}

export default useAppNavigation;