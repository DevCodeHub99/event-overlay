<p align="center">
  <span style="font-size: 72px;">🎆</span>
</p>

<h1 align="center">@event-overlay</h1>

<p align="center">
  <strong>Ultra-high-performance, zero-dependency celebration overlay framework for modern web and React applications. 60 FPS Canvas 2D engine with built-in accessibility & user-choice controls.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/v/@event-overlay/core.svg?style=flat-square&color=38bdf8&label=@event-overlay/core" alt="npm core version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/diwali"><img src="https://img.shields.io/npm/v/@event-overlay/diwali.svg?style=flat-square&color=ffd700&label=@event-overlay/diwali" alt="npm diwali version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/holi"><img src="https://img.shields.io/npm/v/@event-overlay/holi.svg?style=flat-square&color=ff1493&label=@event-overlay/holi" alt="npm holi version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/independence-day"><img src="https://img.shields.io/npm/v/@event-overlay/independence-day.svg?style=flat-square&color=ff9933&label=@event-overlay/independence-day" alt="npm independence-day version" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/performance-60%20FPS%20Zero--GC-success?style=flat-square" alt="60 FPS Zero-GC" />
  <img src="https://img.shields.io/badge/WCAG-2.2.2%20%7C%202.3.1%20%7C%202.3.3%20%7C%202.4.7-blueviolet?style=flat-square" alt="WCAG Compliance" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌟 Highlights

- ⚡ **60 FPS Zero-GC Engine**: Sub-pixel Canvas 2D particle simulation with zero heap churn during animation loops.
- 🪶 **Zero External Dependencies**: Completely self-contained, adding only ~3–12 KB to your bundle.
- 🛡️ **Non-Intrusive**: Canvas runs with `pointer-events: none` and `aria-hidden="true"`; never interferes with links, inputs, or buttons.
- ♿ **Strict WCAG Compliance**:
  - **WCAG 2.2.2 (Pause, Stop, Hide)**: Glassmorphic control pill (`[ ⏸ Pause | ✕ ]`), launcher badge, and <kbd>Esc</kbd> shortcut.
  - **WCAG 2.3.1 (Photosensitive Safety)**: Flicker-clamped illumination prevents rapid high-contrast flashing.
  - **WCAG 2.3.3 (Reduced Motion)**: Auto-detects `prefers-reduced-motion` to dim intensity and disable high-speed motion.
  - **WCAG 2.4.7 (Focus Visible)**: High-contrast focus rings for keyboard tab navigation.
  - **WCAG 4.1.2 & 4.1.3**: Accessible names, ARIA labels, and live region announcements.
- 🔋 **Tab Visibility Pausing**: Halts loop via Page Visibility API when the browser tab is hidden, saving 100% CPU and battery.
- 🧩 **Universal Compatibility**: First-class support for React (16.8–19), Next.js (App & Pages router), Vite, Vue, Svelte, or plain HTML `<script>` tags.

---

## 📦 Packages

Install only the package you need — zero bloat:

| Package | Install Command | Size (Gzipped) | Highlights |
| :--- | :--- | :--- | :--- |
| **🪔 Diwali** | `npm install @event-overlay/diwali` | ~12 KB | Peony fireworks, clay diyas with organic flickering flames, anar fountains, chakris, sky lanterns & sparkler cursor. |
| **🎨 Holi** | `npm install @event-overlay/holi` | ~10 KB | Water balloons, sweeping pichkaari streams, gulal powder bursts & ambient watercolor stains. |
| **🇮🇳 Independence Day** | `npm install @event-overlay/independence-day` | ~12 KB | Flowing tricolor silk waves, waving Tiranga, kites, IAF fighter jet airshows & drifting flower petals. |
| **🎆 Core Engine** | `npm install @event-overlay/core` | ~3 KB | Pure headless engine with ticker loop, WCAG controls, and custom event registry. |

---

## 🚀 Quick Start

### 1. React & Next.js (Client Component)

```tsx
'use client';

// 🪔 Diwali
import { DiwaliOverlay } from '@event-overlay/diwali/react';

export default function FestivePage() {
  return (
    <main>
      <h1>Happy Diwali! 🪔✨</h1>
      <DiwaliOverlay
        showControls={true}
        controlPosition="bottom-right"
        persistPreference={true}
        respectReducedMotion={true}
      />
    </main>
  );
}
```

> **Next.js SSR Tip**: For dynamic client-only loading in Next.js:
> ```tsx
> import dynamic from 'next/dynamic';
> const DiwaliOverlay = dynamic(
>   () => import('@event-overlay/diwali/react').then(m => m.DiwaliOverlay),
>   { ssr: false }
> );
> ```

---

### 2. Vanilla JavaScript / TypeScript

```javascript
import { start, pause, resume, togglePause, dismiss, undismiss, stop } from '@event-overlay/diwali';

// Start overlay with custom configuration
const overlay = start({
  showControls: true,
  controlPosition: 'bottom-right',
  persistPreference: true,
  respectReducedMotion: true
});

// Runtime API
pause();       // Pause animation loop
resume();      // Resume animation
togglePause(); // Toggle pause/resume
dismiss();     // Minimize to launcher badge
undismiss();   // Restore overlay
stop();        // Destroy canvas and remove DOM elements
```

---

### 3. Drop-in HTML CDN Script Tag

Add directly before `</body>`:

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
- **Session Persistence**: When `persistPreference: true` (default), the user's choice is saved in `sessionStorage` across page navigations.

---

## ⚙️ Configuration Reference

### Common Options (All Packages)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showControls` | `boolean` | `true` | Show floating pause/resume and dismiss control pill. |
| `controlPosition` | `string` | `'bottom-right'` | Position: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`. |
| `persistPreference` | `boolean` | `true` | Save pause/dismiss choice in `sessionStorage`. |
| `respectReducedMotion`| `boolean` | `true` | Auto-detect `prefers-reduced-motion` and downscale animations. |
| `opacity` | `number` | `0.95` | Overall master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown timer in ms (`0` = runs continuously). |
| `container` | `string` | `'body'` | DOM selector where the canvas should be mounted. |
| `onToggle` | `Function` | `undefined` | Callback fired on pause/resume: `(isPaused: boolean) => void`. |
| `onDismiss` | `Function` | `undefined` | Callback fired on dismiss: `() => void`. |

---

### Event-Specific Options

#### 🪔 Diwali (`@event-overlay/diwali`)
`enableFireworks` (`true`), `enableDiyas` (`true`), `enableFountains` (`true`), `enableSpinners` (`true`), `enableLanterns` (`true`), `sparklerCursor` (`true`), `colors` (`ColorRGB[]`).

#### 🎨 Holi (`@event-overlay/holi`)
`maxBalloons` (`15`), `maxPichkaaris` (`4`), `showAmbient` (`true`), `colors` (`ColorRGB[]`).

#### 🇮🇳 Independence Day (`@event-overlay/independence-day`)
`showWave` (`true`), `waveOpacity` (`0.65`), `maxFlags` (`3`), `maxKites` (`6`), `maxJets` (`2`), `maxFireworks` (`3`), `maxPetals` (`35`), `showGlow` (`true`).

---

## 🛠️ TypeScript Support

Full TypeScript declarations are bundled out-of-the-box:

```typescript
import type { DiwaliOverlayProps, DiwaliOptions } from '@event-overlay/diwali';
import type { HoliOverlayProps, HoliOptions } from '@event-overlay/holi';
import type { IndependenceDayOverlayProps, IndependenceDayOptions } from '@event-overlay/independence-day';
import type { EventOverlayOptions, EventModule } from '@event-overlay/core';
```

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
