<p align="center">
  <span style="font-size: 72px;">🎆</span>
</p>

<h1 align="center">@event-overlay/core</h1>

<p align="center">
  <strong>The high-performance, modular celebration overlay framework for web applications. Zero dependencies, 60 FPS Canvas 2D engine, and tree-shakeable festival modules.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/v/@event-overlay/core.svg?style=flat-square&color=38bdf8" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@event-overlay/core"><img src="https://img.shields.io/npm/dm/@event-overlay/core.svg?style=flat-square&color=32cd32" alt="npm downloads" /></a>
  <img src="https://img.shields.io/badge/bundle%20size-~12KB%20gzipped-00bfff?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-ready-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
</p>

---

## 🌟 Overview

`@event-overlay/core` is an extensible celebration overlay engine built for high-performance festive visual effects in web apps. Whether you need Indian Independence Day celebrations, Holi festival color splashes, Diwali fireworks, New Year confetti, or custom interactive animations, the core engine manages the particle physics, responsive canvas scaling, frame scheduling, and non-blocking teardown seamlessly.

---

## 📦 Installation

```bash
# npm
npm install @event-overlay/core

# yarn
yarn add @event-overlay/core

# pnpm
pnpm add @event-overlay/core

# bun
bun add @event-overlay/core
```

---

## 🚀 Tree-Shakeable Subpaths

Import only what you need to keep your bundle minimal:

| Subpath | Description |
| :--- | :--- |
| `@event-overlay/core` | Unified engine with built-in Independence Day & Holi events |
| `@event-overlay/core/independence-day` | Standalone Indian Independence Day celebration event |
| `@event-overlay/core/holi` | Standalone Holi festival water balloon & pichkaari event |
| `@event-overlay/core/react` | React component wrappers for all celebration events |

---

## 💻 Quick Usage

### React & Next.js

```tsx
import { EventOverlay, IndependenceDayOverlay, HoliOverlay } from '@event-overlay/core/react';

export default function App() {
  return (
    <main>
      {/* Run any event via EventOverlay */}
      <EventOverlay event="independence-day" maxKites={6} maxFlags={3} />

      {/* Or use the dedicated component */}
      {/* <HoliOverlay maxBalloons={15} maxPichkaaris={4} /> */}

      <h1>Welcome to the Celebration! 🎆</h1>
    </main>
  );
}
```

### Vanilla JavaScript

```javascript
import { start, stop, toggle, isRunning } from '@event-overlay/core';

// Start Independence Day overlay
start({
  event: 'independence-day',
  maxKites: 6,
  maxFlags: 3,
  waveOpacity: 0.65
});

// Or start Holi overlay
// start({
//   event: 'holi',
//   maxBalloons: 15,
//   maxPichkaaris: 4
// });
```

---

## 🧩 Building Custom Events

You can easily register and plug your own custom celebration particle engines into the core runtime:

```typescript
import { registerEvent, start, EventModule } from '@event-overlay/core';

const ConfettiEvent: EventModule = {
  name: 'new-year-confetti',
  init(canvas, ctx, options) {
    // Initialize particle arrays and state
  },
  render(canvas, ctx, delta, options) {
    // Draw 60fps frame on Canvas 2D
  },
  destroy() {
    // Cleanup particle memory
  }
};

// Register custom event
registerEvent(ConfettiEvent);

// Launch it!
start({ event: 'new-year-confetti' });
```

---

## ⚙️ Core Engine Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `event` | `'independence-day' \| 'holi' \| string` | `'independence-day'` | Name of registered event to trigger. |
| `opacity` | `number` | `0.95` | Master canvas opacity (`0.0` to `1.0`). |
| `zIndex` | `number` | `99999` | CSS z-index applied to fixed canvas. |
| `duration` | `number` | `0` | Auto-stop timer in milliseconds (`0` = continuous). |
| `container` | `string` | `'body'` | Target selector or DOM container where canvas attaches. |

---

## 🔍 Keywords & Discovery

`event-overlay` • `celebration-overlay` • `festive-overlay` • `canvas-animation` • `particle-effects` • `react-celebration` • `react-festive` • `independence-day` • `holi-overlay` • `holi-festival` • `fireworks` • `confetti` • `canvas-overlay` • `nextjs-animation` • `zero-dependency` • `web-animation`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
