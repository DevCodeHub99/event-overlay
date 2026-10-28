'use client';

import { useEffect, useRef, useState } from 'react';

export interface DiwaliColor {
    r: number;
    g: number;
    b: number;
}

const COLORS: DiwaliColor[] = [
    { r: 255, g: 215, b: 0 },   // Royal Gold
    { r: 255, g: 140, b: 0 },   // Deep Amber / Orange
    { r: 255, g: 69, b: 0 },    // Saffron Fire
    { r: 255, g: 45, b: 85 },   // Festive Crimson Pink
    { r: 0, g: 230, b: 118 },   // Emerald Green
    { r: 0, g: 229, b: 255 },   // Electric Cyan
    { r: 179, g: 136, b: 255 }, // Royal Purple
    { r: 255, g: 248, b: 220 }  // Sparkling White-Yellow
];

const MAX_SPARKS = 800;

class Spark {
    x: number;
    y: number;
    color: DiwaliColor;
    vx: number;
    vy: number;
    gravity: number;
    friction: number;
    size: number;
    life: number;
    maxLife: number;
    flicker: boolean;
    trail: boolean;
    history: { x: number; y: number }[] | null;

    constructor(
        x: number,
        y: number,
        color: DiwaliColor,
        vx?: number,
        vy?: number,
        options: {
            gravity?: number;
            friction?: number;
            size?: number;
            maxLife?: number;
            flicker?: boolean;
            trail?: boolean;
        } = {}
    ) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx ?? (Math.random() - 0.5) * 8;
        this.vy = vy ?? (Math.random() - 0.5) * 8;
        this.gravity = options.gravity ?? 0.18;
        this.friction = options.friction ?? 0.96;
        this.size = options.size ?? Math.random() * 2.3 + 1.5;
        this.life = 0;
        this.maxLife = options.maxLife ?? Math.random() * 35 + 30;
        this.flicker = options.flicker ?? (Math.random() > 0.4);
        this.trail = options.trail ?? false;
        this.history = this.trail ? [] : null;
    }

    update() {
        if (this.trail && this.history) {
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > 4) this.history.shift();
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const fade = Math.max(0, 1 - this.life / this.maxLife);
        if (fade <= 0) return;

        let alpha = fade;
        if (this.flicker) {
            alpha *= 0.4 + Math.random() * 0.6;
        }

        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;

        if (this.trail && this.history && this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha * 0.45})`;
            ctx.lineWidth = Math.max(0.5, this.size * 0.7);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.6, this.size * fade), 0, Math.PI * 2);
        ctx.fill();
    }
}

class Rocket {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    color: DiwaliColor;
    life: number;
    maxLife: number;
    exploded: boolean;

    constructor(targetX: number, targetY: number, startX: number, startY: number, color?: DiwaliColor) {
        this.x = startX;
        this.y = startY;
        this.targetY = targetY;
        this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];

        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy);
        const speed = Math.random() * 6 + 13;

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.life = 0;
        this.maxLife = Math.max(15, Math.floor(dist / speed));
        this.exploded = false;
    }

    update(sparks: Spark[]) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.life++;

        if (sparks.length < MAX_SPARKS && Math.random() > 0.25) {
            sparks.push(
                new Spark(
                    this.x + (Math.random() - 0.5) * 4,
                    this.y + (Math.random() - 0.5) * 4,
                    { r: 255, g: 200, b: 100 },
                    -this.vx * 0.15 + (Math.random() - 0.5) * 1.5,
                    -this.vy * 0.15 + (Math.random() - 0.5) * 1.5,
                    { size: Math.random() * 1.5 + 1.0, maxLife: Math.random() * 12 + 10, gravity: 0.1 }
                )
            );
        }

        if (this.life >= this.maxLife || this.y <= this.targetY) {
            this.explode(sparks);
            this.exploded = true;
        }
    }

    explode(sparks: Spark[]) {
        const burstCount = Math.floor(Math.random() * 35 + 55);
        const secColor = COLORS[Math.floor(Math.random() * COLORS.length)];

        for (let i = 0; i < burstCount; i++) {
            if (sparks.length >= MAX_SPARKS) break;
            const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.25;
            const speed = Math.random() * 6.0 + 3.0;
            const col = Math.random() > 0.35 ? this.color : secColor;
            sparks.push(
                new Spark(this.x, this.y, col, Math.cos(angle) * speed, Math.sin(angle) * speed, {
                    size: Math.random() * 2.0 + 1.8,
                    maxLife: Math.random() * 40 + 35,
                    gravity: 0.14,
                    friction: 0.94,
                    flicker: true,
                    trail: true
                })
            );
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.exploded) return;
        ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Anar {
    x: number;
    y: number;
    life: number;
    maxLife: number;
    active: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.life = 0;
        this.maxLife = Math.random() * 120 + 200;
        this.active = true;
    }

    update(sparks: Spark[]) {
        this.life++;
        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        const intensity = Math.sin((this.life / this.maxLife) * Math.PI);
        const count = Math.floor((Math.random() * 5 + 4) * intensity);

        for (let i = 0; i < count; i++) {
            if (sparks.length >= MAX_SPARKS) break;
            const col = COLORS[Math.floor(Math.random() * COLORS.length)];
            sparks.push(
                new Spark(
                    this.x + (Math.random() - 0.5) * 8,
                    this.y - 8,
                    col,
                    (Math.random() - 0.5) * 4.5,
                    -(Math.random() * 12 + 10) * intensity,
                    {
                        size: Math.random() * 2.0 + 1.5,
                        maxLife: Math.random() * 30 + 35,
                        gravity: 0.38,
                        friction: 0.97,
                        flicker: true
                    }
                )
            );
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const w = 24;
        const h = 32;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

class Chakri {
    x: number;
    y: number;
    angle: number;
    speed: number;
    life: number;
    maxLife: number;
    active: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = Math.random() * 0.2 + 0.3;
        this.life = 0;
        this.maxLife = Math.random() * 120 + 200;
        this.active = true;
    }

    update(sparks: Spark[]) {
        this.life++;
        this.angle += this.speed;

        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        const arms = 3;
        for (let a = 0; a < arms; a++) {
            if (sparks.length >= MAX_SPARKS) break;
            const curAngle = this.angle + (Math.PI * 2 * a) / arms;
            const tangent = curAngle + Math.PI / 2;
            const tanSpeed = Math.random() * 5 + 4.5;
            const col = COLORS[a % COLORS.length];

            sparks.push(
                new Spark(
                    this.x + Math.cos(curAngle) * 14,
                    this.y + Math.sin(curAngle) * 14,
                    col,
                    Math.cos(tangent) * tanSpeed,
                    Math.sin(tangent) * tanSpeed,
                    {
                        size: Math.random() * 1.6 + 1.8,
                        maxLife: Math.random() * 20 + 25,
                        gravity: 0.15,
                        friction: 0.95,
                        flicker: true,
                        trail: true
                    }
                )
            );
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

class Diya {
    x: number;
    y: number;
    scale: number;
    flickerPhase: number;
    flickerSpeed: number;

    constructor(x: number, y: number, scale = 1.0) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.flickerPhase = Math.random() * Math.PI * 2;
        this.flickerSpeed = Math.random() * 0.08 + 0.08;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const s = this.scale;
        this.flickerPhase += this.flickerSpeed;
        const flutter = Math.sin(this.flickerPhase) * 1.5 + (Math.random() - 0.5);
        const flameHeight = (18 + Math.sin(time * 0.006 + this.flickerPhase) * 3) * s;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow
        const glowRadius = (45 + Math.sin(this.flickerPhase) * 6) * s;
        const glow = ctx.createRadialGradient(0, -flameHeight * 0.5, 3 * s, 0, -flameHeight * 0.5, glowRadius);
        glow.addColorStop(0, 'rgba(255, 200, 50, 0.45)');
        glow.addColorStop(0.5, 'rgba(255, 120, 20, 0.15)');
        glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -flameHeight * 0.5, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bowl
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 10 * s, 0, 0, Math.PI);
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2 * s;
        ctx.stroke();

        // Rim
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#CD853F';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // Flame Outer
        ctx.beginPath();
        ctx.moveTo(-5 * s, 0);
        ctx.quadraticCurveTo(-6 * s, -flameHeight * 0.6, flutter, -flameHeight);
        ctx.quadraticCurveTo(6 * s, -flameHeight * 0.6, 5 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FF4500';
        ctx.fill();

        // Flame Inner
        ctx.beginPath();
        ctx.moveTo(-3 * s, 0);
        ctx.quadraticCurveTo(-3.5 * s, -flameHeight * 0.5, flutter * 0.7, -flameHeight * 0.85);
        ctx.quadraticCurveTo(3.5 * s, -flameHeight * 0.5, 3 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        // Flame Core
        ctx.beginPath();
        ctx.ellipse(0, -2 * s, 1.8 * s, 3.5 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
    }
}

class Lantern {
    x: number;
    y: number;
    speedY: number;
    swayAngle: number;
    swaySpeed: number;
    size: number;
    color: DiwaliColor;
    active: boolean;

    constructor(width: number, height: number) {
        this.x = Math.random() * (width * 0.84) + width * 0.08;
        this.y = height + Math.random() * 80 + 20;
        this.speedY = Math.random() * 0.7 + 0.65;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.015 + 0.015;
        this.size = Math.random() * 10 + 16;
        this.color = Math.random() > 0.4 ? { r: 255, g: 140, b: 0 } : { r: 255, g: 45, b: 85 };
        this.active = true;
    }

    update() {
        this.y -= this.speedY;
        this.swayAngle += this.swaySpeed;
        this.x += Math.sin(this.swayAngle) * 0.65;
        if (this.y < -60) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const w = this.size;
        const h = this.size * 1.35;
        ctx.save();
        ctx.translate(this.x, this.y);

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 1.6);
        glow.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.65)`);
        glow.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, w * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.55, h * 0.5);
        ctx.lineTo(-w * 0.55, h * 0.5);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
        grad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.88)`);
        grad.addColorStop(1, 'rgba(255, 230, 140, 0.95)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, h * 0.35, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
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
}

export default function DiwaliOverlay({
    zIndex = 99999,
    opacity = 0.95,
    enableFireworks = true,
    enableDiyas = true,
    enableFountains = true,
    enableSpinners = true,
    enableLanterns = true,
    sparklerCursor = true
}: DiwaliOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let sparks: Spark[] = [];
        let rockets: Rocket[] = [];
        let fountains: Anar[] = [];
        let spinners: Chakri[] = [];
        let lanterns: Lantern[] = [];
        let diyas: Diya[] = [];

        const setupDiyas = () => {
            diyas = [];
            if (!enableDiyas) return;
            const count = Math.min(25, Math.max(5, Math.floor(width / 80)));
            const step = width / count;
            for (let i = 0; i < count; i++) {
                diyas.push(new Diya(step * i + step * 0.5, height - 16, 0.9));
            }
        };
        setupDiyas();

        const setSize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            setupDiyas();
        };

        window.addEventListener('resize', setSize);

        const onPointerMove = (e: PointerEvent) => {
            if (!sparklerCursor || sparks.length >= MAX_SPARKS) return;
            const count = Math.floor(Math.random() * 3 + 2);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3.5 + 1.8;
                const col = COLORS[Math.floor(Math.random() * COLORS.length)];
                sparks.push(
                    new Spark(e.clientX, e.clientY, col, Math.cos(angle) * speed, Math.sin(angle) * speed, {
                        size: Math.random() * 1.7 + 1.5,
                        maxLife: Math.random() * 20 + 18,
                        flicker: true
                    })
                );
            }
        };

        const onClick = (e: MouseEvent) => {
            const count = Math.floor(Math.random() * 35 + 60);
            const col = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < count; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6.5 + 2.5;
                sparks.push(
                    new Spark(e.clientX, e.clientY, col, Math.cos(angle) * speed, Math.sin(angle) * speed, {
                        size: Math.random() * 2.0 + 2.0,
                        maxLife: Math.random() * 40 + 35,
                        gravity: 0.15,
                        friction: 0.93,
                        flicker: true,
                        trail: true
                    })
                );
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('click', onClick);

        let lastRocket = 0;
        let lastFountain = 0;
        let lastSpinner = 0;
        let lastLantern = 0;

        const render = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            // Rockets
            if (enableFireworks && time - lastRocket > Math.random() * 1000 + 600) {
                rockets.push(
                    new Rocket(
                        Math.random() * (width * 0.7) + width * 0.15,
                        Math.random() * (height * 0.4) + height * 0.12,
                        Math.random() * (width * 0.5) + width * 0.25,
                        height + 10
                    )
                );
                lastRocket = time;
            }

            // Fountains
            if (enableFountains && time - lastFountain > Math.random() * 3500 + 3500) {
                const fx = Math.random() > 0.5 ? Math.random() * (width * 0.17) + width * 0.08 : Math.random() * (width * 0.17) + width * 0.75;
                fountains.push(new Anar(fx, height - 18));
                lastFountain = time;
            }

            // Spinners
            if (enableSpinners && time - lastSpinner > Math.random() * 4500 + 5000) {
                spinners.push(new Chakri(Math.random() * (width * 0.6) + width * 0.2, height - 30));
                lastSpinner = time;
            }

            // Lanterns
            if (enableLanterns && time - lastLantern > Math.random() * 1800 + 1400) {
                if (lanterns.length < 12) {
                    lanterns.push(new Lantern(width, height));
                }
                lastLantern = time;
            }

            // Updates
            rockets.forEach((r) => r.update(sparks));
            rockets = rockets.filter((r) => !r.exploded);

            fountains.forEach((f) => f.update(sparks));
            fountains = fountains.filter((f) => f.active);

            spinners.forEach((s) => s.update(sparks));
            spinners = spinners.filter((s) => s.active);

            lanterns.forEach((l) => l.update());
            lanterns = lanterns.filter((l) => l.active);

            sparks.forEach((sp) => sp.update());
            sparks = sparks.filter((sp) => sp.life < sp.maxLife);

            // Draws
            lanterns.forEach((l) => l.draw(ctx));
            fountains.forEach((f) => f.draw(ctx));
            spinners.forEach((s) => s.draw(ctx));
            rockets.forEach((r) => r.draw(ctx));

            // Sparks with additive glow
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            sparks.forEach((sp) => sp.draw(ctx));
            ctx.restore();

            // Diyas
            diyas.forEach((d) => d.draw(ctx, time));

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', setSize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('click', onClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, [enableFireworks, enableDiyas, enableFountains, enableSpinners, enableLanterns, sparklerCursor]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex,
                opacity
            }}
            aria-hidden="true"
        />
    );
}
