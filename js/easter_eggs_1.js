// ============================================================
// easter_eggs_1.js — пасхалки, частина 1: від мотри до слизу
// ============================================================

import { crossLeft, crossRight, eggRng, painter, speechBubble } from "./easter_eggs.js";

const EGG_DRAWERS_1 = {

    // Велетенський метелик пролітає над затокою, крила складаються й розкриваються
    mothra(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 6);
        const y = gY * 0.22 + Math.sin(t * Math.PI * 2) * B * 1.5;
        const flap = Math.abs(Math.sin(time * 4));
        ctx.save();
        ctx.translate(x, y);
        // Крила: верхні більші, з візерунком-очима
        for (const side of [-1, 1]) {
            ctx.save();
            ctx.scale(1, side * (0.25 + flap * 0.75));
            ctx.fillStyle = "#e8962a";
            ctx.beginPath();
            ctx.moveTo(-B * 1.2, 0);
            ctx.lineTo(side < 0 ? B * 1.5 : B * 0.8, B * 4);
            ctx.lineTo(side < 0 ? -B * 3.5 : -B * 2.5, B * 3.2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffd84a";
            ctx.fillRect(Math.round(-B * 1.2), Math.round(B * 1.6), Math.round(B * 1.2), Math.round(B * 1.1));
            ctx.fillStyle = "#39c6ff";
            ctx.fillRect(Math.round(-B * 0.9), Math.round(B * 1.9), Math.round(B * 0.6), Math.round(B * 0.5));
            ctx.restore();
        }
        // Тіло з вусиками
        ctx.fillStyle = "#6a3a1a";
        ctx.fillRect(Math.round(-B * 2.2), Math.round(-B * 0.4), Math.round(B * 3.2), Math.round(B * 0.8));
        ctx.fillRect(Math.round(B), Math.round(-B * 0.5), Math.round(B * 0.9), Math.round(B));
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(Math.round(B * 1.5), Math.round(-B * 0.35), Math.round(B * 0.3), Math.round(B * 0.3));
        ctx.fillStyle = "#6a3a1a";
        ctx.fillRect(Math.round(B * 1.7), Math.round(-B * 1.5), Math.round(B * 0.15), Math.round(B));
        ctx.fillRect(Math.round(B * 1.3), Math.round(-B * 1.4), Math.round(B * 0.15), Math.round(B * 0.9));
        ctx.restore();
    },

    // Стіна вигинається, з неї висувається Демогоргон і розкриває голову-квітку
    demogorgon(ctx, t, W, H, gY, time, B) {
        const x = W * 0.7;
        const y = gY * 0.62;
        const out = t < 0.25 ? t / 0.25 : t > 0.8 ? (1 - t) / 0.2 : 1;
        const bloom = Math.max(0, Math.min(1, (t - 0.35) / 0.2)) * (t > 0.8 ? (1 - t) / 0.2 : 1);
        const base = ctx.globalAlpha;
        // Розтягнута шпалера навколо
        ctx.globalAlpha = base * 0.5 * out;
        ctx.fillStyle = "#5a4a2a";
        ctx.fillRect(Math.round(x - B * 3), Math.round(y - B * 6), Math.round(B * 6), Math.round(B * 10));
        ctx.globalAlpha = base * out;
        const p = painter(ctx, B, x, y, false);
        p("#8a8a94", -1.4, -1.0, 2.8, 4.0);
        p("#7a7a84", -2.6, -0.6, 1.2, 0.5);
        p("#7a7a84", 1.4, -0.6, 1.2, 0.5);
        p("#7a7a84", -3.0, -0.6, 0.5, 2.0);
        p("#7a7a84", 2.5, -0.6, 0.5, 2.0);
        p("#8a8a94", -0.8, -2.6, 1.6, 1.6);
        // Пелюстки голови
        if (bloom > 0.05) {
            for (let i = 0; i < 5; i++) {
                const a = -Math.PI / 2 + (i - 2) * 0.55;
                const len = 1.2 + bloom * 1.6;
                const px = Math.cos(a) * len;
                const py = -1.8 + Math.sin(a) * len;
                p("#9a9aa4", px - 0.4, py - 0.4, 0.8, 0.8);
                p("#e05a6a", px * 0.6 - 0.3, -1.8 + (py + 1.8) * 0.6 - 0.3, 0.6, 0.6);
            }
            p("#ff8a9a", -0.3, -2.1, 0.6, 0.6);
        }
        ctx.globalAlpha = base;
    },

    // Дев'ятихвостий лис біжить стрибками, дев'ять хвостів маяють
    ninefox(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 8);
        const leap = Math.abs(Math.sin(t * Math.PI * 4));
        const y = gY - leap * B * 1.5;
        const p = painter(ctx, B, x, y, false);
        for (let i = 0; i < 9; i++) {
            const a = -0.9 + i * 0.22 + Math.sin(time * 5 + i) * 0.12;
            for (let k = 0; k < 4; k++) {
                const tx = 3.0 + Math.cos(a) * k * 0.9;
                const ty = -2.2 + Math.sin(a) * k * 0.9 - k * 0.2;
                p(k === 3 ? "#ffe0b0" : "#ff7a1a", tx, ty, 0.7, 0.7);
            }
        }
        const legs = leap > 0.5 ? 0.35 : 0;
        p("#e8621a", -0.3 - legs, -1.0, 0.4, 1.0);
        p("#e8621a", 0.3, -1.0, 0.4, 1.0);
        p("#e8621a", 2.0, -1.0, 0.4, 1.0);
        p("#e8621a", 2.6 + legs, -1.0, 0.4, 1.0);
        p("#ff8a2a", 0, -2.4, 3.2, 1.5);
        p("#ffe0b0", 0.3, -1.2, 2.2, 0.3);
        p("#ff8a2a", -1.3, -3.0, 1.6, 1.4);
        p("#ff8a2a", -1.2, -3.6, 0.4, 0.6);
        p("#ff8a2a", -0.4, -3.6, 0.4, 0.6);
        p("#ffe0b0", -1.8, -2.3, 0.7, 0.5);
        p("#1a1a1a", -1.85, -2.35, 0.2, 0.2);
        p("#ff2a2a", -0.9, -2.7, 0.3, 0.2);
    },

    // Рожева морська зірка в зелених шортах шкутильгає піском і махає рукою
    starfish(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.7 + W * 0.2;
        const wave = Math.sin(time * 8) * 0.4;
        const bob = Math.abs(Math.sin(time * 5)) * 0.15;
        const p = painter(ctx, B, x, gY - bob * B, false);
        const st = Math.sin(time * 5) > 0 ? 0.15 : -0.15;
        p("#ff8aa0", -0.7 + st, -1.2, 0.5, 1.2);
        p("#ff8aa0", 0.3 - st, -1.2, 0.5, 1.2);
        p("#5ad85a", -0.8, -2.0, 1.7, 0.9);
        p("#3aa83a", -0.8, -1.5, 1.7, 0.12);
        p("#ff8aa0", -0.6, -3.2, 1.3, 1.3);
        p("#ff8aa0", -0.3, -4.2, 0.7, 1.0);
        p("#ff8aa0", -1.4, -3.0 + wave, 0.9, 0.45);
        p("#ff8aa0", 0.6, -3.6 - wave, 0.9, 0.45);
        p("#ffb0c0", -0.4, -3.1, 0.3, 0.3);
        p("#ffffff", -0.35, -3.9, 0.3, 0.35);
        p("#ffffff", 0.05, -3.9, 0.3, 0.35);
        p("#1a1a1a", -0.28, -3.8, 0.12, 0.15);
        p("#1a1a1a", 0.12, -3.8, 0.12, 0.15);
        p("#c8406a", -0.3, -3.35, 0.6, 0.12);
    },

    // Скелет-воїн мчить на кістяному мотоциклі, з вихлопної труби — зелений дим
    skelbike(ctx, t, W, H, gY, time, B) {
        const x = W * 1.1 - t * W * 1.35;
        const bump = Math.abs(Math.sin(time * 14)) * 0.1;
        const p = painter(ctx, B, x, gY - bump * B, false);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 5; k++) {
            ctx.globalAlpha = base * (1 - k / 5) * 0.7;
            p("#7aff5a", 3.4 + k * 0.7, -1.2 - k * 0.15, 0.5 + k * 0.1, 0.5 + k * 0.1);
        }
        ctx.globalAlpha = base;
        p("#1a1a1a", -0.2, -1.0, 1.0, 1.0);
        p("#1a1a1a", 2.4, -1.0, 1.0, 1.0);
        p("#6a6a74", 0.1, -0.7, 0.4, 0.4);
        p("#6a6a74", 2.7, -0.7, 0.4, 0.4);
        p("#3a3a44", 0.3, -1.8, 2.8, 0.7);
        p("#e8e0d0", 0.2, -2.1, 0.5, 0.3);
        p("#8a8a94", 3.0, -1.4, 0.6, 0.2);
        p("#e8e0d0", 1.4, -3.4, 0.9, 1.6);
        p("#c8c0b0", 1.5, -3.2, 0.7, 0.12);
        p("#c8c0b0", 1.5, -2.8, 0.7, 0.12);
        p("#e8e0d0", 0.6, -3.0, 0.9, 0.25);
        p("#e8e0d0", 1.1, -4.4, 1.0, 1.0);
        p("#1a1a1a", 1.2, -4.1, 0.25, 0.25);
        p("#1a1a1a", 1.6, -4.1, 0.25, 0.25);
        p("#3a3a44", 1.0, -4.7, 1.2, 0.35);
        p("#e8e0d0", 1.5, -1.8, 0.3, 0.8);
    },

    // Калюжа рідкого металу витягується в сріблясту фігуру, дивиться навколо й знову розтікається
    liquidcop(ctx, t, W, H, gY, time, B) {
        const x = W * 0.66;
        const rise = t < 0.3 ? t / 0.3 : t > 0.75 ? (1 - t) / 0.25 : 1;
        const shine = (time * 0.8) % 1;
        const p = painter(ctx, B, x, gY, false);
        p("#9aa4b4", -1.6 * (1 - rise * 0.5), -0.25, 3.2 * (1 - rise * 0.5), 0.25);
        const h = 5 * rise;
        if (h > 0.3) {
            p("#aeb6c4", -0.55, -h * 0.45, 0.45, h * 0.45);
            p("#aeb6c4", 0.1, -h * 0.45, 0.45, h * 0.45);
            p("#c0c8d6", -0.7, -h * 0.82, 1.4, h * 0.4);
            p("#aeb6c4", -1.0, -h * 0.8, 0.3, h * 0.35);
            p("#aeb6c4", 0.7, -h * 0.8, 0.3, h * 0.35);
            p("#c8d0de", -0.4, -h, 0.8, h * 0.18);
            p("#ffffff", -0.6 + shine * 1.0, -h * 0.9, 0.12, h * 0.8);
            if (rise > 0.9) {
                const look = Math.sin(time * 2) * 0.1;
                p("#5a6474", -0.25 + look, -h * 0.94, 0.15, 0.1);
                p("#5a6474", 0.1 + look, -h * 0.94, 0.15, 0.1);
            }
        }
    },
    // Курка ходить і клює зернятка
    chicken(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.6 + W * 0.3;
        const peck = Math.sin(time * 5) > 0.5;
        const st = Math.sin(time * 12) > 0 ? 0.2 : 0;
        const p = painter(ctx, B, x, gY, false);
        p("#ffb020", 0.3 + st, -0.6, 0.15, 0.6);
        p("#ffb020", 0.9 - st, -0.6, 0.15, 0.6);
        p("#ffffff", 0, -1.6, 1.4, 1.0);
        p("#e8e8e8", 0.4, -1.3, 0.7, 0.5);
        p("#ffffff", 1.3, -1.9, 0.35, 0.5);
        const hy = peck ? -1.3 : -2.3;
        p("#ffffff", -0.2, hy, 0.7, 0.8);
        p("#ffb020", -0.55, hy + 0.25, 0.4, 0.25);
        p("#e02020", -0.1, hy + 0.55, 0.3, 0.3);
        p("#e02020", 0.05, hy - 0.2, 0.35, 0.2);
        p("#000000", 0.0, hy + 0.15, 0.15, 0.15);
        if (peck) {
            p("#ffe08a", -0.6, -0.15, 0.15, 0.15);
            p("#ffe08a", -0.2, -0.1, 0.15, 0.15);
        }
    },

    // Кубик-супергерой пролітає над містом у червоному плащі
    superhero(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.3 + Math.sin(time * 3) * B * 0.4;
        const wave = Math.sin(time * 14) * 0.2;
        const p = painter(ctx, B, x, y, true);
        for (let k = 0; k < 3; k++) {
            p("rgba(255, 255, 255, 0.45)", 3.6 + k * 0.4, 0.1 + k * 0.3, 1.4, 0.08);
        }
        p("#e0203a", 1.0, -0.1 + wave, 2.2, 0.6);
        p("#e0203a", 3.0, 0.2 - wave, 0.8, 0.4);
        p("#2a6aff", 1.2, 0.6, 1.1, 0.3);
        p("#2a6aff", 0, 0, 1.3, 1.0);
        p("#ffe14d", 0.35, 0.3, 0.55, 0.4);
        p("#e0203a", 0.5, 0.4, 0.25, 0.2);
        p("#ffd0a0", -0.8, -0.1, 0.8, 0.8);
        p("#1a1a1a", -0.8, 0.1, 0.8, 0.18);
        p("#ffffff", -0.65, 0.12, 0.15, 0.12);
        p("#2a6aff", -1.7, 0.15, 0.9, 0.3);
        p("#e0203a", -1.9, 0.1, 0.35, 0.4);
    },

    // Рожева свинка тупцяє по пасовищу, над нею сердечко
    pig(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4) * 0.7 + W * 0.2;
        const bob = Math.abs(Math.sin(time * 8)) * 0.1;
        const st = Math.sin(time * 10) > 0 ? 0.15 : -0.15;
        const p = painter(ctx, B, x, gY - bob * B, false);
        p("#e08a98", 0.1 + st, -0.7, 0.4, 0.7);
        p("#e08a98", 0.6 - st, -0.7, 0.4, 0.7);
        p("#e08a98", 1.3 + st, -0.7, 0.4, 0.7);
        p("#e08a98", 1.8 - st, -0.7, 0.4, 0.7);
        p("#f0a0a8", 0, -1.8, 2.2, 1.1);
        p("#e07a88", 2.2, -1.7, 0.25, 0.25);
        p("#f0a0a8", -1.0, -2.2, 1.1, 1.1);
        p("#e07a88", -1.25, -1.75, 0.45, 0.4);
        p("#8a3a48", -1.2, -1.65, 0.1, 0.12);
        p("#8a3a48", -1.0, -1.65, 0.1, 0.12);
        p("#ffffff", -0.95, -2.0, 0.2, 0.2);
        p("#1a1a1a", -0.8, -2.0, 0.15, 0.2);
        const heart = (time * 0.8) % 1;
        ctx.globalAlpha *= 1 - heart;
        p("#ff4a6a", -0.8, -3.0 - heart * 1.5, 0.25, 0.25);
        p("#ff4a6a", -0.45, -3.0 - heart * 1.5, 0.25, 0.25);
        p("#ff4a6a", -0.75, -2.8 - heart * 1.5, 0.45, 0.25);
        p("#ff4a6a", -0.6, -2.6 - heart * 1.5, 0.15, 0.15);
    },

    // Супутник з сонячними панелями пропливає небом і шле сигнал
    satellite(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const y = gY * 0.15 + t * gY * 0.1;
        const p = painter(ctx, B, x, y, false);
        p("#c8c8d0", -1.2, -0.1, 2.4, 0.2);
        for (const side of [-3.4, 1.2]) {
            p("#2a4a98", side, -0.35, 2.2, 0.7);
            p("#6a8ae0", side + 0.1, -0.25, 0.9, 0.2);
            p("#6a8ae0", side + 1.15, -0.25, 0.9, 0.2);
            p("#6a8ae0", side + 0.1, 0.05, 0.9, 0.2);
            p("#6a8ae0", side + 1.15, 0.05, 0.9, 0.2);
        }
        p("#d8b040", -0.6, -0.6, 1.2, 1.2);
        p("#b08a20", -0.6, 0.3, 1.2, 0.3);
        p("#e8e8e8", -0.35, -1.1, 0.7, 0.5);
        p("#9a9aa4", -0.05, -1.4, 0.1, 0.3);
        p(Math.floor(time * 3) % 2 ? "#ff3355" : "#551122", 0.3, -0.45, 0.2, 0.2);
        ctx.strokeStyle = "#9fe8ff";
        ctx.lineWidth = Math.max(1, B * 0.12);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 3; k++) {
            const r = ((time * 1.5 + k / 3) % 1);
            ctx.globalAlpha = base * (1 - r) * 0.8;
            ctx.beginPath();
            ctx.arc(x, y - B * 1.4, B * (0.6 + r * 2.5), Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        }
        ctx.globalAlpha = base;
    },

    // Сріблясте авто мчить шосе й лишає два вогняні сліди
    timecar(ctx, t, W, H, gY, time, B) {
        const x = W * 1.15 - t * W * 1.5;
        const p = painter(ctx, B, x, gY, false);
        const flick = Math.sin(time * 30) * 0.3;
        for (let k = 0; k < 10; k++) {
            ctx.globalAlpha = Math.max(0, 1 - k / 10);
            const c = k < 2 ? "#ffffff" : k < 5 ? "#ffcc33" : "#ff5a00";
            p(c, 4.0 + k * 0.9, -0.25, 0.9, 0.12 + (k === 0 ? 0 : flick * 0.1 + 0.05));
            p(c, 4.0 + k * 0.9, -0.08, 0.9, 0.08);
        }
        ctx.globalAlpha = 1;
        p("#9a9ea8", 0, -1.0, 4.0, 0.65);
        p("#c8ccd4", 0.1, -1.0, 3.8, 0.3);
        p("#c8ccd4", 0.9, -1.55, 2.1, 0.55);
        p("#3a4a6a", 1.0, -1.45, 0.85, 0.4);
        p("#3a4a6a", 2.0, -1.45, 0.85, 0.4);
        p("#1a1a1a", 0.4, -0.45, 0.8, 0.45);
        p("#1a1a1a", 2.8, -0.45, 0.8, 0.45);
        p("#6a6a74", 0.6, -0.35, 0.4, 0.25);
        p("#6a6a74", 3.0, -0.35, 0.4, 0.25);
        p("#ffffa0", -0.1, -0.9, 0.3, 0.25);
        p("#ff3355", 3.9, -0.9, 0.15, 0.25);
        const rng = eggRng(Math.floor(time * 20));
        for (let i = 0; i < 4; i++) {
            p("#7df9ff", rng() * 4, -1.8 + rng() * 1.6, 0.12, 0.12);
        }
    },

    // Ендермен телепортується з місця на місце у фіолетових іскрах
    enderman(ctx, t, W, H, gY, time, B) {
        const idx = Math.min(3, Math.floor(t * 4));
        const local = t * 4 - idx;
        const x = W * (0.82 - idx * 0.18);
        const pop = Math.min(1, local * 5, (1 - local) * 5);
        const base = ctx.globalAlpha;
        const rng = eggRng(idx * 31 + Math.floor(time * 10));
        const p = painter(ctx, B, x, gY, false);
        ctx.globalAlpha = base * 0.9;
        for (let i = 0; i < 14; i++) {
            const burst = 1 - pop;
            p(i % 2 ? "#d070ff" : "#8a2ae0", -1.5 + rng() * 3.5, -5 + rng() * 5, 0.18 + burst * 0.1, 0.18 + burst * 0.1);
        }
        ctx.globalAlpha = base * pop;
        p("#141018", 0.05, -1.8, 0.25, 1.8);
        p("#141018", 0.45, -1.8, 0.25, 1.8);
        p("#141018", 0, -3.3, 0.75, 1.5);
        p("#141018", -0.25, -3.3, 0.2, 2.0);
        p("#141018", 0.8, -3.3, 0.2, 2.0);
        p("#141018", -0.15, -4.3, 1.05, 1.0);
        p("#d070ff", -0.05, -3.8, 0.35, 0.12);
        p("#d070ff", 0.55, -3.8, 0.35, 0.12);
        p("#f0c0ff", 0.05, -3.8, 0.12, 0.12);
        p("#f0c0ff", 0.65, -3.8, 0.12, 0.12);
        ctx.globalAlpha = base;
    },

    // Ягуар великими стрибками мчить крізь джунглі
    jaguar(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const phase = Math.abs(Math.sin(t * Math.PI * 5));
        const y = gY - phase * B * 1.2;
        const s = phase > 0.5 ? 0.4 : 0;
        const p = painter(ctx, B, x, y, false);
        p("#d8a020", -0.3 - s, -0.8, 0.3, 0.8);
        p("#d8a020", 0.3 - s * 0.5, -0.8, 0.3, 0.8);
        p("#d8a020", 1.9 + s * 0.5, -0.8, 0.3, 0.8);
        p("#d8a020", 2.4 + s, -0.8, 0.3, 0.8);
        p("#e8b030", 0, -1.6, 2.7, 0.85);
        p("#f5d890", 0.3, -0.9, 2.0, 0.2);
        p("#e8b030", 2.6, -1.8, 1.2, 0.22);
        p("#e8b030", 3.6, -2.2, 0.22, 0.5);
        p("#1a1208", 3.6, -2.3, 0.22, 0.2);
        for (const sp of [[0.4, -1.4], [1.0, -1.5], [1.6, -1.3], [2.2, -1.5], [0.7, -1.1], [1.9, -1.05], [3.0, -1.75]]) {
            p("#3a2a10", sp[0], sp[1], 0.25, 0.22);
        }
        p("#e8b030", -1.0, -2.0, 1.1, 0.85);
        p("#e8b030", -0.9, -2.25, 0.25, 0.25);
        p("#e8b030", -0.35, -2.25, 0.25, 0.25);
        p("#f5d890", -1.05, -1.5, 0.45, 0.3);
        p("#1a1208", -1.05, -1.5, 0.12, 0.12);
        p("#39ff88", -0.75, -1.8, 0.18, 0.15);
        p("#3a2a10", -0.3, -1.95, 0.2, 0.2);
    },

    // Вагонетка з кубиком-шахтарем котиться рейками, з-під коліс іскри
    minecart(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const wave = Math.sin(time * 8) > 0;
        const p = painter(ctx, B, x, gY, false);
        p("#6a4a2a", -3, -0.12, 9, 0.12);
        p("#9a9aa4", -3, -0.22, 9, 0.08);
        p("#c89a70", 0.7, -2.4, 1.0, 0.95);
        p("#4a2a10", 0.7, -2.4, 1.0, 0.3);
        p("#ffffff", 0.8, -2.0, 0.22, 0.15);
        p("#3a3aa0", 0.85, -2.0, 0.1, 0.15);
        p("#ffffff", 1.3, -2.0, 0.22, 0.15);
        p("#3a3aa0", 1.35, -2.0, 0.1, 0.15);
        p("#3a8ac8", 0.4, wave ? -3.2 : -2.6, 0.22, 0.8);
        p("#8a8a94", 0.15, wave ? -3.6 : -3.0, 0.5, 0.2);
        p("#6a4a2a", 0.35, wave ? -3.4 : -2.8, 0.12, 0.5);
        p("#6a6a74", 0, -1.55, 2.4, 1.1);
        p("#8a8a94", 0, -1.55, 2.4, 0.2);
        p("#4a4a54", 0.2, -1.2, 2.0, 0.1);
        p("#2a2a2a", 0.3, -0.5, 0.5, 0.45);
        p("#2a2a2a", 1.6, -0.5, 0.5, 0.45);
        const rng = eggRng(Math.floor(time * 16));
        for (let i = 0; i < 5; i++) {
            p(i % 2 ? "#ffe14d" : "#ff9a00", 2.2 + rng() * 1.2, -0.4 - rng() * 0.6, 0.12, 0.12);
        }
    },

    // Повітряний змій зі стрічками бореться з вітром
    kite(ctx, t, W, H, gY, time, B) {
        const x = W * (0.15 + t * 0.7) + Math.sin(time * 2.3) * B;
        const y = gY * 0.38 - Math.sin(t * Math.PI) * gY * 0.18 + Math.sin(time * 3) * B * 0.6;
        const tilt = Math.sin(time * 2.7) * 0.3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + B * 1.6);
        ctx.quadraticCurveTo(x - W * 0.1, y + gY * 0.3, x - W * 0.25, gY + B);
        ctx.stroke();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        const quads = [["#ff3355", 0, -1, -1, 0], ["#ffe14d", 0, -1, 1, 0], ["#39c6ff", 0, 1.6, -1, 0], ["#39ff88", 0, 1.6, 1, 0]];
        for (const q of quads) {
            ctx.fillStyle = q[0];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(q[1] * B, q[2] * B * 1.1);
            ctx.lineTo(q[3] * B, q[4]);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-1, -B * 1.1, 2, B * 2.9);
        ctx.fillRect(-B, -1, B * 2, 2);
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#ff5ad8"];
        for (let k = 0; k < 4; k++) {
            const bx = Math.sin(time * 5 + k) * B * 0.5 - k * B * 0.2;
            const by = B * (2.2 + k * 0.8);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(Math.round(bx), Math.round(by - B * 0.6), 1, Math.round(B * 0.8));
            ctx.fillStyle = colors[k];
            ctx.fillRect(Math.round(bx - B * 0.3), Math.round(by), Math.round(B * 0.25), Math.round(B * 0.25));
            ctx.fillRect(Math.round(bx + B * 0.05), Math.round(by), Math.round(B * 0.25), Math.round(B * 0.25));
        }
        ctx.restore();
    },

    // Зграя кажанів із червоними очима пурхає печерою
    bats(ctx, t, W, H, gY, time, B) {
        const x0 = crossLeft(t, W, B, 12);
        for (let i = 0; i < 7; i++) {
            const bx = x0 + i * B * 1.6 + Math.sin(time * 3 + i * 2) * B * 0.5;
            const by = gY * 0.28 + (i % 3) * B * 1.1 + Math.sin(time * 5 + i) * B * 0.6;
            const flap = Math.sin(time * 16 + i * 1.3) > 0;
            const p = painter(ctx, B, bx, by, false);
            p("#2a1a3a", -0.9, flap ? -0.45 : 0.05, 0.9, 0.3);
            p("#2a1a3a", 0.4, flap ? -0.45 : 0.05, 0.9, 0.3);
            p("#2a1a3a", -0.5, flap ? -0.2 : 0.2, 0.3, 0.2);
            p("#2a1a3a", 0.4, flap ? -0.2 : 0.2, 0.3, 0.2);
            p("#3a2a4a", -0.1, -0.2, 0.6, 0.55);
            p("#3a2a4a", -0.05, -0.35, 0.12, 0.15);
            p("#3a2a4a", 0.33, -0.35, 0.12, 0.15);
            p("#ff3344", 0.0, -0.1, 0.1, 0.1);
            p("#ff3344", 0.3, -0.1, 0.1, 0.1);
        }
    },

    // Рудий кіт Джонсі йде коридором, раптом вигинає спину й шипить, а тоді тікає
    jonesy(ctx, t, W, H, gY, time, B) {
        let x;
        if (t < 0.4) {
            x = W * 1.05 - (t / 0.4) * W * 0.5;
        } else if (t < 0.65) {
            x = W * 0.55;
        } else {
            x = W * 0.55 - ((t - 0.65) / 0.35) * W * 0.8;
        }
        const arch = t >= 0.4 && t < 0.65;
        const moving = !arch;
        const step = moving && Math.sin(time * (t >= 0.65 ? 30 : 16)) > 0;
        const lift = arch ? 0.45 : 0;
        const p = painter(ctx, B, x, gY, false);
        p("#ff9a3d", step ? 0.1 : 0.3, -0.45 - lift, 0.2, 0.45 + lift);
        p("#ff9a3d", step ? 1.2 : 1.0, -0.45 - lift, 0.2, 0.45 + lift);
        p("#ff9a3d", 0, -1.15 - lift, 1.6, 0.7);
        if (arch) {
            p("#ff9a3d", 0.3, -1.45 - lift, 1.0, 0.35);
            for (let k = 0; k < 5; k++) {
                p("#ffb870", 0.2 + k * 0.28, -1.65 - lift, 0.12, 0.25);
            }
        }
        p("#c86a1a", 0.4, -1.15 - lift, 0.25, 0.7);
        p("#c86a1a", 0.9, -1.15 - lift, 0.25, 0.7);
        p("#ff9a3d", 1.6, arch ? -2.3 : -1.6 + (step ? 0 : 0.15), 0.2, arch ? 1.2 : 0.7);
        p("#ff9a3d", -0.6, -1.6 - lift, 0.8, 0.8);
        p("#ffffff", -0.6, -1.0 - lift, 0.5, 0.2);
        p("#ff9a3d", -0.6, -1.85 - lift, 0.2, 0.25);
        p("#ff9a3d", -0.05, -1.85 - lift, 0.2, 0.25);
        p("#1a1a1a", -0.45, -1.4 - lift, 0.12, 0.12);
        if (arch) {
            p("#ffffff", -0.55, -1.05 - lift, 0.1, 0.12);
            speechBubble(ctx, x - B * 1.2, gY - B * (2.8 + lift), B, "Ш-Ш-Ш!", "#c86a1a");
        }
    },

    // Зомбі шкандибає з витягнутими руками
    zombie(ctx, t, W, H, gY, time, B) {
        const x = W * 1.02 - t * W * 0.95;
        const sway = Math.sin(time * 4) * 0.15;
        const step = Math.sin(time * 4) > 0 ? 0.12 : -0.12;
        const p = painter(ctx, B, x, gY, false);
        p("#3a3aa0", 0.1 + step, -1.5, 0.35, 1.5);
        p("#3a3aa0", 0.5 - step, -1.5, 0.35, 1.5);
        p("#2aa0a8", 0.05, -2.6, 0.85, 1.15);
        p("#4a8a3a", -0.85, -2.5 + sway, 1.0, 0.28);
        p("#4a8a3a", -0.85, -2.1 - sway, 1.0, 0.28);
        p("#4a8a3a", 0, -3.5, 0.95, 0.95);
        p("#3a6a2a", 0.5, -3.5, 0.45, 0.25);
        p("#1a2a1a", 0.05, -3.15, 0.22, 0.18);
        p("#1a2a1a", 0.5, -3.15, 0.22, 0.18);
        p("#2a4a1f", 0.2, -2.85, 0.5, 0.12);
        if (Math.sin(time * 1.3) > 0.4) {
            ctx.font = "bold " + Math.round(B * 0.6) + "px monospace";
            ctx.fillStyle = "#8aff7a";
            ctx.textAlign = "center";
            ctx.fillText("Ууу…", Math.round(x + B * 0.5), Math.round(gY - B * 4));
        }
    },

    // Мисливець-невидимка перебігає джунглі тремтливим маревом і на мить стає видимим
    cloaked(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 3);
        const reveal = Math.max(0, 1 - Math.abs(t - 0.55) * 8);
        const base = ctx.globalAlpha;
        const lean = Math.sin(time * 14) * B * 0.15;
        ctx.save();
        ctx.translate(x, gY);
        const shapes = [[-0.6, -5.2, 1.2, 1.1], [-1.1, -4.1, 2.2, 1.8], [-1.0, -2.3, 0.8, 2.3], [0.2, -2.3, 0.8, 2.3], [-1.6, -4.0, 0.5, 1.8], [1.1, -4.0, 0.5, 1.8]];
        for (let k = 0; k < 3; k++) {
            ctx.globalAlpha = base * (0.35 - k * 0.08) * (1 - reveal);
            ctx.strokeStyle = k === 0 ? "#d8f0ff" : "#8ac8ff";
            ctx.lineWidth = Math.max(1, B * 0.1);
            const off = Math.sin(time * 20 + k * 2) * B * 0.15;
            for (const s of shapes) {
                ctx.strokeRect(Math.round(s[0] * B + off + lean), Math.round(s[1] * B), Math.round(s[2] * B), Math.round(s[3] * B));
            }
        }
        ctx.restore();
        if (reveal > 0) {
            ctx.globalAlpha = base;
            const p = painter(ctx, B, x + lean, gY, false);
            ctx.globalAlpha = base * reveal;
            p("#6a6a3a", -1.0, -2.3, 0.8, 2.3);
            p("#6a6a3a", 0.2, -2.3, 0.8, 2.3);
            p("#8a8a94", -1.1, -4.1, 2.2, 1.8);
            p("#6a6a3a", -1.6, -4.0, 0.5, 1.8);
            p("#6a6a3a", 1.1, -4.0, 0.5, 1.8);
            p("#9a9aa4", -0.6, -5.2, 1.2, 1.1);
            p("#1a1a1a", -0.8, -4.3, 0.2, 1.2);
            p("#1a1a1a", 0.6, -4.3, 0.2, 1.2);
            p("#ff2a2a", -0.35, -4.8, 0.2, 0.15);
            p("#ff2a2a", 0.15, -4.8, 0.2, 0.15);
        }
        ctx.globalAlpha = base;
    },

    // Дрон-шпигун обшукує землю червоним променем
    spydrone(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const y = gY * 0.35 + Math.sin(time * 2) * B * 0.5;
        const sweep = Math.sin(time * 2.5) * B * 3;
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * 0.18;
        ctx.fillStyle = "#ff3355";
        ctx.beginPath();
        ctx.moveTo(x, y + B * 0.5);
        ctx.lineTo(x + sweep - B * 1.8, gY);
        ctx.lineTo(x + sweep + B * 1.8, gY);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = base * 0.6;
        ctx.fillRect(Math.round(x + sweep - B * 1.8), gY - 2, Math.round(B * 3.6), 2);
        ctx.globalAlpha = base;
        const p = painter(ctx, B, x, y, false);
        p("#4a4a58", -1.9, -0.35, 3.8, 0.15);
        p("#4a4a58", -1.7, -0.55, 0.15, 0.3);
        p("#4a4a58", 1.55, -0.55, 0.15, 0.3);
        const blur = 0.6 + Math.abs(Math.sin(time * 40)) * 0.5;
        p("rgba(200, 220, 255, 0.6)", -1.65 - blur / 2, -0.62, blur, 0.1);
        p("rgba(200, 220, 255, 0.6)", 1.6 - blur / 2, -0.62, blur, 0.1);
        p("#2a2a34", -0.8, -0.25, 1.6, 0.55);
        p("#1a1a22", -0.3, 0.3, 0.6, 0.3);
        p("#ff3355", -0.12, 0.35, 0.24, 0.2);
        p(Math.floor(time * 4) % 2 ? "#39ff88" : "#0a3a1a", 0.5, -0.15, 0.15, 0.15);
    },

    // Великий і маленький слизи стрибають болотом, сплющуючись при приземленні
    slime(ctx, t, W, H, gY, time, B) {
        const x0 = crossLeft(t, W, B, 6);
        const slimes = [[0, 1.6, 0], [2.6, 0.9, 1.3], [4.0, 0.55, 2.1]];
        for (const sl of slimes) {
            const size = sl[1];
            const jump = Math.abs(Math.sin(time * 3.2 + sl[2]));
            const sq = Math.max(0, 1 - jump * 3);
            const w = size * (1 + 0.3 * sq);
            const h = size * (1 - 0.3 * sq);
            const p = painter(ctx, B, x0 + sl[0] * B, gY - jump * B * 2.2 * size, false);
            p("rgba(110, 210, 90, 0.75)", -w / 2, -h, w, h);
            p("#3a8a2a", -w * 0.25, -h * 0.7, w * 0.5, h * 0.5);
            p("#1a3a10", -w * 0.3, -h * 0.75, w * 0.15, h * 0.15);
            p("#1a3a10", w * 0.1, -h * 0.75, w * 0.15, h * 0.15);
            p("#1a3a10", -w * 0.1, -h * 0.4, w * 0.12, h * 0.1);
            p("rgba(220, 255, 200, 0.6)", -w * 0.42, -h * 0.9, w * 0.15, h * 0.12);
        }
    },
};

export { EGG_DRAWERS_1 };
