# Design System: FaceAuth Dashboard Redesign

**Project ID:** 9207662989557689255

## 1. Visual Theme & Atmosphere

The FaceAuth Dashboard uses a premium, developer-focused aesthetic deeply inspired by the Anthropic Console and OpenAI Platform. The atmosphere is stark, professional, and utilitarian, yet rich in subtle details. It leverages a deep, near-pitch-dark palette with precisely illuminated accents. The layout feels airy but highly structured, using glassmorphism components to create depth without visual clutter.

## 2. Color Palette & Roles

- **Pitch Black Canvas** (`#0a0a0a`): Used for the main body background. Creates dramatic contrast and a cutting-edge technical feel.
- **Charcoal Slate** (`#141414`): Used as the surface background for cards, modals, and tables to provide subtle separation from the deeper canvas.
- **Midnight Sidebar** (`#1a1a1a`): Used specifically for the left navigation sidebar to ground the layout.
- **Subtle Edge Ring** (`#262626`): Used for fine lines, component borders, and delicate separators, preserving clean structures without heaviness.
- **Pure Starlight** (`#fafafa`): Used for primary headings and highly important data text for maximum legibility.
- **Muted Ash** (`#a1a1aa`): Used for secondary text, metadata, descriptions, and passive UI states.
- **Deep Indigo Glow** (`#3b19e6`): The primary brand accent color. Used for active navigation states, primary buttons, and highlight areas like charts. Applies smooth gradients to transparent for visual flair.
- **Operational Emerald** (`#10b981` / `text-green-500`): Used for success states, active badges, and positive upward metrics.
- **Warning Amber** (`#f59e0b`): Used subtly in alert banners and destructive/warning border elements.

## 3. Typography Rules

- **Font Family:** Inter (and Geist Sans/Mono as technical fallbacks).
- **Weights:**
  - Standard text uses lightweight and medium variations (400-500) for a clean modern look.
  - Headings and numeric metric callouts use bold weights (600-700) with slight negative letter-spacing for tighter, more muscular typography.
- **Sizing:** The hierarchy is clear, favoring relatively small, readable text (`text-sm`) for tables and dense data, with distinct crisp headers.

## 4. Component Stylings

- **Cards/Containers:** Dark surfaces (`#141414`) elevated from the background with a 12px pillowy rounding (`ROUND_TWELVE`), completely enclosed by extremely thin (`1px`), subtle edge borders (`#262626`).
- **Buttons:**
  - _Primary Buttons:_ Solid deep indigo or stark white/dark contrast depending on the specific state. They exhibit tight padding, 12px rounding, and a minimal hover glow.
  - _Secondary Actions:_ Ghost buttons or outline buttons with thin gray borders that change to a brighter background on hover.
- **Inputs/Forms:** Dark backgrounds mimicking the card color with subtle outer strokes. They favor utilitarian simplicity over heavy dropshadows.
- **Data Visualizations:** Area charts using smooth lines, glowing stroke paths, and vibrant base gradients that fade seamlessly into the background shadow.
- **Status Badges:** Small pill-shaped tags utilizing translucent background fills (e.g., 10% opacity) matching the text color (e.g. green text on pale green).

## 5. Layout Principles

- **Navigation Architecture:** A fixed, slender left sidebar paired with a top horizontal utility header (housing breadcrumbs, documentation links, and user profiles).
- **Grid Alignment:** Generous internal padding within cards (typically 1.5rem to 2rem) creating safe "breathing room" for dense data. Sections are visibly separated by vertical margins that respect a 4-point internal grid system.
- **Density Strategy:** Content is intentionally spaced out to feel premium; tight clustering is avoided except within highly-related numeric data pairs within tables.
