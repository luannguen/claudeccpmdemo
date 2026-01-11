import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Move } from "lucide-react";

export default function CategoryListView({ categories, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <motion.div 
          key={cat.id} 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-6"
        >
          <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-4xl">{cat.icon}</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
              <div className="flex gap-2 items-center">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  #{cat.display_order}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cat.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
              key: {cat.key}
            </p>
            {cat.description && (
              <p className="text-gray-600 mt-2">{cat.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(cat)}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />Sửa
            </button>
            <button 
              onClick={() => onDelete(cat)}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />Xóa
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}