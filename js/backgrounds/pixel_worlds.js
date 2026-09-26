// backgrounds/pixel_worlds.js — піксельні світи: нічне поле, печера,
// сніжні гори, інопланетний океан, пустеля, парящі острови

import { BackgroundRenderer } from "./core.js";
import { drawBlockTerrain, drawFallingPixels, drawPixelDisc, drawScrollingStrip, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";

// ---------- Піксельні фони в стилі «блочного світу» ----------
// Статичні шари (небо, пагорби, стіни печери) малюються один раз у буфери,
// а щокадру лише копіюються зі зсувом на цілі пікселі — це дешево.

function buildPixelNight(W, H, groundY, B) {
    const rng = pixelRng(1010);
    const gY = Math.round(groundY);

    // Небо з місяцем
    const sky = document.createElement("canvas");
    sky.width = Math.ceil(W);
    sky.height = Math.ceil(H);
    const sx = sky.getContext("2d");
    const grad = sx.createLinearGradient(0, 0, 0, gY);
    grad.addColorStop(0, "#070b24");
    grad.addColorStop(1, "#1d2a5c");
    sx.fillStyle = grad;
    sx.fillRect(0, 0, sky.width, sky.height);
    const moonX = Math.round(W * 0.74 / B) * B;
    const moonY = Math.round(H * 0.1 / B) * B;
    sx.fillStyle = "rgba(240, 240, 200, 0.05)";
    sx.fillRect(moonX - B * 2, moonY - B * 2, B * 7, B * 7);
    sx.fillStyle = "rgba(240, 240, 200, 0.08)";
    sx.fillRect(moonX - B, moonY - B, B * 5, B * 5);
    sx.fillStyle = "#f4f1d0";
    sx.fillRect(moonX, moonY, B * 3, B * 3);
    sx.fillStyle = "#d8d4ae";
    sx.fillRect(moonX + B * 0.5, moonY + B * 0.5, B * 0.75, B * 0.75);
    sx.fillRect(moonX + B * 1.75, moonY + B * 1.5, B, B * 0.75);
    sx.fillRect(moonX + B * 0.75, moonY + B * 2, B * 0.5, B * 0.5);

    // Зірки (мерехтять щокадру)
    const stars = [];
    const half = B / 2;
    for (let i = 0; i < 45; i++) {
        const starX = Math.round(rng() * W / half) * half;
        const starY = Math.round(rng() * gY * 0.55 / half) * half;
        const phase = rng() * Math.PI * 2;
        const speed = 0.8 + rng() * 2;
        // Без зірок на місяці та його ореолі
        if (starX > moonX - B * 3 && starX < moonX + B * 6 && starY > moonY - B * 3 && starY < moonY + B * 6) {
            continue;
        }
        stars.push({ x: starX, y: starY, phase: phase, speed: speed });
    }

    // Хмари з блоків
    const cloudCols = Math.ceil(W * 1.5 / B);
    const clouds = document.createElement("canvas");
    clouds.width = cloudCols * B;
    clouds.height = B * 3;
    const cx = clouds.getContext("2d");
    cx.fillStyle = "rgba(200, 210, 240, 0.16)";
    for (let c = 2; c < cloudCols - 8; c += 9 + Math.floor(rng() * 6)) {
        const len = 4 + Math.floor(rng() * 4);
        cx.fillRect(c * B, B, len * B, B);
        cx.fillRect((c + 1) * B, 0, (len - 2) * B, B);
        cx.fillRect((c + 1) * B, B * 2, (len - 1) * B, B);
    }

    // Періодичний рельєф: ціле число хвиль на ширину смуги, щоб смуга безшовно повторювалась
    function heights(cols, base, waves) {
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

    // Далекі пагорби
    const farCols = Math.ceil(W * 1.5 / B);
    const farH = heights(farCols, 5, [{ amp: 2.5, k: 2, ph: 0.3 }, { amp: 1.2, k: 5, ph: 1.7 }]);
    const farMax = Math.max.apply(null, farH);
    const far = document.createElement("canvas");
    far.width = farCols * B;
    far.height = farMax * B;
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#141d3d";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#1c2a55";
        fx.fillRect(c * B, top, B, B * 0.5);
    }

    // Ближні пагорби з травою, землею та деревами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = heights(nearCols, 3, [{ amp: 1.5, k: 3, ph: 2 }, { amp: 1, k: 7, ph: 0.5 }]);
    const nearMax = Math.max.apply(null, nearH) + 5;
    const near = document.createElement("canvas");
    near.width = nearCols * B;
    near.height = nearMax * B;
    const nx = near.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < nearCols; c++) {
        const hBlocks = nearH[c];
        const top = near.height - hBlocks * B;
        for (let r = 0; r < hBlocks; r++) {
            const y = top + r * B;
            if (r === 0) {
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#44a332";
                nx.fillRect(c * B, y, B, p);
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B + p, y + p, p, p);
                nx.fillStyle = "#5a3b22";
                nx.fillRect(c * B, y + p * 3, B, p);
                nx.fillRect(c * B + p * 2, y + p * 2, p, p);
            } else {
                nx.fillStyle = (r + c) % 2 === 0 ? "#553820" : "#4a3019";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#3d2714";
                nx.fillRect(c * B + ((r * 3 + c) % 4) * p, y + ((r + c * 2) % 4) * p, p, p);
            }
        }
        // Дерево на деяких вершинах
        if (c % 11 === 4 && c + 1 < nearCols) {
            nx.fillStyle = "#5b3a1e";
            nx.fillRect(c * B, top - B * 3, B, B * 3);
            nx.fillStyle = "#256319";
            nx.fillRect((c - 1) * B, top - B * 5, B * 3, B * 2);
            nx.fillRect(c * B, top - B * 6, B, B);
            nx.fillStyle = "#347f24";
            nx.fillRect((c - 1) * B + p, top - B * 5 + p, p * 2, p);
            nx.fillRect((c + 1) * B, top - B * 4 - p * 2, p, p);
        }
    }

    return { W: W, H: H, B: B, sky: sky, stars: stars, clouds: clouds, far: far, near: near };
}

function buildPixelCave(W, H, groundY, B) {
    const rng = pixelRng(2323);
    const gY = Math.round(groundY);
    const cols = Math.ceil(W * 1.3 / B);
    const rows = Math.ceil(gY / B) + 1;
    const p = B / 4;

    const wall = document.createElement("canvas");
    wall.width = cols * B;
    wall.height = rows * B;
    const wx = wall.getContext("2d");
    const stoneShades = ["#3a3a44", "#34343d", "#2e2e36"];
    const ores = [];
    const torches = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const x = c * B;
            const y = r * B;
            wx.fillStyle = stoneShades[Math.floor(rng() * stoneShades.length)];
            wx.fillRect(x, y, B, B);
            wx.fillStyle = "#26262d";
            for (let k = 0; k < 3; k++) {
                wx.fillRect(x + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
            // Руда: алмаз, золото або червона руда
            const roll = rng();
            let oreColor = null;
            let kind = null;
            if (roll < 0.015) {
                oreColor = "#2fd3cf";
                kind = "diamond";
            } else if (roll < 0.03) {
                oreColor = "#f2c84b";
                kind = "gold";
            } else if (roll < 0.04) {
                oreColor = "#e0302a";
                kind = "red";
            }
            if (oreColor) {
                wx.fillStyle = oreColor;
                wx.fillRect(x + p, y + p, p, p);
                wx.fillRect(x + p * 2, y + p * 2, p, p);
                wx.fillRect(x + p * 2, y, p, p);
                wx.fillRect(x, y + p * 3, p, p);
                if (kind !== "gold") {
                    ores.push({ x: x, y: y, kind: kind, phase: rng() * Math.PI * 2 });
                }
            }
        }
    }
    // Темні сталактити зверху та тінь по краях
    wx.fillStyle = "#15151b";
    for (let c = 0; c < cols; c++) {
        const len = 1 + Math.floor((Math.sin(c * 1.7) + 1) * 1.5);
        wx.fillRect(c * B, 0, B, len * B);
    }
    const shade = wx.createLinearGradient(0, 0, 0, wall.height);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    shade.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    wx.fillStyle = shade;
    wx.fillRect(0, 0, wall.width, wall.height);
    // Факели на стінах
    for (let c = 5; c < cols - 2; c += 12) {
        const tx = c * B + p;
        const ty = Math.round(gY * 0.45 / B) * B;
        wx.fillStyle = "#6b4424";
        wx.fillRect(tx, ty, p * 2, B);
        torches.push({ x: tx, y: ty, phase: rng() * Math.PI * 2 });
    }

    // Лавове світіння біля землі
    const lava = document.createElement("canvas");
    lava.width = 1;
    lava.height = B * 3;
    const lx = lava.getContext("2d");
    const lg = lx.createLinearGradient(0, 0, 0, lava.height);
    lg.addColorStop(0, "rgba(255, 90, 0, 0)");
    lg.addColorStop(1, "rgba(255, 90, 0, 0.35)");
    lx.fillStyle = lg;
    lx.fillRect(0, 0, 1, lava.height);

    return { W: W, H: H, B: B, wall: wall, ores: ores, torches: torches, lava: lava };
}

BackgroundRenderer.renderPixelNight = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNight;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNight(W, H, groundY, B);
        this._pixelNight = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const starSize = Math.max(2, Math.round(B / 4));
    ctx.fillStyle = "#ffffff";
    for (const star of st.stars) {
        ctx.globalAlpha = 0.35 + 0.65 * (Math.sin(time * star.speed + star.phase) * 0.5 + 0.5);
        ctx.fillRect(star.x, star.y, starSize, starSize);
    }
    ctx.globalAlpha = 1;
    drawScrollingStrip(ctx, st.clouds, W, Math.round(H * 0.3), time, speed, 0.04);
    // Фантоми повільно ширяють високо в небі
    for (let i = 0; i < 2; i++) {
        const k = ((time * (0.035 + i * 0.012) + i * 0.5) % 1);
        const x = W * 1.1 - k * W * 1.3;
        const y = groundY * (0.14 + i * 0.12) + Math.sin(time * 0.9 + i * 2) * B;
        const flap = Math.sin(time * 2.2 + i) * B * 0.7;
        ctx.fillStyle = "#3a4a7a";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 2.2), Math.round(B * 0.7));
        ctx.fillRect(Math.round(x + B * 2.2), Math.round(y + B * 0.15), Math.round(B * 1.4), Math.round(B * 0.4));
        ctx.fillStyle = "#4a5a8a";
        ctx.fillRect(Math.round(x + B * 0.4), Math.round(y - B * 1.2 + flap), Math.round(B * 1.4), Math.round(B * 1.2 - flap));
        ctx.fillRect(Math.round(x + B * 0.4), Math.round(y + B * 0.7), Math.round(B * 1.4), Math.round(Math.max(2, B * 0.5 + flap * 0.5)));
        ctx.fillStyle = "#6aff6a";
        ctx.fillRect(Math.round(x + B * 0.1), Math.round(y + B * 0.15), Math.round(B * 0.3), Math.round(B * 0.2));
    }
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.12);
    // Кажани пурхають зигзагами
    ctx.fillStyle = "#1a1420";
    for (let i = 0; i < 5; i++) {
        const k = ((time * (0.08 + i * 0.02) + i * 0.21) % 1);
        const x = W * 1.05 - k * W * 1.15 + Math.sin(time * 3 + i) * B;
        const y = groundY * (0.35 + (i % 3) * 0.1) + Math.sin(time * 5 + i * 2) * B * 0.8;
        const up = Math.sin(time * 16 + i) > 0;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 0.4), Math.round(B * 0.35));
        ctx.fillRect(Math.round(x - B * 0.5), Math.round(y + (up ? -B * 0.3 : B * 0.1)), Math.round(B * 0.5), Math.round(B * 0.25));
        ctx.fillRect(Math.round(x + B * 0.4), Math.round(y + (up ? -B * 0.3 : B * 0.1)), Math.round(B * 0.5), Math.round(B * 0.25));
    }
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
};

BackgroundRenderer.renderPixelCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelCave(W, H, groundY, B);
        this._pixelCave = st;
    }
    ctx.fillStyle = "#0b0b10";
    ctx.fillRect(0, 0, W, H);
    const wallW = st.wall.width;
    const offset = Math.round(time * speed * 0.2) % wallW;
    const wallY = Math.round(groundY) - st.wall.height;
    for (let x = -offset; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wallY);
    }
    const p = B / 4;
    // Пульсуюче світіння руди та факелів (позиції зсуваються разом зі стіною)
    for (let copy = -offset; copy < W; copy += wallW) {
        for (const ore of st.ores) {
            const x = copy + ore.x;
            if (x < -B * 2 || x > W + B) {
                continue;
            }
            const pulse = Math.sin(time * (ore.kind === "red" ? 3 : 1.6) + ore.phase) * 0.5 + 0.5;
            ctx.fillStyle = ore.kind === "red" ? "rgba(255, 40, 30, 0.22)" : "rgba(60, 240, 230, 0.18)";
            ctx.globalAlpha = 0.3 + 0.7 * pulse;
            ctx.fillRect(x - p, wallY + ore.y - p, B + p * 2, B + p * 2);
        }
        for (const torch of st.torches) {
            const x = copy + torch.x;
            if (x < -B * 3 || x > W + B * 3) {
                continue;
            }
            const y = wallY + torch.y;
            const flicker = 0.75 + 0.25 * Math.sin(time * 11 + torch.phase) * Math.sin(time * 7.3);
            ctx.globalAlpha = 0.1 * flicker;
            ctx.fillStyle = "#ffaa33";
            ctx.fillRect(x - B * 2, y - B * 2, B * 4 + p * 2, B * 4);
            ctx.globalAlpha = 0.14 * flicker;
            ctx.fillRect(x - B, y - B, B * 2 + p * 2, B * 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(x, y - p * 2, p * 2, p * 2);
            ctx.fillStyle = flicker > 0.85 ? "#ffffff" : "#ff7a00";
            ctx.fillRect(x + p * 0.5, y - p * 2.5, p, p);
        }
    }
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 1.3);
    ctx.drawImage(st.lava, 0, Math.round(groundY) - st.lava.height, W, st.lava.height);
    ctx.globalAlpha = 1;
};

// ---------- Нові світи: сніг, океан, пустеля, острови, вогняний світ, неонові сцени ----------

// ---------- Сніжні гори (рівень 25) ----------

function buildPixelSnow(W, H, groundY, B) {
    const rng = pixelRng(2525);
    const sky = makeSky(W, H, [[0, "#0d1633"], [0.55, "#2c3f73"], [1, "#6d7fb0"]]);
    const skx = sky.getContext("2d");
    // Північне сяйво
    for (let i = 0; i < 26; i++) {
        const x = Math.round((W * 0.1 + i * W * 0.03) / B) * B;
        const len = (3 + Math.round(Math.sin(i * 0.7) * 2 + 2)) * B;
        skx.fillStyle = i % 2 === 0 ? "rgba(80, 255, 170, 0.08)" : "rgba(120, 200, 255, 0.07)";
        skx.fillRect(x, Math.round(H * 0.08 / B) * B + Math.round(Math.sin(i * 0.5) * 2) * B, B, len);
    }

    const farCols = Math.ceil(W * 1.5 / B);
    const farH = periodicHeights(farCols, 8, [{ amp: 4, k: 3, ph: 0.4 }, { amp: 2, k: 7, ph: 2 }]);
    const far = makeCanvas(farCols * B, Math.max.apply(null, farH) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#3b4a73";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#e8f0ff";
        fx.fillRect(c * B, top, B, B * (farH[c] > 9 ? 2 : 1));
    }

    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 3, [{ amp: 1.5, k: 2, ph: 1 }, { amp: 1, k: 5, ph: 0.2 }]);
    const nearMax = Math.max.apply(null, nearH) + 6;
    const near = makeCanvas(nearCols * B, nearMax * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#f4f8ff", topLight: "#ffffff", body: "#8a94a8", body2: "#7a8498", speck: "#6a7488" }, rng);
    // Ялинки зі снігом
    for (let c = 3; c < nearCols - 2; c += 7 + Math.floor(rng() * 4)) {
        const top = near.height - nearH[c] * B;
        nx.fillStyle = "#5b3a1e";
        nx.fillRect(c * B, top - B, B, B);
        for (let t = 0; t < 3; t++) {
            const w = 3 - t;
            const y = top - B * (2 + t);
            nx.fillStyle = "#1f5a3a";
            nx.fillRect((c - w + 1) * B - (w > 1 ? 0 : 0), y, (w * 2 - 1) * B, B);
            nx.fillStyle = "#f4f8ff";
            nx.fillRect((c - w + 1) * B, y, (w * 2 - 1) * B, B / 4);
        }
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelSnow = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelSnow;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelSnow(W, H, groundY, B);
        this._pixelSnow = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.1);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    drawFallingPixels(ctx, W, groundY, time, 70, 77, {
        color: "#ffffff", dir: 1, speedMin: 25, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.2, swayAmp: B * 0.6, alpha: 0.85
    });
};

// ---------- Інопланетний океан (рівень 26) ----------

function buildPixelOcean(W, H, groundY, B) {
    const rng = pixelRng(2626);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0b5b86"], [0.45, "#063a63"], [1, "#010818"]]);
    const skx = sky.getContext("2d");
    // Промені світла з поверхні
    for (let i = 0; i < 6; i++) {
        const x = W * (0.08 + i * 0.17);
        skx.fillStyle = "rgba(160, 230, 255, 0.05)";
        skx.beginPath();
        skx.moveTo(x, 0);
        skx.lineTo(x + W * 0.05, 0);
        skx.lineTo(x + W * 0.16, gY);
        skx.lineTo(x + W * 0.08, gY);
        skx.closePath();
        skx.fill();
    }

    // Морське дно з піском, камінням і світними коралами
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.5 }, { amp: 0.8, k: 8, ph: 2 }]);
    const maxH = Math.max.apply(null, hs) + 3;
    const floor = makeCanvas(cols * B, maxH * B);
    const fx = floor.getContext("2d");
    drawBlockTerrain(fx, hs, B, floor.height, { top: "#c9b27a", topLight: "#e3d09a", body: "#8f7a4c", body2: "#7d6a40", speck: "#6e5c36" }, rng);
    const corals = [];
    const p = B / 4;
    for (let c = 1; c < cols - 1; c += 3 + Math.floor(rng() * 4)) {
        const top = floor.height - hs[c] * B;
        const kind = Math.floor(rng() * 3);
        const colors = [["#ff4fa3", "#ff9ed0"], ["#39ffd0", "#b0fff0"], ["#b06bff", "#e0c0ff"]][kind];
        const hBlocks = 1 + Math.floor(rng() * 2);
        fx.fillStyle = colors[0];
        fx.fillRect(c * B + p, top - hBlocks * B, p * 2, hBlocks * B);
        fx.fillRect(c * B, top - hBlocks * B, B, p * 2);
        fx.fillStyle = colors[1];
        fx.fillRect(c * B + p, top - hBlocks * B, p, p);
        corals.push({ x: c * B + B / 2, y: top - hBlocks * B, color: colors[0] });
    }

    // Водорості (коливаються щокадру)
    const kelp = [];
    for (let i = 0; i < 14; i++) {
        kelp.push({ x: Math.round(rng() * cols) * B, h: 4 + Math.floor(rng() * 6), phase: rng() * Math.PI * 2 });
    }
    // Зграї риб
    const fish = [];
    for (let i = 0; i < 9; i++) {
        fish.push({
            y: gY * (0.2 + rng() * 0.6),
            speed: 20 + rng() * 40,
            offset: rng() * W * 2,
            color: ["#ffcc33", "#ff7a3d", "#7df9ff", "#ff4fa3"][Math.floor(rng() * 4)],
            size: Math.round(B * (0.5 + rng() * 0.4))
        });
    }
    // Медузи
    const jelly = [];
    for (let i = 0; i < 4; i++) {
        jelly.push({ x: rng() * W, y: gY * (0.15 + rng() * 0.45), phase: rng() * Math.PI * 2 });
    }
    return { W: W, H: H, sky: sky, floor: floor, corals: corals, kelp: kelp, fish: fish, jelly: jelly, cols: cols };
}

// Силует велетенського блокового морського змія, що зрідка пропливає вдалині
function drawLeviathan(ctx, W, gY, B, time) {
    const period = 38;
    const t = (time % period) / period;
    if (t > 0.6) {
        return;
    }
    const headX = W * 1.2 - t / 0.6 * W * 2.2;
    const baseY = gY * 0.38;
    ctx.fillStyle = "rgba(2, 20, 40, 0.55)";
    for (let i = 0; i < 16; i++) {
        const sx = headX + i * B * 1.6;
        const sy = baseY + Math.sin(time * 1.5 - i * 0.5) * B * 1.2;
        const seg = Math.round(B * (2.2 - i * 0.09));
        ctx.fillRect(Math.round(sx), Math.round(sy - seg / 2), seg, seg);
    }
    // Око, що світиться
    ctx.fillStyle = "rgba(255, 80, 60, 0.7)";
    ctx.fillRect(Math.round(headX + B * 0.3), Math.round(baseY + Math.sin(time * 1.5) * B * 1.2 - B * 0.5), Math.round(B * 0.4), Math.round(B * 0.3));
}

BackgroundRenderer.renderPixelOcean = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelOcean;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelOcean(W, H, groundY, B);
        this._pixelOcean = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawLeviathan(ctx, W, gY, B, time);

    // Медузи пульсують і повільно дрейфують
    for (const j of st.jelly) {
        const pulse = Math.sin(time * 2 + j.phase) * 0.5 + 0.5;
        const x = Math.round(((j.x - time * 8) % (W + B * 4) + W + B * 4) % (W + B * 4) - B * 2);
        const y = Math.round(j.y + Math.sin(time * 0.7 + j.phase) * B);
        ctx.globalAlpha = 0.06 + 0.1 * pulse;
        ctx.fillStyle = "#c08bff";
        ctx.fillRect(x - B, y - B, B * 3, B * 3);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#e6c8ff";
        ctx.fillRect(x, y, B, B * 0.75);
        ctx.fillStyle = "#c08bff";
        const tl = B * (0.8 + pulse * 0.6);
        ctx.fillRect(x, y + B * 0.75, B / 5, tl);
        ctx.fillRect(x + B * 0.4, y + B * 0.75, B / 5, tl * 1.2);
        ctx.fillRect(x + B * 0.8, y + B * 0.75, B / 5, tl);
    }
    ctx.globalAlpha = 1;

    // Риби пливуть (частина — назустріч руху кубика)
    for (const f of st.fish) {
        const span = W + f.size * 8;
        const x = Math.round(span - ((f.offset + time * (f.speed + speed * 0.15)) % span) - f.size * 4);
        const y = Math.round(f.y + Math.sin(time * 2 + f.offset) * B * 0.3);
        ctx.fillStyle = f.color;
        ctx.fillRect(x, y, f.size, Math.round(f.size * 0.6));
        ctx.fillRect(x + f.size, y - Math.round(f.size * 0.15), Math.round(f.size * 0.4), Math.round(f.size * 0.9));
        ctx.fillStyle = "#00121e";
        ctx.fillRect(x + Math.round(f.size * 0.15), y + Math.round(f.size * 0.1), Math.max(2, Math.round(f.size * 0.15)), Math.max(2, Math.round(f.size * 0.15)));
    }

    // Дно зі зсувом і водорості, прив'язані до дна
    const floorW = st.floor.width;
    const offset = Math.round(time * speed * 0.3) % floorW;
    const floorY = gY - st.floor.height;
    for (let x = -offset; x < W; x += floorW) {
        for (const k of st.kelp) {
            const kx = x + k.x;
            if (kx < -B * 2 || kx > W + B * 2) {
                continue;
            }
            for (let seg = 0; seg < k.h; seg++) {
                const sway = Math.round(Math.sin(time * 1.6 + k.phase + seg * 0.5) * seg * B * 0.12);
                ctx.fillStyle = seg % 2 === 0 ? "#1f8a4a" : "#27a65a";
                ctx.fillRect(kx + sway, gY - B * (seg + 2), Math.round(B * 0.5), B);
            }
        }
        ctx.drawImage(st.floor, x, floorY);
        // Світіння коралів
        for (const c of st.corals) {
            const cx = x + c.x;
            if (cx < -B * 2 || cx > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.12 + 0.12 * Math.sin(time * 2.2 + c.x);
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - B, floorY + c.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }

    // Бульбашки піднімаються
    drawFallingPixels(ctx, W, gY, time, 30, 262, {
        color: "#bff4ff", dir: -1, speedMin: 30, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 2, swayAmp: B * 0.3, alpha: 0.55
    });
};

// ---------- Пустеля (рівень 27) ----------

function buildPixelDesert(W, H, groundY, B) {
    const rng = pixelRng(2727);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1d0b3a"], [0.4, "#6a1f5e"], [0.62, "#ff6a3d"], [1, "#ffb35c"]]);
    const skx = sky.getContext("2d");
    // Велике квадратне сонце низько над обрієм
    const sunS = B * 5;
    const sunX = Math.round(W * 0.62 / B) * B;
    const sunY = Math.round((gY - B * 9) / B) * B;
    skx.fillStyle = "rgba(255, 220, 120, 0.15)";
    skx.fillRect(sunX - B, sunY - B, sunS + B * 2, sunS + B * 2);
    skx.fillStyle = "#ffd36b";
    skx.fillRect(sunX, sunY, sunS, sunS);
    skx.fillStyle = "#ffb347";
    for (let i = 1; i < 4; i++) {
        skx.fillRect(sunX, sunY + sunS - i * B * 1.2, sunS, B * 0.3);
    }

    // Далекі піраміди
    const farCols = Math.ceil(W * 1.5 / B);
    const far = makeCanvas(farCols * B, B * 9);
    const fx = far.getContext("2d");
    const pyramids = [[Math.round(farCols * 0.2), 8], [Math.round(farCols * 0.3), 5], [Math.round(farCols * 0.7), 7]];
    for (const pyr of pyramids) {
        for (let level = 0; level < pyr[1]; level++) {
            const w = (pyr[1] - level) * 2 - 1;
            fx.fillStyle = level % 2 === 0 ? "#b0703c" : "#9a6033";
            fx.fillRect((pyr[0] - (pyr[1] - level) + 1) * B, far.height - (level + 1) * B, w * B, B);
        }
    }

    // Дюни з кактусами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 2.5, [{ amp: 1.3, k: 3, ph: 0.8 }, { amp: 0.7, k: 7, ph: 0.1 }]);
    const near = makeCanvas(nearCols * B, (Math.max.apply(null, nearH) + 4) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#e8b85c", topLight: "#f5d48a", body: "#d19a45", body2: "#c28c3c", speck: "#b07a30" }, rng);
    for (let c = 4; c < nearCols - 2; c += 8 + Math.floor(rng() * 5)) {
        const top = near.height - nearH[c] * B;
        const h = 2 + Math.floor(rng() * 2);
        nx.fillStyle = "#2f8a3a";
        nx.fillRect(c * B, top - h * B, B, h * B);
        nx.fillRect((c - 1) * B, top - (h - 1) * B, B / 2, B / 2);
        nx.fillRect((c - 1) * B, top - (h - 1) * B - B / 2, B / 2, B);
        nx.fillRect((c + 1) * B + B / 2, top - h * B + B / 2, B / 2, B);
        nx.fillStyle = "#4fb55a";
        nx.fillRect(c * B + B / 4, top - h * B, B / 4, h * B);
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelDesert = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelDesert;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelDesert(W, H, groundY, B);
        this._pixelDesert = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.08);
    // Грифи кружляють у небі
    for (let i = 0; i < 2; i++) {
        const a = time * (0.4 + i * 0.1) + i * 3;
        const vx = W * (0.35 + i * 0.35) + Math.cos(a) * B * 4;
        const vy = groundY * (0.18 + i * 0.06) + Math.sin(a) * B * 1.2;
        const tilt = Math.sin(time * 1.5 + i) * B * 0.2;
        ctx.fillStyle = "#3a2a2a";
        ctx.fillRect(Math.round(vx - B * 0.3), Math.round(vy), Math.round(B * 0.6), Math.round(B * 0.35));
        ctx.fillRect(Math.round(vx - B * 1.8), Math.round(vy - B * 0.1 + tilt), Math.round(B * 1.5), Math.round(B * 0.25));
        ctx.fillRect(Math.round(vx + B * 0.3), Math.round(vy - B * 0.1 - tilt), Math.round(B * 1.5), Math.round(B * 0.25));
        ctx.fillStyle = "#e8b0a0";
        ctx.fillRect(Math.round(vx + B * 0.3), Math.round(vy + B * 0.05), Math.round(B * 0.25), Math.round(B * 0.2));
    }
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    const gYd = Math.round(groundY);
    // Скорпіони повзають піском, піднявши жало (трохи більші за блок, щоб їх було видно)
    const Bc = B * 1.5;
    for (let i = 0; i < 2; i++) {
        const k = ((time * (0.035 + i * 0.015) + i * 0.5) % 1);
        const x = W * 1.05 - k * W * 1.2;
        const y = gYd - Bc * 0.6;
        const leg = Math.sin(time * 14 + i) > 0 ? 1 : 0;
        ctx.fillStyle = "#b8702a";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(Bc * 1.2), Math.round(Bc * 0.4));
        ctx.fillRect(Math.round(x - Bc * 0.5), Math.round(y - Bc * 0.1), Math.round(Bc * 0.4), Math.round(Bc * 0.3));
        ctx.fillRect(Math.round(x - Bc * 0.5), Math.round(y + Bc * 0.2), Math.round(Bc * 0.4), Math.round(Bc * 0.2));
        for (let t = 0; t < 4; t++) {
            ctx.fillRect(Math.round(x + Bc * 1.2 + t * Bc * 0.2), Math.round(y - t * Bc * 0.3), Math.round(Bc * 0.25), Math.round(Bc * 0.3));
        }
        ctx.fillStyle = "#6a3a10";
        ctx.fillRect(Math.round(x + Bc * 1.8), Math.round(y - Bc * 1.1), Math.round(Bc * 0.3), Math.round(Bc * 0.3));
        ctx.fillStyle = "#8a5020";
        for (let l = 0; l < 3; l++) {
            ctx.fillRect(Math.round(x + Bc * 0.2 + l * Bc * 0.35 + leg * 2), Math.round(y + Bc * 0.4), 2, Math.round(Bc * 0.25));
        }
    }
    // Змії звиваються піском
    for (let i = 0; i < 2; i++) {
        const k = ((time * (0.05 + i * 0.02) + i * 0.4) % 1);
        const hx = -Bc * 3 + k * (W + Bc * 6);
        const y = gYd - Bc * 0.35;
        for (let seg = 0; seg < 9; seg++) {
            const sx2 = hx - seg * Bc * 0.35;
            const sy = y + Math.sin(time * 8 - seg * 0.9) * Bc * 0.2;
            ctx.fillStyle = seg % 2 === 0 ? "#6a8a2a" : "#e8c040";
            ctx.fillRect(Math.round(sx2), Math.round(sy), Math.round(Bc * 0.4), Math.round(Bc * 0.3));
        }
        ctx.fillStyle = "#5a7a20";
        ctx.fillRect(Math.round(hx + Bc * 0.3), Math.round(y - Bc * 0.05 + Math.sin(time * 8) * Bc * 0.2), Math.round(Bc * 0.45), Math.round(Bc * 0.4));
        if (Math.sin(time * 6 + i) > 0.5) {
            ctx.fillStyle = "#ff3344";
            ctx.fillRect(Math.round(hx + Bc * 0.75), Math.round(y + Bc * 0.1), Math.round(Bc * 0.3), 2);
        }
    }
    // Перекотиполе
    const tk = (time * 0.12) % 1;
    const tx = -B * 2 + tk * (W + B * 4);
    const ty = gYd - B * 0.8 - Math.abs(Math.sin(tk * Math.PI * 6)) * B * 1.2;
    const rot = tk * Math.PI * 12;
    ctx.strokeStyle = "#a07a40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let r = 0; r < 4; r++) {
        const a = rot + r * Math.PI / 4;
        ctx.moveTo(tx - Math.cos(a) * B * 0.7, ty - Math.sin(a) * B * 0.7);
        ctx.lineTo(tx + Math.cos(a) * B * 0.7, ty + Math.sin(a) * B * 0.7);
    }
    ctx.stroke();
    // Пісок, що несе вітер
    drawFallingPixels(ctx, W, groundY, time, 20, 272, {
        color: "#ffe0a0", dir: 1, speedMin: 3, speedMax: 8, sizeMin: 2, sizeMax: 3,
        sway: 0.8, swayAmp: W * 0.4, alpha: 0.5
    });
};

// ---------- Парящі острови в космосі (рівень 28) ----------
// Туманність і планета з кільцями; великі острови з руїнами, деревами й кристалами,
// з країв зриваються водоспади в порожнечу, острови з'єднують ланцюги,
// поміж ними дрейфують уламки й ширяють космічні скати.

function buildPixelIslands(W, H, groundY, B) {
    const rng = pixelRng(2828);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05010d"], [0.6, "#140726"], [1, "#2a0f45"]]);
    const skx = sky.getContext("2d");
    // Туманність кольоровими плямами
    const neb = [["255, 90, 216", 0.045], ["120, 90, 255", 0.05], ["57, 198, 255", 0.035]];
    for (let i = 0; i < 60; i++) {
        const n = neb[i % 3];
        skx.fillStyle = "rgba(" + n[0] + ", " + n[1] + ")";
        const cx = W * (0.35 + 0.5 * Math.sin(i * 0.37)) + (rng() - 0.5) * W * 0.3;
        const cy = gY * (0.3 + 0.15 * Math.cos(i * 0.5)) + (rng() - 0.5) * gY * 0.25;
        drawPixelDisc(skx, cx, cy, B * (1.5 + rng() * 3), B / 2, skx.fillStyle);
    }
    for (let i = 0; i < 120; i++) {
        skx.fillStyle = rng() < 0.2 ? "#d9b3ff" : "#ffffff";
        skx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.15 ? B / 3 : B / 6;
        skx.fillRect(Math.round(rng() * W), Math.round(rng() * gY), s, s);
    }
    skx.globalAlpha = 1;
    // Планета з кільцями
    const pr = B * 4;
    const px = Math.round(W * 0.2);
    const py = Math.round(gY * 0.3);
    skx.strokeStyle = "rgba(230, 200, 255, 0.35)";
    skx.lineWidth = Math.max(3, B / 3);
    skx.beginPath();
    skx.ellipse(px, py, pr * 1.9, pr * 0.45, -0.25, Math.PI, Math.PI * 2);
    skx.stroke();
    for (let y = -pr; y < pr; y += B / 2) {
        for (let x = -pr; x < pr; x += B / 2) {
            if (x * x + y * y > pr * pr) {
                continue;
            }
            skx.fillStyle = (y + x * 0.3) % (B * 2) < B ? "#6b3fa8" : "#57318c";
            if (x + y > pr * 0.6) {
                skx.fillStyle = "#3a1f63";
            }
            skx.fillRect(px + x, py + y, B / 2, B / 2);
        }
    }
    skx.beginPath();
    skx.ellipse(px, py, pr * 1.9, pr * 0.45, -0.25, 0, Math.PI);
    skx.stroke();

    // Острови: трав'яна верхівка, камінь, що звужується донизу; на них руїни, дерева, кристали
    function islandsStrip(stripW, count, scale, seed, detail) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, gY);
        const sx = strip.getContext("2d");
        const falls = [];
        const anchors = [];
        for (let i = 0; i < count; i++) {
            const w = Math.round((5 + r() * 5) * scale);
            const x = Math.round((i + 0.15 + r() * 0.4) * stripW / count / B) * B;
            const y = Math.round((gY * (0.3 + r() * 0.4)) / B) * B;
            const rows = Math.ceil(w / 1.6);
            for (let row = 0; row < rows; row++) {
                const inset = Math.round(row * 0.8);
                const rowW = Math.max(1, w - inset * 2);
                for (let c = 0; c < rowW; c++) {
                    sx.fillStyle = row === 0 ? (c % 2 === 0 ? "#6fcf6a" : "#5ab85a") : row === 1 ? "#8a6a4a" : (row + c) % 2 === 0 ? "#4a3f5c" : "#433857";
                    sx.fillRect(x + (inset + c) * B, y + row * B, B, B);
                }
                if (row > 1 && r() < 0.3) {
                    sx.fillStyle = "#b35cff";
                    sx.fillRect(x + (inset + Math.floor(r() * rowW)) * B + B / 4, y + row * B + B / 4, B / 2, B / 2);
                }
            }
            anchors.push({ x: x + w * B / 2, y: y + B });
            if (!detail) {
                continue;
            }
            const deco = Math.floor(r() * 3);
            if (deco === 0) {
                // Руїни храму з колонами
                for (let k = 0; k < 3; k++) {
                    const ch = B * (2 + (k === 1 ? 1 : r()));
                    sx.fillStyle = "#e3dca8";
                    sx.fillRect(x + B * (1 + k * 1.5), y - ch, B * 0.6, ch);
                }
                sx.fillRect(x + B * 0.6, y - B * 3.2, B * 3, B * 0.4);
            } else if (deco === 1) {
                // Дерево
                sx.fillStyle = "#6a4a2a";
                sx.fillRect(x + B * 2, y - B * 2.5, B * 0.5, B * 2.5);
                sx.fillStyle = "#3aa04a";
                sx.fillRect(x + B * 0.8, y - B * 4, B * 3, B * 1.8);
                sx.fillStyle = "#5ac85a";
                sx.fillRect(x + B * 1.3, y - B * 4.6, B * 2, B * 0.8);
            } else {
                // Кристалева друза
                for (let k = 0; k < 3; k++) {
                    sx.fillStyle = k === 1 ? "#e6bfff" : "#b35cff";
                    sx.fillRect(x + B * (1.5 + k * 0.7), y - B * (1.5 + (k === 1 ? 1 : 0)), B * 0.6, B * (1.5 + (k === 1 ? 1 : 0)));
                }
            }
            // Водоспад з краю острова
            if (r() < 0.8) {
                falls.push({ x: x + (w - 1) * B, y: y + B });
            }
        }
        return { canvas: strip, falls: falls, anchors: anchors };
    }
    const far = islandsStrip(Math.ceil(W * 1.5 / B) * B, 5, 0.6, 2801, false);
    const near = islandsStrip(Math.ceil(W * 1.3 / B) * B, 3, 1, 2802, true);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

// Космічний скат, що плавно махає крилами
function drawSpaceRay(ctx, x, y, B, time, phase) {
    const flap = Math.sin(time * 2 + phase) * B * 0.8;
    ctx.fillStyle = "#3a2a6a";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + B * 2, y - B * 0.6 + flap);
    ctx.lineTo(x + B * 3.5, y - B * 1.6 + flap);
    ctx.lineTo(x + B * 2.6, y + B * 0.4);
    ctx.lineTo(x + B * 3.5, y + B * 1.6 - flap);
    ctx.lineTo(x + B * 2, y + B * 0.6 - flap);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(Math.round(x + B * 2.6), Math.round(y - 1), B * 2.5, 2);
    ctx.fillStyle = "#39ffd0";
    ctx.fillRect(Math.round(x + B * 0.5), Math.round(y - 2), 3, 3);
    ctx.fillRect(Math.round(x + B * 1.6), Math.round(y - B * 0.3 + flap * 0.3), 2, 2);
    ctx.fillRect(Math.round(x + B * 1.6), Math.round(y + B * 0.3 - flap * 0.3), 2, 2);
}

BackgroundRenderer.renderPixelIslands = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelIslands;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelIslands(W, H, groundY, B);
        this._pixelIslands = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Космічні скати ширяють поміж островами
    for (let i = 0; i < 2; i++) {
        const k = ((time * (0.04 + i * 0.015) + i * 0.5) % 1);
        const x = W * 1.1 - k * W * 1.4;
        const y = gY * (0.2 + i * 0.3) + Math.sin(time * 0.7 + i) * B;
        drawSpaceRay(ctx, Math.round(x), Math.round(y), B * (1 + i * 0.3), time, i * 2);
    }

    // Острови ледь погойдуються; з країв ллються водоспади
    const layers = [[st.far, 0.08, 0.6, 0.3], [st.near, 0.2, 0.8, 0.4]];
    for (let li = 0; li < layers.length; li++) {
        const layer = layers[li][0];
        const factor = layers[li][1];
        const bob = Math.round(Math.sin(time * layers[li][2] + li) * B * layers[li][3]);
        const lw = layer.canvas.width;
        const off = Math.round(time * speed * factor) % lw;
        for (let x = -off; x < W; x += lw) {
            // Ланцюги між островами
            ctx.strokeStyle = li === 0 ? "rgba(140, 120, 170, 0.4)" : "rgba(170, 150, 200, 0.7)";
            ctx.lineWidth = li === 0 ? 1 : 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            for (let a = 0; a + 1 < layer.anchors.length; a++) {
                const p1 = layer.anchors[a];
                const p2 = layer.anchors[a + 1];
                ctx.moveTo(x + p1.x, p1.y + bob);
                ctx.quadraticCurveTo(x + (p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + bob + B * 2, x + p2.x, p2.y + bob);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            for (const f of layer.falls) {
                const fx = x + f.x;
                if (fx < -B || fx > W + B) {
                    continue;
                }
                const len = gY * (li === 0 ? 0.25 : 0.4);
                ctx.fillStyle = li === 0 ? "rgba(120, 200, 255, 0.35)" : "rgba(140, 220, 255, 0.6)";
                ctx.fillRect(Math.round(fx), f.y + bob, Math.round(B * (li === 0 ? 0.4 : 0.7)), Math.round(len));
                ctx.fillStyle = "rgba(230, 250, 255, 0.8)";
                const step = B;
                const sh = (time * 120) % step;
                for (let y = sh; y < len; y += step) {
                    ctx.globalAlpha = 1 - y / len;
                    ctx.fillRect(Math.round(fx + B * 0.1), Math.round(f.y + bob + y), Math.max(2, Math.round(B / 5)), Math.round(B / 3));
                }
                ctx.globalAlpha = 1;
            }
            ctx.drawImage(layer.canvas, x, bob);
        }
    }
    // Дрейфують дрібні уламки
    for (let i = 0; i < 8; i++) {
        const k = ((time * (0.02 + (i % 3) * 0.01) + i * 0.13) % 1);
        const x = W * 1.05 - k * W * 1.1;
        const y = gY * (0.1 + (i * 0.11) % 0.8) + Math.sin(time + i) * B * 0.3;
        ctx.fillStyle = i % 2 === 0 ? "#4a3f5c" : "#5a4f6c";
        const s = Math.round(B * (0.3 + (i % 3) * 0.2));
        ctx.fillRect(Math.round(x), Math.round(y), s, s);
    }
    // Фіолетові іскри піднімаються
    drawFallingPixels(ctx, W, gY, time, 35, 282, {
        color: "#d68bff", dir: -1, speedMin: 15, speedMax: 40, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.5, swayAmp: B * 0.5, alpha: 0.7
    });
};
