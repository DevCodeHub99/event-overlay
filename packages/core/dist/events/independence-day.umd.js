/**
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

/**
 * 🇮🇳 @event-overlay/independence-day v1.0.0
 * @license MIT
 */

// ─── UTILS ───
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


// ─── CORE ENGINE ───
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


// ─── INDEPENDENCE DAY EVENT ───
/**
 * 🇮🇳 Independence Day Event Module for Event Overlay
 * Features:
 *  - 🌊 Flowing Indian National Tricolor Silk Wave with customizable opacity
 *  - Fluttering Indian National Flags (Tiranga) with cached 24-spoke Ashoka Chakra sprite & cloth wave physics
 *  - Flying Tri-color Kites with fluttering tails and trailing strings
 *  - Airshow Fighter Jets emitting Saffron, White, & Green smoke trails
 *  - Festive Tricolor & Gold Fireworks & Sparklers
 *  - Fluttering Marigold Petals & Tricolor Confetti
 *  - Ambient Tricolor Top/Bottom Glow
 *
 * @module event-overlay/events/independence-day
 */



const TRICOLOR = {
    saffron: { r: 255, g: 153, b: 51, hex: '#FF9933' },
    white: { r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    green: { r: 19, g: 136, b: 8, hex: '#138808' },
    navy: { r: 0, g: 0, b: 128, hex: '#000080' },
    gold: { r: 255, g: 215, b: 0, hex: '#FFD700' }
};

const COLOR_LIST = [TRICOLOR.saffron, TRICOLOR.white, TRICOLOR.green, TRICOLOR.gold];

// ─────────────────────────────────────────────
// Ashoka Chakra Offscreen Sprite Cache
// ─────────────────────────────────────────────
let _chakraSpriteCanvas = null;

function getAshokaChakraSprite() {
    if (_chakraSpriteCanvas) return _chakraSpriteCanvas;

    const size = 128; // High-res cache
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;
    const radius = size * 0.44;

    ctx.save();
    ctx.translate(center, center);

    // Outer Ring
    ctx.strokeStyle = TRICOLOR.navy.hex;
    ctx.lineWidth = size * 0.055;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Center Hub
    ctx.fillStyle = TRICOLOR.navy.hex;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 24 Spokes
    ctx.lineWidth = size * 0.025;
    for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI * 2) / 24;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
    }

    ctx.restore();
    _chakraSpriteCanvas = canvas;
    return _chakraSpriteCanvas;
}

// ─────────────────────────────────────────────
// 1. Flowing Indian National Tricolor Silk Wave
// ─────────────────────────────────────────────
class TricolorSilkWave {
    draw(ctx, w, h, time, opacity = 0.65) {
        if (opacity <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

        const t = time * 0.0016;
        const waveY = h * 0.06;
        const waveHeight = Math.min(170, Math.max(85, h * 0.2));
        const stripeHeight = waveHeight / 3;
        const segments = 45;
        const dx = (w + 140) / segments;

        const ribbons = [
            {
                colorTop: 'rgba(255, 153, 51, 0.85)',
                colorBottom: 'rgba(255, 120, 0, 0.35)',
                glow: 'rgba(255, 200, 100, 0.45)',
                offsetY: 0
            },
            {
                colorTop: 'rgba(255, 255, 255, 0.9)',
                colorBottom: 'rgba(225, 235, 255, 0.4)',
                glow: 'rgba(255, 255, 255, 0.5)',
                offsetY: stripeHeight * 0.88
            },
            {
                colorTop: 'rgba(19, 136, 8, 0.85)',
                colorBottom: 'rgba(10, 95, 5, 0.35)',
                glow: 'rgba(45, 190, 30, 0.45)',
                offsetY: stripeHeight * 1.76
            }
        ];

        ribbons.forEach((ribbon, rIdx) => {
            const pointsTop = [];
            const pointsBottom = [];

            for (let i = 0; i <= segments; i++) {
                const x = i * dx - 70;
                const wave1 = Math.sin((x * 0.0032) - t * 1.3 + rIdx * 0.35) * 26;
                const wave2 = Math.cos((x * 0.0065) + t * 0.9) * 13;
                const wave3 = Math.sin((x * 0.0016) - t * 0.5) * 16;

                const yCenter = waveY + ribbon.offsetY + wave1 + wave2 + wave3 + (x / w) * (h * 0.04);
                const ribbonThickness = stripeHeight * (1 + Math.sin(x * 0.004 + t) * 0.22);

                pointsTop.push({ x, y: yCenter - ribbonThickness * 0.5 });
                pointsBottom.push({ x, y: yCenter + ribbonThickness * 0.5 });
            }

            const grad = ctx.createLinearGradient(0, waveY, 0, waveY + waveHeight * 1.4);
            grad.addColorStop(0, ribbon.colorTop);
            grad.addColorStop(1, ribbon.colorBottom);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(pointsTop[0].x, pointsTop[0].y);

            for (let i = 0; i < pointsTop.length - 1; i++) {
                const xc = (pointsTop[i].x + pointsTop[i + 1].x) / 2;
                const yc = (pointsTop[i].y + pointsTop[i + 1].y) / 2;
                ctx.quadraticCurveTo(pointsTop[i].x, pointsTop[i].y, xc, yc);
            }
            const lastTop = pointsTop[pointsTop.length - 1];
            ctx.lineTo(lastTop.x, lastTop.y);

            const lastBottom = pointsBottom[pointsBottom.length - 1];
            ctx.lineTo(lastBottom.x, lastBottom.y);

            for (let i = pointsBottom.length - 1; i > 0; i--) {
                const xc = (pointsBottom[i].x + pointsBottom[i - 1].x) / 2;
                const yc = (pointsBottom[i].y + pointsBottom[i - 1].y) / 2;
                ctx.quadraticCurveTo(pointsBottom[i].x, pointsBottom[i].y, xc, yc);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = ribbon.glow;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
            for (let i = 0; i < pointsTop.length - 1; i++) {
                const xc = (pointsTop[i].x + pointsTop[i + 1].x) / 2;
                const yc = (pointsTop[i].y + pointsTop[i + 1].y) / 2;
                ctx.quadraticCurveTo(pointsTop[i].x, pointsTop[i].y, xc, yc);
            }
            ctx.stroke();
        });

        ctx.restore();
    }
}

// ─────────────────────────────────────────────
// 2. Indian National Flag (Tiranga with Cached Ashoka Chakra)
// ─────────────────────────────────────────────
class WavingFlag {
    constructor(canvasWidth, canvasHeight) {
        this.reset(canvasWidth, canvasHeight);
    }

    reset(w, h) {
        this.x = randomRange(w * 0.05, w * 0.9);
        this.y = h + randomRange(50, 250);
        this.width = randomRange(55, 90);
        this.height = this.width * (2 / 3);
        this.vx = randomRange(-0.6, 0.6);
        this.vy = -randomRange(1.1, 2.2);
        this.wobbleSpeed = randomRange(0.02, 0.04);
        this.timeOffset = randomRange(0, 1000);
        this.waveFreq = 0.08;
        this.waveAmp = randomRange(3, 6);
        this.active = true;
    }

    update(time, w, h) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.7 + this.vx;

        if (this.y < -this.height - 100) {
            this.active = false;
        }
    }

    draw(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const w = this.width;
        const h = this.height;
        const stripeH = h / 3;
        const waveTime = (time + this.timeOffset) * 0.005;

        // Flagpole (Left Mast)
        const poleHeight = h * 1.6;
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-4, -6, 4, poleHeight);

        // Golden Finial
        ctx.fillStyle = TRICOLOR.gold.hex;
        ctx.beginPath();
        ctx.arc(-2, -6, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 3 Tricolor Bands with Wave Slices
        const slices = 16;
        const sliceWidth = w / slices;
        const stripes = [
            { color: TRICOLOR.saffron.hex, yOffset: 0 },
            { color: TRICOLOR.white.hex, yOffset: stripeH },
            { color: TRICOLOR.green.hex, yOffset: stripeH * 2 }
        ];

        stripes.forEach(stripe => {
            ctx.fillStyle = stripe.color;
            ctx.beginPath();
            for (let i = 0; i <= slices; i++) {
                const curX = i * sliceWidth;
                const wave = Math.sin(curX * this.waveFreq - waveTime) * this.waveAmp * (i / slices);
                const curY = stripe.yOffset + wave;

                if (i === 0) ctx.moveTo(curX, curY);
                else ctx.lineTo(curX, curY);
            }

            for (let i = slices; i >= 0; i--) {
                const curX = i * sliceWidth;
                const wave = Math.sin(curX * this.waveFreq - waveTime) * this.waveAmp * (i / slices);
                const curY = stripe.yOffset + stripeH + wave;
                ctx.lineTo(curX, curY);
            }
            ctx.closePath();
            ctx.fill();
        });

        // Blit Cached Ashoka Chakra Sprite
        const chakraSprite = getAshokaChakraSprite();
        const chakraDiameter = stripeH * 0.85;
        const chakraCenterX = w * 0.5;
        const chakraWave = Math.sin(chakraCenterX * this.waveFreq - waveTime) * this.waveAmp * 0.5;
        const chakraY = stripeH * 1.5 - chakraDiameter / 2 + chakraWave;

        ctx.drawImage(
            chakraSprite,
            chakraCenterX - chakraDiameter / 2,
            chakraY,
            chakraDiameter,
            chakraDiameter
        );

        // Subtle fabric ripple shadow
        const shadowGrad = ctx.createLinearGradient(0, 0, w, 0);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.15)');
        shadowGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)');
        shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        shadowGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}

// ─────────────────────────────────────────────
// 3. Kite Class
// ─────────────────────────────────────────────
class Kite {
    constructor(canvasWidth, canvasHeight) {
        this.reset(canvasWidth, canvasHeight);
    }

    reset(w, h) {
        this.x = randomRange(w * 0.1, w * 0.9);
        this.y = h + randomRange(50, 250);
        this.size = randomRange(18, 38);
        this.vx = randomRange(-0.8, 0.8);
        this.vy = -randomRange(1.2, 2.5);
        this.angle = randomRange(-0.25, 0.25);
        this.wobbleSpeed = randomRange(0.015, 0.035);
        this.timeOffset = randomRange(0, 1000);
        this.active = true;

        this.tailLength = Math.floor(randomRange(8, 16));
        this.tailHistory = [];
        for (let i = 0; i < this.tailLength; i++) {
            this.tailHistory.push({ x: this.x, y: this.y + i * 8 });
        }
    }

    update(time, w, h) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.8 + this.vx;
        this.angle = Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.2;

        this.tailHistory.unshift({ x: this.x, y: this.y + this.size });
        if (this.tailHistory.length > this.tailLength) {
            this.tailHistory.pop();
        }

        if (this.y < -150) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const s = this.size;

        // Top triangle (Saffron)
        ctx.fillStyle = TRICOLOR.saffron.hex;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(-s * 0.75, 0);
        ctx.closePath();
        ctx.fill();

        // Left triangle (White)
        ctx.fillStyle = TRICOLOR.white.hex;
        ctx.beginPath();
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, s);
        ctx.closePath();
        ctx.fill();

        // Right triangle (Navy / Gold accent)
        ctx.fillStyle = TRICOLOR.navy.hex;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s);
        ctx.closePath();
        ctx.fill();

        // Bottom triangle (Green)
        ctx.fillStyle = TRICOLOR.green.hex;
        ctx.beginPath();
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s * 0.6);
        ctx.closePath();
        ctx.fill();

        // Frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.1);
        ctx.lineTo(0, s * 1.1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-s * 0.8, 0);
        ctx.quadraticCurveTo(0, -s * 0.4, s * 0.8, 0);
        ctx.stroke();

        ctx.fillStyle = TRICOLOR.saffron.hex;
        ctx.beginPath();
        ctx.arc(0, s, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Tail ribbons
        if (this.tailHistory.length > 1) {
            ctx.save();
            ctx.lineWidth = 2.5;
            for (let i = 0; i < this.tailHistory.length - 1; i++) {
                const p1 = this.tailHistory[i];
                const p2 = this.tailHistory[i + 1];
                const colorMod = i % 3;
                ctx.strokeStyle = colorMod === 0 ? TRICOLOR.saffron.hex : colorMod === 1 ? TRICOLOR.white.hex : TRICOLOR.green.hex;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // String
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + s);
        ctx.quadraticCurveTo(this.x + Math.sin(this.y * 0.01) * 40, this.y + 200, this.x + 10, this.y + 500);
        ctx.stroke();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────
// 4. Jet Airshow & Smoke Trail
// ─────────────────────────────────────────────
class SmokeParticle {
    constructor(x, y, color, size, vx, vy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = 0;
        this.maxLife = randomRange(40, 75);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.size *= 1.015;
        this.life++;
    }

    draw(ctx) {
        const progress = this.life / this.maxLife;
        const alpha = Math.max(0, (1 - progress) * 0.45);
        ctx.save();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class JetAirshow {
    constructor(w, h) {
        this.active = true;
        this.startX = -100;
        this.startY = randomRange(h * 0.1, h * 0.4);
        this.endX = w + 100;
        this.endY = this.startY + randomRange(-80, 80);

        this.x = this.startX;
        this.y = this.startY;
        this.speed = randomRange(10, 16);

        const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;

        this.smokeParticles = [];
    }

    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < w + 50) {
            const perpX = -Math.sin(this.angle);
            const perpY = Math.cos(this.angle);

            this.smokeParticles.push(new SmokeParticle(
                this.x + perpX * 8, this.y + perpY * 8,
                TRICOLOR.saffron, 6, -this.vx * 0.1 + randomRange(-0.5, 0.5), -this.vy * 0.1 + randomRange(-0.5, 0.5)
            ));

            this.smokeParticles.push(new SmokeParticle(
                this.x, this.y,
                TRICOLOR.white, 6, -this.vx * 0.1 + randomRange(-0.5, 0.5), -this.vy * 0.1 + randomRange(-0.5, 0.5)
            ));

            this.smokeParticles.push(new SmokeParticle(
                this.x - perpX * 8, this.y - perpY * 8,
                TRICOLOR.green, 6, -this.vx * 0.1 + randomRange(-0.5, 0.5), -this.vy * 0.1 + randomRange(-0.5, 0.5)
            ));
        }

        for (let i = 0; i < this.smokeParticles.length; i++) {
            this.smokeParticles[i].update();
        }
        filterInPlace(this.smokeParticles, p => p.life < p.maxLife);

        if (this.x > w + 150 && this.smokeParticles.length === 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.smokeParticles.length; i++) {
            this.smokeParticles[i].draw(ctx);
        }

        if (this.x > -50 && this.x < window.innerWidth + 50) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.lineTo(-12, -14);
            ctx.lineTo(-6, -3);
            ctx.lineTo(-16, -6);
            ctx.lineTo(-14, 0);
            ctx.lineTo(-16, 6);
            ctx.lineTo(-6, 3);
            ctx.lineTo(-12, 14);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#00BFFF';
            ctx.beginPath();
            ctx.ellipse(4, 0, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}

// ─────────────────────────────────────────────
// 5. Fireworks & Sparkler Burst
// ─────────────────────────────────────────────
class FireworkSpark {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(1.5, 7);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0;
        this.maxLife = randomRange(25, 55);
        this.size = randomRange(1.5, 4);
        this.gravity = 0.08;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life++;
    }

    draw(ctx) {
        const alpha = Math.max(0, 1 - this.life / this.maxLife);
        ctx.save();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FireworkBurst {
    constructor(w, h, targetX, targetY) {
        this.x = targetX !== undefined ? targetX : randomRange(w * 0.15, w * 0.85);
        this.targetY = targetY !== undefined ? targetY : randomRange(h * 0.1, h * 0.45);
        this.y = targetY !== undefined ? targetY + randomRange(40, 100) : h + 20;
        this.vy = -randomRange(10, 15);
        this.color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
        this.exploded = false;
        this.sparks = [];
        this.active = true;
    }

    update(w, h) {
        if (!this.exploded) {
            this.y += this.vy;
            if (this.y <= this.targetY || this.vy >= 0) {
                this.exploded = true;
                const numSparks = Math.floor(randomRange(35, 65));
                for (let i = 0; i < numSparks; i++) {
                    const sparkColor = (i % 4 === 0) ? TRICOLOR.gold : (i % 3 === 0) ? TRICOLOR.saffron : (i % 2 === 0) ? TRICOLOR.white : TRICOLOR.green;
                    this.sparks.push(new FireworkSpark(this.x, this.y, sparkColor));
                }
            }
        } else {
            for (let i = 0; i < this.sparks.length; i++) {
                this.sparks[i].update();
            }
            filterInPlace(this.sparks, s => s.life < s.maxLife);
            if (this.sparks.length === 0) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            for (let i = 0; i < this.sparks.length; i++) {
                this.sparks[i].draw(ctx);
            }
        }
    }
}

// ─────────────────────────────────────────────
// 6. Fluttering Confetti & Flower Petals
// ─────────────────────────────────────────────
class Petal {
    constructor(w, h) {
        this.reset(w, h);
    }

    reset(w, h) {
        this.x = Math.random() * w;
        this.y = -20;
        this.size = randomRange(5, 12);
        this.color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
        this.vy = randomRange(1.0, 2.2);
        this.vx = randomRange(-0.5, 0.5);
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = randomRange(-0.04, 0.04);
        this.wobbleSpeed = randomRange(0.015, 0.035);
        this.timeOffset = randomRange(0, 100);
        this.active = true;
    }

    update(time, w, h) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 1.2 + this.vx;
        this.rot += this.rotSpeed;

        if (this.y > h + 30) {
            this.reset(w, h);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.85)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────
// 7. Ambient Tricolor Glow
// ─────────────────────────────────────────────
class TricolorAmbient {
    draw(ctx, w, h, time) {
        const pulse = Math.sin(time * 0.001) * 0.05 + 0.95;

        const topGrad = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.45 * pulse);
        topGrad.addColorStop(0, 'rgba(255, 153, 51, 0.25)');
        topGrad.addColorStop(0.5, 'rgba(255, 153, 51, 0.08)');
        topGrad.addColorStop(1, 'rgba(255, 153, 51, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, h * 0.5);

        const bottomGrad = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.45 * pulse);
        bottomGrad.addColorStop(0, 'rgba(19, 136, 8, 0.25)');
        bottomGrad.addColorStop(0.5, 'rgba(19, 136, 8, 0.08)');
        bottomGrad.addColorStop(1, 'rgba(19, 136, 8, 0)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);
    }
}

// ─────────────────────────────────────────────
// Event Module Implementation
// ─────────────────────────────────────────────
const IndependenceDayEvent = {
    id: 'independence-day',
    name: 'Independence Day Overlay',

    init(ctx, width, height, options = {}) {
        this.maxFlags = options.maxFlags ?? 3;
        this.maxKites = options.maxKites ?? 6;
        this.maxJets = options.maxJets ?? 2;
        this.maxFireworks = options.maxFireworks ?? 3;
        this.maxPetals = options.maxPetals ?? 35;
        this.showGlow = options.showGlow ?? true;
        this.showWave = options.showWave ?? true;
        this.waveOpacity = options.waveOpacity ?? 0.65;

        this.silkWave = new TricolorSilkWave();

        this.flags = [];
        for (let i = 0; i < this.maxFlags; i++) {
            const f = new WavingFlag(width, height);
            f.y = randomRange(height * 0.2, height * 0.8);
            this.flags.push(f);
        }

        this.kites = [];
        for (let i = 0; i < this.maxKites; i++) {
            this.kites.push(new Kite(width, height));
        }

        this.petals = [];
        for (let i = 0; i < this.maxPetals; i++) {
            const p = new Petal(width, height);
            p.y = Math.random() * height;
            this.petals.push(p);
        }

        this.jets = [];
        this.fireworks = [];
        this.ambient = new TricolorAmbient();

        this.lastJetTime = 0;
        this.nextJetDelay = randomRange(2000, 5000);

        this.lastFireworkTime = 0;
        this.nextFireworkDelay = randomRange(1000, 3000);
    },

    resize(width, height) {
        // Dynamic handling
    },

    triggerBurst(x, y) {
        if (this.fireworks) {
            this.fireworks.push(new FireworkBurst(window.innerWidth, window.innerHeight, x, y));
        }
    },

    update(time, delta, width, height) {
        // Flags
        if (this.flags.length < this.maxFlags) {
            this.flags.push(new WavingFlag(width, height));
        }
        for (let i = 0; i < this.flags.length; i++) {
            this.flags[i].update(time, width, height);
        }
        filterInPlace(this.flags, f => f.active);

        // Kites
        if (this.kites.length < this.maxKites) {
            this.kites.push(new Kite(width, height));
        }
        for (let i = 0; i < this.kites.length; i++) {
            this.kites[i].update(time, width, height);
        }
        filterInPlace(this.kites, k => k.active);

        // Petals
        for (let i = 0; i < this.petals.length; i++) {
            this.petals[i].update(time, width, height);
        }

        // Jets
        if (time - this.lastJetTime > this.nextJetDelay) {
            if (this.jets.length < this.maxJets) {
                this.jets.push(new JetAirshow(width, height));
            }
            this.lastJetTime = time;
            this.nextJetDelay = randomRange(4000, 8000);
        }
        for (let i = 0; i < this.jets.length; i++) {
            this.jets[i].update(width, height);
        }
        filterInPlace(this.jets, j => j.active);

        // Fireworks
        if (time - this.lastFireworkTime > this.nextFireworkDelay) {
            if (this.fireworks.length < this.maxFireworks) {
                this.fireworks.push(new FireworkBurst(width, height));
            }
            this.lastFireworkTime = time;
            this.nextFireworkDelay = randomRange(1500, 4000);
        }
        for (let i = 0; i < this.fireworks.length; i++) {
            this.fireworks[i].update(width, height);
        }
        filterInPlace(this.fireworks, f => f.active);
    },

    draw(ctx, width, height, time) {
        // 1. Ambient Glow
        if (this.showGlow) {
            this.ambient.draw(ctx, width, height, time);
        }

        // 2. Flowing Tricolor Silk Wave
        if (this.showWave && this.silkWave) {
            this.silkWave.draw(ctx, width, height, time, this.waveOpacity);
        }

        // 3. Flower Petals
        for (let i = 0; i < this.petals.length; i++) {
            this.petals[i].draw(ctx);
        }

        // 4. Fluttering Indian Flags
        for (let i = 0; i < this.flags.length; i++) {
            this.flags[i].draw(ctx, time);
        }

        // 5. Kites
        for (let i = 0; i < this.kites.length; i++) {
            this.kites[i].draw(ctx);
        }

        // 6. Airshow Jets
        for (let i = 0; i < this.jets.length; i++) {
            this.jets[i].draw(ctx);
        }

        // 7. Fireworks
        for (let i = 0; i < this.fireworks.length; i++) {
            this.fireworks[i].draw(ctx);
        }
    },

    destroy() {
        this.flags = [];
        this.kites = [];
        this.jets = [];
        this.fireworks = [];
        this.petals = [];
    }
};

default IndependenceDayEvent;


registerEvent(IndependenceDayEvent);

let _activeInstance = null;

function start(options = {}) {
    if (_activeInstance) {
        _activeInstance.stop();
    }
    const opts = Object.assign({}, options, { event: 'independence-day', eventOptions: options });
    _activeInstance = new EventOverlayEngine(opts);
    _activeInstance.start();
    return _activeInstance;
}

function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

function toggle(options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(options);
    }
}

function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}


const IndependenceDayOverlay = {
    version: '1.0.0',
    start,
    stop,
    toggle,
    isRunning,
    IndependenceDayEvent,
    EventOverlayEngine
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
