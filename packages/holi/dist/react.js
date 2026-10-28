import { useEffect, useRef } from 'react';
import { EventOverlayEngine } from './index.js';

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
} = {}) {
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
