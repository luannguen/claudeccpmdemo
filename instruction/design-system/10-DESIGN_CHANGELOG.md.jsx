# Design Changelog - Version Tracking & Breaking Changes

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Track design system changes, migrations, deprecations

---

## Version 2.0.0 - Major Redesign (2026-01-08)

### 🚀 New Features
- **Design System Documentation Package** (ADMIN-F11)
  - Entity DesignDoc với CRUD interface
  - Markdown editor with preview
  - 10 document categories
  - Version control & changelog

- **AnimatedIcon Library v2.0.0**
  - Centralized icon system
  - 100+ preset icons với animation
  - Deprecated direct lucide-react imports

- **EnhancedModal System**
  - Draggable & resizable modals
  - Maximize/minimize controls
  - Persistent positioning
  - Mobile gestures (swipe down to close)

### ⚠️ Breaking Changes
- **Icon imports**: MUST use `Icon` from `AnimatedIcon.jsx`, NO direct lucide-react imports
- **Modal system**: Replace custom modals với EnhancedModal/BaseModal
- **Confirm dialogs**: Replace `window.confirm()` với `useConfirmDialog()`

### 🔧 Migrations Required
```jsx
// BEFORE
import { CheckCircle } from 'lucide-react';

// AFTER
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
<Icon.CheckCircle />
```

---

## Version 1.5.0 - Component Library Expansion (2025-12-15)

### 🚀 New Components
- `BaseModal` wrapper with presets
- `LoadingState`, `EmptyState`, `ErrorState` shared components
- `ConfirmDialog` component (useConfirmDialog hook)

### 📝 Updates
- Button: Added `destructive` variant
- Badge: Added semantic color variants (success, warning, error)
- Card: Added hover shadow effect

---

## Version 1.0.0 - Initial Design System (2025-10-01)

### 🎨 Foundations
- Color palette: Violet primary, semantic colors
- Spacing: 4px base unit
- Typography: Inter font family
- Shadows: 4-level elevation
- Border radius: sm-3xl scale

### 📦 Core Components
- Button (5 variants, 3 sizes)
- Card (header, content, footer)
- Input (validation states)
- Badge (4 variants)
- Modal (shadcn Dialog)

---

## Deprecation Schedule

### Deprecated (Remove by v3.0.0)
| Component/Pattern | Deprecated | Replacement | Remove by |
|-------------------|------------|-------------|-----------|
| Direct lucide imports | v2.0.0 | AnimatedIcon | v3.0.0 |
| window.confirm() | v2.0.0 | useConfirmDialog | v3.0.0 |
| Custom modal wrapper | v2.0.0 | EnhancedModal | v3.0.0 |
| window.location.* | v2.0.0 | react-router hooks | v3.0.0 |

### Recently Removed
- `CustomButton` component (use shadcn Button)
- `LegacyModal` (replaced by EnhancedModal)
- `AlertBox` (replaced by AlertDialog)

---

## Migration Guides

### 1. Icon Migration (v1.x → v2.0)
```jsx
// Step 1: Find all lucide-react imports
// grep -r "from 'lucide-react'" components/

// Step 2: Replace with AnimatedIcon
// BEFORE
import { CheckCircle, AlertCircle } from 'lucide-react';
<CheckCircle className="w-5 h-5" />

// AFTER
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
<Icon.CheckCircle size={20} />

// Step 3: Check if icon exists in Icon.*
// If not, add to AnimatedIcon.jsx first
```

### 2. Modal Migration
```jsx
// BEFORE
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {content}
  </DialogContent>
</Dialog>

// AFTER
<EnhancedModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Title"
>
  {content}
</EnhancedModal>
```

### 3. Confirm Dialog Migration
```jsx
// BEFORE
if (window.confirm('Xóa?')) {
  deleteItem();
}

// AFTER
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

const { showConfirm } = useConfirmDialog();

const confirmed = await showConfirm({
  title: 'Xác nhận xóa',
  message: 'Bạn có chắc chắn?',
  type: 'danger'
});
if (confirmed) deleteItem();
```

---

## Breaking Changes Impact Assessment

### v2.0.0 Impact
| Area | Files Affected | Effort | Priority |
|------|----------------|--------|----------|
| Icon imports | ~150 files | Medium | High |
| Modal system | ~40 files | High | High |
| Confirm dialogs | ~30 files | Low | Medium |
| Routing hooks | ~20 files | Low | Medium |

**Estimated migration time**: 2-3 days

---

## Future Roadmap

### v3.0.0 (Planned: Q2 2026)
- **Dark mode** support (full theme system)
- **Component composition** API
- **Accessibility** enhancements (WCAG AAA)
- **Remove all deprecated** patterns

### v3.1.0 (Planned: Q3 2026)
- **Design tokens** API (programmatic access)
- **Figma integration** (sync design → code)
- **Component variants** generator

---

## Changelog Entry Template

```markdown
## Version X.Y.Z - Release Name (YYYY-MM-DD)

### 🚀 New Features
- Feature description
- Component additions

### 📝 Updates
- Component improvements
- Bug fixes

### ⚠️ Breaking Changes
- What changed
- Migration guide

### 🔧 Deprecations
- What's deprecated
- Timeline for removal
- Replacement suggestion

### 🐛 Bug Fixes
- Issue description
- Fix applied
```

---

## Version Numbering (Semantic Versioning)

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (v1 → v2)
MINOR: New features, backward compatible (v1.0 → v1.1)
PATCH: Bug fixes (v1.0.0 → v1.0.1)
```

**Examples:**
- New component: **MINOR** (v1.5 → v1.6)
- Breaking icon system: **MAJOR** (v1.x → v2.0)
- Fix button padding: **PATCH** (v1.5.2 → v1.5.3)

---

> **Ghi nhớ**: Track versions, document breaking changes, migration guides, deprecation timeline, semantic versioning (MAJOR.MINOR.PATCH).