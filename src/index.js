/**
 * 🎆 Event Overlay — Framework-agnostic pluggable event overlay engine
 *
 * @module event-overlay
 * @version 1.0.5
 * @license MIT
 */

import {
    EventOverlayEngine,
    registerEvent,
    getRegisteredEvent,
    getRegisteredEventIds
} from './core/engine.js';
import { IndependenceDayEvent } from './events/independence-day.js';
import { HoliEvent } from './events/holi.js';
import { DiwaliEvent } from './events/diwali.js';

// Auto-register built-in event modules
registerEvent(IndependenceDayEvent);
registerEvent(HoliEvent);
registerEvent(DiwaliEvent);

// Singleton active instance pointer
let _activeInstance = null;

/**
 * Start an event overlay animation.
 * @param {string|Object} [eventName='independence-day'] - Registered event module ID or options object
 * @param {Object} [options] - Configuration options
 * @returns {EventOverlayEngine}
 */
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

/**
 * Stop the current active event overlay.
 */
export function stop() {
    if (_activeInstance) {
        _activeInstance.stop();
        _activeInstance = null;
    }
}

/**
 * Pause the current active event overlay.
 */
export function pause() {
    if (_activeInstance) {
        _activeInstance.pause();
    }
}

/**
 * Resume the current active event overlay.
 */
export function resume() {
    if (_activeInstance) {
        _activeInstance.resume();
    }
}

/**
 * Toggle pause state of the current active event overlay.
 */
export function togglePause() {
    if (_activeInstance) {
        _activeInstance.togglePause();
    }
}

/**
 * Check if the active overlay is paused.
 * @returns {boolean}
 */
export function isPaused() {
    return _activeInstance ? _activeInstance.isPaused() : false;
}

/**
 * Dismiss the current active event overlay for the session.
 */
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

/**
 * Toggle the current active event overlay on/off.
 * @param {string|Object} [eventName='independence-day']
 * @param {Object} [options]
 */
export function toggle(eventName = 'independence-day', options = {}) {
    if (_activeInstance && _activeInstance.isRunning()) {
        stop();
    } else {
        start(eventName, options);
    }
}

/**
 * Check if an overlay is currently active.
 * @returns {boolean}
 */
export function isRunning() {
    return _activeInstance ? _activeInstance.isRunning() : false;
}

/**
 * Create a new EventOverlayEngine instance without starting it immediately.
 * @param {Object} [options]
 * @returns {EventOverlayEngine}
 */
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
    DiwaliEvent
};

const EventOverlay = {
    version: '1.0.5',
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
