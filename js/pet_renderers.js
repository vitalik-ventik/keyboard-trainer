// ============================================================
// pet_renderers.js — малювальники улюбленців (реєстр PET_RENDERERS, ключ = id товару).
// Кожен малює улюбленця з центром у (0, 0), лапи стоять на y = s / 2, дивиться праворуч.
// fn(ctx, s, t, o): s — розмір, t — час у мс (0 — нерухомий кадр),
// o — { mood: "happy" | "sad" | "oops" | "combo" | null, moving, happyT (0…1) }
// ============================================================

import { PET_OUTLINE, breathe, fillEllipse, fillRoundRect, petCheek, petChillEye, petEye, petLeg, petLine, petMouth, petSneaker, runPhase, wagAngle } from "./pet_parts.js";

function eyeMood(o) {
    return o.mood === "happy" || o.mood === "sad" ? o.mood : null;
}

// Пухнаста «хмарка» з кружечків: спершу спільний контур, потім заливка без внутрішніх ліній
function fluffCluster(ctx, circles, fill, s) {
    ctx.fillStyle = PET_OUTLINE;
    for (const c of circles) {
        ctx.beginPath();
        ctx.arc(c[0], c[1], c[2] + petLine(s) * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = fill;
    for (const c of circles) {
        ctx.beginPath();
        ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2);
        ctx.fill();
    }
}

// ---------- Цуценя ----------

function drawPuppy(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#dca466";
    const dark = "#8a5a2b";
    const light = "#fff1dc";
    // Хвостик
    ctx.save();
    ctx.translate(-s * 0.36, s * 0.02);
    ctx.rotate(-0.8 + wagAngle(t, o.mood));
    fillRoundRect(ctx, -s * 0.05, -s * 0.26, s * 0.1, s * 0.28, s * 0.05, fur, s);
    ctx.restore();
    petLeg(ctx, -s * 0.22, s * 0.22, s * 0.13, s * 0.28, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.14, s * 0.22, s * 0.13, s * 0.28, ph, dark, s);
    fillEllipse(ctx, -s * 0.05, s * 0.14 + b, s * 0.36, s * 0.22, fur, s);
    petLeg(ctx, -s * 0.1, s * 0.24, s * 0.13, s * 0.26, ph, fur, s);
    petLeg(ctx, s * 0.24, s * 0.24, s * 0.13, s * 0.26, ph + Math.PI, fur, s);
    const hx = s * 0.2;
    const hy = -s * 0.14 + b;
    fillEllipse(ctx, hx, hy, s * 0.27, s * 0.25, fur, s);
    // Висяче вушко
    ctx.save();
    ctx.translate(hx - s * 0.12, hy - s * 0.14);
    ctx.rotate(0.35 + (t ? Math.sin(t * 0.01) * 0.12 : 0));
    fillEllipse(ctx, 0, s * 0.11, s * 0.08, s * 0.17, dark, s);
    ctx.restore();
    fillEllipse(ctx, hx + s * 0.17, hy + s * 0.08, s * 0.13, s * 0.1, light, s);
    fillEllipse(ctx, hx + s * 0.27, hy + s * 0.03, s * 0.05, s * 0.04, "#1a1a1a");
    petEye(ctx, hx + s * 0.05, hy - s * 0.06, s * 0.08, t, eyeMood(o), 1);
    petCheek(ctx, hx - s * 0.02, hy + s * 0.08, s * 0.05);
    if (o.mood === "happy") {
        // Язичок
        fillEllipse(ctx, hx + s * 0.18, hy + s * 0.2, s * 0.04, s * 0.06, "#ff6b8a", s * 0.6);
    }
}

// ---------- Капібара (і брейнрот Капібаро Мандаріно) ----------

function drawCapybaraBody(ctx, s, t, o, extra) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#a8703f";
    const dark = "#6e4424";
    const snout = "#8c5a31";
    if (extra.sneakers) {
        petSneaker(ctx, -s * 0.24, s * 0.5, s * 0.2, "#ff3b5c", s, ph + Math.PI);
        petSneaker(ctx, s * 0.14, s * 0.5, s * 0.2, "#ff3b5c", s, ph);
        petLeg(ctx, -s * 0.24, s * 0.22, s * 0.12, s * 0.18, 0, dark, s);
        petLeg(ctx, s * 0.14, s * 0.22, s * 0.12, s * 0.18, 0, dark, s);
    } else {
        petLeg(ctx, -s * 0.28, s * 0.26, s * 0.13, s * 0.24, ph + Math.PI, dark, s);
        petLeg(ctx, s * 0.12, s * 0.26, s * 0.13, s * 0.24, ph, dark, s);
    }
    fillRoundRect(ctx, -s * 0.46, -s * 0.12 + b, s * 0.74, s * 0.44, s * 0.2, fur, s);
    if (!extra.sneakers) {
        petLeg(ctx, -s * 0.16, s * 0.28, s * 0.13, s * 0.22, ph, fur, s);
        petLeg(ctx, s * 0.2, s * 0.28, s * 0.13, s * 0.22, ph + Math.PI, fur, s);
    }
    // Велика «цеглинка»-голова
    const hy = b;
    fillRoundRect(ctx, s * 0.06, -s * 0.32 + hy, s * 0.4, s * 0.34, s * 0.13, fur, s);
    fillRoundRect(ctx, s * 0.3, -s * 0.22 + hy, s * 0.2, s * 0.25, s * 0.09, snout, s);
    fillEllipse(ctx, s * 0.44, -s * 0.15 + hy, s * 0.025, s * 0.02, "#2a1a10");
    fillEllipse(ctx, s * 0.13, -s * 0.33 + hy, s * 0.06, s * 0.05, dark, s);
    petChillEye(ctx, s * 0.25, -s * 0.18 + hy, s * 0.065, t, o.mood, fur, 2);
    if (extra.mandarin) {
        // Мандаринка на голові — легендарний мем
        const my = -s * 0.44 + hy + (t ? Math.sin(t * 0.004) * s * 0.01 : 0);
        fillEllipse(ctx, s * 0.24, my, s * 0.13, s * 0.11, "#ff9a1a", s);
        fillEllipse(ctx, s * 0.2, my - s * 0.03, s * 0.03, s * 0.02, "#ffd08a");
        fillEllipse(ctx, s * 0.29, my - s * 0.12, s * 0.06, s * 0.03, "#3fbf4f", s * 0.7, -0.5);
    }
    if (extra.sunglasses) {
        ctx.fillStyle = "#111";
        ctx.fillRect(s * 0.15, -s * 0.22 + hy, s * 0.2, s * 0.08);
        ctx.fillStyle = "rgba(120, 220, 255, 0.6)";
        ctx.fillRect(s * 0.18, -s * 0.21 + hy, s * 0.06, s * 0.02);
    }
}

function drawCapybara(ctx, s, t, o) {
    drawCapybaraBody(ctx, s, t, o, {});
}

function drawCapibaroMandarino(ctx, s, t, o) {
    drawCapybaraBody(ctx, s, t, o, { mandarin: true, sneakers: true, sunglasses: o.mood === "combo" });
}

// ---------- Каченя в надувному кружечку ----------

function drawDuck(ctx, s, t, o) {
    const b = breathe(t, s);
    const yellow = "#ffd93a";
    fillEllipse(ctx, 0, -s * 0.02 + b, s * 0.3, s * 0.27, yellow, s);
    // Крильце махає, коли каченя радіє
    const flap = o.mood === "happy" && t ? Math.sin(t * 0.05) * 0.5 : 0;
    fillEllipse(ctx, -s * 0.08, -s * 0.02 + b, s * 0.14, s * 0.09, "#f2b705", s * 0.8, -0.3 - flap);
    const hx = s * 0.1;
    const hy = -s * 0.3 + b;
    fillEllipse(ctx, hx, hy, s * 0.19, s * 0.18, yellow, s);
    fillEllipse(ctx, hx + s * 0.2, hy + s * 0.04, s * 0.1, s * 0.055, "#ff8c1a", s * 0.8);
    petEye(ctx, hx + s * 0.05, hy - s * 0.03, s * 0.065, t, eyeMood(o), 3);
    petCheek(ctx, hx - s * 0.02, hy + s * 0.08, s * 0.045);
    // Кружечок у червоно-білу смужку
    const ry = s * 0.2;
    ctx.lineWidth = s * 0.15;
    ctx.strokeStyle = "#ff3b4f";
    ctx.beginPath();
    ctx.ellipse(0, ry, s * 0.4, s * 0.13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([s * 0.12, s * 0.16]);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.ellipse(0, ry, s * 0.48, s * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
}

// ---------- Лама ----------

function drawLlama(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const wool = "#f4ead6";
    const shade = "#d9c7a5";
    petLeg(ctx, -s * 0.28, s * 0.12, s * 0.09, s * 0.38, ph + Math.PI, shade, s);
    petLeg(ctx, s * 0.06, s * 0.12, s * 0.09, s * 0.38, ph, shade, s);
    fillEllipse(ctx, -s * 0.42, s * 0.0 + b, s * 0.07, s * 0.08, wool, s);
    fillEllipse(ctx, -s * 0.1, s * 0.08 + b, s * 0.33, s * 0.18, wool, s);
    petLeg(ctx, -s * 0.18, s * 0.14, s * 0.09, s * 0.36, ph, wool, s);
    petLeg(ctx, s * 0.14, s * 0.14, s * 0.09, s * 0.36, ph + Math.PI, wool, s);
    // Попонка в смужку
    fillRoundRect(ctx, -s * 0.28, -s * 0.09 + b, s * 0.32, s * 0.15, s * 0.04, "#ff4d6d", s * 0.8);
    ctx.fillStyle = "#2ec4b6";
    ctx.fillRect(-s * 0.26, -s * 0.04 + b, s * 0.28, s * 0.04);
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(-s * 0.26, s * 0.01 + b, s * 0.28, s * 0.02);
    // Довга шия й голова
    fillRoundRect(ctx, s * 0.1, -s * 0.46 + b, s * 0.15, s * 0.56, s * 0.07, wool, s);
    const hx = s * 0.24;
    const hy = -s * 0.46 + b;
    // Вуха-банани
    fillEllipse(ctx, hx - s * 0.08, hy - s * 0.15, s * 0.035, s * 0.11, wool, s * 0.8, -0.25);
    fillEllipse(ctx, hx + s * 0.01, hy - s * 0.16, s * 0.035, s * 0.11, wool, s * 0.8, 0.2);
    fillEllipse(ctx, hx, hy, s * 0.15, s * 0.12, wool, s);
    fillEllipse(ctx, hx + s * 0.13, hy + s * 0.04, s * 0.08, s * 0.065, shade, s * 0.8);
    petEye(ctx, hx + s * 0.02, hy - s * 0.02, s * 0.055, t, eyeMood(o), 4);
    petCheek(ctx, hx - s * 0.05, hy + s * 0.06, s * 0.035);
    if (o.mood === "oops") {
        // Лама смішно «плюється» хмаринкою
        const k = t ? (t % 600) / 600 : 0.5;
        ctx.save();
        ctx.globalAlpha = 0.9 - k * 0.5;
        for (let i = 0; i < 3; i++) {
            fillEllipse(ctx, hx + s * (0.28 + k * 0.3 + i * 0.07), hy + s * (0.04 - i * 0.02), s * (0.05 - i * 0.01), s * (0.04 - i * 0.008), "#e8fbff", s * 0.5);
        }
        ctx.restore();
    }
}

// ---------- Альпака ----------

function drawAlpaca(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    // На серіях і в радості альпака розпушується ще більше
    const k = (o.mood === "combo" || o.mood === "happy" ? 1.12 : 1) + (t ? Math.sin(t * 0.006) * 0.02 : 0);
    const fluff = "#fff0f3";
    const face = "#f3d3b0";
    petLeg(ctx, -s * 0.18, s * 0.28, s * 0.1, s * 0.22, ph + Math.PI, face, s);
    petLeg(ctx, s * 0.1, s * 0.28, s * 0.1, s * 0.22, ph, face, s);
    const r = s * 0.16 * k;
    fluffCluster(ctx, [
        [-s * 0.24, s * 0.12 + b, r * 0.85],
        [-s * 0.1, s * 0.04 + b, r],
        [s * 0.06, s * 0.08 + b, r],
        [-s * 0.16, s * 0.24 + b, r * 0.8],
        [s * 0.04, s * 0.24 + b, r * 0.8],
        [s * 0.16, s * 0.0 + b, r * 0.75],
        [s * 0.2, -s * 0.16 + b, r * 0.65]
    ], fluff, s);
    const hx = s * 0.27;
    const hy = -s * 0.2 + b;
    fillEllipse(ctx, hx - s * 0.05, hy - s * 0.16, s * 0.035, s * 0.07, face, s * 0.8, -0.3);
    fillEllipse(ctx, hx + s * 0.08, hy - s * 0.16, s * 0.035, s * 0.07, face, s * 0.8, 0.3);
    fillEllipse(ctx, hx, hy, s * 0.13, s * 0.14, face, s);
    // Круглий помпон на голові
    fluffCluster(ctx, [
        [hx - s * 0.06, hy - s * 0.12, s * 0.07 * k],
        [hx + s * 0.04, hy - s * 0.15, s * 0.08 * k],
        [hx + s * 0.1, hy - s * 0.08, s * 0.05 * k]
    ], fluff, s);
    petEye(ctx, hx + s * 0.02, hy - s * 0.01, s * 0.055, t, eyeMood(o), 5);
    petCheek(ctx, hx - s * 0.04, hy + s * 0.07, s * 0.035);
    fillEllipse(ctx, hx + s * 0.1, hy + s * 0.05, s * 0.02, s * 0.015, "#5a3a2a");
    petMouth(ctx, hx + s * 0.07, hy + s * 0.09, s * 0.06, s, o.mood);
}

// ---------- Черепашка ----------

function drawTurtle(ctx, s, t, o) {
    const ph = t ? t * 0.012 : 0;
    const b = breathe(t, s);
    const skin = "#6fd07a";
    // Ласти гребуть
    fillEllipse(ctx, -s * 0.24, s * 0.2, s * 0.1, s * 0.06, skin, s, 0.5 + Math.sin(ph) * 0.4);
    fillEllipse(ctx, s * 0.16, s * 0.22, s * 0.11, s * 0.06, skin, s, -0.4 + Math.sin(ph + Math.PI) * 0.4);
    fillEllipse(ctx, -s * 0.42, s * 0.1, s * 0.07, s * 0.035, skin, s, 0.3);
    const hx = s * 0.33;
    const hy = -s * 0.02 + b + (t ? Math.sin(t * 0.004) * s * 0.02 : 0);
    fillEllipse(ctx, hx, hy, s * 0.15, s * 0.13, skin, s);
    petEye(ctx, hx + s * 0.04, hy - s * 0.03, s * 0.06, t, eyeMood(o), 6);
    petCheek(ctx, hx - s * 0.02, hy + s * 0.06, s * 0.035);
    petMouth(ctx, hx + s * 0.08, hy + s * 0.05, s * 0.05, s, o.mood);
    // Панцир-купол із візерунком
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.16 + b);
    ctx.quadraticCurveTo(-s * 0.36, -s * 0.34 + b, -s * 0.05, -s * 0.32 + b);
    ctx.quadraticCurveTo(s * 0.24, -s * 0.3 + b, s * 0.26, s * 0.16 + b);
    ctx.closePath();
    ctx.fillStyle = "#2e8b57";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.07, -s * 0.1 + b, s * 0.1, s * 0.08, "#7fd18b", s * 0.5);
    fillEllipse(ctx, -s * 0.25, -s * 0.0 + b, s * 0.06, s * 0.07, "#7fd18b", s * 0.5);
    fillEllipse(ctx, s * 0.11, -s * 0.0 + b, s * 0.06, s * 0.07, "#7fd18b", s * 0.5);
    fillRoundRect(ctx, -s * 0.44, s * 0.12 + b, s * 0.74, s * 0.09, s * 0.04, "#d9b44a", s * 0.8);
}

// ---------- Медуза ----------

function drawJellyfish(ctx, s, t, o) {
    const pulse = t ? Math.sin(t * 0.006) : 0;
    const b = pulse * s * 0.03;
    // М'яке неонове сяйво — добре видно на темному тлі
    const glow = ctx.createRadialGradient(0, -s * 0.05, s * 0.05, 0, -s * 0.05, s * 0.55);
    glow.addColorStop(0, "rgba(255, 120, 230, 0.45)");
    glow.addColorStop(1, "rgba(255, 120, 230, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    // Щупальця-хвилі
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
        const x0 = -s * 0.2 + i * s * 0.13;
        ctx.beginPath();
        ctx.moveTo(x0, s * 0.08 + b);
        for (let k = 1; k <= 6; k++) {
            const yy = s * 0.08 + b + k * s * 0.065;
            const xx = x0 + Math.sin((t || 0) * 0.008 + k * 0.9 + i) * s * 0.05 - k * s * 0.012;
            ctx.lineTo(xx, yy);
        }
        ctx.lineWidth = s * 0.07;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.lineWidth = s * 0.04;
        ctx.strokeStyle = i % 2 === 0 ? "#ff9be8" : "#c79bff";
        ctx.stroke();
    }
    // Купол із фестончиками знизу
    const w = s * (0.32 + pulse * 0.02);
    ctx.beginPath();
    ctx.moveTo(-w, s * 0.08 + b);
    ctx.bezierCurveTo(-w, -s * 0.42 + b, w, -s * 0.42 + b, w, s * 0.08 + b);
    for (let i = 0; i < 4; i++) {
        const x1 = w - (i + 1) * (w * 2 / 4);
        ctx.quadraticCurveTo(x1 + w / 4, s * 0.16 + b, x1, s * 0.08 + b);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.1);
    grad.addColorStop(0, "#ff8ce6");
    grad.addColorStop(1, "#a86bff");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.12, -s * 0.2 + b, s * 0.07, s * 0.04, "rgba(255, 255, 255, 0.55)", 0, -0.5);
    petEye(ctx, -s * 0.06, -s * 0.07 + b, s * 0.06, t, eyeMood(o), 7);
    petEye(ctx, s * 0.12, -s * 0.07 + b, s * 0.06, t, eyeMood(o), 7);
    petCheek(ctx, -s * 0.15, s * 0.0 + b, s * 0.035);
    petCheek(ctx, s * 0.21, s * 0.0 + b, s * 0.035);
    petMouth(ctx, s * 0.03, s * 0.0 + b, s * 0.06, s, o.mood);
}

// ---------- Дельфінчик ----------

function drawDolphin(ctx, s, t, o) {
    const b = breathe(t, s);
    ctx.save();
    // На «Ідеально» дельфінчик робить сальто
    if (o.mood === "happy" && o.happyT > 0) {
        ctx.rotate(-Math.min(1, o.happyT) * Math.PI * 2);
    }
    const blue = "#5aa9e6";
    const flap = t ? Math.sin(t * 0.012) * 0.35 : 0;
    // Хвіст
    ctx.save();
    ctx.translate(-s * 0.38, b);
    ctx.rotate(flap);
    fillEllipse(ctx, -s * 0.08, -s * 0.08, s * 0.1, s * 0.05, blue, s, -0.6);
    fillEllipse(ctx, -s * 0.08, s * 0.08, s * 0.1, s * 0.05, blue, s, 0.6);
    ctx.restore();
    // Плавець на спині
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.14 + b);
    ctx.quadraticCurveTo(-s * 0.14, -s * 0.34 + b, -s * 0.2, -s * 0.36 + b);
    ctx.quadraticCurveTo(-s * 0.02, -s * 0.3 + b, s * 0.08, -s * 0.15 + b);
    ctx.closePath();
    ctx.fillStyle = "#3f86c4";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, 0, b, s * 0.38, s * 0.19, blue, s);
    fillEllipse(ctx, s * 0.44, s * 0.03 + b, s * 0.1, s * 0.05, blue, s);
    fillEllipse(ctx, s * 0.06, s * 0.08 + b, s * 0.26, s * 0.07, "#dff3ff");
    fillEllipse(ctx, s * 0.02, s * 0.14 + b, s * 0.09, s * 0.04, "#3f86c4", s * 0.8, 0.5);
    petEye(ctx, s * 0.24, -s * 0.03 + b, s * 0.065, t, eyeMood(o), 8);
    petCheek(ctx, s * 0.22, s * 0.07 + b, s * 0.035);
    petMouth(ctx, s * 0.4, s * 0.05 + b, s * 0.06, s, o.mood);
    ctx.restore();
}

// ---------- Брейнрот: Кавунотто Крокодило ----------

function drawKavunotto(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const croc = "#4caf50";
    petSneaker(ctx, -s * 0.2, s * 0.5, s * 0.2, "#2f7bff", s, ph + Math.PI);
    petSneaker(ctx, s * 0.14, s * 0.5, s * 0.2, "#2f7bff", s, ph);
    petLeg(ctx, -s * 0.2, s * 0.24, s * 0.1, s * 0.18, 0, croc, s);
    petLeg(ctx, s * 0.14, s * 0.24, s * 0.1, s * 0.18, 0, croc, s);
    // Хвіст
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.12 + b);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.1 + b, -s * 0.58, -s * 0.02 + b + wagAngle(t, o.mood) * s * 0.1);
    ctx.quadraticCurveTo(-s * 0.46, s * 0.24 + b, -s * 0.26, s * 0.26 + b);
    ctx.closePath();
    ctx.fillStyle = croc;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Тіло — скибка кавуна: шкірка, біла смужка, червона м'якоть із кісточками
    const cy = s * 0.28 + b;
    const R = s * 0.38;
    ctx.beginPath();
    ctx.arc(0, cy, R, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#2f9e44";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, cy, R * 0.86, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#eaffdf";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, cy, R * 0.76, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#ff4d5e";
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    const seeds = [[-0.4, 0.28], [-0.15, 0.5], [0.15, 0.45], [0.38, 0.25], [0, 0.22], [-0.3, 0.1]];
    for (const sd of seeds) {
        fillEllipse(ctx, sd[0] * R, cy - sd[1] * R, s * 0.022, s * 0.035, "#1a1a1a");
    }
    // Голова крокодила з довгою пащею й зубками
    const hx = s * 0.26;
    const hy = -s * 0.04 + b;
    fillRoundRect(ctx, hx - s * 0.06, hy - s * 0.09, s * 0.42, s * 0.18, s * 0.07, croc, s);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i++) {
        const tx = hx + s * (0.06 + i * 0.075);
        ctx.beginPath();
        ctx.moveTo(tx, hy + s * 0.08);
        ctx.lineTo(tx + s * 0.03, hy + s * 0.14);
        ctx.lineTo(tx + s * 0.06, hy + s * 0.08);
        ctx.closePath();
        ctx.fill();
    }
    fillEllipse(ctx, hx + s * 0.32, hy - s * 0.07, s * 0.03, s * 0.025, croc, s * 0.6);
    // Великі «вилупкуваті» очі зверху
    fillEllipse(ctx, hx + s * 0.02, hy - s * 0.12, s * 0.08, s * 0.08, croc, s);
    fillEllipse(ctx, hx + s * 0.15, hy - s * 0.12, s * 0.08, s * 0.08, croc, s);
    petEye(ctx, hx + s * 0.02, hy - s * 0.14, s * 0.065, t, eyeMood(o), 9);
    petEye(ctx, hx + s * 0.15, hy - s * 0.14, s * 0.065, t, eyeMood(o), 9);
}

// ---------- Брейнрот: Пельменіно Пінгвіно ----------

function drawPelmenino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const waddle = ph ? Math.sin(ph) * 0.08 : 0;
    petSneaker(ctx, -s * 0.12, s * 0.5, s * 0.18, "#ff8c1a", s, ph + Math.PI);
    petSneaker(ctx, s * 0.14, s * 0.5, s * 0.18, "#ff8c1a", s, ph);
    ctx.save();
    ctx.rotate(waddle);
    fillEllipse(ctx, 0, s * 0.08 + b, s * 0.28, s * 0.36, "#26324f", s);
    fillEllipse(ctx, s * 0.06, s * 0.14 + b, s * 0.19, s * 0.27, "#f6e7c8");
    // Крильця
    fillEllipse(ctx, -s * 0.26, s * 0.1 + b, s * 0.06, s * 0.15, "#26324f", s, 0.35 + (o.mood === "happy" && t ? Math.sin(t * 0.04) * 0.5 : 0));
    const hy = -s * 0.14 + b;
    petEye(ctx, s * 0.02, hy, s * 0.07, t, eyeMood(o), 10);
    petEye(ctx, s * 0.17, hy, s * 0.07, t, eyeMood(o), 10);
    // Дзьобик
    ctx.beginPath();
    ctx.moveTo(s * 0.2, hy + s * 0.07);
    ctx.lineTo(s * 0.34, hy + s * 0.11);
    ctx.lineTo(s * 0.2, hy + s * 0.15);
    ctx.closePath();
    ctx.fillStyle = "#ff9a1a";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    petCheek(ctx, -s * 0.03, hy + s * 0.11, s * 0.04);
    // Капелюх-пельмень із защипами та ложечкою сметани
    const py = -s * 0.36 + b;
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, py + s * 0.06);
    ctx.quadraticCurveTo(0, py - s * 0.26, s * 0.26, py + s * 0.06);
    ctx.quadraticCurveTo(0, py + s * 0.14, -s * 0.26, py + s * 0.06);
    ctx.closePath();
    ctx.fillStyle = "#fbefd6";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.lineWidth = petLine(s) * 0.6;
    for (let i = 0; i < 6; i++) {
        const a = Math.PI * (1.1 + i * 0.16);
        const cx = Math.cos(a) * s * 0.2;
        const cyy = py + s * 0.02 + Math.sin(a) * s * 0.14;
        ctx.beginPath();
        ctx.arc(cx, cyy, s * 0.03, a - 1, a + 1);
        ctx.stroke();
    }
    fillEllipse(ctx, s * 0.02, py - s * 0.1, s * 0.07, s * 0.045, "#ffffff", s * 0.6);
    fillEllipse(ctx, s * 0.07, py - s * 0.15, s * 0.04, s * 0.015, "#3fbf4f", 0, -0.6);
    ctx.restore();
}

export const PET_RENDERERS = {
    pet_puppy: drawPuppy,
    pet_capybara: drawCapybara,
    pet_duck: drawDuck,
    pet_llama: drawLlama,
    pet_alpaca: drawAlpaca,
    pet_turtle: drawTurtle,
    pet_jellyfish: drawJellyfish,
    pet_dolphin: drawDolphin,
    pet_kavunotto: drawKavunotto,
    pet_pelmenino: drawPelmenino,
    pet_capibaro_mandarino: drawCapibaroMandarino
};
