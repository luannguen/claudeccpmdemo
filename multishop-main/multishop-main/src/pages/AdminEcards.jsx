import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Icon } from "@/components/ui/AnimatedIcon";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { useDebouncedValue } from "@/components/shared/utils";
import AdminEcardStats from "@/components/admin/ecards/AdminEcardStats";
import AdminEcardFilters, { DEFAULT_FILTERS } from "@/components/admin/ecards/AdminEcardFilters";
import AdminEcardDetailModal from "@/components/admin/ecards/AdminEcardDetailModal";
import AdminVerificationQueue from "@/components/admin/ecards/AdminVerificationQueue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdminEcardsContent() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profiles');
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-ecards'],
    queryFn: async () => {
      const result = await base44.entities.EcardProfile.list('-created_date', 1000);
      return result || [];
    },
    staleTime: 30000
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['admin-connections'],
    queryFn: async () => {
      const result = await base44.entities.UserConnection.list('-created_date', 1000);
      return result || [];
    },
    staleTime: 30000
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['admin-gifts'],
    queryFn: async () => {
      const result = await base44.entities.GiftTransaction.list('-created_date', 1000);
      return result || [];
    },
    staleTime: 30000
  });

  // Pending verifications count
  const { data: pendingVerifications = [] } = useQuery({
    queryKey: ['admin-pending-verifications'],
    queryFn: async () => {
      const result = await base44.entities.VerificationRequest.filter({ status: 'pending' });
      return result || [];
    },
    staleTime: 30000
  });

  // Apply filters
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];
    
    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.display_name?.toLowerCase().includes(search) ||
        p.company_name?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (filters.status === 'public') {
      result = result.filter(p => p.is_public);
    } else if (filters.status === 'private') {
      result = result.filter(p => !p.is_public);
    }
    
    // Verification filter
    if (filters.verified === 'verified') {
      result = result.filter(p => p.verification_status === 'verified');
    } else if (filters.verified === 'unverified') {
      result = result.filter(p => p.verification_status !== 'verified');
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (filters.dateRange === 'today') startDate.setDate(now.getDate() - 1);
      else if (filters.dateRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (filters.dateRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (filters.dateRange === '90d') startDate.setDate(now.getDate() - 90);
      
      result = result.filter(p => new Date(p.created_date) >= startDate);
    }
    
    // Sort
    result.sort((a, b) => {
      if (filters.sort === '-created_date') return new Date(b.created_date) - new Date(a.created_date);
      if (filters.sort === 'created_date') return new Date(a.created_date) - new Date(b.created_date);
      if (filters.sort === '-view_count') return (b.view_count || 0) - (a.view_count || 0);
      if (filters.sort === 'display_name') return (a.display_name || '').localeCompare(b.display_name || '');
      return 0;
    });
    
    return result;
  }, [profiles, debouncedSearch, filters]);

  // Compute stats
  const stats = useMemo(() => ({
    totalProfiles: profiles.length,
    totalConnections: connections.length,
    totalGifts: gifts.length,
    activeProfiles: profiles.filter(p => p.is_public).length,
    totalViews30d: profiles.reduce((sum, p) => sum + (p.view_count || 0), 0),
    conversionRate: profiles.length > 0 
      ? ((connections.length / profiles.length) * 100 / 10).toFixed(1)
      : 0
  }), [profiles, connections, gifts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon.Spinner size={48} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý E-Card</h1>
        <p className="text-gray-600">Theo dõi và quản lý E-Card của người dùng</p>
      </div>

      {/* Stats */}
      <AdminEcardStats stats={stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-white shadow-sm rounded-xl p-1">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Icon.User size={16} />
            E-Cards ({profiles.length})
          </TabsTrigger>
          <TabsTrigger value="verifications" className="flex items-center gap-2">
            <Icon.ShieldCheck size={16} />
            Xác thực
            {pendingVerifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingVerifications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-6">
          {/* Filters */}
          <AdminEcardFilters
        filters={filters}
        onChange={setFilters}
        onReset={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Icon.CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy E-Card nào</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all text-left hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4 mb-4">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white text-2xl font-bold">
                    {profile.display_name?.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{profile.display_name}</h3>
                  {profile.title_profession && (
                    <p className="text-sm text-gray-600 truncate">{profile.title_profession}</p>
                  )}
                  {profile.company_name && (
                    <p className="text-xs text-gray-500 truncate">{profile.company_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Icon.Eye size={16} />
                  <span>{profile.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon.Users size={16} />
                  <span>{connections.filter(c => c.initiator_user_id === profile.user_id).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon.Gift size={16} />
                  <span>{gifts.filter(g => g.receiver_user_id === profile.user_id).length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile.is_public ? 'Công khai' : 'Riêng tư'}
                </span>
                {profile.verification_status === 'verified' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Icon.CheckCircle size={10} />
                    Verified
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(profile.created_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Tên</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Công ty</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Lượt xem</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Kết nối</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày tạo</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <tr key={profile.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {profile.profile_image_url ? (
                        <img
                          src={profile.profile_image_url}
                          alt={profile.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white font-bold">
                          {profile.display_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{profile.display_name}</p>
                        {profile.title_profession && (
                          <p className="text-sm text-gray-600">{profile.title_profession}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{profile.company_name || '-'}</td>
                  <td className="p-4 text-center text-sm text-gray-700">{profile.view_count || 0}</td>
                  <td className="p-4 text-center text-sm text-gray-700">
                    {connections.filter(c => c.initiator_user_id === profile.user_id).length}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {profile.is_public ? 'Công khai' : 'Riêng tư'}
                      </span>
                      {profile.verification_status === 'verified' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Icon.CheckCircle size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(profile.created_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="px-3 py-1.5 bg-[#7CB342] text-white rounded-lg text-xs font-medium hover:bg-[#689F38] transition-colors"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Detail Modal */}
          <AdminEcardDetailModal
            isOpen={!!selectedProfile}
            onClose={() => setSelectedProfile(null)}
            profile={selectedProfile}
          />
        </TabsContent>

        <TabsContent value="verifications" className="mt-6">
          <AdminVerificationQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminEcards() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminEcardsContent />
      </AdminLayout>
    </AdminGuard>
  );
}