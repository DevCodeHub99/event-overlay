/**
 * 📦 Multi-Package Monorepo Build Script for @event-overlay/*
 * Emits dedicated packages:
 *   1. @event-overlay/independence-day  (packages/independence-day)
 *   2. @event-overlay/holi              (packages/holi)
 *   3. @event-overlay/core              (packages/core)
 *
 * Zero external dependencies.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const PACKAGES_DIR = path.join(__dirname, 'packages');

const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const CURRENT_VERSION = rootPkg.version || '1.0.0';

// Recreate dist and packages directories
[DIST_DIR, PACKAGES_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
});

fs.mkdirSync(path.join(DIST_DIR, 'events'), { recursive: true });

// Read source files
const utilsSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'utils.js'), 'utf-8');
const engineSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'engine.js'), 'utf-8');
const holiSource = fs.readFileSync(path.join(SRC_DIR, 'events', 'holi.js'), 'utf-8');
const independenceSource = fs.readFileSync(path.join(SRC_DIR, 'events', 'independence-day.js'), 'utf-8');

const tsxIndep = fs.existsSync(path.join(__dirname, 'IndependenceDayOverlay.tsx'))
    ? fs.readFileSync(path.join(__dirname, 'IndependenceDayOverlay.tsx'), 'utf-8')
    : '';

const tsxHoli = fs.existsSync(path.join(__dirname, 'HoliOverlay.tsx'))
    ? fs.readFileSync(path.join(__dirname, 'HoliOverlay.tsx'), 'utf-8')
    : '';

const licenseText = fs.existsSync(path.join(__dirname, 'LICENSE'))
    ? fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf-8')
    : 'MIT License';

// Helper to clean module syntax for internal inlining
function stripInternalExports(code) {
    return code
        .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+default\s+[\w$]+;?/g, '')
        .replace(/export\s*\{[\s\S]*?\};?/g, '')
        .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ');
}

const utilsClean = stripInternalExports(utilsSource);
const engineClean = stripInternalExports(engineSource);
const holiClean = stripInternalExports(holiSource);
const indepClean = stripInternalExports(independenceSource);

function minify(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/^\s+/gm, '')
        .replace(/\n{2,}/g, '\n')
        .split('\n').filter(line => line.trim().length > 0).join('\n');
}

// ─────────────────────────────────────────────
// 1. Build Unified Bundle (@event-overlay/core)
// ─────────────────────────────────────────────
const esmUnified = `/**
 * 🎆 @event-overlay/core v1.0.0 — Unified Bundle
 * @license MIT
 */

// ─── UTILS ───
${utilsClean}

// ─── CORE ENGINE ───
${engineClean}

// ─── HOLI EVENT ───
${holiClean}

// ─── INDEPENDENCE DAY EVENT ───
${indepClean}

// Auto-register built-in events
registerEvent(IndependenceDayEvent);
registerEvent(HoliEvent);

let _activeInstance = null;

export function start(eventName = 'independence-day', options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    let opts = options;
    if (typeof eventName === 'object') {
        opts = eventName;
        eventName = opts.event || 'independence-day';
    } else {
        opts.event = eventName;
    }
    _activeInstance = new EventOverlayEngine(opts);
    _activeInstance.start();
    return _activeInstance;
}

export function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

export function toggle(eventName = 'independence-day', options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(eventName, options);
    }
}

export function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}

export function create(options = {}) {
    return new EventOverlayEngine(options);
}

export {
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds,
    EventOverlayEngine,
    IndependenceDayEvent,
    HoliEvent,
    filterInPlace,
    randomRange,
    getSafeDPR,
    prefersReducedMotion
};

const EventOverlay = {
    version: '1.0.0',
    start,
    stop,
    toggle,
    isRunning,
    create,
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds,
    IndependenceDayEvent,
    HoliEvent,
    EventOverlayEngine
};

export default EventOverlay;
`;

fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.js'), esmUnified, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.min.js'), minify(esmUnified), 'utf-8');

const umdUnifiedCore = esmUnified
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim();

const umdUnified = `/**
 * 🎆 @event-overlay/core v1.0.0 — Unified UMD Build
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.EventOverlay = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

${umdUnifiedCore}

    if (typeof document !== 'undefined') {
        var _script = document.currentScript || (function () {
            var s = document.getElementsByTagName('script');
            return s[s.length - 1];
        })();
        if (_script && _script.hasAttribute('data-autostart')) {
            var _init = function () {
                var eventName = _script.getAttribute('data-event') || 'independence-day';
                var opts = {};
                if (_script.getAttribute('data-z-index')) opts.zIndex = parseInt(_script.getAttribute('data-z-index'), 10);
                if (_script.getAttribute('data-opacity')) opts.opacity = parseFloat(_script.getAttribute('data-opacity'));
                if (_script.getAttribute('data-duration')) opts.duration = parseInt(_script.getAttribute('data-duration'), 10);
                EventOverlay.start(eventName, opts);
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _init);
            } else {
                _init();
            }
        }
    }

    return EventOverlay;
}));
`;
fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.umd.js'), umdUnified, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.cjs'), umdUnified, 'utf-8');

// ─────────────────────────────────────────────
// 2. Build Dedicated Package: @event-overlay/independence-day
// ─────────────────────────────────────────────
const esmIndep = `/**
 * 🇮🇳 @event-overlay/independence-day v1.0.0
 * @license MIT
 */

// ─── UTILS ───
${utilsClean}

// ─── CORE ENGINE ───
${engineClean}

// ─── INDEPENDENCE DAY EVENT ───
${indepClean}

registerEvent(IndependenceDayEvent);

let _activeInstance = null;

export function start(options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    const opts = Object.assign({}, options, { event: 'independence-day', eventOptions: options });
    _activeInstance = new EventOverlayEngine(opts);
    _activeInstance.start();
    return _activeInstance;
}

export function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

export function toggle(options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

export function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}

export {
    IndependenceDayEvent,
    EventOverlayEngine
};

const IndependenceDayOverlay = {
    version: '1.0.0',
    start,
    stop,
    toggle,
    isRunning,
    IndependenceDayEvent,
    EventOverlayEngine
};

export default IndependenceDayOverlay;
`;

fs.writeFileSync(path.join(DIST_DIR, 'events', 'independence-day.js'), esmIndep, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'events', 'independence-day.min.js'), minify(esmIndep), 'utf-8');

const umdIndepCore = esmIndep
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim();

const umdIndep = `/**
 * 🇮🇳 @event-overlay/independence-day v1.0.0 — Standalone UMD
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.IndependenceDayOverlay = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

${umdIndepCore}

    if (typeof document !== 'undefined') {
        var _script = document.currentScript || (function () {
            var s = document.getElementsByTagName('script');
            return s[s.length - 1];
        })();
        if (_script && _script.hasAttribute('data-autostart')) {
            var _init = function () {
                var opts = {};
                if (_script.getAttribute('data-z-index')) opts.zIndex = parseInt(_script.getAttribute('data-z-index'), 10);
                if (_script.getAttribute('data-opacity')) opts.opacity = parseFloat(_script.getAttribute('data-opacity'));
                if (_script.getAttribute('data-duration')) opts.duration = parseInt(_script.getAttribute('data-duration'), 10);
                if (_script.getAttribute('data-max-flags')) opts.maxFlags = parseInt(_script.getAttribute('data-max-flags'), 10);
                if (_script.getAttribute('data-max-kites')) opts.maxKites = parseInt(_script.getAttribute('data-max-kites'), 10);
                if (_script.getAttribute('data-max-jets')) opts.maxJets = parseInt(_script.getAttribute('data-max-jets'), 10);
                if (_script.getAttribute('data-max-fireworks')) opts.maxFireworks = parseInt(_script.getAttribute('data-max-fireworks'), 10);
                if (_script.getAttribute('data-wave-opacity')) opts.waveOpacity = parseFloat(_script.getAttribute('data-wave-opacity'));
                IndependenceDayOverlay.start(opts);
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _init);
            } else {
                _init();
            }
        }
    }

    return IndependenceDayOverlay;
}));
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'independence-day.umd.js'), umdIndep, 'utf-8');

// ─────────────────────────────────────────────
// 3. Build Dedicated Package: @event-overlay/holi
// ─────────────────────────────────────────────
const esmHoli = `/**
 * 🎨 @event-overlay/holi v1.0.0
 * @license MIT
 */

// ─── UTILS ───
${utilsClean}

// ─── CORE ENGINE ───
${engineClean}

// ─── HOLI EVENT ───
${holiClean}

registerEvent(HoliEvent);

let _activeInstance = null;

export function start(options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    const opts = Object.assign({}, options, { event: 'holi', eventOptions: options });
    _activeInstance = new EventOverlayEngine(opts);
    _activeInstance.start();
    return _activeInstance;
}

export function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

export function toggle(options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

export function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}

export {
    HoliEvent,
    HOLI_COLORS,
    EventOverlayEngine
};

const HoliOverlay = {
    version: '1.0.0',
    start,
    stop,
    toggle,
    isRunning,
    HoliEvent,
    HOLI_COLORS,
    EventOverlayEngine
};

export default HoliOverlay;
`;

fs.writeFileSync(path.join(DIST_DIR, 'events', 'holi.js'), esmHoli, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'events', 'holi.min.js'), minify(esmHoli), 'utf-8');

const umdHoliCore = esmHoli
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim();

const umdHoli = `/**
 * 🎨 @event-overlay/holi v1.0.0 — Standalone UMD
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.HoliOverlay = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

${umdHoliCore}

    if (typeof document !== 'undefined') {
        var _script = document.currentScript || (function () {
            var s = document.getElementsByTagName('script');
            return s[s.length - 1];
        })();
        if (_script && _script.hasAttribute('data-autostart')) {
            var _init = function () {
                var opts = {};
                if (_script.getAttribute('data-z-index')) opts.zIndex = parseInt(_script.getAttribute('data-z-index'), 10);
                if (_script.getAttribute('data-opacity')) opts.opacity = parseFloat(_script.getAttribute('data-opacity'));
                if (_script.getAttribute('data-duration')) opts.duration = parseInt(_script.getAttribute('data-duration'), 10);
                if (_script.getAttribute('data-max-balloons')) opts.maxBalloons = parseInt(_script.getAttribute('data-max-balloons'), 10);
                if (_script.getAttribute('data-max-pichkaaris')) opts.maxPichkaaris = parseInt(_script.getAttribute('data-max-pichkaaris'), 10);
                HoliOverlay.start(opts);
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _init);
            } else {
                _init();
            }
        }
    }

    return HoliOverlay;
}));
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'holi.umd.js'), umdHoli, 'utf-8');

// Copy Types
const typesCore = fs.readFileSync(path.join(SRC_DIR, 'core', 'types.d.ts'), 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.d.ts'), typesCore, 'utf-8');

const indepDts = `import type { FC } from 'react';
import { IndependenceDayOptions, IndependenceDayOverlayProps } from '../event-overlay';
export * from '../event-overlay';
export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'independence-day.d.ts'), indepDts, 'utf-8');

const holiDts = `import type { FC } from 'react';
import { HoliOptions, HoliOverlayProps } from '../event-overlay';
export * from '../event-overlay';
export declare const HoliOverlay: FC<HoliOverlayProps>;
export default HoliOverlay;
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'holi.d.ts'), holiDts, 'utf-8');

// ─────────────────────────────────────────────
// 4. Output Dedicated Packages in /packages/*
// ─────────────────────────────────────────────

// A. @event-overlay/independence-day
const pkgIndepDir = path.join(PACKAGES_DIR, 'independence-day');
fs.mkdirSync(pkgIndepDir, { recursive: true });
fs.mkdirSync(path.join(pkgIndepDir, 'dist'), { recursive: true });

fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'index.js'), esmIndep, 'utf-8');
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'index.min.js'), minify(esmIndep), 'utf-8');
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'index.umd.js'), umdIndep, 'utf-8');
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'index.cjs'), umdIndep, 'utf-8');
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'index.d.ts'), `import type { FC } from 'react';

export interface IndependenceDayOptions {
    maxFlags?: number;
    maxKites?: number;
    maxJets?: number;
    maxFireworks?: number;
    maxPetals?: number;
    showGlow?: boolean;
    showWave?: boolean;
    waveOpacity?: number;
}

export interface IndependenceDayOverlayProps extends IndependenceDayOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: IndependenceDayOptions): any;
export declare function stop(): void;
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
`, 'utf-8');

if (tsxIndep) {
    fs.writeFileSync(path.join(pkgIndepDir, 'IndependenceDayOverlay.tsx'), tsxIndep, 'utf-8');
}
fs.writeFileSync(path.join(pkgIndepDir, 'LICENSE'), licenseText, 'utf-8');

const pkgIndepJson = {
    name: "@event-overlay/independence-day",
    version: CURRENT_VERSION,
    description: "🇮🇳 Lightweight, high-performance Indian Independence Day celebration overlay. Zero dependencies.",
    main: "dist/index.cjs",
    module: "dist/index.js",
    types: "dist/index.d.ts",
    browser: "dist/index.umd.js",
    exports: {
        ".": {
            import: "./dist/index.js",
            require: "./dist/index.cjs",
            types: "./dist/index.d.ts",
            default: "./dist/index.js"
        },
        "./react": {
            import: "./IndependenceDayOverlay.tsx",
            types: "./dist/index.d.ts"
        },
        "./umd": "./dist/index.umd.js"
    },
    sideEffects: false,
    publishConfig: {
        access: "public"
    },
    keywords: ["independence-day", "tiranga", "indian-flag", "kites", "airshow", "fireworks", "overlay", "react", "canvas"],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/independence-day"
    }
};
fs.writeFileSync(path.join(pkgIndepDir, 'package.json'), JSON.stringify(pkgIndepJson, null, 2), 'utf-8');

fs.writeFileSync(path.join(pkgIndepDir, 'README.md'), `# @event-overlay/independence-day 🇮🇳

> High-performance, zero-dependency Indian Independence Day celebration overlay.

## 📦 Installation
\`\`\`bash
npm install @event-overlay/independence-day
\`\`\`

## 🚀 Usage

### React / Next.js
\`\`\`jsx
import { IndependenceDayOverlay } from '@event-overlay/independence-day/react';

export default function App() {
  return (
    <main>
      <IndependenceDayOverlay waveOpacity={0.65} maxFlags={3} maxKites={6} />
      <h1>Happy Independence Day! 🇮🇳</h1>
    </main>
  );
}
\`\`\`

### Vanilla JavaScript
\`\`\`javascript
import { start, stop } from '@event-overlay/independence-day';

start({
  waveOpacity: 0.65,
  maxFlags: 3,
  maxKites: 6
});
\`\`\`

## 📄 License
MIT © Vikas
`, 'utf-8');

// B. @event-overlay/holi
const pkgHoliDir = path.join(PACKAGES_DIR, 'holi');
fs.mkdirSync(pkgHoliDir, { recursive: true });
fs.mkdirSync(path.join(pkgHoliDir, 'dist'), { recursive: true });

fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'index.js'), esmHoli, 'utf-8');
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'index.min.js'), minify(esmHoli), 'utf-8');
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'index.umd.js'), umdHoli, 'utf-8');
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'index.cjs'), umdHoli, 'utf-8');
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'index.d.ts'), `import type { FC } from 'react';

export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface HoliOptions {
    maxBalloons?: number;
    maxPichkaaris?: number;
    colors?: ColorRGB[];
    showAmbient?: boolean;
}

export interface HoliOverlayProps extends HoliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: HoliOptions): any;
export declare function stop(): void;
export declare function toggle(options?: HoliOptions): void;
export declare function isRunning(): boolean;

export declare const HoliOverlay: FC<HoliOverlayProps>;
export default HoliOverlay;
`, 'utf-8');

if (tsxHoli) {
    fs.writeFileSync(path.join(pkgHoliDir, 'HoliOverlay.tsx'), tsxHoli, 'utf-8');
}
fs.writeFileSync(path.join(pkgHoliDir, 'LICENSE'), licenseText, 'utf-8');

const pkgHoliJson = {
    name: "@event-overlay/holi",
    version: CURRENT_VERSION,
    description: "🎨 Vibrant, high-performance Holi festival celebration overlay. Zero dependencies.",
    main: "dist/index.cjs",
    module: "dist/index.js",
    types: "dist/index.d.ts",
    browser: "dist/index.umd.js",
    exports: {
        ".": {
            import: "./dist/index.js",
            require: "./dist/index.cjs",
            types: "./dist/index.d.ts",
            default: "./dist/index.js"
        },
        "./react": {
            import: "./HoliOverlay.tsx",
            types: "./dist/index.d.ts"
        },
        "./umd": "./dist/index.umd.js"
    },
    sideEffects: false,
    publishConfig: {
        access: "public"
    },
    keywords: ["holi", "colors", "water-balloon", "pichkaari", "gulal", "overlay", "react", "canvas"],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/holi"
    }
};
fs.writeFileSync(path.join(pkgHoliDir, 'package.json'), JSON.stringify(pkgHoliJson, null, 2), 'utf-8');

fs.writeFileSync(path.join(pkgHoliDir, 'README.md'), `# @event-overlay/holi 🎨

> High-performance, zero-dependency Holi festival celebration overlay.

## 📦 Installation
\`\`\`bash
npm install @event-overlay/holi
\`\`\`

## 🚀 Usage

### React / Next.js
\`\`\`jsx
import { HoliOverlay } from '@event-overlay/holi/react';

export default function App() {
  return (
    <main>
      <HoliOverlay maxBalloons={15} maxPichkaaris={4} opacity={0.95} />
      <h1>Happy Holi! 🎨</h1>
    </main>
  );
}
\`\`\`

### Vanilla JavaScript
\`\`\`javascript
import { start, stop } from '@event-overlay/holi';

start({
  maxBalloons: 15,
  maxPichkaaris: 4
});
\`\`\`

## 📄 License
MIT © Vikas
`, 'utf-8');

// C. @event-overlay/core
const pkgCoreDir = path.join(PACKAGES_DIR, 'core');
fs.mkdirSync(pkgCoreDir, { recursive: true });
fs.mkdirSync(path.join(pkgCoreDir, 'dist'), { recursive: true });

// Copy dist into packages/core/dist
fs.cpSync(DIST_DIR, path.join(pkgCoreDir, 'dist'), { recursive: true });
fs.writeFileSync(path.join(pkgCoreDir, 'LICENSE'), licenseText, 'utf-8');

const pkgCoreJson = {
    name: "@event-overlay/core",
    version: CURRENT_VERSION,
    description: "🎆 High-performance celebration overlay engine with tree-shakeable event subpaths. Zero dependencies.",
    main: "dist/event-overlay.cjs",
    module: "dist/event-overlay.js",
    types: "dist/event-overlay.d.ts",
    browser: "dist/event-overlay.umd.js",
    exports: {
        ".": {
            import: "./dist/event-overlay.js",
            require: "./dist/event-overlay.cjs",
            types: "./dist/event-overlay.d.ts",
            default: "./dist/event-overlay.js"
        },
        "./independence-day": {
            import: "./dist/events/independence-day.js",
            types: "./dist/events/independence-day.d.ts"
        },
        "./holi": {
            import: "./dist/events/holi.js",
            types: "./dist/events/holi.d.ts"
        },
        "./umd": "./dist/event-overlay.umd.js",
        "./umd/independence-day": "./dist/events/independence-day.umd.js",
        "./umd/holi": "./dist/events/holi.umd.js"
    },
    sideEffects: false,
    publishConfig: {
        access: "public"
    },
    keywords: ["event-overlay", "independence-day", "holi", "celebration", "canvas", "react", "monorepo"],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/core"
    }
};
fs.writeFileSync(path.join(pkgCoreDir, 'package.json'), JSON.stringify(pkgCoreJson, null, 2), 'utf-8');

fs.writeFileSync(path.join(pkgCoreDir, 'README.md'), `# @event-overlay/core 🎆

> Unified multi-event celebration overlay framework.

## 📦 Installation
\`\`\`bash
npm install @event-overlay/core
\`\`\`

## 🚀 Subpaths
- \`@event-overlay/core/independence-day\`
- \`@event-overlay/core/holi\`

## 📄 License
MIT © Vikas
`, 'utf-8');

console.log('✅ Monorepo Build Complete!');
console.log('   📦 @event-overlay/independence-day  -> packages/independence-day');
console.log('   📦 @event-overlay/holi              -> packages/holi');
console.log('   📦 @event-overlay/core              -> packages/core');
console.log('   📁 Legacy Unified dist/             -> dist/');
