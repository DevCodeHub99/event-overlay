/**
 * 📦 Multi-target Build script — generates standalone & bundled distribution files for Event Overlay (Optimized)
 * Zero external dependencies required.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

// Clean and recreate dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'events'), { recursive: true });

// Read source files
const utilsSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'utils.js'), 'utf-8');
const engineSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'engine.js'), 'utf-8')
    .replace(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?/g, ''); // Strip imports for bundled inlining
const holiSource = fs.readFileSync(path.join(SRC_DIR, 'events', 'holi.js'), 'utf-8')
    .replace(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?/g, '');
const independenceSource = fs.readFileSync(path.join(SRC_DIR, 'events', 'independence-day.js'), 'utf-8')
    .replace(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?/g, '');

function minify(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/^\s+/gm, '')
        .replace(/\n{2,}/g, '\n')
        .split('\n').filter(line => line.trim().length > 0).join('\n');
}

// ─────────────────────────────────────────────
// 1. Build Unified Bundle (All Events)
// ─────────────────────────────────────────────
const esmUnified = `/**
 * 🎆 Event Overlay v1.0.0 — Unified Bundle
 * @license MIT
 */

// ─── UTILS ───
${utilsSource.replace(/export\s+/g, '')}

// ─── CORE ENGINE ───
${engineSource.replace(/export\s+/g, '')}

// ─── HOLI EVENT ───
${holiSource.replace(/export\s+/g, '')}

// ─── INDEPENDENCE DAY EVENT ───
${independenceSource.replace(/export\s+/g, '')}

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

// UMD for Unified
const umdUnifiedCore = esmUnified
    .replace(/^export\s+default\s+\w+;\s*$/gm, '')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+let\s+/gm, 'let ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+class\s+/gm, 'class ')
    .replace(/^export\s+\{[\s\S]*?\};\s*$/gm, '')
    .trim();

const umdUnified = `/**
 * 🎆 Event Overlay v1.0.0 — Unified UMD Build
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
// 2. Build Standalone Independence Day Bundle
// ─────────────────────────────────────────────
const esmIndep = `/**
 * 🇮🇳 Independence Day Standalone Overlay v1.0.0
 * @license MIT
 */
${utilsSource.replace(/export\s+/g, '')}
${engineSource.replace(/export\s+/g, '')}
${independenceSource.replace(/export\s+/g, '')}

registerEvent(IndependenceDayEvent);

let _instance = null;

export function start(options = {}) {
    if (_instance) _instance.stop();
    _instance = new EventOverlayEngine({
        ...options,
        event: 'independence-day',
        eventOptions: options
    });
    _instance.start();
    return _instance;
}

export function stop() {
    if (_instance) {
        _instance.stop();
        _instance = null;
    }
}

export function toggle(options = {}) {
    if (_instance && _instance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

export function isRunning() {
    return _instance ? _instance.isRunning() : false;
}

export function create(options = {}) {
    return new EventOverlayEngine({
        ...options,
        event: 'independence-day',
        eventOptions: options
    });
}

export { IndependenceDayEvent };

const IndependenceDayOverlay = {
    start,
    stop,
    toggle,
    isRunning,
    create,
    IndependenceDayEvent
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
 * 🇮🇳 Independence Day Overlay — Standalone UMD
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
                if (_script.getAttribute('data-wave-opacity')) opts.waveOpacity = parseFloat(_script.getAttribute('data-wave-opacity'));
                if (_script.getAttribute('data-show-wave')) opts.showWave = _script.getAttribute('data-show-wave') !== 'false';
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
// 3. Build Standalone Holi Bundle
// ─────────────────────────────────────────────
const esmHoli = `/**
 * 🎨 Holi Festival Standalone Overlay v1.0.0
 * @license MIT
 */
${utilsSource.replace(/export\s+/g, '')}
${engineSource.replace(/export\s+/g, '')}
${holiSource.replace(/export\s+/g, '')}

registerEvent(HoliEvent);

let _instance = null;

export function start(options = {}) {
    if (_instance) _instance.stop();
    _instance = new EventOverlayEngine({
        ...options,
        event: 'holi',
        eventOptions: options
    });
    _instance.start();
    return _instance;
}

export function stop() {
    if (_instance) {
        _instance.stop();
        _instance = null;
    }
}

export function toggle(options = {}) {
    if (_instance && _instance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

export function isRunning() {
    return _instance ? _instance.isRunning() : false;
}

export function create(options = {}) {
    return new EventOverlayEngine({
        ...options,
        event: 'holi',
        eventOptions: options
    });
}

export { HoliEvent, HOLI_COLORS };

const HoliOverlay = {
    start,
    stop,
    toggle,
    isRunning,
    create,
    HoliEvent,
    HOLI_COLORS
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
 * 🎨 Holi Overlay — Standalone UMD
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
// 4. Subpath TypeScript Declarations
// ─────────────────────────────────────────────
const typesSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'types.d.ts'), 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'event-overlay.d.ts'), typesSource, 'utf-8');

const indepDts = `/**
 * Standalone TypeScript types for Independence Day Overlay
 */
import type { FC } from 'react';
import type { EventOverlayEngine, IndependenceDayOptions, IndependenceDayOverlayProps } from '../event-overlay';

export declare function start(options?: IndependenceDayOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;
export declare function create(options?: IndependenceDayOptions): EventOverlayEngine;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default start;
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'independence-day.d.ts'), indepDts, 'utf-8');

const holiDts = `/**
 * Standalone TypeScript types for Holi Festival Overlay
 */
import type { FC } from 'react';
import type { EventOverlayEngine, HoliOptions, HoliOverlayProps } from '../event-overlay';

export declare function start(options?: HoliOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function toggle(options?: HoliOptions): void;
export declare function isRunning(): boolean;
export declare function create(options?: HoliOptions): EventOverlayEngine;

export declare const HoliOverlay: FC<HoliOverlayProps>;
export default start;
`;
fs.writeFileSync(path.join(DIST_DIR, 'events', 'holi.d.ts'), holiDts, 'utf-8');

console.log('✅ Build complete with HiDPI scaling, sprite caching, and subpath types!');
console.log('   dist/event-overlay.js             — Unified ESM');
console.log('   dist/event-overlay.umd.js         — Unified UMD');
console.log('   dist/events/independence-day.js   — Standalone Independence Day ESM');
console.log('   dist/events/independence-day.umd.js — Standalone Independence Day UMD');
console.log('   dist/events/holi.js               — Standalone Holi ESM');
console.log('   dist/events/holi.umd.js           — Standalone Holi UMD');
console.log('   dist/*.d.ts                       — Subpath TypeScript types');
