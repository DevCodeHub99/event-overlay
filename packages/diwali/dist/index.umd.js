/**
 * 🪔 @event-overlay/diwali v1.0.0 — Standalone UMD
 * @license MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DiwaliOverlay = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

${umdDiwaliCore}

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
                DiwaliOverlay.start(opts);
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _init);
            } else {
                _init();
            }
        }
    }

    return DiwaliOverlay;
}));
