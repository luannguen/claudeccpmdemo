# Admin Settings "Tổng Quan" - Fix Plan

## 📋 Problem Statement

User báo: Chỉnh sửa cài đặt ở Admin > Cài Đặt Hệ Thống > Tổng Quan nhưng không lưu được.

## 🔍 Root Cause Analysis

### Issue 1: GeneralSettings.jsx không có logic lưu
- **File:** `components/admin/settings/GeneralSettings.jsx`
- **Vấn đề:** Form chỉ có `defaultValue` tĩnh, không có:
  - useState để quản lý form data
  - useQuery để fetch config từ SiteConfig entity
  - useMutation để lưu config
  - Button Lưu chỉ là UI, không có onClick handler

### Issue 2: Client components còn hardcode
- **LayoutFooter.jsx** - Hardcode:
  - Brand name "FARMER SMART"
  - Contact info (địa chỉ, phone, email)
  - Social links
  - Copyright text
- **LayoutNavbar.jsx** - Hardcode:
  - Brand name "FARMER SMART"
  - Tagline "100% Organic"

## ✅ Solution Plan

### Phase 1: Fix GeneralSettings.jsx ✅
1. Add useState for form data
2. Add useQuery to fetch SiteConfig (config_key: 'main')
3. Add useMutation to save changes
4. Connect form inputs với state
5. Add proper save handler

### Phase 2: Update LayoutFooter.jsx
1. Import useSiteSettings hook
2. Replace hardcoded values với config:
   - site_name → Brand name
   - contact_info → Phone, email, address
   - social_links → Facebook, Instagram links
   - footer_config.copyright_text → Copyright

### Phase 3: Update LayoutNavbar.jsx
1. Import useSiteSettings hook
2. Replace hardcoded values:
   - site_name → Brand name
   - site_tagline → Tagline

## 📁 Files to Modify

| File | Status | Changes |
|------|--------|---------|
| `components/admin/settings/GeneralSettings.jsx` | ✅ DONE | Add state, query, mutation |
| `components/layout/LayoutFooter.jsx` | 🔄 TODO | Use config instead of hardcode |
| `components/layout/LayoutNavbar.jsx` | 🔄 TODO | Use config for brand info |

## 📐 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN SETTINGS (GeneralSettings.jsx)           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  useState(formData)                                  │   │
│  │  useQuery → SiteConfig.filter({config_key: 'main'}) │   │
│  │  useMutation → SiteConfig.update() / create()       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (SiteConfig Entity)               │
│  {                                                          │
│    config_key: "main",                                      │
│    site_name: "Zero Farm",                                  │
│    contact_info: { phone, email, address, ... },            │
│    social_links: { facebook, instagram, ... },              │
│    ...                                                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT COMPONENTS                         │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ LayoutNavbar    │  │ LayoutFooter    │                  │
│  │ useSiteSettings │  │ useSiteSettings │                  │
│  │ → siteName      │  │ → contact       │                  │
│  │ → siteTagline   │  │ → social        │                  │
│  └─────────────────┘  │ → footer        │                  │
│                        └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Progress Tracking

- [x] Phase 1: Fix GeneralSettings.jsx (DONE)
- [x] Phase 2: Update LayoutFooter.jsx (DONE)
- [x] Phase 3: Update LayoutNavbar.jsx (DONE)

## 📅 Completed: 2025-12-29

All phases completed. Admin settings now save properly and client components (Navbar, Footer) dynamically load from SiteConfig.