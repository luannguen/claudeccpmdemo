import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function CheckoutStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
            s === currentStep ? 'bg-[#7CB342] text-white scale-105 sm:scale-110 shadow-lg' :
            s < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {s < currentStep ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
        </div>
      ))}
    </div>
  );
}