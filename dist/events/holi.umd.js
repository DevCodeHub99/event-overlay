/**
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

/**
 * 🎨 Holi Festival Standalone Overlay v1.0.0
 * @license MIT
 */
/**
 * 🛠️ Shared Core Utilities for Event Overlay
 * Zero external dependencies.
 *
 * @module event-overlay/core/utils
 */

/**
 * Filter an array in-place without heap allocations.
 * @param {Array} arr
 * @param {Function} predicate
 */
function filterInPlace(arr, predicate) {
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < arr.length; readIdx++) {
        if (predicate(arr[readIdx])) {
            arr[writeIdx++] = arr[readIdx];
        }
    }
    arr.length = writeIdx;
}

/**
 * Generate a random number within [min, max).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Safe calculation of devicePixelRatio capped at 2 to avoid memory blowup on 3x/4x screens.
 * @returns {number}
 */
function getSafeDPR() {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Detect user's reduced motion OS preference for accessibility.
 * @returns {boolean}
 */
function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 🎆 Event Overlay Engine — Core Kernel (Optimized)
 * Framework-agnostic, zero-dependency HTML5 Canvas engine for plug-and-play event animations.
 *
 * @module event-overlay/engine
 * @version 1.0.0
 * @license MIT
 */



// Registry for available event modules
const registeredEvents = new Map();

/**
 * Register an event module with the global registry.
 * @param {Object} module - The event module implementation
 * @param {string} module.id - Unique ID for the event (e.g., 'independence-day')
 * @param {string} module.name - Human readable name
 * @param {Function} [module.init] - Initialization hook (ctx, width, height, options)
 * @param {Function} [module.resize] - Resize hook (width, height)
 * @param {Function} module.update - Update hook (time, delta, width, height)
 * @param {Function} module.draw - Render hook (ctx, width, height, time)
 * @param {Function} [module.destroy] - Cleanup hook ()
 */
function registerEvent(module) {
    if (!module || !module.id) {
        throw new Error('[EventOverlay] Event module must have a valid `id` property.');
    }
    registeredEvents.set(module.id, module);
}

/**
 * Get a registered event module by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
function getRegisteredEvent(id) {
    return registeredEvents.get(id);
}

/**
 * List all registered event IDs.
 * @returns {string[]}
 */
function getRegisteredEventIds() {
    return Array.from(registeredEvents.keys());
}

let instanceCounter = 0;

/**
 * Controller class that manages canvas creation, animation loop, HiDPI scaling, and active event rendering.
 */
class EventOverlayEngine {
    /**
     * @param {Object} [options]
     * @param {string} [options.event='independence-day'] - Event module ID to render
     * @param {number} [options.zIndex=99999] - CSS z-index for canvas
     * @param {number} [options.opacity=0.95] - Opacity of canvas (0-1)
     * @param {string} [options.container] - CSS selector for parent element (default: body)
     * @param {number} [options.duration=0] - Auto-stop duration in ms (0 = infinite)
     * @param {boolean} [options.respectReducedMotion=true] - Scale down motion if OS requested
     * @param {Object} [options.eventOptions] - Custom options passed down to the event module
     */
    constructor(options = {}) {
        this._id = ++instanceCounter;
        this.eventId = options.event || 'independence-day';
        this.zIndex = options.zIndex ?? 99999;
        this.opacity = options.opacity ?? 0.95;
        this.containerSelector = options.container || null;
        this.duration = options.duration ?? 0;
        this.respectReducedMotion = options.respectReducedMotion ?? true;
        this.eventOptions = options.eventOptions || {};

        this._canvas = null;
        this._ctx = null;
        this._dpr = 1;
        this._animationId = null;
        this._running = false;
        this._paused = false;
        this._startTime = 0;
        this._lastTime = 0;
        this._firstFrame = true;
        this._resizeHandler = null;
        this._resizeTimer = null;
        this._visibilityHandler = null;
        this._activeModule = null;

        this._width = 0;
        this._height = 0;
    }

    _getContainer() {
        if (this.containerSelector) {
            return document.querySelector(this.containerSelector) || document.body;
        }
        return document.body;
    }

    _createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = `event-overlay-canvas-${this._id}`;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            `z-index:${this.zIndex}`,
            `opacity:${this.opacity}`
        ].join(';');

        this._getContainer().appendChild(canvas);
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    _setSize() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._dpr = getSafeDPR();

        if (this._canvas && this._ctx) {
            // Crisp HiDPI / Retina display buffer sizing
            this._canvas.width = this._width * this._dpr;
            this._canvas.height = this._height * this._dpr;
            this._ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            this._ctx.scale(this._dpr, this._dpr);    // Scale to match CSS pixels
        }

        if (this._activeModule && typeof this._activeModule.resize === 'function') {
            this._activeModule.resize(this._width, this._height);
        }
    }

    _render(time) {
        if (!this._running || this._paused) return;

        if (this._firstFrame) {
            this._firstFrame = false;
            this._startTime = time;
            this._lastTime = time;
        }

        const delta = Math.min(64, time - this._lastTime); // Cap delta to avoid frame explosion
        this._lastTime = time;

        // Auto-stop duration check
        if (this.duration > 0 && time - this._startTime > this.duration) {
            this.stop();
            return;
        }

        const ctx = this._ctx;
        const w = this._width;
        const h = this._height;

        ctx.clearRect(0, 0, w, h);

        if (this._activeModule) {
            if (typeof this._activeModule.update === 'function') {
                this._activeModule.update(time, delta, w, h);
            }
            if (typeof this._activeModule.draw === 'function') {
                this._activeModule.draw(ctx, w, h, time);
            }
        }

        this._animationId = requestAnimationFrame((t) => this._render(t));
    }

    /**
     * Change active event module at runtime.
     * @param {string|Object} event - Module ID or custom module object
     * @param {Object} [eventOptions] - Options for the event module
     */
    setEvent(event, eventOptions) {
        let mod = null;
        if (typeof event === 'string') {
            mod = registeredEvents.get(event);
            if (!mod) {
                console.warn(`[EventOverlay] Event module '${event}' is not registered.`);
                return this;
            }
            this.eventId = event;
        } else if (typeof event === 'object' && event.id) {
            mod = event;
            this.eventId = event.id;
        }

        if (this._activeModule && typeof this._activeModule.destroy === 'function') {
            this._activeModule.destroy();
        }

        this._activeModule = mod;
        if (eventOptions) {
            this.eventOptions = eventOptions;
        }

        if (this._activeModule && typeof this._activeModule.init === 'function' && this._ctx) {
            this._activeModule.init(this._ctx, this._width, this._height, this.eventOptions);
        }

        return this;
    }

    /**
     * Start overlay animation loop.
     * @returns {EventOverlayEngine}
     */
    start() {
        if (this._running) return this;

        // Check reduced motion preference
        if (this.respectReducedMotion && prefersReducedMotion()) {
            this.opacity = Math.min(this.opacity, 0.6);
            this.eventOptions = {
                ...this.eventOptions,
                maxJets: 0,
                maxFireworks: 1,
                maxBalloons: 5
            };
        }

        if (!this._activeModule) {
            this.setEvent(this.eventId, this.eventOptions);
        }

        this._createCanvas();
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._dpr = getSafeDPR();

        if (this._activeModule && typeof this._activeModule.init === 'function') {
            this._activeModule.init(this._ctx, this._width, this._height, this.eventOptions);
        }

        this._setSize();

        // Debounced resize handler
        this._resizeHandler = () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => this._setSize(), 100);
        };
        window.addEventListener('resize', this._resizeHandler);

        // Visibility Change listener — pauses canvas loop in inactive tabs to save CPU & battery
        this._visibilityHandler = () => {
            if (document.hidden) {
                this._paused = true;
                if (this._animationId) {
                    cancelAnimationFrame(this._animationId);
                    this._animationId = null;
                }
            } else {
                this._paused = false;
                this._firstFrame = true; // Reset timing on resume
                this._animationId = requestAnimationFrame((t) => this._render(t));
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);

        this._running = true;
        this._paused = false;
        this._firstFrame = true;
        this._animationId = requestAnimationFrame((t) => this._render(t));

        return this;
    }

    /**
     * Stop and cleanup the overlay.
     * @returns {EventOverlayEngine}
     */
    stop() {
        this._running = false;
        this._paused = false;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
        if (this._resizeTimer) {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
        }
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }

        if (this._activeModule && typeof this._activeModule.destroy === 'function') {
            this._activeModule.destroy();
        }

        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }

        this._canvas = null;
        this._ctx = null;
        this._activeModule = null;

        return this;
    }

    /**
     * Check if currently running.
     * @returns {boolean}
     */
    isRunning() {
        return this._running && !this._paused;
    }

    /**
     * Toggle on/off.
     * @returns {EventOverlayEngine}
     */
    toggle() {
        if (this._running) {
            this.stop();
        } else {
            this.start();
        }
        return this;
    }
}

/**
 * 🎨 Holi Festival Event Module for Event Overlay
 * Features:
 *  - Colorful water balloons launched from all 4 screen edges
 *  - Pichkaari (water gun) streams sweeping across screen
 *  - Realistic particle splash physics (water droplets + powder clouds)
 *  - Ambient pulsating color corners
 *
 * @module event-overlay/events/holi
 */



const HOLI_COLORS = [
    { r: 255, g: 105, b: 180 }, // Pink
    { r: 255, g: 223, b: 0 },   // Yellow
    { r: 50, g: 205, b: 50 },   // Green
    { r: 0, g: 191, b: 255 },   // Blue
    { r: 255, g: 140, b: 0 },   // Orange
    { r: 148, g: 0, b: 211 },   // Violet
    { r: 0, g: 255, b: 255 },   // Cyan
    { r: 255, g: 20, b: 147 },  // DeepPink
    { r: 173, g: 255, b: 47 }   // GreenYellow
];

const MAX_PICHKAARI_PARTICLES = 600;
const MAX_SPLASHES = 35;

class Particle {
    constructor(x, y, color, isPowder, vx, vy, gravity = 0.4) {
        this.x = x;
        this.y = y;
        this.isPowder = isPowder;
        this.gravity = gravity;
        this.color = color || HOLI_COLORS[0];
        this.life = 0;

        if (isPowder) {
            this.vx = vx ?? (Math.random() - 0.5) * 16;
            this.vy = vy ?? (Math.random() - 0.5) * 16;
            this.maxLife = randomRange(30, 75);
            this.size = Math.max(1, randomRange(4, 14));
        } else {
            this.vx = vx ?? (Math.random() - 0.5) * 12;
            this.vy = vy ?? (Math.random() - 0.5) * 12;
            this.maxLife = randomRange(20, 40);
            this.size = Math.max(1, randomRange(2, 7));
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.isPowder) {
            this.vx *= 0.88;
            this.vy *= 0.88;
            this.size = Math.max(0.5, this.size * 0.98);
        } else {
            this.vy += this.gravity;
        }

        this.life++;
    }

    draw(ctx) {
        const fadeOut = Math.max(0, 1 - this.life / this.maxLife);
        const alpha = Math.max(0, fadeOut * (this.isPowder ? 0.35 : 0.9));
        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;

        const s = Math.max(0.5, this.size);
        if (!this.isPowder) {
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const stretch = Math.max(1, speed / 4);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(0.5, s * stretch), s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Splash {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color || HOLI_COLORS[0];
        this.life = 0;
        this.maxLife = 160;
        this.size = Math.max(10, size * 2.8);
        this.particles = [];

        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, this.color, false));
        }
        for (let i = 0; i < 35; i++) {
            this.particles.push(new Particle(x, y, this.color, true));
        }
    }

    update() {
        this.life++;
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }
        filterInPlace(this.particles, (p) => p.life < p.maxLife);
    }

    draw(ctx) {
        let alpha = 0.35;
        if (this.life > this.maxLife * 0.6) {
            alpha = Math.max(0, 1 - ((this.life - this.maxLife * 0.6) / (this.maxLife * 0.4))) * 0.35;
        }

        const radius = Math.max(1, this.size);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.size);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        grad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`);
        grad.addColorStop(0.5, `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(ctx);
        }
    }
}

class Balloon {
    constructor(canvasWidth, canvasHeight, colors) {
        const colorList = colors && colors.length ? colors : HOLI_COLORS;
        this.active = true;
        this.radius = randomRange(14, 30);
        this.color = colorList[Math.floor(Math.random() * colorList.length)];
        this.burstLife = randomRange(20, 50);
        this.life = 0;
        this.gravity = 0.15;

        const w = Math.max(400, canvasWidth || window.innerWidth || 800);
        const h = Math.max(400, canvasHeight || window.innerHeight || 600);

        const side = Math.floor(Math.random() * 4);
        if (side === 0) {
            this.x = Math.random() * w;
            this.y = -50;
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = randomRange(6, 12);
        } else if (side === 1) {
            this.x = -50;
            this.y = Math.random() * (h * 0.8);
            this.vx = randomRange(8, 16);
            this.vy = (Math.random() - 0.5) * 8;
        } else if (side === 2) {
            this.x = w + 50;
            this.y = Math.random() * (h * 0.8);
            this.vx = -randomRange(8, 16);
            this.vy = (Math.random() - 0.5) * 8;
        } else {
            this.x = Math.random() * w;
            this.y = h + 50;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = -randomRange(10, 18);
        }
    }

    update(canvasWidth, canvasHeight) {
        const w = canvasWidth || window.innerWidth;
        const h = canvasHeight || window.innerHeight;

        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life++;

        const isInsideScreen = this.x > 0 && this.x < w && this.y > 0 && this.y < h;

        if ((this.life >= this.burstLife && isInsideScreen) ||
            this.y + this.radius >= h ||
            (this.vx > 0 && this.x + this.radius >= w) ||
            (this.vx < 0 && this.x - this.radius <= 0)) {

            this.active = false;
            const splashX = Math.min(w - 15, Math.max(15, this.x));
            const splashY = Math.min(h - 15, Math.max(15, this.y));
            return new Splash(splashX, splashY, this.color, this.radius);
        }

        if (this.y > h + 200 || this.x < -200 || this.x > w + 200) {
            this.active = false;
        }
        return null;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const stretch = Math.max(1, speed / 8);
        const r = Math.max(5, this.radius);
        const gradR = Math.max(1, r * stretch);

        const grad = ctx.createRadialGradient(r * 0.2, -r * 0.2, 0, 0, 0, gradR);
        grad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.95)`);
        grad.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0.75)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * stretch, r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},1)`;
        ctx.beginPath();
        ctx.moveTo(-r * stretch - 2, 0);
        ctx.lineTo(-r * stretch - 8, -4);
        ctx.lineTo(-r * stretch - 8, 4);
        ctx.fill();

        ctx.restore();
    }
}

class Pichkaari {
    constructor(canvasWidth, canvasHeight, colors) {
        const colorList = colors && colors.length ? colors : HOLI_COLORS;
        this.color = colorList[Math.floor(Math.random() * colorList.length)];
        this.life = 0;
        this.maxLife = randomRange(50, 110);
        this.particles = [];
        this.active = true;

        const w = Math.max(400, canvasWidth || window.innerWidth || 800);
        const h = Math.max(400, canvasHeight || window.innerHeight || 600);

        const side = Math.floor(Math.random() * 3);
        if (side === 0) {
            this.x = -10;
            this.y = randomRange(h * 0.3, h * 0.7);
            this.vx = randomRange(20, 45);
            this.vy = -randomRange(5, 12);
        } else if (side === 1) {
            this.x = w + 10;
            this.y = randomRange(h * 0.3, h * 0.7);
            this.vx = -randomRange(20, 45);
            this.vy = -randomRange(5, 12);
        } else {
            this.x = randomRange(w * 0.2, w * 0.8);
            this.y = h + 10;
            this.vx = (Math.random() - 0.5) * 18;
            this.vy = -randomRange(25, 45);
        }
    }

    update() {
        this.life++;
        if (this.life < this.maxLife && this.particles.length < MAX_PICHKAARI_PARTICLES) {
            for (let i = 0; i < 12; i++) {
                if (this.particles.length >= MAX_PICHKAARI_PARTICLES) break;
                const pVx = this.vx + (Math.random() - 0.5) * 5;
                const pVy = this.vy + (Math.random() - 0.5) * 5;
                const particle = new Particle(this.x, this.y, this.color, false, pVx, pVy, 0.4);
                particle.maxLife = randomRange(50, 100);
                particle.size = randomRange(4, 9);
                this.particles.push(particle);
            }

            if (this.vx > 0) { this.vy -= 0.5; this.vx *= 0.98; }
            else if (this.vx < 0) { this.vy -= 0.5; this.vx *= 0.98; }
            else { this.vx += (Math.random() - 0.5) * 3; }
        }

        if (this.life >= this.maxLife && this.particles.length === 0) {
            this.active = false;
        }
        for (let j = 0; j < this.particles.length; j++) {
            this.particles[j].update();
        }
        filterInPlace(this.particles, (p) => p.life < p.maxLife);
    }

    draw(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(ctx);
        }
    }
}

class AmbientCorner {
    constructor(x, y, canvasWidth, canvasHeight, colors) {
        this.x = x;
        this.y = y;
        this.baseRadius = Math.max(100, Math.max(canvasWidth || 800, canvasHeight || 600) * 0.35);
        this.timeOffset = Math.random() * 10000;

        const colorList = colors && colors.length ? colors : HOLI_COLORS;
        const pool = colorList.slice().sort(() => 0.5 - Math.random());
        this.color1 = pool[0];
        this.color2 = pool[1] || pool[0];
        this.color3 = pool[2] || pool[0];
    }

    draw(ctx, elapsed) {
        const time = elapsed + this.timeOffset;

        const pulse1 = Math.sin(time * 0.001) * 0.15 + 0.85;
        const pulse2 = Math.cos(time * 0.0013) * 0.15 + 0.85;

        const r1 = Math.max(10, this.baseRadius * pulse1);
        const r2 = Math.max(10, this.baseRadius * pulse2 * 0.6);

        ctx.save();

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r1);
        grad.addColorStop(0, `rgba(${this.color1.r},${this.color1.g},${this.color1.b},0.4)`);
        grad.addColorStop(0.5, `rgba(${this.color2.r},${this.color2.g},${this.color2.b},0.15)`);
        grad.addColorStop(1, `rgba(${this.color1.r},${this.color1.g},${this.color1.b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r1, 0, Math.PI * 2);
        ctx.fill();

        const grad2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r2);
        grad2.addColorStop(0, `rgba(${this.color3.r},${this.color3.g},${this.color3.b},0.45)`);
        grad2.addColorStop(1, `rgba(${this.color3.r},${this.color3.g},${this.color3.b},0)`);

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ─────────────────────────────────────────────
// Holi Event Module
// ─────────────────────────────────────────────
const HoliEvent = {
    id: 'holi',
    name: 'Holi Festival Overlay',

    init(ctx, width, height, options = {}) {
        const w = width || (typeof window !== 'undefined' ? window.innerWidth : 800);
        const h = height || (typeof window !== 'undefined' ? window.innerHeight : 600);

        this.colors = options.colors || HOLI_COLORS;
        this.maxBalloons = options.maxBalloons ?? 15;
        this.maxPichkaaris = options.maxPichkaaris ?? 4;
        this.showAmbient = options.showAmbient ?? true;

        this.balloons = [];
        this.splashes = [];
        this.pichkaaris = [];

        this.ambientCorners = [
            new AmbientCorner(0, 0, w, h, this.colors),
            new AmbientCorner(w, 0, w, h, this.colors),
            new AmbientCorner(0, h, w, h, this.colors),
            new AmbientCorner(w, h, w, h, this.colors)
        ];

        this.lastDropTime = 0;
        this.nextDropDelay = randomRange(100, 300);
        this.lastPichkaariTime = 0;
        this.nextPichkaariDelay = randomRange(800, 2000);
    },

    resize(width, height) {
        const w = width || window.innerWidth;
        const h = height || window.innerHeight;
        const colors = this.colors || HOLI_COLORS;
        this.ambientCorners = [
            new AmbientCorner(0, 0, w, h, colors),
            new AmbientCorner(w, 0, w, h, colors),
            new AmbientCorner(0, h, w, h, colors),
            new AmbientCorner(w, h, w, h, colors)
        ];
    },

    triggerBurst(x, y) {
        const colors = this.colors || HOLI_COLORS;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.splashes.push(new Splash(x, y, color, randomRange(18, 32)));
    },

    update(time, delta, width, height) {
        // Spawn balloons
        if (time - this.lastDropTime > this.nextDropDelay) {
            if (this.balloons.length < this.maxBalloons) {
                this.balloons.push(new Balloon(width, height, this.colors));
                if (Math.random() > 0.5) {
                    this.balloons.push(new Balloon(width, height, this.colors));
                }
            }
            this.lastDropTime = time;
            this.nextDropDelay = randomRange(80, 350);
        }

        // Spawn pichkaaris
        if (time - this.lastPichkaariTime > this.nextPichkaariDelay) {
            if (this.pichkaaris.length < this.maxPichkaaris) {
                this.pichkaaris.push(new Pichkaari(width, height, this.colors));
                if (Math.random() > 0.6) {
                    this.pichkaaris.push(new Pichkaari(width, height, this.colors));
                }
            }
            this.lastPichkaariTime = time;
            this.nextPichkaariDelay = randomRange(800, 2000);
        }

        // Splashes
        while (this.splashes.length > MAX_SPLASHES) {
            this.splashes.shift();
        }
        for (let i = 0; i < this.splashes.length; i++) {
            this.splashes[i].update();
        }
        filterInPlace(this.splashes, (s) => s.life < s.maxLife);

        // Balloons
        const remainingBalloons = [];
        for (let i = 0; i < this.balloons.length; i++) {
            const balloon = this.balloons[i];
            const splash = balloon.update(width, height);
            if (splash) this.splashes.push(splash);
            if (balloon.active) {
                remainingBalloons.push(balloon);
            }
        }
        this.balloons = remainingBalloons;

        // Pichkaaris
        const remainingPichkaaris = [];
        for (let i = 0; i < this.pichkaaris.length; i++) {
            const p = this.pichkaaris[i];
            p.update();
            if (p.active) remainingPichkaaris.push(p);
        }
        this.pichkaaris = remainingPichkaaris;
    },

    draw(ctx, width, height, time) {
        // Ambient Corners
        if (this.showAmbient) {
            for (let c = 0; c < this.ambientCorners.length; c++) {
                this.ambientCorners[c].draw(ctx, time);
            }
        }

        // Splashes
        for (let i = 0; i < this.splashes.length; i++) {
            this.splashes[i].draw(ctx);
        }

        // Balloons
        for (let i = 0; i < this.balloons.length; i++) {
            this.balloons[i].draw(ctx);
        }

        // Pichkaaris
        for (let i = 0; i < this.pichkaaris.length; i++) {
            this.pichkaaris[i].draw(ctx);
        }
    },

    destroy() {
        this.balloons = [];
        this.splashes = [];
        this.pichkaaris = [];
        this.ambientCorners = [];
    }
};

default HoliEvent;


registerEvent(HoliEvent);

let _instance = null;

function start(options = {}) {
    if (_instance) _instance.stop();
    _instance = new EventOverlayEngine({
        ...options,
        event: 'holi',
        eventOptions: options
    });
    _instance.start();
    return _instance;
}

function stop() {
    if (_instance) {
        _instance.stop();
        _instance = null;
    }
}

function toggle(options = {}) {
    if (_instance && _instance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

function isRunning() {
    return _instance ? _instance.isRunning() : false;
}

function create(options = {}) {
    return new EventOverlayEngine({
        ...options,
        event: 'holi',
        eventOptions: options
    });
}


const HoliOverlay = {
    start,
    stop,
    toggle,
    isRunning,
    create,
    HoliEvent,
    HOLI_COLORS
};

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
