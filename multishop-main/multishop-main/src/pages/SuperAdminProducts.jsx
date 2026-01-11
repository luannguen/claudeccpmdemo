
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, Edit, Trash2, Eye, EyeOff,
  Upload, X, Save, TrendingUp, Store, Crown
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function ProductFormModal({ product, onClose, onSubmit }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: 'vegetables',
    price: '',
    min_price: '',
    unit: 'kg',
    description: '',
    short_description: '',
    image_url: '',
    commission_rate: 3,
    is_fixed_price: false,
    status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold">{product ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Danh mục *</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]">
                <option value="vegetables">Rau Củ</option>
                <option value="fruits">Trái Cây</option>
                <option value="rice">Gạo & Ngũ Cốc</option>
                <option value="processed">Chế Biến</option>
                <option value="combo">Combo</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Giá platform *</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Giá tối thiểu</label>
              <input type="number" value={formData.min_price} onChange={(e) => setFormData({...formData, min_price: Number(e.target.value)})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Đơn vị *</label>
              <input type="text" required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" placeholder="kg, gói..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
            <input type="text" value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả chi tiết</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL ảnh</label>
            <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" placeholder="https://..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Commission rate (%)</label>
              <input type="number" step="0.5" value={formData.commission_rate} onChange={(e) => setFormData({...formData, commission_rate: Number(e.target.value)})} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" />
            </div>
            <div className="flex items-center gap-4 pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_fixed_price} onChange={(e) => setFormData({...formData, is_fixed_price: e.target.checked})} className="w-5 h-5" />
                <span className="text-sm font-medium">Giá cố định</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]">
              {product ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SuperAdminProductsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['super-admin-products'],
    queryFn: async () => {
      const result = await base44.entities.Product.list('-created_date', 500);
      return result.filter(p => p.is_platform_product !== false);
    },
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['super-admin-shop-listings'],
    queryFn: () => base44.entities.ShopProduct.list('-created_date', 500),
    staleTime: 5 * 1000, // 5 seconds
    refetchOnMount: 'always'
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-products']);
      setShowModal(false);
      setEditingProduct(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-products']);
      setShowModal(false);
      setEditingProduct(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Product.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-products']);
    }
  });

  const handleSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate({
        ...data,
        tenant_id: null, // Platform products do not belong to a specific tenant
        is_platform_product: true,
        created_by_admin: true,
        approval_status: 'approved',
        stock_quantity: 1000, // Default stock for platform products
        total_sold: 0,
        total_listed_by_shops: 0,
        rating_average: 5,
        rating_count: 0,
        featured: false,
        status: 'active'
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleToggleStatus = (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id: product.id, status: newStatus });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Product stats
  const getProductStats = (productId) => {
    const listings = shopProducts.filter(sp => sp.platform_product_id === productId);
    return {
      listedBy: listings.length,
      totalSold: listings.reduce((sum, sp) => sum + (sp.total_sold || 0), 0)
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-600" />
              Platform Products
            </h1>
            <p className="text-gray-600">Quản lý catalog sản phẩm cho tất cả shops</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Sản Phẩm
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{products.length}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Shop Listings</p>
            <p className="text-3xl font-bold text-blue-600">{shopProducts.length}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Total Sold</p>
            <p className="text-3xl font-bold text-purple-600">
              {products.reduce((sum, p) => sum + (p.total_sold || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="vegetables">Rau Củ</option>
            <option value="fruits">Trái Cây</option>
            <option value="rice">Gạo & Ngũ Cốc</option>
            <option value="processed">Chế Biến</option>
            <option value="combo">Combo</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stats = getProductStats(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gray-100">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.short_description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Giá:</span>
                      <span className="font-bold text-[#7CB342]">
                        {product.price?.toLocaleString('vi-VN')}đ/{product.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Commission:</span>
                      <span className="font-medium text-blue-600">{product.commission_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        Listed by:
                      </span>
                      <span className="font-medium text-purple-600">{stats.listedBy} shops</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Total sold:</span>
                      <span className="font-medium">{stats.totalSold}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                        product.status === 'active'
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {product.status === 'active' ? (
                        <><EyeOff className="w-4 h-4" />Ẩn</>
                      ) : (
                        <><Eye className="w-4 h-4" />Hiện</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có sản phẩm</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default function SuperAdminProducts() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminProductsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
