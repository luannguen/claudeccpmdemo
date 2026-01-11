import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/AnimatedIcon";
import { base44 } from "@/api/base44Client";
import { usePublicEcardProfile, useConnections } from "@/components/ecard";
import EcardPublicView from "@/components/ecard/EcardPublicView";
import WebviewBlocker from "@/components/ecard/WebviewBlocker";
import { isSocialWebview } from "@/components/ecard/utils/webviewDetector";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/NotificationToast";
import { useTrackEcardView } from "@/components/features/ecard";

// Safe toast hook
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { addToast: () => {} };
  }
};

// Save pending invite to localStorage for deferred processing
const savePendingInvite = (slug) => {
  try {
    localStorage.setItem('ecard_pending_invite', JSON.stringify({
      code: slug,
      timestamp: Date.now(),
      source: 'ecard_view'
    }));
  } catch (error) {
    console.warn('Failed to save pending invite:', error);
  }
};

// Clear pending invite
const clearPendingInvite = () => {
  try {
    localStorage.removeItem('ecard_pending_invite');
  } catch (error) {
    console.warn('Failed to clear pending invite:', error);
  }
};

export default function EcardView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get('slug');
  const { addToast } = useSafeToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showWebviewBlocker, setShowWebviewBlocker] = useState(false);
  const [bypassWebview, setBypassWebview] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const autoConnectAttempted = useRef(false);
  
  const { data: profile, isLoading, error } = usePublicEcardProfile(slug);
  const { connectByQrWithAuth, isConnecting } = useConnections();
  
  // Track view
  useTrackEcardView(profile?.user_id, profile?.email, !!profile);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // AUTO-CONNECT: When user is authenticated and profile is loaded, auto-connect
  useEffect(() => {
    const autoConnect = async () => {
      // Only attempt once, when authenticated with profile loaded
      if (autoConnectAttempted.current) return;
      if (!isAuthenticated || !profile || !slug) return;
      if (isConnecting) return;
      
      autoConnectAttempted.current = true;
      console.log('🔗 Auto-connecting after login redirect...');
      
      try {
        const result = await connectByQrWithAuth(slug);
        
        if (result.success) {
          // Clear any pending invite
          clearPendingInvite();
          
          // Show success and redirect to MyEcard
          const isNew = result.result?.isNew !== false;
          addToast(
            isNew 
              ? `Đã kết nối với ${profile.display_name}!` 
              : `Đã là bạn bè với ${profile.display_name}`,
            isNew ? 'success' : 'info'
          );
          
          // Redirect to MyEcard connections tab
          setTimeout(() => {
            navigate(createPageUrl("MyEcard?tab=connections"), { 
              replace: true,
              state: { 
                autoConnected: true,
                connectedTo: profile.display_name 
              }
            });
          }, 500);
        } else if (result.reason === 'SELF_CONNECTION') {
          clearPendingInvite();
          addToast('Đây là E-Card của bạn', 'info');
          // Redirect to own profile
          setTimeout(() => {
            navigate(createPageUrl("MyEcard"), { replace: true });
          }, 500);
        } else if (result.reason === 'NOT_AUTHENTICATED') {
          // Should not happen at this point, but handle it
          console.log('❌ Not authenticated during auto-connect');
        } else {
          setConnectError(result.reason || 'Không thể kết nối');
          addToast('Không thể kết nối', 'error');
        }
      } catch (err) {
        console.error('Auto-connect error:', err);
        setConnectError(err.message || 'Đã xảy ra lỗi');
        addToast('Không thể kết nối', 'error');
      }
    };
    
    autoConnect();
  }, [isAuthenticated, profile, slug, connectByQrWithAuth, navigate, addToast, isConnecting]);

  const handleConnect = async () => {
    if (!slug) return;
    setConnectError(null);
    
    // If not authenticated, check for webview first
    if (!isAuthenticated) {
      // CRITICAL: Block login in social webview
      if (isSocialWebview() && !bypassWebview) {
        setShowWebviewBlocker(true);
        return;
      }
      
      savePendingInvite(slug);
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    // If authenticated, proceed with connection
    try {
      const result = await connectByQrWithAuth(slug);
      
      if (result.success) {
        clearPendingInvite();
        const isNew = result.result?.isNew !== false;
        addToast(
          isNew 
            ? `Đã kết nối với ${profile?.display_name}!` 
            : `Đã là bạn bè với ${profile?.display_name}`,
          isNew ? 'success' : 'info'
        );
        
        // Navigate to MyEcard
        setTimeout(() => {
          navigate(createPageUrl("MyEcard?tab=connections"), { 
            replace: true,
            state: { 
              autoConnected: true,
              connectedTo: profile?.display_name 
            }
          });
        }, 500);
      } else if (result.reason === 'NOT_AUTHENTICATED') {
        savePendingInvite(slug);
        base44.auth.redirectToLogin(window.location.href);
      } else if (result.reason === 'SELF_CONNECTION') {
        addToast('Đây là E-Card của bạn', 'info');
        navigate(createPageUrl("MyEcard"), { replace: true });
      } else {
        setConnectError(result.reason || 'Không thể kết nối');
        addToast('Không thể kết nối', 'error');
      }
    } catch (err) {
      console.error('Connect error:', err);
      setConnectError(err.message || 'Đã xảy ra lỗi');
      addToast('Không thể kết nối', 'error');
    }
  };

  // Show webview blocker when trying to login from social webview
  if (showWebviewBlocker) {
    return (
      <WebviewBlocker
        inviterProfile={profile}
        inviteCode={slug}
        onContinueAnyway={() => {
          setBypassWebview(true);
          setShowWebviewBlocker(false);
        }}
      />
    );
  }

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon.Spinner size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon.AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy E-Card</h2>
          <p className="text-gray-600">Link có thể đã hết hạn hoặc không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Error message */}
        {connectError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <Icon.AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <span className="text-red-700">{connectError}</span>
            <button 
              onClick={() => setConnectError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <Icon.X size={18} />
            </button>
          </div>
        )}
        
        <EcardPublicView 
          profile={profile} 
          onConnect={handleConnect}
          isConnecting={isConnecting}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}