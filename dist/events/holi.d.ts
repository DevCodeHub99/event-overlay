/**
 * Standalone TypeScript types for Holi Festival Overlay
 */
import type { FC } from 'react';
import type { EventOverlayEngine, HoliOptions, HoliOverlayProps } from '../event-overlay';

export declare function start(options?: HoliOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function toggle(options?: HoliOptions): void;
export declare function isRunning(): boolean;
export declare function create(options?: HoliOptions): EventOverlayEngine;

export declare const HoliOverlay: FC<HoliOverlayProps>;
export default start;
