// backgrounds/fabricator_twinsun_skycity_stadium.js — підводна фабрика, планета двох сонць,
// місто над хмарами, футбольний стадіон

import { BackgroundRenderer } from "./core.js";
import { drawBlockTerrain, drawFallingPixels, drawPixelDisc, drawScrollingStrip, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";
import { _fx } from "./effects.js";

// ---------- 13. Підводна фабрика ----------
// Цех підводної бази: за ілюмінаторами пропливають риби, фабрикатори
// лазерами «друкують» спорядження шар за шаром, готові речі їдуть конвеєром.

// Спорядження, яке друкують фабрикатори: піксельні спрайти 8×8 (символ → колір)
const FAB_ITEMS = [
    { name: "балон", rows: ["..3333..", "..3113..", ".222222.", ".211112.", ".211112.", ".211112.", ".211112.", ".222222."], colors: { 1: "#ffcc33", 2: "#c89a20", 3: "#8a90a0" } },
    { name: "ніж", rows: [".......1", "......11", ".....11.", "....11..", "...11...", "..33....", ".333....", "33......"], colors: { 1: "#dfe6ee", 3: "#ff9a3d" } },
    { name: "батарея", rows: ["...33...", ".111111.", ".122221.", ".122221.", ".111111.", ".122221.", ".122221.", ".111111."], colors: { 1: "#e8eef2", 2: "#39c6ff", 3: "#8a90a0" } },
    { name: "ліхтарик", rows: ["........", "11......", "1311111.", "13222221", "13222221", "1311111.", "11......", "........"], colors: { 1: "#e8eef2", 2: "#ff9a3d", 3: "#fff4a0" } },
    { name: "планшет", rows: ["11111111", "12222221", "12333321", "12222221", "12333321", "12222221", "11111111", "........"], colors: { 1: "#e8eef2", 2: "#1a3a5a", 3: "#39ffd0" } },
    { name: "буксир", rows: ["........", "...1111.", ".1122221", "11122223", "11122223", ".1122221", "...1111.", "........"], colors: { 1: "#ffcc33", 2: "#e8eef2", 3: "#39c6ff" } }
];

function buildFabItemSprite(item, px) {
    const c = makeCanvas(px * 8, px * 8);
    const cx = c.getContext("2d");
    for (let r = 0; r < 8; r++) {
        for (let k = 0; k < 8; k++) {
            const ch = item.rows[r][k];
            if (ch !== ".") {
                cx.fillStyle = item.colors[ch];
                cx.fillRect(k * px, r * px, px, px);
            }
        }
    }
    return c;
}

function buildSeaFabricator(W, H, groundY, B) {
    const rng = pixelRng(1313);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0b1a24"], [1, "#12303c"]]);
    const skx = sky.getContext("2d");
    // Труби під стелею зі світними смугами
    skx.fillStyle = "#1e3a48";
    skx.fillRect(0, B * 0.6, W, B * 0.9);
    skx.fillStyle = "#2a5060";
    skx.fillRect(0, B * 0.6, W, B * 0.2);
    skx.fillStyle = "#16303c";
    skx.fillRect(0, B * 1.8, W, B * 0.5);

    // Стіна з панелями та круглими ілюмінаторами (прокручується повільно)
    const stripW = Math.ceil(W * 1.4 / (B * 10)) * B * 10;
    const wallH = Math.round(gY * 0.72);
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    wx.fillStyle = "#183644";
    wx.fillRect(0, 0, stripW, wallH);
    for (let x = 0; x < stripW; x += B * 5) {
        wx.fillStyle = "#1f4352";
        wx.fillRect(x + 2, B, B * 5 - 4, wallH - B * 2);
        wx.fillStyle = "#12303c";
        wx.fillRect(x, 0, 2, wallH);
        for (let y = B * 2; y < wallH - B; y += B * 3) {
            wx.fillStyle = "#2a5566";
            wx.fillRect(x + B * 0.4, y, B * 0.25, B * 0.25);
            wx.fillRect(x + B * 4.35, y, B * 0.25, B * 0.25);
        }
    }
    const portholes = [];
    const pr = Math.round(B * 2.4);
    for (let x = B * 5; x < stripW; x += B * 10) {
        const py = Math.round(wallH * 0.38);
        // Рамка
        wx.fillStyle = "#e8eef2";
        wx.beginPath();
        wx.arc(x, py, pr + B * 0.5, 0, Math.PI * 2);
        wx.fill();
        wx.fillStyle = "#ff9a3d";
        for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4;
            wx.fillRect(Math.round(x + Math.cos(a) * (pr + B * 0.25) - 2), Math.round(py + Math.sin(a) * (pr + B * 0.25) - 2), 4, 4);
        }
        // Вода за склом
        const g = wx.createLinearGradient(0, py - pr, 0, py + pr);
        g.addColorStop(0, "#1a7ab0");
        g.addColorStop(1, "#083a5a");
        wx.fillStyle = g;
        wx.beginPath();
        wx.arc(x, py, pr, 0, Math.PI * 2);
        wx.fill();
        // Промені світла у воді
        wx.save();
        wx.clip();
        wx.fillStyle = "rgba(160, 230, 255, 0.18)";
        for (let k = 0; k < 3; k++) {
            wx.fillRect(x - pr + k * pr * 0.7, py - pr, B * 0.4, pr * 2);
        }
        wx.fillStyle = "#0a4a3a";
        wx.fillRect(x - pr, py + pr * 0.6, pr * 2, pr);
        wx.fillStyle = "#39c67a";
        for (let k = 0; k < 5; k++) {
            wx.fillRect(Math.round(x - pr + rng() * pr * 2), Math.round(py + pr * 0.3 + rng() * pr * 0.3), B * 0.25, pr);
        }
        wx.restore();
        // Відблиск на склі
        wx.fillStyle = "rgba(255, 255, 255, 0.25)";
        wx.fillRect(Math.round(x - pr * 0.55), Math.round(py - pr * 0.6), B * 0.5, B * 1.4);
        portholes.push({ x: x, y: py, r: pr });
    }

    // Фабрикатори й конвеєр — ближній шар
    const px = Math.max(2, Math.round(B / 4));
    const items = FAB_ITEMS.map(function (it) { return buildFabItemSprite(it, px); });
    const nearW = stripW;
    const nearH = Math.round(B * 7);
    const near = makeCanvas(nearW, nearH);
    const nx = near.getContext("2d");
    const fabs = [];
    for (let x = B * 2; x < nearW - B * 6; x += B * 10) {
        const fw = B * 5;
        const fh = B * 5.5;
        const top = nearH - fh - B * 1.2;
        nx.fillStyle = "#e8eef2";
        nx.fillRect(x, top, fw, fh);
        nx.fillStyle = "#c8d2da";
        nx.fillRect(x, top + fh - B * 0.8, fw, B * 0.8);
        nx.fillStyle = "#ff9a3d";
        nx.fillRect(x, top + B * 0.4, fw, B * 0.3);
        // Віконце камери друку
        nx.fillStyle = "#07161e";
        nx.fillRect(x + B * 0.7, top + B * 1.1, fw - B * 1.4, B * 3.2);
        nx.fillStyle = "#39c6ff";
        nx.fillRect(x + B * 0.7, top + B * 4.3, fw - B * 1.4, B * 0.15);
        fabs.push({ x: x + B * 0.7, y: top + B * 1.1, w: fw - B * 1.4, h: B * 3.2 });
    }
    // Стрічка конвеєра
    nx.fillStyle = "#2a3a44";
    nx.fillRect(0, nearH - B * 1.2, nearW, B * 1.2);
    nx.fillStyle = "#3a4e5a";
    nx.fillRect(0, nearH - B * 1.2, nearW, B * 0.25);
    return { W: W, H: H, sky: sky, wall: wall, portholes: portholes, near: near, fabs: fabs, items: items, px: px };
}

BackgroundRenderer.renderSeaFabricator = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._seaFabricator;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSeaFabricator(W, H, groundY, B);
        this._seaFabricator = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Стіна з ілюмінаторами: за склом пропливають риби
    const wallW = st.wall.width;
    const wOff = Math.round(time * speed * 0.15) % wallW;
    const wTop = gY - st.wall.height;
    for (let x = -wOff; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wTop);
        for (let i = 0; i < st.portholes.length; i++) {
            const ph = st.portholes[i];
            const cx = x + ph.x;
            if (cx < -ph.r || cx > W + ph.r) {
                continue;
            }
            const cy = wTop + ph.y;
            for (let f = 0; f < 3; f++) {
                const k = ((time * (0.12 + f * 0.05) + i * 0.3 + f * 0.37) % 1);
                const fx = cx - ph.r - B + k * (ph.r * 2 + B * 2);
                const fy = cy + (f - 1) * ph.r * 0.45 + Math.sin(time * 2 + f) * B * 0.2;
                const dx = fx - cx;
                const dy = fy - cy;
                if (dx * dx + dy * dy > (ph.r - B * 0.6) * (ph.r - B * 0.6)) {
                    continue;
                }
                ctx.fillStyle = f === 1 ? "#ff9a3d" : "#ffe14d";
                ctx.fillRect(Math.round(fx), Math.round(fy), Math.round(B * 0.7), Math.round(B * 0.35));
                ctx.fillRect(Math.round(fx - B * 0.3), Math.round(fy - B * 0.1), Math.round(B * 0.3), Math.round(B * 0.55));
            }
            // Бульбашки
            const bk = (time * 0.6 + i * 0.4) % 1;
            ctx.fillStyle = "rgba(220, 245, 255, 0.7)";
            ctx.fillRect(Math.round(cx + ph.r * 0.3), Math.round(cy + ph.r * 0.6 - bk * ph.r * 1.4), 3, 3);
        }
    }

    // Фабрикатори друкують речі: сопло ходить над камерою, лазер «наростає» річ знизу вгору
    const nearW = st.near.width;
    const nOff = Math.round(time * speed * 0.4) % nearW;
    const nTop = gY - st.near.height;
    const itemSize = st.px * 8;
    for (let x = -nOff; x < W; x += nearW) {
        ctx.drawImage(st.near, x, nTop);
        for (let i = 0; i < st.fabs.length; i++) {
            const f = st.fabs[i];
            const fx = x + f.x;
            if (fx < -f.w || fx > W) {
                continue;
            }
            const cycle = 4;
            const k = ((time + i * 1.3) % cycle) / cycle;
            const itemIdx = (Math.floor((time + i * 1.3) / cycle) + i) % st.items.length;
            const sprite = st.items[itemIdx];
            const ix = Math.round(fx + (f.w - itemSize) / 2);
            const iy = Math.round(nTop + f.y + f.h - itemSize - B * 0.2);
            const printed = Math.min(1, k / 0.7);
            const shown = Math.round(itemSize * printed);
            if (shown > 0) {
                ctx.drawImage(sprite, 0, itemSize - shown, itemSize, shown, ix, iy + itemSize - shown, itemSize, shown);
            }
            if (k < 0.7) {
                // Сопло та промені
                const noz = fx + f.w * 0.5 + Math.sin(time * 9 + i) * f.w * 0.35;
                const lineY = iy + itemSize - shown;
                ctx.fillStyle = "#c8d2da";
                ctx.fillRect(Math.round(noz - B * 0.3), Math.round(nTop + f.y), Math.round(B * 0.6), Math.round(B * 0.4));
                ctx.strokeStyle = "rgba(90, 220, 255, 0.85)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(noz, nTop + f.y + B * 0.4);
                ctx.lineTo(ix + itemSize * (0.5 + Math.sin(time * 13 + i) * 0.5), lineY);
                ctx.stroke();
                ctx.fillStyle = "rgba(120, 230, 255, 0.9)";
                ctx.fillRect(ix - 2, Math.round(lineY) - 1, itemSize + 4, 2);
            } else {
                // Готово: річ світиться
                ctx.fillStyle = "rgba(90, 220, 255, " + (0.35 * (1 - (k - 0.7) / 0.3)).toFixed(3) + ")";
                ctx.fillRect(ix - 3, iy - 3, itemSize + 6, itemSize + 6);
            }
        }
    }

    // Конвеєр: готові речі їдуть до камери
    const beltY = gY - B * 1.2 - itemSize;
    const gap = B * 4;
    const bOff = (time * speed * 0.4 + time * B * 1.5) % gap;
    for (let x = -bOff, n = 0; x < W + gap; x += gap, n++) {
        const idx = (Math.floor((time * speed * 0.4 + time * B * 1.5) / gap) + n) % st.items.length;
        ctx.drawImage(st.items[(idx + st.items.length) % st.items.length], Math.round(x), Math.round(beltY));
    }
};

// ---------- 14. Планета двох сонць ----------

function buildTwinSunPlanet(W, H, groundY, B) {
    const rng = pixelRng(1414);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a2a3a"], [0.5, "#1f6a6a"], [1, "#e08a4a"]]);
    const sx = sky.getContext("2d");
    function pixelDisc(cx, cy, r, color) {
        sx.fillStyle = color;
        for (let y = -r; y < r; y += B / 2) {
            const half = Math.sqrt(Math.max(0, r * r - y * y));
            sx.fillRect(Math.round(cx - half), cy + y, Math.round(half * 2), B / 2);
        }
    }
    pixelDisc(W * 0.28, Math.round(gY * 0.3), B * 3, "#ffdd66");
    pixelDisc(W * 0.7, Math.round(gY * 0.18), B * 2, "#ff7a5a");
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.3 }, { amp: 0.6, k: 7, ph: 1 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, hs) + 7) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, hs, B, near.height, { top: "#6a3a8a", topLight: "#8a5aaa", body: "#3a1f4a", body2: "#331a42", speck: "#4a2a5a" }, rng);
    const bulbs = [];
    // Грибні дерева та рослини з кульками, що світяться
    for (let c = 2; c < cols - 3; c += 5 + Math.floor(rng() * 4)) {
        const top = near.height - hs[c] * B;
        if (rng() < 0.5) {
            const th = 3 + Math.floor(rng() * 3);
            nx.fillStyle = "#d8c8a8";
            nx.fillRect(c * B, top - th * B, B, th * B);
            nx.fillStyle = "#ff5a8a";
            nx.fillRect((c - 1) * B, top - th * B - B, B * 3, B);
            nx.fillRect(c * B - B * 1.5, top - th * B, B * 4, B / 2);
            nx.fillStyle = "#ffd0e0";
            nx.fillRect(c * B - B / 2, top - th * B - B * 0.7, B / 3, B / 3);
        } else {
            nx.fillStyle = "#2a8a6a";
            nx.fillRect(c * B + B / 3, top - B * 3, B / 3, B * 3);
            bulbs.push({ x: c * B + B / 2, y: top - B * 3.3, phase: rng() * 6 });
        }
    }
    return { W: W, H: H, sky: sky, near: near, bulbs: bulbs };
}

BackgroundRenderer.renderTwinSunPlanet = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._twinSun;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTwinSunPlanet(W, H, groundY, B);
        this._twinSun = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        for (const b of st.bulbs) {
            const bx = x + b.x;
            if (bx < -B * 2 || bx > W + B * 2) {
                continue;
            }
            const pulse = Math.sin(time * 2.5 + b.phase) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(90, 255, 200, " + (0.15 + 0.2 * pulse).toFixed(3) + ")";
            ctx.fillRect(bx - B, top + b.y - B, B * 2, B * 2);
            ctx.fillStyle = "#9affd8";
            ctx.fillRect(bx - B * 0.4, top + b.y - B * 0.4, B * 0.8, B * 0.8);
        }
    }
    drawFallingPixels(ctx, W, gY, time, 30, 1414, {
        color: "#ffd0f0", dir: -1, speedMin: 6, speedMax: 18, sizeMin: 2, sizeMax: 3,
        sway: 0.9, swayAmp: B * 1.2, alpha: 0.6
    });
    // Небесні медузи з світними щупальцями
    for (let i = 0; i < 3; i++) {
        const k = ((time * (0.025 + i * 0.01) + i * 0.33) % 1);
        const x = W * 1.1 - k * W * 1.3;
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        const y = gY * (0.2 + i * 0.12) - pulse * B * 0.6;
        ctx.globalAlpha = 0.8;
        drawPixelDisc(ctx, x, y, B * (1 + pulse * 0.2), B / 4, i % 2 === 0 ? "#9affd8" : "#ff9ae0");
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(Math.round(x - B * 0.4), Math.round(y - B * 0.4), Math.round(B * 0.3), Math.round(B * 0.3));
        ctx.fillStyle = i % 2 === 0 ? "rgba(154, 255, 216, 0.7)" : "rgba(255, 154, 224, 0.7)";
        for (let t = 0; t < 4; t++) {
            const sway = Math.sin(time * 3 + t + i) * B * 0.3;
            ctx.fillRect(Math.round(x - B * 0.7 + t * B * 0.45 + sway), Math.round(y + B * 0.6), 2, Math.round(B * (1.4 + (t % 2) * 0.6)));
        }
    }
    // Довгохвості птахи-інопланетяни
    for (let i = 0; i < 3; i++) {
        const k = ((time * (0.07 + i * 0.02) + i * 0.4) % 1);
        const x = -B * 4 + k * (W + B * 8);
        const y = gY * (0.12 + i * 0.07) + Math.sin(time * 1.4 + i) * B * 0.6;
        const up = Math.sin(time * 7 + i) > 0;
        ctx.fillStyle = "#5a2a7a";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 1.2), Math.round(B * 0.4));
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(Math.round(x + B * 1.2), Math.round(y + B * 0.1), Math.round(B * 0.3), Math.round(B * 0.2));
        ctx.fillStyle = "#8a4aaa";
        ctx.fillRect(Math.round(x + B * 0.2), Math.round(y + (up ? -B * 0.8 : B * 0.3)), Math.round(B * 0.8), Math.round(B * 0.5));
        ctx.fillStyle = "#ff5ad8";
        for (let t = 1; t <= 4; t++) {
            ctx.fillRect(Math.round(x - t * B * 0.5), Math.round(y + B * 0.15 + Math.sin(time * 4 - t) * B * 0.2), Math.round(B * 0.45), 2);
        }
    }
};

// ---------- 15. Місто над хмарами ----------

function buildSkyCity(W, H, groundY, B) {
    const rng = pixelRng(1515);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1b3a7a"], [0.6, "#6a8fd8"], [1, "#ffc6a0"]]);
    function cloudStrip(stripW, color, light, height, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const h = Math.round((0.4 + 0.3 * Math.sin(x / stripW * Math.PI * 8) + r() * 0.2) * height / B) * B;
            cx.fillStyle = color;
            cx.fillRect(x, height - h, B, h);
            cx.fillStyle = light;
            cx.fillRect(x, height - h, B, B / 3);
        }
        return strip;
    }
    const clouds = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#e8eeff", "#ffffff", Math.round(gY * 0.3), 1501);
    // Летючі платформи з вежами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const plat = makeCanvas(stripW, gY);
    const px = plat.getContext("2d");
    for (let x = B * 2; x < stripW - B * 8; x += B * (10 + Math.floor(rng() * 5))) {
        const y = Math.round(gY * (0.25 + rng() * 0.35) / B) * B;
        const w = 5 + Math.floor(rng() * 3);
        px.fillStyle = "#f4f0e0";
        px.fillRect(x, y, w * B, B);
        px.fillStyle = "#c8c0a8";
        px.fillRect(x + B, y + B, (w - 2) * B, B);
        px.fillStyle = "#ffffff";
        px.fillRect(x + B * 1.5, y - B * 4, B * 1.5, B * 4);
        px.fillRect(x + B * 3.5, y - B * 2.5, B * 1.5, B * 2.5);
        px.fillStyle = "#3a8adf";
        px.fillRect(x + B * 1.5, y - B * 5, B * 1.5, B);
        px.fillRect(x + B * 3.5, y - B * 3.5, B * 1.5, B);
        px.fillStyle = "#ffe14d";
        px.fillRect(x + B * 2, y - B * 3, B / 2, B / 2);
    }
    return { W: W, H: H, sky: sky, clouds: clouds, plat: plat };
}

BackgroundRenderer.renderSkyCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._skyCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSkyCity(W, H, groundY, B);
        this._skyCity = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const bob = Math.round(Math.sin(time * 0.8) * B * 0.3);
    drawScrollingStrip(ctx, st.plat, W, gY + bob, time, speed, 0.15);
    // Птахи: пари пікселів, що махають крилами
    for (let i = 0; i < 5; i++) {
        const span = W + B * 6;
        const x = Math.round(((i * 331 + time * (40 + i * 9)) % span) - B * 3);
        const y = Math.round(gY * (0.15 + i * 0.07) + Math.sin(time * 1.5 + i) * B * 0.5);
        const flap = Math.sin(time * 10 + i) > 0;
        ctx.fillStyle = "#1a2a4a";
        ctx.fillRect(x, y, B / 3, B / 3);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
    }
    drawScrollingStrip(ctx, st.clouds, W, gY, time, speed, 0.3);
};

// ---------- 16. Футбольний стадіон ----------

function buildStadium(W, H, groundY, B) {
    const rng = pixelRng(1616);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#04030c"], [1, "#120a24"]]);
    const sx = sky.getContext("2d");
    // Трибуни з уболівальниками двох команд
    const standTop = Math.round(gY * 0.3);
    const rows = 8;
    const rowH = B * 0.8;
    const fans = [];
    for (let row = 0; row < rows; row++) {
        const y = standTop + row * rowH;
        sx.fillStyle = row % 2 === 0 ? "#1a1430" : "#161028";
        sx.fillRect(0, y, W, rowH);
        for (let x = (row % 2) * B / 3; x < W; x += B * 0.6) {
            if (rng() < 0.9) {
                const home = x < W / 2;
                const color = home ? (rng() < 0.7 ? "#2a6aff" : "#ffe14d") : (rng() < 0.7 ? "#e8173c" : "#ffffff");
                sx.fillStyle = color;
                sx.globalAlpha = 0.6;
                sx.fillRect(x, y + B * 0.15, B * 0.32, B * 0.32);
                sx.globalAlpha = 1;
                // Частина вболівальників махає шарфами (малюються щокадру)
                if (rng() < 0.08) {
                    fans.push({ x: x, y: y, color: color, phase: rng() * 6 });
                }
            }
        }
    }
    // Табло
    sx.fillStyle = "#0a0a14";
    sx.fillRect(W * 0.4, B * 0.8, W * 0.2, B * 3);
    sx.strokeStyle = "#39ff88";
    sx.lineWidth = 2;
    sx.strokeRect(W * 0.4, B * 0.8, W * 0.2, B * 3);
    sx.fillStyle = "#2a6aff";
    sx.fillRect(W * 0.415, B * 1.2, B * 0.9, B * 0.9);
    sx.fillStyle = "#e8173c";
    sx.fillRect(W * 0.585 - B * 0.9, B * 1.2, B * 0.9, B * 0.9);

    // Поле зі смугами трави, розміткою та воротами (прокручується)
    const fieldH = B * 3;
    const stripW = Math.ceil(W * 1.3 / (B * 2)) * B * 2;
    const field = makeCanvas(stripW, fieldH + B * 3);
    const fx = field.getContext("2d");
    const top = field.height - fieldH;
    for (let x = 0; x < stripW; x += B * 2) {
        fx.fillStyle = (x / (B * 2)) % 2 === 0 ? "#2f8a3a" : "#277a32";
        fx.fillRect(x, top, B * 2, fieldH);
    }
    fx.fillStyle = "rgba(255, 255, 255, 0.85)";
    fx.fillRect(0, top + B * 0.3, stripW, 3);
    // Центральна лінія та коло
    const mid = Math.round(stripW * 0.35);
    fx.fillRect(mid, top + B * 0.3, 3, fieldH - B * 0.3);
    fx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    fx.lineWidth = 3;
    fx.beginPath();
    fx.ellipse(mid + 1, top + fieldH * 0.6, B * 2.5, B * 0.9, 0, 0, Math.PI * 2);
    fx.stroke();
    // Ворота з сіткою
    const gx = Math.round(stripW * 0.8);
    fx.fillStyle = "#ffffff";
    fx.fillRect(gx, top - B * 2.2, B / 5, B * 2.2 + B * 0.5);
    fx.fillRect(gx + B * 2.5, top - B * 2.2, B / 5, B * 2.2 + B * 0.5);
    fx.fillRect(gx, top - B * 2.2, B * 2.7, B / 5);
    fx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    fx.lineWidth = 1;
    fx.beginPath();
    for (let k = 1; k < 6; k++) {
        fx.moveTo(gx + k * B * 0.45, top - B * 2);
        fx.lineTo(gx + k * B * 0.45, top + B * 0.3);
        fx.moveTo(gx, top - B * 2.2 + k * B * 0.45);
        fx.lineTo(gx + B * 2.7, top - B * 2.2 + k * B * 0.45);
    }
    fx.stroke();
    return { W: W, H: H, sky: sky, field: field, fans: fans, standTop: standTop, rowH: rowH };
}

// Цифри рахунку на табло 3×5 пікселів
const SCORE_DIGITS = {
    0: ["111", "101", "101", "101", "111"],
    1: ["010", "110", "010", "010", "111"],
    2: ["111", "001", "111", "100", "111"],
    3: ["111", "001", "111", "001", "111"]
};

function drawScoreDigit(ctx, digit, x, y, px, color) {
    const rows = SCORE_DIGITS[digit] || SCORE_DIGITS[0];
    ctx.fillStyle = color;
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < 3; c++) {
            if (rows[r][c] === "1") {
                ctx.fillRect(x + c * px, y + r * px, px, px);
            }
        }
    }
}

BackgroundRenderer.renderStadium = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stadium;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStadium(W, H, groundY, B);
        this._stadium = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Рахунок змінюється: кожні 8 с «забивають гол»
    const goals = Math.floor(time / 8) % 4;
    const home = Math.min(3, Math.floor((goals + 1) / 2));
    const away = Math.min(3, Math.floor(goals / 2));
    const px = Math.max(2, Math.round(B / 5));
    drawScoreDigit(ctx, home, Math.round(W * 0.47 - px * 3), Math.round(B * 1.3), px, "#ffe14d");
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(Math.round(W * 0.5 - px / 2), Math.round(B * 1.3 + px), px, px);
    ctx.fillRect(Math.round(W * 0.5 - px / 2), Math.round(B * 1.3 + px * 3), px, px);
    drawScoreDigit(ctx, away, Math.round(W * 0.53), Math.round(B * 1.3), px, "#ffe14d");
    // Уболівальники махають шарфами
    // Після «Ідеально» вболівальники підстрибують і махають активніше
    const cheer = _fx.perfect;
    for (const f of st.fans) {
        const wave = Math.sin(time * 6 + f.phase) * (1 + cheer * 2) - cheer * 1.5;
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x - B * 0.15, f.y - B * 0.1 + wave * B * 0.15, B * 0.6, B * 0.18);
    }
    // Спалахи камер
    const r = pixelRng(Math.floor(time * 8));
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(Math.round(r() * W), Math.round(st.standTop + r() * st.rowH * 8), B / 3, B / 3);
    }
    // Прожектори
    for (let i = 0; i < 4; i++) {
        const baseX = W * (0.1 + i * 0.27);
        const ang = Math.PI / 2 + Math.sin(time * 0.9 + i * 1.7) * 0.45;
        ctx.fillStyle = "rgba(255, 255, 230, 0.06)";
        ctx.beginPath();
        ctx.moveTo(baseX, 0);
        ctx.lineTo(baseX + Math.cos(ang - 0.12) * gY * 1.3, Math.sin(ang - 0.12) * gY * 1.3);
        ctx.lineTo(baseX + Math.cos(ang + 0.12) * gY * 1.3, Math.sin(ang + 0.12) * gY * 1.3);
        ctx.closePath();
        ctx.fill();
    }
    drawScrollingStrip(ctx, st.field, W, gY, time, speed, 0.3);
    // М'яч стрибає полем по дузі від гравця до гравця
    const pass = 2.4;
    const t = (time % pass) / pass;
    const leg = Math.floor(time / pass);
    const fromX = W * (0.2 + ((leg * 0.37) % 0.6));
    const toX = W * (0.2 + (((leg + 1) * 0.37) % 0.6));
    const bx = fromX + (toX - fromX) * t;
    const by = gY - B * 1.4 - Math.sin(t * Math.PI) * B * 4;
    const bs = Math.round(B * 0.7);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(Math.round(bx - bs / 2), gY - B * 0.9, bs, B / 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(bx - bs / 2), Math.round(by - bs / 2), bs, bs);
    ctx.fillStyle = "#111111";
    ctx.fillRect(Math.round(bx - bs / 6), Math.round(by - bs / 6), Math.round(bs / 3), Math.round(bs / 3));
    ctx.fillRect(Math.round(bx - bs / 2), Math.round(by - bs / 2), Math.round(bs / 4), Math.round(bs / 4));
    ctx.fillRect(Math.round(bx + bs / 4), Math.round(by + bs / 4), Math.round(bs / 4), Math.round(bs / 4));
};
