// backgrounds/village_sunset_cosmodrome.js — кубічне селище, місто на заході сонця, космодром

import { BackgroundRenderer } from "./core.js";
import { drawBlockTerrain, drawPixelDisc, drawScrollingStrip, drawStarsInto, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { _fx } from "./effects.js";
import { drawBeam } from "./story.js";

// ---------- Ліга 1: сцени рівнів ----------

// ---------- 1. Кубічне селище ----------
// Сонячний день у блоковому селищі: квадратне сонце й пласкі хмари, пагорби з
// деревами-кубами, будиночки з дощок, дзвіниця, поле пшениці, криниця.
// Селищем ходять жителі, пасуться вівці, бігають кури.

function buildBlockVillage(W, H, groundY, B) {
    const rng = pixelRng(111);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#5aa8ff"], [0.6, "#8ac8ff"], [1, "#c8e8ff"]]);
    const sx = sky.getContext("2d");
    // Квадратне сонце
    sx.fillStyle = "rgba(255, 250, 200, 0.35)";
    sx.fillRect(Math.round(W * 0.8 - B * 2.6), Math.round(gY * 0.14 - B * 2.6), Math.round(B * 5.2), Math.round(B * 5.2));
    sx.fillStyle = "#fff6a0";
    sx.fillRect(Math.round(W * 0.8 - B * 1.8), Math.round(gY * 0.14 - B * 1.8), Math.round(B * 3.6), Math.round(B * 3.6));

    // Пласкі блокові хмари
    const cloudW = Math.ceil(W * 1.5 / B) * B;
    const clouds = makeCanvas(cloudW, Math.round(gY * 0.35));
    const cx = clouds.getContext("2d");
    for (let i = 0; i < 7; i++) {
        const x = Math.round(rng() * cloudW / B) * B;
        const y = Math.round(rng() * clouds.height * 0.7 / B) * B;
        const w = (4 + Math.floor(rng() * 6)) * B;
        cx.fillStyle = "rgba(255, 255, 255, 0.9)";
        cx.fillRect(x, y, w, B);
        cx.fillRect(x + B, y - B, w - B * 3, B);
        cx.fillStyle = "rgba(220, 230, 245, 0.9)";
        cx.fillRect(x, y + B * 0.7, w, B * 0.3);
    }

    // Далекі пагорби з деревами
    const cols = Math.ceil(W * 1.4 / B);
    const hillH = periodicHeights(cols, 4, [{ amp: 2, k: 3, ph: 0.4 }, { amp: 1, k: 7, ph: 1.3 }]);
    const hills = makeCanvas(cols * B, (Math.max.apply(null, hillH) + 4) * B);
    const hx = hills.getContext("2d");
    drawBlockTerrain(hx, hillH, B, hills.height, { top: "#6ab04a", topLight: "#7ac85a", body: "#5a9a44", body2: "#54903f" }, rng);
    for (let c = 2; c < cols - 2; c += 4 + Math.floor(rng() * 4)) {
        const top = hills.height - hillH[c] * B;
        hx.fillStyle = "#6a4a2a";
        hx.fillRect(c * B + B / 3, top - B * 2, B / 3, B * 2);
        hx.fillStyle = "#3a8a3a";
        hx.fillRect(c * B - B / 2, top - B * 3.4, B * 2, B * 1.6);
        hx.fillStyle = "#4aa04a";
        hx.fillRect(c * B - B / 4, top - B * 3.8, B * 1.5, B * 0.5);
    }

    // Селище: будинки, дзвіниця, поле, криниця — середній шар
    const stripW = Math.ceil(W * 1.6 / (B * 30)) * B * 30;
    const vH = Math.round(B * 8);
    const village = makeCanvas(stripW, vH);
    const vx = village.getContext("2d");
    const windows = [];
    const p = B / 4;
    function planks(x, y, w, h) {
        for (let yy = y; yy < y + h; yy += p * 2) {
            vx.fillStyle = ((yy - y) / (p * 2)) % 2 === 0 ? "#b08850" : "#a07a44";
            vx.fillRect(x, yy, w, Math.min(p * 2, y + h - yy));
        }
    }
    function house(x, w, h) {
        const base = vH;
        // Кам'яний фундамент
        for (let k = 0; k < w; k += B / 2) {
            vx.fillStyle = (k / (B / 2)) % 2 === 0 ? "#8a8a8a" : "#7a7a7a";
            vx.fillRect(x + k, base - B * 0.6, B / 2, B * 0.6);
        }
        planks(x, base - h, w, h - B * 0.6);
        // Колоди на кутах
        vx.fillStyle = "#6a4a2a";
        vx.fillRect(x, base - h, p * 2, h);
        vx.fillRect(x + w - p * 2, base - h, p * 2, h);
        // Дах сходинками
        for (let r = 0; r < 4; r++) {
            vx.fillStyle = r % 2 === 0 ? "#5a3a1e" : "#4a2e16";
            vx.fillRect(x - B * 0.4 + r * w * 0.13, base - h - (r + 1) * B * 0.55, w + B * 0.8 - r * w * 0.26, B * 0.55);
        }
        // Двері та вікно
        vx.fillStyle = "#6a4a2a";
        vx.fillRect(x + w * 0.2, base - B * 2.2, B * 0.9, B * 1.6);
        vx.fillStyle = "#9ad0ff";
        vx.fillRect(x + w * 0.58, base - h + B * 0.9, B, B);
        vx.fillStyle = "#6a4a2a";
        vx.fillRect(x + w * 0.58 + B * 0.45, base - h + B * 0.9, B * 0.1, B);
        windows.push({ x: x + w * 0.58, y: base - h + B * 0.9 });
    }
    for (let seg = 0; seg < stripW; seg += B * 30) {
        house(seg + B * 1, B * 5, B * 4.2);
        // Поле пшениці з грядками
        for (let k = 0; k < 7; k++) {
            vx.fillStyle = k % 3 === 2 ? "#3a6a9a" : "#6a4a2a";
            vx.fillRect(seg + B * 7.5 + k * B, vH - B * 0.5, B, B * 0.5);
            if (k % 3 !== 2) {
                vx.fillStyle = k % 2 === 0 ? "#e8c040" : "#c8b030";
                vx.fillRect(seg + B * 7.6 + k * B, vH - B * 1.3, B * 0.8, B * 0.8);
            }
        }
        // Дзвіниця
        const tx = seg + B * 16;
        for (let k = 0; k < 7; k++) {
            vx.fillStyle = (k % 2 === 0) ? "#9a9a9a" : "#8a8a8a";
            vx.fillRect(tx, vH - (k + 1) * B, B * 3, B);
        }
        vx.fillStyle = "#3a2a1a";
        vx.fillRect(tx + B * 0.8, vH - B * 6.2, B * 1.4, B * 1.2);
        vx.fillStyle = "#ffcc33";
        vx.fillRect(tx + B * 1.1, vH - B * 5.9, B * 0.8, B * 0.8);
        vx.fillStyle = "#5a3a1e";
        vx.fillRect(tx - B * 0.4, vH - B * 7.4, B * 3.8, B * 0.5);
        vx.fillRect(tx + B * 0.4, vH - B * 7.9, B * 2.2, B * 0.5);
        house(seg + B * 20, B * 6, B * 5);
        // Криниця
        const wx = seg + B * 27;
        vx.fillStyle = "#8a8a8a";
        vx.fillRect(wx, vH - B, B * 2, B);
        vx.fillStyle = "#3a6aff";
        vx.fillRect(wx + B * 0.3, vH - B, B * 1.4, B * 0.3);
        vx.fillStyle = "#6a4a2a";
        vx.fillRect(wx, vH - B * 2.6, B * 0.25, B * 1.6);
        vx.fillRect(wx + B * 1.75, vH - B * 2.6, B * 0.25, B * 1.6);
        vx.fillStyle = "#5a3a1e";
        vx.fillRect(wx - B * 0.3, vH - B * 2.9, B * 2.6, B * 0.4);
        // Паркан
        for (let k = 0; k < 4; k++) {
            vx.fillStyle = "#8a6a3a";
            vx.fillRect(seg + B * (11.5 + k * 1.1), vH - B * 1.2, B * 0.25, B * 1.2);
        }
        vx.fillRect(seg + B * 11.5, vH - B * 0.9, B * 3.6, B * 0.2);
    }

    // Ближній шар: трава з квітами
    const nearW = Math.ceil(W * 1.2 / B) * B;
    const near = makeCanvas(nearW, B * 2);
    const nx = near.getContext("2d");
    for (let x = 0; x < nearW; x += B) {
        const h = rng() < 0.5 ? B * 0.6 : B * 0.9;
        nx.fillStyle = rng() < 0.5 ? "#5ab84a" : "#4aa83e";
        nx.fillRect(x, B * 2 - h, B, h);
        if (rng() < 0.2) {
            nx.fillStyle = "#3a8a2a";
            nx.fillRect(x + B * 0.45, B * 2 - h - B * 0.6, B * 0.1, B * 0.6);
            nx.fillStyle = rng() < 0.5 ? "#ff3344" : "#ffe14d";
            nx.fillRect(x + B * 0.3, B * 2 - h - B * 0.8, B * 0.4, B * 0.3);
        }
    }
    return { W: W, H: H, sky: sky, clouds: clouds, hills: hills, village: village, windows: windows, near: near };
}

// Жителі, вівці й кури в стилі блокового світу
function drawVillager(ctx, x, y, B, time, i) {
    const step = Math.sin(time * 6 + i) > 0 ? 1 : 0;
    ctx.fillStyle = "#c89070";
    ctx.fillRect(Math.round(x), Math.round(y - B * 2.4), Math.round(B * 0.8), Math.round(B * 0.8));
    ctx.fillRect(Math.round(x + B * 0.3), Math.round(y - B * 1.9), Math.round(B * 0.25), Math.round(B * 0.4));
    ctx.fillStyle = i % 2 === 0 ? "#6a4a8a" : "#7a5a3a";
    ctx.fillRect(Math.round(x), Math.round(y - B * 1.6), Math.round(B * 0.8), Math.round(B * 1.2));
    ctx.fillStyle = "#3a2a4a";
    ctx.fillRect(Math.round(x + step * B * 0.1), Math.round(y - B * 0.4), Math.round(B * 0.3), Math.round(B * 0.4));
    ctx.fillRect(Math.round(x + B * 0.5 - step * B * 0.1), Math.round(y - B * 0.4), Math.round(B * 0.3), Math.round(B * 0.4));
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(Math.round(x + B * 0.1), Math.round(y - B * 2.1), 2, 2);
    ctx.fillRect(Math.round(x + B * 0.55), Math.round(y - B * 2.1), 2, 2);
}

function drawSheep(ctx, x, y, B, time, i) {
    const graze = Math.sin(time * 1.5 + i) > 0.3 ? B * 0.3 : 0;
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(Math.round(x), Math.round(y - B * 1.3), Math.round(B * 1.6), Math.round(B * 0.9));
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(Math.round(x), Math.round(y - B * 0.55), Math.round(B * 1.6), Math.round(B * 0.15));
    ctx.fillStyle = "#c8a080";
    ctx.fillRect(Math.round(x - B * 0.5), Math.round(y - B * 1.3 + graze), Math.round(B * 0.6), Math.round(B * 0.6));
    ctx.fillStyle = "#6a5040";
    ctx.fillRect(Math.round(x + B * 0.1), Math.round(y - B * 0.4), Math.round(B * 0.25), Math.round(B * 0.4));
    ctx.fillRect(Math.round(x + B * 1.2), Math.round(y - B * 0.4), Math.round(B * 0.25), Math.round(B * 0.4));
}

function drawChicken(ctx, x, y, B, time, i) {
    const peck = Math.sin(time * 5 + i * 2) > 0.5 ? B * 0.2 : 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(x), Math.round(y - B * 0.8), Math.round(B * 0.7), Math.round(B * 0.5));
    ctx.fillRect(Math.round(x - B * 0.15), Math.round(y - B * 1.1 + peck), Math.round(B * 0.35), Math.round(B * 0.4));
    ctx.fillStyle = "#ffaa22";
    ctx.fillRect(Math.round(x - B * 0.3), Math.round(y - B * 0.95 + peck), Math.round(B * 0.15), Math.round(B * 0.12));
    ctx.fillStyle = "#ff3344";
    ctx.fillRect(Math.round(x - B * 0.1), Math.round(y - B * 0.75 + peck), Math.round(B * 0.12), Math.round(B * 0.15));
    ctx.fillStyle = "#ffaa22";
    ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 0.3), 2, Math.round(B * 0.3));
}

BackgroundRenderer.renderBlockVillage = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._blockVillage;
    if (!st || st.W !== W || st.H !== H) {
        st = buildBlockVillage(W, H, groundY, B);
        this._blockVillage = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.clouds, W, st.clouds.height + B, time, speed, 0.03);
    drawScrollingStrip(ctx, st.hills, W, gY - B * 3, time, speed, 0.08);

    // Селище з мешканцями
    const vW = st.village.width;
    const off = Math.round(time * speed * 0.25) % vW;
    const top = gY - B * 1.2 - st.village.height;
    const base = top + st.village.height;
    const seg = B * 30;
    for (let x = -off; x < W; x += vW) {
        ctx.drawImage(st.village, x, top);
        // Увечері у вікнах запалюється світло
        const evening = smoothStep(((_fx.progress || 0) - 0.63) / 0.1);
        if (evening > 0) {
            ctx.fillStyle = "rgba(255, 200, 90, " + evening.toFixed(3) + ")";
            for (const w of st.windows) {
                ctx.fillRect(Math.round(x + w.x), Math.round(top + w.y), B, B);
            }
        }
        for (let s = 0; s * seg < vW; s++) {
            const sx0 = x + s * seg;
            if (sx0 > W + B * 2 || sx0 + seg < -B * 2) {
                continue;
            }
            drawVillager(ctx, sx0 + B * 7 + Math.sin(time * 0.35 + s) * B * 4, base, B, time, s);
            drawVillager(ctx, sx0 + B * 23 + Math.sin(time * 0.28 + s * 2) * B * 3, base, B, time, s + 1);
            drawSheep(ctx, sx0 + B * 12 + Math.sin(time * 0.15 + s) * B * 1.5, base + B * 0.9, B, time, s);
            drawChicken(ctx, sx0 + B * 18 + Math.sin(time * 0.8 + s) * B * 1.2, base + B * 1.1, B, time, s);
            drawChicken(ctx, sx0 + B * 19.5 + Math.sin(time * 0.6 + s + 1) * B, base + B * 1.1, B, time, s + 1);
        }
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- 2. Місто на заході сонця ----------
// Приморське місто на заході: рожеві хмари й зграя птахів, далекий хмарочосний
// силует з антенами, затока з сонячною доріжкою та вітрильниками, підвісний міст
// із машинами й поїздом, набережна з пальмами та ліхтарями, літаючі машини.

function buildSunsetCity(W, H, groundY, B) {
    const rng = pixelRng(202);
    const gY = Math.round(groundY);
    const waterY = Math.round(gY * 0.62);
    const sky = makeSky(W, H, [[0, "#1a0a2e"], [0.3, "#5a1450"], [0.5, "#e0445a"], [0.62, "#ffb35c"], [1, "#ffb35c"]]);
    const sx = sky.getContext("2d");
    // Сонце з ореолом, що сідає за обрій
    const sunX = W * 0.5;
    const sunY = waterY - B * 5;
    drawPixelDisc(sx, sunX, sunY, B * 7, B / 4, "rgba(255, 220, 140, 0.12)");
    drawPixelDisc(sx, sunX, sunY, B * 5.6, B / 4, "rgba(255, 220, 140, 0.18)");
    drawPixelDisc(sx, sunX, sunY, B * 4.2, B / 2, "#ffd36b");
    sx.fillStyle = "#f08a5a";
    for (let i = 0; i < 4; i++) {
        sx.fillRect(Math.round(sunX - B * 4.2), Math.round(sunY + B * (1 + i * 0.8)), Math.round(B * 8.4), 2 + i);
    }
    // Вода затоки
    const wg = sx.createLinearGradient(0, waterY, 0, gY);
    wg.addColorStop(0, "#c8506a");
    wg.addColorStop(1, "#3a1450");
    sx.fillStyle = wg;
    sx.fillRect(0, waterY, W, gY - waterY);

    // Хмари двох шарів
    function cloudStrip(stripW, count, color, light, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, Math.round(gY * 0.4));
        const cx = strip.getContext("2d");
        for (let i = 0; i < count; i++) {
            const x = Math.round(r() * stripW / B) * B;
            const y = Math.round(r() * strip.height * 0.8 / B) * B;
            const len = 4 + Math.floor(r() * 8);
            cx.fillStyle = color;
            cx.fillRect(x, y, len * B, B * 0.7);
            cx.fillRect(x + B, y - B * 0.5, (len - 3) * B, B * 0.5);
            cx.fillStyle = light;
            cx.fillRect(x, y + B * 0.5, len * B, B * 0.2);
        }
        return strip;
    }
    const cloudsFar = cloudStrip(Math.ceil(W * 1.5 / B) * B, 10, "rgba(120, 40, 110, 0.6)", "rgba(255, 140, 150, 0.5)", 2023);
    const cloudsNear = cloudStrip(Math.ceil(W * 1.3 / B) * B, 6, "rgba(160, 50, 110, 0.75)", "rgba(255, 190, 150, 0.7)", 2024);

    // Далекий силует міста на березі затоки з антенами
    const farW = Math.ceil(W * 1.5 / B) * B;
    const farH = Math.round(gY * 0.26);
    const far = makeCanvas(farW, farH);
    const fx = far.getContext("2d");
    const antennas = [];
    for (let x = 0; x < farW; ) {
        const w = Math.round(3 + rng() * 5) * B / 2;
        const h = Math.round((0.3 + rng() * 0.7) * farH / (B / 2)) * B / 2;
        fx.fillStyle = "#3a1250";
        fx.fillRect(x, farH - h, w, h);
        for (let wy = farH - h + B / 2; wy < farH - B / 2; wy += B / 2) {
            for (let wx = x + B / 4; wx < x + w - B / 4; wx += B / 2) {
                if (rng() < 0.15) {
                    fx.fillStyle = "rgba(255, 180, 120, 0.55)";
                    fx.fillRect(wx, wy, B / 4, B / 4);
                }
            }
        }
        if (h > farH * 0.7) {
            fx.fillStyle = "#3a1250";
            fx.fillRect(x + w / 2 - 1, farH - h - B * 1.5, 2, B * 1.5);
            antennas.push({ x: x + w / 2, y: farH - h - B * 1.6 });
        }
        x += w + Math.round(rng() * 2) * B / 4;
    }

    // Підвісний міст: пілони, троси, настил із ліхтарями
    const bridgeW = Math.ceil(W * 1.4 / (B * 24)) * B * 24;
    const bridgeH = Math.round(gY * 0.45);
    const bridge = makeCanvas(bridgeW, bridgeH);
    const bx = bridge.getContext("2d");
    const deckY = Math.round(bridgeH * 0.62);
    bx.fillStyle = "#2a0a3a";
    bx.fillRect(0, deckY, bridgeW, B * 0.7);
    bx.fillStyle = "#4a1a5a";
    bx.fillRect(0, deckY, bridgeW, B * 0.2);
    const lamps = [];
    for (let x = 0; x < bridgeW; x += B * 24) {
        const px = x + B * 12;
        bx.fillStyle = "#3a1050";
        bx.fillRect(px - B * 0.6, B, B * 1.2, bridgeH - B);
        bx.fillRect(px - B * 1.2, B * 3, B * 2.4, B * 0.4);
        bx.fillStyle = "#ff3355";
        bx.fillRect(px - B * 0.2, B * 0.6, B * 0.4, B * 0.4);
        // Троси — провислі дуги між пілонами
        bx.strokeStyle = "rgba(255, 170, 200, 0.55)";
        bx.lineWidth = 2;
        bx.beginPath();
        bx.moveTo(px - B * 12, deckY - B * 0.2);
        bx.quadraticCurveTo(px - B * 6, deckY - B * 0.5, px, B * 1.2);
        bx.quadraticCurveTo(px + B * 6, deckY - B * 0.5, px + B * 12, deckY - B * 0.2);
        bx.stroke();
        bx.strokeStyle = "rgba(255, 170, 200, 0.3)";
        bx.lineWidth = 1;
        bx.beginPath();
        for (let k = 1; k < 12; k++) {
            const t = k / 12;
            const cy = B * 1.2 + (deckY - B * 1.4) * (1 - t) * (1 - t);
            bx.moveTo(px - t * B * 12, deckY);
            bx.lineTo(px - t * B * 12, cy + (deckY - cy) * t * 0.1);
            bx.moveTo(px + t * B * 12, deckY);
            bx.lineTo(px + t * B * 12, cy + (deckY - cy) * t * 0.1);
        }
        bx.stroke();
        for (let k = 0; k < 6; k++) {
            lamps.push({ x: x + B * 2 + k * B * 4, y: deckY - B * 0.3 });
        }
    }

    // Набережна з пальмами й ліхтарями
    const promW = Math.ceil(W * 1.3 / B) * B;
    const prom = makeCanvas(promW, B * 5);
    const px = prom.getContext("2d");
    px.fillStyle = "#1a0620";
    px.fillRect(0, B * 4.4, promW, B * 0.6);
    px.fillStyle = "#3a1440";
    for (let x = 0; x < promW; x += B * 0.8) {
        px.fillRect(x, B * 3.9, B * 0.15, B * 0.5);
    }
    px.fillRect(0, B * 3.9, promW, B * 0.12);
    for (let x = B * 2; x < promW; x += B * 7) {
        px.fillStyle = "#140620";
        px.fillRect(x, B * 1.4, B * 0.35, B * 3);
        for (let f = -2; f <= 2; f++) {
            px.fillRect(x + f * B * 0.7 - B * 0.3, B * 1.2 + Math.abs(f) * B * 0.25, B, B * 0.3);
        }
        px.fillStyle = "#2a0a30";
        px.fillRect(x + B * 3.5, B * 2, B * 0.15, B * 2.4);
        px.fillStyle = "#ffd36b";
        px.fillRect(x + B * 3.3, B * 1.8, B * 0.55, B * 0.3);
    }

    const cars = [];
    for (let i = 0; i < 4; i++) {
        cars.push({ lane: i % 2, offset: rng() * W * 2, speed: 90 + rng() * 80, color: ["#ff2ea6", "#00f6ff", "#ffe14d"][i % 3] });
    }
    return {
        W: W, H: H, sky: sky, waterY: waterY, cloudsFar: cloudsFar, cloudsNear: cloudsNear,
        far: far, antennas: antennas, bridge: bridge, deckY: deckY, lamps: lamps, prom: prom, cars: cars
    };
}

BackgroundRenderer.renderSunsetCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._sunsetCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSunsetCity(W, H, groundY, B);
        this._sunsetCity = st;
    }
    const gY = Math.round(groundY);
    const wy = st.waterY;
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.cloudsFar, W, st.cloudsFar.height, time, speed, 0.02);
    drawScrollingStrip(ctx, st.cloudsNear, W, st.cloudsNear.height + B * 2, time, speed, 0.05);

    // Зграя птахів
    const fk = (time * 0.05) % 1;
    const fxb = W * 1.1 - fk * W * 1.3;
    ctx.fillStyle = "#2a0a3a";
    for (let i = 0; i < 7; i++) {
        const row = Math.abs(i - 3);
        const bx = fxb + row * B * 0.9;
        const by = gY * 0.2 + (i - 3) * B * 0.5 + Math.sin(time * 2 + i) * 2;
        const up = Math.sin(time * 8 + i) > 0;
        ctx.fillRect(Math.round(bx - B * 0.4), Math.round(by + (up ? -2 : 1)), Math.round(B * 0.4), 2);
        ctx.fillRect(Math.round(bx), Math.round(by), 2, 2);
        ctx.fillRect(Math.round(bx + 2), Math.round(by + (up ? -2 : 1)), Math.round(B * 0.4), 2);
    }

    // Далеке місто на березі, антени блимають
    const farW = st.far.width;
    const fOff = Math.round(time * speed * 0.06) % farW;
    for (let x = -fOff; x < W; x += farW) {
        ctx.drawImage(st.far, x, wy - st.far.height);
        for (let i = 0; i < st.antennas.length; i++) {
            if ((time + i * 0.37) % 1.4 < 0.5) {
                const a = st.antennas[i];
                ctx.fillStyle = "#ff3355";
                ctx.fillRect(Math.round(x + a.x - 2), Math.round(wy - st.far.height + a.y), 4, 4);
            }
        }
    }

    // Сонячна доріжка на воді та хвилі
    for (let i = 0; i < 10; i++) {
        const y = wy + B * 0.4 + i * (gY - wy) / 10;
        const w = B * (3 - i * 0.15) * (0.7 + 0.3 * Math.sin(time * 3 + i * 1.7));
        ctx.fillStyle = "rgba(255, 220, 140, " + (0.6 - i * 0.04).toFixed(3) + ")";
        ctx.fillRect(Math.round(W * 0.5 - w + Math.sin(time * 2 + i) * B * 0.3), Math.round(y), Math.round(w * 2), 3);
    }
    ctx.fillStyle = "rgba(255, 190, 200, 0.25)";
    for (let i = 0; i < 16; i++) {
        const x = ((i * W / 16 + time * B * (0.5 + (i % 3) * 0.3)) % W);
        ctx.fillRect(Math.round(x), Math.round(wy + B * 0.8 + (i % 5) * (gY - wy) / 6), Math.round(B * 1.2), 2);
    }
    // Вітрильники
    for (let i = 0; i < 2; i++) {
        const k = ((time * (0.015 + i * 0.01) + i * 0.5) % 1);
        const x = W * 1.05 - k * W * 1.15;
        const y = wy + B * (1.2 + i * 1.5);
        const s = 1 - i * 0.2;
        ctx.fillStyle = "#2a0a3a";
        ctx.fillRect(Math.round(x - B * 1.2 * s), Math.round(y), Math.round(B * 2.6 * s), Math.round(B * 0.5 * s));
        ctx.fillStyle = "#ffe8d0";
        ctx.beginPath();
        ctx.moveTo(x, y - B * 2.4 * s);
        ctx.lineTo(x, y);
        ctx.lineTo(x + B * 1.3 * s, y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff9ed0";
        ctx.beginPath();
        ctx.moveTo(x - 2, y - B * 1.8 * s);
        ctx.lineTo(x - 2, y);
        ctx.lineTo(x - B * 0.9 * s, y);
        ctx.closePath();
        ctx.fill();
    }

    // Літаючі машини-кубики зі світловим шлейфом
    for (const car of st.cars) {
        const span = W + B * 10;
        const x = Math.round(((car.offset + time * car.speed) % span) - B * 5);
        const y = Math.round(gY * (0.3 + car.lane * 0.12));
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = car.color;
        ctx.fillRect(x - B * 2, y + B * 0.2, B * 2, B * 0.25);
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, B, B * 0.6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.25, B * 0.2);
    }

    // Міст: ліхтарі мерехтять, по настилу їдуть машини й проноситься поїзд
    const brW = st.bridge.width;
    const bOff = Math.round(time * speed * 0.18) % brW;
    const bTop = gY - B * 2 - st.bridge.height;
    const deck = bTop + st.deckY;
    for (let x = -bOff; x < W; x += brW) {
        ctx.drawImage(st.bridge, x, bTop);
        for (let i = 0; i < st.lamps.length; i++) {
            const l = st.lamps[i];
            ctx.fillStyle = (i + Math.floor(time * 2)) % 7 === 0 ? "#ffffff" : "#ffd36b";
            ctx.fillRect(Math.round(x + l.x), Math.round(bTop + l.y), 3, 3);
        }
    }
    for (let i = 0; i < 5; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const k = ((time * (0.07 + i * 0.013) + i * 0.21) % 1);
        const cx = dir > 0 ? -B * 2 + k * (W + B * 4) : W + B * 2 - k * (W + B * 4);
        ctx.fillStyle = "#1a0620";
        ctx.fillRect(Math.round(cx), Math.round(deck - B * 0.45), Math.round(B * 1.1), Math.round(B * 0.45));
        ctx.fillStyle = dir > 0 ? "#fff4c0" : "#ff3355";
        ctx.fillRect(Math.round(cx + (dir > 0 ? B * 1.1 : -2)), Math.round(deck - B * 0.3), 2, 2);
    }
    const tk = (time % 9) / 9;
    if (tk < 0.45) {
        const q = tk / 0.45;
        const tx = W + B * 2 - q * (W + B * 18);
        for (let c = 0; c < 4; c++) {
            ctx.fillStyle = "#e8d0e0";
            ctx.fillRect(Math.round(tx + c * B * 4), Math.round(deck - B * 1.1), Math.round(B * 3.8), Math.round(B * 0.9));
            ctx.fillStyle = "#ffd36b";
            for (let w = 0; w < 3; w++) {
                ctx.fillRect(Math.round(tx + c * B * 4 + B * 0.4 + w * B * 1.1), Math.round(deck - B * 0.9), Math.round(B * 0.6), Math.round(B * 0.3));
            }
        }
        ctx.fillStyle = "#ff2ea6";
        ctx.fillRect(Math.round(tx), Math.round(deck - B * 0.5), Math.round(B * 16), 2);
    }

    drawScrollingStrip(ctx, st.prom, W, gY, time, speed, 0.4);
};

// ---------- 3. Космодром ----------

function buildCosmodrome(W, H, groundY, B) {
    const rng = pixelRng(303);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020412"], [0.7, "#0b1640"], [1, "#1b2a5c"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.8, 110, rng, B);
    // Великий місяць із кратерами
    drawPixelDisc(sx, W * 0.16, gY * 0.22, B * 3.6, B / 2, "rgba(220, 230, 255, 0.15)");
    drawPixelDisc(sx, W * 0.16, gY * 0.22, B * 2.8, B / 2, "#d8dcec");
    drawPixelDisc(sx, W * 0.16 - B, gY * 0.22 - B * 0.6, B * 0.7, B / 4, "#b0b6cc");
    drawPixelDisc(sx, W * 0.16 + B * 1.1, gY * 0.22 + B * 0.8, B * 0.9, B / 4, "#b0b6cc");
    drawPixelDisc(sx, W * 0.16 + B * 0.3, gY * 0.22 - B * 1.6, B * 0.4, B / 4, "#b0b6cc");
    // Далекі гори
    const mcols = Math.ceil(W / B) + 1;
    const mH = periodicHeights(mcols, 4, [{ amp: 2, k: 2, ph: 1.2 }, { amp: 1, k: 6, ph: 0.4 }]);
    sx.fillStyle = "#0d1634";
    for (let c = 0; c < mcols; c++) {
        sx.fillRect(c * B, gY - B * 2 - mH[c] * B, B, mH[c] * B + B * 2);
    }
    // Монтажний корпус із прапором і смугами
    const vabX = Math.round(W * 0.42);
    sx.fillStyle = "#1e2848";
    sx.fillRect(vabX, gY - B * 9, B * 6, B * 9);
    sx.fillStyle = "#2a3660";
    sx.fillRect(vabX, gY - B * 9, B * 6, B * 0.4);
    sx.fillStyle = "#3a6aff";
    sx.fillRect(vabX + B * 0.6, gY - B * 8, B * 1.8, B * 1.2);
    sx.fillStyle = "#ffe14d";
    sx.fillRect(vabX + B * 0.6, gY - B * 7.4, B * 1.8, B * 0.6);
    sx.fillStyle = "#141c36";
    for (let k = 0; k < 4; k++) {
        sx.fillRect(vabX + B * 3.4, gY - B * (8 - k * 1.8), B * 2, B * 1.2);
    }
    // Далекий стартовий майданчик з іншою ракетою
    const farX = Math.round(W * 0.28);
    sx.fillStyle = "#2a3350";
    sx.fillRect(farX, gY - B * 6, B * 0.5, B * 6);
    sx.fillStyle = "#c8ccd8";
    sx.fillRect(farX + B, gY - B * 5, B, B * 4.2);
    sx.fillStyle = "#ff3355";
    sx.fillRect(farX + B * 1.2, gY - B * 5.5, B * 0.6, B * 0.5);
    // Сферичні баки з пальним
    for (let k = 0; k < 2; k++) {
        drawPixelDisc(sx, W * 0.88 + k * B * 2.6, gY - B * 2, B * 1.2, B / 4, "#8a96b0");
        sx.fillStyle = "#4a5470";
        sx.fillRect(Math.round(W * 0.88 + k * B * 2.6 - B * 0.2), gY - B * 1.2, B * 0.4, B * 1.2);
    }
    // Дорога
    sx.fillStyle = "#1a2240";
    sx.fillRect(0, gY - B * 0.6, W, B * 0.3);
    const cols = Math.ceil(W / B) + 1;
    const hills = periodicHeights(cols, 2, [{ amp: 1, k: 2, ph: 0.2 }, { amp: 0.6, k: 5, ph: 1 }]);
    sx.fillStyle = "#0a1026";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Стартова вежа
    const towerX = Math.round(W * 0.72 / B) * B;
    sx.fillStyle = "#2a3350";
    sx.fillRect(towerX, gY - B * 12, B, B * 12);
    for (let i = 0; i < 12; i++) {
        sx.fillStyle = i % 2 === 0 ? "#3a4570" : "#2a3350";
        sx.fillRect(towerX - B / 2, gY - B * (i + 1), B * 2, B / 4);
    }
    sx.fillStyle = "#ff3333";
    sx.fillRect(towerX + B / 4, gY - B * 12.5, B / 2, B / 2);
    // Майданчик
    sx.fillStyle = "#39415e";
    sx.fillRect(towerX - B * 2, gY - B, B * 6, B);
    return { W: W, H: H, sky: sky, padX: towerX + B * 1.5, gY: gY, vabX: vabX, farX: farX };
}

BackgroundRenderer.renderCosmodrome = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._cosmodrome;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCosmodrome(W, H, groundY, B);
        this._cosmodrome = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const gYc = st.gY;
    // Супутники та станція перетинають небо
    for (let i = 0; i < 3; i++) {
        const k = ((time * (0.03 + i * 0.012) + i * 0.37) % 1);
        const x = W * 1.05 - k * W * 1.1;
        const y = gYc * (0.08 + i * 0.12) + k * B * 2;
        if (i === 0) {
            ctx.fillStyle = "#3a5aa0";
            ctx.fillRect(Math.round(x - B * 1.6), Math.round(y - B * 0.3), B, Math.round(B * 0.6));
            ctx.fillRect(Math.round(x + B * 0.6), Math.round(y - B * 0.3), B, Math.round(B * 0.6));
            ctx.fillStyle = "#e8eef2";
            ctx.fillRect(Math.round(x - B * 0.6), Math.round(y - B * 0.2), Math.round(B * 1.2), Math.round(B * 0.4));
        } else {
            ctx.fillStyle = Math.sin(time * 5 + i) > 0 ? "#ffffff" : "#8ab4ff";
            ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
        }
    }
    // Прожектори світять на ракету
    for (let i = 0; i < 2; i++) {
        const lx = st.padX + (i === 0 ? -B * 9 : B * 7);
        ctx.fillStyle = "#2a3350";
        ctx.fillRect(Math.round(lx - 2), gYc - B * 5, 4, B * 5);
        ctx.fillStyle = "#fff4c0";
        ctx.fillRect(Math.round(lx - B * 0.4), gYc - B * 5.4, Math.round(B * 0.8), Math.round(B * 0.4));
        const ang = Math.atan2(-B * 3, st.padX + B - lx) + Math.sin(time * 0.5 + i) * 0.05;
        drawBeam(ctx, lx, gYc - B * 5.2, ang, B * 10, 0.08, "rgba(255, 244, 200, 0.1)");
    }
    // Вогні на корпусі й вежі блимають
    if (Math.sin(time * 3) > 0) {
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(Math.round(st.vabX + B * 2.8), gYc - B * 9.4, Math.round(B * 0.4), Math.round(B * 0.4));
    }
    // Пара біля далекої ракети
    for (let k = 0; k < 3; k++) {
        const q = (time * 0.4 + k / 3) % 1;
        ctx.globalAlpha = (1 - q) * 0.3;
        drawPixelDisc(ctx, st.farX + B * 1.5 + q * B * 2, gYc - B * 0.8 - q * B * 2, B * (0.4 + q), B / 4, "#e8ecf2");
    }
    ctx.globalAlpha = 1;
    // Вантажівки їдуть дорогою
    for (let i = 0; i < 2; i++) {
        const k = ((time * 0.08 + i * 0.5) % 1);
        const tx = i === 0 ? -B * 3 + k * (W + B * 6) : W + B * 3 - k * (W + B * 6);
        const ty = gYc - B * 1.1;
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(Math.round(tx), Math.round(ty), B * 2.4, Math.round(B * 0.6));
        ctx.fillStyle = "#3a4570";
        ctx.fillRect(Math.round(tx + (i === 0 ? B * 1.8 : 0)), Math.round(ty - B * 0.3), Math.round(B * 0.6), Math.round(B * 0.3));
        ctx.fillStyle = i === 0 ? "#fff4a0" : "#ff3355";
        ctx.fillRect(Math.round(tx + (i === 0 ? B * 2.4 : -3)), Math.round(ty + B * 0.1), 3, 3);
    }
    // Ракета: заправляється, чекає кінця відліку (70% рівня) і злітає з вогняним слідом
    const progress = _fx.progress || 0;
    const launchAt = 5;
    const t = progress < 0.6 ? 3 : progress < 0.7 ? 4.5 : launchAt + (progress - 0.7) / 0.3 * 3.5;
    const lift = t < launchAt ? 0 : Math.pow(t - launchAt, 2) * B * 3;
    const rx = st.padX;
    const ry = st.gY - B - B * 6 - lift;
    if (ry > -B * 8) {
        if (t >= launchAt - 1) {
            // Вогонь і дим
            const flameH = B * (2 + Math.sin(time * 30) * 0.5 + (t >= launchAt ? 2 : 0));
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(rx + B * 0.25, ry + B * 6, B * 1.5, flameH);
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(rx + B * 0.5, ry + B * 6 + flameH * 0.3, B, flameH);
            ctx.fillStyle = "rgba(200, 200, 220, 0.25)";
            for (let k = 0; k < 6; k++) {
                const sz = B * (1 + k * 0.5);
                ctx.fillRect(rx + B - sz / 2 + Math.sin(k * 2 + time) * B, st.gY - B - sz, sz, sz);
            }
        }
        ctx.fillStyle = "#e8ecf2";
        ctx.fillRect(rx, ry + B, B * 2, B * 5);
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(rx + B / 2, ry, B, B);
        ctx.fillRect(rx - B / 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillRect(rx + B * 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(rx + B * 0.6, ry + B * 2, B * 0.8, B * 0.8);
    }
};
