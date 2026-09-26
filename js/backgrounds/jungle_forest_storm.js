// backgrounds/jungle_forest_storm.js — джунглі з храмом, цифровий ліс, грозове небо

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, drawPixelDisc, drawScrollingStrip, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { _fx } from "./effects.js";

// ---------- 5. Джунглі з храмом ----------
// Ранок у джунглях: туманні гори, водоспад зі скелі з піною та бризками,
// ступінчаста піраміда з різьбленою панеллю, смуга джунглів, ліани згори,
// папуги перелітають, мавпи гойдаються на ліанах.

function buildJungleTemple(W, H, groundY, B) {
    const rng = pixelRng(505);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#4ab0c8"], [0.55, "#a8e0d0"], [1, "#e8f4d0"]]);
    const cols = Math.ceil(W * 1.4 / B);

    // Туманні гори двох планів
    function range(base, amps, color, color2, seed) {
        const r = pixelRng(seed);
        const hs = periodicHeights(cols, base, amps);
        const c = makeCanvas(cols * B, (Math.max.apply(null, hs) + 1) * B);
        const x = c.getContext("2d");
        for (let k = 0; k < cols; k++) {
            x.fillStyle = r() < 0.5 ? color : color2;
            x.fillRect(k * B, c.height - hs[k] * B, B, hs[k] * B);
        }
        return c;
    }
    const far = range(8, [{ amp: 3, k: 2, ph: 0.3 }, { amp: 1.5, k: 5, ph: 1.2 }], "#7ab8b0", "#78b4ac", 5051);
    const mid = range(5, [{ amp: 2, k: 3, ph: 1.7 }, { amp: 1, k: 8, ph: 0.4 }], "#4a9a7a", "#489676", 5052);

    // Піраміда-храм (великий орієнтир)
    const pyrW = B * 14;
    const pyramid = makeCanvas(pyrW, B * 9);
    const px = pyramid.getContext("2d");
    for (let t = 0; t < 7; t++) {
        const w = pyrW - t * B * 2;
        const x0 = t * B;
        for (let k = 0; k < w; k += B) {
            px.fillStyle = (k / B + t) % 2 === 0 ? "#8a8a6a" : "#7e7e60";
            px.fillRect(x0 + k, pyramid.height - (t + 1) * B, B, B);
        }
        px.fillStyle = "#5a8a4a";
        px.fillRect(x0 + (rng() * (w - B)), pyramid.height - (t + 1) * B, B * 0.8, B * 0.3);
    }
    // Сходи посередині
    px.fillStyle = "#6a6a50";
    for (let t = 0; t < 7; t++) {
        px.fillRect(pyrW / 2 - B, pyramid.height - (t + 1) * B, B * 2, B * 0.2);
    }
    // Святилище зверху з різьбленою панеллю
    px.fillStyle = "#7e7e60";
    px.fillRect(pyrW / 2 - B * 2, pyramid.height - B * 9, B * 4, B * 2);
    px.fillStyle = "#3a3a2a";
    px.fillRect(pyrW / 2 - B * 0.8, pyramid.height - B * 8.4, B * 1.6, B * 1.4);

    // Смуга джунглів: кущі, пальми, великі листки
    const jW = Math.ceil(W * 1.5 / B) * B;
    const jH = Math.round(B * 7);
    const jungle = makeCanvas(jW, jH);
    const jx = jungle.getContext("2d");
    for (let x = 0; x < jW; x += B) {
        const h = 1.5 + Math.sin(x / B * 0.7) * 0.6 + rng() * 0.8;
        jx.fillStyle = rng() < 0.5 ? "#2a7a3a" : "#257034";
        jx.fillRect(x, jH - h * B, B, h * B);
    }
    const vines = [];
    for (let x = B * 2; x < jW; x += B * (5 + Math.floor(rng() * 4))) {
        const th = 3 + Math.floor(rng() * 3);
        jx.fillStyle = "#6a4a2a";
        jx.fillRect(x, jH - th * B, B * 0.4, th * B);
        for (let f = -3; f <= 3; f++) {
            jx.fillStyle = f % 2 === 0 ? "#3aa04a" : "#2f8a3a";
            jx.fillRect(x + f * B * 0.6 - B * 0.2, jH - th * B - Math.abs(f) * -B * 0.2 - B * 0.3, B * 0.8, B * 0.35);
        }
        if (rng() < 0.4) {
            // Квітка
            jx.fillStyle = "#ff5a8a";
            jx.fillRect(x + B, jH - B * 1.8, B * 0.5, B * 0.5);
        }
        vines.push(x);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, pyramid: pyramid, jungle: jungle, vines: vines };
}

// Папуга з двокадровими крилами
function drawParrot(ctx, x, y, B, time, colors, phase) {
    const up = Math.sin(time * 9 + phase) > 0;
    const u = B * 0.4;
    ctx.fillStyle = colors[0];
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(u * 2.4), Math.round(u));
    ctx.fillRect(Math.round(x + u * 2.4), Math.round(y + u * 0.3), Math.round(u * 1.6), Math.round(u * 0.4));
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(Math.round(x - u * 0.4), Math.round(y + u * 0.2), Math.round(u * 0.4), Math.round(u * 0.4));
    ctx.fillStyle = colors[1];
    ctx.fillRect(Math.round(x + u * 0.6), Math.round(y + (up ? -u * 1.4 : u * 0.8)), Math.round(u * 1.4), Math.round(u * 1.2));
}

BackgroundRenderer.renderJungleTemple = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._jungleTemple;
    if (!st || st.W !== W || st.H !== H) {
        st = buildJungleTemple(W, H, groundY, B);
        this._jungleTemple = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY - B * 3, time, speed, 0.03);

    // Водоспад зі скелі на далекому плані
    const fx = Math.round(W * 0.2);
    const cliffTop = Math.round(gY * 0.2);
    ctx.fillStyle = "#5a7a6a";
    ctx.fillRect(fx - B * 3, cliffTop, B * 7, gY - cliffTop);
    ctx.fillStyle = "#4a6a5a";
    ctx.fillRect(fx - B * 3, cliffTop, B * 1.5, gY - cliffTop);
    ctx.fillStyle = "#3a8a4a";
    ctx.fillRect(fx - B * 3.4, cliffTop - B * 0.6, B * 7.8, B * 0.8);
    ctx.fillStyle = "#c8f0ff";
    ctx.fillRect(fx - B * 0.2, cliffTop, B * 2.4, gY - cliffTop);
    const step = B * 0.8;
    const sh = (time * B * 10) % step;
    ctx.fillStyle = "#ffffff";
    for (let y = cliffTop + sh; y < gY; y += step) {
        ctx.fillRect(fx + ((y / step) % 2 < 1 ? 0 : B * 1.2), Math.round(y), Math.round(B * 0.8), Math.round(B * 0.4));
    }
    for (let k = 0; k < 6; k++) {
        const q = (time * 0.8 + k / 6) % 1;
        ctx.globalAlpha = (1 - q) * 0.6;
        drawPixelDisc(ctx, fx + B + (k % 2 === 0 ? -1 : 1) * q * B * 3, gY - B * 3 - q * B * 2, B * (0.6 + q), B / 4, "#ffffff");
    }
    ctx.globalAlpha = 1;

    drawScrollingStrip(ctx, st.mid, W, gY - B * 2, time, speed, 0.07);
    // Піраміда повільно наближається до центру з прогресом рівня, щоб у фіналі храм був на видноті
    const pw = st.pyramid.width;
    const ppx = W * 0.85 - (_fx.progress || 0) * W * 0.45 - pw / 2;
    const pTop = gY - B * 3 - st.pyramid.height;
    ctx.drawImage(st.pyramid, Math.round(ppx), pTop);
    // У фіналі храм прокидається: панель палає золотом, із вершини б'є промінь
    const awake = smoothStep(((_fx.progress || 0) - 0.63) / 0.08);
    if (awake > 0) {
        const cx = ppx + pw / 2;
        ctx.fillStyle = "rgba(255, 230, 120, " + (0.18 * awake).toFixed(3) + ")";
        ctx.fillRect(Math.round(cx - B * 1.2), 0, Math.round(B * 2.4), Math.round(pTop + B * 0.6));
        ctx.fillStyle = "#ffd700";
        ctx.globalAlpha = awake * (0.7 + 0.3 * Math.sin(time * 5));
        ctx.fillRect(Math.round(cx - B * 0.8), Math.round(pTop + B * 0.6), Math.round(B * 1.6), Math.round(B * 1.4));
        ctx.globalAlpha = 1;
    }

    // Папуги
    const cols = [["#ff3344", "#3a6aff"], ["#3a9aff", "#ffe14d"], ["#39c65a", "#ff3344"]];
    for (let i = 0; i < 3; i++) {
        const k = ((time * (0.09 + i * 0.03) + i * 0.33) % 1);
        const x = W * 1.1 - k * W * 1.3;
        const y = gY * (0.2 + i * 0.1) + Math.sin(time * 2 + i) * B * 0.6;
        drawParrot(ctx, x, y, B, time, cols[i], i * 2);
    }

    // Джунглі з мавпами на ліанах
    const jW = st.jungle.width;
    const jOff = Math.round(time * speed * 0.35) % jW;
    const jTop = gY - st.jungle.height;
    for (let x = -jOff; x < W; x += jW) {
        ctx.drawImage(st.jungle, x, jTop);
        for (let i = 0; i < st.vines.length; i += 3) {
            const vx = x + st.vines[i];
            if (vx < -B * 4 || vx > W + B * 4) {
                continue;
            }
            const ang = Math.sin(time * 1.8 + i) * 0.6;
            const len = B * 4;
            const ax = vx;
            const ay = jTop - B * 2;
            const ex = ax + Math.sin(ang) * len;
            const ey = ay + Math.cos(ang) * len;
            ctx.strokeStyle = "#3a7a2a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.fillStyle = "#7a4a2a";
            ctx.fillRect(Math.round(ex - B * 0.4), Math.round(ey), Math.round(B * 0.8), Math.round(B * 0.9));
            ctx.fillStyle = "#e8c8a0";
            ctx.fillRect(Math.round(ex - B * 0.25), Math.round(ey + B * 0.15), Math.round(B * 0.5), Math.round(B * 0.35));
            ctx.fillStyle = "#7a4a2a";
            ctx.fillRect(Math.round(ex + B * 0.3), Math.round(ey + B * 0.8), Math.round(B * 0.2), Math.round(B * 0.8));
        }
    }
    // Ліани, що звисають згори
    for (let i = 0; i < 6; i++) {
        const vx = ((i * W / 6 - time * speed * 0.5) % W + W) % W;
        const len = B * (3 + (i % 3) * 1.5);
        ctx.fillStyle = "#2a6a2a";
        ctx.fillRect(Math.round(vx), 0, Math.max(2, Math.round(B / 5)), Math.round(len));
        for (let k = 0; k < len; k += B) {
            ctx.fillStyle = "#3a9a3a";
            ctx.fillRect(Math.round(vx + (k / B % 2 === 0 ? -B * 0.4 : B * 0.1)), Math.round(k + B * 0.4), Math.round(B * 0.4), Math.round(B * 0.3));
        }
    }
};

// ---------- 6. Цифровий ліс ----------
// Ліс усередині комп'ютера: у глибині падає цифровий дощ із символів,
// три шари різних дерев (ялини, круглі крони, високі стовбури з кодом),
// смуги туману, світний струмок із пакетами даних, гриби й квіти біля землі.

// Крихітні піксельні «символи» 3×3 для цифрового дощу
const CODE_GLYPHS = ["101", "010", "111", "110", "011", "100", "001"];

function buildDigitalForest(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010805"], [0.6, "#03140a"], [1, "#062010"]]);

    function drawTree(fx, x, height, kind, r, colors) {
        const th = Math.round((0.35 + r() * 0.3) * height / B);
        if (kind === 0) {
            // Ялина: ярусні трикутники
            fx.fillStyle = colors.trunk;
            fx.fillRect(x + B * 1.2, height - th * B * 0.5, B * 0.6, th * B * 0.5);
            const tiers = 3 + Math.floor(r() * 2);
            for (let t = 0; t < tiers; t++) {
                const w = (tiers - t + 1) * 2 - 1;
                for (let row = 0; row < 2; row++) {
                    const rw = w - row * 2 + 2;
                    fx.fillStyle = row === 0 ? colors.leaf : colors.light;
                    fx.fillRect(x + B * 1.5 - (rw * B) / 2, height - th * B * 0.5 - (t * 1.4 + row + 1) * B, rw * B, B);
                }
            }
            return { x: x + B * 1.2, top: height - th * B * 0.5, h: th * B * 0.5 };
        }
        fx.fillStyle = colors.trunk;
        fx.fillRect(x + B, height - th * B, B, th * B);
        if (kind === 1) {
            // Кругла крона
            const rr = B * (1.6 + r());
            drawPixelDisc(fx, x + B * 1.5, height - th * B - rr * 0.6, rr, B / 2, colors.leaf);
            drawPixelDisc(fx, x + B * 1.2, height - th * B - rr * 0.9, rr * 0.5, B / 2, colors.light);
        } else {
            // Висока «піксельна» крона сходинками
            const crown = 2 + Math.floor(r() * 2);
            for (let row = 0; row < crown + 1; row++) {
                const w = crown * 2 + 1 - row * 2;
                fx.fillStyle = row % 2 === 0 ? colors.leaf : colors.light;
                fx.fillRect(x + B * 1.5 - (w * B) / 2, height - th * B - (row + 1) * B, w * B, B);
            }
        }
        return { x: x + B, top: height - th * B, h: th * B };
    }

    function forestStrip(stripW, colors, height, seed, gap) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const fx = strip.getContext("2d");
        const trees = [];
        for (let x = B; x < stripW - B * 3; x += B * (gap + Math.floor(r() * 3))) {
            trees.push(drawTree(fx, x, height, Math.floor(r() * 3), r, colors));
        }
        return { canvas: strip, trees: trees };
    }
    const back = forestStrip(Math.ceil(W * 1.6 / B) * B, { trunk: "#041a0c", leaf: "#062812", light: "#083016" }, Math.round(gY * 0.5), 600, 3);
    const far = forestStrip(Math.ceil(W * 1.5 / B) * B, { trunk: "#06200f", leaf: "#0a3318", light: "#0c3d1c" }, Math.round(gY * 0.6), 601, 4);
    const near = forestStrip(Math.ceil(W * 1.3 / B) * B, { trunk: "#0f3a1c", leaf: "#146b2e", light: "#1b8a3a" }, Math.round(gY * 0.75), 602, 6);

    // Підлісок: гриби та квіти
    const rng = pixelRng(603);
    const bushW = Math.ceil(W * 1.2 / B) * B;
    const bush = makeCanvas(bushW, B * 2);
    const bx = bush.getContext("2d");
    const glows = [];
    for (let x = 0; x < bushW; x += B) {
        bx.fillStyle = rng() < 0.5 ? "#0f4a22" : "#12562a";
        bx.fillRect(x, B * 1.4, B, B * 0.6);
        if (rng() < 0.18) {
            const c = rng() < 0.5 ? "#39ffd0" : "#ff5ad8";
            bx.fillStyle = "#c8e8d0";
            bx.fillRect(x + B * 0.4, B * 0.8, B * 0.2, B * 0.6);
            bx.fillStyle = c;
            bx.fillRect(x + B * 0.1, B * 0.6, B * 0.8, B * 0.3);
            glows.push({ x: x + B * 0.5, color: c, phase: rng() * 6 });
        }
    }
    return { W: W, H: H, sky: sky, back: back, far: far, near: near, bush: bush, glows: glows };
}

BackgroundRenderer.renderDigitalForest = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._digitalForest;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDigitalForest(W, H, groundY, B);
        this._digitalForest = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Цифровий дощ у глибині
    const cell = Math.max(2, Math.round(B / 5));
    const colW = B * 1.6;
    const cols = Math.ceil(W / colW);
    for (let c = 0; c < cols; c++) {
        const spd = 30 + ((c * 37) % 50);
        const len = 6 + (c % 5);
        const head = ((time * spd + c * 97) % (gY + len * cell * 4)) - len * cell * 4;
        for (let k = 0; k < len; k++) {
            const y = head - k * cell * 4;
            if (y < 0 || y > gY) {
                continue;
            }
            const g = CODE_GLYPHS[(c * 3 + k + Math.floor(time * 4)) % CODE_GLYPHS.length];
            ctx.fillStyle = k === 0 ? "rgba(200, 255, 210, 0.5)" : "rgba(0, 255, 90, " + (0.28 - k * 0.025).toFixed(3) + ")";
            for (let r = 0; r < 3; r++) {
                if (g[r] === "1") {
                    ctx.fillRect(Math.round(c * colW), Math.round(y + r * cell), cell * 2, cell);
                }
            }
        }
    }

    drawScrollingStrip(ctx, st.back.canvas, W, gY, time, speed, 0.05);
    ctx.fillStyle = "rgba(40, 255, 120, 0.05)";
    ctx.fillRect(0, gY - st.back.canvas.height * 0.6, W, st.back.canvas.height * 0.6);
    drawScrollingStrip(ctx, st.far.canvas, W, gY, time, speed, 0.1);
    ctx.fillStyle = "rgba(40, 255, 120, 0.06)";
    ctx.fillRect(0, gY - B * 4, W, B * 4);

    // Світний струмок із пакетами даних
    ctx.fillStyle = "rgba(0, 255, 140, 0.25)";
    ctx.fillRect(0, gY - B * 1.3, W, B * 0.5);
    const pk = B * 3;
    const po = (time * B * 5) % pk;
    for (let x = -po; x < W; x += pk) {
        ctx.fillStyle = "#b8ffd8";
        ctx.fillRect(Math.round(x), gY - B * 1.2, Math.round(B * 0.6), Math.round(B * 0.3));
    }

    const nearW = st.near.canvas.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.canvas.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near.canvas, x, top);
        // По стовбурах біжить зелений «код»
        for (let i = 0; i < st.near.trees.length; i++) {
            const tr = st.near.trees[i];
            const tx = x + tr.x;
            if (tx < -B || tx > W + B) {
                continue;
            }
            const c3 = B / 3;
            const head = (time * (60 + i * 7) + i * 50) % (tr.h + c3 * 6);
            for (let k = 0; k < 5; k++) {
                const y = head - k * c3;
                if (y < 0 || y > tr.h) {
                    continue;
                }
                ctx.fillStyle = k === 0 ? "#d8ffe0" : "rgba(0, 255, 90, " + (0.8 - k * 0.15).toFixed(2) + ")";
                ctx.fillRect(tx + c3, top + tr.top + y, c3, c3);
            }
        }
    }

    // Підлісок зі світними грибами
    const bW = st.bush.width;
    const bOff = Math.round(time * speed * 0.45) % bW;
    for (let x = -bOff; x < W; x += bW) {
        for (const g of st.glows) {
            const gx = x + g.x;
            if (gx < -B || gx > W + B) {
                continue;
            }
            ctx.globalAlpha = 0.15 + 0.15 * Math.sin(time * 3 + g.phase);
            ctx.fillStyle = g.color;
            ctx.fillRect(Math.round(gx - B * 0.8), gY - B * 1.8, Math.round(B * 1.6), Math.round(B * 1.2));
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(st.bush, x, gY - st.bush.height);
    }
    // Світлячки
    drawFallingPixels(ctx, W, gY, time, 25, 606, {
        color: "#c8ff5a", dir: -1, speedMin: 4, speedMax: 12, sizeMin: 2, sizeMax: 3,
        sway: 1.2, swayAmp: B * 1.5, alpha: 0.8
    });
};

// ---------- 7. Грозове небо ----------

// Сільські будівлі для ферми в грозу
function drawFarmBuilding(fx, kind, bx, farmH, B, windows, chimneys) {
    const g = farmH - B * 1;
    if (kind === "barn") {
        fx.fillStyle = "#5a1e1e";
        fx.fillRect(bx, g - B * 3, B * 4, B * 3);
        for (let k = 0; k < 3; k++) {
            fx.fillRect(bx + k * B * 0.6, g - B * 3 - (k + 1) * B * 0.5, B * 4 - k * B * 1.2, B * 0.5);
        }
        fx.fillStyle = "#e8e0d0";
        fx.fillRect(bx + B * 1.4, g - B * 1.6, B * 1.2, B * 1.6);
        fx.fillStyle = "#5a1e1e";
        fx.fillRect(bx + B * 1.5, g - B * 1.5, B, B * 1.4);
        windows.push({ x: bx + B * 0.4, y: g - B * 2.6 });
        windows.push({ x: bx + B * 3, y: g - B * 2.6 });
    } else if (kind === "house") {
        fx.fillStyle = "#6a5a4a";
        fx.fillRect(bx, g - B * 2.6, B * 4.4, B * 2.6);
        fx.fillStyle = "#3a2a2a";
        for (let k = 0; k < 3; k++) {
            fx.fillRect(bx - B * 0.3 + k * B * 0.8, g - B * 2.6 - (k + 1) * B * 0.5, B * 5 - k * B * 1.6, B * 0.5);
        }
        fx.fillStyle = "#4a3a3a";
        fx.fillRect(bx + B * 3.2, g - B * 4.4, B * 0.6, B * 1.2);
        chimneys.push({ x: bx + B * 3.5, y: g - B * 4.5 });
        windows.push({ x: bx + B * 0.5, y: g - B * 1.8 });
        windows.push({ x: bx + B * 3.1, y: g - B * 1.8 });
        fx.fillStyle = "#2a2018";
        fx.fillRect(bx + B * 1.8, g - B * 1.5, B * 0.8, B * 1.5);
    } else if (kind === "cowshed") {
        // Хлів: довга низька будівля з ламаним дахом, сіновалом і коровою у дверях
        fx.fillStyle = "#6a3a24";
        fx.fillRect(bx, g - B * 2, B * 5.4, B * 2);
        fx.fillStyle = "#4a2a1a";
        fx.fillRect(bx - B * 0.3, g - B * 2.5, B * 6, B * 0.5);
        fx.fillRect(bx + B * 0.4, g - B * 3, B * 4.6, B * 0.5);
        fx.fillRect(bx + B * 1.2, g - B * 3.4, B * 3, B * 0.4);
        fx.fillStyle = "#c8a040";
        fx.fillRect(bx + B * 2.2, g - B * 2.9, B * 1, B * 0.6);
        fx.fillStyle = "#2a1810";
        fx.fillRect(bx + B * 3.6, g - B * 1.5, B * 1.2, B * 1.5);
        fx.fillStyle = "#f0f0f0";
        fx.fillRect(bx + B * 3.7, g - B * 1.2, B * 0.9, B * 0.7);
        fx.fillStyle = "#2a2a2a";
        fx.fillRect(bx + B * 3.9, g - B * 1.1, B * 0.3, B * 0.3);
        fx.fillStyle = "#e8b0a0";
        fx.fillRect(bx + B * 3.9, g - B * 0.7, B * 0.5, B * 0.25);
        fx.fillStyle = "#e8e0d0";
        fx.fillRect(bx + B * 0.4, g - B * 1.5, B * 0.8, B * 0.1);
        windows.push({ x: bx + B * 0.5, y: g - B * 1.4 });
        windows.push({ x: bx + B * 1.8, y: g - B * 1.4 });
    } else if (kind === "haystack") {
        // Стіг сіна та возик
        for (let r = 0; r < 4; r++) {
            fx.fillStyle = r % 2 === 0 ? "#c8a040" : "#b89030";
            fx.fillRect(bx + r * B * 0.4, g - (r + 1) * B * 0.6, B * 3 - r * B * 0.8, B * 0.6);
        }
        fx.fillStyle = "#6a4a2a";
        fx.fillRect(bx + B * 3.4, g - B * 1.2, B * 2.2, B * 0.6);
        fx.fillStyle = "#c8a040";
        fx.fillRect(bx + B * 3.5, g - B * 1.6, B * 2, B * 0.4);
        fx.fillStyle = "#2a2018";
        fx.fillRect(bx + B * 3.6, g - B * 0.6, B * 0.6, B * 0.6);
        fx.fillRect(bx + B * 4.9, g - B * 0.6, B * 0.6, B * 0.6);
    } else if (kind === "cottage") {
        fx.fillStyle = "#c8b890";
        fx.fillRect(bx, g - B * 2, B * 3.6, B * 2);
        fx.fillStyle = "#8a6a2a";
        for (let k = 0; k < 3; k++) {
            fx.fillRect(bx - B * 0.3 + k * B * 0.6, g - B * 2 - (k + 1) * B * 0.45, B * 4.2 - k * B * 1.2, B * 0.45);
        }
        fx.fillStyle = "#4a3a2a";
        fx.fillRect(bx + B * 3.6, g - B * 1.2, B * 1.4, B * 0.2);
        fx.fillRect(bx + B * 4.8, g - B * 1.2, B * 0.2, B * 1.2);
        windows.push({ x: bx + B * 0.4, y: g - B * 1.4 });
        windows.push({ x: bx + B * 2.3, y: g - B * 1.4 });
    } else {
        fx.fillStyle = "#4a4458";
        fx.fillRect(bx + B * 0.4, g - B * 4, B * 0.3, B * 4);
        fx.fillRect(bx + B * 2.3, g - B * 4, B * 0.3, B * 4);
        fx.fillRect(bx + B * 0.4, g - B * 2, B * 2.2, B * 0.2);
        fx.fillStyle = "#6a6478";
        fx.fillRect(bx, g - B * 6, B * 3, B * 2);
        fx.fillStyle = "#5a5468";
        fx.fillRect(bx - B * 0.2, g - B * 6.4, B * 3.4, B * 0.4);
        windows.push({ x: bx + B * 1.2, y: g - B * 5.4 });
    }
}

function buildStormSky(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#06070f"], [0.7, "#161a2e"], [1, "#22283f"]]);
    const cols = Math.ceil(W / B) + 1;
    const sx = sky.getContext("2d");
    const hills = periodicHeights(cols, 3, [{ amp: 1.5, k: 2, ph: 0.5 }, { amp: 0.8, k: 6, ph: 2 }]);
    sx.fillStyle = "#121628";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Хатинка з вогником у вікні та дерева на пагорбах
    const hc = Math.round(cols * 0.62);
    const hTop = gY - hills[hc] * B;
    sx.fillStyle = "#1c2238";
    sx.fillRect(hc * B, hTop - B * 2, B * 3, B * 2);
    sx.fillRect(hc * B + B / 2, hTop - B * 3, B * 2, B);
    sx.fillStyle = "#ffcc55";
    sx.fillRect(hc * B + B, hTop - B * 1.5, B * 0.6, B * 0.6);
    for (const tc of [Math.round(cols * 0.18), Math.round(cols * 0.35), Math.round(cols * 0.85)]) {
        const tTop = gY - hills[tc] * B;
        sx.fillStyle = "#161b30";
        sx.fillRect(tc * B + B / 3, tTop - B * 2, B / 3, B * 2);
        sx.fillRect(tc * B - B / 2, tTop - B * 3.5, B * 2, B * 1.8);
    }
    function cloudStrip(stripW, color, colorLight, seed, rows) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, rows * B);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const hgt = rows - Math.floor(r() * 2) - (Math.sin(x / stripW * Math.PI * 6) > 0 ? 0 : 1);
            cx.fillStyle = color;
            cx.fillRect(x, 0, B, hgt * B);
            cx.fillStyle = colorLight;
            cx.fillRect(x, (hgt - 1) * B, B, B / 3);
        }
        return strip;
    }
    const far = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#1c2138", "#262c48", 701, 4);
    const near = cloudStrip(Math.ceil(W * 1.3 / B) * B, "#2a3050", "#3a4266", 702, 3);

    // Ферма на ближньому плані: поля, амбар, паркан; вітряки й дерева малюються щокадру
    const rng = pixelRng(7070);
    const farmW = Math.ceil(W * 1.5 / (B * 16)) * B * 16;
    const farmH = Math.round(B * 7);
    const farm = makeCanvas(farmW, farmH);
    const fx = farm.getContext("2d");
    for (let r = 0; r < 3; r++) {
        fx.fillStyle = r % 2 === 0 ? "#1f2a1c" : "#243020";
        fx.fillRect(0, farmH - (r + 1) * B * 0.6, farmW, B * 0.6);
    }
    const mills = [];
    const trees = [];
    const windows = [];
    const chimneys = [];
    const farmKinds = ["barn", "house", "cowshed", "haystack", "cottage", "tower"];
    for (let x = 0; x < farmW; x += B * 16) {
        // Будівля: щоразу інша (амбар, хата з димарем, хлів, стіг сіна, котедж, водонапірна вежа)
        drawFarmBuilding(fx, farmKinds[Math.floor(x / (B * 16)) % farmKinds.length], x + B * 1.5, farmH, B, windows, chimneys);
        // Вітряк
        const mx = x + B * 10;
        fx.fillStyle = "#3a3448";
        for (let k = 0; k < 6; k++) {
            fx.fillRect(mx - B * 0.8 + k * B * 0.1, farmH - B * 1 - (k + 1) * B * 0.8, B * 1.6 - k * B * 0.2, B * 0.8);
        }
        mills.push({ x: mx, y: farmH - B * 5.6 });
        // Паркан
        fx.fillStyle = "#4a3a2a";
        fx.fillRect(x + B * 6.5, farmH - B * 1.6, B * 2.5, B * 0.2);
        fx.fillRect(x + B * 6.5, farmH - B * 1.1, B * 2.5, B * 0.2);
        for (let k = 0; k < 4; k++) {
            fx.fillRect(x + B * 6.6 + k * B * 0.75, farmH - B * 1.9, B * 0.2, B * 1.3);
        }
        trees.push({ x: x + B * 13.5, h: 3 + Math.floor(rng() * 2) });
        trees.push({ x: x + B * 15, h: 2 + Math.floor(rng() * 2) });
    }
    return { W: W, H: H, sky: sky, far: far, near: near, farm: farm, mills: mills, trees: trees, windows: windows, chimneys: chimneys };
}

BackgroundRenderer.renderStormSky = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stormSky;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStormSky(W, H, groundY, B);
        this._stormSky = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Блискавка кожні ~3.5 с у різному місці
    const period = 3.5;
    const calm = smoothStep(((_fx.progress || 0) - 0.63) / 0.08);
    const phase = calm > 0.5 ? period : time % period;
    const strike = Math.floor(time / period);
    if (phase < 0.35) {
        const flash = 1 - phase / 0.35;
        ctx.fillStyle = "rgba(200, 210, 255, " + (0.25 * flash).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        const r = pixelRng(strike * 13 + 7);
        // Зигзаг блискавки: вертикальні відрізки, з'єднані горизонтальними, з ореолом
        let x = Math.round(W * (0.15 + r() * 0.7));
        let y = B * 3;
        const bw = Math.max(4, Math.round(B / 2.5));
        const segments = [];
        while (y < gY - B * 2) {
            const segH = B * (1 + Math.floor(r() * 2));
            const nx = x + (r() < 0.5 ? -1 : 1) * Math.round(B * 0.8);
            segments.push([x, y, segH, nx]);
            x = nx;
            y += segH;
        }
        for (let pass = 0; pass < 2; pass++) {
            const grow = pass === 0 ? bw : 0;
            ctx.fillStyle = pass === 0
                ? "rgba(140, 170, 255, " + (0.35 * flash).toFixed(3) + ")"
                : "rgba(255, 255, 255, " + flash.toFixed(3) + ")";
            for (const sg of segments) {
                ctx.fillRect(sg[0] - grow, sg[1] - grow, bw + grow * 2, sg[2] + grow * 2);
                ctx.fillRect(Math.min(sg[0], sg[3]) - grow, sg[1] + sg[2] - bw / 2 - grow, Math.abs(sg[3] - sg[0]) + bw + grow * 2, bw + grow * 2);
            }
        }
    }
    drawScrollingStrip(ctx, st.far, W, B * 5, time, speed, 0.04);
    drawScrollingStrip(ctx, st.near, W, B * 3, time, speed, 0.08);
    // Спалах підсвічує хмари
    if (phase < 0.35) {
        ctx.fillStyle = "rgba(200, 215, 255, " + (0.3 * (1 - phase / 0.35)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, B * 5);
    }
    // Ферма: вітер гне дерева, лопаті вітряків крутяться, у вікні світло
    const farmW = st.farm.width;
    const fOff = Math.round(time * speed * 0.3) % farmW;
    const fTop = gY - st.farm.height;
    const wind = 1 - calm * 0.7;
    for (let x = -fOff; x < W; x += farmW) {
        ctx.drawImage(st.farm, x, fTop);
        for (let i = 0; i < st.trees.length; i++) {
            const t = st.trees[i];
            const tx = x + t.x;
            if (tx < -B * 3 || tx > W + B * 3) {
                continue;
            }
            const sway = Math.sin(time * 2.2 + i) * B * 0.6 * wind + B * 0.3 * wind;
            ctx.fillStyle = "#2a2018";
            ctx.fillRect(Math.round(tx), fTop + st.farm.height - B * (t.h + 1), Math.round(B * 0.4), B * (t.h + 1));
            ctx.fillStyle = "#1e3a22";
            ctx.fillRect(Math.round(tx - B + sway), fTop + st.farm.height - B * (t.h + 3), B * 2.4, B * 2);
            ctx.fillStyle = "#26482a";
            ctx.fillRect(Math.round(tx - B * 0.5 + sway * 1.3), fTop + st.farm.height - B * (t.h + 3.6), B * 1.4, B * 0.8);
        }
        for (let i = 0; i < st.mills.length; i++) {
            const m = st.mills[i];
            const mx = x + m.x;
            if (mx < -B * 5 || mx > W + B * 5) {
                continue;
            }
            const my = fTop + m.y;
            const rot = time * (1.5 + 2 * wind) + i;
            ctx.strokeStyle = "#8a8098";
            ctx.lineWidth = Math.max(3, B / 3);
            ctx.beginPath();
            for (let k = 0; k < 4; k++) {
                const a = rot + k * Math.PI / 2;
                ctx.moveTo(mx, my);
                ctx.lineTo(mx + Math.cos(a) * B * 3, my + Math.sin(a) * B * 3);
            }
            ctx.stroke();
            ctx.fillStyle = "#c8c0d8";
            ctx.fillRect(Math.round(mx - B * 0.3), Math.round(my - B * 0.3), Math.round(B * 0.6), Math.round(B * 0.6));
        }
        // Дим із димарів відносить вітер
        for (let i = 0; i < st.chimneys.length; i++) {
            const c = st.chimneys[i];
            for (let k = 0; k < 4; k++) {
                const q = (time * 0.6 + k / 4 + i * 0.3) % 1;
                ctx.globalAlpha = (1 - q) * 0.35;
                drawPixelDisc(ctx, x + c.x - q * B * 3 * wind, fTop + c.y - q * B * 2.5, B * (0.3 + q * 0.6), B / 4, "#8a8a9a");
            }
            ctx.globalAlpha = 1;
        }
        for (let i = 0; i < st.windows.length; i++) {
            const w = st.windows[i];
            ctx.fillStyle = (time * 0.7 + i) % 5 < 4.6 ? "#ffcc55" : "#6a5020";
            ctx.fillRect(Math.round(x + w.x), fTop + w.y, Math.round(B * 0.6), Math.round(B * 0.5));
        }
    }
    // Блискавка на мить освітлює ферму
    if (phase < 0.35) {
        ctx.fillStyle = "rgba(200, 215, 255, " + (0.25 * (1 - phase / 0.35)).toFixed(3) + ")";
        ctx.fillRect(0, fTop, W, gY - fTop);
    }
    drawFallingPixels(ctx, W, gY, time, Math.round(70 * (1 - calm)), 707, {
        color: "#9fb4ff", dir: 1, speedMin: 450, speedMax: 650, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.4, stretch: 7
    });
};
