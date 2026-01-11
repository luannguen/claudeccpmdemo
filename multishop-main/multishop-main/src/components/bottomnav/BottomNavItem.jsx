/**
 * BottomNavItem Component
 * 
 * Component render từng item trong Bottom Navigation.
 * Tuân thủ kiến trúc 3 lớp - đây là UI Layer (chỉ render).
 */

import React from 'react';
import { cn } from '@/lib/utils';

export function BottomNavItem({ 
  item, 
  isActive, 
  badgeCount, 
  onAction 
}) {
  const Icon = item.icon;
  const isHighlight = item.highlight;

  return (
    <button
      onClick={() => onAction(item)}
      className={cn(
        "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all min-w-[56px]",
        isHighlight 
          ? "bg-[#7CB342] text-white shadow-md -mt-3 px-4" 
          : isActive 
            ? "text-[#7CB342]" 
            : "text-gray-500 hover:text-[#7CB342] active:scale-95"
      )}
      aria-label={item.label}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        
        {/* Badge */}
        {badgeCount > 0 && (
          <span className={cn(
            "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1",
            "rounded-full text-[10px] font-bold flex items-center justify-center",
            isHighlight 
              ? "bg-white text-[#7CB342]" 
              : "bg-red-500 text-white"
          )}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>
      
      <span className={cn(
        "text-[10px] mt-0.5 font-medium truncate max-w-[48px]",
        isHighlight && "text-white"
      )}>
        {item.label}
      </span>
    </button>
  );
}

export default BottomNavItem;