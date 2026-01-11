import React from "react";
import { motion } from "framer-motion";
import { Store, ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * ShopCheckoutHeader - Header của trang checkout
 */
export default function ShopCheckoutHeader({ shop, shopSlug, existingCustomer, primaryColor }) {
  return (
    <div className="mb-8">
      <Link 
        to={createPageUrl(`ShopPublicStorefront?shop=${shopSlug}`)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại shop
      </Link>
      
      <div className="flex items-center gap-3">
        <Store className="w-8 h-8" style={{ color: primaryColor }} />
        <div>
          <h1 className="text-3xl font-serif font-bold">Thanh Toán</h1>
          <p className="text-gray-600">{shop.organization_name}</p>
        </div>
      </div>

      {/* Auto-fill notification */}
      {existingCustomer && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
        >
          <Save className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-green-900">
              ✅ Thông tin đã được điền tự động
            </p>
            <p className="text-sm text-green-700">
              Chúng tôi đã điền sẵn thông tin từ đơn hàng trước của bạn. Bạn có thể chỉnh sửa nếu cần.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}