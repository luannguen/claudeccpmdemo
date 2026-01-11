import React from "react";

// Hook
import { useShopCheckout } from "@/components/hooks/useShopCheckout";

// Components
import ShopCheckoutHeader from "@/components/shop/checkout/ShopCheckoutHeader";
import ShopCheckoutCustomerForm from "@/components/shop/checkout/ShopCheckoutCustomerForm";
import ShopCheckoutShippingForm from "@/components/shop/checkout/ShopCheckoutShippingForm";
import ShopCheckoutPayment from "@/components/shop/checkout/ShopCheckoutPayment";
import ShopCheckoutOrderSummary from "@/components/shop/checkout/ShopCheckoutOrderSummary";
import ShopCheckoutActions from "@/components/shop/checkout/ShopCheckoutActions";

/**
 * ShopCheckout - Trang thanh toán cho shop
 */
export default function ShopCheckout() {
  const checkout = useShopCheckout();

  // Loading state
  if (!checkout.shop) {
    return <LoadingSpinner />;
  }

  const primaryColor = checkout.shop.branding?.primary_color || '#7CB342';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <ShopCheckoutHeader
          shop={checkout.shop}
          shopSlug={checkout.shopSlug}
          existingCustomer={checkout.existingCustomer}
          primaryColor={primaryColor}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={checkout.handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <ShopCheckoutCustomerForm
                formData={checkout.formData}
                updateField={checkout.updateField}
                currentUser={checkout.currentUser}
                primaryColor={primaryColor}
              />

              {/* Shipping Info */}
              <ShopCheckoutShippingForm
                formData={checkout.formData}
                updateField={checkout.updateField}
                saveInfo={checkout.saveInfo}
                setSaveInfo={checkout.setSaveInfo}
                currentUser={checkout.currentUser}
                primaryColor={primaryColor}
              />

              {/* Payment Method */}
              <ShopCheckoutPayment
                paymentMethod={checkout.paymentMethod}
                setPaymentMethod={checkout.setPaymentMethod}
                primaryColor={primaryColor}
              />

              {/* Actions */}
              <ShopCheckoutActions
                isProcessing={checkout.isProcessing}
                cartEmpty={checkout.cart.length === 0}
                total={checkout.total}
                currentUser={checkout.currentUser}
                primaryColor={primaryColor}
              />
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <ShopCheckoutOrderSummary
              cart={checkout.cart}
              subtotal={checkout.subtotal}
              shippingFee={checkout.shippingFee}
              total={checkout.total}
              freeShipping={checkout.freeShipping}
              updateQuantity={checkout.updateQuantity}
              removeFromCart={checkout.removeFromCart}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}