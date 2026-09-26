// ============================================================
// shop_skins.js — скіни, які продаються в магазині за монети: хелпери малювання й
// реєстр SHOP_SKIN_RENDERERS, зібраний з частин shop_skins_1.js … shop_skins_4.js.
// Кожна функція малює кубик у локальних координатах (центр у 0,0), time — мілісекунди.
// При time = 0 кожен скін має «спокійну» позу: цей кадр показується сірим і нерухомим,
// доки скін не куплено. Новий скін — в останню частину (порядок ключів = порядок у меню).
// ============================================================

import { SHOP_SKINS_1 } from "./shop_skins_1.js";
import { SHOP_SKINS_2 } from "./shop_skins_2.js";
import { SHOP_SKINS_3 } from "./shop_skins_3.js";
import { SHOP_SKINS_4 } from "./shop_skins_4.js";

// Прямокутник у частках розміру кубика: x, y від -0.5 до 0.5
function r(ctx, s, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x * s, y * s, w * s, h * s);
}

// Коло у частках розміру кубика
function disc(ctx, s, color, x, y, rad) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * s, y * s, Math.max(0.5, rad * s), 0, Math.PI * 2);
    ctx.fill();
}

// Трикутник у частках розміру кубика
function tri(ctx, s, color, x1, y1, x2, y2, x3, y3) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 * s, y1 * s);
    ctx.lineTo(x2 * s, y2 * s);
    ctx.lineTo(x3 * s, y3 * s);
    ctx.closePath();
    ctx.fill();
}

// Тонка рамка по краю кубика (як у скінів рівнів)
function frame(ctx, s, color) {
    var w = Math.max(2, s * 0.07);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.strokeRect(-s / 2 + w / 2, -s / 2 + w / 2, s - w, s - w);
}

// Моргання: повертає true лише на короткий час наприкінці кожного періоду,
// тож при time = 0 очі завжди відкриті
function blinking(time, period, offset) {
    return ((time + (offset || 0)) % period) > period - 140;
}

// Очі з відблиском: квадрат кольору color, зіниця зі зсувом dx
function eye(ctx, s, x, y, w, color, pupil, dx) {
    r(ctx, s, color, x, y, w, w);
    r(ctx, s, pupil, x + w * 0.3 + (dx || 0), y + w * 0.25, w * 0.45, w * 0.6);
    r(ctx, s, "#ffffff", x + w * 0.32 + (dx || 0), y + w * 0.28, w * 0.18, w * 0.18);
}

export const SHOP_SKIN_RENDERERS = Object.assign({}, SHOP_SKINS_1, SHOP_SKINS_2, SHOP_SKINS_3, SHOP_SKINS_4);

export { blinking, disc, eye, frame, r, tri };
