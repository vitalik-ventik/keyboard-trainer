// ============================================================
// pet_renderers_2.js — малювальники улюбленців, частина 2: кошеня, хом'ячок, кролик,
// слизень, тюлень, восьминіжка й брейнроти Бубліко Жирафіно, Тапочкіно Акуліно,
// Клавіаторо Равліко (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, breathe, eyeMood, fillEllipse, fillRoundRect, petCheek, petEye, petLeg, petLine, petMouth, petSneaker, runPhase, wagAngle } from "./pet_parts.js";

// Трикутне вушко з рожевою серединкою
function pointyEar(ctx, x, y, w, h, fill, inner, s, tilt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt || 0);
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(0, -h);
    ctx.lineTo(w / 2, 0);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, -h * 0.15);
    ctx.lineTo(0, -h * 0.7);
    ctx.lineTo(w * 0.25, -h * 0.15);
    ctx.closePath();
    ctx.fillStyle = inner;
    ctx.fill();
    ctx.restore();
}

function whiskers(ctx, x, y, s) {
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(0.8, s * 0.018);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * 0.16, y - s * 0.03);
    ctx.moveTo(x, y + s * 0.03);
    ctx.lineTo(x + s * 0.16, y + s * 0.04);
    ctx.stroke();
}

// ---------- Кошеня ----------

function drawKitten(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#ffa94d";
    const stripe = "#d9731a";
    // Хвіст дугою вгору
    ctx.save();
    ctx.translate(-s * 0.34, s * 0.08);
    ctx.rotate(-0.4 + wagAngle(t, o.mood) * 0.6);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-s * 0.18, -s * 0.1, -s * 0.12, -s * 0.34);
    ctx.lineWidth = s * 0.13;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.lineWidth = s * 0.08;
    ctx.strokeStyle = fur;
    ctx.stroke();
    ctx.restore();
    petLeg(ctx, -s * 0.22, s * 0.24, s * 0.11, s * 0.26, ph + Math.PI, stripe, s);
    petLeg(ctx, s * 0.12, s * 0.24, s * 0.11, s * 0.26, ph, stripe, s);
    fillEllipse(ctx, -s * 0.05, s * 0.16 + b, s * 0.32, s * 0.19, fur, s);
    ctx.fillStyle = stripe;
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-s * 0.22 + i * s * 0.1, s * 0.0 + b, s * 0.04, s * 0.1);
    }
    petLeg(ctx, -s * 0.1, s * 0.26, s * 0.11, s * 0.24, ph, fur, s);
    petLeg(ctx, s * 0.22, s * 0.26, s * 0.11, s * 0.24, ph + Math.PI, fur, s);
    const hx = s * 0.2;
    const hy = -s * 0.12 + b;
    pointyEar(ctx, hx - s * 0.13, hy - s * 0.12, s * 0.16, s * 0.18, fur, "#ffb3c7", s, -0.25);
    pointyEar(ctx, hx + s * 0.12, hy - s * 0.13, s * 0.16, s * 0.18, fur, "#ffb3c7", s, 0.25);
    fillEllipse(ctx, hx, hy, s * 0.24, s * 0.21, fur, s);
    ctx.fillStyle = stripe;
    ctx.fillRect(hx - s * 0.03, hy - s * 0.2, s * 0.06, s * 0.07);
    petEye(ctx, hx - s * 0.06, hy - s * 0.02, s * 0.065, t, eyeMood(o), 11);
    petEye(ctx, hx + s * 0.11, hy - s * 0.02, s * 0.065, t, eyeMood(o), 11);
    fillEllipse(ctx, hx + s * 0.03, hy + s * 0.07, s * 0.03, s * 0.02, "#ff6b8a");
    petCheek(ctx, hx - s * 0.12, hy + s * 0.08, s * 0.035);
    whiskers(ctx, hx + s * 0.12, hy + s * 0.08, s);
}

// ---------- Хом'ячок ----------

function drawHamster(ctx, s, t, o) {
    // Маленькі лапки дріботять швидко
    const ph = runPhase(t, o) * 1.6;
    const b = breathe(t, s) * 1.5;
    const fur = "#f2b56b";
    petLeg(ctx, -s * 0.16, s * 0.34, s * 0.1, s * 0.16, ph + Math.PI, "#ffc9d6", s);
    petLeg(ctx, s * 0.14, s * 0.34, s * 0.1, s * 0.16, ph, "#ffc9d6", s);
    fillEllipse(ctx, -s * 0.2, -s * 0.24 + b, s * 0.08, s * 0.08, fur, s);
    fillEllipse(ctx, s * 0.12, -s * 0.28 + b, s * 0.08, s * 0.08, fur, s);
    fillEllipse(ctx, 0, s * 0.06 + b, s * 0.36, s * 0.32, fur, s);
    fillEllipse(ctx, s * 0.06, s * 0.16 + b, s * 0.22, s * 0.19, "#fff4e6");
    // Надуті щічки — повні зерняток
    const puff = o.mood === "combo" || o.mood === "happy" ? 1.2 : 1;
    fillEllipse(ctx, s * 0.24, s * 0.04 + b, s * 0.11 * puff, s * 0.1 * puff, "#ffd9a8", s * 0.8);
    petEye(ctx, s * 0.14, -s * 0.08 + b, s * 0.065, t, eyeMood(o), 12);
    fillEllipse(ctx, s * 0.32, -s * 0.03 + b, s * 0.03, s * 0.025, "#ff6b8a");
    petCheek(ctx, s * 0.22, s * 0.06 + b, s * 0.04);
    petMouth(ctx, s * 0.3, s * 0.03 + b, s * 0.05, s, o.mood);
}

// ---------- Кролик ----------

function drawBunny(ctx, s, t, o) {
    // Кролик біжить стрибками
    const hop = o.moving && t ? Math.abs(Math.sin(t * 0.012)) * s * 0.12 : 0;
    const b = breathe(t, s) - hop;
    const fur = "#f7f7fb";
    fillEllipse(ctx, -s * 0.34, s * 0.12 + b, s * 0.09, s * 0.08, "#ffffff", s);
    fillEllipse(ctx, -s * 0.18, s * 0.38 + b, s * 0.14, s * 0.07, fur, s);
    fillEllipse(ctx, -s * 0.04, s * 0.18 + b, s * 0.3, s * 0.22, fur, s);
    fillEllipse(ctx, s * 0.14, s * 0.4 + b, s * 0.08, s * 0.06, fur, s);
    const hx = s * 0.2;
    const hy = -s * 0.1 + b;
    // Довгі вуха підстрибують
    const flop = t ? Math.sin(t * 0.012) * 0.15 : 0;
    fillEllipse(ctx, hx - s * 0.1, hy - s * 0.3, s * 0.06, s * 0.19, fur, s, -0.3 - flop);
    fillEllipse(ctx, hx - s * 0.1, hy - s * 0.3, s * 0.025, s * 0.13, "#ffb3c7", 0, -0.3 - flop);
    fillEllipse(ctx, hx + s * 0.04, hy - s * 0.32, s * 0.06, s * 0.19, fur, s, 0.1 + flop);
    fillEllipse(ctx, hx + s * 0.04, hy - s * 0.32, s * 0.025, s * 0.13, "#ffb3c7", 0, 0.1 + flop);
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.18, fur, s);
    petEye(ctx, hx + s * 0.05, hy - s * 0.03, s * 0.065, t, eyeMood(o), 13);
    fillEllipse(ctx, hx + s * 0.18, hy + s * 0.04, s * 0.03, s * 0.025, "#ff6b8a");
    petCheek(ctx, hx - s * 0.04, hy + s * 0.07, s * 0.04);
    whiskers(ctx, hx + s * 0.16, hy + s * 0.07, s * 0.8);
}

// ---------- Слизень-желе ----------

function drawSlime(ctx, s, t, o) {
    // Желе стискається й розтягується
    const w = t ? Math.sin(t * (o.moving ? 0.014 : 0.006)) : 0;
    const sx = 1 + w * 0.08;
    const sy = 1 - w * 0.08;
    const baseY = s * 0.5;
    ctx.save();
    ctx.translate(0, baseY);
    ctx.scale(sx, sy);
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, 0);
    ctx.bezierCurveTo(-s * 0.44, -s * 0.72, s * 0.44, -s * 0.72, s * 0.4, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, -s * 0.6, 0, 0);
    grad.addColorStop(0, "rgba(140, 255, 150, 0.95)");
    grad.addColorStop(1, "rgba(40, 200, 90, 0.95)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Бульбашки всередині й відблиск
    ctx.fillStyle = "rgba(220, 255, 225, 0.6)";
    for (let i = 0; i < 3; i++) {
        const k = t ? ((t * 0.0005 + i / 3) % 1) : i / 3;
        ctx.beginPath();
        ctx.arc(-s * 0.2 + i * s * 0.12, -s * 0.08 - k * s * 0.3, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
    }
    fillEllipse(ctx, -s * 0.18, -s * 0.36, s * 0.08, s * 0.04, "rgba(255, 255, 255, 0.7)", 0, -0.5);
    petEye(ctx, s * 0.02, -s * 0.28, s * 0.07, t, eyeMood(o), 14);
    petEye(ctx, s * 0.2, -s * 0.28, s * 0.07, t, eyeMood(o), 14);
    petCheek(ctx, -s * 0.06, -s * 0.16, s * 0.04);
    petMouth(ctx, s * 0.12, -s * 0.16, s * 0.07, s, o.mood);
    ctx.restore();
}

// ---------- Тюлень ----------

function drawSeal(ctx, s, t, o) {
    const b = breathe(t, s);
    const grey = "#9fb0c4";
    const flap = t ? Math.sin(t * 0.01) * 0.3 : 0;
    // Хвостові ласти
    fillEllipse(ctx, -s * 0.44, s * 0.2 + b, s * 0.1, s * 0.05, "#7d8ea3", s, -0.5 + flap);
    fillEllipse(ctx, -s * 0.44, s * 0.3 + b, s * 0.1, s * 0.05, "#7d8ea3", s, 0.5 - flap);
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.26 + b);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.42 + b, s * 0.2, s * 0.36 + b);
    ctx.quadraticCurveTo(s * 0.34, s * 0.2 + b, s * 0.26, -s * 0.12 + b);
    ctx.quadraticCurveTo(s * 0.0, -s * 0.2 + b, -s * 0.12, s * 0.06 + b);
    ctx.quadraticCurveTo(-s * 0.3, s * 0.16 + b, -s * 0.4, s * 0.26 + b);
    ctx.closePath();
    ctx.fillStyle = grey;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, s * 0.06, s * 0.3 + b, s * 0.1, s * 0.05, "#7d8ea3", s, 0.4 + flap);
    const hx = s * 0.18;
    const hy = -s * 0.14 + b;
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.18, grey, s);
    fillEllipse(ctx, hx + s * 0.14, hy + s * 0.05, s * 0.08, s * 0.06, "#c8d4e2", s * 0.7);
    fillEllipse(ctx, hx + s * 0.2, hy + s * 0.02, s * 0.035, s * 0.025, "#1a1a1a");
    petEye(ctx, hx + s * 0.02, hy - s * 0.04, s * 0.07, t, eyeMood(o), 15);
    petCheek(ctx, hx - s * 0.06, hy + s * 0.07, s * 0.035);
    // М'ячик на носі (коли тюлень радіє, на серії й часом просто так)
    const showBall = o.mood === "happy" || o.mood === "combo" || (t > 0 && t % 7000 < 2800);
    if (showBall) {
        const by = hy - s * 0.24 - (t ? Math.abs(Math.sin(t * 0.008)) * s * 0.1 : 0);
        const bx = hx + s * 0.2;
        fillEllipse(ctx, bx, by, s * 0.1, s * 0.1, "#ffffff", s * 0.8);
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, s * 0.1, 0, Math.PI * 2);
        ctx.clip();
        const spin = t ? t * 0.008 : 0;
        ctx.fillStyle = "#ff3b4f";
        ctx.fillRect(bx - s * 0.1 + Math.sin(spin) * s * 0.04, by - s * 0.1, s * 0.06, s * 0.2);
        ctx.fillStyle = "#2f7bff";
        ctx.fillRect(bx + s * 0.03 + Math.sin(spin) * s * 0.04, by - s * 0.1, s * 0.05, s * 0.2);
        ctx.restore();
    }
}

// ---------- Восьминіжка ----------

function drawOctopus(ctx, s, t, o) {
    const b = breathe(t, s);
    const body = "#ff8a5c";
    // Щупальця, що хвилюються
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
        const x0 = -s * 0.24 + i * s * 0.12;
        ctx.beginPath();
        ctx.moveTo(x0, s * 0.08 + b);
        const wave = Math.sin((t || 0) * 0.008 + i * 1.3);
        ctx.quadraticCurveTo(x0 + wave * s * 0.08, s * 0.28 + b, x0 - s * 0.04 + wave * s * 0.1, s * 0.42 + b);
        ctx.lineWidth = s * 0.12;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.lineWidth = s * 0.08;
        ctx.strokeStyle = body;
        ctx.stroke();
        fillEllipse(ctx, x0 + wave * s * 0.04, s * 0.26 + b, s * 0.015, s * 0.015, "#ffd0bd");
    }
    // Голова-купол
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, s * 0.12 + b);
    ctx.bezierCurveTo(-s * 0.38, -s * 0.5 + b, s * 0.38, -s * 0.5 + b, s * 0.32, s * 0.12 + b);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.12, -s * 0.24 + b, s * 0.05, s * 0.04, "#ffb899");
    fillEllipse(ctx, s * 0.14, -s * 0.28 + b, s * 0.04, s * 0.03, "#ffb899");
    petEye(ctx, -s * 0.06, -s * 0.06 + b, s * 0.07, t, eyeMood(o), 16);
    petEye(ctx, s * 0.14, -s * 0.06 + b, s * 0.07, t, eyeMood(o), 16);
    petCheek(ctx, -s * 0.18, s * 0.03 + b, s * 0.04);
    petCheek(ctx, s * 0.24, s * 0.03 + b, s * 0.04);
    petMouth(ctx, s * 0.04, s * 0.04 + b, s * 0.07, s, o.mood);
}

// ---------- Брейнрот: Бубліко Жирафіно ----------

function drawBubliko(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const skin = "#ffcf5a";
    const spot = "#b86b2a";
    petSneaker(ctx, -s * 0.2, s * 0.5, s * 0.18, "#39d353", s, ph + Math.PI);
    petSneaker(ctx, s * 0.1, s * 0.5, s * 0.18, "#39d353", s, ph);
    petLeg(ctx, -s * 0.2, s * 0.14, s * 0.08, s * 0.3, 0, skin, s);
    petLeg(ctx, s * 0.1, s * 0.14, s * 0.08, s * 0.3, 0, skin, s);
    fillEllipse(ctx, -s * 0.05, s * 0.1 + b, s * 0.28, s * 0.16, skin, s);
    fillEllipse(ctx, -s * 0.14, s * 0.08 + b, s * 0.05, s * 0.04, spot);
    fillEllipse(ctx, s * 0.04, s * 0.13 + b, s * 0.05, s * 0.04, spot);
    fillEllipse(ctx, -s * 0.05, s * 0.0 + b, s * 0.04, s * 0.03, spot);
    // Хвостик-пензлик
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, s * 0.06 + b);
    ctx.lineTo(-s * 0.42, s * 0.2 + b + wagAngle(t, o.mood) * s * 0.1);
    ctx.stroke();
    // Довга шия з бубликом
    fillRoundRect(ctx, s * 0.08, -s * 0.5 + b, s * 0.12, s * 0.62, s * 0.06, skin, s);
    fillEllipse(ctx, s * 0.14, -s * 0.2 + b, s * 0.03, s * 0.03, spot);
    fillEllipse(ctx, s * 0.12, -s * 0.36 + b, s * 0.025, s * 0.025, spot);
    const ry = -s * 0.06 + b;
    ctx.lineWidth = s * 0.14;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.ellipse(s * 0.14, ry, s * 0.16, s * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = s * 0.1;
    ctx.strokeStyle = "#c97b32";
    ctx.stroke();
    ctx.fillStyle = "#fff6d8";
    for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + 0.3;
        ctx.fillRect(s * 0.14 + Math.cos(a) * s * 0.16 - 1, ry + Math.sin(a) * s * 0.07 - 1, 2, 2);
    }
    // Голова з ріжками
    const hx = s * 0.2;
    const hy = -s * 0.56 + b;
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.05, hy - s * 0.06);
    ctx.lineTo(hx - s * 0.07, hy - s * 0.17);
    ctx.moveTo(hx + s * 0.03, hy - s * 0.06);
    ctx.lineTo(hx + s * 0.03, hy - s * 0.17);
    ctx.stroke();
    fillEllipse(ctx, hx - s * 0.07, hy - s * 0.18, s * 0.03, s * 0.03, spot, s * 0.6);
    fillEllipse(ctx, hx + s * 0.03, hy - s * 0.18, s * 0.03, s * 0.03, spot, s * 0.6);
    fillEllipse(ctx, hx, hy, s * 0.14, s * 0.1, skin, s);
    fillEllipse(ctx, hx + s * 0.12, hy + s * 0.03, s * 0.07, s * 0.055, "#ffe3a1", s * 0.7);
    petEye(ctx, hx + s * 0.01, hy - s * 0.02, s * 0.055, t, eyeMood(o), 17);
    petCheek(ctx, hx - s * 0.06, hy + s * 0.05, s * 0.03);
}

// ---------- Брейнрот: Тапочкіно Акуліно ----------

function drawTapochkino(ctx, s, t, o) {
    const b = breathe(t, s);
    const blue = "#6c8fb0";
    const ph = t ? t * 0.015 : 0;
    // Лапки в пухнастих рожевих тапочках бовтаються
    for (let i = 0; i < 2; i++) {
        const lx = -s * 0.1 + i * s * 0.22;
        const swing = Math.sin(ph + i * Math.PI) * s * 0.04;
        petLeg(ctx, lx + swing, s * 0.12 + b, s * 0.07, s * 0.2, 0, blue, s);
        fillEllipse(ctx, lx + swing + s * 0.03, s * 0.34 + b, s * 0.1, s * 0.06, "#ff9ecf", s * 0.8);
        fillEllipse(ctx, lx + swing + s * 0.09, s * 0.3 + b, s * 0.04, s * 0.04, "#ffffff", s * 0.5);
    }
    // Хвіст
    ctx.save();
    ctx.translate(-s * 0.36, b);
    ctx.rotate(t ? Math.sin(t * 0.012) * 0.3 : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-s * 0.16, -s * 0.16);
    ctx.lineTo(-s * 0.1, 0);
    ctx.lineTo(-s * 0.16, s * 0.12);
    ctx.closePath();
    ctx.fillStyle = blue;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.restore();
    // Спинний плавець
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.14 + b);
    ctx.lineTo(-s * 0.04, -s * 0.36 + b);
    ctx.lineTo(s * 0.1, -s * 0.14 + b);
    ctx.closePath();
    ctx.fillStyle = blue;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, 0, b, s * 0.4, s * 0.18, blue, s);
    fillEllipse(ctx, s * 0.06, s * 0.07 + b, s * 0.3, s * 0.08, "#eef4fb");
    // Широка усмішка з зубками
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(s * 0.16, s * 0.04 + b);
    ctx.quadraticCurveTo(s * 0.28, s * 0.12 + b, s * 0.38, s * 0.02 + b);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const tx = s * (0.19 + i * 0.045);
        ctx.moveTo(tx, s * 0.04 + b);
        ctx.lineTo(tx + s * 0.02, s * 0.075 + b);
    }
    ctx.stroke();
    petEye(ctx, s * 0.22, -s * 0.06 + b, s * 0.065, t, eyeMood(o), 18);
    fillEllipse(ctx, -s * 0.02, s * 0.02 + b, s * 0.03, s * 0.06, "#557796", s * 0.5, 0.3);
}

// ---------- Брейнрот: Клавіаторо Равліко ----------

function drawKlaviatoro(ctx, s, t, o) {
    const b = breathe(t, s);
    const slug = "#c7e36b";
    const crawl = o.moving && t ? Math.sin(t * 0.01) * s * 0.03 : 0;
    // Тіло-слимачок
    fillRoundRect(ctx, -s * 0.44, s * 0.26, s * 0.84 + crawl, s * 0.2, s * 0.1, slug, s);
    // Шия й очі на ріжках
    fillRoundRect(ctx, s * 0.2 + crawl, -s * 0.08, s * 0.18, s * 0.44, s * 0.09, slug, s);
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    const sway = t ? Math.sin(t * 0.005) * s * 0.03 : 0;
    ctx.beginPath();
    ctx.moveTo(s * 0.25 + crawl, -s * 0.06);
    ctx.lineTo(s * 0.22 + crawl + sway, -s * 0.28);
    ctx.moveTo(s * 0.34 + crawl, -s * 0.06);
    ctx.lineTo(s * 0.4 + crawl + sway, -s * 0.28);
    ctx.stroke();
    petEye(ctx, s * 0.22 + crawl + sway, -s * 0.3, s * 0.065, t, eyeMood(o), 19);
    petEye(ctx, s * 0.4 + crawl + sway, -s * 0.3, s * 0.065, t, eyeMood(o), 19);
    petCheek(ctx, s * 0.26 + crawl, s * 0.12, s * 0.035);
    petMouth(ctx, s * 0.32 + crawl, s * 0.12, s * 0.06, s, o.mood);
    // Мушля — ігрова клавіатура з RGB-підсвіткою
    const shx = -s * 0.42;
    const shy = -s * 0.2 + b;
    const shw = s * 0.62;
    const shh = s * 0.48;
    const hue = t ? (t * 0.15) % 360 : 190;
    fillRoundRect(ctx, shx - s * 0.03, shy - s * 0.03, shw + s * 0.06, shh + s * 0.06, s * 0.12, "hsl(" + Math.round(hue) + ", 95%, 60%)", s);
    fillRoundRect(ctx, shx, shy, shw, shh, s * 0.1, "#262d42");
    const keys = ["Й", "Ц", "У", "Ф", "І", "В", "Я", "Ч", "С"];
    const kw = shw / 3.4;
    const kh = shh / 3.4;
    ctx.font = "bold " + Math.max(5, s * 0.1) + "px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const kx = shx + shw * 0.08 + c * (kw + shw * 0.04);
            const ky = shy + shh * 0.08 + r * (kh + shh * 0.04);
            // Клавіші «натискаються» по черзі
            const pressed = t ? Math.floor(t / 180) % 9 === r * 3 + c : false;
            fillRoundRect(ctx, kx, ky + (pressed ? s * 0.015 : 0), kw, kh, s * 0.025, pressed ? "#00f6ff" : "#e9edf7");
            ctx.fillStyle = "#262d42";
            ctx.fillText(keys[r * 3 + c], kx + kw / 2, ky + kh / 2 + (pressed ? s * 0.015 : 0) + 0.5);
        }
    }
}

export const PET_RENDERERS_2 = {
    pet_kitten: drawKitten,
    pet_hamster: drawHamster,
    pet_bunny: drawBunny,
    pet_slime: drawSlime,
    pet_seal: drawSeal,
    pet_octopus: drawOctopus,
    pet_bubliko: drawBubliko,
    pet_tapochkino: drawTapochkino,
    pet_klaviatoro: drawKlaviatoro
};
