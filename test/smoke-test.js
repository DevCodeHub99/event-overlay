/**
 * 🧪 Comprehensive Build & Package Verification Smoke Test
 * Tests syntax, bundle integrity, module exports, and absence of template artifacts.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { pathToFileURL } from 'url';

const ROOT_DIR = process.cwd();

console.log('🧪 Running Event Overlay Verification Smoke Tests...\n');

let failed = false;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        failed = true;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

// 1. Verify Syntax of All Generated JavaScript Artifacts
console.log('--- Step 1: JavaScript Syntax Validation ---');
const jsFilesToCheck = [
    'dist/event-overlay.js',
    'dist/event-overlay.cjs',
    'dist/event-overlay.umd.js',
    'dist/events/independence-day.js',
    'dist/events/independence-day.umd.js',
    'dist/events/holi.js',
    'dist/events/holi.umd.js',
    'dist/events/diwali.js',
    'dist/events/diwali.umd.js',
    'packages/core/dist/index.js',
    'packages/core/dist/index.cjs',
    'packages/core/dist/index.umd.js',
    'packages/diwali/dist/index.js',
    'packages/diwali/dist/index.cjs',
    'packages/diwali/dist/index.umd.js',
    'packages/diwali/dist/react.js',
    'packages/holi/dist/index.js',
    'packages/holi/dist/index.cjs',
    'packages/holi/dist/index.umd.js',
    'packages/holi/dist/react.js',
    'packages/independence-day/dist/index.js',
    'packages/independence-day/dist/index.cjs',
    'packages/independence-day/dist/index.umd.js',
    'packages/independence-day/dist/react.js'
];

for (const relPath of jsFilesToCheck) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
        assert(false, `Expected file to exist: ${relPath}`);
        continue;
    }

    try {
        execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
        assert(true, `Syntax check: ${relPath}`);
    } catch (err) {
        assert(false, `Syntax error in ${relPath}: ${err.message}`);
    }
}

// 2. Verify No Unexpanded Template Literals Remain in Artifacts
console.log('\n--- Step 2: Template String Expansion Check ---');
const distDir = path.join(ROOT_DIR, 'dist');
const packagesDir = path.join(ROOT_DIR, 'packages');

function checkNoRawTemplates(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            checkNoRawTemplates(full);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) {
            const content = fs.readFileSync(full, 'utf-8');
            const hasRawUtil = content.includes('${utilsClean}');
            const hasRawEngine = content.includes('${engineClean}');
            const hasRawDiwali = content.includes('${diwaliClean}');
            const hasRawUmdCore = content.includes('${umdDiwaliCore}');
            const hasRawHoli = content.includes('${holiClean}');
            const hasRawIndep = content.includes('${indepClean}');

            const hasIssue = hasRawUtil || hasRawEngine || hasRawDiwali || hasRawUmdCore || hasRawHoli || hasRawIndep;
            assert(!hasIssue, `No raw template expressions in ${path.relative(ROOT_DIR, full)}`);
        }
    }
}
checkNoRawTemplates(distDir);
checkNoRawTemplates(packagesDir);

// 3. Verify Dynamic Module Imports & API Surface Check
console.log('\n--- Step 3: Module Dynamic Import & API Surface Check ---');

async function testImports() {
    try {
        // Test Core
        const coreUrl = pathToFileURL(path.join(ROOT_DIR, 'dist/event-overlay.js')).href;
        const core = await import(coreUrl);
        assert(typeof core.start === 'function', 'Core exports start()');
        assert(typeof core.stop === 'function', 'Core exports stop()');
        assert(typeof core.pause === 'function', 'Core exports pause()');
        assert(typeof core.resume === 'function', 'Core exports resume()');
        assert(typeof core.togglePause === 'function', 'Core exports togglePause()');
        assert(typeof core.isPaused === 'function', 'Core exports isPaused()');
        assert(typeof core.dismiss === 'function', 'Core exports dismiss()');
        assert(Boolean(core.IndependenceDayEvent), 'Core exports IndependenceDayEvent');
        assert(Boolean(core.HoliEvent), 'Core exports HoliEvent');
        assert(Boolean(core.DiwaliEvent), 'Core exports DiwaliEvent');

        // Test Diwali Dedicated Package
        const diwaliUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/diwali/dist/index.js')).href;
        const diwali = await import(diwaliUrl);
        assert(typeof diwali.start === 'function', '@event-overlay/diwali exports start()');
        assert(typeof diwali.stop === 'function', '@event-overlay/diwali exports stop()');
        assert(typeof diwali.pause === 'function', '@event-overlay/diwali exports pause()');
        assert(typeof diwali.resume === 'function', '@event-overlay/diwali exports resume()');
        assert(typeof diwali.togglePause === 'function', '@event-overlay/diwali exports togglePause()');
        assert(typeof diwali.isPaused === 'function', '@event-overlay/diwali exports isPaused()');
        assert(typeof diwali.dismiss === 'function', '@event-overlay/diwali exports dismiss()');
        assert(typeof diwali.undismiss === 'function', '@event-overlay/diwali exports undismiss()');
        assert(Boolean(diwali.DiwaliEvent), '@event-overlay/diwali exports DiwaliEvent');

        // Test Diwali React Component
        const diwaliReactUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/diwali/dist/react.js')).href;
        const diwaliReact = await import(diwaliReactUrl);
        assert(typeof diwaliReact.DiwaliOverlay === 'function', '@event-overlay/diwali/react exports DiwaliOverlay component');

        // Test Holi Dedicated Package
        const holiUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/holi/dist/index.js')).href;
        const holi = await import(holiUrl);
        assert(typeof holi.start === 'function', '@event-overlay/holi exports start()');
        assert(typeof holi.stop === 'function', '@event-overlay/holi exports stop()');
        assert(typeof holi.pause === 'function', '@event-overlay/holi exports pause()');
        assert(typeof holi.resume === 'function', '@event-overlay/holi exports resume()');
        assert(typeof holi.dismiss === 'function', '@event-overlay/holi exports dismiss()');
        assert(typeof holi.undismiss === 'function', '@event-overlay/holi exports undismiss()');
        assert(Boolean(holi.HoliEvent), '@event-overlay/holi exports HoliEvent');

        // Test Holi React Component
        const holiReactUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/holi/dist/react.js')).href;
        const holiReact = await import(holiReactUrl);
        assert(typeof holiReact.HoliOverlay === 'function', '@event-overlay/holi/react exports HoliOverlay component');

        // Test Independence Day Dedicated Package
        const indepUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/independence-day/dist/index.js')).href;
        const indep = await import(indepUrl);
        assert(typeof indep.start === 'function', '@event-overlay/independence-day exports start()');
        assert(typeof indep.stop === 'function', '@event-overlay/independence-day exports stop()');
        assert(typeof indep.pause === 'function', '@event-overlay/independence-day exports pause()');
        assert(typeof indep.resume === 'function', '@event-overlay/independence-day exports resume()');
        assert(typeof indep.dismiss === 'function', '@event-overlay/independence-day exports dismiss()');
        assert(typeof indep.undismiss === 'function', '@event-overlay/independence-day exports undismiss()');
        assert(Boolean(indep.IndependenceDayEvent), '@event-overlay/independence-day exports IndependenceDayEvent');

        // Test Independence Day React Component
        const indepReactUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/independence-day/dist/react.js')).href;
        const indepReact = await import(indepReactUrl);
        assert(typeof indepReact.IndependenceDayOverlay === 'function', '@event-overlay/independence-day/react exports IndependenceDayOverlay component');

        // Test Headless Core Package (@event-overlay/core)
        const headlessCoreUrl = pathToFileURL(path.join(ROOT_DIR, 'packages/core/dist/index.js')).href;
        const headlessCore = await import(headlessCoreUrl);
        assert(typeof headlessCore.create === 'function', '@event-overlay/core exports create()');
        assert(typeof headlessCore.start === 'function', '@event-overlay/core exports start()');
        assert(typeof headlessCore.registerEvent === 'function', '@event-overlay/core exports registerEvent()');
        assert(Boolean(headlessCore.EventOverlayEngine), '@event-overlay/core exports EventOverlayEngine');

    } catch (err) {
        assert(false, `Dynamic import failed: ${err.message}\n${err.stack}`);
    }
}

await testImports();

// 4. Verify Bundle Sizes
console.log('\n--- Step 4: Standalone Package Bundle Sizes ---');
const diwaliSize = fs.statSync(path.join(ROOT_DIR, 'packages/diwali/dist/index.js')).size;
const holiSize = fs.statSync(path.join(ROOT_DIR, 'packages/holi/dist/index.js')).size;
const indepSize = fs.statSync(path.join(ROOT_DIR, 'packages/independence-day/dist/index.js')).size;
const coreSize = fs.statSync(path.join(ROOT_DIR, 'packages/core/dist/index.js')).size;

assert(diwaliSize > 30000, `@event-overlay/diwali bundle is complete (>30KB, actual: ${diwaliSize} B)`);
assert(holiSize > 30000, `@event-overlay/holi bundle is complete (>30KB, actual: ${holiSize} B)`);
assert(indepSize > 30000, `@event-overlay/independence-day bundle is complete (>30KB, actual: ${indepSize} B)`);
assert(coreSize < 35000, `@event-overlay/core is lightweight headless engine (<35KB, actual: ${coreSize} B)`);

console.log('\n----------------------------------------');
if (failed) {
    console.error('❌ SMOKE TESTS FAILED!');
    process.exit(1);
} else {
    console.log('🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
}
