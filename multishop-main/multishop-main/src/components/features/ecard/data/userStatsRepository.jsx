import { base44 } from '@/api/base44Client';

export const userStatsRepository = {
  async getMyStats() {
    const me = await base44.auth.me();
    if (!me) return { post_count: 0, product_count: 0, shop_id: null };

    // OPTIMIZED: Fetch posts and products in parallel
    const [postsResult, productsResult] = await Promise.allSettled([
      base44.entities.UserPost.filter({ created_by: me.email, status: 'active' }),
      base44.entities.ShopProduct.filter({ created_by: me.email, status: 'active' })
        .catch(() => base44.entities.Product.filter({ created_by: me.email, status: 'active' }))
        .catch(() => [])
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
    const products = productsResult.status === 'fulfilled' ? productsResult.value : [];

    return {
      post_count: Array.isArray(posts) ? posts.length : 0,
      product_count: Array.isArray(products) ? products.length : 0,
      shop_id: null
    };
  }
};

export default userStatsRepository;