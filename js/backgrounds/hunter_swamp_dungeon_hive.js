// backgrounds/hunter_swamp_dungeon_hive.js — Ліга 1: джунглі мисливця, туманне болото, підземелля, вулик;
// реєстрація восьми світів Ліги 1 (частина 2)

import { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS } from "./core.js";
import { drawFallingPixels, drawScrollingStrip, drawStripCopies, extraStripW, makeCanvas, makeSky, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { DUSK_THEMES, GROUND_BY_THEME, _fx } from "./effects.js";
import { STORY_BY_THEME, storyOopsFlash, storyPhase } from "./story.js";
import { FINISH_BY_THEME, WEATHER_THEMES, WORLD_NAMES } from "./names_finish_weather.js";

// ---------- Джунглі мисливця ----------

function buildHunterJungle(W, H, groundY, B) {
    const rng = pixelRng(3601);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1a3a1a"], [0.6, "#4a6a2a"], [1, "#7a8a3a"]]);
    const stripW = extraStripW(W, B);
    // Далекі стовбури в серпанку
    const far = makeCanvas(stripW, gY);
    const fx = far.getContext("2d");
    for (let x = 0; x < stripW - B * 2; x += B * (4 + Math.floor(rng() * 4))) {
        const w = B * (1 + Math.floor(rng() * 2));
        fx.fillStyle = "#2a4a24";
        fx.fillRect(x, 0, w, gY);
        fx.fillStyle = "#34582c";
        fx.fillRect(x, 0, B * 0.3, gY);
    }
    // Густе листя, стовбури й ліани
    const midH = gY;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const trunks = [];
    for (let x = B * 2; x < stripW - B * 4; x += B * (9 + Math.floor(rng() * 5))) {
        mx.fillStyle = "#4a3a1a";
        mx.fillRect(x, 0, B * 2, midH);
        mx.fillStyle = "#5a4a24";
        mx.fillRect(x, 0, B * 0.4, midH);
        trunks.push({ x: x + B });
        // Ліани
        mx.fillStyle = "#2a6a1a";
        for (let k = 0; k < 3; k++) {
            const lx = x + B * (3 + k * 2);
            const len = midH * (0.2 + rng() * 0.3);
            mx.fillRect(lx, 0, B * 0.25, len);
            mx.fillRect(lx - B * 0.3, len, B * 0.8, B * 0.5);
        }
    }
    for (let i = 0; i < stripW / B * 3; i++) {
        const x = Math.floor(rng() * stripW / B) * B;
        const y = Math.floor(rng() * midH * 0.35 / B) * B;
        mx.fillStyle = i % 3 === 0 ? "#1f5a1a" : i % 3 === 1 ? "#2a7a22" : "#3a8a2a";
        mx.fillRect(x, y, B * 2, B);
    }
    // Папороті біля землі
    const near = makeCanvas(stripW, B * 3);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B * 0.5) {
        const h = B * (0.8 + rng() * 2);
        nx.fillStyle = rng() < 0.5 ? "#2a7a22" : "#3a9a2a";
        nx.fillRect(x, B * 3 - h, B * 0.5, h);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, trunks: trunks, near: near };
}

BackgroundRenderer.renderHunterJungle = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._hunterJungle;
    if (!st || st.W !== W || st.H !== H) {
        st = buildHunterJungle(W, H, groundY, B);
        this._hunterJungle = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.08);
    ctx.fillStyle = "rgba(200, 230, 150, 0.1)";
    ctx.fillRect(0, gY * 0.5, W, gY * 0.5);
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    drawStripCopies(ctx, st.mid, W, gY - st.mid.height, time, speed, 0.25, function (x) {
        // Три червоні точки прицілу ковзають по стовбурах
        if (s1 <= 0) {
            return;
        }
        for (let i = 0; i < st.trunks.length; i += 2) {
            const tx = x + st.trunks[i].x;
            if (tx < -B * 3 || tx > W + B * 3) {
                continue;
            }
            const ty = gY * (0.35 + 0.25 * Math.sin(time * 0.7 + i));
            ctx.fillStyle = "rgba(255, 30, 30, " + (0.9 * s1).toFixed(2) + ")";
            for (let k = 0; k < 3; k++) {
                const a = time * 1.5 + k * Math.PI * 2 / 3;
                ctx.fillRect(Math.round(tx + Math.cos(a) * B * 0.5), Math.round(ty + Math.sin(a) * B * 0.5), 3, 3);
            }
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Туманне болото ----------

function buildSoggySwamp(W, H, groundY, B) {
    const rng = pixelRng(3701);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1a2420"], [1, "#3a4a3a"]]);
    const stripW = extraStripW(W, B);
    // Далекі сухі дерева
    const farH = Math.round(gY * 0.7);
    const far = makeCanvas(stripW, farH);
    const fx = far.getContext("2d");
    fx.fillStyle = "#26302a";
    for (let x = B * 2; x < stripW - B * 4; x += B * (6 + Math.floor(rng() * 5))) {
        const h = farH * (0.5 + rng() * 0.4);
        fx.fillRect(x, farH - h, B * 0.8, h);
        fx.fillRect(x - B * 1.5, farH - h + B * 2, B * 1.5, B * 0.4);
        fx.fillRect(x + B * 0.8, farH - h + B * 3, B * 2, B * 0.4);
        fx.fillRect(x + B * 2.4, farH - h + B * 2, B * 0.4, B);
    }
    // Вода з лататтям, очерет і хатинка на палях
    const midH = B * 9;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    mx.fillStyle = "#1e3a34";
    mx.fillRect(0, midH - B * 2, stripW, B * 2);
    mx.fillStyle = "#2a4a40";
    mx.fillRect(0, midH - B * 2, stripW, B * 0.2);
    for (let x = B; x < stripW - B * 2; x += B * (3 + Math.floor(rng() * 4))) {
        mx.fillStyle = "#3a8a3a";
        mx.fillRect(x, midH - B * 1.8, B * 1.2, B * 0.3);
        if (rng() < 0.3) {
            mx.fillStyle = "#ff9ad8";
            mx.fillRect(x + B * 0.4, midH - B * 2.1, B * 0.4, B * 0.3);
        }
    }
    for (let x = 0; x < stripW; x += B * (1 + Math.floor(rng() * 3))) {
        mx.fillStyle = "#4a6a2a";
        mx.fillRect(x, midH - B * (2 + rng() * 2.5), B * 0.2, B * 3);
        mx.fillStyle = "#6a4a2a";
        mx.fillRect(x - B * 0.05, midH - B * (2.8 + rng() * 2), B * 0.3, B * 0.6);
    }
    const huts = [];
    for (let x = B * 10; x < stripW - B * 8; x += B * 30) {
        mx.fillStyle = "#4a3a2a";
        mx.fillRect(x, midH - B * 5, B * 0.4, B * 3.4);
        mx.fillRect(x + B * 4.6, midH - B * 5, B * 0.4, B * 3.4);
        mx.fillStyle = "#6a5a3a";
        mx.fillRect(x - B * 0.4, midH - B * 8, B * 5.8, B * 3);
        mx.fillStyle = "#3a5a2a";
        mx.fillRect(x - B, midH - B * 9, B * 7, B);
        mx.fillStyle = "#2a1a10";
        mx.fillRect(x + B * 1.8, midH - B * 7, B * 1.4, B * 1.2);
        huts.push({ x: x + B * 1.8, y: midH - B * 7, w: B * 1.4, h: B * 1.2 });
    }
    const near = makeCanvas(stripW, B * 1.5);
    const nx = near.getContext("2d");
    nx.fillStyle = "#2a3a24";
    nx.fillRect(0, B * 0.7, stripW, B * 0.8);
    for (let x = 0; x < stripW; x += B * 0.5) {
        nx.fillStyle = rng() < 0.5 ? "#3a5a2a" : "#4a6a30";
        nx.fillRect(x, B * 1.5 - B * (0.5 + rng()), B * 0.25, B * 1.5);
    }
    // М'яка смуга туману: прозора зверху й знизу, розтягується на ширину екрана
    const fog = makeCanvas(1, 64);
    const fgx = fog.getContext("2d");
    const fg = fgx.createLinearGradient(0, 0, 0, 64);
    fg.addColorStop(0, "rgba(200, 220, 200, 0)");
    fg.addColorStop(0.5, "rgba(200, 220, 200, 1)");
    fg.addColorStop(1, "rgba(200, 220, 200, 0)");
    fgx.fillStyle = fg;
    fgx.fillRect(0, 0, 1, 64);
    return { W: W, H: H, sky: sky, far: far, mid: mid, huts: huts, near: near, fog: fog };
}

BackgroundRenderer.renderSoggySwamp = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._soggySwamp;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSoggySwamp(W, H, groundY, B);
        this._soggySwamp = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY - B * 2, time, speed, 0.08);
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    // Туман пливе смугами; далі по рівню — густіший
    for (let i = 0; i < 3; i++) {
        const y = gY * (0.42 + i * 0.16) + Math.sin(time * 0.3 + i) * B;
        ctx.globalAlpha = 0.12 + 0.12 * s1;
        ctx.drawImage(st.fog, 0, Math.round(y), W, B * 4);
    }
    ctx.globalAlpha = 1;
    const midTop = gY - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.25, function (x) {
        for (let i = 0; i < st.huts.length; i++) {
            const hut = st.huts[i];
            const hx = x + hut.x;
            if (hx < -B * 6 || hx > W + B * 6) {
                continue;
            }
            const fl = 0.7 + 0.3 * Math.sin(time * 7 + i) * Math.sin(time * 3.3);
            ctx.fillStyle = "rgba(150, 255, 90, " + (0.6 * fl).toFixed(3) + ")";
            ctx.fillRect(Math.round(hx), Math.round(midTop + hut.y), Math.round(hut.w), Math.round(hut.h));
            // Дим із труби
            for (let k = 0; k < 3; k++) {
                const t = (time * 0.3 + k / 3) % 1;
                ctx.fillStyle = "rgba(160, 200, 160, " + (0.3 * (1 - t)).toFixed(3) + ")";
                ctx.fillRect(Math.round(hx + B * 3 + Math.sin(t * 4) * B), Math.round(midTop + hut.y - B * 3 - t * B * 5), Math.round(B * (0.6 + t)), Math.round(B * (0.6 + t)));
            }
        }
        // Відблиски на воді
        ctx.fillStyle = "rgba(180, 230, 210, 0.25)";
        for (let k = 0; k < 8; k++) {
            const wx = x + ((k * 97 + time * 20) % st.mid.width);
            ctx.fillRect(Math.round(wx), Math.round(midTop + st.mid.height - B * 1.2 + (k % 3) * B * 0.3), B, 2);
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Підземелля ----------

function buildDungeonDepths(W, H, groundY, B) {
    const rng = pixelRng(3801);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0a10"], [1, "#1a1820"]]);
    const stripW = extraStripW(W, B);
    // Цегляна стіна з арками
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    for (let y = 0; y < gY; y += B) {
        const shift = (y / B) % 2 === 0 ? 0 : B;
        for (let x = -B; x < stripW; x += B * 2) {
            const v = rng();
            wx.fillStyle = v < 0.4 ? "#2a2830" : v < 0.8 ? "#302e38" : "#26242c";
            wx.fillRect(x + shift, y, B * 2 - 1, B - 1);
        }
    }
    for (let x = B * 4; x < stripW - B * 8; x += B * 16) {
        const aw = B * 6;
        const ah = gY * 0.5;
        wx.fillStyle = "#0c0a10";
        wx.fillRect(x, gY - ah, aw, ah);
        for (let k = 0; k < 3; k++) {
            wx.fillRect(x + B * (k + 1) * 0.5, gY - ah - B * (3 - k), aw - B * (k + 1), B);
        }
        // Грати
        wx.fillStyle = "#4a4a54";
        for (let k = 0; k < 5; k++) {
            wx.fillRect(x + B * 0.5 + k * B * 1.2, gY - ah - B, B * 0.25, ah + B);
        }
        wx.fillRect(x, gY - ah * 0.6, aw, B * 0.25);
    }
    // Колони зі смолоскипами й ланцюгами
    const midH = gY;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const torches = [];
    for (let x = B * 2; x < stripW - B * 4; x += B * 12) {
        mx.fillStyle = "#3a3842";
        mx.fillRect(x, 0, B * 2, midH);
        mx.fillStyle = "#46444e";
        mx.fillRect(x, 0, B * 0.4, midH);
        mx.fillStyle = "#6a4a2a";
        mx.fillRect(x + B * 2, midH * 0.45, B * 0.8, B * 0.3);
        mx.fillRect(x + B * 2.6, midH * 0.45 - B * 0.8, B * 0.3, B * 1.1);
        torches.push({ x: x + B * 2.75, y: midH * 0.45 - B * 0.9 });
        mx.fillStyle = "#5a5a64";
        for (let k = 0; k < 6; k++) {
            mx.fillRect(x + B * 6, k * B * 0.8, B * 0.3, B * 0.5);
        }
    }
    // Підлога з бочками й павутинням
    const near = makeCanvas(stripW, B * 2.5);
    const nx = near.getContext("2d");
    nx.fillStyle = "#26242c";
    nx.fillRect(0, B * 2, stripW, B * 0.5);
    for (let x = B * 5; x < stripW - B * 3; x += B * (14 + Math.floor(rng() * 6))) {
        nx.fillStyle = "#6a4a2a";
        nx.fillRect(x, B * 0.6, B * 1.6, B * 1.6);
        nx.fillStyle = "#4a4a54";
        nx.fillRect(x, B * 0.9, B * 1.6, B * 0.2);
        nx.fillRect(x, B * 1.7, B * 1.6, B * 0.2);
    }
    return { W: W, H: H, sky: sky, wall: wall, mid: mid, torches: torches, near: near };
}

BackgroundRenderer.renderDungeonDepths = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dungeonDepths;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDungeonDepths(W, H, groundY, B);
        this._dungeonDepths = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.wall, W, gY, time, speed, 0.1);
    drawStripCopies(ctx, st.mid, W, gY - st.mid.height, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.torches.length; i++) {
            const t = st.torches[i];
            const tx = x + t.x;
            if (tx < -B * 5 || tx > W + B * 5) {
                continue;
            }
            const ty = gY - st.mid.height + t.y;
            const fl = 0.8 + 0.2 * Math.sin(time * 13 + i) * Math.sin(time * 7.1 + i);
            const glow = ctx.createRadialGradient(tx, ty, 2, tx, ty, B * 4);
            glow.addColorStop(0, "rgba(255, 170, 60, " + (0.35 * fl).toFixed(3) + ")");
            glow.addColorStop(1, "rgba(255, 170, 60, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(tx - B * 4, ty - B * 4, B * 8, B * 8);
            ctx.fillStyle = "#ff8a1a";
            ctx.fillRect(Math.round(tx - B * 0.35), Math.round(ty - B * 0.9 * fl), Math.round(B * 0.7), Math.round(B * 0.9 * fl));
            ctx.fillStyle = "#ffe14d";
            ctx.fillRect(Math.round(tx - B * 0.15), Math.round(ty - B * 0.5 * fl), Math.round(B * 0.3), Math.round(B * 0.5 * fl));
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Вулик ----------

function buildAlienHive(W, H, groundY, B) {
    const rng = pixelRng(3901);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#050a0a"], [1, "#0e1e1c"]]);
    const stripW = extraStripW(W, B);
    // Органічні ребра стін
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    for (let x = 0; x < stripW; x += B * 3) {
        wx.fillStyle = "#12201e";
        wx.beginPath();
        wx.moveTo(x, gY);
        wx.quadraticCurveTo(x + B * 1.5, gY * 0.3, x + B * 0.5, 0);
        wx.lineTo(x + B * 1.6, 0);
        wx.quadraticCurveTo(x + B * 2.6, gY * 0.3, x + B * 1.4, gY);
        wx.closePath();
        wx.fill();
        wx.fillStyle = "#1c2e2a";
        wx.fillRect(x + B * 0.9, gY * (0.2 + rng() * 0.5), B * 0.3, B * 3);
    }
    // Арки з ребер і яйця-капсули
    const midH = gY;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    for (let x = B * 2; x < stripW - B * 10; x += B * 18) {
        mx.strokeStyle = "#20342e";
        mx.lineWidth = B * 1.2;
        mx.beginPath();
        mx.arc(x + B * 5, midH, B * 5.5, Math.PI, Math.PI * 2);
        mx.stroke();
        mx.strokeStyle = "#2a443c";
        mx.lineWidth = B * 0.3;
        mx.stroke();
    }
    const eggs = [];
    for (let x = B * 3; x < stripW - B * 2; x += B * (5 + Math.floor(rng() * 4))) {
        const ex = x;
        const ey = midH - B * 0.2;
        mx.fillStyle = "#3a4a3a";
        mx.fillRect(ex - B * 0.8, ey - B * 2, B * 1.6, B * 2);
        mx.fillRect(ex - B * 0.6, ey - B * 2.4, B * 1.2, B * 0.4);
        mx.fillStyle = "#4a5a48";
        mx.fillRect(ex - B * 0.8, ey - B * 2, B * 0.3, B * 2);
        eggs.push({ x: ex, y: ey - B * 2.2 });
    }
    // Слиз на підлозі
    const near = makeCanvas(stripW, B);
    const nx = near.getContext("2d");
    nx.fillStyle = "#0e1a18";
    nx.fillRect(0, B * 0.5, stripW, B * 0.5);
    for (let x = B * 2; x < stripW - B * 3; x += B * (4 + Math.floor(rng() * 4))) {
        nx.fillStyle = "rgba(120, 255, 190, 0.35)";
        nx.fillRect(x, B * 0.4, B * (1 + rng() * 2), B * 0.25);
    }
    return { W: W, H: H, sky: sky, wall: wall, mid: mid, eggs: eggs, near: near };
}

BackgroundRenderer.renderAlienHive = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._alienHive;
    if (!st || st.W !== W || st.H !== H) {
        st = buildAlienHive(W, H, groundY, B);
        this._alienHive = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.wall, W, gY, time, speed, 0.1);
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    drawStripCopies(ctx, st.mid, W, gY - st.mid.height, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.eggs.length; i++) {
            const e = st.eggs[i];
            const ex = x + e.x;
            if (ex < -B * 2 || ex > W + B * 2) {
                continue;
            }
            // Яйця світяться зсередини; далі по рівню — «пелюстки» розкриваються
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 1.3);
            const ey = gY - st.mid.height + e.y;
            ctx.fillStyle = "rgba(120, 255, 190, " + (0.25 + 0.35 * pulse).toFixed(3) + ")";
            ctx.fillRect(Math.round(ex - B * 0.4), Math.round(ey), Math.round(B * 0.8), Math.round(B * 0.4));
            if (s1 > 0) {
                const open = s1 * (0.5 + 0.5 * pulse) * B * 0.5;
                ctx.fillStyle = "#4a5a48";
                ctx.fillRect(Math.round(ex - B * 0.7 - open), Math.round(ey - B * 0.3), Math.round(B * 0.5), Math.round(B * 0.3));
                ctx.fillRect(Math.round(ex + B * 0.2 + open), Math.round(ey - B * 0.3), Math.round(B * 0.5), Math.round(B * 0.3));
            }
        }
    });
    // Краплі слизу зі стелі
    for (let i = 0; i < 6; i++) {
        const k = ((time * 0.35 + i * 0.17) % 1);
        const x = ((i * 0.19 + 0.05) * W - time * speed * 0.1) % W;
        const xx = x < 0 ? x + W : x;
        ctx.fillStyle = "rgba(120, 255, 190, " + (0.7 * (1 - k)).toFixed(2) + ")";
        ctx.fillRect(Math.round(xx), Math.round(k * gY), 3, Math.round(B * 0.4 + k * B * 0.4));
    }
    // Туман біля підлоги
    ctx.fillStyle = "rgba(90, 160, 140, 0.08)";
    ctx.fillRect(0, gY - B * 4, W, B * 4);
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// Реєстрація нових світів: рендерери, буфери, пасхалки, земля, фініші, назви, погода, сюжети
Object.assign(THEME_RENDERERS, {
    pumpkin_pastures: "renderPumpkinPastures",
    creeper_woods: "renderCreeperWoods",
    redstone_mines: "renderRedstoneMines",
    alien_freighter: "renderAlienFreighter",
    hunter_jungle: "renderHunterJungle",
    soggy_swamp: "renderSoggySwamp",
    dungeon_depths: "renderDungeonDepths",
    alien_hive: "renderAlienHive"
});
SCENE_CACHE_KEYS.push("_pumpkinPastures", "_creeperWoods", "_redstoneMines", "_alienFreighter",
    "_hunterJungle", "_soggySwamp", "_dungeonDepths", "_alienHive");
DUSK_THEMES.add("pumpkin_pastures");
Object.assign(GROUND_BY_THEME, {
    pumpkin_pastures: "grass", creeper_woods: "grass", redstone_mines: "stone", hunter_jungle: "grass",
    soggy_swamp: "grass", dungeon_depths: "stone", alien_hive: "alien"
});
Object.assign(FINISH_BY_THEME, {
    redstone_mines: "gate", dungeon_depths: "gate", alien_freighter: "portal", alien_hive: "portal"
});
Object.assign(WORLD_NAMES, {
    pumpkin_pastures: "Гарбузові пасовища", creeper_woods: "Ліс кріперів", redstone_mines: "Червоні шахти",
    alien_freighter: "Космічний вантажник", hunter_jungle: "Джунглі мисливця", soggy_swamp: "Туманне болото",
    dungeon_depths: "Підземелля", alien_hive: "Вулик"
});
["pumpkin_pastures", "creeper_woods", "hunter_jungle", "soggy_swamp"].forEach(function (t) { WEATHER_THEMES.add(t); });

Object.assign(STORY_BY_THEME, {
    // Гарбузи засвічуються (у сцені) — місяць урожаю більшає, летять світлячки
    pumpkin_pastures(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s2 > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(24 * s2), 3211, {
                color: "#ffe680", dir: -1, speedMin: 6, speedMax: 14, sizeMin: 2, sizeMax: 3,
                sway: 1.4, swayAmp: B, alpha: 0.5 + 0.4 * Math.sin(time * 3)
            });
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 150, 40", 0.18);
    },
    // Кріпери визирають частіше (у сцені) — ніч, світні гриби й світлячки; помилка — білий спалах
    creeper_woods(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s2 > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * s2), 3311, {
                color: "#c8ff5a", dir: -1, speedMin: 4, speedMax: 10, sizeMin: 2, sizeMax: 3,
                sway: 1.2, swayAmp: B, alpha: 0.6
            });
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.3);
    },
    // Вагонетка з рудою проїжджає — руда й лампи розгоряються червоним (у сцені)
    redstone_mines(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && p < 0.9) {
            const k = Math.min(1, (p - 0.3) / 0.35);
            const x = -B * 4 + k * (W + B * 8);
            const y = gY - B * 1.6;
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#6a6a74";
            ctx.fillRect(Math.round(x), Math.round(y - B * 1.6), Math.round(B * 3), Math.round(B * 1.6));
            ctx.fillStyle = "#4a4a54";
            ctx.fillRect(Math.round(x), Math.round(y - B * 1.6), Math.round(B * 3), Math.round(B * 0.3));
            ctx.fillStyle = "#ff3a2a";
            ctx.fillRect(Math.round(x + B * 0.4), Math.round(y - B * 2.1), Math.round(B * 0.8), Math.round(B * 0.6));
            ctx.fillRect(Math.round(x + B * 1.6), Math.round(y - B * 2), Math.round(B * 0.9), Math.round(B * 0.5));
            ctx.fillStyle = "#2a2a30";
            ctx.fillRect(Math.round(x + B * 0.3), Math.round(y), Math.round(B * 0.6), Math.round(B * 0.6));
            ctx.fillRect(Math.round(x + B * 2.1), Math.round(y), Math.round(B * 0.6), Math.round(B * 0.6));
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 40, 30", 0.2);
    },
    // Тривога: обертається червоне світло — у вентиляції проповзає силует
    alien_freighter(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const a = 0.5 + 0.5 * Math.sin(time * 5);
            ctx.fillStyle = "rgba(255, 30, 30, " + (0.12 * s1 * a).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0 && p < 0.97) {
            // Труба-вентиляція під стелею і тінь, що проповзає всередині
            const vy = Math.round(gY * 0.12);
            ctx.fillStyle = "rgba(40, 50, 58, " + s2.toFixed(3) + ")";
            ctx.fillRect(0, vy, W, B * 1.8);
            ctx.fillStyle = "rgba(60, 72, 82, " + s2.toFixed(3) + ")";
            for (let x = 0; x < W; x += B * 2) {
                ctx.fillRect(x, vy, B * 0.2, B * 1.8);
            }
            const k = ((time * 0.12) % 1.4) - 0.2;
            const sx = W * (1 - k);
            ctx.fillStyle = "rgba(5, 8, 10, " + (0.9 * s2).toFixed(3) + ")";
            ctx.fillRect(Math.round(sx), Math.round(vy + B * 0.4), Math.round(B * 3), Math.round(B));
            ctx.fillRect(Math.round(sx - B * 0.8), Math.round(vy + B * 0.3), Math.round(B * 1.2), Math.round(B * 0.8));
            for (let t = 0; t < 5; t++) {
                const tx = sx + B * 3 + t * B * 0.8;
                const ty = vy + B * 0.8 + Math.sin(time * 6 + t) * B * 0.3;
                ctx.fillRect(Math.round(tx), Math.round(ty), Math.round(B * 0.8), Math.round(B * 0.25));
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 20, 20", 0.25);
    },
    // Точки прицілу (у сцені) — теплове бачення й мерехтливий «невидимий» мисливець
    hunter_jungle(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const heat = Math.max(0, Math.sin(time * 0.5)) * s1;
            if (heat > 0.01) {
                ctx.fillStyle = "rgba(255, 120, 0, " + (0.12 * heat).toFixed(3) + ")";
                ctx.fillRect(0, 0, W, gY * 0.5);
                ctx.fillStyle = "rgba(0, 60, 255, " + (0.12 * heat).toFixed(3) + ")";
                ctx.fillRect(0, gY * 0.5, W, gY * 0.5);
            }
        }
        if (s2 > 0 && p < 0.97) {
            // «Невидимка»: лише контур, що тремтить, як марево
            const k = ((time * 0.07) % 1.3) - 0.15;
            const x = W * (1 - k);
            const y = gY - B * 0.5;
            ctx.strokeStyle = "rgba(220, 255, 220, " + (0.35 * s2).toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const j = function () { return (Math.random() - 0.5) * 2; };
            ctx.moveTo(x + j(), y);
            ctx.lineTo(x + B * 0.6 + j(), y - B * 3);
            ctx.lineTo(x + B * 0.2 + j(), y - B * 5.5);
            ctx.lineTo(x + B * 1.2 + j(), y - B * 6.4);
            ctx.lineTo(x + B * 2.2 + j(), y - B * 5.5);
            ctx.lineTo(x + B * 1.8 + j(), y - B * 3);
            ctx.lineTo(x + B * 2.4 + j(), y);
            ctx.stroke();
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 90, 0", 0.2);
    },
    // Туман густішає й стрибають жабки — блукаючі вогники
    soggy_swamp(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 3; i++) {
                const ph = ((time * 0.4 + i * 0.33) % 1);
                const x = W * (0.2 + i * 0.3) - time * B * 0.5 % W;
                const xx = ((x % W) + W) % W;
                const y = gY - B * 1.5 - Math.sin(ph * Math.PI) * B * 3;
                ctx.globalAlpha = s1;
                ctx.fillStyle = "#4cc24a";
                ctx.fillRect(Math.round(xx), Math.round(y), Math.round(B * 0.8), Math.round(B * 0.6));
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(Math.round(xx + B * 0.1), Math.round(y - B * 0.2), Math.round(B * 0.2), Math.round(B * 0.2));
                ctx.fillRect(Math.round(xx + B * 0.5), Math.round(y - B * 0.2), Math.round(B * 0.2), Math.round(B * 0.2));
                ctx.globalAlpha = 1;
            }
        }
        if (s2 > 0) {
            for (let i = 0; i < 6; i++) {
                const x = W * ((i * 0.17 + 0.1 + Math.sin(time * 0.3 + i) * 0.05) % 1);
                const y = gY * (0.5 + 0.3 * Math.sin(time * 0.7 + i * 2));
                const g = ctx.createRadialGradient(x, y, 1, x, y, B * 1.5);
                g.addColorStop(0, "rgba(160, 230, 255, " + (0.8 * s2).toFixed(3) + ")");
                g.addColorStop(1, "rgba(160, 230, 255, 0)");
                ctx.fillStyle = g;
                ctx.fillRect(x - B * 1.5, y - B * 1.5, B * 3, B * 3);
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 255, 120", 0.15);
    },
    // Кажани — далека брама піднімається, за нею сяє скарб
    dungeon_depths(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 5; i++) {
                const k = ((time * 0.15 + i * 0.21) % 1.2) - 0.1;
                const x = W * (1 - k);
                const y = gY * (0.2 + 0.1 * Math.sin(time * 1.5 + i * 2)) + i * B;
                const wing = Math.sin(time * 14 + i) > 0 ? -B * 0.5 : B * 0.2;
                ctx.globalAlpha = s1;
                ctx.fillStyle = "#0a0810";
                ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 0.5), Math.round(B * 0.4));
                ctx.fillRect(Math.round(x - B * 0.6), Math.round(y + wing), Math.round(B * 0.6), Math.round(B * 0.2));
                ctx.fillRect(Math.round(x + B * 0.5), Math.round(y + wing), Math.round(B * 0.6), Math.round(B * 0.2));
                ctx.globalAlpha = 1;
            }
        }
        if (s2 > 0) {
            const gx = W * 0.62;
            const gw = B * 8;
            const gh = gY * 0.35;
            const top = gY * 0.3;
            const rise = s2 * gh * 0.8;
            const g = ctx.createRadialGradient(gx + gw / 2, top + gh, 2, gx + gw / 2, top + gh, gh);
            g.addColorStop(0, "rgba(255, 210, 80, " + (0.5 * s2).toFixed(3) + ")");
            g.addColorStop(1, "rgba(255, 210, 80, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(gx - gh, top - gh * 0.3, gw + gh * 2, gh * 1.6);
            ctx.fillStyle = "#4a4a54";
            for (let k = 0; k < 6; k++) {
                ctx.fillRect(Math.round(gx + k * gw / 5), Math.round(top - rise), Math.round(B * 0.3), Math.round(gh));
            }
            ctx.fillRect(Math.round(gx), Math.round(top - rise + gh * 0.5), Math.round(gw), Math.round(B * 0.3));
        }
        storyOopsFlash(ctx, W, gY, oops, "180, 160, 140", 0.15);
    },
    // Яйця розкриваються (у сцені) — позаду здіймається тінь королеви вулика
    alien_hive(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s2 > 0) {
            const rise = smoothStep((p - 0.63) / 0.3);
            const cx = W * 0.7;
            const baseY = gY + B * 2;
            const hgt = gY * 0.75 * rise;
            ctx.fillStyle = "rgba(4, 10, 10, " + (0.85 * s2).toFixed(3) + ")";
            // Видовжена голова-гребінь і плечі
            ctx.beginPath();
            ctx.moveTo(cx - B * 8, baseY);
            ctx.lineTo(cx - B * 5, baseY - hgt * 0.55);
            ctx.lineTo(cx - B * 2, baseY - hgt * 0.8);
            ctx.lineTo(cx + B * 9, baseY - hgt);
            ctx.lineTo(cx + B * 3, baseY - hgt * 0.7);
            ctx.lineTo(cx + B * 5, baseY - hgt * 0.5);
            ctx.lineTo(cx + B * 8, baseY);
            ctx.closePath();
            ctx.fill();
            if (rise > 0.3) {
                const eye = 0.6 + 0.4 * Math.sin(time * 3);
                ctx.fillStyle = "rgba(120, 255, 190, " + (eye * rise).toFixed(3) + ")";
                ctx.fillRect(Math.round(cx - B * 1.5), Math.round(baseY - hgt * 0.72), Math.round(B * 0.8), Math.round(B * 0.3));
                ctx.fillRect(Math.round(cx + B * 0.5), Math.round(baseY - hgt * 0.74), Math.round(B * 0.8), Math.round(B * 0.3));
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 255, 190", 0.18);
    }
});
