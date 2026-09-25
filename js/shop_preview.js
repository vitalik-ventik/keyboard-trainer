// ============================================================
// shop_preview.js — живі сценки товарів магазину (150×100)
// Спільні для магазину в грі (main.js) і сторінки перегляду (preview.html).
// ============================================================

import { SKIN_RENDERERS } from "./engine.js";
import { drawTrail, drawExplosion, drawAccessory, drawCoinIcon, drawChest, getShopItem, itemRarity } from "./shop.js";
import { drawWeaponDemo } from "./weapons.js";

// Сценка скіна: темне тло, земля й кубик (з аксесуаром, якщо його передано)
export function drawShopSkinScene(pctx, item, time, accessory) {
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.84;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);
    const size = 44;
    const hop = time > 0 ? Math.abs(Math.sin(time * 0.003)) * 6 : 0;
    pctx.save();
    pctx.translate(w / 2, groundY - size / 2 - hop);
    SKIN_RENDERERS[item.renderType](pctx, size, time, {});
    if (accessory) {
        drawAccessory(pctx, accessory, size, time);
    }
    pctx.restore();
}

// Прев'ю зброї: шип під'їжджає, кубик із поточним скіном атакує
function drawWeaponScene(pctx, item, now, opts) {
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.82;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);
    const skinFn = SKIN_RENDERERS[opts.skinType] || SKIN_RENDERERS.neon_base;
    pctx.save();
    pctx.beginPath();
    pctx.rect(0, 0, w, h);
    pctx.clip();
    if (item.id === "weapon_none") {
        // Без зброї: кубик просто перестрибує шип
        const cycle = 1800;
        const ph = (now % cycle) / cycle;
        const spikeX = w + 10 - ph * (w + 20);
        pctx.fillStyle = "#4a1030";
        pctx.strokeStyle = "#ff2ea6";
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.moveTo(spikeX - 13, groundY);
        pctx.lineTo(spikeX, groundY - 28);
        pctx.lineTo(spikeX + 13, groundY);
        pctx.closePath();
        pctx.fill();
        pctx.stroke();
        const d = spikeX - 30;
        const hop = Math.abs(d) < 45 ? Math.cos(d / 45 * Math.PI / 2) * 42 : 0;
        pctx.translate(30, groundY - 15 - hop);
        pctx.rotate(hop > 0 ? (1 - d / 45) * Math.PI / 2 : 0);
        skinFn(pctx, 30, now, {});
    } else {
        drawWeaponDemo(pctx, item.id, w, h, now, function (c, size) {
            skinFn(c, size, now, {});
        });
    }
    pctx.restore();
}

// Жива сценка товару 150×100 (полотно вже масштабоване під dpr).
// opts: { skinType — скін кубика, accessory — одягнутий аксесуар }
export function drawShopItemScene(pctx, item, now, opts) {
    if (item.type === "skin") {
        drawShopSkinScene(pctx, item, now, opts.accessory);
        return;
    }
    if (item.type === "weapon") {
        drawWeaponScene(pctx, item, now, opts);
        return;
    }
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.82;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);

    // Аксесуари показуємо на більшому кубику, щоб було видно деталі
    const size = item.type === "accessory" ? 46 : item.type === "explosion" ? 34 : 30;
    const skinFn = SKIN_RENDERERS[opts.skinType] || SKIN_RENDERERS.neon_base;
    const accessory = item.type === "accessory" ? item.id : opts.accessory;
    let cx = w * 0.5;
    let cy = groundY - size / 2;
    let rot = 0;
    let showCube = true;

    if (item.type === "trail") {
        cx = w * 0.7;
        const hop = function (t) {
            return Math.abs(Math.sin(t * 0.003)) * h * 0.35;
        };
        const points = [];
        for (let k = 0; k < 18; k++) {
            const tk = now - k * 16;
            points.push({
                sx: cx - k * 5,
                sy: groundY - size / 2 - hop(tk),
                alpha: 0.55 * (1 - k / 18),
                i: Math.floor(tk / 16)
            });
        }
        drawTrail(pctx, item.id, points, size, now);
        cy = groundY - size / 2 - hop(now);
        rot = (now * 0.006) % (Math.PI * 2);
    } else if (item.type === "explosion") {
        const cycle = 2400;
        const ph = now % cycle;
        if (ph >= 700) {
            showCube = false;
            const t = (ph - 700) / 1000;
            if (item.id === "boom_default") {
                // Звичайний вибух: квадратні уламки
                for (let i = 0; i < 10; i++) {
                    const a = i * Math.PI * 2 / 10;
                    const d = t * size * 2.4;
                    pctx.globalAlpha = Math.max(0, 1 - t / 1.2);
                    pctx.fillStyle = i % 2 === 0 ? "#00f6ff" : "#ff2ea6";
                    pctx.fillRect(cx + Math.cos(a) * d - 3, cy + Math.sin(a) * d + t * t * 30 - 3, 6, 6);
                }
                pctx.globalAlpha = 1;
            } else {
                drawExplosion(pctx, item.id, t, cx, cy, size);
            }
        }
    } else {
        cy = groundY - size / 2 - Math.abs(Math.sin(now * 0.004)) * 6;
        cx = w * 0.5;
        cy += 4;
    }
    if (showCube) {
        pctx.save();
        pctx.translate(cx, cy);
        pctx.rotate(rot);
        skinFn(pctx, size, now, {});
        drawAccessory(pctx, accessory, size, now);
        pctx.restore();
    }
}

// ---------- Сундук ----------

// Тривалість трусіння й відкривання кришки (мс)
export const CHEST_SHAKE_MS = 900;
export const CHEST_OPEN_MS = 450;

// Сценка сундука W×H. openT — мс від натискання «Відкрити» (null — ще закритий):
// 0…CHEST_SHAKE_MS трусіння, далі відкривання, потім нагорода вилітає й зависає.
// result — { kind: "crystals", amount } або { kind: "item", id }.
// opts: { skinType, accessory } — для живої сценки предмета.
export function drawChestScene(c, W, H, type, openT, result, now, opts) {
    c.clearRect(0, 0, W, H);
    const cx = W / 2;
    const bottom = H - 24;
    const size = 130;
    let shake = 0;
    let open = 0;
    let glow = 0;
    let bob = Math.sin(now * 0.004) * 3;
    let revealT = -1;
    if (openT !== null && openT !== undefined) {
        bob = 0;
        if (openT < CHEST_SHAKE_MS) {
            const k = openT / CHEST_SHAKE_MS;
            shake = Math.sin(now * 0.08) * (2 + k * 9);
            glow = k * 0.4;
        } else if (openT < CHEST_SHAKE_MS + CHEST_OPEN_MS) {
            const k = (openT - CHEST_SHAKE_MS) / CHEST_OPEN_MS;
            open = k;
            glow = 0.4 + k * 0.6;
        } else {
            open = 1;
            glow = 0.8 + 0.2 * Math.sin(now * 0.004);
            revealT = openT - CHEST_SHAKE_MS - CHEST_OPEN_MS;
        }
    }
    drawChest(c, type, cx, bottom + bob, size, shake, open, glow);

    // Нагорода вилітає з сундука й зависає над ним
    if (revealT >= 0 && result) {
        const k = Math.min(1, revealT / 500);
        const ease = 1 - Math.pow(1 - k, 3);
        c.save();
        c.globalAlpha = Math.min(1, k * 1.5);
        if (result.kind === "crystals") {
            const y = bottom - 90 - ease * 70;
            drawCoinIcon(c, cx - 30, y, 46 + ease * 10);
            c.font = "900 30px 'Segoe UI', Arial";
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.lineWidth = 5;
            c.strokeStyle = "#070b1c";
            c.strokeText("+" + result.amount, cx - 2, y);
            c.fillStyle = "#ffd84a";
            c.fillText("+" + result.amount, cx - 2, y);
        } else {
            // Жива сценка предмета в рамці кольору рідкості
            const item = getShopItem(result.id);
            const rarity = itemRarity(item);
            const scale = 0.4 + ease * 0.75;
            const w = 150 * scale;
            const h = 100 * scale;
            c.translate(cx - w / 2, bottom - 95 - ease * 60 - h / 2);
            c.scale(scale, scale);
            c.save();
            c.beginPath();
            c.rect(0, 0, 150, 100);
            c.clip();
            drawShopItemScene(c, item, now, opts || {});
            c.restore();
            c.strokeStyle = rarity.color;
            c.lineWidth = 3 / scale;
            c.strokeRect(0, 0, 150, 100);
        }
        c.restore();
    }
}
