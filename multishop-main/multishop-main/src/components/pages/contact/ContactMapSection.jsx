/**
 * ContactMapSection - Section bản đồ
 */
import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function ContactMapSection({ city, province }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mt-16"
    >
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <h2 className="font-serif text-2xl font-bold text-[#0F0F0F] mb-6 text-center">
          Vị Trí Trang Trại
        </h2>
        <div className="w-full h-96 bg-gray-200 rounded-2xl overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-[#7CB342]" />
              <p className="font-sans text-lg">Bản Đồ Trang Trại</p>
              <p className="text-sm">{city}, {province}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}