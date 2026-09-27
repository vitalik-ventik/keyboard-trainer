// ============================================================
// pet_renderers_10.js — малювальники улюбленців, частина 10: секретні улюбленці світів —
// Лицар Беконіно, Пінгвіно Сноубордіно, Медузоні Тріоко, Кактусоні Мачете,
// Острівоні Черепахоні, Чорнодіро Вакуумоні, Ангело Гусоні, Демоніно Лавіні
// та ультра-секретний Мега Брейнроті Фьюжн (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillPoly, fillRoundRect, petEye, petLeg, petLimb, petLine, petMouth, petSneaker, runPhase, sneakerLegs } from "./pet_parts.js";

// ---------- Лицар Беконіно: смужка бекону в обладунках (Лицарський замок) ----------

function drawBekonino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    // Ноги в залізних чоботях
    for (let i = 0; i < 2; i++) {
        const phase = ph ? ph + i * Math.PI : 0;
        const swing = phase ? Math.sin(phase) * s * 0.06 : 0;
        const lift = phase ? Math.max(0, Math.cos(phase)) * s * 0.05 : 0;
        const lx = -s * 0.08 + i * s * 0.16;
        petLimb(ctx, lx, s * 0.26, lx + swing, s * 0.42 - lift, s * 0.05, "#b35a4a", s);
        fillRoundRect(ctx, lx + swing - s * 0.05, s * 0.4 - lift, s * 0.13, s * 0.1, s * 0.03, "#9aa3b8", s * 0.7);
    }
    // Хвиляста смужка бекону: червоні й білі шари
    const wav = function (x, i) {
        return Math.sin(x / s * 12 + (t ? t * 0.006 : 0) + i) * s * 0.025;
    };
    ctx.save();
    const left = -s * 0.16;
    const right = s * 0.16;
    const top = -s * 0.44 + b;
    const bottom = s * 0.3 + b;
    ctx.beginPath();
    for (let y = top; y <= bottom; y += s * 0.04) {
        ctx.lineTo(left + wav(y, 0), y);
    }
    for (let y = bottom; y >= top; y -= s * 0.04) {
        ctx.lineTo(right + wav(y, 0), y);
    }
    ctx.closePath();
    ctx.fillStyle = "#d8483a";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = "#ffd8c8";
    for (let k = 0; k < 2; k++) {
        const cx = -s * 0.06 + k * s * 0.12;
        ctx.beginPath();
        for (let y = top; y <= bottom; y += s * 0.04) {
            ctx.lineTo(cx - s * 0.02 + wav(y, 1), y);
        }
        for (let y = bottom; y >= top; y -= s * 0.04) {
            ctx.lineTo(cx + s * 0.02 + wav(y, 1), y);
        }
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    // Нагрудник
    fillRoundRect(ctx, -s * 0.18, -s * 0.04 + b, s * 0.36, s * 0.22, s * 0.06, "#c8d0dc", s);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.015, -s * 0.02 + b, s * 0.03, s * 0.18);
    ctx.fillRect(-s * 0.08, s * 0.04 + b, s * 0.16, s * 0.03);
    // Шолом із забралом і пером
    const hy = -s * 0.36 + b;
    fillRoundRect(ctx, -s * 0.18, hy - s * 0.1, s * 0.36, s * 0.24, s * 0.1, "#b8c2d2", s);
    const visorUp = o.mood === "happy" || o.mood === "sad";
    if (visorUp) {
        fillRoundRect(ctx, -s * 0.12, hy - s * 0.02, s * 0.26, s * 0.12, s * 0.03, "#d8483a");
        petEye(ctx, -s * 0.02, hy + s * 0.04, s * 0.04, t, eyeMood(o), 91);
        petEye(ctx, s * 0.09, hy + s * 0.04, s * 0.04, t, eyeMood(o), 91);
        fillRoundRect(ctx, -s * 0.16, hy - s * 0.12, s * 0.32, s * 0.08, s * 0.03, "#9aa3b8", s * 0.6);
    } else {
        ctx.fillStyle = "#1f2230";
        ctx.fillRect(-s * 0.12, hy + s * 0.02, s * 0.26, s * 0.03);
        ctx.fillRect(-s * 0.1, hy + s * 0.07, s * 0.22, s * 0.02);
    }
    const plume = t ? Math.sin(t * 0.008) * 0.2 : 0;
    ctx.save();
    ctx.translate(-s * 0.02, hy - s * 0.1);
    ctx.rotate(-0.6 + plume);
    fillEllipse(ctx, -s * 0.12, 0, s * 0.13, s * 0.05, "#e0202a", s * 0.6);
    ctx.restore();
    // Щит і меч
    fillPoly(ctx, [[-s * 0.3, -s * 0.06 + b], [-s * 0.14, -s * 0.06 + b], [-s * 0.14, s * 0.1 + b], [-s * 0.22, s * 0.2 + b], [-s * 0.3, s * 0.1 + b]], "#2b4aa0", s);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.235, -s * 0.03 + b, s * 0.03, s * 0.17);
    const slash = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) * 1.4 : (t ? Math.sin(t * 0.006) * 0.15 : 0);
    ctx.save();
    ctx.translate(s * 0.22, s * 0.06 + b);
    ctx.rotate(-0.3 + slash);
    fillRoundRect(ctx, -s * 0.02, -s * 0.44, s * 0.04, s * 0.38, s * 0.01, "#eef2fa", s * 0.6);
    fillRoundRect(ctx, -s * 0.07, -s * 0.07, s * 0.14, s * 0.03, s * 0.01, "#ffcc33", s * 0.5);
    fillRoundRect(ctx, -s * 0.02, -s * 0.04, s * 0.04, s * 0.08, s * 0.01, "#6a3c14", s * 0.5);
    ctx.restore();
}

// ---------- Пінгвіно Сноубордіно: пінгвін на сноуборді (Сніжні гори) ----------

function drawPingvinoSnow(ctx, s, t, o) {
    const b = breathe(t, s);
    // На стрибках радості — трюк: дошка з пінгвіном нахиляється
    const trick = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) : 0;
    ctx.save();
    ctx.translate(0, s * 0.44);
    ctx.rotate(-trick * 0.5);
    ctx.translate(0, -s * 0.44);
    // Сніг летить з-під дошки
    if (o.moving && t) {
        ctx.fillStyle = "#eaf6ff";
        for (let i = 0; i < 5; i++) {
            const k = ((t * 0.003 + i / 5) % 1);
            ctx.globalAlpha = 1 - k;
            fillEllipse(ctx, -s * (0.36 + k * 0.2), s * (0.42 - k * 0.14 + (i % 2) * 0.05), s * 0.03, s * 0.03, "#eaf6ff");
        }
        ctx.globalAlpha = 1;
    }
    // Сноуборд
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.42);
    ctx.quadraticCurveTo(-s * 0.46, s * 0.38, -s * 0.42, s * 0.36);
    ctx.lineTo(s * 0.42, s * 0.36);
    ctx.quadraticCurveTo(s * 0.48, s * 0.38, s * 0.42, s * 0.44);
    ctx.lineTo(-s * 0.36, s * 0.46);
    ctx.closePath();
    ctx.fillStyle = "#ff4a5a";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.7;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(-s * 0.1, s * 0.385, s * 0.2, s * 0.025);
    // Лапки на дошці
    fillEllipse(ctx, -s * 0.1, s * 0.33, s * 0.07, s * 0.035, "#ff9a1a", s * 0.6);
    fillEllipse(ctx, s * 0.1, s * 0.33, s * 0.07, s * 0.035, "#ff9a1a", s * 0.6);
    // Тіло пінгвіна в помаранчевому худі
    fillEllipse(ctx, 0, s * 0.04 + b, s * 0.22, s * 0.3, "#1f2230", s);
    fillEllipse(ctx, s * 0.04, s * 0.08 + b, s * 0.14, s * 0.22, "#f4f7fb");
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, s * 0.04 + b, s * 0.215, s * 0.295, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ff8a1a";
    ctx.fillRect(-s * 0.3, s * 0.02 + b, s * 0.6, s * 0.3);
    ctx.fillStyle = "#e06a0a";
    ctx.fillRect(-s * 0.1, s * 0.14 + b, s * 0.2, s * 0.06);
    ctx.restore();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.04 + b, s * 0.22, s * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Крильця розставлені для рівноваги
    const bal = t ? Math.sin(t * 0.006) * 0.3 : 0;
    fillEllipse(ctx, -s * 0.24, s * 0.02 + b, s * 0.12, s * 0.045, "#ff8a1a", s * 0.8, -0.4 + bal);
    fillEllipse(ctx, s * 0.24, s * 0.02 + b, s * 0.12, s * 0.045, "#ff8a1a", s * 0.8, 0.4 + bal);
    // Дзьоб і гірськолижна маска
    fillPoly(ctx, [[s * 0.1, -s * 0.12 + b], [s * 0.24, -s * 0.08 + b], [s * 0.1, -s * 0.05 + b]], "#ff9a1a", s * 0.6);
    const gy = -s * 0.18 + b;
    ctx.fillStyle = "#1f2230";
    ctx.fillRect(-s * 0.2, gy - s * 0.015, s * 0.4, s * 0.03);
    if (coolMood(o)) {
        fillRoundRect(ctx, -s * 0.06, gy - s * 0.05, s * 0.22, s * 0.09, s * 0.04, "#39c6ff", s * 0.6);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(-s * 0.02, gy - s * 0.03, s * 0.05, s * 0.015);
    } else {
        petEye(ctx, s * 0.0, gy, s * 0.04, t, eyeMood(o), 92);
        petEye(ctx, s * 0.1, gy, s * 0.04, t, eyeMood(o), 92);
        fillRoundRect(ctx, -s * 0.06, gy - s * 0.12, s * 0.22, s * 0.06, s * 0.03, "#39c6ff", s * 0.5);
    }
    ctx.restore();
}

// ---------- Медузоні Тріоко: трьоока світна медуза (Інопланетний океан) ----------

function drawMeduzoni(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const pulse = t ? Math.sin(t * 0.006) : 0;
    const glow = "#39f6ff";
    // Щупальця хвилями
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
        const x = -s * 0.2 + i * s * 0.1;
        const w = t ? Math.sin(t * 0.008 + i * 0.9) * s * 0.05 : 0;
        ctx.strokeStyle = i % 2 === 0 ? "#b58cff" : glow;
        ctx.lineWidth = Math.max(1.2, s * 0.03);
        ctx.beginPath();
        ctx.moveTo(x, s * 0.06 + b);
        ctx.bezierCurveTo(x + w, s * 0.18 + b, x - w, s * 0.3 + b, x + w * 0.5, s * 0.44 + b);
        ctx.stroke();
    }
    // Сяйво
    ctx.save();
    ctx.globalAlpha = 0.25 + pulse * 0.1;
    fillEllipse(ctx, 0, -s * 0.08 + b, s * 0.4, s * 0.32, glow);
    ctx.restore();
    // Купол, що пульсує
    const kx = 1 + pulse * 0.04;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3 * kx, s * 0.06 + b);
    ctx.bezierCurveTo(-s * 0.32 * kx, -s * 0.4 + b, s * 0.32 * kx, -s * 0.4 + b, s * 0.3 * kx, s * 0.06 + b);
    for (let i = 0; i < 6; i++) {
        const x1 = s * 0.3 * kx - (i + 0.5) * s * 0.1 * kx;
        ctx.quadraticCurveTo(x1, s * 0.12 + b, s * 0.3 * kx - (i + 1) * s * 0.1 * kx, s * 0.06 + b);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(120, 90, 255, 0.85)";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, -s * 0.1, -s * 0.2 + b, s * 0.08, s * 0.04, "rgba(255, 255, 255, 0.5)");
    // Три ока: середнє більше
    petEye(ctx, -s * 0.1, -s * 0.06 + b, s * 0.05, t, eyeMood(o), 93);
    petEye(ctx, s * 0.04, -s * 0.14 + b, s * 0.065, t, eyeMood(o), 94);
    petEye(ctx, s * 0.16, -s * 0.05 + b, s * 0.05, t, eyeMood(o), 95);
    petMouth(ctx, s * 0.04, s * 0.02 + b, s * 0.06, s, o.mood);
}

// ---------- Кактусоні Мачете: кактус в окулярах із мачете (Пустеля) ----------

function drawKaktusoni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const green = "#3fa84a";
    sneakerLegs(ctx, s, [-s * 0.08, s * 0.1], s * 0.28, "#2f7a36", "#ff9a1a", ph);
    // Мачете за спиною
    ctx.save();
    ctx.translate(-s * 0.12, -s * 0.1 + b);
    ctx.rotate(-0.5);
    fillPoly(ctx, [[-s * 0.03, -s * 0.36], [s * 0.05, -s * 0.34], [s * 0.04, 0], [-s * 0.02, 0]], "#dfe6f0", s * 0.6);
    fillRoundRect(ctx, -s * 0.03, 0, s * 0.07, s * 0.12, s * 0.02, "#6a3c14", s * 0.6);
    ctx.restore();
    // Руки-відростки: у радості обидві вгору
    const up = o.mood === "happy" ? 1 : 0;
    const armL = function () {
        fillRoundRect(ctx, -s * 0.34, -s * 0.02 + b, s * 0.2, s * 0.09, s * 0.045, green, s);
        fillRoundRect(ctx, -s * 0.34, -s * (0.22 + up * 0.08) + b, s * 0.09, s * (0.28 + up * 0.08), s * 0.045, green, s);
    };
    const armR = function () {
        fillRoundRect(ctx, s * 0.14, s * 0.04 + b, s * 0.2, s * 0.09, s * 0.045, green, s);
        fillRoundRect(ctx, s * 0.25, -s * (0.12 + up * 0.14) + b, s * 0.09, s * (0.26 + up * 0.14), s * 0.045, green, s);
    };
    armL();
    armR();
    // Стовбур
    fillRoundRect(ctx, -s * 0.16, -s * 0.44 + b, s * 0.32, s * 0.76, s * 0.16, green, s);
    ctx.strokeStyle = "#2f7a36";
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, -s * 0.38 + b);
    ctx.lineTo(-s * 0.06, s * 0.28 + b);
    ctx.moveTo(s * 0.06, -s * 0.38 + b);
    ctx.lineTo(s * 0.06, s * 0.28 + b);
    ctx.stroke();
    // Колючки
    ctx.strokeStyle = "#fff6c8";
    ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const y = -s * 0.3 + i * s * 0.12 + b;
        ctx.moveTo(-s * 0.16, y);
        ctx.lineTo(-s * 0.21, y - s * 0.02);
        ctx.moveTo(s * 0.16, y + s * 0.05);
        ctx.lineTo(s * 0.21, y + s * 0.03);
    }
    ctx.stroke();
    // Квітка на маківці
    for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 + (t ? t * 0.001 : 0);
        fillEllipse(ctx, Math.cos(a) * s * 0.05, -s * 0.46 + b + Math.sin(a) * s * 0.05, s * 0.04, s * 0.04, "#ff7ab8", s * 0.4);
    }
    fillEllipse(ctx, 0, -s * 0.46 + b, s * 0.03, s * 0.03, "#ffe14d");
    // Окуляри-авіатори й усмішка
    const gy = -s * 0.2 + b;
    if (coolMood(o)) {
        ctx.fillStyle = PET_OUTLINE;
        ctx.fillRect(-s * 0.12, gy - s * 0.025, s * 0.28, s * 0.02);
        fillEllipse(ctx, -s * 0.03, gy, s * 0.06, s * 0.045, "#2a1a10", s * 0.5);
        fillEllipse(ctx, s * 0.1, gy, s * 0.06, s * 0.045, "#2a1a10", s * 0.5);
        ctx.fillStyle = "rgba(255, 190, 90, 0.6)";
        ctx.fillRect(-s * 0.06, gy - s * 0.02, s * 0.03, s * 0.012);
        ctx.fillRect(s * 0.07, gy - s * 0.02, s * 0.03, s * 0.012);
    } else {
        petEye(ctx, -s * 0.03, gy, s * 0.05, t, eyeMood(o), 96);
        petEye(ctx, s * 0.1, gy, s * 0.05, t, eyeMood(o), 96);
    }
    petMouth(ctx, s * 0.04, -s * 0.06 + b, s * 0.07, s, o.mood);
}

// ---------- Острівоні Черепахоні: черепаха з летючим островом на панцирі (Парящі острови) ----------

function drawOstrivoni(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const flap = t ? Math.sin(t * 0.012) * 0.4 : 0.2;
    const skin = "#7ed957";
    // Ласти-крила
    fillEllipse(ctx, -s * 0.18, s * 0.14 + b, s * 0.14, s * 0.05, skin, s, 0.5 + flap);
    fillEllipse(ctx, s * 0.12, s * 0.16 + b, s * 0.14, s * 0.05, skin, s, -0.5 - flap);
    // Голова
    fillEllipse(ctx, s * 0.32, s * 0.06 + b, s * 0.1, s * 0.08, skin, s);
    petEye(ctx, s * 0.34, s * 0.04 + b, s * 0.04, t, eyeMood(o), 97);
    petMouth(ctx, s * 0.37, s * 0.1 + b, s * 0.04, s, o.mood);
    // Панцир-основа острова: земля знизу
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.06 + b);
    ctx.lineTo(s * 0.26, s * 0.06 + b);
    ctx.lineTo(s * 0.14, s * 0.2 + b);
    ctx.lineTo(s * 0.02, s * 0.3 + b);
    ctx.lineTo(-s * 0.12, s * 0.22 + b);
    ctx.closePath();
    ctx.fillStyle = "#8a5a2a";
    ctx.fill();
    ctx.lineWidth = petLine(s);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    // Панцир
    ctx.beginPath();
    ctx.ellipse(-s * 0.02, s * 0.06 + b, s * 0.3, s * 0.14, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#4f9a3a";
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#3a7a2a";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, s * 0.06 + b);
    ctx.lineTo(-s * 0.1, -s * 0.06 + b);
    ctx.moveTo(s * 0.1, s * 0.06 + b);
    ctx.lineTo(s * 0.06, -s * 0.06 + b);
    ctx.stroke();
    // Трава, пальма й водоспад на панцирі
    fillEllipse(ctx, -s * 0.02, -s * 0.08 + b, s * 0.22, s * 0.04, "#6fd05a", s * 0.6);
    petLimb(ctx, -s * 0.08, -s * 0.08 + b, -s * 0.04, -s * 0.36 + b, s * 0.03, "#a0602a", s * 0.5);
    const sway = t ? Math.sin(t * 0.004) * 0.15 : 0;
    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(-s * 0.04, -s * 0.36 + b);
        ctx.rotate(i * Math.PI / 2 + Math.PI / 4 + sway);
        fillEllipse(ctx, s * 0.08, 0, s * 0.09, s * 0.03, "#3fbf4f", s * 0.4);
        ctx.restore();
    }
    fillEllipse(ctx, -s * 0.02, -s * 0.34 + b, s * 0.02, s * 0.02, "#8a5a2a");
    // Водоспад стікає з краю
    const flow = t ? (t * 0.004) % 1 : 0.5;
    ctx.fillStyle = "#8fd8ff";
    ctx.fillRect(s * 0.16, -s * 0.06 + b, s * 0.04, s * 0.24);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(s * 0.17, -s * 0.06 + b + flow * s * 0.2, s * 0.02, s * 0.04);
    // Хмаринка під островом
    ctx.save();
    ctx.globalAlpha = 0.7;
    fillEllipse(ctx, -s * 0.02, s * 0.32 + b, s * 0.16, s * 0.05, "#ffffff");
    ctx.restore();
}

// ---------- Чорнодіро Вакуумоні: чорна діра з очима (Чорна діра) ----------

function drawChornodiro(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const spin = t ? t * 0.003 : 0;
    // Іскри, що закручуються всередину
    if (t) {
        for (let i = 0; i < 6; i++) {
            const k = ((t * 0.0008 + i / 6) % 1);
            const a = i * 1.1 + k * 4;
            const r = s * 0.46 * (1 - k);
            ctx.save();
            ctx.globalAlpha = k;
            fillEllipse(ctx, Math.cos(a) * r, Math.sin(a) * r * 0.5 + b, s * 0.02, s * 0.02, i % 2 === 0 ? "#ffe14d" : "#d68bff");
            ctx.restore();
        }
    }
    // Задня половина акреційного диска
    const ring = function (from, to) {
        ctx.save();
        ctx.translate(0, b);
        ctx.rotate(-0.25);
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = ["#ff9a1a", "#ff4a7a", "#d68bff"][i];
            ctx.lineWidth = Math.max(1.2, s * (0.05 - i * 0.012));
            ctx.setLineDash([s * 0.12, s * 0.05]);
            ctx.lineDashOffset = -spin * s * (0.3 + i * 0.1);
            ctx.beginPath();
            ctx.ellipse(0, 0, s * (0.44 - i * 0.05), s * (0.12 - i * 0.015), 0, from, to);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
    };
    ring(Math.PI, Math.PI * 2);
    // Сфера-діра з фіолетовим світінням
    ctx.save();
    const g = ctx.createRadialGradient(0, b, s * 0.1, 0, b, s * 0.3);
    g.addColorStop(0, "rgba(160, 80, 255, 0)");
    g.addColorStop(1, "rgba(160, 80, 255, 0.5)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, b, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    fillEllipse(ctx, 0, b, s * 0.22, s * 0.22, "#05060d", s);
    // Очі-вогники
    const ey = -s * 0.03 + b;
    const eyeColor = o.mood === "sad" ? "#7a8aa0" : "#ffffff";
    if (o.mood === "happy") {
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = Math.max(1.2, s * 0.03);
        ctx.beginPath();
        ctx.arc(-s * 0.06, ey + s * 0.02, s * 0.035, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(s * 0.115, ey + s * 0.02);
        ctx.arc(s * 0.08, ey + s * 0.02, s * 0.035, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else {
        fillEllipse(ctx, -s * 0.06, ey, s * 0.04, s * 0.05, eyeColor);
        fillEllipse(ctx, s * 0.08, ey, s * 0.04, s * 0.05, eyeColor);
        fillEllipse(ctx, -s * 0.05, ey + s * 0.01, s * 0.02, s * 0.025, "#6a2aff");
        fillEllipse(ctx, s * 0.09, ey + s * 0.01, s * 0.02, s * 0.025, "#6a2aff");
    }
    // Рот-«пилосос»: кругле «О», що всмоктує
    const suck = t ? 0.7 + Math.abs(Math.sin(t * 0.008)) * 0.3 : 1;
    fillEllipse(ctx, s * 0.01, s * 0.1 + b, s * 0.035 * suck, s * 0.03 * suck, "#2a1a4a", s * 0.3);
    // Передня половина диска
    ring(0, Math.PI);
}

// ---------- Ангело Гусоні: гусак із німбом, що сердито гелгоче (Небесна цитадель) ----------

function drawAngeloGusoni(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const flap = t ? Math.sin(t * (o.mood === "happy" ? 0.04 : 0.02)) * 0.4 : 0.2;
    // Крила
    const wing = function (x, rot) {
        ctx.save();
        ctx.translate(x, -s * 0.02 + b);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.3, -s * 0.36, -s * 0.18);
        ctx.quadraticCurveTo(-s * 0.26, -s * 0.12, -s * 0.3, -s * 0.06);
        ctx.quadraticCurveTo(-s * 0.18, -s * 0.06, -s * 0.2, s * 0.02);
        ctx.quadraticCurveTo(-s * 0.1, 0, 0, 0);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = petLine(s) * 0.8;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.restore();
    };
    wing(-s * 0.02, -flap);
    // Лапки звисають
    petLimb(ctx, -s * 0.06, s * 0.16 + b, -s * 0.08, s * 0.3 + b, s * 0.03, "#ff9a1a", s * 0.6);
    petLimb(ctx, s * 0.06, s * 0.16 + b, s * 0.06, s * 0.3 + b, s * 0.03, "#ff9a1a", s * 0.6);
    // Тіло
    fillEllipse(ctx, -s * 0.04, s * 0.06 + b, s * 0.26, s * 0.14, "#f4f4f0", s);
    fillPoly(ctx, [[-s * 0.26, s * 0.02 + b], [-s * 0.4, -s * 0.04 + b], [-s * 0.3, s * 0.1 + b]], "#f4f4f0", s * 0.8);
    // Довга шия й голова
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.14, s * 0.02 + b);
    ctx.quadraticCurveTo(s * 0.24, -s * 0.1 + b, s * 0.2, -s * 0.24 + b);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.11;
    ctx.stroke();
    ctx.strokeStyle = "#f4f4f0";
    ctx.lineWidth = s * 0.11 - petLine(s) * 1.6;
    ctx.stroke();
    const hx = s * 0.22;
    const hy = -s * 0.28 + b;
    fillEllipse(ctx, hx, hy, s * 0.1, s * 0.09, "#f4f4f0", s);
    // Дзьоб: гелгоче «ГА!» (відкривається)
    const honk = t ? Math.abs(Math.sin(t * (o.mood === "happy" ? 0.02 : 0.006))) : 0.3;
    fillPoly(ctx, [[hx + s * 0.07, hy - s * 0.01], [hx + s * 0.22, hy + s * 0.0], [hx + s * 0.08, hy + s * 0.03]], "#ff9a1a", s * 0.6);
    fillPoly(ctx, [[hx + s * 0.07, hy + s * 0.03], [hx + s * 0.2, hy + s * 0.03 + honk * s * 0.06], [hx + s * 0.07, hy + s * 0.06]], "#ff9a1a", s * 0.6);
    petEye(ctx, hx + s * 0.02, hy - s * 0.02, s * 0.04, t, eyeMood(o), 98);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.02, hy - s * 0.02, s * 0.04, s);
    }
    if (honk > 0.85 && o.mood !== "sad") {
        ctx.fillStyle = "#ffe14d";
        ctx.font = "bold " + Math.max(6, s * 0.12) + "px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ГА!", hx + s * 0.3, hy - s * 0.1);
    }
    // Ближнє крило
    wing(s * 0.02, -flap - 0.2);
    // Німб
    ctx.save();
    ctx.shadowColor = "#ffe14d";
    ctx.shadowBlur = s * 0.1;
    ctx.strokeStyle = "#ffe14d";
    ctx.lineWidth = Math.max(1.4, s * 0.03);
    ctx.beginPath();
    ctx.ellipse(hx - s * 0.02, hy - s * 0.15 + (t ? Math.sin(t * 0.004) * s * 0.01 : 0), s * 0.09, s * 0.025, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

// ---------- Демоніно Лавіні: лавовий голем із рогами (Вогняний світ) ----------

function drawDemonino(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const rock = "#3a2a2a";
    const lava = "#ff6a1a";
    // Вогняні сліди позаду
    if (o.moving && t) {
        for (let i = 0; i < 3; i++) {
            const k = ((t * 0.0015 + i / 3) % 1);
            ctx.save();
            ctx.globalAlpha = 1 - k;
            fillPoly(ctx, [[-s * (0.3 + k * 0.4) - s * 0.04, s * 0.5], [-s * (0.3 + k * 0.4), s * (0.5 - 0.12 * (1 - k))], [-s * (0.3 + k * 0.4) + s * 0.04, s * 0.5]], i % 2 === 0 ? "#ff9a1a" : "#ffe14d");
            ctx.restore();
        }
    }
    // Товсті кам'яні ноги
    petLeg(ctx, -s * 0.14, s * 0.2, s * 0.14, s * 0.3, ph + Math.PI, "#2a1c1c", s);
    petLeg(ctx, s * 0.12, s * 0.2, s * 0.14, s * 0.3, ph, rock, s);
    // Масивне тіло з лавовими тріщинами, що світяться
    fillRoundRect(ctx, -s * 0.3, -s * 0.3 + b, s * 0.6, s * 0.56, s * 0.14, rock, s);
    const pulse = t ? 0.6 + Math.abs(Math.sin(t * 0.005)) * 0.4 : 1;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = lava;
    ctx.lineWidth = Math.max(1.2, s * 0.025);
    ctx.lineJoin = "round";
    ctx.shadowColor = lava;
    ctx.shadowBlur = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.2 + b);
    ctx.lineTo(-s * 0.12, -s * 0.08 + b);
    ctx.lineTo(-s * 0.18, s * 0.06 + b);
    ctx.lineTo(-s * 0.06, s * 0.2 + b);
    ctx.moveTo(s * 0.2, s * 0.18 + b);
    ctx.lineTo(s * 0.12, s * 0.08 + b);
    ctx.lineTo(s * 0.22, -s * 0.02 + b);
    ctx.stroke();
    ctx.restore();
    // Роги й вогонь на маківці
    fillPoly(ctx, [[-s * 0.22, -s * 0.24 + b], [-s * 0.34, -s * 0.46 + b], [-s * 0.12, -s * 0.3 + b]], "#e8e0d0", s * 0.7);
    fillPoly(ctx, [[s * 0.12, -s * 0.3 + b], [s * 0.34, -s * 0.46 + b], [s * 0.22, -s * 0.24 + b]], "#e8e0d0", s * 0.7);
    const flick = t ? Math.sin(t * 0.03) * s * 0.03 : 0;
    fillPoly(ctx, [[-s * 0.1, -s * 0.3 + b], [-s * 0.06 + flick, -s * 0.46 + b], [0, -s * 0.36 + b], [s * 0.04 - flick, -s * 0.5 + b], [s * 0.1, -s * 0.3 + b]], "#ff9a1a");
    fillPoly(ctx, [[-s * 0.05, -s * 0.3 + b], [s * 0.0 + flick, -s * 0.4 + b], [s * 0.05, -s * 0.3 + b]], "#ffe14d");
    // Очі-жаринки й зубастий рот
    const ey = -s * 0.12 + b;
    const eyeColor = o.mood === "sad" ? "#7a5a4a" : "#ffe14d";
    if (o.mood === "happy") {
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = Math.max(1.2, s * 0.03);
        ctx.beginPath();
        ctx.arc(-s * 0.04, ey + s * 0.02, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(s * 0.16, ey + s * 0.02);
        ctx.arc(s * 0.12, ey + s * 0.02, s * 0.04, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else {
        fillPoly(ctx, [[-s * 0.1, ey - s * 0.03], [s * 0.02, ey], [-s * 0.08, ey + s * 0.03]], eyeColor);
        fillPoly(ctx, [[s * 0.18, ey - s * 0.03], [s * 0.06, ey], [s * 0.16, ey + s * 0.03]], eyeColor);
    }
    fillRoundRect(ctx, -s * 0.1, s * 0.02 + b, s * 0.26, s * 0.08, s * 0.03, "#ff4a1a", s * 0.6);
    ctx.fillStyle = "#fff2d0";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.08 + i * s * 0.06, s * 0.02 + b);
        ctx.lineTo(-s * 0.06 + i * s * 0.06, s * 0.06 + b);
        ctx.lineTo(-s * 0.04 + i * s * 0.06, s * 0.02 + b);
        ctx.fill();
    }
    // Кулаки
    const punch = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) * s * 0.12 : 0;
    fillEllipse(ctx, -s * 0.34, s * 0.12 + b, s * 0.09, s * 0.09, rock, s);
    fillEllipse(ctx, s * 0.34 + punch, s * 0.08 + b, s * 0.09, s * 0.09, rock, s);
    ctx.save();
    ctx.globalAlpha = pulse * 0.8;
    fillEllipse(ctx, s * 0.36 + punch, s * 0.06 + b, s * 0.03, s * 0.03, lava);
    ctx.restore();
}

// ---------- Мега Брейнроті Фьюжн: гібрид усіх брейнротів (нагорода за всіх секретних) ----------

function drawFusion(ctx, s, t, o) {
    const b = breathe(t, s) * 2;
    const hue = t ? (t * 0.15) % 360 : 200;
    // Райдужний слід з іскор позаду
    if (t) {
        for (let i = 0; i < 6; i++) {
            const k = ((t * 0.0015 + i / 6) % 1);
            ctx.save();
            ctx.globalAlpha = 1 - k;
            fillEllipse(ctx, -s * (0.44 + k * 0.3), -s * 0.02 + b + Math.sin(k * 8 + i) * s * 0.06, s * 0.03 * (1 - k * 0.5), s * 0.03 * (1 - k * 0.5), "hsl(" + Math.round((hue + i * 60) % 360) + ", 95%, 62%)");
            ctx.restore();
        }
    }
    // Дальнє крило бомбардувальника
    fillPoly(ctx, [[-s * 0.08, -s * 0.06 + b], [-s * 0.28, -s * 0.28 + b], [-s * 0.14, -s * 0.28 + b], [s * 0.08, -s * 0.06 + b]], "#8a96a8", s);
    // Три лапи в кросівках теліпаються
    const ph = t ? t * 0.02 : 0;
    for (let i = 0; i < 3; i++) {
        const lx = -s * 0.16 + i * s * 0.14;
        const swing = Math.sin(ph + i * 2.1) * s * 0.04;
        petLimb(ctx, lx, s * 0.1 + b, lx + swing, s * 0.26 + b, s * 0.045, "#4f9a3a", s);
        petSneaker(ctx, lx + swing, s * 0.36 + b, s * 0.14, "hsl(" + Math.round((hue + i * 120) % 360) + ", 90%, 55%)", s, 0);
    }
    // Хвостовий плавець акули
    ctx.save();
    ctx.translate(-s * 0.36, b);
    ctx.rotate(t ? Math.sin(t * 0.014) * 0.25 : 0);
    fillPoly(ctx, [[0, 0], [-s * 0.16, -s * 0.18], [-s * 0.1, 0], [-s * 0.16, s * 0.12]], "#6c8fb0", s);
    ctx.restore();
    // Тіло: акула з крокодилячою спиною й райдужною смугою
    fillEllipse(ctx, 0, b, s * 0.4, s * 0.17, "#6c8fb0", s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, b, s * 0.39, s * 0.16, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#4f9a3a";
    ctx.fillRect(-s * 0.42, -s * 0.2 + b, s * 0.84, s * 0.1);
    ctx.fillStyle = "#2f6a24";
    for (let i = 0; i < 6; i++) {
        fillEllipse(ctx, -s * 0.3 + i * s * 0.1, -s * 0.12 + b, s * 0.03, s * 0.02, "#2f6a24");
    }
    const grad = ctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0);
    for (let i = 0; i <= 6; i++) {
        grad.addColorStop(i / 6, "hsl(" + Math.round((hue + i * 60) % 360) + ", 95%, 60%)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(-s * 0.42, -s * 0.05 + b, s * 0.84, s * 0.035);
    ctx.restore();
    fillEllipse(ctx, s * 0.06, s * 0.08 + b, s * 0.3, s * 0.07, "#eef4fb");
    // Зубаста усмішка
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(s * 0.14, s * 0.04 + b);
    ctx.quadraticCurveTo(s * 0.28, s * 0.13 + b, s * 0.4, s * 0.02 + b);
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
    // Око з сердитою бровою
    petEye(ctx, s * 0.24, -s * 0.05 + b, s * 0.065, t, eyeMood(o), 99);
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.24, -s * 0.05 + b, s * 0.065, s);
    }
    // Золотий ланцюг
    for (let i = 0; i < 5; i++) {
        const a = Math.PI * (0.2 + i * 0.15);
        fillEllipse(ctx, s * 0.06 + Math.cos(a) * s * 0.1, s * 0.02 + b + Math.sin(a) * s * 0.1, s * 0.03, s * 0.022, "#ffcc33", s * 0.4);
    }
    // Ближнє крило з двигуном і пропелером
    fillPoly(ctx, [[-s * 0.12, s * 0.0 + b], [-s * 0.32, s * 0.18 + b], [-s * 0.16, s * 0.18 + b], [s * 0.08, s * 0.02 + b]], "#a8b4c4", s);
    fillRoundRect(ctx, -s * 0.12, s * 0.07 + b, s * 0.14, s * 0.07, s * 0.035, "#5a6478", s * 0.8);
    const k = t ? Math.abs(Math.sin(t * 0.08)) : 0.8;
    ctx.save();
    ctx.globalAlpha = 0.55;
    fillEllipse(ctx, s * 0.03, s * 0.105 + b, s * 0.02, s * (0.04 + k * 0.08), "#dfe6f0");
    ctx.restore();
    // Корона короля брейнротів
    const cy = -s * 0.2 + b;
    fillPoly(ctx, [[-s * 0.02, cy], [-s * 0.02, cy - s * 0.12], [s * 0.04, cy - s * 0.06], [s * 0.1, cy - s * 0.15], [s * 0.16, cy - s * 0.06], [s * 0.22, cy - s * 0.12], [s * 0.22, cy]], "#ffcc33", s * 0.8);
    fillEllipse(ctx, s * 0.1, cy - s * 0.04, s * 0.025, s * 0.025, "hsl(" + Math.round(hue) + ", 95%, 60%)");
}

export const PET_RENDERERS_10 = {
    pet_bekonino: drawBekonino,
    pet_pingvino_snow: drawPingvinoSnow,
    pet_meduzoni: drawMeduzoni,
    pet_kaktusoni: drawKaktusoni,
    pet_ostrivoni: drawOstrivoni,
    pet_chornodiro: drawChornodiro,
    pet_angelo_gusoni: drawAngeloGusoni,
    pet_demonino: drawDemonino,
    pet_fusion: drawFusion
};
