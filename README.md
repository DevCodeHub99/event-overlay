<p align="center">
  <span style="font-size: 80px;">🎆</span>
</p>

<h1 align="center">@event-overlay</h1>

<p align="center">
  <strong>Ultra-high-performance, plug-and-play celebration overlay suite for modern web applications. Zero dependencies. 60 FPS HTML5 Canvas 2D engine.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/v/@event-overlay/core.svg?style=flat-square&color=38bdf8" alt="npm core version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/independence-day"><img src="https://img.shields.io/npm/v/@event-overlay/independence-day.svg?style=flat-square&color=ff9933&label=@event-overlay/independence-day" alt="npm independence-day version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/holi"><img src="https://img.shields.io/npm/v/@event-overlay/holi.svg?style=flat-square&color=ff1493&label=@event-overlay/holi" alt="npm holi version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/diwali"><img src="https://img.shields.io/npm/v/@event-overlay/diwali.svg?style=flat-square&color=ffd700&label=@event-overlay/diwali" alt="npm diwali version" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~8--12KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌟 Introduction

**`@event-overlay`** brings festive spirit and celebration to your digital applications with buttery-smooth 60 FPS canvas animations. Designed with developer experience and web performance in mind, it operates with **zero external dependencies**, consumes minimal CPU/memory, and never blocks user clicks, typing, or navigation.

Whether you're launching a holiday campaign, celebrating a cultural festival, or adding delight to your users' experience, `@event-overlay` provides dedicated, lightweight packages and a unified framework.

---

## 📦 Dedicated NPM Packages

Install the exact package tailored to your celebration:

| Package | Install Command | Size | Highlights |
| :--- | :--- | :--- | :--- |
| **🇮🇳 Independence Day** | `npm install @event-overlay/independence-day` | ~12KB | Tricolor silk wave, waving Tiranga, kites, IAF fighter jet airshows, fireworks & flower petals. |
| **🎨 Holi Festival** | `npm install @event-overlay/holi` | ~8KB | Water balloons, pichkaari streams, gulal powder bursts, and ambient watercolor splash stains. |
| **🪔 Diwali Festival** | `npm install @event-overlay/diwali` | ~9KB | Grand aerial fireworks, clay diyas with organic flame, anar fountains, chakris, and sky lanterns. |
| **🎆 Core Engine** | `npm install @event-overlay/core` | ~12KB | Modular multi-event celebration engine with tree-shakeable subpaths & custom event support. |

---

## ✨ Why Choose Event Overlay?

- ⚡ **Buttery 60 FPS Performance**: Powered by an internal physics loop with velocity damping, realistic drag, and sub-pixel rendering.
- 🪶 **Zero External Dependencies**: Self-contained lightweight Canvas 2D engine with zero bloat.
- 🛡️ **Non-Intrusive & Accessible**: Layered with `pointer-events: none` and `aria-hidden="true"` so links, buttons, inputs, and screen readers continue working with zero friction.
- 🧩 **Universal Framework Compatibility**: Out-of-the-box support for **React**, **Next.js (App & Pages Router)**, **Vue**, **Svelte**, **Angular**, **Vite**, and plain **HTML CDN script tags**.
- 🛠️ **Deeply Customizable**: Configure particle counts, speed, colors, z-index, duration, and opacity with full TypeScript intellisense.
- 📱 **Retina & High-DPI Ready**: Automatically adjusts canvas scaling to match device pixel ratios for razor-sharp visual fidelity.

---

## 🚀 Quick Setup & Usage

### 1. 🇮🇳 Independence Day Overlay (`@event-overlay/independence-day`)

Celebrate Indian Independence Day (15th August) & Republic Day (26th January):

#### React & Next.js (App & Pages Router)
```bash
npm install @event-overlay/independence-day
```

```tsx
import { IndependenceDayOverlay } from '@event-overlay/independence-day/react';

export default function App() {
  return (
    <main>
      <IndependenceDayOverlay 
        waveOpacity={0.65} 
        maxFlags={3} 
        maxKites={6} 
        maxJets={2} 
        maxFireworks={3} 
        maxPetals={35} 
      />
      <h1>Happy Independence Day! 🇮🇳 Jai Hind!</h1>
    </main>
  );
}
```

#### Vanilla JavaScript / TypeScript
```javascript
import { start, stop, toggle, isRunning } from '@event-overlay/independence-day';

start({
  waveOpacity: 0.65,
  maxFlags: 3,
  maxKites: 6,
  maxJets: 2,
  maxFireworks: 3
});
```

#### 1-Line HTML CDN Script Tag
```html
<script 
  src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day/dist/index.umd.js" 
  data-autostart>
</script>
```

---

### 2. 🎨 Holi Festival Overlay (`@event-overlay/holi`)

Celebrate the vibrant Festival of Colours:

#### React & Next.js (App & Pages Router)
```bash
npm install @event-overlay/holi
```

```tsx
import { HoliOverlay } from '@event-overlay/holi/react';

export default function App() {
  return (
    <main>
      <HoliOverlay 
        maxBalloons={15} 
        maxPichkaaris={4} 
        showAmbient={true} 
        opacity={0.95} 
      />
      <h1>Happy Holi! Wishing you joy and vibrant colors! 🎨</h1>
    </main>
  );
}
```

#### Vanilla JavaScript / TypeScript
```javascript
import { start, stop, toggle, isRunning } from '@event-overlay/holi';

start({
  maxBalloons: 15,
  maxPichkaaris: 4,
  showAmbient: true
});
```

#### 1-Line HTML CDN Script Tag
```html
<script 
  src="https://cdn.jsdelivr.net/npm/@event-overlay/holi/dist/index.umd.js" 
  data-autostart>
</script>
```

---

### 3. 🪔 Diwali Festival Overlay (`@event-overlay/diwali`)

Celebrate Diwali (The Festival of Lights / Deepavali):

#### React & Next.js (App & Pages Router)
```bash
npm install @event-overlay/diwali
```

```tsx
import { DiwaliOverlay } from '@event-overlay/diwali/react';

export default function App() {
  return (
    <main>
      <DiwaliOverlay 
        enableFireworks={true}
        enableDiyas={true}
        enableFountains={true}
        enableSpinners={true}
        enableLanterns={true}
        sparklerCursor={true}
      />
      <h1>Happy Diwali! 🪔✨</h1>
    </main>
  );
}
```

#### Vanilla JavaScript / TypeScript
```javascript
import { start, stop, toggle } from '@event-overlay/diwali';

start({
  enableFireworks: true,
  enableDiyas: true,
  enableFountains: true,
  sparklerCursor: true
});
```

#### 1-Line HTML CDN Script Tag
```html
<script 
  src="https://cdn.jsdelivr.net/npm/@event-overlay/diwali/dist/index.umd.js" 
  data-autostart>
</script>
```

---

### 4. 🎆 Core Engine (`@event-overlay/core`)

For projects requiring multiple festive themes or custom event creation:

```bash
npm install @event-overlay/core
```

```tsx
import { EventOverlay } from '@event-overlay/core/react';

export default function App() {
  // Dynamically switch events based on calendar or user preference
  return <EventOverlay event="diwali" />;
}
```

---

## ⚙️ Configuration Reference

### 🇮🇳 Independence Day Options (`IndependenceDayOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showWave` | `boolean` | `true` | Enable or disable the flowing Tricolor Silk Wave banner. |
| `waveOpacity` | `number` | `0.65` | Transparency level of the flowing silk wave (`0.0` to `1.0`). |
| `maxFlags` | `number` | `3` | Maximum simultaneous waving Indian National Flags (*Tiranga*). |
| `maxKites` | `number` | `6` | Maximum simultaneous flying kites with swaying ribbons. |
| `maxJets` | `number` | `2` | IAF fighter jets crossing with saffron-white-green smoke trails. |
| `maxFireworks` | `number` | `3` | Bursting fireworks and gold sparkler clusters. |
| `maxPetals` | `number` | `35` | Marigold and rose petals drifting with wind physics. |
| `showGlow` | `boolean` | `true` | Ambient Saffron top glow and Green bottom glow. |
| `opacity` | `number` | `0.95` | Overall master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown timer in ms (`0` = runs continuously). |
| `container` | `string` | `'body'` | DOM selector where the canvas should be mounted. |

---

### 🎨 Holi Festival Options (`HoliOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxBalloons` | `number` | `15` | Maximum concurrent water balloons launched from edges. |
| `maxPichkaaris` | `number` | `4` | Water gun streams sweeping across the screen. |
| `colors` | `ColorRGB[]` | *9 colors* | Custom RGB color palette for balloons, powder & splashes. |
| `showAmbient` | `boolean` | `true` | Pulsating watercolor corner stains in all 4 corners. |
| `opacity` | `number` | `0.95` | Overall master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown timer in ms (`0` = runs continuously). |
| `container` | `string` | `'body'` | DOM selector where the canvas should be mounted. |

---

### 🪔 Diwali Festival Options (`DiwaliOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableFireworks` | `boolean` | `true` | Grand aerial firework rockets with spherical Peony & Willow bursts. |
| `enableDiyas` | `boolean` | `true` | Clay oil lamps with flickering flame garland across bottom edge. |
| `enableFountains` | `boolean` | `true` | Anar (flowerpot) conical fountains shooting vertical golden spark streams. |
| `enableSpinners` | `boolean` | `true` | Chakri ground spinners emitting centrifugal spiral spark vortexes. |
| `enableLanterns` | `boolean` | `true` | Akash Kandil paper sky lanterns drifting upward with gentle sway. |
| `sparklerCursor` | `boolean` | `true` | Phuljhadi sparkler starbursts trailing pointer / touch movement. |
| `colors` | `ColorRGB[]` | *8 colors* | Festive palette (Gold, Amber, Saffron, Crimson, Emerald, Cyan, Purple). |
| `opacity` | `number` | `0.95` | Overall master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown timer in ms (`0` = runs continuously). |
| `container` | `string` | `'body'` | DOM selector where the canvas should be mounted. |

---

## 🛠️ TypeScript Types

All packages ship with high-fidelity TypeScript typings:

```typescript
import type { 
  IndependenceDayOverlayProps, 
  IndependenceDayOptions 
} from '@event-overlay/independence-day';

import type { 
  HoliOverlayProps, 
  HoliOptions, 
  ColorRGB 
} from '@event-overlay/holi';

import type {
  DiwaliOverlayProps,
  DiwaliOptions
} from '@event-overlay/diwali';
```

---

## 🚀 Publishing to NPM

### Option A: Automated OIDC Release via GitHub (Recommended)
This repository uses **Tokenless OIDC Trusted Publishing** with cryptographic SLSA provenance:
1. Bump the `"version"` field in [`package.json`](file:///c:/Users/vikas/Desktop/event-overlay/package.json) (e.g. `1.0.3`).
2. Run `npm run build` to rebuild and synchronize all package targets.
3. Commit and push changes:
   ```bash
   git commit -am "chore: release v1.0.3"
   git push origin main
   ```
4. Create and push a Git Tag (or create a GitHub Release in the repository):
   ```bash
   git tag v1.0.3
   git push origin v1.0.3
   ```
5. GitHub Actions will automatically run [`publish.yml`](file:///c:/Users/vikas/Desktop/event-overlay/.github/workflows/publish.yml) and publish all workspaces to npm.

### Option B: Manual Publish via NPM CLI
If publishing manually from your local terminal:
```bash
# 1. Login to your NPM account
npm login

# 2. Build and verify all packages
npm run build

# 3. Publish all workspace packages at once
npm publish --workspaces --access public

# Or publish individual packages:
npm run publish:diwali
npm run publish:independence-day
npm run publish:holi
npm run publish:core
```

---

## 🔍 SEO & Discoverability Keywords

`event-overlay` • `celebration-overlay` • `festive-overlay` • `diwali` • `diwali-overlay` • `deepavali` • `festival-of-lights` • `diyas` • `anar` • `chakri` • `phuljhadi` • `sparklers` • `react-diwali` • `holi` • `holi-overlay` • `holi-festival` • `festival-of-colours` • `rangotsav` • `gulal` • `pichkaari` • `water-balloon` • `independence-day` • `indian-independence-day` • `15-august` • `republic-day` • `26-january` • `tiranga` • `indian-flag` • `tricolor` • `kites` • `patriotism` • `airshow` • `fireworks` • `confetti` • `canvas-confetti` • `particle-effects` • `particle-system` • `react-celebration` • `react-festive` • `react-holi` • `react-independence-day` • `nextjs-overlay` • `nextjs-animation` • `canvas-animation` • `web-animation` • `zero-dependency` • `monorepo` • `canvas-overlay`

---

## 📄 License

MIT License © [Vikas](https://github.com/DevCodeHub99)
