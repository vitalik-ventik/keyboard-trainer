// ============================================================
// weapons_destruction.js — анімації руйнування шипа (свої для кожної зброї)
// ============================================================

import { drawFlameTongue, drawFootball } from "./weapons_held.js";
import { DESTRUCTION_TIME, GRAVITY_LIFT, GRAVITY_LIFT_RATIO, SABER_FX_COLORS, clamp01, gravityHoldOffset, hashRand } from "./weapons.js";

// ---------- Руйнування шипа ----------

// Кругла півплощина для відсікання: усе з одного боку прямої (x1,y1)-(x2,y2)
function clipHalfPlane(ctx, x1, y1, x2, y2, side) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * side * 400;
    const ny = dx / len * side * 400;
    const ex = dx / len * 400;
    const ey = dy / len * 400;
    ctx.beginPath();
    ctx.moveTo(x1 - ex, y1 - ey);
    ctx.lineTo(x2 + ex, y2 + ey);
    ctx.lineTo(x2 + ex + nx, y2 + ey + ny);
    ctx.lineTo(x1 - ex + nx, y1 - ey + ny);
    ctx.closePath();
    ctx.clip();
}

// Малює анімацію руйнування. drawShape(ctx) малює цілий шип на його місці.
// x — центр шипа на екрані, hw — половина ширини, h — висота.
// opts (необов'язково): { pullX } — куди гравітаційна гармата притягує шип (x точки перед кубиком)
export function drawSpikeDestruction(ctx, kind, t, x, groundY, hw, h, drawShape, opts) {
    const dur = DESTRUCTION_TIME[kind] || 0.5;
    const k = clamp01(t / dur);
    ctx.save();
    if (kind === "slice") {
        // Меч розрізає шип навскіс: верх з'їжджає й падає, низ осідає
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.35) / 0.4);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 70, -t * 40 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.2);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        ctx.restore();
        ctx.globalAlpha = 1;
        // Біла лінія розрізу
        if (t < 0.22) {
            const a = 1 - t / 0.22;
            ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 - 12, y1 + 5);
            ctx.lineTo(x2 + 12, y2 - 5);
            ctx.stroke();
        }
    } else if (kind === "split") {
        // Сокира розколює шип навпіл: половинки розвалюються в боки
        const ang = Math.min(1.5, t * t * 5);
        const fade = 1 - clamp01((t - 0.45) / 0.35);
        ctx.globalAlpha = fade;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 200, groundY - 300, 200, 320);
        ctx.clip();
        ctx.translate(x - hw, groundY);
        ctx.rotate(-ang);
        ctx.translate(-(x - hw) - t * 10, -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, groundY - 300, 200, 320);
        ctx.clip();
        ctx.translate(x + hw, groundY);
        ctx.rotate(ang);
        ctx.translate(-(x + hw) + t * 10, -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.globalAlpha = 1;
        if (t < 0.18) {
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - t / 0.18).toFixed(2) + ")";
            ctx.fillRect(x - 2, groundY - h - 10, 4, h + 10);
        }
    } else if (kind === "shatter" || kind === "pop") {
        // Лук і пістолет: шип спалахує й розлітається на уламки (уламки — у рушії)
        const grow = 1 + k * 0.25;
        ctx.globalAlpha = 1 - k;
        ctx.translate(x, groundY - h * 0.4);
        ctx.scale(grow, grow);
        ctx.translate(-x, -(groundY - h * 0.4));
        drawShape(ctx);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.8 * (1 - k)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(x, groundY - h * 0.45, h * (0.3 + k * 0.5), 0, Math.PI * 2);
        ctx.fill();
    } else if (kind === "crumble") {
        // Автомат: остання чверть осідає в землю
        ctx.beginPath();
        ctx.rect(x - hw - 10, groundY - h * 0.25, hw * 2 + 20, h * 0.25);
        ctx.clip();
        ctx.globalAlpha = 1 - k;
        ctx.translate(0, k * h * 0.25);
        drawShape(ctx);
    } else if (kind === "melt") {
        // Лазер: шип розжарюється, розпливається й осідає попелом
        const heat = clamp01(t / 0.3);
        const squash = t < 0.3 ? 1 : 1 - clamp01((t - 0.3) / 0.6);
        if (squash > 0.02) {
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1 + (1 - squash) * 0.5, squash);
            ctx.translate(-x, -groundY);
            drawShape(ctx);
            ctx.restore();
            // Розжарення поверх шипа
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1 + (1 - squash) * 0.5, squash);
            const glow = ctx.createRadialGradient(0, -h * 0.4, 2, 0, -h * 0.4, h * 0.9);
            glow.addColorStop(0, "rgba(255, 240, 160, " + (0.9 * heat).toFixed(2) + ")");
            glow.addColorStop(0.5, "rgba(255, 120, 20, " + (0.7 * heat).toFixed(2) + ")");
            glow.addColorStop(1, "rgba(255, 40, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.moveTo(-hw, 0);
            ctx.lineTo(0, -h);
            ctx.lineTo(hw, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        // Калюжа розплаву, що холоне
        const pool = clamp01((t - 0.3) / 0.3) * (1 - clamp01((t - 0.7) / 0.3));
        if (pool > 0) {
            ctx.fillStyle = "rgba(255, 110, 20, " + (0.8 * pool).toFixed(2) + ")";
            ctx.beginPath();
            ctx.ellipse(x, groundY - 2, hw * 1.3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (kind === "blast") {
        // Ракета: великий вибух, дим і воронка, що лишається на землі
        const craterA = 1 - clamp01((t - 1.8) / 0.8);
        ctx.fillStyle = "rgba(20, 12, 8, " + (0.75 * craterA).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(x, groundY + 1, hw * 1.6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 120, 30, " + (0.6 * craterA * (1 - clamp01(t / 1.2))).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(x, groundY, hw * 1.1, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (t < 0.9) {
            const e = t / 0.9;
            // Ударна хвиля
            ctx.strokeStyle = "rgba(255, 255, 255, " + (0.7 * (1 - e)).toFixed(2) + ")";
            ctx.lineWidth = 4 * (1 - e) + 1;
            ctx.beginPath();
            ctx.arc(x, groundY - h * 0.4, 20 + e * 140, 0, Math.PI * 2);
            ctx.stroke();
            // Вогняні кулі
            for (let i = 0; i < 9; i++) {
                const a = hashRand(i + 3) * Math.PI * 2;
                const d = (0.3 + hashRand(i + 11) * 0.7) * 60 * Math.sqrt(e);
                const rr = (14 + hashRand(i + 21) * 16) * (1 - e * 0.7);
                const cx = x + Math.cos(a) * d;
                const cy = groundY - h * 0.5 + Math.sin(a) * d * 0.7 - e * 30;
                const colors = ["rgba(255, 240, 160, ", "rgba(255, 170, 40, ", "rgba(255, 80, 20, "];
                ctx.fillStyle = colors[i % 3] + (1 - e).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(cx, cy, rr, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // Дим, що здіймається
        if (t > 0.3 && t < 2.2) {
            const sm = (t - 0.3) / 1.9;
            for (let i = 0; i < 5; i++) {
                const cx = x + (hashRand(i + 40) - 0.5) * 50 + sm * 15;
                const cy = groundY - h * 0.6 - sm * 90 - i * 12;
                ctx.fillStyle = "rgba(90, 90, 100, " + (0.45 * (1 - sm)).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(cx, cy, 12 + sm * 18 + i * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (kind === "break") {
        // Кирка: шип тріскається, розсипається блоками, випадає «предмет»
        if (t < 0.18) {
            drawShape(ctx);
            ctx.strokeStyle = "rgba(20, 10, 10, 0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const stages = 1 + Math.floor(t / 0.06);
            for (let i = 0; i < stages * 2; i++) {
                const a = hashRand(i + 5) * Math.PI * 2;
                const len = h * (0.2 + hashRand(i + 9) * 0.25);
                ctx.moveTo(x, groundY - h * 0.4);
                ctx.lineTo(x + Math.cos(a) * len, groundY - h * 0.4 + Math.sin(a) * len * 0.8);
            }
            ctx.stroke();
        }
        // Предмет-кубик підстрибує на місці шипа
        const it = t - 0.12;
        if (it > 0) {
            const bounceT = it % 0.45;
            const amp = 40 * Math.pow(0.45, Math.floor(it / 0.45));
            const y = groundY - 8 - amp * 4 * (bounceT / 0.45) * (1 - bounceT / 0.45);
            const alpha = 1 - clamp01((t - 1.0) / 0.3);
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(Math.sin(it * 3) * 0.3);
            ctx.fillStyle = "#39d6d0";
            ctx.fillRect(-7, -7, 14, 14);
            ctx.fillStyle = "#b8fff8";
            ctx.fillRect(-7, -7, 6, 6);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-7, -7, 14, 14);
        }
    } else if (kind === "goal") {
        // М'яч: шип перекидається назад і відлітає, спалахує «ГОЛ!»
        ctx.save();
        ctx.globalAlpha = 1 - clamp01((t - 0.7) / 0.4);
        ctx.translate(x + hw + t * 200, groundY - t * 260 + t * t * 240);
        ctx.rotate(t * 7);
        ctx.translate(-(x + hw), -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        ctx.translate(x + 40 + t * 140, groundY - h * 0.5 - t * 60);
        drawFootball(ctx, 8, t * 20);
        ctx.restore();
        const pop = t < 0.2 ? t / 0.2 : 1;
        const textA = 1 - clamp01((t - 0.8) / 0.3);
        ctx.globalAlpha = textA;
        ctx.translate(x, groundY - h - 46);
        ctx.scale(0.6 + pop * 0.6, 0.6 + pop * 0.6);
        ctx.font = "900 24px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#0a1a0a";
        ctx.strokeText("ГОЛ!", 0, 0);
        ctx.fillStyle = "#39ff88";
        ctx.fillText("ГОЛ!", 0, 0);
    } else if (kind === "burn") {
        // Вогнемет: шип охоплює полум'я, він чорніє, осідає й лишає жарини
        const char = clamp01(t / 0.6);
        const sink = clamp01((t - 0.55) / 0.6);
        if (sink < 1) {
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1, 1 - sink * 0.9);
            ctx.translate(-x, -groundY);
            drawShape(ctx);
            // Обвуглення поверх шипа
            ctx.fillStyle = "rgba(20, 10, 6, " + (0.85 * char).toFixed(2) + ")";
            ctx.beginPath();
            ctx.moveTo(x - hw, groundY);
            ctx.lineTo(x, groundY - h);
            ctx.lineTo(x + hw, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        // Язики полум'я на шипі
        const fireA = t < 1.0 ? 1 : Math.max(0, 1 - (t - 1.0) / 0.4);
        ctx.globalAlpha = fireA;
        for (let i = 0; i < 5; i++) {
            const fx = x + (i - 2) * hw * 0.4;
            const fy = groundY - h * (1 - sink * 0.9) * (0.25 + 0.6 * (1 - Math.abs(i - 2) / 2.5));
            drawFlameTongue(ctx, fx, Math.min(groundY, fy + h * 0.2), h * (0.45 + 0.2 * hashRand(i)), t * 1000 + i * 131);
        }
        ctx.globalAlpha = 1;
        // Купка жару
        const pile = clamp01((t - 0.8) / 0.2) * (1 - clamp01((t - 1.1) / 0.3));
        if (pile > 0) {
            ctx.fillStyle = "rgba(255, 110, 30, " + (0.8 * pile).toFixed(2) + ")";
            ctx.beginPath();
            ctx.ellipse(x, groundY - 2, hw, 5, 0, Math.PI, 0);
            ctx.fill();
        }
    } else if (SABER_FX_COLORS[kind]) {
        // Світловий меч: розріз навскіс, краї розрізу розжарені кольором леза
        const color = SABER_FX_COLORS[kind];
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.45) / 0.45);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 80, -t * 50 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.4);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        ctx.restore();
        // Розжарений край на нижній половині поступово згасає
        ctx.strokeStyle = color;
        ctx.globalAlpha = fade * (1 - clamp01(t / 0.7));
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (t < 0.25) {
            const a = 1 - t / 0.25;
            ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 - 14, y1 + 6);
            ctx.lineTo(x2 + 14, y2 - 6);
            ctx.stroke();
        }
    } else if (kind === "plasma") {
        // Плазма: шип наливається бірюзовим світлом і розсипається на іскри згори донизу
        const charge = clamp01(t / 0.25);
        const eat = clamp01((t - 0.25) / 0.6);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - hw - 20, groundY - h * (1 - eat), hw * 2 + 40, h * (1 - eat) + 4);
        ctx.clip();
        drawShape(ctx);
        ctx.fillStyle = "rgba(60, 255, 200, " + (0.75 * charge).toFixed(2) + ")";
        ctx.beginPath();
        ctx.moveTo(x - hw, groundY);
        ctx.lineTo(x, groundY - h);
        ctx.lineTo(x + hw, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Край розпаду світиться білим
        if (eat > 0 && eat < 1) {
            const ey = groundY - h * (1 - eat);
            ctx.fillStyle = "rgba(220, 255, 245, 0.9)";
            ctx.fillRect(x - hw * eat, ey - 1.5, hw * 2 * eat, 3);
        }
        // Кільце розряду
        if (t < 0.35) {
            ctx.strokeStyle = "rgba(120, 255, 220, " + (1 - t / 0.35).toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, groundY - h * 0.45, h * (0.3 + t * 2.2), 0, Math.PI * 2);
            ctx.stroke();
        }
    } else if (kind === "shred") {
        // Сюрикени: розріз навскіс, відрізаний шматок відлітає й падає
        const fade = 1 - clamp01((t - 0.4) / 0.4);
        // Перші два сюрикени вже відкололи верхівку (як кулі автомата, по 0.22 висоти),
        // третій розрізає залишок: верхня смуга відлітає, нижня лишається
        const cuts = [0.3];
        const bands = [[0.56, 0.3], [0.3, -0.2]];
        ctx.globalAlpha = fade;
        for (let part = 0; part < 2; part++) {
            const b = bands[part];
            ctx.save();
            ctx.beginPath();
            ctx.rect(x - hw - 40, groundY - h * b[0], hw * 2 + 80, h * (b[0] - b[1]));
            ctx.clip();
            if (part === 0) {
                const cy = groundY - h * (b[0] + b[1]) / 2;
                ctx.translate(t * 60, -t * 60 + t * t * 320);
                ctx.translate(x, cy);
                ctx.rotate(t * 3);
                ctx.translate(-x, -cy);
            }
            drawShape(ctx);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        if (t < 0.2) {
            const a = 1 - t / 0.2;
            ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
            ctx.lineWidth = 2.5;
            for (const c of cuts) {
                ctx.beginPath();
                ctx.moveTo(x - hw * 1.4, groundY - h * c + 4);
                ctx.lineTo(x + hw * 1.4, groundY - h * c - 4);
                ctx.stroke();
            }
        }
    } else if (kind === "fireslice") {
        // Вогняний меч: розріз навскіс, обидві половинки палають
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.45) / 0.45);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 80, -t * 50 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.6);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        drawFlameTongue(ctx, x, groundY - h * 0.5, h * 0.5, t * 1000);
        ctx.restore();
        drawFlameTongue(ctx, x - hw * 0.4, groundY - h * 0.3, h * 0.45, t * 1000 + 300);
        drawFlameTongue(ctx, x + hw * 0.3, groundY - h * 0.2, h * 0.35, t * 1000 + 600);
        ctx.globalAlpha = 1;
        if (t < 0.25) {
            const a = 1 - t / 0.25;
            ctx.strokeStyle = "rgba(255, 200, 60, " + a.toFixed(2) + ")";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x1 - 14, y1 + 6);
            ctx.lineTo(x2 + 14, y2 - 6);
            ctx.stroke();
        }
    } else if (kind === "zap") {
        // Громовий молот: шип спалахує блакитним, по ньому біжать розряди, і він розлітається
        const grow = 1 + k * 0.2;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.translate(x, groundY - h * 0.4);
        ctx.scale(grow, grow);
        ctx.translate(-x, -(groundY - h * 0.4));
        drawShape(ctx);
        ctx.fillStyle = "rgba(170, 230, 255, 0.6)";
        ctx.beginPath();
        ctx.moveTo(x - hw, groundY);
        ctx.lineTo(x, groundY - h);
        ctx.lineTo(x + hw, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "rgba(220, 245, 255, " + (1 - k).toFixed(2) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let px = x;
            let py = groundY - h * 0.5;
            ctx.moveTo(px, py);
            for (let j = 0; j < 3; j++) {
                px += Math.cos(i * 1.3 + j) * 10 + (hashRand(i * 7 + j + Math.floor(t * 30)) - 0.5) * 12;
                py += Math.sin(i * 1.3 + j) * 10 + (hashRand(i * 11 + j) - 0.5) * 12;
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    } else if (kind === "fling") {
        // Гравітаційна гармата: промінь піднімає шип, притягує його до кубика й тримає,
        // погойдуючи; щойно промінь гасне — шип відстрілюється вперед і вгору, зникаючи зірочкою
        const liftPx = h * GRAVITY_LIFT_RATIO;
        const toPull = opts && typeof opts.pullX === "number" ? opts.pullX - x : 0;
        const hold = gravityHoldOffset(Math.min(t, GRAVITY_LIFT), h, toPull);
        let dx = hold.dx;
        let dy = hold.dy;
        // Поки тягне, шип нахиляється до кубика
        let spin = Math.sin(t * 14) * 0.12 * clamp01(t / 0.15) - 0.35 * clamp01(t / GRAVITY_LIFT) * (toPull < 0 ? 1 : 0);
        let scale = 1;
        const f = t - GRAVITY_LIFT;
        if (f > 0) {
            dx = hold.dx + f * 900 + f * f * 700;
            dy = -liftPx - f * 260 - f * f * 260;
            spin = f * 13;
            scale = Math.max(0, 1 - f * 1.1);
        }
        if (scale > 0.02) {
            const cy = groundY - h * 0.4 + dy;
            const glow = ctx.createRadialGradient(x + dx, cy, 2, x + dx, cy, h * 0.9 * scale);
            glow.addColorStop(0, "rgba(190, 150, 255, 0.55)");
            glow.addColorStop(1, "rgba(120, 80, 255, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(x + dx - h, cy - h, h * 2, h * 2);
            ctx.save();
            ctx.translate(x + dx, cy);
            ctx.rotate(spin);
            ctx.scale(scale, scale);
            ctx.translate(-x, -(groundY - h * 0.4));
            drawShape(ctx);
            ctx.restore();
        }
        // Спалах-кільце в мить пострілу — там, де шип висів перед кубиком
        if (f > 0 && f < 0.25) {
            const e = f / 0.25;
            ctx.strokeStyle = "rgba(220, 200, 255, " + (1 - e).toFixed(2) + ")";
            ctx.lineWidth = 3 * (1 - e) + 1;
            ctx.beginPath();
            ctx.arc(x + hold.dx, groundY - h * 0.4 - liftPx, 10 + e * 40, 0, Math.PI * 2);
            ctx.stroke();
            // Смуги швидкості позаду шипа
            ctx.fillStyle = "rgba(200, 180, 255, " + (0.7 * (1 - e)).toFixed(2) + ")";
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + dx - 30 - i * 14, groundY - h * 0.4 + dy - 8 + i * 8, 24, 2);
            }
        }
        // Зірочка там, де шип зник у небі
        const star = f > 0.6 ? Math.sin(clamp01((f - 0.6) / 0.35) * Math.PI) : 0;
        if (star > 0) {
            const sf = 0.72;
            const sx = x + hold.dx + sf * 900 + sf * sf * 700;
            const sy = groundY - h * 0.4 - liftPx - sf * 260 - sf * sf * 260;
            ctx.fillStyle = "rgba(255, 255, 255, " + star.toFixed(2) + ")";
            ctx.fillRect(sx - 1.5, sy - 9 * star, 3, 18 * star);
            ctx.fillRect(sx - 9 * star, sy - 1.5, 18 * star, 3);
        }
    }
    ctx.restore();
}
