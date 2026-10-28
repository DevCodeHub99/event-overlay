'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { EventOverlayEngine, registerEvent } from '../../src/core/engine.js';
import { DiwaliEvent } from '../../src/events/diwali.js';

registerEvent(DiwaliEvent);

export interface DiwaliColor {
    r: number;
    g: number;
    b: number;
}

export interface DiwaliOverlayProps {
    zIndex?: number;
    opacity?: number;
    enableFireworks?: boolean;
    enableDiyas?: boolean;
    enableFountains?: boolean;
    enableSpinners?: boolean;
    enableLanterns?: boolean;
    sparklerCursor?: boolean;
    colors?: DiwaliColor[];
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

export const DiwaliOverlay: FC<DiwaliOverlayProps> = ({
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
    respectReducedMotion = true,
    onToggle,
    onDismiss,
    active = true
}) => {
    const engineRef = useRef<EventOverlayEngine | null>(null);

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
            respectReducedMotion,
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
        persistPreference,
        respectReducedMotion
    ]);

    return null;
};

export default DiwaliOverlay;
