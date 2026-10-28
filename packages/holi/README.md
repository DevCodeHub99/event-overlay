<p align="center">
  <span style="font-size: 72px;">🎨</span>
</p>

<h1 align="center">@event-overlay/holi</h1>

<p align="center">
  <strong>Vibrant, ultra-high-performance Holi Festival celebration overlay for any website, React, Next.js, Vue, or Vanilla JS app.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/holi"><img src="https://img.shields.io/npm/v/@event-overlay/holi.svg?style=flat-square&color=ff1493" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/holi"><img src="https://img.shields.io/npm/dm/@event-overlay/holi.svg?style=flat-square&color=32cd32" alt="npm downloads" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~8KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌈 Overview

Bring the exuberant spirit and colors of **Holi (Festival of Colours / Rangotsav)** to your digital products! `@event-overlay/holi` is a plug-and-play celebration overlay that creates stunning, realistic festive animations directly over your web page using a hardware-accelerated HTML5 Canvas 2D engine.

Designed for modern web applications, it delivers buttery-smooth 60 FPS animations without impacting your site's performance, layout, or user interactions.

---

## ✨ Features

- 🎈 **Physics-Based Water Balloons**: Balloons launch dynamically from screen edges and burst upon impact into thousands of water droplets and organic color stains.
- 🔫 **Pichkaari (Water Gun) Streams**: Continuous high-velocity streams that arc and sweep gracefully across the screen.
- 💥 **Gulal (Powder) Explosions**: Soft, billowing organic color clouds that expand and gently dissolve into the atmosphere.
- 🌸 **Curated 9-Color Festive Palette**: Features vibrant traditional Holi pigments (Gulal Pink, Marigold Yellow, Parrot Green, Indigo Blue, Saffron Orange, Royal Violet, Cyan, Deep Pink, and Lime) or pass your own custom brand/festive colors.
- 🎨 **Ambient Watercolor Stains**: Soft pulsating corner glows simulating festive color stains on the edges of the screen.
- ⚡ **Zero Dependencies & Lightweight**: <8KB gzipped with zero external library overhead.
- 🛡️ **Non-Intrusive & Accessible**: Layered with `pointer-events: none` and `aria-hidden="true"`, ensuring your links, buttons, forms, and screen readers continue to function flawlessly.
- 🧩 **Universal Compatibility**: Works out of the box with **React**, **Next.js (App & Pages Router)**, **Vue**, **Svelte**, **Angular**, **Vite**, and plain **HTML CDN script tags**.

---

## 📦 Installation

Install via your preferred package manager:

```bash
# npm
npm install @event-overlay/holi

# yarn
yarn add @event-overlay/holi

# pnpm
pnpm add @event-overlay/holi

# bun
bun add @event-overlay/holi
```

---

## 🚀 Quick Start Guide

### 1. React & Next.js (App Router / Pages Router)

Simply import the `HoliOverlay` component and drop it anywhere in your component tree (e.g., `layout.tsx` or `App.tsx`):

```tsx
import { HoliOverlay } from '@event-overlay/holi/react';

export default function App() {
  return (
    <main>
      {/* Celebration overlay */}
      <HoliOverlay 
        maxBalloons={15} 
        maxPichkaaris={4} 
        showAmbient={true} 
        opacity={0.95} 
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '4rem', textAlign: 'center' }}>
        <h1>🎉 Happy Holi! Wish you a vibrant celebration! 🎨</h1>
        <p>Your interactive site content remains 100% clickable and functional.</p>
      </div>
    </main>
  );
}
```

> **Next.js App Router Note**: The `HoliOverlay` component is marked with `'use client'` under the hood, making it seamlessly compatible with Next.js 13/14/15 Server and Client Components.

---

### 2. Vanilla JavaScript / TypeScript (Vite, Webpack, ES Modules)

```javascript
import { start, stop, toggle, isRunning } from '@event-overlay/holi';

// Start celebration overlay with custom settings
const instance = start({
  maxBalloons: 20,
  maxPichkaaris: 5,
  showAmbient: true,
  opacity: 0.9
});

// Programmatic controls:
// stop();        // Stops the animation and cleans up canvas
// toggle();      // Toggles active/stopped state
// isRunning();   // Returns true if overlay is currently animating
```

---

### 3. HTML CDN Drop-in Script Tag (No Build Tools Required)

Include the standalone bundle via jsDelivr or unpkg before the closing `</body>` tag. Add `data-autostart` to start automatically:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Happy Holi Celebration</title>
</head>
<body>
  <h1>Welcome to Our Store! 🎨</h1>

  <!-- 1-line CDN Drop-in -->
  <script 
    src="https://cdn.jsdelivr.net/npm/@event-overlay/holi@1.0.6/dist/index.umd.js" 
    data-autostart>
  </script>
</body>
</html>
```

Or trigger manually via the global `window.HoliOverlay` object:

```html
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/holi@1.0.6/dist/index.umd.js"></script>
<script>
  window.HoliOverlay.start({
    maxBalloons: 12,
    maxPichkaaris: 3
  });
</script>
```

---

### 4. Vue 3 / Nuxt

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { start, stop } from '@event-overlay/holi';

onMounted(() => {
  start({ maxBalloons: 15, maxPichkaaris: 4 });
});

onUnmounted(() => {
  stop();
});
</script>

<template>
  <main>
    <h1>Happy Holi! 🎨</h1>
  </main>
</template>
```

---

## ⚙️ Configuration & Props Reference

Customize every aspect of the celebration to fit your design:

| Prop / Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxBalloons` | `number` | `15` | Maximum number of concurrent water balloons launched from viewport boundaries. |
| `maxPichkaaris` | `number` | `4` | Maximum number of simultaneous pichkaari (water gun) streams sweeping across the screen. |
| `colors` | `ColorRGB[]` | *9-color preset* | Custom RGB color palette array for balloons, splash stains, water streams, and powder particles. |
| `showAmbient` | `boolean` | `true` | Enables pulsating corner watercolor splash gradients. |
| `opacity` | `number` | `0.95` | Master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the fixed canvas overlay. |
| `duration` | `number` | `0` | Auto-stop countdown in milliseconds (`0` = runs continuously until stopped). |
| `active` | `boolean` | `true` | *(React only)* Controls whether the overlay is actively rendering. |
| `container` | `string` | `'body'` | Target selector or DOM container where canvas should be mounted. |

---

## 🎨 Custom Color Palette Example

You can override the default festive palette with your own custom RGB colors:

```tsx
import { HoliOverlay } from '@event-overlay/holi/react';

const myFestiveColors = [
  { r: 255, g: 0, b: 128 },   // Vivid Magenta
  { r: 0, g: 230, b: 255 },   // Electric Cyan
  { r: 255, g: 195, b: 0 },   // Sun Yellow
  { r: 124, g: 252, b: 0 }    // Lawn Green
];

export default function CustomHoli() {
  return (
    <HoliOverlay 
      colors={myFestiveColors}
      maxBalloons={18}
      maxPichkaaris={6}
    />
  );
}
```

---

## 🛠️ TypeScript Support

Full TypeScript definitions are included out of the box:

```typescript
import type { HoliOverlayProps, HoliOptions, ColorRGB } from '@event-overlay/holi';

const config: HoliOptions = {
  maxBalloons: 20,
  maxPichkaaris: 5,
  colors: [
    { r: 255, g: 87, b: 51 },
    { r: 255, g: 189, b: 51 }
  ]
};
```

---

## 🎯 High-Performance Engine Design

1. **Sub-Pixel Particle Simulation**: Powered by an internal physics loop with velocity damping, randomized mass, realistic trajectory drag, and gravity curves.
2. **Zero Allocation Rendering**: Reuses coordinate buffers and optimized canvas paths to prevent memory churn and garbage collection hiccups.
3. **Adaptive Viewport Resizing**: Automatically listens to window resize and device pixel ratio (DPR) changes for crystal-clear visuals on high-density Retina screens.
4. **Clean Teardown**: Automatically cancels `requestAnimationFrame` loops and removes canvas elements on unmount.

---

## 🔍 Keywords & Discovery

`holi` • `holi-overlay` • `holi-festival` • `festival-of-colors` • `rangotsav` • `gulal` • `pichkaari` • `water-balloon` • `colors-festival` • `celebration-overlay` • `festive-overlay` • `canvas-confetti` • `particle-effects` • `react-holi` • `react-celebration` • `react-festive` • `nextjs-overlay` • `indian-festivals` • `happy-holi` • `web-animation` • `canvas-overlay` • `zero-dependency`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
