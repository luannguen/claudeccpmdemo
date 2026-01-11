/**
 * PreOrderDetailsTab - Tab chi tiết (harvest, price history, etc)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, TrendingUp, Bell, ChevronDown, ChevronUp 
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PriceHistoryChart from '@/components/preorder/PriceHistoryChart';
import HarvestNotificationToggle from '@/components/preorder/HarvestNotificationToggle';
import { HarvestBufferInfo } from '@/components/preorder/capacity';

// Expandable section helper
function ExpandableSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7CB342]/10 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#7CB342]" />
          </div>
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreOrderDetailsTab({ lot, preOrder, product, displayName }) {
  return (
    <div className="space-y-3">
      {/* Harvest Info - Default open */}
      <ExpandableSection title="Thông tin thu hoạch" icon={Calendar} defaultOpen={true}>
        <div className="space-y-4">
          {/* Basic harvest info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Ngày thu hoạch</span>
              <p className="font-semibold">
                {format(new Date(lot.estimated_harvest_date), 'dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
            {lot.harvest_location && (
              <div>
                <span className="text-gray-500">Địa điểm</span>
                <p className="font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lot.harvest_location}
                </p>
              </div>
            )}
          </div>

          {/* Buffer info - simplified */}
          <HarvestBufferInfo 
            estimatedHarvestDate={lot.estimated_harvest_date}
            bufferDays={7}
            variant="compact"
          />
        </div>
      </ExpandableSection>

      {/* Price History */}
      <ExpandableSection title="Biến động giá" icon={TrendingUp} defaultOpen={false}>
        <PriceHistoryChart lot={lot} showForecast={true} height={160} />
        <p className="text-xs text-gray-500 mt-2">
          * Giá bán trước thường tăng dần khi gần ngày thu hoạch
        </p>
      </ExpandableSection>

      {/* Notification */}
      <ExpandableSection title="Nhận thông báo" icon={Bell} defaultOpen={false}>
        <HarvestNotificationToggle 
          lotId={lot.id}
          lotName={`${displayName} - ${lot.lot_name}`}
          harvestDate={lot.estimated_harvest_date}
          variant="inline"
        />
      </ExpandableSection>

      {/* Product description if available */}
      {product?.description && (
        <div className="bg-gray-50 rounded-xl p-4 mt-4">
          <h4 className="font-medium text-gray-800 mb-2">Mô tả sản phẩm</h4>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {product.description}
          </p>
        </div>
      )}

      {/* Lot notes */}
      {lot.notes && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-2">Ghi chú</h4>
          <p className="text-sm text-blue-700">{lot.notes}</p>
        </div>
      )}
    </div>
  );
}