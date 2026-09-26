// ============================================================
// shop_chests.js — сундуки: типи, рідкість товарів, випадання й малювання сундука
// ============================================================

import { basePrice } from "./shop_rewards.js";
import { SHOP_ITEMS } from "./shop.js";

// ---------- Сундуки ----------

// Типи сундуків: шанс предмета (інакше монети), діапазон монет,
// найдорожчий предмет, який може випасти, і наскільки сундук «тягне» до дорогих речей
// (rarityPower: чим менше, тим частіше випадають дорогі; 1 — вага обернено пропорційна ціні).
// legendaryChance — окремий крихітний шанс легендарного предмета: він випадає навіть
// без виконання умови (пройти Боса, золоті рамки) — справжня удача
export const CHEST_TYPES = {
    wood: { name: "Дерев'яний сундук", itemChance: 0.25, crystals: [8, 20], maxPrice: 300, rarityPower: 1.2, legendaryChance: 0.003, heartChance: 0.12 },
    silver: { name: "Срібний сундук", itemChance: 0.55, crystals: [20, 50], maxPrice: 800, rarityPower: 0.8, legendaryChance: 0.01, heartChance: 0.18 },
    gold: { name: "Золотий сундук", itemChance: 0.8, crystals: [50, 110], maxPrice: 2000, rarityPower: 0.4, legendaryChance: 0.03, heartChance: 0.25 }
};

// Шанс сундука за повторну перемогу й гарантія: не більше 4 перемог поспіль без сундука
export const REPLAY_CHEST_CHANCE = 0.25;
export const CHEST_PITY_WINS = 5;

// Рідкість предмета за базовою ціною (без коефіцієнта ліги) — для підпису під нагородою
export function itemRarity(item) {
    if (item && item.legendary) {
        return { name: "⭐ ЛЕГЕНДАРНИЙ", color: "#ffcc33" };
    }
    if (!item || basePrice(item) < 200) {
        return { name: "Звичайний", color: "#c8d0e0" };
    }
    if (basePrice(item) < 600) {
        return { name: "Рідкісний", color: "#39c6ff" };
    }
    return { name: "Епічний", color: "#d68bff" };
}

// Які сундуки дає перемога. win: { firstClear, leagueId, newSilver, newGold, winsWithoutChest }
// Повертає { chests: ["wood", …], winsWithoutChest } — оновлений лічильник гарантії
export function chestsForVictory(win, random) {
    const rnd = random || Math.random;
    const chests = [];
    if (win.firstClear) {
        chests.push(win.leagueId >= 4 ? "gold" : win.leagueId >= 2 ? "silver" : "wood");
    }
    if (chests.length === 0) {
        const pity = (win.winsWithoutChest || 0) + 1 >= CHEST_PITY_WINS;
        // Аксесуар може підвищити шанс сундука (win.chestBonus)
        if (pity || rnd() < REPLAY_CHEST_CHANCE + (win.chestBonus || 0)) {
            chests.push("wood");
        }
    }
    return { chests: chests, winsWithoutChest: chests.length > 0 ? 0 : (win.winsWithoutChest || 0) + 1 };
}

// Звичайні товари відкриваються за лігою, до якої дійшов гравець:
// до 600 — одразу; товари Ліг 2–4 мають поле league (легендарні — за своїми умовами,
// або за полем league — зброя та товари пізніх ліг)
export function shopTierLeague(item) {
    if (!item || item.legendary) {
        return 1;
    }
    // Зброя й товари пізніх ліг мають власну лігу
    if (typeof item.league === "number") {
        return item.league;
    }
    if (item.price <= 600) {
        return 1;
    }
    return item.price <= 2000 ? 2 : 3;
}

// Частка, з якою в сундуку лишається випадена річ не-скін (шлейф, вибух,
// аксесуар, зброя); інакше замість неї — монети. Скіни випадають як і раніше,
// а решту сходинок частіше доводиться купувати
export const NON_SKIN_ITEM_KEEP = 0.4;

// Предмети, які можуть випасти із сундука: ще не куплені, не безкоштовні,
// не легендарні й не дорожчі за межу сундука. Вага — обернено до ціни,
// keep — частка, з якою річ справді лишається (не-скіни — NON_SKIN_ITEM_KEEP).
export function chestItemPool(type, isOwned) {
    const chest = CHEST_TYPES[type] || CHEST_TYPES.wood;
    const pool = [];
    for (const item of SHOP_ITEMS) {
        if (item.price <= 0 || item.legendary || basePrice(item) > chest.maxPrice || isOwned(item.id)) {
            continue;
        }
        pool.push({ item: item, weight: 1 / Math.pow(basePrice(item), chest.rarityPower), keep: item.type === "skin" ? 1 : NON_SKIN_ITEM_KEEP });
    }
    const total = pool.reduce(function (s, p) { return s + p.weight; }, 0);
    for (const p of pool) {
        p.chance = total > 0 ? p.weight / total : 0;
    }
    return pool;
}

// Вміст сундука: { kind: "item", id } або { kind: "crystals", amount }.
// Якщо купувати вже нічого (усе з пулу є) — завжди монети.
// itemBonus — добавка до шансу речі від аксесуара (0…1)
// heartBonus — добавка до шансу сердечка від скіна й аксесуара (0…1)
export function rollChest(type, isOwned, random, itemBonus, heartBonus) {
    const rnd = random || Math.random;
    const chest = CHEST_TYPES[type] || CHEST_TYPES.wood;
    // Спершу — крихітний шанс легендарного предмета (будь-якого ще не купленого)
    const legendaries = SHOP_ITEMS.filter(function (item) { return item.legendary && !isOwned(item.id); });
    if (legendaries.length > 0 && rnd() < chest.legendaryChance) {
        return { kind: "item", id: legendaries[Math.floor(rnd() * legendaries.length) % legendaries.length].id };
    }
    // Сердечко — запасне життя (із золотого сундука іноді два)
    if (rnd() < Math.min(0.6, (chest.heartChance || 0) + (heartBonus || 0))) {
        return { kind: "heart", amount: type === "gold" && rnd() < 0.3 ? 2 : 1 };
    }
    const pool = chestItemPool(type, isOwned);
    if (pool.length > 0 && rnd() < Math.min(0.95, chest.itemChance + (itemBonus || 0))) {
        let r = rnd();
        let picked = pool[pool.length - 1];
        for (const p of pool) {
            r -= p.chance;
            if (r <= 0) {
                picked = p;
                break;
            }
        }
        // Річ не-скін лишається лише з часткою keep, інакше — монети
        if (picked.keep >= 1 || rnd() < picked.keep) {
            return { kind: "item", id: picked.item.id };
        }
    }
    const lo = chest.crystals[0];
    const hi = chest.crystals[1];
    return { kind: "crystals", amount: Math.round(lo + rnd() * (hi - lo)) };
}

// Кольори сундуків: корпус, темні дошки, окуття
const CHEST_COLORS = {
    wood: { body: "#a8682a", dark: "#6a3c14", metal: "#c8c8c0", glow: "255, 210, 120" },
    silver: { body: "#b8c4d8", dark: "#6a7488", metal: "#ffffff", glow: "200, 230, 255" },
    gold: { body: "#ffc21a", dark: "#b8860b", metal: "#fff4b0", glow: "255, 220, 80" }
};

// Піксельний сундук. cx, cy — центр дна; s — ширина. shake — зміщення для трусіння,
// open — від 0 (закритий) до 1 (кришка відкинута), glow — сяйво зсередини 0..1
export function drawChest(ctx, type, cx, cy, s, shake, open, glow) {
    const c = CHEST_COLORS[type] || CHEST_COLORS.wood;
    const w = s;
    const h = s * 0.55;
    ctx.save();
    ctx.translate(cx + (shake || 0), cy);
    // Сяйво з-під кришки
    if (glow > 0) {
        const g = ctx.createRadialGradient(0, -h, 4, 0, -h, s * 1.2);
        g.addColorStop(0, "rgba(" + c.glow + ", " + (0.85 * glow).toFixed(2) + ")");
        g.addColorStop(1, "rgba(" + c.glow + ", 0)");
        ctx.fillStyle = g;
        ctx.fillRect(-s * 1.2, -h - s * 1.2, s * 2.4, s * 2.4);
        // Промені
        ctx.fillStyle = "rgba(" + c.glow + ", " + (0.35 * glow).toFixed(2) + ")";
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i - 2) * 0.32;
            ctx.beginPath();
            ctx.moveTo(-w * 0.3, -h);
            ctx.lineTo(Math.cos(a - 0.08) * s * 1.4, -h + Math.sin(a - 0.08) * s * 1.4);
            ctx.lineTo(Math.cos(a + 0.08) * s * 1.4, -h + Math.sin(a + 0.08) * s * 1.4);
            ctx.lineTo(w * 0.3, -h);
            ctx.closePath();
            ctx.fill();
        }
    }
    // Корпус
    ctx.fillStyle = c.body;
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.fillStyle = c.dark;
    ctx.fillRect(-w / 2, -h * 0.55, w, h * 0.08);
    ctx.fillRect(-w / 2, -h * 0.2, w, h * 0.08);
    ctx.fillStyle = c.metal;
    ctx.fillRect(-w / 2, -h, w * 0.08, h);
    ctx.fillRect(w / 2 - w * 0.08, -h, w * 0.08, h);
    // Кришка: при відкритті повертається назад навколо заднього краю
    const lidH = h * 0.5;
    ctx.save();
    ctx.translate(0, -h);
    ctx.scale(1, 1 - Math.min(1, open || 0) * 1.6);
    ctx.fillStyle = c.body;
    ctx.fillRect(-w / 2, -lidH, w, lidH);
    ctx.fillStyle = c.dark;
    ctx.fillRect(-w / 2, -lidH * 0.45, w, lidH * 0.14);
    ctx.fillStyle = c.metal;
    ctx.fillRect(-w / 2, -lidH, w * 0.08, lidH);
    ctx.fillRect(w / 2 - w * 0.08, -lidH, w * 0.08, lidH);
    ctx.restore();
    // Замок
    if (!open || open < 0.2) {
        ctx.fillStyle = c.metal;
        ctx.fillRect(-w * 0.08, -h - lidH * 0.35, w * 0.16, h * 0.34);
        ctx.fillStyle = c.dark;
        ctx.fillRect(-w * 0.025, -h - lidH * 0.1, w * 0.05, h * 0.12);
    }
    ctx.restore();
}
