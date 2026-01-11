# QR Upgrade Plan – Implementation Tasklist (for Base44 AI agent)

Version: 1.5.0  
Owner: Platform Team  
Date: 2026-01-01  
Status: **Phase 1-6 Complete, Phase 7 Ready for Manual Testing**

---

## Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| 0) Pre-flight | ✅ Done | 100% |
| 1) Entities & Schema | ✅ Done | 100% |
| 2) Experience Module | ✅ Done | 100% |
| 3) E-Card Integration | ✅ Done | 100% |
| 4) MyEcard Self-serve | ✅ Done | 100% |
| 5) UX/Perf/Security | ✅ Done | 100% |
| 6) Observability & Rollout | ✅ Done | 100% |
| 7) Testing | 🔄 In Progress | 50% |

---

## 0) Pre‑flight
- [x] Đọc AI-CODING-RULES.jsx

## 1) Entities & Schema
- [x] Experience.json (owner_user_id, type, code, video_url, poster_url, cta_mode, cta_custom_url, is_active, view_count, device_policy, performance_policy)
- [x] Update EcardProfile.json (experience_id, qr_mode, ecard_theme_id, show_posts, show_shop, show_contact)

## 2) Experience Module
- [x] types/ExperienceDTO.js
- [x] data/experienceRepository.js
  - [x] resolveByCode
  - [x] incrementView (≥3s)
  - [x] upsert (create/update)
  - [x] mapToStrategy (youtube/vimeo/html5)
  - [x] findEcardSlugByOwnerUserId
  - [x] resolveById
- [x] domain/rules.js
  - [x] isValidUrl (sanitize, block javascript:/data:)
  - [x] getCtaTarget (ECARD/SHOP/POSTS/CUSTOM_URL routing)
  - [x] AUTOPLAY_MAX_SPINNER_MS
- [x] domain/featureFlags.js
  - [x] FLAG_INTRO_ENABLED
  - [x] CANARY_ROLLOUT_PERCENTAGE
  - [x] EARLY_ACCESS_SEGMENTS
  - [x] isIntroEnabledForUser()
  - [x] getFeatureFlagStatus()
- [x] hooks/useExperience.js (resolve→strategy, computeCta, feature flag integration)
- [x] hooks/useExperiencePlayer.js
  - [x] Autoplay detection
  - [x] View count increment after 3s
  - [x] Reduced-motion support
  - [x] Save-data/2G detection
  - [x] IntersectionObserver lazy play
  - [x] Spinner timeout (1.5s)
- [x] ui/ExperienceIntroView.jsx
  - [x] Video player (html5 strategy)
  - [x] Poster fallback
  - [x] CTA/Skip overlay buttons
  - [x] Safe-area padding
  - [x] Min tap target (44px)
- [x] index.js (Public API exports)
- [x] pages/Experience.js
  - [x] Code param handling
  - [x] Loading state
  - [x] Invalid/inactive experience handling (no white screen)
  - [x] CTA navigation (rel=noopener,noreferrer)
  - [x] Skip navigation

## 3) E‑Card Integration
- [x] Update ecardRepository QR generation (→ Experience when qr_mode=INTRO)
- [x] data/userStatsRepository.js (getMyStats: post_count, product_count)
- [x] hooks/useUserStats.js
- [x] hooks/useExperienceSettings.js (saveIntro, saveToggles)
- [x] hooks/useExperiencePreview.js
- [x] Update EcardProfileTab (integrate ExperienceSettingsCard, ThemePreviewStyles)
- [x] ui/ExperienceSettingsCard.jsx
- [x] ui/EcardExtensionsPanel.jsx (Posts/Shop buttons với count)
- [x] index.js (Public API exports)

## 4) MyEcard – Self‑serve Config
- [x] Enable/Disable Intro toggle (qr_mode)
- [x] Video URL input với validation
- [x] Poster URL input (optional)
- [x] CTA Mode selector (ECARD/SHOP/POSTS/CUSTOM_URL)
- [x] Custom URL input (khi cta_mode=CUSTOM_URL)
- [x] Test Play modal (ExperienceTestPlayModal)
- [x] Theme selector preview CSS vars (ThemePreviewStyles)
- [x] Privacy toggles (show_posts, show_shop, show_contact)

## 5) UX/Perf/Security
- [x] Safe-area inset (iOS bottom bar)
- [x] Prefers-reduced-motion detection
- [x] Min tap target 44px cho buttons
- [x] Lazy play với IntersectionObserver
- [x] Spinner threshold 1.5s
- [x] Save-data / 2G network → poster-first
- [x] URL sanitization (isValidUrl)
- [x] Block javascript:/data: schemes
- [x] rel="noopener noreferrer" cho external links

## 6) Observability & Rollout
- [x] Client events via EventBus:
  - [x] experience_loaded
  - [x] autoplay_blocked
  - [x] fallback_used
  - [x] experience_view_incremented
  - [x] experience_error
- [x] Feature flag system:
  - [x] FLAG_INTRO_ENABLED (global kill switch)
  - [x] CANARY_ROLLOUT_PERCENTAGE (0-100%)
  - [x] EARLY_ACCESS_SEGMENTS (user targeting)
  - [x] isIntroEnabledForUser() function
- [x] Canary rollout infrastructure ready

## 7) Testing
- [x] Test scenarios documentation (__tests__/experienceTestScenarios.js)
- [ ] Device matrix testing:
  - [ ] iOS Safari
  - [ ] iOS Zalo WebView
  - [ ] Android Chrome
  - [ ] Android Zalo WebView
  - [ ] Desktop Chrome
  - [ ] Desktop Safari
- [ ] Video source testing:
  - [ ] YouTube
  - [ ] Vimeo
  - [ ] Direct MP4
  - [ ] HLS (m3u8)
- [ ] Edge case testing:
  - [ ] Autoplay blocked
  - [ ] Poster missing
  - [ ] Weak network (2G/save-data)
  - [ ] Video 404/error
  - [ ] Invalid experience code
  - [ ] Prefers reduced motion
  - [ ] Timeout >5s
- [ ] Regression testing:
  - [ ] E-Card layout A/B/C intact
  - [ ] Privacy toggles work
  - [ ] View count increments correctly
  - [ ] QR mode switching works
- [ ] Acceptance criteria verification:
  - [ ] UI khả dụng <1.5s
  - [ ] CTA/Skip luôn visible
  - [ ] No empty buttons rendered
  - [ ] No direct API calls in UI

---

## Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `entities/Experience.json` | Experience entity schema |
| `features/experience/index.js` | Module public API |
| `features/experience/types/ExperienceDTO.js` | DTO definitions |
| `features/experience/data/experienceRepository.js` | Data access layer |
| `features/experience/domain/rules.js` | Business rules |
| `features/experience/domain/featureFlags.js` | Feature flag system |
| `features/experience/hooks/useExperience.js` | Main experience hook |
| `features/experience/hooks/useExperiencePlayer.js` | Player control hook |
| `features/experience/ui/ExperienceIntroView.jsx` | Intro player UI |
| `features/experience/__tests__/experienceTestScenarios.js` | Test documentation |
| `features/ecard/index.js` | Module public API |
| `features/ecard/data/userStatsRepository.js` | User stats data |
| `features/ecard/hooks/useUserStats.js` | Stats hook |
| `features/ecard/hooks/useExperienceSettings.js` | Settings management |
| `features/ecard/hooks/useExperiencePreview.js` | Preview data hook |
| `features/ecard/ui/ExperienceSettingsCard.jsx` | Settings UI |
| `features/ecard/ui/EcardExtensionsPanel.jsx` | Extensions buttons |
| `features/ecard/ui/ExperienceTestPlayModal.jsx` | Test play modal |
| `features/ecard/ui/ThemePreviewStyles.jsx` | CSS vars injection |
| `pages/Experience.js` | Experience page |

### Modified Files
| File | Changes |
|------|---------|
| `entities/EcardProfile.json` | Added experience_id, qr_mode, show_* fields |
| `components/ecard/EcardProfileTab` | Integrated ExperienceSettingsCard, ThemePreviewStyles |
| `components/ecard/data/ecardRepository` | QR generation with Experience support |

---

## Next Steps
1. **Manual Testing**: Execute test matrix on real devices
2. **Canary Deployment**: Start at 10%, monitor errors, increase gradually
3. **Documentation**: Update user guide for Intro feature
4. **Future**: YouTube/Vimeo embed support (currently html5 only)

---

## Changelog
- **1.5.0** (2026-01-01): Phase 1-6 complete. Added feature flags, test scenarios, module indexes, security hardening.
- 1.4.4: Initial tasklist structure