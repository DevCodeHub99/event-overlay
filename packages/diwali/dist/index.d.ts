import type { FC } from 'react';

export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface DiwaliOptions {
    enableFireworks?: boolean;
    enableDiyas?: boolean;
    enableFountains?: boolean;
    enableSpinners?: boolean;
    enableLanterns?: boolean;
    sparklerCursor?: boolean;
    colors?: ColorRGB[];
}

export interface DiwaliOverlayProps extends DiwaliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare function start(options?: DiwaliOptions): any;
export declare function stop(): void;
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function toggle(options?: DiwaliOptions): void;
export declare function isRunning(): boolean;

export declare const DiwaliOverlay: FC<DiwaliOverlayProps>;
export default DiwaliOverlay;
