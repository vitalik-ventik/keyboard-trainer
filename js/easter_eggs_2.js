// ============================================================
// easter_eggs_2.js — пасхалки, частина 2: від жнеця до гаста
// ============================================================

import { crossLeft, crossRight, eggRng, painter, speechBubble } from "./easter_eggs.js";

const EGG_DRAWERS_2 = {

    // Довгий жнець-левіафан пропливає в глибині
    reaper(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 16);
        const y = gY * 0.42;
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * 0.85;
        for (let i = 14; i >= 0; i--) {
            const sx = x + i * B * 0.9;
            const sy = y + Math.sin(time * 3 - i * 0.5) * B * 0.6;
            const r = Math.max(0.35, 1.3 - i * 0.07);
            ctx.fillStyle = i % 3 === 0 ? "#8a3a2a" : "#c8b89a";
            ctx.fillRect(Math.round(sx), Math.round(sy - r * B / 2), Math.round(B * 1.0), Math.round(r * B));
            if (i % 4 === 1) {
                ctx.fillStyle = "#6a5a4a";
                ctx.fillRect(Math.round(sx), Math.round(sy + r * B / 2), Math.round(B * 0.3), Math.round(B * 0.5));
            }
        }
        const hy = y + Math.sin(time * 3) * B * 0.6;
        const jaw = Math.sin(time * 5) * 0.3 + 0.3;
        const p = painter(ctx, B, x, hy, false);
        p("#c8b89a", -1.2, -0.8, 1.4, 1.6);
        p("#8a3a2a", -1.9, -1.1 - jaw, 0.9, 0.3);
        p("#8a3a2a", -1.9, 0.8 + jaw, 0.9, 0.3);
        p("#8a3a2a", -1.6, -0.65 - jaw * 0.5, 0.5, 0.25);
        p("#8a3a2a", -1.6, 0.4 + jaw * 0.5, 0.5, 0.25);
        p("#ff5a3a", -0.9, -0.5, 0.25, 0.2);
        p("#ff5a3a", -0.9, 0.3, 0.25, 0.2);
        ctx.globalAlpha = base;
    },

    // Піщаний хробак вистрибує з піску дугою й пірнає назад
    sandworm(ctx, t, W, H, gY, time, B) {
        const cx = W * 0.5;
        const R = W * 0.3;
        const head = -0.15 + t * 1.3;
        const rng = eggRng(Math.floor(time * 12));
        for (const edge of [0, 1]) {
            const near = edge === 0 ? Math.max(0, 1 - Math.abs(head - 0) * 5) : Math.max(0, 1 - Math.abs(head - 1) * 5);
            if (near > 0) {
                ctx.fillStyle = "#e8c07a";
                const ex = cx + (edge === 0 ? -R : R);
                for (let i = 0; i < 10; i++) {
                    ctx.fillRect(Math.round(ex + (rng() - 0.5) * B * 4), Math.round(gY - rng() * B * 3 * near), Math.round(B * 0.3), Math.round(B * 0.3));
                }
            }
        }
        for (let k = 18; k >= 0; k--) {
            const s = head - k * 0.035;
            if (s < 0 || s > 1) {
                continue;
            }
            const a = Math.PI * s;
            const sx = cx - R * Math.cos(a);
            const sy = gY - R * 0.9 * Math.sin(a);
            const r = B * Math.max(0.5, 1.1 - k * 0.025);
            ctx.fillStyle = k % 2 ? "#a07a3a" : "#c89a55";
            ctx.fillRect(Math.round(sx - r), Math.round(sy - r), Math.round(r * 2), Math.round(r * 2));
            if (k === 0) {
                ctx.fillStyle = "#4a1a10";
                ctx.fillRect(Math.round(sx - r * 0.6), Math.round(sy - r * 0.6), Math.round(r * 1.2), Math.round(r * 1.2));
                ctx.fillStyle = "#ffffff";
                for (let q = 0; q < 4; q++) {
                    const ang = q * Math.PI / 2 + time * 3;
                    ctx.fillRect(Math.round(sx + Math.cos(ang) * r * 0.45 - 2), Math.round(sy + Math.sin(ang) * r * 0.45 - 2), 4, 4);
                }
            }
        }
    },

    // Золотий ключ-голем з ключем на спині тікає, підстрибуючи
    keygolem(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3);
        const hop = Math.abs(Math.sin(time * 9)) * 0.5;
        const st = Math.sin(time * 18) > 0 ? 0.15 : 0;
        const p = painter(ctx, B, x, gY - hop * B, false);
        p("#8a7a5a", 0.1 + st, -0.45, 0.3, 0.45);
        p("#8a7a5a", 0.6 - st, -0.45, 0.3, 0.45);
        p("#e8c040", 0, -1.45, 1.0, 1.0);
        p("#b08a20", 0, -0.65, 1.0, 0.2);
        p("#8a7a5a", -0.3, -1.2, 0.3, 0.5);
        p("#8a7a5a", 1.0, -1.2, 0.3, 0.5);
        p("#3a2a10", 0.15, -1.2, 0.2, 0.2);
        p("#3a2a10", 0.55, -1.2, 0.2, 0.2);
        const spin = Math.abs(Math.cos(time * 4));
        p("#ffd84a", 0.4, -2.5, 0.2, 1.1);
        p("#ffd84a", 0.5 - 0.35 * spin, -2.9, 0.7 * spin + 0.1, 0.45);
        p("#e8c040", 0.5 - 0.15 * spin, -2.8, 0.3 * spin + 0.05, 0.25);
        p("#ffd84a", 0.6, -1.9, 0.25, 0.12);
        const sp = (time * 2) % 1;
        p("#fffbe0", 1.4 + sp * 0.5, -2.2 - sp, 0.15, 0.15);
        p("#fffbe0", -0.5 - sp * 0.4, -2.0 - sp * 0.8, 0.12, 0.12);
    },

    // Паперовий літачок робить мертву петлю між хмарами
    paperplane(ctx, t, W, H, gY, time, B) {
        // Під час петлі літачок не просувається вперед, а крутиться на місці
        const u = t < 0.4 ? t : t < 0.62 ? 0.4 : t - 0.22;
        let x = crossRight(u / 0.78, W, B, 3);
        let y = gY * 0.35;
        let ang = 0;
        if (t > 0.4 && t < 0.62) {
            const a = (t - 0.4) / 0.22 * Math.PI * 2;
            const R = B * 3;
            x += R * Math.sin(a);
            y = gY * 0.35 - R + R * Math.cos(a);
            ang = -a;
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(B * 1.2, 0);
        ctx.lineTo(-B * 1.0, -B * 0.6);
        ctx.lineTo(-B * 0.6, 0);
        ctx.lineTo(-B * 1.0, B * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c8d8ec";
        ctx.beginPath();
        ctx.moveTo(B * 1.2, 0);
        ctx.lineTo(-B * 0.6, 0);
        ctx.lineTo(-B * 0.8, B * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const base = ctx.globalAlpha;
        ctx.fillStyle = "#ffffff";
        for (let k = 1; k < 7; k++) {
            ctx.globalAlpha = base * (1 - k / 7) * 0.6;
            ctx.fillRect(Math.round(x - Math.cos(ang) * B * (1 + k * 0.6)), Math.round(y - Math.sin(ang) * B * (1 + k * 0.6)), 2, 2);
        }
        ctx.globalAlpha = base;
    },

    // М'яч злітає «свічкою» над стадіоном, а табло кричить «ГОЛ!»
    goalball(ctx, t, W, H, gY, time, B) {
        const x = W * (0.12 + 0.76 * t);
        const y = gY - B * 0.6 - Math.sin(Math.PI * t) * gY * 0.78;
        const base = ctx.globalAlpha;
        for (let k = 1; k < 8; k++) {
            const tk = Math.max(0, t - k * 0.012);
            ctx.globalAlpha = base * (1 - k / 8) * 0.5;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(W * (0.12 + 0.76 * tk) - 2), Math.round(gY - B * 0.6 - Math.sin(Math.PI * tk) * gY * 0.78 - 2), 4, 4);
        }
        ctx.globalAlpha = base;
        const r = B * 0.8;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        for (let q = 0; q < 5; q++) {
            const a = time * 8 + q * Math.PI * 2 / 5;
            ctx.fillRect(Math.round(x + Math.cos(a) * r * 0.55 - r * 0.18), Math.round(y + Math.sin(a) * r * 0.55 - r * 0.18), Math.round(r * 0.36), Math.round(r * 0.36));
        }
        ctx.fillRect(Math.round(x - r * 0.2), Math.round(y - r * 0.2), Math.round(r * 0.4), Math.round(r * 0.4));
        if (t > 0.7 && Math.floor(time * 6) % 2 === 0) {
            ctx.font = "bold " + Math.round(B * 2.2) + "px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffe14d";
            ctx.fillText("ГОЛ!", Math.round(W * 0.5), Math.round(gY * 0.22));
        }
    },

    // Малюк-ксеноморф вилазить із землі, роззирається, пищить і ховається
    chestburster(ctx, t, W, H, gY, time, B) {
        const x = W * 0.62;
        const rise = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        const look = t > 0.25 && t < 0.75 ? Math.sin((t - 0.25) * Math.PI * 4) : 0;
        const h = rise * 2.6;
        const rng = eggRng(Math.floor(time * 10));
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, gY);
        ctx.clip();
        const p = painter(ctx, B, x + look * B * 0.3, gY + (2.6 - h) * B, look < 0);
        p("#c8b8a8", -0.35, -2.2, 0.7, 2.2);
        p("#a89888", -0.35, -1.4, 0.7, 0.15);
        p("#a89888", -0.35, -0.8, 0.7, 0.15);
        p("#d8c8b8", -1.3, -2.8, 1.8, 0.8);
        p("#e8dccc", -1.1, -2.75, 0.6, 0.2);
        p("#ffffff", -1.3, -2.25, 0.12, 0.15);
        p("#ffffff", -1.1, -2.25, 0.12, 0.15);
        p("#ffffff", -0.9, -2.25, 0.12, 0.15);
        p("#c8b8a8", -0.6, -1.9, 0.35, 0.12);
        p("#c8b8a8", 0.35, -1.9, 0.35, 0.12);
        ctx.restore();
        if (rise > 0.1 && rise < 0.95) {
            ctx.fillStyle = "#5a3a2a";
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(Math.round(x + (rng() - 0.5) * B * 2.5), Math.round(gY - rng() * B * 1.5), Math.round(B * 0.25), Math.round(B * 0.25));
            }
        }
        if (t > 0.45 && t < 0.6) {
            ctx.strokeStyle = "#e8dccc";
            ctx.lineWidth = Math.max(1, B * 0.1);
            for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.arc(x - B * 1.4, gY - B * 2.4, B * (0.6 + k * 0.5 + (time * 3 % 0.5)), Math.PI * 0.75, Math.PI * 1.25);
                ctx.stroke();
            }
        }
    },

    // Скорпіон повзе піском і б'є жалом
    scorpion(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const strike = Math.max(0, Math.sin(time * 3)) ** 4;
        const legs = Math.sin(time * 20) > 0 ? 0.08 : 0;
        const p = painter(ctx, B, x, gY, false);
        for (let k = 0; k < 4; k++) {
            p("#2a1a0a", 0.2 + k * 0.35 + (k % 2 ? legs : -legs), -0.35, 0.1, 0.35);
        }
        p("#5a3a1a", 0, -0.75, 1.6, 0.45);
        p("#7a5a2a", 0.1, -0.7, 1.4, 0.12);
        p("#5a3a1a", -0.6, -0.65, 0.6, 0.15);
        p("#5a3a1a", -1.0, -0.85, 0.45, 0.35);
        p("#5a3a1a", -1.15, -0.95, 0.2, 0.15);
        p("#1a0a0a", 0.05, -0.85, 0.1, 0.1);
        const segs = [[1.6, -0.9], [1.95, -1.3], [2.1, -1.8], [1.9, -2.2]];
        for (let i = 0; i < segs.length; i++) {
            const sx = segs[i][0] - strike * i * 0.25;
            const sy = segs[i][1] - strike * i * 0.05;
            p("#5a3a1a", sx, sy, 0.4, 0.4);
        }
        p("#ff3a2a", 1.55 - strike * 1.0, -2.25 + strike * 0.4, 0.3, 0.25);
    },

    // Вогняний фенікс пролітає, розсипаючи жарини
    phoenix(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.3 + Math.sin(t * Math.PI * 3) * B * 1.5;
        const flap = Math.sin(time * 9);
        const base = ctx.globalAlpha;
        const rng = eggRng(7);
        for (let i = 0; i < 16; i++) {
            const age = (time * 1.5 + rng()) % 1;
            ctx.globalAlpha = base * (1 - age);
            ctx.fillStyle = i % 3 === 0 ? "#ffe14d" : "#ff6a00";
            ctx.fillRect(Math.round(x - B * (2 + age * 6 + rng() * 2)), Math.round(y + B * (rng() - 0.3) * 2 + age * B * 2), Math.round(B * 0.25), Math.round(B * 0.25));
        }
        ctx.globalAlpha = base;
        const p = painter(ctx, B, x, y, true);
        const flick = Math.sin(time * 25) * 0.2;
        p("#ff3a00", 1.4, 0.1, 1.8 + flick, 0.25);
        p("#ffb000", 1.4, 0.35, 2.3 - flick, 0.2);
        p("#ff6a00", 1.4, -0.15, 1.3, 0.2);
        p("#ff6a00", 0, -0.2, 1.6, 0.7);
        p("#ffb000", 0.2, 0.2, 1.0, 0.3);
        p("#ff3a00", 0.3, flap > 0 ? -1.6 : 0.4, 1.0, flap > 0 ? 1.4 : 1.0);
        p("#ffe14d", 0.4, flap > 0 ? -1.5 : 0.5, 0.6, 0.35);
        p("#ff6a00", -0.6, -0.5, 0.7, 0.6);
        p("#ffe14d", -0.5, -0.8, 0.25, 0.35);
        p("#ffe14d", -1.0, -0.3, 0.4, 0.2);
        p("#1a1a1a", -0.4, -0.35, 0.12, 0.12);
    },

    // Щупальця кракена виринають із води, розгойдуються й ховаються
    kraken(ctx, t, W, H, gY, time, B) {
        const up = Math.pow(Math.sin(Math.PI * t), 0.7);
        const roots = [0.52, 0.64, 0.78, 0.9];
        for (let i = 0; i < roots.length; i++) {
            const rx = W * roots[i];
            const len = (5 + (i % 2) * 1.5) * up;
            const n = 12;
            for (let k = 0; k < n; k++) {
                const f = k / n;
                const sx = rx + Math.sin(time * 2.5 + i * 1.7 + f * 4) * B * 1.2 * f;
                const sy = gY - f * len * B;
                const w = B * (1.0 - f * 0.7);
                ctx.fillStyle = "#6a2a8a";
                ctx.fillRect(Math.round(sx - w / 2), Math.round(sy - len * B / n), Math.round(w), Math.round(len * B / n + 1));
                if (k % 2 === 0 && k < n - 2) {
                    ctx.fillStyle = "#ff9ad0";
                    ctx.fillRect(Math.round(sx + w * 0.15), Math.round(sy - B * 0.2), Math.round(w * 0.3), Math.round(w * 0.3));
                }
            }
        }
        if (up > 0.6) {
            const ey = gY - B * 1.1 * (up - 0.6) / 0.4;
            const p = painter(ctx, B, W * 0.71, ey, false);
            p("#6a2a8a", -1.2, -0.2, 2.4, 1.4);
            p("#ffe14d", -0.7, 0.1, 1.4, 0.7);
            p("#1a0a1a", -0.15 + Math.sin(time * 1.5) * 0.4, 0.1, 0.3, 0.7);
        }
        const rng = eggRng(Math.floor(time * 10));
        ctx.fillStyle = "rgba(220, 245, 255, 0.8)";
        for (let i = 0; i < 8 * up; i++) {
            ctx.fillRect(Math.round(W * (0.5 + rng() * 0.42)), Math.round(gY - rng() * B), 3, 3);
        }
    },

    // Сундук-мімік стрибає й клацає зубастою кришкою
    mimic(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3);
        const hop = Math.abs(Math.sin(t * Math.PI * 7));
        const open = hop > 0.4 ? (hop - 0.4) / 0.6 : 0;
        const p = painter(ctx, B, x, gY - hop * B * 1.2, false);
        p("#6a3a1a", 0, -1.1, 1.9, 1.1);
        p("#ffd84a", 0, -1.1, 1.9, 0.12);
        p("#ffd84a", 0, -0.2, 1.9, 0.12);
        p("#ffd84a", 0.85, -0.9, 0.2, 0.35);
        const ly = -1.1 - open * 0.8;
        p("#3a0a0a", 0.05, ly, 1.8, open * 0.8 + 0.05);
        if (open > 0.2) {
            p("#ff4a6a", -0.3, -1.2, 0.8, 0.2);
            p("#ffe14d", 0.4, ly + 0.45, 0.2, 0.2);
            p("#ffe14d", 1.2, ly + 0.45, 0.2, 0.2);
        }
        p("#8a5a2a", 0, ly - 0.55, 1.9, 0.6);
        p("#ffd84a", 0, ly - 0.55, 1.9, 0.12);
        for (let k = 0; k < 5; k++) {
            p("#ffffff", 0.1 + k * 0.36, ly + 0.05, 0.18, 0.22);
            if (open > 0.3) {
                p("#ffffff", 0.2 + k * 0.36, -1.3, 0.18, 0.2);
            }
        }
    },

    // Десантний човник знижується над колонією, мигаючи вогнями
    dropship(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const y = gY * 0.22 + t * gY * 0.2;
        const p = painter(ctx, B, x, y, false);
        const glow = 0.3 + Math.abs(Math.sin(time * 20)) * 0.3;
        p("#7df9ff", 2.9, 0.3, 0.5 + glow, 0.35);
        p("#7df9ff", 2.9, -0.35, 0.4 + glow, 0.3);
        p("#3a3a3a", 1.9, 0.25, 1.0, 0.45);
        p("#3a3a3a", 1.9, -0.4, 1.0, 0.4);
        p("#5a6a5a", -2.0, -0.45, 4.0, 0.9);
        p("#4a5a4a", -2.8, -0.2, 0.8, 0.55);
        p("#6a7a6a", -1.6, -0.45, 3.4, 0.2);
        p("#5a6a5a", 1.2, -1.2, 0.6, 0.75);
        p("#5a6a5a", -0.8, 0.45, 2.2, 0.25);
        p("#9fd8ff", -2.2, -0.2, 0.6, 0.25);
        p("#3a4a3a", -0.4, 0.05, 0.6, 0.2);
        p("#3a4a3a", 0.4, 0.05, 0.6, 0.2);
        const blink = Math.floor(time * 3) % 2;
        p(blink ? "#ff3355" : "#551122", -2.9, -0.25, 0.2, 0.2);
        p(blink ? "#39ff88" : "#0a3a1a", 1.3, -1.35, 0.2, 0.2);
        if (Math.sin(time * 1.5) > 0) {
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * 0.15;
            ctx.fillStyle = "#ffffcc";
            ctx.beginPath();
            ctx.moveTo(x - B * 0.2, y + B * 0.7);
            ctx.lineTo(x - B * 2.5, gY);
            ctx.lineTo(x + B * 1.5, gY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = base;
        }
    },

    // Диск мисливця розрізає повітря й повертається бумерангом
    disc(ctx, t, W, H, gY, time, B) {
        const x = W * (0.95 - 0.8 * Math.sin(Math.PI * t));
        const y = gY * 0.4 + Math.sin(Math.PI * 2 * t) * B * 2.5;
        const base = ctx.globalAlpha;
        for (let k = 1; k < 8; k++) {
            const tk = Math.max(0, t - k * 0.01);
            ctx.globalAlpha = base * (1 - k / 8) * 0.5;
            ctx.fillStyle = "#ff5a3a";
            ctx.fillRect(Math.round(W * (0.95 - 0.8 * Math.sin(Math.PI * tk)) - 2), Math.round(gY * 0.4 + Math.sin(Math.PI * 2 * tk) * B * 2.5 - 1), 4, 2);
        }
        ctx.globalAlpha = base;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.45);
        ctx.rotate(time * 18);
        ctx.fillStyle = "#c8ccd4";
        for (let q = 0; q < 6; q++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, -B * 0.4);
            ctx.lineTo(B * 1.3, -B * 0.1);
            ctx.lineTo(B * 0.5, B * 0.4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#6a6a74";
        ctx.beginPath();
        ctx.arc(0, 0, B * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff5a3a";
        ctx.fillRect(-B * 0.15, -B * 0.15, B * 0.3, B * 0.3);
        ctx.restore();
    },

    // Дракончик-малюк підстрибує й чхає кільцями диму та іскрою вогню
    babydragon(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.8 + W * 0.15;
        const hop = Math.abs(Math.sin(time * 6)) * 0.5;
        const sneeze = (time * 0.7) % 1;
        const flap = Math.sin(time * 14) > 0;
        const p = painter(ctx, B, x, gY - hop * B, false);
        p("#6a3aa8", 0.2, -0.5, 0.3, 0.5);
        p("#6a3aa8", 0.9, -0.5, 0.3, 0.5);
        p("#8a4ac8", 0, -1.4, 1.4, 1.0);
        p("#d8b0ff", 0.2, -0.9, 0.9, 0.4);
        p("#8a4ac8", 1.4, -1.0, 0.8, 0.25);
        p("#6a3aa8", 2.1, -1.25, 0.3, 0.3);
        p("#b080ff", 0.4, flap ? -2.3 : -1.7, 0.8, flap ? 0.9 : 0.5);
        p("#8a4ac8", -0.8, -2.1, 1.0, 0.9);
        p("#ffe14d", -0.5, -2.35, 0.15, 0.3);
        p("#ffe14d", -0.1, -2.35, 0.15, 0.3);
        p("#ffffff", -0.55, -1.9, 0.25, 0.25);
        p("#1a1a1a", -0.5, -1.85, 0.12, 0.15);
        p("#5a2a88", -0.85, -1.45, 0.12, 0.1);
        if (sneeze < 0.35) {
            const s = sneeze / 0.35;
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * (1 - s);
            p("#aaaaaa", -1.3 - s * 1.5, -1.7 - s * 0.6, 0.5 + s * 0.4, 0.5 + s * 0.4);
            p("#ff9a00", -1.2 - s * 0.8, -1.5, 0.3, 0.2);
            p("#ffe14d", -1.1 - s * 0.5, -1.45, 0.15, 0.12);
            ctx.globalAlpha = base;
        }
    },

    // Кріт у шахтарській касці визирає з нірок одна за одною
    mole(ctx, t, W, H, gY, time, B) {
        const idx = Math.min(2, Math.floor(t * 3));
        const local = t * 3 - idx;
        const x = W * (0.8 - idx * 0.25);
        const h = Math.sin(local * Math.PI);
        const p0 = painter(ctx, B, x, gY, false);
        for (let k = 0; k <= idx; k++) {
            const hp = painter(ctx, B, W * (0.8 - k * 0.25), gY, false);
            hp("#5a3a1a", -1.0, -0.35, 2.0, 0.35);
            hp("#6a4a2a", -0.7, -0.55, 1.4, 0.2);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, gY - B * 0.3);
        ctx.clip();
        const look = Math.sin(time * 3) * 0.1;
        const p = painter(ctx, B, x + look * B, gY - B * 0.3 + (1 - h) * B * 2.2, false);
        p("#5a4a3a", -0.6, -1.9, 1.2, 1.9);
        p("#ffb0b0", -0.2, -1.2, 0.4, 0.25);
        p("#1a1a1a", -0.4, -1.55, 0.15, 0.15);
        p("#1a1a1a", 0.25, -1.55, 0.15, 0.15);
        p("#ffd84a", -0.7, -2.3, 1.4, 0.5);
        p("#ffffff", -0.15, -2.2, 0.3, 0.25);
        p("#d8c8b8", -0.45, -0.4, 0.3, 0.3);
        p("#d8c8b8", 0.15, -0.4, 0.3, 0.3);
        ctx.restore();
        if (h > 0.5) {
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * 0.2 * h;
            ctx.fillStyle = "#fff6b0";
            const dir = Math.sin(time * 3) > 0 ? 1 : -1;
            const ly = gY - B * 0.3 - B * 2.1 * h;
            ctx.beginPath();
            ctx.moveTo(x, ly);
            ctx.lineTo(x + dir * B * 6, ly - B * 1.5);
            ctx.lineTo(x + dir * B * 6, ly + B * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = base;
        }
        p0("#6a4a2a", -0.8, -0.3, 1.6, 0.3);
    },

    // Фантом пікірує з неба на широких крилах
    phantom(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.1 + Math.sin(Math.PI * t) * gY * 0.45;
        const flap = Math.sin(time * 6) * 0.6;
        const p = painter(ctx, B, x, y, true);
        p("#3a4a7a", 2.4, -0.1, 1.2, 0.3);
        p("#4a5a8a", 0, -0.35, 2.4, 0.6);
        p("#5a6a9a", 0.4, -0.35, 1.6, 0.2);
        p("#3a4a7a", 0.3, -0.35 - 1.6 - flap, 0.6, 1.6 + flap);
        p("#3a4a7a", 0.9, -0.35 - 1.0 - flap * 0.6, 0.6, 1.0 + flap * 0.6);
        p("#2a3a6a", 0.3, 0.25, 0.6, 1.0 - flap * 0.5);
        p("#2a3a6a", 0.9, 0.25, 0.6, 0.6 - flap * 0.3);
        p("#4a5a8a", -0.7, -0.3, 0.7, 0.5);
        p("#9aff5a", -0.6, -0.2, 0.2, 0.15);
    },

    // Лицар зі списом і прапорцем мчить галопом
    knight(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 6);
        const gallop = Math.abs(Math.sin(time * 10)) * 0.3;
        const legs = Math.sin(time * 10) > 0 ? 0.3 : -0.3;
        const p = painter(ctx, B, x, gY - gallop * B, false);
        p("#6a4a2a", 0.2 - legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 0.7 + legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 2.0 - legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 2.5 + legs, -1.1, 0.3, 1.1);
        p("#f0f0f0", 0, -2.2, 3.0, 1.2);
        p("#3a5ac8", 0.6, -2.3, 1.8, 1.0);
        p("#ffd84a", 0.6, -1.4, 1.8, 0.12);
        p("#f0f0f0", -0.8, -3.0, 1.0, 1.2);
        p("#f0f0f0", -1.3, -2.5, 0.6, 0.6);
        p("#1a1a1a", -0.6, -2.8, 0.15, 0.15);
        p("#8a6a4a", -0.1, -3.2, 0.3, 1.0);
        p("#8a6a4a", 3.0, -2.2, 0.6, 0.9);
        p("#b8bcc8", 1.0, -3.6, 0.9, 1.4);
        p("#9a9eaa", 1.0, -4.4, 0.9, 0.8);
        p("#1a1a1a", 1.0, -4.1, 0.6, 0.12);
        p("#ff3355", 1.3, -4.7, 0.3, 0.3);
        p("#d8d8e0", -3.5, -3.1, 4.6, 0.15);
        const wave = Math.sin(time * 12) * 0.12;
        p("#ff3355", -2.6, -3.5 + wave, 0.9, 0.4);
        p("#ffe14d", -2.6, -3.3 + wave, 0.9, 0.12);
    },

    // Робот-прибиральник їздить підлогою ангара зі щіткою й бурчить «біп»
    cleanbot(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.75 + W * 0.2;
        const brush = Math.sin(time * 14) * 0.2;
        const p = painter(ctx, B, x, gY, false);
        const base = ctx.globalAlpha;
        const rng = eggRng(Math.floor(time * 8));
        ctx.globalAlpha = base * 0.6;
        for (let i = 0; i < 5; i++) {
            p("#9a9aa4", -1.4 - rng() * 1.2, -0.3 - rng() * 0.6, 0.2 + rng() * 0.2, 0.2);
        }
        ctx.globalAlpha = base;
        p("#1a1a1a", 0.1, -0.35, 0.4, 0.35);
        p("#1a1a1a", 1.1, -0.35, 0.4, 0.35);
        p("#e8e8ee", 0, -1.2, 1.6, 0.9);
        p("#ffa21a", 0, -0.55, 1.6, 0.15);
        p("#3a4a6a", 0.2, -1.05, 1.2, 0.4);
        p("#7df9ff", 0.35 + Math.sin(time * 2) * 0.15, -0.95, 0.2, 0.2);
        p("#7df9ff", 0.85 + Math.sin(time * 2) * 0.15, -0.95, 0.2, 0.2);
        p("#9a9aa4", 0.75, -1.7, 0.1, 0.5);
        p(Math.floor(time * 4) % 2 ? "#ff3355" : "#39ff88", 0.7, -1.85, 0.2, 0.2);
        p("#9a9aa4", -0.6, -0.9, 0.6, 0.12);
        p("#ffd84a", -1.0 + brush, -0.4, 0.5, 0.4);
        p("#c8a040", -0.9 + brush, -0.1, 0.35, 0.1);
        if (Math.sin(time * 1.7) > 0.5) {
            speechBubble(ctx, x + B * 0.8, gY - B * 2.4, B, "біп-біп", "#3a4a6a");
        }
    },

    // Пінгвін ковзає на животі по снігу
    penguin(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const p = painter(ctx, B, x, gY, false);
        const rng = eggRng(Math.floor(time * 14));
        for (let i = 0; i < 7; i++) {
            p("#ffffff", 2.2 + rng() * 2, -0.2 - rng() * 1.0, 0.18, 0.18);
        }
        p("#ff9a00", 2.0, -0.55, 0.4, 0.2);
        p("#ff9a00", 2.0, -0.3, 0.4, 0.2);
        p("#1a1a2a", 0, -0.95, 2.1, 0.55);
        p("#f4f8ff", 0.2, -0.45, 1.8, 0.4);
        p("#1a1a2a", 0.6, -0.6 - Math.abs(Math.sin(time * 4)) * 0.2, 0.9, 0.2);
        p("#1a1a2a", -0.7, -1.05, 0.8, 0.7);
        p("#f4f8ff", -0.55, -0.85, 0.3, 0.3);
        p("#1a1a1a", -0.45, -0.78, 0.12, 0.12);
        p("#ff9a00", -1.05, -0.75, 0.4, 0.2);
    },

    // Дельфін пропливає хвилею, робить сальто й пускає бульбашки
    dolphin(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const baseY = gY * 0.55;
        const flip = t > 0.45 && t < 0.6 ? (t - 0.45) / 0.15 * Math.PI * 2 : 0;
        const y = baseY + Math.sin(time * 3) * B * 0.8 - Math.sin(flip / 2) * B * 2;
        const ang = Math.cos(time * 3) * 0.25 - flip;
        const base = ctx.globalAlpha;
        const rng = eggRng(11);
        for (let i = 0; i < 6; i++) {
            const age = (time * 0.8 + rng()) % 1;
            ctx.globalAlpha = base * (1 - age) * 0.8;
            ctx.strokeStyle = "#c8f0ff";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x - B * 1.2 + rng() * B + age * B * 3, y - B * 0.6 - age * B * 4, B * (0.12 + rng() * 0.15), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = base;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        const p = painter(ctx, B, 0, 0, false);
        p("#5aa0d8", -1.6, -0.45, 3.2, 0.9);
        p("#d8eef8", -1.3, 0.15, 2.6, 0.3);
        p("#5aa0d8", 1.6, -0.2, 0.6, 0.35);
        p("#4a88c0", 2.1, -0.6, 0.35, 1.2);
        p("#4a88c0", -0.2, -0.95, 0.6, 0.5);
        p("#4a88c0", -0.4, 0.4, 0.5, 0.35);
        p("#5aa0d8", -2.2, -0.15, 0.6, 0.35);
        p("#1a1a2a", -1.3, -0.25, 0.15, 0.15);
        p("#ffffff", -1.35, -0.3, 0.06, 0.06);
        ctx.restore();
    },

    // Піщаний вихор пробігає пустелею й крутить піщинки
    dustdevil(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 11; k++) {
            const w = B * (0.6 + k * 0.4);
            const y = gY - B * 0.6 - k * B * 0.6;
            const off = Math.sin(time * 6 + k * 0.7) * B * 0.5 + k * B * 0.12;
            ctx.globalAlpha = base * (0.8 - k * 0.03);
            ctx.fillStyle = k % 2 ? "#a0703a" : "#7a5228";
            ctx.fillRect(Math.round(x + off - w / 2), Math.round(y), Math.round(w), Math.round(B * 0.6));
        }
        ctx.globalAlpha = base;
        ctx.fillStyle = "#4a3018";
        for (let i = 0; i < 14; i++) {
            const a = time * 5 + i * 0.9;
            const hgt = (i / 14) * 6;
            const r = B * (0.5 + hgt * 0.4);
            ctx.fillRect(Math.round(x + Math.cos(a) * r + hgt * B * 0.12), Math.round(gY - B * 0.6 - hgt * B * 0.6), 3, 3);
        }
    },

    // Папуга-балакун пролітає й вигукує «ПРИВІТ!»
    parrot(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 4);
        const y = gY * 0.3 + Math.sin(time * 3) * B * 0.8;
        const flap = Math.sin(time * 12) > 0;
        const p = painter(ctx, B, x, y, true);
        p("#2a6aff", 1.3, 0.1, 1.6, 0.25);
        p("#ffe14d", 1.3, 0.3, 1.3, 0.2);
        p("#e0203a", 0, -0.3, 1.5, 0.75);
        p("#2a6aff", 0.3, flap ? -1.4 : 0.3, 0.9, flap ? 1.2 : 0.9);
        p("#ffe14d", 0.3, flap ? -0.6 : 0.3, 0.9, 0.3);
        p("#e0203a", -0.7, -0.7, 0.9, 0.85);
        p("#ffffff", -0.55, -0.5, 0.35, 0.3);
        p("#1a1a1a", -0.45, -0.45, 0.12, 0.15);
        p("#e8e8d0", -1.1, -0.45, 0.45, 0.45);
        p("#1a1a1a", -1.0, -0.1, 0.3, 0.15);
        if (t > 0.3 && t < 0.7) {
            speechBubble(ctx, x + B * 1.0, y - B * 1.3, B, "ПРИВІТ!", "#e0203a");
        }
    },

    // Астронавт пропливає, крутячись у невагомості, і махає рукою
    astronaut(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 3);
        const y = gY * 0.35 + Math.sin(t * Math.PI * 2) * B * 2;
        const wave = Math.sin(time * 8) > 0;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.9);
        const p = painter(ctx, B, 0, 0, false);
        p("#c8ccd4", -0.9, -0.5, 0.7, 1.4);
        p("#f0f0f4", -0.5, -0.8, 1.0, 1.6);
        p("#f0f0f4", -0.4, 0.8, 0.35, 0.9);
        p("#f0f0f4", 0.1, 0.8, 0.35, 0.9);
        p("#f0f0f4", -0.9, -0.4, 0.4, 0.9);
        p("#f0f0f4", 0.5, wave ? -1.2 : -0.6, 0.4, 0.9);
        p("#f0f0f4", -0.55, -1.7, 1.1, 1.0);
        p("#ffb040", -0.35, -1.5, 0.7, 0.6);
        p("#ffe0a0", -0.2, -1.45, 0.2, 0.2);
        p("#ff3355", -0.2, -0.3, 0.4, 0.3);
        ctx.restore();
    },

    // Золотогривий пегас пролітає між баштами цитаделі
    pegasus(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const y = gY * 0.28 + Math.sin(t * Math.PI * 2) * B * 1.2;
        const flap = Math.sin(time * 7);
        const legs = Math.sin(time * 7) > 0 ? 0.25 : -0.25;
        const p = painter(ctx, B, x, y, false);
        p("#e8e8f0", 0.2 + legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 0.6 - legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 2.0 + legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 2.4 - legs, 0.4, 0.25, 0.8);
        p("#ffffff", 0, -0.4, 2.8, 1.0);
        p("#ffd84a", 2.8, -0.3, 0.9, 0.35);
        p("#ffd84a", 3.4, -0.1, 0.4, 0.6);
        p("#ffffff", -0.7, -1.3, 0.9, 1.1);
        p("#ffffff", -1.3, -1.0, 0.7, 0.5);
        p("#ffd84a", 0.1, -1.4, 0.35, 1.0);
        p("#ffd84a", -0.3, -1.6, 0.5, 0.3);
        p("#1a1a1a", -0.5, -1.05, 0.12, 0.12);
        p("#f0f4ff", 0.9, flap > 0 ? -2.2 : -0.6, 1.2, flap > 0 ? 1.9 : 0.6);
        p("#d8e4ff", 1.2, flap > 0 ? -2.8 : -0.4, 1.4, flap > 0 ? 0.7 : 0.35);
        const sp = (time * 2) % 1;
        p("#fffbe0", 3.5 + sp * 2, 0.3 - sp * 0.5, 0.15, 0.15);
        p("#fffbe0", 3.0 + sp * 2.5, 0.8, 0.12, 0.12);
    },

    // Гаст пливе над лавою й плюється вогняними кулями
    ghast(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4) * 0.8 + W * 0.15;
        const y = gY * 0.2 + Math.sin(time * 1.5) * B * 0.6;
        const shoot = (time * 0.6) % 1;
        const angry = shoot < 0.15;
        const p = painter(ctx, B, x, y, false);
        for (let k = 0; k < 7; k++) {
            const len = 1.2 + (k % 3) * 0.5 + Math.sin(time * 3 + k) * 0.3;
            p("#e8e8e8", 0.15 + k * 0.4, 2.8, 0.22, len);
        }
        p("#f4f4f4", 0, 0, 3.0, 2.9);
        p("#d8d8d8", 0, 2.4, 3.0, 0.5);
        p("#b0b0b0", 0.4, angry ? 0.7 : 0.9, 0.6, angry ? 0.45 : 0.15);
        p("#b0b0b0", 1.9, angry ? 0.7 : 0.9, 0.6, angry ? 0.45 : 0.15);
        if (angry) {
            p("#ff3a2a", 0.55, 0.8, 0.25, 0.25);
            p("#ff3a2a", 2.05, 0.8, 0.25, 0.25);
        }
        p("#6a6a6a", 1.1, 1.6, 0.8, angry ? 0.7 : 0.3);
        if (shoot > 0.1 && shoot < 0.9) {
            const f = (shoot - 0.1) / 0.8;
            const fx = x + B * 1.5 - f * W * 0.3;
            const fy = y + B * 2 + f * (gY - y - B * 2);
            const fp = painter(ctx, B, fx, fy, false);
            fp("#ff6a00", -0.45, -0.45, 0.9, 0.9);
            fp("#ffe14d", -0.25, -0.25, 0.5, 0.5);
            fp("rgba(255, 106, 0, 0.5)", 0.45, -0.7, 0.4, 0.4);
            fp("rgba(255, 106, 0, 0.3)", 0.9, -1.1, 0.35, 0.35);
        }
    }
};

export { EGG_DRAWERS_2 };
