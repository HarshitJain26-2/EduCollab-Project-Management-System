---
name: Academic Modernism
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#454652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#757684'
  outline-variant: '#c5c5d4'
  surface-tint: '#4355b9'
  primary: '#24389c'
  on-primary: '#ffffff'
  primary-container: '#3f51b5'
  on-primary-container: '#cacfff'
  inverse-primary: '#bac3ff'
  secondary: '#4d5a9c'
  on-secondary: '#ffffff'
  secondary-container: '#abb7ff'
  on-secondary-container: '#394687'
  tertiary: '#6c3400'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f4700'
  on-tertiary-container: '#ffc7a2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#00105c'
  on-primary-fixed-variant: '#293ca0'
  secondary-fixed: '#dee1ff'
  secondary-fixed-dim: '#b9c3ff'
  on-secondary-fixed: '#021355'
  on-secondary-fixed-variant: '#354282'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
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
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-margin: 16px
  gutter: 16px
---

## Brand & Style

The design system is engineered for a collaborative academic environment, balancing professional rigor with a youthful, accessible energy. It targets students and educators who require a clutter-free workspace that prioritizes focus and task completion. 

The aesthetic is a hybrid of **Modern Corporate** and **Glassmorphism**. It utilizes clean, structured layouts to instill trust and reliability, while integrating translucent, frosted-glass layers for floating elements to provide a sense of depth and modernity. The emotional response is one of organized calm—reducing the cognitive load of project management through soft transitions and clear visual hierarchies.

## Colors

The palette is anchored by a deep Indigo primary, signaling authority and academic tradition. This is offset by a soft gray background that minimizes eye strain during long study sessions. 

- **Primary & Secondary:** Use the Deep Indigo for primary actions and brand moments. Use the lighter secondary indigo for hover states and subtle branding.
- **Backgrounds:** Light mode uses a cool, soft gray (#F5F7FA). Dark mode shifts to a deep charcoal (#121212) to maintain contrast.
- **Accents:** Status indicators use high-saturation pigments to ensure they are immediately identifiable against both light and dark surfaces.
- **Glass Tinting:** Translucent surfaces should take a subtle tint of the background color (white at 70% for light mode, dark gray at 60% for dark mode) to maintain legibility.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic rhythm. 

- **Headlines:** Use tighter letter-spacing and heavier weights to create a strong visual anchor for page sections.
- **Body Text:** Standardize on 16px for general content to ensure accessibility across mobile and desktop.
- **Labels:** Small labels for status badges or categories should use uppercase with slight letter spacing to differentiate them from interactive body text.
- **Hierarchy:** Rely on weight changes (SemiBold vs Regular) rather than drastic size changes to maintain a professional, streamlined appearance.

## Layout & Spacing

This design system follows a **mobile-first, fluid grid** philosophy. The core spacing unit is an 8px square-based system, ensuring all elements align to a predictable cadence.

- **Mobile:** A single-column layout with 16px side margins.
- **Desktop:** A 12-column grid with 24px gutters. Content should be contained within a maximum width of 1280px.
- **Rhythm:** Use `lg` (24px) for vertical spacing between distinct cards or sections, and `md` (16px) for padding within components.

## Elevation & Depth

Depth is communicated through a combination of **Glassmorphism** and **Ambient Shadows**.

- **Surface Layers:** Standard cards sit on the base background with a subtle "Level 1" shadow (low blur, low opacity).
- **Glass Elements:** Modals, navigation bars, and floating action buttons utilize a `backdrop-filter: blur(12px)` with a semi-transparent border (1px white/10% opacity) to simulate the edge of a glass pane.
- **Shadows:** Use extra-diffused shadows with a slight indigo tint (`rgba(63, 81, 181, 0.08)`) to tie the elevation into the primary color palette. Shadows should appear to come from a top-down light source.

## Shapes

The shape language is defined by a friendly, generous **16px radius** (Rounded) for all primary containers and cards.

- **Large Containers:** Modals and main content cards use 1.5rem (24px) for a more pronounced, "organic" feel.
- **Interactive Elements:** Buttons and input fields use 0.5rem (8px) to provide a tighter, more precise appearance while remaining cohesive with the overall softness.
- **Icons:** Should be housed in rounded-square or circular containers to match the corner philosophy.

## Components

- **Cards:** The primary container for projects and tasks. Cards should have a white (or #1E1E1E) background, a 16px border radius, and a subtle indigo-tinted shadow.
- **Navigation Bar:** A glassmorphic bar at the bottom for mobile and the side/top for desktop. It should feature a high blur radius and active states indicated by the primary indigo color.
- **Buttons:**
    - *Primary:* Solid Indigo with white text.
    - *Secondary:* Ghost style with Indigo borders and 10% Indigo background on hover.
- **Badges:** Small, pill-shaped indicators for status. Use a low-opacity background of the status color (e.g., 15% green) with full-opacity bold text for the label.
- **Modals:** Centered overlays with a heavy backdrop blur (20px+) to isolate the task. Modals should animate in with a slight scale-up effect (0.95 to 1.0).
- **Input Fields:** Soft gray backgrounds that shift to a 2px Indigo border on focus. All transitions for focus states must be 200ms ease-in-out.
- **Progress Trackers:** Custom components using the Success Green to show project completion percentages, utilizing smooth width transitions.