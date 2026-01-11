import React from "react";
import EnhancedModal from "../EnhancedModal";
import PaymentRefundModal from "../admin/PaymentRefundModal";
import OrderChatBox from "../communication/OrderChatBox";

// Hooks
import {
  useOrderDetailsState,
  useOrderDetailsActions,
  useOrderPermissions
} from "@/components/hooks/useOrderDetails";

// UI Components
import OrderDetailsTabs from "./orderdetails/OrderDetailsTabs";
import OrderDetailsCustomerCard from "./orderdetails/OrderDetailsCustomerCard";
import OrderDetailsProductsTable from "./orderdetails/OrderDetailsProductsTable";
import OrderDetailsUpdateForm from "./orderdetails/OrderDetailsUpdateForm";
import OrderDetailsActions from "./orderdetails/OrderDetailsActions";

/**
 * OrderDetailsModalEnhanced - Modal chi tiết đơn hàng (Admin)
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - order: object
 * - onUpdateStatus: function
 * - onPrint: function (optional)
 */
export default function OrderDetailsModalEnhanced({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus, 
  onPrint 
}) {
  // Hooks
  const state = useOrderDetailsState(order);
  const actions = useOrderDetailsActions(order, state, onUpdateStatus, onClose, onPrint);
  const { canRefund } = useOrderPermissions(order);

  if (!order) return null;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Đơn Hàng"
      maxWidth="4xl"
      persistPosition={true}
      positionKey="order-details-modal"
    >
      {/* Tabs */}
      <OrderDetailsTabs 
        activeTab={state.activeTab} 
        setActiveTab={state.setActiveTab} 
      />

      {/* Tab Content */}
      {state.activeTab === 'chat' ? (
        <ChatTabContent order={order} />
      ) : (
        <DetailsTabContent
          order={order}
          state={state}
          actions={actions}
          canRefund={canRefund}
          onClose={onClose}
          onPrint={onPrint}
        />
      )}
        
      {/* Refund Modal */}
      {state.showRefundModal && (
        <PaymentRefundModal
          isOpen={state.showRefundModal}
          onClose={actions.closeRefundModal}
          order={order}
        />
      )}
    </EnhancedModal>
  );
}

// ========== TAB CONTENT COMPONENTS ==========

function ChatTabContent({ order }) {
  return (
    <div className="h-[600px]">
      <OrderChatBox order={order} isAdmin={true} />
    </div>
  );
}

function DetailsTabContent({ order, state, actions, canRefund, onClose, onPrint }) {
  return (
    <div className="p-6 space-y-6">
      {/* Customer Info */}
      <OrderDetailsCustomerCard order={order} />

      {/* Products Table */}
      <OrderDetailsProductsTable 
        items={order.items} 
        totalAmount={order.total_amount} 
      />

      {/* Update Form */}
      <OrderDetailsUpdateForm
        newStatus={state.newStatus}
        setNewStatus={state.setNewStatus}
        internalNote={state.internalNote}
        setInternalNote={state.setInternalNote}
      />

      {/* Action Buttons */}
      <OrderDetailsActions
        onClose={onClose}
        onPrint={onPrint ? actions.handlePrint : null}
        onRefund={actions.openRefundModal}
        onUpdate={actions.handleUpdateStatus}
        canRefund={canRefund}
      />
    </div>
  );
}