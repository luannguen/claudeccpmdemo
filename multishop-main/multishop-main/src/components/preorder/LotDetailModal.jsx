import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar, MapPin, FileText, TrendingUp, ShoppingCart, Heart, Image as ImageIcon, CheckCircle, Award } from "lucide-react";
import EnhancedModal from "@/components/EnhancedModal";

export default function LotDetailModal({ isOpen, onClose, lot }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // ✅ Sync wishlist state with localStorage
  React.useEffect(() => {
    if (isOpen && lot?.id) {
      const wishlistKey = `lot:${lot.id}`;
      const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      setIsInWishlist(wishlist.includes(wishlistKey));
    }
  }, [isOpen, lot?.id]);

  if (!lot) return null;

  // ✅ Fallback chain: lot -> preOrder
  const displayImage = lot.product_image || lot.preOrder?.product_image || "";
  const displayName = lot.product_name || lot.preOrder?.product_name || lot.lot_name;
  
  const images = lot.product_gallery && lot.product_gallery.length > 0 
    ? lot.product_gallery 
    : displayImage 
    ? [displayImage] 
    : [];

  const daysUntilHarvest = Math.ceil((new Date(lot.estimated_harvest_date) - new Date()) / (1000 * 60 * 60 * 24));
  const availablePercentage = ((lot.available_quantity / lot.total_yield) * 100).toFixed(0);
  const soldPercentage = (((lot.sold_quantity || 0) / lot.total_yield) * 100).toFixed(0);
  const priceIncrease = lot.initial_price && lot.current_price 
    ? ((lot.current_price - lot.initial_price) / lot.initial_price * 100).toFixed(0)
    : 0;

  const handleAddToCart = () => {
    const quantity = lot.moq || 1;

    // ✅ Validate available quantity
    if (lot.available_quantity < quantity) {
      alert(`❌ Không đủ hàng! Chỉ còn ${lot.available_quantity} sản phẩm.`);
      return;
    }

    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: {
        id: lot.id,
        name: `${displayName} - ${lot.lot_name}`,
        price: lot.current_price,
        image_url: displayImage,
        quantity: quantity,
        unit: 'kg',
        is_preorder: true,
        lot_id: lot.id,
        estimated_harvest_date: lot.estimated_harvest_date,
        moq: lot.moq,
        product_id: lot.product_id || lot.preOrder?.product_id,
        available_quantity: lot.available_quantity
      }
    }));
    onClose();
  };

  const handleToggleWishlist = () => {
    const wishlistKey = `lot:${lot.id}`;
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== wishlistKey);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      if (!wishlist.includes(wishlistKey)) {
        wishlist.push(wishlistKey);
        localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
      }
    }
    
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Package className="w-4 h-4" />
              {lot.lot_name} {lot.lot_code && `• ${lot.lot_code}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Gallery Section */}
          {images.length > 0 && (
            <div className="mb-8">
              <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt={lot.product_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    BÁN TRƯỚC
                  </span>
                  
                  {lot.status === 'active' && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Đang mở bán
                    </span>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#7CB342] scale-105' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-[#7CB342]">
                    {lot.current_price?.toLocaleString('vi-VN')}đ
                  </span>
                  {lot.initial_price !== lot.current_price && (
                    <span className="text-lg text-gray-500 line-through">
                      {lot.initial_price?.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                
                {priceIncrease > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>Đã tăng {priceIncrease}% so với giá khởi điểm</span>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Giá trần tối đa:</span>
                    <span className="font-semibold">{lot.max_price?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {lot.deposit_percentage < 100 && (
                    <div className="flex justify-between">
                      <span>Đặt cọc:</span>
                      <span className="font-semibold text-orange-600">{lot.deposit_percentage}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Harvest Info */}
              <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7CB342]" />
                  Thông tin thu hoạch
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày thu hoạch:</span>
                    <span className="font-semibold">
                      {new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className={`font-semibold ${daysUntilHarvest < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                      {daysUntilHarvest > 0 ? `${daysUntilHarvest} ngày` : 'Đã đến ngày'}
                    </span>
                  </div>
                  {lot.harvest_location && (
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600 text-xs block mb-1">Vị trí thu hoạch:</span>
                        <span className="font-medium">{lot.harvest_location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Info */}
              <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#7CB342]" />
                  Số lượng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng sản lượng:</span>
                    <span className="font-semibold">{lot.total_yield}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã bán:</span>
                    <span className="font-semibold text-orange-600">{lot.sold_quantity || 0} ({soldPercentage}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="font-semibold text-green-600">{lot.available_quantity} ({availablePercentage}%)</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] h-3 rounded-full transition-all"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>

                  {lot.moq > 1 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-orange-800">
                        <strong>Đặt tối thiểu:</strong> {lot.moq} {lot.moq === lot.total_yield ? 'lô (nguyên lô)' : 'sản phẩm'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Price Strategy */}
              {lot.price_increase_strategy && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Chiến lược giá
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loại:</span>
                      <span className="font-semibold">
                        {lot.price_increase_strategy.type === 'linear' ? 'Tăng đều' :
                         lot.price_increase_strategy.type === 'step' ? 'Tăng theo bước' :
                         'Tăng lũy thừa'}
                      </span>
                    </div>
                    {lot.price_increase_strategy.rate_per_day && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tốc độ tăng:</span>
                        <span className="font-semibold">
                          {lot.price_increase_strategy.rate_per_day.toLocaleString('vi-VN')}đ/ngày
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      💡 Giá sẽ tăng dần theo thời gian để khuyến khích đặt trước sớm
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {lot.notes && (
                <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#7CB342]" />
                    Ghi chú thêm
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{lot.notes}</p>
                </div>
              )}

              {/* Certifications */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Chứng nhận & Cam kết
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">100% Organic</p>
                      <p className="text-xs text-gray-600">Không sử dụng thuốc trừ sâu hóa học</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Tươi ngon</p>
                      <p className="text-xs text-gray-600">Thu hoạch và giao hàng trong ngày</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Hoàn tiền 100%</p>
                      <p className="text-xs text-gray-600">Nếu không đúng cam kết chất lượng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t bg-white">
            <button
              onClick={handleToggleWishlist}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              {isInWishlist ? 'Đã lưu' : 'Yêu thích'}
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={lot.available_quantity <= 0}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                lot.available_quantity > 0
                  ? 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {lot.available_quantity > 0 
                ? `Đặt trước ${lot.moq > 1 ? `(${lot.moq} tối thiểu)` : ''}` 
                : 'Đã hết hàng'}
            </button>
          </div>
        </div>
      </div>
    </EnhancedModal>
  );
}