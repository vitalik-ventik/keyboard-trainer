// ============================================================
// pet_renderers_4.js — малювальники улюбленців, частина 4: секретні брейнроти
// дерев'яного сундука — Пилоріно Бобрані, Тапко Тапкіні Сахуріно, Банан Бананіно
// Гангстеро, Хот-Догоні Такса, Унітазо Скібідіно, Картопліно Бульбоні
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, eyeMood, fillEllipse, fillRoundRect, petEye, petLeg, petLimb, petLine, petMouth, runPhase, sneakerLegs } from "./pet_parts.js";

// ---------- Пилоріно Бобрані: бобер із бензопилою замість хвоста ----------

function drawBobrani(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#8b5a2b";
    const dark = "#6a4020";
    // Бензопила-хвіст: мотор, шина й ланцюг, що біжить
    const shake = t ? Math.sin(t * 0.09) * s * 0.008 : 0;
    ctx.save();
    ctx.translate(0, shake);
    fillRoundRect(ctx, -s * 0.62, s * 0.02, s * 0.28, s * 0.1, s * 0.05, "#c8d0dc", s);
    ctx.save();
    ctx.setLineDash([s * 0.035, s * 0.035]);
    ctx.lineDashOffset = t ? -(t * 0.08) % (s * 0.07) : 0;
    ctx.strokeStyle = "#3a4050";
    ctx.lineWidth = Math.max(1, s * 0.025);
    roundedOutline(ctx, -s * 0.61, s * 0.03, s * 0.26, s * 0.08, s * 0.04);
    ctx.restore();
    fillRoundRect(ctx, -s * 0.42, -s * 0.06, s * 0.18, s * 0.2, s * 0.05, "#ff7a1a", s);
    fillRoundRect(ctx, -s * 0.4, -s * 0.12, s * 0.1, s * 0.06, s * 0.02, "#2b2f3a", s * 0.7);
    ctx.restore();
    // Тирса летить з-під пилки, коли біжить
    if (o.moving && t) {
        ctx.fillStyle = "#e8c48a";
        for (let i = 0; i < 4; i++) {
            const k = ((t * 0.002 + i * 0.25) % 1);
            ctx.globalAlpha = 1 - k;
            ctx.fillRect(-s * (0.6 + k * 0.25), s * (0.02 - k * 0.2 + (i % 2) * 0.1), s * 0.035, s * 0.035);
        }
        ctx.globalAlpha = 1;
    }
    // Лапки
    petLeg(ctx, -s * 0.2, s * 0.26, s * 0.1, s * 0.24, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.14, s * 0.26, s * 0.1, s * 0.24, ph, dark, s);
    fillEllipse(ctx, -s * 0.04, s * 0.12 + b, s * 0.3, s * 0.22, fur, s);
    fillEllipse(ctx, s * 0.02, s * 0.18 + b, s * 0.18, s * 0.12, "#c89060");
    petLeg(ctx, -s * 0.12, s * 0.28, s * 0.1, s * 0.22, ph, fur, s);
    petLeg(ctx, s * 0.2, s * 0.28, s * 0.1, s * 0.22, ph + Math.PI, fur, s);
    // Голова з великими зубами
    const hx = s * 0.24;
    const hy = -s * 0.12 + b;
    fillEllipse(ctx, hx - s * 0.1, hy - s * 0.14, s * 0.06, s * 0.06, dark, s);
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.18, fur, s);
    fillEllipse(ctx, hx + s * 0.13, hy + s * 0.05, s * 0.1, s * 0.08, "#c89060", s * 0.7);
    fillEllipse(ctx, hx + s * 0.2, hy + s * 0.01, s * 0.035, s * 0.028, PET_OUTLINE);
    fillRoundRect(ctx, hx + s * 0.1, hy + s * 0.1, s * 0.09, s * 0.1, s * 0.02, "#fffbe8", s * 0.6);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(hx + s * 0.145, hy + s * 0.1);
    ctx.lineTo(hx + s * 0.145, hy + s * 0.2);
    ctx.stroke();
    petEye(ctx, hx + s * 0.04, hy - s * 0.05, s * 0.06, t, eyeMood(o), 31);
    if (o.mood !== "happy" && o.mood !== "sad") {
        angryBrow(ctx, hx + s * 0.04, hy - s * 0.05, s * 0.06, s);
    }
}

// Контур заокругленого прямокутника без заливки (ланцюг пилки)
function roundedOutline(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.stroke();
}

// ---------- Тапко Тапкіні Сахуріно: живий тапок із кийком ----------

function drawTapkoSahur(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    sneakerLegs(ctx, s, [-s * 0.1, s * 0.1], s * 0.28, "#3a2a20", "#ff3b4f", ph);
    // Підошва стоїть сторч — це й тіло
    fillRoundRect(ctx, -s * 0.2, -s * 0.52 + b, s * 0.4, s * 0.84, s * 0.2, "#6a4a32", s);
    fillRoundRect(ctx, -s * 0.16, -s * 0.47 + b, s * 0.32, s * 0.74, s * 0.16, "#8a6444");
    // Верх тапка в картату клітинку
    const top = s * 0.02 + b;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.3 + b);
    ctx.lineTo(-s * 0.22, top + s * 0.06);
    ctx.quadraticCurveTo(0, top - s * 0.08, s * 0.22, top + s * 0.06);
    ctx.lineTo(s * 0.22, s * 0.3 + b);
    ctx.closePath();
    ctx.fillStyle = "#c0283a";
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "rgba(20, 10, 30, 0.35)";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(-s * 0.22 + i * s * 0.12, top - s * 0.1, s * 0.05, s * 0.5);
        ctx.fillRect(-s * 0.24, top + i * s * 0.08, s * 0.5, s * 0.03);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.3 + b);
    ctx.lineTo(-s * 0.22, top + s * 0.06);
    ctx.quadraticCurveTo(0, top - s * 0.08, s * 0.22, top + s * 0.06);
    ctx.lineTo(s * 0.22, s * 0.3 + b);
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Обличчя на підошві
    const ey = -s * 0.26 + b;
    petEye(ctx, -s * 0.04, ey, s * 0.065, t, eyeMood(o), 32);
    petEye(ctx, s * 0.1, ey, s * 0.065, t, eyeMood(o), 32);
    if (o.mood !== "happy" && o.mood !== "sad") {
        angryBrow(ctx, s * 0.1, ey, s * 0.065, s);
    }
    petMouth(ctx, s * 0.04, -s * 0.12 + b, s * 0.1, s, o.mood);
    // Кийок: замах і удар об землю в такт крокам (у радості — частіше)
    const beat = t ? (o.mood === "happy" ? t * 0.02 : t * 0.011) : 0;
    const swing = t ? Math.pow(Math.abs(Math.sin(beat)), 3) : 0.3;
    const hx = s * 0.26;
    const hy = s * 0.02 + b;
    petLimb(ctx, s * 0.16, s * 0.0 + b, hx, hy, s * 0.05, "#3a2a20", s);
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(0.25 + swing * 1.6);
    ctx.beginPath();
    ctx.moveTo(-s * 0.03, 0);
    ctx.lineTo(-s * 0.05, -s * 0.36);
    ctx.quadraticCurveTo(0, -s * 0.44, s * 0.05, -s * 0.36);
    ctx.lineTo(s * 0.03, 0);
    ctx.closePath();
    ctx.fillStyle = "#c08850";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.9;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.restore();
    fillEllipse(ctx, hx, hy, s * 0.04, s * 0.04, "#3a2a20", s * 0.6);
}

// ---------- Банан Бананіно Гангстеро: банан у кепці, окулярах і з ланцюгом ----------

function drawBananGangstero(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    sneakerLegs(ctx, s, [-s * 0.08, s * 0.12], s * 0.24, "#e6b800", "#111111", ph);
    // Банан — товстий вигнутий «серп»
    const bob = o.moving && t ? Math.abs(Math.sin(ph)) * s * 0.02 : 0;
    const y0 = b - bob;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.02, s * 0.28 + y0);
    ctx.quadraticCurveTo(-s * 0.3, -s * 0.05 + y0, s * 0.06, -s * 0.4 + y0);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.36;
    ctx.stroke();
    ctx.strokeStyle = "#ffd83a";
    ctx.lineWidth = s * 0.36 - petLine(s) * 2;
    ctx.stroke();
    ctx.strokeStyle = "#f2c200";
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.02, s * 0.3 + y0);
    ctx.quadraticCurveTo(-s * 0.38, -s * 0.04 + y0, -s * 0.04, -s * 0.38 + y0);
    ctx.stroke();
    // Коричневий кінчик унизу
    fillEllipse(ctx, s * 0.04, s * 0.38 + y0, s * 0.05, s * 0.035, "#5a3a14", s * 0.6);
    // Кепка козирком назад
    ctx.save();
    ctx.translate(s * 0.02, -s * 0.44 + y0);
    ctx.rotate(-0.15);
    fillRoundRect(ctx, -s * 0.34, -s * 0.02, s * 0.22, s * 0.07, s * 0.03, "#d8142f", s * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.17, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#ff2a44";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.restore();
    // Окуляри-«чорні» з відблиском (у смутку — з'їхали вниз і видно очі)
    const gy = -s * 0.2 + y0;
    if (o.mood === "sad" || o.mood === "happy") {
        petEye(ctx, -s * 0.02, gy, s * 0.06, t, eyeMood(o), 33);
        petEye(ctx, s * 0.14, gy, s * 0.06, t, eyeMood(o), 33);
    } else {
        ctx.fillStyle = PET_OUTLINE;
        ctx.fillRect(-s * 0.1, gy - s * 0.035, s * 0.34, s * 0.03);
        fillRoundRect(ctx, -s * 0.09, gy - s * 0.04, s * 0.14, s * 0.09, s * 0.03, "#11131c", s * 0.5);
        fillRoundRect(ctx, s * 0.08, gy - s * 0.04, s * 0.14, s * 0.09, s * 0.03, "#11131c", s * 0.5);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(-s * 0.06, gy - s * 0.02, s * 0.04, s * 0.015);
        ctx.fillRect(s * 0.11, gy - s * 0.02, s * 0.04, s * 0.015);
    }
    // Самовпевнена усмішка набік
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.beginPath();
    if (o.mood === "sad") {
        ctx.arc(s * 0.08, -s * 0.02 + y0, s * 0.05, Math.PI * 1.2, Math.PI * 1.8);
    } else {
        ctx.moveTo(s * 0.02, -s * 0.08 + y0);
        ctx.quadraticCurveTo(s * 0.1, -s * 0.03 + y0, s * 0.16, -s * 0.1 + y0);
    }
    ctx.stroke();
    // Золотий ланцюг: ланки блищать
    for (let i = 0; i < 6; i++) {
        const a = Math.PI * (0.15 + i * 0.14);
        const x = -s * 0.04 + Math.cos(a) * s * 0.2;
        const y = s * 0.0 + y0 + Math.sin(a) * s * 0.1;
        fillEllipse(ctx, x, y, s * 0.035, s * 0.025, "#ffcc33", s * 0.45);
    }
    fillRoundRect(ctx, -s * 0.07, s * 0.08 + y0, s * 0.1, s * 0.1, s * 0.02, "#ffcc33", s * 0.6);
    ctx.fillStyle = "#b8860b";
    ctx.font = "bold " + Math.max(5, s * 0.08) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", -s * 0.02, s * 0.135 + y0);
}

// ---------- Хот-Догоні Такса: такса-сосиска в булочці ----------

function drawHotdog(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const dog = "#b5532a";
    const dark = "#8a3a1a";
    // Задні й передні лапки
    petLeg(ctx, -s * 0.34, s * 0.28, s * 0.08, s * 0.22, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.14, s * 0.28, s * 0.08, s * 0.22, ph, dark, s);
    // Хвостик
    ctx.save();
    ctx.translate(-s * 0.46, s * 0.02 + b);
    ctx.rotate(t ? Math.sin(t * (o.mood === "happy" ? 0.04 : 0.015)) * 0.4 - 0.5 : -0.5);
    fillRoundRect(ctx, -s * 0.16, -s * 0.025, s * 0.18, s * 0.05, s * 0.025, dog, s * 0.8);
    ctx.restore();
    // Сосиска-тіло
    fillRoundRect(ctx, -s * 0.5, -s * 0.06 + b, s * 0.82, s * 0.2, s * 0.1, dog, s);
    petLeg(ctx, -s * 0.26, s * 0.3, s * 0.08, s * 0.2, ph, dog, s);
    petLeg(ctx, s * 0.22, s * 0.3, s * 0.08, s * 0.2, ph + Math.PI, dog, s);
    // Булочка обіймає сосиску знизу
    ctx.beginPath();
    ctx.moveTo(-s * 0.46, s * 0.04 + b);
    ctx.quadraticCurveTo(-s * 0.46, s * 0.3 + b, -s * 0.1, s * 0.3 + b);
    ctx.lineTo(s * 0.04, s * 0.3 + b);
    ctx.quadraticCurveTo(s * 0.3, s * 0.3 + b, s * 0.3, s * 0.04 + b);
    ctx.quadraticCurveTo(-s * 0.08, s * 0.16 + b, -s * 0.46, s * 0.04 + b);
    ctx.closePath();
    ctx.fillStyle = "#eab36a";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.18, s * 0.24 + b, s * 0.14, s * 0.025, "#f6d39a");
    // Кетчуп і гірчиця зигзагом по спинці
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1.2, s * 0.035);
    ctx.strokeStyle = "#e0202a";
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
        const x = -s * 0.42 + i * s * 0.1;
        const y = -s * 0.01 + b + (i % 2 === 0 ? -s * 0.02 : s * 0.02);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.strokeStyle = "#ffd21a";
    ctx.lineWidth = Math.max(1, s * 0.025);
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
        const x = -s * 0.38 + i * s * 0.1;
        const y = s * 0.04 + b + (i % 2 === 0 ? s * 0.015 : -s * 0.015);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    // Крапля кетчупу падає позаду, коли біжить
    if (o.moving && t) {
        const k = (t * 0.0015) % 1;
        fillEllipse(ctx, -s * (0.2 + k * 0.3), s * (0.16 + k * 0.3) + b, s * 0.025, s * 0.035, "#e0202a");
    }
    // Голова з вухом, що теліпається
    const hx = s * 0.36;
    const hy = -s * 0.12 + b;
    fillEllipse(ctx, hx, hy, s * 0.15, s * 0.13, dog, s);
    fillEllipse(ctx, hx + s * 0.13, hy + s * 0.04, s * 0.09, s * 0.06, dog, s);
    fillEllipse(ctx, hx + s * 0.21, hy + s * 0.02, s * 0.035, s * 0.03, PET_OUTLINE);
    const earSwing = t ? Math.sin(t * 0.02) * 0.3 : 0;
    fillEllipse(ctx, hx - s * 0.07, hy + s * 0.04, s * 0.05, s * 0.11, dark, s * 0.8, 0.3 + earSwing);
    petEye(ctx, hx + s * 0.03, hy - s * 0.04, s * 0.055, t, eyeMood(o), 34);
    if (o.mood === "happy") {
        fillEllipse(ctx, hx + s * 0.16, hy + s * 0.11, s * 0.03, s * 0.045, "#ff6f8f", s * 0.4);
    }
}

// ---------- Унітазо Скібідіно: голова в унітазі на колесах ----------

function drawSkibidino(ctx, s, t, o) {
    const b = breathe(t, s);
    const roll = o.moving && t ? t * 0.02 : 0;
    // Колеса
    for (let i = 0; i < 2; i++) {
        const wx = -s * 0.22 + i * s * 0.4;
        const wy = s * 0.4;
        fillEllipse(ctx, wx, wy, s * 0.1, s * 0.1, "#2b2f3a", s);
        ctx.strokeStyle = "#9aa3b8";
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
            const a = roll + k * Math.PI / 3;
            ctx.moveTo(wx - Math.cos(a) * s * 0.07, wy - Math.sin(a) * s * 0.07);
            ctx.lineTo(wx + Math.cos(a) * s * 0.07, wy + Math.sin(a) * s * 0.07);
        }
        ctx.stroke();
    }
    // Бачок позаду
    fillRoundRect(ctx, -s * 0.44, -s * 0.36 + b, s * 0.2, s * 0.5, s * 0.04, "#f4f7fb", s);
    fillRoundRect(ctx, -s * 0.47, -s * 0.4 + b, s * 0.26, s * 0.07, s * 0.03, "#e2e8f2", s * 0.8);
    fillRoundRect(ctx, -s * 0.28, -s * 0.28 + b, s * 0.06, s * 0.03, s * 0.01, "#9aa3b8", s * 0.5);
    // Голова виринає з унітаза й «співає»
    const sing = t ? Math.abs(Math.sin(t * (o.mood === "happy" ? 0.018 : 0.008))) : 0.5;
    const hx = s * 0.08;
    const hy = -s * 0.18 + b - sing * s * 0.06;
    // Шия ховається в чаші
    fillRoundRect(ctx, hx - s * 0.06, hy + s * 0.08, s * 0.12, b + s * 0.02 - (hy + s * 0.08), s * 0.03, "#e8b88c", s * 0.7);
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.17, "#f2c9a0", s);
    ctx.beginPath();
    ctx.arc(hx, hy - s * 0.04, s * 0.165, Math.PI * 1.05, Math.PI * 1.95);
    ctx.quadraticCurveTo(hx, hy - s * 0.1, hx - s * 0.16, hy - s * 0.05);
    ctx.fillStyle = "#5a3a20";
    ctx.fill();
    petEye(ctx, hx + s * 0.0, hy - s * 0.01, s * 0.05, t, eyeMood(o), 35);
    petEye(ctx, hx + s * 0.1, hy - s * 0.01, s * 0.05, t, eyeMood(o), 35);
    // Брови вгору — «співає»
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, petLine(s) * 0.8);
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.05, hy - s * 0.1 - sing * s * 0.02);
    ctx.lineTo(hx + s * 0.03, hy - s * 0.11 - sing * s * 0.02);
    ctx.moveTo(hx + s * 0.07, hy - s * 0.11 - sing * s * 0.02);
    ctx.lineTo(hx + s * 0.14, hy - s * 0.1 - sing * s * 0.02);
    ctx.stroke();
    if (o.mood === "sad") {
        petMouth(ctx, hx + s * 0.05, hy + s * 0.08, s * 0.08, s, "sad");
    } else {
        fillEllipse(ctx, hx + s * 0.05, hy + s * 0.08, s * 0.04, s * 0.02 + sing * s * 0.03, "#5a0a14", s * 0.5);
    }
    // Ноти, коли радіє
    if ((o.mood === "happy" || o.mood === "combo") && t) {
        const k = (t * 0.0012) % 1;
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = "#39c6ff";
        ctx.font = "bold " + Math.max(6, s * 0.16) + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("♪", hx + s * (0.22 + k * 0.1), hy - s * (0.1 + k * 0.2));
        ctx.globalAlpha = 1;
    }
    // Чаша з ободом поверх шиї
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, s * 0.0 + b);
    ctx.quadraticCurveTo(-s * 0.22, s * 0.26 + b, -s * 0.06, s * 0.28 + b);
    ctx.lineTo(-s * 0.1, s * 0.34 + b);
    ctx.lineTo(s * 0.24, s * 0.34 + b);
    ctx.lineTo(s * 0.2, s * 0.26 + b);
    ctx.quadraticCurveTo(s * 0.38, s * 0.18 + b, s * 0.4, s * 0.0 + b);
    ctx.closePath();
    ctx.fillStyle = "#f4f7fb";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, s * 0.07, s * 0.0 + b, s * 0.34, s * 0.07, "#dfe6f0", s);
    fillEllipse(ctx, s * 0.07, s * 0.0 + b, s * 0.24, s * 0.035, "#7fd0ff");
}

// ---------- Картопліно Бульбоні: картопля-солдат у касці з рогаткою ----------

function drawKartoplino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const potato = "#c9a063";
    sneakerLegs(ctx, s, [-s * 0.12, s * 0.12], s * 0.26, "#8a6a3a", "#4f7a32", ph);
    // Бульба нерівної форми
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.02 + b);
    ctx.bezierCurveTo(-s * 0.34, -s * 0.28 + b, -s * 0.06, -s * 0.36 + b, s * 0.12, -s * 0.3 + b);
    ctx.bezierCurveTo(s * 0.34, -s * 0.24 + b, s * 0.34, s * 0.02 + b, s * 0.28, s * 0.16 + b);
    ctx.bezierCurveTo(s * 0.2, s * 0.34 + b, -s * 0.2, s * 0.36 + b, -s * 0.28, s * 0.18 + b);
    ctx.bezierCurveTo(-s * 0.32, s * 0.1 + b, -s * 0.28, s * 0.04 + b, -s * 0.3, -s * 0.02 + b);
    ctx.closePath();
    ctx.fillStyle = potato;
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Вічка картоплі
    fillEllipse(ctx, -s * 0.18, s * 0.12 + b, s * 0.025, s * 0.02, "#8a6a3a");
    fillEllipse(ctx, s * 0.06, s * 0.22 + b, s * 0.02, s * 0.015, "#8a6a3a");
    fillEllipse(ctx, -s * 0.06, s * 0.04 + b, s * 0.02, s * 0.015, "#8a6a3a");
    // Обличчя
    const ey = -s * 0.1 + b;
    petEye(ctx, s * 0.04, ey, s * 0.06, t, eyeMood(o), 36);
    petEye(ctx, s * 0.19, ey, s * 0.06, t, eyeMood(o), 36);
    if (o.mood !== "happy" && o.mood !== "sad") {
        angryBrow(ctx, s * 0.19, ey, s * 0.06, s);
    }
    petMouth(ctx, s * 0.13, s * 0.06 + b, s * 0.08, s, o.mood);
    // Військова каска з ремінцем
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, -s * 0.2 + b);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.02 + b, -s * 0.12, s * 0.06 + b);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, -s * 0.2 + b);
    ctx.quadraticCurveTo(-s * 0.34, -s * 0.52 + b, s * 0.02, -s * 0.52 + b);
    ctx.quadraticCurveTo(s * 0.34, -s * 0.5 + b, s * 0.34, -s * 0.2 + b);
    ctx.closePath();
    ctx.fillStyle = "#4f7a32";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.12, -s * 0.38 + b, s * 0.06, s * 0.035, "#3a5a24");
    fillEllipse(ctx, s * 0.12, -s * 0.3 + b, s * 0.05, s * 0.03, "#6a9a44");
    fillRoundRect(ctx, -s * 0.4, -s * 0.23 + b, s * 0.78, s * 0.06, s * 0.03, "#3a5a24", s * 0.8);
    // Рогатка в руці; у радості — постріл камінчиком уперед
    const ax = s * 0.34;
    const ay = s * 0.02 + b;
    petLimb(ctx, s * 0.22, s * 0.06 + b, ax, ay, s * 0.05, "#8a6a3a", s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax, ay - s * 0.1);
    ctx.moveTo(ax, ay - s * 0.1);
    ctx.lineTo(ax - s * 0.05, ay - s * 0.2);
    ctx.moveTo(ax, ay - s * 0.1);
    ctx.lineTo(ax + s * 0.05, ay - s * 0.2);
    ctx.stroke();
    ctx.strokeStyle = "#a8743a";
    ctx.lineWidth = s * 0.03;
    ctx.stroke();
    ctx.strokeStyle = "#ff4a5a";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(ax - s * 0.05, ay - s * 0.2);
    ctx.lineTo(ax + s * 0.05, ay - s * 0.2);
    ctx.stroke();
    if (o.mood === "happy" && t) {
        const k = o.happyT || 0;
        fillEllipse(ctx, ax + s * (0.06 + k * 0.5), ay - s * 0.2, s * 0.03, s * 0.03, "#9aa3b8", s * 0.4);
    }
}

export const PET_RENDERERS_4 = {
    pet_bobrani: drawBobrani,
    pet_tapko_sahur: drawTapkoSahur,
    pet_banan_gangstero: drawBananGangstero,
    pet_hotdog: drawHotdog,
    pet_skibidino: drawSkibidino,
    pet_kartoplino: drawKartoplino
};
