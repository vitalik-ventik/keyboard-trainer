// ============================================================
// pet_renderers_5.js — малювальники улюбленців, частина 5: секретні брейнроти
// срібного сундука — Акулоні Турбоні, Кавуноні Бомбоні, Капучино Балеріно,
// Шимпанзіні Бананіні, Пельменіно Мафіозо, Фрідж Холодоні
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillRoundRect, petEye, petLimb, petLine, petMouth, petSneaker, runPhase, sneakerLegs } from "./pet_parts.js";

// ---------- Акулоні Турбоні: трилапа акула з турбіною ----------

function drawAkuloni(ctx, s, t, o) {
    const b = breathe(t, s);
    const steel = "#7f93ad";
    const ph = t ? t * 0.02 : 0;
    // Три лапи в кросівках теліпаються знизу
    for (let i = 0; i < 3; i++) {
        const lx = -s * 0.18 + i * s * 0.16;
        const swing = Math.sin(ph + i * 2.1) * s * 0.04;
        petLimb(ctx, lx, s * 0.12 + b, lx + swing, s * 0.3 + b, s * 0.05, steel, s);
        petSneaker(ctx, lx + swing, s * 0.4 + b, s * 0.15, "#ff3b4f", s, 0);
    }
    // Реактивний слід із турбіни
    const flame = t ? 0.7 + Math.sin(t * 0.05) * 0.3 : 0.8;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.24 + b);
    ctx.lineTo(-s * (0.3 + flame * 0.26), -s * 0.2 + b);
    ctx.lineTo(-s * 0.3, -s * 0.16 + b);
    ctx.closePath();
    ctx.fillStyle = "#39c6ff";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.225 + b);
    ctx.lineTo(-s * (0.3 + flame * 0.15), -s * 0.2 + b);
    ctx.lineTo(-s * 0.3, -s * 0.175 + b);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    // Хвіст
    ctx.save();
    ctx.translate(-s * 0.36, b);
    ctx.rotate(t ? Math.sin(t * 0.014) * 0.3 : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-s * 0.16, -s * 0.18);
    ctx.lineTo(-s * 0.1, 0);
    ctx.lineTo(-s * 0.16, s * 0.12);
    ctx.closePath();
    ctx.fillStyle = steel;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.restore();
    // Тіло, червона гоночна смуга, черево
    fillEllipse(ctx, 0, b, s * 0.42, s * 0.18, steel, s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, b, s * 0.41, s * 0.17, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ff3b4f";
    ctx.fillRect(-s * 0.45, -s * 0.06 + b, s * 0.9, s * 0.04);
    ctx.restore();
    fillEllipse(ctx, s * 0.06, s * 0.08 + b, s * 0.3, s * 0.07, "#eef4fb");
    // Турбіна на спині замість плавця
    fillRoundRect(ctx, -s * 0.32, -s * 0.28 + b, s * 0.3, s * 0.14, s * 0.07, "#c8d0dc", s);
    fillEllipse(ctx, -s * 0.3, -s * 0.21 + b, s * 0.03, s * 0.06, "#2b2f3a");
    const spin = t ? t * 0.06 : 0;
    ctx.strokeStyle = "#5a6478";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
        const x = -s * 0.25 + ((spin * s * 0.02 + k * s * 0.07) % (s * 0.2));
        ctx.moveTo(x, -s * 0.26 + b);
        ctx.lineTo(x + s * 0.02, -s * 0.16 + b);
    }
    ctx.stroke();
    // Зубаста усмішка
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(s * 0.14, s * 0.04 + b);
    ctx.quadraticCurveTo(s * 0.28, s * 0.12 + b, s * 0.4, s * 0.02 + b);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const tx = s * (0.17 + i * 0.045);
        ctx.moveTo(tx, s * 0.04 + b);
        ctx.lineTo(tx + s * 0.02, s * 0.075 + b);
    }
    ctx.stroke();
    // Гоночні окуляри
    const ex = s * 0.22;
    const ey = -s * 0.06 + b;
    ctx.fillStyle = "#2b2f3a";
    ctx.fillRect(-s * 0.02, ey - s * 0.02, ex, s * 0.035);
    petEye(ctx, ex, ey, s * 0.06, t, eyeMood(o), 41);
    ctx.lineWidth = Math.max(1.2, s * 0.03);
    ctx.strokeStyle = "#ffb000";
    ctx.beginPath();
    ctx.arc(ex, ey, s * 0.085, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 190, 60, 0.25)";
    ctx.fill();
}

// ---------- Кавуноні Бомбоні: кавун-бомба з ґнотом ----------

function drawKavunBomboni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    sneakerLegs(ctx, s, [-s * 0.12, s * 0.12], s * 0.24, "#2e7d32", "#ff3b4f", ph);
    const cy = -s * 0.04 + b;
    const r = s * 0.3;
    fillEllipse(ctx, 0, cy, r, r * 0.95, "#2f9e44", s);
    // Темні смуги кавуна
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, cy, r * 0.97, r * 0.92, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "#16622a";
    ctx.lineWidth = s * 0.05;
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.12, cy - r);
        ctx.quadraticCurveTo(i * s * 0.16 + s * 0.03, cy, i * s * 0.12, cy + r);
        ctx.stroke();
    }
    ctx.restore();
    // Ґніт з іскрами
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1.4, s * 0.035);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-s * 0.02, cy - r * 0.95);
    ctx.quadraticCurveTo(-s * 0.02, cy - r * 1.3, s * 0.08, cy - r * 1.4);
    ctx.stroke();
    ctx.strokeStyle = "#d9c7a5";
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.stroke();
    fillRoundRect(ctx, -s * 0.07, cy - r * 1.05, s * 0.1, s * 0.06, s * 0.015, "#5a6478", s * 0.6);
    const sparkle = t ? 0.6 + Math.abs(Math.sin(t * 0.04)) * 0.6 : 1;
    ctx.fillStyle = "#ffe14d";
    for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + (t ? t * 0.01 : 0);
        ctx.fillRect(s * 0.08 + Math.cos(a) * s * 0.05 * sparkle - s * 0.012, cy - r * 1.4 + Math.sin(a) * s * 0.05 * sparkle - s * 0.012, s * 0.024, s * 0.024);
    }
    fillEllipse(ctx, s * 0.08, cy - r * 1.4, s * 0.025 * sparkle, s * 0.025 * sparkle, "#ff9a1a");
    // Очі й рот-скибка з кісточками
    const ey = cy - s * 0.07;
    petEye(ctx, s * 0.02, ey, s * 0.065, t, eyeMood(o), 42);
    petEye(ctx, s * 0.17, ey, s * 0.065, t, eyeMood(o), 42);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.17, ey, s * 0.065, s);
        angryBrow(ctx, s * 0.02, ey, s * 0.065, s);
    }
    const my = cy + s * 0.08;
    ctx.beginPath();
    if (o.mood === "sad") {
        ctx.moveTo(s * 0.0, my + s * 0.06);
        ctx.quadraticCurveTo(s * 0.1, my - s * 0.02, s * 0.2, my + s * 0.06);
        ctx.lineTo(s * 0.0, my + s * 0.06);
    } else {
        ctx.moveTo(-s * 0.02, my);
        ctx.lineTo(s * 0.22, my);
        ctx.quadraticCurveTo(s * 0.2, my + s * 0.12, s * 0.1, my + s * 0.12);
        ctx.quadraticCurveTo(-s * 0.01, my + s * 0.1, -s * 0.02, my);
    }
    ctx.closePath();
    ctx.fillStyle = "#ff4a5a";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    if (o.mood !== "sad") {
        ctx.fillStyle = "#1a1a1a";
        for (let i = 0; i < 3; i++) {
            fillEllipse(ctx, s * (0.04 + i * 0.07), my + s * 0.05, s * 0.012, s * 0.02, "#1a1a1a");
        }
    }
}

// ---------- Капучино Балеріно: чашка кави в пачці на пуантах ----------

function drawBallerino(ctx, s, t, o) {
    const b = breathe(t, s);
    const ph = runPhase(t, o);
    // Балерина біжить навшпиньки, підстрибуючи
    const hop = ph ? Math.abs(Math.sin(ph)) * s * 0.04 : 0;
    const y0 = b - hop;
    // Ніжки-палички в рожевих пуантах
    for (let i = 0; i < 2; i++) {
        const phase = ph + i * Math.PI;
        const kick = ph ? Math.sin(phase) * s * 0.08 : (i === 0 ? -s * 0.04 : s * 0.04);
        const fx = -s * 0.04 + i * s * 0.1 + kick;
        const fy = s * 0.46 - (ph ? Math.max(0, Math.cos(phase)) * s * 0.06 : 0) - hop;
        petLimb(ctx, -s * 0.02 + i * s * 0.06, s * 0.14 + y0, fx, fy, s * 0.04, "#f7e1c8", s);
        fillEllipse(ctx, fx, fy + s * 0.02, s * 0.035, s * 0.04, "#ff8ad8", s * 0.6);
    }
    // Тулуб і руки дугою над головою
    fillRoundRect(ctx, -s * 0.07, -s * 0.12 + y0, s * 0.14, s * 0.22, s * 0.05, "#ffb3e0", s);
    const armWave = t ? Math.sin(t * 0.006) * s * 0.03 : 0;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, -s * 0.08 + y0);
    ctx.quadraticCurveTo(-s * 0.34, -s * 0.2 + y0 + armWave, -s * 0.24, -s * 0.5 + y0);
    ctx.moveTo(s * 0.06, -s * 0.08 + y0);
    ctx.quadraticCurveTo(s * 0.36, -s * 0.2 + y0 - armWave, s * 0.26, -s * 0.5 + y0);
    ctx.stroke();
    ctx.strokeStyle = "#f7e1c8";
    ctx.lineWidth = s * 0.03;
    ctx.stroke();
    // Пачка-тюль у три шари
    fillEllipse(ctx, 0, s * 0.12 + y0, s * 0.34, s * 0.07, "#ff9ad8", s);
    fillEllipse(ctx, 0, s * 0.1 + y0, s * 0.28, s * 0.055, "#ffc2ea", s * 0.7);
    fillEllipse(ctx, 0, s * 0.08 + y0, s * 0.2, s * 0.04, "#ffe0f4", s * 0.5);
    // Голова-чашка з ручкою та піною з сердечком
    const cx = 0;
    const cy = -s * 0.28 + y0;
    ctx.beginPath();
    ctx.arc(cx - s * 0.2, cy + s * 0.02, s * 0.07, Math.PI * 0.4, Math.PI * 1.6);
    ctx.lineWidth = s * 0.05;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.lineWidth = s * 0.028;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.2, cy - s * 0.1);
    ctx.quadraticCurveTo(cx + s * 0.18, cy + s * 0.14, cx + s * 0.1, cy + s * 0.15);
    ctx.lineTo(cx - s * 0.1, cy + s * 0.15);
    ctx.quadraticCurveTo(cx - s * 0.18, cy + s * 0.14, cx - s * 0.2, cy - s * 0.1);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, cx, cy - s * 0.1, s * 0.2, s * 0.05, "#d9a066", s);
    fillEllipse(ctx, cx, cy - s * 0.1, s * 0.14, s * 0.03, "#fff0d6");
    ctx.fillStyle = "#a0602a";
    ctx.beginPath();
    ctx.arc(cx - s * 0.02, cy - s * 0.105, s * 0.02, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.02, cy - s * 0.105, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    // Пара над кавою
    if (t) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, s * 0.02);
        const k = (t * 0.001) % 1;
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.06, cy - s * 0.16 - k * s * 0.1);
        ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.2 - k * s * 0.1, cx + s * 0.06, cy - s * 0.24 - k * s * 0.1);
        ctx.stroke();
        ctx.restore();
    }
    petEye(ctx, cx + s * 0.0, cy + s * 0.01, s * 0.05, t, eyeMood(o), 43);
    petEye(ctx, cx + s * 0.12, cy + s * 0.01, s * 0.05, t, eyeMood(o), 43);
    petMouth(ctx, cx + s * 0.07, cy + s * 0.09, s * 0.06, s, o.mood);
}

// ---------- Шимпанзіні Бананіні: мавпа, що сидить у банані ----------

function drawShimpanzini(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#5a3a22";
    const face = "#d9a676";
    // Ноги-лапи мавпи з-під банана
    for (let i = 0; i < 2; i++) {
        const phase = ph ? ph + i * Math.PI : 0;
        const swing = phase ? Math.sin(phase) * s * 0.06 : 0;
        const lift = phase ? Math.max(0, Math.cos(phase)) * s * 0.05 : 0;
        const lx = -s * 0.1 + i * s * 0.2;
        petLimb(ctx, lx, s * 0.24, lx + swing, s * 0.44 - lift, s * 0.07, fur, s);
        fillEllipse(ctx, lx + swing + s * 0.03, s * 0.46 - lift, s * 0.07, s * 0.04, face, s * 0.7);
    }
    // Банан-«кокон» (шкірка)
    ctx.beginPath();
    ctx.moveTo(-s * 0.24, -s * 0.1 + b);
    ctx.quadraticCurveTo(-s * 0.3, s * 0.34 + b, 0, s * 0.34 + b);
    ctx.quadraticCurveTo(s * 0.3, s * 0.34 + b, s * 0.26, -s * 0.1 + b);
    ctx.quadraticCurveTo(0, s * 0.0 + b, -s * 0.24, -s * 0.1 + b);
    ctx.closePath();
    ctx.fillStyle = "#ffd83a";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, s * 0.0, s * 0.3 + b, s * 0.05, s * 0.03, "#5a3a14", s * 0.5);
    // Голова мавпи виглядає з банана
    const hx = s * 0.02;
    const hy = -s * 0.18 + b;
    fillEllipse(ctx, hx - s * 0.17, hy, s * 0.06, s * 0.07, face, s);
    fillEllipse(ctx, hx + s * 0.19, hy, s * 0.06, s * 0.07, face, s);
    fillEllipse(ctx, hx, hy - s * 0.02, s * 0.18, s * 0.17, fur, s);
    fillEllipse(ctx, hx + s * 0.02, hy + s * 0.03, s * 0.13, s * 0.11, face);
    petEye(ctx, hx - s * 0.03, hy - s * 0.02, s * 0.05, t, eyeMood(o), 44);
    petEye(ctx, hx + s * 0.08, hy - s * 0.02, s * 0.05, t, eyeMood(o), 44);
    fillEllipse(ctx, hx + s * 0.03, hy + s * 0.05, s * 0.015, s * 0.01, PET_OUTLINE);
    fillEllipse(ctx, hx + s * 0.06, hy + s * 0.05, s * 0.015, s * 0.01, PET_OUTLINE);
    petMouth(ctx, hx + s * 0.04, hy + s * 0.1, s * 0.07, s, o.mood);
    // Пелюстки шкірки перед мавпою
    const flap = t ? Math.sin(t * 0.008) * 0.12 : 0;
    const petal = function (x, rot) {
        ctx.save();
        ctx.translate(x, -s * 0.06 + b);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(-s * 0.07, 0);
        ctx.quadraticCurveTo(-s * 0.06, -s * 0.16, 0, -s * 0.2);
        ctx.quadraticCurveTo(s * 0.06, -s * 0.16, s * 0.07, 0);
        ctx.closePath();
        ctx.fillStyle = "#ffe36a";
        ctx.fill();
        ctx.lineWidth = petLine(s) * 0.9;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.restore();
    };
    petal(-s * 0.2, -0.9 - flap);
    petal(s * 0.22, 0.9 + flap);
    // Руки махають (у радості — вгору)
    const up = o.mood === "happy" ? -s * 0.2 : 0;
    const wave = t ? Math.sin(t * 0.012) * s * 0.04 : 0;
    petLimb(ctx, -s * 0.18, s * 0.02 + b, -s * 0.34, s * 0.12 + b + up + wave, s * 0.06, fur, s);
    petLimb(ctx, s * 0.2, s * 0.02 + b, s * 0.36, s * 0.1 + b + up - wave, s * 0.06, fur, s);
    fillEllipse(ctx, -s * 0.35, s * 0.13 + b + up + wave, s * 0.04, s * 0.04, face, s * 0.6);
    fillEllipse(ctx, s * 0.37, s * 0.11 + b + up - wave, s * 0.04, s * 0.04, face, s * 0.6);
}

// ---------- Пельменіно Мафіозо: пельмень у капелюсі з вусами ----------

function drawPelmenMafiozo(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const dough = "#f6ead2";
    sneakerLegs(ctx, s, [-s * 0.12, s * 0.12], s * 0.24, "#2b2f3a", "#ffffff", ph);
    // Пельмень-півмісяць із защипами
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, s * 0.22 + b);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.28 + b, 0, -s * 0.3 + b);
    ctx.quadraticCurveTo(s * 0.4, -s * 0.28 + b, s * 0.36, s * 0.22 + b);
    ctx.quadraticCurveTo(0, s * 0.34 + b, -s * 0.36, s * 0.22 + b);
    ctx.closePath();
    ctx.fillStyle = dough;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.strokeStyle = "#d9c7a5";
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = Math.PI * (1.15 + i * 0.14);
        ctx.moveTo(Math.cos(a) * s * 0.3, -s * 0.0 + b + Math.sin(a) * s * 0.26);
        ctx.lineTo(Math.cos(a) * s * 0.36, -s * 0.0 + b + Math.sin(a) * s * 0.32);
    }
    ctx.stroke();
    // Капелюх-федора з білою стрічкою, трохи набік
    ctx.save();
    ctx.translate(s * 0.02, -s * 0.3 + b);
    ctx.rotate(0.12);
    fillEllipse(ctx, 0, 0, s * 0.3, s * 0.05, "#1f2230", s);
    ctx.beginPath();
    ctx.moveTo(-s * 0.17, 0);
    ctx.lineTo(-s * 0.14, -s * 0.18);
    ctx.quadraticCurveTo(0, -s * 0.13, s * 0.14, -s * 0.18);
    ctx.lineTo(s * 0.17, 0);
    ctx.closePath();
    ctx.fillStyle = "#2b2f3a";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = "#f4f7fb";
    ctx.fillRect(-s * 0.165, -s * 0.06, s * 0.33, s * 0.04);
    ctx.restore();
    // Очі в тіні капелюха, вуса й зубочистка
    const ey = -s * 0.1 + b;
    petEye(ctx, s * 0.04, ey, s * 0.055, t, eyeMood(o), 45);
    petEye(ctx, s * 0.18, ey, s * 0.055, t, eyeMood(o), 45);
    if (coolMood(o)) {
        // Примружений погляд боса
        ctx.fillStyle = dough;
        ctx.fillRect(s * 0.0, ey - s * 0.07, s * 0.24, s * 0.05);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = Math.max(1, petLine(s) * 0.8);
        ctx.beginPath();
        ctx.moveTo(-s * 0.01, ey - s * 0.025);
        ctx.lineTo(s * 0.24, ey - s * 0.025);
        ctx.stroke();
    }
    ctx.fillStyle = "#3a2a20";
    ctx.beginPath();
    ctx.moveTo(s * 0.11, s * 0.02 + b);
    ctx.quadraticCurveTo(s * 0.02, s * 0.0 + b, -s * 0.02, s * 0.06 + b);
    ctx.quadraticCurveTo(s * 0.06, s * 0.04 + b, s * 0.11, s * 0.05 + b);
    ctx.quadraticCurveTo(s * 0.16, s * 0.04 + b, s * 0.24, s * 0.06 + b);
    ctx.quadraticCurveTo(s * 0.2, s * 0.0 + b, s * 0.11, s * 0.02 + b);
    ctx.fill();
    petMouth(ctx, s * 0.11, s * 0.1 + b, s * 0.06, s, o.mood);
    ctx.strokeStyle = "#e8c48a";
    ctx.lineWidth = Math.max(1, s * 0.018);
    ctx.beginPath();
    ctx.moveTo(s * 0.14, s * 0.09 + b);
    ctx.lineTo(s * 0.3, s * 0.06 + b);
    ctx.stroke();
    // Червоний метелик
    const by = s * 0.2 + b;
    ctx.beginPath();
    ctx.moveTo(s * 0.02, by);
    ctx.lineTo(-s * 0.07, by - s * 0.05);
    ctx.lineTo(-s * 0.07, by + s * 0.05);
    ctx.closePath();
    ctx.moveTo(s * 0.02, by);
    ctx.lineTo(s * 0.11, by - s * 0.05);
    ctx.lineTo(s * 0.11, by + s * 0.05);
    ctx.closePath();
    ctx.fillStyle = "#d8142f";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.6;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
}

// ---------- Фрідж Холодоні: холодильник на ніжках, що дихає морозом ----------

function drawFridge(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    sneakerLegs(ctx, s, [-s * 0.1, s * 0.12], s * 0.3, "#9aa3b8", "#39c6ff", ph);
    const x = -s * 0.22;
    const y = -s * 0.56 + b;
    const w = s * 0.44;
    const h = s * 0.88;
    // Дверцята морозилки відчиняються від радості — всередині світло й сніжинки
    const open = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) : 0;
    fillRoundRect(ctx, x, y, w, h, s * 0.08, "#e9f2fb", s);
    if (open > 0.05) {
        fillRoundRect(ctx, x + s * 0.03, y + s * 0.03, w - s * 0.06, h * 0.32, s * 0.04, "#fffbe0");
        ctx.fillStyle = "#8fd8ff";
        ctx.fillRect(x + s * 0.08, y + s * 0.12, s * 0.06, s * 0.06);
        ctx.fillRect(x + s * 0.24, y + s * 0.1, s * 0.08, s * 0.08);
        fillRoundRect(ctx, x + w - s * 0.02, y, s * 0.3 * open, h * 0.36, s * 0.04, "#dfe8f2", s);
    } else {
        fillRoundRect(ctx, x, y, w, h * 0.36, s * 0.08, "#f4f8fd", s);
    }
    // Ручки
    fillRoundRect(ctx, x + w - s * 0.08, y + h * 0.42, s * 0.04, s * 0.18, s * 0.02, "#9aa3b8", s * 0.5);
    if (open <= 0.05) {
        fillRoundRect(ctx, x + w - s * 0.08, y + h * 0.1, s * 0.04, s * 0.12, s * 0.02, "#9aa3b8", s * 0.5);
    }
    // Магнітики
    fillEllipse(ctx, x + s * 0.1, y + h * 0.78, s * 0.03, s * 0.03, "#ff4a5a");
    fillRoundRect(ctx, x + s * 0.16, y + h * 0.84, s * 0.07, s * 0.05, s * 0.01, "#ffcc33");
    // Обличчя на нижніх дверцятах
    const ey = y + h * 0.5;
    petEye(ctx, x + s * 0.14, ey, s * 0.06, t, eyeMood(o), 46);
    petEye(ctx, x + s * 0.3, ey, s * 0.06, t, eyeMood(o), 46);
    petMouth(ctx, x + s * 0.23, ey + s * 0.12, s * 0.08, s, o.mood);
    // Морозне дихання хмаринками попереду
    if (t) {
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const k = ((t * 0.0012 + i / 3) % 1);
            ctx.globalAlpha = 0.55 * (1 - k);
            fillEllipse(ctx, x + w + s * (0.04 + k * 0.3), ey + s * 0.1 - k * s * 0.08, s * (0.04 + k * 0.06), s * (0.03 + k * 0.04), "#bfe8ff");
        }
        ctx.restore();
    }
}

export const PET_RENDERERS_5 = {
    pet_akuloni: drawAkuloni,
    pet_kavun_bomboni: drawKavunBomboni,
    pet_ballerino: drawBallerino,
    pet_shimpanzini: drawShimpanzini,
    pet_pelmen_mafiozo: drawPelmenMafiozo,
    pet_fridge: drawFridge
};
