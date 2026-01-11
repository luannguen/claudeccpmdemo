import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/NotificationToast";
import { useEcardProfile, useConnections } from "@/components/ecard";
import { useGiftInbox, useSentGifts } from "@/components/features/gift";
import { useEcardCache } from "@/components/features/ecard";
import { useNetworkStatus, useOfflineMyProfile, useOfflineConnections } from "@/components/features/ecard/hooks/useOfflineMode";
import EcardProfileTab from "@/components/ecard/EcardProfileTab";
import ConnectionsTab from "@/components/ecard/ConnectionsTab";
import GiftsTabNew from "@/components/ecard/GiftsTabNew";
import { EcardSearchModal, ConnectionDetailModal } from "@/components/ecard";
import QRScannerEnhanced from "@/components/ecard/QRScannerEnhanced";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { OfflineStatusBar } from "@/components/features/ecard/ui/OfflineStatusBar";

export default function MyEcard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon.Spinner size={48} className="text-[#7CB342] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#7CB342]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon.User size={40} className="text-[#7CB342]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Đăng nhập để xem E-Card</h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để quản lý E-Card cá nhân, kết nối và quà tặng của mình.
          </p>
          <Button 
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full bg-[#7CB342] hover:bg-[#689F38] text-white py-3 rounded-xl font-medium"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return <MyEcardContent />;
}

function MyEcardContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [connectionDetailModal, setConnectionDetailModal] = useState({ isOpen: false, connection: null, activeTab: 'info' });
  
  // ========== NETWORK STATUS ==========
  const { isOnline, isOffline } = useNetworkStatus();
  
  // ========== OFFLINE FALLBACK DATA ==========
  const { cachedProfile: offlineProfile } = useOfflineMyProfile();
  const { cachedConnections: offlineConnections } = useOfflineConnections();
  
  // ========== CACHED DATA (fast initial load) ==========
  const { stats: cachedStats, connectionsPreview, isLoading: cacheLoading, isSyncing } = useEcardCache();
  
  // ========== FULL DATA (lazy load) - with error handling ==========
  const { profile: onlineProfile, isLoading: loadingProfile, error: profileError } = useEcardProfile();
  const { connections: onlineConnections, isLoading: loadingConnections, refetch: refetchConnections, error: connectionsError } = useConnections();
  
  // Use new gift module hooks
  const { activeGifts, historyGifts, allGifts: receivedGifts, isLoading: loadingReceivedGifts } = useGiftInbox();
  const { sentGifts, isLoading: loadingSentGifts } = useSentGifts();
  const loadingGifts = loadingReceivedGifts || loadingSentGifts;
  
  // Fallback to offline data if network error
  const profile = (profileError && offlineProfile) ? offlineProfile : onlineProfile;
  const connections = (connectionsError && offlineConnections) ? offlineConnections : onlineConnections;
  
  // Use cached count for tabs (fast), fallback to real data
  const connectionCount = loadingConnections ? (cachedStats?.connection_count || 0) : connections.length;
  
  // Handle URL params for tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'connections', 'gifts'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Handle navigation state for opening connection detail from notification
  // Track if we've processed the state to avoid re-processing
  const [pendingConnectionDetail, setPendingConnectionDetail] = useState(null);
  
  // Capture state on mount/navigation
  useEffect(() => {
    if (location.state?.openConnectionDetail && !pendingConnectionDetail) {
      setPendingConnectionDetail({
        connectionId: location.state.connectionId,
        targetUserId: location.state.targetUserId,
        modalTab: location.state.modalTab
      });
      // Clear navigation state immediately
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, location.search, pendingConnectionDetail]);
  
  // Process pending connection detail when connections are loaded
  useEffect(() => {
    if (pendingConnectionDetail && connections.length > 0 && !loadingConnections) {
      const { connectionId, targetUserId, modalTab } = pendingConnectionDetail;
      
      // Find the connection - try multiple match strategies
      let connection = null;
      
      // Strategy 1: Match by connection ID
      if (connectionId) {
        connection = connections.find(c => c.id === connectionId);
      }
      
      // Strategy 2: Match by user ID (either as target or initiator)
      if (!connection && targetUserId) {
        connection = connections.find(c => 
          c.target_user_id === targetUserId || 
          c.initiator_user_id === targetUserId
        );
      }
      
      // Strategy 3: If still not found, just open the first connection (better UX than error)
      if (!connection && connections.length > 0) {
        // Find most recent connection as fallback
        connection = [...connections].sort((a, b) => 
          new Date(b.last_interaction_date || b.created_date).getTime() - 
          new Date(a.last_interaction_date || a.created_date).getTime()
        )[0];
      }
      
      if (connection) {
        setConnectionDetailModal({
          isOpen: true,
          connection,
          activeTab: modalTab || 'chat'
        });
      }
      
      // Clear pending state
      setPendingConnectionDetail(null);
    }
  }, [pendingConnectionDetail, connections, loadingConnections]);
  
  // Listen for open-connection-detail event (for same-page triggers)
  useEffect(() => {
    const handleOpenConnectionDetail = (e) => {
      const { connectionId, targetUserId, activeTab: modalTab } = e.detail || {};
      
      // Switch to connections tab first
      setActiveTab('connections');
      
      // Find the connection
      let connection = null;
      if (connectionId) {
        connection = connections.find(c => c.id === connectionId);
      } else if (targetUserId) {
        connection = connections.find(c => c.target_user_id === targetUserId || c.initiator_user_id === targetUserId);
      }
      
      if (connection) {
        setConnectionDetailModal({
          isOpen: true,
          connection,
          activeTab: modalTab || 'chat'
        });
      } else {
        addToast('Không tìm thấy kết nối', 'warning');
      }
    };
    
    window.addEventListener('open-connection-detail', handleOpenConnectionDetail);
    return () => window.removeEventListener('open-connection-detail', handleOpenConnectionDetail);
  }, [connections, addToast]);
  
  // Handle auto-connect notification from AuthProvider redirect
  useEffect(() => {
    if (location.state?.autoConnected) {
      // Switch to connections tab to show the new connection
      setActiveTab('connections');
      
      // Show success toast
      if (location.state?.connectedTo) {
        addToast(`Đã kết nối với ${location.state.connectedTo}!`, 'success');
      }
      
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  // Handle QR scan result - redirect to invite accept page
  const handleQRScanned = useCallback((codeOrSlug) => {
    setShowQRScanner(false);
    // Navigate to invite accept page
    navigate(createPageUrl(`InviteAccept?code=${codeOrSlug}`));
  }, [navigate]);

  // Handle direct accept from PWA scanner (bypasses landing page)
  const handleDirectAccept = useCallback((result) => {
    setShowQRScanner(false);
    
    if (result.success) {
      // Show success toast
      addToast(
        result.isNew 
          ? `Đã kết nối với ${result.inviterProfile?.display_name}!`
          : `Đã là bạn bè với ${result.inviterProfile?.display_name}`,
        result.isNew ? 'success' : 'info'
      );
      
      // Refresh connections
      refetchConnections?.();
      
      // Switch to connections tab
      setActiveTab('connections');
    }
  }, [addToast, refetchConnections]);

  const tabs = [
    { key: 'profile', label: 'E-Card của tôi', IconComp: Icon.User, count: null },
    { key: 'connections', label: 'Danh bạ', IconComp: Icon.Users, count: connectionCount },
    { key: 'gifts', label: 'Quà tặng', IconComp: Icon.Gift, count: activeGifts?.length || (cachedStats?.gifts_received_count || 0) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 pt-24">
      {/* Offline Status Bar */}
      <OfflineStatusBar />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Card của tôi</h1>
            <p className="text-gray-600">Quản lý thông tin, kết nối và quà tặng</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowQRScanner(true)}
              className="h-11 px-4 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors flex items-center gap-2 font-medium"
            >
              <Icon.QrCode size={20} />
              <span className="hidden sm:inline">Quét QR</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSearchModal(true)}
              className="h-11 px-4 rounded-xl flex items-center gap-2"
            >
              <Icon.Search size={20} />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </Button>
          </div>
        </div>

        {/* Tabs - Touch friendly with min 44px height */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1.5 flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] rounded-lg font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#7CB342] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.IconComp size={20} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && (
                <span className={`min-w-[24px] px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <EcardProfileTab profile={profile} isLoading={loadingProfile} />
        )}
        
        {activeTab === 'connections' && (
          <ConnectionsTab connections={connections} isLoading={loadingConnections} />
        )}
        
        {activeTab === 'gifts' && (
          <GiftsTabNew 
            sentGifts={sentGifts} 
            isLoading={loadingGifts} 
          />
        )}

        {/* Search Modal */}
        <EcardSearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
        />

        {/* QR Scanner Modal - with direct accept support for PWA */}
        {showQRScanner && (
          <QRScannerEnhanced
            onScanned={handleQRScanned}
            onClose={() => setShowQRScanner(false)}
            onDirectAccept={handleDirectAccept}
          />
        )}
        
        {/* Connection Detail Modal - triggered from notification */}
        <ConnectionDetailModal
          isOpen={connectionDetailModal.isOpen}
          onClose={() => setConnectionDetailModal({ isOpen: false, connection: null, activeTab: 'info' })}
          connection={connectionDetailModal.connection}
          initialTab={connectionDetailModal.activeTab}
        />
      </div>
    </div>
  );
}

MyEcardContent.displayName = 'MyEcardContent';