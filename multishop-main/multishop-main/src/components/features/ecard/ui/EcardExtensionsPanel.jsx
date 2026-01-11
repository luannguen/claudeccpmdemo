import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { OfflineManager } from '@/components/features/ecard';

export default function EcardExtensionsPanel({ profile, stats }) {
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const items = [];
  const postCount = stats?.post_count || 0;
  const productCount = stats?.product_count || 0;

  if (profile?.show_posts !== false && postCount > 0) {
    items.push({ key: 'posts', label: `Bài viết (${postCount})`, icon: 'FileText', to: createPageUrl('Community') });
  }
  if (profile?.show_shop !== false && productCount > 0) {
    items.push({ key: 'shop', label: 'Gian hàng', icon: 'Store', to: createPageUrl('ShopStorefront') });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <Icon.Grid size={18} className="text-[#7CB342]" /> Mở rộng
      </h3>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map(it => {
          const IconComp = Icon[it.icon];
          return (
            <Link key={it.key} to={it.to} className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3">
              <IconComp size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{it.label}</span>
            </Link>
          );
        })}
        
        {/* Offline Mode Manager */}
        <button
          onClick={() => setShowOfflineManager(!showOfflineManager)}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            showOfflineManager 
              ? 'border-[#7CB342] bg-[#7CB342]/5' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Icon.Download size={18} className={showOfflineManager ? 'text-[#7CB342]' : 'text-gray-600'} />
          <span className="text-sm font-medium text-gray-900">Offline Mode</span>
        </button>
      </div>

      {/* Offline Manager Panel */}
      {showOfflineManager && (
        <div className="mt-4 pt-4 border-t">
          <OfflineManager />
        </div>
      )}
    </div>
  );
}