import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EnhancedModal from '../EnhancedModal';
import ReviewForm from '../reviews/ReviewForm';

export default function ProductReviewModalEnhanced({ isOpen, onClose, product, currentUser }) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Đánh Giá Sản Phẩm"
      maxWidth="3xl"
      persistPosition={true}
      positionKey="review-modal"
    >
      <div className="p-4 sm:p-6">
        <ReviewForm
          product={product}
          currentUser={currentUser}
          onSuccess={() => {
            onClose();
            
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
            toast.innerHTML = `
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="font-medium">⭐ Cảm ơn đánh giá của bạn!</span>
              </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }}
          onCancel={onClose}
        />
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </EnhancedModal>
  );
}