import React, { useState } from "react";
import { Package, Calendar, MapPin, TrendingUp, FileText } from "lucide-react";
import CountdownTimer from "@/components/preorder/CountdownTimer";
import SoldProgressBar from "@/components/preorder/SoldProgressBar";
import PriceHistoryChart from "@/components/preorder/PriceHistoryChart";
import HarvestNotificationToggle from "@/components/preorder/HarvestNotificationToggle";
import { PreOrderTermsBadge, RiskDisclosure, DeliveryEstimateCard, PreOrderPolicyModal, DEFAULT_PREORDER_POLICY } from "@/components/preorder/policy";
import { LotCapacityIndicator, HarvestBufferInfo } from "@/components/preorder/capacity";
import { PreOrderFAQBot } from "@/components/preorder/communication";

export default function LotDetailInfo({ lot, preOrder, displayName, priceIncrease, daysUntilHarvest }) {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Pre-Order Badge with Policy Link */}
      <PreOrderTermsBadge 
        variant="detailed"
        harvestDate={lot.estimated_harvest_date}
        depositPercent={lot.deposit_percentage}
        onClick={() => setShowPolicyModal(true)}
      />

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {preOrder?.preorder_name && (
            <span className="text-sm text-gray-600">{preOrder.preorder_name}</span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
        <p className="text-lg text-gray-600 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {lot.lot_name} {lot.lot_code && `• ${lot.lot_code}`}
        </p>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-5xl font-bold text-[#7CB342]">
            {lot.current_price?.toLocaleString('vi-VN')}đ
          </span>
          {lot.initial_price !== lot.current_price && (
            <span className="text-xl text-gray-500 line-through">
              {lot.initial_price?.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
        
        {priceIncrease > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span>Đã tăng {priceIncrease}% so với giá khởi điểm</span>
          </div>
        )}

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-700">Giá trần tối đa:</span>
            <span className="font-semibold">{lot.max_price?.toLocaleString('vi-VN')}đ</span>
          </div>
          {lot.deposit_percentage < 100 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Đặt cọc:</span>
              <span className="font-semibold text-orange-600">{lot.deposit_percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      {daysUntilHarvest > 0 && (
        <CountdownTimer 
          targetDate={lot.estimated_harvest_date} 
          variant="default" 
          showUrgency={true}
        />
      )}

      {/* Sold Progress */}
      <SoldProgressBar 
        soldQuantity={lot.sold_quantity || 0}
        totalQuantity={lot.total_yield}
        availableQuantity={lot.available_quantity}
        variant="detailed"
        showSocialProof={true}
      />

      {/* Price History Chart */}
      <PriceHistoryChart lot={lot} showForecast={true} height={180} />

      {/* Harvest Info */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#7CB342]" />
          Thông tin thu hoạch
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày thu hoạch:</span>
            <span className="font-semibold">
              {new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Còn lại:</span>
            <span className={`font-semibold ${daysUntilHarvest < 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysUntilHarvest > 0 ? `${daysUntilHarvest} ngày` : 'Đã đến ngày'}
            </span>
          </div>
          {lot.harvest_location && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600 text-xs block mb-1">Vị trí:</span>
                <span className="font-medium">{lot.harvest_location}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Harvest Notification */}
      <HarvestNotificationToggle 
        lotId={lot.id}
        lotName={`${displayName} - ${lot.lot_name}`}
        harvestDate={lot.estimated_harvest_date}
        variant="card"
      />

      {/* Delivery Estimate with Buffer */}
      <DeliveryEstimateCard 
        estimatedHarvestDate={lot.estimated_harvest_date}
        bufferDays={7}
        shippingDays={3}
        variant="default"
      />

      {/* Capacity Indicator */}
      <LotCapacityIndicator 
        totalYield={lot.total_yield}
        soldQuantity={lot.sold_quantity || 0}
        availableQuantity={lot.available_quantity}
        moq={lot.moq || 1}
        variant="detailed"
      />

      {/* Risk Disclosure */}
      <RiskDisclosure variant="expandable" />

      {/* FAQ Bot (compact) */}
      <PreOrderFAQBot variant="compact" />

      {/* Policy Modal */}
      <PreOrderPolicyModal 
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        policy={DEFAULT_PREORDER_POLICY}
        requireAcceptance={false}
      />
    </div>
  );
}