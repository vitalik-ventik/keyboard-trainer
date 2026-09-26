// backgrounds/living_worlds.js — додаткове життя в сюжетах бази, болота, підземелля, пустелі, колонії, вершини

import { drawPixelDisc, smoothStep } from "./helpers.js";
import { drawBeam } from "./story.js";
import { drawXeno, extendStory } from "./monsters.js";

// ============================================================
// Більше життя в «нудних» світах: база, болото, підземелля, пустеля, колонія, вершина
// ============================================================

// Цикл руху через екран: k від 0 до 1 кожні period секунд (зі зсувом phase)
function crossK(time, period, phase) {
    return ((time / period + (phase || 0)) % 1 + 1) % 1;
}

// 1-16 Секретна база: пари винищувачів, вантажівка з НЛО, яке наприкінці вириваєтся на волю
extendStory("secret_base", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const jk = crossK(time, 7);
    if (jk < 0.35) {
        for (let n = 0; n < 2; n++) {
            const x = W * (1.1 - jk / 0.35 * 1.4) + n * B * 5;
            const y = gY * (0.18 + n * 0.06);
            ctx.fillStyle = "#6a7488";
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 4), Math.round(B * 0.6));
            ctx.beginPath();
            ctx.moveTo(x + B * 1.2, y);
            ctx.lineTo(x + B * 2.6, y - B * 1.4);
            ctx.lineTo(x + B * 3, y);
            ctx.fill();
            ctx.fillRect(Math.round(x + B * 3.4), Math.round(y - B * 0.8), Math.round(B * 0.6), Math.round(B * 0.8));
            ctx.fillStyle = "#7df9ff";
            ctx.fillRect(Math.round(x + B * 0.4), Math.round(y + B * 0.1), Math.round(B * 0.6), Math.round(B * 0.3));
            ctx.fillStyle = "rgba(255, 160, 40, 0.9)";
            ctx.fillRect(Math.round(x + B * 4), Math.round(y + B * 0.1), Math.round(B * (1 + Math.random())), Math.round(B * 0.4));
        }
    }
    // Вантажівка везе полонене НЛО під брезентом
    const tk = crossK(time, 16, 0.2);
    const tx = -B * 14 + tk * (W + B * 28);
    const ty = gY - B * 0.3;
    const freed = s2 > 0 ? smoothStep((p - 0.7) / 0.2) : 0;
    ctx.fillStyle = "#3a4a3a";
    ctx.fillRect(Math.round(tx), Math.round(ty - B * 1.6), Math.round(B * 9), Math.round(B * 0.8));
    ctx.fillRect(Math.round(tx + B * 9), Math.round(ty - B * 2.6), Math.round(B * 2.6), Math.round(B * 1.8));
    ctx.fillStyle = "#7df9ff";
    ctx.fillRect(Math.round(tx + B * 10.2), Math.round(ty - B * 2.4), Math.round(B * 1.1), Math.round(B * 0.7));
    ctx.fillStyle = "#1a1a1a";
    for (const wx of [1, 3, 7, 10.5]) {
        ctx.fillRect(Math.round(tx + B * wx), Math.round(ty - B * 0.8), Math.round(B * 0.9), Math.round(B * 0.8));
    }
    const ux = tx + B * 4.5 + freed * W * 0.5;
    const uy = ty - B * 2.4 - freed * gY * 0.7;
    ctx.fillStyle = "#9aa4b8";
    ctx.beginPath();
    ctx.ellipse(ux, uy, B * 3.5, B * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(150, 230, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(ux, uy - B * 0.4, B * 1.4, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#5ad85a";
    ctx.fillRect(Math.round(ux - B * 0.4), Math.round(uy - B * 1.3), Math.round(B * 0.8), Math.round(B * 0.8));
    for (let l = 0; l < 5; l++) {
        ctx.fillStyle = (Math.floor(time * 6) + l) % 5 === 0 ? "#ffe14d" : "#5a6070";
        ctx.fillRect(Math.round(ux - B * 2.8 + l * B * 1.3), Math.round(uy), 3, 3);
    }
    if (freed < 0.05) {
        // Брезент і мотузки, поки НЛО ще в полоні
        ctx.fillStyle = "rgba(90, 100, 70, 0.85)";
        ctx.fillRect(Math.round(ux - B * 3.6), Math.round(uy - B * 1.2), Math.round(B * 3.4), Math.round(B * 1.6));
        ctx.fillStyle = "#c8b890";
        ctx.fillRect(Math.round(ux - B * 1.5), Math.round(uy - B * 1.6), 2, Math.round(B * 2.2));
        ctx.fillRect(Math.round(ux + B * 1.5), Math.round(uy - B * 1.6), 2, Math.round(B * 2.2));
    } else {
        drawBeam(ctx, ux, uy + B * 0.6, Math.PI / 2, gY * 0.4, 0.2, "rgba(255, 240, 120, " + (0.2 * freed).toFixed(3) + ")");
    }
});

// 1-18 Туманне болото: місяць крізь туман, крокодил висовує очі й клацає пащею,
// жаба-співак на лататті, відьма на мітлі пролітає повз місяць
extendStory("soggy_swamp", function (ctx, W, H, gY, time, B, p, s1, s2) {
    drawPixelDisc(ctx, W * 0.2, gY * 0.22, B * 3.2, B, "rgba(230, 240, 210, 0.35)");
    drawPixelDisc(ctx, W * 0.2, gY * 0.22, B * 2.2, B, "rgba(240, 245, 220, 0.7)");
    if (s1 > 0) {
        const wk = crossK(time, 9, 0.3);
        const wx = W * (1.1 - wk * 1.3);
        const wy = gY * 0.22 + Math.sin(time * 2) * B;
        ctx.fillStyle = "#1a1a24";
        ctx.fillRect(Math.round(wx - B * 2), Math.round(wy), Math.round(B * 5), Math.round(B * 0.3));
        ctx.fillRect(Math.round(wx + B * 2.6), Math.round(wy - B * 0.3), Math.round(B * 0.9), Math.round(B * 0.8));
        ctx.fillRect(Math.round(wx), Math.round(wy - B * 1.6), Math.round(B * 1.2), Math.round(B * 1.6));
        ctx.beginPath();
        ctx.moveTo(wx - B * 0.2, wy - B * 1.6);
        ctx.lineTo(wx + B * 1.4, wy - B * 1.6);
        ctx.lineTo(wx + B * 0.3, wy - B * 3.2);
        ctx.fill();
        ctx.fillStyle = "#5ad85a";
        ctx.fillRect(Math.round(wx + B * 0.7), Math.round(wy - B * 1.4), Math.round(B * 0.3), Math.round(B * 0.3));
    }
    // Крокодил пливе й клацає пащею
    const ck = crossK(time, 11, 0.6);
    const cx = W * (1.05 - ck * 1.2);
    const cy = gY - B * 1.4;
    const snap = Math.sin(time * 1.3) > 0.85 ? B * 0.8 : 0;
    ctx.fillStyle = "#3a5a2a";
    ctx.fillRect(Math.round(cx), Math.round(cy - B * 0.5), Math.round(B * 3), Math.round(B * 0.5));
    ctx.fillRect(Math.round(cx), Math.round(cy - B * 0.5 - snap), Math.round(B * 2.4), Math.round(B * 0.4));
    ctx.fillRect(Math.round(cx + B * 2.4), Math.round(cy - B * 1), Math.round(B * 0.6), Math.round(B * 0.6));
    ctx.fillRect(Math.round(cx + B * 3.2), Math.round(cy - B * 1), Math.round(B * 0.6), Math.round(B * 0.6));
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(Math.round(cx + B * 2.55), Math.round(cy - B * 0.9), 3, 3);
    ctx.fillRect(Math.round(cx + B * 3.35), Math.round(cy - B * 0.9), 3, 3);
    ctx.fillStyle = "#ffffff";
    if (snap > 0) {
        for (let k = 0; k < 4; k++) {
            ctx.fillRect(Math.round(cx + B * 0.3 + k * B * 0.5), Math.round(cy - B * 0.5 - snap + B * 0.4), 2, 3);
        }
    }
    // Жаба-співак: горловий міхур надувається
    const fx = W * 0.08;
    const fy = gY - B * 1.5;
    ctx.fillStyle = "#3a8a3a";
    ctx.fillRect(Math.round(fx - B * 1.5), Math.round(fy + B * 0.3), Math.round(B * 3), Math.round(B * 0.3));
    ctx.fillStyle = "#4cc24a";
    ctx.fillRect(Math.round(fx - B * 0.8), Math.round(fy - B * 0.8), Math.round(B * 1.6), Math.round(B * 1.1));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(fx - B * 0.7), Math.round(fy - B * 1.1), Math.round(B * 0.4), Math.round(B * 0.4));
    ctx.fillRect(Math.round(fx + B * 0.3), Math.round(fy - B * 1.1), Math.round(B * 0.4), Math.round(B * 0.4));
    const croak = Math.max(0, Math.sin(time * 3));
    if (croak > 0.1) {
        ctx.fillStyle = "rgba(255, 220, 160, 0.9)";
        drawPixelDisc(ctx, fx, fy + B * 0.1, B * (0.3 + croak * 0.6), Math.max(2, B / 4), "rgba(255, 220, 160, 0.9)");
    }
});

// 1-21 Підземелля: маятники-леза, павук на павутинці, скелети марширують за гратами
extendStory("dungeon_depths", function (ctx, W, H, gY, time, B, p, s1, s2) {
    for (let n = 0; n < 2; n++) {
        const k = crossK(time, 8, n * 0.5);
        const px = W * (1.1 - k * 1.3);
        const ang = Math.sin(time * 1.6 + n) * 0.7;
        const len = gY * 0.45;
        const bx = px + Math.sin(ang) * len;
        const by = Math.cos(ang) * len;
        ctx.strokeStyle = "#5a5a64";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-ang);
        ctx.fillStyle = "#b8c0cc";
        ctx.beginPath();
        ctx.arc(0, 0, B * 1.8, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#e8eef4";
        ctx.fillRect(-B * 1.8, B * 0.1, B * 3.6, B * 0.2);
        ctx.restore();
    }
    // Павук спускається й піднімається
    const sx = W * 0.35;
    const sy = gY * (0.25 + 0.2 * (0.5 + 0.5 * Math.sin(time * 0.8)));
    ctx.strokeStyle = "rgba(220, 220, 230, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.fillStyle = "#1a1418";
    ctx.fillRect(Math.round(sx - B * 0.6), Math.round(sy), Math.round(B * 1.2), Math.round(B));
    for (let k = 0; k < 4; k++) {
        const w = Math.sin(time * 8 + k) * 2;
        ctx.fillRect(Math.round(sx - B * 1.3), Math.round(sy + k * B * 0.25 + w), Math.round(B * 0.7), 2);
        ctx.fillRect(Math.round(sx + B * 0.6), Math.round(sy + k * B * 0.25 - w), Math.round(B * 0.7), 2);
    }
    ctx.fillStyle = "#ff3a3a";
    ctx.fillRect(Math.round(sx - B * 0.3), Math.round(sy + B * 0.7), 2, 2);
    ctx.fillRect(Math.round(sx + B * 0.2), Math.round(sy + B * 0.7), 2, 2);
    if (s1 > 0) {
        const k = crossK(time, 14);
        for (let n = 0; n < 3; n++) {
            const x = -B * 6 + k * (W + B * 12) - n * B * 3;
            const y = gY - B * 1.2;
            const step = Math.sin(time * 7 + n) > 0 ? B * 0.3 : 0;
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#e8e4d8";
            ctx.fillRect(Math.round(x), Math.round(y - B * 4.4), Math.round(B * 1.2), Math.round(B * 1.1));
            ctx.fillRect(Math.round(x + B * 0.35), Math.round(y - B * 3.3), Math.round(B * 0.5), Math.round(B * 1.8));
            ctx.fillRect(Math.round(x + B * 0.1), Math.round(y - B * 1.5 - step), Math.round(B * 0.3), Math.round(B * 1.5));
            ctx.fillRect(Math.round(x + B * 0.8), Math.round(y - B * 1.5 - (B * 0.3 - step)), Math.round(B * 0.3), Math.round(B * 1.5));
            ctx.fillStyle = "#1a1418";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 4.1), Math.round(B * 0.3), Math.round(B * 0.3));
            ctx.fillRect(Math.round(x + B * 0.7), Math.round(y - B * 4.1), Math.round(B * 0.3), Math.round(B * 0.3));
            ctx.fillStyle = "#8a6a3a";
            ctx.fillRect(Math.round(x + B * 1.2), Math.round(y - B * 3.4), Math.round(B * 0.2), Math.round(B * 2));
            ctx.globalAlpha = 1;
        }
    }
});

// 2-2 Пустельний храм: караван верблюдів на дюнах, перекотиполе, стерв'ятники,
// а згодом із храму виходить мумія
extendStory("desert_temple", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const ck = crossK(time, 30);
    for (let n = 0; n < 3; n++) {
        const x = W * (1.05 - ck * 1.3) + n * B * 4;
        const y = gY * 0.62 + Math.sin(time * 3 + n) * 1;
        ctx.fillStyle = "#7a5a3a";
        ctx.fillRect(Math.round(x), Math.round(y - B * 1.2), Math.round(B * 2.2), Math.round(B * 0.8));
        ctx.fillRect(Math.round(x + B * 0.6), Math.round(y - B * 1.7), Math.round(B * 0.8), Math.round(B * 0.5));
        ctx.fillRect(Math.round(x - B * 0.5), Math.round(y - B * 1.9), Math.round(B * 0.4), Math.round(B * 1));
        ctx.fillRect(Math.round(x - B * 0.8), Math.round(y - B * 1.9), Math.round(B * 0.5), Math.round(B * 0.3));
        ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 0.4), 2, Math.round(B * 0.4));
        ctx.fillRect(Math.round(x + B * 1.8), Math.round(y - B * 0.4), 2, Math.round(B * 0.4));
    }
    for (let n = 0; n < 2; n++) {
        const k = crossK(time, 6, n * 0.5);
        const x = W * (1.1 - k * 1.25);
        const y = gY - B * 0.8 - Math.abs(Math.sin(time * 4 + n)) * B * 1.5;
        ctx.strokeStyle = "#a0783a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, B * 0.8, 0, Math.PI * 2);
        ctx.moveTo(x - B * 0.8, y);
        ctx.lineTo(x + B * 0.8, y);
        ctx.moveTo(x, y - B * 0.8);
        ctx.lineTo(x, y + B * 0.8);
        ctx.stroke();
    }
    for (let n = 0; n < 2; n++) {
        const a = time * 0.5 + n * Math.PI;
        const x = W * 0.6 + Math.cos(a) * B * 8;
        const y = gY * 0.2 + Math.sin(a) * B * 2;
        const wing = Math.sin(time * 4 + n) > 0 ? -B * 0.4 : 0;
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(Math.round(x - B), Math.round(y + wing), Math.round(B * 2), Math.round(B * 0.3));
        ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.5), Math.round(B * 0.4));
    }
    if (s1 > 0) {
        const k = crossK(time, 18, 0.1);
        const x = -B * 4 + k * (W + B * 8);
        const y = gY - B * 0.6;
        const step = Math.sin(time * 4) > 0 ? B * 0.25 : 0;
        ctx.globalAlpha = s1;
        ctx.fillStyle = "#e8dcc0";
        ctx.fillRect(Math.round(x), Math.round(y - B * 4), Math.round(B * 1.6), Math.round(B * 2.4));
        ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 5.2), Math.round(B * 1.2), Math.round(B * 1.2));
        ctx.fillRect(Math.round(x + B * 1.6), Math.round(y - B * 3.6), Math.round(B * 1.4), Math.round(B * 0.4));
        ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 1.6 - step), Math.round(B * 0.5), Math.round(B * 1.6));
        ctx.fillRect(Math.round(x + B * 0.9), Math.round(y - B * 1.6 - (B * 0.25 - step)), Math.round(B * 0.5), Math.round(B * 1.6));
        ctx.fillStyle = "#b8a888";
        for (let k2 = 0; k2 < 5; k2++) {
            ctx.fillRect(Math.round(x), Math.round(y - B * (4 - k2 * 0.5)), Math.round(B * 1.6), 1);
        }
        ctx.fillStyle = "#5affff";
        ctx.fillRect(Math.round(x + B * 0.45), Math.round(y - B * 4.8), 3, 3);
        ctx.fillRect(Math.round(x + B * 1.05), Math.round(y - B * 4.8), 3, 3);
        ctx.globalAlpha = 1;
    }
});

// 2-7 Колонія на планеті: всюдихід із фарами, крокуючий вантажник, колоністи з ліхтариками,
// а на даху модуля мелькає ксеноморф
extendStory("planet_colony", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const rk = crossK(time, 12, 0.3);
    const rx = -B * 10 + rk * (W + B * 20);
    const ry = gY - B * 0.3;
    ctx.fillStyle = "#6a6a74";
    ctx.fillRect(Math.round(rx), Math.round(ry - B * 2.2), Math.round(B * 6), Math.round(B * 1.6));
    ctx.fillRect(Math.round(rx + B * 1), Math.round(ry - B * 3.2), Math.round(B * 3), Math.round(B));
    ctx.fillStyle = "#7df9ff";
    ctx.fillRect(Math.round(rx + B * 3.2), Math.round(ry - B * 3), Math.round(B * 0.6), Math.round(B * 0.5));
    ctx.fillStyle = "#1a1a1a";
    for (const wx of [0.4, 2.4, 4.4]) {
        ctx.fillRect(Math.round(rx + B * wx), Math.round(ry - B * 0.8), Math.round(B * 1.1), Math.round(B * 0.8));
    }
    drawBeam(ctx, rx + B * 6, ry - B * 1.6, 0.05, B * 12, 0.12, "rgba(255, 240, 180, 0.18)");
    if (s1 > 0) {
        const lk = crossK(time, 20, 0.6);
        const lx = W * (1.05 - lk * 1.2);
        const step = Math.sin(time * 3) > 0 ? B * 0.4 : 0;
        ctx.globalAlpha = s1;
        ctx.fillStyle = "#e8b020";
        ctx.fillRect(Math.round(lx), Math.round(gY - B * 5.5), Math.round(B * 3), Math.round(B * 2.6));
        ctx.fillStyle = "rgba(140, 200, 255, 0.5)";
        ctx.fillRect(Math.round(lx + B * 0.5), Math.round(gY - B * 5.1), Math.round(B * 2), Math.round(B * 1.2));
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(Math.round(lx + B * 0.2), Math.round(gY - B * 2.9 - step), Math.round(B * 0.8), Math.round(B * 2.6 + step));
        ctx.fillRect(Math.round(lx + B * 2), Math.round(gY - B * 2.9 - (B * 0.4 - step)), Math.round(B * 0.8), Math.round(B * 2.6));
        ctx.fillStyle = "#6a5a2a";
        ctx.fillRect(Math.round(lx - B * 2), Math.round(gY - B * 5), Math.round(B * 2), Math.round(B * 1.8));
        ctx.globalAlpha = 1;
    }
    if (s2 > 0) {
        for (let n = 0; n < 3; n++) {
            const k = crossK(time, 15, n * 0.12);
            const x = -B * 3 + k * (W + B * 6);
            const y = gY - B * 0.6;
            ctx.fillStyle = "#4a5a6a";
            ctx.fillRect(Math.round(x), Math.round(y - B * 3), Math.round(B), Math.round(B * 3));
            ctx.fillStyle = "#e0b890";
            ctx.fillRect(Math.round(x + B * 0.1), Math.round(y - B * 3.8), Math.round(B * 0.8), Math.round(B * 0.8));
            drawBeam(ctx, x + B, y - B * 2, -0.2 + Math.sin(time * 2 + n) * 0.3, B * 8, 0.12, "rgba(255, 250, 200, 0.2)");
        }
        // Натяк: на даху модуля пробігає ксеноморф
        const xk = crossK(time, 9, 0.4);
        if (xk < 0.5) {
            drawXeno(ctx, W * (1.1 - xk * 2.6), gY * 0.72, B, time, 0.55, -1, 0.9 * s2);
        }
    }
});

// 2-12 Обсидіанова вершина: над шпилями пролітає чорний дракон, пливуть острови з водоспадами,
// високі тіні з фіолетовими очима телепортуються
extendStory("obsidian_peak", function (ctx, W, H, gY, time, B, p, s1, s2) {
    for (let n = 0; n < 2; n++) {
        const k = crossK(time, 25, n * 0.5);
        const x = W * (1.1 - k * 1.3);
        const y = gY * (0.25 + n * 0.12) + Math.sin(time * 0.8 + n) * B;
        ctx.fillStyle = "#1a1228";
        ctx.fillRect(Math.round(x - B * 3), Math.round(y), Math.round(B * 6), Math.round(B * 1.2));
        ctx.fillRect(Math.round(x - B * 2), Math.round(y + B * 1.2), Math.round(B * 4), Math.round(B));
        ctx.fillRect(Math.round(x - B), Math.round(y + B * 2.2), Math.round(B * 2), Math.round(B));
        ctx.fillStyle = "#3a8a3a";
        ctx.fillRect(Math.round(x - B * 3), Math.round(y - B * 0.4), Math.round(B * 6), Math.round(B * 0.4));
        ctx.fillStyle = "rgba(120, 200, 255, 0.6)";
        const fall = (time * 60) % (B * 3);
        ctx.fillRect(Math.round(x + B * 2), Math.round(y + B * 1.2), 2, Math.round(B * 2 + fall));
    }
    for (let n = 0; n < 3; n++) {
        const ph = (time * 0.25 + n * 0.37) % 1;
        const x = W * ((n * 0.31 + Math.floor(time * 0.25 + n * 0.37) * 0.23) % 1);
        const y = gY - B * 0.5;
        if (ph < 0.85) {
            ctx.fillStyle = "#08060c";
            ctx.fillRect(Math.round(x), Math.round(y - B * 6), Math.round(B * 1.2), Math.round(B * 6));
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y - B * 7.2), Math.round(B * 1.6), Math.round(B * 1.2));
            ctx.fillStyle = "#e080ff";
            ctx.fillRect(Math.round(x), Math.round(y - B * 6.8), Math.round(B * 0.4), Math.round(B * 0.2));
            ctx.fillRect(Math.round(x + B * 0.8), Math.round(y - B * 6.8), Math.round(B * 0.4), Math.round(B * 0.2));
        } else {
            ctx.fillStyle = "rgba(200, 110, 255, 0.8)";
            for (let k = 0; k < 8; k++) {
                ctx.fillRect(Math.round(x + (Math.random() - 0.3) * B * 2), Math.round(y - Math.random() * B * 7), 3, 3);
            }
        }
    }
    if (s1 > 0) {
        const k = crossK(time, 10, 0.2);
        const x = W * (1.2 - k * 1.5);
        const y = gY * 0.18 + Math.sin(time * 1.5) * B * 2;
        const flap = Math.sin(time * 4) * B * 3;
        ctx.globalAlpha = s1;
        ctx.fillStyle = "#0a0610";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 10), Math.round(B * 1.4));
        ctx.fillRect(Math.round(x - B * 2), Math.round(y - B * 0.4), Math.round(B * 2.4), Math.round(B * 1.6));
        ctx.fillRect(Math.round(x + B * 10), Math.round(y + B * 0.4), Math.round(B * 5), Math.round(B * 0.5));
        ctx.beginPath();
        ctx.moveTo(x + B * 3, y);
        ctx.lineTo(x + B * 5, y - B * 5 - flap);
        ctx.lineTo(x + B * 7.5, y);
        ctx.fill();
        ctx.fillStyle = "#e080ff";
        ctx.fillRect(Math.round(x - B * 1.6), Math.round(y), Math.round(B * 0.5), Math.round(B * 0.3));
        ctx.globalAlpha = 1;
    }
});

export { crossK };
