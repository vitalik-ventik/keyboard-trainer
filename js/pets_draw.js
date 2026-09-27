// ============================================================
// pets_draw.js — малювання улюбленця на полотні: малювальник із pet_renderers.js,
// водяна бульбашка для плавучих, мутації (перефарбування й іскорки), емоції
// (сердечко, сльозинка, вогники серії) і сяйво рідкості
// ============================================================

import { getShopItem } from "./shop.js";
import { PET_MUTATIONS, petRarityColor } from "./shop_pets.js";
import { PET_RENDERERS } from "./pet_renderers.js";
import { PET_OUTLINE } from "./pet_parts.js";

// Одне спільне полотно для мутацій: улюбленці малюються по черзі, тож його вистачає
let mutationCanvas = null;

function getMutationCanvas(px) {
    if (!mutationCanvas) {
        try {
            mutationCanvas = document.createElement("canvas");
        } catch (err) {
            console.warn("Не вдалося створити полотно для мутації улюбленця:", err);
            return null;
        }
    }
    if (mutationCanvas.width < px || mutationCanvas.height < px) {
        mutationCanvas.width = px;
        mutationCanvas.height = px;
    }
    return mutationCanvas;
}

// Колір перефарбування мутації (райдужна — переливається)
function mutationFill(c, mutation, box, time) {
    if (mutation.tint) {
        return mutation.tint;
    }
    const grad = c.createLinearGradient(-box / 2, -box / 2, box / 2, box / 2);
    const shift = (time || 0) * 0.15;
    for (let i = 0; i <= 5; i++) {
        grad.addColorStop(i / 5, "hsl(" + Math.round((shift + i * 60) % 360) + ", 95%, 60%)");
    }
    return grad;
}

// Малює улюбленця через окреме полотно й перефарбовує лише його пікселі:
// mutationKey — мутація, null — чорний силует (секретний улюбленець, якого ще не знайдено)
function drawMutated(ctx, fn, size, time, o, mutationKey) {
    const mutation = mutationKey ? PET_MUTATIONS[mutationKey] : { alpha: 1, tint: "#05060d" };
    const m = ctx.getTransform();
    const scale = Math.max(0.5, Math.hypot(m.a, m.b));
    const box = size * 2.4;
    const px = Math.max(8, Math.ceil(box * scale));
    const canvas = getMutationCanvas(px);
    if (!canvas) {
        fn(ctx, size, time, o);
        return;
    }
    const c = canvas.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.clearRect(0, 0, px, px);
    c.setTransform(scale, 0, 0, scale, px / 2, px / 2);
    fn(c, size, time, o);
    c.globalCompositeOperation = "source-atop";
    c.globalAlpha = mutation.alpha;
    c.fillStyle = mutationFill(c, mutation, box, time);
    c.fillRect(-box / 2, -box / 2, box, box);
    // Відблиск, що пробігає по золотому й алмазному улюбленцю
    if (mutationKey === "gold" || mutationKey === "diamond") {
        const run = time ? ((time * 0.0006) % 1.6) - 0.3 : 0.4;
        const gx = -box / 2 + run * box;
        const shine = c.createLinearGradient(gx - size * 0.3, 0, gx + size * 0.3, 0);
        shine.addColorStop(0, "rgba(255, 255, 255, 0)");
        shine.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
        shine.addColorStop(1, "rgba(255, 255, 255, 0)");
        c.globalAlpha = 0.45;
        c.fillStyle = shine;
        c.fillRect(-box / 2, -box / 2, box, box);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    ctx.drawImage(canvas, 0, 0, px, px, -box / 2, -box / 2, box, box);
}

function drawStar(ctx, x, y, r, color) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const rr = i % 2 === 0 ? r : r * 0.35;
        const a = i * Math.PI / 4 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// Іскорки навколо мутованого улюбленця
function drawMutationSparkles(ctx, mutationKey, size, time) {
    const t = time || 0;
    ctx.save();
    if (mutationKey === "lava") {
        // Жарини здіймаються вгору
        for (let i = 0; i < 5; i++) {
            const k = ((t * 0.0008 + i * 0.2) % 1);
            ctx.globalAlpha = 1 - k;
            ctx.fillStyle = i % 2 === 0 ? "#ffb02e" : "#ff4a1a";
            ctx.beginPath();
            ctx.arc(-size * 0.35 + i * size * 0.17, size * 0.3 - k * size * 0.9, size * 0.035, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (mutationKey === "candy") {
        // Кольорова посипка кружляє
        const colors = ["#ff5fa8", "#4fd2ff", "#ffe14d", "#7dff8a"];
        for (let i = 0; i < 6; i++) {
            const a = t * 0.002 + i * Math.PI / 3;
            ctx.save();
            ctx.translate(Math.cos(a) * size * 0.55, Math.sin(a) * size * 0.35 - size * 0.05);
            ctx.rotate(a * 2);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(-size * 0.04, -size * 0.012, size * 0.08, size * 0.024);
            ctx.restore();
        }
    } else {
        // Мерехтливі зірочки: золоті, білі алмазні або райдужні
        for (let i = 0; i < 4; i++) {
            const tw = Math.sin(t * 0.006 + i * 1.7);
            if (tw < 0.1 && t) {
                continue;
            }
            const color = mutationKey === "gold" ? "#fff2a8" : mutationKey === "diamond" ? "#ffffff" :
                "hsl(" + Math.round((t * 0.2 + i * 90) % 360) + ", 100%, 70%)";
            const pos = [[-0.42, -0.3], [0.4, -0.36], [0.46, 0.12], [-0.46, 0.18]][i];
            drawStar(ctx, pos[0] * size, pos[1] * size, size * 0.08 * (t ? Math.max(0.3, tw) : 0.8), color);
        }
    }
    ctx.restore();
}

// Емоції над улюбленцем
function drawMoodFx(ctx, o, size, time) {
    const t = time || 0;
    if (o.mood === "happy") {
        const k = Math.min(1, Math.max(0, 1 - (o.happyT || 0)));
        ctx.save();
        ctx.globalAlpha = 1 - k * 0.6;
        const y = -size * (0.62 + k * 0.3);
        ctx.fillStyle = "#ff4a7a";
        ctx.beginPath();
        const r = size * 0.1;
        ctx.moveTo(0, y + r * 1.2);
        ctx.bezierCurveTo(-r * 2, y - r * 0.2, -r * 0.8, y - r * 1.6, 0, y - r * 0.5);
        ctx.bezierCurveTo(r * 0.8, y - r * 1.6, r * 2, y - r * 0.2, 0, y + r * 1.2);
        ctx.fill();
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.strokeStyle = PET_OUTLINE;
        ctx.stroke();
        ctx.restore();
    } else if (o.mood === "sad") {
        // Сльозинка
        const k = t ? (t % 1400) / 1400 : 0.3;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = "#6fd3ff";
        ctx.beginPath();
        const x = size * 0.3;
        const y = -size * 0.05 + k * size * 0.4;
        ctx.arc(x, y, size * 0.045, 0, Math.PI);
        ctx.lineTo(x, y - size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    } else if (o.mood === "combo") {
        // Вогники серії кружляють над улюбленцем
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const a = t * 0.004 + i * Math.PI * 2 / 3;
            ctx.globalAlpha = 0.85;
            drawStar(ctx, Math.cos(a) * size * 0.3, -size * 0.72 + Math.sin(a) * size * 0.08, size * 0.06, i === 0 ? "#ffe14d" : "#ff9a1a");
        }
        ctx.restore();
    }
}

// Водяна бульбашка навколо плавучого улюбленця (у світах без води)
function drawBubbleBack(ctx, size) {
    const r = size * 0.72;
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, "rgba(160, 230, 255, 0.35)");
    g.addColorStop(1, "rgba(60, 150, 230, 0.28)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawBubbleFront(ctx, size, time) {
    const r = size * 0.72;
    ctx.lineWidth = Math.max(1.2, size * 0.05);
    ctx.strokeStyle = "rgba(190, 240, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, Math.PI * 1.1, Math.PI * 1.45);
    ctx.stroke();
    // Ланцюжок дрібних бульбашок позаду
    const t = time || 0;
    ctx.fillStyle = "rgba(190, 240, 255, 0.7)";
    for (let i = 0; i < 3; i++) {
        const k = ((t * 0.001 + i / 3) % 1);
        ctx.beginPath();
        ctx.arc(-r - k * size * 0.6, -size * 0.1 - k * size * 0.3 + Math.sin(k * 8 + i) * size * 0.05, size * (0.06 - i * 0.012), 0, Math.PI * 2);
        ctx.fill();
    }
}

// Хвилька під улюбленцем у водяних світах
function drawWaterline(ctx, size, time) {
    const t = time || 0;
    ctx.strokeStyle = "rgba(150, 230, 255, 0.85)";
    ctx.lineWidth = Math.max(1.2, size * 0.05);
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
        const x = -size * 0.6 + i * size * 0.15;
        const y = size * 0.32 + Math.sin(t * 0.006 + i) * size * 0.04;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

// Улюбленець із центром у (0, 0), лапи на y = size / 2.
// opts: { mood, moving, happyT, mutation, water — світ із водою (плавучим бульбашка не потрібна),
//         silhouette — чорний силует (ще не знайдений секретний улюбленець) }
export function drawPet(ctx, id, size, time, opts) {
    const fn = PET_RENDERERS[id];
    if (!fn) {
        return;
    }
    const o = opts || {};
    const item = getShopItem(id);
    const swims = !!item && item.move === "swim";
    const bubble = swims && !o.water;
    ctx.save();
    if ((swims || (item && item.move === "fly")) && time) {
        ctx.translate(0, Math.sin(time * 0.004) * size * 0.05);
    }
    if (bubble) {
        drawBubbleBack(ctx, size);
        ctx.scale(0.8, 0.8);
    }
    if (o.silhouette) {
        drawMutated(ctx, fn, size, time, o, null);
        ctx.font = "900 " + Math.round(size * 0.5) + "px 'Segoe UI', Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#9cffe8";
        ctx.fillText("?", 0, 0);
        ctx.restore();
        return;
    }
    if (o.mutation && PET_MUTATIONS[o.mutation]) {
        drawMutated(ctx, fn, size, time, o, o.mutation);
    } else {
        fn(ctx, size, time, o);
    }
    if (bubble) {
        ctx.scale(1.25, 1.25);
        drawBubbleFront(ctx, size, time);
    } else if (swims && o.water) {
        drawWaterline(ctx, size, time);
    }
    if (o.mutation && PET_MUTATIONS[o.mutation]) {
        drawMutationSparkles(ctx, o.mutation, size, time);
    }
    drawMoodFx(ctx, o, size, time);
    ctx.restore();
}

// Сяйво рідкості під улюбленцем (від епічного й вище). cx, groundY — точка на землі
export function drawPetAura(ctx, id, cx, groundY, size, time) {
    const item = getShopItem(id);
    if (!item || item.rarity === "common" || item.rarity === "rare") {
        return;
    }
    const color = petRarityColor(item, time);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin((time || 0) * 0.004);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, groundY, size * 0.55, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
