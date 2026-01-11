
/**
 * UI Domain Use Cases (View Mode, etc.)
 */

export const uiUseCases = [
  // ========== BOTTOM NAVIGATION ==========
  {
    id: 'ui.bottomNav.contextAware',
    domain: 'ui',
    description: 'Context-aware bottom navigation cho mobile - items thay đổi theo trang',
    input: 'currentPageName: string',
    output: '{ navItems, handleItemAction, isItemActive, getBadgeCount }',
    hook: 'useBottomNav',
    component: 'BottomNavBar',
    location: 'components/bottomnav/',
    notes: '2 items cố định (Sản phẩm, Giỏ hàng) + 3 items động theo context'
  },
  {
    id: 'ui.bottomNav.events',
    domain: 'ui',
    description: 'Bottom Nav dispatch CustomEvent - các trang cần listen và handle',
    input: 'event name from bottomNavConfig.js',
    output: 'void',
    events: [
      'toggle-filters (Services)',
      'open-create-post-modal (Community)',
      'open-map (Contact)',
      'track-order, open-review-modal (MyOrders)',
      'open-chatbot (multiple pages)',
      'open-cart-widget, open-wishlist-modal (global)'
    ],
    notes: 'Mỗi trang cần useEffect để addEventListener cho events liên quan'
  },
  {
    id: 'viewmode.state',
    domain: 'ui',
    description: 'Quản lý trạng thái view mode (grid/list/table) với persistence',
    input: '{ storageKey, defaultMode, allowedModes }',
    output: '{ viewMode, setViewMode, cycleViewMode, isGrid, isList, isTable }',
    hook: 'useViewModeState',
    component: 'DataViewRenderer, ViewModeSwitcher'
  },
  {
    id: 'viewmode.render',
    domain: 'ui',
    description: 'Render dữ liệu theo view mode với component mapping',
    input: '{ data, viewMode, components, itemProps }',
    output: 'React.ReactNode',
    hook: null,
    component: 'DataViewRenderer'
  }
];
