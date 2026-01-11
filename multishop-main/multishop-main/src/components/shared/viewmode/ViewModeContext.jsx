/**
 * ViewMode Context
 * 
 * Quản lý trạng thái view mode (grid, list, table) cho toàn bộ ứng dụng.
 * Hỗ trợ persist state vào localStorage theo key cụ thể.
 * 
 * @example
 * // Wrap component tree
 * <ViewModeProvider storageKey="admin-orders">
 *   <OrderList />
 * </ViewModeProvider>
 * 
 * // Use in child components
 * const { viewMode, setViewMode } = useViewMode();
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ========== CONSTANTS ==========
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  COMPACT: 'compact'
};

export const DEFAULT_VIEW_MODE = VIEW_MODES.GRID;

// ========== CONTEXT ==========
const ViewModeContext = createContext(null);

// ========== PROVIDER ==========
/**
 * ViewModeProvider
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.storageKey] - Key để lưu vào localStorage (optional)
 * @param {string} [props.defaultMode] - Mode mặc định (default: 'grid')
 * @param {string[]} [props.allowedModes] - Các mode được phép (default: all)
 */
export function ViewModeProvider({ 
  children, 
  storageKey = null,
  defaultMode = DEFAULT_VIEW_MODE,
  allowedModes = Object.values(VIEW_MODES)
}) {
  // Get initial value from localStorage if storageKey provided
  const getInitialMode = () => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`viewMode_${storageKey}`);
        if (saved && allowedModes.includes(saved)) {
          return saved;
        }
      } catch (e) {
        // localStorage not available
      }
    }
    return allowedModes.includes(defaultMode) ? defaultMode : allowedModes[0];
  };

  const [viewMode, setViewModeState] = useState(getInitialMode);

  // Set view mode with optional persistence
  const setViewMode = useCallback((mode) => {
    if (!allowedModes.includes(mode)) {
      console.warn(`ViewMode "${mode}" is not allowed. Allowed modes: ${allowedModes.join(', ')}`);
      return;
    }
    
    setViewModeState(mode);
    
    if (storageKey) {
      try {
        localStorage.setItem(`viewMode_${storageKey}`, mode);
      } catch (e) {
        // localStorage not available
      }
    }
  }, [storageKey, allowedModes]);

  // Cycle through modes
  const cycleViewMode = useCallback(() => {
    const currentIndex = allowedModes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % allowedModes.length;
    setViewMode(allowedModes[nextIndex]);
  }, [viewMode, allowedModes, setViewMode]);

  // Check if a mode is active
  const isMode = useCallback((mode) => viewMode === mode, [viewMode]);

  // Memoize context value
  const value = useMemo(() => ({
    viewMode,
    setViewMode,
    cycleViewMode,
    isMode,
    allowedModes,
    isGrid: viewMode === VIEW_MODES.GRID,
    isList: viewMode === VIEW_MODES.LIST,
    isTable: viewMode === VIEW_MODES.TABLE,
    isCompact: viewMode === VIEW_MODES.COMPACT
  }), [viewMode, setViewMode, cycleViewMode, isMode, allowedModes]);

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

// ========== HOOK ==========
/**
 * useViewMode hook
 * @returns {{
 *   viewMode: string,
 *   setViewMode: (mode: string) => void,
 *   cycleViewMode: () => void,
 *   isMode: (mode: string) => boolean,
 *   allowedModes: string[],
 *   isGrid: boolean,
 *   isList: boolean,
 *   isTable: boolean,
 *   isCompact: boolean
 * }}
 */
export function useViewMode() {
  const context = useContext(ViewModeContext);
  
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  
  return context;
}

// ========== STANDALONE HOOK (không cần Provider) ==========
/**
 * useViewModeState - Hook độc lập, không cần Provider
 * Dùng khi chỉ cần local state trong 1 component
 * 
 * @param {Object} options
 * @param {string} [options.storageKey] - Key để persist
 * @param {string} [options.defaultMode] - Mode mặc định
 * @param {string[]} [options.allowedModes] - Các mode được phép
 */
export function useViewModeState({
  storageKey = null,
  defaultMode = DEFAULT_VIEW_MODE,
  allowedModes = Object.values(VIEW_MODES)
} = {}) {
  const getInitialMode = () => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`viewMode_${storageKey}`);
        if (saved && allowedModes.includes(saved)) {
          return saved;
        }
      } catch (e) {
        // Ignore
      }
    }
    return allowedModes.includes(defaultMode) ? defaultMode : allowedModes[0];
  };

  const [viewMode, setViewModeState] = useState(getInitialMode);

  const setViewMode = useCallback((mode) => {
    if (!allowedModes.includes(mode)) return;
    setViewModeState(mode);
    if (storageKey) {
      try {
        localStorage.setItem(`viewMode_${storageKey}`, mode);
      } catch (e) {
        // Ignore
      }
    }
  }, [storageKey, allowedModes]);

  const cycleViewMode = useCallback(() => {
    const currentIndex = allowedModes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % allowedModes.length;
    setViewMode(allowedModes[nextIndex]);
  }, [viewMode, allowedModes, setViewMode]);

  return useMemo(() => ({
    viewMode,
    setViewMode,
    cycleViewMode,
    isGrid: viewMode === VIEW_MODES.GRID,
    isList: viewMode === VIEW_MODES.LIST,
    isTable: viewMode === VIEW_MODES.TABLE,
    isCompact: viewMode === VIEW_MODES.COMPACT,
    allowedModes
  }), [viewMode, setViewMode, cycleViewMode, allowedModes]);
}

export default ViewModeContext;