// ============================================================
// weapons_projectiles.js — снаряди й промені: стріли, кулі, ракети, бумеранг, м'яч,
// лазер, вогнемет, блискавка, гравітаційний захват, застрягла стріла
// ============================================================

import { drawAxeShape, drawFootball, drawSaberShape, drawShurikenShape } from "./weapons_held.js";
import { GRAVITY_GRAB, GRAVITY_LIFT, clamp01, hashRand } from "./weapons.js";

// ---------- Снаряди ----------

// kind: arrow / bullet / rocket / axe / ball. angle — напрям польоту, age — секунди польоту.
// prev — попередні точки польоту (для диму ракети).
export function drawProjectile(ctx, kind, x, y, angle, age, s, prev, color) {
    ctx.save();
    if (kind === "rocket" && prev) {
        for (let i = 0; i < prev.length; i++) {
            const p = prev[i];
            const a = 0.45 * (1 - i / prev.length);
            ctx.fillStyle = "rgba(200, 200, 210, " + a.toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 + i * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.translate(x, y);
    if (kind === "axe") {
        ctx.rotate(age * 22);
        ctx.translate(0, s * 0.3);
        drawAxeShape(ctx, s);
    } else if (kind === "saber") {
        // Меч летить, обертаючись навколо центру, і лишає світлий слід
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = color || "#39ff5a";
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.rotate(age * 20);
        ctx.translate(0, s * 0.45);
        drawSaberShape(ctx, s * 0.85, age * 1000, color || "#39ff5a");
    } else if (kind === "ball") {
        drawFootball(ctx, s * 0.2, age * 18);
    } else if (kind === "shuriken") {
        // Сюрикен шалено крутиться, за ним — тонка срібляста дуга обертання
        ctx.strokeStyle = "rgba(223, 232, 244, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.28, age * 40, age * 40 + Math.PI * 0.8);
        ctx.stroke();
        drawShurikenShape(ctx, s * 0.26, age * 40);
    } else if (kind === "plasma") {
        // Куля плазми: сяйне ядро, що пульсує, і розріджений бірюзовий хвіст
        ctx.restore();
        ctx.save();
        if (prev) {
            for (let i = prev.length - 1; i >= 1; i--) {
                const a = 0.5 * (1 - i / prev.length);
                ctx.fillStyle = "rgba(60, 255, 200, " + a.toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(prev[i].x, prev[i].y, s * (0.13 - i * 0.012), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        const pulse = 1 + Math.sin(age * 50) * 0.12;
        ctx.fillStyle = "rgba(60, 255, 200, 0.35)";
        ctx.beginPath();
        ctx.arc(x, y, s * 0.24 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7affd8";
        ctx.beginPath();
        ctx.arc(x, y, s * 0.13 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.rotate(angle);
        if (kind === "arrow") {
            ctx.fillStyle = "#c8a060";
            ctx.fillRect(-s * 0.6, -1, s * 0.6, 2);
            ctx.fillStyle = "#b8c4d0";
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-s * 0.6, -4, 6, 3);
            ctx.fillRect(-s * 0.6, 1, 6, 3);
        } else if (kind === "bullet") {
            const g = ctx.createLinearGradient(-28, 0, 4, 0);
            g.addColorStop(0, "rgba(255, 220, 120, 0)");
            g.addColorStop(1, "rgba(255, 250, 200, 1)");
            ctx.fillStyle = g;
            ctx.fillRect(-28, -1.5, 32, 3);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, -2, 5, 4);
        } else if (kind === "rocket") {
            const flame = 6 + Math.sin(age * 60) * 3;
            ctx.fillStyle = "#ffb81a";
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, -3);
            ctx.lineTo(-s * 0.3 - flame, 0);
            ctx.lineTo(-s * 0.3, 3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#dcdcdc";
            ctx.fillRect(-s * 0.3, -4, s * 0.4, 8);
            ctx.fillStyle = "#e8202a";
            ctx.beginPath();
            ctx.moveTo(s * 0.1, -4);
            ctx.lineTo(s * 0.24, 0);
            ctx.lineTo(s * 0.1, 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(-s * 0.3, -7, 6, 3);
            ctx.fillRect(-s * 0.3, 4, 6, 3);
        }
    }
    ctx.restore();
}

// Промінь лазера від дула до шипа; t — від 0 до 1 за час пострілу
export function drawLaserBeam(ctx, x1, y1, x2, y2, t, time) {
    const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    const w = 3 + 5 * a + Math.sin(time * 0.08) * 1.2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 46, 136, " + (0.35 * a).toFixed(2) + ")";
    ctx.lineWidth = w * 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 120, 190, " + a.toFixed(2) + ")";
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
    ctx.lineWidth = Math.max(1, w * 0.35);
    ctx.stroke();
    // Спалах у точці влучання
    ctx.fillStyle = "rgba(255, 220, 240, " + (0.8 * a).toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(x2, y2, 6 + 6 * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Струмінь вогнемета: хвиля язиків полум'я від сопла до шипа
function drawFlameStream(ctx, x1, y1, x2, y2, t, time) {
    const reach = Math.min(1, t / 0.3);
    const fade = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;
    const n = 14;
    ctx.save();
    for (let i = n - 1; i >= 0; i--) {
        const k = i / (n - 1);
        if (k > reach) {
            continue;
        }
        const px = x1 + (x2 - x1) * k;
        const wob = Math.sin(time * 0.03 + i * 1.7) * (2 + k * 6);
        const py = y1 + (y2 - y1) * k + wob;
        const r = 3 + k * 11;
        const colors = ["255, 240, 150", "255, 180, 40", "255, 90, 20", "200, 40, 10"];
        const ci = Math.min(3, Math.floor(k * 4));
        ctx.fillStyle = "rgba(" + colors[ci] + ", " + (0.85 * fade).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }
    // Дим на кінці струменя
    ctx.fillStyle = "rgba(80, 70, 70, " + (0.35 * fade * reach).toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(x2 + 6, y2 - 16 - t * 20, 9 + t * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Блискавка з неба в шип
function drawThunderBolt(ctx, x2, y2, t, time) {
    const a = t < 0.1 ? t / 0.1 : Math.max(0, 1 - (t - 0.1) / 0.9);
    if (a <= 0) {
        return;
    }
    const top = y2 - 420;
    const seg = 9;
    const seed = Math.floor(time / 60);
    const pts = [];
    for (let i = 0; i <= seg; i++) {
        const k = i / seg;
        const jitter = i === 0 || i === seg ? 0 : (hashRand(seed * 13 + i) - 0.5) * 36;
        pts.push([x2 + jitter, top + (y2 - top) * k]);
    }
    ctx.save();
    ctx.lineJoin = "round";
    const passes = [[14, "rgba(120, 200, 255, " + (0.35 * a).toFixed(2) + ")"], [6, "rgba(170, 230, 255, " + (0.8 * a).toFixed(2) + ")"], [2.5, "rgba(255, 255, 255, " + a.toFixed(2) + ")"]];
    for (const pass of passes) {
        ctx.strokeStyle = pass[1];
        ctx.lineWidth = pass[0];
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
    }
    const flash = ctx.createRadialGradient(x2, y2, 2, x2, y2, 70);
    flash.addColorStop(0, "rgba(255, 255, 255, " + (0.9 * a).toFixed(2) + ")");
    flash.addColorStop(1, "rgba(120, 200, 255, 0)");
    ctx.fillStyle = flash;
    ctx.fillRect(x2 - 70, y2 - 70, 140, 140);
    ctx.restore();
}

// Гравітаційний захват: промінь витягується з гармати до шипа, тримає його,
// поки той піднімається, і гасне в мить кидка. t — від 0 до 1 за весь час променя.
function drawGravityTether(ctx, x1, y1, x2, y2, t, time, grabFrac) {
    const ext = clamp01(t / grabFrac);
    const a = t > 0.94 ? clamp01((1 - t) / 0.06) : 1;
    if (a <= 0) {
        return;
    }
    const ex = x1 + (x2 - x1) * ext;
    const ey = y1 + (y2 - y1) * ext;
    ctx.save();
    ctx.lineCap = "round";
    // Широке сяйво й хвиляста серцевина
    ctx.strokeStyle = "rgba(140, 90, 255, " + (0.3 * a).toFixed(2) + ")";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.strokeStyle = "rgba(200, 170, 255, " + (0.9 * a).toFixed(2) + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const n = 20;
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const px = x1 + (ex - x1) * k;
        const py = y1 + (ey - y1) * k + Math.sin(k * 14 - time * 0.03) * 3.5 * Math.sin(Math.PI * k);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    // Кільця, що біжать від гармати до шипа
    for (let i = 0; i < 3; i++) {
        const k = ((time * 0.002) + i / 3) % 1;
        if (k > ext) {
            continue;
        }
        const px = x1 + (x2 - x1) * k;
        const py = y1 + (y2 - y1) * k;
        ctx.strokeStyle = "rgba(220, 200, 255, " + (0.7 * a * (1 - k)).toFixed(2) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, 4, 8 + k * 6, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Захват на кінці променя, коли він дотягнувся до шипа
    if (ext >= 1) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 0.02);
        const grip = ctx.createRadialGradient(ex, ey, 1, ex, ey, 22);
        grip.addColorStop(0, "rgba(255, 255, 255, " + (0.8 * a * pulse).toFixed(2) + ")");
        grip.addColorStop(0.4, "rgba(180, 140, 255, " + (0.5 * a).toFixed(2) + ")");
        grip.addColorStop(1, "rgba(120, 80, 255, 0)");
        ctx.fillStyle = grip;
        ctx.fillRect(ex - 22, ey - 22, 44, 44);
    }
    ctx.restore();
}

// Дія зброї на відстані: вигляд залежить від зброї
// grabFrac — для гравітаційної гармати: частка часу, за яку промінь дотягується до шипа
export function drawBeam(ctx, kind, x1, y1, x2, y2, t, time, grabFrac) {
    if (kind === "flame") {
        drawFlameStream(ctx, x1, y1, x2, y2, t, time);
    } else if (kind === "thunder") {
        drawThunderBolt(ctx, x2, y2, t, time);
    } else if (kind === "gravity") {
        drawGravityTether(ctx, x1, y1, x2, y2, t, time, grabFrac || GRAVITY_GRAB / (GRAVITY_GRAB + GRAVITY_LIFT));
    } else {
        drawLaserBeam(ctx, x1, y1, x2, y2, t, time);
    }
}

// Стріла, що застрягла в землі й дрижить
export function drawStuckArrow(ctx, x, groundY, t, s) {
    const wobble = Math.sin(t * 40) * Math.max(0, 0.3 - t) * 0.8;
    const alpha = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / 0.4) : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, groundY);
    ctx.rotate(0.5 + wobble);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(-1, -s * 0.6, 2, s * 0.6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -s * 0.6, 3, 6);
    ctx.fillRect(1, -s * 0.6, 3, 6);
    ctx.restore();
}
