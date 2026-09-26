// backgrounds/sponge_ninja_machines.js — Ліга 1 (частина 3): підводне містечко, храм спін-джитсу, війна машин

import { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS } from "./core.js";
import { drawBlockTerrain, drawFallingPixels, drawPixelDisc, drawScrollingStrip, drawStripCopies, extraStripW, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";
import { GROUND_BY_THEME } from "./effects.js";
import { STORY_BY_THEME, drawBeam, storyOopsFlash } from "./story.js";
import { FINISH_BY_THEME, WEATHER_THEMES, WORLD_NAMES } from "./names_finish_weather.js";
import { crossK } from "./living_worlds.js";

// ============================================================
// Нові світи Ліги 1 (частина 3): Підводне містечко губки,
// Храм спін-джитсу та Війна машин
// ============================================================

// ---------- Підводне містечко: будинок-ананас, кам'яна голова, скеля, бургерна ----------

// Будинок-ананас (bx — центр, by — низ)
function drawPineappleHouse(ctx, bx, by, B) {
    const w = B * 6;
    const h = B * 8;
    ctx.fillStyle = "#e88a1a";
    ctx.fillRect(bx - w / 2, by - h, w, h);
    ctx.fillRect(bx - w / 2 - B * 0.6, by - h * 0.8, w + B * 1.2, h * 0.6);
    // Візерунок шкірки
    ctx.fillStyle = "#c86a0a";
    for (let y = by - h + B; y < by - B; y += B * 1.4) {
        for (let x = bx - w / 2 + ((y / B) % 2 < 1 ? 0 : B * 0.7); x < bx + w / 2 - B * 0.3; x += B * 1.4) {
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 0.5), Math.round(B * 0.5));
        }
    }
    // Листя зверху
    ctx.fillStyle = "#3aa83a";
    ctx.fillRect(bx - B * 0.5, by - h - B * 4, B, B * 4);
    ctx.fillRect(bx - B * 2.4, by - h - B * 3, B * 0.9, B * 3);
    ctx.fillRect(bx + B * 1.5, by - h - B * 3, B * 0.9, B * 3);
    ctx.fillStyle = "#5ad85a";
    ctx.fillRect(bx - B * 1.4, by - h - B * 2.4, B * 0.8, B * 2.4);
    ctx.fillRect(bx + B * 0.6, by - h - B * 2.4, B * 0.8, B * 2.4);
    // Кругле віконце й двері
    ctx.fillStyle = "#6ab8e8";
    ctx.fillRect(bx - B * 2, by - h * 0.7, B * 1.4, B * 1.4);
    ctx.fillStyle = "#8a8a94";
    ctx.fillRect(bx - B * 0.9, by - B * 2.8, B * 1.8, B * 2.8);
    ctx.fillStyle = "#5a5a64";
    ctx.fillRect(bx - B * 0.6, by - B * 2.5, B * 1.2, B * 2.5);
}

// Кам'яна голова-будинок
function drawStoneHead(ctx, bx, by, B) {
    ctx.fillStyle = "#6a7a8a";
    ctx.fillRect(bx - B * 2.5, by - B * 9, B * 5, B * 9);
    ctx.fillStyle = "#7a8a9a";
    ctx.fillRect(bx - B * 2.5, by - B * 9, B * 5, B * 0.8);
    // Брови, довгий ніс і вікна-очі
    ctx.fillStyle = "#4a5a6a";
    ctx.fillRect(bx - B * 2.2, by - B * 7.2, B * 4.4, B * 0.8);
    ctx.fillRect(bx - B * 0.5, by - B * 6.4, B, B * 3.2);
    ctx.fillStyle = "#ffe8a0";
    ctx.fillRect(bx - B * 1.8, by - B * 6.2, B, B);
    ctx.fillRect(bx + B * 0.8, by - B * 6.2, B, B);
    ctx.fillStyle = "#3a4a5a";
    ctx.fillRect(bx - B * 1.2, by - B * 2.4, B * 2.4, B * 0.6);
    ctx.fillRect(bx - B * 0.7, by - B * 1.6, B * 1.4, B * 1.6);
}

// Скеля-будиночок з антеною
function drawRockHome(ctx, bx, by, B) {
    drawPixelDisc(ctx, bx, by, B * 3.5, B, "#7a5a3a");
    ctx.fillStyle = "#8a6a4a";
    ctx.fillRect(bx - B * 2, by - B * 3, B * 2, B);
    ctx.fillStyle = "#9aa0aa";
    ctx.fillRect(bx + B * 0.5, by - B * 5.5, B * 0.3, B * 2.2);
    ctx.fillRect(bx, by - B * 5.5, B * 1.3, B * 0.3);
}

// Бургерна: хатинка з пасток на омарів і вивіска
function drawBurgerHut(ctx, bx, by, B) {
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(bx - B * 5, by - B * 5, B * 10, B * 5);
    ctx.fillStyle = "#6a4a1a";
    for (let x = bx - B * 5; x < bx + B * 5; x += B * 1.2) {
        ctx.fillRect(Math.round(x), by - B * 5, Math.round(B * 0.25), B * 5);
    }
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(bx - B * 5.6, by - B * 6.4, B * 11.2, B * 1.4);
    // Вивіска з бургером
    ctx.fillStyle = "#e0203a";
    ctx.fillRect(bx - B * 1.6, by - B * 10, B * 3.2, B * 3);
    ctx.fillStyle = "#9aa0aa";
    ctx.fillRect(bx - B * 0.2, by - B * 7, B * 0.4, B * 0.6);
    ctx.fillStyle = "#e8a040";
    ctx.fillRect(bx - B * 1.1, by - B * 9.5, B * 2.2, B * 0.6);
    ctx.fillStyle = "#6a3a1a";
    ctx.fillRect(bx - B * 1.2, by - B * 8.8, B * 2.4, B * 0.5);
    ctx.fillStyle = "#5ad85a";
    ctx.fillRect(bx - B * 1.2, by - B * 8.3, B * 2.4, B * 0.2);
    ctx.fillStyle = "#e8a040";
    ctx.fillRect(bx - B * 1.1, by - B * 8.1, B * 2.2, B * 0.4);
    // Віконця-ілюмінатори
    ctx.fillStyle = "#6ab8e8";
    ctx.fillRect(bx - B * 3.8, by - B * 3.6, B * 1.4, B * 1.4);
    ctx.fillRect(bx + B * 2.4, by - B * 3.6, B * 1.4, B * 1.4);
    ctx.fillStyle = "#3a2a10";
    ctx.fillRect(bx - B * 0.9, by - B * 3, B * 1.8, B * 3);
}

// Медуза: рожевий купол і щупальця (x, y — центр купола)
function drawJellyfish(ctx, x, y, B, time, s, glow) {
    const pulse = 1 + Math.sin(time * 3 + x * 0.01) * 0.12;
    const w = B * 1.6 * s * pulse;
    const h = B * 1.0 * s / pulse;
    if (glow > 0) {
        ctx.fillStyle = "rgba(255, 150, 230, " + (0.18 * glow).toFixed(3) + ")";
        ctx.fillRect(Math.round(x - w), Math.round(y - h * 1.2), Math.round(w * 2), Math.round(h * 3.4));
    }
    ctx.fillStyle = "#ff8ad8";
    ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
    ctx.fillRect(Math.round(x - w / 2 - B * 0.2 * s), Math.round(y - h * 0.5), Math.round(w + B * 0.4 * s), Math.round(h * 0.5));
    ctx.fillStyle = "#ffc8f0";
    ctx.fillRect(Math.round(x - w * 0.3), Math.round(y - h * 0.8), Math.round(w * 0.25), Math.round(h * 0.3));
    ctx.fillStyle = "#e86ac0";
    for (let k = 0; k < 4; k++) {
        const tx = x - w * 0.4 + k * w * 0.27 + Math.sin(time * 4 + k) * B * 0.15 * s;
        ctx.fillRect(Math.round(tx), Math.round(y), Math.max(1, Math.round(B * 0.18 * s)), Math.round(B * (0.9 + (k % 2) * 0.4) * s));
    }
}

function buildSpongeReef(W, H, groundY, B) {
    const rng = pixelRng(4601);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#7ae0ff"], [0.45, "#3aa0e0"], [1, "#1a5aa0"]]);
    const stripW = extraStripW(W, B);
    // Квіти-плями в «небі» під водою
    const flowers = makeCanvas(stripW, Math.round(gY * 0.55));
    const fx = flowers.getContext("2d");
    const flowerColors = ["rgba(255, 255, 255, 0.28)", "rgba(180, 255, 200, 0.25)", "rgba(255, 220, 140, 0.25)", "rgba(200, 180, 255, 0.25)"];
    for (let i = 0; i < 14; i++) {
        const cx = rng() * stripW;
        const cy = rng() * flowers.height;
        const r = B * (1 + rng() * 1.5);
        fx.fillStyle = flowerColors[i % flowerColors.length];
        for (let k = 0; k < 5; k++) {
            const a = k / 5 * Math.PI * 2;
            drawPixelDisc(fx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.7, Math.max(2, Math.round(B / 2)), fx.fillStyle);
        }
        drawPixelDisc(fx, cx, cy, r * 0.6, Math.max(2, Math.round(B / 2)), "rgba(255, 255, 255, 0.2)");
    }
    // Далекі коралові пагорби
    const farCols = stripW / B;
    const farH = periodicHeights(farCols, 6, [{ amp: 3, k: 3, ph: 0.2 }, { amp: 1.5, k: 8, ph: 1.4 }]);
    const far = makeCanvas(stripW, 12 * B);
    drawBlockTerrain(far.getContext("2d"), farH, B, far.height, { top: "#c88ad8", body: "#9a6ab8", body2: "#8a5aa8", speck: "#b88ad0" }, rng);
    // Будинки містечка
    const midH = Math.round(gY * 0.62);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const kinds = [drawPineappleHouse, drawStoneHead, drawRockHome, drawBurgerHut];
    let k = 0;
    for (let x = B * 8; x < stripW - B * 8; x += B * 22) {
        kinds[k % kinds.length](mx, x, midH, B);
        k++;
    }
    // Водорості й пісок на передньому плані
    const near = makeCanvas(stripW, B * 3);
    const nx = near.getContext("2d");
    nx.fillStyle = "#e8d08a";
    nx.fillRect(0, B * 2, stripW, B);
    for (let x = 0; x < stripW; x += B * 3) {
        const h = 1 + Math.floor(rng() * 2);
        nx.fillStyle = rng() < 0.5 ? "#2a9a4a" : "#3ab85a";
        nx.fillRect(x + B, B * (2 - h), Math.round(B * 0.5), B * h);
        nx.fillRect(x + B * 1.5, B * (2.3 - h), Math.round(B * 0.5), B * 0.5);
    }
    return { W: W, H: H, sky: sky, flowers: flowers, far: far, mid: mid, near: near };
}

BackgroundRenderer.renderSpongeReef = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._spongeReef;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSpongeReef(W, H, groundY, B);
        this._spongeReef = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawStripCopies(ctx, st.flowers, W, 0, time, speed, 0.03);
    // Промені світла з поверхні
    for (let i = 0; i < 5; i++) {
        const lx = W * (0.1 + i * 0.22) + Math.sin(time * 0.4 + i) * B * 2;
        drawBeam(ctx, lx, -B, Math.PI / 2 + 0.15, gY * 1.1, 0.06, "rgba(255, 255, 255, 0.07)");
    }
    drawScrollingStrip(ctx, st.far, W, gY - B * 2, time, speed, 0.1);
    // Медузи пливуть у далечині
    for (let i = 0; i < 4; i++) {
        const k = crossK(time, 26 + i * 5, i * 0.27);
        drawJellyfish(ctx, W * (1.1 - k * 1.2), gY * (0.2 + i * 0.1) + Math.sin(time + i) * B, B, time, 0.8, 0);
    }
    drawStripCopies(ctx, st.mid, W, gY - B - st.mid.height, time, speed, 0.3);
    // Бульбашки піднімаються
    drawFallingPixels(ctx, W, gY, time, 26, 4602, { color: "#e8f8ff", dir: -1, speedMin: 20, speedMax: 50, sizeMin: 2, sizeMax: 4, sway: 1.5, swayAmp: 8, alpha: 0.6 });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { sponge_reef: "renderSpongeReef" });
SCENE_CACHE_KEYS.push("_spongeReef");
GROUND_BY_THEME.sponge_reef = "sand";
FINISH_BY_THEME.sponge_reef = "chest";
WORLD_NAMES.sponge_reef = "Підводне містечко";

// Сюжет: поля медуз світяться — повз проїжджає човен-автомобіль з гуком «Я ГОТОВИЙ!»
STORY_BY_THEME.sponge_reef = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    if (s1 > 0) {
        ctx.globalAlpha = s1;
        for (let i = 0; i < 7; i++) {
            const bx = W * ((i * 0.17 + time * 0.012) % 1.1 - 0.05);
            const by = gY * (0.35 + (i % 3) * 0.1) + Math.sin(time * 1.3 + i * 2) * B * 1.5;
            drawJellyfish(ctx, bx, by, B, time, 1.1, s1);
        }
        ctx.globalAlpha = 1;
    }
    if (s2 > 0) {
        // Човен-автомобіль: блакитний корпус, прозорий купол і хвіст бульбашок
        const k = crossK(time, 7, 0.1);
        const x = W * (1.15 - k * 1.3);
        const y = gY - B * 2.4 + Math.sin(time * 6) * B * 0.2;
        ctx.globalAlpha = s2;
        ctx.fillStyle = "rgba(220, 245, 255, 0.7)";
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(Math.round(x + B * (6 + i * 0.9)), Math.round(y - B * (0.2 + (i % 2) * 0.5)), Math.round(B * 0.4), Math.round(B * 0.4));
        }
        ctx.fillStyle = "#3a8ad8";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 6), Math.round(B * 1.4));
        ctx.fillRect(Math.round(x - B * 0.8), Math.round(y + B * 0.4), Math.round(B * 0.8), Math.round(B * 0.8));
        ctx.fillStyle = "#e0203a";
        ctx.fillRect(Math.round(x + B * 0.4), Math.round(y + B * 0.9), Math.round(B * 5.2), Math.round(B * 0.3));
        ctx.fillStyle = "rgba(200, 240, 255, 0.6)";
        ctx.fillRect(Math.round(x + B * 1.4), Math.round(y - B * 1.6), Math.round(B * 3), Math.round(B * 1.6));
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(Math.round(x + B * 2.2), Math.round(y - B * 1.2), Math.round(B * 1.2), Math.round(B * 1.2));
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(Math.round(x + B * 0.6), Math.round(y + B * 1.2), Math.round(B), Math.round(B * 0.6));
        ctx.fillRect(Math.round(x + B * 4.4), Math.round(y + B * 1.2), Math.round(B), Math.round(B * 0.6));
        if (Math.sin(time * 2) > 0) {
            ctx.font = "bold " + Math.round(B * 0.9) + "px monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffe14d";
            ctx.fillText("Я ГОТОВИЙ!", Math.round(x + B * 3), Math.round(y - B * 2.2));
        }
        ctx.globalAlpha = 1;
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 120, 200", 0.18);
};

// ---------- Храм спін-джитсу: пагоди, бамбук, вихори чотирьох ніндзя ----------

// Пагода з кількома ярусами загнутих дахів (bx — центр, by — низ)
function drawPagoda(ctx, bx, by, B, tiers) {
    let y = by;
    let w = B * 8;
    for (let t = 0; t < tiers; t++) {
        const hWall = B * 2.4;
        ctx.fillStyle = "#8a1a1a";
        ctx.fillRect(bx - w / 2 + B, y - hWall, w - B * 2, hWall);
        ctx.fillStyle = "#ffcc5a";
        ctx.fillRect(bx - B * 0.6, y - hWall + B * 0.5, B * 1.2, B * 1.2);
        y -= hWall;
        // Дах із загнутими кінчиками
        ctx.fillStyle = "#1a1a2a";
        ctx.fillRect(bx - w / 2 - B, y - B * 0.8, w + B * 2, B * 0.8);
        ctx.fillRect(bx - w / 2 - B * 1.6, y - B * 1.3, B, B * 0.6);
        ctx.fillRect(bx + w / 2 + B * 0.6, y - B * 1.3, B, B * 0.6);
        ctx.fillStyle = "#3a2a4a";
        ctx.fillRect(bx - w / 2 - B * 0.4, y - B * 1.4, w + B * 0.8, B * 0.6);
        y -= B * 1.4;
        w -= B * 1.6;
    }
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(bx - B * 0.2, y - B * 2, B * 0.4, B * 2);
}

// Брама-торії
function drawToriiGate(ctx, bx, by, B) {
    ctx.fillStyle = "#c82a2a";
    ctx.fillRect(bx - B * 3, by - B * 6, B * 0.8, B * 6);
    ctx.fillRect(bx + B * 2.2, by - B * 6, B * 0.8, B * 6);
    ctx.fillRect(bx - B * 3.6, by - B * 5, B * 7.2, B * 0.6);
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(bx - B * 4.2, by - B * 6.8, B * 8.4, B * 0.8);
}

// Вихор спін-джитсу: крутні смуги кольору ніндзя (x — центр, y — низ)
function drawSpinjitzu(ctx, x, y, B, time, color, light, s) {
    for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const w = B * (0.8 + t * 2.4) * s;
        const yy = y - t * B * 6 * s;
        const off = Math.sin(time * 14 + i * 0.9) * w * 0.25;
        ctx.fillStyle = i % 2 === 0 ? color : light;
        ctx.fillRect(Math.round(x - w / 2 + off), Math.round(yy - B * 0.7 * s), Math.round(w), Math.round(B * 0.7 * s));
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let i = 0; i < 4; i++) {
        const a = time * 10 + i * 1.6;
        ctx.fillRect(Math.round(x + Math.cos(a) * B * 2 * s), Math.round(y - B * (1 + i * 1.2) * s), 2, 2);
    }
}

const NINJA_COLORS = [["#e0303a", "#ff9a5a"], ["#2a6aff", "#9ad0ff"], ["#2a2a34", "#6a6a7a"], ["#e8eef8", "#9ad8ff"]];

function buildNinjaTemple(W, H, groundY, B) {
    const rng = pixelRng(4701);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#2a1a4a"], [0.5, "#8a3a6a"], [1, "#ff9a5a"]]);
    const skx = sky.getContext("2d");
    drawPixelDisc(skx, W * 0.72, gY * 0.42, B * 5, B, "rgba(255, 220, 150, 0.9)");
    const stripW = extraStripW(W, B);
    // Далекі гори в тумані
    const farCols = stripW / B;
    const farH = periodicHeights(farCols, 10, [{ amp: 5, k: 2, ph: 0.6 }, { amp: 2, k: 7, ph: 1.8 }]);
    const far = makeCanvas(stripW, 18 * B);
    drawBlockTerrain(far.getContext("2d"), farH, B, far.height, { top: "#6a3a7a", body: "#4a2a5a", body2: "#44264f" }, rng);
    // Храми, брами й бамбук
    const midH = Math.round(gY * 0.6);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    let k = 0;
    for (let x = B * 8; x < stripW - B * 8; x += B * 20) {
        if (k % 2 === 0) {
            drawPagoda(mx, x, midH, B, 3);
        } else {
            drawToriiGate(mx, x, midH, B);
        }
        // Бамбуковий гай поруч
        for (let b = 0; b < 4; b++) {
            const bxp = x + B * (7 + b * 1.4);
            const bh = B * (8 + Math.floor(rng() * 6));
            mx.fillStyle = b % 2 === 0 ? "#3a8a3a" : "#4aa84a";
            mx.fillRect(bxp, midH - bh, B * 0.6, bh);
            mx.fillStyle = "#2a6a2a";
            for (let yy = midH - bh + B * 2; yy < midH; yy += B * 2) {
                mx.fillRect(bxp, yy, B * 0.6, B * 0.2);
            }
            mx.fillStyle = "#5ac85a";
            mx.fillRect(bxp + B * 0.6, midH - bh + B, B * 1.2, B * 0.3);
        }
        k++;
    }
    // Кам'яна доріжка й ліхтарі
    const near = makeCanvas(stripW, B * 3);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B * 2) {
        nx.fillStyle = (x / B) % 4 === 0 ? "#6a6a74" : "#5a5a64";
        nx.fillRect(x, B * 2.2, B * 1.9, B * 0.8);
    }
    for (let x = B * 5; x < stripW; x += B * 16) {
        nx.fillStyle = "#7a7a84";
        nx.fillRect(x, B * 0.4, B, B * 1.8);
        nx.fillStyle = "#4a4a54";
        nx.fillRect(x - B * 0.4, B * 0.2, B * 1.8, B * 0.4);
        nx.fillStyle = "#ffcc5a";
        nx.fillRect(x + B * 0.2, B * 0.8, B * 0.6, B * 0.6);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, near: near };
}

BackgroundRenderer.renderNinjaTemple = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._ninjaTemple;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNinjaTemple(W, H, groundY, B);
        this._ninjaTemple = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY - B * 4, time, speed, 0.08);
    // Туман між горами й храмом
    ctx.fillStyle = "rgba(255, 200, 220, 0.12)";
    ctx.fillRect(0, Math.round(gY * 0.55), W, Math.round(gY * 0.2));
    drawStripCopies(ctx, st.mid, W, gY - B - st.mid.height, time, speed, 0.3);
    // Ніндзя тренуються: вихори кружляють туди-сюди
    for (let i = 0; i < 2; i++) {
        const c = NINJA_COLORS[(i * 2 + Math.floor(time / 9)) % NINJA_COLORS.length];
        const x = W * (0.5 + Math.sin(time * 0.35 + i * 3) * 0.42);
        drawSpinjitzu(ctx, x, gY - B, B, time, c[0], c[1], 0.7);
    }
    // Пелюстки сакури
    drawFallingPixels(ctx, W, gY, time, 30, 4702, { color: "#ffb0d0", dir: 1, speedMin: 15, speedMax: 35, sizeMin: 2, sizeMax: 4, sway: 1.2, swayAmp: 24, alpha: 0.85 });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { ninja_temple: "renderNinjaTemple" });
SCENE_CACHE_KEYS.push("_ninjaTemple");
GROUND_BY_THEME.ninja_temple = "stone";
FINISH_BY_THEME.ninja_temple = "gate";
WORLD_NAMES.ninja_temple = "Храм спін-джитсу";
WEATHER_THEMES.add("ninja_temple");

// Золотий дракон: довге тіло-змія з гривою (голова в (x, y), тіло тягнеться праворуч)
function drawGoldenDragon(ctx, x, y, B, time, alpha) {
    ctx.globalAlpha = alpha;
    for (let i = 16; i >= 0; i--) {
        const sx = x + i * B * 1.2;
        const sy = y + Math.sin(time * 3 - i * 0.55) * B * 1.4;
        const r = Math.max(0.5, 1.3 - i * 0.05);
        ctx.fillStyle = i % 2 === 0 ? "#ffcc33" : "#e8a020";
        ctx.fillRect(Math.round(sx), Math.round(sy - r * B / 2), Math.round(B * 1.3), Math.round(r * B));
        if (i % 3 === 0) {
            ctx.fillStyle = "#ff6a1a";
            ctx.fillRect(Math.round(sx), Math.round(sy - r * B / 2 - B * 0.4), Math.round(B * 0.5), Math.round(B * 0.4));
        }
    }
    const hy = y + Math.sin(time * 3) * B * 1.4;
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(Math.round(x - B * 2), Math.round(hy - B), Math.round(B * 2.4), Math.round(B * 1.8));
    ctx.fillStyle = "#fff0a0";
    ctx.fillRect(Math.round(x - B * 2.6), Math.round(hy - B * 0.2), Math.round(B * 1.2), Math.round(B * 0.8));
    ctx.fillStyle = "#e0303a";
    ctx.fillRect(Math.round(x - B * 1.4), Math.round(hy - B * 0.7), Math.round(B * 0.4), Math.round(B * 0.4));
    ctx.fillStyle = "#ffe8a0";
    ctx.fillRect(Math.round(x - B * 0.6), Math.round(hy - B * 2), Math.round(B * 0.3), Math.round(B));
    ctx.fillRect(Math.round(x - B * 0.1), Math.round(hy - B * 1.8), Math.round(B * 0.3), Math.round(B * 0.8));
    // Вуса, що в'ються
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(Math.round(x - B * 3.2), Math.round(hy + B * 0.6 + Math.sin(time * 4) * B * 0.3), Math.round(B * 1.2), Math.round(B * 0.2));
    ctx.globalAlpha = 1;
}

// Сюжет: запалюються ліхтарі й виходять усі четверо ніндзя — прилітає золотий дракон
STORY_BY_THEME.ninja_temple = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    if (s1 > 0) {
        // Паперові ліхтарики на мотузці
        const ropeY = gY * 0.12;
        ctx.strokeStyle = "rgba(40, 20, 30, " + s1.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, ropeY);
        ctx.quadraticCurveTo(W / 2, ropeY + B * 3, W, ropeY);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const lx = W * (0.06 + i * 0.125);
            const t = (lx / W - 0.5) * 2;
            const ly = ropeY + B * 3 * (1 - t * t) * 0.5 + Math.sin(time * 2 + i) * B * 0.2;
            const lit = Math.min(1, s1 * 8 - i * 0.6);
            if (lit <= 0) {
                continue;
            }
            ctx.fillStyle = "rgba(255, 180, 90, " + (0.2 * lit).toFixed(3) + ")";
            ctx.fillRect(Math.round(lx - B * 1.6), Math.round(ly - B * 0.6), Math.round(B * 3.2), Math.round(B * 3));
            ctx.fillStyle = i % 2 === 0 ? "#e0303a" : "#ffcc33";
            ctx.globalAlpha = lit;
            ctx.fillRect(Math.round(lx - B * 0.7), Math.round(ly), Math.round(B * 1.4), Math.round(B * 1.8));
            ctx.fillStyle = "#1a1a2a";
            ctx.fillRect(Math.round(lx - B * 0.7), Math.round(ly), Math.round(B * 1.4), Math.round(B * 0.2));
            ctx.globalAlpha = 1;
        }
        // Усі четверо ніндзя-вихорів
        ctx.globalAlpha = s1;
        for (let i = 0; i < 4; i++) {
            const x = W * (0.15 + i * 0.22) + Math.sin(time * 0.9 + i * 1.7) * B * 4;
            drawSpinjitzu(ctx, x, gY - B * 0.2, B, time + i, NINJA_COLORS[i][0], NINJA_COLORS[i][1], 0.55);
        }
        ctx.globalAlpha = 1;
    }
    if (s2 > 0) {
        const k = crossK(time, 12, 0.3);
        drawGoldenDragon(ctx, W * (1.1 - k * 1.6), gY * 0.28, B, time, s2);
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.18);
};

// ---------- Війна машин: руїни майбутнього, літаючі мисливці, червоні очі ----------

// Літаючий мисливець: темний корпус, два двигуни й прожектор (x, y — центр)
function drawAerialHunter(ctx, x, y, B, time, s, beamAng) {
    drawBeam(ctx, x, y + B * 0.8 * s, beamAng, B * 30, 0.1, "rgba(180, 220, 255, 0.1)");
    ctx.fillStyle = "#1a1c24";
    ctx.fillRect(Math.round(x - B * 3 * s), Math.round(y - B * 0.6 * s), Math.round(B * 6 * s), Math.round(B * 1.2 * s));
    ctx.fillRect(Math.round(x - B * 1.2 * s), Math.round(y - B * 1.2 * s), Math.round(B * 2.4 * s), Math.round(B * 0.6 * s));
    ctx.fillStyle = "#2a2e38";
    ctx.fillRect(Math.round(x - B * 4 * s), Math.round(y - B * 0.3 * s), Math.round(B * 1.2 * s), Math.round(B * 1.4 * s));
    ctx.fillRect(Math.round(x + B * 2.8 * s), Math.round(y - B * 0.3 * s), Math.round(B * 1.2 * s), Math.round(B * 1.4 * s));
    const flick = 0.6 + 0.4 * Math.sin(time * 30);
    ctx.fillStyle = "rgba(120, 180, 255, " + flick.toFixed(2) + ")";
    ctx.fillRect(Math.round(x - B * 3.8 * s), Math.round(y + B * 1.1 * s), Math.round(B * 0.8 * s), Math.round(B * 0.3 * s));
    ctx.fillRect(Math.round(x + B * 3 * s), Math.round(y + B * 1.1 * s), Math.round(B * 0.8 * s), Math.round(B * 0.3 * s));
    ctx.fillStyle = "#ff2a2a";
    ctx.fillRect(Math.round(x - B * 0.4 * s), Math.round(y + B * 0.2 * s), Math.round(B * 0.8 * s), Math.round(B * 0.4 * s));
}

// Металевий робот-скелет крокує (x — центр, y — підлога), червоні очі
function drawEndoskeleton(ctx, x, y, B, time, s, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * s, s);
    const step = Math.sin(time * 5);
    const metal = "#a8aeb8";
    const dark = "#5a606a";
    // Ноги-поршні
    ctx.fillStyle = dark;
    ctx.fillRect(-B * 0.9 + step * B * 0.4, -B * 4, B * 0.5, B * 4);
    ctx.fillRect(B * 0.4 - step * B * 0.4, -B * 4, B * 0.5, B * 4);
    ctx.fillStyle = metal;
    ctx.fillRect(-B * 1.1 + step * B * 0.4, -B * 0.4, B * 0.9, B * 0.4);
    ctx.fillRect(B * 0.2 - step * B * 0.4, -B * 0.4, B * 0.9, B * 0.4);
    // Таз і ребра
    ctx.fillRect(-B * 1.1, -B * 4.4, B * 2.2, B * 0.6);
    ctx.fillStyle = dark;
    ctx.fillRect(-B * 0.2, -B * 6.8, B * 0.4, B * 2.4);
    ctx.fillStyle = metal;
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-B * 1.2, -B * (6.6 - i * 0.7), B * 2.4, B * 0.3);
    }
    ctx.fillRect(-B * 1.5, -B * 7.2, B * 3, B * 0.5);
    // Руки
    ctx.fillStyle = dark;
    ctx.fillRect(-B * 1.8, -B * 7 - step * B * 0.2, B * 0.4, B * 2.6);
    ctx.fillRect(B * 1.4, -B * 7 + step * B * 0.2, B * 0.4, B * 2.6);
    // Голова-череп із червоними очима
    ctx.fillStyle = metal;
    ctx.fillRect(-B * 0.8, -B * 8.6, B * 1.6, B * 1.4);
    ctx.fillStyle = "#1a1c22";
    ctx.fillRect(-B * 0.6, -B * 8.2, B * 0.5, B * 0.4);
    ctx.fillRect(B * 0.1, -B * 8.2, B * 0.5, B * 0.4);
    const glow = 0.7 + 0.3 * Math.sin(time * 6);
    ctx.fillStyle = "rgba(255, 40, 40, " + glow.toFixed(2) + ")";
    ctx.fillRect(-B * 0.5, -B * 8.1, B * 0.3, B * 0.25);
    ctx.fillRect(B * 0.2, -B * 8.1, B * 0.3, B * 0.25);
    ctx.fillStyle = "#dce2ea";
    ctx.fillRect(-B * 0.5, -B * 7.5, B, B * 0.2);
    ctx.restore();
}

function buildMachineWar(W, H, groundY, B) {
    const rng = pixelRng(4801);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05060c"], [0.6, "#1a0a18"], [1, "#4a1414"]]);
    const stripW = extraStripW(W, B);
    // Далекі зруйновані хмарочоси
    const farH = Math.round(gY * 0.55);
    const far = makeCanvas(stripW, farH);
    const fx = far.getContext("2d");
    const fires = [];
    for (let x = 0; x < stripW; x += B * 4) {
        const h = B * (6 + Math.floor(rng() * 12));
        fx.fillStyle = rng() < 0.5 ? "#12121a" : "#181820";
        fx.fillRect(x, farH - h, B * 3.4, h);
        // Обламаний верх
        fx.clearRect(x + B * (1 + Math.floor(rng() * 2)), farH - h, B, B * (1 + Math.floor(rng() * 2)));
        fx.fillStyle = "#2a2020";
        for (let y = farH - h + B; y < farH - B; y += B * 1.5) {
            if (rng() < 0.3) {
                fx.fillRect(x + B * 0.6, y, B * 0.6, B * 0.6);
            }
        }
        if (rng() < 0.3) {
            fires.push({ x: x + B * 1.7, y: farH - h });
        }
    }
    // Уламки, спалені машини й погнуті балки
    const midH = Math.round(gY * 0.3);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    for (let x = B * 2; x < stripW - B * 10; x += B * 14) {
        mx.fillStyle = "#2a2628";
        for (let i = 0; i < 6; i++) {
            mx.fillRect(x + i * B, midH - B * (1 + ((i * 7) % 3)), B * 1.4, B * (1 + ((i * 7) % 3)));
        }
        // Спалене авто
        mx.fillStyle = "#3a2a24";
        mx.fillRect(x + B * 7, midH - B * 1.6, B * 4.6, B * 1.2);
        mx.fillRect(x + B * 8, midH - B * 2.4, B * 2.6, B * 0.8);
        mx.fillStyle = "#101014";
        mx.fillRect(x + B * 7.4, midH - B * 0.6, B * 0.9, B * 0.6);
        mx.fillRect(x + B * 10.4, midH - B * 0.6, B * 0.9, B * 0.6);
        // Погнута балка
        mx.fillStyle = "#4a3a34";
        mx.fillRect(x + B * 4, midH - B * 6, B * 0.5, B * 5);
        mx.fillRect(x + B * 4, midH - B * 6, B * 2.4, B * 0.5);
    }
    const near = makeCanvas(stripW, B * 2);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B) {
        if (rng() < 0.4) {
            nx.fillStyle = rng() < 0.5 ? "#3a3438" : "#2a2428";
            nx.fillRect(x, B * (1 + Math.floor(rng() * 2) * 0.5), B * 0.8, B * 0.5);
        }
    }
    return { W: W, H: H, sky: sky, far: far, fires: fires, mid: mid, near: near };
}

BackgroundRenderer.renderMachineWar = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._machineWar;
    if (!st || st.W !== W || st.H !== H) {
        st = buildMachineWar(W, H, groundY, B);
        this._machineWar = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Лазерні постріли перетинають небо
    for (let i = 0; i < 4; i++) {
        const k = (time * (0.5 + i * 0.13) + i * 0.37) % 1;
        const blue = i % 2 === 0;
        const x = blue ? W * (1.1 - k * 1.3) : W * (-0.1 + k * 1.3);
        const y = gY * (0.12 + i * 0.09) + k * gY * 0.06 * (blue ? 1 : -1);
        ctx.fillStyle = blue ? "rgba(90, 170, 255, 0.85)" : "rgba(255, 60, 50, 0.85)";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 3), Math.max(2, Math.round(B * 0.2)));
    }
    const farTop = gY - B * 2 - st.far.height;
    drawStripCopies(ctx, st.far, W, farTop, time, speed, 0.1, function (x) {
        // Вогонь на вершинах руїн
        for (const f of st.fires) {
            const fxp = x + f.x;
            if (fxp < -B * 2 || fxp > W + B * 2) {
                continue;
            }
            const fl = Math.sin(time * 9 + f.x) * 0.3 + 0.7;
            ctx.fillStyle = "rgba(255, 110, 30, " + fl.toFixed(2) + ")";
            ctx.fillRect(Math.round(fxp - B * 0.6), Math.round(farTop + f.y - B * 1.2 * fl), Math.round(B * 1.2), Math.round(B * 1.2 * fl));
            ctx.fillStyle = "rgba(255, 220, 90, " + fl.toFixed(2) + ")";
            ctx.fillRect(Math.round(fxp - B * 0.25), Math.round(farTop + f.y - B * 0.6 * fl), Math.round(B * 0.5), Math.round(B * 0.6 * fl));
        }
    });
    // Один літаючий мисливець патрулює небо весь час
    const hk = crossK(time, 16, 0);
    drawAerialHunter(ctx, W * (1.15 - hk * 1.3), gY * 0.22, B, time, 0.7, Math.PI / 2 + Math.sin(time * 0.8) * 0.5);
    drawStripCopies(ctx, st.mid, W, gY - B - st.mid.height, time, speed, 0.3);
    // Попіл падає
    drawFallingPixels(ctx, W, gY, time, 24, 4802, { color: "#a8a0a0", dir: 1, speedMin: 8, speedMax: 20, sizeMin: 1, sizeMax: 3, sway: 0.8, swayAmp: 14, alpha: 0.5 });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { machine_war: "renderMachineWar" });
SCENE_CACHE_KEYS.push("_machineWar");
GROUND_BY_THEME.machine_war = "stone";
FINISH_BY_THEME.machine_war = "portal";
WORLD_NAMES.machine_war = "Війна машин";

// Сюжет: зграя мисливців із прожекторами шукає кубик — крізь руїни крокує робот-скелет
STORY_BY_THEME.machine_war = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    if (s1 > 0) {
        ctx.globalAlpha = s1;
        for (let i = 0; i < 2; i++) {
            const k = crossK(time, 11 + i * 4, 0.4 + i * 0.3);
            const ang = Math.PI / 2 + Math.sin(time * 1.1 + i * 2) * 0.6;
            drawAerialHunter(ctx, W * (-0.15 + k * 1.3), gY * (0.1 + i * 0.12), B, time, 0.9, ang);
        }
        // Тривога: червоне мерехтіння над обрієм
        ctx.fillStyle = "rgba(255, 30, 30, " + (0.06 * s1 * (0.5 + 0.5 * Math.sin(time * 5))).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        ctx.globalAlpha = 1;
    }
    if (s2 > 0) {
        const k = crossK(time, 14, 0.2);
        ctx.globalAlpha = s2;
        drawEndoskeleton(ctx, W * (1.1 - k * 1.25), gY - B * 0.6, B, time, 0.9, -1);
        ctx.globalAlpha = 1;
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 30, 30", 0.22);
};
