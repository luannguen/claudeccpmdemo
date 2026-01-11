/**
 * SendGiftModal - Multi-step wizard for sending gifts
 * Steps: 1.Product → 2.Options → 3.Payment → 4.Success
 * 
 * Module: features/gift/ui
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import EnhancedModal from '@/components/EnhancedModal';
import { useGiftSend } from '../hooks/useGiftSend';
import ProductSelectionStep from './steps/ProductSelectionStep';
import GiftOptionsStep from './steps/GiftOptionsStep';
import PaymentStep from './steps/PaymentStep';
import SuccessStep from './steps/SuccessStep';

const STEPS = [
  { id: 1, label: 'Chọn quà', icon: 'Gift' },
  { id: 2, label: 'Tùy chọn', icon: 'Settings' },
  { id: 3, label: 'Thanh toán', icon: 'CreditCard' },
  { id: 4, label: 'Hoàn tất', icon: 'CheckCircle' }
];

export default function SendGiftModal({ isOpen, onClose, connection, onSent }) {
  const {
    step,
    setStep,
    selectedProduct,
    setSelectedProduct,
    giftOptions,
    setGiftOptions,
    processSend,
    isProcessing
  } = useGiftSend(connection);

  const [paymentResult, setPaymentResult] = useState(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedProduct(null);
      setPaymentResult(null);
    }
  }, [isOpen]);

  // Handle payment success
  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      const result = await processSend(null, paymentMethod);
      setPaymentResult(result);
      setStep(4);
      onSent?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ProductSelectionStep
            selectedProduct={selectedProduct}
            onSelect={setSelectedProduct}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <GiftOptionsStep
            options={giftOptions}
            onChange={setGiftOptions}
            receiver={connection}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <PaymentStep
            product={selectedProduct}
            options={giftOptions}
            receiver={connection}
            onBack={() => setStep(2)}
            onSuccess={handlePaymentSuccess}
            isProcessing={isProcessing}
          />
        );
      case 4:
        return (
          <SuccessStep
            result={paymentResult}
            receiver={connection}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={() => onClose?.()}
      title={step === 4 ? '🎉 Gửi quà thành công!' : `Gửi quà cho ${connection?.target_name || ''}`}
      maxWidth="lg"
      showControls={step < 4}
      enableDrag={false}
      positionKey="send-gift-wizard"
    >
      <div className="flex flex-col min-h-[500px]">
        {/* Step Indicator */}
        {step < 4 && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {STEPS.slice(0, 3).map((s, idx) => {
                const StepIcon = Icon[s.icon];
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-[#7CB342] text-white' :
                        isActive ? 'bg-[#7CB342]/20 text-[#7CB342] ring-2 ring-[#7CB342]' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Icon.Check size={20} />
                        ) : StepIcon ? (
                          <StepIcon size={20} />
                        ) : null}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        isActive || isCompleted ? 'text-[#7CB342]' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        step > s.id ? 'bg-[#7CB342]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>
      </div>
    </EnhancedModal>
  );
}