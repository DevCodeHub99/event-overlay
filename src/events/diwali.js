/**
 * 🪔 Diwali Festival of Lights Event Module for Event Overlay
 * Features:
 *  - Grand Aerial Fireworks (Peony, Willow, Crackling Chrysanthemum)
 *  - Traditional Anar (Golden Fountain / Flowerpot)
 *  - Chakri (Ground Spinner) emitting spiral spark vortexes
 *  - Floating & Bottom Diyas (Clay lamps with organic flickering flame and warm glow)
 *  - Akash Kandil (Sky Lanterns drifting upward with gentle wind sway)
 *  - Phuljhadi (Interactive Sparkler cursor emitting starburst sparks)
 *  - Ambient golden embers and festive atmospheric glow
 *
 * @module event-overlay/events/diwali
 */

import { filterInPlace, randomRange } from '../core/utils.js';

export const DIWALI_COLORS = [
    { r: 255, g: 215, b: 0 },   // Royal Gold
    { r: 255, g: 140, b: 0 },   // Deep Amber / Orange
    { r: 255, g: 69, b: 0 },    // Saffron Fire
    { r: 255, g: 45, b: 85 },   // Festive Crimson Pink
    { r: 0, g: 230, b: 118 },   // Emerald Green
    { r: 0, g: 229, b: 255 },   // Electric Cyan
    { r: 179, g: 136, b: 255 }, // Royal Purple
    { r: 255, g: 248, b: 220 }  // Sparkling White-Yellow
];

const MAX_SPARKS = 850;
const MAX_DIYA_FLAMES = 25;
const MAX_SKY_LANTERNS = 12;

// ─── PARTICLE (Sparks, Embers, Crackles) ───
class SparkParticle {
    constructor(x, y, color, vx, vy, options = {}) {
        this.x = x;
        this.y = y;
        this.color = color || DIWALI_COLORS[0];
        this.vx = vx ?? (Math.random() - 0.5) * 8;
        this.vy = vy ?? (Math.random() - 0.5) * 8;
        this.gravity = options.gravity ?? 0.18;
        this.friction = options.friction ?? 0.96;
        this.size = options.size ?? randomRange(1.5, 3.8);
        this.life = 0;
        this.maxLife = options.maxLife ?? randomRange(30, 65);
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

    draw(ctx) {
        const fade = Math.max(0, 1 - this.life / this.maxLife);
        if (fade <= 0) return;

        let alpha = fade;
        if (this.flicker) {
            alpha *= (0.4 + Math.random() * 0.6);
        }

        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;

        // Draw trail if enabled
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

        // Draw spark core
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.6, this.size * fade), 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── ROCKET (Aerial Firework Launcher) ───
class Rocket {
    constructor(targetX, targetY, startX, startY, color) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color || DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy);
        const speed = randomRange(13, 19);

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.life = 0;
        this.maxLife = Math.max(15, Math.floor(dist / speed));
        this.exploded = false;
        this.sparkTimer = 0;
    }

    update(sparks) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // slight deceleration
        this.life++;

        // Rocket ascent exhaust trail
        if (sparks.length < MAX_SPARKS && Math.random() > 0.2) {
            sparks.push(new SparkParticle(
                this.x + (Math.random() - 0.5) * 4,
                this.y + (Math.random() - 0.5) * 4,
                { r: 255, g: 200, b: 100 },
                -this.vx * 0.15 + (Math.random() - 0.5) * 1.5,
                -this.vy * 0.15 + (Math.random() - 0.5) * 1.5,
                { size: randomRange(1.2, 2.5), maxLife: randomRange(12, 24), gravity: 0.1 }
            ));
        }

        if (this.life >= this.maxLife || this.y <= this.targetY) {
            this.explode(sparks);
            this.exploded = true;
        }
    }

    explode(sparks) {
        const burstType = Math.random();
        const burstCount = Math.floor(randomRange(55, 90));
        const color = this.color;
        const secondaryColor = DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];

        if (burstType < 0.45) {
            // 1. Classic Peony / Chrysanthemum (Spherical burst with crackle)
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.3;
                const speed = randomRange(3.5, 9.5);
                const col = Math.random() > 0.3 ? color : secondaryColor;
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    col,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    {
                        size: randomRange(2.0, 3.8),
                        maxLife: randomRange(40, 75),
                        gravity: 0.12,
                        friction: 0.94,
                        flicker: true,
                        trail: true
                    }
                ));
            }
        } else if (burstType < 0.75) {
            // 2. Willow / Kamuro (Heavy gold drooping waterfall trail)
            const willowColor = { r: 255, g: 220, b: 120 };
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = Math.random() * Math.PI * 2;
                const speed = randomRange(2.0, 7.5);
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    willowColor,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed * 0.8,
                    {
                        size: randomRange(2.2, 4.0),
                        maxLife: randomRange(60, 100),
                        gravity: 0.22,
                        friction: 0.92,
                        flicker: true,
                        trail: true
                    }
                ));
            }
        } else {
            // 3. Ring / Starburst
            for (let i = 0; i < burstCount; i++) {
                if (sparks.length >= MAX_SPARKS) break;
                const angle = (Math.PI * 2 * i) / burstCount;
                const speed = randomRange(6.0, 8.5);
                sparks.push(new SparkParticle(
                    this.x,
                    this.y,
                    secondaryColor,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    {
                        size: randomRange(1.8, 3.2),
                        maxLife: randomRange(35, 60),
                        gravity: 0.08,
                        friction: 0.96,
                        flicker: false,
                        trail: false
                    }
                ));
            }
        }
    }

    draw(ctx) {
        if (this.exploded) return;
        ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── ANAR (Fountain / Flowerpot Cracker) ───
class AnarFountain {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.colors = colors || DIWALI_COLORS;
        this.active = true;
        this.life = 0;
        this.maxLife = randomRange(220, 360);
    }

    update(sparks) {
        this.life++;
        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        // Height curve: starts small, surges, then gently dies down
        const progress = this.life / this.maxLife;
        const intensity = Math.sin(progress * Math.PI);
        const particlesToEmit = Math.floor(randomRange(4, 9) * intensity);

        for (let i = 0; i < particlesToEmit; i++) {
            if (sparks.length >= MAX_SPARKS) break;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const spreadX = (Math.random() - 0.5) * 4.5;
            const shootSpeed = -randomRange(10, 22) * intensity;
            
            sparks.push(new SparkParticle(
                this.x + (Math.random() - 0.5) * 8,
                this.y - 10,
                color,
                spreadX,
                shootSpeed,
                {
                    size: randomRange(1.5, 3.5),
                    maxLife: randomRange(35, 65),
                    gravity: 0.38,
                    friction: 0.97,
                    flicker: true,
                    trail: false
                }
            ));
        }
    }

    draw(ctx) {
        // Draw decorative clay cone for Anar at the base
        const w = 26;
        const h = 34;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Cone body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Golden rim bands
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tip glow
        const glow = ctx.createRadialGradient(0, -h, 2, 0, -h, 18);
        glow.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
        glow.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -h, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ─── CHAKRI (Ground Spinner) ───
class ChakriSpinner {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.colors = colors || DIWALI_COLORS;
        this.angle = 0;
        this.speed = randomRange(0.25, 0.45);
        this.life = 0;
        this.maxLife = randomRange(200, 320);
        this.active = true;
    }

    update(sparks) {
        this.life++;
        this.angle += this.speed;

        if (this.life >= this.maxLife) {
            this.active = false;
            return;
        }

        // Emit spiral tangential sparks
        const arms = 3;
        for (let a = 0; a < arms; a++) {
            if (sparks.length >= MAX_SPARKS) break;
            const currentAngle = this.angle + (Math.PI * 2 * a) / arms;
            const tangent = currentAngle + Math.PI / 2;
            const tangentialSpeed = randomRange(4.5, 9.5);
            const color = this.colors[a % this.colors.length];

            const spawnDist = 14;
            const sx = this.x + Math.cos(currentAngle) * spawnDist;
            const sy = this.y + Math.sin(currentAngle) * spawnDist;

            sparks.push(new SparkParticle(
                sx,
                sy,
                color,
                Math.cos(tangent) * tangentialSpeed,
                Math.sin(tangent) * tangentialSpeed,
                {
                    size: randomRange(1.8, 3.4),
                    maxLife: randomRange(25, 45),
                    gravity: 0.15,
                    friction: 0.95,
                    flicker: true,
                    trail: true
                }
            ));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Center hub
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

// ─── DIYA (Clay Lamp with Flickering Flame) ───
class DiyaLamp {
    constructor(x, y, scale = 1.0) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.flickerPhase = Math.random() * Math.PI * 2;
        this.flickerSpeed = randomRange(0.08, 0.16);
    }

    draw(ctx, time) {
        const s = this.scale;
        const x = this.x;
        const y = this.y;

        this.flickerPhase += this.flickerSpeed;
        const flameFlutter = Math.sin(this.flickerPhase) * 1.5 + (Math.random() - 0.5) * 1.0;
        const flameHeight = (18 + Math.sin(time * 0.006 + this.flickerPhase) * 3) * s;

        ctx.save();
        ctx.translate(x, y);

        // 1. Ambient Warm Glow
        const glowRadius = (45 + Math.sin(this.flickerPhase) * 6) * s;
        const glow = ctx.createRadialGradient(0, -flameHeight * 0.5, 3 * s, 0, -flameHeight * 0.5, glowRadius);
        glow.addColorStop(0, 'rgba(255, 200, 50, 0.45)');
        glow.addColorStop(0.5, 'rgba(255, 120, 20, 0.15)');
        glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -flameHeight * 0.5, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Terracotta Clay Bowl
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 10 * s, 0, 0, Math.PI);
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2 * s;
        ctx.stroke();

        // Diya rim
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#CD853F';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 3. Flame
        // Outer Orange Flame
        ctx.beginPath();
        ctx.moveTo(-5 * s, 0);
        ctx.quadraticCurveTo(-6 * s, -flameHeight * 0.6, flameFlutter, -flameHeight);
        ctx.quadraticCurveTo(6 * s, -flameHeight * 0.6, 5 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FF4500';
        ctx.fill();

        // Inner Golden Yellow Flame
        ctx.beginPath();
        ctx.moveTo(-3 * s, 0);
        ctx.quadraticCurveTo(-3.5 * s, -flameHeight * 0.5, flameFlutter * 0.7, -flameHeight * 0.85);
        ctx.quadraticCurveTo(3.5 * s, -flameHeight * 0.5, 3 * s, 0);
        ctx.closePath();
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        // Core White-Hot Wick
        ctx.beginPath();
        ctx.ellipse(0, -2 * s, 1.8 * s, 3.5 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
    }
}

// ─── AKASH KANDIL (Sky Lantern) ───
class SkyLantern {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = randomRange(width * 0.08, width * 0.92);
        this.y = height + randomRange(20, 100);
        this.speedY = randomRange(0.65, 1.35);
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = randomRange(0.015, 0.03);
        this.size = randomRange(16, 26);
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

    draw(ctx) {
        const w = this.size;
        const h = this.size * 1.35;
        const x = this.x;
        const y = this.y;

        ctx.save();
        ctx.translate(x, y);

        // Lantern Ambient Glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 1.6);
        glow.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.65)`);
        glow.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, w * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Paper Body (Trapezoid / rounded rectangle)
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.4, -h * 0.5);
        ctx.lineTo(w * 0.55, h * 0.5);
        ctx.lineTo(-w * 0.55, h * 0.5);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
        bodyGrad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.88)`);
        bodyGrad.addColorStop(1, 'rgba(255, 230, 140, 0.95)');
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Bamboo rim
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner glowing flame
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, h * 0.35, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ─── DIWALI EVENT ENGINE MODULE ───
export const DiwaliEvent = {
    id: 'diwali',
    name: 'Diwali Festival of Lights',

    init(engine, options = {}) {
        this.engine = engine;
        this.options = options;
        this.sparks = [];
        this.rockets = [];
        this.fountains = [];
        this.spinners = [];
        this.diyas = [];
        this.skyLanterns = [];

        // Configuration
        this.colors = options.colors || DIWALI_COLORS;
        this.enableFireworks = options.enableFireworks !== false;
        this.enableDiyas = options.enableDiyas !== false;
        this.enableFountains = options.enableFountains !== false;
        this.enableSpinners = options.enableSpinners !== false;
        this.enableLanterns = options.enableLanterns !== false;
        this.sparklerCursor = options.sparklerCursor !== false;

        // Timers
        this.lastRocketTime = 0;
        this.nextRocketDelay = randomRange(500, 1400);
        this.lastFountainTime = 0;
        this.nextFountainDelay = randomRange(3500, 6000);
        this.lastSpinnerTime = 0;
        this.nextSpinnerDelay = randomRange(4500, 8000);
        this.lastLanternTime = 0;
        this.nextLanternDelay = randomRange(1200, 3000);

        // Pointer tracking for interactive Phuljhadi (Sparkler)
        this.lastPointer = null;
        this.handlePointerMove = (e) => {
            if (!this.sparklerCursor) return;
            const x = e.clientX;
            const y = e.clientY;
            this.emitSparkler(x, y);
            this.lastPointer = { x, y };
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        }
    },

    resize(width, height) {
        const w = width || (typeof window !== 'undefined' ? window.innerWidth : 1200);
        const h = height || (typeof window !== 'undefined' ? window.innerHeight : 800);

        // Build bottom diya garland
        if (this.enableDiyas) {
            this.diyas = [];
            const diyaCount = Math.min(MAX_DIYA_FLAMES, Math.max(5, Math.floor(w / 80)));
            const step = w / diyaCount;
            for (let i = 0; i < diyaCount; i++) {
                const x = step * i + step * 0.5 + (Math.random() - 0.5) * 12;
                const y = h - 16;
                this.diyas.push(new DiyaLamp(x, y, 0.85 + Math.random() * 0.25));
            }
        }
    },

    emitSparkler(x, y) {
        if (this.sparks.length >= MAX_SPARKS) return;
        const sparkCount = Math.floor(randomRange(2, 5));
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = randomRange(1.8, 5.5);
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.sparks.push(new SparkParticle(
                x,
                y,
                color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                {
                    size: randomRange(1.5, 3.2),
                    maxLife: randomRange(18, 38),
                    gravity: 0.12,
                    friction: 0.94,
                    flicker: true,
                    trail: false
                }
            ));
        }
    },

    triggerBurst(x, y) {
        // Direct tap/click triggers instant aerial burst + launches rocket
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const burstCount = Math.floor(randomRange(60, 95));

        for (let i = 0; i < burstCount; i++) {
            if (this.sparks.length >= MAX_SPARKS) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = randomRange(2.5, 9.0);
            this.sparks.push(new SparkParticle(
                x,
                y,
                color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                {
                    size: randomRange(2.0, 4.0),
                    maxLife: randomRange(35, 75),
                    gravity: 0.15,
                    friction: 0.93,
                    flicker: true,
                    trail: true
                }
            ));
        }
    },

    update(time, delta, width, height) {
        const w = width;
        const h = height;

        // 1. Spawning Sky Rockets
        if (this.enableFireworks && time - this.lastRocketTime > this.nextRocketDelay) {
            const targetX = randomRange(w * 0.15, w * 0.85);
            const targetY = randomRange(h * 0.12, h * 0.52);
            const startX = randomRange(w * 0.25, w * 0.75);
            const startY = h + 10;
            this.rockets.push(new Rocket(targetX, targetY, startX, startY));
            this.lastRocketTime = time;
            this.nextRocketDelay = randomRange(600, 1600);
        }

        // 2. Spawning Anar Fountains (Bottom left & right)
        if (this.enableFountains && time - this.lastFountainTime > this.nextFountainDelay) {
            const isLeft = Math.random() > 0.5;
            const fx = isLeft ? randomRange(w * 0.08, w * 0.25) : randomRange(w * 0.75, w * 0.92);
            this.fountains.push(new AnarFountain(fx, h - 18, this.colors));
            this.lastFountainTime = time;
            this.nextFountainDelay = randomRange(3500, 7000);
        }

        // 3. Spawning Chakri Ground Spinners
        if (this.enableSpinners && time - this.lastSpinnerTime > this.nextSpinnerDelay) {
            const cx = randomRange(w * 0.2, w * 0.8);
            this.spinners.push(new ChakriSpinner(cx, h - 30, this.colors));
            this.lastSpinnerTime = time;
            this.nextSpinnerDelay = randomRange(5000, 9500);
        }

        // 4. Spawning Sky Lanterns
        if (this.enableLanterns && time - this.lastLanternTime > this.nextLanternDelay) {
            if (this.skyLanterns.length < MAX_SKY_LANTERNS) {
                this.skyLanterns.push(new SkyLantern(w, h));
            }
            this.lastLanternTime = time;
            this.nextLanternDelay = randomRange(1400, 3200);
        }

        // Update Rockets
        for (let i = 0; i < this.rockets.length; i++) {
            this.rockets[i].update(this.sparks);
        }
        filterInPlace(this.rockets, (r) => !r.exploded);

        // Update Fountains
        for (let i = 0; i < this.fountains.length; i++) {
            this.fountains[i].update(this.sparks);
        }
        filterInPlace(this.fountains, (f) => f.active);

        // Update Spinners
        for (let i = 0; i < this.spinners.length; i++) {
            this.spinners[i].update(this.sparks);
        }
        filterInPlace(this.spinners, (s) => s.active);

        // Update Sky Lanterns
        for (let i = 0; i < this.skyLanterns.length; i++) {
            this.skyLanterns[i].update();
        }
        filterInPlace(this.skyLanterns, (l) => l.active);

        // Update Sparks
        for (let i = 0; i < this.sparks.length; i++) {
            this.sparks[i].update();
        }
        filterInPlace(this.sparks, (p) => p.life < p.maxLife);
    },

    draw(ctx, width, height, time) {
        // 1. Draw Sky Lanterns (soft floating lights)
        if (this.enableLanterns) {
            for (let i = 0; i < this.skyLanterns.length; i++) {
                this.skyLanterns[i].draw(ctx);
            }
        }

        // 2. Draw Fountains cones
        for (let i = 0; i < this.fountains.length; i++) {
            this.fountains[i].draw(ctx);
        }

        // 3. Draw Spinners hub
        for (let i = 0; i < this.spinners.length; i++) {
            this.spinners[i].draw(ctx);
        }

        // 4. Draw Rockets ascending heads
        for (let i = 0; i < this.rockets.length; i++) {
            this.rockets[i].draw(ctx);
        }

        // 5. Draw All Sparks with Additive Blending for Intense Brilliant Glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.sparks.length; i++) {
            this.sparks[i].draw(ctx);
        }
        ctx.restore();

        // 6. Draw Bottom Garland of Diyas
        if (this.enableDiyas) {
            for (let i = 0; i < this.diyas.length; i++) {
                this.diyas[i].draw(ctx, time);
            }
        }
    },

    destroy() {
        if (typeof window !== 'undefined' && this.handlePointerMove) {
            window.removeEventListener('pointermove', this.handlePointerMove);
        }
        this.sparks = [];
        this.rockets = [];
        this.fountains = [];
        this.spinners = [];
        this.diyas = [];
        this.skyLanterns = [];
    }
};

export default DiwaliEvent;
