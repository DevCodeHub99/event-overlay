/**
 * 🎨 @event-overlay/holi v1.0.0
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


// ─── HOLI EVENT ───
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
