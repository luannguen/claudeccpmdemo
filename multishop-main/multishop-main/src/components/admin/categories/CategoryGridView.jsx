import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Move } from "lucide-react";

export default function CategoryGridView({ categories, onEdit, onDelete }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <motion.div 
          key={cat.id} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
        >
          <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-8xl">{cat.icon}</div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                cat.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}
              </span>
            </div>
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Move className="w-3 h-3" />
                #{cat.display_order}
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-xl font-bold mb-2">{cat.name}</h3>
            <p className="text-sm text-gray-600 mb-1 font-mono bg-gray-50 px-2 py-1 rounded">
              key: {cat.key}
            </p>
            {cat.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(cat)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />Sửa
              </button>
              <button 
                onClick={() => onDelete(cat)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />Xóa
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}