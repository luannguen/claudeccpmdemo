import React from 'react';

export default function OrderProductsTable({ items = [] }) {
  return (
    <div>
      <h4 className="font-bold mb-3 text-sm sm:text-base">Sản Phẩm</h4>
      
      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        {items.map((item, idx) => (
          <MobileProductItem key={idx} item={item} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-600">Sản phẩm</th>
              <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-600">SL</th>
              <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-600">Đơn giá</th>
              <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-600">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <DesktopProductRow key={idx} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileProductItem({ item }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-sm flex-1">{item.product_name}</p>
        <p className="font-bold text-[#7CB342] text-sm">
          {(item.subtotal || 0).toLocaleString('vi-VN')}đ
        </p>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>SL: {item.quantity}</span>
        <span>{(item.unit_price || 0).toLocaleString('vi-VN')}đ/sp</span>
      </div>
    </div>
  );
}

function DesktopProductRow({ item }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="p-3 sm:p-4 text-xs sm:text-sm">{item.product_name}</td>
      <td className="p-3 sm:p-4 text-center text-xs sm:text-sm">{item.quantity}</td>
      <td className="p-3 sm:p-4 text-right text-xs sm:text-sm">
        {(item.unit_price || 0).toLocaleString('vi-VN')}đ
      </td>
      <td className="p-3 sm:p-4 text-right font-medium text-xs sm:text-sm">
        {(item.subtotal || 0).toLocaleString('vi-VN')}đ
      </td>
    </tr>
  );
}