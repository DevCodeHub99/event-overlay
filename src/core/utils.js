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
export function filterInPlace(arr, predicate) {
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
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Safe calculation of devicePixelRatio capped at 2 to avoid memory blowup on 3x/4x screens.
 * @returns {number}
 */
export function getSafeDPR() {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Detect user's reduced motion OS preference for accessibility (WCAG 2.3.3).
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Step particle physics in-place (velocity integration with friction and gravity).
 * @param {Object} p - Particle with x, y, vx, vy, life
 * @param {number} gravity
 * @param {number} friction
 */
export function stepParticle(p, gravity, friction) {
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
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Linear interpolation between a and b.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Convert hex color string to RGB object.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
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
export function rgbToString(c, alpha = 1) {
    return `rgba(${c.r},${c.g},${c.b},${clamp(alpha, 0, 1)})`;
}
