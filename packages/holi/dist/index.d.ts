import type { FC } from 'react';

export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface HoliOptions {
    maxBalloons?: number;
    maxPichkaaris?: number;
    colors?: ColorRGB[];
    showAmbient?: boolean;
}

export interface HoliOverlayProps extends HoliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: HoliOptions): any;
export declare function stop(): void;
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: HoliOptions): void;
export declare function isRunning(): boolean;

export declare const HoliOverlay: FC<HoliOverlayProps>;
export default HoliOverlay;
