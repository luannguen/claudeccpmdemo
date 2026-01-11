import React from 'react';
import { Package } from 'lucide-react';
import EnhancedModal from '../EnhancedModal';
import CancelOrderModalEnhanced from './CancelOrderModalEnhanced';
import MessageCenter from '../communication/MessageCenter';
import OrderChatBox from '../communication/OrderChatBox';

// Hooks
import {
  useOrderDetailState,
  useOrderDetailUser,
  useOrderStatus,
  useCancelOrderMutation
} from '@/components/hooks/useOrderDetail';

// UI Components
import OrderTabs from './order/OrderTabs';
import OrderStatusBadge from './order/OrderStatusBadge';
import OrderCustomerInfo from './order/OrderCustomerInfo';
import OrderProductsTable from './order/OrderProductsTable';
import OrderSummaryCard from './order/OrderSummaryCard';
import { OrderNote, OrderCancelNote } from './order/OrderNotes';

/**
 * OrderDetailModalEnhanced - Modal chi tiết đơn hàng
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - order: object
 */
export default function OrderDetailModalEnhanced({ isOpen, onClose, order }) {
  // Hooks
  const state = useOrderDetailState();
  const { data: currentUser } = useOrderDetailUser();
  const { status, canCancel } = useOrderStatus(order);
  const cancelMutation = useCancelOrderMutation(order, onClose);

  if (!order) return null;

  return (
    <>
      <EnhancedModal
        isOpen={isOpen}
        onClose={onClose}
        title="Chi Tiết Đơn Hàng"
        subtitle={`#${order.order_number || order.id?.slice(-8)}`}
        icon={Package}
        maxWidth="3xl"
        persistPosition={false}
        positionKey="order-detail-modal"
        mobileFixed={true}
        enableDrag={false}
      >
        {/* Tabs */}
        <OrderTabs 
          activeTab={state.activeTab} 
          setActiveTab={state.setActiveTab} 
        />

        {/* Tab Content */}
        {state.activeTab === 'chat' ? (
          <ChatTabContent order={order} />
        ) : (
          <DetailsTabContent
            order={order}
            status={status}
            canCancel={canCancel}
            onCancelClick={() => state.setShowCancelModal(true)}
          />
        )}
      </EnhancedModal>

      {/* Cancel Modal */}
      <CancelOrderModalEnhanced
        isOpen={state.showCancelModal}
        onClose={() => state.setShowCancelModal(false)}
        order={order}
        onConfirm={(reason) => cancelMutation.mutate(reason)}
      />

      {/* Message Center */}
      {currentUser && (
        <MessageCenter
          isOpen={state.showMessageCenter}
          onClose={() => state.setShowMessageCenter(false)}
          orderId={order?.id}
          currentUser={currentUser}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
}

// ========== TAB CONTENT COMPONENTS ==========

function ChatTabContent({ order }) {
  return (
    <div className="h-[500px] sm:h-[600px]">
      <OrderChatBox order={order} isAdmin={false} />
    </div>
  );
}

function DetailsTabContent({ order, status, canCancel, onCancelClick }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Status */}
      <OrderStatusBadge
        status={status}
        order={order}
        canCancel={canCancel}
        onCancelClick={onCancelClick}
      />

      {/* Shop Info */}
      {order.shop_name && <ShopInfoCard shopName={order.shop_name} />}

      {/* Customer & Shipping */}
      <OrderCustomerInfo order={order} />

      {/* Products */}
      <OrderProductsTable items={order.items} />

      {/* Summary */}
      <OrderSummaryCard order={order} />

      {/* Notes */}
      <OrderNote note={order.note} />
      <OrderCancelNote note={order.internal_note} orderStatus={order.order_status} />
    </div>
  );
}

function ShopInfoCard({ shopName }) {
  return (
    <div className="bg-purple-50 rounded-2xl p-4">
      <p className="text-sm text-gray-600 mb-1">Bán bởi</p>
      <p className="font-bold text-purple-900">{shopName}</p>
    </div>
  );
}