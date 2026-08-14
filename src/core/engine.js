/**
 * 🎆 Event Overlay Engine — Core Kernel (Optimized)
 * Framework-agnostic, zero-dependency HTML5 Canvas engine for plug-and-play event animations.
 *
 * @module event-overlay/engine
 * @version 1.0.0
 * @license MIT
 */

import { getSafeDPR, prefersReducedMotion } from './utils.js';

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
export function registerEvent(module) {
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
export function getRegisteredEvent(id) {
    return registeredEvents.get(id);
}

/**
 * List all registered event IDs.
 * @returns {string[]}
 */
export function getRegisteredEventIds() {
    return Array.from(registeredEvents.keys());
}

let instanceCounter = 0;

/**
 * Controller class that manages canvas creation, animation loop, HiDPI scaling, and active event rendering.
 */
export class EventOverlayEngine {
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
