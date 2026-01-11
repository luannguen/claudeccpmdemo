/**
 * ViewModeSwitcher
 * 
 * Component UI để chuyển đổi giữa các chế độ xem.
 * Có thể sử dụng với ViewModeContext hoặc truyền props trực tiếp.
 * 
 * @example
 * // With Context
 * <ViewModeSwitcher />
 * 
 * // With Props (controlled)
 * <ViewModeSwitcher 
 *   viewMode={viewMode} 
 *   onViewModeChange={setViewMode}
 *   allowedModes={['grid', 'list']}
 * />
 */

import React, { useMemo } from 'react';
import { LayoutGrid, List, Table2, LayoutList } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useViewMode, VIEW_MODES } from './ViewModeContext';
import { cn } from "@/lib/utils";

// ========== MODE CONFIG ==========
const MODE_CONFIG = {
  [VIEW_MODES.GRID]: {
    icon: LayoutGrid,
    label: 'Lưới',
    tooltip: 'Xem dạng lưới'
  },
  [VIEW_MODES.LIST]: {
    icon: List,
    label: 'Danh sách',
    tooltip: 'Xem dạng danh sách'
  },
  [VIEW_MODES.TABLE]: {
    icon: Table2,
    label: 'Bảng',
    tooltip: 'Xem dạng bảng'
  },
  [VIEW_MODES.COMPACT]: {
    icon: LayoutList,
    label: 'Gọn',
    tooltip: 'Xem dạng gọn'
  }
};

// ========== MAIN COMPONENT ==========
/**
 * ViewModeSwitcher Component
 * @param {Object} props
 * @param {string} [props.viewMode] - Controlled mode (nếu không dùng context)
 * @param {function} [props.onViewModeChange] - Callback khi đổi mode
 * @param {string[]} [props.allowedModes] - Các mode được phép hiển thị
 * @param {string} [props.size] - Kích thước: 'sm' | 'default' | 'lg'
 * @param {string} [props.variant] - Kiểu hiển thị: 'default' | 'outline' | 'ghost'
 * @param {boolean} [props.showLabels] - Hiển thị text labels
 * @param {string} [props.className] - Custom className
 */
export function ViewModeSwitcher({
  viewMode: controlledMode,
  onViewModeChange,
  allowedModes,
  size = 'default',
  variant = 'outline',
  showLabels = false,
  className
}) {
  // Try to use context, fallback to controlled props
  let contextValue = null;
  try {
    contextValue = useViewMode();
  } catch (e) {
    // Not in ViewModeProvider, use controlled props
  }

  const viewMode = controlledMode ?? contextValue?.viewMode;
  const setViewMode = onViewModeChange ?? contextValue?.setViewMode;
  const modes = allowedModes ?? contextValue?.allowedModes ?? Object.values(VIEW_MODES);

  if (!viewMode || !setViewMode) {
    console.warn('ViewModeSwitcher: Either provide viewMode/onViewModeChange props or use within ViewModeProvider');
    return null;
  }

  // Filter valid modes
  const validModes = useMemo(() => 
    modes.filter(mode => MODE_CONFIG[mode]),
    [modes]
  );

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup 
        type="single" 
        value={viewMode}
        onValueChange={(value) => value && setViewMode(value)}
        className={cn("bg-gray-100 rounded-lg p-1", className)}
      >
        {validModes.map((mode) => {
          const config = MODE_CONFIG[mode];
          const Icon = config.icon;
          const isActive = viewMode === mode;

          return (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={mode}
                  aria-label={config.tooltip}
                  className={cn(
                    "transition-all duration-200 rounded-md",
                    sizeClasses[size],
                    isActive 
                      ? "bg-white text-[#7CB342] shadow-sm" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  )}
                >
                  <Icon className={iconSizes[size]} />
                  {showLabels && (
                    <span className="ml-1.5 text-xs font-medium">{config.label}</span>
                  )}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {config.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>
    </TooltipProvider>
  );
}

// ========== SIMPLE BUTTON VERSION ==========
/**
 * ViewModeButton - Single button to cycle through modes
 */
export function ViewModeButton({
  viewMode: controlledMode,
  onViewModeChange,
  allowedModes,
  size = 'default',
  variant = 'outline',
  className
}) {
  let contextValue = null;
  try {
    contextValue = useViewMode();
  } catch (e) {
    // Not in provider
  }

  const viewMode = controlledMode ?? contextValue?.viewMode;
  const setViewMode = onViewModeChange ?? contextValue?.setViewMode;
  const modes = allowedModes ?? contextValue?.allowedModes ?? Object.values(VIEW_MODES);

  if (!viewMode || !setViewMode) return null;

  const cycleMode = () => {
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const config = MODE_CONFIG[viewMode];
  const Icon = config?.icon || LayoutGrid;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={cycleMode}
            className={className}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {config?.tooltip || 'Đổi chế độ xem'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ViewModeSwitcher;