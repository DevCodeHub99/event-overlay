# @event-overlay/independence-day 🇮🇳

> High-performance, zero-dependency Indian Independence Day celebration overlay.

## 📦 Installation
```bash
npm install @event-overlay/independence-day
```

## 🚀 Usage

### React / Next.js
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

### Vanilla JavaScript
```javascript
import { start, stop } from '@event-overlay/independence-day';

start({
  waveOpacity: 0.65,
  maxFlags: 3,
  maxKites: 6
});
```

## 📄 License
MIT © Vikas
