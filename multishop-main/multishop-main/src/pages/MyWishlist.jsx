import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Package, X, Sparkles, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MyWishlist() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setWishlistIds(wishlist);

    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      setWishlistIds(updated);
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products-wishlist'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 5 * 60 * 1000
  });

  const { data: allLots = [] } = useQuery({
    queryKey: ['lots-wishlist'],
    queryFn: () => base44.entities.ProductLot.filter({ status: 'active' }, '-created_date', 500),
    staleTime: 5 * 60 * 1000
  });

  // ✅ Combine both products and lots
  const wishlistItems = React.useMemo(() => {
    const items = [];
    
    wishlistIds.forEach(id => {
      if (id.startsWith('lot:')) {
        // Preorder lot
        const lotId = id.replace('lot:', '');
        const lot = allLots.find(l => l.id === lotId);
        if (lot && lot.available_quantity > 0) {
          items.push({
            id: lot.id,
            type: 'lot',
            name: `${lot.product_name} - ${lot.lot_name}`,
            price: lot.current_price,
            image_url: lot.product_image,
            unit: 'kg',
            is_preorder: true,
            lot_id: lot.id,
            estimated_harvest_date: lot.estimated_harvest_date,
            moq: lot.moq,
            product_id: lot.product_id,
            available_quantity: lot.available_quantity
          });
        }
      } else {
        // Regular product
        const product = allProducts.find(p => p.id === id);
        if (product && product.status === 'active') {
          items.push({
            id: product.id,
            type: 'product',
            name: product.name,
            price: product.sale_price || product.price,
            image_url: product.image_url,
            unit: product.unit,
            is_preorder: false,
            product_id: product.id
          });
        }
      }
    });
    
    return items;
  }, [wishlistIds, allProducts, allLots]);

  const removeFromWishlist = (item) => {
    const wishlistKey = item.type === 'lot' ? `lot:${item.id}` : item.id;
    const updated = wishlistIds.filter(id => id !== wishlistKey);
    localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const addToCart = (item) => {
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        image_url: item.image_url,
        quantity: item.moq || 1,
        is_preorder: item.is_preorder,
        lot_id: item.lot_id,
        estimated_harvest_date: item.estimated_harvest_date,
        moq: item.moq,
        product_id: item.product_id
      } 
    }));
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-up';
    toast.innerHTML = `<span class="font-medium">✅ Đã thêm vào giỏ!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const clearAll = () => {
    if (confirm('Xóa toàn bộ danh sách yêu thích?')) {
      localStorage.setItem('zerofarm-wishlist', JSON.stringify([]));
      setWishlistIds([]);
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  };

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#0F0F0F] mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10 text-red-500 fill-current" />
              Danh Sách Yêu Thích
            </h1>
            <p className="text-gray-600">{wishlistItems.length} sản phẩm</p>
          </div>

          {wishlistItems.length > 0 && (
            <button onClick={clearAll}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Xóa Tất Cả
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Danh sách trống</h2>
            <p className="text-gray-600 mb-8">Bạn chưa thêm sản phẩm nào vào yêu thích</p>
            <Link to={createPageUrl('Services')}
              className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-8 py-4 rounded-full font-bold hover:bg-[#FF9800] transition-colors">
              <Sparkles className="w-5 h-5" />
              Khám Phá Sản Phẩm
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const detailUrl = item.type === 'lot' 
                ? createPageUrl(`ProductDetail?id=${item.product_id}`)
                : createPageUrl(`ProductDetail?id=${item.id}`);
              
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group relative">
                  
                  {item.type === 'lot' && (
                    <div className="absolute top-3 left-3 z-10 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      BÁN TRƯỚC
                    </div>
                  )}
                  
                  <button onClick={() => removeFromWishlist(item)}
                    className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>

                  <Link to={detailUrl}
                    className="block aspect-square bg-gray-100 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link to={detailUrl}>
                      <h3 className="font-serif text-lg font-bold mb-2 line-clamp-2 hover:text-[#7CB342]">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {item.type === 'lot' && item.estimated_harvest_date && (
                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Giao: {new Date(item.estimated_harvest_date).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                    
                    <p className="text-2xl font-bold text-[#7CB342] mb-4">
                      {(item.price || 0).toLocaleString('vi-VN')}đ
                      <span className="text-sm text-gray-500">/{item.unit}</span>
                    </p>

                    {item.type === 'lot' && item.available_quantity && (
                      <p className="text-xs text-gray-600 mb-3">
                        Còn lại: {item.available_quantity} sản phẩm
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => addToCart(item)}
                        disabled={item.type === 'lot' && item.available_quantity <= 0}
                        className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                          item.type === 'lot' && item.available_quantity <= 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#7CB342] text-white hover:bg-[#FF9800]'
                        }`}>
                        <ShoppingCart className="w-4 h-4" />
                        {item.type === 'lot' && item.moq > 1 ? `Thêm (${item.moq})` : 'Thêm'}
                      </button>
                      <Link to={detailUrl}
                        className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
                        Chi Tiết
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}