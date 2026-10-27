/**
 * 🪔 @event-overlay/diwali v1.0.0
 * @license MIT
 */

// ─── UTILS ───
${utilsClean}

// ─── CORE ENGINE ───
${engineClean}

// ─── DIWALI EVENT ───
${diwaliClean}

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
    version: '1.0.0',
    start,
    stop,
    toggle,
    isRunning,
    DiwaliEvent,
    DIWALI_COLORS,
    EventOverlayEngine
};

export default DiwaliOverlay;
