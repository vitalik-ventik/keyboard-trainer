// backgrounds/hangar_bay.js — фінал Ліги 2: ангар корабля

import { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS } from "./core.js";
import { drawPixelDisc, drawScrollingStrip, drawStripCopies, extraStripW, makeCanvas, makeSky, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { STORY_BY_THEME, drawBeam, storyOopsFlash } from "./story.js";
import { FINISH_BY_THEME, WORLD_NAMES } from "./names_finish_weather.js";
import { drawFacehugger, drawXenoQueen } from "./monsters.js";

// ============================================================
// Фінал Ліги 2: Ангар корабля — королеву вулика викидає в космос
// ============================================================

function buildHangarBay(W, H, groundY, B) {
    const rng = pixelRng(4501);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0c1016"], [1, "#1a222c"]]);
    const stripW = extraStripW(W, B);
    // Задня стіна з великими ілюмінаторами в космос
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    wx.fillStyle = "#222a34";
    wx.fillRect(0, 0, stripW, gY);
    const windows = [];
    for (let x = B * 2; x < stripW - B * 14; x += B * 20) {
        const ww = B * 14;
        const wh = Math.round(gY * 0.45);
        const wy = Math.round(gY * 0.1);
        wx.fillStyle = "#3a4450";
        wx.fillRect(x - B * 0.6, wy - B * 0.6, ww + B * 1.2, wh + B * 1.2);
        wx.clearRect(x, wy, ww, wh);
        wx.fillStyle = "#3a4450";
        for (let k = 1; k < 4; k++) {
            wx.fillRect(x + k * ww / 4 - B * 0.2, wy, B * 0.4, wh);
        }
        windows.push({ x: x, y: wy, w: ww, h: wh });
    }
    // Ферми під стелею й жовто-чорні смуги
    wx.fillStyle = "#2e3844";
    wx.fillRect(0, 0, stripW, B * 1.2);
    for (let x = 0; x < stripW; x += B * 2) {
        wx.fillStyle = "#3a4654";
        wx.fillRect(x, B * 1.2, B * 0.3, B * 1.5);
        wx.fillRect(x, B * 2.5, B * 2, B * 0.3);
    }
    for (let x = 0; x < stripW; x += B) {
        wx.fillStyle = (x / B) % 2 === 0 ? "#e8b020" : "#1a1a1a";
        wx.fillRect(x, gY - B * 2.2, B, B * 0.6);
    }
    // Ящики з вантажем і припаркований десантний корабель
    const midH = Math.round(gY * 0.5);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const cranes = [];
    for (let x = B * 3; x < stripW - B * 24; x += B * 30) {
        // Штабель ящиків
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3 - r; c++) {
                const cx = x + c * B * 2.4 + r * B * 1.2;
                const cy = midH - (r + 1) * B * 2.2;
                mx.fillStyle = (r + c) % 2 === 0 ? "#6a5a2a" : "#5a4a24";
                mx.fillRect(cx, cy, B * 2.2, B * 2.1);
                mx.fillStyle = "#8a7a3a";
                mx.fillRect(cx, cy, B * 2.2, B * 0.25);
                mx.fillRect(cx + B, cy, B * 0.2, B * 2.1);
            }
        }
        // Десантний корабель
        const sx = x + B * 11;
        mx.fillStyle = "#3a4450";
        mx.fillRect(sx, midH - B * 4, B * 12, B * 3);
        mx.fillRect(sx + B * 2, midH - B * 5.4, B * 7, B * 1.4);
        mx.fillStyle = "#4a5664";
        mx.fillRect(sx, midH - B * 4, B * 12, B * 0.4);
        mx.fillStyle = "#1a2028";
        mx.fillRect(sx + B, midH - B, B * 0.6, B);
        mx.fillRect(sx + B * 10.4, midH - B, B * 0.6, B);
        mx.fillStyle = "#7df9ff";
        mx.fillRect(sx + B * 7.4, midH - B * 5, B * 1.4, B * 0.6);
        cranes.push({ x: x + B * 26 });
    }
    const near = makeCanvas(stripW, B);
    const nx = near.getContext("2d");
    nx.fillStyle = "#2a323c";
    nx.fillRect(0, 0, stripW, B);
    for (let x = 0; x < stripW; x += B * 4) {
        nx.fillStyle = "#e8b020";
        nx.fillRect(x, B * 0.4, B * 2, B * 0.2);
    }
    const stars = [];
    for (let i = 0; i < 40; i++) {
        stars.push({ x: rng(), y: rng(), s: rng() < 0.2 ? 2 : 1 });
    }
    return { W: W, H: H, sky: sky, wall: wall, windows: windows, mid: mid, cranes: cranes, near: near, stars: stars };
}

BackgroundRenderer.renderHangarBay = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._hangarBay;
    if (!st || st.W !== W || st.H !== H) {
        st = buildHangarBay(W, H, groundY, B);
        this._hangarBay = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const wallW = st.wall.width;
    const wOff = Math.round(time * speed * 0.1) % wallW;
    for (let x = -wOff; x < W; x += wallW) {
        // Космос в ілюмінаторах: зорі й планета пропливають
        for (const w of st.windows) {
            const wxp = x + w.x;
            if (wxp > W || wxp + w.w < 0) {
                continue;
            }
            ctx.fillStyle = "#02040a";
            ctx.fillRect(wxp, w.y, w.w, w.h);
            ctx.save();
            ctx.beginPath();
            ctx.rect(wxp, w.y, w.w, w.h);
            ctx.clip();
            ctx.fillStyle = "#ffffff";
            for (const s of st.stars) {
                const sx = wxp + ((s.x * w.w + time * B * 0.6) % w.w);
                ctx.fillRect(Math.round(sx), Math.round(w.y + s.y * w.h), s.s, s.s);
            }
            drawPixelDisc(ctx, wxp + w.w * 0.7, w.y + w.h * 0.75, w.h * 0.45, B, "#3a6aa8");
            drawPixelDisc(ctx, wxp + w.w * 0.66, w.y + w.h * 0.7, w.h * 0.2, B, "#4a8a5a");
            ctx.restore();
        }
        ctx.drawImage(st.wall, x, gY - st.wall.height);
    }
    // Обертові аварійні лампи під стелею
    for (let i = 0; i < 4; i++) {
        const lx = ((i * 0.27 + 0.1) * W);
        const a = time * 4 + i;
        drawBeam(ctx, lx, B * 2.8, Math.PI / 2 + Math.sin(a) * 0.9, gY * 0.5, 0.12, "rgba(255, 140, 30, 0.12)");
        ctx.fillStyle = "#ff8a1a";
        ctx.fillRect(Math.round(lx - B * 0.4), Math.round(B * 2.5), Math.round(B * 0.8), Math.round(B * 0.5));
    }
    const midTop = gY - B - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.cranes.length; i++) {
            const cx = x + st.cranes[i].x;
            if (cx < -B * 6 || cx > W + B * 6) {
                continue;
            }
            // Кран з ящиком на тросі погойдується
            const sway = Math.sin(time * 1.2 + i) * B * 1.2;
            const ropeTop = midTop - gY * 0.3;
            ctx.fillStyle = "#e8b020";
            ctx.fillRect(Math.round(cx - B * 4), Math.round(ropeTop), Math.round(B * 8), Math.round(B * 0.6));
            ctx.strokeStyle = "#9aa4b0";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, ropeTop + B * 0.6);
            ctx.lineTo(cx + sway, midTop + B * 3);
            ctx.stroke();
            ctx.fillStyle = "#8a3a2a";
            ctx.fillRect(Math.round(cx + sway - B * 1.2), Math.round(midTop + B * 3), Math.round(B * 2.4), Math.round(B * 2));
        }
    });
    // Робот-вантажник ходить туди-сюди з ящиком
    const lk = (time * 0.05) % 1;
    const lx = lk < 0.5 ? W * (0.1 + lk * 1.6) : W * (0.9 - (lk - 0.5) * 1.6);
    const step = Math.sin(time * 6) > 0 ? B * 0.3 : 0;
    const ly = gY - B;
    ctx.fillStyle = "#e8b020";
    ctx.fillRect(Math.round(lx - B * 1.5), Math.round(ly - B * 4.5), Math.round(B * 3), Math.round(B * 2.5));
    ctx.fillStyle = "rgba(140, 200, 255, 0.5)";
    ctx.fillRect(Math.round(lx - B), Math.round(ly - B * 4.1), Math.round(B * 2), Math.round(B * 1.2));
    ctx.fillStyle = "#3a3a44";
    ctx.fillRect(Math.round(lx - B * 1.2), Math.round(ly - B * 2 - step), Math.round(B * 0.8), Math.round(B * 2 + step));
    ctx.fillRect(Math.round(lx + B * 0.4), Math.round(ly - B * 2 - (B * 0.3 - step)), Math.round(B * 0.8), Math.round(B * 2));
    ctx.fillStyle = "#6a5a2a";
    ctx.fillRect(Math.round(lx + B * 1.6), Math.round(ly - B * 4), Math.round(B * 2), Math.round(B * 1.8));
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { hangar_bay: "renderHangarBay" });
SCENE_CACHE_KEYS.push("_hangarBay");
FINISH_BY_THEME.hangar_bay = "portal";
WORLD_NAMES.hangar_bay = "Ангар корабля";

// Королева вилазить із люка — шлюз відчиняється, повітря виносить ящики й королеву в космос
STORY_BY_THEME.hangar_bay = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    const cx0 = W * 0.62;
    const out = s2 > 0 ? smoothStep((p - 0.63) / 0.3) : 0;
    if (s1 > 0) {
        // Червона тривога
        ctx.fillStyle = "rgba(255, 30, 30, " + (0.1 * s1 * (0.5 + 0.5 * Math.sin(time * 6))).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        // Королева: підіймається з люка, згодом її затягує в шлюз праворуч
        const rise = smoothStep((p - 0.3) / 0.2);
        const qx = cx0 + out * W * 0.6;
        const qScale = 1 - out * 0.6;
        const qy = gY + B * 0.5 - out * gY * 0.4;
        // Люк у підлозі, з якого вона вилазить
        ctx.fillStyle = "#101418";
        ctx.fillRect(Math.round(cx0 - B * 4), Math.round(gY - B * 0.6), Math.round(B * 12), Math.round(B * 0.6));
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, gY - B * 0.5 + (out > 0 ? gY : 0));
        ctx.clip();
        ctx.translate(qx, qy + (1 - rise) * B * 22 * qScale);
        ctx.rotate(out * 2.5);
        drawXenoQueen(ctx, 0, 0, B, time, 0.9 * qScale, 1);
        ctx.restore();
        // Лицехват метушиться підлогою
        const fk = (time * 0.18) % 1;
        drawFacehugger(ctx, W * (0.1 + fk * 0.5), gY - B * 0.3, B, time, 0.6);
    }
    if (s2 > 0) {
        // Шлюз праворуч відчиняється: видно космос, летять ящики й смуги вітру
        const doorX = W * 0.86;
        const open = out;
        ctx.fillStyle = "#02040a";
        ctx.fillRect(Math.round(doorX), Math.round(gY * 0.15), Math.round(W * 0.14), Math.round(gY * 0.85 * open));
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 12; i++) {
            ctx.fillRect(Math.round(doorX + ((i * 37) % (W * 0.14))), Math.round(gY * 0.2 + ((i * 53) % (gY * 0.7)) * open), 2, 2);
        }
        ctx.fillStyle = "rgba(220, 230, 255, " + (0.3 * s2).toFixed(3) + ")";
        for (let i = 0; i < 16; i++) {
            const y = (i * 41) % Math.round(gY * 0.9);
            const x = ((i * 97 + time * 900) % (W + 200)) - 100;
            ctx.fillRect(Math.round(x), y, Math.round(B * 3), 2);
        }
        for (let i = 0; i < 3; i++) {
            const k = ((time * 0.6 + i * 0.33) % 1);
            const bx = W * (0.3 + k * 0.7);
            const by = gY * (0.7 - k * 0.4) + Math.sin(i * 2) * B * 2;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(k * 6 + i);
            ctx.fillStyle = "rgba(106, 90, 42, " + (s2 * (1 - k)).toFixed(3) + ")";
            ctx.fillRect(-B, -B, B * 2, B * 2);
            ctx.restore();
        }
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 60, 30", 0.2);
};
