<p align="center">
  <span style="font-size: 72px;">🪔</span>
</p>

<h1 align="center">@event-overlay/diwali</h1>

<p align="center">
  <strong>Luminous, ultra-high-performance Diwali celebration canvas overlay for modern web applications.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/diwali"><img src="https://img.shields.io/npm/v/@event-overlay/diwali.svg?style=flat-square&color=ffd700" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~9KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🪔 Overview

Celebrate **Diwali (Deepavali — The Festival of Lights)** on your website or web app! `@event-overlay/diwali` brings the radiant energy and visual majesty of Diwali to any digital screen at buttery-smooth 60 FPS.

Featuring realistic **Sky Rockets & Aerial Shells (Willow, Peony, Chrysanthemum)**, **Clay Diyas with natural flickering flames**, **Anar (Golden Fountains)**, **Chakri (Ground Spinners)**, **Akash Kandil (Sky Lanterns)**, and **Interactive Phuljhadi (Sparkler Cursor)**.

---

## ✨ Festive Elements

- 🎆 **Grand Aerial Fireworks**: Multi-phase rocket fireworks with realistic trails and explosive aerial spherical bursts.
- 🪔 **Clay Diyas (Deepam)**: Terracotta oil lamps arranged along the bottom edge with organic flickering flame and warm ambient halo.
- 🌋 **Anar (Golden Fountains)**: Conical flowerpot fireworks shooting vertical streams of dazzling golden sparks.
- 💫 **Chakri (Ground Spinners)**: High-speed ground wheels emitting spiral spark vortexes.
- 🏮 **Akash Kandil (Sky Lanterns)**: Paper lanterns gently floating into the night sky with sinusoidal wind sway.
- ✨ **Interactive Phuljhadi (Sparkler Cursor)**: Pointer motion generates crackling starburst sparks with additive light blending.
- ⚡ **Zero Dependencies & Lightweight**: <9KB gzipped with zero external library overhead.
- 🛡️ **Non-Intrusive**: Layered with `pointer-events: none` and `aria-hidden="true"` so your app remains 100% interactive.

---

## 📦 Installation

```bash
# npm
npm install @event-overlay/diwali

# yarn
yarn add @event-overlay/diwali

# pnpm
pnpm add @event-overlay/diwali
```

---

## 🚀 Quick Start Guide

### React & Next.js

```tsx
import { DiwaliOverlay } from '@event-overlay/diwali/react';

export default function App() {
  return (
    <main>
      <DiwaliOverlay 
        enableFireworks={true}
        enableDiyas={true}
        enableFountains={true}
        sparklerCursor={true}
      />
      <h1>Happy Diwali! 🪔✨</h1>
    </main>
  );
}
```

### Vanilla JavaScript

```javascript
import { start, stop } from '@event-overlay/diwali';

const overlay = start({
  enableFireworks: true,
  enableDiyas: true,
  sparklerCursor: true
});
```

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
