/**
 * 🪔 @event-overlay/diwali v1.0.0
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
 * Detect user's reduced motion OS preference for accessibility (WCAG 2.3.3).
 * @returns {boolean}
 */
function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Step particle physics in-place (velocity integration with friction and gravity).
 * @param {Object} p - Particle with x, y, vx, vy, life
 * @param {number} gravity
 * @param {number} friction
 */
function stepParticle(p, gravity, friction) {
    p.vx *= friction;
    p.vy = (p.vy + gravity) * friction;
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
}

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Linear interpolation between a and b.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Convert hex color string to RGB object.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

/**
 * Format RGBA color string with clamped alpha.
 * @param {{ r: number, g: number, b: number }} c
 * @param {number} alpha
 * @returns {string}
 */
function rgbToString(c, alpha = 1) {
    return `rgba(${c.r},${c.g},${c.b},${clamp(alpha, 0, 1)})`;
}


// ─── CORE ENGINE ───
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

        // Screen reader announcement region (WCAG 4.1.2 & 4.1.3)
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        container.appendChild(liveRegion);
        this._liveRegion = liveRegion;

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

    _announce(message) {
        if (this._liveRegion) {
            this._liveRegion.textContent = message;
        }
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
            launcher.addEventListener('focus', () => {
                launcher.style.outline = '2px solid #38BDF8';
                launcher.style.outlineOffset = '2px';
            });
            launcher.addEventListener('blur', () => {
                launcher.style.outline = 'none';
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
            toggleBtn.addEventListener('focus', () => {
                toggleBtn.style.outline = '2px solid #38BDF8';
                toggleBtn.style.outlineOffset = '2px';
                toggleBtn.style.borderRadius = '4px';
            });
            toggleBtn.addEventListener('blur', () => {
                toggleBtn.style.outline = 'none';
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

        // Check reduced motion preference (WCAG 2.3.3)
        if (this.respectReducedMotion && prefersReducedMotion()) {
            this.opacity = Math.min(this.opacity, 0.4);
            this.eventOptions = {
                ...this.eventOptions,
                maxJets: 0,
                maxFireworks: 0,
                maxKites: 2,
                enableFireworks: false,
                enableSpinners: false,
                maxBalloons: 3,
                maxPichkaaris: 1,
                reducedMotion: true
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
        this._announce('Celebration overlay paused');

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
        this._announce('Celebration overlay resumed');
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
        this._announce('Celebration overlay minimized');

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


// ─── DIWALI EVENT ───
/**
 * 🪔 Diwali Festival of Lights Event Module for Event Overlay
 * Features:
 *  - Grand Aerial Fireworks (Peony, Willow, Crackling Chrysanthemum)
 *  - Traditional Anar (Golden Fountain / Flowerpot)
 *  - Chakri (Ground Spinner) emitting spiral spark vortexes
 *  - Floating & Bottom Diyas (Clay lamps with organic flickering flame and warm glow)
 *  - Akash Kandil (Sky Lanterns drifting upward with gentle wind sway)
 *  - Phuljhadi (Interactive Sparkler cursor emitting starburst sparks)
 *  - Ambient golden embers and festive atmospheric glow
 *
 * @module event-overlay/events/diwali
 */



const DIWALI_COLORS = [
    { r: 255, g: 215, b: 0 },   // Royal Gold
    { r: 255, g: 140, b: 0 },   // Deep Amber / Orange
    { r: 255, g: 69, b: 0 },    // Saffron Fire
    { r: 255, g: 45, b: 85 },   // Festive Crimson Pink
    { r: 0, g: 230, b: 118 },   // Emerald Green
    { r: 0, g: 229, b: 255 },   // Electric Cyan
    { r: 179, g: 136, b: 255 }, // Royal Purple
    { r: 255, g: 248, b: 220 }  // Sparkling White-Yellow
];

const MAX_SPARKS = 850;
const MAX_DIYA_FLAMES = 25;
const MAX_SKY_LANTERNS = 12;

// ─── PARTICLE (Sparks, Embers, Crackles) ───
class SparkParticle {
    constructor(x, y, color, vx, vy, options = {}) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.color = color || DIWALI_COLORS[0];
        this.vx = vx ?? (Math.random() - 0.5) * 8;
        this.vy = vy ?? (Math.random() - 0.5) * 8;
        this.gravity = options.gravity ?? 0.18;
        this.friction = options.friction ?? 0.96;
        this.size = options.size ?? randomRange(1.5, 3.8);
        this.life = 0;
        this.maxLife = options.maxLife ?? randomRange(30, 65);
        this.flicker = options.flicker ?? (Math.random() > 0.4);
        this.trail = options.trail ?? false;
    }

    update() {
        if (this.trail) {
            this.prevX = this.x;
            this.prevY = this.y;
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
    }

    draw(ctx) {
        const fade = Math.max(0, 1 - this.life / this.maxLife);
        if (fade <= 0) return;

        let alpha = fade;
        if (this.flicker) {
            // Clamped flicker to avoid violent strobe (WCAG 2.3.1 photosensitive safety)
            alpha *= (0.55 + Math.random() * 0.45);
        }

        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;

        // Draw motion streak trail without heap allocations
        if (this.trail) {
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha * 0.45})`;
            ctx.lineWidth = Math.max(0.5, this.size * 0.7);
            ctx.stroke();
        }

        // Draw spark core
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.6, this.size * fade), 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── ROCKET (Aerial Firework Launcher) ───
class Rocket {
    constructor(targetX, targetY, startX, startY, color) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color || DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy);
        const speed = randomRange(13, 19);

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.life = 0;
        this.maxLife = Math.max(15, Math.floor(dist / speed));
        this.exploded = false;
        this.sparkTimer = 0;
    }

    update(sparks) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // slight deceleration
        this.life++;

        // Rocket ascent exhaust trail
        if (sparks.length < MAX_SPARKS && Math.random() > 0.2) {
            sparks.push(new SparkParticle(
                this.x + (Math.random() - 0.5) * 4,
                this.y + (Math.random() - 0.5) * 4,
                { r: 255, g: 200, b: 100 },
                -this.vx * 0.15 + (Math.random() - 0.5) * 1.5,
                -this.vy * 0.15 + (Math.random() - 0.5) * 1.5,
                { size: randomRange(1.2, 2.5), maxLife: randomRange(12, 24), gravity: 0.1 }
            ));
        }

        if (this.life >= this.maxLife || this.y <= this.targetY) {
            this.explode(sparks);
            this.exploded = true;
        }
    }

    explode(sparks) {
        const burstType = Math.random();
        const burstCount = Math.floor(randomRange(55, 90));
        const color = this.color;
        const secondaryColor = DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];

        if (burstType < 0.45) {
            // 1. Classic Peony / Chrysanthemum (Spherical burst with crackle)
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.3;
                const speed = randomRange(3.5, 9.5);
                const col = Math.random() > 0.3 ? color : secondaryColor;
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    col,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    {
                        size: randomRange(2.0, 3.8),
                        maxLife: randomRange(40, 75),
                        gravity: 0.12,
                        friction: 0.94,
                        flicker: true,
                        trail: true
                    }
                ));
            }
        } else if (burstType < 0.75) {
            // 2. Willow / Kamuro (Heavy gold drooping waterfall trail)
            const willowColor = { r: 255, g: 220, b: 120 };
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = Math.random() * Math.PI * 2;
                const speed = randomRange(2.0, 7.5);
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    willowColor,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed * 0.8,
                    {
                        size: randomRange(2.2, 4.0),
                        maxLife: randomRange(60, 100),
                        gravity: 0.22,
                        friction: 0.92,
                        flicker: true,
                        trail: true
                    }
                ));
            }
        } else {
            // 3. Ring / Starburst
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = (Math.PI * 2 * i) / burstCount;
                const speed = randomRange(6.0, 8.5);
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    secondaryColor,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    {
                        size: randomRange(1.8, 3.2),
                        maxLife: randomRange(35, 60),
                        gravity: 0.08,
                        friction: 0.96,
                        flicker: false,
                        trail: false
                    }
                ));
            }
        }
    }

    draw(ctx) {
        if (this.exploded) return;
        ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── ANAR (Fountain / Flowerpot Cracker) ───
class AnarFountain {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.colors = colors || DIWALI_COLORS;
        this.active = true;
        this.life = 0;
        this.maxLife = randomRange(220, 360);
    }

    update(sparks) {
        this.life++;
        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        // Height curve: starts small, surges, then gently dies down
        const progress = this.life / this.maxLife;
        const intensity = Math.sin(progress * Math.PI);
        const particlesToEmit = Math.floor(randomRange(4, 9) * intensity);

        for (let i = 0; i < particlesToEmit; i++) {
            if (sparks.length >= MAX_SPARKS) break;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const spreadX = (Math.random() - 0.5) * 4.5;
            const shootSpeed = -randomRange(10, 22) * intensity;
            
            sparks.push(new SparkParticle(
                this.x + (Math.random() - 0.5) * 8,
                this.y - 10,
                color,
                spreadX,
                shootSpeed,
                {
                    size: randomRange(1.5, 3.5),
                    maxLife: randomRange(35, 65),
                    gravity: 0.38,
                    friction: 0.97,
                    flicker: true,
                    trail: false
                }
            ));
        }
    }

    draw(ctx) {
        // Draw decorative clay cone for Anar at the base
        const w = 26;
        const h = 34;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Cone body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Golden rim bands
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tip glow
        const glow = ctx.createRadialGradient(0, -h, 2, 0, -h, 18);
        glow.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
        glow.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -h, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ─── CHAKRI (Ground Spinner) ───
class ChakriSpinner {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.colors = colors || DIWALI_COLORS;
        this.angle = 0;
        this.speed = randomRange(0.25, 0.45);
        this.life = 0;
        this.maxLife = randomRange(200, 320);
        this.active = true;
    }

    update(sparks) {
        this.life++;
        this.angle += this.speed;

        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        // Emit spiral tangential sparks
        const arms = 3;
        for (let a = 0; a < arms; a++) {
            if (sparks.length >= MAX_SPARKS) break;
            const currentAngle = this.angle + (Math.PI * 2 * a) / arms;
            const tangent = currentAngle + Math.PI / 2;
            const tangentialSpeed = randomRange(4.5, 9.5);
            const color = this.colors[a % this.colors.length];

            const spawnDist = 14;
            const sx = this.x + Math.cos(currentAngle) * spawnDist;
            const sy = this.y + Math.sin(currentAngle) * spawnDist;

            sparks.push(new SparkParticle(
                sx,
                sy,
                color,
                Math.cos(tangent) * tangentialSpeed,
                Math.sin(tangent) * tangentialSpeed,
                {
                    size: randomRange(1.8, 3.4),
                    maxLife: randomRange(25, 45),
                    gravity: 0.15,
                    friction: 0.95,
                    flicker: true,
                    trail: true
                }
            ));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Center hub
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

// ─── DIYA (Clay Lamp with Flickering Flame) ───
class DiyaLamp {
    constructor(x, y, scale = 1.0) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.flickerPhase = Math.random() * Math.PI * 2;
        this.flickerSpeed = randomRange(0.08, 0.16);
    }

    draw(ctx, time) {
        const s = this.scale;
        const x = this.x;
        const y = this.y;

        this.flickerPhase += this.flickerSpeed;
        const flameFlutter = Math.sin(this.flickerPhase) * 1.5 + (Math.random() - 0.5) * 1.0;
        const flameHeight = (18 + Math.sin(time * 0.006 + this.flickerPhase) * 3) * s;

        ctx.save();
        ctx.translate(x, y);

        // 1. Ambient Warm Glow
        const glowRadius = (45 + Math.sin(this.flickerPhase) * 6) * s;
        const glow = ctx.createRadialGradient(0, -flameHeight * 0.5, 3 * s, 0, -flameHeight * 0.5, glowRadius);
        glow.addColorStop(0, 'rgba(255, 200, 50, 0.45)');
        glow.addColorStop(0.5, 'rgba(255, 120, 20, 0.15)');
        glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -flameHeight * 0.5, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Terracotta Clay Bowl
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 10 * s, 0, 0, Math.PI);
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2 * s;
        ctx.stroke();

        // Diya rim
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#CD853F';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 3. Flame
        // Outer Orange Flame
        ctx.beginPath();
        ctx.moveTo(-5 * s, 0);
        ctx.quadraticCurveTo(-6 * s, -flameHeight * 0.6, flameFlutter, -flameHeight);
        ctx.quadraticCurveTo(6 * s, -flameHeight * 0.6, 5 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FF4500';
        ctx.fill();

        // Inner Golden Yellow Flame
        ctx.beginPath();
        ctx.moveTo(-3 * s, 0);
        ctx.quadraticCurveTo(-3.5 * s, -flameHeight * 0.5, flameFlutter * 0.7, -flameHeight * 0.85);
        ctx.quadraticCurveTo(3.5 * s, -flameHeight * 0.5, 3 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        // Core White-Hot Wick
        ctx.beginPath();
        ctx.ellipse(0, -2 * s, 1.8 * s, 3.5 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
    }
}

// ─── AKASH KANDIL (Sky Lantern) ───
class SkyLantern {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = randomRange(width * 0.08, width * 0.92);
        this.y = height + randomRange(20, 100);
        this.speedY = randomRange(0.65, 1.35);
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = randomRange(0.015, 0.03);
        this.size = randomRange(16, 26);
        this.color = Math.random() > 0.4 ? { r: 255, g: 140, b: 0 } : { r: 255, g: 45, b: 85 };
        this.active = true;
    }

    update() {
        this.y -= this.speedY;
        this.swayAngle += this.swaySpeed;
        this.x += Math.sin(this.swayAngle) * 0.65;

        if (this.y < -60) {
            this.active = false;
        }
    }

    draw(ctx) {
        const w = this.size;
        const h = this.size * 1.35;
        const x = this.x;
        const y = this.y;

        ctx.save();
        ctx.translate(x, y);

        // Lantern Ambient Glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 1.6);
        glow.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.65)`);
        glow.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, w * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Paper Body (Trapezoid / rounded rectangle)
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.55, h * 0.5);
        ctx.lineTo(-w * 0.55, h * 0.5);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
        bodyGrad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.88)`);
        bodyGrad.addColorStop(1, 'rgba(255, 230, 140, 0.95)');
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Bamboo rim
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner glowing flame
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, h * 0.35, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ─── DIWALI EVENT ENGINE MODULE ───
const DiwaliEvent = {
    id: 'diwali',
    name: 'Diwali Festival of Lights',

    init(engine, options = {}) {
        this.engine = engine;
        this.options = options;
        this.sparks = [];
        this.rockets = [];
        this.fountains = [];
        this.spinners = [];
        this.diyas = [];
        this.skyLanterns = [];

        // Configuration
        this.colors = options.colors || DIWALI_COLORS;
        this.enableFireworks = options.enableFireworks !== false;
        this.enableDiyas = options.enableDiyas !== false;
        this.enableFountains = options.enableFountains !== false;
        this.enableSpinners = options.enableSpinners !== false;
        this.enableLanterns = options.enableLanterns !== false;
        this.sparklerCursor = options.sparklerCursor !== false;

        // Timers
        this.lastRocketTime = 0;
        this.nextRocketDelay = randomRange(500, 1400);
        this.lastFountainTime = 0;
        this.nextFountainDelay = randomRange(3500, 6000);
        this.lastSpinnerTime = 0;
        this.nextSpinnerDelay = randomRange(4500, 8000);
        this.lastLanternTime = 0;
        this.nextLanternDelay = randomRange(1200, 3000);

        // Pointer tracking for interactive Phuljhadi (Sparkler)
        this.lastPointer = null;
        this.handlePointerMove = (e) => {
            if (!this.sparklerCursor) return;
            const x = e.clientX;
            const y = e.clientY;
            this.emitSparkler(x, y);
            this.lastPointer = { x, y };
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        }
    },

    resize(width, height) {
        const w = width || (typeof window !== 'undefined' ? window.innerWidth : 1200);
        const h = height || (typeof window !== 'undefined' ? window.innerHeight : 800);

        // Build bottom diya garland
        if (this.enableDiyas) {
            this.diyas = [];
            const diyaCount = Math.min(MAX_DIYA_FLAMES, Math.max(5, Math.floor(w / 80)));
            const step = w / diyaCount;
            for (let i = 0; i < diyaCount; i++) {
                const x = step * i + step * 0.5 + (Math.random() - 0.5) * 12;
                const y = h - 16;
                this.diyas.push(new DiyaLamp(x, y, 0.85 + Math.random() * 0.25));
            }
        }
    },

    emitSparkler(x, y) {
        if (this.sparks.length >= MAX_SPARKS) return;
        const sparkCount = Math.floor(randomRange(2, 5));
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = randomRange(1.8, 5.5);
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.sparks.push(new SparkParticle(
                x,
                y,
                color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                {
                    size: randomRange(1.5, 3.2),
                    maxLife: randomRange(18, 38),
                    gravity: 0.12,
                    friction: 0.94,
                    flicker: true,
                    trail: false
                }
            ));
        }
    },

    triggerBurst(x, y) {
        // Direct tap/click triggers instant aerial burst + launches rocket
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const burstCount = Math.floor(randomRange(60, 95));

        for (let i = 0; i < burstCount; i++) {
            if (this.sparks.length >= MAX_SPARKS) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = randomRange(2.5, 9.0);
            this.sparks.push(new SparkParticle(
                x,
                y,
                color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                {
                    size: randomRange(2.0, 4.0),
                    maxLife: randomRange(35, 75),
                    gravity: 0.15,
                    friction: 0.93,
                    flicker: true,
                    trail: true
                }
            ));
        }
    },

    update(time, delta, width, height) {
        const w = width;
        const h = height;

        // 1. Spawning Sky Rockets
        if (this.enableFireworks && time - this.lastRocketTime > this.nextRocketDelay) {
            const targetX = randomRange(w * 0.15, w * 0.85);
            const targetY = randomRange(h * 0.12, h * 0.52);
            const startX = randomRange(w * 0.25, w * 0.75);
            const startY = h + 10;
            this.rockets.push(new Rocket(targetX, targetY, startX, startY));
            this.lastRocketTime = time;
            this.nextRocketDelay = randomRange(600, 1600);
        }

        // 2. Spawning Anar Fountains (Bottom left & right)
        if (this.enableFountains && time - this.lastFountainTime > this.nextFountainDelay) {
            const isLeft = Math.random() > 0.5;
            const fx = isLeft ? randomRange(w * 0.08, w * 0.25) : randomRange(w * 0.75, w * 0.92);
            this.fountains.push(new AnarFountain(fx, h - 18, this.colors));
            this.lastFountainTime = time;
            this.nextFountainDelay = randomRange(3500, 7000);
        }

        // 3. Spawning Chakri Ground Spinners
        if (this.enableSpinners && time - this.lastSpinnerTime > this.nextSpinnerDelay) {
            const cx = randomRange(w * 0.2, w * 0.8);
            this.spinners.push(new ChakriSpinner(cx, h - 30, this.colors));
            this.lastSpinnerTime = time;
            this.nextSpinnerDelay = randomRange(5000, 9500);
        }

        // 4. Spawning Sky Lanterns
        if (this.enableLanterns && time - this.lastLanternTime > this.nextLanternDelay) {
            if (this.skyLanterns.length < MAX_SKY_LANTERNS) {
                this.skyLanterns.push(new SkyLantern(w, h));
            }
            this.lastLanternTime = time;
            this.nextLanternDelay = randomRange(1400, 3200);
        }

        // Update Rockets
        for (let i = 0; i < this.rockets.length; i++) {
            this.rockets[i].update(this.sparks);
        }
        filterInPlace(this.rockets, (r) => !r.exploded);

        // Update Fountains
        for (let i = 0; i < this.fountains.length; i++) {
            this.fountains[i].update(this.sparks);
        }
        filterInPlace(this.fountains, (f) => f.active);

        // Update Spinners
        for (let i = 0; i < this.spinners.length; i++) {
            this.spinners[i].update(this.sparks);
        }
        filterInPlace(this.spinners, (s) => s.active);

        // Update Sky Lanterns
        for (let i = 0; i < this.skyLanterns.length; i++) {
            this.skyLanterns[i].update();
        }
        filterInPlace(this.skyLanterns, (l) => l.active);

        // Update Sparks
        for (let i = 0; i < this.sparks.length; i++) {
            this.sparks[i].update();
        }
        filterInPlace(this.sparks, (p) => p.life < p.maxLife);
    },

    draw(ctx, width, height, time) {
        // 1. Draw Sky Lanterns (soft floating lights)
        if (this.enableLanterns) {
            for (let i = 0; i < this.skyLanterns.length; i++) {
                this.skyLanterns[i].draw(ctx);
            }
        }

        // 2. Draw Fountains cones
        for (let i = 0; i < this.fountains.length; i++) {
            this.fountains[i].draw(ctx);
        }

        // 3. Draw Spinners hub
        for (let i = 0; i < this.spinners.length; i++) {
            this.spinners[i].draw(ctx);
        }

        // 4. Draw Rockets ascending heads
        for (let i = 0; i < this.rockets.length; i++) {
            this.rockets[i].draw(ctx);
        }

        // 5. Draw All Sparks with Additive Blending for Intense Brilliant Glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.sparks.length; i++) {
            this.sparks[i].draw(ctx);
        }
        ctx.restore();

        // 6. Draw Bottom Garland of Diyas
        if (this.enableDiyas) {
            for (let i = 0; i < this.diyas.length; i++) {
                this.diyas[i].draw(ctx, time);
            }
        }
    },

    destroy() {
        if (typeof window !== 'undefined' && this.handlePointerMove) {
            window.removeEventListener('pointermove', this.handlePointerMove);
        }
        this.sparks = [];
        this.rockets = [];
        this.fountains = [];
        this.spinners = [];
        this.diyas = [];
        this.skyLanterns = [];
    }
};




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
