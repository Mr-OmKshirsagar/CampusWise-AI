# 🏛️ CampusWise AI • Complete Design System & UI Architecture Reference
### Master Guide for Liquid Glass Aesthetics, Color Palettes, Typography, Animatable Keyframes, UI Components & RAG Interactions

---

## 📑 Table of Contents
1. [Design Philosophy & Aesthetic Law](#1-design-philosophy--aesthetic-law)
2. [Typography & Font Hierarchy](#2-typography--font-hierarchy)
3. [Color Themes, Grading & Palette Matrices](#3-color-themes-grading--palette-matrices)
4. [Liquid Glass Optical Physics, Tokens & CSS Variables](#4-liquid-glass-optical-physics-tokens--css-variables)
5. [Animation Engine, Keyframes & Spring Physics](#5-animation-engine-keyframes--spring-physics)
6. [Comprehensive UI Component Catalog](#6-comprehensive-ui-component-catalog)
   - [6.1 Layout & Navigation (`Navbar`, `Sidebar`, `LiquidSegmentedControl`, `ThemeToggle`)](#61-layout--navigation)
   - [6.2 Document Ingestion Engine (`FileDropzone`, `DocumentTable`, `DocumentViewerModal`)](#62-document-ingestion-engine)
   - [6.3 Conversational AI & RAG Chat (`ChatContainer`, `MessageBubble`, `ChatInput`, `SourceDrawer`)](#63-conversational-ai--rag-chat)
   - [6.4 Analytics & Administrative Dashboard (`MetricCards`, `LatencyGauges`, `Charts`)](#64-analytics--administrative-dashboard)
   - [6.5 Feedback, Overlays & Micro-Components (`ConfirmModal`, `ToastContainer`, `Pagination`, `RagPipelineVisualizer`)](#65-feedback-overlays--micro-components)
7. [End-to-End RAG Ingestion Pipeline & Granular Stages](#7-end-to-end-rag-ingestion-pipeline--granular-stages)
8. [Hardware Acceleration, WebKit Fallbacks & Accessibility (a11y)](#8-hardware-acceleration-webkit-fallbacks--accessibility-a11y)

---

## 1. Design Philosophy & Aesthetic Law

**CampusWise AI** blends Apple’s modern **Liquid Glass** aesthetic with high-density enterprise RAG functionality. Every surface feels alive, tactile, and physically grounded through simulated optical properties:

- **Multi-Tier Optical Refraction**: Background content is diffused across variable blur tiers (`backdrop-blur-md` ➔ `backdrop-blur-3xl`) with saturation enhancement (`backdrop-saturate-150` to `200`) so dark tones stay rich and light tones never turn dull gray.
- **Microscopic Specular Rim Highlights**: Translucent elements feature a directional 1px top-left highlight border (`rgba(255, 255, 255, 0.85)` in Light Mode, `rgba(255, 255, 255, 0.15)` in Dark Mode) to mimic light catching glass bevels.
- **Viscous Momentum & Surface Tension**: Toggles, drawers, and buttons squash, stretch, and glide using fluid cubic beziers (`cubic-bezier(0.16, 1, 0.3, 1)` and `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Zero-Layout-Shift Volumetric Expansion**: Expanding drawers and dropdowns use CSS Grid fractional row animation (`grid-template-rows: 0fr -> 1fr`) to prevent UI jumping.

```
       ┌─────────────────────────────────────────────────────────────┐
       │ 🌟 Specular Top Rim Highlight (border-t: rgba(..., 0.85))   │
       │                                                             │
       │   ☀️ Internal Caustic Radial Glare (radial-gradient)         │
       │                                                             │
       │      [ Dynamic Text / Interactive UI Controls ]             │
       │                                                             │
       │   🌊 Specular Beam Sheen Wave (skew-x-12 animate-sheen)     │
       │                                                             │
       │ 🌑 Ambient Translucent Layer (backdrop-blur-xl + saturate)  │
       │ 💧 Soft Ambient Occlusion Shadow (0 20px 40px -15px ...)    │
       └─────────────────────────────────────────────────────────────┘
```

---

## 2. Typography & Font Hierarchy

### Font Family Stacks ([tailwind.config.js](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/tailwind.config.js))
- **Headings & Display**: `Outfit`, `"Plus Jakarta Sans"`, `Inter`, `"SF Pro Display"`, `sans-serif`
- **Body & Controls**: `"Plus Jakarta Sans"`, `Inter`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"SF Pro Text"`, `sans-serif`
- **Code & Numerical Metrics**: `"JetBrains Mono"`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`

### Typographic Scale & Hierarchy
| Hierarchy Level | Font Family | Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `font-display` | `clamp(2.5rem, 5vw, 4.5rem)` | `font-black` (`900`) | `-tracking-wider` | Landing hero headlines |
| **H1 Page Title**| `font-display` | `2.25rem (36px)` / `2.5rem` | `font-extrabold` (`800`)| `-tracking-tight` | Dashboard & Admin page titles |
| **H2 Section** | `font-display` | `1.5rem (24px)` / `2rem` | `font-bold` (`700`) | `-tracking-tight` | Modal & Card group headers |
| **H3 Card Header**| `font-sans` | `1.125rem (18px)` / `1.75rem`| `font-semibold` (`600`)| `normal` | Dropzone & Filter headers |
| **Body Large** | `font-sans` | `1rem (16px)` / `1.5rem` | `font-normal` (`400`) | `normal` | Chat assistant responses |
| **Body Regular** | `font-sans` | `0.875rem (14px)` / `1.25rem`| `font-normal` (`400`) | `normal` | Table cells, inputs, descriptions |
| **Metadata / Stat**| `font-mono` | `0.75rem (12px)` / `1rem` | `font-bold` (`700`) | `tracking-wide` | Token counts, latency, percentages |

---

## 3. Color Themes, Grading & Palette Matrices

CampusWise AI employs a rich theme engine with tailored color grading across dark obsidian canvases and frosted porcelain light modes.

### 1. Primary Obsidian Canvas (`space`)
Used for backgrounds, deep panels, and elevated dark chrome:
```javascript
space: {
  950: '#030508', // Deepest background canvas
  900: '#070b12', // Surface panel base
  850: '#0b111e', // Elevated container
  800: '#121a2d', // Dropdown & floating sheets
  750: '#1a253e', // Hover states & table rows
  700: '#233252', // Glass borders
  600: '#344874', // Muted strokes
}
```

### 2. Accent Color Grading Matrices
- **Electric Cyan (`campus`)**: Primary brand identity, document upload, active routes, and primary AI responses.
  - `400`: `#38bdf8` | `500`: `#0ea5e9` | `600`: `#0284c7` | `700`: `#0369a1`
- **Royal Cyber Violet (`cyber`)**: Document replacement/update mode, knowledge base re-indexing, and advanced filters.
  - `400`: `#c084fc` | `500`: `#a855f7` | `600`: `#9333ea` | `700`: `#7e22ce`
- **Matrix Emerald (`matrix`)**: Server online heartbeat, verified RAG sources, and success toasts.
  - `400`: `#4ade80` | `500`: `#22c55e` | `600`: `#16a34a` | `700`: `#15803d`
- **Sun Amber (`sun`)**: Offline retry armed state, server wake-up warning, and document size alerts.
  - `400`: `#facc15` | `500`: `#eab308` | `600`: `#ca8a04` | `700`: `#a16207`
- **Rose Crimson**: Server offline errors, document deletion modals, and network interruption alerts.
  - `400`: `#fb7185` | `500`: `#f43f5e` | `600`: `#e11d48` | `700`: `#be123c`

---

## 4. Liquid Glass Optical Physics, Tokens & CSS Variables

The global tokens are registered using standard CSS variables and CSS Houdini `@property` animatable types in [frontend/src/styles/globals.css](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/styles/globals.css):

```css
@property --glass-chrome {
  syntax: '<color>';
  inherits: true;
  initial-value: rgba(255, 255, 255, 0.68);
}

@property --glass-surface {
  syntax: '<color>';
  inherits: true;
  initial-value: rgba(255, 255, 255, 0.58);
}

@layer base {
  :root {
    color-scheme: light;
    --bg-primary: #f6f8fc;
    --bg-secondary: #eef2f7;
    --bg-elevated: #ffffff;
    --glass-chrome: rgba(255, 255, 255, 0.72);
    --glass-surface: rgba(255, 255, 255, 0.58);
    --glass-surface-elevated: rgba(255, 255, 255, 0.84);
    --glass-surface-subtle: rgba(240, 245, 252, 0.62);
    --glass-border: rgba(203, 213, 225, 0.55);
    --glass-border-light: rgba(255, 255, 255, 0.85);
    --glass-border-strong: rgba(14, 165, 233, 0.45);
    --glass-specular: inset 0 1px 1px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.04);
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --accent-glow: rgba(14, 165, 233, 0.18);
  }

  .dark {
    color-scheme: dark;
    --bg-primary: #030508;
    --bg-secondary: #070b12;
    --bg-elevated: #0d1322;
    --glass-chrome: rgba(11, 16, 28, 0.72);
    --glass-surface: rgba(16, 23, 38, 0.62);
    --glass-surface-elevated: rgba(20, 29, 48, 0.82);
    --glass-surface-subtle: rgba(12, 18, 32, 0.68);
    --glass-border: rgba(255, 255, 255, 0.10);
    --glass-border-light: rgba(255, 255, 255, 0.16);
    --glass-border-strong: rgba(14, 165, 233, 0.35);
    --glass-specular: inset 0 1px 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.35);
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #64748b;
    --accent-glow: rgba(14, 165, 233, 0.28);
  }
}
```

---

## 5. Animation Engine, Keyframes & Spring Physics

Registered inside [frontend/tailwind.config.js](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/tailwind.config.js):

### 1. Specular Liquid Sheen Sweep (`liquid-sheen`)
Sweeps a diagonal beam of light across glass elements:
```css
@keyframes liquidSheen {
  0% { transform: translateX(-150%) skewX(-18deg); opacity: 0; }
  25% { opacity: 0.85; }
  75% { opacity: 0.85; }
  100% { transform: translateX(250%) skewX(-18deg); opacity: 0; }
}
```

### 2. Viscous Droplet Squash & Stretch (`liquid-pop`)
Provides tactile momentum feedback when buttons or options are clicked:
```css
@keyframes liquidDropletPop {
  0% { transform: scale(0.94) translateY(2px); }
  45% { transform: scale(1.025) translateY(-1px); }
  75% { transform: scale(0.99) translateY(0.5px); }
  100% { transform: scale(1) translateY(0); }
}
```

### 3. Stage Content Reveal (`stage-reveal`)
Flawlessly reveals new RAG stage transitions with synchronized blur dispersion:
```css
@keyframes stageContentReveal {
  0% { opacity: 0; transform: translateY(10px) scale(0.985); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
```

### 4. Apple Momentum Timing Constants
- `--liquid-ease-apple`: `cubic-bezier(0.16, 1, 0.3, 1)` (Fluid, highly damped deceleration)
- `--liquid-ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (Bouncy tactile pop)

---

## 6. Comprehensive UI Component Catalog

### 6.1 Layout & Navigation

#### 1. Floating Pill Navigation Bar ([Navbar.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Layout/Navbar.jsx))
- **Design Pattern**: Floating island header centered at top of viewport with `backdrop-blur-2xl` and rounded-3xl borders.
- **Embedded Route Switcher**: Integrates `LiquidSegmentedControl` to seamlessly navigate `/`, `/chat`, `/admin/analytics`, and `/admin/documents`.

#### 2. Universal Liquid Segmented Control ([LiquidSegmentedControl.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/LiquidSegmentedControl.jsx))
- **Features**:
  - Horizontal liquid droplet indicator that measures the active tab's bounding box (`offsetLeft`, `offsetWidth`) and smoothly glides to position.
  - Supports both React Router links (`href`) and button event handlers (`onChange`).
  - Specular rim highlight layer with dynamic internal glare.

#### 3. Theme Toggle Button ([ThemeToggle.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/ThemeToggle.jsx))
- **Features**:
  - Liquid glass circular button with 360-degree morphing sun and moon icons.
  - Generates ambient radial flares (`glow-amber` in light mode, `glow-cyan` in dark mode).

---

### 6.2 Document Ingestion Engine

#### 1. Master File Dropzone ([FileDropzone.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/FileDropzone.jsx))
- **Core Capabilities**:
  1. **Dual Ingestion Mode**: Instant toggle between `+ New File` (Electric Cyan) and `Update File` (Royal Violet).
  2. **Volumetric Expanding Accordion**: Reveals document replacement search, dynamic vertical sliding droplet, and target file selector via `grid-template-rows: 0fr -> 1fr`.
  3. **Dual-Gradient Morphing Button**: Seamless crossfade between Cyan and Royal Violet with continuous specular wave sweep.
  4. **Granular Real-Time Stage Indicator**: Displays live OCR, semantic chunking, and embedding generation phases.
  5. **Auto-Reupload Offline Armed Banner**: Consolidated single-toast offline banner that automatically resumes uploading when the backend reconnects.

#### 2. Glass Document Table ([DocumentTable.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/DocumentTable.jsx))
- **Features**:
  - Translucent table rows with hover glow highlighting.
  - Category badges (`Curriculum`, `Fee Structure`, `Exam Schedule`, `Campus Guidelines`).
  - Actions for Viewing, Re-indexing, and Deletion with confirmation modals.

#### 3. Document Viewer Modal ([DocumentViewerModal.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Admin/DocumentViewerModal.jsx))
- **Features**:
  - Full-screen `backdrop-blur-3xl` glass overlay.
  - Split pane: direct PDF preview on the left, chunk inspector with vector token IDs on the right.

---

### 6.3 Conversational AI & RAG Chat

#### 1. Glass Chat Container ([ChatContainer.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Chat/ChatContainer.jsx))
- **Features**:
  - Scroll-pinned conversation history with auto-scrolling during AI stream generation.
  - Integrated RAG status badge showing retrieved source count and response latency.

#### 2. Message Bubbles ([MessageBubble.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Chat/MessageBubble.jsx))
- **User Bubble**: Gradient electric cyan surface (`bg-gradient-to-r from-cyan-600 to-blue-600`) with specular top bevel.
- **AI Bubble**: Translucent obsidian/porcelain glass card (`bg-white/80` dark: `bg-slate-900/70`) with Markdown syntax rendering, code highlighting, and citation pills.

#### 3. Floating Frosted Chat Input ([ChatInput.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Chat/ChatInput.jsx))
- **Features**:
  - Auto-expanding textarea up to 180px height.
  - Glowing circular send button with liquid morphing transition between paper plane and stop spinner.

#### 4. Source Citation Drawer ([SourceDrawer.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Chat/SourceDrawer.jsx))
- **Features**:
  - Sliding glass side sheet showing similarity confidence scores (`89% match`), page numbers, and exact chunk passages.

---

### 6.4 Analytics & Administrative Dashboard

#### 1. Metric Stat Glass Cards ([analytics.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/pages/admin/analytics.jsx))
- **Visual Design**:
  - Rounded-3xl containers with radial caustic flare backgrounds.
  - Live metric counters (`Total Ingested Documents`, `RAG Queries Served`, `Avg Query Latency`, `Token Consumption`).
  - Spring-eased count-up animation via [AnimatedCounter.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/AnimatedCounter.jsx).

#### 2. Latency Gauges & Query Distribution Charts
- **Features**:
  - Real-time latency sparklines with percentile indicators (p50, p95, p99).
  - Category distribution donut charts with translucent glass legends.

---

### 6.5 Feedback, Overlays & Micro-Components

#### 1. Liquid Toast Notifications ([ToastContainer.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/ToastContainer.jsx))
- **Features**:
  - Floating top-right stack with `slideInRight` spring entrance.
  - Variants: Success (Emerald), Info (Cyan), Warning (Amber), Error (Rose).
  - Deduplication engine ensuring single-toast notifications for network errors.

#### 2. Glass Confirmation Modal ([ConfirmModal.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/ConfirmModal.jsx))
- **Features**:
  - Viscous scale-in modal dialog with high-contrast destructive button.

#### 3. RAG Pipeline Visualizer ([RagPipelineVisualizer.jsx](file:///d:/NxtWave%20Projects/CampusWise-AI/frontend/src/components/Common/RagPipelineVisualizer.jsx))
- **Features**:
  - Interactive live animated graph showing vector search ➔ cross-encoder re-ranking ➔ Gemini prompt generation.

---

## 7. End-to-End RAG Ingestion Pipeline & Granular Stages

The document ingestion engine translates backend execution stages into human-readable and technical progress states:

```
[ User File Drop ] ➔ [ Mode Check ]
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  [ New Document ]                      [ Update Document ]
        │                                       │
        ▼                                       ▼
[ Stage 1: Text Layer Parse ]          [ Stage 1: Text Layer Parse ]
        │                                       │
  (If Scanned / Image)                    (If Scanned / Image)
        ▼                                       ▼
[ Stage 2: Gemini Vision OCR ]         [ Stage 2: Gemini Vision OCR ]
        │                                       │
        ▼                                       ▼
[ Stage 3: Semantic Chunking ]         [ Stage 3: Semantic Chunking ]
        │                                       │
        │                              [ Stage 4: Purge Obsolete Vectors ]
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
      [ Stage 5: 768-dim Embeddings & pgvector Batch Indexing ]
                            │
                            ▼
      [ Stage 6: Metadata Synchronization & KB Live Refresh ]
```

### Stage Label Reference Matrix
| Stage ID | Frontend Progress Text | Progress % | Backend Service |
| :--- | :--- | :--- | :--- |
| `STAGE_1` | *Verifying document layout & extracting direct text layer...* | `15% - 25%` | `pdfService.js` (`pdfjsLib`) |
| `STAGE_2` | *Processing scanned pages with Gemini Multimodal Vision OCR...*| `35% - 55%` | `ocrService.js` (`gemini-1.5-flash`) |
| `STAGE_3` | *Executing recursive semantic chunking & token normalization...*| `60% - 70%` | `documentService.js` |
| `STAGE_4` | *Purging obsolete vector chunks from pgvector database...* | `72% - 78%` | `vectorStoreService.js` |
| `STAGE_5` | *Generating 768-dim embeddings & batch indexing into pgvector...*| `80% - 94%` | `vectorStoreService.js` (`text-embedding-004`) |
| `STAGE_6` | *Synchronizing document metadata & finalizing Knowledge Base...* | `98% - 100%` | `documentController.js` |

---

## 8. Hardware Acceleration, WebKit Fallbacks & Accessibility (a11y)

### 1. Zero-Repaint GPU Compositing
To guarantee butter-smooth 60 FPS / 120 FPS transitions:
- Liquid glass surfaces enforce GPU compositing:
  ```css
  .liquid-gpu-layer {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  ```
- Animations are restricted to composited properties (`transform` and `opacity`).

### 2. WebKit / Safari Compatibility
Always supply `-webkit-backdrop-filter` alongside standard `backdrop-filter`:
```css
.liquid-glass {
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
}
```

### 3. Accessibility & Reduced Motion (`prefers-reduced-motion`)
Respect users with vestibular motion sensitivities:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .animate-liquid-sheen,
  .animate-liquid-pop,
  .animate-stage-reveal {
    animation: none !important;
  }
}
```

### 4. WCAG AA Contrast Compliance
All translucent surfaces maintain high-contrast typography:
- **Light Mode**: Text utilizes Slate-900 (`#0F172A`) or Slate-800 (`#1E293B`) ensuring a contrast ratio exceeding **7:1** against frosted porcelain backgrounds.
- **Dark Mode**: Text utilizes Slate-50 (`#F8FAFC`) or Slate-100 (`#F1F5F9`) ensuring a contrast ratio exceeding **12:1** against deep obsidian backdrops.

---
*Created for CampusWise AI • Complete Engineering & Design System Reference* 🏛️✨
