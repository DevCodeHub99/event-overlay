import type { FC } from 'react';

export interface IndependenceDayOptions {
    maxFlags?: number;
    maxKites?: number;
    maxJets?: number;
    maxFireworks?: number;
    maxPetals?: number;
    showGlow?: boolean;
    showWave?: boolean;
    waveOpacity?: number;
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
}

export interface IndependenceDayOverlayProps extends IndependenceDayOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: IndependenceDayOptions): any;
export declare function stop(): void;
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
