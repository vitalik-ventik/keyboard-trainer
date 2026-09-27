// ============================================================
// pet_renderers_9.js — малювальники улюбленців, частина 9: секретні улюбленці світів —
// Голкіпероні М'ячоні, Ніндзя Равліно, Якоріно Крабоні, Кракено Піратоні,
// Мімік Сундуконі, Астронавто Котоні, Дракончик Скарбоні, Кротоні Бурові
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillPoly, fillRoundRect, petEye, petLeg, petLimb, petLine, petMouth, runPhase } from "./pet_parts.js";

// ---------- Голкіпероні М'ячоні: м'яч у воротарських рукавичках (Футбольний стадіон) ----------

function drawGolkiperoni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    // Ноги в бутсах із шипами
    for (let i = 0; i < 2; i++) {
        const phase = ph ? ph + i * Math.PI : 0;
        const swing = phase ? Math.sin(phase) * s * 0.07 : 0;
        const lift = phase ? Math.max(0, Math.cos(phase)) * s * 0.05 : 0;
        const lx = -s * 0.1 + i * s * 0.2;
        petLimb(ctx, lx, s * 0.24, lx + swing, s * 0.42 - lift, s * 0.05, "#f4f7fb", s);
        fillRoundRect(ctx, lx + swing - s * 0.05, s * 0.41 - lift, s * 0.16, s * 0.07, s * 0.03, "#1f2230", s * 0.7);
        ctx.fillStyle = "#c8d0dc";
        ctx.fillRect(lx + swing - s * 0.03, s * 0.48 - lift, s * 0.02, s * 0.02);
        ctx.fillRect(lx + swing + s * 0.05, s * 0.48 - lift, s * 0.02, s * 0.02);
    }
    // М'яч: у радості робить сальто
    const spin = o.mood === "happy" ? (o.happyT || 0) * Math.PI * 2 : 0;
    const cy = -s * 0.02 + b;
    ctx.save();
    ctx.translate(0, cy);
    ctx.rotate(spin);
    fillEllipse(ctx, 0, 0, s * 0.28, s * 0.28, "#f8f8f8", s);
    const pent = function (x, y, r, a) {
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const ang = a + i * Math.PI * 2 / 5;
            pts.push([x + Math.cos(ang) * r, y + Math.sin(ang) * r]);
        }
        fillPoly(ctx, pts, "#1f2230");
    };
    pent(-s * 0.04, -s * 0.18, s * 0.07, -Math.PI / 2);
    pent(-s * 0.22, s * 0.02, s * 0.06, 0.3);
    pent(s * 0.02, s * 0.2, s * 0.06, Math.PI / 2);
    ctx.restore();
    // Сердите обличчя
    const ey = cy - s * 0.02;
    petEye(ctx, s * 0.04, ey, s * 0.06, t, eyeMood(o), 81);
    petEye(ctx, s * 0.18, ey, s * 0.06, t, eyeMood(o), 81);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.04, ey, s * 0.06, s);
        angryBrow(ctx, s * 0.18, ey, s * 0.06, s);
    }
    petMouth(ctx, s * 0.12, cy + s * 0.13, s * 0.07, s, o.mood);
    // Великі рукавиці воротаря
    const reach = o.mood === "happy" ? -s * 0.2 : (t ? Math.sin(t * 0.008) * s * 0.03 : 0);
    const glove = function (x, y) {
        fillRoundRect(ctx, x - s * 0.08, y - s * 0.09, s * 0.16, s * 0.17, s * 0.06, "#7dff8a", s);
        fillRoundRect(ctx, x - s * 0.08, y + s * 0.03, s * 0.16, s * 0.05, s * 0.02, "#1f2230");
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(x - s * 0.05, y - s * 0.06, s * 0.1, s * 0.025);
    };
    petLimb(ctx, -s * 0.24, cy + s * 0.06, -s * 0.36, cy + s * 0.04 + reach, s * 0.05, "#f4f7fb", s);
    petLimb(ctx, s * 0.26, cy + s * 0.06, s * 0.38, cy + s * 0.04 + reach, s * 0.05, "#f4f7fb", s);
    glove(-s * 0.38, cy + reach);
    glove(s * 0.4, cy + reach);
}

// ---------- Ніндзя Равліно: равлик-ніндзя з неоновою мушлею (Нічне неонове місто) ----------

function drawNinjaRavlino(ctx, s, t, o) {
    const b = breathe(t, s);
    const slug = "#6a7a8a";
    const crawl = o.moving && t ? Math.sin(t * 0.012) * s * 0.03 : 0;
    // Тіло-слимачок
    fillRoundRect(ctx, -s * 0.44, s * 0.3, s * 0.84 + crawl, s * 0.18, s * 0.09, slug, s);
    // Шия й голова в масці
    fillRoundRect(ctx, s * 0.2 + crawl, -s * 0.06, s * 0.18, s * 0.46, s * 0.09, slug, s);
    const hx = s * 0.29 + crawl;
    const hy = -s * 0.06;
    fillEllipse(ctx, hx, hy, s * 0.13, s * 0.12, slug, s);
    // Чорна маска з червоними кінцями пов'язки, що майорять
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(hx, hy, s * 0.125, s * 0.115, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#101420";
    ctx.fillRect(hx - s * 0.14, hy - s * 0.06, s * 0.28, s * 0.07);
    ctx.restore();
    const flutter = t ? Math.sin(t * 0.02) * s * 0.04 : 0;
    fillPoly(ctx, [[hx - s * 0.1, hy - s * 0.04], [hx - s * 0.3, hy - s * 0.08 + flutter], [hx - s * 0.28, hy - s * 0.02 + flutter], [hx - s * 0.1, hy - s * 0.01]], "#e0202a", s * 0.5);
    fillPoly(ctx, [[hx - s * 0.1, hy - s * 0.02], [hx - s * 0.26, hy + s * 0.04 - flutter], [hx - s * 0.24, hy + s * 0.08 - flutter], [hx - s * 0.1, hy + s * 0.01]], "#e0202a", s * 0.5);
    petEye(ctx, hx + s * 0.05, hy - s * 0.03, s * 0.035, t, eyeMood(o), 82);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.05, hy - s * 0.01, s * 0.04, s);
    }
    // Мушля з неоновою спіраллю
    const shx = -s * 0.12;
    const shy = s * 0.06 + b;
    const hue = t ? (t * 0.1) % 360 : 300;
    fillEllipse(ctx, shx, shy, s * 0.28, s * 0.26, "#1f2230", s);
    ctx.save();
    ctx.shadowColor = "hsl(" + Math.round(hue) + ", 100%, 60%)";
    ctx.shadowBlur = s * 0.12;
    ctx.strokeStyle = "hsl(" + Math.round(hue) + ", 100%, 65%)";
    ctx.lineWidth = Math.max(1.2, s * 0.035);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
        const a = i * 0.32;
        const r = s * 0.22 * (1 - i / 44);
        const x = shx + Math.cos(a) * r;
        const y = shy + Math.sin(a) * r * 0.92;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.restore();
    // Катана за мушлею
    ctx.save();
    ctx.translate(shx, shy);
    ctx.rotate(-0.7);
    fillRoundRect(ctx, -s * 0.02, -s * 0.5, s * 0.04, s * 0.3, s * 0.01, "#dfe6f0", s * 0.5);
    fillRoundRect(ctx, -s * 0.05, -s * 0.21, s * 0.1, s * 0.03, s * 0.01, "#ffcc33", s * 0.5);
    fillRoundRect(ctx, -s * 0.025, -s * 0.18, s * 0.05, s * 0.1, s * 0.01, "#101420", s * 0.5);
    ctx.restore();
}

// ---------- Якоріно Крабоні: краб із якорем замість клешні (Морський порт) ----------

function drawYakorino(ctx, s, t, o) {
    const b = breathe(t, s);
    const red = "#e8453c";
    const scuttle = o.moving && t ? t * 0.03 : 0;
    // Шість ніжок бігом боком
    for (let i = 0; i < 6; i++) {
        const side = i < 3 ? -1 : 1;
        const j = i % 3;
        const phase = scuttle + i * 1.1;
        const lift = scuttle ? Math.max(0, Math.sin(phase)) * s * 0.05 : 0;
        const bx = side * s * (0.12 + j * 0.05);
        const kx = side * s * (0.3 + j * 0.04);
        const fx = side * s * (0.26 + j * 0.07);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = s * 0.05;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(bx, s * 0.14 + b);
        ctx.lineTo(kx, s * 0.12 + b - lift);
        ctx.lineTo(fx, s * 0.48 - lift);
        ctx.stroke();
        ctx.strokeStyle = red;
        ctx.lineWidth = s * 0.028;
        ctx.stroke();
    }
    // Панцир
    fillEllipse(ctx, 0, s * 0.1 + b, s * 0.3, s * 0.18, red, s);
    fillEllipse(ctx, -s * 0.08, s * 0.04 + b, s * 0.08, s * 0.04, "#ff7a6e");
    // Очі на стебельцях
    for (let i = 0; i < 2; i++) {
        const ex = -s * 0.06 + i * s * 0.16;
        petLimb(ctx, ex, s * 0.0 + b, ex, -s * 0.12 + b, s * 0.03, red, s * 0.6);
        petEye(ctx, ex, -s * 0.15 + b, s * 0.055, t, eyeMood(o), 83);
    }
    petMouth(ctx, s * 0.02, s * 0.14 + b, s * 0.07, s, o.mood);
    // Матроська безкозирка
    fillEllipse(ctx, s * 0.02, -s * 0.24 + b, s * 0.14, s * 0.04, "#f4f7fb", s * 0.7);
    fillRoundRect(ctx, -s * 0.1, -s * 0.3 + b, s * 0.24, s * 0.06, s * 0.02, "#2b4aa0", s * 0.6);
    // Звичайна клешня зліва
    const snap = t ? Math.abs(Math.sin(t * (o.mood === "happy" ? 0.03 : 0.008))) * 0.4 : 0.2;
    petLimb(ctx, -s * 0.26, s * 0.06 + b, -s * 0.36, -s * 0.06 + b, s * 0.05, red, s);
    ctx.save();
    ctx.translate(-s * 0.38, -s * 0.1 + b);
    fillEllipse(ctx, 0, 0, s * 0.08, s * 0.06, red, s * 0.8);
    ctx.rotate(-snap);
    fillPoly(ctx, [[-s * 0.02, -s * 0.03], [-s * 0.06, -s * 0.14], [s * 0.02, -s * 0.05]], red, s * 0.6);
    ctx.restore();
    // Якір замість правої клешні
    petLimb(ctx, s * 0.26, s * 0.06 + b, s * 0.36, -s * 0.02 + b, s * 0.05, red, s);
    const ax = s * 0.38;
    const ay = -s * 0.04 + b;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.06;
    ctx.lineCap = "round";
    const anchor = function () {
        ctx.beginPath();
        ctx.moveTo(ax, ay - s * 0.12);
        ctx.lineTo(ax, ay + s * 0.14);
        ctx.moveTo(ax - s * 0.06, ay - s * 0.06);
        ctx.lineTo(ax + s * 0.06, ay - s * 0.06);
        ctx.moveTo(ax - s * 0.09, ay + s * 0.06);
        ctx.quadraticCurveTo(ax - s * 0.06, ay + s * 0.16, ax, ay + s * 0.14);
        ctx.quadraticCurveTo(ax + s * 0.06, ay + s * 0.16, ax + s * 0.09, ay + s * 0.06);
        ctx.stroke();
    };
    anchor();
    ctx.strokeStyle = "#9aa3b8";
    ctx.lineWidth = s * 0.03;
    anchor();
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.arc(ax, ay - s * 0.15, s * 0.03, 0, Math.PI * 2);
    ctx.stroke();
}

// ---------- Кракено Піратоні: кракен у треуголці з гаком (Піратська бухта) ----------

function drawKrakeno(ctx, s, t, o) {
    const b = breathe(t, s);
    const purple = "#8a4ad8";
    // Щупальця хвилею
    for (let i = 0; i < 5; i++) {
        const x = -s * 0.24 + i * s * 0.12;
        const wave = t ? Math.sin(t * 0.008 + i) * s * 0.05 : 0;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = s * 0.09;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, s * 0.1 + b);
        ctx.quadraticCurveTo(x + wave, s * 0.28 + b, x - wave, s * 0.4 + b);
        ctx.stroke();
        ctx.strokeStyle = purple;
        ctx.lineWidth = s * 0.06;
        ctx.stroke();
    }
    // Щупальце з гаком
    const hookSwing = t ? Math.sin(t * 0.006) * s * 0.04 : 0;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(s * 0.22, s * 0.06 + b);
    ctx.quadraticCurveTo(s * 0.4, s * 0.04 + b, s * 0.38, -s * 0.1 + b + hookSwing);
    ctx.stroke();
    ctx.strokeStyle = purple;
    ctx.lineWidth = s * 0.06;
    ctx.stroke();
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.arc(s * 0.44, -s * 0.18 + b + hookSwing, s * 0.06, Math.PI * 0.9, Math.PI * 2.3);
    ctx.stroke();
    ctx.strokeStyle = "#c8d0dc";
    ctx.lineWidth = s * 0.025;
    ctx.stroke();
    // Голова
    fillEllipse(ctx, 0, -s * 0.06 + b, s * 0.26, s * 0.22, purple, s);
    ctx.fillStyle = "#b07aff";
    fillEllipse(ctx, -s * 0.12, -s * 0.14 + b, s * 0.04, s * 0.03, "#b07aff");
    fillEllipse(ctx, s * 0.14, s * 0.0 + b, s * 0.03, s * 0.025, "#b07aff");
    // Око й пов'язка
    petEye(ctx, s * 0.12, -s * 0.06 + b, s * 0.065, t, eyeMood(o), 84);
    fillEllipse(ctx, -s * 0.04, -s * 0.06 + b, s * 0.06, s * 0.055, "#101420", s * 0.4);
    ctx.strokeStyle = "#101420";
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(-s * 0.24, -s * 0.14 + b);
    ctx.lineTo(s * 0.2, -s * 0.2 + b);
    ctx.stroke();
    petMouth(ctx, s * 0.06, s * 0.06 + b, s * 0.08, s, o.mood);
    // Треуголка з черепом
    const hy = -s * 0.26 + b;
    fillPoly(ctx, [[-s * 0.3, hy + s * 0.04], [-s * 0.16, hy - s * 0.16], [s * 0.0, hy - s * 0.1], [s * 0.18, hy - s * 0.16], [s * 0.3, hy + s * 0.04], [0, hy + s * 0.0]], "#1f2230", s);
    ctx.strokeStyle = "#ffcc33";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, hy + s * 0.03);
    ctx.lineTo(0, hy - s * 0.005);
    ctx.lineTo(s * 0.28, hy + s * 0.03);
    ctx.stroke();
    fillEllipse(ctx, 0, hy - s * 0.07, s * 0.035, s * 0.03, "#f4f7fb");
    ctx.fillStyle = "#1f2230";
    ctx.fillRect(-s * 0.018, hy - s * 0.075, s * 0.012, s * 0.012);
    ctx.fillRect(s * 0.006, hy - s * 0.075, s * 0.012, s * 0.012);
}

// ---------- Мімік Сундуконі: сундук із зубами на ніжках (Скарбниця) ----------

function drawMimik(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const wood = "#a8682a";
    const dark = "#6a3c14";
    petLeg(ctx, -s * 0.2, s * 0.3, s * 0.09, s * 0.2, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.16, s * 0.3, s * 0.09, s * 0.2, ph, dark, s);
    // Корпус
    fillRoundRect(ctx, -s * 0.34, -s * 0.04 + b, s * 0.68, s * 0.36, s * 0.04, wood, s);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.34, s * 0.12 + b, s * 0.68, s * 0.04);
    ctx.fillRect(-s * 0.26, -s * 0.04 + b, s * 0.04, s * 0.36);
    ctx.fillRect(s * 0.22, -s * 0.04 + b, s * 0.04, s * 0.36);
    // Паща: кришка клацає (у радості широко й часто)
    const chomp = t ? Math.abs(Math.sin(t * (o.mood === "happy" ? 0.025 : 0.007))) : 0.4;
    const open = 0.12 + chomp * 0.35;
    // Темне нутро з язиком
    fillRoundRect(ctx, -s * 0.32, -s * 0.12 + b, s * 0.64, s * 0.1, s * 0.03, "#2a0a14");
    fillEllipse(ctx, s * 0.06, -s * 0.06 + b, s * 0.12, s * 0.04, "#ff4a7a");
    // Нижні зуби
    ctx.fillStyle = "#fffbe8";
    for (let i = 0; i < 6; i++) {
        const x = -s * 0.3 + i * s * 0.11;
        ctx.beginPath();
        ctx.moveTo(x, -s * 0.04 + b);
        ctx.lineTo(x + s * 0.045, -s * 0.12 + b);
        ctx.lineTo(x + s * 0.09, -s * 0.04 + b);
        ctx.fill();
    }
    // Кришка з верхніми зубами й очима
    ctx.save();
    ctx.translate(-s * 0.34, -s * 0.06 + b);
    ctx.rotate(-open);
    fillRoundRect(ctx, 0, -s * 0.18, s * 0.68, s * 0.18, s * 0.06, wood, s);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(s * 0.08, -s * 0.18, s * 0.04, s * 0.18);
    ctx.fillRect(s * 0.56, -s * 0.18, s * 0.04, s * 0.18);
    ctx.fillStyle = "#fffbe8";
    for (let i = 0; i < 6; i++) {
        const x = s * 0.04 + i * s * 0.11;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + s * 0.045, s * 0.07);
        ctx.lineTo(x + s * 0.09, 0);
        ctx.fill();
    }
    petEye(ctx, s * 0.38, -s * 0.09, s * 0.05, t, eyeMood(o), 85);
    petEye(ctx, s * 0.52, -s * 0.09, s * 0.05, t, eyeMood(o), 85);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.38, -s * 0.09, s * 0.05, s);
        angryBrow(ctx, s * 0.52, -s * 0.09, s * 0.05, s);
    }
    ctx.restore();
    // Монетки вилітають, коли радіє
    if (o.mood === "happy" && t) {
        const k = o.happyT || 0;
        for (let i = 0; i < 3; i++) {
            fillEllipse(ctx, s * (-0.1 + i * 0.1 + k * (i - 1) * 0.2), -s * (0.2 + k * 0.3 + i * 0.05) + b, s * 0.04, s * 0.04, "#ffcc33", s * 0.4);
        }
    }
}

// ---------- Астронавто Котоні: кіт у скафандрі з ранцем (Орбіта) ----------

function drawAstronavto(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const suit = "#eef2fa";
    // Полум'я ранця
    const flame = t ? 0.7 + Math.sin(t * 0.05) * 0.3 : 0.8;
    fillPoly(ctx, [[-s * 0.3, s * 0.12 + b], [-s * 0.26, s * (0.2 + flame * 0.2) + b], [-s * 0.22, s * 0.12 + b]], "#ff9a1a");
    fillPoly(ctx, [[-s * 0.28, s * 0.12 + b], [-s * 0.26, s * (0.18 + flame * 0.1) + b], [-s * 0.24, s * 0.12 + b]], "#fff2a0");
    // Ранець
    fillRoundRect(ctx, -s * 0.34, -s * 0.12 + b, s * 0.16, s * 0.26, s * 0.04, "#9aa3b8", s);
    // Тіло в скафандрі й лапки, що пливуть у невагомості
    const drift = t ? Math.sin(t * 0.004) * s * 0.03 : 0;
    petLimb(ctx, -s * 0.08, s * 0.2 + b, -s * 0.12 + drift, s * 0.36 + b, s * 0.09, suit, s);
    petLimb(ctx, s * 0.1, s * 0.2 + b, s * 0.14 - drift, s * 0.36 + b, s * 0.09, suit, s);
    fillEllipse(ctx, 0, s * 0.1 + b, s * 0.22, s * 0.18, suit, s);
    fillRoundRect(ctx, -s * 0.07, s * 0.06 + b, s * 0.14, s * 0.08, s * 0.02, "#39c6ff", s * 0.5);
    ctx.fillStyle = "#ff4a5a";
    ctx.fillRect(-s * 0.05, s * 0.08 + b, s * 0.03, s * 0.03);
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(s * 0.01, s * 0.08 + b, s * 0.03, s * 0.03);
    // Махає лапкою
    const wave = t ? Math.sin(t * 0.01) * s * 0.06 : 0;
    petLimb(ctx, s * 0.18, s * 0.04 + b, s * 0.32, -s * 0.06 + b + wave, s * 0.08, suit, s);
    // Голова кота в скляному шоломі
    const hx = s * 0.02;
    const hy = -s * 0.2 + b;
    const cat = "#ff9a3a";
    fillPoly(ctx, [[hx - s * 0.13, hy - s * 0.02], [hx - s * 0.1, hy - s * 0.18], [hx - s * 0.02, hy - s * 0.08]], cat, s * 0.6);
    fillPoly(ctx, [[hx + s * 0.02, hy - s * 0.08], [hx + s * 0.1, hy - s * 0.18], [hx + s * 0.13, hy - s * 0.02]], cat, s * 0.6);
    fillEllipse(ctx, hx, hy, s * 0.15, s * 0.13, cat, s);
    petEye(ctx, hx - s * 0.04, hy - s * 0.01, s * 0.045, t, eyeMood(o), 86);
    petEye(ctx, hx + s * 0.08, hy - s * 0.01, s * 0.045, t, eyeMood(o), 86);
    fillEllipse(ctx, hx + s * 0.02, hy + s * 0.05, s * 0.02, s * 0.015, "#ff7aa8");
    petMouth(ctx, hx + s * 0.02, hy + s * 0.09, s * 0.04, s, o.mood);
    // Скло шолома з відблиском
    ctx.save();
    ctx.globalAlpha = 0.28;
    fillEllipse(ctx, hx, hy - s * 0.02, s * 0.22, s * 0.21, "#bfe8ff");
    ctx.restore();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.ellipse(hx, hy - s * 0.02, s * 0.22, s * 0.21, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = Math.max(1, s * 0.025);
    ctx.beginPath();
    ctx.arc(hx, hy - s * 0.02, s * 0.17, Math.PI * 1.1, Math.PI * 1.4);
    ctx.stroke();
}

// ---------- Дракончик Скарбоні: дракончик із купою монет на спині (Лігво дракона) ----------

function drawDrakonSkarboni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const red = "#d8302a";
    const dark = "#9a1a14";
    petLeg(ctx, -s * 0.22, s * 0.24, s * 0.1, s * 0.26, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.12, s * 0.24, s * 0.1, s * 0.26, ph, dark, s);
    // Хвіст зі стрілкою
    fillPoly(ctx, [[-s * 0.24, s * 0.08 + b], [-s * 0.46, s * 0.0 + b], [-s * 0.22, s * 0.18 + b]], red, s);
    fillPoly(ctx, [[-s * 0.46, s * 0.0 + b], [-s * 0.54, -s * 0.06 + b], [-s * 0.52, s * 0.06 + b]], dark, s * 0.6);
    fillEllipse(ctx, -s * 0.04, s * 0.1 + b, s * 0.28, s * 0.17, red, s);
    fillEllipse(ctx, s * 0.02, s * 0.16 + b, s * 0.16, s * 0.08, "#ffb080");
    petLeg(ctx, -s * 0.14, s * 0.26, s * 0.1, s * 0.24, ph, red, s);
    petLeg(ctx, s * 0.2, s * 0.26, s * 0.1, s * 0.24, ph + Math.PI, red, s);
    // Купа монет на спині з блиском
    const coins = [[-s * 0.2, -s * 0.06], [-s * 0.08, -s * 0.08], [s * 0.04, -s * 0.06], [-s * 0.14, -s * 0.16], [-s * 0.02, -s * 0.17], [-s * 0.08, -s * 0.25]];
    for (let i = 0; i < coins.length; i++) {
        fillEllipse(ctx, coins[i][0], coins[i][1] + b, s * 0.07, s * 0.05, i % 2 === 0 ? "#ffcc33" : "#f2b705", s * 0.5);
    }
    fillPoly(ctx, [[-s * 0.1, -s * 0.34 + b], [-s * 0.13, -s * 0.28 + b], [-s * 0.03, -s * 0.28 + b], [-s * 0.06, -s * 0.34 + b]], "#39f6ff", s * 0.4);
    if (t) {
        const k = (t * 0.002) % 1;
        const i = Math.floor(t * 0.002) % coins.length;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = "#ffffff";
        const sx = coins[i][0];
        const sy = coins[i][1] + b - s * 0.02;
        ctx.fillRect(sx - s * 0.04 * k, sy - s * 0.005, s * 0.08 * k, s * 0.01);
        ctx.fillRect(sx - s * 0.005, sy - s * 0.04 * k, s * 0.01, s * 0.08 * k);
        ctx.restore();
    }
    // Голова з ріжками
    const hx = s * 0.28;
    const hy = -s * 0.1 + b;
    fillPoly(ctx, [[hx - s * 0.1, hy - s * 0.08], [hx - s * 0.16, hy - s * 0.22], [hx - s * 0.03, hy - s * 0.11]], "#ffe08a", s * 0.6);
    fillEllipse(ctx, hx, hy, s * 0.15, s * 0.13, red, s);
    fillEllipse(ctx, hx + s * 0.13, hy + s * 0.04, s * 0.08, s * 0.06, "#ff6a5a", s * 0.8);
    fillEllipse(ctx, hx + s * 0.18, hy + s * 0.02, s * 0.012, s * 0.012, PET_OUTLINE);
    petEye(ctx, hx + s * 0.02, hy - s * 0.03, s * 0.055, t, eyeMood(o), 87);
    // Хитра усмішка власника скарбу
    petMouth(ctx, hx + s * 0.1, hy + s * 0.09, s * 0.05, s, o.mood);
    if ((o.mood === "happy" || o.mood === "combo") && t) {
        const k = (t % 500) / 500;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        fillEllipse(ctx, hx + s * (0.26 + k * 0.14), hy + s * 0.04, s * (0.04 + k * 0.04), s * (0.03 + k * 0.03), "#ff9a1a");
        ctx.restore();
    }
}

// ---------- Кротоні Бурові: кріт із дрилем замість носа (Рудна печера) ----------

function drawKrotoni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#4a4a5a";
    petLeg(ctx, -s * 0.18, s * 0.26, s * 0.1, s * 0.24, ph + Math.PI, "#34343f", s);
    petLeg(ctx, s * 0.1, s * 0.26, s * 0.1, s * 0.24, ph, "#34343f", s);
    fillEllipse(ctx, -s * 0.04, s * 0.08 + b, s * 0.3, s * 0.22, fur, s);
    fillEllipse(ctx, s * 0.02, s * 0.14 + b, s * 0.16, s * 0.1, "#6a6a7a");
    // Великі рожеві лапи-лопатки
    const dig = t ? Math.sin(t * (o.mood === "happy" ? 0.03 : 0.012)) * s * 0.04 : 0;
    fillEllipse(ctx, s * 0.22, s * 0.2 + b + dig, s * 0.08, s * 0.06, "#ff9ab8", s * 0.8);
    fillEllipse(ctx, -s * 0.26, s * 0.2 + b - dig, s * 0.08, s * 0.06, "#ff9ab8", s * 0.8);
    // Голова
    const hx = s * 0.18;
    const hy = -s * 0.1 + b;
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.14, fur, s);
    // Дриль замість носа: гвинтова нарізка біжить
    ctx.save();
    ctx.translate(hx + s * 0.14, hy + s * 0.02);
    fillPoly(ctx, [[0, -s * 0.07], [s * 0.26, 0], [0, s * 0.07]], "#ff9a1a", s * 0.8);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.07);
    ctx.lineTo(s * 0.26, 0);
    ctx.lineTo(0, s * 0.07);
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = "#b8600a";
    ctx.lineWidth = Math.max(1, s * 0.02);
    const shift = t ? (t * 0.08) % (s * 0.06) : 0;
    ctx.beginPath();
    for (let x = -s * 0.06 + shift; x < s * 0.3; x += s * 0.06) {
        ctx.moveTo(x, -s * 0.08);
        ctx.lineTo(x + s * 0.04, s * 0.08);
    }
    ctx.stroke();
    ctx.restore();
    fillRoundRect(ctx, hx + s * 0.08, hy - s * 0.04, s * 0.07, s * 0.12, s * 0.02, "#9aa3b8", s * 0.6);
    // Окуляри-«крапочки» кротa (у радості — усмішка)
    fillEllipse(ctx, hx + s * 0.02, hy - s * 0.04, s * 0.025, s * 0.02, PET_OUTLINE);
    fillEllipse(ctx, hx + s * 0.08, hy - s * 0.05, s * 0.022, s * 0.018, PET_OUTLINE);
    petMouth(ctx, hx + s * 0.04, hy + s * 0.08, s * 0.05, s, o.mood);
    if (o.mood === "sad") {
        fillEllipse(ctx, hx + s * 0.02, hy + s * 0.02, s * 0.015, s * 0.025, "#6ecbff");
    }
    // Каска шахтаря з ліхтариком
    fillEllipse(ctx, hx - s * 0.02, hy - s * 0.1, s * 0.17, s * 0.1, "#ffcc33", s);
    fillRoundRect(ctx, hx - s * 0.2, hy - s * 0.08, s * 0.36, s * 0.04, s * 0.02, "#f2b705", s * 0.6);
    fillEllipse(ctx, hx + s * 0.08, hy - s * 0.15, s * 0.035, s * 0.035, "#fffbe0", s * 0.5);
    // Камінці летять з-під дриля
    if (o.moving && t) {
        ctx.fillStyle = "#8a7a6a";
        for (let i = 0; i < 3; i++) {
            const k = ((t * 0.003 + i / 3) % 1);
            ctx.fillRect(hx + s * (0.36 + k * 0.1), hy + s * (0.02 - k * 0.1 + i * 0.05), s * 0.03, s * 0.03);
        }
    }
}

export const PET_RENDERERS_9 = {
    pet_golkiperoni: drawGolkiperoni,
    pet_ninja_ravlino: drawNinjaRavlino,
    pet_yakorino: drawYakorino,
    pet_krakeno: drawKrakeno,
    pet_mimik: drawMimik,
    pet_astronavto: drawAstronavto,
    pet_drakon_skarboni: drawDrakonSkarboni,
    pet_krotoni: drawKrotoni
};
