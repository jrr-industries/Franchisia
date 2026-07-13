---
name: Franchisia System
colors:
  surface: '#f6f9ff'
  surface-dim: '#d4dbe2'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fc'
  surface-container: '#e8eef6'
  surface-container-high: '#e3e9f1'
  surface-container-highest: '#dde3eb'
  on-surface: '#161c22'
  on-surface-variant: '#434655'
  inverse-surface: '#2b3137'
  inverse-on-surface: '#ebf1f9'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4e5566'
  on-tertiary: '#ffffff'
  tertiary-container: '#666d7f'
  on-tertiary-container: '#ecf0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dce2f7'
  tertiary-fixed-dim: '#c0c6db'
  on-tertiary-fixed: '#141b2b'
  on-tertiary-fixed-variant: '#404758'
  background: '#f6f9ff'
  on-background: '#161c22'
  surface-variant: '#dde3eb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
  5xl: 96px
---

## Brand & Style
The design system is built for a premium, professional franchise networking platform. It prioritizes clarity, high-speed interaction, and a sophisticated technical aesthetic. The style is a blend of **Corporate Modern** and **Minimalism**, heavily influenced by the high-fidelity execution of industry leaders like Linear and Vercel. 

The visual language emphasizes precision through a meticulous grid, subtle tonal transitions, and a focus on functional elegance. The interface should feel expensive and robust, evoking a sense of reliability and institutional strength while maintaining the fluidity of a modern web application.

## Colors
This design system utilizes a dual-theme palette designed for high legibility in data-dense environments. 

- **Primary Blue** is used for core actions, focus states, and signifying progress.
- **Accent Emerald** is reserved for success states, growth indicators, and "connected" status within the networking platform.
- **Surfaces** follow a tiered elevation model: in Light mode, surfaces use white against a cool grey-blue background; in Dark mode, deep navy backgrounds are paired with slate surfaces.
- **Borders** are intentionally subtle to define structure without adding visual noise.

## Typography
The typography strategy is built on a "Humanist-Technical" split. 

- **Inter** handles all narrative and structural text. Headlines use tight tracking and bold weights to establish a strong hierarchy.
- **JetBrains Mono** is utilized for all data points, numerical values, and metadata. This provides a distinct "pro-tool" feel, making tabular data and franchise metrics easier to scan.
- For mobile, scale down display sizes by approximately 25% while maintaining line-height ratios to ensure readability on smaller viewports.

## Layout & Spacing
The system employs a rigid **8px-based grid** (with 4px increments for tight UI components). 

- **Desktop:** A 12-column fluid grid with a maximum container width of 1440px. 
- **Sidebars:** Use fixed widths (240px - 280px) to maintain consistent navigation across the platform.
- **Gutters:** Standardized at 24px (xl) to provide ample breathing room between complex data widgets.
- **Mobile:** Reflow to a single-column layout with 16px (lg) side margins and 8px (sm) gutters for compact card arrays.

## Elevation & Depth
Elevation is communicated through **Tonal Layering** and **Soft/Premium Shadows**. This system avoids heavy black shadows in favor of tinted, diffused shadows that feel integrated with the background color.

- **Level 0 (Flat):** Used for the main background.
- **Level 1 (Low):** Standard surface for cards and navigation bars. Uses a 1px border (`#E2E8F0` in light, `#334155` in dark).
- **Level 2 (Hover/Mid):** Applied to active cards or dropdowns. Shadow: `0 4px 12px -2px rgba(0, 0, 0, 0.08)`.
- **Level 3 (High):** Reserved for modals and popovers. Shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`.
- **Glassmorphism:** Use `backdrop-filter: blur(12px)` on top navigation bars and fixed headers to provide context of content scrolling beneath.

## Shapes
The shape language is "Sophisticated-Rounded." It moves away from sharp corporate corners toward a friendlier, modern SaaS feel.

- **Small Components:** (Buttons, Inputs, Checkboxes) use the 8px base radius.
- **Mid-sized Components:** (Cards, Modals) use the 12px or 16px radius.
- **Large Layout Containers:** (Main dashboard panels) use the 20px or 24px radius to create a "nested" aesthetic when smaller cards are placed inside them.

## Components
- **Buttons:** 
  - *Primary:* Solid `#2563EB`, white text, subtle inner top-border highlight for 3D effect.
  - *Secondary:* White surface, 1px `#E2E8F0` border, `#111827` text.
  - *Ghost:* No background or border; primary color text. Subtle grey background on hover.
  - *Danger:* Solid Red-600 background, used sparingly for destructive franchise actions.
- **Cards:** White surface with 1px border. On hover, the border color shifts to Primary and a Level 2 shadow is applied.
- **Inputs:** 8px radius, 1px border. Focus state uses a 2px Primary outline with 0% opacity and a 3px Primary-colored spread shadow at 10% opacity.
- **Chips:** Used for "Franchise Category" or "Status." 4px radius (Soft), high-contrast text on a 10% opacity version of the status color (e.g., Emerald-100 background for "Active").
- **Lists:** Clean rows with 1px bottom borders. Hover state uses a 2% Primary tint background to highlight the active row.
- **Data Tables:** Use JetBrains Mono for all cell content. Headers are uppercase, bold Inter at 12px with increased letter spacing.