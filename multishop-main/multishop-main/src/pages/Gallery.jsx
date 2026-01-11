import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=90",
    title: "Trang Trại Đà Lạt",
    category: "Trang Trại"
  },
  {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=90",
    title: "Nhà Kính Hiện Đại",
    category: "Cơ Sở"
  },
  {
    src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=90",
    title: "Rau Xà Lách Xoăn", 
    category: "Sản Phẩm"
  },
  {
    src: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=1200&q=90",
    title: "Cà Chua Cherry",
    category: "Sản Phẩm"
  },
  {
    src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=90",
    title: "Vườn Rau Organic",
    category: "Trang Trại"
  },
  {
    src: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=90",
    title: "Kale Xoăn Tươi",
    category: "Sản Phẩm"
  },
  {
    src: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1200&q=90",
    title: "Dâu Tây Đà Lạt",
    category: "Sản Phẩm"
  },
  {
    src: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=1200&q=90",
    title: "Thu Hoạch Sáng",
    category: "Quy Trình"
  },
  {
    src: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=90",
    title: "Đóng Gói Sản Phẩm",
    category: "Quy Trình"
  }
];

export default function Gallery() {
  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#7CB342]" />
            <span className="text-sm font-medium">Hình Ảnh Trang Trại</span>
          </div>
          
          <h1 className="font-serif font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight">
            Trang Trại Organic Zero Farm
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]">
            Khám phá không gian xanh mát và quy trình sản xuất organic khép kín 
            tại trang trại Zero Farm Đà Lạt.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-[clamp(1rem,2vw,2.5rem)]">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={image.src}
                    alt={`${image.title} - Trang trại organic Zero Farm Đà Lạt, sản phẩm hữu cơ không dư lượng`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex items-end justify-start p-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="text-white">
                      <span className="inline-block bg-[#7CB342] text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
                        {image.category}
                      </span>
                      <h3 className="font-serif text-xl font-bold">
                        {image.title}
                      </h3>
                    </div>
                  </div>

                  {/* Hover Icon */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <ArrowRight className="w-5 h-5 text-[#7CB342]" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-[#7CB342]/20">
            <h2 className="font-serif text-[length:var(--font-h2)] font-bold text-[#0F0F0F] mb-4">
              Ghé Thăm Trang Trại Của Chúng Tôi
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-[1.618]">
              Đặt hàng ngay hôm nay và trải nghiệm sản phẩm organic tươi ngon, 
              an toàn từ trang trại đến bàn ăn gia đình bạn.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-[#7CB342] text-white px-8 py-4 rounded-full font-medium hover:bg-[#FF9800] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Đặt Hàng Ngay
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}