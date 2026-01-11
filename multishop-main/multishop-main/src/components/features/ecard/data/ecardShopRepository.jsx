/**
 * E-Card Shop Repository
 * Data layer cho tính năng gian hàng E-Card
 * 
 * ECARD-F16: E-Card Commerce Integration
 * - Nếu user là ReferralMember active → được chọn platform products
 * - Nếu không → chỉ được chọn SP của chính mình
 */

import { base44 } from "@/api/base44Client";

const MAX_SHOP_PRODUCTS = 6;

export const ecardShopRepository = {
  /**
   * Lấy danh sách sản phẩm đã chọn cho gian hàng E-Card
   */
  getShopProducts: async (profileId) => {
    const profile = await base44.entities.EcardProfile.list();
    const found = profile.find(p => p.id === profileId);
    return found?.shop_products || [];
  },

  /**
   * Kiểm tra user có phải ReferralMember active không
   */
  checkReferralMemberStatus: async (userEmail) => {
    if (!userEmail) return { isReferralMember: false, member: null };
    
    const members = await base44.entities.ReferralMember.filter({
      user_email: userEmail,
      status: 'active'
    }, '-created_date', 1);
    
    return {
      isReferralMember: members.length > 0,
      member: members[0] || null
    };
  },

  /**
   * Lấy sản phẩm platform (cho ReferralMember)
   */
  getPlatformProducts: async () => {
    const products = await base44.entities.Product.filter({
      is_platform_product: true,
      is_deleted: false,
      status: 'active'
    }, '-created_date', 100);
    return products || [];
  },

  /**
   * Lấy sản phẩm của user (legacy - cho non-referral users)
   */
  getUserOwnProducts: async (userEmail) => {
    const products = await base44.entities.Product.filter({
      created_by: userEmail,
      is_deleted: false,
      status: 'active'
    }, '-created_date', 50);
    return products || [];
  },

  /**
   * Lấy sản phẩm có thể chọn cho gian hàng E-Card
   * ECARD-F16 Logic:
   * - ReferralMember active → Platform products
   * - Non-referral user → Own products only
   */
  getAvailableProducts: async (userEmail) => {
    if (!userEmail) return { products: [], isReferralMember: false, member: null };
    
    // Check referral status
    const { isReferralMember, member } = await ecardShopRepository.checkReferralMemberStatus(userEmail);
    
    let products = [];
    if (isReferralMember) {
      // ReferralMember active → được chọn platform products
      products = await ecardShopRepository.getPlatformProducts();
    } else {
      // Non-referral → chỉ được chọn SP của mình
      products = await ecardShopRepository.getUserOwnProducts(userEmail);
    }
    
    return {
      products,
      isReferralMember,
      member
    };
  },

  /**
   * @deprecated Use getAvailableProducts instead
   * Giữ lại để backward compatible
   */
  getUserProducts: async (userEmail) => {
    const { products } = await ecardShopRepository.getAvailableProducts(userEmail);
    return products;
  },

  /**
   * Lấy chi tiết sản phẩm theo IDs
   */
  getProductsByIds: async (productIds) => {
    if (!productIds || productIds.length === 0) return [];
    
    const products = await base44.entities.Product.filter({
      is_deleted: false,
      status: 'active'
    });
    
    return products.filter(p => productIds.includes(p.id));
  },

  /**
   * Cập nhật danh sách sản phẩm gian hàng
   */
  updateShopProducts: async (profileId, shopProducts) => {
    // Validate max 6 products
    const validProducts = shopProducts.slice(0, MAX_SHOP_PRODUCTS);
    
    await base44.entities.EcardProfile.update(profileId, {
      shop_products: validProducts
    });
    
    return validProducts;
  },

  /**
   * Bật/tắt gian hàng
   */
  toggleShopEnabled: async (profileId, enabled) => {
    await base44.entities.EcardProfile.update(profileId, {
      shop_enabled: enabled
    });
    return enabled;
  },

  /**
   * Thêm sản phẩm vào gian hàng
   */
  addProductToShop: async (profileId, productId, currentProducts = []) => {
    if (currentProducts.length >= MAX_SHOP_PRODUCTS) {
      throw new Error(`Tối đa ${MAX_SHOP_PRODUCTS} sản phẩm`);
    }
    
    if (currentProducts.some(p => p.product_id === productId)) {
      throw new Error('Sản phẩm đã có trong gian hàng');
    }
    
    const newProducts = [
      ...currentProducts,
      { product_id: productId, display_order: currentProducts.length }
    ];
    
    await base44.entities.EcardProfile.update(profileId, {
      shop_products: newProducts
    });
    
    return newProducts;
  },

  /**
   * Xóa sản phẩm khỏi gian hàng
   */
  removeProductFromShop: async (profileId, productId, currentProducts = []) => {
    const newProducts = currentProducts
      .filter(p => p.product_id !== productId)
      .map((p, idx) => ({ ...p, display_order: idx }));
    
    await base44.entities.EcardProfile.update(profileId, {
      shop_products: newProducts
    });
    
    return newProducts;
  },

  /**
   * Sắp xếp lại thứ tự sản phẩm
   */
  reorderProducts: async (profileId, newOrder) => {
    const reordered = newOrder.map((productId, idx) => ({
      product_id: productId,
      display_order: idx
    }));
    
    await base44.entities.EcardProfile.update(profileId, {
      shop_products: reordered
    });
    
    return reordered;
  }
};

export const MAX_ECARD_SHOP_PRODUCTS = MAX_SHOP_PRODUCTS;