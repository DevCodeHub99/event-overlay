/**
 * Standalone Tree-Shakeable React Component for Diwali Festival Overlay
 *
 * Usage:
 *   import { DiwaliOverlay } from '@event-overlay/core/react/diwali';
 *   // or from dedicated package:
 *   import { DiwaliOverlay } from '@event-overlay/diwali/react';
 *   <DiwaliOverlay enableFireworks={true} sparklerCursor={true} />
 */
import { useEffect, useRef } from 'react';
import { EventOverlayEngine, registerEvent } from '../core/engine.js';
import { DiwaliEvent } from '../events/diwali.js';

registerEvent(DiwaliEvent);

export function DiwaliOverlay({
    zIndex = 99999,
    opacity = 0.95,
    enableFireworks = true,
    enableDiyas = true,
    enableFountains = true,
    enableSpinners = true,
    enableLanterns = true,
    sparklerCursor = true,
    colors,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    onToggle,
    onDismiss,
    active = true
}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = new EventOverlayEngine({
            event: 'diwali',
            zIndex,
            opacity,
            duration,
            container,
            showControls,
            controlPosition,
            persistPreference,
            onToggle,
            onDismiss,
            eventOptions: {
                enableFireworks,
                enableDiyas,
                enableFountains,
                enableSpinners,
                enableLanterns,
                sparklerCursor,
                colors
            }
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [
        active,
        zIndex,
        opacity,
        enableFireworks,
        enableDiyas,
        enableFountains,
        enableSpinners,
        enableLanterns,
        sparklerCursor,
        colors,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference
    ]);

    return null;
}

export default DiwaliOverlay;
