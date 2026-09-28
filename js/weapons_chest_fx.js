// ============================================================
// weapons_chest_fx.js — анімації руйнування шипа для сундукової зброї:
// бризки (тризуб), заморожування (сніжки, крижана сфера), розплющення (булава),
// душа шипа (коса), BANNED (банхамер), фарба (пейнтбол), порив вітру (жезл вітру).
// Викликається з drawSpikeDestruction (weapons_destruction.js); уламки — у рушії (engine_weapons.js)
// ============================================================

import { DESTRUCTION_TIME, WEAPON_SPECS, clamp01, hashRand } from "./weapons.js";
import { clipHalfPlane } from "./weapons_destruction.js";

// Види руйнування, які малює цей модуль
export const CHEST_FX_KINDS = { splash: true, freeze: true, smash: true, reap: true, ban: true, paint: true, gust: true };

// Шлях трикутника шипа (для заливки поверх нього)
function spikePath(ctx, x, groundY, hw, h) {
    ctx.beginPath();
    ctx.moveTo(x - hw, groundY);
    ctx.lineTo(x, groundY - h);
    ctx.lineTo(x + hw, groundY);
    ctx.closePath();
}

// Тризуб: шип «пірнає» в сплеск води, злітають краплі, по землі розходяться кола
function drawSplash(ctx, t, k, x, groundY, hw, h, drawShape) {
    const sink = clamp01(t / 0.25);
    if (sink < 1) {
        ctx.save();
        ctx.globalAlpha = 1 - sink;
        ctx.translate(x, groundY);
        ctx.scale(1 - sink * 0.3, 1 - sink);
        ctx.translate(-x, -groundY);
        drawShape(ctx);
        ctx.fillStyle = "rgba(120, 210, 255, 0.5)";
        spikePath(ctx, x, groundY, hw, h);
        ctx.fill();
        ctx.restore();
    }
    // Корона сплеску
    if (t < 0.35) {
        const e = t / 0.35;
        ctx.fillStyle = "rgba(150, 225, 255, " + (0.8 * (1 - e)).toFixed(2) + ")";
        for (let i = 0; i < 7; i++) {
            const bx = x + (i - 3) * hw * 0.35;
            const tall = h * (0.5 + hashRand(i + 2) * 0.6) * Math.sin(Math.PI * Math.min(1, e * 1.4));
            ctx.beginPath();
            ctx.moveTo(bx - 3, groundY);
            ctx.lineTo(bx + (i - 3) * 2, groundY - tall);
            ctx.lineTo(bx + 3, groundY);
            ctx.closePath();
            ctx.fill();
        }
    }
    // Краплі
    for (let i = 0; i < 12; i++) {
        const a = Math.PI * (0.15 + hashRand(i + 7) * 0.7);
        const v = 120 + hashRand(i + 19) * 160;
        const px = x - Math.cos(a) * v * t;
        const py = groundY - h * 0.3 - (Math.sin(a) * v * t - 450 * t * t);
        if (py > groundY) {
            continue;
        }
        ctx.fillStyle = "rgba(120, 210, 255, " + (1 - k).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 2 + hashRand(i + 31) * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    // Кола на землі
    for (let r = 0; r < 2; r++) {
        const rt = t - r * 0.15;
        if (rt <= 0) {
            continue;
        }
        ctx.strokeStyle = "rgba(170, 230, 255, " + (0.8 * (1 - k)).toFixed(2) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, groundY - 1, hw * (0.8 + rt * 3), 3 + rt * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Сніжки й крижана сфера: шип вкривається кригою, а тоді розколюється на скалки
function drawFreeze(ctx, t, k, x, groundY, hw, h, drawShape) {
    const crack = 0.35;
    if (t < crack) {
        const fi = clamp01(t / 0.12);
        drawShape(ctx);
        ctx.fillStyle = "rgba(170, 225, 255, " + (0.75 * fi).toFixed(2) + ")";
        spikePath(ctx, x, groundY, hw, h);
        ctx.fill();
        // Крижана кірка трохи більша за шип
        ctx.strokeStyle = "rgba(230, 248, 255, " + (0.9 * fi).toFixed(2) + ")";
        ctx.lineWidth = 2;
        spikePath(ctx, x, groundY, hw * 1.25, h * 1.12);
        ctx.stroke();
        ctx.fillStyle = "rgba(220, 245, 255, " + (0.25 * fi).toFixed(2) + ")";
        ctx.fill();
        // Іскорки інею
        ctx.fillStyle = "rgba(255, 255, 255, " + fi.toFixed(2) + ")";
        for (let i = 0; i < 4; i++) {
            const sx = x + (hashRand(i + 3) - 0.5) * hw;
            const sy = groundY - h * (0.2 + hashRand(i + 9) * 0.5);
            const tw = 2 + 2 * Math.abs(Math.sin(t * 30 + i));
            ctx.fillRect(sx - tw, sy - 0.5, tw * 2, 1);
            ctx.fillRect(sx - 0.5, sy - tw, 1, tw * 2);
        }
        // Тріщини перед розколом
        if (t > crack * 0.6) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                ctx.moveTo(x, groundY - h * 0.45);
                ctx.lineTo(x + (hashRand(i + 40) - 0.5) * hw * 1.6, groundY - h * (0.1 + hashRand(i + 50) * 0.8));
            }
            ctx.stroke();
        }
        return;
    }
    const e = clamp01((t - crack) / (DESTRUCTION_TIME.freeze - crack));
    // Спалах розколу
    if (e < 0.2) {
        ctx.fillStyle = "rgba(235, 250, 255, " + (0.9 * (1 - e / 0.2)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(x, groundY - h * 0.45, h * (0.4 + e * 2), 0, Math.PI * 2);
        ctx.fill();
    }
    // Крижані скалки
    const ft = t - crack;
    for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.1 + hashRand(i + 60) * 0.8);
        const v = 90 + hashRand(i + 70) * 150;
        const px = x - Math.cos(a) * v * ft;
        const py = groundY - h * 0.45 - (Math.sin(a) * v * ft - 600 * ft * ft);
        if (py > groundY + 4) {
            continue;
        }
        const size = 3 + hashRand(i + 80) * 5;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ft * (6 + i));
        ctx.globalAlpha = 1 - e;
        ctx.fillStyle = i % 2 ? "#dff6ff" : "#9ad8ff";
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, size * 0.5);
        ctx.lineTo(-size * 0.6, size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    // Іній на землі
    ctx.fillStyle = "rgba(220, 245, 255, " + (0.6 * (1 - e)).toFixed(2) + ")";
    ctx.beginPath();
    ctx.ellipse(x, groundY, hw * 1.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Булава: шип сплющується в землю, золота ударна хвиля, стовп святого світла, пил і тріщини
function drawSmash(ctx, t, k, x, groundY, hw, h, drawShape) {
    if (t < 0.35) {
        const e = t / 0.35;
        const pillar = ctx.createLinearGradient(0, groundY - h * 3, 0, groundY);
        pillar.addColorStop(0, "rgba(255, 230, 140, 0)");
        pillar.addColorStop(1, "rgba(255, 230, 140, " + (0.6 * (1 - e)).toFixed(2) + ")");
        ctx.fillStyle = pillar;
        ctx.fillRect(x - hw * 0.8, groundY - h * 3, hw * 1.6, h * 3);
    }
    const sq = t < 0.1 ? 1 - 0.85 * (t / 0.1) : 0.15;
    const fade = 1 - clamp01((t - 0.4) / 0.4);
    if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(x, groundY);
        ctx.scale(1 + (1 - sq) * 0.6, sq);
        ctx.translate(-x, -groundY);
        drawShape(ctx);
        ctx.restore();
    }
    // Тріщини в землі
    const ca = 1 - clamp01((t - 0.7) / 0.3);
    ctx.strokeStyle = "rgba(30, 20, 10, " + (0.8 * ca).toFixed(2) + ")";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const dir = i < 2 ? -1 : 1;
        const len = hw * (1.2 + hashRand(i + 5) * 1.2) * clamp01(t / 0.1);
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + dir * len * 0.5, groundY + 1 + hashRand(i) * 2);
        ctx.lineTo(x + dir * len, groundY + hashRand(i + 9) * 2);
    }
    ctx.stroke();
    // Ударна хвиля
    if (t < 0.5) {
        const e = t / 0.5;
        ctx.strokeStyle = "rgba(255, 220, 120, " + (1 - e).toFixed(2) + ")";
        ctx.lineWidth = 3 * (1 - e) + 1;
        ctx.beginPath();
        ctx.ellipse(x, groundY - 1, hw + e * 110, 4 + e * 10, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Хмарки пилу
    for (let i = 0; i < 4; i++) {
        const dir = i % 2 ? 1 : -1;
        const px = x + dir * (hw * 0.8 + t * (60 + i * 15));
        const py = groundY - 6 - t * 18 - i * 2;
        ctx.fillStyle = "rgba(170, 160, 140, " + (0.5 * (1 - k)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 5 + t * 14, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Коса: розріз навскіс — низ осідає, а верх стає фіолетовою душею з очима й відлітає вгору
function drawReap(ctx, t, k, x, groundY, hw, h, drawShape) {
    const x1 = x - hw * 1.2;
    const y1 = groundY - h * 0.3;
    const x2 = x + hw * 1.2;
    const y2 = groundY - h * 0.6;
    const lowFade = 1 - clamp01((t - 0.2) / 0.4);
    if (lowFade > 0) {
        ctx.save();
        ctx.globalAlpha = lowFade;
        ctx.translate(0, t * t * 20);
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        drawShape(ctx);
        ctx.restore();
    }
    // Душа шипа
    const soulA = (1 - k) * 0.85;
    if (soulA > 0.02) {
        const dy = -t * 70;
        const dx = Math.sin(t * 9) * 6;
        ctx.save();
        ctx.translate(dx, dy);
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        const glow = ctx.createRadialGradient(x, groundY - h * 0.75, 1, x, groundY - h * 0.75, h * 0.7);
        glow.addColorStop(0, "rgba(220, 190, 255, " + soulA.toFixed(2) + ")");
        glow.addColorStop(1, "rgba(130, 80, 255, " + (soulA * 0.5).toFixed(2) + ")");
        ctx.fillStyle = glow;
        spikePath(ctx, x, groundY, hw, h);
        ctx.fill();
        ctx.restore();
        // Хвостик душі й очі
        ctx.fillStyle = "rgba(160, 110, 255, " + (soulA * 0.5).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(x + dx - Math.sin(t * 9 - 1) * 4, groundY - h * 0.55 + dy + 6, h * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(40, 10, 60, " + soulA.toFixed(2) + ")";
        ctx.fillRect(x + dx - h * 0.1, groundY - h * 0.78 + dy, h * 0.06, h * 0.08);
        ctx.fillRect(x + dx + h * 0.04, groundY - h * 0.78 + dy, h * 0.06, h * 0.08);
    }
    // Фіолетовий слід леза
    if (t < 0.25) {
        const a = 1 - t / 0.25;
        ctx.strokeStyle = "rgba(190, 140, 255, " + a.toFixed(2) + ")";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1 - 14, y1 + 6);
        ctx.lineTo(x2 + 14, y2 - 6);
        ctx.stroke();
    }
}

// Банхамер: шип розплющується в «млинець», червоний спалах, над ним вискакує табличка BANNED!
function drawBan(ctx, t, k, x, groundY, hw, h, drawShape) {
    const sq = t < 0.08 ? 1 - 0.88 * (t / 0.08) : 0.12;
    const fade = 1 - clamp01((t - 0.9) / 0.3);
    if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(x, groundY);
        ctx.scale(1 + (1 - sq) * 0.9, sq);
        ctx.translate(-x, -groundY);
        drawShape(ctx);
        ctx.restore();
    }
    if (t < 0.3) {
        const e = t / 0.3;
        ctx.strokeStyle = "rgba(255, 60, 60, " + (1 - e).toFixed(2) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, groundY - h * 0.2, 10 + e * 60, 0, Math.PI * 2);
        ctx.stroke();
    }
    const st = t - 0.1;
    if (st <= 0) {
        return;
    }
    // Табличка вискакує з пружинкою й повільно спливає
    const p = clamp01(st / 0.18);
    const pop = p < 1 ? 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2) : 1;
    const alpha = 1 - clamp01((t - 1.0) / 0.3);
    const size = Math.max(9, Math.round(h * 0.42));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, groundY - h - size - st * 12);
    ctx.scale(pop, pop);
    ctx.rotate(Math.sin(st * 8) * 0.06);
    ctx.font = "bold " + size + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const w = ctx.measureText("BANNED!").width + size;
    ctx.fillStyle = "#b81a22";
    ctx.fillRect(-w / 2 - 2, -size * 0.75 - 2, w + 4, size * 1.5 + 4);
    ctx.fillStyle = "#e8323a";
    ctx.fillRect(-w / 2, -size * 0.75, w, size * 1.5);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("BANNED!", 0, 1);
    ctx.restore();
}

// Пейнтбол: шип укривається плямами фарби й тане, на землі лишаються кольорові бризки
function drawPaint(ctx, t, k, x, groundY, hw, h, drawShape) {
    const colors = WEAPON_SPECS.weapon_paintball.colors;
    const grow = clamp01(t / 0.1);
    const fade = 1 - clamp01((t - 0.5) / 0.4);
    if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        drawShape(ctx);
        spikePath(ctx, x, groundY, hw, h);
        ctx.clip();
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(x + (hashRand(i + 4) - 0.5) * hw * 1.4, groundY - h * (0.15 + hashRand(i + 8) * 0.7), h * (0.18 + hashRand(i + 12) * 0.14) * grow, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    // Плями на землі
    const ga = 1 - clamp01((t - 0.9) / 0.3);
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.85 * ga;
        ctx.beginPath();
        ctx.ellipse(x + (i - 1.5) * hw * 0.7 + hashRand(i + 20) * 6, groundY, hw * (0.3 + hashRand(i + 24) * 0.3) * grow, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Бризки фарби
    if (t < 0.5) {
        for (let i = 0; i < 10; i++) {
            const a = Math.PI * (0.1 + hashRand(i + 30) * 0.8);
            const v = 100 + hashRand(i + 40) * 150;
            const px = x - Math.cos(a) * v * t;
            const py = groundY - h * 0.5 - (Math.sin(a) * v * t - 500 * t * t);
            if (py > groundY) {
                continue;
            }
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 1 - t / 0.5;
            ctx.beginPath();
            ctx.arc(px, py, 2 + hashRand(i + 50) * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// Жезл вітру: шип здригається від удару вихору, зривається з землі й, крутячись, відлітає вгору
function drawGust(ctx, t, k, x, groundY, hw, h, drawShape) {
    const f = Math.max(0, t - 0.1);
    const shake = t < 0.1 ? Math.sin(t * 120) * 3 : 0;
    const dx = shake + f * 300 + f * f * 250;
    const dy = -(f * 140 + f * f * 260);
    const scale = Math.max(0, 1 - f * 0.9);
    if (scale > 0.02) {
        ctx.save();
        ctx.translate(x + dx, groundY - h * 0.4 + dy);
        ctx.rotate(f * 14);
        ctx.scale(scale, scale);
        ctx.translate(-x, -(groundY - h * 0.4));
        drawShape(ctx);
        ctx.restore();
    }
    // Смуги вітру, що проносяться повз
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const sx = x - 70 + t * 420 - i * 22;
        const sy = groundY - h * (0.15 + i * 0.22) + dy * 0.3;
        ctx.strokeStyle = "rgba(230, 245, 255, " + (0.7 * (1 - k)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.moveTo(sx - 30, sy);
        ctx.quadraticCurveTo(sx, sy - 6, sx + 20, sy - 2);
        ctx.stroke();
    }
    // Вихор там, де стояв шип
    if (t < 0.5) {
        const e = t / 0.5;
        ctx.strokeStyle = "rgba(210, 235, 255, " + (0.8 * (1 - e)).toFixed(2) + ")";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(x, groundY - 4 - i * 6, hw * (0.5 + i * 0.3 + e), 3 + i, 0, t * 20 + i, t * 20 + i + Math.PI * 1.2);
            ctx.stroke();
        }
    }
}

const CHEST_FX_DRAWERS = {
    splash: drawSplash,
    freeze: drawFreeze,
    smash: drawSmash,
    reap: drawReap,
    ban: drawBan,
    paint: drawPaint,
    gust: drawGust
};

// Руйнування шипа сундуковою зброєю. t — секунди від удару, x — центр шипа,
// hw — половина ширини, h — висота, drawShape(ctx) малює цілий шип на його місці
export function drawChestDestruction(ctx, kind, t, x, groundY, hw, h, drawShape) {
    const draw = CHEST_FX_DRAWERS[kind];
    if (!draw) {
        return;
    }
    const k = clamp01(t / (DESTRUCTION_TIME[kind] || 1));
    ctx.save();
    draw(ctx, t, k, x, groundY, hw, h, drawShape);
    ctx.restore();
}
