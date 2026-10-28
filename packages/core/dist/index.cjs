/**
 * 🎆 @event-overlay/core v1.0.5 — CommonJS
 * @license MIT
 */
/**
 * 🎆 @event-overlay/core v1.0.5 — Headless Event Overlay Engine
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
 * @version 1.0.5
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
     * @param {boolean} [options.showControls=true] - Display floating pause/resume control button
     * @param {string} [options.controlPosition='bottom-right'] - Position of controls ('bottom-right'|'bottom-left'|'top-right'|'top-left')
     * @param {boolean} [options.persistPreference=true] - Remember user pause/dismiss choice for current session
     * @param {Function} [options.onToggle] - Callback (paused: boolean) => void
     * @param {Function} [options.onDismiss] - Callback () => void
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
        this.showControls = options.showControls ?? true;
        this.controlPosition = options.controlPosition || 'bottom-right';
        this.persistPreference = options.persistPreference ?? true;
        this.onToggle = typeof options.onToggle === 'function' ? options.onToggle : null;
        this.onDismiss = typeof options.onDismiss === 'function' ? options.onDismiss : null;
        this.eventOptions = options.eventOptions || {};

        this._canvas = null;
        this._ctx = null;
        this._dpr = 1;
        this._animationId = null;
        this._running = false;
        this._paused = false;
        this._tabHidden = false;
        this._dismissed = false;
        this._startTime = 0;
        this._lastTime = 0;
        this._firstFrame = true;
        this._resizeHandler = null;
        this._resizeTimer = null;
        this._visibilityHandler = null;
        this._keyHandler = null;
        this._controlsEl = null;
        this._toggleBtn = null;
        this._controlDot = null;
        this._controlLabel = null;
        this._activeModule = null;

        this._width = 0;
        this._height = 0;
    }

    _getContainer() {
        if (this.containerSelector && typeof document !== 'undefined') {
            return document.querySelector(this.containerSelector) || document.body;
        }
        return typeof document !== 'undefined' ? document.body : null;
    }

    _createCanvas() {
        if (typeof document === 'undefined') return;

        const container = this._getContainer();
        if (!container) return;

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
            `opacity:${this._paused ? 0 : this.opacity}`,
            'transition:opacity 0.25s ease'
        ].join(';');

        container.appendChild(canvas);
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    _getEventIcon() {
        if (this.eventId === 'diwali') return '🪔';
        if (this.eventId === 'holi') return '🎨';
        if (this.eventId === 'independence-day') return '🇮🇳';
        return '🎆';
    }

    _createControls() {
        if (!this.showControls || typeof document === 'undefined') return;
        if (this._controlsEl) return;

        const container = document.createElement('div');
        container.id = `event-overlay-controls-${this._id}`;
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Celebration overlay controls');

        const posStyles = {
            'bottom-right': 'bottom:20px;right:20px;',
            'bottom-left': 'bottom:20px;left:20px;',
            'top-right': 'top:20px;right:20px;',
            'top-left': 'top:20px;left:20px;'
        };
        const posStyle = posStyles[this.controlPosition] || posStyles['bottom-right'];

        container.style.cssText = [
            'position:fixed',
            posStyle,
            `z-index:${this.zIndex + 1}`,
            'display:inline-flex',
            'align-items:center',
            'pointer-events:auto',
            'user-select:none',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
        ].join(';');

        document.body.appendChild(container);
        this._controlsEl = container;

        this._renderControlsContent();

        // Keyboard listener: Escape to toggle pause/resume or un-dismiss
        this._keyHandler = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                this.togglePause();
            }
        };
        window.addEventListener('keydown', this._keyHandler);
    }

    _renderControlsContent() {
        if (!this._controlsEl) return;
        const container = this._controlsEl;
        container.innerHTML = '';

        if (this._dismissed) {
            // Minimized circular launcher button
            const launcher = document.createElement('button');
            launcher.type = 'button';
            launcher.setAttribute('aria-label', 'Show celebration overlay (Press Esc)');
            launcher.title = 'Show celebration overlay (Press Esc)';
            launcher.style.cssText = [
                'width:38px',
                'height:38px',
                'border-radius:50%',
                'background:rgba(15,23,42,0.85)',
                'backdrop-filter:blur(10px)',
                '-webkit-backdrop-filter:blur(10px)',
                'border:1px solid rgba(255,255,255,0.22)',
                'box-shadow:0 4px 18px rgba(0,0,0,0.35)',
                'display:inline-flex',
                'align-items:center',
                'justify-content:center',
                'cursor:pointer',
                'font-size:17px',
                'color:#F8FAFC',
                'transition:transform 0.2s ease, border-color 0.2s ease',
                'outline:none'
            ].join(';');
            launcher.innerHTML = this._getEventIcon();

            launcher.addEventListener('mouseenter', () => {
                launcher.style.transform = 'scale(1.08)';
                launcher.style.borderColor = 'rgba(255,255,255,0.45)';
            });
            launcher.addEventListener('mouseleave', () => {
                launcher.style.transform = 'scale(1)';
                launcher.style.borderColor = 'rgba(255,255,225,0.22)';
            });
            launcher.addEventListener('click', (e) => {
                e.stopPropagation();
                this.undismiss();
            });

            container.appendChild(launcher);
        } else {
            // Expanded pill container
            const pill = document.createElement('div');
            pill.style.cssText = [
                'display:inline-flex',
                'align-items:center',
                'gap:6px',
                'background:rgba(15,23,42,0.85)',
                'backdrop-filter:blur(10px)',
                '-webkit-backdrop-filter:blur(10px)',
                'border:1px solid rgba(255,255,255,0.18)',
                'border-radius:9999px',
                'padding:5px 8px 5px 12px',
                'box-shadow:0 4px 18px rgba(0,0,0,0.3)',
                'color:#F8FAFC',
                'font-size:12px',
                'font-weight:500',
                'transition:opacity 0.2s ease, transform 0.2s ease'
            ].join(';');

            // Status indicator dot
            const dot = document.createElement('span');
            dot.style.cssText = [
                'width:7px',
                'height:7px',
                'border-radius:50%',
                `background:${this._paused ? '#F59E0B' : '#10B981'}`,
                'display:inline-block',
                'transition:background 0.2s ease'
            ].join(';');
            this._controlDot = dot;

            // Toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.setAttribute('aria-pressed', this._paused ? 'true' : 'false');
            toggleBtn.setAttribute('aria-label', this._paused ? 'Resume celebration effects (Press Esc)' : 'Pause celebration effects (Press Esc)');
            toggleBtn.style.cssText = [
                'background:transparent',
                'border:none',
                'color:#F8FAFC',
                'font-family:inherit',
                'font-size:12px',
                'font-weight:600',
                'display:inline-flex',
                'align-items:center',
                'gap:6px',
                'cursor:pointer',
                'padding:2px 4px',
                'outline:none'
            ].join(';');

            const label = document.createElement('span');
            label.textContent = this._paused ? 'Resume' : 'Pause';
            this._controlLabel = label;

            toggleBtn.appendChild(dot);
            toggleBtn.appendChild(label);

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePause();
            });
            this._toggleBtn = toggleBtn;

            // Close / Dismiss button
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Dismiss celebration overlay');
            closeBtn.title = 'Dismiss celebration overlay (Click icon to restore)';
            closeBtn.style.cssText = [
                'background:rgba(255,255,255,0.08)',
                'border:none',
                'color:#94A3B8',
                'font-family:inherit',
                'font-size:13px',
                'line-height:1',
                'width:20px',
                'height:20px',
                'border-radius:50%',
                'display:inline-flex',
                'align-items:center',
                'justify-content:center',
                'cursor:pointer',
                'padding:0',
                'margin-left:2px',
                'transition:color 0.15s ease, background 0.15s ease',
                'outline:none'
            ].join(';');
            closeBtn.innerHTML = '&times;';

            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.color = '#FFFFFF';
                closeBtn.style.background = 'rgba(239,68,68,0.7)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.color = '#94A3B8';
                closeBtn.style.background = 'rgba(255,255,255,0.08)';
            });
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismiss();
            });

            pill.appendChild(toggleBtn);
            pill.appendChild(closeBtn);
            container.appendChild(pill);
        }
    }

    _updateControlsUI() {
        if (!this._controlsEl) return;
        this._renderControlsContent();
    }

    _removeControls() {
        if (this._keyHandler && typeof window !== 'undefined') {
            window.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._controlsEl && this._controlsEl.parentNode) {
            this._controlsEl.parentNode.removeChild(this._controlsEl);
        }
        this._controlsEl = null;
        this._toggleBtn = null;
        this._controlDot = null;
        this._controlLabel = null;
    }

    _setSize() {
        if (typeof window === 'undefined') return;
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._dpr = getSafeDPR();

        if (this._canvas && this._ctx) {
            this._canvas.width = this._width * this._dpr;
            this._canvas.height = this._height * this._dpr;
            this._ctx.setTransform(1, 0, 0, 1, 0, 0);
            this._ctx.scale(this._dpr, this._dpr);
        }

        if (this._activeModule && typeof this._activeModule.resize === 'function') {
            this._activeModule.resize(this._width, this._height);
        }
    }

    _render(time) {
        if (!this._running || this._paused || this._tabHidden) return;

        if (this._firstFrame) {
            this._firstFrame = false;
            this._startTime = time;
            this._lastTime = time;
        }

        const delta = Math.min(64, time - this._lastTime);
        this._lastTime = time;

        if (this.duration > 0 && time - this._startTime > this.duration) {
            this.stop();
            return;
        }

        const ctx = this._ctx;
        const w = this._width;
        const h = this._height;

        if (ctx) {
            ctx.clearRect(0, 0, w, h);

            if (this._activeModule) {
                if (typeof this._activeModule.update === 'function') {
                    this._activeModule.update(time, delta, w, h);
                }
                if (typeof this._activeModule.draw === 'function') {
                    this._activeModule.draw(ctx, w, h, time);
                }
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
        if (this._running) {
            if (this._dismissed) {
                return this.undismiss();
            }
            if (this._paused) {
                return this.resume();
            }
            return this;
        }

        // Check if user previously dismissed or paused overlay in this session
        if (this.persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                if (sessionStorage.getItem('event_overlay_dismissed') === 'true') {
                    this._dismissed = true;
                    this._paused = true;
                } else if (sessionStorage.getItem('event_overlay_paused') === 'true') {
                    this._paused = true;
                }
            } catch (e) {}
        }

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
        this._width = typeof window !== 'undefined' ? window.innerWidth : 1920;
        this._height = typeof window !== 'undefined' ? window.innerHeight : 1080;
        this._dpr = getSafeDPR();

        if (this._activeModule && typeof this._activeModule.init === 'function' && this._ctx) {
            this._activeModule.init(this._ctx, this._width, this._height, this.eventOptions);
        }

        this._setSize();
        this._createControls();

        if (typeof window !== 'undefined') {
            // Debounced resize handler
            this._resizeHandler = () => {
                clearTimeout(this._resizeTimer);
                this._resizeTimer = setTimeout(() => this._setSize(), 100);
            };
            window.addEventListener('resize', this._resizeHandler);
        }

        if (typeof document !== 'undefined') {
            // Visibility Change listener — pauses canvas loop in inactive tabs to save CPU & battery
            this._visibilityHandler = () => {
                if (document.hidden) {
                    this._tabHidden = true;
                    if (this._animationId) {
                        cancelAnimationFrame(this._animationId);
                        this._animationId = null;
                    }
                } else {
                    this._tabHidden = false;
                    // Resume only if running and not user-paused
                    if (this._running && !this._paused) {
                        this._firstFrame = true;
                        this._lastTime = performance.now();
                        if (!this._animationId) {
                            this._animationId = requestAnimationFrame((t) => this._render(t));
                        }
                    }
                }
            };
            document.addEventListener('visibilitychange', this._visibilityHandler);
        }

        this._running = true;
        this._tabHidden = false;
        this._firstFrame = true;

        if (!this._paused) {
            this._animationId = requestAnimationFrame((t) => this._render(t));
        }

        return this;
    }

    /**
     * Pause overlay animation loop.
     * @returns {EventOverlayEngine}
     */
    pause() {
        if (!this._running) return this;
        this._paused = true;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        if (this._canvas) {
            this._canvas.style.opacity = '0';
        }

        this._updateControlsUI();

        if (this.persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.setItem('event_overlay_paused', 'true');
            } catch (e) {}
        }

        if (typeof this.onToggle === 'function') {
            this.onToggle(true);
        }

        return this;
    }

    /**
     * Resume overlay animation loop.
     * @returns {EventOverlayEngine}
     */
    resume() {
        this._dismissed = false;
        if (!this._running) {
            return this.start();
        }

        this._paused = false;
        this._firstFrame = true;
        this._lastTime = performance.now();

        if (this._canvas) {
            this._canvas.style.opacity = `${this.opacity}`;
        }

        this._updateControlsUI();

        if (this.persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.removeItem('event_overlay_paused');
            } catch (e) {}
        }

        if (typeof this.onToggle === 'function') {
            this.onToggle(false);
        }

        if (!this._animationId && !this._tabHidden) {
            this._animationId = requestAnimationFrame((t) => this._render(t));
        }

        return this;
    }

    /**
     * Toggle pause / resume state.
     * @returns {EventOverlayEngine}
     */
    togglePause() {
        if (this._dismissed) {
            return this.undismiss();
        }
        return this._paused ? this.resume() : this.pause();
    }

    /**
     * Check if overlay is paused.
     * @returns {boolean}
     */
    isPaused() {
        return this._paused;
    }

    /**
     * Dismiss overlay to minimal launcher badge.
     * @returns {EventOverlayEngine}
     */
    dismiss() {
        this._dismissed = true;
        this._paused = true;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        if (this._canvas) {
            this._canvas.style.opacity = '0';
        }

        if (this.persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.setItem('event_overlay_dismissed', 'true');
            } catch (e) {}
        }

        if (typeof this.onDismiss === 'function') {
            this.onDismiss();
        }
        if (typeof this.onToggle === 'function') {
            this.onToggle(true);
        }

        this._updateControlsUI();
        return this;
    }

    /**
     * Restore overlay from dismissed state.
     * @returns {EventOverlayEngine}
     */
    undismiss() {
        this._dismissed = false;
        if (this.persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.removeItem('event_overlay_dismissed');
            } catch (e) {}
        }
        this.resume();
        return this;
    }

    /**
     * Check if overlay is dismissed.
     * @returns {boolean}
     */
    isDismissed() {
        return this._dismissed;
    }

    /**
     * Stop and cleanup the overlay.
     * @returns {EventOverlayEngine}
     */
    stop() {
        this._running = false;
        this._paused = false;
        this._tabHidden = false;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
        if (this._resizeTimer) {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
        }
        if (this._resizeHandler && typeof window !== 'undefined') {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        if (this._visibilityHandler && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }

        this._removeControls();

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


let _activeInstance = null;

function create(options = {}) {
    return new EventOverlayEngine(options);
}

function start(eventName, options = {}) {
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

function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

function dismiss() {
    if (_activeInstance) {
        _activeInstance.dismiss();
    }
}

function undismiss() {
    if (_activeInstance) {
        _activeInstance.undismiss();
    }
}

function toggle(eventName, options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(eventName, options);
    }
}

function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}


const EventOverlay = {
    version: '1.0.5',
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
