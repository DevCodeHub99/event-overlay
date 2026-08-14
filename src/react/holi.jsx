/**
 * Standalone Tree-Shakeable React Component for Holi Festival Overlay
 *
 * Usage:
 *   import { HoliOverlay } from '@devcodehub99/event-overlay/react/holi';
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
    }, [active, zIndex, opacity, maxBalloons, maxPichkaaris, colors, duration, container]);

    return null;
}

export default HoliOverlay;
