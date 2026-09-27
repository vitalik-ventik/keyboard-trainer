// ============================================================
// pet_renderers_7.js — малювальники улюбленців, частина 7: секретні улюбленці світів —
// Кубо Кріперіно, Фламінго Рожевіно, Раптор Ракетоні, Мотоцикліно Ящероні,
// Ідол Кам'яно, Глітчо Лисоні, Громоні Хмароні, Кристалозавр
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillPoly, fillRoundRect, fluffCluster, petEye, petLeg, petLimb, petLine, petMouth, runPhase } from "./pet_parts.js";

// ---------- Кубо Кріперіно: зелений куб-підривник (Кубічне селище) ----------

function drawKuboKriperino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    // Ніжки-блоки
    for (let i = 0; i < 2; i++) {
        petLeg(ctx, -s * 0.18 + i * s * 0.36, s * 0.22, s * 0.14, s * 0.28, ph + i * Math.PI, "#3f8f2f", s);
    }
    // У радості «шипить»: блимає білим і роздувається
    const hiss = o.mood === "happy" ? Math.abs(Math.sin((o.happyT || 0) * Math.PI * 4)) : 0;
    const k = 1 + hiss * 0.08;
    const w = s * 0.56 * k;
    const h = s * 0.6 * k;
    const x = -w / 2;
    const y = s * 0.24 - h + b;
    fillRoundRect(ctx, x, y, w, h, s * 0.04, "#5cc94a", s);
    // Піксельна текстура
    const shades = ["#4fb03f", "#74d862", "#3f8f2f", "#66cf55"];
    const cell = w / 6;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const pick = (r * 7 + c * 3) % 5;
            if (pick < shades.length) {
                ctx.fillStyle = shades[pick];
                ctx.fillRect(x + c * cell + 1, y + r * (h / 6) + 1, cell - 1, h / 6 - 1);
            }
        }
    }
    // Обличчя кріпера — чорні квадрати
    const fx = x + w * 0.5;
    const fy = y + h * 0.28;
    ctx.fillStyle = o.mood === "sad" ? "#2a3a2a" : "#101410";
    if (o.mood === "happy") {
        ctx.fillRect(fx - cell * 2, fy + cell * 0.4, cell * 1.2, cell * 0.4);
        ctx.fillRect(fx + cell * 0.8, fy + cell * 0.4, cell * 1.2, cell * 0.4);
    } else {
        ctx.fillRect(fx - cell * 2, fy, cell * 1.2, cell * 1.2);
        ctx.fillRect(fx + cell * 0.8, fy, cell * 1.2, cell * 1.2);
    }
    ctx.fillRect(fx - cell * 0.6, fy + cell * 1.2, cell * 1.2, cell * 1.4);
    ctx.fillRect(fx - cell * 1.2, fy + cell * 1.8, cell * 0.6, cell * 1.4);
    ctx.fillRect(fx + cell * 0.6, fy + cell * 1.8, cell * 0.6, cell * 1.4);
    if (hiss > 0) {
        ctx.save();
        ctx.globalAlpha = hiss * 0.6;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }
}

// ---------- Фламінго Рожевіно: фламінго в окулярах на одній нозі (Місто на заході сонця) ----------

function drawFlamingo(ctx, s, t, o) {
    const b = breathe(t, s);
    const pink = "#ff7ab8";
    // Скаче на одній нозі
    const hop = o.moving && t ? Math.abs(Math.sin(t * 0.016)) * s * 0.08 : 0;
    const y0 = b - hop;
    petLimb(ctx, s * 0.0, s * 0.08 + y0, s * 0.02, s * 0.46, s * 0.035, "#ff5a9e", s);
    petLimb(ctx, s * 0.02, s * 0.46, s * 0.1, s * 0.48, s * 0.03, "#ff5a9e", s);
    // Друга нога підібрана «четвіркою»
    petLimb(ctx, -s * 0.02, s * 0.1 + y0, -s * 0.12, s * 0.2 + y0, s * 0.03, "#ff5a9e", s);
    petLimb(ctx, -s * 0.12, s * 0.2 + y0, s * 0.0, s * 0.24 + y0, s * 0.03, "#ff5a9e", s);
    // Тіло й крило
    fillEllipse(ctx, -s * 0.06, s * 0.0 + y0, s * 0.24, s * 0.14, pink, s);
    fillPoly(ctx, [[-s * 0.28, -s * 0.02 + y0], [-s * 0.42, s * 0.04 + y0], [-s * 0.26, s * 0.06 + y0]], pink, s);
    const flap = o.mood === "happy" && t ? Math.sin(t * 0.05) * 0.5 : 0;
    fillEllipse(ctx, -s * 0.1, -s * 0.02 + y0, s * 0.14, s * 0.08, "#ff9ccc", s * 0.8, -0.2 - flap);
    // Шия-«S»
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.02 + y0);
    ctx.bezierCurveTo(s * 0.3, -s * 0.12 + y0, s * 0.0, -s * 0.22 + y0, s * 0.12, -s * 0.36 + y0);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.09;
    ctx.stroke();
    ctx.strokeStyle = pink;
    ctx.lineWidth = s * 0.09 - petLine(s) * 1.6;
    ctx.stroke();
    // Голова, дзьоб із чорним кінчиком
    const hx = s * 0.14;
    const hy = -s * 0.4 + y0;
    ctx.beginPath();
    ctx.moveTo(hx + s * 0.06, hy - s * 0.02);
    ctx.quadraticCurveTo(hx + s * 0.22, hy - s * 0.02, hx + s * 0.22, hy + s * 0.12);
    ctx.lineTo(hx + s * 0.16, hy + s * 0.06);
    ctx.quadraticCurveTo(hx + s * 0.12, hy + s * 0.04, hx + s * 0.06, hy + s * 0.05);
    ctx.closePath();
    ctx.fillStyle = "#fff0f6";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillPoly(ctx, [[hx + s * 0.2, hy + s * 0.05], [hx + s * 0.22, hy + s * 0.12], [hx + s * 0.16, hy + s * 0.07]], PET_OUTLINE);
    fillEllipse(ctx, hx, hy, s * 0.09, s * 0.08, pink, s);
    // Окуляри-авіатори (у смутку й радості — видно очі)
    if (coolMood(o)) {
        fillEllipse(ctx, hx + s * 0.03, hy - s * 0.005, s * 0.05, s * 0.04, "#2a1030", s * 0.5);
        ctx.fillStyle = "rgba(255, 180, 90, 0.55)";
        ctx.fillRect(hx + s * 0.01, hy - s * 0.025, s * 0.03, s * 0.012);
        ctx.strokeStyle = "#ffcc33";
        ctx.lineWidth = Math.max(1, s * 0.012);
        ctx.beginPath();
        ctx.moveTo(hx - s * 0.02, hy - s * 0.01);
        ctx.lineTo(hx - s * 0.08, hy - s * 0.01);
        ctx.stroke();
    } else {
        petEye(ctx, hx + s * 0.03, hy - s * 0.005, s * 0.04, t, eyeMood(o), 61);
    }
}

// ---------- Раптор Ракетоні: велоцираптор із ракетою (Космодром) ----------

function drawRaptor(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const skin = "#e8912a";
    const dark = "#b86a14";
    // Хвіст
    fillPoly(ctx, [[-s * 0.16, -s * 0.04 + b], [-s * 0.5, s * 0.02 + b + (t ? Math.sin(t * 0.01) * s * 0.03 : 0)], [-s * 0.14, s * 0.1 + b]], skin, s);
    // Ноги-«пружини» з кігтем
    for (let i = 0; i < 2; i++) {
        const phase = ph ? ph + i * Math.PI : 0;
        const swing = phase ? Math.sin(phase) * s * 0.1 : (i === 0 ? -s * 0.04 : s * 0.04);
        const lift = phase ? Math.max(0, Math.cos(phase)) * s * 0.06 : 0;
        const kx = -s * 0.02 + swing * 0.3;
        petLimb(ctx, -s * 0.04, s * 0.08 + b, kx - s * 0.08, s * 0.28, s * 0.07, i === 0 ? dark : skin, s);
        petLimb(ctx, kx - s * 0.08, s * 0.28, kx + swing, s * 0.46 - lift, s * 0.05, i === 0 ? dark : skin, s);
        fillPoly(ctx, [[kx + swing, s * 0.44 - lift], [kx + swing + s * 0.1, s * 0.48 - lift], [kx + swing, s * 0.5 - lift]], "#f4f0e0", s * 0.5);
    }
    // Тулуб нахилений уперед
    fillEllipse(ctx, 0, b, s * 0.22, s * 0.14, skin, s, -0.3);
    ctx.fillStyle = dark;
    for (let i = 0; i < 3; i++) {
        fillEllipse(ctx, -s * 0.1 + i * s * 0.08, -s * 0.06 + b + i * s * 0.02, s * 0.025, s * 0.05, dark, 0, -0.3);
    }
    // Полум'я ракети
    const flame = t ? 0.7 + Math.sin(t * 0.05) * 0.3 : 0.8;
    fillPoly(ctx, [[-s * 0.3, -s * 0.3 + b], [-s * (0.3 + flame * 0.2), -s * 0.24 + b], [-s * 0.3, -s * 0.18 + b]], "#ff9a1a");
    fillPoly(ctx, [[-s * 0.3, -s * 0.27 + b], [-s * (0.3 + flame * 0.1), -s * 0.24 + b], [-s * 0.3, -s * 0.21 + b]], "#fff2a0");
    // Ракета на спині
    fillRoundRect(ctx, -s * 0.3, -s * 0.3 + b, s * 0.22, s * 0.12, s * 0.06, "#f4f7fb", s);
    fillRoundRect(ctx, -s * 0.2, -s * 0.3 + b, s * 0.04, s * 0.12, 0, "#e0202a");
    fillPoly(ctx, [[-s * 0.08, -s * 0.3 + b], [-s * 0.01, -s * 0.24 + b], [-s * 0.08, -s * 0.18 + b]], "#e0202a", s * 0.8);
    petLimb(ctx, -s * 0.16, -s * 0.18 + b, -s * 0.12, -s * 0.08 + b, s * 0.025, "#5a6478", s * 0.5);
    // Голова з зубами
    const hx = s * 0.26;
    const hy = -s * 0.22 + b;
    petLimb(ctx, s * 0.12, -s * 0.06 + b, hx - s * 0.04, hy + s * 0.04, s * 0.1, skin, s);
    fillRoundRect(ctx, hx - s * 0.12, hy - s * 0.08, s * 0.32, s * 0.14, s * 0.06, skin, s);
    fillRoundRect(ctx, hx - s * 0.06, hy + s * 0.04, s * 0.24, s * 0.06, s * 0.03, dark, s * 0.8);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i++) {
        const tx = hx + s * (0.0 + i * 0.045);
        ctx.beginPath();
        ctx.moveTo(tx, hy + s * 0.05);
        ctx.lineTo(tx + s * 0.018, hy + s * 0.085);
        ctx.lineTo(tx + s * 0.036, hy + s * 0.05);
        ctx.fill();
    }
    petEye(ctx, hx + s * 0.0, hy - s * 0.02, s * 0.05, t, eyeMood(o), 62);
    if (coolMood(o)) {
        angryBrow(ctx, hx, hy - s * 0.02, s * 0.05, s);
    }
    // Коротенькі лапки
    petLimb(ctx, s * 0.14, s * 0.02 + b, s * 0.22, s * 0.08 + b, s * 0.04, dark, s);
}

// ---------- Мотоцикліно Ящероні: ящірка-байкер на колесах (Неонова траса) ----------

function drawMotocyclino(ctx, s, t, o) {
    const b = breathe(t, s);
    const lizard = "#48c774";
    const roll = o.moving && t ? t * 0.03 : 0;
    // Неонові смуги швидкості
    if (o.moving && t) {
        ctx.save();
        ctx.strokeStyle = "#ff2ea6";
        ctx.lineWidth = Math.max(1, s * 0.02);
        for (let i = 0; i < 3; i++) {
            const k = ((t * 0.003 + i / 3) % 1);
            ctx.globalAlpha = 1 - k;
            ctx.beginPath();
            ctx.moveTo(-s * (0.4 + k * 0.2), s * (0.1 + i * 0.1));
            ctx.lineTo(-s * (0.55 + k * 0.2), s * (0.1 + i * 0.1));
            ctx.stroke();
        }
        ctx.restore();
    }
    // Колеса замість ніг
    const wheel = function (x) {
        const y = s * 0.38;
        const r = s * 0.12;
        fillEllipse(ctx, x, y, r, r, "#22252e", s);
        fillEllipse(ctx, x, y, r * 0.55, r * 0.55, "#9aa3b8", s * 0.5);
        ctx.strokeStyle = "#39f6ff";
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.arc(x, y, r * 0.8, roll, roll + Math.PI * 0.6);
        ctx.stroke();
    };
    wheel(-s * 0.24);
    wheel(s * 0.24);
    // Хвіст
    ctx.save();
    ctx.translate(-s * 0.3, s * 0.12 + b);
    ctx.rotate(t ? Math.sin(t * 0.012) * 0.2 : 0);
    fillPoly(ctx, [[0, -s * 0.05], [-s * 0.22, s * 0.02], [0, s * 0.05]], lizard, s);
    ctx.restore();
    // Тіло в шкіряній жилетці з вогнем
    fillEllipse(ctx, 0, s * 0.14 + b, s * 0.32, s * 0.12, lizard, s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, s * 0.14 + b, s * 0.31, s * 0.11, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#1f2230";
    ctx.fillRect(-s * 0.2, s * 0.0 + b, s * 0.3, s * 0.3);
    fillPoly(ctx, [[-s * 0.16, s * 0.2 + b], [-s * 0.1, s * 0.08 + b], [-s * 0.06, s * 0.16 + b], [-s * 0.02, s * 0.06 + b], [s * 0.04, s * 0.2 + b]], "#ff6a1a");
    ctx.restore();
    // Голова з банданою
    const hx = s * 0.28;
    const hy = -s * 0.04 + b;
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.11, lizard, s);
    fillEllipse(ctx, hx + s * 0.12, hy + s * 0.03, s * 0.08, s * 0.05, lizard, s * 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(hx, hy, s * 0.155, s * 0.105, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ff2ea6";
    ctx.fillRect(hx - s * 0.2, hy - s * 0.14, s * 0.4, s * 0.07);
    ctx.restore();
    fillPoly(ctx, [[hx - s * 0.14, hy - s * 0.06], [hx - s * 0.26, hy - s * 0.1], [hx - s * 0.22, hy - s * 0.02]], "#ff2ea6", s * 0.6);
    petEye(ctx, hx + s * 0.04, hy - s * 0.01, s * 0.05, t, eyeMood(o), 63);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.04, hy - s * 0.01, s * 0.05, s);
    }
    petMouth(ctx, hx + s * 0.12, hy + s * 0.07, s * 0.05, s, o.mood);
    // Язик-«блимавка», коли радіє
    if (o.mood === "happy" && t && Math.floor(t / 150) % 2 === 0) {
        petLimb(ctx, hx + s * 0.18, hy + s * 0.05, hx + s * 0.3, hy + s * 0.07, s * 0.015, "#ff4a7a", s * 0.3);
    }
}

// ---------- Ідол Кам'яно: кам'яна голова на павучих ніжках (Джунглі з храмом) ----------

function drawIdol(ctx, s, t, o) {
    const b = breathe(t, s);
    const ph = o.moving && t ? t * 0.03 : 0;
    // Шість ніжок-павучків, по три з кожного боку, у різних фазах
    for (let i = 0; i < 6; i++) {
        const side = i < 3 ? -1 : 1;
        const j = i % 3;
        const phase = ph + i * 1.3;
        const lift = ph ? Math.max(0, Math.sin(phase)) * s * 0.06 : 0;
        const bx = side * s * (0.08 + j * 0.06);
        const kx = side * s * (0.24 + j * 0.06);
        const fx = side * s * (0.2 + j * 0.1) + (ph ? Math.cos(phase) * s * 0.03 : 0);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = s * 0.04;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(bx, s * 0.22 + b);
        ctx.lineTo(kx, s * 0.14 + b - lift);
        ctx.lineTo(fx, s * 0.49 - lift);
        ctx.stroke();
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = s * 0.02;
        ctx.stroke();
    }
    // Кам'яна голова-моаї
    const stone = "#8a9486";
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.26 + b);
    ctx.lineTo(-s * 0.24, -s * 0.34 + b);
    ctx.quadraticCurveTo(0, -s * 0.5 + b, s * 0.24, -s * 0.34 + b);
    ctx.lineTo(s * 0.22, s * 0.26 + b);
    ctx.closePath();
    ctx.fillStyle = stone;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Мох і тріщини
    fillEllipse(ctx, -s * 0.14, -s * 0.36 + b, s * 0.1, s * 0.04, "#4f9a3a");
    fillEllipse(ctx, s * 0.08, -s * 0.4 + b, s * 0.08, s * 0.035, "#6fbf4a");
    ctx.strokeStyle = "#5a645a";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, s * 0.1 + b);
    ctx.lineTo(-s * 0.12, s * 0.16 + b);
    ctx.lineTo(-s * 0.14, s * 0.22 + b);
    ctx.stroke();
    // Важкі брови, світні очі, довгий ніс і стиснуті губи
    fillRoundRect(ctx, -s * 0.2, -s * 0.2 + b, s * 0.4, s * 0.06, s * 0.02, "#6a7466", s * 0.7);
    const glow = o.mood === "sad" ? "#7a8aa0" : "#ffe14d";
    const pulse = t ? 0.6 + Math.abs(Math.sin(t * 0.004)) * 0.4 : 1;
    ctx.save();
    ctx.globalAlpha = o.mood === "sad" ? 1 : pulse;
    if (o.mood === "happy") {
        ctx.strokeStyle = glow;
        ctx.lineWidth = Math.max(1.2, s * 0.03);
        ctx.beginPath();
        ctx.arc(-s * 0.09, -s * 0.1 + b, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(s * 0.13, -s * 0.1 + b);
        ctx.arc(s * 0.09, -s * 0.1 + b, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else {
        fillRoundRect(ctx, -s * 0.14, -s * 0.13 + b, s * 0.1, s * 0.05, s * 0.02, glow);
        fillRoundRect(ctx, s * 0.04, -s * 0.13 + b, s * 0.1, s * 0.05, s * 0.02, glow);
    }
    ctx.restore();
    fillRoundRect(ctx, -s * 0.04, -s * 0.12 + b, s * 0.08, s * 0.2, s * 0.03, "#7a8476", s * 0.7);
    fillRoundRect(ctx, -s * 0.1, s * 0.13 + b, s * 0.2, s * 0.04, s * 0.02, "#5a645a", s * 0.6);
}

// ---------- Глітчо Лисоні: піксельна лисиця з глітчем (Цифровий ліс) ----------

function drawGlitchoBody(ctx, s, t, o, ph, b) {
    const fox = "#ff8a2a";
    petLeg(ctx, -s * 0.18, s * 0.24, s * 0.08, s * 0.26, ph + Math.PI, "#c85a14", s);
    petLeg(ctx, s * 0.12, s * 0.24, s * 0.08, s * 0.26, ph, "#c85a14", s);
    // Пухнастий хвіст із білим кінчиком
    ctx.save();
    ctx.translate(-s * 0.26, s * 0.08 + b);
    ctx.rotate(-0.5 + (t ? Math.sin(t * 0.01) * 0.2 : 0));
    fillEllipse(ctx, -s * 0.14, 0, s * 0.17, s * 0.08, fox, s);
    fillEllipse(ctx, -s * 0.27, 0, s * 0.05, s * 0.05, "#ffffff");
    ctx.restore();
    fillEllipse(ctx, -s * 0.04, s * 0.1 + b, s * 0.26, s * 0.16, fox, s);
    fillEllipse(ctx, s * 0.04, s * 0.16 + b, s * 0.14, s * 0.08, "#fff3e6");
    petLeg(ctx, -s * 0.1, s * 0.26, s * 0.08, s * 0.24, ph, fox, s);
    petLeg(ctx, s * 0.18, s * 0.26, s * 0.08, s * 0.24, ph + Math.PI, fox, s);
    // Голова з гострими вухами й мордочкою
    const hx = s * 0.22;
    const hy = -s * 0.12 + b;
    fillPoly(ctx, [[hx - s * 0.14, hy - s * 0.06], [hx - s * 0.1, hy - s * 0.3], [hx - s * 0.02, hy - s * 0.1]], fox, s);
    fillPoly(ctx, [[hx + s * 0.0, hy - s * 0.1], [hx + s * 0.06, hy - s * 0.32], [hx + s * 0.12, hy - s * 0.06]], fox, s);
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.14, fox, s);
    fillPoly(ctx, [[hx + s * 0.04, hy + s * 0.0], [hx + s * 0.28, hy + s * 0.06], [hx + s * 0.04, hy + s * 0.12]], "#fff3e6", s * 0.8);
    fillEllipse(ctx, hx + s * 0.27, hy + s * 0.06, s * 0.025, s * 0.02, PET_OUTLINE);
    petEye(ctx, hx + s * 0.02, hy - s * 0.03, s * 0.05, t, eyeMood(o), 64);
}

function drawGlitcho(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    // Раз на ~2 с «телепорт»: улюбленець зсувається на крок, лишаючи кольорові копії
    const cycle = t ? t % 2200 : 1000;
    const jump = cycle < 160;
    const shift = jump ? s * 0.12 : 0;
    if (jump || o.mood === "combo") {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.globalCompositeOperation = "lighter";
        ctx.translate(-s * 0.05 - shift, 0);
        drawGlitchoBody(ctx, s, t, o, ph, b);
        ctx.restore();
    }
    ctx.save();
    ctx.translate(shift, 0);
    drawGlitchoBody(ctx, s, t, o, ph, b);
    ctx.restore();
    // Глітч-смужки: зсунуті шматки кольору поверх
    if (t) {
        const seed = Math.floor(t / 120);
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const r = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
            const f = r - Math.floor(r);
            if (f < 0.55) {
                continue;
            }
            const y = -s * 0.3 + f * s * 0.6;
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = i % 2 === 0 ? "#39f6ff" : "#ff2ea6";
            ctx.fillRect(-s * 0.3 + f * s * 0.2 + shift, y, s * (0.15 + f * 0.2), s * 0.03);
        }
        ctx.restore();
    }
}

// ---------- Громоні Хмароні: сердита грозова хмара з блискавками (Грозове небо) ----------

function drawGromoni(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    // Блискавки-ноги мерехтять
    const flash = t ? Math.floor(t / 90) % 4 : 0;
    for (let i = 0; i < 3; i++) {
        if (flash === i) {
            continue;
        }
        const x = -s * 0.18 + i * s * 0.18;
        fillPoly(ctx, [[x, s * 0.1 + b], [x - s * 0.06, s * 0.28 + b], [x, s * 0.26 + b], [x - s * 0.04, s * 0.44 + b], [x + s * 0.08, s * 0.22 + b], [x + s * 0.02, s * 0.24 + b], [x + s * 0.06, s * 0.1 + b]], "#ffe14d", s * 0.7);
    }
    // Крапельки дощу
    if (t) {
        ctx.fillStyle = "#8fd8ff";
        for (let i = 0; i < 4; i++) {
            const k = ((t * 0.002 + i * 0.27) % 1);
            ctx.fillRect(-s * 0.26 + i * s * 0.16, s * 0.12 + k * s * 0.36 + b, Math.max(1, s * 0.015), s * 0.05);
        }
    }
    const grey = o.mood === "happy" ? "#8a96b8" : "#5a6480";
    fluffCluster(ctx, [
        [-s * 0.24, -s * 0.02 + b, s * 0.16],
        [-s * 0.06, -s * 0.14 + b, s * 0.2],
        [s * 0.16, -s * 0.08 + b, s * 0.18],
        [s * 0.3, s * 0.02 + b, s * 0.12],
        [s * 0.02, s * 0.04 + b, s * 0.18]
    ], grey, s);
    fillEllipse(ctx, -s * 0.08, -s * 0.2 + b, s * 0.1, s * 0.05, "#7a86a8");
    // Сердите обличчя
    const ey = -s * 0.06 + b;
    petEye(ctx, s * 0.04, ey, s * 0.06, t, eyeMood(o), 65);
    petEye(ctx, s * 0.2, ey, s * 0.06, t, eyeMood(o), 65);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.04, ey, s * 0.06, s);
        angryBrow(ctx, s * 0.2, ey, s * 0.06, s);
    }
    petMouth(ctx, s * 0.12, s * 0.08 + b, s * 0.08, s, o.mood === "happy" ? "happy" : "sad");
}

// ---------- Кристалозавр: ящір із кристалами на спині (Кришталева печера) ----------

function drawKristalozavr(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const body = "#6a4aa8";
    const dark = "#4a3080";
    petLeg(ctx, -s * 0.24, s * 0.24, s * 0.1, s * 0.26, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.12, s * 0.24, s * 0.1, s * 0.26, ph, dark, s);
    // Хвіст
    fillPoly(ctx, [[-s * 0.24, s * 0.0 + b], [-s * 0.52, s * 0.16 + b], [-s * 0.22, s * 0.2 + b]], body, s);
    // Кристали на спині світяться по черзі
    const colors = ["#39f6ff", "#ff7ad8", "#9cffe8", "#b58cff"];
    for (let i = 0; i < 4; i++) {
        const cx = -s * 0.24 + i * s * 0.13;
        const h = s * (0.18 + (i % 2) * 0.08);
        const glow = t ? 0.5 + Math.abs(Math.sin(t * 0.004 + i)) * 0.5 : 0.8;
        ctx.save();
        ctx.globalAlpha = 0.35 * glow;
        fillEllipse(ctx, cx, -s * 0.06 - h * 0.5 + b, s * 0.08, h * 0.6, colors[i]);
        ctx.restore();
        fillPoly(ctx, [[cx - s * 0.05, -s * 0.02 + b], [cx - s * 0.03, -s * 0.04 - h + b], [cx + s * 0.01, -s * 0.06 - h * 1.1 + b], [cx + s * 0.05, -s * 0.02 + b]], colors[i], s * 0.8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(cx - s * 0.025, -s * 0.04 - h * 0.7 + b, s * 0.015, h * 0.5);
    }
    fillEllipse(ctx, -s * 0.04, s * 0.1 + b, s * 0.3, s * 0.16, body, s);
    fillEllipse(ctx, s * 0.02, s * 0.16 + b, s * 0.18, s * 0.08, "#9a7ad8");
    petLeg(ctx, -s * 0.16, s * 0.26, s * 0.1, s * 0.24, ph, body, s);
    petLeg(ctx, s * 0.2, s * 0.26, s * 0.1, s * 0.24, ph + Math.PI, body, s);
    // Голова
    const hx = s * 0.3;
    const hy = -s * 0.04 + b;
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.12, body, s);
    fillEllipse(ctx, hx + s * 0.12, hy + s * 0.03, s * 0.08, s * 0.06, body, s * 0.8);
    fillPoly(ctx, [[hx - s * 0.06, hy - s * 0.1], [hx - s * 0.02, hy - s * 0.2], [hx + s * 0.03, hy - s * 0.1]], "#39f6ff", s * 0.6);
    petEye(ctx, hx + s * 0.03, hy - s * 0.02, s * 0.05, t, eyeMood(o), 66);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.03, hy - s * 0.02, s * 0.05, s);
    }
    petMouth(ctx, hx + s * 0.12, hy + s * 0.08, s * 0.05, s, o.mood);
}

export const PET_RENDERERS_7 = {
    pet_kubo_kriperino: drawKuboKriperino,
    pet_flamingo: drawFlamingo,
    pet_raptor_raketoni: drawRaptor,
    pet_motocyclino: drawMotocyclino,
    pet_idol: drawIdol,
    pet_glitcho: drawGlitcho,
    pet_gromoni: drawGromoni,
    pet_kristalozavr: drawKristalozavr
};
