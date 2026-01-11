# QR Upgrade Plan – Immersive Intro + E‑Card Hub (A/B/C model)

Version: 1.5.0  
Owner: Platform Team  
Date: 2026-01-01

---

## 1) Executive Summary
Mục tiêu: biến QR và E‑Card thành trải nghiệm nhất quán "ecard-native". Quét QR → Immersive Intro (video, autoplay muted, poster fallback) → CTA về E‑Card Hub. E‑Card là profile hub (không nhồi nội dung) điều hướng thông minh sang Community (bài viết), Shop (gian hàng) và các hành động nhanh. Kế hoạch tuân thủ kiến trúc 3 lớp, phân tách rõ ràng UI → Hooks → Data/Service theo AI‑CODING‑RULES.

---

## 2) Nguyên tắc & Không-phạm-vi
- Tuân thủ module 3 lớp: UI (presentation), Hooks (feature orchestration), Data/Service (repositories). UI không gọi API trực tiếp.  
- Không thay đổi hành vi E‑Card hiện có cho user cũ (compatibility trước).  
- Phase 1 chỉ nhận link video (YouTube/Vimeo/MP4/HLS), không upload.  
- Không nhúng nội dung dài vào E‑Card; chỉ hiển thị nút mở rộng (extensions).

---

## 3) Kiến trúc A/B/C
- A) Card Core (luôn có): Avatar, Tên, Vai trò, Bio ngắn, Liên hệ (theo quyền).  
  - Card Theme System: ecard_theme_id → CSS vars (--ecard-bg, --ecard-primary, --ecard-text, --ecard-accent).  
- B) Card Extensions (hub điều hướng):  
  - Posts button (📝 Bài viết (N)) → /community/author/:userId hoặc /@username/posts (khi post_count≥1 và show_posts).  
  - Shop button (🛒 Gian hàng) → /shop/:shopId hoặc /@username/shop (khi có shop hoặc product_count≥1 và show_shop).  
  - Action Group: Kết bạn | Gửi quà | Lưu ecard (gom riêng, không lẫn nội dung).  
- C) UX Rules & Permissions: thứ tự khối, hiển thị thông minh (không render nút trống), privacy toggles show_posts/show_shop/show_contact.

---

## 4) Experience (Immersive Intro)
- QR trỏ Experience?code=... khi qr_mode='INTRO' và experience active, ngược lại về EcardView.  
- Autoplay muted + playsinline; blocked → poster + nút Play, CTA/Skip luôn có.  
- Kiến nghị: spinner ≤ 1.5s, safe-area iOS, keyboard hotkeys (desktop), prefers-reduced-motion.  
- Performance: preload='metadata', lazy play (IntersectionObserver), save-data→poster-first.  
- Error: video lỗi/404/timeout>5s → poster + Retry + CTA/Skip; code invalid → điều hướng về E‑Card hoặc hiển thị CTA eCard.

---

## 5) Data Model & Compatibility
- New entity Experience:  
  - owner_user_id, type='VIDEO', code (unique), video_url, poster_url,  
  - cta_mode ('ECARD'|'SHOP'|'POSTS'|'CUSTOM_URL'), cta_custom_url,  
  - is_active (default true), view_count (default 0),  
  - device_policy { allow_ar_on_android, allow_in_webview },  
  - performance_policy { max_bitrate_kbps, preload }.
- Update EcardProfile (không breaking):  
  - experience_id: string|null; qr_mode: 'INTRO'|'DIRECT' (mặc định 'DIRECT' cho hồ sơ cũ),  
  - ecard_theme_id: string|null; show_posts: boolean (default true); show_shop: boolean (default true); show_contact: boolean (default true).
- CardTheme (optional v1 hoặc v1.5): name, vars, premium.
- UserStats (service derive, không bắt buộc entity): post_count, shop_id?, product_count.

---

## 6) Modules & Files Structure

### 6.1 Experience Module (`features/experience/`)
```
features/experience/
├── index.js                    # Public API exports
├── types/
│   └── ExperienceDTO.js        # DTO definitions
├── data/
│   └── experienceRepository.js # Data access (resolveByCode, incrementView, upsert)
├── domain/
│   ├── rules.js                # Business rules (autoplay, fallback, URL validation)
│   └── featureFlags.js         # Canary rollout, user segment targeting
├── hooks/
│   ├── useExperience.js        # Main hook (resolve→strategy, computeCta)
│   └── useExperiencePlayer.js  # Player control (autoplay detection, view count)
├── ui/
│   └── ExperienceIntroView.jsx # Player + overlay CTA/Skip + poster fallback
└── __tests__/
    └── experienceTestScenarios.js # Testing matrix & scenarios
```

### 6.2 E-Card Module Extensions (`features/ecard/`)
```
features/ecard/
├── index.js                    # Public API exports
├── data/
│   └── userStatsRepository.js  # Derive post_count/shop/product_count
├── hooks/
│   ├── useUserStats.js         # Stats fetching
│   ├── useExperienceSettings.js # Intro config management
│   └── useExperiencePreview.js # Preview data for Test Play
└── ui/
    ├── ExperienceSettingsCard.jsx  # Self-serve config UI
    ├── EcardExtensionsPanel.jsx    # Posts/Shop buttons
    ├── ExperienceTestPlayModal.jsx # Test Play modal
    └── ThemePreviewStyles.jsx      # CSS vars injection
```

### 6.3 Pages
- `pages/Experience.js` - Đọc ?code, render qua hooks, handle invalid/inactive gracefully

---

## 7) User Self‑Serve Configuration (MyEcard)
- Intro Experience: Enable Intro (qr_mode), Video URL (validate https + auto-detect nguồn), Poster URL (optional/auto-suggest), CTA Mode + Custom URL, Advanced (preload, bitrate hint), Test Play (modal) + Open as QR Flow (dev).  
- Card Theme: theme selector, preview realtime, lưu ecard_theme_id.  
- Extensions & Privacy: toggles show_posts/show_shop/show_contact.

---

## 8) Routing & Navigation
- QR (INTRO) → pages/Experience → CTA → E‑Card Hub / Shop / Posts / Custom URL.  
- Extensions trên E‑Card: mở route đích tương ứng; dùng react-router, không dùng window.location.*.

---

## 9) Performance & Observability

### 9.1 Performance Guidelines
- preload='metadata', IntersectionObserver, network info → poster-first
- Codec/bitrate khuyến nghị: mp4 H.264 720p/1080x1920 ≤ 2500kbps, poster ≤ 300KB
- Spinner threshold: ≤ 1.5s

### 9.2 Client Events (via EventBus)
| Event | Trigger | Data |
|-------|---------|------|
| `experience_loaded` | Page mount | `{ id }` |
| `autoplay_blocked` | Autoplay fails | `{ id }` |
| `fallback_used` | Poster shown as fallback | `{ id }` |
| `experience_view_incremented` | After 3s play | `{ id }` |
| `experience_error` | Any error | `{ id, message }` |

### 9.3 Feature Flags
- `FLAG_INTRO_ENABLED`: Global kill switch (default: true)
- `CANARY_ROLLOUT_PERCENTAGE`: 0-100% rollout (default: 100)
- `EARLY_ACCESS_SEGMENTS`: ['admin', 'tester', 'beta']

---

## 10) Security & Validation
- Sanitize URL via `isValidUrl()` - block javascript:/data: schemes
- iframe sandbox/allow tối thiểu (YT/Vimeo)
- rel="noopener noreferrer" khi mở external URLs
- Optional domain allowlist (youtube.com, youtu.be, vimeo.com, trusted mp4 CDN)

---

## 11) Upgrade Strategy
- Backward-safe: user cũ giữ DIRECT + experience_id=null; theme/template cũ vẫn hoạt động.  
- Chỉ bật INTRO khi video_url hợp lệ & experience active.  
- Feature flag và canary trước khi rollout rộng.  
- QR regeneration: chỉ khi DIRECT→INTRO hoặc đổi code; optional grace 7 ngày giữ link cũ.

---

## 12) Testing Matrix & Acceptance Criteria

### 12.1 Device Matrix
| Device | Expected Behavior |
|--------|-------------------|
| iOS Safari | Muted autoplay, safe-area |
| iOS Zalo WebView | Poster fallback, manual play |
| Android Chrome | Muted autoplay |
| Android Zalo WebView | Poster fallback |
| Desktop Chrome/Safari | Muted autoplay, keyboard shortcuts |

### 12.2 Video Sources
- YouTube (embed strategy)
- Vimeo (embed strategy)
- Direct MP4 (html5 strategy)
- HLS/m3u8 (html5 strategy)

### 12.3 Edge Cases
- Autoplay blocked → poster + Play button
- Poster missing → video frame fallback
- Weak network (2G/save-data) → poster-first
- Video 404/error → poster + Retry + CTA/Skip
- Invalid code → redirect to E-Card (no white screen)
- Prefers reduced motion → no autoplay

### 12.4 Acceptance Criteria
1. UI khả dụng <1.5s, không trắng màn hình
2. CTA/Skip luôn sẵn sàng
3. Không render nút rỗng
4. Privacy toggles hoạt động
5. Không có API call trực tiếp trong UI
6. Tuân thủ AnimatedIcon, không dùng window.alert/confirm

---

## 13) Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| Autoplay bị chặn rộng rãi | poster-first + Test Play; vẫn đảm bảo CTA/Skip |
| Link video không tương thích | strategy switch + fallback poster |
| Webview hạn chế | giữ HTML5 poster; không AR |
| Hiệu năng kém | hạn chế preload, guideline bitrate; quan sát lỗi để tắt flag |

---

## 14) Changelog
- **1.5.0** (2026-01-01): Hoàn tất implementation Phase 1-7, thêm module index.js, feature flags với canary rollout, test scenarios, client events, security hardening (noreferrer), graceful error handling cho invalid experience.
- 1.4.0: Mở rộng kế hoạch A/B/C, modules & files, self‑serve config, testing/AC, security, upgrade.  
- 1.3.0: Thêm mô hình Core/Extensions/UX, CardTheme, UserStats.  
- 1.2.0: Thêm User Configuration, Upgrade & Compatibility, Playbook.  
- 1.1.0: UI/UX Guidelines.  
- 1.0.0: Khởi tạo Video Intro.