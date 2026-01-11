/**
 * View Mode Registry
 * 
 * Registry for view mode system components and patterns.
 */

// ========== VIEW MODE CONSTANTS ==========
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  COMPACT: 'compact'
};

// ========== LAYOUT PRESETS ==========
export const LAYOUT_PRESETS = {
  grid: {
    wrapper: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    item: ''
  },
  list: {
    wrapper: 'flex flex-col gap-3',
    item: ''
  },
  table: {
    wrapper: 'overflow-x-auto',
    item: ''
  },
  compact: {
    wrapper: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2',
    item: ''
  }
};

// ========== COMPONENT REGISTRY ==========
export const viewModeRegistry = {
  // Context & Providers
  ViewModeProvider: {
    path: '@/components/shared/viewmode',
    description: 'Context provider for view mode state'
  },
  
  // Hooks
  useViewMode: {
    path: '@/components/shared/viewmode',
    description: 'Hook to access view mode from context'
  },
  useViewModeState: {
    path: '@/components/shared/viewmode',
    description: 'Standalone hook without provider'
  },
  
  // UI Components
  ViewModeSwitcher: {
    path: '@/components/shared/viewmode/ViewModeSwitcher',
    description: 'Toggle buttons for switching view modes'
  },
  DataViewRenderer: {
    path: '@/components/shared/viewmode/DataViewRenderer',
    description: 'Main component to render data by view mode'
  },
  
  // Prop Normalization Guide
  propNormalization: {
    tableMode: {
      props: ['data', 'items', 'orders', 'customers', 'products', 'members'],
      note: 'Component can receive any of these + ...itemProps'
    },
    itemModes: {
      props: ['item', 'data', 'order', 'customer', 'product', 'member', 'index'],
      note: 'Component can receive any of these + ...itemProps'
    },
    bestPractice: [
      "Use 'data' for TABLE mode",
      "Use 'item' for ITEM modes (grid/list/compact)",
      "Add fallback: const items = data || items || []"
    ]
  }
};

/**
 * Get view mode component info
 */
export function getViewModeComponent(name) {
  return viewModeRegistry[name] || null;
}

/**
 * Get layout preset for a view mode
 */
export function getLayoutPreset(mode) {
  return LAYOUT_PRESETS[mode] || LAYOUT_PRESETS.grid;
}