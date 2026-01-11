import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WishlistEmptyState({ onClose }) {
  return (
    <div className="text-center py-12">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-4">Danh sách trống</p>
      <Link 
        to={createPageUrl('Services')}
        onClick={onClose}
        className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800] transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Khám Phá
      </Link>
    </div>
  );
}