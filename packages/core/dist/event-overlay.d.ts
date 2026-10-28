/**
 * TypeScript Declarations for Event Overlay Framework
 * @version 1.0.5
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
    /** Event module identifier (e.g. 'independence-day', 'holi', 'diwali') */
    event?: string;
    /** CSS z-index for overlay canvas (default: 99999) */
    zIndex?: number;
    /** Overall opacity of overlay, 0-1 (default: 0.95) */
    opacity?: number;
    /** Selector for container element (default: body) */
    container?: string;
    /** Auto-stop after N milliseconds (0 = infinite) */
    duration?: number;
    /** Respect user prefers-reduced-motion OS preference (default: true) */
    respectReducedMotion?: boolean;
    /** Show accessible floating pause/resume toggle control (default: true) */
    showControls?: boolean;
    /** Position of floating toggle control (default: 'bottom-right') */
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Remember user pause or dismiss preference across sessions (default: true) */
    persistPreference?: boolean;
    /** Callback fired when user pauses or resumes animation */
    onToggle?: (paused: boolean) => void;
    /** Callback fired when user dismisses the celebration overlay */
    onDismiss?: () => void;
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
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
}

export interface HoliOptions {
    maxBalloons?: number;
    maxPichkaaris?: number;
    colors?: ColorRGB[];
    showAmbient?: boolean;
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
}

export interface DiwaliOptions {
    enableFireworks?: boolean;
    enableDiyas?: boolean;
    enableFountains?: boolean;
    enableSpinners?: boolean;
    enableLanterns?: boolean;
    sparklerCursor?: boolean;
    colors?: ColorRGB[];
    showControls?: boolean;
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference?: boolean;
}

export declare class EventOverlayEngine {
    constructor(options?: EventOverlayOptions);
    eventId: string;
    zIndex: number;
    opacity: number;
    showControls: boolean;
    controlPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    persistPreference: boolean;
    setEvent(event: string | EventModule, eventOptions?: Record<string, any>): EventOverlayEngine;
    start(): EventOverlayEngine;
    stop(): EventOverlayEngine;
    pause(): EventOverlayEngine;
    resume(): EventOverlayEngine;
    togglePause(): EventOverlayEngine;
    dismiss(): EventOverlayEngine;
    undismiss(): EventOverlayEngine;
    isRunning(): boolean;
    isPaused(): boolean;
    toggle(): EventOverlayEngine;
}

export declare function registerEvent(module: EventModule): void;
export declare function getRegisteredEvent(id: string): EventModule | undefined;
export declare function getRegisteredEventIds(): string[];

export declare const IndependenceDayEvent: EventModule;
export declare const HoliEvent: EventModule;
export declare const DiwaliEvent: EventModule;

export declare function start(eventName?: string | EventOverlayOptions, options?: EventOverlayOptions): EventOverlayEngine;
export declare function stop(): void;
export declare function pause(): void;
export declare function resume(): void;
export declare function togglePause(): void;
export declare function isPaused(): boolean;
export declare function dismiss(): void;
export declare function undismiss(): void;
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

export interface DiwaliOverlayProps extends DiwaliOptions {
    zIndex?: number;
    opacity?: number;
    duration?: number;
    container?: string;
    active?: boolean;
}

export declare const EventOverlayReact: FC<EventOverlayReactProps>;
export declare const IndependenceDayOverlay: FC<IndependenceDayOverlayProps>;
export declare const HoliOverlay: FC<HoliOverlayProps>;
export declare const DiwaliOverlay: FC<DiwaliOverlayProps>;

declare const EventOverlay: {
    version: string;
    start: typeof start;
    stop: typeof stop;
    pause: typeof pause;
    resume: typeof resume;
    togglePause: typeof togglePause;
    isPaused: typeof isPaused;
    dismiss: typeof dismiss;
    undismiss: typeof undismiss;
    toggle: typeof toggle;
    isRunning: typeof isRunning;
    create: typeof create;
    registerEvent: typeof registerEvent;
    getRegisteredEvent: typeof getRegisteredEvent;
    getRegisteredEventIds: typeof getRegisteredEventIds;
    IndependenceDayEvent: EventModule;
    HoliEvent: EventModule;
    DiwaliEvent: EventModule;
    EventOverlayEngine: typeof EventOverlayEngine;
};

export default EventOverlay;
