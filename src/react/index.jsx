/**
 * Multi-Event React wrapper for Event Overlay
 *
 * Usage:
 *   import { EventOverlayReact } from '@devcodehub99/event-overlay/react';
 *   <EventOverlayReact event="independence-day" />
 *   <EventOverlayReact event="holi" />
 */
import { useEffect, useRef } from 'react';
import EventOverlay from '../index.js';

export function EventOverlayReact({
    event = 'independence-day',
    zIndex = 99999,
    opacity = 0.95,
    duration = 0,
    container,
    eventOptions = {},
    active = true
}) {
    const engineRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        engineRef.current = EventOverlay.create({
            event,
            zIndex,
            opacity,
            duration,
            container,
            eventOptions
        });
        engineRef.current.start();

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, [active, event, zIndex, opacity, duration, container, JSON.stringify(eventOptions)]);

    return null;
}

export default EventOverlayReact;
