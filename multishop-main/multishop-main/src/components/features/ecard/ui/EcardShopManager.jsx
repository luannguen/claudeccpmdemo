/**
 * EcardShopManager - User Settings
 * Cho phép user chọn sản phẩm hiển thị trong gian hàng E-Card
 * Drag & drop sắp xếp, bật/tắt gian hàng
 */

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEcardShop } from "../hooks/useEcardShop";
import EnhancedModal from "@/components/EnhancedModal";
import { createPageUrl } from "@/utils";

export default function EcardShopManager({ profileId, shopEnabled = false, onToggle }) {
  const [showPicker, setShowPicker] = useState(false);
  const {
    selectedProducts,
    userProducts,
    maxProducts,
    canAddMore,
    isLoading,
    addProduct,
    removeProduct,
    reorderProducts,
    isAdding,
    isRemoving,
    isReferralMember,
    referralMember
  } = useEcardShop(profileId);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const newOrder = items.map(item => item.id);
    reorderProducts(newOrder);
  };

  const availableProducts = userProducts.filter(
    p => !selectedProducts.some(sp => sp.id === p.id)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon.Spinner size={20} className="text-[#7CB342]" />
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7CB342]/10 rounded-xl flex items-center justify-center">
            <Icon.Store size={20} className="text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gian hàng E-Card</h3>
            <p className="text-sm text-gray-500">
              {selectedProducts.length}/{maxProducts} sản phẩm
            </p>
          </div>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{shopEnabled ? 'Đang bật' : 'Đang tắt'}</span>
          <Switch
            checked={shopEnabled}
            onCheckedChange={onToggle}
          />
        </div>
      </div>

      {/* Referral Badge - ECARD-F16: Light referral indicator */}
      {isReferralMember && shopEnabled && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <Icon.Award size={18} className="text-green-600" />
          <span className="text-sm text-green-700">
            Bạn đang bán hàng qua chương trình Gieo Hạt Khỏe
          </span>
        </div>
      )}

      {/* Content */}
      {shopEnabled && (
        <>
          {/* Selected Products - Drag & Drop */}
          {selectedProducts.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="shop-products">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 mb-4"
                  >
                    {selectedProducts.map((product, index) => (
                      <Draggable key={product.id} draggableId={product.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7CB342]' : ''
                            }`}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <Icon.Menu size={18} className="text-gray-400" />
                            </div>

                            {/* Product Image */}
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Icon.Package size={20} className="text-gray-400" />
                              </div>
                            )}

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-[#7CB342] font-medium">
                                {(product.sale_price || product.price).toLocaleString('vi-VN')}đ
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeProduct(product.id)}
                              disabled={isRemoving}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Icon.Trash size={18} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-4">
              <Icon.Package size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
              <p className="text-gray-400 text-xs">Thêm sản phẩm để hiển thị trong gian hàng</p>
            </div>
          )}

          {/* Add Product Button */}
          <Button
            variant="outline"
            onClick={() => setShowPicker(true)}
            disabled={!canAddMore}
            className="w-full"
          >
            <Icon.Plus size={18} className="mr-2" />
            Thêm sản phẩm ({selectedProducts.length}/{maxProducts})
          </Button>

          {/* Product Picker Modal */}
          <EnhancedModal
            isOpen={showPicker}
            onClose={() => setShowPicker(false)}
            title="Chọn sản phẩm"
            maxWidth="lg"
          >
            <div className="p-4">
              {availableProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                  {availableProducts.map((product) => (
                    <ProductPickerCard
                      key={product.id}
                      product={product}
                      onSelect={() => {
                        addProduct(product.id);
                        if (selectedProducts.length >= maxProducts - 1) {
                          setShowPicker(false);
                        }
                      }}
                      isAdding={isAdding}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon.Package size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-2">
                    {userProducts.length === 0 
                      ? (isReferralMember 
                          ? 'Không có sản phẩm để chọn'
                          : 'Bạn chưa có sản phẩm nào')
                      : 'Không có sản phẩm nào để thêm'}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    {userProducts.length === 0 
                      ? (isReferralMember 
                          ? 'Hiện chưa có sản phẩm nào trên hệ thống'
                          : 'Tham gia chương trình Gieo Hạt Khỏe để bán sản phẩm qua E-Card')
                      : 'Tất cả sản phẩm đã được thêm vào gian hàng'}
                  </p>
                  {userProducts.length === 0 && !isReferralMember && (
                    <Button
                      onClick={() => {
                        setShowPicker(false);
                        window.location.href = createPageUrl('MyReferrals');
                      }}
                      className="bg-[#7CB342] text-white hover:bg-[#689F38]"
                    >
                      <Icon.Award size={18} className="mr-2" />
                      Tham gia Gieo Hạt Khỏe
                    </Button>
                  )}
                </div>
              )}
            </div>
          </EnhancedModal>
        </>
      )}

      {/* Disabled State */}
      {!shopEnabled && (
        <div className="text-center py-6 bg-gray-50 rounded-xl">
          <Icon.Store size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Bật gian hàng để bắt đầu bán hàng qua E-Card</p>
        </div>
      )}
    </div>
  );
}

function ProductPickerCard({ product, onSelect, isAdding }) {
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  
  return (
    <button
      onClick={onSelect}
      disabled={isAdding}
      className="text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#7CB342] hover:shadow-md transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.Package size={32} className="text-gray-300" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#7CB342]/0 group-hover:bg-[#7CB342]/10 flex items-center justify-center transition-all">
          <div className="bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
            <Icon.Plus size={20} className="text-[#7CB342]" />
          </div>
        </div>

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            -{Math.round((1 - product.sale_price / product.price) * 100)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h4>
        <p className="text-[#7CB342] font-bold text-sm">
          {(product.sale_price || product.price).toLocaleString('vi-VN')}đ
        </p>
      </div>
    </button>
  );
}