<p align="center">
  <span style="font-size: 64px;">🎆</span>
</p>

<h1 align="center">Event Overlay</h1>

<p align="center">
  <strong>A high-performance, plug-and-play celebration overlay engine for any website or framework.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/size-~12KB%20gzipped-00bfff?style=flat-square" alt="Size" />
  <img src="https://img.shields.io/badge/dependencies-zero-32cd32?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-included-3178c6?style=flat-square" alt="TypeScript" />
</p>

---

## 🌟 Overview

`@devcodehub99/event-overlay` is a lightweight, zero-dependency HTML5 Canvas engine designed for dynamic festive celebrations. It features a plug-and-play modular architecture with full tree-shaking support where individual events can be imported independently without bundling unused code.

Supported out-of-the-box:
- 🇮🇳 **Independence Day Overlay** (Flowing Tricolor Silk Wave, Waving Indian Flags with 24-spoke Ashoka Chakra, Flying Kites, Airshow Jets, Fireworks, and Marigold Petals)
- 🎨 **Holi Festival Overlay** (Bursting Water Balloons, Sweeping Pichkaari Streams, Particle Splash Blooms, and Ambient Color Corners)
- 🔌 **Extensible Kernel** for custom celebrations (Diwali, Christmas, New Year, etc.)

---

## 📦 Installation

```bash
# npm
npm install @devcodehub99/event-overlay

# yarn
yarn add @devcodehub99/event-overlay

# pnpm
pnpm add @devcodehub99/event-overlay
```

---

## 🚀 Tree-Shakeable Usage

### 1. React / Next.js (Tree-Shakeable Subpaths)

#### 🇮🇳 Independence Day:
```jsx
import { IndependenceDayOverlay } from '@devcodehub99/event-overlay/react/independence-day';

export default function App() {
    return (
        <main>
            {/* Loads ONLY Independence Day (~12KB) */}
            <IndependenceDayOverlay 
                opacity={0.95} 
                waveOpacity={0.65}
                maxFlags={3} 
                maxKites={6} 
            />
            <h1>Happy Independence Day! 🇮🇳</h1>
        </main>
    );
}
```

#### 🎨 Holi Festival:
```jsx
import { HoliOverlay } from '@devcodehub99/event-overlay/react/holi';

export default function App() {
    return (
        <main>
            <HoliOverlay maxBalloons={15} maxPichkaaris={4} opacity={0.95} />
            <h1>Happy Holi! 🎨</h1>
        </main>
    );
}
```

---

### 2. Vanilla JavaScript (ES Module)

```javascript
import { start, stop } from '@devcodehub99/event-overlay/independence-day';

// Start Independence Day overlay
const overlay = start({
    opacity: 0.95,
    eventOptions: {
        waveOpacity: 0.65,
        maxFlags: 3,
        maxKites: 6,
        maxJets: 2
    }
});

// Controls
// overlay.stop();
// overlay.toggle();
```

---

### 3. Standalone Next.js TypeScript Components

Copy `IndependenceDayOverlay.tsx` or `HoliOverlay.tsx` directly into your Next.js project:

```tsx
import IndependenceDayOverlay from '@/components/IndependenceDayOverlay';

export default function Page() {
    return (
        <main>
            <IndependenceDayOverlay showWave={true} waveOpacity={0.65} />
        </main>
    );
}
```

---

### 4. CDN Drop-in Script Tag

Add a single script tag before `</body>`:

```html
<!-- Standalone Independence Day -->
<script 
  src="https://cdn.jsdelivr.net/npm/@devcodehub99/event-overlay/dist/events/independence-day.umd.js" 
  data-autostart>
</script>

<!-- Standalone Holi -->
<script 
  src="https://cdn.jsdelivr.net/npm/@devcodehub99/event-overlay/dist/events/holi.umd.js" 
  data-autostart>
</script>
```

---

## ⚙️ Configuration & Props Reference

### Independence Day Options (`IndependenceDayOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `waveOpacity` | `number` | `0.65` | Transparency/opacity of the flowing Tricolor Silk Wave (`0.0` to `1.0`) |
| `showWave` | `boolean` | `true` | Enable or disable the flowing tricolor silk banner wave |
| `maxFlags` | `number` | `3` | Maximum simultaneous waving Indian National Flags (Tiranga) |
| `maxKites` | `number` | `6` | Maximum simultaneous flying tricolor kites with ribbons |
| `maxJets` | `number` | `2` | Fighter jets crossing with tricolor smoke vapor trails |
| `maxFireworks` | `number` | `3` | Bursting fireworks and gold sparkler clusters |
| `maxPetals` | `number` | `35` | Marigold and rose petals drifting with wind physics |
| `showGlow` | `boolean` | `true` | Ambient Saffron top glow and Green bottom glow |
| `opacity` | `number` | `0.95` | Overall canvas opacity (`0.0` to `1.0`) |
| `zIndex` | `number` | `99999` | CSS z-index applied to the canvas overlay |

### Holi Options (`HoliOptions`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxBalloons` | `number` | `15` | Maximum simultaneous water balloons launched from edges |
| `maxPichkaaris` | `number` | `4` | Water gun streams sweeping across the screen |
| `colors` | `ColorRGB[]` | `9 colors` | Custom RGB color palette for balloons, powder & splashes |
| `showAmbient` | `boolean` | `true` | Pulsating watercolor corner stains in all 4 corners |
| `opacity` | `number` | `0.95` | Overall canvas opacity (`0.0` to `1.0`) |
| `duration` | `number` | `0` | Auto-stop timer in ms (`0` = runs continuously) |

---

## 🔌 Custom Event Architecture

You can plug in custom event themes with 3 simple steps:

```javascript
import { registerEvent, start } from '@devcodehub99/event-overlay';

// 1. Define custom EventModule
export const DiwaliEvent = {
    id: 'diwali',
    name: 'Diwali Celebration',
    init(ctx, width, height, options) { /* Setup diyas, sparklers */ },
    update(time, delta, width, height) { /* Physics update loop */ },
    draw(ctx, width, height, time) { /* High-DPI canvas render */ },
    destroy() { /* Cleanup resources */ }
};

// 2. Register module
registerEvent(DiwaliEvent);

// 3. Start anywhere
start('diwali');
```

---

## 📄 License

MIT © Vikas
