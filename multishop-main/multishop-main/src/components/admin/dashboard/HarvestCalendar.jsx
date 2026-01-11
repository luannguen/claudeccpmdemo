import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sprout, Package, DollarSign } from 'lucide-react';

export default function HarvestCalendar({ harvestCalendar, harvestByMonth }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day and total days of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    // Create calendar grid
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, harvests: [] });
    }
    
    // Days of month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const harvests = harvestCalendar.filter(h => h.date === dateStr);
      days.push({ day, date: dateStr, harvests });
    }
    
    return days;
  }, [currentMonth, harvestCalendar]);

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  // Upcoming harvests for sidebar
  const upcomingHarvests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return harvestCalendar
      .filter(h => new Date(h.date) >= today)
      .slice(0, 5);
  }, [harvestCalendar]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Lịch Thu Hoạch
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[140px] text-center capitalize">{monthName}</span>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {monthData.map((dayData, index) => {
            const isToday = dayData.date === new Date().toISOString().split('T')[0];
            const hasHarvest = dayData.harvests.length > 0;
            
            return (
              <div
                key={index}
                className={`
                  aspect-square p-1 rounded-lg text-center relative
                  ${dayData.day ? 'cursor-pointer hover:bg-gray-50' : ''}
                  ${isToday ? 'bg-amber-50 ring-2 ring-amber-400' : ''}
                  ${hasHarvest ? 'bg-green-50' : ''}
                `}
              >
                {dayData.day && (
                  <>
                    <span className={`text-sm ${isToday ? 'font-bold text-amber-600' : 'text-gray-700'}`}>
                      {dayData.day}
                    </span>
                    {hasHarvest && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayData.harvests.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        ))}
                        {dayData.harvests.length > 3 && (
                          <span className="text-[8px] text-green-600 font-bold">+{dayData.harvests.length - 3}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming Harvests List */}
        {upcomingHarvests.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-600" />
              Thu Hoạch Sắp Tới
            </h4>
            <div className="space-y-2">
              {upcomingHarvests.map((item, index) => {
                const harvestDate = new Date(item.date);
                const daysUntil = Math.ceil((harvestDate - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        daysUntil <= 3 ? 'bg-red-100 text-red-600' :
                        daysUntil <= 7 ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {daysUntil}d
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {harvestDate.toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Package className="w-3 h-3" />
                        {item.soldQuantity}/{item.totalQuantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Có thu hoạch</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-50 ring-1 ring-amber-400" />
            <span>Hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}