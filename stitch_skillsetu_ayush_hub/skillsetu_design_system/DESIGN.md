---
name: SkillSetu Design System
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
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
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system for this platform prioritizes institutional trust through a lens of modern technological advancement. It serves as a bridge between traditional Ayurvedic wisdom and contemporary digital governance.

The aesthetic follows a **Bright Premium Glassmorphism** direction. This approach uses translucent layers and light-refracting surfaces to suggest transparency in government, while the vibrant emerald palette grounds the experience in health and vitality. The UI should feel airy and expansive, avoiding the heavy, dense layouts typical of legacy institutional software.

**Key Visual Principles:**
- **Clarity:** Uncluttered layouts with generous negative space.
- **Luminosity:** Use of soft glows and high-transparency backgrounds.
- **Precision:** Fine 1px borders and sharp iconography to denote attention to detail.

## Colors
The palette is centered on the "Ayurvedic Green" which represents life and healing. 

- **Primary (#10b981):** Used for primary actions, success states, and brand identifiers.
- **Secondary (#14b8a6):** Used for supporting elements and categorical differentiation.
- **Accent (#f59e0b):** Used exclusively for high-priority alerts, certifications, or specialized "Gold Standard" designations.
- **Surface Strategy:** Backgrounds utilize a clean off-white. Functional surfaces (Cards, Modals, Sidebars) utilize a translucent white glass effect with a `blur(12px)` backdrop filter to maintain legibility over background patterns.

## Typography
The system employs a dual-font strategy. **Plus Jakarta Sans** provides a modern, slightly rounded warmth for headings, making the institution feel approachable. **Inter** is utilized for body text and functional UI labels to ensure maximum legibility and a systematic, professional feel.

- **Headlines:** Should use tighter letter spacing to maintain a "locked-in" premium look.
- **Body Text:** Uses a standard weight of 400 for long-form reading, with 600 reserved for emphasis.
- **Hierarchy:** Ensure at least an 8px size difference between distinct hierarchical levels to maintain clear information architecture on data-heavy pages.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **The 8px Rhythm:** All spacing (padding, margins, gaps) must be multiples of 4px, with 8px and 16px being the most common increments.
- **Glass Insets:** Content inside glass containers should have a minimum internal padding of 24px to ensure the backdrop blur effect is visible and elegant.
- **Sectioning:** Use large vertical gaps (80px - 120px) between major landing page sections to reinforce the premium, "un-cramped" brand feel.

## Elevation & Depth
Depth is created through "Tonal Stacking" combined with glassmorphism.

1.  **Base Level:** The off-white background (#f8fafc).
2.  **Level 1 (Cards/Plates):** Translucent white with 70% opacity, 12px backdrop-blur, and a 1px border (#10b981 at 15% opacity).
3.  **Level 2 (Dropdowns/Popovers):** Translucent white with 90% opacity and a soft "Ambient Glow" shadow: `0px 10px 30px rgba(16, 185, 129, 0.08)`.
4.  **Level 3 (Modals):** Pure white or 95% opacity glass, centered, with a deep multi-layered shadow to pull focus.

**Borders:** Every glass element must have a subtle emerald tint border. This prevents the "lost in white" look and provides a distinct architectural edge.

## Shapes
The shape language is "Disciplined Softness." We use large radii to feel modern and friendly, but avoid fully circular "blob" shapes to maintain professional integrity.

- **Standard Containers:** 16px radius (`rounded-lg`).
- **Large Sections/Feature Cards:** 24px radius (`rounded-xl`).
- **Interactive Elements (Buttons):** 12px radius.
- **Icons:** Should be encased in 8px rounded squares when used as decorative accents.

## Components

### Buttons
- **Primary:** Solid Emerald Green (#10b981) with white text. High-contrast, 12px border radius.
- **Secondary (Glass):** Translucent background with a 1px emerald border and emerald text.
- **Ghost:** No background, emerald text, used for tertiary actions.

### Input Fields
- **Style:** Light grey fill (#f1f5f9) that turns white upon focus. 
- **Focus State:** 2px emerald ring with 4px outer glow.
- **Labels:** Always positioned above the field in `label-md` Inter.

### Cards
- **Construction:** Use the Level 1 Elevation glass treatment.
- **Header:** Often includes a small, 32px x 32px icon container with a 10% opacity emerald background.

### Chips/Badges
- **Status:** Small, pill-shaped tags with 8px horizontal padding.
- **Colors:** Use a "Soft Tint" approach (e.g., Success is light emerald background with dark emerald text).

### Lists
- **Interaction:** Row-based layouts with a subtle 1px divider (#e2e8f0). On hover, the entire row should take on a 5% emerald tint.

### Iconography
- **Guidelines:** Use Lucide-style SVG icons exclusively. Stroke width should be 1.5px or 2px. Never use filled icons unless for active navigation states.