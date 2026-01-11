import React, { useMemo, useEffect, useCallback, useState } from "react";

// Hooks
import {
  useCurrentUser,
  useMyOrdersList,
  useFilteredOrders,
  useOrderStats,
  useOrderFilters,
  useOrderModals
} from "@/components/hooks/useMyOrders";

// ViewMode System
import {
  useViewModeState,
  DataViewRenderer,
  VIEW_MODES,
  LAYOUT_PRESETS
} from "@/components/shared/viewmode";

// Components
import MyOrdersHeader from "@/components/myorders/MyOrdersHeader";
import MyOrdersStats from "@/components/myorders/MyOrdersStats";
import MyOrdersFilters from "@/components/myorders/MyOrdersFilters";
import OrderGridCard from "@/components/myorders/OrderGridCard";
import OrderListItem from "@/components/myorders/OrderListItem";
import OrderTableView from "@/components/myorders/OrderTableView";
import MyOrdersEmptyState from "@/components/myorders/MyOrdersEmptyState";
import MyOrdersLoadingState from "@/components/myorders/MyOrdersLoadingState";

// Modals
import ReturnPolicyModal from "@/components/returns/ReturnPolicyModal";
import EligibleOrderSelector from "@/components/returns/EligibleOrderSelector";
import CustomerReturnModal from "@/components/returns/CustomerReturnModal";
import OrderDetailModalEnhanced from "@/components/modals/OrderDetailModalEnhanced";

export default function MyOrders() {
  // Data hooks
  const { data: user } = useCurrentUser();
  const { data: orders = [], isLoading } = useMyOrdersList(user?.email);
  
  // ViewMode hook (standalone, persisted)
  const { viewMode, setViewMode } = useViewModeState({
    storageKey: 'my-orders',
    defaultMode: VIEW_MODES.GRID,
    allowedModes: [VIEW_MODES.GRID, VIEW_MODES.LIST, VIEW_MODES.TABLE]
  });
  
  // UI hooks
  const {
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    searchTerm, setSearchTerm,
    clearFilters
  } = useOrderFilters();
  
  const {
    selectedOrder, setSelectedOrder,
    showReturnPolicy, showOrderSelector, showReturnModal,
    orderToReturn,
    handleReturnClick, handlePolicyAgree, handleOrderSelected,
    closeReturnPolicy, closeReturnModal,
    setShowOrderSelector
  } = useOrderModals();
  
  // Derived data
  const filteredOrders = useFilteredOrders(orders, statusFilter, dateRange, searchTerm);
  const stats = useOrderStats(orders);
  
  const hasFilters = searchTerm || dateRange !== 'all' || statusFilter !== 'all';

  // ✅ Bottom Nav Events - track-order, open-review-modal
  const handleTrackOrder = useCallback(() => {
    // Filter to show only shipping orders
    setStatusFilter('shipping');
  }, [setStatusFilter]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const handleOpenReviewModal = useCallback(() => {
    // Filter to show delivered orders (can review)
    setStatusFilter('delivered');
  }, [setStatusFilter]);

  useEffect(() => {
    window.addEventListener('track-order', handleTrackOrder);
    window.addEventListener('open-review-modal', handleOpenReviewModal);
    return () => {
      window.removeEventListener('track-order', handleTrackOrder);
      window.removeEventListener('open-review-modal', handleOpenReviewModal);
    };
  }, [handleTrackOrder, handleOpenReviewModal]);

  // Component mapping for DataViewRenderer
  const viewComponents = useMemo(() => ({
    [VIEW_MODES.GRID]: {
      item: OrderGridCard,
      wrapper: LAYOUT_PRESETS.orderGrid
    },
    [VIEW_MODES.LIST]: {
      item: OrderListItem,
      wrapper: LAYOUT_PRESETS.orderList
    },
    [VIEW_MODES.TABLE]: {
      component: OrderTableView
    }
  }), []);

  // Common props for all item components
  const itemProps = useMemo(() => ({
    onView: setSelectedOrder,
    onReturn: handleReturnClick
  }), [setSelectedOrder, handleReturnClick]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="mb-6">
          <MyOrdersHeader viewMode={viewMode} setViewMode={setViewMode} />
          <MyOrdersStats stats={stats} />
          <MyOrdersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            orders={orders}
            filteredOrders={filteredOrders}
            clearFilters={clearFilters}
          />
        </div>

        <DataViewRenderer
          data={filteredOrders}
          viewMode={viewMode}
          isLoading={isLoading}
          components={viewComponents}
          itemProps={itemProps}
          loadingState={<MyOrdersLoadingState />}
          emptyState={<MyOrdersEmptyState hasFilters={hasFilters} />}
          hasFilters={hasFilters}
          keyExtractor={(order) => order.id}
        />
      </div>

      {/* Modals */}
      <OrderDetailModalEnhanced
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <ReturnPolicyModal
        isOpen={showReturnPolicy}
        onClose={closeReturnPolicy}
        onAgree={handlePolicyAgree}
      />

      <EligibleOrderSelector
        isOpen={showOrderSelector}
        onClose={() => setShowOrderSelector(false)}
        orders={orders}
        onSelectOrder={handleOrderSelected}
      />

      {showReturnModal && orderToReturn && (
        <CustomerReturnModal
          isOpen={showReturnModal}
          onClose={closeReturnModal}
          order={orderToReturn}
        />
      )}
    </div>
  );
}