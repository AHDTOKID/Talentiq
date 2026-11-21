---
name: Talentiq Precision Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4.25rem
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.03em
  data-metric:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, institutional-grade atmosphere tailored for talent acquisition leaders, executive recruiters, and enterprise HR operations. The visual tone balances clinical data precision with fluid, forward-looking AI intelligence. 

The aesthetic model synthesizes **Corporate Modern** with disciplined **Glassmorphic Accents**. It relies on immaculate structural grids, deep contrast boundaries, and razor-sharp typographic alignment. The interface rejects unnecessary ornamental decoration, relying instead on surface elevation, deliberate micro-textures, and luminous status states to convey computational authority and confidence.

## Colors

The palette is engineered for prolonged operational focus, high legibility across dense candidate matrices, and instant cognitive parsing of AI outputs.

- **Primary (`#2563EB`)**: Anchor for core interactive triggers, selected states, and progressive indicators.
- **Secondary (`#0F172A`)**: The authority tone, reserved for display typography, critical headers, and structural chrome framing.
- **Tertiary (`#10B981`)**: Dedicated exclusively to match validation, verified competencies, and positive talent analytics.
- **Neutral (`#64748B`)**: Systemic utility color for metadata, column headers, secondary iconography, and structural line dividers.

### Canvas & Surface Hierarchy
- **Canvas Base**: `#F8FAFC` provides a daylight backdrop that prevents screen glare during multi-hour screening sessions.
- **Surface Elevation 0 (Resting Cards & Panes)**: `#FFFFFF`.
- **Surface Elevation 1 (Hover / Sub-panels)**: `#F1F5F9`.
- **Surface Elevation Overlay (AI Scoring Modals & Flyouts)**: `rgba(255, 255, 255, 0.85)` with backdrop filtration.

## Typography

The type system pairs **Plus Jakarta Sans** for high-tier structural elements and headlines with **Inter** for data-dense layouts, operational views, and interface controls.

### Implementation Rules
- Apply `font-feature-settings: "tnum" 1, "cv05" 1, "cv11" 1` across all numerical data points, scoring tables, candidate match badges, and analytical dashboards to guarantee exact column alignment and tabular figures.
- `label-sm` is strictly uppercase when deployed for section meta-headers, candidate lifecycle status flags, or qualification scores.
- Never use font weights below `400` in operational environments to maintain legibility against variable container backgrounds.

## Layout & Spacing

The layout is built upon an 8pt modular coordinate system utilizing a **12-column responsive fluid grid** with strict layout boundaries.

### Form Factor Behavior
- **Desktop (1280px and above)**: Full 12-column system, `margin: 2rem`, `gutter: 1.5rem`. Left navigation rails lock at `260px`, candidate inspection flyouts occupy a persistent `480px` drawer on the right.
- **Tablet (768px - 1279px)**: 8-column layout, `margin: 1.5rem`, `gutter: 1rem`. Primary navigation compresses to a collapsed icon bar (`64px`); candidate inspection pane switches to an anchored modal overlay.
- **Mobile (<768px)**: 4-column layout, `margin-mobile: 1rem`, `gutter-mobile: 0.75rem`. Candidate review operates strictly as a stacked, single-axis flow with sticky bottom action controls.

## Elevation & Depth

Visual separation relies on a three-tier model combining structural border lines with subtle glassmorphic illumination and micro-shadows.

### Elevation Hierarchy
- **Level 0 (Flat/Substrate)**: Bordered with `1px solid #E2E8F0`. No shadow. Applied to main working panels, empty states, and standard list containers.
- **Level 1 (Interactive Cards & Tables)**: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)` wrapped in a `1px solid #E2E8F0` stroke. Hover shifts border color to `#CBD5E1`.
- **Level 2 (Popovers, Filter Menus, Context Sheets)**: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Backing fill: `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(8px)`.
- **Level 3 (AI Candidate Profile Drawers & Critical Modals)**: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`. Border: `1px solid rgba(255, 255, 255, 0.6)`. Backing fill: `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(16px)`.

## Shapes

The design system standardizes on **Roundedness Level 2** (`0.5rem` base radius). This radius maintains architectural discipline while preventing visual sharpness from causing eye fatigue during dense record evaluations.

### Geometry Token Allocation
- **Micro UI (0.375rem / 6px)**: Checkboxes, micro badges, table-cell status pips.
- **Standard Base (0.5rem / 8px)**: Inputs, buttons, chips, nested list rows.
- **Containers (1rem / 16px)**: Candidate cards, AI recommendation summaries, analytic stat-blocks.
- **Drawers & Modals (1.5rem / 24px)**: Candidate inspection viewports and root popovers.

## Components

### Buttons
- **Primary**: Solid `#2563EB` background, text `#FFFFFF`, border `1px solid transparent`. Hover: `#1D4ED8`. Active: scale transform down to `0.98`.
- **Secondary**: Surface `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC` surface, border `#CBD5E1`.
- **Ghost/Tertiary**: Surface transparent, text `#64748B`. Hover: surface `#F1F5F9`, text `#0F172A`.

### Match Score Chips
- **High Match (90-100%)**: Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#065F46`. Includes tabular bold percentage text.
- **Medium Match (70-89%)**: Background `#EFF6FF`, border `1px solid #BFDBFE`, text `#1E40AF`.
- **Low Match (<70%)**: Background `#F8FAFC`, border `1px solid #E2E8F0`, text `#64748B`.

### Input Fields & Search Bars
- Standard height `40px` (desktop), `44px` (mobile). Background `#FFFFFF`, border `1px solid #E2E8F0`, corner radius `0.5rem`.
- **Focus State**: Border `#2563EB`, outer ring `3px solid rgba(37, 99, 235, 0.15)`.
- Input text uses `body-md` typography. Placeholders render in `#94A3B8`.

### Checkboxes & Radio Buttons
- `18px x 18px` structural frame, corner radius `4px` (checkbox) or `50%` (radio).
- Default: `1.5px solid #CBD5E1` on `#FFFFFF` background.
- Checked: `#2563EB` background, border `#2563EB` with `#FFFFFF` crisp vector mark.

### Candidate Cards & Data Lists
- **Candidate Data Row**: Surface `#FFFFFF`, bottom border `1px solid #F1F5F9`. Hover transitions background to `#F8FAFC`.
- **AI Highlight Card**: Glass-morphed surface `#FFFFFF` with an active left edge accent (`3px solid #2563EB` or `#10B981` based on context).

### Specialized Recruitment Components
- **Competency Matrix Bar**: High-precision progress track (`height: 6px`, radius `3px`, track background `#F1F5F9`, fill `#2563EB` or `#10B981`).
- **AI Fit Annotation**: Floating contextual tooltips with an acrylic backdrop blur (`backdrop-filter: blur(12px)`), slate text, and explicit source links to extracted resume paragraphs.