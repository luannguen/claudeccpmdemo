/**
 * InviteAccept Page - Landing page for /InviteAccept?code=xxx
 * 
 * Decision Tree Flow:
 * 1. Validate invite code (INVALID/EXPIRED/USED)
 * 2. Detect environment (standalone/browser/webview)
 * 3. Check auth status
 * 4. Show appropriate UI
 */

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { useInviteAccept } from "@/components/ecard/hooks/useInviteAccept";
import WebviewBlocker from "@/components/ecard/WebviewBlocker";
import InviteErrorState from "@/components/ecard/ui/InviteErrorState";
import InviteSuccessState from "@/components/ecard/ui/InviteSuccessState";
import { 
  InviteStatus,
  detectEnvironment,
  makeDecision
} from "@/components/ecard/domain/inviteDecisionTree";
import { isSocialWebview } from "@/components/ecard/utils/webviewDetector";
import { createPageUrl } from "@/utils";

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || searchParams.get('slug');
  
  const [bypassWebviewCheck, setBypassWebviewCheck] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [isNewConnection, setIsNewConnection] = useState(true);
  
  const {
    inviteInfo,
    validationError,
    isAuthenticated,
    currentUser,
    inviterProfile,
    authCheckComplete,
    isLoading,
    isAccepting,
    acceptInvite,
    redirectToLogin,
    acceptResult
  } = useInviteAccept(code);

  // Make decision based on current state
  const decision = useMemo(() => {
    if (!authCheckComplete) return null;
    
    return makeDecision({
      inviteCode: code,
      validationResult: validationError ? { status: 'invalid' } : null,
      isAuthenticated,
      currentUser,
      inviterProfile
    });
  }, [code, validationError, isAuthenticated, currentUser, inviterProfile, authCheckComplete]);

  // Detect environment
  const environment = useMemo(() => detectEnvironment(), []);

  // Auto-accept if authenticated and ready
  useEffect(() => {
    if (!decision || connectionSuccess || isAccepting) return;
    
    // Only auto-accept in non-webview when authenticated
    if (decision.status === InviteStatus.CHECKING && 
        isAuthenticated && 
        inviterProfile &&
        currentUser?.id !== inviterProfile.user_id &&
        !decision.shouldBlockWebview) {
      handleAccept();
    }
  }, [decision, isAuthenticated, inviterProfile, currentUser, connectionSuccess, isAccepting]);

  // Handle accept result
  useEffect(() => {
    if (acceptResult) {
      setConnectionSuccess(true);
      setIsNewConnection(acceptResult.isNew !== false);
    }
  }, [acceptResult]);

  const handleAccept = async () => {
    const result = await acceptInvite();
    if (result.success) {
      setConnectionSuccess(true);
      setIsNewConnection(result.result?.isNew !== false);
    }
  };

  const handleViewProfile = () => {
    if (inviterProfile?.public_url_slug) {
      navigate(createPageUrl(`EcardView?slug=${inviterProfile.public_url_slug}`));
    }
  };

  const handleGoToMyEcard = () => {
    navigate(createPageUrl("MyEcard"));
  };

  // ========================================
  // RENDER BASED ON DECISION TREE
  // ========================================

  // Loading state - waiting for auth check
  if (isLoading || !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <Icon.Spinner size={48} className="text-[#7CB342] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // CRITICAL: Block webview login - Google Auth won't work
  // Show blocker BEFORE any other content if in webview and not authenticated
  if (decision?.shouldBlockWebview && !bypassWebviewCheck) {
    return (
      <WebviewBlocker
        inviterProfile={inviterProfile}
        inviteCode={code}
        onContinueAnyway={() => setBypassWebviewCheck(true)}
      />
    );
  }

  // Error states (INVALID, EXPIRED, USED)
  if (decision?.status === InviteStatus.INVALID || 
      decision?.status === InviteStatus.EXPIRED || 
      decision?.status === InviteStatus.USED) {
    return (
      <InviteErrorState 
        status={decision.status}
        inviterProfile={inviterProfile}
      />
    );
  }

  // Validation error from hook
  if (validationError) {
    return (
      <InviteErrorState 
        status={InviteStatus.INVALID}
        inviterProfile={inviterProfile}
      />
    );
  }

  // Self-connection check
  if (decision?.status === InviteStatus.SELF) {
    return (
      <InviteErrorState 
        status={InviteStatus.SELF}
        inviterProfile={inviterProfile}
      />
    );
  }

  // Connection success - with PWA install prompt
  if (connectionSuccess) {
    return (
      <InviteSuccessState 
        inviterProfile={inviterProfile}
        isNewConnection={isNewConnection}
      />
    );
  }

  // Main invite view
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      {/* Main content */}
      <div className="max-w-md mx-auto pt-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon.UserPlus size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Lời mời kết nối</h1>
            <p className="text-white/90">E-Card Business Connection</p>
          </div>

          {/* Inviter Profile */}
          {inviterProfile && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {inviterProfile.profile_image_url ? (
                  <img
                    src={inviterProfile.profile_image_url}
                    alt={inviterProfile.display_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#7CB342]/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {inviterProfile.display_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {inviterProfile.display_name}
                  </h2>
                  {inviterProfile.title_profession && (
                    <p className="text-[#7CB342] font-medium">
                      {inviterProfile.title_profession}
                    </p>
                  )}
                  {inviterProfile.company_name && (
                    <p className="text-gray-600">{inviterProfile.company_name}</p>
                  )}
                </div>
              </div>

              {inviterProfile.bio && (
                <p className="text-gray-600 text-sm mb-6 italic">
                  "{inviterProfile.bio}"
                </p>
              )}

              {/* Contact info preview */}
              <div className="space-y-2 mb-6">
                {inviterProfile.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Icon.Phone size={18} className="text-[#7CB342]" />
                    <span>{inviterProfile.phone}</span>
                  </div>
                )}
                {inviterProfile.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Icon.Mail size={18} className="text-[#7CB342]" />
                    <span>{inviterProfile.email}</span>
                  </div>
                )}
              </div>

              {/* Action buttons - only show when auth check is complete */}
              {!authCheckComplete ? (
                <div className="flex items-center justify-center py-4">
                  <Icon.Spinner className="text-[#7CB342]" />
                </div>
              ) : isAuthenticated ? (
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full bg-[#7CB342] hover:bg-[#689F38] h-12 text-lg"
                >
                  {isAccepting ? (
                    <>
                      <Icon.Spinner className="mr-2" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <Icon.UserPlus size={20} className="mr-2" />
                      Kết nối ngay
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={redirectToLogin}
                    className="w-full bg-[#7CB342] hover:bg-[#689F38] h-12 text-lg"
                  >
                    <Icon.User size={20} className="mr-2" />
                    Đăng nhập / Đăng ký để kết nối
                  </Button>
                  <p className="text-center text-sm text-gray-500">
                    Đăng nhập để lưu kết nối. Kết nối sẽ tự động hoàn tất sau khi đăng nhập.
                  </p>
                  
                  {/* Hint for PWA install */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                      💡 Sau khi đăng nhập, kết nối sẽ tự động được tạo
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              {inviteInfo?.expiresAt && (
                <>Mã mời hết hạn: {inviteInfo.expiresAt.toLocaleDateString('vi-VN')}</>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}