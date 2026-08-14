<p align="center">
  <span style="font-size: 64px;">🎆</span>
</p>

<h1 align="center">@event-overlay</h1>

<p align="center">
  <strong>A high-performance, plug-and-play celebration overlay framework with dedicated packages for any website or framework.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/size-~12KB%20gzipped-00bfff?style=flat-square" alt="Size" />
  <img src="https://img.shields.io/badge/dependencies-zero-32cd32?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/license-MIT-ffdf00?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/framework-agnostic-9400d3?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/typescript-included-3178c6?style=flat-square" alt="TypeScript" />
</p>

---

## 📦 Dedicated NPM Packages

| Package | Install Command | Description |
| :--- | :--- | :--- |
| **🇮🇳 Independence Day** | `npm install @event-overlay/independence-day` | Standalone Indian Independence Day celebration overlay (~12KB). |
| **🎨 Holi Festival** | `npm install @event-overlay/holi` | Standalone Holi festival water balloon & pichkaari overlay. |
| **🎆 Core Engine** | `npm install @event-overlay/core` | Unified multi-event celebration engine with subpaths. |

---

## 🚀 Quick Usage

### 1. 🇮🇳 Independence Day Overlay (`@event-overlay/independence-day`)

#### React / Next.js:
```bash
npm install @event-overlay/independence-day
```
```jsx
import { IndependenceDayOverlay } from '@event-overlay/independence-day/react';

export default function App() {
  return (
    <main>
      <IndependenceDayOverlay waveOpacity={0.65} maxFlags={3} maxKites={6} />
      <h1>Happy Independence Day! 🇮🇳</h1>
    </main>
  );
}
```

#### Vanilla JavaScript / HTML:
```javascript
import { start, stop } from '@event-overlay/independence-day';

start({
  waveOpacity: 0.65,
  maxFlags: 3,
  maxKites: 6
});
```

---

### 2. 🎨 Holi Festival Overlay (`@event-overlay/holi`)

#### React / Next.js:
```bash
npm install @event-overlay/holi
```
```jsx
import { HoliOverlay } from '@event-overlay/holi/react';

export default function App() {
  return (
    <main>
      <HoliOverlay maxBalloons={15} maxPichkaaris={4} opacity={0.95} />
      <h1>Happy Holi! 🎨</h1>
    </main>
  );
}
```

#### Vanilla JavaScript / HTML:
```javascript
import { start, stop } from '@event-overlay/holi';

start({
  maxBalloons: 15,
  maxPichkaaris: 4
});
```

---

### 3. 🌐 HTML CDN Drop-in Tags

Add directly before `</body>`:

```html
<!-- Independence Day -->
<script 
  src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day/dist/index.umd.js" 
  data-autostart>
</script>

<!-- Holi Festival -->
<script 
  src="https://cdn.jsdelivr.net/npm/@event-overlay/holi/dist/index.umd.js" 
  data-autostart>
</script>
```

---

## ⚙️ Configuration & Props Reference

### Independence Day Options

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

### Holi Festival Options

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxBalloons` | `number` | `15` | Maximum simultaneous water balloons launched from edges |
| `maxPichkaaris` | `number` | `4` | Water gun streams sweeping across the screen |
| `colors` | `ColorRGB[]` | `9 colors` | Custom RGB color palette for balloons, powder & splashes |
| `showAmbient` | `boolean` | `true` | Pulsating watercolor corner stains in all 4 corners |
| `opacity` | `number` | `0.95` | Overall canvas opacity (`0.0` to `1.0`) |
| `duration` | `number` | `0` | Auto-stop timer in ms (`0` = runs continuously) |

---

## 📄 License

MIT © Vikas
