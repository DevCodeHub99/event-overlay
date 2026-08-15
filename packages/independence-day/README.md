<p align="center">
  <span style="font-size: 72px;">🇮🇳</span>
</p>

<h1 align="center">@event-overlay/independence-day</h1>

<p align="center">
  <strong>Patriotic, high-performance Indian Independence Day & Republic Day celebration overlay for React, Next.js, Vue, and Vanilla JS.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/independence-day"><img src="https://img.shields.io/npm/v/@event-overlay/independence-day.svg?style=flat-square&color=ff9933" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/independence-day"><img src="https://img.shields.io/npm/dm/@event-overlay/independence-day.svg?style=flat-square&color=138808" alt="npm downloads" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~12KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🇮🇳 Overview

Celebrate **Indian Independence Day (15th August)** and **Republic Day (26th January)** in style! `@event-overlay/independence-day` is a turnkey, zero-dependency celebration canvas overlay for modern web applications.

It renders an authentic, breathtaking patriotic atmosphere featuring the **Tricolor Silk Wave**, fluttering **Tiranga flags**, **high-altitude kites**, **IAF fighter jet airshows with tricolor smoke trails**, **grand fireworks**, and **drifting marigold petals** at buttery-smooth 60 FPS.

---

## ✨ Festive Elements & Features

- 🌊 **Tricolor Silk Banner Wave**: Soft, billowing saffron-white-green satin ribbons flowing gracefully across the screen.
- 🚩 **Waving Indian Flags (Tiranga)**: Realistic cloth simulation of the Indian National Flag with Ashoka Chakra details.
- 🪁 **High-Altitude Flying Kites**: Colorful kites soaring with swaying physics-based tails and ribbons.
- ✈️ **Fighter Jet Airshow**: High-speed aircraft formations streaking across the sky, painting persistent saffron, white, and green smoke vapor trails.
- 🎆 **Grand Fireworks & Sparklers**: Dazzling bursts of gold, saffron, and emerald sparkler clusters.
- 🌸 **Drifting Petals**: Natural marigold (*Genda*) and rose flower petals floating in gentle wind vectors.
- 🌅 **Ambient National Glow**: Top saffron and bottom green atmospheric glows.
- ⚡ **Lightweight & High Performance**: 60 FPS hardware-accelerated Canvas 2D engine with zero external dependencies (~12KB gzipped).
- 🛡️ **Non-Intrusive & Accessible**: Configured with `pointer-events: none` and `aria-hidden="true"` so your website remains 100% interactive.
- 🧩 **Universal Framework Support**: Ready for **React**, **Next.js (App & Pages Router)**, **Vue**, **Svelte**, **Angular**, **Vite**, and **HTML CDN script tags**.

---

## 📦 Installation

```bash
# npm
npm install @event-overlay/independence-day

# yarn
yarn add @event-overlay/independence-day

# pnpm
pnpm add @event-overlay/independence-day

# bun
bun add @event-overlay/independence-day
```

---

## 🚀 Quick Start Guide

### 1. React & Next.js (App Router / Pages Router)

Import `IndependenceDayOverlay` and place it in your root layout or page:

```tsx
import { IndependenceDayOverlay } from '@event-overlay/independence-day/react';

export default function App() {
  return (
    <main>
      {/* Patriotic celebration overlay */}
      <IndependenceDayOverlay 
        waveOpacity={0.65} 
        maxFlags={3} 
        maxKites={6} 
        maxJets={2} 
        maxFireworks={3} 
        maxPetals={35} 
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem' }}>
        <h1>🇮🇳 Happy Independence Day! Jai Hind! 🇮🇳</h1>
        <p>Your interactive site content remains fully clickable.</p>
      </div>
    </main>
  );
}
```

> **Next.js App Router Note**: `IndependenceDayOverlay` contains `'use client'` internally, ensuring seamless compatibility with Next.js 13/14/15 Server & Client components.

---

### 2. Vanilla JavaScript / TypeScript (Vite, Webpack, ES Modules)

```javascript
import { start, stop, toggle, isRunning } from '@event-overlay/independence-day';

// Launch overlay with custom particle densities
const overlay = start({
  waveOpacity: 0.65,
  maxFlags: 3,
  maxKites: 6,
  maxJets: 2,
  maxFireworks: 3,
  maxPetals: 35
});

// Programmatic controls:
// stop();        // Disables overlay and cleans up resources
// toggle();      // Toggles active state
// isRunning();   // Returns true if animation is currently active
```

---

### 3. HTML CDN Drop-in Script Tag (No Build Tools Required)

Add directly before your closing `</body>` tag. Add `data-autostart` to launch immediately:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Happy Independence Day</title>
</head>
<body>
  <h1>Celebration Sale is Live! 🇮🇳</h1>

  <!-- 1-line CDN Drop-in -->
  <script 
    src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day/dist/index.umd.js" 
    data-autostart>
  </script>
</body>
</html>
```

Or trigger manually via global `window.IndependenceDayOverlay`:

```html
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day/dist/index.umd.js"></script>
<script>
  window.IndependenceDayOverlay.start({
    maxKites: 8,
    maxJets: 3
  });
</script>
```

---

### 4. Vue 3 / Nuxt

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { start, stop } from '@event-overlay/independence-day';

onMounted(() => {
  start({ waveOpacity: 0.6, maxKites: 6, maxFlags: 3 });
});

onUnmounted(() => {
  stop();
});
</script>

<template>
  <main>
    <h1>Happy Independence Day! 🇮🇳</h1>
  </main>
</template>
```

---

## ⚙️ Configuration & Props Reference

| Prop / Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showWave` | `boolean` | `true` | Enables or disables the flowing Tricolor Silk Banner Wave. |
| `waveOpacity` | `number` | `0.65` | Transparency level of the flowing silk wave (`0.0` to `1.0`). |
| `maxFlags` | `number` | `3` | Maximum simultaneous waving Indian National Flags (*Tiranga*). |
| `maxKites` | `number` | `6` | Maximum simultaneous flying kites with swaying ribbons. |
| `maxJets` | `number` | `2` | Number of fighter jets crossing with saffron-white-green vapor trails. |
| `maxFireworks` | `number` | `3` | Maximum bursting fireworks and sparkler clusters. |
| `maxPetals` | `number` | `35` | Drifting marigold (*Genda*) and rose petals floating with wind. |
| `showGlow` | `boolean` | `true` | Ambient Saffron top glow and Green bottom glow. |
| `opacity` | `number` | `0.95` | Overall canvas master opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay. |
| `duration` | `number` | `0` | Auto-stop timer in milliseconds (`0` = continuous). |
| `active` | `boolean` | `true` | *(React only)* Toggle animation on/off dynamically. |
| `container` | `string` | `'body'` | DOM element selector to append the canvas to. |

---

## 🛠️ TypeScript Support

```typescript
import type { 
  IndependenceDayOverlayProps, 
  IndependenceDayOptions 
} from '@event-overlay/independence-day';

const options: IndependenceDayOptions = {
  waveOpacity: 0.7,
  maxFlags: 4,
  maxKites: 8,
  maxJets: 3,
  maxFireworks: 5,
  maxPetals: 50
};
```

---

## 🔍 Keywords & Discovery

`independence-day` • `indian-independence-day` • `15-august` • `republic-day` • `26-january` • `tiranga` • `indian-flag` • `tricolor` • `kites` • `patriotism` • `airshow` • `fighter-jets` • `fireworks` • `azadi-ka-amrit-mahotsav` • `react-independence-day` • `celebration-overlay` • `canvas-animation` • `react-festive` • `nextjs-overlay` • `web-animation` • `canvas-overlay` • `zero-dependency`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
