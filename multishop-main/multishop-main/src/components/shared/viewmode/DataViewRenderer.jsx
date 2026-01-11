/**
 * DataViewRenderer
 * 
 * Component trung tâm để render dữ liệu theo view mode.
 * Tự động chọn layout và item component phù hợp.
 * 
 * @example
 * <DataViewRenderer
 *   data={orders}
 *   viewMode={viewMode}
 *   isLoading={isLoading}
 *   components={{
 *     grid: { item: OrderGridCard, wrapper: 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' },
 *     list: { item: OrderListItem, wrapper: 'space-y-3' },
 *     table: { component: OrderTableView } // Full component for table
 *   }}
 *   itemProps={{ onView: handleView, onEdit: handleEdit }}
 *   emptyState={<EmptyState message="Không có đơn hàng" />}
 *   loadingState={<LoadingSkeleton />}
 * />
 */

import React, { useMemo, useCallback } from 'react';
import { useViewMode, VIEW_MODES } from './ViewModeContext';
import { LoadingState, EmptyState } from '@/components/shared/ui';
import { cn } from "@/lib/utils";

// ========== DEFAULT WRAPPER CLASSES ==========
const DEFAULT_WRAPPER_CLASSES = {
  [VIEW_MODES.GRID]: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  [VIEW_MODES.LIST]: 'space-y-3',
  [VIEW_MODES.TABLE]: '',
  [VIEW_MODES.COMPACT]: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2'
};

// ========== MAIN COMPONENT ==========
/**
 * DataViewRenderer
 * @param {Object} props
 * @param {Array} props.data - Mảng dữ liệu cần render
 * @param {string} [props.viewMode] - View mode (nếu không dùng context)
 * @param {boolean} [props.isLoading] - Đang tải dữ liệu
 * @param {boolean} [props.isError] - Có lỗi xảy ra
 * @param {Object} props.components - Mapping các component theo view mode
 * @param {Object} [props.itemProps] - Props chung cho mỗi item
 * @param {React.ReactNode} [props.emptyState] - Custom empty state
 * @param {React.ReactNode} [props.loadingState] - Custom loading state
 * @param {React.ReactNode} [props.errorState] - Custom error state
 * @param {string} [props.className] - Custom className cho wrapper
 * @param {function} [props.keyExtractor] - Function để extract key từ item
 * @param {boolean} [props.hasFilters] - Có đang filter không (cho empty state)
 */
export function DataViewRenderer({
  data = [],
  viewMode: controlledMode,
  isLoading = false,
  isError = false,
  components = {},
  itemProps = {},
  emptyState,
  loadingState,
  errorState,
  className,
  keyExtractor = (item, index) => item?.id || index,
  hasFilters = false
}) {
  // Try to use context
  let contextValue = null;
  try {
    contextValue = useViewMode();
  } catch (e) {
    // Not in provider
  }

  const viewMode = controlledMode ?? contextValue?.viewMode ?? VIEW_MODES.GRID;

  // Get component config for current mode
  const modeConfig = useMemo(() => {
    const config = components[viewMode];
    if (!config) {
      // Fallback to first available mode
      const fallbackMode = Object.keys(components)[0];
      return components[fallbackMode] || {};
    }
    return config;
  }, [components, viewMode]);

  // Render item with memoization
  const renderItem = useCallback((item, index) => {
    const ItemComponent = modeConfig.item;
    if (!ItemComponent) return null;

    const key = keyExtractor(item, index);
    
    // Normalize props với nhiều alias để tương thích với các component cũ
    return (
      <ItemComponent
        key={key}
        item={item}
        data={item}
        order={item}
        customer={item}
        product={item}
        member={item}
        index={index}
        {...itemProps}
      />
    );
  }, [modeConfig.item, keyExtractor, itemProps]);

  // Loading state
  if (isLoading) {
    return loadingState || (
      <LoadingState 
        message="Đang tải dữ liệu..." 
        className="py-12"
      />
    );
  }

  // Error state
  if (isError) {
    return errorState || (
      <div className="text-center py-12">
        <p className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu</p>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return emptyState || (
      <EmptyState 
        message={hasFilters ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
        className="py-12"
      />
    );
  }

  // TABLE mode - render full component
  if (viewMode === VIEW_MODES.TABLE && modeConfig.component) {
    const TableComponent = modeConfig.component;
    
    // Normalize props: truyền data với nhiều alias để đảm bảo tương thích
    // với các component cũ expect props khác nhau (orders, customers, products, etc.)
    const normalizedProps = {
      // Data aliases - component có thể dùng bất kỳ prop nào
      data,
      items: data,
      orders: data,
      customers: data,
      products: data,
      members: data,
      // Spread các itemProps khác
      ...itemProps
    };
    
    return (
      <div className={cn(modeConfig.wrapper, className)}>
        <TableComponent {...normalizedProps} />
      </div>
    );
  }

  // GRID, LIST, COMPACT modes - render items
  const wrapperClass = modeConfig.wrapper || DEFAULT_WRAPPER_CLASSES[viewMode];

  return (
    <div className={cn(wrapperClass, className)}>
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
}

// ========== WITH ANIMATION VERSION ==========
/**
 * AnimatedDataViewRenderer - Với animation khi chuyển view mode
 */
export function AnimatedDataViewRenderer(props) {
  // Import framer-motion dynamically if needed
  // For now, just use regular DataViewRenderer
  return <DataViewRenderer {...props} />;
}

// ========== HOC FOR QUICK SETUP ==========
/**
 * createDataViewer - Factory function để tạo DataViewer cụ thể
 * 
 * @example
 * const OrderDataViewer = createDataViewer({
 *   grid: { item: OrderGridCard },
 *   list: { item: OrderListItem },
 *   table: { component: OrderTableView }
 * });
 * 
 * // Usage
 * <OrderDataViewer data={orders} itemProps={{ onView }} />
 */
export function createDataViewer(componentMapping) {
  return function ConfiguredDataViewer(props) {
    return (
      <DataViewRenderer
        components={componentMapping}
        {...props}
      />
    );
  };
}

export default DataViewRenderer;