import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

// Hooks
import {
  useAbandonedCartConfig,
  useAbandonedCarts,
  useFilteredAbandonedCarts,
  useRecoveryRate,
  useSendRecoveryEmail,
  useUpdateConfig,
  useAbandonedCartsFilters
} from '@/components/hooks/useAdminAbandonedCarts';

// Components
import AbandonedCartsHeader from '@/components/admin/abandonedcarts/AbandonedCartsHeader';
import AbandonedCartsStats from '@/components/admin/abandonedcarts/AbandonedCartsStats';
import AbandonedCartsSearch from '@/components/admin/abandonedcarts/AbandonedCartsSearch';
import AbandonedCartCard from '@/components/admin/abandonedcarts/AbandonedCartCard';
import AbandonedCartsEmptyState from '@/components/admin/abandonedcarts/AbandonedCartsEmptyState';
import AbandonedCartsLoadingState from '@/components/admin/abandonedcarts/AbandonedCartsLoadingState';
import AbandonedCartsSettingsModal from '@/components/admin/abandonedcarts/AbandonedCartsSettingsModal';

export default function AdminAbandonedCarts() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminAbandonedCartsContent />
      </AdminLayout>
    </AdminGuard>
  );
}

function AdminAbandonedCartsContent() {
  // Data hooks
  const config = useAbandonedCartConfig();
  const { data: carts = [], isLoading } = useAbandonedCarts();
  const { searchTerm, setSearchTerm, showSettings, openSettings, closeSettings } = useAbandonedCartsFilters();
  
  const abandonedCarts = useFilteredAbandonedCarts(carts, config, searchTerm);
  const recoveryRate = useRecoveryRate(config);
  
  // Mutations
  const sendEmailMutation = useSendRecoveryEmail();
  const updateConfigMutation = useUpdateConfig(config, closeSettings);

  return (
    <div>
      <div className="mb-6">
        <AbandonedCartsHeader onOpenSettings={openSettings} />
        <AbandonedCartsStats config={config} recoveryRate={recoveryRate} />
        <AbandonedCartsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {isLoading ? (
        <AbandonedCartsLoadingState />
      ) : abandonedCarts.length === 0 ? (
        <AbandonedCartsEmptyState />
      ) : (
        <div className="space-y-4">
          {abandonedCarts.map((cart) => (
            <AbandonedCartCard
              key={cart.id}
              cart={cart}
              onSendEmail={(c) => sendEmailMutation.mutate(c)}
              isSending={sendEmailMutation.isPending}
            />
          ))}
        </div>
      )}

      {showSettings && (
        <AbandonedCartsSettingsModal
          config={config}
          onSave={updateConfigMutation.mutate}
          onClose={closeSettings}
        />
      )}
    </div>
  );
}