// backgrounds/desert_forge_colony_ship_obsidian.js — Ліга 2: пустельний храм, вогняна кузня,
// колонія на планеті, корабель мисливця, обсидіанова вершина, королева вулика

import { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS } from "./core.js";
import { drawBlockTerrain, drawPixelDisc, drawScrollingStrip, drawStarsInto, drawStripCopies, extraStripW, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { DUSK_THEMES, GROUND_BY_THEME, _fx } from "./effects.js";
import { STORY_BY_THEME, storyOopsFlash, storyPhase } from "./story.js";
import { FINISH_BY_THEME, WEATHER_THEMES, WORLD_NAMES } from "./names_finish_weather.js";

// ============================================================
// Нові світи Ліги 2: Пустельний храм, Вогняна кузня, Колонія на планеті,
// Трофейний корабель мисливця, Обсидіанова вершина, Королева вулика
// ============================================================

// ---------- Пустельний храм ----------

function buildDesertTemple(W, H, groundY, B) {
    const rng = pixelRng(4001);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#ffb85a"], [0.6, "#ffd88a"], [1, "#ffe8b0"]]);
    const stripW = extraStripW(W, B);
    // Далекі дюни й піраміди
    const farCols = stripW / B;
    const farH = periodicHeights(farCols, 4, [{ amp: 2, k: 3, ph: 0.2 }, { amp: 1, k: 7, ph: 1.4 }]);
    const far = makeCanvas(stripW, B * 12);
    const fx = far.getContext("2d");
    for (let x = B * 6; x < stripW - B * 12; x += B * 26) {
        for (let k = 0; k < 8; k++) {
            fx.fillStyle = k % 2 === 0 ? "#d8a060" : "#c89050";
            fx.fillRect(x + k * B * 0.75, far.height - (8 - k) * B * 1.3, (16 - k * 1.5) * B * 0.75, B * 1.3);
        }
    }
    drawBlockTerrain(fx, farH, B, far.height, { top: "#e8b870", body: "#d8a860", body2: "#d0a058" }, rng);
    // Храм із колонами й статуями
    const midH = B * 11;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const eyes = [];
    for (let x = B * 2; x < stripW - B * 20; x += B * 32) {
        mx.fillStyle = "#c89a5a";
        mx.fillRect(x, midH - B * 9, B * 18, B * 9);
        mx.fillStyle = "#b08040";
        mx.fillRect(x - B, midH - B * 10, B * 20, B);
        mx.fillStyle = "#d8aa6a";
        for (let k = 0; k < 5; k++) {
            mx.fillRect(x + B + k * B * 3.8, midH - B * 9, B * 1.4, B * 9);
        }
        // Вхід і око над ним
        mx.fillStyle = "#3a2410";
        mx.fillRect(x + B * 7, midH - B * 5, B * 4, B * 5);
        mx.fillStyle = "#1a4a8a";
        mx.fillRect(x + B * 8, midH - B * 8, B * 2, B);
        eyes.push({ x: x + B * 9, y: midH - B * 7.5, door: { x: x + B * 7, y: midH - B * 5, w: B * 4, h: B * 5 } });
        // Статуя-кіт збоку
        const sx = x + B * 22;
        mx.fillStyle = "#b08040";
        mx.fillRect(sx, midH - B * 5, B * 2, B * 5);
        mx.fillRect(sx + B * 0.2, midH - B * 6.5, B * 1.6, B * 1.5);
        mx.fillRect(sx + B * 0.2, midH - B * 7, B * 0.4, B * 0.6);
        mx.fillRect(sx + B * 1.4, midH - B * 7, B * 0.4, B * 0.6);
    }
    const near = makeCanvas(stripW, B * 1.5);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B / 2) {
        nx.fillStyle = rng() < 0.5 ? "#e8c07a" : "#f0cc88";
        nx.fillRect(x, B * 1.5 - B * (0.3 + rng() * 0.5), B / 2, B * 1.5);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, eyes: eyes, near: near };
}

BackgroundRenderer.renderDesertTemple = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._desertTemple;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDesertTemple(W, H, groundY, B);
        this._desertTemple = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawPixelDisc(ctx, W * 0.25, gY * 0.22, B * 5, B, "rgba(255, 250, 220, 0.35)");
    drawPixelDisc(ctx, W * 0.25, gY * 0.22, B * 3, B, "#fff8e0");
    drawScrollingStrip(ctx, st.far, W, gY - B * 2, time, speed, 0.06);
    const s2 = storyPhase(_fx.progress || 0, 0.63);
    const midTop = gY - B * 0.8 - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.25, function (x) {
        for (const e of st.eyes) {
            const ex = x + e.x;
            if (ex < -B * 20 || ex > W + B * 20) {
                continue;
            }
            // Око храму світиться, до кінця рівня відчиняється брама зі скарбом
            const glow = 0.5 + 0.5 * Math.sin(time * 2);
            ctx.fillStyle = "rgba(90, 200, 255, " + (0.4 + 0.4 * glow).toFixed(3) + ")";
            ctx.fillRect(Math.round(ex - B), Math.round(midTop + e.y - B * 0.5), B * 2, B);
            if (s2 > 0) {
                ctx.fillStyle = "rgba(255, 210, 80, " + (0.8 * s2).toFixed(3) + ")";
                ctx.fillRect(Math.round(x + e.door.x), Math.round(midTop + e.door.y), Math.round(e.door.w), Math.round(e.door.h));
            }
        }
    });
    // Спекотне марево
    ctx.fillStyle = "rgba(255, 240, 200, 0.06)";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(0, Math.round(gY - B * (2 + i * 1.3) + Math.sin(time * 3 + i) * 2), W, 2);
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Вогняна кузня ----------

function buildFieryForge(W, H, groundY, B) {
    const rng = pixelRng(4101);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#140808"], [1, "#3a1408"]]);
    const stripW = extraStripW(W, B);
    // Кам'яна стіна з лавовими жилами
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    for (let y = 0; y < gY; y += B) {
        for (let x = 0; x < stripW; x += B) {
            const v = rng();
            wx.fillStyle = v < 0.5 ? "#2a1a1a" : "#321e1c";
            wx.fillRect(x, y, B, B);
        }
    }
    const veins = [];
    for (let x = B * 3; x < stripW; x += B * (8 + Math.floor(rng() * 6))) {
        let y = 0;
        let cx = x;
        const pts = [];
        while (y < gY - B) {
            pts.push({ x: cx, y: y });
            y += B;
            cx += Math.round((rng() - 0.5) * 2) * B;
        }
        veins.push(pts);
    }
    // Ковадла й молоти
    const midH = B * 6;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const anvils = [];
    for (let x = B * 4; x < stripW - B * 8; x += B * 16) {
        mx.fillStyle = "#3a3a44";
        mx.fillRect(x, midH - B * 1.2, B * 3, B * 1.2);
        mx.fillRect(x + B * 0.6, midH - B * 2.4, B * 1.8, B * 1.2);
        mx.fillRect(x - B * 0.6, midH - B * 3.2, B * 4.8, B * 0.8);
        mx.fillStyle = "#5a5a64";
        mx.fillRect(x - B * 0.6, midH - B * 3.2, B * 4.8, B * 0.2);
        anvils.push({ x: x + B * 1.5, y: midH - B * 3.2 });
    }
    // Канал лави біля землі
    const near = makeCanvas(stripW, B);
    const nx = near.getContext("2d");
    nx.fillStyle = "#2a1410";
    nx.fillRect(0, 0, stripW, B);
    return { W: W, H: H, sky: sky, wall: wall, veins: veins, mid: mid, anvils: anvils, near: near };
}

BackgroundRenderer.renderFieryForge = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._fieryForge;
    if (!st || st.W !== W || st.H !== H) {
        st = buildFieryForge(W, H, groundY, B);
        this._fieryForge = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawStripCopies(ctx, st.wall, W, gY - st.wall.height, time, speed, 0.1, function (x) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
        ctx.fillStyle = "rgba(255, 100, 20, " + (0.45 + 0.35 * pulse).toFixed(3) + ")";
        for (const v of st.veins) {
            if (x + v[0].x < -B * 4 || x + v[0].x > W + B * 4) {
                continue;
            }
            for (const pt of v) {
                ctx.fillRect(x + pt.x, gY - st.wall.height + pt.y, B / 3, B);
            }
        }
    });
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    const midTop = gY - B * 0.6 - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.anvils.length; i++) {
            const a = st.anvils[i];
            const ax = x + a.x;
            if (ax < -B * 5 || ax > W + B * 5) {
                continue;
            }
            // Молот б'є по ковадлу; далі по рівню — частіше
            const rate = 1.2 + s1 * 1.2;
            const ph = ((time * rate + i * 0.37) % 1);
            const lift = ph < 0.8 ? Math.sin(ph / 0.8 * Math.PI / 2) * B * 3 : (1 - (ph - 0.8) / 0.2) * B * 3;
            const hy = midTop + a.y - B * 1.2 - lift;
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(Math.round(ax + B * 0.2), Math.round(hy - B * 2.5), Math.round(B * 0.4), Math.round(B * 2.5));
            ctx.fillStyle = "#6a6a74";
            ctx.fillRect(Math.round(ax - B * 0.6), Math.round(hy), Math.round(B * 2), Math.round(B * 1.2));
            // Розпечена заготовка й іскри в мить удару
            ctx.fillStyle = "#ff8a2a";
            ctx.fillRect(Math.round(ax - B * 0.4), Math.round(midTop + a.y - B * 0.3), Math.round(B * 1.6), Math.round(B * 0.3));
            if (ph < 0.12) {
                ctx.fillStyle = "#ffe14d";
                for (let k = 0; k < 6; k++) {
                    const ang = -Math.PI * (0.15 + k * 0.14);
                    const d = ph / 0.12 * B * 3;
                    ctx.fillRect(Math.round(ax + B * 0.4 + Math.cos(ang) * d), Math.round(midTop + a.y + Math.sin(ang) * d), 3, 3);
                }
            }
        }
    });
    // Лава в каналі
    const flow = (time * 30) % (B * 2);
    for (let x = -flow; x < W; x += B * 2) {
        ctx.fillStyle = "#ff5a1a";
        ctx.fillRect(Math.round(x), gY - B * 0.6, B, B * 0.6);
        ctx.fillStyle = "#ffaa2a";
        ctx.fillRect(Math.round(x + B), gY - B * 0.6, B, B * 0.6);
    }
};

// ---------- Колонія на планеті ----------

function buildPlanetColony(W, H, groundY, B) {
    const rng = pixelRng(4201);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#3a1e14"], [0.6, "#8a4a24"], [1, "#b8703a"]]);
    const stripW = extraStripW(W, B);
    // Далекі скелі
    const farCols = stripW / B;
    const farH = periodicHeights(farCols, 6, [{ amp: 3, k: 2, ph: 1 }, { amp: 1.5, k: 6, ph: 0.3 }]);
    const far = makeCanvas(stripW, (Math.max.apply(null, farH) + 1) * B);
    drawBlockTerrain(far.getContext("2d"), farH, B, far.height, { top: "#6a3a24", body: "#5a301e", body2: "#522c1c" }, rng);
    // Атмосферний процесор, модулі колонії й антени
    const midH = Math.round(gY * 0.8);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const lights = [];
    for (let x = B * 3; x < stripW - B * 30; x += B * 40) {
        // Велика вежа процесора
        mx.fillStyle = "#3a3a42";
        mx.fillRect(x, midH * 0.1, B * 8, midH * 0.9);
        mx.fillStyle = "#4a4a54";
        mx.fillRect(x + B, midH * 0.1, B, midH * 0.9);
        mx.fillRect(x + B * 5, midH * 0.1, B, midH * 0.9);
        mx.fillStyle = "#2a2a30";
        for (let y = midH * 0.15; y < midH; y += B * 3) {
            mx.fillRect(x, y, B * 8, B * 0.4);
        }
        mx.fillStyle = "#3a3a42";
        mx.fillRect(x + B * 2, midH * 0.1 - B * 4, B * 4, B * 4);
        lights.push({ x: x + B * 4, y: midH * 0.1 - B * 4 });
        // Модулі з вікнами
        for (let k = 0; k < 2; k++) {
            const mx0 = x + B * (12 + k * 12);
            mx.fillStyle = "#6a6a74";
            mx.fillRect(mx0, midH - B * 4, B * 9, B * 4);
            mx.fillStyle = "#8a8a94";
            mx.fillRect(mx0, midH - B * 4, B * 9, B * 0.4);
            for (let w = 0; w < 3; w++) {
                mx.fillStyle = "#ffcf6a";
                mx.fillRect(mx0 + B * (1 + w * 2.7), midH - B * 2.8, B * 1.2, B * 0.8);
            }
        }
        // Антена
        mx.fillStyle = "#8a8a94";
        mx.fillRect(x + B * 36, midH - B * 10, B * 0.3, B * 10);
        mx.fillRect(x + B * 34.5, midH - B * 10, B * 3.3, B * 0.3);
    }
    const near = makeCanvas(stripW, B * 1.2);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B / 2) {
        nx.fillStyle = rng() < 0.5 ? "#8a5a2a" : "#a06a34";
        nx.fillRect(x, B * 1.2 - B * (0.2 + rng() * 0.6), B / 2, B * 1.2);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, lights: lights, near: near };
}

BackgroundRenderer.renderPlanetColony = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._planetColony;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPlanetColony(W, H, groundY, B);
        this._planetColony = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY - B * 4, time, speed, 0.06);
    const midTop = gY - B * 0.6 - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.25, function (x) {
        for (let i = 0; i < st.lights.length; i++) {
            const l = st.lights[i];
            const lx = x + l.x;
            if (lx < -B * 8 || lx > W + B * 8) {
                continue;
            }
            // Процесор викидає пару й блимає
            ctx.fillStyle = Math.sin(time * 3 + i) > 0 ? "#ff3a2a" : "#5a1a14";
            ctx.fillRect(Math.round(lx - B * 0.3), Math.round(midTop + l.y - B * 0.6), Math.round(B * 0.6), Math.round(B * 0.6));
            for (let k = 0; k < 4; k++) {
                const t = (time * 0.2 + k / 4) % 1;
                ctx.fillStyle = "rgba(220, 200, 180, " + (0.3 * (1 - t)).toFixed(3) + ")";
                const sz = B * (1.5 + t * 4);
                ctx.fillRect(Math.round(lx - sz / 2 + t * B * 6), Math.round(midTop + l.y - B - t * B * 8), Math.round(sz), Math.round(sz * 0.6));
            }
        }
    });
    // Пилові смуги вітру
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    ctx.fillStyle = "rgba(220, 150, 90, " + (0.25 + 0.25 * s1).toFixed(3) + ")";
    for (let i = 0; i < 20; i++) {
        const y = (i * 37) % Math.round(gY * 0.9);
        const x = ((i * 113 - time * (300 + i * 20)) % (W + 200) + W + 200) % (W + 200) - 100;
        ctx.fillRect(Math.round(x), y, Math.round(B * (2 + (i % 3))), 2);
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Трофейний корабель мисливця ----------

function buildHunterShip(W, H, groundY, B) {
    const rng = pixelRng(4301);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#040a06"], [1, "#0e1e14"]]);
    const stripW = extraStripW(W, B);
    // Стіни з трикутних панелей і символів
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    const glyphs = [];
    for (let x = 0; x < stripW; x += B * 4) {
        for (let y = 0; y < gY; y += B * 4) {
            const up = ((x + y) / (B * 4)) % 2 === 0;
            wx.fillStyle = up ? "#14241a" : "#10201a";
            wx.beginPath();
            if (up) {
                wx.moveTo(x, y + B * 4);
                wx.lineTo(x + B * 2, y);
                wx.lineTo(x + B * 4, y + B * 4);
            } else {
                wx.moveTo(x, y);
                wx.lineTo(x + B * 2, y + B * 4);
                wx.lineTo(x + B * 4, y);
            }
            wx.closePath();
            wx.fill();
            if (rng() < 0.12) {
                glyphs.push({ x: x + B * 1.5, y: y + B * 1.5 });
            }
        }
    }
    // Голограма планети на постаменті й колони
    const midH = Math.round(gY * 0.85);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const holos = [];
    for (let x = B * 4; x < stripW - B * 14; x += B * 24) {
        mx.fillStyle = "#1e2e24";
        mx.fillRect(x, 0, B * 2, midH);
        mx.fillRect(x + B * 14, 0, B * 2, midH);
        mx.fillStyle = "#2a3e30";
        mx.fillRect(x, 0, B * 0.3, midH);
        mx.fillStyle = "#26382c";
        mx.fillRect(x + B * 6, midH - B * 2, B * 4, B * 2);
        mx.fillRect(x + B * 6.5, midH - B * 2.6, B * 3, B * 0.6);
        holos.push({ x: x + B * 8, y: midH - B * 6 });
    }
    const near = makeCanvas(stripW, B);
    const nx = near.getContext("2d");
    nx.fillStyle = "#14241a";
    nx.fillRect(0, 0, stripW, B);
    for (let x = 0; x < stripW; x += B * 2) {
        nx.fillStyle = "#1e3a28";
        nx.fillRect(x, 0, B, B * 0.25);
    }
    return { W: W, H: H, sky: sky, wall: wall, glyphs: glyphs, mid: mid, holos: holos, near: near };
}

BackgroundRenderer.renderHunterShip = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._hunterShip;
    if (!st || st.W !== W || st.H !== H) {
        st = buildHunterShip(W, H, groundY, B);
        this._hunterShip = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    drawStripCopies(ctx, st.wall, W, gY - st.wall.height, time, speed, 0.1, function (x) {
        for (let i = 0; i < st.glyphs.length; i++) {
            const g = st.glyphs[i];
            const gx = x + g.x;
            if (gx < -B * 2 || gx > W) {
                continue;
            }
            // Символи мерехтять; у сюжеті — червоний відлік
            const on = Math.sin(time * 2 + i * 1.7) > 0.3;
            ctx.fillStyle = s1 > 0.5 && i % 3 === 0 ? "rgba(255, 60, 40, 0.9)" : on ? "rgba(90, 255, 150, 0.8)" : "rgba(90, 255, 150, 0.25)";
            const gy = gY - st.wall.height + g.y;
            ctx.fillRect(Math.round(gx), Math.round(gy), Math.round(B * 0.8), Math.max(2, Math.round(B * 0.15)));
            ctx.fillRect(Math.round(gx + B * 0.3), Math.round(gy), Math.max(2, Math.round(B * 0.15)), Math.round(B * 0.8));
        }
    });
    const midTop = gY - B - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.holos.length; i++) {
            const h = st.holos[i];
            const hx = x + h.x;
            if (hx < -B * 6 || hx > W + B * 6) {
                continue;
            }
            // Голограма планети, що обертається
            const hy = midTop + h.y;
            ctx.fillStyle = "rgba(90, 255, 150, 0.12)";
            ctx.beginPath();
            ctx.moveTo(hx - B * 1.5, midTop + st.mid.height - B * 2.6);
            ctx.lineTo(hx + B * 1.5, midTop + st.mid.height - B * 2.6);
            ctx.lineTo(hx + B * 3, hy);
            ctx.lineTo(hx - B * 3, hy);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(90, 255, 150, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(hx, hy, B * 2.5, 0, Math.PI * 2);
            ctx.stroke();
            const rot = time * 0.8;
            for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.ellipse(hx, hy, Math.abs(Math.cos(rot + k * 1.05)) * B * 2.5, B * 2.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Обсидіанова вершина ----------

function buildObsidianPeak(W, H, groundY, B) {
    const rng = pixelRng(4401);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0620"], [0.6, "#2a1450"], [1, "#4a2a70"]]);
    const stars = makeCanvas(W, gY);
    drawStarsInto(stars.getContext("2d"), W, gY * 0.6, 60, rng, B);
    const stripW = extraStripW(W, B);
    // Хмари під вершиною
    const clouds = makeCanvas(stripW, B * 4);
    const cx = clouds.getContext("2d");
    for (let x = 0; x < stripW; x += B) {
        const h = B * (2 + Math.sin(x / B * 0.7) * 1 + rng());
        cx.fillStyle = "rgba(200, 180, 240, 0.35)";
        cx.fillRect(x, B * 4 - h, B, h);
    }
    // Обсидіанові шпилі з фіолетовими кристалами
    const midH = Math.round(gY * 0.85);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const crystals = [];
    for (let x = B * 2; x < stripW - B * 6; x += B * (7 + Math.floor(rng() * 6))) {
        const h = midH * (0.4 + rng() * 0.55);
        const w = B * (2 + Math.floor(rng() * 2));
        mx.fillStyle = "#140e20";
        mx.fillRect(x, midH - h, w, h);
        mx.fillRect(x + B * 0.5, midH - h - B * 2, w - B, B * 2);
        mx.fillStyle = "#221832";
        mx.fillRect(x, midH - h, B * 0.4, h);
        crystals.push({ x: x + w / 2, y: midH - h - B * 2 });
    }
    return { W: W, H: H, sky: sky, stars: stars, clouds: clouds, mid: mid, crystals: crystals };
}

BackgroundRenderer.renderObsidianPeak = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._obsidianPeak;
    if (!st || st.W !== W || st.H !== H) {
        st = buildObsidianPeak(W, H, groundY, B);
        this._obsidianPeak = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    ctx.drawImage(st.stars, 0, 0);
    const midTop = gY - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.2, function (x) {
        for (let i = 0; i < st.crystals.length; i++) {
            const c = st.crystals[i];
            const cxx = x + c.x;
            if (cxx < -B * 3 || cxx > W + B * 3) {
                continue;
            }
            const glow = 0.5 + 0.5 * Math.sin(time * 1.5 + i);
            ctx.fillStyle = "rgba(190, 110, 255, " + (0.6 + 0.4 * glow).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(cxx, midTop + c.y - B * 2);
            ctx.lineTo(cxx + B * 0.7, midTop + c.y);
            ctx.lineTo(cxx - B * 0.7, midTop + c.y);
            ctx.closePath();
            ctx.fill();
        }
    });
    drawScrollingStrip(ctx, st.clouds, W, gY + B, time, speed, 0.4);
};

// ---------- Королева вулика ----------

BackgroundRenderer.renderHiveQueen = function (ctx, W, H, groundY, time, speed) {
    // Той самий вулик, але темніший і з червонуватим світлом королеви
    this.renderAlienHive(ctx, W, H, groundY, time, speed);
    const gY = Math.round(groundY);
    ctx.fillStyle = "rgba(40, 0, 20, 0.25)";
    ctx.fillRect(0, 0, W, gY);
};

Object.assign(THEME_RENDERERS, {
    desert_temple: "renderDesertTemple",
    fiery_forge: "renderFieryForge",
    planet_colony: "renderPlanetColony",
    hunter_ship: "renderHunterShip",
    obsidian_peak: "renderObsidianPeak",
    hive_queen: "renderHiveQueen"
});
SCENE_CACHE_KEYS.push("_desertTemple", "_fieryForge", "_planetColony", "_hunterShip", "_obsidianPeak");
DUSK_THEMES.add("desert_temple");
Object.assign(GROUND_BY_THEME, {
    desert_temple: "sand", fiery_forge: "lava", planet_colony: "sand", obsidian_peak: "cloud", hive_queen: "alien"
});
Object.assign(FINISH_BY_THEME, {
    desert_temple: "chest", fiery_forge: "gate", planet_colony: "portal", hunter_ship: "portal",
    obsidian_peak: "gate", hive_queen: "portal"
});
Object.assign(WORLD_NAMES, {
    desert_temple: "Пустельний храм", fiery_forge: "Вогняна кузня", planet_colony: "Колонія на планеті",
    hunter_ship: "Трофейний корабель", obsidian_peak: "Обсидіанова вершина", hive_queen: "Королева вулика"
});
WEATHER_THEMES.add("desert_temple");

Object.assign(STORY_BY_THEME, {
    // Скарабеї біжать піском — око храму світиться, брама відчиняється (у сцені)
    desert_temple(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 6; i++) {
                const k = ((time * 0.12 + i * 0.17) % 1.1) - 0.05;
                const x = W * (1 - k);
                const y = gY - B * 0.5;
                const leg = Math.sin(time * 20 + i) > 0 ? 1 : 0;
                ctx.globalAlpha = s1;
                ctx.fillStyle = "#1a4a6a";
                ctx.fillRect(Math.round(x), Math.round(y - B * 0.6), Math.round(B * 0.9), Math.round(B * 0.5));
                ctx.fillStyle = "#0a1a2a";
                ctx.fillRect(Math.round(x + leg * 2), Math.round(y - B * 0.1), 2, Math.round(B * 0.2));
                ctx.fillRect(Math.round(x + B * 0.6 - leg * 2), Math.round(y - B * 0.1), 2, Math.round(B * 0.2));
                ctx.globalAlpha = 1;
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 210, 120", 0.2);
    },
    // Молоти частішають (у сцені) — з ковша ллється розплавлений метал
    fiery_forge(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s2 > 0) {
            const x = W * 0.6;
            ctx.fillStyle = "rgba(70, 60, 70, " + s2.toFixed(3) + ")";
            ctx.fillRect(Math.round(x - B * 2), Math.round(gY * 0.1), Math.round(B * 4), Math.round(B * 2.5));
            const flow = 0.8 + 0.2 * Math.sin(time * 10);
            ctx.fillStyle = "rgba(255, 170, 40, " + (s2 * flow).toFixed(3) + ")";
            ctx.fillRect(Math.round(x - B * 0.4), Math.round(gY * 0.1 + B * 2.5), Math.round(B * 0.8), Math.round(gY * 0.9 - B * 2.5));
            ctx.fillStyle = "rgba(255, 240, 150, " + (s2 * 0.8).toFixed(3) + ")";
            ctx.fillRect(Math.round(x - B * 0.15), Math.round(gY * 0.1 + B * 2.5), Math.round(B * 0.3), Math.round(gY * 0.9 - B * 2.5));
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 120, 30", 0.2);
    },
    // Буря сильнішає з блискавками — сідає десантний корабель
    planet_colony(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && Math.sin(time * 1.3) > 0.97) {
            ctx.fillStyle = "rgba(255, 240, 220, " + (0.35 * s1).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0) {
            const land = smoothStep((p - 0.63) / 0.3);
            const x = W * 0.65;
            const y = gY * (0.05 + 0.45 * land);
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#2a2e36";
            ctx.fillRect(Math.round(x - B * 5), Math.round(y), Math.round(B * 10), Math.round(B * 2));
            ctx.fillRect(Math.round(x - B * 3), Math.round(y - B * 1.2), Math.round(B * 6), Math.round(B * 1.2));
            ctx.fillStyle = "#4a4e56";
            ctx.fillRect(Math.round(x - B * 5), Math.round(y), Math.round(B * 10), Math.round(B * 0.3));
            const blink = Math.sin(time * 6) > 0;
            ctx.fillStyle = blink ? "#ff3a2a" : "#5aff78";
            ctx.fillRect(Math.round(x - B * 5), Math.round(y + B * 0.8), Math.round(B * 0.5), Math.round(B * 0.5));
            ctx.fillRect(Math.round(x + B * 4.5), Math.round(y + B * 0.8), Math.round(B * 0.5), Math.round(B * 0.5));
            // Промені прожекторів донизу
            ctx.fillStyle = "rgba(255, 240, 200, 0.12)";
            ctx.beginPath();
            ctx.moveTo(x - B * 2, y + B * 2);
            ctx.lineTo(x + B * 2, y + B * 2);
            ctx.lineTo(x + B * 6, gY);
            ctx.lineTo(x - B * 6, gY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 160, 90", 0.18);
    },
    // Символи рахують червоним (у сцені) — повз проходять невидимі мисливці-марева
    hunter_ship(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s2 > 0 && p < 0.97) {
            for (let n = 0; n < 2; n++) {
                const k = ((time * 0.06 + n * 0.5) % 1.3) - 0.15;
                const x = W * (1 - k);
                const y = gY - B;
                ctx.strokeStyle = "rgba(200, 255, 220, " + (0.35 * s2).toFixed(3) + ")";
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
        }
        storyOopsFlash(ctx, W, gY, oops, "90, 255, 150", 0.18);
    },
    // Фіолетові блискавки — на вершині відкривається портал
    obsidian_peak(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && Math.sin(time * 1.1 + 1) > 0.96) {
            const x = W * (0.2 + ((Math.floor(time * 1.1 / (Math.PI * 2))) * 0.37) % 0.6);
            ctx.strokeStyle = "rgba(220, 170, 255, " + (0.9 * s1).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            let y = 0;
            let xx = x;
            while (y < gY * 0.6) {
                y += B * 2;
                xx += (Math.random() - 0.5) * B * 3;
                ctx.lineTo(xx, y);
            }
            ctx.stroke();
        }
        if (s2 > 0) {
            const cx = W * 0.7;
            const cy = gY * 0.3;
            const r = B * 4 * s2;
            const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 1.6);
            g.addColorStop(0, "rgba(255, 220, 255, " + (0.9 * s2).toFixed(3) + ")");
            g.addColorStop(0.5, "rgba(190, 110, 255, " + (0.6 * s2).toFixed(3) + ")");
            g.addColorStop(1, "rgba(190, 110, 255, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2);
            ctx.strokeStyle = "rgba(230, 190, 255, " + (0.8 * s2).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(cx, cy, r * 0.7, r, time * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        storyOopsFlash(ctx, W, gY, oops, "190, 110, 255", 0.18);
    },
    // Фінал Ліги 2: королева видно від початку — з прогресом підводиться й нахиляє голову
    hive_queen(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const rise = 0.55 + 0.45 * smoothStep(p / 0.9);
        const cx = W * 0.68;
        const baseY = gY + B * 2;
        const hgt = gY * 0.85 * rise;
        const nod = Math.sin(time * 0.8) * B * 0.6;
        ctx.fillStyle = "rgba(4, 10, 10, 0.88)";
        ctx.beginPath();
        ctx.moveTo(cx - B * 12, baseY);
        ctx.lineTo(cx - B * 8, baseY - hgt * 0.5);
        ctx.lineTo(cx - B * 3, baseY - hgt * 0.78 + nod);
        ctx.lineTo(cx + B * 12, baseY - hgt + nod);
        ctx.lineTo(cx + B * 4, baseY - hgt * 0.68 + nod);
        ctx.lineTo(cx + B * 7, baseY - hgt * 0.45);
        ctx.lineTo(cx + B * 12, baseY);
        ctx.closePath();
        ctx.fill();
        // Гребінь-корона з ребрами
        ctx.strokeStyle = "rgba(40, 70, 60, 0.9)";
        ctx.lineWidth = 2;
        for (let k = 0; k < 5; k++) {
            ctx.beginPath();
            ctx.moveTo(cx - B * 2 + k * B * 2.5, baseY - hgt * 0.76 + nod + k * B * 0.2);
            ctx.lineTo(cx + k * B * 2.8, baseY - hgt * 0.95 + nod + k * B * 0.8);
            ctx.stroke();
        }
        const eye = 0.6 + 0.4 * Math.sin(time * 3);
        ctx.fillStyle = "rgba(120, 255, 190, " + eye.toFixed(3) + ")";
        ctx.fillRect(Math.round(cx - B * 2), Math.round(baseY - hgt * 0.7 + nod), Math.round(B), Math.round(B * 0.35));
        ctx.fillRect(Math.round(cx + B * 0.5), Math.round(baseY - hgt * 0.72 + nod), Math.round(B), Math.round(B * 0.35));
        // Під кінець — рик: хвиля світла
        if (s2 > 0) {
            const ring = (time * 0.8) % 1;
            ctx.strokeStyle = "rgba(120, 255, 190, " + (0.5 * s2 * (1 - ring)).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, baseY - hgt * 0.7, B * 4 + ring * B * 20, 0, Math.PI * 2);
            ctx.stroke();
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 255, 190", 0.2);
    }
});
