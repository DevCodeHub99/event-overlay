'use client';

import { useEffect, useRef, useState } from 'react';

const TRICOLOR = {
    saffron: { r: 255, g: 153, b: 51, hex: '#FF9933' },
    white: { r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    green: { r: 19, g: 136, b: 8, hex: '#138808' },
    navy: { r: 0, g: 0, b: 128, hex: '#000080' },
    gold: { r: 255, g: 215, b: 0, hex: '#FFD700' }
};

const COLOR_LIST = [TRICOLOR.saffron, TRICOLOR.white, TRICOLOR.green, TRICOLOR.gold];

function filterInPlace<T>(arr: T[], predicate: (item: T) => boolean) {
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < arr.length; readIdx++) {
        if (predicate(arr[readIdx])) {
            arr[writeIdx++] = arr[readIdx];
        }
    }
    arr.length = writeIdx;
}

class TricolorSilkWave {
    draw(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, opacity = 0.65) {
        if (opacity <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

        const t = time * 0.0016;
        const waveY = h * 0.06;
        const waveHeight = Math.min(170, Math.max(85, h * 0.2));
        const stripeHeight = waveHeight / 3;
        const segments = 45;
        const dx = (w + 140) / segments;

        const ribbons = [
            {
                colorTop: 'rgba(255, 153, 51, 0.85)',
                colorBottom: 'rgba(255, 120, 0, 0.35)',
                glow: 'rgba(255, 200, 100, 0.45)',
                offsetY: 0
            },
            {
                colorTop: 'rgba(255, 255, 255, 0.9)',
                colorBottom: 'rgba(225, 235, 255, 0.4)',
                glow: 'rgba(255, 255, 255, 0.5)',
                offsetY: stripeHeight * 0.88
            },
            {
                colorTop: 'rgba(19, 136, 8, 0.85)',
                colorBottom: 'rgba(10, 95, 5, 0.35)',
                glow: 'rgba(45, 190, 30, 0.45)',
                offsetY: stripeHeight * 1.76
            }
        ];

        ribbons.forEach((ribbon, rIdx) => {
            const pointsTop: { x: number, y: number }[] = [];
            const pointsBottom: { x: number, y: number }[] = [];

            for (let i = 0; i <= segments; i++) {
                const x = i * dx - 70;
                const wave1 = Math.sin((x * 0.0032) - t * 1.3 + rIdx * 0.35) * 26;
                const wave2 = Math.cos((x * 0.0065) + t * 0.9) * 13;
                const wave3 = Math.sin((x * 0.0016) - t * 0.5) * 16;

                const yCenter = waveY + ribbon.offsetY + wave1 + wave2 + wave3 + (x / w) * (h * 0.04);
                const ribbonThickness = stripeHeight * (1 + Math.sin(x * 0.004 + t) * 0.22);

                pointsTop.push({ x, y: yCenter - ribbonThickness * 0.5 });
                pointsBottom.push({ x, y: yCenter + ribbonThickness * 0.5 });
            }

            const grad = ctx.createLinearGradient(0, waveY, 0, waveY + waveHeight * 1.4);
            grad.addColorStop(0, ribbon.colorTop);
            grad.addColorStop(1, ribbon.colorBottom);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(pointsTop[0].x, pointsTop[0].y);

            for (let i = 0; i < pointsTop.length - 1; i++) {
                const xc = (pointsTop[i].x + pointsTop[i + 1].x) / 2;
                const yc = (pointsTop[i].y + pointsTop[i + 1].y) / 2;
                ctx.quadraticCurveTo(pointsTop[i].x, pointsTop[i].y, xc, yc);
            }
            const lastTop = pointsTop[pointsTop.length - 1];
            ctx.lineTo(lastTop.x, lastTop.y);

            const lastBottom = pointsBottom[pointsBottom.length - 1];
            ctx.lineTo(lastBottom.x, lastBottom.y);

            for (let i = pointsBottom.length - 1; i > 0; i--) {
                const xc = (pointsBottom[i].x + pointsBottom[i - 1].x) / 2;
                const yc = (pointsBottom[i].y + pointsBottom[i - 1].y) / 2;
                ctx.quadraticCurveTo(pointsBottom[i].x, pointsBottom[i].y, xc, yc);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = ribbon.glow;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
            for (let i = 0; i < pointsTop.length - 1; i++) {
                const xc = (pointsTop[i].x + pointsTop[i + 1].x) / 2;
                const yc = (pointsTop[i].y + pointsTop[i + 1].y) / 2;
                ctx.quadraticCurveTo(pointsTop[i].x, pointsTop[i].y, xc, yc);
            }
            ctx.stroke();
        });

        ctx.restore();
    }
}

class WavingFlag {
    x: number = 0;
    y: number = 0;
    width: number = 65;
    height: number = 43;
    vx: number = 0;
    vy: number = 0;
    wobbleSpeed: number = 0.02;
    timeOffset: number = 0;
    waveFreq: number = 0.08;
    waveAmp: number = 4;
    active: boolean = true;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.reset(canvasWidth, canvasHeight);
    }

    reset(w: number, h: number) {
        this.x = Math.random() * (w * 0.85) + w * 0.05;
        this.y = h + Math.random() * 250 + 50;
        this.width = Math.random() * 35 + 55;
        this.height = this.width * (2 / 3);
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = -(Math.random() * 1.5 + 1.1);
        this.wobbleSpeed = Math.random() * 0.04 + 0.02;
        this.timeOffset = Math.random() * 1000;
        this.waveFreq = 0.08;
        this.waveAmp = Math.random() * 4 + 3;
        this.active = true;
    }

    update(time: number, w: number, h: number) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.7 + this.vx;
        if (this.y < -this.height - 100) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const w = this.width;
        const h = this.height;
        const stripeH = h / 3;
        const waveTime = (time + this.timeOffset) * 0.005;

        // Flagpole
        const poleHeight = h * 1.6;
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-4, -6, 4, poleHeight);

        // Gold finial
        ctx.fillStyle = TRICOLOR.gold.hex;
        ctx.beginPath();
        ctx.arc(-2, -6, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 3 Bands
        const slices = 20;
        const sliceWidth = w / slices;
        const stripes = [
            { color: TRICOLOR.saffron.hex, yOffset: 0 },
            { color: TRICOLOR.white.hex, yOffset: stripeH },
            { color: TRICOLOR.green.hex, yOffset: stripeH * 2 }
        ];

        stripes.forEach(stripe => {
            ctx.fillStyle = stripe.color;
            ctx.beginPath();
            for (let i = 0; i <= slices; i++) {
                const curX = i * sliceWidth;
                const wave = Math.sin(curX * this.waveFreq - waveTime) * this.waveAmp * (i / slices);
                const curY = stripe.yOffset + wave;
                if (i === 0) ctx.moveTo(curX, curY);
                else ctx.lineTo(curX, curY);
            }
            for (let i = slices; i >= 0; i--) {
                const curX = i * sliceWidth;
                const wave = Math.sin(curX * this.waveFreq - waveTime) * this.waveAmp * (i / slices);
                const curY = stripe.yOffset + stripeH + wave;
                ctx.lineTo(curX, curY);
            }
            ctx.closePath();
            ctx.fill();
        });

        // Ashoka Chakra (24 Spokes)
        const chakraCenterX = w * 0.5;
        const chakraWave = Math.sin(chakraCenterX * this.waveFreq - waveTime) * this.waveAmp * 0.5;
        const chakraCenterY = stripeH * 1.5 + chakraWave;
        const chakraRadius = stripeH * 0.42;

        ctx.save();
        ctx.translate(chakraCenterX, chakraCenterY);

        ctx.strokeStyle = TRICOLOR.navy.hex;
        ctx.lineWidth = Math.max(1, w * 0.015);
        ctx.beginPath();
        ctx.arc(0, 0, chakraRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = TRICOLOR.navy.hex;
        ctx.beginPath();
        ctx.arc(0, 0, chakraRadius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = Math.max(0.7, w * 0.01);
        for (let s = 0; s < 24; s++) {
            const angle = (s * Math.PI * 2) / 24;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * chakraRadius, Math.sin(angle) * chakraRadius);
            ctx.stroke();
        }

        ctx.restore();

        // Shadow ripple
        const shadowGrad = ctx.createLinearGradient(0, 0, w, 0);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.15)');
        shadowGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)');
        shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        shadowGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}

class Kite {
    x: number = 0;
    y: number = 0;
    size: number = 25;
    vx: number = 0;
    vy: number = 0;
    angle: number = 0;
    wobbleSpeed: number = 0.02;
    timeOffset: number = 0;
    active: boolean = true;
    tailLength: number = 10;
    tailHistory: { x: number, y: number }[] = [];

    constructor(canvasWidth: number, canvasHeight: number) {
        this.reset(canvasWidth, canvasHeight);
    }

    reset(w: number, h: number) {
        this.x = Math.random() * (w * 0.8) + w * 0.1;
        this.y = h + Math.random() * 200 + 50;
        this.size = Math.random() * 20 + 18;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 1.5 + 1.2);
        this.angle = (Math.random() - 0.5) * 0.5;
        this.wobbleSpeed = Math.random() * 0.02 + 0.015;
        this.timeOffset = Math.random() * 1000;
        this.active = true;

        this.tailLength = Math.floor(Math.random() * 8 + 8);
        this.tailHistory = [];
        for (let i = 0; i < this.tailLength; i++) {
            this.tailHistory.push({ x: this.x, y: this.y + i * 8 });
        }
    }

    update(time: number, w: number, h: number) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.8 + this.vx;
        this.angle = Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 0.2;

        this.tailHistory.unshift({ x: this.x, y: this.y + this.size });
        if (this.tailHistory.length > this.tailLength) {
            this.tailHistory.pop();
        }

        if (this.y < -150) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const s = this.size;

        ctx.fillStyle = TRICOLOR.saffron.hex;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(-s * 0.75, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = TRICOLOR.white.hex;
        ctx.beginPath();
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = TRICOLOR.navy.hex;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = TRICOLOR.green.hex;
        ctx.beginPath();
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.1);
        ctx.lineTo(0, s * 1.1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-s * 0.8, 0);
        ctx.quadraticCurveTo(0, -s * 0.4, s * 0.8, 0);
        ctx.stroke();

        ctx.fillStyle = TRICOLOR.saffron.hex;
        ctx.beginPath();
        ctx.arc(0, s, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (this.tailHistory.length > 1) {
            ctx.save();
            ctx.lineWidth = 2.5;
            for (let i = 0; i < this.tailHistory.length - 1; i++) {
                const p1 = this.tailHistory[i];
                const p2 = this.tailHistory[i + 1];
                const colorMod = i % 3;
                ctx.strokeStyle = colorMod === 0 ? TRICOLOR.saffron.hex : colorMod === 1 ? TRICOLOR.white.hex : TRICOLOR.green.hex;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}

class SmokeParticle {
    x: number;
    y: number;
    color: { r: number, g: number, b: number };
    size: number;
    vx: number;
    vy: number;
    life: number = 0;
    maxLife: number;

    constructor(x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.maxLife = Math.random() * 35 + 40;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.size *= 1.015;
        this.life++;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const alpha = Math.max(0, (1 - progress) * 0.45);
        ctx.save();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class JetAirshow {
    x: number;
    y: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    vx: number;
    vy: number;
    angle: number;
    speed: number;
    smokeParticles: SmokeParticle[] = [];
    active: boolean = true;

    constructor(w: number, h: number) {
        this.startX = -100;
        this.startY = Math.random() * (h * 0.3) + h * 0.1;
        this.endX = w + 100;
        this.endY = this.startY + (Math.random() - 0.5) * 150;

        this.x = this.startX;
        this.y = this.startY;
        this.speed = Math.random() * 6 + 10;

        const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;
    }

    update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < w + 50) {
            const perpX = -Math.sin(this.angle);
            const perpY = Math.cos(this.angle);

            this.smokeParticles.push(new SmokeParticle(
                this.x + perpX * 8, this.y + perpY * 8,
                TRICOLOR.saffron, 6, -this.vx * 0.1, -this.vy * 0.1
            ));
            this.smokeParticles.push(new SmokeParticle(
                this.x, this.y,
                TRICOLOR.white, 6, -this.vx * 0.1, -this.vy * 0.1
            ));
            this.smokeParticles.push(new SmokeParticle(
                this.x - perpX * 8, this.y - perpY * 8,
                TRICOLOR.green, 6, -this.vx * 0.1, -this.vy * 0.1
            ));
        }

        for (let i = 0; i < this.smokeParticles.length; i++) {
            this.smokeParticles[i].update();
        }
        filterInPlace(this.smokeParticles, p => p.life < p.maxLife);

        if (this.x > w + 150 && this.smokeParticles.length === 0) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.smokeParticles.length; i++) {
            this.smokeParticles[i].draw(ctx);
        }

        if (this.x > -50 && this.x < window.innerWidth + 50) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.lineTo(-12, -14);
            ctx.lineTo(-6, -3);
            ctx.lineTo(-16, -6);
            ctx.lineTo(-14, 0);
            ctx.lineTo(-16, 6);
            ctx.lineTo(-6, 3);
            ctx.lineTo(-12, 14);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#00BFFF';
            ctx.beginPath();
            ctx.ellipse(4, 0, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}

class FireworkSpark {
    x: number;
    y: number;
    color: { r: number, g: number, b: number };
    vx: number;
    vy: number;
    life: number = 0;
    maxLife: number;
    size: number;
    gravity: number = 0.08;

    constructor(x: number, y: number, color: { r: number, g: number, b: number }) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.maxLife = Math.random() * 30 + 25;
        this.size = Math.random() * 2.5 + 1.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life++;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const alpha = Math.max(0, 1 - this.life / this.maxLife);
        ctx.save();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FireworkBurst {
    x: number;
    y: number;
    targetY: number;
    vy: number;
    color: { r: number, g: number, b: number };
    exploded: boolean = false;
    sparks: FireworkSpark[] = [];
    active: boolean = true;

    constructor(w: number, h: number) {
        this.x = Math.random() * (w * 0.7) + w * 0.15;
        this.targetY = Math.random() * (h * 0.35) + h * 0.1;
        this.y = h + 20;
        this.vy = -(Math.random() * 5 + 10);
        this.color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
    }

    update(w: number, h: number) {
        if (!this.exploded) {
            this.y += this.vy;
            if (this.y <= this.targetY || this.vy >= 0) {
                this.exploded = true;
                const numSparks = Math.floor(Math.random() * 30 + 35);
                for (let i = 0; i < numSparks; i++) {
                    const sparkColor = (i % 4 === 0) ? TRICOLOR.gold : (i % 3 === 0) ? TRICOLOR.saffron : (i % 2 === 0) ? TRICOLOR.white : TRICOLOR.green;
                    this.sparks.push(new FireworkSpark(this.x, this.y, sparkColor));
                }
            }
        } else {
            for (let i = 0; i < this.sparks.length; i++) {
                this.sparks[i].update();
            }
            filterInPlace(this.sparks, s => s.life < s.maxLife);
            if (this.sparks.length === 0) {
                this.active = false;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.exploded) {
            ctx.save();
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            for (let i = 0; i < this.sparks.length; i++) {
                this.sparks[i].draw(ctx);
            }
        }
    }
}

class Petal {
    x: number = 0;
    y: number = 0;
    size: number = 8;
    color: { r: number, g: number, b: number } = COLOR_LIST[0];
    vy: number = 1.5;
    vx: number = 0;
    rot: number = 0;
    rotSpeed: number = 0.02;
    wobbleSpeed: number = 0.02;
    timeOffset: number = 0;

    constructor(w: number, h: number) {
        this.reset(w, h);
    }

    reset(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = -20;
        this.size = Math.random() * 7 + 5;
        this.color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
        this.vy = Math.random() * 1.2 + 1.0;
        this.vx = (Math.random() - 0.5) * 1.0;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.08;
        this.wobbleSpeed = Math.random() * 0.02 + 0.015;
        this.timeOffset = Math.random() * 100;
    }

    update(time: number, w: number, h: number) {
        this.y += this.vy;
        this.x += Math.sin((time + this.timeOffset) * this.wobbleSpeed) * 1.2 + this.vx;
        this.rot += this.rotSpeed;

        if (this.y > h + 30) {
            this.reset(w, h);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.85)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export interface IndependenceDayOverlayProps {
    maxFlags?: number;
    maxKites?: number;
    maxJets?: number;
    maxFireworks?: number;
    maxPetals?: number;
    showGlow?: boolean;
    showWave?: boolean;
    waveOpacity?: number;
    zIndex?: number;
    opacity?: number;
    /** Show accessible floating pause/resume control button */
    showControls?: boolean;
    /** Position of floating control */
    controlPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Remember user pause/dismiss choice for current session */
    persistPreference?: boolean;
}

export default function IndependenceDayOverlay({
    maxFlags = 3,
    maxKites = 6,
    maxJets = 2,
    maxFireworks = 3,
    maxPetals = 35,
    showGlow = true,
    showWave = true,
    waveOpacity = 0.65,
    zIndex = 99999,
    opacity = 0.95,
    showControls = true,
    controlPosition = 'bottom-right',
    persistPreference = true
}: IndependenceDayOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [paused, setPaused] = useState<boolean>(() => {
        if (typeof window === 'undefined' || !persistPreference) return false;
        try {
            return sessionStorage.getItem('event_overlay_paused') === 'true';
        } catch {
            return false;
        }
    });

    const [dismissed, setDismissed] = useState<boolean>(() => {
        if (typeof window === 'undefined' || !persistPreference) return false;
        try {
            return sessionStorage.getItem('event_overlay_dismissed') === 'true';
        } catch {
            return false;
        }
    });

    const pausedRef = useRef(paused);
    pausedRef.current = paused;

    const togglePause = () => {
        setPaused((prev) => {
            const next = !prev;
            if (persistPreference && typeof sessionStorage !== 'undefined') {
                try {
                    if (next) {
                        sessionStorage.setItem('event_overlay_paused', 'true');
                    } else {
                        sessionStorage.removeItem('event_overlay_paused');
                    }
                } catch {}
            }
            return next;
        });
    };

    const handleDismiss = () => {
        setDismissed(true);
        setPaused(true);
        if (persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.setItem('event_overlay_dismissed', 'true');
            } catch {}
        }
    };

    const handleUndismiss = () => {
        setDismissed(false);
        setPaused(false);
        if (persistPreference && typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.removeItem('event_overlay_dismissed');
                sessionStorage.removeItem('event_overlay_paused');
            } catch {}
        }
    };

    useEffect(() => {
        if (dismissed) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                togglePause();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dismissed]);

    useEffect(() => {
        if (dismissed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const silkWave = new TricolorSilkWave();

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', setSize);
        setSize();

        let flags: WavingFlag[] = [];
        for (let i = 0; i < maxFlags; i++) {
            const f = new WavingFlag(width, height);
            f.y = Math.random() * (height * 0.7) + height * 0.3;
            flags.push(f);
        }

        let kites: Kite[] = [];
        for (let i = 0; i < maxKites; i++) kites.push(new Kite(width, height));

        let petals: Petal[] = [];
        for (let i = 0; i < maxPetals; i++) {
            const p = new Petal(width, height);
            p.y = Math.random() * height;
            petals.push(p);
        }

        let jets: JetAirshow[] = [];
        let fireworks: FireworkBurst[] = [];

        let lastJetTime = 0;
        let nextJetDelay = Math.random() * 4000 + 2000;

        let lastFireworkTime = 0;
        let nextFireworkDelay = Math.random() * 2000 + 1000;

        const render = (time: number) => {
            if (pausedRef.current || document.hidden) return;
            ctx.clearRect(0, 0, width, height);

            // 1. Ambient Glow
            if (showGlow) {
                const pulse = Math.sin(time * 0.001) * 0.05 + 0.95;
                const topGrad = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, height * 0.45 * pulse);
                topGrad.addColorStop(0, 'rgba(255, 153, 51, 0.25)');
                topGrad.addColorStop(0.5, 'rgba(255, 153, 51, 0.08)');
                topGrad.addColorStop(1, 'rgba(255, 153, 51, 0)');
                ctx.fillStyle = topGrad;
                ctx.fillRect(0, 0, width, height * 0.5);

                const bottomGrad = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, height * 0.45 * pulse);
                bottomGrad.addColorStop(0, 'rgba(19, 136, 8, 0.25)');
                bottomGrad.addColorStop(0.5, 'rgba(19, 136, 8, 0.08)');
                bottomGrad.addColorStop(1, 'rgba(19, 136, 8, 0)');
                ctx.fillStyle = bottomGrad;
                ctx.fillRect(0, height * 0.5, width, height * 0.5);
            }

            // 2. Flowing Tricolor Silk Wave
            if (showWave) {
                silkWave.draw(ctx, width, height, time, waveOpacity);
            }

            // 3. Petals
            for (let i = 0; i < petals.length; i++) {
                petals[i].update(time, width, height);
                petals[i].draw(ctx);
            }

            // 4. Waving Indian Flags
            if (flags.length < maxFlags) flags.push(new WavingFlag(width, height));
            for (let i = 0; i < flags.length; i++) {
                flags[i].update(time, width, height);
                flags[i].draw(ctx, time);
            }
            filterInPlace(flags, f => f.active);

            // 5. Kites
            if (kites.length < maxKites) kites.push(new Kite(width, height));
            for (let i = 0; i < kites.length; i++) {
                kites[i].update(time, width, height);
                kites[i].draw(ctx);
            }
            filterInPlace(kites, k => k.active);

            // 6. Jets
            if (time - lastJetTime > nextJetDelay) {
                if (jets.length < maxJets) jets.push(new JetAirshow(width, height));
                lastJetTime = time;
                nextJetDelay = Math.random() * 5000 + 4000;
            }
            for (let i = 0; i < jets.length; i++) {
                jets[i].update(width, height);
                jets[i].draw(ctx);
            }
            filterInPlace(jets, j => j.active);

            // 7. Fireworks
            if (time - lastFireworkTime > nextFireworkDelay) {
                if (fireworks.length < maxFireworks) fireworks.push(new FireworkBurst(width, height));
                lastFireworkTime = time;
                nextFireworkDelay = Math.random() * 3000 + 1500;
            }
            for (let i = 0; i < fireworks.length; i++) {
                fireworks[i].update(width, height);
                fireworks[i].draw(ctx);
            }
            filterInPlace(fireworks, f => f.active);

            animationFrameId = requestAnimationFrame(render);
        };

        // Visibility Change listener
        const onVisibilityChange = () => {
            if (!document.hidden && !pausedRef.current) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        if (!pausedRef.current) {
            animationFrameId = requestAnimationFrame(render);
        }

        return () => {
            window.removeEventListener('resize', setSize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dismissed, paused, maxFlags, maxKites, maxJets, maxFireworks, maxPetals, showGlow, showWave, waveOpacity]);



    const posStyles: Record<string, React.CSSProperties> = {
        'bottom-right': { bottom: 20, right: 20 },
        'bottom-left': { bottom: 20, left: 20 },
        'top-right': { top: 20, right: 20 },
        'top-left': { top: 20, left: 20 }
    };
    const controlPosStyle = posStyles[controlPosition] || posStyles['bottom-right'];

    return (
        <>
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
                    opacity: paused ? 0 : opacity,
                    transition: 'opacity 0.25s ease'
                }}
                aria-hidden="true"
            />
            {showControls && (
                <div
                    role="region"
                    aria-label="Celebration overlay controls"
                    style={{
                        position: 'fixed',
                        ...controlPosStyle,
                        zIndex: zIndex + 1,
                        pointerEvents: 'auto',
                        userSelect: 'none'
                    }}
                >
                    {dismissed ? (
                        <button
                            type="button"
                            onClick={handleUndismiss}
                            aria-label="Show celebration overlay (Press Esc)"
                            title="Show celebration overlay (Press Esc)"
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: 'rgba(15,23,42,0.85)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.22)',
                                boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 17,
                                color: '#F8FAFC',
                                transition: 'transform 0.2s ease, border-color 0.2s ease',
                                outline: 'none'
                            }}
                        >
                            🇮🇳
                        </button>
                    ) : (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: 'rgba(15,23,42,0.85)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                borderRadius: 9999,
                                padding: '5px 8px 5px 12px',
                                boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
                                color: '#F8FAFC',
                                fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
                                fontSize: 12,
                                fontWeight: 500,
                                transition: 'opacity 0.2s ease, transform 0.2s ease'
                            }}
                        >
                            <button
                                type="button"
                                onClick={togglePause}
                                aria-pressed={paused}
                                aria-label={paused ? 'Resume celebration effects (Press Esc)' : 'Pause celebration effects (Press Esc)'}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#F8FAFC',
                                    fontFamily: 'inherit',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    outline: 'none'
                                }}
                            >
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: paused ? '#F59E0B' : '#10B981',
                                        display: 'inline-block',
                                        transition: 'background 0.2s ease'
                                    }}
                                />
                                <span>{paused ? 'Resume' : 'Pause'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                aria-label="Dismiss celebration overlay"
                                title="Dismiss celebration overlay (Click icon to restore)"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: 'none',
                                    color: '#94A3B8',
                                    fontFamily: 'inherit',
                                    fontSize: 13,
                                    lineHeight: 1,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginLeft: 2,
                                    transition: 'color 0.15s ease, background 0.15s ease',
                                    outline: 'none'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
