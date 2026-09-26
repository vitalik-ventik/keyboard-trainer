// backgrounds/crystal_dino_base_luna.js — кришталева печера, долина динозаврів,
// секретна база, луна-парк

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, drawPixelDisc, drawScrollingStrip, drawStarsInto, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";
import { _fx } from "./effects.js";
import { drawBeam } from "./story.js";

// ---------- 8. Кришталева печера ----------
// Велика печера: брили кристалів трьох кольорів, сталактити, світні гриби,
// підземне озеро з відблисками. Промінь світла крізь призму розкладається на веселку.

// Піксельний кристал-призма: шестикутна «колона» з гострою верхівкою
function drawCrystal(ctx, x, baseY, w, h, color, light, dark) {
    const p = Math.max(2, Math.round(w / 4));
    const tip = Math.min(h - p, Math.round(w * 1.5));
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h + tip, w, h - tip);
    for (let r = 0; r < tip; r += p) {
        const inset = Math.round((1 - r / tip) * w / 2 / p) * p;
        ctx.fillRect(x + inset, baseY - h + r, w - inset * 2, p);
    }
    ctx.fillStyle = light;
    ctx.fillRect(x + p, baseY - h + tip, p, h - tip - p);
    ctx.fillStyle = dark;
    ctx.fillRect(x + w - p, baseY - h + tip, p, h - tip);
}

const CRYSTAL_COLORS = [
    ["#b35cff", "#e6bfff", "#6a2aa0"],
    ["#39c6ff", "#bff0ff", "#1a6a9a"],
    ["#ff5ad8", "#ffc8f0", "#9a2a80"]
];

function buildCrystalCave(W, H, groundY, B) {
    const rng = pixelRng(808);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#07040f"], [0.6, "#140a26"], [1, "#1e1036"]]);
    const cols = Math.ceil(W * 1.4 / B);

    // Далека стіна печери
    const farH = periodicHeights(cols, 9, [{ amp: 2.5, k: 3, ph: 0.2 }, { amp: 1.2, k: 7, ph: 1.4 }]);
    const far = makeCanvas(cols * B, (Math.max.apply(null, farH) + 1) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < farH[c]; r++) {
            fx.fillStyle = (r + c) % 2 === 0 ? "#1a1030" : "#1d1236";
            fx.fillRect(c * B, far.height - (r + 1) * B, B, B);
        }
    }
    // Дрібні кристали на далекій стіні
    for (let i = 0; i < cols / 3; i++) {
        const c = Math.floor(rng() * cols);
        const pal = CRYSTAL_COLORS[i % 3];
        drawCrystal(fx, c * B, far.height - Math.floor(rng() * farH[c]) * B, Math.round(B * 0.6), Math.round(B * 1.4), pal[2], pal[0], "#120a20");
    }

    // Стеля зі сталактитами та кристалами, що звисають
    const ceilH = periodicHeights(cols, 2.5, [{ amp: 1.5, k: 5, ph: 0.9 }, { amp: 1, k: 11, ph: 0.3 }]);
    const ceil = makeCanvas(cols * B, (Math.max.apply(null, ceilH) + 4) * B);
    const cx = ceil.getContext("2d");
    for (let c = 0; c < cols; c++) {
        cx.fillStyle = c % 2 === 0 ? "#150c26" : "#180e2c";
        cx.fillRect(c * B, 0, B, ceilH[c] * B);
        if (rng() < 0.2) {
            const len = 1 + Math.floor(rng() * 3);
            for (let k = 0; k < len; k++) {
                cx.fillRect(c * B + k * B / 6, ceilH[c] * B + k * B, B - k * B / 3, B);
            }
        }
        if (rng() < 0.12) {
            const pal = CRYSTAL_COLORS[Math.floor(rng() * 3)];
            cx.save();
            cx.translate(c * B + B / 2, ceilH[c] * B);
            cx.scale(1, -1);
            drawCrystal(cx, -B / 3, 0, Math.round(B * 0.7), Math.round(B * 2), pal[0], pal[1], pal[2]);
            cx.restore();
        }
    }

    // Ближні брили кристалів і гриби
    const stripW = Math.ceil(W * 1.5 / B) * B;
    const nearH = Math.round(B * 8);
    const near = makeCanvas(stripW, nearH);
    const nx = near.getContext("2d");
    const glows = [];
    for (let x = B; x < stripW - B * 5; x += B * (5 + Math.floor(rng() * 4))) {
        const pal = CRYSTAL_COLORS[Math.floor(rng() * 3)];
        const n = 2 + Math.floor(rng() * 3);
        // Кам'яна основа
        nx.fillStyle = "#1c1030";
        nx.fillRect(x - B * 0.5, nearH - B, B * (n + 1.5), B);
        for (let k = 0; k < n; k++) {
            const h = Math.round(B * (2 + rng() * 4.5));
            const w = Math.round(B * (0.8 + rng() * 0.6));
            drawCrystal(nx, Math.round(x + k * B * 0.9), nearH - B * 0.6, w, h, pal[0], pal[1], pal[2]);
        }
        glows.push({ x: x + n * B * 0.45, y: nearH - B * 2.5, color: pal[0], phase: rng() * 6 });
        // Світні гриби поруч
        if (rng() < 0.6) {
            const mx = x + (n + 1) * B;
            nx.fillStyle = "#d8d0e8";
            nx.fillRect(mx, nearH - B * 1.4, B * 0.3, B * 0.8);
            nx.fillStyle = "#39ffd0";
            nx.fillRect(mx - B * 0.35, nearH - B * 1.7, B, B * 0.4);
            glows.push({ x: mx + B * 0.15, y: nearH - B * 1.5, color: "#39ffd0", phase: rng() * 6, small: true });
        }
    }
    return { W: W, H: H, sky: sky, far: far, ceil: ceil, near: near, glows: glows };
}

BackgroundRenderer.renderCrystalCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._crystalCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCrystalCave(W, H, groundY, B);
        this._crystalCave = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    drawScrollingStrip(ctx, st.far, W, gY - B * 1.5, time, speed, 0.08);
    // Промінь крізь отвір у стелі падає на призму й розкладається на веселку
    const prismX = W * 0.35;
    const prismY = gY * 0.55;
    ctx.fillStyle = "rgba(255, 255, 240, 0.18)";
    ctx.beginPath();
    ctx.moveTo(W * 0.2, 0);
    ctx.lineTo(W * 0.2 + B * 2, 0);
    ctx.lineTo(prismX + B * 0.5, prismY);
    ctx.lineTo(prismX - B * 0.5, prismY);
    ctx.closePath();
    ctx.fill();
    const rainbow = ["255, 51, 85", "255, 154, 61", "255, 225, 77", "57, 255, 136", "57, 198, 255", "179, 92, 255"];
    const shimmer = 0.2 + 0.06 * Math.sin(time * 2);
    for (let i = 0; i < rainbow.length; i++) {
        const a0 = 0.15 + i * 0.07;
        ctx.fillStyle = "rgba(" + rainbow[i] + ", " + shimmer.toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(prismX, prismY);
        ctx.lineTo(prismX + Math.cos(a0) * W, prismY + Math.sin(a0) * W);
        ctx.lineTo(prismX + Math.cos(a0 + 0.06) * W, prismY + Math.sin(a0 + 0.06) * W);
        ctx.closePath();
        ctx.fill();
    }

    drawCrystal(ctx, Math.round(prismX - B * 0.8), Math.round(prismY + B * 1.2), Math.round(B * 1.6), Math.round(B * 2.6), "#e6f4ff", "#ffffff", "#9ab4d0");

    // Підземне озеро з відблисками
    ctx.fillStyle = "rgba(60, 30, 120, 0.45)";
    ctx.fillRect(0, gY - B * 1.8, W, B * 0.9);
    for (let i = 0; i < 12; i++) {
        const lx = ((i * W / 12 + Math.sin(time * 0.8 + i) * B) % W + W) % W;
        ctx.fillStyle = i % 2 === 0 ? "rgba(214, 139, 255, 0.5)" : "rgba(120, 220, 255, 0.5)";
        ctx.fillRect(Math.round(lx), gY - B * 1.5 + (i % 3) * 3, Math.round(B * (0.6 + (i % 3) * 0.3)), 2);
    }

    // Стеля зі сталактитами
    const ceilW = st.ceil.width;
    const cOff = Math.round(time * speed * 0.2) % ceilW;
    for (let x = -cOff; x < W; x += ceilW) {
        ctx.drawImage(st.ceil, x, 0);
    }

    // Брили кристалів пульсують світлом
    const nW = st.near.width;
    const nOff = Math.round(time * speed * 0.45) % nW;
    const nTop = gY - st.near.height;
    for (let x = -nOff; x < W; x += nW) {
        for (const g of st.glows) {
            const gx = x + g.x;
            if (gx < -B * 3 || gx > W + B * 3) {
                continue;
            }
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + g.phase);
            ctx.globalAlpha = (g.small ? 0.15 : 0.12) + 0.12 * pulse;
            drawPixelDisc(ctx, gx, nTop + g.y, B * (g.small ? 1 : 2.4), B / 2, g.color);
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(st.near, x, nTop);
    }
    // Спори, що повільно злітають угору
    drawFallingPixels(ctx, W, gY, time, 26, 8080, {
        color: "#d68bff", dir: -1, speedMin: 8, speedMax: 20, sizeMin: 2, sizeMax: 3,
        sway: 1.1, swayAmp: B, alpha: 0.7
    });
};

// ---------- 9. Долина динозаврів ----------
// Вулкан на обрії димить і дедалі сильніше вивергається з прогресом рівня,
// у глибині бреде довгошия зауропода, над папоротями пролітають птеродактилі.

function buildDinoValley(W, H, groundY, B) {
    const rng = pixelRng(909);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#2a1f5a"], [0.45, "#b8506a"], [0.75, "#ff9a55"], [1, "#ffd08a"]]);
    const skx = sky.getContext("2d");
    // Велике низьке сонце
    drawPixelDisc(skx, W * 0.3, gY * 0.5, B * 5.5, B, "rgba(255, 230, 150, 0.25)");
    drawPixelDisc(skx, W * 0.3, gY * 0.5, B * 4, B, "#ffe9a8");

    // Вулкан — один великий силует у далекому шарі (не прокручується)
    const vW = B * 26;
    const vH = Math.round(gY * 0.55);
    const volcano = makeCanvas(vW, vH);
    const vx = volcano.getContext("2d");
    const rows = Math.ceil(vH / B);
    for (let r = 0; r < rows; r++) {
        const k = r / Math.max(1, rows - 1);
        const half = Math.min(13, Math.round(2 + k * 11 + (r > 1 && rng() < 0.3 ? 1 : 0)));
        for (let c = -half; c < half; c++) {
            // Кратер: виїмка у верхньому ряду
            if (r === 0 && c >= -1 && c < 1) {
                continue;
            }
            vx.fillStyle = c < -half * 0.3 ? "#241428" : (r + c) % 3 === 0 ? "#34203a" : "#2e1c34";
            vx.fillRect(vW / 2 + c * B, r * B, B, B);
        }
    }

    // Далекі гори
    const cols = Math.ceil(W * 1.4 / B);
    const farH = periodicHeights(cols, 5, [{ amp: 2.5, k: 3, ph: 0.4 }, { amp: 1, k: 7, ph: 1.1 }]);
    const far = makeCanvas(cols * B, (Math.max.apply(null, farH) + 1) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < cols; c++) {
        fx.fillStyle = c % 2 === 0 ? "#5a3456" : "#613a5c";
        fx.fillRect(c * B, far.height - farH[c] * B, B, farH[c] * B);
    }

    // Середній шар: джунглі з папоротей і саговників
    const mid = makeCanvas(cols * B, B * 9);
    const mx = mid.getContext("2d");
    const midH = periodicHeights(cols, 3, [{ amp: 1, k: 5, ph: 0.7 }, { amp: 0.7, k: 11, ph: 0.2 }]);
    for (let c = 0; c < cols; c++) {
        mx.fillStyle = c % 2 === 0 ? "#1e4a2a" : "#22532f";
        mx.fillRect(c * B, mid.height - midH[c] * B, B, midH[c] * B);
    }
    for (let c = 3; c < cols - 3; c += 7 + Math.floor(rng() * 5)) {
        const trunk = 4 + Math.floor(rng() * 3);
        const base = mid.height - midH[c] * B;
        mx.fillStyle = "#4a3020";
        mx.fillRect(c * B + B / 4, base - trunk * B, B / 2, trunk * B);
        mx.fillStyle = "#2f7a3a";
        const top = base - trunk * B;
        for (let k = -3; k <= 3; k++) {
            const droop = Math.abs(k) * B * 0.45;
            mx.fillRect(c * B + k * B * 0.8, top + droop - B / 4, B * 0.9, B / 2);
        }
        mx.fillStyle = "#3fa04a";
        mx.fillRect(c * B - B / 4, top - B / 2, B * 1.5, B / 2);
    }

    // Ближній шар: папороть і каміння біля землі
    const near = makeCanvas(cols * B, B * 3);
    const nx = near.getContext("2d");
    for (let c = 0; c < cols; c++) {
        const h = 1 + Math.floor(rng() * 2);
        nx.fillStyle = c % 3 === 0 ? "#2f8a3a" : "#277a32";
        nx.fillRect(c * B, near.height - h * B * 0.7, B, h * B * 0.7);
        if (rng() < 0.25) {
            nx.fillStyle = "#5a6070";
            nx.fillRect(c * B + B / 4, near.height - B * 0.6, B * 0.8, B * 0.6);
        }
        if (rng() < 0.3) {
            nx.fillStyle = "#4fb55a";
            nx.fillRect(c * B + B / 3, near.height - h * B * 0.7 - B / 2, B / 4, B / 2);
        }
    }
    return { W: W, H: H, sky: sky, volcano: volcano, far: far, mid: mid, near: near };
}

// Довгошия зауропода крокує в глибині сцени
function drawSauropod(ctx, x, baseY, B, time) {
    const step = Math.sin(time * 3);
    ctx.fillStyle = "#3d5a48";
    // Тулуб і хвіст
    ctx.fillRect(x, baseY - B * 4, B * 6, B * 2.5);
    ctx.fillRect(x - B * 3, baseY - B * 3.4, B * 3, B);
    ctx.fillRect(x - B * 5, baseY - B * 3, B * 2, B * 0.6);
    // Шия і голова
    const nod = Math.sin(time * 1.2) * B * 0.3;
    ctx.fillRect(x + B * 5, baseY - B * 6, B, B * 2.5);
    ctx.fillRect(x + B * 5.5, baseY - B * 8, B, B * 2.5);
    ctx.fillRect(x + B * 6, baseY - B * 9.5 + nod, B * 1.8, B);
    ctx.fillStyle = "#1a2a20";
    ctx.fillRect(x + B * 7.2, baseY - B * 9.3 + nod, B * 0.25, B * 0.25);
    // Ноги, що крокують
    ctx.fillStyle = "#2f4a3a";
    const a = step * B * 0.4;
    ctx.fillRect(x + B * 0.5 + a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillRect(x + B * 4.2 - a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillStyle = "#3d5a48";
    ctx.fillRect(x + B * 1.5 - a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillRect(x + B * 5.2 + a, baseY - B * 1.5, B, B * 1.5);
}

// Птеродактиль з двокадровим помахом крил
function drawPterodactyl(ctx, x, y, B, time, phase) {
    const up = Math.sin(time * 6 + phase) > 0;
    const u = B * 0.5;
    ctx.fillStyle = "#5a2a3a";
    // Тулуб, голова з гребенем і дзьобом
    ctx.fillRect(x, y, u * 3, u);
    ctx.fillRect(x - u, y - u * 0.5, u * 1.5, u);
    ctx.fillRect(x - u * 2.5, y, u * 1.8, u * 0.5);
    ctx.fillRect(x + u * 0.2, y - u * 1.2, u * 1.4, u * 0.6);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x - u * 0.6, y - u * 0.3, u * 0.35, u * 0.35);
    // Крила: «V» догори або «Λ» донизу
    ctx.fillStyle = "#7a3a4a";
    const dir = up ? -1 : 1;
    for (let k = 1; k <= 4; k++) {
        ctx.fillRect(x + u * 1.5 - k * u * 1.1, y + dir * k * u * 0.7, u * 1.2, u * 0.7);
        ctx.fillRect(x + u * 1.5 + (k - 1) * u * 1.1, y + dir * k * u * 0.7, u * 1.2, u * 0.7);
    }
}

BackgroundRenderer.renderDinoValley = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dinoValley;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDinoValley(W, H, groundY, B);
        this._dinoValley = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    ctx.drawImage(st.sky, 0, 0);

    // Вулкан: дим, а з прогресом — виверження з лавовими «бомбами»
    const vX = Math.round(W * 0.72 - st.volcano.width / 2);
    const vY = gY - st.volcano.height - B * 2;
    const craterX = vX + st.volcano.width / 2;
    for (let i = 0; i < 7; i++) {
        const k = ((time * 0.12 + i / 7) % 1);
        ctx.globalAlpha = (1 - k) * 0.5;
        drawPixelDisc(ctx, craterX + Math.sin(i * 2.1 + time * 0.4) * B * 1.5 + k * B * 5, vY - B - k * gY * 0.35, B * (1.2 + k * 2.5), B / 2, "#5a4a5e");
    }
    ctx.globalAlpha = 1;
    const erupt = Math.max(0, (progress - 0.3) / 0.7);
    if (erupt > 0) {
        const glow = 0.3 + 0.3 * Math.sin(time * 6);
        ctx.fillStyle = "rgba(255, 110, 40, " + (erupt * glow).toFixed(3) + ")";
        ctx.fillRect(craterX - B * 4, vY - B * 3, B * 8, B * 4);
        const bombs = Math.round(3 + erupt * 7);
        for (let i = 0; i < bombs; i++) {
            const k = (time * 0.7 + i * 0.37) % 1;
            const dir = ((i * 53) % 11) / 5.5 - 1;
            const bx = craterX + dir * k * B * 10;
            const by = vY - Math.sin(k * Math.PI) * B * (6 + (i % 3) * 3);
            ctx.fillStyle = k < 0.5 ? "#ffcc33" : "#ff6a2a";
            ctx.fillRect(Math.round(bx), Math.round(by), Math.round(B * 0.5), Math.round(B * 0.5));
        }
    }
    ctx.drawImage(st.volcano, vX, vY);
    ctx.fillStyle = "#ff8a3a";
    ctx.fillRect(craterX - B, vY, B * 2, B * 0.5);
    // Під час виверження лава стікає схилами
    if (erupt > 0) {
        ctx.fillStyle = "#ff6a2a";
        const flow = Math.min(1, erupt * 1.6);
        for (let k = 0; k < Math.round(flow * 7); k++) {
            ctx.fillRect(Math.round(craterX - B * 1.5 - k * B * 0.8), vY + k * B, Math.round(B * 0.5), B);
            ctx.fillRect(Math.round(craterX + B + k * B * 0.8), vY + k * B, Math.round(B * 0.5), B);
        }
    }

    drawScrollingStrip(ctx, st.far, W, gY - B * 2, time, speed, 0.08);

    // Зауропода повільно йде в глибині (з'являється знову з іншого боку)
    const loop = W + B * 20;
    const sx = W + B * 8 - ((time * speed * 0.14 + time * B * 0.6) % loop);
    drawSauropod(ctx, Math.round(sx), gY - B * 3, B, time);

    drawScrollingStrip(ctx, st.mid, W, gY, time, speed, 0.25);

    // Зграйка птеродактилів
    for (let i = 0; i < 3; i++) {
        const lp = W + B * 12;
        const px = W + B * 4 - ((time * (B * 3 + i * B) + i * W * 0.4) % lp);
        const py = gY * (0.18 + i * 0.09) + Math.sin(time * 1.5 + i) * B * 0.8;
        drawPterodactyl(ctx, Math.round(px), Math.round(py), B, time, i * 1.7);
    }

    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.55);
};

// ---------- 11. Секретна база ----------
// Нічний аеродром у горах: ангари з напівпрочиненими воротами, радар обертається,
// на вишці блимає маяк, вогні злітної смуги біжать, пролітає гелікоптер із прожектором.

function buildSecretBase(W, H, groundY, B) {
    const rng = pixelRng(1111);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#050912"], [0.7, "#0e1a2a"], [1, "#1a2a3a"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.55, 80, rng, B);

    // Гори на обрії
    const cols = Math.ceil(W * 1.4 / B);
    const mH = periodicHeights(cols, 6, [{ amp: 3, k: 2, ph: 0.5 }, { amp: 1.5, k: 5, ph: 1.7 }]);
    const mountains = makeCanvas(cols * B, (Math.max.apply(null, mH) + 1) * B);
    const mx = mountains.getContext("2d");
    for (let c = 0; c < cols; c++) {
        mx.fillStyle = c % 2 === 0 ? "#141f2e" : "#172334";
        mx.fillRect(c * B, mountains.height - mH[c] * B, B, mH[c] * B);
        if (mH[c] > 7) {
            mx.fillStyle = "#3a4a5e";
            mx.fillRect(c * B, mountains.height - mH[c] * B, B, B / 2);
        }
    }

    // Ангари, вишка, радари — середній шар
    const stripW = Math.ceil(W * 1.6 / B) * B;
    const baseH = Math.round(B * 9);
    const base = makeCanvas(stripW, baseH);
    const bx = base.getContext("2d");
    const hangars = [];
    const radars = [];
    const beacons = [];
    let x = B;
    let n = 0;
    while (x < stripW - B * 10) {
        const kind = n % 3;
        if (kind !== 2) {
            // Ангар з арковим дахом
            const w = B * 8;
            const h = B * 5;
            const top = baseH - h;
            bx.fillStyle = "#2a3646";
            bx.fillRect(x, top + B, w, h - B);
            for (let k = 0; k < 8; k++) {
                const lift = Math.round(Math.sin((k + 0.5) / 8 * Math.PI) * B * 1.4);
                bx.fillStyle = k % 2 === 0 ? "#34445a" : "#303f54";
                bx.fillRect(x + k * B, top + B - lift, B, lift + 2);
            }
            bx.fillStyle = "#1a2230";
            bx.fillRect(x + B, top + B * 1.6, w - B * 2, h - B * 1.6);
            // Номер ангара
            bx.fillStyle = "#ffcc33";
            bx.fillRect(x + B * 0.3, top + B * 1.3, B * 0.6, B * 0.3);
            hangars.push({ x: x + B, y: top + B * 1.6, w: w - B * 2, h: h - B * 1.6 });
            x += w + B * 2;
        } else {
            // Диспетчерська вишка й радар поруч
            const tw = B * 2;
            const th = B * 8;
            bx.fillStyle = "#2a3646";
            bx.fillRect(x + B * 0.5, baseH - th, B, th);
            bx.fillStyle = "#34445a";
            bx.fillRect(x, baseH - th - B * 0.2, tw, B * 1.4);
            bx.fillStyle = "#7df9ff";
            bx.fillRect(x + B * 0.2, baseH - th + B * 0.2, tw - B * 0.4, B * 0.5);
            beacons.push({ x: x + B, y: baseH - th - B * 0.6 });
            bx.fillStyle = "#2a3646";
            bx.fillRect(x + B * 4, baseH - B * 3, B * 0.5, B * 3);
            radars.push({ x: x + B * 4.25, y: baseH - B * 3.4 });
            // Цистерни з пальним
            bx.fillStyle = "#3a4a3a";
            bx.fillRect(x + B * 6, baseH - B * 2, B * 2.5, B * 2);
            bx.fillStyle = "#4a5a4a";
            bx.fillRect(x + B * 6, baseH - B * 2, B * 2.5, B * 0.4);
            x += B * 10;
        }
        n++;
    }
    // Паркан
    bx.fillStyle = "#2a3646";
    bx.fillRect(0, baseH - B * 0.9, stripW, 2);
    for (let fx = 0; fx < stripW; fx += B * 0.6) {
        bx.fillRect(fx, baseH - B * 1.1, 1, B * 1.1);
    }
    return { W: W, H: H, sky: sky, mountains: mountains, base: base, hangars: hangars, radars: radars, beacons: beacons };
}

BackgroundRenderer.renderSecretBase = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._secretBase;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSecretBase(W, H, groundY, B);
        this._secretBase = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.mountains, W, gY - B * 4, time, speed, 0.05);

    // Гелікоптер з прожектором пролітає над базою
    const hk = (time * 0.07) % 1;
    const hx = W * 1.15 - hk * W * 1.4;
    const hy = gY * 0.28 + Math.sin(time * 1.3) * B * 0.5;
    const sweep = Math.sin(time * 1.1) * 0.35;
    drawBeam(ctx, hx, hy + B * 0.6, Math.PI / 2 + sweep, gY * 0.8, 0.1, "rgba(230, 240, 255, 0.1)");
    ctx.fillStyle = "#26303e";
    ctx.fillRect(Math.round(hx), Math.round(hy), B * 2.2, B);
    ctx.fillRect(Math.round(hx + B * 2.2), Math.round(hy + B * 0.3), B * 2.2, B * 0.3);
    ctx.fillRect(Math.round(hx + B * 4.2), Math.round(hy - B * 0.1), B * 0.3, B * 0.7);
    ctx.fillStyle = "#7df9ff";
    ctx.fillRect(Math.round(hx + B * 0.2), Math.round(hy + B * 0.2), B * 0.7, B * 0.4);
    const rotor = Math.abs(Math.sin(time * 40)) * B * 2.2;
    ctx.fillStyle = "#5a6a7e";
    ctx.fillRect(Math.round(hx + B * 1.1 - rotor), Math.round(hy - B * 0.3), Math.round(rotor * 2), 2);
    ctx.fillStyle = Math.sin(time * 6) > 0 ? "#ff3355" : "#39ff88";
    ctx.fillRect(Math.round(hx + B * 4.3), Math.round(hy - B * 0.2), 3, 3);

    // База: ангари з теплим світлом, радари обертаються, маяки блимають
    const bW = st.base.width;
    const off = Math.round(time * speed * 0.3) % bW;
    const top = gY - st.base.height;
    for (let x = -off; x < W; x += bW) {
        ctx.drawImage(st.base, x, top);
        for (let i = 0; i < st.hangars.length; i++) {
            const hg = st.hangars[i];
            const hxp = x + hg.x;
            if (hxp > W || hxp + hg.w < 0) {
                continue;
            }
            // Ворота прочинені: смуга світла та силует літака всередині
            const gap = hg.w * (0.25 + 0.1 * Math.sin(time * 0.3 + i));
            ctx.fillStyle = "rgba(255, 210, 130, 0.55)";
            ctx.fillRect(Math.round(hxp + (hg.w - gap) / 2), top + hg.y, Math.round(gap), hg.h);
            ctx.fillStyle = "#2a3040";
            ctx.fillRect(Math.round(hxp + hg.w / 2 - B * 0.9), Math.round(top + hg.y + hg.h - B * 1.2), Math.round(B * 1.8), Math.round(B * 0.5));
            ctx.fillRect(Math.round(hxp + hg.w / 2 - B * 0.2), Math.round(top + hg.y + hg.h - B * 1.9), Math.round(B * 0.4), Math.round(B * 1.2));
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(hxp - B * 0.6), top + hg.y + hg.h, hg.w + B * 1.2, 2);
        }
        for (let i = 0; i < st.radars.length; i++) {
            const r = st.radars[i];
            const rx = x + r.x;
            if (rx < -B * 3 || rx > W + B * 3) {
                continue;
            }
            const face = Math.cos(time * 1.6 + i);
            const w = Math.max(2, Math.abs(face) * B * 2.4);
            ctx.fillStyle = face > 0 ? "#c8d2da" : "#8a96a4";
            ctx.fillRect(Math.round(rx - w / 2), Math.round(top + r.y - B * 1.1), Math.round(w), Math.round(B * 1.1));
            ctx.fillStyle = "#e8eef2";
            ctx.fillRect(Math.round(rx - 1 + face * B * 0.6), Math.round(top + r.y - B * 1.6), 3, Math.round(B * 0.6));
        }
        for (let i = 0; i < st.beacons.length; i++) {
            const bc = st.beacons[i];
            const bxp = x + bc.x;
            if (bxp < -B * 3 || bxp > W + B * 3) {
                continue;
            }
            if ((time + i * 0.4) % 1.2 < 0.25) {
                ctx.fillStyle = "rgba(255, 60, 60, 0.3)";
                ctx.fillRect(Math.round(bxp - B), Math.round(top + bc.y - B), B * 2, B * 2);
                ctx.fillStyle = "#ff3344";
                ctx.fillRect(Math.round(bxp - B * 0.25), Math.round(top + bc.y - B * 0.25), Math.round(B * 0.5), Math.round(B * 0.5));
            }
        }
    }

    // Вогні злітної смуги біжать уздовж землі
    const gap = B * 1.5;
    const loff = Math.round(time * speed * 0.6) % gap;
    const chase = Math.floor(time * 10);
    for (let x = -loff, k = 0; x < W + gap; x += gap, k++) {
        const idx = Math.floor((time * speed * 0.6) / gap) + k;
        ctx.fillStyle = (idx - chase) % 8 === 0 ? "#ffffff" : "#39c6ff";
        ctx.fillRect(Math.round(x), gY - 4, 4, 3);
    }
};

// ---------- 12. Луна-парк уночі ----------
// Колесо огляду обертається над парком, вагончики американських гірок
// пролітають мертву петлю, у небі розквітають феєрверки.

// Траса гірок: пагорби й одна мертва петля. Точки однієї смуги, що безшовно повторюється
function buildCoasterPath(stripW, baseY, B) {
    const pts = [];
    const loopX = stripW * 0.62;
    const loopR = B * 3.2;
    const hill = function (x) {
        return baseY - B * 2 - (Math.sin(Math.PI * 2 * x * 2 / stripW) * 0.5 + 0.5) * B * 5;
    };
    const step = Math.max(2, B / 3);
    for (let x = 0; x < loopX; x += step) {
        pts.push({ x: x, y: hill(x) });
    }
    // Мертва петля: коло, що починається внизу
    const cy = hill(loopX) - loopR;
    const n = 40;
    for (let i = 0; i <= n; i++) {
        const a = Math.PI / 2 - (i / n) * Math.PI * 2;
        pts.push({ x: loopX + Math.cos(a) * loopR + (i / n) * B * 1.2, y: cy + Math.sin(a) * loopR });
    }
    for (let x = loopX + B * 1.2; x <= stripW; x += step) {
        pts.push({ x: x, y: hill(x) });
    }
    return { pts: pts, loopX: loopX, loopR: loopR, loopCY: cy };
}

function buildLunaPark(W, H, groundY, B) {
    const rng = pixelRng(1212);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070624"], [0.6, "#241450"], [1, "#4a2070"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.6, 70, rng, B);

    // Далеке місто
    const cols = Math.ceil(W * 1.4 / B);
    const city = makeCanvas(cols * B, B * 8);
    const cx = city.getContext("2d");
    for (let c = 0; c < cols; c += 2) {
        const h = 3 + Math.floor(rng() * 5);
        cx.fillStyle = "#1a1238";
        cx.fillRect(c * B, city.height - h * B, B * 2, h * B);
        cx.fillStyle = "rgba(255, 220, 120, 0.5)";
        for (let w = 1; w < h; w++) {
            if (rng() < 0.35) {
                cx.fillRect(c * B + B / 3, city.height - w * B, B / 3, B / 3);
            }
        }
    }

    // Гірки: опори й рейки в окремій смузі
    const stripW = Math.ceil(W * 1.6 / B) * B;
    const coasterH = Math.round(gY * 0.62);
    const path = buildCoasterPath(stripW, coasterH, B);
    const coaster = makeCanvas(stripW, coasterH);
    const kx = coaster.getContext("2d");
    kx.fillStyle = "#3a2a5a";
    for (let i = 0; i < path.pts.length; i += 6) {
        const p = path.pts[i];
        if (Math.abs(p.x - path.loopX) < path.loopR * 1.3) {
            continue;
        }
        kx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(2, B / 5), coasterH - p.y);
    }
    kx.fillRect(Math.round(path.loopX - B / 8), Math.round(path.loopCY + path.loopR), Math.max(2, B / 4), coasterH - path.loopCY - path.loopR);
    kx.strokeStyle = "#ff5ad8";
    kx.lineWidth = Math.max(2, B / 4);
    kx.beginPath();
    kx.moveTo(path.pts[0].x, path.pts[0].y);
    for (const p of path.pts) {
        kx.lineTo(p.x, p.y);
    }
    kx.stroke();
    kx.strokeStyle = "rgba(255, 180, 240, 0.6)";
    kx.lineWidth = 1;
    kx.stroke();

    // Ближній шар: шатра з смугастими дахами й гірляндами
    const tents = makeCanvas(stripW, B * 6);
    const tx = tents.getContext("2d");
    const bulbs = [];
    const stripes = [["#ff3355", "#ffffff"], ["#2a8aff", "#ffe14d"], ["#39c65a", "#ffffff"], ["#b35cff", "#ffcc33"]];
    let i = 0;
    for (let x = B; x < stripW - B * 6; x += B * 9) {
        const pal = stripes[i % stripes.length];
        const w = B * 6;
        const bodyTop = B * 3;
        tx.fillStyle = "#2a1a3a";
        tx.fillRect(x, bodyTop, w, tents.height - bodyTop);
        tx.fillStyle = "#ffcc66";
        tx.fillRect(x + w / 2 - B, bodyTop + B, B * 2, tents.height - bodyTop - B);
        for (let s = 0; s < 6; s++) {
            tx.fillStyle = pal[s % 2];
            tx.beginPath();
            tx.moveTo(x + w / 2, B * 0.6);
            tx.lineTo(x + s * B, bodyTop);
            tx.lineTo(x + (s + 1) * B, bodyTop);
            tx.closePath();
            tx.fill();
        }
        tx.fillStyle = pal[0];
        tx.fillRect(x + w / 2 - B / 8, 0, B / 4, B * 0.7);
        for (let s = 0; s <= 6; s++) {
            bulbs.push({ x: x + s * B, y: bodyTop, k: s + i });
        }
        i++;
    }
    return { W: W, H: H, sky: sky, city: city, coaster: coaster, path: path, tents: tents, bulbs: bulbs };
}

// Колесо огляду з кабінками, що завжди висять униз
function drawFerrisWheel(ctx, x, y, R, B, time) {
    const rot = time * 0.25;
    ctx.fillStyle = "#3a2a5a";
    ctx.beginPath();
    ctx.moveTo(x - B / 2, y);
    ctx.lineTo(x - R * 0.7, y + R * 1.25);
    ctx.lineTo(x - R * 0.6, y + R * 1.25);
    ctx.lineTo(x, y + B);
    ctx.lineTo(x + R * 0.6, y + R * 1.25);
    ctx.lineTo(x + R * 0.7, y + R * 1.25);
    ctx.lineTo(x + B / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 220, 120, 0.55)";
    ctx.lineWidth = Math.max(1, B / 8);
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
        const a = rot + i * Math.PI * 2 / spokes;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    }
    ctx.stroke();
    const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8", "#ff9a3d"];
    for (let i = 0; i < spokes; i++) {
        const a = rot + i * Math.PI * 2 / spokes;
        const gx = Math.round(x + Math.cos(a) * R);
        const gy = Math.round(y + Math.sin(a) * R);
        // Лампочки біжать по ободу
        ctx.fillStyle = (Math.floor(time * 6) + i) % 3 === 0 ? "#ffffff" : "#ffcc55";
        ctx.fillRect(gx - 2, gy - 2, 4, 4);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(gx - B * 0.45, gy + 2, B * 0.9, B * 0.7);
    }
    ctx.fillStyle = "#ffcc55";
    ctx.fillRect(x - B * 0.3, y - B * 0.3, B * 0.6, B * 0.6);
}

// Феєрверк: спалах із променів, що розлітаються й гаснуть. Усе обчислюється з часу
function drawFireworks(ctx, W, gY, B, time, extra) {
    const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
    const count = 3 + (extra ? 2 : 0);
    for (let i = 0; i < count; i++) {
        const period = 2.2 + i * 0.45;
        const cycle = Math.floor((time + i * 0.9) / period);
        const t = ((time + i * 0.9) % period) / period;
        const rng = pixelRng(cycle * 31 + i * 7);
        const fx = W * (0.15 + rng() * 0.7);
        const fy = gY * (0.12 + rng() * 0.25);
        const color = colors[Math.floor(rng() * colors.length)];
        if (t < 0.25) {
            // Ракета злітає
            const k = t / 0.25;
            ctx.fillStyle = "#fff4c0";
            ctx.fillRect(Math.round(fx), Math.round(gY - (gY - fy) * k), 3, Math.max(3, B / 2));
            continue;
        }
        const k = (t - 0.25) / 0.75;
        const r = B * (1 + k * 4);
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = color;
        for (let a = 0; a < 14; a++) {
            const ang = a * Math.PI * 2 / 14;
            const px = fx + Math.cos(ang) * r;
            const py = fy + Math.sin(ang) * r + k * k * B * 2;
            ctx.fillRect(Math.round(px), Math.round(py), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
    }
}

BackgroundRenderer.renderLunaPark = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._lunaPark;
    if (!st || st.W !== W || st.H !== H) {
        st = buildLunaPark(W, H, groundY, B);
        this._lunaPark = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawFireworks(ctx, W, gY, B, time, _fx.combo >= 3);
    drawScrollingStrip(ctx, st.city, W, gY, time, speed, 0.05);

    // Колесо огляду повільно пропливає й повертається з іншого боку
    const R = Math.round(gY * 0.3);
    const wheelLoop = W + R * 4;
    const wx = W + R * 1.5 - ((time * speed * 0.1) % wheelLoop);
    drawFerrisWheel(ctx, Math.round(wx), Math.round(gY - R * 1.25), R, B, time);

    // Гірки та вагончики
    const stripW = st.coaster.width;
    const offset = Math.round(time * speed * 0.2) % stripW;
    const top = gY - st.coaster.height;
    const pts = st.path.pts;
    const carT = (time * 0.18) % 1;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(st.coaster, x, top);
        for (let c = 0; c < 3; c++) {
            const idx = Math.floor(((carT * pts.length) - c * 3 + pts.length) % pts.length);
            const p = pts[idx];
            const q = pts[Math.min(pts.length - 1, idx + 1)];
            const ang = Math.atan2(q.y - p.y, q.x - p.x);
            ctx.save();
            ctx.translate(Math.round(x + p.x), Math.round(top + p.y));
            ctx.rotate(ang);
            ctx.fillStyle = c === 0 ? "#ffe14d" : "#39c6ff";
            ctx.fillRect(-B * 0.5, -B * 0.8, B, B * 0.7);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-B * 0.2, -B * 1.1, B * 0.3, B * 0.3);
            ctx.restore();
        }
    }

    // Шатра з гірляндами, що біжать вогниками
    const tentsW = st.tents.width;
    const toff = Math.round(time * speed * 0.45) % tentsW;
    const ttop = gY - st.tents.height;
    const chase = Math.floor(time * 8);
    for (let x = -toff; x < W; x += tentsW) {
        ctx.drawImage(st.tents, x, ttop);
        for (const b of st.bulbs) {
            const bx = x + b.x;
            if (bx < -4 || bx > W + 4) {
                continue;
            }
            ctx.fillStyle = (b.k + chase) % 3 === 0 ? "#ffffff" : "#ffb347";
            ctx.fillRect(Math.round(bx) - 2, ttop + b.y - 2, 4, 4);
        }
    }
};

export { drawFireworks };
