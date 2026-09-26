// ============================================================
// skins.js — рамки й бонуси скінів, рамка досягнення, піксель-арт,
// ореол і кольори скіна для уламків вибуху
// ============================================================

import { shopSkinPerkValue, skinPerk, skinPerkValue } from "./shop.js";
import { ALL_LEVELS } from "./levels.js";
import { SKIN_RENDERERS } from "./skin_renderers.js";
import { save } from "./save.js";

// ---------- Рамка та піксельна графіка для скінів ----------

// Неонова рамка по краю кубика (всередині його меж, щоб не збільшувати розмір)
function drawSkinFrame(ctx, size, color) {
    var w = Math.max(2, size * 0.07);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.strokeRect(-size / 2 + w / 2, -size / 2 + w / 2, size - w, size - w);
}

// ---------- Бонуси скінів ----------

// Бонус скіна рівня: вид — за лігою (Ліга 1 — серії, Ліга 2 — слова, Ліги 3–4 — «Ідеально»,
// Бос — щит), сила — за рамкою на цьому рівні. Повертає { kind, value } або null
export function levelSkinPerk(level) {
    if (!level || !level.skin) {
        return null;
    }
    const kind = level.leagueId >= 5 ? "shield" : level.leagueId >= 3 ? "perfect" : level.leagueId === 2 ? "words" : "series";
    if (kind === "shield") {
        return { kind: kind, value: 1 };
    }
    const frame = save.getLevelAchievement(level.id);
    const tier = frame === "hard" ? 2 : frame === "easy" ? 1 : 0;
    return { kind: kind, value: skinPerkValue(kind, tier) };
}

// Бонус скіна, який зараз надягнуто: скін із магазину або скін рівня
export function activeSkinPerk(renderType) {
    const shopKind = skinPerk(renderType);
    if (shopKind) {
        return { kind: shopKind, value: shopSkinPerkValue(renderType) };
    }
    const level = ALL_LEVELS.find(function (l) { return l.skin && l.skin.renderType === renderType; });
    return levelSkinPerk(level);
}

// ---------- Рамка досягнення скіна (срібло — EASY, золото — HARD) ----------

// Металева рамка поверх краю кубика: градієнт металу, заклепки/камінці в кутах,
// відблиск, що біжить по периметру; у золота — ще м'яке світіння та іскорки.
// time — мілісекунди (performance.now()), size — розмір кубика.
export function drawAchievementFrame(ctx, size, achievement, time) {
    if (achievement !== "easy" && achievement !== "hard") {
        return;
    }
    var gold = achievement === "hard";
    var h = size / 2;
    var w = Math.max(2.5, size * 0.12);
    var inner = h - w / 2;
    ctx.save();
    // М'яке світіння довкола кубика: малюється лише зовні (область «квадрат мінус кубик»)
    var pulse = 0.6 + 0.4 * Math.sin(time * 0.004);
    var glowR = size * (gold ? 1.05 : 0.85);
    var glow = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, glowR);
    glow.addColorStop(0, gold ? "rgba(255, 200, 40, " + (0.55 * pulse).toFixed(3) + ")" : "rgba(230, 236, 250, 0.35)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.save();
    ctx.beginPath();
    ctx.rect(-glowR, -glowR, glowR * 2, glowR * 2);
    ctx.rect(-h, -h, size, size);
    ctx.clip("evenodd");
    ctx.fillStyle = glow;
    ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
    ctx.restore();
    // Металевий градієнт рамки
    var metal = ctx.createLinearGradient(-h, -h, h, h);
    if (gold) {
        metal.addColorStop(0, "#fff7cc");
        metal.addColorStop(0.25, "#ffd700");
        metal.addColorStop(0.5, "#b8860b");
        metal.addColorStop(0.75, "#ffe680");
        metal.addColorStop(1, "#8b6914");
    } else {
        metal.addColorStop(0, "#ffffff");
        metal.addColorStop(0.3, "#9aa4b8");
        metal.addColorStop(0.5, "#eef2f8");
        metal.addColorStop(0.75, "#7b8497");
        metal.addColorStop(1, "#dfe6f2");
    }
    ctx.strokeStyle = metal;
    ctx.lineWidth = w;
    ctx.strokeRect(-inner, -inner, inner * 2, inner * 2);
    // Тонкі темні лінії з обох боків металу — об'єм
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.strokeRect(-h + w, -h + w, size - w * 2, size - w * 2);
    // Відблиск, що біжить по периметру
    var perim = (time * 0.00045) % 1 * 4;
    var side = Math.floor(perim);
    var t = perim - side;
    var len = size * 0.3;
    var pos = -h + t * (size + len) - len;
    ctx.fillStyle = gold ? "rgba(255, 255, 220, 0.85)" : "rgba(255, 255, 255, 0.85)";
    var a0 = Math.max(-h, pos);
    var a1 = Math.min(h, pos + len);
    if (a1 > a0) {
        if (side === 0) { ctx.fillRect(a0, -h, a1 - a0, w * 0.45); }
        else if (side === 1) { ctx.fillRect(h - w * 0.45, a0, w * 0.45, a1 - a0); }
        else if (side === 2) { ctx.fillRect(-a1, h - w * 0.45, a1 - a0, w * 0.45); }
        else { ctx.fillRect(-h, -a1, w * 0.45, a1 - a0); }
    }
    // Кути: заклепки (срібло) або камінці (золото)
    var c = w * 0.85;
    var corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
    var gems = ["#ff2244", "#33ccff", "#39ff88", "#b06bff"];
    for (var i = 0; i < 4; i++) {
        var cx = corners[i][0] + (corners[i][0] < 0 ? w / 2 : -w / 2);
        var cy = corners[i][1] + (corners[i][1] < 0 ? w / 2 : -w / 2);
        if (gold) {
            ctx.fillStyle = gems[i];
            ctx.beginPath();
            ctx.moveTo(cx, cy - c * 0.75);
            ctx.lineTo(cx + c * 0.75, cy);
            ctx.lineTo(cx, cy + c * 0.75);
            ctx.lineTo(cx - c * 0.75, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(cx - c * 0.25, cy - c * 0.45, c * 0.2, c * 0.2);
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - c * 0.35, cy - c * 0.35, c * 0.7, c * 0.7);
            ctx.fillStyle = "#7b8497";
            ctx.fillRect(cx, cy, c * 0.35, c * 0.35);
        }
    }
    // Іскорки золота, що спалахують по черзі біля кутів
    if (gold) {
        var which = Math.floor(time / 450) % 4;
        var phase = (time % 450) / 450;
        var spark = Math.sin(phase * Math.PI);
        var sx = corners[which][0] * 1.15;
        var sy = corners[which][1] * 1.15;
        var ss = size * 0.06 * spark;
        ctx.fillStyle = "rgba(255, 255, 230, " + spark.toFixed(2) + ")";
        ctx.fillRect(sx - ss / 2, sy - ss * 1.6, ss, ss * 3.2);
        ctx.fillRect(sx - ss * 1.6, sy - ss / 2, ss * 3.2, ss);
    }
    ctx.restore();
}

// Піксельний малюнок: rows — рядки однакової довжини, кожен символ — ключ кольору з palette
function drawPixelArt(ctx, size, rows, palette) {
    var n = rows.length;
    var p = size / n;
    for (var r = 0; r < n; r++) {
        var row = rows[r];
        for (var c = 0; c < row.length; c++) {
            ctx.fillStyle = palette[row[c]];
            // +0.5 перекриває шви між пікселями при згладжуванні
            ctx.fillRect(-size / 2 + c * p, -size / 2 + r * p, p + 0.5, p + 0.5);
        }
    }
}

// ---------- Допоміжна функція градієнтного ореолу (замість shadowBlur) ----------

function renderSkinGlow(ctx, size, color, blur) {
    if (blur <= 0) return;
    var r = size / 2 + blur * 1.2;
    var grad = ctx.createRadialGradient(0, 0, size * 0.12, 0, 0, r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, color);
    grad.addColorStop(1, "transparent");
    var prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = grad;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.globalAlpha = prevAlpha;
}

// ---------- Реєстр функцій рендерингу скінів ----------

// ---------- Кольори скіна для уламків вибуху ----------

// Скін малюється в крихітне полотно, звідти беруться кілька характерних кольорів.
// Результат кешується для кожного типу скіна.
const skinColorCache = {};

function sampleSkinColors(renderType) {
    if (skinColorCache[renderType]) {
        return skinColorCache[renderType];
    }
    const fallback = ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
    const renderFn = SKIN_RENDERERS[renderType];
    if (!renderFn || typeof document === "undefined") {
        return fallback;
    }
    try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const sctx = canvas.getContext("2d", { willReadFrequently: true });
        sctx.translate(size / 2, size / 2);
        renderFn(sctx, size, 0, {});
        const data = sctx.getImageData(0, 0, size, size).data;
        const counts = {};
        for (let y = 2; y < size - 2; y += 2) {
            for (let x = 2; x < size - 2; x += 2) {
                const i = (y * size + x) * 4;
                if (data[i + 3] < 200) {
                    continue;
                }
                // Квантування, щоб схожі відтінки злилися в один колір
                const r = data[i] & 0xe0;
                const g = data[i + 1] & 0xe0;
                const b = data[i + 2] & 0xe0;
                if (r + g + b < 96) {
                    continue;
                }
                const key = "rgb(" + (r + 16) + "," + (g + 16) + "," + (b + 16) + ")";
                counts[key] = (counts[key] || 0) + 1;
            }
        }
        const colors = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 5);
        skinColorCache[renderType] = colors.length > 0 ? colors : fallback;
    } catch (e) {
        skinColorCache[renderType] = fallback;
    }
    return skinColorCache[renderType];
}

export { drawPixelArt, drawSkinFrame, renderSkinGlow, sampleSkinColors };
