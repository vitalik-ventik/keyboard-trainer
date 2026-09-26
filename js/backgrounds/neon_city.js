// backgrounds/neon_city.js — неонова траса, нічне неонове місто, морський порт

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, drawPixelDisc, drawScrollingStrip, makeCanvas, makeSky, pixelBlockSize, pixelRng } from "./helpers.js";

// ---------- Неонова траса (рівень 4) ----------

function buildNeonHighway(W, H, groundY) {
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#07021a"], [0.35, "#2a0a4a"], [0.55, "#7a1a6a"], [1, "#07021a"]]);
    const sx = sky.getContext("2d");
    // Сонце з прорізами
    const sunR = Math.round(H * 0.16);
    const sunX = Math.round(W / 2);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    const sg = sx.createLinearGradient(0, horizon - sunR, 0, horizon);
    sg.addColorStop(0, "#ffe14d");
    sg.addColorStop(1, "#ff2ea6");
    sx.fillStyle = sg;
    sx.beginPath();
    sx.arc(sunX, horizon, sunR, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#3a0d5a";
    for (let i = 0; i < 5; i++) {
        sx.fillRect(sunX - sunR, horizon - 6 - i * sunR * 0.17, sunR * 2, 2 + i);
    }
    sx.restore();
    // Силует міста на обрії
    const rng = pixelRng(404);
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 60;
        const h = 15 + rng() * H * 0.12;
        sx.fillStyle = "#12052a";
        sx.fillRect(x, horizon - h, w, h);
        // Вікна, що світяться
        for (let wy = horizon - h + 5; wy < horizon - 4; wy += 7) {
            for (let wx = x + 4; wx < x + w - 4; wx += 7) {
                if (rng() < 0.3) {
                    sx.fillStyle = rng() < 0.5 ? "rgba(255, 46, 166, 0.7)" : "rgba(0, 246, 255, 0.6)";
                    sx.fillRect(wx, wy, 3, 3);
                }
            }
        }
        x += w + rng() * 10;
    }
    // Земля під обрієм
    sx.fillStyle = "#08021a";
    sx.fillRect(0, horizon, W, H - horizon);
    return { W: W, H: H, sky: sky, horizon: horizon };
}

BackgroundRenderer.renderNeonHighway = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonHighway;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonHighway(W, H, groundY);
        this._neonHighway = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    const cx = W / 2;
    // Дорога в перспективі
    ctx.fillStyle = "#14062e";
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ff2ea6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.moveTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.stroke();
    // Пальми й неонові білборди обабіч дороги (від далеких до ближніх)
    const sidePhase = (time * speed * 0.0025) % 1;
    const signs = ["#ff2ea6", "#00f6ff", "#ffe14d", "#39ff88"];
    for (let i = 0; i < 6; i++) {
        const t = (i + sidePhase) / 6;
        const k = t * t;
        const y = hz + (gY - hz) * k;
        const side = i % 2 === 0 ? -1 : 1;
        const px = cx + side * (W * 0.05 + k * W * 0.75);
        const sc = 0.15 + k * 1.6;
        if (i % 3 === 0) {
            // Білборд на ніжках
            const bw = 60 * sc;
            const bh = 30 * sc;
            ctx.fillStyle = "#1a0a30";
            ctx.fillRect(px - 2, y - bh * 2, 3 + sc * 2, bh * 2);
            ctx.fillStyle = "#0a0418";
            ctx.fillRect(px - bw / 2, y - bh * 2.6, bw, bh);
            ctx.strokeStyle = signs[i % 4];
            ctx.lineWidth = Math.max(1, sc * 2);
            ctx.strokeRect(px - bw / 2, y - bh * 2.6, bw, bh);
            ctx.fillStyle = signs[(i + 1) % 4];
            if (Math.sin(time * 4 + i) > -0.7) {
                ctx.fillRect(px - bw * 0.35, y - bh * 2.35, bw * 0.4, bh * 0.2);
                ctx.fillRect(px - bw * 0.35, y - bh * 2.0, bw * 0.7, bh * 0.2);
            }
        } else {
            // Пальма-силует
            const th = 70 * sc;
            ctx.fillStyle = "#3a1466";
            ctx.fillRect(px, y - th, Math.max(2, 4 * sc), th);
            for (let f = -2; f <= 2; f++) {
                ctx.fillRect(px + f * 9 * sc - 6 * sc, y - th - Math.abs(f) * -3 * sc, 14 * sc, Math.max(2, 4 * sc));
            }
        }
    }
    // Машини: назустріч — білі фари, від нас — червоні вогні
    for (let i = 0; i < 4; i++) {
        const onc = i % 2 === 0;
        const raw = ((time * (0.18 + i * 0.03) + i * 0.27) % 1);
        const t = onc ? raw : 1 - raw;
        const k = t * t;
        const y = hz + (gY - hz) * k;
        const lane = onc ? -1 : 1;
        const x = cx + lane * (W * 0.005 + k * W * 0.2);
        const cw = 6 + k * 70;
        const ch = 3 + k * 26;
        ctx.fillStyle = "#1a0a34";
        ctx.fillRect(x - cw / 2, y - ch, cw, ch);
        ctx.fillStyle = onc ? "#ffffff" : "#ff3355";
        ctx.fillRect(x - cw / 2, y - ch * 0.45, Math.max(2, cw * 0.18), Math.max(2, ch * 0.2));
        ctx.fillRect(x + cw / 2 - Math.max(2, cw * 0.18), y - ch * 0.45, Math.max(2, cw * 0.18), Math.max(2, ch * 0.2));
        if (onc && k > 0.1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.fillRect(x - cw, y - ch * 0.3, cw * 2, ch * 0.6 + k * 20);
        }
    }
    // Розділова розмітка та ліхтарі, що біжать назустріч
    const phase = (time * speed * 0.004) % 1;
    ctx.fillStyle = "#ffe14d";
    for (let i = 0; i < 8; i++) {
        const t = (i + phase) / 8;
        const k = t * t;
        const y = hz + (gY - hz) * k;
        const w = 2 + k * 10;
        const hgt = 2 + k * 18;
        ctx.fillRect(cx - w / 2, y, w, hgt);
        // Ліхтарні стовпи обабіч
        const px = W * 0.02 + k * W * 0.5;
        const postH = 6 + k * H * 0.25;
        ctx.fillStyle = "#3a1a6a";
        ctx.fillRect(cx - px - 2, y - postH, 2 + k * 3, postH);
        ctx.fillRect(cx + px, y - postH, 2 + k * 3, postH);
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(cx - px - 2 - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillRect(cx + px - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillStyle = "#ffe14d";
    }
};

// ---------- Нічне неонове місто (рівень 17): далекі хмарочоси + дахи з вивісками ----------

function buildNeonRooftops(W, H, groundY) {
    const gY = Math.round(groundY);
    const rng = pixelRng(1818);
    const sky = makeSky(W, H, [[0, "#050314"], [0.6, "#1a0b3a"], [1, "#2e0f52"]]);
    const sx = sky.getContext("2d");
    sx.fillStyle = "rgba(244, 233, 255, 0.08)";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.08, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#f4e9ff";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.05, 0, Math.PI * 2);
    sx.fill();
    const windowColors = ["rgba(255, 220, 140, 0.45)", "rgba(140, 220, 255, 0.35)", "rgba(255, 150, 220, 0.3)"];

    // Далекі хмарочоси з вікнами
    const farW = Math.ceil(W * 1.5);
    const far = makeCanvas(farW, gY * 0.7);
    const fx = far.getContext("2d");
    for (let x = 0; x < farW; ) {
        const w = 30 + rng() * 80;
        const h = far.height * (0.3 + rng() * 0.7);
        fx.fillStyle = rng() < 0.5 ? "#1b0f3a" : "#221449";
        fx.fillRect(x, far.height - h, w, h);
        fx.fillStyle = "rgba(120, 100, 200, 0.35)";
        fx.fillRect(x, far.height - h, w, 2);
        for (let wy = far.height - h + 8; wy < far.height - 6; wy += 12) {
            for (let wx = x + 5; wx < x + w - 6; wx += 10) {
                if (rng() < 0.3) {
                    fx.fillStyle = windowColors[Math.floor(rng() * windowColors.length)];
                    fx.fillRect(wx, wy, 4, 5);
                }
            }
        }
        x += w + 4 + rng() * 12;
    }

    // Ближні дахи: вивіски малюються одразу в смугу разом зі світінням
    const nearW = Math.ceil(W * 1.3);
    const near = makeCanvas(nearW, gY * 0.5);
    const nx = near.getContext("2d");
    const lights = [];
    const flickering = [];
    const signColors = ["#ff2ea6", "#00f6ff", "#39ff88", "#ffe14d", "#b06bff"];
    function drawSign(x, y, w, h, color) {
        nx.globalAlpha = 0.18;
        nx.fillStyle = color;
        nx.fillRect(x - 6, y - 6, w + 12, h + 12);
        nx.globalAlpha = 1;
        nx.strokeStyle = color;
        nx.lineWidth = 2;
        nx.strokeRect(x, y, w, h);
        // «Літери» вивіски — короткі риски
        nx.fillStyle = color;
        const vertical = h > w;
        const n = Math.max(2, Math.floor((vertical ? h : w) / 14));
        for (let i = 0; i < n; i++) {
            if (vertical) {
                nx.fillRect(x + 3, y + 4 + i * 14, w - 6, 8);
            } else {
                nx.fillRect(x + 4 + i * 14, y + 3, 8, h - 6);
            }
        }
    }
    for (let x = 0; x < nearW - 40; ) {
        const w = 90 + rng() * 140;
        const h = near.height * (0.35 + rng() * 0.45);
        const top = near.height - h;
        nx.fillStyle = "#0d0620";
        nx.fillRect(x, top, w, h);
        nx.fillStyle = "#2a1650";
        nx.fillRect(x, top, w, 4);
        // Кілька тьмяних вікон
        nx.fillStyle = "rgba(255, 220, 140, 0.25)";
        for (let wy = top + 40; wy < near.height - 8; wy += 16) {
            for (let wx = x + 8; wx < x + w - 10; wx += 14) {
                if (rng() < 0.15) {
                    nx.fillRect(wx, wy, 5, 6);
                }
            }
        }
        // Бак для води або антена
        if (rng() < 0.5) {
            nx.fillStyle = "#1a0d33";
            nx.fillRect(x + w * 0.2, top - 26, 22, 26);
            nx.fillRect(x + w * 0.2 + 4, top - 32, 14, 6);
        } else {
            nx.fillStyle = "#2a1650";
            nx.fillRect(x + w * 0.7, top - 50, 3, 50);
            lights.push({ x: x + w * 0.7 + 1, y: top - 52, phase: rng() * 6 });
        }
        // Горизонтальна вивіска на даху та вертикальна на стіні
        const signs = [];
        if (rng() < 0.85) {
            signs.push({ x: x + w * 0.3, y: top + 12, w: Math.round(w * 0.4), h: 14 });
        }
        if (rng() < 0.6 && h > 70) {
            signs.push({ x: x + w - 22, y: top + 34, w: 14, h: Math.round(Math.min(h - 50, 90)) });
        }
        for (const sg of signs) {
            const color = signColors[Math.floor(rng() * signColors.length)];
            drawSign(sg.x, sg.y, sg.w, sg.h, color);
            // Лише приблизно кожна четверта вивіска мерехтить
            if (rng() < 0.25) {
                flickering.push({ x: sg.x - 6, y: sg.y - 6, w: sg.w + 12, h: sg.h + 12, phase: rng() * 10 });
            }
        }
        x += w + 14 + rng() * 30;
    }
    return { W: W, H: H, sky: sky, far: far, near: near, lights: lights, flickering: flickering };
}

BackgroundRenderer.renderNeonRooftops = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonRooftops;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonRooftops(W, H, groundY);
        this._neonRooftops = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.1);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        // М'яке мерехтіння: вивіска на мить тьмяніє, а не гасне повністю
        ctx.fillStyle = "rgba(13, 6, 32, 0.45)";
        for (const f of st.flickering) {
            const fx = x + f.x;
            if (fx < -f.w || fx > W) {
                continue;
            }
            const dip = Math.sin(time * 7 + f.phase) * Math.sin(time * 2.3 + f.phase * 2);
            if (dip > 0.8) {
                ctx.fillRect(fx, top + f.y, f.w, f.h);
            }
        }
        for (const l of st.lights) {
            const lx = x + l.x;
            if (lx < -10 || lx > W + 10) {
                continue;
            }
            const on = Math.sin(time * 3 + l.phase) > 0;
            ctx.fillStyle = on ? "#ff2222" : "#551111";
            ctx.fillRect(lx - 3, top + l.y - 3, 6, 6);
        }
    }
    // Дощ
    drawFallingPixels(ctx, W, gY, time, 60, 181, {
        color: "#8fb8ff", dir: 1, speedMin: 400, speedMax: 600, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.35, stretch: 8
    });
};

// ---------- Морський порт (рівень 18) ----------
// Сонячний день у вантажному порту: місто на березі, козлові крани переносять
// різнокольорові контейнери, біля причалу стоїть контейнеровоз, буксир тягне
// баржу, погойдуються буї, над водою кружляють чайки. До кінця рівня настає вечір.

const CONTAINER_COLORS = ["#e84a3a", "#3a7ae8", "#f0b030", "#3ab86a", "#e87a2a", "#8a5ac8"];

function drawContainer(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    for (let k = 3; k < w - 2; k += 4) {
        ctx.fillRect(Math.round(x + k), Math.round(y + 1), 1, Math.round(h - 2));
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), 1);
}

function buildNightHarbor(W, H, groundY) {
    const gY = Math.round(groundY);
    const B = pixelBlockSize(H);
    const rng = pixelRng(1819);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#3a8ae8"], [0.45, "#8ac8ff"], [0.55, "#d8f0ff"], [1, "#d8f0ff"]]);
    const sx = sky.getContext("2d");
    drawPixelDisc(sx, W * 0.14, gY * 0.16, B * 3, B / 4, "rgba(255, 250, 220, 0.3)");
    drawPixelDisc(sx, W * 0.14, gY * 0.16, B * 2, B / 4, "#fff8d0");
    // Світле місто на березі
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 50;
        const h = 15 + rng() * horizon * 0.3;
        sx.fillStyle = rng() < 0.5 ? "#a8c0d8" : "#98b0cc";
        sx.fillRect(x, horizon - h, w, h);
        sx.fillStyle = "rgba(255, 255, 255, 0.5)";
        for (let wy = horizon - h + 5; wy < horizon - 4; wy += 8) {
            for (let wx = x + 3; wx < x + w - 4; wx += 7) {
                if (rng() < 0.4) {
                    sx.fillRect(wx, wy, 3, 3);
                }
            }
        }
        x += w + rng() * 6;
    }
    // Вода
    const water = sx.createLinearGradient(0, horizon, 0, gY);
    water.addColorStop(0, "#3a9ad8");
    water.addColorStop(1, "#1a5a9a");
    sx.fillStyle = water;
    sx.fillRect(0, horizon, W, gY - horizon);

    // Хмари
    const cloudW = Math.ceil(W * 1.5 / B) * B;
    const clouds = makeCanvas(cloudW, Math.round(horizon * 0.7));
    const cx = clouds.getContext("2d");
    for (let i = 0; i < 6; i++) {
        const x = Math.round(rng() * cloudW / B) * B;
        const y = Math.round(rng() * clouds.height * 0.7 / B) * B + B;
        const w = (4 + Math.floor(rng() * 5)) * B;
        cx.fillStyle = "rgba(255, 255, 255, 0.85)";
        cx.fillRect(x, y, w, B);
        cx.fillRect(x + B, y - B * 0.6, w - B * 2.5, B * 0.6);
    }

    // Причал зі штабелями контейнерів і козловими кранами
    const quayW = Math.ceil(W * 1.5 / (B * 20)) * B * 20;
    const quayH = Math.round(horizon * 0.95);
    const quay = makeCanvas(quayW, quayH);
    const qx = quay.getContext("2d");
    const cranes = [];
    const cw = B * 1.6;
    const ch = B * 0.7;
    for (let seg = 0; seg < quayW; seg += B * 20) {
        // Штабелі
        for (let col = 0; col < 5; col++) {
            const stack = 1 + Math.floor(rng() * 4);
            for (let r = 0; r < stack; r++) {
                drawContainer(qx, seg + B * 1 + col * (cw + 1), quayH - (r + 1) * (ch + 1), cw, ch, CONTAINER_COLORS[Math.floor(rng() * CONTAINER_COLORS.length)]);
            }
        }
        // Козловий кран
        const kx = seg + B * 11;
        const kh = quayH * 0.9;
        qx.fillStyle = "#e84a3a";
        qx.fillRect(kx, quayH - kh, B * 0.5, kh);
        qx.fillRect(kx + B * 6, quayH - kh, B * 0.5, kh);
        qx.fillRect(kx - B * 1.5, quayH - kh, B * 9.5, B * 0.6);
        qx.fillStyle = "#c83a2a";
        for (let k = 0; k < 6; k++) {
            qx.fillRect(kx - B * 1.5 + k * B * 1.6, quayH - kh + B * 0.6, 2, B * 0.5);
        }
        qx.fillStyle = "#3a3a4a";
        qx.fillRect(kx + B * 7, quayH - kh - B * 0.8, B * 1.2, B * 0.8);
        cranes.push({ x: kx, top: quayH - kh + B * 0.6, span: B * 6.5, phase: rng() * 6, color: CONTAINER_COLORS[Math.floor(rng() * CONTAINER_COLORS.length)] });
    }
    qx.fillStyle = "#6a7080";
    qx.fillRect(0, quayH - 3, quayW, 3);
    return { W: W, H: H, sky: sky, clouds: clouds, quay: quay, cranes: cranes, horizon: horizon };
}

// Чайка з крилами-«галочкою»
function drawGull(ctx, x, y, B, time, phase) {
    const up = Math.sin(time * 6 + phase) > 0;
    const u = B * 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(u * 1.6), Math.round(u * 0.6));
    ctx.fillStyle = "#5a6070";
    const d = up ? -1 : 0.4;
    for (let k = 1; k <= 3; k++) {
        ctx.fillRect(Math.round(x + u * 0.8 - k * u * 0.9), Math.round(y + d * k * u * 0.5), Math.round(u), Math.max(2, Math.round(u * 0.35)));
        ctx.fillRect(Math.round(x + u * 0.8 + (k - 1) * u * 0.9), Math.round(y + d * k * u * 0.5), Math.round(u), Math.max(2, Math.round(u * 0.35)));
    }
    ctx.fillStyle = "#ffaa22";
    ctx.fillRect(Math.round(x - u * 0.3), Math.round(y + u * 0.2), Math.round(u * 0.3), 2);
}

BackgroundRenderer.renderNightHarbor = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._nightHarbor;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNightHarbor(W, H, groundY);
        this._nightHarbor = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.clouds, W, st.clouds.height, time, speed, 0.02);

    // Причал: крани піднімають і опускають контейнери
    const qW = st.quay.width;
    const qOff = Math.round(time * speed * 0.08) % qW;
    const qTop = hz - st.quay.height;
    for (let x = -qOff; x < W; x += qW) {
        ctx.drawImage(st.quay, x, qTop);
        for (const c of st.cranes) {
            const kx = x + c.x;
            if (kx < -B * 10 || kx > W + B * 10) {
                continue;
            }
            const t = (time * 0.25 + c.phase) % 2;
            const along = t < 1 ? t : 2 - t;
            const tx = kx - B + along * c.span;
            const lift = Math.abs(Math.sin(t * Math.PI));
            const rope = B * 1.5 + (1 - lift) * st.quay.height * 0.45;
            ctx.fillStyle = "#3a3a4a";
            ctx.fillRect(Math.round(tx), Math.round(qTop + c.top), Math.round(B * 1.2), Math.round(B * 0.4));
            ctx.fillRect(Math.round(tx + B * 0.55), Math.round(qTop + c.top + B * 0.4), 2, Math.round(rope));
            drawContainer(ctx, tx - B * 0.2, qTop + c.top + B * 0.4 + rope, B * 1.6, B * 0.7, c.color);
        }
    }

    // Відблиски на воді
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    for (let i = 0; i < 18; i++) {
        const x = ((i * W / 18 + time * B * (0.4 + (i % 3) * 0.3)) % W);
        ctx.fillRect(Math.round(x), Math.round(hz + B * 0.5 + (i % 6) * (gY - hz) / 7), Math.round(B * (0.6 + (i % 3) * 0.4)), 2);
    }
    // Контейнеровоз біля причалу
    const shipLoop = W + B * 40;
    const sxp = W * 0.9 - ((time * speed * 0.1) % shipLoop);
    const sy = hz + B * 1.2;
    ctx.fillStyle = "#2a3a5a";
    ctx.fillRect(Math.round(sxp), Math.round(sy), B * 18, B * 1.4);
    ctx.fillStyle = "#c83a2a";
    ctx.fillRect(Math.round(sxp), Math.round(sy + B * 1), B * 18, B * 0.4);
    ctx.fillStyle = "#e8eef2";
    ctx.fillRect(Math.round(sxp + B * 15), Math.round(sy - B * 2.4), B * 2.4, B * 2.4);
    ctx.fillStyle = "#3a4a6a";
    for (let k = 0; k < 3; k++) {
        ctx.fillRect(Math.round(sxp + B * 15.3 + k * B * 0.7), Math.round(sy - B * 2), Math.round(B * 0.4), Math.round(B * 0.4));
    }
    for (let col = 0; col < 12; col++) {
        for (let r = 0; r < 2 + (col % 3 === 0 ? 1 : 0); r++) {
            drawContainer(ctx, sxp + B * 0.8 + col * B * 1.15, sy - (r + 1) * B * 0.62, B * 1.1, B * 0.58, CONTAINER_COLORS[(col * 3 + r * 5) % CONTAINER_COLORS.length]);
        }
    }
    // Буксир тягне баржу
    const tk = (time * 0.03) % 1;
    const tugX = -B * 16 + tk * (W + B * 22);
    const ty = hz + B * 3.6;
    ctx.fillStyle = "#e84a3a";
    ctx.fillRect(Math.round(tugX + B * 8), Math.round(ty), B * 3, B * 0.9);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(tugX + B * 9), Math.round(ty - B * 0.9), B * 1.4, B * 0.9);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(Math.round(tugX + B * 9.5), Math.round(ty - B * 1.5), Math.round(B * 0.4), Math.round(B * 0.6));
    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(Math.round(tugX + B * 5), Math.round(ty + B * 0.3), B * 3, 2);
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(Math.round(tugX), Math.round(ty), B * 5, B * 0.9);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(Math.round(tugX + B * 0.5), Math.round(ty - B * 0.5), B * 4, B * 0.5);
    // Хвилі від буксира
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let k = 0; k < 4; k++) {
        ctx.fillRect(Math.round(tugX - k * B * 0.8), Math.round(ty + B * 0.8 + k * 2), Math.round(B * 0.6), 2);
    }
    // Буї
    for (let i = 0; i < 3; i++) {
        const bx = ((W * (0.2 + i * 0.3) - time * speed * 0.2) % W + W) % W;
        const by = hz + B * (5 + i * 0.8) + Math.sin(time * 2 + i) * B * 0.2;
        ctx.fillStyle = i % 2 === 0 ? "#ff3344" : "#39c65a";
        ctx.fillRect(Math.round(bx), Math.round(by - B * 0.8), Math.round(B * 0.6), Math.round(B * 0.8));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(bx), Math.round(by - B * 0.5), Math.round(B * 0.6), Math.round(B * 0.15));
    }
    // Чайки кружляють
    for (let i = 0; i < 4; i++) {
        const a = time * (0.3 + i * 0.07) + i * 1.6;
        const gx = W * (0.3 + i * 0.18) + Math.cos(a) * B * 5;
        const gy = hz * (0.35 + (i % 2) * 0.2) + Math.sin(a) * B * 1.5;
        drawGull(ctx, gx, gy, B, time, i);
    }
};
