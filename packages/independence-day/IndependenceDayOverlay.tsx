'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { EventOverlayEngine, registerEvent } from '../../src/core/engine.js';
import { IndependenceDayEvent } from '../../src/events/independence-day.js';

registerEvent(IndependenceDayEvent);

export interface IndependenceDayOverlayProps {
    zIndex?: number;
    opacity?: number;
    maxFlags?: number;
    maxKites?: number;
    maxJets?: number;
    maxFireworks?: number;
    maxPetals?: number;
    showGlow?: boolean;
    showWave?: boolean;
    waveOpacity?: number;
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

export const IndependenceDayOverlay: FC<IndependenceDayOverlayProps> = ({
    zIndex = 99999,
    opacity = 0.95,
    maxFlags = 3,
    maxKites = 6,
    maxJets = 2,
    maxFireworks = 3,
    maxPetals = 35,
    showGlow = true,
    showWave = true,
    waveOpacity = 0.65,
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
            event: 'independence-day',
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
                maxFlags,
                maxKites,
                maxJets,
                maxFireworks,
                maxPetals,
                showGlow,
                showWave,
                waveOpacity
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
        maxFlags,
        maxKites,
        maxJets,
        maxFireworks,
        maxPetals,
        showGlow,
        showWave,
        waveOpacity,
        duration,
        container,
        showControls,
        controlPosition,
        persistPreference,
        respectReducedMotion
    ]);

    return null;
};

export default IndependenceDayOverlay;
