import React from "react";
import { ShoppingCart, Clock, Mail, Send } from "lucide-react";

export default function AbandonedCartCard({ cart, onSendEmail, isSending }) {
  const lastActivity = new Date(cart.last_activity || cart.created_date);
  const hoursSince = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60));

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{cart.user_email || cart.created_by}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Bỏ quên {hoursSince} giờ trước
              </p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Sản phẩm ({cart.items?.length || 0}):</p>
            <div className="flex flex-wrap gap-2">
              {(cart.items || []).slice(0, 3).map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {item.product_name} x{item.quantity}
                </span>
              ))}
              {cart.items?.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  +{cart.items.length - 3} khác
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-[#7CB342]">
              {(cart.subtotal || 0).toLocaleString('vi-VN')}đ
            </span>
            {cart.recovery_email_sent ? (
              <span className="flex items-center gap-1 text-blue-600">
                <Mail className="w-4 h-4" />
                Đã gửi email
              </span>
            ) : (
              <span className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                Chưa gửi
              </span>
            )}
          </div>
        </div>

        {!cart.recovery_email_sent && (
          <button
            onClick={() => onSendEmail(cart)}
            disabled={isSending}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Gửi Email
          </button>
        )}
      </div>
    </div>
  );
}