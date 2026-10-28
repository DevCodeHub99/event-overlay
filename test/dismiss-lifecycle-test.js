/**
 * Simulation test for Pause, Dismiss (✕), Launcher badge, and Page Restart lifecycle
 */
import assert from 'node:assert';

// Lightweight in-memory DOM mock
class MockElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.id = '';
        this.attributes = {};
        this.style = {};
        this.children = [];
        this.parentNode = null;
        this._html = '';
        this._listeners = {};
    }

    get innerHTML() { return this._html || ''; }
    set innerHTML(val) {
        this._html = val;
        if (val === '') this.children = [];
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    removeAttribute(k) { delete this.attributes[k]; }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
        return child;
    }

    addEventListener(event, fn) {
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(l => l !== fn);
    }

    click() {
        if (this._listeners['click']) {
            this._listeners['click'].forEach(fn => fn({ stopPropagation: () => {} }));
        }
    }

    querySelector(selector) {
        if (selector === 'button') {
            const findBtn = (el) => {
                for (const c of el.children) {
                    if (c.tagName === 'BUTTON') return c;
                    const nested = findBtn(c);
                    if (nested) return nested;
                }
                return null;
            };
            return findBtn(this);
        }
        return null;
    }

    getContext() {
        return {
            setTransform: () => {},
            scale: () => {},
            clearRect: () => {},
            save: () => {},
            restore: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {}
        };
    }
}

const mockBody = new MockElement('BODY');
const sessionStorageStore = {};

global.window = {
    innerWidth: 1920,
    innerHeight: 1080,
    devicePixelRatio: 1,
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.document = {
    body: mockBody,
    createElement: (tag) => new MockElement(tag),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: (sel) => {
        if (sel === '[role="region"]') {
            return mockBody.children.find(c => c.getAttribute('role') === 'region') || null;
        }
        return null;
    }
};

global.sessionStorage = {
    getItem: (k) => sessionStorageStore[k] || null,
    setItem: (k, v) => { sessionStorageStore[k] = String(v); },
    removeItem: (k) => { delete sessionStorageStore[k]; }
};

global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.performance = { now: () => Date.now() };

// Import core engine
const { EventOverlayEngine, registerEvent } = await import('../src/core/engine.js');
const { DiwaliEvent } = await import('../src/events/diwali.js');
registerEvent(DiwaliEvent);

console.log('🧪 Starting Dismiss & Restart Lifecycle Test...');

// Test 1: Start -> Pause -> Verify
console.log('Step 1: Starting Diwali overlay');
const engine = new EventOverlayEngine({
    event: 'diwali',
    showControls: true,
    persistPreference: true
});
engine.start();

assert.strictEqual(engine.isRunning(), true, 'Engine should be running');
assert.strictEqual(engine.isPaused(), false, 'Engine should not be paused');
assert.strictEqual(engine.isDismissed(), false, 'Engine should not be dismissed');

console.log('Step 2: Pausing overlay');
engine.pause();
assert.strictEqual(engine.isPaused(), true, 'Engine should be paused');
assert.strictEqual(engine.isRunning(), false, 'isRunning should be false when paused');

// Test 2: Dismiss (Click ✕)
console.log('Step 3: Dismissing overlay (clicking ✕)');
engine.dismiss();
assert.strictEqual(engine.isDismissed(), true, 'Engine should be dismissed');
assert.strictEqual(sessionStorage.getItem('event_overlay_dismissed'), 'true', 'sessionStorage should remember dismissed state');

// Verify launcher button is rendered in DOM
const controlsEl = document.querySelector('[role="region"]');
assert(controlsEl, 'Controls container should exist in DOM');
const launcherBtn = controlsEl.querySelector('button');
assert(launcherBtn, 'Launcher button should exist');
assert(launcherBtn.innerHTML.includes('🪔'), 'Launcher button should contain Diwali lamp icon');
console.log('✅ Launcher badge [ 🪔 ] is present in DOM');

// Test 3: Restart engine when in dismissed state
console.log('Step 4: Calling engine.start() while dismissed');
engine.start();
assert.strictEqual(engine.isDismissed(), false, 'Calling start() should undismiss');
assert.strictEqual(engine.isPaused(), false, 'Calling start() should resume');
assert.strictEqual(sessionStorage.getItem('event_overlay_dismissed'), null, 'sessionStorage flag should be cleared');
console.log('✅ Calling start() successfully undismissed and resumed');

// Test 4: Dismiss again and simulate fresh page load with stored sessionStorage
console.log('Step 5: Simulating page refresh while dismissed');
engine.dismiss();
assert.strictEqual(sessionStorage.getItem('event_overlay_dismissed'), 'true');
engine.stop();

// New engine instance (like fresh page load)
const freshEngine = new EventOverlayEngine({
    event: 'diwali',
    showControls: true,
    persistPreference: true
});
freshEngine.start();

assert.strictEqual(freshEngine.isDismissed(), true, 'Fresh instance should boot in dismissed state due to sessionStorage');
const newControlsEl = document.querySelector('[role="region"]');
const freshLauncher = newControlsEl.querySelector('button');
assert(freshLauncher, 'Fresh launcher button should exist in DOM');
assert(freshLauncher.innerHTML.includes('🪔'), 'Fresh launcher button has Diwali icon');
console.log('✅ Fresh page load rendered launcher badge without running animation loop');

// Test 5: Click launcher badge to restore celebration
console.log('Step 6: User clicks launcher badge');
freshLauncher.click();

assert.strictEqual(freshEngine.isDismissed(), false, 'Fresh engine should now be un-dismissed');
assert.strictEqual(freshEngine.isPaused(), false, 'Fresh engine should now be running');
assert.strictEqual(sessionStorage.getItem('event_overlay_dismissed'), null, 'sessionStorage flag cleared after clicking launcher');

freshEngine.stop();
console.log('\n🎉 ALL DISMISS & RESTART LIFECYCLE TESTS PASSED PERFECTLY!\n');
