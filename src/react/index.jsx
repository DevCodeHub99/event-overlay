/**
 * Multi-Event React wrapper for Event Overlay
 *
 * Usage:
 *   import { EventOverlayReact } from '@event-overlay/core/react';
 *   <EventOverlayReact event="independence-day" />
 *   <EventOverlayReact event="holi" />
 *   <EventOverlayReact event="diwali" />
 */
import { useEffect, useRef } from 'react';
import EventOverlay from '../index.js';

export function EventOverlayReact({
    event = 'independence-day',
    zIndex = 99999,
    opacity = 0.95,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    onToggle,
    onDismiss,
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
            showControls,
            controlPosition,
            persistPreference,
            onToggle,
            onDismiss,
            eventOptions
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
        event,
        zIndex,
        opacity,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference,
        JSON.stringify(eventOptions)
    ]);

    return null;
}

export default EventOverlayReact;
