/**
 * GiftsTab - Refactored with new Gift module
 * Uses features/gift module
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { 
  useGiftInbox, 
  GiftCard, 
  RedeemGiftModal, 
  SwapGiftModal 
} from "@/components/features/gift";

export default function GiftsTabNew({ sentGifts = [], isLoading: externalLoading }) {
  const [view, setView] = useState('received'); // 'received' | 'sent'
  const [selectedGift, setSelectedGift] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Use new hook for received gifts
  const { activeGifts, historyGifts, isLoading: inboxLoading } = useGiftInbox();

  const isLoading = externalLoading || inboxLoading;

  // Combine active + history for received view
  const receivedGifts = [...activeGifts, ...historyGifts];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Icon.Spinner size={40} className="text-[#7CB342]" />
        <p className="text-gray-500 text-sm mt-3">Đang tải quà tặng...</p>
      </div>
    );
  }

  const gifts = view === 'received' ? receivedGifts : sentGifts;

  const handleRedeem = (gift) => {
    setSelectedGift(gift);
    setShowRedeemModal(true);
  };

  const handleSwap = (gift) => {
    setSelectedGift(gift);
    setShowSwapModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <TabButton
              active={view === 'received'}
              onClick={() => setView('received')}
              count={receivedGifts.length}
              label="Đã nhận"
              icon="Inbox"
            />
            <TabButton
              active={view === 'sent'}
              onClick={() => setView('sent')}
              count={sentGifts.length}
              label="Đã gửi"
              icon="Send"
            />
          </div>

          {/* Stats */}
          {view === 'received' && activeGifts.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-[#7CB342]/10 text-[#7CB342] rounded-full font-medium">
                {activeGifts.length} quà chờ đổi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gifts List */}
      {gifts.length === 0 ? (
        <EmptyState view={view} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map(gift => (
            <GiftCard
              key={gift.id}
              gift={gift}
              view={view}
              onRedeem={handleRedeem}
              onSwap={handleSwap}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RedeemGiftModal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setSelectedGift(null);
        }}
        gift={selectedGift}
        onRedeemed={() => {
          setShowRedeemModal(false);
          setSelectedGift(null);
        }}
      />

      <SwapGiftModal
        isOpen={showSwapModal}
        onClose={() => {
          setShowSwapModal(false);
          setSelectedGift(null);
        }}
        gift={selectedGift}
        onSwapped={() => {
          setShowSwapModal(false);
          setSelectedGift(null);
        }}
      />
    </div>
  );
}

function TabButton({ active, onClick, count, label, icon }) {
  const TabIcon = Icon[icon];
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 min-h-[44px] rounded-lg font-medium transition-all flex items-center gap-2 ${
        active
          ? 'bg-[#7CB342] text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {TabIcon && <TabIcon size={18} />}
      {label} ({count})
    </button>
  );
}

function EmptyState({ view }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon.Gift size={40} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {view === 'received' ? 'Chưa nhận quà nào' : 'Chưa gửi quà nào'}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {view === 'received' 
          ? 'Khi bạn bè gửi quà, chúng sẽ xuất hiện ở đây'
          : 'Gửi quà cho bạn bè từ trang E-Card của họ'
        }
      </p>
    </div>
  );
}