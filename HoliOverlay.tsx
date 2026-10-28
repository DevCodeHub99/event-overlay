'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { EventOverlayEngine, registerEvent } from './src/core/engine.js';
import { HoliEvent } from './src/events/holi.js';

registerEvent(HoliEvent);

export interface HoliColor {
    r: number;
    g: number;
    b: number;
}

export interface HoliOverlayProps {
    zIndex?: number;
    opacity?: number;
    maxBalloons?: number;
    maxPichkaaris?: number;
    showAmbient?: boolean;
    colors?: HoliColor[];
    duration?: number;
    container?: string;
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
    respectReducedMotion?: boolean;
    onToggle?: (paused: boolean) => void;
    onDismiss?: () => void;
    active?: boolean;
}

export const HoliOverlay: FC<HoliOverlayProps> = ({
    zIndex = 99999,
    opacity = 0.95,
    maxBalloons = 15,
    maxPichkaaris = 4,
    showAmbient = true,
    colors,
    duration = 0,
    container,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true,
    respectReducedMotion = true,
    onToggle,
    onDismiss,
    active = true
}) => {
    const engineRef = useRef<EventOverlayEngine | null>(null);

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
            respectReducedMotion,
            onToggle,
            onDismiss,
            eventOptions: {
                maxBalloons,
                maxPichkaaris,
                showAmbient,
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
        showAmbient,
        colors,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference,
        respectReducedMotion
    ]);

    return null;
};

export default HoliOverlay;
