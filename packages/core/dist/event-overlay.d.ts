/**
 * TypeScript Declarations for Event Overlay Framework
 * @version 1.0.0
 * @module @event-overlay/core
 */

import type { FC } from 'react';

export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface EventModule {
    id: string;
    name: string;
    init?(ctx: CanvasRenderingContext2D, width: number, height: number, options?: Record<string, any>): void;
    resize?(width: number, height: number): void;
    update?(time: number, delta: number, width: number, height: number): void;
    draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void;
    destroy?(): void;
}

export interface EventOverlayOptions {
    /** Event module identifier (e.g. 'independence-day', 'holi') */
    event?: string;
    /** CSS z-index for overlay canvas (default: 99999) */
    zIndex?: number;
    /** Overall opacity of overlay, 0-1 (default: 0.95) */
    opacity?: number;
    /** Selector for container element (default: body) */
    container?: string;
    /** Auto-stop after N milliseconds (0 = infinite) */
    duration?: number;
    /** Specific event module customization options */
    eventOptions?: Record<string, any>;
}

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

export interface HoliOptions {
    maxBalloons?: number;
    maxPichkaaris?: number;
    colors?: ColorRGB[];
    showAmbient?: boolean;
}

export declare class EventOverlayEngine {
    constructor(options?: EventOverlayOptions);
    eventId: string;
    zIndex: number;
    opacity: number;
    setEvent(event: string | EventModule, eventOptions?: Record<string, any>): EventOverlayEngine;
    start(): EventOverlayEngine;
    stop(): EventOverlayEngine;
    isRunning(): boolean;
    toggle(): EventOverlayEngine;
}

export declare function registerEvent(module: EventModule): void;
export declare function getRegisteredEvent(id: string): EventModule | undefined;
export declare function getRegisteredEventIds(): string[];

export declare const IndependenceDayEvent: EventModule;
export declare const HoliEvent: EventModule;

export declare function start(eventName?: string | EventOverlayOptions, options?: EventOverlayOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function toggle(eventName?: string | EventOverlayOptions, options?: EventOverlayOptions): void;
export declare function isRunning(): boolean;
export declare function create(options?: EventOverlayOptions): EventOverlayEngine;

export interface EventOverlayReactProps extends EventOverlayOptions {
    active?: boolean;
}

export interface IndependenceDayOverlayProps extends IndependenceDayOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export interface HoliOverlayProps extends HoliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare const EventOverlayReact: FC<EventOverlayReactProps>;
export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export declare const HoliOverlay: FC<HoliOverlayProps>;

declare const EventOverlay: {
    version: string;
    start: typeof start;
    stop: typeof stop;
    toggle: typeof toggle;
    isRunning: typeof isRunning;
    create: typeof create;
    registerEvent: typeof registerEvent;
    getRegisteredEvent: typeof getRegisteredEvent;
    getRegisteredEventIds: typeof getRegisteredEventIds;
    IndependenceDayEvent: EventModule;
    HoliEvent: EventModule;
    EventOverlayEngine: typeof EventOverlayEngine;
};

export default EventOverlay;
