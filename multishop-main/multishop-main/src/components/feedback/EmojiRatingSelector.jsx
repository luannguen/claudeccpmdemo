import React from 'react';
import { motion } from 'framer-motion';

const ratings = [
  { emoji: '😠', label: 'Rất tệ', value: 1, color: 'text-red-500' },
  { emoji: '😐', label: 'Tạm được', value: 2, color: 'text-orange-500' },
  { emoji: '😊', label: 'Tốt', value: 3, color: 'text-yellow-500' },
  { emoji: '😍', label: 'Tuyệt vời', value: 4, color: 'text-green-500' }
];

export default function EmojiRatingSelector({ value, onChange }) {
  return (
    <div className="flex justify-center gap-4">
      {ratings.map((rating) => (
        <motion.button
          key={rating.value}
          type="button"
          onClick={() => onChange(rating.value)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            value === rating.value
              ? 'border-[#7CB342] bg-green-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-4xl">{rating.emoji}</span>
          <span className={`text-xs font-medium ${value === rating.value ? rating.color : 'text-gray-500'}`}>
            {rating.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}