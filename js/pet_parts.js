// ============================================================
// pet_parts.js — спільні деталі для малювання улюбленців: контур, очі з відблиском,
// рум'янець, лапки з кроком, кросівки брейнротів. Малювальники — pet_renderers.js
// ============================================================

// Темний товстий контур — щоб маленького улюбленця було видно на будь-якому тлі
export const PET_OUTLINE = "#0b0f1e";

export function petLine(s) {
    return Math.max(1.4, s * 0.06);
}

// Фаза бігу (0, якщо улюбленець стоїть або це нерухомий кадр)
export function runPhase(t, o) {
    return o && o.moving && t ? t * 0.022 : 0;
}

// Легке «дихання» тіла
export function breathe(t, s) {
    return t ? Math.sin(t * 0.005) * s * 0.018 : 0;
}

export function fillEllipse(ctx, x, y, rx, ry, fill, s, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (s) {
        ctx.lineWidth = petLine(s);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
    }
}

export function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
}

export function fillRoundRect(ctx, x, y, w, h, r, fill, s) {
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (s) {
        ctx.lineWidth = petLine(s);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
    }
}

// Чи кліпає зараз (коротко раз на ~3 с, у кожного улюбленця зі своїм зсувом)
function blinking(t, seed) {
    return !!t && ((t + (seed || 0) * 977) % 3300) < 110;
}

// Велике око з відблиском, дивиться вперед (праворуч).
// mood: "happy" — оченята-дужки, "sad" — зіниці вниз і брова, "chill" — напівзаплющене
// (повіка кольору lidColor)
export function petEye(ctx, x, y, r, t, mood, seed, lidColor) {
    ctx.lineCap = "round";
    if (mood === "happy" || blinking(t, seed)) {
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = Math.max(1.2, r * 0.45);
        ctx.beginPath();
        if (mood === "happy") {
            ctx.arc(x, y + r * 0.35, r * 0.7, Math.PI * 1.15, Math.PI * 1.85);
        } else {
            ctx.moveTo(x - r * 0.8, y);
            ctx.lineTo(x + r * 0.8, y);
        }
        ctx.stroke();
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = Math.max(1, r * 0.28);
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    const down = mood === "sad" ? r * 0.3 : 0;
    ctx.beginPath();
    ctx.arc(x + r * 0.22, y + down, r * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = "#101426";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.02, y - r * 0.25 + down, r * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    if (mood === "chill") {
        // Повіка на верхній половині — «чилить»
        ctx.beginPath();
        ctx.arc(x, y, r * 1.05, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = lidColor || "#7a4a26";
        ctx.fill();
        ctx.lineWidth = Math.max(1, r * 0.28);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
    }
    if (mood === "sad") {
        ctx.strokeStyle = PET_OUTLINE;
        ctx.lineWidth = Math.max(1, r * 0.3);
        ctx.beginPath();
        ctx.moveTo(x - r * 0.9, y - r * 1.2);
        ctx.lineTo(x + r * 0.7, y - r * 1.55);
        ctx.stroke();
    }
}

// Око з повікою заданого кольору (для «чилових» капібар)
export function petChillEye(ctx, x, y, r, t, mood, lidColor, seed) {
    petEye(ctx, x, y, r, t, mood === "happy" || mood === "sad" ? mood : "chill", seed, lidColor);
}

export function petCheek(ctx, x, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    fillEllipse(ctx, x, y, r, r * 0.65, "#ff7aa8");
    ctx.restore();
}

// Усмішка або сумний ротик
export function petMouth(ctx, x, y, w, s, mood) {
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (mood === "sad") {
        ctx.arc(x, y + w * 0.6, w * 0.5, Math.PI * 1.2, Math.PI * 1.8);
    } else {
        ctx.arc(x, y - w * 0.2, w * 0.5, Math.PI * 0.2, Math.PI * 0.8);
    }
    ctx.stroke();
}

// Лапка: округлий стовпчик, що ходить уперед-назад із фазою бігу.
// Уперед (праворуч, куди біжить улюбленець) лапка йде піднятою, а назад — по землі,
// відштовхуючись: зсув sin(phase) росте, коли cos(phase) > 0, — саме тоді вона й піднята
export function petLeg(ctx, x, top, w, h, phase, fill, s) {
    const swing = Math.sin(phase) * w * 0.7;
    const lift = Math.max(0, Math.cos(phase)) * h * 0.25;
    fillRoundRect(ctx, x - w / 2 + swing, top - lift, w, h, w * 0.45, fill, s);
}

// Кросівка брейнрота: біла з кольоровою смужкою
export function petSneaker(ctx, x, y, w, stripe, s, phase) {
    const swing = phase ? Math.sin(phase) * w * 0.35 : 0;
    // Як у petLeg: крок уперед — у повітрі, назад — по землі
    const lift = phase ? Math.max(0, Math.cos(phase)) * w * 0.25 : 0;
    const bx = x + swing;
    const by = y - lift;
    ctx.beginPath();
    ctx.moveTo(bx - w * 0.5, by);
    ctx.lineTo(bx - w * 0.5, by - w * 0.45);
    ctx.quadraticCurveTo(bx - w * 0.1, by - w * 0.6, bx + w * 0.15, by - w * 0.35);
    ctx.quadraticCurveTo(bx + w * 0.6, by - w * 0.3, bx + w * 0.6, by);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = stripe;
    ctx.fillRect(bx - w * 0.45, by - w * 0.12, w * 1.0, w * 0.12);
}

// Хвостик-«пружинка», що махає (швидше, коли улюбленець радіє)
export function wagAngle(t, mood) {
    if (!t) {
        return 0;
    }
    return Math.sin(t * (mood === "happy" || mood === "combo" ? 0.03 : 0.012)) * 0.45;
}

// Настрій для очей: радість і смуток змінюють погляд, решта — звичайні очі
export function eyeMood(o) {
    return o.mood === "happy" || o.mood === "sad" ? o.mood : null;
}

// Пухнаста «хмарка» з кружечків: спершу спільний контур, потім заливка без внутрішніх ліній
export function fluffCluster(ctx, circles, fill, s) {
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

// Кінцівка-палиця з контуром (руки й ноги брейнротів): від (x1, y1) до (x2, y2), товщина w
export function petLimb(ctx, x1, y1, x2, y2, w, fill, s) {
    ctx.lineCap = "round";
    ctx.strokeStyle = PET_OUTLINE;
    ctx.lineWidth = w + petLine(s) * 1.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = fill;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Ноги-палички в кросівках: xs — де ноги кріпляться до тіла (на висоті top),
// ступні стоять на y = s / 2 і крокують із фазою бігу ph (сусідні ноги — у протифазі)
export function sneakerLegs(ctx, s, xs, top, fill, stripe, ph) {
    const w = s * 0.2;
    for (let i = 0; i < xs.length; i++) {
        const phase = ph ? ph + i * Math.PI : 0;
        const swing = phase ? Math.sin(phase) * w * 0.35 : 0;
        const lift = phase ? Math.max(0, Math.cos(phase)) * w * 0.25 : 0;
        petLimb(ctx, xs[i], top, xs[i] + swing, s * 0.44 - lift, s * 0.06, fill, s);
        petSneaker(ctx, xs[i], s * 0.5, w, stripe, s, phase);
    }
}
