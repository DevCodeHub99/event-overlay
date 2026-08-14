/**
 * Standalone TypeScript types for Independence Day Overlay
 */
import type { FC } from 'react';
import type { EventOverlayEngine, IndependenceDayOptions, IndependenceDayOverlayProps } from '../event-overlay';

export declare function start(options?: IndependenceDayOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function toggle(options?: IndependenceDayOptions): void;
export declare function isRunning(): boolean;
export declare function create(options?: IndependenceDayOptions): EventOverlayEngine;

export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export default start;
