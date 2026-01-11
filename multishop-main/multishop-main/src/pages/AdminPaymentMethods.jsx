import React from "react";
import { Plus, CreditCard } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import PaymentMethodFormModal from "@/components/admin/PaymentMethodFormModal";

// Hooks
import {
  usePaymentMethods,
  usePaymentMethodStats,
  usePaymentMethodMutations,
  usePaymentMethodsState,
  savePaymentMethod,
  toggleMethodActive,
  setMethodAsDefault,
  deletePaymentMethod
} from "@/components/hooks/useAdminPaymentMethods";

// Components
import PaymentMethodsStats from "@/components/admin/payment/PaymentMethodsStats";
import PaymentMethodCard from "@/components/admin/payment/PaymentMethodCard";

function AdminPaymentMethodsContent() {
  const { isModalOpen, editingMethod, openModal, closeModal } = usePaymentMethodsState();
  const mutations = usePaymentMethodMutations();

  // Data
  const { data: paymentMethods = [], isLoading } = usePaymentMethods();
  const stats = usePaymentMethodStats(paymentMethods);

  // Handlers
  const handleSave = async (data) => {
    await savePaymentMethod(data, editingMethod, paymentMethods, mutations);
    closeModal();
  };

  const handleToggleActive = async (method) => {
    await toggleMethodActive(method, mutations.updateMutation);
  };

  const handleSetDefault = async (method) => {
    await setMethodAsDefault(method, paymentMethods, mutations.updateMutation);
  };

  const handleDelete = async (method) => {
    await deletePaymentMethod(method, mutations.deleteMutation);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Phương Thức Thanh Toán</h1>
          <p className="text-gray-600">Quản lý các phương thức thanh toán cho khách hàng</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm Phương Thức
        </button>
      </div>

      {/* Stats */}
      <PaymentMethodsStats stats={stats} />

      {/* Payment Methods List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : paymentMethods.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onToggleActive={handleToggleActive}
              onSetDefault={handleSetDefault}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa Có Phương Thức</h3>
          <p className="text-gray-600 mb-6">Thêm phương thức thanh toán cho khách hàng</p>
          <button
            onClick={() => openModal(null)}
            className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm Phương Thức Đầu Tiên
          </button>
        </div>
      )}

      {/* Modal */}
      <PaymentMethodFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        method={editingMethod}
        onSave={handleSave}
      />
    </div>
  );
}

export default function AdminPaymentMethods() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPaymentMethodsContent />
      </AdminLayout>
    </AdminGuard>
  );
}