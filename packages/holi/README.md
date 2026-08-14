# @event-overlay/holi 🎨

> High-performance, zero-dependency Holi festival celebration overlay.

## 📦 Installation
```bash
npm install @event-overlay/holi
```

## 🚀 Usage

### React / Next.js
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

### Vanilla JavaScript
```javascript
import { start, stop } from '@event-overlay/holi';

start({
  maxBalloons: 15,
  maxPichkaaris: 4
});
```

## 📄 License
MIT © Vikas
