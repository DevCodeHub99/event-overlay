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
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default IndependenceDayOverlay;
