import React, { useMemo } from "react";
import { X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PriceStrategyPreview({ lot, onClose }) {
  const priceTimeline = useMemo(() => {
    if (!lot?.price_increase_strategy || !lot.estimated_harvest_date) return [];

    const strategy = lot.price_increase_strategy;
    const startDate = new Date();
    const endDate = new Date(lot.estimated_harvest_date);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) return [];

    const timeline = [];

    if (strategy.type === 'linear') {
      const ratePerDay = strategy.rate_per_day || 0;
      const maxIncrease = lot.max_price - lot.initial_price;
      const actualDays = Math.min(daysDiff, Math.floor(maxIncrease / ratePerDay));

      for (let i = 0; i <= Math.min(actualDays, 30); i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const price = Math.min(lot.initial_price + (i * ratePerDay), lot.max_price);
        
        timeline.push({
          date: date.toLocaleDateString('vi-VN'),
          price: price,
          day: i
        });
      }
    } else if (strategy.type === 'step' && strategy.steps) {
      strategy.steps.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(step => {
        timeline.push({
          date: new Date(step.date).toLocaleDateString('vi-VN'),
          price: step.price,
          day: Math.ceil((new Date(step.date) - startDate) / (1000 * 60 * 60 * 24))
        });
      });
    }

    return timeline;
  }, [lot]);

  if (!lot) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#7CB342]" />
              Dự báo Giá - {lot.lot_name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="text-sm text-blue-600 mb-1">Giá khởi điểm</div>
                <div className="text-2xl font-bold text-blue-700">
                  {lot.initial_price?.toLocaleString('vi-VN')}đ
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                <div className="text-sm text-green-600 mb-1">Giá hiện tại</div>
                <div className="text-2xl font-bold text-green-700">
                  {lot.current_price?.toLocaleString('vi-VN')}đ
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
                <div className="text-sm text-red-600 mb-1">Giá trần</div>
                <div className="text-2xl font-bold text-red-700">
                  {lot.max_price?.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>

            {/* Timeline */}
            {priceTimeline.length > 0 ? (
              <div>
                <h3 className="font-bold text-lg mb-4">Lịch sử Tăng giá Dự kiến</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {priceTimeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-full flex items-center justify-center font-bold">
                          Ngày {item.day}
                        </div>
                        <div>
                          <div className="font-medium">{item.date}</div>
                          <div className="text-sm text-gray-600">
                            {index === 0 ? 'Bắt đầu' : index === priceTimeline.length - 1 ? 'Giá trần' : `Bước ${index}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#7CB342]">
                          {item.price.toLocaleString('vi-VN')}đ
                        </div>
                        {index > 0 && (
                          <div className="text-sm text-gray-600">
                            +{((item.price - priceTimeline[0].price) / priceTimeline[0].price * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu dự báo
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}