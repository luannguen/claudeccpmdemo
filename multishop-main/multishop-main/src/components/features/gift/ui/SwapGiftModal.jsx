/**
 * SwapGiftModal - Modal for receiver to swap gift to different product
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import EnhancedModal from '@/components/EnhancedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGiftRedeem } from '../hooks/useGiftRedeem';
import { canSwap } from '../domain/giftStateMachine';
import { canSwapToProduct, calculateSwapRefund } from '../domain/giftRules';

export default function SwapGiftModal({ isOpen, onClose, gift, onSwapped }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');

  const { swapGift, isSwapping } = useGiftRedeem();

  // Fetch products for swap (only <= original value)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['swap-products', gift?.item_value],
    queryFn: async () => {
      if (!gift?.item_value) return [];
      const allProducts = await base44.entities.Product.list('-created_date', 100);
      return allProducts
        .filter(p => p.status === 'active' && (p.sale_price || p.price) <= gift.item_value)
        .filter(p => p.id !== gift.item_id); // Exclude current product
    },
    enabled: isOpen && !!gift?.item_value,
    staleTime: 5 * 60 * 1000
  });

  // Filter by search
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const handleSwap = async () => {
    if (!selectedProduct) return;

    try {
      await swapGift({ gift, newProduct: selectedProduct });
      onSwapped?.();
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const canSwapGift = canSwap(gift);
  const refundAmount = selectedProduct 
    ? calculateSwapRefund(gift?.item_value || 0, selectedProduct.sale_price || selectedProduct.price)
    : 0;

  if (!gift) return null;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="🔄 Đổi sang quà khác"
      maxWidth="lg"
      showControls={false}
      enableDrag={false}
      positionKey="swap-gift"
    >
      <div className="p-6 space-y-6">
        {/* Current Gift */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-2">Quà hiện tại</p>
          <div className="flex gap-3">
            <img
              src={gift.item_image}
              alt={gift.item_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">{gift.item_name}</p>
              <p className="text-[#7CB342] font-bold">
                {gift.item_value?.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        {/* Cannot Swap Warning */}
        {!canSwapGift && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700">
            <Icon.AlertTriangle size={18} />
            <span className="text-sm">Quà này không cho phép đổi</span>
          </div>
        )}

        {/* Product Selection */}
        {canSwapGift && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Chọn quà mới</h3>
                <span className="text-xs text-gray-500">
                  Chỉ hiển thị quà có giá ≤ {gift.item_value?.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm quà..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Icon.Spinner size={32} className="text-[#7CB342]" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon.Package size={40} className="mx-auto mb-2 opacity-50" />
                  <p>Không có sản phẩm phù hợp</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                  {filteredProducts.map(product => {
                    const price = product.sale_price || product.price;
                    const isSelected = selectedProduct?.id === product.id;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className={`p-2 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-[#7CB342] bg-[#7CB342]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#7CB342] rounded-full flex items-center justify-center">
                            <Icon.Check size={12} className="text-white" />
                          </div>
                        )}
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full aspect-square rounded-lg object-cover mb-2"
                        />
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[#7CB342] font-bold text-sm">
                          {price?.toLocaleString('vi-VN')}đ
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Summary */}
            {selectedProduct && (
              <div className="bg-[#7CB342]/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quà mới</span>
                  <span className="font-medium">{selectedProduct.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá trị</span>
                  <span className="font-bold text-[#7CB342]">
                    {(selectedProduct.sale_price || selectedProduct.price)?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                {refundAmount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#7CB342]/20">
                    <span className="text-gray-600">Chênh lệch (không hoàn)</span>
                    <span className="text-gray-500">
                      -{refundAmount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Hủy
              </Button>
              <Button
                onClick={handleSwap}
                disabled={!selectedProduct || isSwapping}
                className="flex-1 bg-[#7CB342] hover:bg-[#689F38]"
              >
                {isSwapping ? (
                  <>
                    <Icon.Spinner size={18} className="mr-2" />
                    Đang đổi...
                  </>
                ) : (
                  <>
                    <Icon.RefreshCw size={18} className="mr-2" />
                    Xác nhận đổi
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </EnhancedModal>
  );
}