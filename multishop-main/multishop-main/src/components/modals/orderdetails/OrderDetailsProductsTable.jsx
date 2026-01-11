import React from "react";

/**
 * OrderDetailsProductsTable - Bảng sản phẩm (cho admin)
 * 
 * Props:
 * - items: array
 * - totalAmount: number
 */
export default function OrderDetailsProductsTable({ items = [], totalAmount = 0 }) {
  return (
    <div>
      <h3 className="font-bold mb-4">Sản Phẩm</h3>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Sản phẩm</th>
              <th className="text-center p-4 text-sm font-medium">SL</th>
              <th className="text-right p-4 text-sm font-medium">Đơn giá</th>
              <th className="text-right p-4 text-sm font-medium">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <ProductRow key={index} item={item} />
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2">
            <tr>
              <td colSpan="3" className="p-4 text-right font-bold text-lg">TỔNG:</td>
              <td className="p-4 text-right font-bold text-lg text-[#7CB342]">
                {totalAmount.toLocaleString('vi-VN')}đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ item }) {
  return (
    <tr className="border-t">
      <td className="p-4">{item.product_name}</td>
      <td className="p-4 text-center">{item.quantity}</td>
      <td className="p-4 text-right">{(item.unit_price || 0).toLocaleString('vi-VN')}đ</td>
      <td className="p-4 text-right">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
    </tr>
  );
}