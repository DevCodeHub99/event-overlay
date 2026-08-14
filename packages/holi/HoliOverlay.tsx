'use client';

import { useEffect, useRef } from 'react';

const COLORS = [
    { r: 255, g: 105, b: 180 }, // Pink
    { r: 255, g: 223, b: 0 },   // Yellow
    { r: 50, g: 205, b: 50 },  // Green
    { r: 0, g: 191, b: 255 }, // Blue
    { r: 255, g: 140, b: 0 },   // Orange
    { r: 148, g: 0, b: 211 }, // Violet
    { r: 0, g: 255, b: 255 }, // Cyan
    { r: 255, g: 20, b: 147 }, // DeepPink
    { r: 173, g: 255, b: 47 }   // GreenYellow
];

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: { r: number, g: number, b: number };
    isPowder: boolean;
    gravity: number;

    constructor(x: number, y: number, color: { r: number, g: number, b: number }, isPowder: boolean, vx?: number, vy?: number, gravity = 0.4) {
        this.x = x;
        this.y = y;
        this.isPowder = isPowder;
        this.gravity = gravity;
        this.color = color;
        this.life = 0;

        if (isPowder) {
            this.vx = vx ?? (Math.random() - 0.5) * 16;
            this.vy = vy ?? (Math.random() - 0.5) * 16;
            this.maxLife = Math.random() * 45 + 30;
            this.size = Math.random() * 10 + 4;
        } else {
            this.vx = vx ?? (Math.random() - 0.5) * 12;
            this.vy = vy ?? (Math.random() - 0.5) * 12;
            this.maxLife = Math.random() * 20 + 20;
            this.size = Math.random() * 5 + 2;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.isPowder) {
            this.vx *= 0.88;
            this.vy *= 0.88;
            this.size *= 0.98;
        } else {
            this.vy += this.gravity;
        }

        this.life++;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const fadeOut = Math.max(0, 1 - this.life / this.maxLife);
        const alpha = fadeOut * (this.isPowder ? 0.35 : 0.9);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;

        if (!this.isPowder) {
            // Stretch water droplets based on movement speed
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const stretch = Math.max(1, speed / 4);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * stretch, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Splash {
    x: number;
    y: number;
    color: { r: number, g: number, b: number };
    life: number;
    maxLife: number;
    size: number;
    particles: Particle[];

    constructor(x: number, y: number, color: { r: number, g: number, b: number }, size: number) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 0;
        this.maxLife = 160;
        this.size = size * 2.8;
        this.particles = [];

        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color, false));
        }
        for (let i = 0; i < 35; i++) {
            this.particles.push(new Particle(x, y, color, true));
        }
    }

    update() {
        this.life++;
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life < p.maxLife);
    }

    draw(ctx: CanvasRenderingContext2D) {
        let alpha = 0.35;
        if (this.life > this.maxLife * 0.6) {
            alpha = Math.max(0, 1 - ((this.life - this.maxLife * 0.6) / (this.maxLife * 0.4))) * 0.35;
        }

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.size);
        ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.particles.forEach(p => p.draw(ctx));
    }
}

class Balloon {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: { r: number, g: number, b: number };
    active: boolean;
    gravity = 0.15;
    life: number = 0;
    burstLife: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.active = true;
        this.radius = Math.random() * 25 + 10;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.burstLife = Math.random() * 30 + 15;

        const side = Math.floor(Math.random() * 4);
        if (side === 0) {
            this.x = Math.random() * canvasWidth;
            this.y = -50;
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = Math.random() * 8 + 6;
        } else if (side === 1) {
            this.x = -50;
            this.y = Math.random() * (canvasHeight * 0.8);
            this.vx = Math.random() * 12 + 8;
            this.vy = (Math.random() - 0.5) * 8;
        } else if (side === 2) {
            this.x = canvasWidth + 50;
            this.y = Math.random() * (canvasHeight * 0.8);
            this.vx = -(Math.random() * 12 + 8);
            this.vy = (Math.random() - 0.5) * 8;
        } else {
            this.x = Math.random() * canvasWidth;
            this.y = canvasHeight + 50;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = -(Math.random() * 14 + 10);
        }
    }

    update(canvasWidth: number, canvasHeight: number): Splash | null {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life++;

        const isInsideScreen = this.x > 0 && this.x < canvasWidth && this.y > 0 && this.y < canvasHeight;

        if ((this.life >= this.burstLife && isInsideScreen) ||
            this.y + this.radius >= canvasHeight ||
            (this.vx > 0 && this.x + this.radius >= canvasWidth) ||
            (this.vx < 0 && this.x - this.radius <= 0)) {

            this.active = false;
            let splashX = this.x;
            let splashY = this.y;
            if (splashX > canvasWidth) splashX = canvasWidth - 15;
            if (splashX < 0) splashX = 15;
            if (splashY > canvasHeight) splashY = canvasHeight - 15;
            if (splashY < 0) splashY = 15;

            return new Splash(splashX, splashY, this.color, this.radius);
        }

        if (this.y > canvasHeight + 200 || this.x < -200 || this.x > canvasWidth + 200) {
            this.active = false;
        }
        return null;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const stretch = Math.max(1, speed / 8);

        const grad = ctx.createRadialGradient(this.radius * 0.2, -this.radius * 0.2, 0, 0, 0, this.radius * stretch);
        grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.95)`);
        grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.75)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * stretch, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`;
        ctx.beginPath();
        ctx.moveTo(-this.radius * stretch - 2, 0);
        ctx.lineTo(-this.radius * stretch - 8, -4);
        ctx.lineTo(-this.radius * stretch - 8, 4);
        ctx.fill();

        ctx.restore();
    }
}

class Pichkaari {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: { r: number, g: number, b: number };
    life: number;
    maxLife: number;
    particles: Particle[];
    active: boolean;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life = 0;
        this.maxLife = Math.random() * 80 + 50; // Stream duration 50-130 frames
        this.particles = [];
        this.active = true;

        const side = Math.floor(Math.random() * 3);
        if (side === 0) {
            this.x = -10;
            this.y = Math.random() * (canvasHeight * 0.4) + canvasHeight * 0.3;
            this.vx = Math.random() * 30 + 20; // High speed to cross screen
            this.vy = -(Math.random() * 10 + 5);
        } else if (side === 1) {
            this.x = canvasWidth + 10;
            this.y = Math.random() * (canvasHeight * 0.4) + canvasHeight * 0.3;
            this.vx = -(Math.random() * 30 + 20);
            this.vy = -(Math.random() * 10 + 5);
        } else {
            this.x = Math.random() * (canvasWidth * 0.6) + canvasWidth * 0.2;
            this.y = canvasHeight + 10;
            this.vx = (Math.random() - 0.5) * 20;
            this.vy = -(Math.random() * 35 + 25);
        }
    }

    update() {
        this.life++;
        if (this.life < this.maxLife) {
            // Much thicker and denser stream of water particles
            for (let i = 0; i < 15; i++) {
                const pVx = this.vx + (Math.random() - 0.5) * 5;
                const pVy = this.vy + (Math.random() - 0.5) * 5;
                let particle = new Particle(this.x, this.y, this.color, false, pVx, pVy, 0.4);
                particle.maxLife = Math.random() * 80 + 60; // droplets live long distance
                particle.size = Math.random() * 6 + 4; // bigger droplets
                this.particles.push(particle);
            }

            // Sweep motion to simulate aiming the water gun
            if (this.vx > 0) { this.vy -= 0.6; this.vx *= 0.98; }
            else if (this.vx < 0) { this.vy -= 0.6; this.vx *= 0.98; }
            else { this.vx += (Math.random() - 0.5) * 4; }
        }

        if (this.life >= this.maxLife && this.particles.length === 0) {
            this.active = false;
        }
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life < p.maxLife);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class AmbientCorner {
    x: number;
    y: number;
    baseRadius: number;
    timeOffset: number;
    color1: { r: number, g: number, b: number };
    color2: { r: number, g: number, b: number };
    color3: { r: number, g: number, b: number };

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
        this.x = x;
        this.y = y;
        this.baseRadius = Math.max(canvasWidth, canvasHeight) * 0.35; // Massive radius
        this.timeOffset = Math.random() * 10000;

        const pool = [...COLORS].sort(() => 0.5 - Math.random());
        this.color1 = pool[0];
        this.color2 = pool[1];
        this.color3 = pool[2];
    }

    draw(ctx: CanvasRenderingContext2D, elapsed: number) {
        const time = elapsed + this.timeOffset;

        // Smooth breathing pulses
        const pulse1 = Math.sin(time * 0.001) * 0.15 + 0.85;
        const pulse2 = Math.cos(time * 0.0013) * 0.15 + 0.85;

        const r1 = this.baseRadius * pulse1;
        const r2 = this.baseRadius * pulse2 * 0.6;

        ctx.save();

        // Outer glow
        let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r1);
        grad.addColorStop(0, `rgba(${this.color1.r}, ${this.color1.g}, ${this.color1.b}, 0.5)`);
        grad.addColorStop(0.5, `rgba(${this.color2.r}, ${this.color2.g}, ${this.color2.b}, 0.2)`);
        grad.addColorStop(1, `rgba(${this.color1.r}, ${this.color1.g}, ${this.color1.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r1, 0, Math.PI * 2);
        ctx.fill();

        // Inner intense watercolor stain
        let grad2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r2);
        grad2.addColorStop(0, `rgba(${this.color3.r}, ${this.color3.g}, ${this.color3.b}, 0.6)`);
        grad2.addColorStop(1, `rgba(${this.color3.r}, ${this.color3.g}, ${this.color3.b}, 0)`);

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

export interface HoliOverlayProps {
    /** Sets the CSS z-index of the canvas */
    zIndex?: number;
    /** Overall opacity of the animation overlay */
    opacity?: number;
    /** Maximum number of simultaneous balloons */
    maxBalloons?: number;
    /** Maximum number of simultaneous water gun streams */
    maxPichkaaris?: number;
}

export default function HoliOverlay({
    zIndex = 100,
    opacity = 0.95,
    maxBalloons = 15,
    maxPichkaaris = 4
}: HoliOverlayProps = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        let ambientCorners: AmbientCorner[] = [];

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            ambientCorners = [
                new AmbientCorner(0, 0, width, height),
                new AmbientCorner(width, 0, width, height),
                new AmbientCorner(0, height, width, height),
                new AmbientCorner(width, height, width, height),
            ];
        };

        window.addEventListener('resize', setSize);
        setSize();

        let balloons: Balloon[] = [];
        let splashes: Splash[] = [];
        let pichkaaris: Pichkaari[] = [];

        let lastDropTime = 0;
        let nextDropDelay = Math.random() * 300 + 100;

        let lastPichkaariTime = 0;
        let nextPichkaariDelay = Math.random() * 2000 + 1000;

        const render = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            // Render ambient corner color gradients first (background)
            ambientCorners.forEach(corner => corner.draw(ctx, time));

            // Balloons spawning
            if (time - lastDropTime > nextDropDelay) {
                if (balloons.length < maxBalloons) {
                    balloons.push(new Balloon(width, height));
                    if (Math.random() > 0.6) {
                        balloons.push(new Balloon(width, height));
                    }
                }
                lastDropTime = time;
                nextDropDelay = Math.random() * 400 + 50;
            }

            // Pichkaari spawning
            if (time - lastPichkaariTime > nextPichkaariDelay) {
                if (pichkaaris.length < maxPichkaaris) {
                    pichkaaris.push(new Pichkaari(width, height));
                    // Slight chance to get attacked by two at once
                    if (Math.random() > 0.7) pichkaaris.push(new Pichkaari(width, height));
                }
                lastPichkaariTime = time;
                nextPichkaariDelay = Math.random() * 1500 + 800; // More frequent! Every 0.8s to 2.3s
            }

            splashes.forEach(splash => splash.update());
            splashes = splashes.filter(s => s.life < s.maxLife);
            splashes.forEach(splash => splash.draw(ctx));

            const remainingBalloons: Balloon[] = [];
            balloons.forEach(balloon => {
                const splash = balloon.update(width, height);
                if (splash) {
                    splashes.push(splash);
                }
                if (balloon.active) {
                    remainingBalloons.push(balloon);
                    balloon.draw(ctx);
                }
            });
            balloons = remainingBalloons;

            const remainingPichkaaris: Pichkaari[] = [];
            pichkaaris.forEach(pichkaari => {
                pichkaari.update();
                if (pichkaari.active) {
                    remainingPichkaaris.push(pichkaari);
                    pichkaari.draw(ctx);
                }
            });
            pichkaaris = remainingPichkaaris;

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
                zIndex: zIndex,
                opacity: opacity
            }}
            aria-hidden="true"
        />
    );
}
