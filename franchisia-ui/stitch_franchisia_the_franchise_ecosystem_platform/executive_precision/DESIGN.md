---
name: Executive Precision
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
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.2'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-stakes marketplace where professional networking meets venture-scale investment. The brand personality is **authoritative yet agile**, bridging the gap between traditional corporate stability and modern tech innovation. 

The aesthetic leans into **Modern SaaS Minimalism** with a focus on data density and clarity. It utilizes a structured hierarchy, generous white space to reduce cognitive load during complex financial evaluations, and subtle depth to guide the user's focus. The emotional response should be one of "effortless control"—users should feel they are navigating a premium, secure, and highly organized environment.

## Colors
This design system utilizes a high-contrast palette designed for long-form reading and data analysis. 
- **Primary (Blue):** Used for primary actions, active states, and brand markers.
- **Secondary (Navy):** Establishes the professional foundation; used for navigation sidebars and headers.
- **Accent (Emerald):** Reserved specifically for growth metrics, "verified" badges, and positive financial trends.
- **Neutral:** A slate-based scale used for secondary text, borders, and disabled states.

**Dark Mode Strategy:** In dark mode, surfaces use a tiered navy approach rather than pure black to maintain the "Corporate SaaS" feel. Text contrast is strictly maintained at AAA levels for body copy.

## Typography
The system uses **Inter** for all UI and prose to ensure maximum legibility and a contemporary feel. For headings, use bold weights with tighter letter-spacing to create a strong visual anchor.

**JetBrains Mono** is introduced as a functional typeface for financial data, ROI calculations, and CRM IDs. This monospaced choice ensures that columns of numbers align perfectly in tables and dashboard widgets, reinforcing the data-driven nature of the platform. Use `label-caps` for table headers and small metadata categories.

## Layout & Spacing
The design system employs a **12-column fluid grid** for the main content area, with a fixed-width left navigation bar (280px) for desktop. 

- **Desktop:** 24px gutters, 48px side margins.
- **Tablet:** 16px gutters, 24px side margins.
- **Mobile:** 16px gutters, 16px side margins. Stack all 12-column spans into single columns.

Vertical rhythm is strictly 4px-based. Use `lg` (24px) for standard padding between sections and `sm` (12px) for spacing within card elements.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** supplemented by **Ambient Shadows**. This prevents the UI from looking cluttered while maintaining clear object hierarchy.

- **Level 0 (Background):** Used for the base canvas.
- **Level 1 (Surface):** The standard card/container background. In light mode, it uses a subtle 1px border (#E2E8F0).
- **Level 2 (Overlay):** Used for hover states and dropdowns. Features a soft shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modal):** Used for dialogs. Features a deep shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.15)`.

In dark mode, depth is achieved by increasing the lightness of the navy surface color rather than increasing shadow opacity.

## Shapes
The shape language is sophisticated and modern. 
- **Standard (12px):** Primary buttons, input fields, and standard cards.
- **Small (8px):** Tooltips, tags, and nested small elements.
- **Large (20px):** Hero sections, main dashboard containers, and modal windows.

Transitions across all shapes use a `300ms cubic-bezier(0.4, 0, 0.2, 1)` for a responsive, "snappy" feel.

## Components
- **Buttons:** Primary buttons use a solid blue background with white text. Secondary buttons use a transparent background with a 1px navy/slate border. All buttons have a height of 44px for desktop to maintain a premium feel.
- **Cards:** Cards are the primary container. They must have a 1px border. On hover, the border color should shift to the primary blue or the shadow should increase to Level 2.
- **Inputs:** Use a soft-gray background (#F1F5F9) in light mode to differentiate from the white surface. Focus state is a 2px primary blue ring with 0px offset.
- **Chips/Badges:** Small, 8px radius. Use the Emerald accent color for "Active" or "Profitable" statuses, and Slate for "Draft" or "Pending."
- **CRM Lists:** High-density rows with 8px vertical padding. Use JetBrains Mono for the "Deal Value" column.
- **Progress Bars:** Use for franchise application steps. 8px height, rounded-full, using a primary blue fill on a slate-100 track.