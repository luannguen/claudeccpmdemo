/**
 * EcardSearchModal - Tìm kiếm E-Card theo phone/email
 * Kế thừa EnhancedModal
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import EnhancedModal from '@/components/EnhancedModal';
import { useEcardSearch } from '../hooks/useEcardProfile';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EcardSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const { data: results = [], isLoading } = useEcardSearch(query);

  const handleSelectProfile = (profile) => {
    navigate(createPageUrl('EcardView') + `?slug=${profile.public_url_slug}`);
    onClose();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tìm E-Card"
      maxWidth="lg"
      showControls={false}
      enableDrag={false}
      positionKey="ecard-search"
    >
      <div className="p-6">
        {/* Search Input */}
        <div className="relative mb-4">
          <Icon.Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo email hoặc số điện thoại..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
          />
        </div>

        {/* Results */}
        <div className="min-h-[200px]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Icon.Spinner size={32} className="text-[#7CB342]" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-12">
              <Icon.Search size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy kết quả</p>
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="text-center py-12">
              <Icon.Info size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nhập email hoặc số điện thoại để tìm kiếm</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt={profile.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white font-bold">
                        {profile.display_name?.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{profile.display_name}</p>
                      {profile.title_profession && (
                        <p className="text-sm text-gray-600">{profile.title_profession}</p>
                      )}
                      {profile.company_name && (
                        <p className="text-xs text-gray-500">{profile.company_name}</p>
                      )}
                    </div>

                    <Icon.ChevronRight size={20} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </EnhancedModal>
  );
}