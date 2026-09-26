// backgrounds/treasury_dragon_castle.js — скарбниця, лігво дракона, лицарський замок

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, drawPixelDisc, drawScrollingStrip, drawStarsInto, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";

// ---------- Ліги 2 та 4: сцени рівнів ----------

// ---------- 20. Скарбниця ----------
// Печера-скарбниця: кам'яні арки, гори золота, відчинені скрині, корона й самоцвіти.
// Із тріщини у склепінні сиплеться золотий водоспад монет.

function drawGoldMound(ctx, cx, baseY, halfW, h, rng, B) {
    const p = Math.max(2, Math.round(B / 3));
    for (let x = -halfW; x < halfW; x += p) {
        const k = 1 - Math.abs(x) / halfW;
        const top = baseY - Math.round(h * Math.sqrt(k) / p) * p;
        for (let y = top; y < baseY; y += p) {
            const shade = rng();
            ctx.fillStyle = y === top ? "#fff0a0" : shade < 0.15 ? "#fff0a0" : shade < 0.6 ? "#ffcc33" : "#d8a020";
            ctx.fillRect(cx + x, y, p, p);
        }
    }
}

function buildTreasury(W, H, groundY, B) {
    const rng = pixelRng(2020);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0e0806"], [1, "#2a1a0c"]]);

    // Арки з колонами (дальній план)
    const stripW = Math.ceil(W * 1.4 / (B * 8)) * B * 8;
    const archH = Math.round(gY * 0.85);
    const arches = makeCanvas(stripW, archH);
    const ax = arches.getContext("2d");
    ax.fillStyle = "#2a1c12";
    ax.fillRect(0, 0, stripW, archH);
    for (let x = 0; x < stripW; x += B * 8) {
        // Прохід арки — темніший
        ax.fillStyle = "#160e08";
        ax.fillRect(x + B * 1.5, archH * 0.3, B * 5, archH * 0.7);
        for (let k = 0; k < 5; k++) {
            const lift = Math.round(Math.sin((k + 0.5) / 5 * Math.PI) * B * 2);
            ax.fillRect(x + B * 1.5 + k * B, archH * 0.3 - lift, B, lift);
        }
        // Колони з блоків
        for (let y = 0; y < archH; y += B) {
            ax.fillStyle = (y / B) % 2 === 0 ? "#3a2a1c" : "#34261a";
            ax.fillRect(x, y, B * 1.5, B - 2);
            ax.fillRect(x + B * 6.5, y, B * 1.5, B - 2);
        }
        ax.fillStyle = "#c89a20";
        ax.fillRect(x, archH * 0.3 - B * 2.3, B * 8, B * 0.3);
    }

    // Гори золота з речами — ближній шар
    const nearW = Math.ceil(W * 1.5 / B) * B;
    const nearH = Math.round(B * 8);
    const near = makeCanvas(nearW, nearH);
    const nx = near.getContext("2d");
    const sparkles = [];
    for (let x = B * 3; x < nearW - B * 3; x += B * (7 + Math.floor(rng() * 4))) {
        const halfW = B * (2.5 + rng() * 2.5);
        const h = B * (2.5 + rng() * 3);
        drawGoldMound(nx, x, nearH, halfW, h, rng, B);
        for (let s = 0; s < 4; s++) {
            sparkles.push({ x: x + (rng() - 0.5) * halfW * 1.4, y: nearH - rng() * h * 0.8, phase: rng() * 6 });
        }
        const deco = Math.floor(rng() * 3);
        if (deco === 0) {
            // Відчинена скриня
            const cx = x + halfW * 0.6;
            nx.fillStyle = "#6a3a14";
            nx.fillRect(cx, nearH - B * 1.6, B * 2.4, B * 1.6);
            nx.fillStyle = "#8a4b1c";
            nx.fillRect(cx - B * 0.2, nearH - B * 2.8, B * 2.8, B * 0.9);
            nx.fillStyle = "#ffcc33";
            nx.fillRect(cx + B * 0.2, nearH - B * 1.9, B * 2, B * 0.4);
            nx.fillRect(cx + B * 1, nearH - B * 1.6, B * 0.4, B * 1.6);
        } else if (deco === 1) {
            // Корона на верхівці
            const cx = x - B;
            const ty = nearH - h - B * 0.4;
            nx.fillStyle = "#ffd700";
            nx.fillRect(cx, ty, B * 2, B * 0.8);
            nx.fillRect(cx, ty - B * 0.5, B * 0.4, B * 0.5);
            nx.fillRect(cx + B * 0.8, ty - B * 0.7, B * 0.4, B * 0.7);
            nx.fillRect(cx + B * 1.6, ty - B * 0.5, B * 0.4, B * 0.5);
            nx.fillStyle = "#ff3355";
            nx.fillRect(cx + B * 0.8, ty + B * 0.2, B * 0.4, B * 0.4);
        } else {
            // Самоцвіти
            const gems = ["#ff3355", "#39c6ff", "#39ff88", "#b35cff"];
            for (let g = 0; g < 5; g++) {
                nx.fillStyle = gems[g % 4];
                nx.fillRect(Math.round(x + (rng() - 0.5) * halfW), Math.round(nearH - rng() * h * 0.7 - B * 0.4), Math.round(B * 0.5), Math.round(B * 0.5));
            }
        }
    }
    return { W: W, H: H, sky: sky, arches: arches, near: near, sparkles: sparkles };
}

BackgroundRenderer.renderTreasury = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._treasury;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTreasury(W, H, groundY, B);
        this._treasury = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.arches, W, gY, time, speed, 0.12);

    // Золотий водоспад монет із тріщини в склепінні
    const fx = Math.round(W * 0.66);
    ctx.fillStyle = "#0a0604";
    ctx.fillRect(fx - B * 1.2, 0, B * 2.4, B * 0.8);
    ctx.fillStyle = "rgba(255, 204, 51, 0.25)";
    ctx.fillRect(fx - B * 0.8, 0, B * 1.6, gY - B * 2);
    const step = B * 0.7;
    const shift = (time * B * 8) % step;
    for (let y = -step + shift; y < gY - B * 2; y += step) {
        for (let k = 0; k < 3; k++) {
            const wob = Math.sin(y * 0.1 + k * 2 + time * 3) * B * 0.3;
            ctx.fillStyle = (Math.floor(y / step) + k) % 3 === 0 ? "#fff0a0" : "#ffcc33";
            ctx.fillRect(Math.round(fx - B * 0.6 + k * B * 0.45 + wob), Math.round(y + k * step * 0.3), Math.max(3, Math.round(B / 3)), Math.max(3, Math.round(B / 4)));
        }
    }
    // Монети відскакують від купи внизу водоспаду
    for (let k = 0; k < 6; k++) {
        const q = (time * 1.4 + k / 6) % 1;
        const dir = k % 2 === 0 ? 1 : -1;
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(Math.round(fx + dir * q * B * (2 + k % 3)), Math.round(gY - B * 2 - Math.sin(q * Math.PI) * B * 1.8), Math.max(3, B / 3), Math.max(3, B / 3));
    }

    // Гори золота з блиском
    const nW = st.near.width;
    const nOff = Math.round(time * speed * 0.4) % nW;
    const nTop = gY - st.near.height;
    for (let x = -nOff; x < W; x += nW) {
        ctx.drawImage(st.near, x, nTop);
        for (const s of st.sparkles) {
            const sx = x + s.x;
            if (sx < -B || sx > W + B) {
                continue;
            }
            const tw = Math.sin(time * 3 + s.phase);
            if (tw > 0.6) {
                const r = Math.round(B * 0.5 * (tw - 0.6) / 0.4);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(Math.round(sx - r), Math.round(nTop + s.y), r * 2 + 2, 2);
                ctx.fillRect(Math.round(sx), Math.round(nTop + s.y - r), 2, r * 2 + 2);
            }
        }
    }
};

// ---------- 22. Лігво дракона ----------

function buildDragonLair(W, H, groundY, B) {
    const rng = pixelRng(2222);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0404"], [0.7, "#2a0a06"], [1, "#4a1808"]]);
    const sx = sky.getContext("2d");
    // Гора з печерою
    const cols = Math.ceil(W / B) + 1;
    const hs = periodicHeights(cols, 10, [{ amp: 5, k: 1, ph: 1.6 }, { amp: 1.5, k: 6, ph: 0.4 }]);
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < hs[c]; r++) {
            sx.fillStyle = (r + c) % 2 === 0 ? "#2a1a14" : "#241610";
            sx.fillRect(c * B, gY - (r + 1) * B, B, B);
        }
    }
    const caveX = Math.round(W * 0.5 / B) * B;
    sx.fillStyle = "#0a0402";
    sx.fillRect(caveX - B * 3, gY - B * 5, B * 6, B * 5);
    sx.fillRect(caveX - B * 2, gY - B * 6, B * 4, B);
    // Гніздо з яйцями та скарбами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const nest = makeCanvas(stripW, B * 3);
    const nx = nest.getContext("2d");
    const eggs = [];
    for (let x = B * 2; x < stripW - B * 6; x += B * (9 + Math.floor(rng() * 5))) {
        nx.fillStyle = "#5a3a1e";
        nx.fillRect(x, B * 2, B * 5, B);
        nx.fillStyle = "#6e4a26";
        nx.fillRect(x - B / 2, B * 2.5, B * 6, B / 2);
        const colors = [["#39c66a", "#9dffb0"], ["#b06bff", "#e0c0ff"], ["#ff7a3d", "#ffc08a"]];
        for (let e = 0; e < 3; e++) {
            const col = colors[Math.floor(rng() * colors.length)];
            const ex = x + B * 0.5 + e * B * 1.5;
            nx.fillStyle = col[0];
            nx.fillRect(ex, B * 0.8, B, B * 1.4);
            nx.fillRect(ex + B / 6, B * 0.6, B * 0.66, B / 5);
            nx.fillStyle = col[1];
            nx.fillRect(ex + B / 5, B, B / 4, B / 4);
            nx.fillRect(ex + B / 2, B * 1.6, B / 5, B / 5);
            eggs.push({ x: ex + B / 2, y: B * 1.5, color: col[0], phase: rng() * 6 });
        }
        nx.fillStyle = "#ffcc33";
        nx.fillRect(x + B * 4.8, B * 2.2, B / 2, B / 3);
        nx.fillRect(x - B, B * 2.4, B / 2, B / 3);
    }
    return { W: W, H: H, sky: sky, nest: nest, eggs: eggs, caveX: caveX };
}

BackgroundRenderer.renderDragonLair = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dragonLair;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDragonLair(W, H, groundY, B);
        this._dragonLair = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Дихання дракона в печері: очі світяться, іноді спалах вогню
    const breath = Math.sin(time * 0.8) * 0.5 + 0.5;
    ctx.fillStyle = "rgba(255, 90, 0, " + (0.15 + 0.25 * breath).toFixed(3) + ")";
    ctx.fillRect(st.caveX - B * 3, gY - B * 5, B * 6, B * 5);
    const blink = (time % 5) < 0.2;
    if (!blink) {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(st.caveX - B * 1.4, gY - B * 3.2, B * 0.8, B * 0.4);
        ctx.fillRect(st.caveX + B * 0.6, gY - B * 3.2, B * 0.8, B * 0.4);
    }
    const fire = (time % 7) / 1.2;
    if (fire < 1) {
        ctx.fillStyle = "rgba(255, 160, 40, " + (0.35 * (1 - fire)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        ctx.fillStyle = "rgba(255, 220, 80, " + (0.8 * (1 - fire)).toFixed(3) + ")";
        for (let k = 0; k < 8; k++) {
            ctx.fillRect(st.caveX - B + (k % 3) * B * 0.6, gY - B * 2.5 - k * B * 0.6 * fire * 4, B * 0.6, B * 0.6);
        }
    }
    const nw = st.nest.width;
    const offset = Math.round(time * speed * 0.3) % nw;
    const top = gY - st.nest.height;
    for (let x = -offset; x < W; x += nw) {
        ctx.drawImage(st.nest, x, top);
        // Яйця ледь світяться
        for (const e of st.eggs) {
            const ex = x + e.x;
            if (ex < -B * 2 || ex > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.08 + 0.1 * (Math.sin(time * 2 + e.phase) * 0.5 + 0.5);
            ctx.fillStyle = e.color;
            ctx.fillRect(ex - B, top + e.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }
    drawFallingPixels(ctx, W, gY, time, 30, 2222, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 50, sizeMin: 2, sizeMax: 3,
        sway: 1.5, swayAmp: B * 0.6, alpha: 0.7
    });
};

// ---------- 24. Лицарський замок ----------
// Нічний замок у глибину: далекий палац на пагорбі з вікнами, мур із вежами
// й конічними дахами, прапори майорять, вартові з списами ходять мурами,
// у дворі — опудала для тренувань, стійки зі зброєю та криниця.

function buildKnightCastle(W, H, groundY, B) {
    const rng = pixelRng(2424);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070a1c"], [0.7, "#18204a"], [1, "#2a2f5a"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.5, 60, rng, B);
    drawPixelDisc(skx, W * 0.82, gY * 0.16, B * 2.6, B / 2, "rgba(255, 250, 220, 0.25)");
    drawPixelDisc(skx, W * 0.82, gY * 0.16, B * 1.8, B / 2, "#fff8dc");

    // Далекий палац на пагорбі (не прокручується разом із муром)
    const palace = makeCanvas(B * 22, Math.round(gY * 0.5));
    const px = palace.getContext("2d");
    const ph = palace.height;
    px.fillStyle = "#141a38";
    for (let c = 0; c < 22; c++) {
        const hill = Math.round(Math.sin((c + 0.5) / 22 * Math.PI) * B * 3);
        px.fillRect(c * B, ph - hill, B, hill);
    }
    const towers = [[3, 7, 1.6], [7, 10, 2], [11, 13, 2.4], [15, 9, 2], [18, 6, 1.6]];
    const windows = [];
    for (const t of towers) {
        const tx = t[0] * B;
        const th = t[1] * B;
        const tw = t[2] * B;
        px.fillStyle = "#1c2448";
        px.fillRect(tx, ph - B * 2.5 - th, tw, th);
        // Конічний дах
        for (let r = 0; r < 4; r++) {
            px.fillRect(tx - B * 0.2 + r * tw * 0.12, ph - B * 2.5 - th - (r + 1) * B * 0.6, tw + B * 0.4 - r * tw * 0.24, B * 0.6);
        }
        for (let w = 0; w < 3; w++) {
            windows.push({ x: tx + tw / 2 - 2, y: ph - B * 2.5 - th + B + w * B * 1.8, phase: rng() * 6 });
        }
    }
    px.fillRect(B * 3, ph - B * 5, B * 17, B * 2.6);

    // Мур із вежами — середній шар
    const stripW = Math.ceil(W * 1.5 / (B * 14)) * B * 14;
    const wallH = Math.round(B * 10);
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    const wallTop = B * 4;
    for (let y = wallTop; y < wallH; y += B * 0.8) {
        for (let x = ((y / (B * 0.8)) % 2) * B * 0.8; x < stripW; x += B * 1.6) {
            wx.fillStyle = rng() < 0.5 ? "#3a3f5a" : "#363a54";
            wx.fillRect(x, y, B * 1.6 - 2, B * 0.8 - 2);
        }
    }
    for (let x = 0; x < stripW; x += B * 1.2) {
        wx.fillStyle = "#3e4462";
        wx.fillRect(x, wallTop - B * 0.8, B * 0.7, B * 0.8);
    }
    const flags = [];
    const torches = [];
    for (let x = B * 2; x < stripW; x += B * 14) {
        // Вежа з конічним дахом
        wx.fillStyle = "#434a6a";
        wx.fillRect(x, B * 1.5, B * 3, wallH - B * 1.5);
        wx.fillStyle = "#8a2a3a";
        for (let r = 0; r < 4; r++) {
            wx.fillRect(x - B * 0.3 + r * B * 0.45, B * 1.5 - (r + 1) * B * 0.5, B * 3.6 - r * B * 0.9, B * 0.5);
        }
        wx.fillStyle = "#1a1c2a";
        wx.fillRect(x + B * 1.2, B * 3, B * 0.6, B * 1.2);
        flags.push({ x: x + B * 1.5, y: B * 1.5 - B * 2.2, color: flags.length % 2 === 0 ? "#3a6aff" : "#ff3355" });
        torches.push({ x: x + B * 6, y: wallTop + B * 2 });
        torches.push({ x: x + B * 10, y: wallTop + B * 2 });
    }
    // Брама з ґратами
    const gateX = B * 8;
    wx.fillStyle = "#1a1420";
    wx.fillRect(gateX, wallH - B * 4, B * 3, B * 4);
    wx.fillStyle = "#5a5a6a";
    for (let k = 0; k < 4; k++) {
        wx.fillRect(gateX + B * 0.2 + k * B * 0.8, wallH - B * 4, B * 0.2, B * 4);
    }

    // Двір — ближній шар
    const yardW = Math.ceil(W * 1.3 / B) * B;
    const yard = makeCanvas(yardW, B * 3);
    const yx = yard.getContext("2d");
    for (let x = B * 2; x < yardW - B * 3; x += B * (6 + Math.floor(rng() * 4))) {
        const kind = Math.floor(rng() * 3);
        if (kind === 0) {
            // Опудало з мішенню
            yx.fillStyle = "#6a4a2a";
            yx.fillRect(x + B * 0.4, B * 0.8, B * 0.2, B * 2.2);
            yx.fillRect(x - B * 0.2, B * 1.2, B * 1.4, B * 0.2);
            yx.fillStyle = "#c8a060";
            yx.fillRect(x + B * 0.1, B * 0.3, B * 0.8, B * 0.7);
            yx.fillStyle = "#ff3355";
            yx.fillRect(x + B * 0.35, B * 0.5, B * 0.3, B * 0.3);
        } else if (kind === 1) {
            // Стійка зі списами
            yx.fillStyle = "#5a3a1a";
            yx.fillRect(x, B * 2.2, B * 2, B * 0.3);
            for (let k = 0; k < 4; k++) {
                yx.fillStyle = "#8a6a4a";
                yx.fillRect(x + B * 0.2 + k * B * 0.5, B * 0.4, 2, B * 2.6);
                yx.fillStyle = "#c8d0e0";
                yx.fillRect(x + B * 0.1 + k * B * 0.5, B * 0.2, B * 0.25, B * 0.3);
            }
        } else {
            // Криниця
            yx.fillStyle = "#4a4e66";
            yx.fillRect(x, B * 1.8, B * 2, B * 1.2);
            yx.fillStyle = "#5a3a1a";
            yx.fillRect(x, B * 0.4, B * 0.2, B * 1.4);
            yx.fillRect(x + B * 1.8, B * 0.4, B * 0.2, B * 1.4);
            yx.fillStyle = "#8a2a3a";
            yx.fillRect(x - B * 0.3, B * 0.2, B * 2.6, B * 0.4);
        }
    }
    return { W: W, H: H, sky: sky, palace: palace, windows: windows, wall: wall, wallTop: wallTop, flags: flags, torches: torches, yard: yard };
}

BackgroundRenderer.renderKnightCastle = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._knightCastle;
    if (!st || st.W !== W || st.H !== H) {
        st = buildKnightCastle(W, H, groundY, B);
        this._knightCastle = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Далекий палац пропливає дуже повільно; вікна мерехтять
    const pW = st.palace.width;
    const loop = W + pW;
    const ppx = W - ((time * speed * 0.03) % loop);
    const ppy = gY - B * 6 - st.palace.height;
    ctx.drawImage(st.palace, Math.round(ppx), ppy);
    for (const w of st.windows) {
        ctx.fillStyle = Math.sin(time * 2 + w.phase) > -0.6 ? "#ffcc55" : "#8a6a30";
        ctx.fillRect(Math.round(ppx + w.x), Math.round(ppy + w.y), 4, 5);
    }

    // Мур: прапори майорять, смолоскипи мерехтять, вартові ходять туди-сюди
    const wW = st.wall.width;
    const off = Math.round(time * speed * 0.25) % wW;
    const top = gY - st.wall.height;
    for (let x = -off; x < W; x += wW) {
        ctx.drawImage(st.wall, x, top);
        for (let i = 0; i < st.flags.length; i++) {
            const f = st.flags[i];
            const fx = x + f.x;
            if (fx < -B * 4 || fx > W + B) {
                continue;
            }
            ctx.fillStyle = "#6a6a7a";
            ctx.fillRect(Math.round(fx), top + f.y, 2, B * 2.2);
            ctx.fillStyle = f.color;
            for (let k = 0; k < 4; k++) {
                const wave = Math.sin(time * 6 - k * 0.9 + i) * B * 0.15;
                ctx.fillRect(Math.round(fx + 2 + k * B * 0.45), Math.round(top + f.y + wave), Math.ceil(B * 0.45), Math.round(B * 0.8));
            }
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(fx + B * 0.6), Math.round(top + f.y + B * 0.25 + Math.sin(time * 6 - 1 + i) * B * 0.15), Math.round(B * 0.3), Math.round(B * 0.3));
        }
        for (let i = 0; i < st.torches.length; i++) {
            const t = st.torches[i];
            const tx = x + t.x;
            if (tx < -B * 2 || tx > W + B * 2) {
                continue;
            }
            const fl = 0.8 + 0.2 * Math.sin(time * 11 + i * 3);
            ctx.globalAlpha = 0.14 * fl;
            drawPixelDisc(ctx, tx, top + t.y - B * 0.3, B * 1.1, B / 4, "#ffaa33");
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(Math.round(tx - 2), Math.round(top + t.y), 4, Math.round(B * 0.8));
            ctx.fillStyle = "#ff7a00";
            ctx.fillRect(Math.round(tx - B * 0.2), Math.round(top + t.y - B * 0.5 * fl), Math.round(B * 0.4), Math.round(B * 0.5 * fl));
        }
        // Вартові на мурі
        for (let i = 0; i < 3; i++) {
            const walk = Math.sin(time * 0.25 + i * 2.1);
            const gx = x + wW * (i + 0.5) / 3 + walk * B * 4;
            if (gx < -B * 2 || gx > W + B * 2) {
                continue;
            }
            const gyTop = top + st.wallTop - B * 2.2;
            const step = Math.sin(time * 8 + i) > 0 ? 1 : 0;
            ctx.fillStyle = "#8a90a8";
            ctx.fillRect(Math.round(gx), Math.round(gyTop), Math.round(B * 0.8), Math.round(B * 0.7));
            ctx.fillStyle = "#3a6aff";
            ctx.fillRect(Math.round(gx), Math.round(gyTop + B * 0.7), Math.round(B * 0.8), Math.round(B * 0.9));
            ctx.fillStyle = "#5a5a6a";
            ctx.fillRect(Math.round(gx + step * B * 0.2), Math.round(gyTop + B * 1.6), Math.round(B * 0.25), Math.round(B * 0.6));
            ctx.fillRect(Math.round(gx + B * 0.55 - step * B * 0.2), Math.round(gyTop + B * 1.6), Math.round(B * 0.25), Math.round(B * 0.6));
            ctx.fillStyle = "#8a6a4a";
            ctx.fillRect(Math.round(gx + (walk > 0 ? B * 0.9 : -B * 0.2)), Math.round(gyTop - B * 1), 2, Math.round(B * 2.8));
            ctx.fillStyle = "#e0e6f0";
            ctx.fillRect(Math.round(gx + (walk > 0 ? B * 0.85 : -B * 0.25)), Math.round(gyTop - B * 1.3), Math.round(B * 0.25), Math.round(B * 0.35));
        }
    }
    drawScrollingStrip(ctx, st.yard, W, gY, time, speed, 0.5);
};
