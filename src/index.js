/**
 * 🎆 Event Overlay — Framework-agnostic pluggable event overlay engine
 *
 * @module event-overlay
 * @version 1.0.0
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

// Auto-register built-in event modules
registerEvent(IndependenceDayEvent);
registerEvent(HoliEvent);

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
    HoliEvent
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
