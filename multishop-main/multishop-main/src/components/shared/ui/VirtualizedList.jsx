/**
 * VirtualizedList - Performance optimized list for large datasets
 * 
 * Uses windowing to only render visible items
 * Falls back to regular list for small datasets
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * VirtualizedList Component
 * @param {Object} props
 * @param {Array} props.items - Data items to render
 * @param {Function} props.renderItem - Function to render each item: (item, index) => ReactNode
 * @param {number} [props.itemHeight=80] - Height of each item in pixels
 * @param {number} [props.overscan=5] - Number of items to render outside visible area
 * @param {number} [props.threshold=50] - Minimum items before virtualization kicks in
 * @param {string} [props.className] - Container className
 * @param {string} [props.containerHeight='600px'] - Height of scroll container
 * @param {Function} [props.getItemKey] - Function to get unique key for item
 */
export function VirtualizedList({
  items,
  renderItem,
  itemHeight = 80,
  overscan = 5,
  threshold = 50,
  className = '',
  containerHeight = '600px',
  getItemKey = (item, index) => item?.id || index
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightPx, setContainerHeightPx] = useState(0);

  // Measure container height
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeightPx(containerRef.current.clientHeight);
    }
  }, [containerHeight]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems, totalHeight, offsetY } = useMemo(() => {
    if (items.length < threshold) {
      // Don't virtualize small lists
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        visibleItems: items,
        totalHeight: items.length * itemHeight,
        offsetY: 0
      };
    }

    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeightPx / itemHeight) + overscan * 2;
    const endIdx = Math.min(items.length - 1, startIdx + visibleCount);

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      visibleItems: items.slice(startIdx, endIdx + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIdx * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeightPx, overscan, threshold]);

  // Skip virtualization for small lists
  if (items.length < threshold) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, localIndex) => {
            const actualIndex = startIndex + localIndex;
            return (
              <div 
                key={getItemKey(item, actualIndex)}
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * VirtualizedGrid - Grid version of virtualized list
 */
export function VirtualizedGrid({
  items,
  renderItem,
  itemHeight = 200,
  columns = 3,
  gap = 16,
  overscan = 2,
  threshold = 30,
  className = '',
  containerHeight = '600px',
  getItemKey = (item, index) => item?.id || index
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightPx, setContainerHeightPx] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeightPx(containerRef.current.clientHeight);
    }
  }, [containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);

  const { startRow, endRow, visibleItems, totalHeight, offsetY } = useMemo(() => {
    if (items.length < threshold) {
      return {
        startRow: 0,
        endRow: totalRows - 1,
        visibleItems: items,
        totalHeight: totalRows * rowHeight,
        offsetY: 0
      };
    }

    const startR = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleRowCount = Math.ceil(containerHeightPx / rowHeight) + overscan * 2;
    const endR = Math.min(totalRows - 1, startR + visibleRowCount);

    const startIdx = startR * columns;
    const endIdx = Math.min(items.length, (endR + 1) * columns);

    return {
      startRow: startR,
      endRow: endR,
      visibleItems: items.slice(startIdx, endIdx),
      totalHeight: totalRows * rowHeight,
      offsetY: startR * rowHeight
    };
  }, [items, columns, rowHeight, scrollTop, containerHeightPx, overscan, threshold, totalRows]);

  // Skip virtualization for small grids
  if (items.length < threshold) {
    return (
      <div 
        className={`grid ${className}`}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`
          }}
        >
          {visibleItems.map((item, localIndex) => {
            const actualIndex = startRow * columns + localIndex;
            return (
              <div key={getItemKey(item, actualIndex)}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if virtualization should be used
 */
export function useVirtualization(itemCount, threshold = 50) {
  return useMemo(() => ({
    shouldVirtualize: itemCount >= threshold,
    itemCount
  }), [itemCount, threshold]);
}

export default VirtualizedList;