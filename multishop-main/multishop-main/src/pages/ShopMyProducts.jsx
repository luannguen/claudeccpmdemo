import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Search, Edit, Trash2, Eye, EyeOff,
  Plus, Store, CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ShopLayout from "@/components/ShopLayout";
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function EditPriceModal({ shopProduct, onClose, onSubmit }) {
  const [newPrice, setNewPrice] = useState(shopProduct.shop_price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(shopProduct.id, { shop_price: newPrice });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-serif font-bold text-[#0F0F0F] mb-4">
          Chỉnh Sửa Giá
        </h2>
        <p className="text-gray-600 mb-6">{shopProduct.platform_product_name}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá Bán Mới
            </label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(parseFloat(e.target.value))}
              step="1000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]"
            >
              Lưu
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const ShopMyProductsContent = React.memo(function ShopMyProductsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);

  const queryClient = useQueryClient();
  const { tenant, tenantId } = useTenantAccess();

  const { data: shopProducts = [], isLoading } = useQuery({
    queryKey: ['my-shop-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 500);
      return products.filter(sp => sp.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopProduct.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-shop-products']);
      setEditingProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShopProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-shop-products']);
    }
  });

  const handleToggleActive = (product) => {
    updateMutation.mutate({
      id: product.id,
      data: { is_active: !product.is_active }
    });
  };

  const handleUpdatePrice = (id, data) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = (product) => {
    if (confirm(`Xóa sản phẩm "${product.platform_product_name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const filteredProducts = shopProducts.filter(product => {
    const matchesSearch = product.platform_product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_active && product.status === 'active') ||
      (statusFilter === "pending" && product.status === 'pending_approval') ||
      (statusFilter === "inactive" && !product.is_active);
    return matchesSearch && matchesStatus;
  });

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600">Không tìm thấy thông tin shop</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">Sản Phẩm Của Tôi</h1>
            <p className="text-gray-600">Quản lý sản phẩm đang bán trên shop của bạn</p>
          </div>

          <div className="flex gap-4">
            {tenant && (
              <a
                href={createPageUrl(`ShopPublicStorefront?shop=${tenant.slug}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Store className="w-5 h-5" />
                Xem Storefront
              </a>
            )}
            <Link
              to={createPageUrl(`ShopProductCatalog?tenant=${tenantId}`)}
              className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm Sản Phẩm
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-gray-500 mb-2">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{shopProducts.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-gray-500 mb-2">Đang Hoạt Động</p>
            <p className="text-3xl font-bold text-green-600">
              {shopProducts.filter(sp => sp.is_active && sp.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-gray-500 mb-2">Chờ Duyệt</p>
            <p className="text-3xl font-bold text-orange-600">
              {shopProducts.filter(sp => sp.status === 'pending_approval').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-gray-500 mb-2">Tổng Đã Bán</p>
            <p className="text-3xl font-bold text-blue-600">
              {shopProducts.reduce((sum, sp) => sum + (sp.total_sold || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="pending">Chờ duyệt</option>
            <option value="inactive">Tạm dừng</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Sản phẩm</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Giá bán</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Đã bán</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Doanh thu</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{product.platform_product_name}</p>
                          <p className="text-sm text-gray-500">Commission: {product.commission_rate || 3}%</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-[#7CB342]">
                        {product.shop_price.toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium">{product.total_sold || 0}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-blue-600">
                        {(product.total_revenue || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'pending_approval' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status === 'active' ? 'Đã duyệt' :
                           product.status === 'pending_approval' ? 'Chờ duyệt' :
                           'Từ chối'}
                        </span>
                        {product.is_active ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đang bán
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Tạm dừng</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="Sửa giá"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`p-2 rounded-lg ${product.is_active ? 'text-gray-600 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={product.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có sản phẩm nào</p>
              <Link
                to={createPageUrl(`ShopProductCatalog?tenant=${tenantId}`)}
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#FF9800] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm Sản Phẩm
              </Link>
            </div>
          )}
        </div>
      )}

      {editingProduct && (
        <EditPriceModal
          shopProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleUpdatePrice}
        />
      )}
    </div>
  );
});

export default function ShopMyProducts() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopMyProductsContent />
      </ShopLayout>
    </TenantGuard>
  );
}