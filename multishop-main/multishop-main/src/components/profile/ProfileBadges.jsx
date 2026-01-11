import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function ProfileBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="pt-6 mt-6 border-t-2 border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-[#7CB342]" />
        Huy Hiệu Đạt Được
      </h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge, idx) => (
          <motion.span
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
          >
            🏆 {badge}
          </motion.span>
        ))}
      </div>
    </div>
  );
}