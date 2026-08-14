/**
 * Standalone Tree-Shakeable React Component for Independence Day Overlay
 *
 * Usage:
 *   import { IndependenceDayOverlay } from '@devcodehub99/event-overlay/react/independence-day';
 *   <IndependenceDayOverlay maxFlags={4} maxKites={10} maxJets={3} />
 */
import { useEffect, useRef } from 'react';
import { EventOverlayEngine, registerEvent } from '../core/engine.js';
import { IndependenceDayEvent } from '../events/independence-day.js';

registerEvent(IndependenceDayEvent);

export function IndependenceDayOverlay({
    zIndex = 99999,
    opacity = 0.95,
    maxFlags = 3,
    maxKites = 6,
    maxJets = 2,
    maxFireworks = 3,
    maxPetals = 35,
    showGlow = true,
    duration = 0,
    container,
    active = true
}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = new EventOverlayEngine({
            event: 'independence-day',
            zIndex,
            opacity,
            duration,
            container,
            eventOptions: {
                maxFlags,
                maxKites,
                maxJets,
                maxFireworks,
                maxPetals,
                showGlow
            }
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [active, zIndex, opacity, maxFlags, maxKites, maxJets, maxFireworks, maxPetals, showGlow, duration, container]);

    return null;
}

export default IndependenceDayOverlay;
