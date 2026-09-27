// ============================================================
// pet_renderers_8.js — малювальники улюбленців, частина 8: секретні улюбленці світів —
// Тірекс Мікроні, Скелетоні Скейтоні, Агент Хом'яконі, Клоуно Страшиліно,
// Робоакуло Заводоні, Двоголово Інопланетоні, Дирижаблоні Китоні
// (збираються в PET_RENDERERS у pet_renderers.js)
// ============================================================

import { PET_OUTLINE, angryBrow, breathe, coolMood, eyeMood, fillEllipse, fillPoly, fillRoundRect, petEye, petLeg, petLimb, petLine, petMouth, runPhase, sneakerLegs } from "./pet_parts.js";

// ---------- Тірекс Мікроні: крихітний тиранозавр із величезною головою (Долина динозаврів) ----------

function drawTirex(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const green = "#5aa83a";
    const dark = "#3f7f26";
    // Хвіст
    fillPoly(ctx, [[-s * 0.1, s * 0.0 + b], [-s * 0.46, s * 0.14 + b + (t ? Math.sin(t * 0.01) * s * 0.03 : 0)], [-s * 0.08, s * 0.2 + b]], green, s);
    // Товсті ніжки
    petLeg(ctx, -s * 0.1, s * 0.22, s * 0.12, s * 0.28, ph + Math.PI, dark, s);
    petLeg(ctx, s * 0.06, s * 0.22, s * 0.12, s * 0.28, ph, green, s);
    fillEllipse(ctx, -s * 0.02, s * 0.12 + b, s * 0.18, s * 0.16, green, s);
    fillEllipse(ctx, s * 0.04, s * 0.16 + b, s * 0.1, s * 0.1, "#b8d88a");
    // Величезна голова з пащею
    const bite = o.mood === "happy" ? Math.sin((o.happyT || 0) * Math.PI) : (t ? Math.max(0, Math.sin(t * 0.004)) * 0.3 : 0);
    const hx = s * 0.14;
    const hy = -s * 0.22 + b;
    // Нижня щелепа
    ctx.save();
    ctx.translate(hx - s * 0.1, hy + s * 0.08);
    ctx.rotate(bite * 0.4);
    fillRoundRect(ctx, 0, 0, s * 0.4, s * 0.1, s * 0.05, green, s);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(s * (0.1 + i * 0.055), s * 0.01);
        ctx.lineTo(s * (0.12 + i * 0.055), -s * 0.03);
        ctx.lineTo(s * (0.14 + i * 0.055), s * 0.01);
        ctx.fill();
    }
    ctx.restore();
    fillRoundRect(ctx, hx - s * 0.2, hy - s * 0.16, s * 0.52, s * 0.24, s * 0.1, green, s);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(hx + s * (0.02 + i * 0.05), hy + s * 0.07);
        ctx.lineTo(hx + s * (0.04 + i * 0.05), hy + s * 0.12);
        ctx.lineTo(hx + s * (0.06 + i * 0.05), hy + s * 0.07);
        ctx.fill();
    }
    fillEllipse(ctx, hx + s * 0.28, hy - s * 0.1, s * 0.02, s * 0.015, PET_OUTLINE);
    fillEllipse(ctx, hx - s * 0.06, hy - s * 0.1, s * 0.04, s * 0.02, dark);
    petEye(ctx, hx + s * 0.02, hy - s * 0.06, s * 0.06, t, eyeMood(o), 71);
    if (coolMood(o)) {
        angryBrow(ctx, hx + s * 0.02, hy - s * 0.06, s * 0.06, s);
    }
    // Коротюсінькі ручки, що безпорадно махають
    const wave = t ? Math.sin(t * 0.02) * s * 0.02 : 0;
    petLimb(ctx, s * 0.1, s * 0.04 + b, s * 0.17, s * 0.06 + b + wave, s * 0.035, dark, s * 0.8);
    petLimb(ctx, s * 0.14, s * 0.08 + b, s * 0.2, s * 0.1 + b - wave, s * 0.035, green, s * 0.8);
}

// ---------- Скелетоні Скейтоні: скелет-кіт на скейті (Нічні пагорби) ----------

function drawSkeletoni(ctx, s, t, o) {
    const b = breathe(t, s);
    const bone = "#f4f2e8";
    // У радості — кікфліп: дошка обертається під котом
    const flip = o.mood === "happy" ? (o.happyT || 0) : 0;
    const air = Math.sin(flip * Math.PI) * s * 0.14;
    // Сяйво кісток у темряві
    ctx.save();
    ctx.globalAlpha = 0.12 + (t ? Math.abs(Math.sin(t * 0.003)) * 0.08 : 0.05);
    fillEllipse(ctx, 0, s * 0.02 - air, s * 0.36, s * 0.22, "#9cffe8");
    ctx.restore();
    // Скейт
    ctx.save();
    ctx.translate(0, s * 0.38 - air * 0.6);
    ctx.scale(1, Math.cos(flip * Math.PI * 2));
    fillRoundRect(ctx, -s * 0.34, -s * 0.04, s * 0.68, s * 0.08, s * 0.04, "#ff4a5a", s * 0.5);
    ctx.restore();
    const roll = o.moving && t ? t * 0.03 : 0;
    for (let i = 0; i < 2; i++) {
        const wx = -s * 0.22 + i * s * 0.44;
        const wy = s * 0.44 - air * 0.6;
        fillEllipse(ctx, wx, wy, s * 0.06, s * 0.06, "#ffe14d", s * 0.7);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = Math.max(1, s * 0.012);
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + Math.cos(roll) * s * 0.05, wy + Math.sin(roll) * s * 0.05);
        ctx.stroke();
    }
    const y0 = b - air;
    // Лапки-кісточки на дошці
    for (let i = 0; i < 4; i++) {
        const x = -s * 0.22 + i * s * 0.14;
        petLimb(ctx, x, s * 0.14 + y0, x + s * 0.02, s * 0.34 + y0, s * 0.03, bone, s * 0.8);
    }
    // Хвіст-хребці
    for (let i = 0; i < 5; i++) {
        const a = -0.6 - i * 0.3 + (t ? Math.sin(t * 0.008 + i) * 0.08 : 0);
        fillEllipse(ctx, -s * 0.3 + Math.cos(a) * s * 0.04 * i - s * 0.02 * i, s * 0.06 + y0 + Math.sin(a) * s * 0.04 * i, s * 0.03, s * 0.025, bone, s * 0.5);
    }
    // Хребет і ребра
    petLimb(ctx, -s * 0.28, s * 0.08 + y0, s * 0.12, s * 0.02 + y0, s * 0.04, bone, s);
    for (let i = 0; i < 4; i++) {
        const x = -s * 0.2 + i * s * 0.08;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = s * 0.04;
        ctx.beginPath();
        ctx.arc(x, s * 0.04 + y0, s * 0.08, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        ctx.strokeStyle = bone;
        ctx.lineWidth = s * 0.02;
        ctx.stroke();
    }
    // Череп із котячими вухами
    const hx = s * 0.2;
    const hy = -s * 0.1 + y0;
    fillPoly(ctx, [[hx - s * 0.14, hy - s * 0.04], [hx - s * 0.1, hy - s * 0.25], [hx - s * 0.01, hy - s * 0.1]], bone, s * 0.5);
    fillPoly(ctx, [[hx + s * 0.01, hy - s * 0.1], [hx + s * 0.08, hy - s * 0.25], [hx + s * 0.14, hy - s * 0.04]], bone, s * 0.5);
    fillEllipse(ctx, hx, hy, s * 0.16, s * 0.14, bone, s);
    // Очниці зі світними вогниками-зіницями
    const eyeGlow = o.mood === "sad" ? "#7a8aa0" : "#39f6ff";
    fillEllipse(ctx, hx - s * 0.04, hy - s * 0.01, s * 0.045, s * 0.05, "#1a1a24");
    fillEllipse(ctx, hx + s * 0.08, hy - s * 0.01, s * 0.045, s * 0.05, "#1a1a24");
    if (o.mood === "happy") {
        ctx.strokeStyle = eyeGlow;
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.arc(hx - s * 0.04, hy + s * 0.01, s * 0.025, Math.PI * 1.1, Math.PI * 1.9);
        ctx.moveTo(hx + s * 0.105, hy + s * 0.01);
        ctx.arc(hx + s * 0.08, hy + s * 0.01, s * 0.025, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
    } else {
        fillEllipse(ctx, hx - s * 0.03, hy - s * 0.01, s * 0.018, s * 0.018, eyeGlow);
        fillEllipse(ctx, hx + s * 0.09, hy - s * 0.01, s * 0.018, s * 0.018, eyeGlow);
    }
    fillPoly(ctx, [[hx + s * 0.02, hy + s * 0.05], [hx + s * 0.04, hy + s * 0.08], [hx + s * 0.0, hy + s * 0.08]], "#1a1a24");
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        ctx.moveTo(hx - s * 0.04 + i * s * 0.035, hy + s * 0.1);
        ctx.lineTo(hx - s * 0.04 + i * s * 0.035, hy + s * 0.13);
    }
    ctx.moveTo(hx - s * 0.05, hy + s * 0.115);
    ctx.lineTo(hx + s * 0.08, hy + s * 0.115);
    ctx.stroke();
}

// ---------- Агент Хом'яконі: хом'як-спецагент (Секретна база) ----------

function drawAgentHomiakoni(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const fur = "#e0a060";
    sneakerLegs(ctx, s, [-s * 0.1, s * 0.1], s * 0.24, "#1f2230", "#1f2230", ph);
    // Чорний костюм із білою сорочкою та краваткою
    fillEllipse(ctx, 0, s * 0.12 + b, s * 0.26, s * 0.2, "#1f2230", s);
    fillPoly(ctx, [[-s * 0.06, -s * 0.04 + b], [s * 0.06, -s * 0.04 + b], [s * 0.0, s * 0.22 + b]], "#f4f7fb");
    fillPoly(ctx, [[-s * 0.02, -s * 0.02 + b], [s * 0.02, -s * 0.02 + b], [s * 0.03, s * 0.14 + b], [0, s * 0.18 + b], [-s * 0.03, s * 0.14 + b]], "#101420");
    // Руки: одна тримає рацію біля вуха в радості
    const talk = o.mood === "happy" || o.mood === "combo";
    petLimb(ctx, -s * 0.22, s * 0.04 + b, -s * 0.28, s * 0.2 + b, s * 0.07, "#1f2230", s);
    fillEllipse(ctx, -s * 0.28, s * 0.22 + b, s * 0.04, s * 0.04, fur, s * 0.5);
    if (talk) {
        petLimb(ctx, s * 0.22, s * 0.04 + b, s * 0.26, -s * 0.14 + b, s * 0.07, "#1f2230", s);
        fillRoundRect(ctx, s * 0.22, -s * 0.26 + b, s * 0.06, s * 0.12, s * 0.015, "#5a6478", s * 0.5);
    } else {
        petLimb(ctx, s * 0.22, s * 0.04 + b, s * 0.28, s * 0.2 + b, s * 0.07, "#1f2230", s);
        fillEllipse(ctx, s * 0.28, s * 0.22 + b, s * 0.04, s * 0.04, fur, s * 0.5);
    }
    // Голова з пухкими щічками
    const hx = s * 0.02;
    const hy = -s * 0.2 + b;
    fillEllipse(ctx, hx - s * 0.14, hy - s * 0.12, s * 0.05, s * 0.05, fur, s * 0.8);
    fillEllipse(ctx, hx + s * 0.14, hy - s * 0.12, s * 0.05, s * 0.05, fur, s * 0.8);
    fillEllipse(ctx, hx, hy, s * 0.2, s * 0.16, fur, s);
    fillEllipse(ctx, hx - s * 0.1, hy + s * 0.06, s * 0.08, s * 0.06, "#f6d0a0");
    fillEllipse(ctx, hx + s * 0.12, hy + s * 0.06, s * 0.08, s * 0.06, "#f6d0a0");
    fillEllipse(ctx, hx + s * 0.02, hy + s * 0.04, s * 0.025, s * 0.018, "#ff7aa8");
    petMouth(ctx, hx + s * 0.02, hy + s * 0.1, s * 0.05, s, o.mood);
    // Чорні окуляри й навушник зі шнуром
    if (o.mood === "sad") {
        petEye(ctx, hx - s * 0.06, hy - s * 0.03, s * 0.045, t, "sad", 72);
        petEye(ctx, hx + s * 0.1, hy - s * 0.03, s * 0.045, t, "sad", 72);
    } else {
        fillRoundRect(ctx, hx - s * 0.14, hy - s * 0.07, s * 0.14, s * 0.07, s * 0.025, "#0b0f1e");
        fillRoundRect(ctx, hx + s * 0.03, hy - s * 0.07, s * 0.14, s * 0.07, s * 0.025, "#0b0f1e");
        ctx.fillStyle = "#0b0f1e";
        ctx.fillRect(hx - s * 0.01, hy - s * 0.05, s * 0.05, s * 0.015);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(hx - s * 0.11, hy - s * 0.06, s * 0.04, s * 0.012);
        ctx.fillRect(hx + s * 0.06, hy - s * 0.06, s * 0.04, s * 0.012);
    }
    ctx.strokeStyle = "#c8d0dc";
    ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.19, hy + s * 0.02);
    ctx.quadraticCurveTo(hx - s * 0.24, hy + s * 0.14, hx - s * 0.16, hy + s * 0.2);
    ctx.stroke();
    fillEllipse(ctx, hx - s * 0.19, hy + s * 0.01, s * 0.025, s * 0.025, "#c8d0dc", s * 0.4);
}

// ---------- Клоуно Страшиліно: моторошний клоун на пружині (Луна-парк уночі) ----------

function drawKlouno(ctx, s, t, o) {
    // Стрибає на пружині
    const bounce = t ? Math.abs(Math.sin(t * (o.mood === "happy" ? 0.02 : 0.012))) : 0.5;
    const top = s * 0.02 - bounce * s * 0.14;
    // Пружина
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = s * 0.05;
    ctx.lineJoin = "round";
    const coil = function () {
        ctx.beginPath();
        const n = 6;
        for (let i = 0; i <= n; i++) {
            const y = top + (s * 0.46 - top) * (i / n);
            const x = i % 2 === 0 ? -s * 0.1 : s * 0.1;
            if (i === 0) {
                ctx.moveTo(0, y);
            } else {
                ctx.lineTo(i === n ? 0 : x, y);
            }
        }
        ctx.stroke();
    };
    coil();
    ctx.strokeStyle = "#c8d0dc";
    ctx.lineWidth = s * 0.028;
    coil();
    fillRoundRect(ctx, -s * 0.14, s * 0.44, s * 0.28, s * 0.06, s * 0.02, "#ff4a5a", s * 0.8);
    // Повітряна кулька на нитці
    const sway = t ? Math.sin(t * 0.003) * s * 0.04 : 0;
    ctx.strokeStyle = "#dfe6f0";
    ctx.lineWidth = Math.max(1, s * 0.01);
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, top - s * 0.04);
    ctx.quadraticCurveTo(-s * 0.34, top - s * 0.2, -s * 0.34 + sway, top - s * 0.34);
    ctx.stroke();
    fillEllipse(ctx, -s * 0.34 + sway, top - s * 0.42, s * 0.09, s * 0.11, "#e0202a", s * 0.8);
    fillEllipse(ctx, -s * 0.36 + sway, top - s * 0.46, s * 0.02, s * 0.03, "#ff9a9a");
    // Райдужні пасма волосся
    const hy = top - s * 0.16;
    fillEllipse(ctx, -s * 0.18, hy - s * 0.04, s * 0.1, s * 0.09, "#39c6ff", s * 0.8);
    fillEllipse(ctx, s * 0.18, hy - s * 0.04, s * 0.1, s * 0.09, "#ff9a1a", s * 0.8);
    fillEllipse(ctx, 0, hy - s * 0.16, s * 0.08, s * 0.06, "#7dff8a", s * 0.8);
    // Біле обличчя
    fillEllipse(ctx, 0, hy, s * 0.2, s * 0.19, "#f8f6f0", s);
    // Очі з синіми ромбами
    const ey = hy - s * 0.04;
    fillPoly(ctx, [[-s * 0.07, ey - s * 0.08], [-s * 0.03, ey], [-s * 0.07, ey + s * 0.08], [-s * 0.11, ey]], "#5a7aff");
    fillPoly(ctx, [[s * 0.09, ey - s * 0.08], [s * 0.13, ey], [s * 0.09, ey + s * 0.08], [s * 0.05, ey]], "#5a7aff");
    petEye(ctx, -s * 0.07, ey, s * 0.045, t, eyeMood(o), 73);
    petEye(ctx, s * 0.09, ey, s * 0.045, t, eyeMood(o), 73);
    // Червоний ніс і широка-широка усмішка
    fillEllipse(ctx, s * 0.02, hy + s * 0.04, s * 0.05, s * 0.05, "#e0202a", s * 0.7);
    ctx.beginPath();
    if (o.mood === "sad") {
        ctx.arc(s * 0.02, hy + s * 0.2, s * 0.1, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = "#c0102a";
        ctx.lineWidth = s * 0.04;
        ctx.stroke();
    } else {
        ctx.moveTo(-s * 0.12, hy + s * 0.08);
        ctx.quadraticCurveTo(s * 0.02, hy + s * 0.22, s * 0.16, hy + s * 0.08);
        ctx.quadraticCurveTo(s * 0.02, hy + s * 0.14, -s * 0.12, hy + s * 0.08);
        ctx.fillStyle = "#c0102a";
        ctx.fill();
        ctx.lineWidth = petLine(s) * 0.7;
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-s * 0.06 + i * s * 0.05, hy + s * 0.105, s * 0.03, s * 0.02);
        }
    }
    // Комірець-жабо
    for (let i = 0; i < 5; i++) {
        fillEllipse(ctx, -s * 0.16 + i * s * 0.08, hy + s * 0.2, s * 0.05, s * 0.035, i % 2 === 0 ? "#ff7ad8" : "#ffe14d", s * 0.5);
    }
}

// ---------- Робоакуло Заводоні: механічна акула з шестернями (Підводна фабрика) ----------

function gear(ctx, x, y, r, a, fill, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
        const rr = i % 2 === 0 ? r : r * 0.75;
        const ang = i * Math.PI / 8;
        ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.6;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    fillEllipse(ctx, 0, 0, r * 0.3, r * 0.3, "#2b2f3a");
    ctx.restore();
}

function drawRoboakulo(ctx, s, t, o) {
    const b = breathe(t, s);
    const steel = "#8a96a8";
    const spin = t ? t * 0.004 : 0;
    // Гвинт на хвості
    const k = t ? Math.abs(Math.sin(t * 0.06)) : 0.8;
    fillRoundRect(ctx, -s * 0.5, -s * 0.03 + b, s * 0.12, s * 0.06, s * 0.02, "#5a6478", s * 0.6);
    ctx.save();
    ctx.globalAlpha = 0.6;
    fillEllipse(ctx, -s * 0.5, b, s * 0.02, s * (0.04 + k * 0.12), "#dfe6f0");
    ctx.restore();
    // Хвостовий плавець
    fillPoly(ctx, [[-s * 0.34, b], [-s * 0.44, -s * 0.16 + b], [-s * 0.4, b], [-s * 0.44, s * 0.12 + b]], steel, s);
    // Спинний плавець-пластина
    fillPoly(ctx, [[-s * 0.1, -s * 0.14 + b], [-s * 0.04, -s * 0.34 + b], [s * 0.08, -s * 0.14 + b]], "#6a7488", s);
    // Корпус із заклепками
    fillEllipse(ctx, 0, b, s * 0.4, s * 0.18, steel, s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, b, s * 0.39, s * 0.17, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "#5a6478";
    ctx.lineWidth = Math.max(1, s * 0.015);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.2 + b);
    ctx.lineTo(-s * 0.1, s * 0.2 + b);
    ctx.moveTo(s * 0.14, -s * 0.2 + b);
    ctx.lineTo(s * 0.14, s * 0.2 + b);
    ctx.stroke();
    fillEllipse(ctx, s * 0.06, s * 0.1 + b, s * 0.3, s * 0.07, "#c8d0dc");
    ctx.restore();
    ctx.fillStyle = "#3a4050";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(-s * 0.26 + i * s * 0.08, -s * 0.1 + b, s * 0.02, s * 0.02);
    }
    // Шестерні на боці, що крутяться назустріч
    gear(ctx, -s * 0.2, s * 0.02 + b, s * 0.07, spin, "#ffcc33", s);
    gear(ctx, -s * 0.09, s * 0.06 + b, s * 0.05, -spin * 1.4, "#ff9a1a", s);
    // Залізна паща із зубами-трикутниками
    ctx.fillStyle = "#2b2f3a";
    ctx.beginPath();
    ctx.moveTo(s * 0.16, s * 0.04 + b);
    ctx.quadraticCurveTo(s * 0.28, s * 0.12 + b, s * 0.38, s * 0.03 + b);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e9edf7";
    for (let i = 0; i < 5; i++) {
        const tx = s * (0.18 + i * 0.04);
        ctx.beginPath();
        ctx.moveTo(tx, s * 0.04 + b);
        ctx.lineTo(tx + s * 0.02, s * 0.08 + b);
        ctx.lineTo(tx + s * 0.04, s * 0.04 + b);
        ctx.fill();
    }
    // Червоне око-лінза
    const pulse = t ? 0.6 + Math.abs(Math.sin(t * 0.006)) * 0.4 : 1;
    const eyeColor = o.mood === "sad" ? "#5a7aa0" : o.mood === "happy" ? "#7dff8a" : "#ff2a3a";
    fillEllipse(ctx, s * 0.22, -s * 0.06 + b, s * 0.055, s * 0.055, "#3a4050", s * 0.7);
    ctx.save();
    ctx.globalAlpha = pulse;
    fillEllipse(ctx, s * 0.22, -s * 0.06 + b, s * 0.03, s * 0.03, eyeColor);
    ctx.restore();
    if (coolMood(o)) {
        angryBrow(ctx, s * 0.22, -s * 0.06 + b, s * 0.05, s);
    }
}

// ---------- Двоголово Інопланетоні: двоголовий прибулець, голови сперечаються (Планета двох сонць) ----------

function drawDvoholovo(ctx, s, t, o) {
    const ph = runPhase(t, o);
    const b = breathe(t, s);
    const green = "#8ae04a";
    sneakerLegs(ctx, s, [-s * 0.1, s * 0.1], s * 0.24, "#5aa83a", "#b58cff", ph);
    fillEllipse(ctx, 0, s * 0.14 + b, s * 0.22, s * 0.16, green, s);
    fillEllipse(ctx, 0, s * 0.18 + b, s * 0.12, s * 0.08, "#c8f5a0");
    // Хто зараз говорить: голови по черзі сердито підскакують
    const turn = t ? Math.floor(t / 700) % 2 : 0;
    const head = function (side, seed) {
        const talking = turn === (side < 0 ? 0 : 1) && o.mood !== "sad";
        const hop = talking && t ? Math.abs(Math.sin(t * 0.02)) * s * 0.04 : 0;
        const nx = side * s * 0.2;
        const hy = -s * 0.2 + b - hop;
        petLimb(ctx, side * s * 0.08, s * 0.02 + b, nx, hy + s * 0.08, s * 0.06, green, s);
        // Антени
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = Math.max(1, s * 0.015);
        ctx.beginPath();
        ctx.moveTo(nx - s * 0.04, hy - s * 0.1);
        ctx.lineTo(nx - s * 0.08, hy - s * 0.2);
        ctx.moveTo(nx + s * 0.04, hy - s * 0.1);
        ctx.lineTo(nx + s * 0.08, hy - s * 0.2);
        ctx.stroke();
        fillEllipse(ctx, nx - s * 0.08, hy - s * 0.21, s * 0.025, s * 0.025, "#ff7ad8", s * 0.4);
        fillEllipse(ctx, nx + s * 0.08, hy - s * 0.21, s * 0.025, s * 0.025, "#ff7ad8", s * 0.4);
        fillEllipse(ctx, nx, hy, s * 0.12, s * 0.11, green, s);
        // Голови дивляться одна на одну
        const look = -side;
        petEye(ctx, nx + look * s * 0.02, hy - s * 0.02, s * 0.05, t, eyeMood(o), seed);
        if (o.mood !== "happy" && o.mood !== "sad") {
            ctx.strokeStyle = PET_OUTLINE;
            ctx.lineWidth = Math.max(1, petLine(s) * 0.8);
            ctx.beginPath();
            ctx.moveTo(nx + look * s * 0.07, hy - s * 0.06);
            ctx.lineTo(nx - look * s * 0.03, hy - s * 0.1);
            ctx.stroke();
        }
        if (talking) {
            fillEllipse(ctx, nx + look * s * 0.05, hy + s * 0.06, s * 0.03, s * 0.025, "#3a1030", s * 0.4);
            ctx.fillStyle = "#ffe14d";
            ctx.font = "bold " + Math.max(6, s * 0.14) + "px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(side < 0 ? "!" : "?", nx + look * s * 0.02 + side * s * 0.14, hy - s * 0.14);
        } else {
            petMouth(ctx, nx + look * s * 0.04, hy + s * 0.07, s * 0.04, s, o.mood);
        }
    };
    head(-1, 74);
    head(1, 75);
}

// ---------- Дирижаблоні Китоні: кит-дирижабль (Місто над хмарами) ----------

function drawDyryzhabloni(ctx, s, t, o) {
    const b = breathe(t, s) * 1.5;
    const blue = "#5a8ae0";
    // Хвіст китa з гвинтом
    fillPoly(ctx, [[-s * 0.36, b], [-s * 0.5, -s * 0.12 + b], [-s * 0.46, b], [-s * 0.5, s * 0.1 + b]], blue, s);
    const k = t ? Math.abs(Math.sin(t * 0.07)) : 0.8;
    ctx.save();
    ctx.globalAlpha = 0.6;
    fillEllipse(ctx, -s * 0.53, b, s * 0.015, s * (0.04 + k * 0.1), "#dfe6f0");
    ctx.restore();
    // Балон-тіло з поздовжніми швами
    fillEllipse(ctx, 0, -s * 0.06 + b, s * 0.4, s * 0.2, blue, s);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.06 + b, s * 0.39, s * 0.19, 0, 0, Math.PI * 2);
    ctx.clip();
    fillEllipse(ctx, s * 0.04, s * 0.06 + b, s * 0.34, s * 0.08, "#dbe8ff");
    ctx.strokeStyle = "#3f6ac0";
    ctx.lineWidth = Math.max(1, s * 0.012);
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.06 + b, s * 0.4, s * (0.08 + Math.abs(i) * 0.06), 0, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
    }
    ctx.restore();
    // Плавник
    fillEllipse(ctx, -s * 0.04, s * 0.06 + b, s * 0.1, s * 0.04, "#3f6ac0", s * 0.7, 0.4);
    // Гондола на тросах
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.12 + b);
    ctx.lineTo(-s * 0.08, s * 0.22 + b);
    ctx.moveTo(s * 0.1, s * 0.12 + b);
    ctx.lineTo(s * 0.08, s * 0.22 + b);
    ctx.stroke();
    fillRoundRect(ctx, -s * 0.12, s * 0.22 + b, s * 0.24, s * 0.1, s * 0.03, "#a0602a", s * 0.8);
    ctx.fillStyle = "#ffe8a0";
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-s * 0.08 + i * s * 0.06, s * 0.245 + b, s * 0.035, s * 0.035);
    }
    // Око й усмішка кита
    petEye(ctx, s * 0.22, -s * 0.06 + b, s * 0.05, t, eyeMood(o), 76);
    petMouth(ctx, s * 0.28, s * 0.04 + b, s * 0.08, s, o.mood);
    // Фонтанчик, коли радіє
    if ((o.mood === "happy" || o.mood === "combo") && t) {
        const f = (t % 700) / 700;
        ctx.save();
        ctx.globalAlpha = 1 - f;
        ctx.fillStyle = "#8fd8ff";
        for (let i = -1; i <= 1; i++) {
            fillEllipse(ctx, s * 0.1 + i * s * 0.05 * f * 2, -s * 0.28 + b - f * s * 0.16, s * 0.025, s * 0.035, "#8fd8ff");
        }
        ctx.restore();
    }
}

export const PET_RENDERERS_8 = {
    pet_tirex: drawTirex,
    pet_skeletoni: drawSkeletoni,
    pet_agent_homiakoni: drawAgentHomiakoni,
    pet_klouno: drawKlouno,
    pet_roboakulo: drawRoboakulo,
    pet_dvoholovo: drawDvoholovo,
    pet_dyryzhabloni: drawDyryzhabloni
};
