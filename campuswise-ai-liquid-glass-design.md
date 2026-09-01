# 🏛️ CampusWise AI • Liquid Glass Design System & Engineering Reference
### Project-Specific Architecture, UI Physics, Reusable Components, Animations, Responsive Design & Ingestion Workflow

---

## 📑 Table of Contents
1. [Executive Summary & CampusWise Identity](#1-executive-summary--campuswise-identity)
2. [Color Palette, Contrast Tokens & Theme Matrix](#2-color-palette-contrast-tokens--theme-matrix)
3. [Global CSS Engine & Keyframe Physics](#3-global-css-engine--keyframe-physics)
4. [CampusWise AI Liquid Glass Components](#4-campuswise-ai-liquid-glass-components)
   - [4.1 Navigation Bar & Route Pill Switcher](#41-navigation-bar--route-pill-switcher)
   - [4.2 Document Ingestion Mode Switcher (`+ New` vs `Update`)](#42-document-ingestion-mode-switcher--new-vs-update)
   - [4.3 Volumetric Expanding Document Replacement Accordion](#43-volumetric-expanding-document-replacement-accordion)
   - [4.4 Dual-Gradient Morphing Upload Action Button](#44-dual-gradient-morphing-upload-action-button)
   - [4.5 Real-Time Ingestion Stage & Caustic Progress Indicator](#45-real-time-ingestion-stage--caustic-progress-indicator)
   - [4.6 Offline Resilience & Auto-Reupload Notification Banner](#46-offline-resilience--auto-reupload-notification-banner)
   - [4.7 Analytics Stat Glass Cards & Latency Indicators](#47-analytics-stat-glass-cards--latency-indicators)
5. [Responsive UI System](#5-responsive-ui-system)
   - [5.1 Breakpoint Map & Strategy](#51-breakpoint-map--strategy)
   - [5.2 Fixed Liquid Glass Navbar — Scroll Reactive](#52-fixed-liquid-glass-navbar--scroll-reactive)
   - [5.3 Mobile Floating Drawer Navigation](#53-mobile-floating-drawer-navigation)
   - [5.4 Liquid Dismiss Animation System](#54-liquid-dismiss-animation-system)
   - [5.5 Native HTML5 Canvas PDF Viewer](#55-native-html5-canvas-pdf-viewer)
6. [End-to-End RAG Ingestion Pipeline & Real-Time Stages](#6-end-to-end-rag-ingestion-pipeline--real-time-stages)
7. [Component File Hierarchy & Architecture Map](#7-component-file-hierarchy--architecture-map)
8. [Developer Guidelines & Best Practices](#8-developer-guidelines--best-practices)

---

## 1. Executive Summary & CampusWise Identity

**CampusWise AI** is an enterprise-grade, multimodal Retrieval-Augmented Generation (RAG) assistant designed for college campus navigation, fee structures, academic guidelines, exam schedules, and scanned balance sheets.

The user interface is powered by a **Liquid Glass Design System** that fuses optical physics with Apple-grade fluid momentum:
- **Refractive Multi-Tier Translucency**: Diffuses backgrounds using `backdrop-blur-xl` / `backdrop-blur-2xl` with saturation boosts (`backdrop-saturate-150`).
- **Chromatic Specular Rim Edges**: Microscopic 1px top/left edge highlights that catch simulated ambient light.
- **Dynamic Viscous Morphing**: Instant, spring-eased visual transitions between ingestion states (`New Document` in Electric Cyan ↔ `Update File` in Royal Violet).
- **Zero-Layout-Shift Volumetric Accordions**: Smooth fractional-row animations (`grid-template-rows: 0fr -> 1fr`) for replacement selection drawers.
- **Full Cross-Device Responsiveness**: Every component adapts fluidly from mobile (`375px`) through tablet (`768px`) to desktop (`1280px+`).

---

## 2. Color Palette, Contrast Tokens & Theme Matrix

CampusWise AI utilizes distinct chromatic signatures to provide instant visual feedback on actions and document states:

| Role / Feature | Light Mode Tokens (`#F8FAFC`) | Dark Mode Tokens (`#0B0F19`) | Tailwind Palette |
| :--- | :--- | :--- | :--- |
| **New Document / Primary** | `bg-white/80 border-cyan-400/30 text-cyan-800` | `bg-slate-900/70 border-cyan-500/30 text-cyan-300` | `cyan-500` ➔ `sky-500` ➔ `blue-600` |
| **Update Document / Target** | `bg-purple-50/80 border-purple-400/30 text-purple-800` | `bg-slate-900/70 border-purple-500/30 text-purple-300` | `violet-600` ➔ `purple-600` ➔ `indigo-600` |
| **Server Online / Success** | `bg-emerald-500/10 border-emerald-500/30 text-emerald-800` | `bg-emerald-500/15 border-emerald-500/30 text-emerald-300` | `emerald-500` ➔ `teal-600` |
| **Auto-Retry Armed / Warning**| `bg-amber-500/10 border-amber-500/30 text-amber-800` | `bg-amber-500/15 border-amber-500/30 text-amber-300` | `amber-500` ➔ `yellow-600` |
| **Server Offline / Error** | `bg-rose-500/10 border-rose-500/30 text-rose-800` | `bg-rose-500/15 border-rose-500/30 text-rose-300` | `rose-500` ➔ `red-600` |

### CSS Variables ([frontend/src/styles/globals.css](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/styles/globals.css))
```css
:root {
  --cw-glass-base: rgba(255, 255, 255, 0.75);
  --cw-glass-border: rgba(255, 255, 255, 0.85);
  --cw-glass-glow: inset 0 1px 2px 0 rgba(255, 255, 255, 0.95);
  --cw-glass-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
}

.dark {
  --cw-glass-base: rgba(15, 23, 42, 0.65);
  --cw-glass-border: rgba(255, 255, 255, 0.12);
  --cw-glass-glow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
  --cw-glass-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.60);
}
```

---

## 3. Global CSS Engine & Keyframe Physics

The animation engine is registered in `frontend/tailwind.config.js` and global stylesheets:

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '400px',  // Extra-small phones
      'sm': '640px',
      'md': '768px',  // Tablets
      'lg': '1024px', // Laptops
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      animation: {
        'liquid-sheen':    'liquidSheen 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'liquid-pop':      'liquidDropletPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'liquid-dismiss':  'liquidDropletDismiss 0.28s cubic-bezier(0.4, 0, 1, 1) both',
        'fade-in':         'fadeIn 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
        'fade-out':        'fadeOut 0.22s cubic-bezier(0.25, 1, 0.5, 1) both',
        'pulse-slow':      'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        liquidSheen: {
          '0%':   { transform: 'translateX(-150%) skewX(-18deg)', opacity: '0' },
          '25%':  { opacity: '0.85' },
          '75%':  { opacity: '0.85' },
          '100%': { transform: 'translateX(250%) skewX(-18deg)', opacity: '0' },
        },
        liquidDropletPop: {
          '0%':   { opacity: '0', transform: 'scale(0.92) translateY(-8px)', filter: 'blur(4px)' },
          '60%':  { opacity: '1', transform: 'scale(1.025) translateY(1px)', filter: 'blur(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
        },
        liquidDropletDismiss: {
          '0%':   { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
          '40%':  { opacity: '0.6', transform: 'scale(0.97) translateY(-4px)', filter: 'blur(1px)' },
          '100%': { opacity: '0', transform: 'scale(0.9) translateY(-12px)', filter: 'blur(6px)' },
        },
        fadeIn:  { '0%': { opacity: '0', transform: 'translateY(3px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
      },
      transitionTimingFunction: {
        'liquid-apple':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'liquid-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
};
```

---

## 4. CampusWise AI Liquid Glass Components

### 4.1 Navigation Bar & Route Pill Switcher
- **File**: [frontend/src/components/Layout/Navbar.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Layout/Navbar.jsx) & [frontend/src/components/Common/LiquidSegmentedControl.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/LiquidSegmentedControl.jsx)
- **Description**: Fixed-top glass navbar with scroll-reactive transparency morphing and links to `Home (/)`, `AI Assistant (/chat)`, `Analytics (/admin/analytics)`, and `Documents (/admin/documents)`.
- **Mechanics**: As the user navigates routes, a liquid droplet indicator calculates target coordinates (`offsetLeft`, `offsetWidth`) and smoothly glides to the active tab with 500ms Apple momentum.
- **Responsive Behavior**:
  - Desktop (`md+`): Full segmented control + theme toggle + user badge + logout button all visible in the navbar.
  - Mobile (`< md`): Segmented control hidden; hamburger `☰` button shown; full navigation inside floating glass drawer.

```jsx
<LiquidSegmentedControl
  size="sm"
  value={currentTab}
  options={[
    { id: 'home', label: 'Home', href: '/', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'chat', label: 'AI Assistant', href: '/chat', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'Documents', href: '/admin/documents', icon: <FileText className="w-3.5 h-3.5" /> },
  ]}
/>
```

---

### 4.2 Document Ingestion Mode Switcher (`+ New` vs `Update`)
- **File**: [frontend/src/components/Admin/FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx)
- **Description**: Sits in the document header space, letting the administrator toggle between uploading a fresh document or updating/replacing an existing indexed file.
- **Mechanics**:
  - `+ New Document`: Electric cyan theme with subtle document icon.
  - `Update Existing File`: Royal violet theme with replacement cycle icon.
  - Liquid sliding droplet highlights the selection with zero layout jitter.

```jsx
<LiquidSegmentedControl
  size="md"
  value={ingestionMode}
  onChange={(val) => {
    setIngestionMode(val);
    if (val === 'new') setSelectedReplaceDocId(null);
  }}
  options={[
    {
      id: 'new',
      label: 'New File',
      icon: <Plus className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'update',
      label: 'Update File',
      icon: <RefreshCw className="w-4 h-4 text-purple-500" />,
    },
  ]}
  className="w-full shadow-lg"
/>
```

---

### 4.3 Volumetric Expanding Document Replacement Accordion
- **File**: [frontend/src/components/Admin/FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx)
- **Description**: When `Update File` is active, the container expands volumetrically using CSS Grid fractional tracks (`grid-rows-[1fr]`), revealing the search bar, active selected document card, and interactive document selector.
- **Mechanics**:
  - **Zero Layout Shift**: Avoids height calculations by leveraging `transition-[grid-template-rows,opacity] duration-700 ease-liquid-apple`.
  - **Dynamic Vertical Sliding Droplet**: When the dropdown list is open, a liquid droplet indicator follows the selected document vertically via `setListDropletStyle({ top, height, opacity })`.
  - **Interactive Search & Filter**: Real-time filtering by document title or original filename.

```jsx
<div
  className={`grid transition-[grid-template-rows,opacity] duration-700 ease-liquid-apple ${
    ingestionMode === 'update'
      ? 'grid-rows-[1fr] opacity-100'
      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
  }`}
>
  <div className="overflow-hidden">
    <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 backdrop-blur-2xl shadow-xl relative">
      {/* Specular Rim */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      
      {/* Search Input & Selection Card */}
      {/* ... */}
    </div>
  </div>
</div>
```

---

### 4.4 Dual-Gradient Morphing Upload Action Button
- **File**: [frontend/src/components/Admin/FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx)
- **Description**: The primary action button at the bottom of the dropzone dynamically adapts to the active mode with synchronized crossfades and tactile squash & stretch.
- **Visual Features**:
  1. **Dual Gradient Backdrop**: Layer 1 (Cyan/Sky) and Layer 2 (Royal Violet) crossfade over 600ms.
  2. **Specular Wave Sheen**: A continuous light beam (`-inset-full skew-x-12 animate-liquid-sheen`) sweeps across the surface.
  3. **Tactile Scale Rebound**: Slight viscous compression (`scale-[1.015]`) on mode change.

```jsx
<button
  type="button"
  onClick={performUpload}
  disabled={!file || isUploading}
  className="group relative w-full overflow-hidden rounded-2xl px-6 py-4 font-semibold text-white shadow-xl transition-all duration-500 ease-liquid-apple hover:shadow-2xl active:scale-[0.98] disabled:opacity-50"
>
  {/* Layer 1: New File Gradient */}
  <div
    className={`absolute inset-0 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 transition-opacity duration-600 ${
      ingestionMode === 'new' ? 'opacity-100' : 'opacity-0'
    }`}
  />

  {/* Layer 2: Update File Gradient */}
  <div
    className={`absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 transition-opacity duration-600 ${
      ingestionMode === 'update' ? 'opacity-100' : 'opacity-0'
    }`}
  />

  {/* Specular Top Rim */}
  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

  {/* Continuous Liquid Beam Sheen */}
  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-liquid-sheen pointer-events-none" />

  {/* Button Content */}
  <span className="relative z-10 flex items-center justify-center gap-2">
    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
    <span>{ingestionMode === 'update' ? 'Replace & Re-Index Document' : 'Upload & Process Document'}</span>
  </span>
</button>
```

---

### 4.5 Real-Time Ingestion Stage & Caustic Progress Indicator
- **File**: [frontend/src/components/Admin/FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx)
- **Description**: Displays exact, granular feedback in technical and user-friendly language synchronized with backend RAG processing.
- **Stage Progression Matrix**:

| Stage No. | Technical & User-Friendly Stage Label | Progress % | Typical Duration |
| :--- | :--- | :--- | :--- |
| **Stage 1** | *Verifying document integrity & parsing direct PDF text layer...* | `15% - 25%` | < 1.5s |
| **Stage 2 (OCR)** | *Processing scanned pages with Gemini Multimodal Vision OCR...* | `35% - 55%` | 5s - 15s (Large PDFs) |
| **Stage 3** | *Executing recursive semantic chunking & token normalization...* | `60% - 70%` | < 1.0s |
| **Stage 4 (Update)**| *Purging obsolete vector chunks from pgvector database...* | `72% - 78%` | < 0.8s |
| **Stage 5** | *Generating 768-dim embeddings & batch indexing into pgvector...* | `80% - 94%` | 2s - 4s |
| **Stage 6** | *Synchronizing document metadata & finalizing RAG Knowledge Base...* | `98% - 100%` | Complete |

```jsx
{isUploading && (
  <div className="space-y-2 p-4 rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg">
    <div className="flex items-center justify-between text-xs font-semibold">
      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{uploadStage}</span>
      </div>
      <span className="font-mono text-cyan-700 dark:text-cyan-300">{uploadProgress}%</span>
    </div>

    {/* Caustic Glass Progress Track */}
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900/10 dark:bg-slate-900/60 p-0.5 shadow-inner">
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-500 ease-liquid-apple"
        style={{ width: `${uploadProgress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-liquid-sheen" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </div>
    </div>
  </div>
)}
```

---

### 4.6 Offline Resilience & Auto-Reupload Notification Banner
- **File**: [frontend/src/components/Admin/FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx) & [frontend/src/store/serverHealthStore.js](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/store/serverHealthStore.js)
- **Description**: If the backend is offline or sleeping during an upload attempt:
  1. Issues **exactly one** consolidated warning toast.
  2. Arms the dropzone with a pulsing amber `Auto-Upload Armed` badge.
  3. Automatically re-executes the ingestion pipeline the moment `isServerOnline` becomes `true`.

```jsx
{pendingOfflineRetry && (
  <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-xl flex items-center justify-between shadow-lg">
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
      </span>
      <div>
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Auto-Upload Armed</h4>
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Upload paused due to server inactivity. Will resume automatically on reconnect.
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 4.7 Analytics Stat Glass Cards & Latency Indicators
- **File**: [frontend/src/pages/admin/analytics.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/pages/admin/analytics.jsx)
- **Description**: Translucent glass stat containers with colored radial caustic glows, live query latency gauges, and token consumption breakdowns.

```jsx
<div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-6 shadow-xl hover:border-cyan-500/40 transition-all duration-500">
  {/* Internal Caustic Flare */}
  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
  
  {/* Specular Rim */}
  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average RAG Latency</h3>
  <div className="mt-2 flex items-baseline gap-2">
    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">420ms</span>
    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">-18% vs last week</span>
  </div>
</div>
```

---

## 5. Responsive UI System

### 5.1 Breakpoint Map & Strategy

| Breakpoint | Width | Target | Description |
| :--- | :--- | :--- | :--- |
| *(base)* | `< 400px` | Extra-small phones | Single-column, large tap targets |
| `xs` | `≥ 400px` | Small phones | Slightly wider containers |
| `sm` | `≥ 640px` | Large phones | Two-column in select layouts |
| `md` | `≥ 768px` | Tablets | Desktop nav visible, condensed layout |
| `lg` | `≥ 1024px` | Laptops | Full desktop layout with hover effects |
| `xl` | `≥ 1280px` | Large desktops | Extended content areas |

Custom `xs` is declared in `tailwind.config.js → theme.screens`.

---

### 5.2 Fixed Liquid Glass Navbar — Scroll Reactive

**File**: [frontend/src/components/Layout/Navbar.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Layout/Navbar.jsx)

The navbar uses `position: fixed` (not sticky) so it stays anchored at the top across all scroll positions and page heights.

#### Scroll Reactive Morphing
A `useEffect` scroll listener updates `isScrolled` state (`window.scrollY > 8`):
- **At top of page**: `bg-white/40 dark:bg-transparent backdrop-blur-xl` — nearly invisible glass.
- **On scroll**: `bg-white/80 dark:bg-[#070b12]/85 backdrop-blur-3xl border-b` — deeply blurred frosted glass with border shadow.
- Transition: `duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`

#### Per-Screen Navbar Contents

| Screen | Nav Pill | Theme Toggle | User Badge | Logout Button | Hamburger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Mobile (`< md`) | ❌ Hidden | ❌ In drawer | ❌ In drawer | ❌ In drawer | ✅ Shown |
| Tablet (`md`) | ✅ Shown | ✅ Shown | ✅ Shown | ✅ `h-9 px-2.5` | ❌ Hidden |
| Desktop (`lg+`) | ✅ Shown | ✅ Shown | ✅ Shown | ✅ Hover-expands | ❌ Hidden |

> **Important**: All page wrappers must include `pt-16` (64px top padding) to offset the fixed navbar height.

#### Logout Button — Tablet vs Desktop
The logout button uses a flat, uniform size (`h-9 px-2.5`) across all `md+` screens. On desktop hover it expands the "Logout" label via `max-w-0 → max-w-[70px]` transition. No responsive size differences that would shrink the button on tablet.

---

### 5.3 Mobile Floating Drawer Navigation

**File**: [frontend/src/components/Layout/Navbar.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Layout/Navbar.jsx)

The mobile menu is a **floating overlay** — it never pushes page content down.

#### State Management
```jsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isClosing, setIsClosing] = useState(false);

// Animated close: plays dismiss animation, then unmounts after 260ms
const closeMobileMenu = () => {
  setIsClosing(true);
  setTimeout(() => {
    setMobileMenuOpen(false);
    setIsClosing(false);
  }, 260);
};
```

#### Overlay Architecture
```
┌─────── Fixed Navbar Bar (z-50, h-16) ───────────────────────┐
│  CampusWise AI logo   [Nav Pills]   [🌙]  [Admin]  [→]      │
└─────────────────────────────────────────────────────────────┘
│ ← Frosted Backdrop (z-40, top-16, NOT covering navbar) ──── │
│ ┌── Floating Glass Drawer (z-50, top-20) ─────────────────┐ │
│ │  [Admin / admin@campus.edu]          [ADMIN]            │ │
│ │  🏠 Home                                                │ │
│ │  💬 AI Assistant                                        │ │
│ │  📄 Documents                                          │ │
│ │  📊 Analytics                                          │ │
│ │  ─────────────────────────────────────                 │ │
│ │  ✨ Appearance Mode     [☀️ ●●● 🌙]                     │ │
│ │  [→ Sign Out]                                          │ │
│ └────────────────────────────────────────────────────────┘ │
│   (Clicking outside → closeMobileMenu() → dismiss anim)    │
└─────────────────────────────────────────────────────────────┘
```

#### Dismiss Triggers
All of the following route through `closeMobileMenu()` for the animated dismiss:
- Hamburger `☰` / `✕` re-click
- Click or tap anywhere outside the drawer panel (backdrop or page content)
- `Escape` key press
- Any nav link (Home, AI Assistant, Documents, Analytics)
- Sign Out button
- Sign In or Get Started links

#### Drawer Contents
- **User identity card**: name, email, role badge (ADMIN/user)
- **Nav links**: Emerald (Home), Cyan (AI Assistant), Amber (Documents), Purple (Analytics) — with active state highlight
- **Appearance row**: `LiquidSegmentedControl` theme toggle (☀️ / 🌙) — relocated from desktop bar
- **Sign Out** button (rose accent) or Sign In / Get Started buttons

---

### 5.4 Liquid Dismiss Animation System

All animated dismissals (drawer, dropdown, modals) use a shared `isClosing` + `setTimeout` pattern:

```
Open  → animate-liquid-pop     (scale 0.92 → 1.025 → 1, blur clears, 380ms)
Close → animate-liquid-dismiss (scale 1 → 0.97 → 0.9, blur builds, floats up, 280ms)
```

**Backdrop pairing**:
```
Open  → animate-fade-in  (opacity 0 → 1, 220ms)
Close → animate-fade-out (opacity 1 → 0, 220ms)
```

The backdrop element ALWAYS uses `top-16` (never `inset-0`) so the navbar bar remains above the overlay and accessible.

---

### 5.5 Native HTML5 Canvas PDF Viewer

**File**: [frontend/src/components/Admin/PdfCanvasViewer.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/PdfCanvasViewer.jsx)

**Problem solved**: `<iframe>` PDF embeds on iOS Safari and Android Chrome are sandboxed — touch scrolling is blocked and only page 1 renders as a static image.

**Solution**: `pdfjs-dist` renders each page onto individual HTML5 `<canvas>` elements inside a native scrollable container.

```jsx
// Installation
// npm install pdfjs-dist

// PdfCanvasViewer renders pages as:
// <div style="overflow-y: auto; -webkit-overflow-scrolling: touch;">
//   {pages.map(page => <canvas key={page} ref={...} />)}
// </div>
```

**Capabilities**:
- ✅ Fluid touch/swipe scroll (iOS Safari + Android Chrome)
- ✅ Multi-page rendering (all pages loaded on mount)
- ✅ Pinch-to-zoom support
- ✅ Full resolution canvas output
- ✅ Works inside modal containers at any viewport size

**Integration in DocumentViewerModal.jsx**:
```jsx
import PdfCanvasViewer from './PdfCanvasViewer.jsx';

// In the "File Preview" tab:
<PdfCanvasViewer
  fileUrl={fileUrl}
  documentTitle={doc.title || doc.originalName}
/>
```

---

## 6. End-to-End RAG Ingestion Pipeline & Real-Time Stages

```
User Drops Document (.pdf / .png / .jpg)
    │
    ▼
FileDropzone Ingestion Mode Check ('new' vs 'update')
    │
    ▼
Stage 1: Direct Text Layer Extraction via PDF.js (pdfService.js)
    ├── If text extracted (Digital PDF) ➔ Skip OCR
    └── If 0 text extracted (Scanned PDF/Images)
            │
            ▼
Stage 2: Multimodal Vision OCR via Google Gemini 1.5 Flash (ocrService.js)
    │
    ▼
Stage 3: Recursive Semantic Chunking & Token Normalization (documentService.js)
    │
    ▼
Stage 4 (If Update Mode): Obsolete Vector Chunk Purge in pgvector
    │
    ▼
Stage 5: 768-dim Embeddings Generation (text-embedding-004) & pgvector Indexing
    │
    ▼
Stage 6: Synchronize Document Metadata & Live Assistant Refresh
```

---

## 7. Component File Hierarchy & Architecture Map

```
CampusWise-AI/
├── backend/
│   ├── src/
│   │   ├── controllers/documentController.js   # Upload & update handlers
│   │   ├── services/
│   │   │   ├── documentService.js             # Chunking, vector indexing & replace pipeline
│   │   │   ├── pdfService.js                  # PDF text extraction & OCR fallback routing
│   │   │   ├── ocrService.js                  # Multimodal Gemini OCR engine
│   │   │   └── vectorStoreService.js          # PostgreSQL pgvector embeddings indexer
│   │   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   │   ├── FileDropzone.jsx           # Master Liquid Glass upload & update engine
│   │   │   │   ├── DocumentViewerModal.jsx    # Glass document viewer with PDF canvas
│   │   │   │   └── PdfCanvasViewer.jsx        # Native HTML5 Canvas PDF renderer (mobile-safe)
│   │   │   ├── Layout/
│   │   │   │   └── Navbar.jsx                 # Fixed glass navbar (scroll-reactive + responsive drawer)
│   │   │   └── Common/
│   │   │       ├── LiquidSegmentedControl.jsx # Universal sliding pill switcher
│   │   │       ├── ThemeToggle.jsx            # Light/dark mode toggle (glass style)
│   │   │       ├── GlassIcon.jsx              # Glass icon wrapper component
│   │   │       └── Toast.jsx                  # Glass alert notifications
│   │   ├── pages/
│   │   │   ├── admin/documents.jsx            # Document repository & dropzone container
│   │   │   ├── admin/analytics.jsx            # Glass analytics dashboard
│   │   │   ├── chat/index.jsx                 # Liquid conversational RAG UI
│   │   │   └── index.jsx                      # Hero landing page
│   │   ├── store/
│   │   │   ├── authStore.js                   # Authentication & role state
│   │   │   └── serverHealthStore.js           # Server health & auto-reconnect trigger
│   │   ├── styles/globals.css                 # Global Liquid Glass tokens, keyframes & utility classes
│   │   └── App.jsx                            # Router with pt-16 offset for fixed navbar
│   ├── tailwind.config.js                     # Liquid animation, custom screens & cubic bezier rules
│   └── index.html                             # App entry with Google Fonts (Plus Jakarta Sans, Outfit)
```

---

## 8. Developer Guidelines & Best Practices

1. **Memoize Filtered Arrays & State Callbacks**:
   - Always wrap array filter operations (such as document search) with `useMemo(() => ..., [documents, search])` to prevent React render loops (`Maximum update depth exceeded`).

2. **Use Fractional Grid Expansion**:
   - For all expanding/collapsible liquid glass cards, use `grid-template-rows: 0fr -> 1fr` instead of calculating pixel heights.

3. **Preserve Specular Rim Highlights**:
   - Every liquid glass container must have a `1px` gradient specular top rim (`bg-gradient-to-r from-transparent via-white/80 to-transparent`) to ensure optical depth.

4. **Enforce Single Unified Notifications**:
   - When handling offline/network interruptions, silence Axios interceptor errors (`{ silent: true }`) and funnel status changes through `useServerHealthStore` for a clean, non-repetitive toast experience.

5. **Responsive Rules**:
   - Always add `md:hidden` to mobile-only elements and `hidden md:flex` to desktop-only elements.
   - Test every new UI component at `375px`, `768px`, and `1280px` viewport widths before committing.
   - Never use `<iframe>` for PDF embeds — use `PdfCanvasViewer` for mobile-safe rendering.

6. **Animated Dismiss Pattern**:
   - Never call `setMobileMenuOpen(false)` or `setDropdownOpen(false)` directly for dismissal.
   - Always use the `isClosing + setTimeout(260ms)` pattern paired with `animate-liquid-dismiss` so users see the glass panel collapse fluidly before it unmounts.

7. **Fixed Navbar Offset**:
   - All page-level containers in `App.jsx` (and any full-height pages) must include `pt-16` to compensate for the `h-16` fixed navbar. Failure to do so causes content to hide behind the navbar.

8. **Backdrop Placement**:
   - Overlay backdrops for mobile drawers must use `top-16` (not `inset-0`) so the fixed navbar stays above the dimmed layer and remains interactive.

---
*Created for CampusWise AI • Engineering & Design Reference* 🏛️✨
*Last updated: Responsive UI System added — fixed navbar, mobile drawer with liquid animations, native PDF canvas viewer, tablet logout fix.*
