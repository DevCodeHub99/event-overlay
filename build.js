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
const diwaliSource = fs.readFileSync(path.join(SRC_DIR, 'events', 'diwali.js'), 'utf-8');

const tsxIndep = fs.existsSync(path.join(__dirname, 'IndependenceDayOverlay.tsx'))
    ? fs.readFileSync(path.join(__dirname, 'IndependenceDayOverlay.tsx'), 'utf-8')
    : '';

const tsxHoli = fs.existsSync(path.join(__dirname, 'HoliOverlay.tsx'))
    ? fs.readFileSync(path.join(__dirname, 'HoliOverlay.tsx'), 'utf-8')
    : '';

const tsxDiwali = fs.existsSync(path.join(__dirname, 'DiwaliOverlay.tsx'))
    ? fs.readFileSync(path.join(__dirname, 'DiwaliOverlay.tsx'), 'utf-8')
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
const diwaliClean = stripInternalExports(diwaliSource);

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

// ─── DIWALI EVENT ───
${diwaliClean}

// Auto-register built-in events
registerEvent(IndependenceDayEvent);
registerEvent(HoliEvent);
registerEvent(DiwaliEvent);

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
export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

export function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
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
    DiwaliEvent,
    filterInPlace,
    randomRange,
    getSafeDPR,
    prefersReducedMotion
};

const EventOverlay = {
    version: '',
    start,
    stop,
    pause,
    resume,
    togglePause,
    isPaused,
    dismiss,
    toggle,
    isRunning,
    create,
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds,
    IndependenceDayEvent,
    HoliEvent,
    DiwaliEvent,
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
export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

export function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
    }
}

export function undismiss() {
    if (_activeInstance) {
        _activeInstance.undismiss();
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
    version: '',
    start,
    stop,
    pause,
    resume,
    togglePause,
    isPaused,
    dismiss,
    undismiss,
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
export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

export function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
    }
}

export function undismiss() {
    if (_activeInstance) {
        _activeInstance.undismiss();
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
    version: '',
    start,
    stop,
    pause,
    resume,
    togglePause,
    isPaused,
    dismiss,
    undismiss,
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

// ─────────────────────────────────────────────
// 3b. Build Dedicated Package: @event-overlay/diwali
// ─────────────────────────────────────────────
const esmDiwali = `/**
 * 🪔 @event-overlay/diwali v1.0.0
 * @license MIT
 */

// ─── UTILS ───
${utilsClean}

// ─── CORE ENGINE ───
${engineClean}

// ─── DIWALI EVENT ───
${diwaliClean}

registerEvent(DiwaliEvent);

let _activeInstance = null;

export function start(options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    const opts = Object.assign({}, options, { event: 'diwali', eventOptions: options });
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
export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

export function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
    }
}

export function undismiss() {
    if (_activeInstance) {
        _activeInstance.undismiss();
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
    DiwaliEvent,
    DIWALI_COLORS,
    EventOverlayEngine
};

const DiwaliOverlay = {
    version: '',
    start,
    stop,
    pause,
    resume,
    togglePause,
    isPaused,
    dismiss,
    undismiss,
    toggle,
    isRunning,
    DiwaliEvent,
    DIWALI_COLORS,
    EventOverlayEngine
};

export default DiwaliOverlay;
`;

fs.writeFileSync(path.join(DIST_DIR, 'events', 'diwali.js'), esmDiwali, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'events', 'diwali.min.js'), minify(esmDiwali), 'utf-8');

const umdDiwaliCore = esmDiwali
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim();

const umdDiwali = `/**
 * 🪔 @event-overlay/diwali v1.0.0 — Standalone UMD
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DiwaliOverlay = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

${umdDiwaliCore}

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
                DiwaliOverlay.start(opts);
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _init);
            } else {
                _init();
            }
        }
    }

    return DiwaliOverlay;
}));
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'diwali.umd.js'), umdDiwali, 'utf-8');

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

const diwaliDts = `import type { FC } from 'react';
import { DiwaliOptions, DiwaliOverlayProps } from '../event-overlay';
export * from '../event-overlay';
export declare const DiwaliOverlay: FC<DiwaliOverlayProps>;
export default DiwaliOverlay;
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'diwali.d.ts'), diwaliDts, 'utf-8');

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
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
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
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
`, 'utf-8');

if (tsxIndep) {
    const pkgTsxIndep = tsxIndep
        .replace(/from '\.\/src\/core\/engine\.js'/g, "from '../../src/core/engine.js'")
        .replace(/from '\.\/src\/events\/independence-day\.js'/g, "from '../../src/events/independence-day.js'");
    fs.writeFileSync(path.join(pkgIndepDir, 'IndependenceDayOverlay.tsx'), pkgTsxIndep, 'utf-8');
}
fs.writeFileSync(path.join(pkgIndepDir, 'LICENSE'), licenseText, 'utf-8');
const reactIndepJs = `import { useEffect, useRef } from 'react';
import { EventOverlayEngine } from './index.js';

export function IndependenceDayOverlay({
    maxFlags = 3,
    maxKites = 6,
    maxJets = 2,
    maxFireworks = 3,
    maxPetals = 35,
    showGlow = true,
    showWave = true,
    waveOpacity = 0.65,
    zIndex = 99999,
    opacity = 0.95,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    onToggle,
    onDismiss,
    active = true
} = {}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = new EventOverlayEngine({
            event: 'independence-day',
            zIndex,
            opacity,
            duration,
            container,
            showControls,
            controlPosition,
            persistPreference,
            onToggle,
            onDismiss,
            eventOptions: {
                maxFlags,
                maxKites,
                maxJets,
                maxFireworks,
                maxPetals,
                showGlow,
                showWave,
                waveOpacity
            }
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [
        active,
        zIndex,
        opacity,
        maxFlags,
        maxKites,
        maxJets,
        maxFireworks,
        maxPetals,
        showGlow,
        showWave,
        waveOpacity,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference
    ]);

    return null;
}

export default IndependenceDayOverlay;
`;
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'react.js'), reactIndepJs, 'utf-8');
fs.writeFileSync(path.join(pkgIndepDir, 'dist', 'react.d.ts'), `import type { FC } from 'react';
import type { IndependenceDayOverlayProps } from './index';
export * from './index';
export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
`, 'utf-8');


const pkgIndepJson = {
    name: "@event-overlay/independence-day",
    version: CURRENT_VERSION,
    type: "module",
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
            import: "./dist/react.js",
            types: "./dist/react.d.ts",
            default: "./dist/react.js"
        },
        "./umd": "./dist/index.umd.js"
    },
    sideEffects: false,
        peerDependencies: {
        react: ">=16.8.0"
    },
    peerDependenciesMeta: {
        react: {
            optional: true
        }
    },
    publishConfig: {
        access: "public"
    },
    keywords: [
        "independence-day",
        "indian-independence-day",
        "15-august",
        "republic-day",
        "26-january",
        "tiranga",
        "indian-flag",
        "tricolor",
        "kites",
        "patriotism",
        "airshow",
        "fighter-jets",
        "fireworks",
        "azadi-ka-amrit-mahotsav",
        "react-independence-day",
        "celebration-overlay",
        "canvas-animation",
        "react-festive",
        "nextjs-overlay",
        "web-animation",
        "canvas-overlay",
        "overlay",
        "react",
        "canvas",
        "zero-dependency"
    ],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "git+https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/independence-day"
    }
};
fs.writeFileSync(path.join(pkgIndepDir, 'package.json'), JSON.stringify(pkgIndepJson, null, 2), 'utf-8');

const indepReadmeContent = `<p align="center">
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

Celebrate **Indian Independence Day (15th August)** and **Republic Day (26th January)** in style! \`@event-overlay/independence-day\` is a turnkey, zero-dependency celebration canvas overlay for modern web applications.

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
- 🛡️ **Non-Intrusive & Accessible**: Configured with \`pointer-events: none\` and \`aria-hidden="true"\` so your website remains 100% interactive.
- 🧩 **Universal Framework Support**: Ready for **React**, **Next.js (App & Pages Router)**, **Vue**, **Svelte**, **Angular**, **Vite**, and **HTML CDN script tags**.

---

## 📦 Installation

\`\`\`bash
# npm
npm install @event-overlay/independence-day

# yarn
yarn add @event-overlay/independence-day

# pnpm
pnpm add @event-overlay/independence-day

# bun
bun add @event-overlay/independence-day
\`\`\`

---

## 🚀 Quick Start Guide

### 1. React & Next.js (App Router / Pages Router)

Import \`IndependenceDayOverlay\` and place it in your root layout or page:

\`\`\`tsx
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
\`\`\`

> **Next.js App Router Note**: \`IndependenceDayOverlay\` contains \`'use client'\` internally, ensuring seamless compatibility with Next.js 13/14/15 Server & Client components.

---

### 2. Vanilla JavaScript / TypeScript (Vite, Webpack, ES Modules)

\`\`\`javascript
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
\`\`\`

---

### 3. HTML CDN Drop-in Script Tag (No Build Tools Required)

Add directly before your closing \`</body>\` tag. Add \`data-autostart\` to launch immediately:

\`\`\`html
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
    src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day@${CURRENT_VERSION}/dist/index.umd.js" 
    data-autostart>
  </script>
</body>
</html>
\`\`\`

Or trigger manually via global \`window.IndependenceDayOverlay\`:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/independence-day@${CURRENT_VERSION}/dist/index.umd.js"></script>
<script>
  window.IndependenceDayOverlay.start({
    maxKites: 8,
    maxJets: 3
  });
</script>
\`\`\`

---

### 4. Vue 3 / Nuxt

\`\`\`vue
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
\`\`\`

---

## ⚙️ Configuration & Props Reference

| Prop / Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`showWave\` | \`boolean\` | \`true\` | Enables or disables the flowing Tricolor Silk Banner Wave. |
| \`waveOpacity\` | \`number\` | \`0.65\` | Transparency level of the flowing silk wave (\`0.0\` to \`1.0\`). |
| \`maxFlags\` | \`number\` | \`3\` | Maximum simultaneous waving Indian National Flags (*Tiranga*). |
| \`maxKites\` | \`number\` | \`6\` | Maximum simultaneous flying kites with swaying ribbons. |
| \`maxJets\` | \`number\` | \`2\` | Number of fighter jets crossing with saffron-white-green vapor trails. |
| \`maxFireworks\` | \`number\` | \`3\` | Maximum bursting fireworks and sparkler clusters. |
| \`maxPetals\` | \`number\` | \`35\` | Drifting marigold (*Genda*) and rose petals floating with wind. |
| \`showGlow\` | \`boolean\` | \`true\` | Ambient Saffron top glow and Green bottom glow. |
| \`opacity\` | \`number\` | \`0.95\` | Overall canvas master opacity (\`0.0\` to \`1.0\`). |
| \`zIndex\` | \`number\` | \`99999\` | CSS z-index applied to the canvas overlay. |
| \`duration\` | \`number\` | \`0\` | Auto-stop timer in milliseconds (\`0\` = continuous). |
| \`active\` | \`boolean\` | \`true\` | *(React only)* Toggle animation on/off dynamically. |
| \`container\` | \`string\` | \`'body'\` | DOM element selector to append the canvas to. |

---

## 🛠️ TypeScript Support

\`\`\`typescript
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
\`\`\`

---

## 🔍 Keywords & Discovery

\`independence-day\` • \`indian-independence-day\` • \`15-august\` • \`republic-day\` • \`26-january\` • \`tiranga\` • \`indian-flag\` • \`tricolor\` • \`kites\` • \`patriotism\` • \`airshow\` • \`fighter-jets\` • \`fireworks\` • \`azadi-ka-amrit-mahotsav\` • \`react-independence-day\` • \`celebration-overlay\` • \`canvas-animation\` • \`react-festive\` • \`nextjs-overlay\` • \`web-animation\` • \`canvas-overlay\` • \`zero-dependency\`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
`;

fs.writeFileSync(path.join(pkgIndepDir, 'README.md'), indepReadmeContent, 'utf-8');

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
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: HoliOptions): void;
export declare function isRunning(): boolean;

export declare const HoliOverlay: FC<HoliOverlayProps>;
export default HoliOverlay;
`, 'utf-8');

if (tsxHoli) {
    const pkgTsxHoli = tsxHoli
        .replace(/from '\.\/src\/core\/engine\.js'/g, "from '../../src/core/engine.js'")
        .replace(/from '\.\/src\/events\/holi\.js'/g, "from '../../src/events/holi.js'");
    fs.writeFileSync(path.join(pkgHoliDir, 'HoliOverlay.tsx'), pkgTsxHoli, 'utf-8');
}
fs.writeFileSync(path.join(pkgHoliDir, 'LICENSE'), licenseText, 'utf-8');
const reactHoliJs = `import { useEffect, useRef } from 'react';
import { EventOverlayEngine } from './index.js';

export function HoliOverlay({
    zIndex = 99999,
    opacity = 0.95,
    maxBalloons = 15,
    maxPichkaaris = 4,
    colors,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    onToggle,
    onDismiss,
    active = true
} = {}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = new EventOverlayEngine({
            event: 'holi',
            zIndex,
            opacity,
            duration,
            container,
            showControls,
            controlPosition,
            persistPreference,
            onToggle,
            onDismiss,
            eventOptions: {
                maxBalloons,
                maxPichkaaris,
                colors
            }
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [
        active,
        zIndex,
        opacity,
        maxBalloons,
        maxPichkaaris,
        colors,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference
    ]);

    return null;
}

export default HoliOverlay;
`;
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'react.js'), reactHoliJs, 'utf-8');
fs.writeFileSync(path.join(pkgHoliDir, 'dist', 'react.d.ts'), `import type { FC } from 'react';
import type { HoliOverlayProps } from './index';
export * from './index';
export declare const HoliOverlay: FC<HoliOverlayProps>;
export default HoliOverlay;
`, 'utf-8');


const pkgHoliJson = {
    name: "@event-overlay/holi",
    version: CURRENT_VERSION,
    type: "module",
    description: "🎨 Vibrant, ultra-high-performance Holi festival celebration overlay with water balloons, pichkaari streams, and gulal colors. Zero dependencies.",
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
            import: "./dist/react.js",
            types: "./dist/react.d.ts",
            default: "./dist/react.js"
        },
        "./umd": "./dist/index.umd.js"
    },
    sideEffects: false,
        peerDependencies: {
        react: ">=16.8.0"
    },
    peerDependenciesMeta: {
        react: {
            optional: true
        }
    },
    publishConfig: {
        access: "public"
    },
    keywords: [
        "holi",
        "holi-overlay",
        "holi-festival",
        "festival-of-colours",
        "rangotsav",
        "gulal",
        "pichkaari",
        "water-balloon",
        "colors-festival",
        "celebration-overlay",
        "festive-overlay",
        "canvas-confetti",
        "particle-effects",
        "particle-system",
        "react-holi",
        "react-celebration",
        "react-festive",
        "nextjs-overlay",
        "indian-festivals",
        "happy-holi",
        "web-animation",
        "canvas-overlay",
        "zero-dependency",
        "colors",
        "react",
        "canvas"
    ],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "git+https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/holi"
    }
};
fs.writeFileSync(path.join(pkgHoliDir, 'package.json'), JSON.stringify(pkgHoliJson, null, 2), 'utf-8');

const holiReadmeContent = `<p align="center">
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

Bring the exuberant spirit and colors of **Holi (Festival of Colours / Rangotsav)** to your digital products! \`@event-overlay/holi\` is a plug-and-play celebration overlay that creates stunning, realistic festive animations directly over your web page using a hardware-accelerated HTML5 Canvas 2D engine.

Designed for modern web applications, it delivers buttery-smooth 60 FPS animations without impacting your site's performance, layout, or user interactions.

---

## ✨ Features

- 🎈 **Physics-Based Water Balloons**: Balloons launch dynamically from screen edges and burst upon impact into thousands of water droplets and organic color stains.
- 🔫 **Pichkaari (Water Gun) Streams**: Continuous high-velocity streams that arc and sweep gracefully across the screen.
- 💥 **Gulal (Powder) Explosions**: Soft, billowing organic color clouds that expand and gently dissolve into the atmosphere.
- 🌸 **Curated 9-Color Festive Palette**: Features vibrant traditional Holi pigments (Gulal Pink, Marigold Yellow, Parrot Green, Indigo Blue, Saffron Orange, Royal Violet, Cyan, Deep Pink, and Lime) or pass your own custom brand/festive colors.
- 🎨 **Ambient Watercolor Stains**: Soft pulsating corner glows simulating festive color stains on the edges of the screen.
- ⚡ **Zero Dependencies & Lightweight**: <8KB gzipped with zero external library overhead.
- 🛡️ **Non-Intrusive & Accessible**: Layered with \`pointer-events: none\` and \`aria-hidden="true"\`, ensuring your links, buttons, forms, and screen readers continue to function flawlessly.
- 🧩 **Universal Compatibility**: Works out of the box with **React**, **Next.js (App & Pages Router)**, **Vue**, **Svelte**, **Angular**, **Vite**, and plain **HTML CDN script tags**.

---

## 📦 Installation

Install via your preferred package manager:

\`\`\`bash
# npm
npm install @event-overlay/holi

# yarn
yarn add @event-overlay/holi

# pnpm
pnpm add @event-overlay/holi

# bun
bun add @event-overlay/holi
\`\`\`

---

## 🚀 Quick Start Guide

### 1. React & Next.js (App Router / Pages Router)

Simply import the \`HoliOverlay\` component and drop it anywhere in your component tree (e.g., \`layout.tsx\` or \`App.tsx\`):

\`\`\`tsx
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
\`\`\`

> **Next.js App Router Note**: The \`HoliOverlay\` component is marked with \`'use client'\` under the hood, making it seamlessly compatible with Next.js 13/14/15 Server and Client Components.

---

### 2. Vanilla JavaScript / TypeScript (Vite, Webpack, ES Modules)

\`\`\`javascript
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
\`\`\`

---

### 3. HTML CDN Drop-in Script Tag (No Build Tools Required)

Include the standalone bundle via jsDelivr or unpkg before the closing \`</body>\` tag. Add \`data-autostart\` to start automatically:

\`\`\`html
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
    src="https://cdn.jsdelivr.net/npm/@event-overlay/holi@${CURRENT_VERSION}/dist/index.umd.js" 
    data-autostart>
  </script>
</body>
</html>
\`\`\`

Or trigger manually via the global \`window.HoliOverlay\` object:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/@event-overlay/holi@${CURRENT_VERSION}/dist/index.umd.js"></script>
<script>
  window.HoliOverlay.start({
    maxBalloons: 12,
    maxPichkaaris: 3
  });
</script>
\`\`\`

---

### 4. Vue 3 / Nuxt

\`\`\`vue
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
\`\`\`

---

## ⚙️ Configuration & Props Reference

Customize every aspect of the celebration to fit your design:

| Prop / Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`maxBalloons\` | \`number\` | \`15\` | Maximum number of concurrent water balloons launched from viewport boundaries. |
| \`maxPichkaaris\` | \`number\` | \`4\` | Maximum number of simultaneous pichkaari (water gun) streams sweeping across the screen. |
| \`colors\` | \`ColorRGB[]\` | *9-color preset* | Custom RGB color palette array for balloons, splash stains, water streams, and powder particles. |
| \`showAmbient\` | \`boolean\` | \`true\` | Enables pulsating corner watercolor splash gradients. |
| \`opacity\` | \`number\` | \`0.95\` | Master canvas opacity (\`0.0\` to \`1.0\`). |
| \`zIndex\` | \`number\` | \`99999\` | CSS z-index applied to the fixed canvas overlay. |
| \`duration\` | \`number\` | \`0\` | Auto-stop countdown in milliseconds (\`0\` = runs continuously until stopped). |
| \`active\` | \`boolean\` | \`true\` | *(React only)* Controls whether the overlay is actively rendering. |
| \`container\` | \`string\` | \`'body'\` | Target selector or DOM container where canvas should be mounted. |

---

## 🎨 Custom Color Palette Example

You can override the default festive palette with your own custom RGB colors:

\`\`\`tsx
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
\`\`\`

---

## 🛠️ TypeScript Support

Full TypeScript definitions are included out of the box:

\`\`\`typescript
import type { HoliOverlayProps, HoliOptions, ColorRGB } from '@event-overlay/holi';

const config: HoliOptions = {
  maxBalloons: 20,
  maxPichkaaris: 5,
  colors: [
    { r: 255, g: 87, b: 51 },
    { r: 255, g: 189, b: 51 }
  ]
};
\`\`\`

---

## 🎯 High-Performance Engine Design

1. **Sub-Pixel Particle Simulation**: Powered by an internal physics loop with velocity damping, randomized mass, realistic trajectory drag, and gravity curves.
2. **Zero Allocation Rendering**: Reuses coordinate buffers and optimized canvas paths to prevent memory churn and garbage collection hiccups.
3. **Adaptive Viewport Resizing**: Automatically listens to window resize and device pixel ratio (DPR) changes for crystal-clear visuals on high-density Retina screens.
4. **Clean Teardown**: Automatically cancels \`requestAnimationFrame\` loops and removes canvas elements on unmount.

---

## 🔍 Keywords & Discovery

\`holi\` • \`holi-overlay\` • \`holi-festival\` • \`festival-of-colors\` • \`rangotsav\` • \`gulal\` • \`pichkaari\` • \`water-balloon\` • \`colors-festival\` • \`celebration-overlay\` • \`festive-overlay\` • \`canvas-confetti\` • \`particle-effects\` • \`react-holi\` • \`react-celebration\` • \`react-festive\` • \`nextjs-overlay\` • \`indian-festivals\` • \`happy-holi\` • \`web-animation\` • \`canvas-overlay\` • \`zero-dependency\`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
`;

fs.writeFileSync(path.join(pkgHoliDir, 'README.md'), holiReadmeContent, 'utf-8');

// B2. @event-overlay/diwali
const pkgDiwaliDir = path.join(PACKAGES_DIR, 'diwali');
fs.mkdirSync(pkgDiwaliDir, { recursive: true });
fs.mkdirSync(path.join(pkgDiwaliDir, 'dist'), { recursive: true });

fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'index.js'), esmDiwali, 'utf-8');
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'index.min.js'), minify(esmDiwali), 'utf-8');
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'index.umd.js'), umdDiwali, 'utf-8');
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'index.cjs'), umdDiwali, 'utf-8');
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'index.d.ts'), `import type { FC } from 'react';

export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface DiwaliOptions {
    enableFireworks?: boolean;
    enableDiyas?: boolean;
    enableFountains?: boolean;
    enableSpinners?: boolean;
    enableLanterns?: boolean;
    sparklerCursor?: boolean;
    colors?: ColorRGB[];
}

export interface DiwaliOverlayProps extends DiwaliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: DiwaliOptions): any;
export declare function stop(): void;
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: DiwaliOptions): void;
export declare function isRunning(): boolean;

export declare const DiwaliOverlay: FC<DiwaliOverlayProps>;
export default DiwaliOverlay;
`, 'utf-8');

if (tsxDiwali) {
    const pkgTsxDiwali = tsxDiwali
        .replace(/from '\.\/src\/core\/engine\.js'/g, "from '../../src/core/engine.js'")
        .replace(/from '\.\/src\/events\/diwali\.js'/g, "from '../../src/events/diwali.js'");
    fs.writeFileSync(path.join(pkgDiwaliDir, 'DiwaliOverlay.tsx'), pkgTsxDiwali, 'utf-8');
}
fs.writeFileSync(path.join(pkgDiwaliDir, 'LICENSE'), licenseText, 'utf-8');
const reactDiwaliJs = `import { useEffect, useRef } from 'react';
import { EventOverlayEngine } from './index.js';

export function DiwaliOverlay({
    zIndex = 99999,
    opacity = 0.95,
    enableFireworks = true,
    enableDiyas = true,
    enableFountains = true,
    enableSpinners = true,
    enableLanterns = true,
    sparklerCursor = true,
    colors,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    onToggle,
    onDismiss,
    active = true
} = {}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = new EventOverlayEngine({
            event: 'diwali',
            zIndex,
            opacity,
            duration,
            container,
            showControls,
            controlPosition,
            persistPreference,
            onToggle,
            onDismiss,
            eventOptions: {
                enableFireworks,
                enableDiyas,
                enableFountains,
                enableSpinners,
                enableLanterns,
                sparklerCursor,
                colors
            }
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [
        active,
        zIndex,
        opacity,
        enableFireworks,
        enableDiyas,
        enableFountains,
        enableSpinners,
        enableLanterns,
        sparklerCursor,
        colors,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference
    ]);

    return null;
}

export default DiwaliOverlay;
`;
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'react.js'), reactDiwaliJs, 'utf-8');
fs.writeFileSync(path.join(pkgDiwaliDir, 'dist', 'react.d.ts'), `import type { FC } from 'react';
import type { DiwaliOverlayProps } from './index';
export * from './index';
export declare const DiwaliOverlay: FC<DiwaliOverlayProps>;
export default DiwaliOverlay;
`, 'utf-8');


const pkgDiwaliJson = {
    name: "@event-overlay/diwali",
    version: CURRENT_VERSION,
    type: "module",
    description: "🪔 Dazzling, ultra-high-performance Diwali celebration overlay for React, Next.js, Vue, and Vanilla JS. Grand fireworks, diyas, flowerpot fountains, and sparklers. Zero dependencies.",
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
            import: "./dist/react.js",
            types: "./dist/react.d.ts",
            default: "./dist/react.js"
        },
        "./umd": "./dist/index.umd.js"
    },
    sideEffects: false,
        peerDependencies: {
        react: ">=16.8.0"
    },
    peerDependenciesMeta: {
        react: {
            optional: true
        }
    },
    publishConfig: {
        access: "public"
    },
    keywords: [
        "diwali",
        "diwali-overlay",
        "deepavali",
        "festival-of-lights",
        "diyas",
        "fireworks",
        "crackers",
        "anar",
        "chakri",
        "phuljhadi",
        "sparklers",
        "sky-lanterns",
        "celebration-overlay",
        "festive-overlay",
        "canvas-confetti",
        "particle-effects",
        "react-diwali",
        "react-celebration",
        "react-festive",
        "nextjs-overlay",
        "indian-festivals",
        "happy-diwali",
        "web-animation",
        "canvas-overlay",
        "zero-dependency"
    ],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "git+https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/diwali"
    }
};
fs.writeFileSync(path.join(pkgDiwaliDir, 'package.json'), JSON.stringify(pkgDiwaliJson, null, 2), 'utf-8');

const diwaliReadmeContent = `<p align="center">
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

Celebrate **Diwali (Deepavali — The Festival of Lights)** on your website or web app! \`@event-overlay/diwali\` brings the radiant energy and visual majesty of Diwali to any digital screen at buttery-smooth 60 FPS.

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
- 🛡️ **Non-Intrusive**: Layered with \`pointer-events: none\` and \`aria-hidden="true"\` so your app remains 100% interactive.

---

## 📦 Installation

\`\`\`bash
# npm
npm install @event-overlay/diwali

# yarn
yarn add @event-overlay/diwali

# pnpm
pnpm add @event-overlay/diwali
\`\`\`

---

## 🚀 Quick Start Guide

### React & Next.js

\`\`\`tsx
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
\`\`\`

### Vanilla JavaScript

\`\`\`javascript
import { start, stop } from '@event-overlay/diwali';

const overlay = start({
  enableFireworks: true,
  enableDiyas: true,
  sparklerCursor: true
});
\`\`\`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
`;

fs.writeFileSync(path.join(pkgDiwaliDir, 'README.md'), diwaliReadmeContent, 'utf-8');

// C. @event-overlay/core (Pure Headless Engine, 0 festival bloat)
const pkgCoreDir = path.join(PACKAGES_DIR, 'core');
fs.mkdirSync(pkgCoreDir, { recursive: true });
fs.mkdirSync(path.join(pkgCoreDir, 'dist'), { recursive: true });
fs.writeFileSync(path.join(pkgCoreDir, 'LICENSE'), licenseText, 'utf-8');

const esmCore = `/**
 * 🎆 @event-overlay/core v${CURRENT_VERSION} — Headless Event Overlay Engine
 * @license MIT
 */

${utilsClean}

${engineClean}

let _activeInstance = null;

export function create(options = {}) {
    return new EventOverlayEngine(options);
}

export function start(eventName, options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    let opts = options;
    if (typeof eventName === 'object') {
        opts = eventName;
        eventName = opts.event;
    } else if (typeof eventName === 'string') {
        opts = Object.assign({}, options, { event: eventName });
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

export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

export function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
    }
}

export function undismiss() {
    if (_activeInstance) {
        _activeInstance.undismiss();
    }
}

export function toggle(eventName, options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(eventName, options);
    }
}

export function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}

export {
    EventOverlayEngine,
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds,
    filterInPlace,
    randomRange,
    getSafeDPR,
    prefersReducedMotion
};

const EventOverlay = {
    version: '${CURRENT_VERSION}',
    create,
    start,
    stop,
    pause,
    resume,
    togglePause,
    isPaused,
    dismiss,
    undismiss,
    toggle,
    isRunning,
    EventOverlayEngine,
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds
};

export default EventOverlay;
`;

const cjsCore = `/**
 * 🎆 @event-overlay/core v${CURRENT_VERSION} — CommonJS
 * @license MIT
 */
${esmCore
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim()}

module.exports = EventOverlay;
module.exports.default = EventOverlay;
module.exports.EventOverlay = EventOverlay;
module.exports.EventOverlayEngine = EventOverlayEngine;
module.exports.registerEvent = registerEvent;
module.exports.getRegisteredEvent = getRegisteredEvent;
module.exports.getRegisteredEventIds = getRegisteredEventIds;
module.exports.create = create;
module.exports.start = start;
module.exports.stop = stop;
module.exports.pause = pause;
module.exports.resume = resume;
module.exports.togglePause = togglePause;
module.exports.isPaused = isPaused;
module.exports.dismiss = dismiss;
module.exports.undismiss = undismiss;
module.exports.toggle = toggle;
module.exports.isRunning = isRunning;
`;

const umdCore = `/**
 * 🎆 @event-overlay/core v${CURRENT_VERSION} — UMD
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.EventOverlayCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';
${esmCore
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim()}
    return EventOverlay;
}));
`;

fs.writeFileSync(path.join(pkgCoreDir, 'dist', 'index.js'), esmCore, 'utf-8');
fs.writeFileSync(path.join(pkgCoreDir, 'dist', 'index.min.js'), minify(esmCore), 'utf-8');
fs.writeFileSync(path.join(pkgCoreDir, 'dist', 'index.cjs'), cjsCore, 'utf-8');
fs.writeFileSync(path.join(pkgCoreDir, 'dist', 'index.umd.js'), umdCore, 'utf-8');
fs.writeFileSync(path.join(pkgCoreDir, 'dist', 'index.d.ts'), fs.readFileSync(path.join(SRC_DIR, 'core', 'types.d.ts'), 'utf-8'), 'utf-8');

const pkgCoreJson = {
    name: "@event-overlay/core",
    version: CURRENT_VERSION,
    type: "module",
    description: "🎆 Headless, high-performance celebration overlay engine with 60 FPS Canvas loop, WCAG 2.2.2 controls, and Page Visibility pausing. Zero dependencies.",
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
        }
    },
    sideEffects: false,
    publishConfig: {
        access: "public"
    },
    keywords: [
        "event-overlay",
        "celebration-overlay",
        "festive-overlay",
        "canvas-animation",
        "particle-effects",
        "headless",
        "zero-dependency",
        "canvas-overlay",
        "canvas"
    ],
    author: "Vikas",
    license: "MIT",
    repository: {
        type: "git",
        url: "git+https://github.com/DevCodeHub99/event-overlay.git",
        directory: "packages/core"
    }
};
fs.writeFileSync(path.join(pkgCoreDir, 'package.json'), JSON.stringify(pkgCoreJson, null, 2), 'utf-8');

const coreReadmeContent = `<p align="center">
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

\`@event-overlay/core\` is the pure, headless foundation powering the event-overlay suite. It contains **zero festival-specific graphics** (~3 KB gzipped) and handles all the complex infrastructure:

- **60 FPS Physics Loop**: High-DPI retina canvas scaling with sub-pixel rendering.
- **WCAG 2.2.2 User Choice**: Floating glassmorphic controls (\`[ ⏸ Pause | ✕ ]\`), launcher badge restore, and <kbd>Esc</kbd> shortcut.
- **Tab Visibility Pausing**: Automatically suspends loops when the user switches tabs (0% CPU/battery).
- **Custom Event Registry**: Define and launch any custom visual celebration.

---

## 📦 Installation

\`\`\`bash
npm install @event-overlay/core
\`\`\`

---

## 🚀 Building a Custom Celebration Event

\`\`\`javascript
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
\`\`\`

---

## 📄 License

MIT © [Vikas](https://github.com/DevCodeHub99)
`;

fs.writeFileSync(path.join(pkgCoreDir, 'README.md'), coreReadmeContent, 'utf-8');

console.log('✅ Monorepo Build Complete!');
console.log('   📦 @event-overlay/independence-day  -> packages/independence-day');
console.log('   📦 @event-overlay/holi              -> packages/holi');
console.log('   📦 @event-overlay/diwali            -> packages/diwali');
console.log('   📦 @event-overlay/core              -> packages/core');
console.log('   📁 Legacy Unified dist/             -> dist/');
