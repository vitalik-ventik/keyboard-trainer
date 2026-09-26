// backgrounds/blackhole_citadel_pirate_orbit.js — чорна діра, небесна цитадель,
// піратська бухта, орбіта

import { BackgroundRenderer } from "./core.js";
import { drawPixelDisc, drawScrollingStrip, drawStarsInto, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";
import { _fx } from "./effects.js";

// ---------- 29. Чорна діра ----------

function buildBlackHole(W, H, groundY, B) {
    const rng = pixelRng(2929);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020108"], [1, "#0a0418"]]);
    const sx = sky.getContext("2d");
    // Туманність
    for (let i = 0; i < 40; i++) {
        drawPixelDisc(sx, W * (0.05 + rng() * 0.5), gY * (0.1 + rng() * 0.6), B * (1.5 + rng() * 3), B / 2, i % 2 === 0 ? "rgba(120, 60, 200, 0.05)" : "rgba(40, 120, 200, 0.04)");
    }
    drawStarsInto(sx, W, gY, 140, rng, B);
    // Далекі спіральні галактики
    const galaxies = [[W * 0.12, gY * 0.18, "#c8a0ff"], [W * 0.9, gY * 0.12, "#a0d0ff"]];
    for (const g of galaxies) {
        for (let k = 0; k < 60; k++) {
            const a = k * 0.35;
            const r = k * B * 0.05;
            for (const arm of [0, Math.PI]) {
                sx.fillStyle = g[2];
                sx.globalAlpha = 0.6 - k / 120;
                sx.fillRect(Math.round(g[0] + Math.cos(a + arm) * r * 1.6), Math.round(g[1] + Math.sin(a + arm) * r * 0.7), 2, 2);
            }
        }
        sx.globalAlpha = 1;
        sx.fillStyle = "#ffffff";
        sx.fillRect(Math.round(g[0] - 2), Math.round(g[1] - 2), 4, 4);
    }
    // Газовий гігант у кутку
    const gpx = W * 0.14;
    const gpy = gY * 0.78;
    for (let y = -B * 4; y < B * 4; y += B / 2) {
        const half = Math.sqrt(Math.max(0, B * B * 16 - y * y));
        sx.fillStyle = Math.floor((y + B * 4) / B) % 2 === 0 ? "#c86a3a" : "#a8522a";
        sx.fillRect(Math.round(gpx - half), Math.round(gpy + y), Math.round(half * 2), B / 2);
    }
    sx.fillStyle = "rgba(0, 0, 0, 0.35)";
    for (let y = -B * 4; y < B * 4; y += B / 2) {
        const half = Math.sqrt(Math.max(0, B * B * 16 - y * y));
        sx.fillRect(Math.round(gpx + half * 0.2), Math.round(gpy + y), Math.round(half * 0.8), B / 2);
    }
    const asteroids = [];
    for (let i = 0; i < 9; i++) {
        asteroids.push({ a: rng() * Math.PI * 2, speed: 0.04 + rng() * 0.05, size: 0.4 + rng() * 0.6, spin: rng() * 4 });
    }
    const particles = [];
    for (let i = 0; i < 260; i++) {
        particles.push({ r: 0.05 + rng() * 1.05, a: rng() * Math.PI * 2, speed: 0.4 + rng() * 0.6, hot: rng() });
    }
    return { W: W, H: H, sky: sky, particles: particles, asteroids: asteroids, cx: W * 0.62, cy: gY * 0.42, R: Math.min(W, gY) * 0.16 };
}

BackgroundRenderer.renderBlackHole = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    const gY = Math.round(groundY);
    let st = this._blackHole;
    if (!st || st.W !== W || st.H !== H) {
        st = buildBlackHole(W, H, groundY, B);
        this._blackHole = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Діра росте, що ближче фініш
    const R = st.R * (1 + (_fx.progress || 0) * 0.8);
    const ps = Math.max(2, Math.round(B / 4));
    // Суцільні світні смуги диска (половина позаду діри, половина попереду)
    function drawBands(front) {
        const bands = [[1.25, "rgba(255, 240, 200, 0.55)", 6], [1.6, "rgba(255, 160, 70, 0.4)", 10], [2.1, "rgba(255, 80, 120, 0.25)", 14], [2.6, "rgba(160, 60, 200, 0.15)", 16]];
        for (const b of bands) {
            ctx.strokeStyle = b[1];
            ctx.lineWidth = b[2];
            ctx.beginPath();
            ctx.ellipse(st.cx, st.cy, R * b[0], R * b[0] * 0.28, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
            ctx.stroke();
        }
    }
    // Акреційний диск: частинки обертаються, ближчі — швидше й гарячіші
    function drawDisk(front) {
        for (const p of st.particles) {
            const ang = p.a + time * p.speed / p.r;
            const sinA = Math.sin(ang);
            if ((sinA > 0) !== front) {
                continue;
            }
            const rr = R * (1.1 + p.r * 1.6);
            const x = st.cx + Math.cos(ang) * rr;
            const y = st.cy + sinA * rr * 0.28;
            const heat = 1 - p.r / 1.1;
            ctx.fillStyle = heat > 0.5 ? "#fff0c0" : p.hot > 0.5 ? "#ff9a3d" : "#ff4f7a";
            ctx.globalAlpha = 0.5 + heat * 0.5;
            ctx.fillRect(Math.round(x), Math.round(y), ps, ps);
        }
        ctx.globalAlpha = 1;
    }
    // Астероїди по спіралі затягує до діри
    for (const a of st.asteroids) {
        const life = (time * a.speed + a.a) % 1;
        const ang = a.a * 3 + life * Math.PI * 4;
        const rr = R * (1.3 + (1 - life) * 3.2);
        const ax = st.cx + Math.cos(ang) * rr;
        const ay = st.cy + Math.sin(ang) * rr * 0.45;
        const sz = Math.max(3, Math.round(B * a.size * (0.4 + (1 - life) * 0.8)));
        ctx.save();
        ctx.translate(Math.round(ax), Math.round(ay));
        ctx.rotate(time * a.spin);
        ctx.fillStyle = "#5a5060";
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.fillStyle = "#7a7080";
        ctx.fillRect(-sz / 2, -sz / 2, sz / 2, sz / 3);
        ctx.restore();
    }
    // Планета, з якої діра витягує струмінь речовини
    const plx = st.cx - W * 0.38;
    const ply = st.cy + gY * 0.05;
    for (let k = 0; k < 18; k++) {
        const t = ((time * 0.3 + k / 18) % 1);
        const x = plx + (st.cx - plx) * t;
        const y = ply + (st.cy - ply) * t - Math.sin(t * Math.PI) * B * 2;
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.fillStyle = t < 0.5 ? "#6ac8ff" : "#ffcc88";
        ctx.fillRect(Math.round(x), Math.round(y), Math.max(2, Math.round(B / 4)), Math.max(2, Math.round(B / 4)));
    }
    ctx.globalAlpha = 1;
    drawPixelDisc(ctx, plx, ply, B * 1.6, B / 4, "#3a8ad8");
    drawPixelDisc(ctx, plx - B * 0.4, ply - B * 0.3, B * 0.6, B / 4, "#5ab86a");
    drawBands(false);
    drawDisk(false);
    // Світне кільце та сама діра
    ctx.fillStyle = "rgba(255, 180, 90, 0.25)";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R, 0, Math.PI * 2);
    ctx.fill();
    drawBands(true);
    drawDisk(true);
    // Зорі, що затягуються спіраллю
    for (let i = 0; i < 6; i++) {
        const t = ((time * 0.12 + i / 6) % 1);
        const ang = i * 1.1 + t * Math.PI * 3;
        const rr = R * (4 - t * 3);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "#bfe9ff";
        ctx.fillRect(Math.round(st.cx + Math.cos(ang) * rr), Math.round(st.cy + Math.sin(ang) * rr * 0.5), ps, ps);
    }
    ctx.globalAlpha = 1;
    // Космічна станція з кільцем, що обертається
    const scx = W * 0.3;
    const scy = st.cy - gY * 0.22;
    ctx.strokeStyle = "#8a96b0";
    ctx.lineWidth = Math.max(2, B / 4);
    ctx.beginPath();
    ctx.ellipse(scx, scy, B * 2.2, B * 2.2 * Math.abs(Math.cos(time * 0.6)), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#c8d2da";
    ctx.fillRect(Math.round(scx - B * 0.4), Math.round(scy - B * 0.4), Math.round(B * 0.8), Math.round(B * 0.8));
    ctx.fillStyle = "#3a5aa0";
    ctx.fillRect(Math.round(scx - B * 3.4), Math.round(scy - B * 0.25), B, Math.round(B * 0.5));
    ctx.fillRect(Math.round(scx + B * 2.4), Math.round(scy - B * 0.25), B, Math.round(B * 0.5));
    if (Math.sin(time * 4) > 0) {
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(Math.round(scx - 2), Math.round(scy - B * 0.8), 4, 4);
    }
    // Корабель щосили тягне двигунами геть від діри
    const shx = W * 0.9 + Math.sin(time * 0.7) * B * 1.5;
    const shy = gY * 0.7 + Math.sin(time * 1.3) * B * 0.8;
    const flame = B * (1.2 + Math.sin(time * 30) * 0.3);
    ctx.fillStyle = "#ff9a3d";
    ctx.fillRect(Math.round(shx - B * 1.6 - flame), Math.round(shy - B * 0.25), Math.round(flame), Math.round(B * 0.5));
    ctx.fillStyle = "#fff4a0";
    ctx.fillRect(Math.round(shx - B * 1.6 - flame * 0.5), Math.round(shy - B * 0.12), Math.round(flame * 0.5), Math.round(B * 0.25));
    ctx.fillStyle = "#e8eef2";
    ctx.fillRect(Math.round(shx - B * 1.6), Math.round(shy - B * 0.5), Math.round(B * 2.6), B);
    ctx.fillRect(Math.round(shx + B), Math.round(shy - B * 0.3), Math.round(B * 0.6), Math.round(B * 0.6));
    ctx.fillStyle = "#39c6ff";
    ctx.fillRect(Math.round(shx + B * 0.4), Math.round(shy - B * 0.3), Math.round(B * 0.5), Math.round(B * 0.4));
    ctx.fillStyle = "#8a96b0";
    ctx.fillRect(Math.round(shx - B * 1.2), Math.round(shy - B * 1), Math.round(B * 0.8), Math.round(B * 0.5));
    ctx.fillRect(Math.round(shx - B * 1.2), Math.round(shy + B * 0.5), Math.round(B * 0.8), Math.round(B * 0.5));
};

// ---------- 30. Небесна цитадель ----------
// Золоті храми на летючих островах над морем хмар. Чим ближче фініш, тим
// вище піднімається цитадель — це останнє сходження перед боєм із босом.

// Летючий острів із храмом: скеля-«морквина» знизу, колони й купол згори
function drawTempleIsland(ctx, x, baseY, w, B, rng, big) {
    const p = B / 4;
    const cols = Math.round(w / B);
    // Скеля
    for (let c = 0; c < cols; c++) {
        const depth = Math.max(1, Math.round((1 - Math.abs(c - cols / 2 + 0.5) / (cols / 2)) * (big ? 5 : 3)) + (rng() < 0.3 ? 1 : 0));
        for (let r = 0; r < depth; r++) {
            ctx.fillStyle = r === 0 ? "#8a7a6a" : (r + c) % 2 === 0 ? "#5a4a4a" : "#4e4040";
            ctx.fillRect(x + c * B, baseY + r * B, B, B);
        }
    }
    ctx.fillStyle = "#6fbf5a";
    ctx.fillRect(x, baseY - p, cols * B, p * 2);
    // Храм
    const tw = Math.round(cols * (big ? 0.7 : 0.6));
    const tx = x + Math.round((cols - tw) / 2) * B;
    const th = B * (big ? 4 : 2.6);
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(tx, baseY - B * 0.5, tw * B, B * 0.5);
    for (let k = 0; k <= tw; k += 1) {
        ctx.fillStyle = "#fff4dc";
        ctx.fillRect(tx + k * B - p, baseY - th, p * 2, th - B * 0.5);
        ctx.fillStyle = "#d8c49a";
        ctx.fillRect(tx + k * B + p, baseY - th, p * 0.6, th - B * 0.5);
    }
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(tx - p, baseY - th - B * 0.5, tw * B + p * 2, B * 0.5);
    // Золотий купол
    ctx.fillStyle = "#ffcc33";
    const dw = tw * B * 0.8;
    const dx = tx + (tw * B - dw) / 2;
    for (let r = 0; r < 3; r++) {
        const shrink = r * dw * 0.18;
        ctx.fillRect(dx + shrink, baseY - th - B * (1 + r * 0.6), dw - shrink * 2, B * 0.6);
    }
    ctx.fillStyle = "#fff0a0";
    ctx.fillRect(dx + dw / 2 - p / 2, baseY - th - B * 3, p, B * 1.4);
}

function buildSkyCitadel(W, H, groundY, B) {
    const rng = pixelRng(3030);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#12246a"], [0.5, "#3a6ac8"], [0.85, "#ffd88a"], [1, "#fff0c8"]]);
    const skx = sky.getContext("2d");
    // Сонце
    drawPixelDisc(skx, W * 0.5, gY * 0.3, B * 5, B, "rgba(255, 240, 180, 0.3)");
    drawPixelDisc(skx, W * 0.5, gY * 0.3, B * 3.5, B, "#fff6d0");

    // Промені, що падають крізь хмари (намальовані просто в небо — без зайвого копіювання щокадру)
    const rx = skx;
    rx.fillStyle = "rgba(255, 240, 190, 0.14)";
    for (let i = 0; i < 6; i++) {
        const a = -0.9 + i * 0.36;
        rx.beginPath();
        rx.moveTo(W * 0.5, gY * 0.3);
        rx.lineTo(W * 0.5 + Math.tan(a) * gY * 1.2 - B * 3, gY);
        rx.lineTo(W * 0.5 + Math.tan(a) * gY * 1.2 + B * 3, gY);
        rx.closePath();
        rx.fill();
    }

    // Велика шестерня з золота
    const gearR = Math.round(gY * 0.22);
    const gear = makeCanvas(gearR * 2 + B * 2, gearR * 2 + B * 2);
    const gx = gear.getContext("2d");
    const gc = gear.width / 2;
    gx.fillStyle = "rgba(255, 214, 90, 0.6)";
    for (let t = 0; t < 16; t++) {
        const a = t * Math.PI * 2 / 16;
        gx.save();
        gx.translate(gc + Math.cos(a) * gearR, gc + Math.sin(a) * gearR);
        gx.rotate(a);
        gx.fillRect(-B * 0.6, -B * 0.5, B * 1.2, B);
        gx.restore();
    }
    gx.beginPath();
    gx.arc(gc, gc, gearR, 0, Math.PI * 2);
    gx.arc(gc, gc, gearR * 0.55, 0, Math.PI * 2, true);
    gx.fill();
    gx.fillRect(gc - B * 0.4, gc - gearR * 0.6, B * 0.8, gearR * 1.2);
    gx.fillRect(gc - gearR * 0.6, gc - B * 0.4, gearR * 1.2, B * 0.8);

    // Острови трьох планів
    const stripW = Math.ceil(W * 1.5 / B) * B;
    const layers = [];
    const specs = [
        { h: gY * 0.5, count: 4, wMin: 4, wMax: 6, big: false, tint: "rgba(120, 150, 220, 0.45)" },
        { h: gY * 0.6, count: 3, wMin: 6, wMax: 8, big: false, tint: "rgba(120, 150, 220, 0.2)" },
        { h: gY * 0.62, count: 2, wMin: 9, wMax: 11, big: true, tint: null }
    ];
    for (const spec of specs) {
        const layer = makeCanvas(stripW, Math.round(spec.h));
        const lx = layer.getContext("2d");
        const gap = stripW / spec.count;
        for (let i = 0; i < spec.count; i++) {
            const w = (spec.wMin + Math.floor(rng() * (spec.wMax - spec.wMin + 1))) * B;
            const x = Math.round((i * gap + rng() * (gap - w)) / B) * B;
            const baseY = Math.round(layer.height * (0.45 + rng() * 0.3));
            drawTempleIsland(lx, x, baseY, w, B, rng, spec.big);
        }
        if (spec.tint) {
            lx.globalCompositeOperation = "source-atop";
            lx.fillStyle = spec.tint;
            lx.fillRect(0, 0, layer.width, layer.height);
            lx.globalCompositeOperation = "source-over";
        }
        layers.push(layer);
    }

    // Море хмар унизу
    const cols = Math.ceil(W * 1.4 / B);
    const cloudH = periodicHeights(cols, 2.5, [{ amp: 1.2, k: 6, ph: 0.3 }, { amp: 0.8, k: 13, ph: 1.4 }]);
    const clouds = makeCanvas(cols * B, (Math.max.apply(null, cloudH) + 1) * B);
    const cx = clouds.getContext("2d");
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < cloudH[c]; r++) {
            cx.fillStyle = r === 0 ? "#ffffff" : r === 1 ? "#f0eefa" : "#d8d8ee";
            cx.fillRect(c * B, clouds.height - (cloudH[c] - r) * B, B, B);
        }
    }
    return {
        W: W, H: H, sky: sky, layers: layers, clouds: clouds,
        gearBig: buildGearFrames(gear, 1), gearSmall: buildGearFrames(gear, 0.6)
    };
}

// Шестерня має 16 зубців, тож поворот повторюється кожні 1/16 оберту.
// Кілька кадрів повороту малюються заздалегідь — поворот щокадру коштує дорого
const GEAR_FRAMES = 8;
const GEAR_TEETH = 16;

function buildGearFrames(gear, scale) {
    const size = Math.ceil(gear.width * scale);
    const frames = [];
    for (let i = 0; i < GEAR_FRAMES; i++) {
        const f = makeCanvas(size, size);
        const fx = f.getContext("2d");
        fx.translate(size / 2, size / 2);
        fx.rotate(i / GEAR_FRAMES * Math.PI * 2 / GEAR_TEETH);
        fx.scale(scale, scale);
        fx.drawImage(gear, -gear.width / 2, -gear.height / 2);
        frames.push(f);
    }
    return frames;
}

function drawGearFrame(ctx, frames, cx, cy, angle) {
    const step = Math.PI * 2 / GEAR_TEETH;
    const a = ((angle % step) + step) % step;
    const f = frames[Math.floor(a / step * GEAR_FRAMES) % GEAR_FRAMES];
    ctx.drawImage(f, Math.round(cx - f.width / 2), Math.round(cy - f.height / 2));
}

// Орел, що ширяє, зрідка змахуючи крилами
function drawEagle(ctx, x, y, B, time, phase) {
    const flap = Math.sin(time * 2.5 + phase) > 0.6;
    const u = B * 0.45;
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(x, y, u * 3, u);
    ctx.fillRect(x + u * 3, y + u * 0.2, u * 1.4, u * 0.6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - u * 1.2, y - u * 0.3, u * 1.4, u);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x - u * 1.8, y, u * 0.7, u * 0.4);
    ctx.fillStyle = "#4a3018";
    const dir = flap ? -1 : 0.25;
    for (let k = 1; k <= 4; k++) {
        ctx.fillRect(x + u * 1.5 - k * u * 1.2, y + dir * k * u * 0.8, u * 1.3, u * 0.6);
        ctx.fillRect(x + u * 1.5 + (k - 1) * u * 1.2, y + dir * k * u * 0.8, u * 1.3, u * 0.6);
    }
}

BackgroundRenderer.renderSkyCitadel = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._skyCitadel;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSkyCitadel(W, H, groundY, B);
        this._skyCitadel = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    ctx.drawImage(st.sky, 0, 0);

    // Золоті кільця й шестерня повільно обертаються
    const cx = W * 0.5;
    const cy = gY * 0.3;
    ctx.strokeStyle = "rgba(255, 210, 90, 0.45)";
    ctx.lineWidth = Math.max(2, B / 4);
    for (let k = 0; k < 3; k++) {
        const rr = gY * (0.2 + k * 0.07);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * (0.25 + 0.2 * Math.sin(time * 0.3 + k)), time * (0.15 + k * 0.07) * (k % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.stroke();
    }
    drawGearFrame(ctx, st.gearBig, W * 0.18, gY * 0.26, time * 0.2);
    drawGearFrame(ctx, st.gearSmall, W * 0.84, gY * 0.2, -time * 0.3);

    // Сходження: з прогресом острови й хмари опускаються — ніби ми злітаємо вгору
    const rise = Math.round(progress * B * 5);
    const factors = [0.08, 0.16, 0.3];
    for (let i = 0; i < st.layers.length; i++) {
        const bob = Math.round(Math.sin(time * 0.8 + i * 1.3) * B * 0.25);
        drawScrollingStrip(ctx, st.layers[i], W, gY - B * (2 - i * 0.5) + rise * (i + 1) * 0.5 + bob, time, speed, factors[i]);
    }

    for (let i = 0; i < 3; i++) {
        const lp = W + B * 10;
        const ex = W + B * 3 - ((time * (B * 2.2 + i * B * 0.6) + i * W * 0.35) % lp);
        const ey = gY * (0.14 + i * 0.1) + Math.sin(time * 0.9 + i * 2) * B;
        drawEagle(ctx, Math.round(ex), Math.round(ey), B, time, i * 2.3);
    }

    drawScrollingStrip(ctx, st.clouds, W, gY + rise, time, speed, 0.45);
};

// ---------- 19. Піратська бухта ----------

function buildPirateBay(W, H, groundY, B) {
    const rng = pixelRng(1920);
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.58);
    const sky = makeSky(W, H, [[0, "#2a1450"], [0.35, "#8a2a6a"], [0.58, "#ff8a4a"], [1, "#0a3a5a"]]);
    const sx = sky.getContext("2d");
    // Сонце, що сідає в море
    const sunR = Math.round(H * 0.09);
    const sunX = Math.round(W * 0.3);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    sx.fillStyle = "#ffd36b";
    for (let y = -sunR; y < sunR; y += B / 2) {
        const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
        sx.fillRect(Math.round(sunX - half), horizon - sunR * 0.3 + y, Math.round(half * 2), B / 2);
    }
    sx.restore();
    // Море
    const sea = sx.createLinearGradient(0, horizon, 0, gY);
    sea.addColorStop(0, "#1f6a9a");
    sea.addColorStop(1, "#0a2f4f");
    sx.fillStyle = sea;
    sx.fillRect(0, horizon, W, gY - horizon);
    // Сонячна доріжка на воді
    sx.fillStyle = "rgba(255, 210, 120, 0.35)";
    for (let y = horizon + 4; y < gY; y += 8) {
        const w = sunR * (0.6 + (y - horizon) / (gY - horizon) * 1.4) * (0.6 + rng() * 0.4);
        sx.fillRect(Math.round(sunX - w / 2), y, Math.round(w), 3);
    }
    // Далекий острів
    sx.fillStyle = "#1a3a2a";
    const islX = Math.round(W * 0.78);
    sx.fillRect(islX - B * 4, horizon - B, B * 8, B);
    sx.fillRect(islX - B * 2, horizon - B * 2, B * 4, B);

    // Пляж з пальмами та скринями в ближній смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const beach = makeCanvas(stripW, B * 7);
    const bx = beach.getContext("2d");
    const top = beach.height - B;
    for (let x = 0; x < stripW; x += B) {
        bx.fillStyle = (x / B) % 2 === 0 ? "#e8c07a" : "#dab06a";
        bx.fillRect(x, top, B, B);
        bx.fillStyle = "#f5d89a";
        bx.fillRect(x, top, B, B / 5);
    }
    for (let x = B * 3; x < stripW - B * 5; x += B * (10 + Math.floor(rng() * 5))) {
        // Пальма з вигнутим стовбуром
        for (let k = 0; k < 5; k++) {
            bx.fillStyle = k % 2 === 0 ? "#8a5a2a" : "#7a4a1e";
            bx.fillRect(x + Math.round(k * k * 0.12) * B / 2, top - (k + 1) * B, B * 0.7, B);
        }
        const cx = x + B;
        const cy = top - B * 5.5;
        bx.fillStyle = "#2f9a3a";
        bx.fillRect(cx - B * 2.5, cy, B * 2.5, B / 2);
        bx.fillRect(cx, cy, B * 2.5, B / 2);
        bx.fillRect(cx - B * 3, cy + B / 2, B, B / 2);
        bx.fillRect(cx + B * 2, cy + B / 2, B, B / 2);
        bx.fillRect(cx - B / 2, cy - B, B * 1.5, B);
        bx.fillStyle = "#6a3a1a";
        bx.fillRect(cx, cy + B / 2, B / 2, B / 2);
        // Скриня біля деяких пальм
        if (rng() < 0.5) {
            bx.fillStyle = "#8a4b1c";
            bx.fillRect(x + B * 3, top - B, B * 1.4, B);
            bx.fillStyle = "#ffcc33";
            bx.fillRect(x + B * 3.55, top - B * 0.7, B * 0.3, B * 0.3);
        }
    }
    return { W: W, H: H, sky: sky, beach: beach, horizon: horizon };
}

// Піратський корабель із вітрилами та прапором (малюється щокадру — гойдається на хвилях)
function drawPirateShip(ctx, x, y, B, time) {
    const bob = Math.round(Math.sin(time * 1.4) * B * 0.25);
    const yy = y + bob;
    // Корпус
    ctx.fillStyle = "#4a2a14";
    ctx.fillRect(x, yy, B * 9, B * 1.5);
    ctx.fillRect(x + B * 0.5, yy + B * 1.5, B * 8, B * 0.6);
    ctx.fillRect(x + B * 7.5, yy - B, B * 2, B);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x, yy + B * 0.4, B * 9, B / 6);
    ctx.fillStyle = "#1a0e06";
    for (let k = 0; k < 3; k++) {
        ctx.fillRect(x + B * (1.5 + k * 2), yy + B * 0.8, B / 3, B / 3);
    }
    // Щогли та вітрила
    ctx.fillStyle = "#3a2010";
    ctx.fillRect(x + B * 3, yy - B * 6, B / 4, B * 6);
    ctx.fillRect(x + B * 6, yy - B * 5, B / 4, B * 5);
    const puff = Math.round(Math.sin(time * 1.1) * B * 0.15);
    ctx.fillStyle = "#f0e6d0";
    ctx.fillRect(x + B * 1.8, yy - B * 5.5, B * 2.6 + puff, B * 2.2);
    ctx.fillRect(x + B * 1.8, yy - B * 3, B * 2.6 + puff, B * 1.8);
    ctx.fillRect(x + B * 4.9, yy - B * 4.5, B * 2.4 + puff, B * 2);
    // Прапор із черепом
    const wave = Math.round(Math.sin(time * 6) * B * 0.1);
    ctx.fillStyle = "#111111";
    ctx.fillRect(x + B * 3.25, yy - B * 6 + wave, B * 1.4, B * 0.9);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + B * 3.7, yy - B * 5.85 + wave, B * 0.5, B * 0.4);
    ctx.fillRect(x + B * 3.6, yy - B * 5.35 + wave, B * 0.7, B * 0.12);
}

BackgroundRenderer.renderPirateBay = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pirateBay;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPirateBay(W, H, groundY, B);
        this._pirateBay = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    // Хвилі на морі
    ctx.fillStyle = "rgba(200, 235, 255, 0.25)";
    const wo = (time * 25) % (B * 3);
    for (let y = hz + 6, row = 0; y < gY - B; y += B * 0.8, row++) {
        for (let x = -wo + (row % 2) * B * 1.5; x < W; x += B * 3) {
            ctx.fillRect(Math.round(x), Math.round(y), B, 2);
        }
    }
    // Корабель повільно пливе по горизонту
    const span = W + B * 20;
    const shipX = Math.round(W - ((time * 22) % span));
    drawPirateShip(ctx, shipX, hz - B * 0.8, B, time);
    // Чайки
    for (let i = 0; i < 4; i++) {
        const x = Math.round(((i * 413 + time * (35 + i * 8)) % (W + B * 6)) - B * 3);
        const y = Math.round(hz * (0.2 + i * 0.1) + Math.sin(time * 1.3 + i) * B * 0.6);
        const flap = Math.sin(time * 9 + i) > 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, B / 3, B / 5);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
    }
    drawScrollingStrip(ctx, st.beach, W, gY, time, speed, 0.3);
};

// ---------- 21. Орбіта: вид на планету з космічної станції ----------

function buildOrbitView(W, H, groundY, B) {
    const rng = pixelRng(2121);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010104"], [1, "#050818"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY, 150, rng, B);
    // Місяць
    sx.fillStyle = "#c8ccd8";
    const mx = Math.round(W * 0.85);
    const my = Math.round(gY * 0.15);
    const mr = B * 1.5;
    for (let y = -mr; y < mr; y += B / 3) {
        const half = Math.sqrt(Math.max(0, mr * mr - y * y));
        sx.fillRect(Math.round(mx - half), my + y, Math.round(half * 2), B / 3);
    }
    sx.fillStyle = "#a0a4b0";
    sx.fillRect(mx - B / 2, my - B / 3, B / 2, B / 2);
    sx.fillRect(mx + B / 3, my + B / 3, B / 3, B / 3);
    // Поверхня планети: континенти та хмари в смузі, що прокручується (планета обертається)
    const texW = Math.ceil(W * 1.6 / B) * B;
    const texH = Math.round(gY * 0.6);
    const tex = makeCanvas(texW, texH);
    const tx = tex.getContext("2d");
    tx.fillStyle = "#1a4a9a";
    tx.fillRect(0, 0, texW, texH);
    const cellW = B;
    const cols = texW / cellW;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < texH / cellW; r++) {
            const n = Math.sin(c * 0.35) + Math.sin(c * 0.13 + r * 0.4) + Math.sin(r * 0.5 + c * 0.07) * 0.8;
            if (n > 0.9) {
                tx.fillStyle = n > 1.8 ? "#e8e0c0" : n > 1.3 ? "#3f8a3a" : "#5aa84a";
                tx.fillRect(c * cellW, r * cellW, cellW, cellW);
            }
        }
    }
    // Хмари
    tx.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let i = 0; i < 25; i++) {
        const cx = Math.round(rng() * cols) * cellW;
        const cy = Math.round(rng() * texH / cellW) * cellW;
        const len = 2 + Math.floor(rng() * 5);
        tx.fillRect(cx, cy, len * cellW, cellW / 2);
        tx.fillRect(cx + cellW, cy - cellW / 2, (len - 2) * cellW, cellW / 2);
    }
    return { W: W, H: H, sky: sky, tex: tex, planetR: W * 1.1, planetCx: W * 0.5, planetCy: gY + W * 1.1 - texH * 0.55 };
}

BackgroundRenderer.renderOrbitView = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._orbitView;
    if (!st || st.W !== W || st.H !== H) {
        st = buildOrbitView(W, H, groundY, B);
        this._orbitView = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Атмосфера — світне кільце над краєм планети
    ctx.strokeStyle = "rgba(90, 170, 255, 0.35)";
    ctx.lineWidth = B;
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR + B * 0.6, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    // Планета: поверхня обрізана колом і прокручується
    ctx.save();
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR, 0, Math.PI * 2);
    ctx.clip();
    const texW = st.tex.width;
    const offset = Math.round(time * speed * 0.05) % texW;
    const texTop = gY - st.tex.height;
    for (let x = -offset; x < W; x += texW) {
        ctx.drawImage(st.tex, x, texTop);
    }
    // Нічна тінь з одного боку
    const shade = ctx.createLinearGradient(0, 0, W, 0);
    shade.addColorStop(0, "rgba(0, 0, 20, 0)");
    shade.addColorStop(0.7, "rgba(0, 0, 20, 0.1)");
    shade.addColorStop(1, "rgba(0, 0, 20, 0.6)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, texTop, W, st.tex.height);
    ctx.restore();

    // Космічна станція: модулі, сонячні панелі, вогники
    const stX = Math.round(W * 0.22);
    const stY = Math.round(gY * 0.22 + Math.sin(time * 0.5) * B * 0.3);
    ctx.fillStyle = "#2a4a8a";
    for (const side of [-1, 1]) {
        for (let k = 0; k < 3; k++) {
            ctx.fillRect(stX + side * (B * 2 + k * B * 1.1) - (side < 0 ? B : 0), stY - B * 1.2, B, B * 2.4);
        }
    }
    ctx.fillStyle = "#6a7a9a";
    ctx.fillRect(stX - B * 2, stY - B / 6, B * 4, B / 3);
    ctx.fillStyle = "#e8ecf2";
    ctx.fillRect(stX - B, stY - B / 2, B * 2, B);
    ctx.fillRect(stX - B / 3, stY - B * 1.3, B * 0.66, B * 0.8);
    ctx.fillStyle = "#39c6ff";
    ctx.fillRect(stX - B * 0.6, stY - B / 4, B / 3, B / 3);
    ctx.fillRect(stX + B * 0.3, stY - B / 4, B / 3, B / 3);
    ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ff3355" : "#551122";
    ctx.fillRect(stX - B / 8, stY - B * 1.5, B / 4, B / 4);
    ctx.fillStyle = Math.sin(time * 4 + 2) > 0 ? "#39ff88" : "#114422";
    ctx.fillRect(stX + B * 5.4, stY - B / 8, B / 4, B / 4);
    // Супутники пролітають
    for (let i = 0; i < 2; i++) {
        const period = 9 + i * 4;
        const t = ((time + i * 5) % period) / period;
        const x = Math.round(-B * 3 + t * (W + B * 6));
        const y = Math.round(gY * (0.35 + i * 0.12) - Math.sin(t * Math.PI) * B * 2);
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(x, y, B * 0.6, B * 0.6);
        ctx.fillStyle = "#2a4a8a";
        ctx.fillRect(x - B, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillStyle = Math.sin(time * 6 + i) > 0 ? "#ffffff" : "#888888";
        ctx.fillRect(x + B * 0.2, y - B * 0.3, B / 5, B / 5);
    }
};

export { drawPirateShip };
