<p align="center">
  <span style="font-size: 72px;">🎆</span>
</p>

<h1 align="center">@event-overlay/core</h1>

<p align="center">
  <strong>Lightweight, headless celebration overlay engine with 60 FPS Canvas loop, WCAG 2.2.2 controls, and Page Visibility pausing. Zero external dependencies.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/v/@event-overlay/core.svg?style=flat-square&color=38bdf8" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~3KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌟 Overview

`@event-overlay/core` is the pure, headless foundation powering the event-overlay suite. It contains **zero festival-specific graphics** (~3 KB gzipped) and handles all the complex infrastructure:

- **60 FPS Physics Loop**: High-DPI retina canvas scaling with sub-pixel rendering.
- **WCAG 2.2.2 User Choice**: Floating glassmorphic controls (`[ ⏸ Pause | ✕ ]`), launcher badge restore, and <kbd>Esc</kbd> shortcut.
- **Tab Visibility Pausing**: Automatically suspends loops when the user switches tabs (0% CPU/battery).
- **Custom Event Registry**: Define and launch any custom visual celebration.

---

## 📦 Installation

```bash
npm install @event-overlay/core
```

---

## 🚀 Building a Custom Celebration Event

```javascript
import { registerEvent, start } from '@event-overlay/core';

// 1. Define your custom event module
const GoldenStarsEvent = {
  id: 'golden-stars',
  name: 'Golden Stars Celebration',
  init(ctx, width, height, options) {
    this.stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5
    }));
  },
  update(time, delta, width, height) {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > height) star.y = 0;
    });
  },
  draw(ctx, width, height, time) {
    ctx.fillStyle = '#FFD700';
    this.stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  },
  destroy() {
    this.stars = [];
  }
};

// 2. Register the module
registerEvent(GoldenStarsEvent);

// 3. Start the celebration with full controls and visibility pausing!
start('golden-stars');
```

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
