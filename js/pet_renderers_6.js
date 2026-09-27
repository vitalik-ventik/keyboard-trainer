// ============================================================
// pet_renderers_6.js — малювальники улюбленців, частина 6: секретні брейнроти
// золотого сундука — Бомбардіно Крокодило, Трактор Тракторіно Мегазорд,
// Голд Голдоні Слиткоіно, Дракон Шаурміно, Боргіні Кіборгіні
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillPoly, fillRoundRect, petEye, petLeg, petLimb, petLine, petMouth, runPhase, sneakerLegs } from "./pet_parts.js";

// Пропелер, що крутиться: розмита смуга лопатей навколо осі (x, y)
function propeller(ctx, x, y, r, t, s) {
    const k = t ? Math.abs(Math.sin(t * 0.08)) : 0.8;
    ctx.save();
    ctx.globalAlpha = 0.55;
    fillEllipse(ctx, x, y, s * 0.02, r * (0.3 + k * 0.7), "#dfe6f0");
    ctx.restore();
    fillEllipse(ctx, x, y, s * 0.03, s * 0.03, "#ffcc33", s * 0.5);
}

// ---------- Бомбардіно Крокодило: крокодил-бомбардувальник ----------

function drawBombardino(ctx, s, t, o) {
    const b = breathe(t, s);
    const croc = "#4f9a3a";
    const dark = "#2f6a24";
    // Дальнє крило
    fillPoly(ctx, [[-s * 0.08, -s * 0.02 + b], [-s * 0.26, -s * 0.2 + b], [-s * 0.14, -s * 0.2 + b], [s * 0.08, -s * 0.02 + b]], "#8a96a8", s);
    // Хвостове оперення
    fillPoly(ctx, [[-s * 0.36, -s * 0.02 + b], [-s * 0.5, -s * 0.24 + b], [-s * 0.42, -s * 0.24 + b], [-s * 0.26, -s * 0.04 + b]], "#8a96a8", s);
    // Фюзеляж-крокодил з лусочками
    fillEllipse(ctx, -s * 0.04, b, s * 0.38, s * 0.12, croc, s);
    ctx.fillStyle = dark;
    for (let i = 0; i < 5; i++) {
        fillEllipse(ctx, -s * 0.3 + i * s * 0.1, -s * 0.09 + b, s * 0.03, s * 0.022, dark);
    }
    fillEllipse(ctx, -s * 0.02, s * 0.06 + b, s * 0.28, s * 0.04, "#b8d88a");
    // Паща з зубами
    const jaw = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) * 0.35 : 0;
    ctx.save();
    ctx.translate(s * 0.26, s * 0.02 + b);
    ctx.rotate(jaw);
    fillRoundRect(ctx, 0, -s * 0.0, s * 0.26, s * 0.06, s * 0.03, croc, s);
    ctx.restore();
    fillRoundRect(ctx, s * 0.24, -s * 0.07 + b, s * 0.3, s * 0.08, s * 0.04, croc, s);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i++) {
        const tx = s * (0.3 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(tx, s * 0.01 + b);
        ctx.lineTo(tx + s * 0.02, s * 0.04 + b);
        ctx.lineTo(tx + s * 0.04, s * 0.01 + b);
        ctx.fill();
    }
    fillEllipse(ctx, s * 0.5, -s * 0.06 + b, s * 0.02, s * 0.015, PET_OUTLINE);
    // Око з льотними окулярами
    const ex = s * 0.2;
    const ey = -s * 0.12 + b;
    fillEllipse(ctx, ex, ey + s * 0.02, s * 0.09, s * 0.07, croc, s);
    petEye(ctx, ex + s * 0.01, ey, s * 0.055, t, eyeMood(o), 51);
    ctx.strokeStyle = "#7a4a26";
    ctx.lineWidth = Math.max(1.2, s * 0.03);
    ctx.beginPath();
    ctx.arc(ex + s * 0.01, ey, s * 0.075, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - s * 0.07, ey);
    ctx.lineTo(ex - s * 0.18, ey + s * 0.02);
    ctx.stroke();
    // Ближнє крило з двигуном і пропелером
    fillPoly(ctx, [[-s * 0.12, s * 0.02 + b], [-s * 0.3, s * 0.2 + b], [-s * 0.14, s * 0.2 + b], [s * 0.1, s * 0.04 + b]], "#a8b4c4", s);
    fillRoundRect(ctx, -s * 0.1, s * 0.09 + b, s * 0.14, s * 0.07, s * 0.035, "#5a6478", s * 0.8);
    propeller(ctx, s * 0.05, s * 0.125 + b, s * 0.12, t, s);
    // Бомбочка під крилом (у радості — відпускає її)
    const drop = o.mood === "happy" ? (o.happyT || 0) * s * 0.3 : 0;
    ctx.save();
    ctx.globalAlpha = drop > 0 ? 1 - (o.happyT || 0) : 1;
    fillEllipse(ctx, -s * 0.2, s * 0.24 + b + drop, s * 0.07, s * 0.045, "#2b2f3a", s * 0.7);
    fillPoly(ctx, [[-s * 0.27, s * 0.24 + b + drop], [-s * 0.33, s * 0.2 + b + drop], [-s * 0.33, s * 0.28 + b + drop]], "#2b2f3a");
    ctx.restore();
}

// ---------- Трактор Тракторіно Мегазорд: трактор-робот ----------

function drawTraktorino(ctx, s, t, o) {
    const b = breathe(t, s);
    const roll = o.moving && t ? t * 0.015 : 0;
    const red = "#d8302a";
    // Велике заднє колесо й мале переднє
    const wheel = function (x, y, r) {
        fillEllipse(ctx, x, y, r, r, "#22252e", s);
        ctx.strokeStyle = "#4a4f5c";
        ctx.lineWidth = Math.max(1.2, r * 0.25);
        ctx.setLineDash([r * 0.3, r * 0.25]);
        ctx.lineDashOffset = -roll * r * 2;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        fillEllipse(ctx, x, y, r * 0.45, r * 0.45, "#ffcc33", s * 0.6);
    };
    // Дим з вихлопної труби
    if (t) {
        ctx.save();
        for (let i = 0; i < 2; i++) {
            const k = ((t * 0.001 + i * 0.5) % 1);
            ctx.globalAlpha = 0.5 * (1 - k);
            fillEllipse(ctx, s * (0.12 - k * 0.2), -s * (0.52 + k * 0.2) + b, s * (0.04 + k * 0.05), s * (0.04 + k * 0.05), "#8a8f9c");
        }
        ctx.restore();
    }
    fillRoundRect(ctx, s * 0.1, -s * 0.52 + b, s * 0.05, s * 0.3, s * 0.02, "#5a6478", s * 0.7);
    // Корпус і капот
    fillRoundRect(ctx, -s * 0.3, -s * 0.02 + b, s * 0.66, s * 0.26, s * 0.05, red, s);
    fillRoundRect(ctx, s * 0.14, -s * 0.12 + b, s * 0.26, s * 0.2, s * 0.05, red, s);
    ctx.fillStyle = "#2b2f3a";
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(s * (0.3 + i * 0.03), -s * 0.08 + b, s * 0.015, s * 0.12);
    }
    // Кабіна-голова з візором-очима
    fillRoundRect(ctx, -s * 0.28, -s * 0.44 + b, s * 0.34, s * 0.44, s * 0.06, red, s);
    fillRoundRect(ctx, -s * 0.22, -s * 0.38 + b, s * 0.26, s * 0.16, s * 0.04, "#1b2238", s * 0.8);
    const glow = o.mood === "combo" ? "#ff4a5a" : o.mood === "sad" ? "#5a7aa0" : "#39f6ff";
    if (o.mood === "happy") {
        ctx.strokeStyle = glow;
        ctx.lineWidth = Math.max(1.2, s * 0.03);
        ctx.beginPath();
        ctx.arc(-s * 0.12, -s * 0.28 + b, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(-s * 0.02 + s * 0.04, -s * 0.28 + b);
        ctx.arc(-s * 0.02, -s * 0.28 + b, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else {
        const blink = t && (t % 3000) < 100 ? 0.2 : 1;
        fillRoundRect(ctx, -s * 0.17, -s * 0.33 + b, s * 0.07, s * 0.06 * blink, s * 0.015, glow);
        fillRoundRect(ctx, -s * 0.06, -s * 0.33 + b, s * 0.07, s * 0.06 * blink, s * 0.015, glow);
    }
    // Антена-маячок
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.44 + b);
    ctx.lineTo(-s * 0.22, -s * 0.54 + b);
    ctx.stroke();
    fillEllipse(ctx, -s * 0.22, -s * 0.55 + b, s * 0.03, s * 0.03, t && Math.floor(t / 400) % 2 === 0 ? "#ffcc33" : "#ff9a1a", s * 0.4);
    wheel(-s * 0.18, s * 0.3, s * 0.2);
    wheel(s * 0.28, s * 0.38, s * 0.12);
    // Руки-маніпулятори: у радості — показують біцепс
    const flex = o.mood === "happy" || o.mood === "combo" ? 1 : 0;
    const wave = t ? Math.sin(t * 0.008) * s * 0.03 : 0;
    const sx = s * 0.04;
    const sy = -s * 0.2 + b;
    const ex = s * 0.2;
    const ey = flex ? -s * 0.18 + b : -s * 0.08 + b + wave;
    const hx = flex ? s * 0.22 : s * 0.34;
    const hy = flex ? -s * 0.38 + b : -s * 0.04 + b + wave;
    petLimb(ctx, sx, sy, ex, ey, s * 0.07, "#8a96a8", s);
    petLimb(ctx, ex, ey, hx, hy, s * 0.06, "#8a96a8", s);
    fillEllipse(ctx, ex, ey, s * 0.04, s * 0.04, "#5a6478", s * 0.5);
    fillRoundRect(ctx, hx - s * 0.045, hy - s * 0.04, s * 0.09, s * 0.08, s * 0.02, "#ffcc33", s * 0.6);
}

// ---------- Голд Голдоні Слиткоіно: золотий зливок-качок ----------

function drawGoldoni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    sneakerLegs(ctx, s, [-s * 0.14, s * 0.14], s * 0.18, "#b8860b", "#ffcc33", ph);
    // Зливок: передня грань і світліший верх
    const top = -s * 0.24 + b;
    fillPoly(ctx, [[-s * 0.36, s * 0.2 + b], [-s * 0.26, top], [s * 0.26, top], [s * 0.36, s * 0.2 + b]], "#f2b705", s);
    fillPoly(ctx, [[-s * 0.26, top], [-s * 0.18, top - s * 0.1], [s * 0.3, top - s * 0.1], [s * 0.26, top]], "#ffe066", s);
    fillPoly(ctx, [[s * 0.26, top], [s * 0.3, top - s * 0.1], [s * 0.42, s * 0.12 + b], [s * 0.36, s * 0.2 + b]], "#c99400", s);
    // Відблиск, що пробігає
    if (t) {
        const run = ((t * 0.0008) % 1.6) - 0.3;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-s * 0.36, s * 0.2 + b);
        ctx.lineTo(-s * 0.26, top);
        ctx.lineTo(s * 0.26, top);
        ctx.lineTo(s * 0.36, s * 0.2 + b);
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const gx = -s * 0.5 + run * s;
        ctx.moveTo(gx, s * 0.2 + b);
        ctx.lineTo(gx + s * 0.12, top);
        ctx.lineTo(gx + s * 0.2, top);
        ctx.lineTo(gx + s * 0.08, s * 0.2 + b);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    // Проба на зливку
    ctx.fillStyle = "#b8860b";
    ctx.font = "bold " + Math.max(5, s * 0.08) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("999.9", -s * 0.02, s * 0.13 + b);
    // Обличчя
    const ey = -s * 0.1 + b;
    petEye(ctx, -s * 0.04, ey, s * 0.06, t, eyeMood(o), 52);
    petEye(ctx, s * 0.12, ey, s * 0.06, t, eyeMood(o), 52);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.12, ey, s * 0.06, s);
    }
    petMouth(ctx, s * 0.05, s * 0.04 + b, s * 0.08, s, o.mood);
    // Руки-біцепси: згинаються ритмічно (у радості — обидві вгору)
    const pump = t ? (Math.sin(t * (o.mood === "happy" ? 0.02 : 0.007)) + 1) / 2 : 0.6;
    const arm = function (side) {
        const sx = side * s * 0.34;
        const sy = -s * 0.02 + b;
        const elx = side * s * 0.5;
        const ely = -s * 0.02 + b;
        const hx = side * s * (0.5 - pump * 0.06);
        const hy = -s * (0.12 + pump * 0.14) + b;
        petLimb(ctx, sx, sy, elx, ely, s * 0.08, "#f2b705", s);
        petLimb(ctx, elx, ely, hx, hy, s * 0.07, "#f2b705", s);
        fillEllipse(ctx, side * s * 0.43, -s * 0.05 + b - pump * s * 0.02, s * 0.06, s * (0.04 + pump * 0.02), "#ffd23a", s * 0.6);
        fillEllipse(ctx, hx, hy, s * 0.045, s * 0.045, "#ffe066", s * 0.6);
    };
    arm(-1);
    arm(1);
}

// ---------- Дракон Шаурміно: дракончик, загорнутий у лаваш ----------

function drawShaurmino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const green = "#3fbf6a";
    // Лапки дракона з-під фольги
    petLeg(ctx, -s * 0.12, s * 0.3, s * 0.09, s * 0.2, ph + Math.PI, "#2f9a54", s);
    petLeg(ctx, s * 0.1, s * 0.3, s * 0.09, s * 0.2, ph, "#2f9a54", s);
    // Крильця з лаваша
    const flap = t ? Math.sin(t * 0.02) * 0.3 : 0;
    ctx.save();
    ctx.translate(-s * 0.18, -s * 0.12 + b);
    ctx.rotate(-0.6 - flap);
    fillPoly(ctx, [[0, 0], [-s * 0.08, -s * 0.24], [-s * 0.2, -s * 0.2], [-s * 0.14, -s * 0.06]], "#6fd98f", s);
    ctx.restore();
    // Рулет-лаваш із рум'яними смужками
    fillRoundRect(ctx, -s * 0.2, -s * 0.2 + b, s * 0.4, s * 0.52, s * 0.14, "#e8c48a", s);
    ctx.strokeStyle = "#b8864a";
    ctx.lineWidth = Math.max(1, s * 0.025);
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, -s * 0.02 + b);
    ctx.quadraticCurveTo(0, s * 0.06 + b, s * 0.18, -s * 0.06 + b);
    ctx.moveTo(-s * 0.18, s * 0.1 + b);
    ctx.quadraticCurveTo(0, s * 0.16 + b, s * 0.18, s * 0.06 + b);
    ctx.stroke();
    // Начинка визирає зверху: салат, помідор, соус
    fillEllipse(ctx, -s * 0.1, -s * 0.2 + b, s * 0.07, s * 0.04, "#7ed957", s * 0.6);
    fillEllipse(ctx, s * 0.12, -s * 0.2 + b, s * 0.06, s * 0.035, "#ff4a3a", s * 0.6);
    // Фольга знизу
    ctx.beginPath();
    ctx.moveTo(-s * 0.21, s * 0.12 + b);
    for (let i = 0; i <= 6; i++) {
        ctx.lineTo(-s * 0.21 + i * s * 0.07, s * 0.12 + b + (i % 2 === 0 ? 0 : -s * 0.04));
    }
    ctx.lineTo(s * 0.21, s * 0.3 + b);
    ctx.quadraticCurveTo(0, s * 0.36 + b, -s * 0.21, s * 0.3 + b);
    ctx.closePath();
    ctx.fillStyle = "#cfd6e2";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(-s * 0.12, s * 0.18 + b, s * 0.04, s * 0.1);
    // Голова дракона з ріжками
    const hx = s * 0.06;
    const hy = -s * 0.32 + b;
    fillPoly(ctx, [[hx - s * 0.1, hy - s * 0.08], [hx - s * 0.16, hy - s * 0.24], [hx - s * 0.02, hy - s * 0.12]], "#ffe08a", s * 0.7);
    fillPoly(ctx, [[hx + s * 0.02, hy - s * 0.12], [hx + s * 0.06, hy - s * 0.26], [hx + s * 0.12, hy - s * 0.1]], "#ffe08a", s * 0.7);
    fillEllipse(ctx, hx, hy, s * 0.17, s * 0.14, green, s);
    fillEllipse(ctx, hx + s * 0.15, hy + s * 0.04, s * 0.1, s * 0.07, "#6fd98f", s * 0.8);
    fillEllipse(ctx, hx + s * 0.2, hy + s * 0.01, s * 0.015, s * 0.012, PET_OUTLINE);
    petEye(ctx, hx + s * 0.02, hy - s * 0.03, s * 0.06, t, eyeMood(o), 53);
    // Дихає соусом: біло-рожева хвиля вперед
    if ((o.mood === "happy" || o.mood === "combo") && t) {
        const k = (t % 600) / 600;
        ctx.save();
        ctx.globalAlpha = 0.85 * (1 - k);
        fillEllipse(ctx, hx + s * (0.3 + k * 0.14), hy + s * 0.06, s * (0.05 + k * 0.05), s * (0.03 + k * 0.03), "#fff0f0");
        fillEllipse(ctx, hx + s * (0.26 + k * 0.1), hy + s * 0.05, s * 0.03, s * 0.02, "#ffb3c0");
        ctx.restore();
    }
}

// ---------- Боргіні Кіборгіні: кіт-кіборг із лазерним оком ----------

function drawBorgini(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#7a8090";
    const metal = "#b8c2d2";
    // Хвіст-кабель з вогником
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = "round";
    const wag = t ? Math.sin(t * 0.01) * s * 0.06 : 0;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.06 + b);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.0 + b, -s * 0.46 + wag, -s * 0.24 + b);
    ctx.stroke();
    ctx.strokeStyle = metal;
    ctx.lineWidth = s * 0.05;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.46 + wag, -s * 0.26 + b, s * 0.03, s * 0.03, "#ff2a3a", s * 0.4);
    // Лапи: передні — механічні
    petLeg(ctx, -s * 0.22, s * 0.24, s * 0.09, s * 0.26, ph + Math.PI, "#5a6070", s);
    petLeg(ctx, s * 0.1, s * 0.24, s * 0.09, s * 0.26, ph, "#8a96a8", s);
    fillEllipse(ctx, -s * 0.06, s * 0.1 + b, s * 0.3, s * 0.18, fur, s);
    // Металева пластина на боці з заклепками
    fillRoundRect(ctx, -s * 0.2, -s * 0.02 + b, s * 0.18, s * 0.14, s * 0.03, metal, s * 0.7);
    ctx.fillStyle = "#5a6478";
    ctx.fillRect(-s * 0.18, s * 0.0 + b, s * 0.02, s * 0.02);
    ctx.fillRect(-s * 0.06, s * 0.0 + b, s * 0.02, s * 0.02);
    ctx.fillRect(-s * 0.18, s * 0.09 + b, s * 0.02, s * 0.02);
    ctx.fillRect(-s * 0.06, s * 0.09 + b, s * 0.02, s * 0.02);
    petLeg(ctx, -s * 0.14, s * 0.26, s * 0.09, s * 0.24, ph, fur, s);
    petLeg(ctx, s * 0.18, s * 0.26, s * 0.09, s * 0.24, ph + Math.PI, metal, s);
    // Голова: задня половина — метал, передня — шерсть
    const hx = s * 0.2;
    const hy = -s * 0.18 + b;
    const ear = function (x, fill) {
        ctx.beginPath();
        ctx.moveTo(x - s * 0.07, hy - s * 0.1);
        ctx.lineTo(x, hy - s * 0.26);
        ctx.lineTo(x + s * 0.07, hy - s * 0.1);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = petLine(s);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
    };
    ear(hx - s * 0.1, metal);
    ear(hx + s * 0.08, fur);
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.17, fur, s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(hx, hy, s * 0.19, s * 0.16, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = metal;
    ctx.fillRect(hx - s * 0.22, hy - s * 0.2, s * 0.2, s * 0.4);
    ctx.strokeStyle = "#5a6478";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.02, hy - s * 0.2);
    ctx.lineTo(hx - s * 0.02, hy + s * 0.2);
    ctx.stroke();
    ctx.restore();
    // Лазерне око (червоне, пульсує) і звичайне око
    const pulse = t ? 0.6 + Math.abs(Math.sin(t * 0.008)) * 0.4 : 1;
    const lx = hx - s * 0.06;
    const ly = hy - s * 0.02;
    ctx.save();
    ctx.globalAlpha = 0.5 * pulse;
    fillEllipse(ctx, lx, ly, s * 0.08, s * 0.08, "#ff2a3a");
    ctx.restore();
    fillEllipse(ctx, lx, ly, s * 0.045, s * 0.045, "#ff2a3a", s * 0.6);
    fillEllipse(ctx, lx + s * 0.01, ly - s * 0.01, s * 0.015, s * 0.015, "#ffd0d0");
    petEye(ctx, hx + s * 0.09, hy - s * 0.03, s * 0.055, t, eyeMood(o), 54);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.09, hy - s * 0.03, s * 0.055, s);
    }
    fillEllipse(ctx, hx + s * 0.17, hy + s * 0.04, s * 0.025, s * 0.018, "#ff7aa8");
    petMouth(ctx, hx + s * 0.12, hy + s * 0.09, s * 0.06, s, o.mood);
    // Вуса
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(0.8, s * 0.012);
    ctx.beginPath();
    ctx.moveTo(hx + s * 0.16, hy + s * 0.06);
    ctx.lineTo(hx + s * 0.3, hy + s * 0.03);
    ctx.moveTo(hx + s * 0.16, hy + s * 0.08);
    ctx.lineTo(hx + s * 0.3, hy + s * 0.09);
    ctx.stroke();
    // Лазерний промінь уперед — у серії й радості
    if ((o.mood === "combo" || o.mood === "happy") && t) {
        ctx.save();
        ctx.globalAlpha = 0.8 * pulse;
        ctx.strokeStyle = "#ff2a3a";
        ctx.lineWidth = Math.max(1.5, s * 0.03);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + s * 0.8, ly + s * 0.05);
        ctx.stroke();
        ctx.strokeStyle = "#ffe0e0";
        ctx.lineWidth = Math.max(0.8, s * 0.012);
        ctx.stroke();
        ctx.restore();
    }
}

export const PET_RENDERERS_6 = {
    pet_bombardino: drawBombardino,
    pet_traktorino: drawTraktorino,
    pet_goldoni: drawGoldoni,
    pet_shaurmino: drawShaurmino,
    pet_borgini: drawBorgini
};
