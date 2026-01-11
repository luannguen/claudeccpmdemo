/**
 * @deprecated Use GiftsTabNew from '@/components/ecard/GiftsTabNew' instead
 * This component will be removed in a future version.
 * 
 * Migration: Replace import with:
 * import GiftsTabNew from '@/components/ecard/GiftsTabNew';
 * 
 * The new version uses the refactored features/gift module
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useGifts } from "@/components/ecard";
import GiftCard from "./GiftCard";
import { RedeemGiftModal } from "@/components/ecard";

/** @deprecated Use GiftsTabNew instead */
export default function GiftsTab({ sentGifts, receivedGifts, isLoading }) {
  const [view, setView] = useState('received'); // 'received' | 'sent'
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Icon.Spinner size={48} />
      </div>
    );
  }

  const gifts = view === 'received' ? receivedGifts : sentGifts;

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'received'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã nhận ({receivedGifts.length})
          </button>
          <button
            onClick={() => setView('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'sent'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã gửi ({sentGifts.length})
          </button>
        </div>

        {view === 'received' && (
          <button
            onClick={() => setShowRedeemModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Icon.Gift size={16} />
            Đổi quà
          </button>
        )}
      </div>

      {/* Gifts List */}
      {gifts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Icon.Gift size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {view === 'received' ? 'Chưa nhận quà nào' : 'Chưa gửi quà nào'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map(gift => (
            <GiftCard key={gift.id} gift={gift} mode={view} />
          ))}
        </div>
      )}

      <RedeemGiftModal 
        isOpen={showRedeemModal} 
        onClose={() => setShowRedeemModal(false)} 
      />
    </div>
  );
}