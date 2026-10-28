<p align="center">
  <span style="font-size: 72px;">🎆</span>
</p>

<h1 align="center">@event-overlay</h1>

<p align="center">
  <strong>Ultra-high-performance, zero-dependency celebration overlay framework for modern web and React applications. 60 FPS Canvas 2D engine with built-in accessibility & user-choice controls.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/v/@event-overlay/core.svg?style=flat-square&color=38bdf8" alt="npm core version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/diwali"><img src="https://img.shields.io/npm/v/@event-overlay/diwali.svg?style=flat-square&color=ffd700&label=@event-overlay/diwali" alt="npm diwali version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/holi"><img src="https://img.shields.io/npm/v/@event-overlay/holi.svg?style=flat-square&color=ff1493&label=@event-overlay/holi" alt="npm holi version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/independence-day"><img src="https://img.shields.io/npm/v/@event-overlay/independence-day.svg?style=flat-square&color=ff9933&label=@event-overlay/independence-day" alt="npm independence-day version" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/bundle-~8--12KB-blue?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/WCAG-2.2.2%20Compliant-success?style=flat-square" alt="WCAG 2.2.2" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌟 Highlights

- ⚡ **60 FPS Physics Engine**: Sub-pixel Canvas 2D particle simulation with velocity damping and drag physics.
- 🪶 **Zero External Dependencies**: Completely self-contained, adding only ~8–12 KB to your bundle.
- 🛡️ **Non-Intrusive**: Runs with `pointer-events: none` and `aria-hidden="true"`; never interferes with links, buttons, typing, or screen readers.
- ⏸️ **User Choice & WCAG 2.2.2**: Built-in glassmorphic controls (`[ ⏸ Pause | ✕ ]`), <kbd>Escape</kbd> shortcut, and collapsible launcher badge (`🪔` / `🎨` / `🇮🇳` / `🎆`).
- 🔋 **Tab Visibility Pausing**: Automatically halts animation loop via Page Visibility API when the browser tab is hidden or in the background, eliminating CPU & battery drain.
- 🧩 **Universal Support**: First-class support for React 16.8–19, Next.js (App & Pages Router), Remix, Vite, Vue, Svelte, or plain HTML `<script>` tags.

---

## 📦 Packages

Install only the package you need, or use the unified core:

| Package | Install Command | Size | Highlights |
| :--- | :--- | :--- | :--- |
| **🪔 Diwali** | `npm install @event-overlay/diwali` | ~9KB | Aerial fireworks, clay diyas with organic flickering flames, anar fountains, chakris, sky lanterns & sparkler cursor. |
| **🎨 Holi** | `npm install @event-overlay/holi` | ~8KB | Water balloons, sweeping pichkaari streams, gulal powder bursts & ambient watercolor stains. |
| **🇮🇳 Independence Day** | `npm install @event-overlay/independence-day` | ~12KB | Flowing tricolor silk waves, waving Tiranga, kites, IAF jet flyovers with smoke trails & drifting flower petals. |
| **🎆 Core Engine** | `npm install @event-overlay/core` | ~12KB | Multi-event manager with runtime event switching and custom event registration. |

---

## 🚀 Quick Start

### 1. React & Next.js (App & Pages Router)

Each dedicated package provides pre-compiled React components under `<package>/react`:

```tsx
// 🪔 Diwali
import { DiwaliOverlay } from '@event-overlay/diwali/react';

export default function App() {
  return (
    <main>
      <DiwaliOverlay 
        enableFireworks={true}
        enableDiyas={true}
        sparklerCursor={true}
      />
      <h1>Happy Diwali! 🪔✨</h1>
    </main>
  );
}
```

```tsx
// 🎨 Holi
import { HoliOverlay } from '@event-overlay/holi/react';

export default function App() {
  return (
    <main>
      <HoliOverlay maxBalloons={15} maxPichkaaris={4} />
      <h1>Happy Holi! 🎨</h1>
    </main>
  );
}
```

```tsx
// 🇮🇳 Independence Day
import { IndependenceDayOverlay } from '@event-overlay/independence-day/react';

export default function App() {
  return (
    <main>
      <IndependenceDayOverlay waveOpacity={0.65} maxFlags={3} maxJets={2} />
      <h1>Happy Independence Day! 🇮🇳</h1>
    </main>
  );
}
```

---

### 2. Vanilla JavaScript / TypeScript (ESM & Bundlers)

```javascript
import { start, pause, resume, togglePause, dismiss, stop } from '@event-overlay/diwali';

// Start celebration overlay
const overlay = start({
  enableFireworks: true,
  enableDiyas: true
});

// Runtime control:
// pause();       // Pause animation
// resume();      // Resume animation
// togglePause(); // Toggle pause/resume
// dismiss();     // Minimize to badge
// stop();        // Remove overlay completely
```

---

### 3. Drop-in HTML CDN Script Tag

Paste right before `</body>`:

```html
<!-- 🪔 Diwali -->
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/diwali/dist/index.umd.js" data-autostart></script>

<!-- 🎨 Holi -->
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/holi/dist/index.umd.js" data-autostart></script>

<!-- 🇮🇳 Independence Day -->
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day/dist/index.umd.js" data-autostart></script>
```

---

## ⏸️ User-Choice Controls & Accessibility (WCAG 2.2.2)

To ensure animations never distract users or obscure crucial website content, `@event-overlay` includes built-in controls enabled by default:

```
[ ● ⏸ Pause | ✕ ]   ──(Click ✕)──>   [ 🪔 ] Launcher Badge
```

- **Floating Glassmorphic Pill**: Displays current status (`Pause` / `Resume`) and a `✕` dismiss button.
- **Collapsible Launcher Badge**: Clicking `✕` stops the loop, fades canvas to `opacity: 0` (0% CPU/GPU/battery), and transitions the pill into a subtle 38px circular badge (`🪔` / `🎨` / `🇮🇳` / `🎆`). Clicking the badge instantly restores the overlay.
- **Keyboard Shortcut**: Pressing <kbd>Esc</kbd> toggles pause/resume or un-dismisses.
- **Session Persistence**: When `persistPreference: true` (default), the user's preference is remembered via `sessionStorage` across page navigations.

### Control Options

```tsx
<DiwaliOverlay
  showControls={true}                  // Show floating control widget (default: true)
  controlPosition="bottom-right"       // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  persistPreference={true}             // Remember pause/dismiss state in sessionStorage (default: true)
  onToggle={(isPaused) => {}}          // Callback on pause / resume
  onDismiss={() => {}}                 // Callback on dismiss
/>
```

---

## ⚙️ Configuration Reference

### Common Options (Available in All Overlays)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showControls` | `boolean` | `true` | Show floating pause/resume and dismiss control pill. |
| `controlPosition` | `string` | `'bottom-right'` | Position of controls: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`. |
| `persistPreference` | `boolean` | `true` | Save user pause/dismiss choice in `sessionStorage`. |
| `opacity` | `number` | `0.95` | Overall master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown timer in ms (`0` = runs continuously). |
| `container` | `string` | `'body'` | DOM selector where the canvas should be mounted. |
| `respectReducedMotion`| `boolean` | `true` | Automatically downscale particle intensity if `prefers-reduced-motion` is detected. |

---

### 🪔 Diwali Festival Options (`@event-overlay/diwali`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableFireworks` | `boolean` | `true` | Grand aerial firework rockets with spherical Peony & Willow bursts. |
| `enableDiyas` | `boolean` | `true` | Clay oil lamps with flickering flame garland across bottom edge. |
| `enableFountains` | `boolean` | `true` | Anar (flowerpot) conical fountains shooting vertical golden spark streams. |
| `enableSpinners` | `boolean` | `true` | Chakri ground spinners emitting centrifugal spiral spark vortexes. |
| `enableLanterns` | `boolean` | `true` | Akash Kandil paper sky lanterns drifting upward with gentle sway. |
| `sparklerCursor` | `boolean` | `true` | Phuljhadi sparkler starbursts trailing pointer / touch movement. |
| `colors` | `ColorRGB[]` | *8 colors* | Festive color palette (Gold, Amber, Saffron, Crimson, Emerald, Cyan, Purple). |

---

### 🎨 Holi Festival Options (`@event-overlay/holi`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxBalloons` | `number` | `15` | Maximum concurrent water balloons launched from edges. |
| `maxPichkaaris` | `number` | `4` | Water gun streams sweeping across the screen. |
| `showAmbient` | `boolean` | `true` | Pulsating watercolor corner stains in all 4 corners. |
| `colors` | `ColorRGB[]` | *9 colors* | Custom RGB color palette for balloons, powder & splashes. |

---

### 🇮🇳 Independence Day Options (`@event-overlay/independence-day`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showWave` | `boolean` | `true` | Flowing Indian Tricolor Silk Wave banner. |
| `waveOpacity` | `number` | `0.65` | Transparency of the flowing silk wave (`0.0` to `1.0`). |
| `maxFlags` | `number` | `3` | Maximum simultaneous waving Indian National Flags (*Tiranga*). |
| `maxKites` | `number` | `6` | Maximum simultaneous flying kites with swaying ribbons. |
| `maxJets` | `number` | `2` | IAF fighter jets crossing with saffron-white-green smoke trails. |
| `maxFireworks` | `number` | `3` | Bursting fireworks and gold sparkler clusters. |
| `maxPetals` | `number` | `35` | Marigold and rose petals drifting with wind physics. |
| `showGlow` | `boolean` | `true` | Ambient Saffron top glow and Green bottom glow. |

---

## 🎮 Runtime API Reference

All dedicated packages and the core framework export identical lifecycle functions:

```typescript
import {
  start,        // (options?) => EventOverlayEngine
  stop,         // () => void - completely destroys canvas and controls
  pause,        // () => void - pauses animation loop and fades canvas
  resume,       // () => void - resumes animation loop and restores canvas
  togglePause,  // () => void - toggles pause/resume (or un-dismisses)
  dismiss,      // () => void - collapses controls to launcher badge and pauses
  undismiss,    // () => void - restores controls and resumes animation
  isPaused,     // () => boolean
  isRunning     // () => boolean
} from '@event-overlay/diwali';
```

---

## 🛠️ TypeScript Support

Full TypeScript declarations are bundled:

```typescript
import type { 
  DiwaliOverlayProps, 
  DiwaliOptions 
} from '@event-overlay/diwali';

import type { 
  HoliOverlayProps, 
  HoliOptions 
} from '@event-overlay/holi';

import type { 
  IndependenceDayOverlayProps, 
  IndependenceDayOptions 
} from '@event-overlay/independence-day';
```

---

## 🚀 Publishing & Monorepo Workflows

Build and test across all workspaces:

```bash
# Typecheck
npm run typecheck

# Run smoke tests & dismiss lifecycle tests
npm test

# Rebuild all packages & dist
npm run build

# Publish all workspaces
npm run publish:all
```

---

## 📄 License

MIT License © [Vikas](https://github.com/DevCodeHub99)
