# E-Card Invite Link PWA Upgrade Plan

## Executive Summary

**Mục tiêu**: Nâng cấp hệ thống E-Card từ "QR chứa text slug" sang "QR chứa invite link HTTPS + deferred context + auto-accept sau login" theo chuẩn PWA.

**Vấn đề hiện tại**:
1. QR code encode trực tiếp URL `/EcardView?slug=xxx` - không có invite token/expiry
2. Không có deferred context khi user chưa login
3. User phải thao tác manual để kết nối sau khi xem profile
4. Chưa có PWA install prompt tối ưu sau khi kết nối thành công

**Giải pháp**: 
- QR encode invite link: `/i/<invite_code>`
- Invite code chứa: inviter_user_id, invite_id, expire_at, signature
- Auto-accept connection sau login
- PWA install prompt đúng thời điểm

---

## Current State Analysis

### Files liên quan:
```
components/ecard/
├── data/
│   ├── ecardRepository.js      # QR generation (đang dùng qrserver.com)
│   └── connectionRepository.js # Connection logic
├── hooks/
│   ├── useEcardProfile.js
│   └── useConnections.js
├── types/index.js              # Types & constants
├── index.js                    # Public API
├── EcardPreview.jsx           # Hiển thị QR
├── QRScannerEnhanced.jsx      # Scan QR
└── EcardPublicView.jsx        # View public profile

pages/
├── EcardView.jsx              # Public view page (cần upgrade)
└── MyEcard.jsx                # User's ecard page

entities/
├── EcardProfile.json          # Profile entity (có qr_code_url)
└── UserConnection.json        # Connection entity

components/PWAInstallPrompt.jsx # PWA install (có sẵn)
```

### Database State (EcardProfile):
- `qr_code_url`: Đang lưu URL của qrserver.com API
- Chỉ 1 profile (farmersmartvn) có QR code
- Các profile khác `qr_code_url: null`

---

## Target Architecture

### New Invite Flow:
```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User A hiển thị QR (QR encode invite link)                   │
│    https://app.domain.com/i/<invite_code>                       │
├─────────────────────────────────────────────────────────────────┤
│ 2. User B quét QR bằng Zalo/Camera/QR Scanner                   │
│    → Mở link trong webview/browser                              │
├─────────────────────────────────────────────────────────────────┤
│ 3. Landing /i/<invite_code>                                     │
│    (A) Decode invite_code → validate signature + expiry         │
│    (B) Lưu context vào localStorage/cookie                      │
│    (C) Check login status                                       │
│        - Đã login → auto-accept connection                      │
│        - Chưa login → redirect login với callback               │
├─────────────────────────────────────────────────────────────────┤
│ 4. Sau login → callback xử lý deferred context                  │
│    → Auto-accept connection                                     │
│    → Hiển thị "Đã kết nối với A"                                │
├─────────────────────────────────────────────────────────────────┤
│ 5. Sau kết nối thành công → PWA install prompt                  │
│    - Android: beforeinstallprompt                               │
│    - iOS: Guide overlay                                         │
│    - Zalo webview: "Mở bằng trình duyệt"                        │
└─────────────────────────────────────────────────────────────────┘
```

### New Files to Create:
```
components/ecard/
├── domain/
│   └── inviteCodeGenerator.js    # Generate/validate invite codes
├── data/
│   └── inviteRepository.js       # Invite storage (optional)
├── hooks/
│   └── useInviteAccept.js        # Handle invite acceptance
└── ui/
    ├── InviteLandingPage.jsx     # Landing page cho /i/<code>
    └── InviteSuccessView.jsx     # Success view sau connect

pages/
└── InviteAccept.jsx              # Page /i/<invite_code>

entities/
└── EcardInvite.json              # (Optional) Invite entity for tracking
```

---

## Phased Implementation Plan

### Phase 1: Invite Code Generator (Domain Layer)
**Priority**: Critical  
**Estimated**: 1 session

**Tasks**:
- [ ] 1.1 Tạo `inviteCodeGenerator.js` trong domain/
  - Generate invite code (base64url encoded JSON)
  - Validate invite code (signature, expiry)
  - Format: `{inviter_id, slug, exp, sig}`
- [ ] 1.2 Tạo helper functions:
  - `generateInviteCode(profile)` → invite_code
  - `decodeInviteCode(code)` → payload
  - `validateInviteCode(code)` → boolean
  - `isInviteExpired(code)` → boolean

**Dependencies**: None

---

### Phase 2: Update QR Generation
**Priority**: Critical  
**Estimated**: 1 session

**Tasks**:
- [ ] 2.1 Update `ecardRepository.js`:
  - `generateQRCodeUrl()` → encode invite link thay vì direct link
  - Invite link format: `${baseUrl}/i/${inviteCode}`
- [ ] 2.2 Update `ensureQRCode()` để regenerate với invite code
- [ ] 2.3 Thêm `regenerateInviteCode()` cho profile

**Dependencies**: Phase 1

---

### Phase 3: Invite Landing Page
**Priority**: Critical  
**Estimated**: 1-2 sessions

**Tasks**:
- [ ] 3.1 Tạo entity `EcardInvite.json` (optional - tracking purposes)
- [ ] 3.2 Tạo page `InviteAccept.jsx`:
  - Route: `/i/:inviteCode` hoặc `/InviteAccept?code=xxx`
  - Decode + validate invite code
  - Show inviter profile preview
  - Check auth status
- [ ] 3.3 Tạo `useInviteAccept.js` hook:
  - Handle deferred context (localStorage)
  - Check login status
  - Auto-accept logic
- [ ] 3.4 Implement deferred context:
  - Save invite_code to localStorage
  - Detect webview (Zalo, Facebook, etc.)
  - Handle OAuth callback

**Dependencies**: Phase 1, 2

---

### Phase 4: Auto-Accept After Login
**Priority**: High  
**Estimated**: 1 session

**Tasks**:
- [ ] 4.1 Update `AuthProvider.jsx`:
  - Check pending invite after login
  - Trigger auto-accept flow
- [ ] 4.2 Update `connectionRepository.js`:
  - Add `acceptInviteConnection(inviteCode, currentUser)` method
- [ ] 4.3 Tạo `InviteSuccessView.jsx`:
  - "Đã kết nối với [Name]"
  - View connected profile
  - PWA install prompt trigger

**Dependencies**: Phase 3

---

### Phase 5: PWA Install Optimization
**Priority**: Medium  
**Estimated**: 1 session

**Tasks**:
- [ ] 5.1 Update `PWAInstallPrompt.jsx`:
  - Add context-aware trigger (after connection success)
  - Improve Zalo webview detection
  - Add "Open in Browser" button
- [ ] 5.2 Tạo `WebviewDetector.js`:
  - Detect Zalo, Facebook, Instagram webviews
  - Provide "Open in native browser" instructions
- [ ] 5.3 Add PWA metrics tracking (optional)

**Dependencies**: Phase 4

---

### Phase 6: Migration & Cleanup
**Priority**: Medium  
**Estimated**: 1 session

**Tasks**:
- [ ] 6.1 Migrate existing profiles:
  - Regenerate QR codes với invite links
  - Update database records
- [ ] 6.2 Backward compatibility:
  - Support old slug-based URLs
  - Redirect `/EcardView?slug=xxx` → `/i/xxx`
- [ ] 6.3 Update UI components:
  - `EcardPreview.jsx` - ensure QR displays correctly
  - `QRScannerEnhanced.jsx` - handle both old/new formats
- [ ] 6.4 Testing & QA

**Dependencies**: Phase 1-5

---

## File Breakdown

### New Files:
| File | Purpose | Phase |
|------|---------|-------|
| `domain/inviteCodeGenerator.js` | Generate/validate invite codes | 1 |
| `hooks/useInviteAccept.js` | Handle invite acceptance flow | 3 |
| `ui/InviteLandingPage.jsx` | Landing page component | 3 |
| `ui/InviteSuccessView.jsx` | Success view after connect | 4 |
| `pages/InviteAccept.jsx` | Route page for /i/<code> | 3 |
| `utils/webviewDetector.js` | Detect webview type | 5 |

### Modified Files:
| File | Changes | Phase |
|------|---------|-------|
| `data/ecardRepository.js` | Update QR generation | 2 |
| `data/connectionRepository.js` | Add invite accept method | 4 |
| `components/AuthProvider.jsx` | Check pending invite | 4 |
| `components/PWAInstallPrompt.jsx` | Context-aware trigger | 5 |
| `pages/EcardView.jsx` | Backward compat | 6 |

---

## Progress Tracking

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| 1. Invite Code Generator | ✅ Completed | 100% | Created inviteCodeGenerator.js with signature validation |
| 2. QR Generation Update | ✅ Completed | 100% | Updated ecardRepository to use invite links |
| 3. Invite Landing Page | ✅ Completed | 100% | Created InviteAccept.jsx with full flow |
| 4. Auto-Accept Logic | ✅ Completed | 100% | Updated AuthProvider + useInviteAccept hook |
| 5. PWA Optimization | ✅ Completed | 100% | Updated PWAInstallPrompt with webview detector |
| 6. Migration & Cleanup | 🔄 In Progress | 30% | Backward compat done, testing needed |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing QR codes break | High | Backward compat: support both formats |
| Signature validation fails | Medium | Test thoroughly, fallback to slug-based |
| Webview blocks navigation | Medium | "Open in browser" instructions |
| OAuth callback issues | High | Test on multiple platforms |
| localStorage not available | Low | Fallback to URL params |

---

## Success Criteria

1. ✅ QR code chứa invite link thay vì direct slug
2. ✅ User quét QR → auto-login → auto-connect (1 flow liền mạch)
3. ✅ Deferred context hoạt động đúng khi chưa login
4. ✅ PWA install prompt hiện sau khi kết nối thành công
5. ✅ Backward compatible với QR codes cũ
6. ✅ Hoạt động tốt trên Zalo/FB webview

---

## Technical Notes

### Invite Code Format:
```javascript
// Payload
{
  i: "inviter_user_id",      // inviter
  s: "public_url_slug",      // slug
  e: 1704067200,             // expiry timestamp (7 days)
  n: "random_nonce"          // one-time use nonce
}

// Encoded
base64url(JSON.stringify(payload) + "." + HMAC_SHA256(payload, secret))
```

### Deferred Context Storage:
```javascript
// localStorage key
'ecard_pending_invite': {
  code: "invite_code",
  timestamp: Date.now(),
  source: "qr_scan" | "link_share"
}
```

### Webview Detection:
```javascript
const isZaloWebview = /Zalo/i.test(navigator.userAgent);
const isFacebookWebview = /FBAN|FBAV/i.test(navigator.userAgent);
const isInstagramWebview = /Instagram/i.test(navigator.userAgent);
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-01 | 1.0.0 | Initial plan created |
| 2025-01-01 | 1.1.0 | ✅ Phases 1-5 completed: invite code system, QR update, landing page, auto-accept, PWA optimization |