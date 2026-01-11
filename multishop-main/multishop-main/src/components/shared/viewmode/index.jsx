/**
 * ViewMode System - Central Exports
 * 
 * Hệ thống quản lý chế độ xem (grid, list, table) cho toàn ứng dụng.
 * 
 * @example
 * // Import everything
 * import { 
 *   ViewModeProvider, 
 *   useViewMode, 
 *   useViewModeState,
 *   ViewModeSwitcher,
 *   DataViewRenderer,
 *   VIEW_MODES
 * } from '@/components/shared/viewmode';
 * 
 * // Basic usage with Provider
 * <ViewModeProvider storageKey="my-list">
 *   <ViewModeSwitcher />
 *   <DataViewRenderer 
 *     data={items}
 *     components={{
 *       grid: { item: ItemCard },
 *       list: { item: ItemRow }
 *     }}
 *   />
 * </ViewModeProvider>
 * 
 * // Standalone usage (no Provider needed)
 * const { viewMode, setViewMode } = useViewModeState({ storageKey: 'my-list' });
 * <DataViewRenderer data={items} viewMode={viewMode} ... />
 */

// Context & Hooks
export {
  ViewModeProvider,
  useViewMode,
  useViewModeState,
  VIEW_MODES,
  DEFAULT_VIEW_MODE
} from './ViewModeContext';

// UI Components
export {
  ViewModeSwitcher,
  ViewModeButton
} from './ViewModeSwitcher';

// Data Rendering
export {
  DataViewRenderer,
  AnimatedDataViewRenderer,
  createDataViewer
} from './DataViewRenderer';

// ========== PRESETS ==========
/**
 * Preset wrapper classes cho các layout phổ biến
 */
export const LAYOUT_PRESETS = {
  // Products
  productGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
  productList: 'space-y-4',
  
  // Orders
  orderGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  orderList: 'space-y-3',
  
  // Customers
  customerGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  customerList: 'space-y-3',
  
  // Compact
  compactGrid: 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2',
  
  // Admin cards
  adminGrid: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
  adminList: 'space-y-4'
};

// ========== TYPE DEFINITIONS (JSDoc) ==========
/**
 * @typedef {Object} ViewModeConfig
 * @property {React.ComponentType} [item] - Component render từng item
 * @property {React.ComponentType} [component] - Component render toàn bộ (cho table)
 * @property {string} [wrapper] - Tailwind classes cho wrapper
 */

/**
 * @typedef {'grid' | 'list' | 'table' | 'compact'} ViewModeType
 */

/**
 * @typedef {Object} DataViewerProps
 * @property {Array} data - Dữ liệu cần render
 * @property {ViewModeType} [viewMode] - Chế độ xem hiện tại
 * @property {boolean} [isLoading] - Đang tải
 * @property {boolean} [isError] - Có lỗi
 * @property {Object.<ViewModeType, ViewModeConfig>} components - Mapping components
 * @property {Object} [itemProps] - Props chung cho items
 * @property {React.ReactNode} [emptyState] - Custom empty state
 * @property {React.ReactNode} [loadingState] - Custom loading state
 * @property {string} [className] - Custom className
 */