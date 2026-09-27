// ============================================================
// pet_renderers_3.js — малювальники улюбленців, частина 3: летючі (сова, привид,
// дракончик, міні-НЛО, робот-дрон, фенікс-пташеня) і секретний Борщеліно Драконіно
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, eyeMood, fillEllipse, fillRoundRect, petCheek, petEye, petLine, petMouth } from "./pet_parts.js";

// Помах крил: швидше, коли улюбленець радіє
function flapAngle(t, o) {
    if (!t) {
        return 0.3;
    }
    return Math.sin(t * (o.mood === "happy" || o.mood === "combo" ? 0.05 : 0.03)) * 0.5;
}

// Перетинчасте крило (дракони): від точки кріплення (x, y) назад і вгору
function batWing(ctx, x, y, len, angle, fill, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.5 - angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-len * 0.35, -len * 0.9);
    ctx.lineTo(-len, -len * 0.55);
    ctx.quadraticCurveTo(-len * 0.75, -len * 0.3, -len * 0.8, -len * 0.05);
    ctx.quadraticCurveTo(-len * 0.45, -len * 0.1, -len * 0.4, len * 0.1);
    ctx.quadraticCurveTo(-len * 0.2, -len * 0.05, 0, 0);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.restore();
}

// Пір'яне крило (птахи)
function featherWing(ctx, x, y, len, angle, fill, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angle);
    fillEllipse(ctx, -len * 0.45, -len * 0.1, len * 0.5, len * 0.26, fill, s, -0.35);
    ctx.restore();
}

// ---------- Сова ----------

function drawOwl(ctx, s, t, o) {
    const flap = flapAngle(t, o);
    const brown = "#8d6e63";
    featherWing(ctx, -s * 0.18, -s * 0.02, s * 0.42, flap, "#6d4c41", s);
    fillEllipse(ctx, 0, s * 0.04, s * 0.3, s * 0.34, brown, s);
    fillEllipse(ctx, s * 0.03, s * 0.14, s * 0.18, s * 0.2, "#d7c2a6");
    ctx.fillStyle = "#b39580";
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(s * (-0.05 + i * 0.08), s * 0.14, s * 0.03, 0, Math.PI);
        ctx.fill();
    }
    // Вушка-пір'їнки
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.2);
    ctx.lineTo(-s * 0.24, -s * 0.4);
    ctx.lineTo(-s * 0.08, -s * 0.26);
    ctx.moveTo(s * 0.14, -s * 0.26);
    ctx.lineTo(s * 0.26, -s * 0.4);
    ctx.lineTo(s * 0.24, -s * 0.2);
    ctx.fillStyle = brown;
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Великі очі-диски
    fillEllipse(ctx, -s * 0.08, -s * 0.12, s * 0.12, s * 0.12, "#ffe7a6", s * 0.8);
    fillEllipse(ctx, s * 0.16, -s * 0.12, s * 0.12, s * 0.12, "#ffe7a6", s * 0.8);
    petEye(ctx, -s * 0.08, -s * 0.12, s * 0.08, t, eyeMood(o), 20);
    petEye(ctx, s * 0.16, -s * 0.12, s * 0.08, t, eyeMood(o), 20);
    ctx.beginPath();
    ctx.moveTo(s * 0.02, -s * 0.04);
    ctx.lineTo(s * 0.08, -s * 0.04);
    ctx.lineTo(s * 0.05, s * 0.04);
    ctx.closePath();
    ctx.fillStyle = "#ffa31a";
    ctx.fill();
    ctx.stroke();
    fillEllipse(ctx, -s * 0.06, s * 0.38, s * 0.05, s * 0.03, "#ffa31a", s * 0.6);
    fillEllipse(ctx, s * 0.1, s * 0.38, s * 0.05, s * 0.03, "#ffa31a", s * 0.6);
}

// ---------- Привид ----------

function drawGhost(ctx, s, t, o) {
    const wave = t ? t * 0.008 : 0;
    // М'яке сяйво
    const glow = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s * 0.55);
    glow.addColorStop(0, "rgba(200, 230, 255, 0.35)");
    glow.addColorStop(1, "rgba(200, 230, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.3);
    ctx.bezierCurveTo(-s * 0.36, -s * 0.52, s * 0.36, -s * 0.52, s * 0.3, s * 0.3);
    // Хвилястий низ
    for (let i = 0; i < 4; i++) {
        const x1 = s * 0.3 - (i + 1) * s * 0.15;
        const dip = Math.sin(wave + i) * s * 0.04;
        ctx.quadraticCurveTo(x1 + s * 0.075, s * 0.42 + dip, x1, s * 0.3);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(240, 246, 255, 0.95)";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Ручки махають
    const hand = t ? Math.sin(t * 0.01) * 0.4 : 0;
    fillEllipse(ctx, -s * 0.32, s * 0.02, s * 0.08, s * 0.05, "rgba(240, 246, 255, 0.95)", s, 0.6 + hand);
    fillEllipse(ctx, s * 0.33, s * 0.02, s * 0.08, s * 0.05, "rgba(240, 246, 255, 0.95)", s, -0.6 - hand);
    petEye(ctx, -s * 0.06, -s * 0.1, s * 0.07, t, eyeMood(o), 21);
    petEye(ctx, s * 0.14, -s * 0.1, s * 0.07, t, eyeMood(o), 21);
    petCheek(ctx, -s * 0.14, s * 0.02, s * 0.04);
    petCheek(ctx, s * 0.22, s * 0.02, s * 0.04);
    if (o.mood === "happy" || o.mood === "combo") {
        // Радісне «бу!» — ротик-кружечок
        fillEllipse(ctx, s * 0.04, s * 0.06, s * 0.04, s * 0.05, "#3a2a4a", s * 0.5);
    } else {
        petMouth(ctx, s * 0.04, s * 0.04, s * 0.07, s, o.mood);
    }
}

// ---------- Дракончик ----------

function drawMiniDragon(ctx, s, t, o) {
    const flap = flapAngle(t, o);
    const green = "#35c28b";
    batWing(ctx, -s * 0.06, -s * 0.08, s * 0.44, flap, "#8b5cf6", s);
    // Хвіст зі стрілкою
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, s * 0.16);
    ctx.quadraticCurveTo(-s * 0.4, s * 0.3, -s * 0.46, s * 0.08);
    ctx.lineWidth = s * 0.11;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.lineWidth = s * 0.07;
    ctx.strokeStyle = green;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.46, s * 0.0);
    ctx.lineTo(-s * 0.54, s * 0.1);
    ctx.lineTo(-s * 0.42, s * 0.12);
    ctx.closePath();
    ctx.fillStyle = "#8b5cf6";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.02, s * 0.12, s * 0.24, s * 0.2, green, s);
    fillEllipse(ctx, s * 0.04, s * 0.18, s * 0.13, s * 0.12, "#ffe08a");
    fillEllipse(ctx, -s * 0.08, s * 0.32, s * 0.05, s * 0.04, green, s * 0.7);
    fillEllipse(ctx, s * 0.1, s * 0.32, s * 0.05, s * 0.04, green, s * 0.7);
    const hx = s * 0.18;
    const hy = -s * 0.12;
    // Ріжки
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.1, hy - s * 0.12);
    ctx.lineTo(hx - s * 0.14, hy - s * 0.26);
    ctx.lineTo(hx - s * 0.02, hy - s * 0.15);
    ctx.moveTo(hx + s * 0.04, hy - s * 0.16);
    ctx.lineTo(hx + s * 0.06, hy - s * 0.3);
    ctx.lineTo(hx + s * 0.12, hy - s * 0.14);
    ctx.fillStyle = "#fff1c1";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.17, green, s);
    fillEllipse(ctx, hx + s * 0.15, hy + s * 0.05, s * 0.09, s * 0.07, "#5ee0a9", s * 0.7);
    fillEllipse(ctx, hx + s * 0.2, hy + s * 0.03, s * 0.015, s * 0.015, "#1a1a1a");
    petEye(ctx, hx + s * 0.02, hy - s * 0.03, s * 0.065, t, eyeMood(o), 22);
    petCheek(ctx, hx - s * 0.05, hy + s * 0.07, s * 0.035);
    if (o.mood === "happy" || o.mood === "combo") {
        // Маленький вогник із пащі
        const k = t ? (t % 400) / 400 : 0.5;
        ctx.save();
        ctx.globalAlpha = 1 - k * 0.6;
        fillEllipse(ctx, hx + s * (0.32 + k * 0.12), hy + s * 0.06, s * (0.06 + k * 0.03), s * (0.04 + k * 0.02), "#ffb02e");
        fillEllipse(ctx, hx + s * (0.3 + k * 0.1), hy + s * 0.06, s * 0.03, s * 0.02, "#fff2a8");
        ctx.restore();
    }
}

// ---------- Міні-НЛО ----------

function drawUfo(ctx, s, t, o) {
    const tilt = t ? Math.sin(t * 0.004) * 0.08 : 0;
    ctx.save();
    ctx.rotate(tilt);
    if (o.mood === "happy" || o.mood === "combo") {
        // Промінь притягування
        ctx.fillStyle = "rgba(120, 255, 200, 0.3)";
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, s * 0.1);
        ctx.lineTo(s * 0.12, s * 0.1);
        ctx.lineTo(s * 0.26, s * 0.5);
        ctx.lineTo(-s * 0.26, s * 0.5);
        ctx.closePath();
        ctx.fill();
    }
    // Скляний купол з інопланетянином
    ctx.beginPath();
    ctx.arc(0, -s * 0.02, s * 0.26, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(150, 230, 255, 0.45)";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, 0, -s * 0.1, s * 0.12, s * 0.12, "#7dff8a", s * 0.8);
    fillEllipse(ctx, -s * 0.05, -s * 0.24, s * 0.02, s * 0.05, "#7dff8a", s * 0.5, -0.3);
    fillEllipse(ctx, s * 0.05, -s * 0.24, s * 0.02, s * 0.05, "#7dff8a", s * 0.5, 0.3);
    petEye(ctx, -s * 0.04, -s * 0.11, s * 0.045, t, eyeMood(o), 23);
    petEye(ctx, s * 0.06, -s * 0.11, s * 0.045, t, eyeMood(o), 23);
    // Тарілка з вогниками
    fillEllipse(ctx, 0, s * 0.04, s * 0.48, s * 0.15, "#b8c4d6", s);
    fillEllipse(ctx, 0, s * 0.1, s * 0.3, s * 0.07, "#8492a8");
    const colors = ["#ff4a6a", "#ffe14d", "#39c6ff", "#7dff8a"];
    for (let i = 0; i < 5; i++) {
        const on = t ? (Math.floor(t / 200) + i) % 4 : i % 4;
        fillEllipse(ctx, -s * 0.32 + i * s * 0.16, s * 0.04, s * 0.04, s * 0.035, colors[on]);
    }
    ctx.restore();
}

// ---------- Робот-дрон ----------

function drawDrone(ctx, s, t, o) {
    const spin = t ? t * 0.05 : 0;
    // Пропелери на кронштейнах
    for (const side of [-1, 1]) {
        const px = side * s * 0.34;
        ctx.lineWidth = petLine(s);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.beginPath();
        ctx.moveTo(side * s * 0.18, -s * 0.12);
        ctx.lineTo(px, -s * 0.3);
        ctx.stroke();
        const w = Math.abs(Math.cos(spin + side)) * s * 0.18 + s * 0.03;
        fillEllipse(ctx, px, -s * 0.32, w, s * 0.03, "rgba(200, 220, 240, 0.9)", s * 0.6);
        fillEllipse(ctx, px, -s * 0.32, s * 0.03, s * 0.03, "#ff4a6a", s * 0.5);
    }
    fillRoundRect(ctx, -s * 0.3, -s * 0.2, s * 0.6, s * 0.48, s * 0.14, "#e9eef6", s);
    fillRoundRect(ctx, -s * 0.3, s * 0.14, s * 0.6, s * 0.14, s * 0.07, "#ff8a2a", s * 0.6);
    // Екран-обличчя
    fillRoundRect(ctx, -s * 0.18, -s * 0.12, s * 0.36, s * 0.22, s * 0.06, "#101a2e", s * 0.6);
    ctx.fillStyle = "#00f6ff";
    const blink = t && (t % 3000) < 120;
    if (o.mood === "happy") {
        ctx.lineWidth = s * 0.04;
        ctx.strokeStyle = "#00f6ff";
        ctx.beginPath();
        ctx.arc(-s * 0.05, s * 0.02, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(s * 0.15, s * 0.02);
        ctx.arc(s * 0.11, s * 0.02, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else if (o.mood === "sad") {
        ctx.fillRect(-s * 0.09, s * 0.02, s * 0.08, s * 0.025);
        ctx.fillRect(s * 0.07, s * 0.02, s * 0.08, s * 0.025);
    } else {
        const h = blink ? s * 0.02 : s * 0.09;
        ctx.fillRect(-s * 0.08, -s * 0.03 + (s * 0.09 - h) / 2, s * 0.06, h);
        ctx.fillRect(s * 0.08, -s * 0.03 + (s * 0.09 - h) / 2, s * 0.06, h);
    }
    // Антена з вогником
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.18);
    ctx.lineTo(0, -s * 0.3);
    ctx.stroke();
    fillEllipse(ctx, 0, -s * 0.32, s * 0.035, s * 0.035, t && Math.floor(t / 400) % 2 ? "#7dff8a" : "#2a8a4a", s * 0.5);
}

// ---------- Фенікс-пташеня ----------

function drawPhoenix(ctx, s, t, o) {
    const flap = flapAngle(t, o);
    const flick = t ? Math.sin(t * 0.02) : 0;
    // Вогняний хвіст
    for (let i = 0; i < 3; i++) {
        const k = t ? ((t * 0.002 + i / 3) % 1) : i / 3;
        fillEllipse(ctx, -s * (0.3 + k * 0.2), s * (0.12 + (i - 1) * 0.06), s * (0.12 - k * 0.06), s * 0.05, i === 1 ? "#ffe14d" : "#ff7a1a", 0, (i - 1) * 0.4);
    }
    featherWing(ctx, -s * 0.1, 0, s * 0.36, flap, "#ff5a1a", s);
    fillEllipse(ctx, 0, s * 0.06, s * 0.28, s * 0.27, "#ff8a2a", s);
    fillEllipse(ctx, s * 0.05, s * 0.14, s * 0.16, s * 0.14, "#ffd05a");
    // Вогняний чубчик мерехтить
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, -s * 0.16);
    ctx.quadraticCurveTo(-s * 0.16, -s * (0.42 + flick * 0.04), -s * 0.02, -s * 0.3);
    ctx.quadraticCurveTo(s * 0.02, -s * (0.5 - flick * 0.04), s * 0.08, -s * 0.28);
    ctx.quadraticCurveTo(s * 0.2, -s * (0.4 + flick * 0.03), s * 0.14, -s * 0.16);
    ctx.closePath();
    ctx.fillStyle = "#ffe14d";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    petEye(ctx, s * 0.08, -s * 0.04, s * 0.07, t, eyeMood(o), 24);
    ctx.beginPath();
    ctx.moveTo(s * 0.24, -s * 0.02);
    ctx.lineTo(s * 0.36, s * 0.03);
    ctx.lineTo(s * 0.24, s * 0.07);
    ctx.closePath();
    ctx.fillStyle = "#ffcf3a";
    ctx.fill();
    ctx.stroke();
    petCheek(ctx, s * 0.02, s * 0.08, s * 0.04);
}

// ---------- Секретний: Борщеліно Драконіно ----------

function drawBorshchelino(ctx, s, t, o) {
    const flap = flapAngle(t, o);
    // Крила на мисці
    batWing(ctx, -s * 0.28, s * 0.14, s * 0.34, flap, "#b3122b", s);
    // Дракон визирає з борщу
    const rise = t ? Math.sin(t * 0.004) * s * 0.03 : 0;
    const red = "#e8453c";
    fillRoundRect(ctx, -s * 0.04, -s * 0.3 + rise, s * 0.16, s * 0.42, s * 0.08, red, s);
    const hx = s * 0.1;
    const hy = -s * 0.32 + rise;
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.1, hy - s * 0.08);
    ctx.lineTo(hx - s * 0.16, hy - s * 0.24);
    ctx.lineTo(hx - s * 0.02, hy - s * 0.12);
    ctx.moveTo(hx + s * 0.02, hy - s * 0.12);
    ctx.lineTo(hx + s * 0.04, hy - s * 0.28);
    ctx.lineTo(hx + s * 0.12, hy - s * 0.1);
    ctx.fillStyle = "#ffe08a";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, hx, hy, s * 0.17, s * 0.14, red, s);
    fillEllipse(ctx, hx + s * 0.14, hy + s * 0.04, s * 0.08, s * 0.06, "#ff7a6e", s * 0.7);
    petEye(ctx, hx + s * 0.02, hy - s * 0.03, s * 0.06, t, eyeMood(o), 25);
    if (o.mood === "happy" || o.mood === "combo") {
        // Пара з борщу замість вогню
        ctx.save();
        ctx.globalAlpha = 0.7;
        const k = t ? (t % 700) / 700 : 0.5;
        fillEllipse(ctx, hx + s * (0.28 + k * 0.1), hy - k * s * 0.1, s * 0.05, s * 0.04, "#ffffff");
        ctx.restore();
    }
    // Миска з українським орнаментом і борщем
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.08);
    ctx.quadraticCurveTo(-s * 0.38, s * 0.46, 0, s * 0.46);
    ctx.quadraticCurveTo(s * 0.38, s * 0.46, s * 0.42, s * 0.08);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = "#d8142f";
    for (let i = 0; i < 5; i++) {
        const x = -s * 0.24 + i * s * 0.12;
        ctx.beginPath();
        ctx.moveTo(x, s * 0.22);
        ctx.lineTo(x + s * 0.04, s * 0.27);
        ctx.lineTo(x, s * 0.32);
        ctx.lineTo(x - s * 0.04, s * 0.27);
        ctx.closePath();
        ctx.fill();
    }
    fillEllipse(ctx, 0, s * 0.08, s * 0.42, s * 0.08, "#b3122b", s);
    // Сметанка й кріп
    fillEllipse(ctx, -s * 0.22, s * 0.06, s * 0.07, s * 0.035, "#fffaf0", s * 0.5);
    ctx.strokeStyle = "#3fbf4f";
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.08);
    ctx.lineTo(s * 0.3, s * 0.02);
    ctx.moveTo(s * 0.24, s * 0.06);
    ctx.lineTo(s * 0.24, s * 0.0);
    ctx.stroke();
}

export const PET_RENDERERS_3 = {
    pet_owl: drawOwl,
    pet_ghost: drawGhost,
    pet_mini_dragon: drawMiniDragon,
    pet_ufo: drawUfo,
    pet_drone: drawDrone,
    pet_phoenix: drawPhoenix,
    pet_borshchelino: drawBorshchelino
};
