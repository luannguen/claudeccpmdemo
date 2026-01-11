import React from "react";
import { motion } from "framer-motion";
import { Package, Calendar, TrendingUp, Sparkles } from "lucide-react";

export default function PreOrderHero({ lotsCount }) {
  return (
    <section className="relative bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-20">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Đặt trước - Giá tốt nhất</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Sản phẩm Bán trước theo Lô
          </h1>
          
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Đặt trước ngay hôm nay để được giá tốt nhất. Giá sẽ tăng dần khi đến gần ngày thu hoạch!
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              <span>{lotsCount} lot đang bán</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Giá tăng theo thời gian</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Giao đúng ngày thu hoạch</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}