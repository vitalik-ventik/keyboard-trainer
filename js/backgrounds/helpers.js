// backgrounds/helpers.js — спільні хелпери піксельних фонів:
// детермінований PRNG, буфери-полотна, небо, рельєф, смуги паралаксу, падаючі частинки

import { _fx } from "./effects.js";

// Детермінований генератор випадкових чисел, щоб світ виглядав однаково при кожному запуску
function pixelRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pixelBlockSize(H) {
    return Math.max(8, Math.round(H / 28));
}

// Смуга шириною stripW повторюється по горизонталі зі зсувом factor × пройденої відстані
function drawScrollingStrip(ctx, strip, W, bottomY, time, speed, factor) {
    const stripW = strip.width;
    const offset = Math.round(time * speed * factor) % stripW;
    // Камера стежить за стрибком: ближчі шари (більший factor) зсуваються сильніше
    const camShift = (typeof _fx !== "undefined" && _fx.camY) ? _fx.camY * factor * 3 : 0;
    const y = Math.round(bottomY + camShift) - strip.height;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(strip, x, y);
    }
}

function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}

// Небо-градієнт у буфері на весь екран
function makeSky(W, H, stops) {
    const sky = makeCanvas(W, H);
    const sx = sky.getContext("2d");
    const g = sx.createLinearGradient(0, 0, 0, H);
    for (const stop of stops) {
        g.addColorStop(stop[0], stop[1]);
    }
    sx.fillStyle = g;
    sx.fillRect(0, 0, sky.width, sky.height);
    return sky;
}

// Періодичні висоти стовпчиків: ціле число хвиль на ширину, щоб смуга безшовно повторювалась
function periodicHeights(cols, base, waves) {
    const hs = [];
    for (let c = 0; c < cols; c++) {
        let v = base;
        for (const w of waves) {
            v += w.amp * Math.sin(Math.PI * 2 * c * w.k / cols + w.ph);
        }
        hs.push(Math.max(1, Math.round(v)));
    }
    return hs;
}

// Блоковий рельєф: верхній блок одного кольору, нижче — «тіло» з піксельною текстурою
function drawBlockTerrain(ctx, heights, B, stripH, colors, rng) {
    const p = B / 4;
    for (let c = 0; c < heights.length; c++) {
        const top = stripH - heights[c] * B;
        for (let r = 0; r < heights[c]; r++) {
            const y = top + r * B;
            ctx.fillStyle = r === 0 ? colors.top : (r + c) % 2 === 0 ? colors.body : colors.body2;
            ctx.fillRect(c * B, y, B, B);
            if (r === 0 && colors.topLight) {
                ctx.fillStyle = colors.topLight;
                ctx.fillRect(c * B, y, B, p);
            }
            if (colors.speck) {
                ctx.fillStyle = colors.speck;
                ctx.fillRect(c * B + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
        }
    }
}

// Детерміновані «падаючі» частинки без стану: позиція обчислюється з часу
function drawFallingPixels(ctx, W, H, time, count, seed, opts) {
    const rng = pixelRng(seed);
    ctx.fillStyle = opts.color;
    for (let i = 0; i < count; i++) {
        const x0 = rng() * W;
        const y0 = rng() * H;
        const spd = opts.speedMin + rng() * (opts.speedMax - opts.speedMin);
        const sz = opts.sizeMin + Math.floor(rng() * (opts.sizeMax - opts.sizeMin + 1));
        const phase = rng() * Math.PI * 2;
        let y = (y0 + time * spd * opts.dir) % H;
        if (y < 0) {
            y += H;
        }
        const x = ((x0 + Math.sin(time * opts.sway + phase) * opts.swayAmp) % W + W) % W;
        ctx.globalAlpha = opts.alpha;
        ctx.fillRect(Math.round(x), Math.round(y), sz, sz * (opts.stretch || 1));
    }
    ctx.globalAlpha = 1;
}

function smoothStep(x) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
}

// Піксельний силует гір з неоновим контуром (для далекого плану)
function drawNeonMountains(ctx, W, baseY, B, heights, fill, edge) {
    ctx.fillStyle = fill;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, heights[c] * B);
    }
    ctx.fillStyle = edge;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, Math.max(2, B / 5));
        const prev = c > 0 ? heights[c - 1] : heights[c];
        if (prev !== heights[c]) {
            const top = baseY - Math.max(prev, heights[c]) * B;
            const hgt = Math.abs(prev - heights[c]) * B;
            ctx.fillRect(c * B, top, Math.max(2, B / 5), hgt);
        }
    }
}

// Зоряне небо у буфер
function drawStarsInto(ctx, W, maxY, count, rng, B) {
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = rng() < 0.2 ? "#bfe9ff" : "#ffffff";
        ctx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.1 ? Math.max(2, B / 4) : Math.max(1, B / 8);
        ctx.fillRect(Math.round(rng() * W), Math.round(rng() * maxY), s, s);
    }
    ctx.globalAlpha = 1;
}

// Піксельний диск (сонце, місяць): рядки блоків за рівнянням кола
function drawPixelDisc(ctx, cx, cy, r, B, color) {
    ctx.fillStyle = color;
    const rows = Math.ceil(r / B);
    for (let i = -rows; i < rows; i++) {
        const yMid = (i + 0.5) * B;
        const half = Math.sqrt(Math.max(0, r * r - yMid * yMid));
        const w = Math.round(half / B) * B;
        if (w > 0) {
            ctx.fillRect(Math.round(cx - w), Math.round(cy + i * B), w * 2, B);
        }
    }
}

// Ширина смуги, кратна 10 блокам, щоб шари повторювалися без швів
function extraStripW(W, B) {
    return Math.ceil(W * 1.4 / (B * 10)) * B * 10;
}

// Малює смугу й повертає зсув для анімацій поверх неї (x першої копії)
function drawStripCopies(ctx, strip, W, top, time, speed, factor, each) {
    const w = strip.width;
    const off = Math.round(time * speed * factor) % w;
    for (let x = -off; x < W; x += w) {
        ctx.drawImage(strip, x, top);
        if (each) {
            each(x);
        }
    }
}

export { drawBlockTerrain, drawFallingPixels, drawPixelDisc, drawScrollingStrip, drawStarsInto, drawStripCopies, extraStripW, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep };
