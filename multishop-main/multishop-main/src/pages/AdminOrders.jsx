import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import OrderDetailsModalEnhanced from "@/components/modals/OrderDetailsModalEnhanced";
import BulkOrderActions from "@/components/admin/BulkOrderActions";
import OrderPrintTemplate from "@/components/admin/OrderPrintTemplate";
import OrderChatWidget from "@/components/communication/OrderChatWidget";

// Hooks
import {
  useAdminOrders,
  useDebouncedSearch,
  useOrderStats,
  useFilteredOrders,
  useOrderUpdateMutation,
  useOrderSelection
} from "@/components/hooks/useAdminOrders";

// ViewMode System
import {
  useViewModeState,
  DataViewRenderer,
  VIEW_MODES
} from "@/components/shared/viewmode";

// Components
import OrdersHeader from "@/components/admin/orders/OrdersHeader";
import OrdersStats from "@/components/admin/orders/OrdersStats";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrderGridCard from "@/components/admin/orders/OrderGridCard";
import OrderListItem from "@/components/admin/orders/OrderListItem";
import OrderTableView from "@/components/admin/orders/OrderTableView";

const AdminOrdersContent = React.memo(function AdminOrdersContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [preorderFilter, setPreorderFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // ViewMode hook (standalone, persisted)
  const { viewMode, setViewMode } = useViewModeState({
    storageKey: 'admin-orders',
    defaultMode: VIEW_MODES.TABLE,
    allowedModes: [VIEW_MODES.GRID, VIEW_MODES.LIST, VIEW_MODES.TABLE]
  });
  
  // UI states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayCount, setDisplayCount] = useState(50);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printOrders, setPrintOrders] = useState([]);
  const [chatOrder, setChatOrder] = useState(null);

  const printRef = useRef();
  const loadMoreRef = useRef();

  // Data hooks
  const debouncedSearch = useDebouncedSearch(searchTerm);
  const { data: orders = [], isLoading } = useAdminOrders();
  
  // Auto-open order detail modal if orderId is in URL params (from notification click)
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrder) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        // Clear the URL param after opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, orders, selectedOrder, setSearchParams]);
  const stats = useOrderStats(orders);
  
  const filteredOrders = useFilteredOrders(orders, {
    debouncedSearch,
    statusFilter,
    sourceFilter,
    preorderFilter,
    dateRange,
    customStartDate,
    customEndDate
  });

  const displayedOrders = useMemo(() => {
    return filteredOrders.slice(0, displayCount);
  }, [filteredOrders, displayCount]);

  const hasMore = displayCount < filteredOrders.length;

  // Selection
  const { selectedOrders, toggleOrderSelection, toggleSelectAll, clearSelection } = useOrderSelection(displayedOrders);

  // Mutations
  const updateMutation = useOrderUpdateMutation(orders, () => setSelectedOrder(null));

  const handleUpdateStatus = useCallback(async (orderId, updates) => {
    await updateMutation.mutateAsync({ orderId, updates });
  }, [updateMutation]);

  // Infinite scroll
  React.useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 50, filteredOrders.length));
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredOrders.length]);

  // Print handlers
  const handlePrint = useCallback(() => {
    window.print();
    setTimeout(() => {
      setShowPrintPreview(false);
      setPrintOrders([]);
    }, 500);
  }, []);

  const handlePrintSingle = useCallback((order) => {
    setPrintOrders([order]);
    setShowPrintPreview(true);
    setTimeout(() => handlePrint(), 100);
  }, [handlePrint]);

  const handlePrintBulk = useCallback((orderIds) => {
    const ordersToPrint = orders.filter(o => orderIds.includes(o.id));
    setPrintOrders(ordersToPrint);
    setShowPrintPreview(true);
    setTimeout(() => handlePrint(), 100);
  }, [orders, handlePrint]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setSourceFilter('all');
    setPreorderFilter('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || preorderFilter !== 'all' || dateRange !== 'all';

  return (
    <div>
      <div className="mb-6">
        <OrdersHeader
          filteredCount={filteredOrders.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <OrdersStats stats={stats} />

        <OrdersFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          preorderFilter={preorderFilter}
          setPreorderFilter={setPreorderFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <DataViewRenderer
        data={displayedOrders}
        viewMode={viewMode}
        isLoading={isLoading}
        components={useMemo(() => ({
          [VIEW_MODES.GRID]: {
            item: OrderGridCard,
            wrapper: 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          },
          [VIEW_MODES.LIST]: {
            item: OrderListItem,
            wrapper: 'space-y-3'
          },
          [VIEW_MODES.TABLE]: {
            component: OrderTableView
          }
        }), [])}
        itemProps={useMemo(() => ({
          onSelect: toggleOrderSelection,
          selectedOrders,
          onView: setSelectedOrder,
          toggleSelectAll,
          onPrint: handlePrintSingle
        }), [toggleOrderSelection, selectedOrders, setSelectedOrder, toggleSelectAll, handlePrintSingle])}
        loadingState={
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        }
        keyExtractor={(order) => order.id}
      />

      {hasMore && !isLoading && (
        <div ref={loadMoreRef} className="text-center py-8">
          <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Đang tải thêm...</p>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModalEnhanced
          isOpen={!!selectedOrder}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onPrint={() => handlePrintSingle(selectedOrder)}
        />
      )}

      <BulkOrderActions
        selectedOrders={selectedOrders}
        onClearSelection={clearSelection}
        onPrintBulk={handlePrintBulk}
      />

      {showPrintPreview && (
        <div className="print-only">
          <div ref={printRef}>
            {printOrders.map((order, idx) => (
              <div key={order.id} className={idx > 0 ? 'page-break' : ''}>
                <OrderPrintTemplate order={order} />
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderChatWidget
        order={chatOrder}
        onClose={() => setChatOrder(null)}
      />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
          .page-break { page-break-before: always; }
        }
        @media screen { .print-only { display: none; } }
      `}</style>
    </div>
  );
});

export default function AdminOrders() {
  return (
    <AdminGuard requiredModule="orders" requiredPermission="orders.view">
      <AdminLayout>
        <AdminOrdersContent />
      </AdminLayout>
    </AdminGuard>
  );
}