/**
 * Standalone Tree-Shakeable React Component for Holi Festival Overlay
 *
 * Usage:
 *   import { HoliOverlay } from '@event-overlay/core/react/holi';
 *   // or from dedicated package:
 *   import { HoliOverlay } from '@event-overlay/holi/react';
 *   <HoliOverlay maxBalloons={20} />
 */
import { useEffect, useRef } from 'react';
import { EventOverlayEngine, registerEvent } from '../core/engine.js';
import { HoliEvent } from '../events/holi.js';

registerEvent(HoliEvent);

export function HoliOverlay({
    zIndex = 99999,
    opacity = 0.95,
    maxBalloons = 15,
    maxPichkaaris = 4,
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
            event: 'holi',
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
                maxBalloons,
                maxPichkaaris,
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
        maxBalloons,
        maxPichkaaris,
        colors,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference
    ]);

    return null;
}

export default HoliOverlay;
