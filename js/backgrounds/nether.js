// backgrounds/nether.js — вогняний світ (рівень 31, бос): демон прокидається й підводиться з лави

import { BackgroundRenderer } from "./core.js";
import { drawBlockTerrain, drawFallingPixels, drawScrollingStrip, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { _fx } from "./effects.js";

// ---------- Вогняний світ (рівень 31, бос) ----------
// Бій із демоном у три фази за прогресом рівня:
// 1) Пробудження — з лави видно лише роги й голову, очі заплющені;
// 2) Лють — демон розплющує очі й стежить за кубиком, падають метеори, б'ють гейзери;
// 3) Битва — демон підводиться на весь зріст, рве ланцюги, б'ють червоні блискавки.
// Помилка гравця змушує демона ревіти, а краї екрана пульсують, як серце.

const DEMON_PLAYER_ANCHOR = 0.28;

// Силует демона в блоках: роги, голова, плечі, руки. Очі й паща малюються окремо
function buildDemonSprite(B) {
    const cols = 18;
    const rows = 20;
    const sprite = makeCanvas(cols * B, rows * B);
    const sx = sprite.getContext("2d");
    const rng = pixelRng(6666);
    const block = function (c, r, color) {
        sx.fillStyle = color || ((c + r) % 2 === 0 ? "#1c0505" : "#240707");
        sx.fillRect(c * B, r * B, B, B);
        if (!color && rng() < 0.18) {
            sx.fillStyle = "#3a0c08";
            sx.fillRect(c * B + B / 4, r * B + B / 4, B / 4, B / 4);
        }
    };
    // Роги, що вигинаються вгору й назовні: від темної основи до світлого кінчика
    const horn = [[5, 4], [4, 4], [4, 3], [3, 3], [3, 2], [2, 2], [2, 1], [1, 1], [1, 0]];
    const hornColors = ["#3a2a22", "#4a3a2e", "#5a4a3a", "#6e5e4a", "#827260", "#9a8a74", "#b4a48c", "#ccbca4", "#e8dcc4"];
    for (let i = 0; i < horn.length; i++) {
        block(horn[i][0], horn[i][1], hornColors[i]);
        block(cols - 1 - horn[i][0], horn[i][1], hornColors[i]);
    }
    // Голова
    for (let r = 4; r < 12; r++) {
        const inset = r < 5 ? 1 : r > 10 ? 1 : 0;
        for (let c = 5 + inset; c < 13 - inset; c++) {
            block(c, r);
        }
    }
    // Плечі та тулуб
    for (let r = 12; r < rows; r++) {
        const half = Math.min(9, 4 + (r - 12) * 2);
        for (let c = 9 - half; c < 9 + half; c++) {
            block(c, r);
        }
    }
    // Контурне світло лави знизу
    sx.globalCompositeOperation = "source-atop";
    const g = sx.createLinearGradient(0, rows * B * 0.4, 0, rows * B);
    g.addColorStop(0, "rgba(255, 80, 0, 0)");
    g.addColorStop(1, "rgba(255, 80, 0, 0.35)");
    sx.fillStyle = g;
    sx.fillRect(0, 0, sprite.width, sprite.height);
    sx.globalCompositeOperation = "source-over";
    // Розжарений контур, щоб силует читався на темному тлі
    const glow = makeCanvas(sprite.width, sprite.height);
    const gx = glow.getContext("2d");
    gx.drawImage(sprite, 0, 0);
    gx.globalCompositeOperation = "source-in";
    gx.fillStyle = "#c0300a";
    gx.fillRect(0, 0, glow.width, glow.height);
    const out = makeCanvas(sprite.width + B, sprite.height + B);
    const ox = out.getContext("2d");
    const e = Math.max(2, Math.round(B / 6));
    for (const d of [[-e, 0], [e, 0], [0, -e], [0, e]]) {
        ox.drawImage(glow, B / 2 + d[0], B / 2 + d[1]);
    }
    ox.drawImage(sprite, B / 2, B / 2);
    return {
        canvas: out,
        pad: B / 2,
        eyes: [{ x: 6.5 * B, y: 7 * B }, { x: 10.5 * B, y: 7 * B }],
        mouth: { x: 7 * B, y: 9.5 * B, w: 4 * B },
        wrists: [{ x: 2 * B, y: 17 * B }, { x: 16 * B, y: 17 * B }]
    };
}

// Червона віньєтка по краях: малюється раз у розмір екрана, щоб щокадру не розтягувати
function buildDemonVignette(W, H) {
    const v = makeCanvas(W, H);
    const vx = v.getContext("2d");
    vx.setTransform(W / 128, 0, 0, H / 128, 0, 0);
    const g = vx.createRadialGradient(64, 64, 30, 64, 64, 92);
    g.addColorStop(0, "rgba(255, 0, 0, 0)");
    g.addColorStop(1, "rgba(200, 0, 0, 0.9)");
    vx.fillStyle = g;
    vx.fillRect(0, 0, 128, 128);
    return v;
}

function buildPixelNether(W, H, groundY, B) {
    const rng = pixelRng(3131);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0d0000"], [0.5, "#2a0404"], [1, "#4a0a05"]]);

    // Скелі-стеля зверху (сталактити з вогняного каменю)
    const cols = Math.ceil(W * 1.4 / B);
    const ceilH = periodicHeights(cols, 3, [{ amp: 2, k: 4, ph: 0.2 }, { amp: 1, k: 9, ph: 1 }]);
    const ceil = makeCanvas(cols * B, (Math.max.apply(null, ceilH) + 1) * B);
    const cx = ceil.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ceilH[c]; r++) {
            cx.fillStyle = (r + c) % 2 === 0 ? "#5a1616" : "#4a1010";
            cx.fillRect(c * B, r * B, B, B);
            cx.fillStyle = "#6e2020";
            cx.fillRect(c * B + Math.floor(rng() * 4) * p, r * B + Math.floor(rng() * 4) * p, p, p);
        }
    }

    // Скелі знизу з лавою
    const nearH = periodicHeights(cols, 2.5, [{ amp: 1.5, k: 3, ph: 1.3 }, { amp: 1, k: 8, ph: 0.4 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, nearH) + 1) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#7a2020", topLight: "#9a3030", body: "#4a1010", body2: "#551414", speck: "#ff6a00" }, rng);

    // Тріщини в скелях, що розжарюються з другої фази
    const cracks = [];
    for (let c = 2; c < cols - 2; c += 3 + Math.floor(rng() * 4)) {
        let x = c * B;
        let y = near.height - nearH[c] * B + B / 2;
        const len = 3 + Math.floor(rng() * 4);
        for (let k = 0; k < len; k++) {
            cracks.push({ x: x, y: y });
            x += (rng() < 0.5 ? -1 : 1) * p;
            y += p;
        }
    }

    // Лавопади: стовпчики, що стікають зі стелі
    const falls = [];
    for (let c = 4; c < cols - 2; c += 9 + Math.floor(rng() * 6)) {
        falls.push({ x: c * B, top: ceilH[c] * B });
    }
    return {
        W: W, H: H, sky: sky, ceil: ceil, near: near, falls: falls, cracks: cracks,
        demon: buildDemonSprite(B), vignette: buildDemonVignette(W, H)
    };
}

// Ланцюг з ланок від стелі до зап'ястя; після розриву нижня частина падає
function drawChain(ctx, x1, y1, x2, y2, B, broken) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const links = Math.max(2, Math.floor(len / (B * 0.7)));
    const breakAt = Math.floor(links * 0.45);
    for (let i = 0; i < links; i++) {
        const t = i / links;
        let x = x1 + (x2 - x1) * t;
        let y = y1 + (y2 - y1) * t;
        let alpha = 1;
        if (broken > 0 && i >= breakAt) {
            y += broken * broken * B * 14;
            x += (i - breakAt) * broken * B * 0.3 * (x2 > x1 ? 1 : -1);
            alpha = 1 - broken;
        }
        if (alpha <= 0) {
            continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 2 === 0 ? "#6a6070" : "#4a4250";
        if (i % 2 === 0) {
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.4), Math.round(B * 0.6));
        } else {
            ctx.fillRect(Math.round(x - B * 0.1), Math.round(y), Math.round(B * 0.2), Math.round(B * 0.6));
        }
    }
    ctx.globalAlpha = 1;
}

// Зигзаг блискавки від стелі донизу
function drawLightning(ctx, x, top, bottom, B, seed) {
    const rng = pixelRng(seed);
    ctx.fillStyle = "#ffd0d0";
    let cx = x;
    for (let y = top; y < bottom; y += B / 2) {
        cx += (rng() - 0.5) * B * 1.4;
        ctx.fillRect(Math.round(cx), Math.round(y), Math.max(3, B / 3), Math.round(B / 2) + 1);
    }
}

BackgroundRenderer.renderPixelNether = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNether;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNether(W, H, groundY, B);
        this._pixelNether = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    const roar = _fx.oops || 0;
    const rage = smoothStep((progress - 0.3) / 0.08);
    const battle = smoothStep((progress - 0.63) / 0.08);
    ctx.drawImage(st.sky, 0, 0);
    // Небо червоніє з кожною фазою
    ctx.fillStyle = "rgba(160, 0, 0, " + (0.12 * rage + 0.18 * battle).toFixed(3) + ")";
    ctx.fillRect(0, 0, W, gY);

    // Метеори з другої фази
    if (rage > 0) {
        for (let i = 0; i < 5; i++) {
            const period = 1.6 + i * 0.37;
            const k = ((time + i * 0.71) % period) / period;
            const rng = pixelRng(Math.floor((time + i * 0.71) / period) * 13 + i);
            const mx = W * (0.3 + rng() * 0.8) - k * W * 0.35;
            const my = -B * 2 + k * gY * 0.9;
            for (let t = 0; t < 6; t++) {
                ctx.globalAlpha = rage * (1 - t / 6);
                ctx.fillStyle = t === 0 ? "#fff0a0" : t < 3 ? "#ffaa33" : "#ff4400";
                const s = Math.max(3, Math.round(B * (0.7 - t * 0.08)));
                ctx.fillRect(Math.round(mx + t * B * 0.5), Math.round(my - t * B * 0.6), s, s);
            }
        }
        ctx.globalAlpha = 1;
    }

    // Демон: піднімається з лави з кожною фазою й ледь «дихає»
    const d = st.demon;
    const sprite = d.canvas;
    const rise = 0.6 + 0.2 * rage + 0.2 * battle;
    const breathe = Math.sin(time * 1.6) * B * 0.25;
    const dX = Math.round(W * 0.62 - sprite.width / 2) + d.pad;
    const dY = Math.round(gY - (sprite.height - d.pad) * rise + breathe + B);
    ctx.drawImage(sprite, dX - d.pad, dY - d.pad);

    // Очі: заплющені в першій фазі, потім розплющуються й стежать за кубиком
    const targetX = W * DEMON_PLAYER_ANCHOR;
    const targetY = gY - (_fx.camY || 0) * 2 - B;
    const open = Math.max(rage, roar);
    for (const e of d.eyes) {
        const ex = dX + e.x;
        const ey = dY + e.y;
        const eh = Math.max(2, Math.round(B * (0.15 + open * 0.85)));
        ctx.globalAlpha = 0.35 + 0.65 * Math.max(open, 0.2);
        ctx.fillStyle = roar > 0.3 ? "#ffffff" : "#ffea00";
        ctx.fillRect(Math.round(ex - B), Math.round(ey - eh / 2), B * 2, eh);
        if (open > 0.3) {
            const ang = Math.atan2(targetY - ey, targetX - ex);
            ctx.fillStyle = "#8a0000";
            ctx.fillRect(Math.round(ex - B * 0.25 + Math.cos(ang) * B * 0.55), Math.round(ey - Math.min(eh, B * 0.6) / 2 + Math.sin(ang) * eh * 0.2), Math.round(B * 0.5), Math.round(Math.min(eh, B * 0.6)));
        }
        // Сяйво очей
        ctx.globalAlpha = 0.18 * open + 0.3 * roar;
        ctx.fillStyle = "#ff3300";
        ctx.fillRect(Math.round(ex - B * 2), Math.round(ey - B * 1.2), B * 4, B * 2.4);
    }
    ctx.globalAlpha = 1;

    // Паща: розжарюється в битві й розкривається під час реву
    const mouthOpen = Math.max(battle * (0.3 + 0.2 * Math.sin(time * 3)), roar);
    if (mouthOpen > 0.02) {
        const mh = Math.round(B * (0.3 + mouthOpen * 1.6));
        ctx.fillStyle = "#ff5500";
        ctx.fillRect(dX + d.mouth.x, dY + d.mouth.y, d.mouth.w, mh);
        ctx.fillStyle = "#ffd040";
        ctx.fillRect(dX + d.mouth.x + B / 2, dY + d.mouth.y + mh * 0.3, d.mouth.w - B, Math.max(2, mh * 0.4));
        ctx.fillStyle = "#e8d8c0";
        for (let k = 0; k < 4; k++) {
            ctx.fillRect(dX + d.mouth.x + k * B + B * 0.3, dY + d.mouth.y, B * 0.3, B * 0.35);
        }
        // З пащі капає лава
        if (battle > 0.5) {
            for (let k = 0; k < 3; k++) {
                const f = (time * 0.9 + k * 0.33) % 1;
                ctx.globalAlpha = (1 - f) * battle;
                ctx.fillStyle = f < 0.3 ? "#ffcc33" : "#ff5500";
                ctx.fillRect(Math.round(dX + d.mouth.x + B * (0.6 + k * 1.3)), Math.round(dY + d.mouth.y + mh + f * B * 6), Math.round(B * 0.4), Math.round(B * 0.6));
            }
            ctx.globalAlpha = 1;
        }
    }

    // Стеля, лавопади й ланцюги
    const ceilW = st.ceil.width;
    const offset = Math.round(time * speed * 0.2) % ceilW;
    for (let x = -offset; x < W; x += ceilW) {
        for (const f of st.falls) {
            const fxp = x + f.x;
            if (fxp < -B || fxp > W + B) {
                continue;
            }
            const flowH = gY - f.top;
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(fxp, f.top, B, flowH);
            // «Течія»: світлі пікселі, що біжать донизу
            ctx.fillStyle = "#ffcc33";
            const step = B * 1.5;
            const shift = (time * 180) % step;
            for (let y = f.top + shift; y < gY; y += step) {
                ctx.fillRect(fxp + B / 4, Math.round(y), B / 4, B / 2);
            }
        }
        ctx.drawImage(st.ceil, x, 0);
    }
    const broken = smoothStep((progress - 0.7) / 0.08);
    for (let i = 0; i < d.wrists.length; i++) {
        const w = d.wrists[i];
        const topX = dX + w.x + (i === 0 ? -B * 3 : B * 3);
        drawChain(ctx, topX, B * 2, dX + w.x, dY + w.y, B, broken);
    }

    // Гейзери лави з другої фази
    if (rage > 0) {
        for (let i = 0; i < 3; i++) {
            const period = 2.4 + i * 0.6;
            const k = ((time + i * 1.1) % period) / period;
            if (k > 0.35) {
                continue;
            }
            const rng = pixelRng(Math.floor((time + i * 1.1) / period) * 17 + i);
            const gx = W * (0.35 + rng() * 0.6);
            const h = Math.sin(k / 0.35 * Math.PI) * gY * (0.25 + 0.15 * battle) * rage;
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(Math.round(gx - B * 0.6), Math.round(gY - h), Math.round(B * 1.2), Math.round(h));
            ctx.fillStyle = "#ffd040";
            ctx.fillRect(Math.round(gx - B * 0.25), Math.round(gY - h), Math.round(B * 0.5), Math.round(h));
            for (let dpx = 0; dpx < 5; dpx++) {
                ctx.fillRect(Math.round(gx + (dpx - 2) * B * 0.6), Math.round(gY - h - B * 0.4 - (dpx % 2) * B * 0.5), Math.max(3, B / 3), Math.max(3, B / 3));
            }
        }
    }

    // Скелі знизу з тріщинами, що розжарюються
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.35);
    if (rage > 0) {
        const nearW = st.near.width;
        const nOff = Math.round(time * speed * 0.35) % nearW;
        const nTop = gY - st.near.height;
        ctx.globalAlpha = rage * (0.6 + 0.4 * Math.sin(time * 4));
        ctx.fillStyle = "#ffaa22";
        const cs = Math.max(2, Math.round(B / 4));
        for (let x = -nOff; x < W; x += nearW) {
            for (const c of st.cracks) {
                const px = x + c.x;
                if (px < -cs || px > W) {
                    continue;
                }
                ctx.fillRect(Math.round(px), nTop + Math.round(c.y), cs, cs);
            }
        }
        ctx.globalAlpha = 1;
    }

    // Лава «підіймається» з прогресом рівня боса
    const lavaH = B * 2 * (1 + progress * 2.5);
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(time * 2);
    ctx.fillStyle = "#ff4400";
    ctx.fillRect(0, gY - lavaH, W, lavaH);
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, gY, time, 40 + Math.round(battle * 30), 313, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 60 + battle * 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.8, swayAmp: B * 0.6, alpha: 0.75
    });

    // Червоні блискавки в третій фазі
    if (battle > 0) {
        const period = 2.8;
        const k = (time % period) / period;
        if (k < 0.06) {
            const seed = Math.floor(time / period);
            const bx = W * (0.2 + pixelRng(seed * 7)() * 0.7);
            ctx.globalAlpha = battle * (1 - k / 0.06);
            ctx.fillStyle = "rgba(255, 60, 60, 0.25)";
            ctx.fillRect(0, 0, W, gY);
            drawLightning(ctx, bx, B * 2, gY * 0.8, B, seed);
            ctx.globalAlpha = 1;
        }
    }

    // Серцебиття по краях екрана: частішає до фіналу
    const bpm = 60 + progress * 80;
    const beatT = (time * bpm / 60) % 1;
    const beat = Math.max(Math.exp(-beatT * 14), 0.7 * Math.exp(-Math.abs(beatT - 0.22) * 14));
    const vAlpha = (0.12 + 0.3 * progress) * beat + 0.4 * roar;
    if (vAlpha > 0.01) {
        ctx.globalAlpha = Math.min(1, vAlpha);
        ctx.drawImage(st.vignette, 0, 0);
        ctx.globalAlpha = 1;
    }
};
