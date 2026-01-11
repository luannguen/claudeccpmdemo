import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const formatCurrency = (amount) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export default function ShopProductsTable({ products = [], isLoading }) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Sản Phẩm ({products.length})
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#7CB342]"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có sản phẩm nào</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(product.price)}</p>
                    {product.compare_price && (
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(product.compare_price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium text-sm ${
                      product.stock_quantity <= 0 ? 'text-red-600' :
                      product.stock_quantity < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock_quantity ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}