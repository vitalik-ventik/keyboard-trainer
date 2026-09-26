// ============================================================
// shop_rewards.js — нарахування монет за забіг: бонуси ліг і серій, множники,
// бонуси аксесуарів, шлейфів, вибухів і скінів, підказки до них, computeReward
// ============================================================

import { shopTierLeague } from "./shop_chests.js";
import { getShopItem, getShopSkinByRenderType } from "./shop.js";

// ---------- Нарахування монет ----------
// (у збереженні рахунок і далі зветься crystals — так зберігається старий прогрес)

// Бонус за фініш і за перше проходження залежить від ліги
const FINISH_BONUS = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 40 };
// Коефіцієнт монет за лігу: у старших лігах забіг дає більше, а товари цих ліг
// коштують пропорційно дорожче (ціна = базова ціна × коефіцієнт ліги товару)
export const LEAGUE_COIN_MULT = { 1: 1, 2: 1.5, 3: 2, 4: 3, 5: 3 };

// Базова ціна товару (без коефіцієнта ліги) — за нею визначаються вид і сила бонусу
// скіна, рідкість і межі сундуків, щоб дорожчі за коефіцієнтом товари не «переїхали» в іншу групу
export function basePrice(item) {
    if (!item || item.legendary || item.price <= 0) {
        return item ? item.price : 0;
    }
    return item.price / (LEAGUE_COIN_MULT[shopTierLeague(item)] || 1);
}

export const FIRST_CLEAR_BONUS = { 1: 5, 2: 15, 3: 30, 4: 50, 5: 100 };
export const SILVER_BONUS = 5;
export const GOLD_BONUS = 10;

// Бонус за серію ідеальних дій: на 3, 5, 10 і далі кожні +5
export function seriesBonus(streak) {
    if (streak === 3) {
        return 2;
    }
    if (streak === 5) {
        return 3;
    }
    if (streak >= 10 && streak % 5 === 0) {
        return 5;
    }
    return 0;
}

// Множник від налаштувань: складніше грати — більше монет
export function rewardMultiplier(difficulty, speed, hitWindow) {
    // Легші налаштування (повільно, широка зона) не штрафуються — лише складніші дають більше
    let mult = 1;
    if (difficulty === "HARD") {
        mult *= 1.3;
    }
    if (speed === "fast") {
        mult *= 1.25;
    }
    return Math.round(mult * 100) / 100;
}

// Бонуси аксесуарів: кожен дає один бонус — більше монет (coins), вищий шанс
// сундука за повторну перемогу (chest) або вищий шанс речі в сундуку (item).
// Дорожчий аксесуар — більший бонус: кожен вид має три сходинки (+5%, +10%, +20%;
// сердечка — +5%, +10%, +15%), і ціна росте разом із бонусом;
// у Лігах 3–4 — четверта сходинка (+30%, сердечка — +20%)
export const ACCESSORY_PERKS = {
    acc_cap: { coins: 0.05 },
    acc_bow: { chest: 0.05 },
    acc_glasses: { item: 0.05 },
    acc_headphones: { coins: 0.1 },
    acc_cowboy: { chest: 0.1 },
    acc_horns: { item: 0.1 },
    acc_pirate: { chest: 0.2 },
    acc_halo: { item: 0.2 },
    acc_crown: { coins: 0.2 },
    // Шанс сердечка в сундуку
    acc_heart_pendant: { hearts: 0.05 },
    acc_flower_wreath: { hearts: 0.1 },
    acc_wings: { hearts: 0.15 },
    // Четверта сходинка — у Лігах 3–4
    acc_ninja_band: { chest: 0.3 },
    acc_cyber_visor: { item: 0.3 },
    acc_diamond_crown: { coins: 0.3 },
    acc_heart_orbit: { hearts: 0.2 }
};

export function accessoryPerk(accessoryId) {
    return ACCESSORY_PERKS[accessoryId] || {};
}

// Підпис бонусу аксесуара для магазину: «🪙 +10% монет» тощо, або ""
export function accessoryPerkText(accessoryId) {
    const perk = accessoryPerk(accessoryId);
    if (perk.coins) {
        return "🪙 Монети +" + Math.round(perk.coins * 100) + "%";
    }
    if (perk.chest) {
        return "🎁 Сундуки +" + Math.round(perk.chest * 100) + "%";
    }
    if (perk.item) {
        return "✨ Речі +" + Math.round(perk.item * 100) + "%";
    }
    if (perk.hearts) {
        return "❤ Сердечка +" + Math.round(perk.hearts * 100) + "%";
    }
    return "";
}

// Бонуси шлейфів: траса рухається повільніше (slow — частка, на яку падає швидкість),
// щоб на старших рівнях було більше часу помітити літеру.
// Кожна сходинка — +2% повільніше (у вибухів — +3% зони), а ціна — приблизно вдвічі
export const TRAIL_PERKS = {
    trail_neon: { slow: 0.03 },
    trail_bubbles: { slow: 0.05 },
    trail_rainbow: { slow: 0.07 },
    trail_blocks: { slow: 0.09 },
    trail_stars: { slow: 0.11 },
    trail_fire: { slow: 0.13 },
    trail_plasma: { slow: 0.15 },
    trail_comet: { slow: 0.17 },
    trail_blackhole: { slow: 0.2 }
};

// Бонуси вибухів: ширша зона стрибка (window — на скільки частка зон «ОК» та «Ідеально» більша)
export const EXPLOSION_PERKS = {
    boom_confetti: { window: 0.05 },
    boom_pixels: { window: 0.08 },
    boom_bubbles: { window: 0.11 },
    boom_watermelon: { window: 0.14 },
    boom_fireworks: { window: 0.17 },
    boom_starfall: { window: 0.2 },
    boom_plasma: { window: 0.23 },
    boom_supernova: { window: 0.26 },
    boom_atomic: { window: 0.3 }
};

// Наскільки шлейф сповільнює трасу (0…1)
export function trailSlowdown(trailId) {
    return (TRAIL_PERKS[trailId] && TRAIL_PERKS[trailId].slow) || 0;
}

// Наскільки вибух розширює зону стрибка (0…1)
export function explosionWindowBonus(explosionId) {
    return (EXPLOSION_PERKS[explosionId] && EXPLOSION_PERKS[explosionId].window) || 0;
}

// Підпис бонусу будь-якого товару (аксесуар, шлейф, вибух) для магазину, або ""
export function itemPerkText(itemId) {
    if (TRAIL_PERKS[itemId]) {
        return "🐢 Швидкість −" + Math.round(TRAIL_PERKS[itemId].slow * 100) + "%";
    }
    if (EXPLOSION_PERKS[itemId]) {
        return "🎯 Зона +" + Math.round(EXPLOSION_PERKS[itemId].window * 100) + "%";
    }
    const item = getShopItem(itemId);
    if (item && item.type === "skin") {
        return skinPerkText(skinPerk(item.renderType), shopSkinPerkValue(item.renderType));
    }
    return accessoryPerkText(itemId);
}

// Бонуси скінів із магазину (скіни рівнів — нагорода без бонусу), за ціною:
//   до 350 — series: монети за серії «Ідеально» ×1.5 … ×1.7
//   до 800 — words: монети за слова й комбінації ×2 … ×2.4
//   дорожчі — perfect: зона «Ідеально» +20% … +50% (Ліги 3–4 — +40% і +50%)
//   легендарні — shield: одна помилка чи зіткнення за рівень пробачається
export const SKIN_SERIES_MULT = 1.5;
export const SKIN_WORDS_MULT = 2;
export const SKIN_PERFECT_BONUS = 0.2;

// Сила бонусу скіна рівня залежить від рамки на цьому рівні:
// [без рамки, срібна, золота]; золота = як у скінів із магазину
export const SKIN_PERK_TIERS = {
    series: [1.2, 1.35, SKIN_SERIES_MULT],
    words: [1.5, 1.75, SKIN_WORDS_MULT],
    perfect: [0.1, 0.15, SKIN_PERFECT_BONUS]
};

// Сила бонусу скіна з магазину росте з ціною: [ціна від, значення].
// Дешевші скіни одного виду — як золота рамка скіна рівня, дорожчі — сильніші
export const SHOP_SKIN_PERK_STEPS = {
    series: [[220, 1.5], [280, 1.6], [350, 1.7]],
    words: [[450, 2], [600, 2.2], [800, 2.4]],
    perfect: [[1000, 0.2], [1300, 0.25], [1600, 0.3], [2000, 0.35], [2500, 0.4], [4000, 0.5]]
};

// Сила бонусу скіна з магазину (для «сердечок» — своя в кожного скіна)
export function shopSkinPerkValue(renderType) {
    const item = renderType ? getShopSkinByRenderType(renderType) : null;
    const kind = skinPerk(renderType);
    if (!kind) {
        return 0;
    }
    if (kind === "hearts") {
        return SKIN_HEART_PERKS[item.id];
    }
    if (kind === "shield") {
        return 1;
    }
    // Найбільша сходинка, до якої дотягує ціна скіна
    let value = skinPerkValue(kind, 2);
    for (const step of SHOP_SKIN_PERK_STEPS[kind] || []) {
        if (basePrice(item) >= step[0]) {
            value = step[1];
        }
    }
    return value;
}

// Значення бонусу за видом і рівнем рамки (0 — без рамки, 1 — срібна, 2 — золота)
export function skinPerkValue(kind, tier) {
    const tiers = SKIN_PERK_TIERS[kind];
    return tiers ? tiers[Math.max(0, Math.min(2, tier))] : 0;
}

// Скіни з бонусом «сердечка» (шанс сердечка в сундуку): аксолотль лікує,
// у вартового б'ється серце, водолазу потрібен запас повітря
export const SKIN_HEART_PERKS = { shop_axolotl: 0.05, shop_diver: 0.1, shop_warden: 0.15 };

export function skinPerk(renderType) {
    const item = renderType ? getShopSkinByRenderType(renderType) : null;
    if (!item || item.price <= 0) {
        return null;
    }
    if (item.legendary) {
        return "shield";
    }
    if (SKIN_HEART_PERKS[item.id]) {
        return "hearts";
    }
    if (basePrice(item) <= 350) {
        return "series";
    }
    if (basePrice(item) <= 800) {
        return "words";
    }
    return "perfect";
}

// Підпис бонусу скіна; value — сила (за замовчуванням — як у скіна з магазину)
export function skinPerkText(perk, value) {
    const v = typeof value === "number" ? value : skinPerkValue(perk, 2);
    if (perk === "series") {
        return "🔥 Серії ×" + v;
    }
    if (perk === "words") {
        return "📝 Слова ×" + v;
    }
    if (perk === "perfect") {
        return "💠 Ідеально +" + Math.round(v * 100) + "%";
    }
    if (perk === "shield") {
        return "🛡 Щит на 1 помилку";
    }
    if (perk === "hearts") {
        return "❤ Сердечка +" + Math.round(v * 100) + "%";
    }
    return "";
}

// Пояснення бонусів (для підказки на картці й рядка внизу магазину)
const PERK_HINTS = {
    series: "🔥 Серії — за кілька «Ідеально» поспіль (3, 5, 10…) даються бонусні монети; цей скін їх збільшує",
    words: "📝 Слова — монети за слова й комбінації, набрані без жодної помилки, множаться",
    perfect: "💠 Ідеально — зона «Ідеально» ширша: легше робити ідеальні стрибки й серії",
    shield: "🛡 Щит — одна помилка чи зіткнення за рівень пробачається: кубик не вибухає, а їде далі",
    slow: "🐢 Швидкість — шипи рухаються повільніше, тож більше часу знайти потрібну клавішу (монет не менше)",
    zone: "🎯 Зона — зона, де можна натиснути літеру («ОК» та «Ідеально»), ширша",
    coins: "🪙 Монети — монети, зароблені в забігу, більші (разові бонуси рівня не змінюються)",
    chest: "🎁 Сундуки — вищий шанс отримати сундук за повторну перемогу рівня",
    item: "✨ Речі — у сундуку частіше випадає предмет замість монет (діє аксесуар, надягнутий, коли відкриваєш сундук)",
    hearts: "❤ Сердечка — у сундуку частіше випадає сердечко, запасне життя (діють скін і аксесуар, надягнуті, коли відкриваєш сундук)",
    weapon: "🪙 Монети — з цією зброєю монети, зароблені в забігу, множаться: що дорожча зброя, то більший множник"
};

// Які пояснення показати внизу вкладки магазину
const TAB_HINTS = {
    skin: ["series", "words", "perfect", "hearts", "shield"],
    trail: ["slow"],
    explosion: ["zone"],
    accessory: ["coins", "chest", "item", "hearts"],
    weapon: ["weapon"]
};

// Пояснення бонусу скіна рівня: вид бонусу й як його посилити рамкою
export function levelSkinPerkHint(kind) {
    const base = PERK_HINTS[kind] || "";
    if (!base || kind === "shield") {
        return base;
    }
    const t = SKIN_PERK_TIERS[kind];
    const fmt = kind === "perfect"
        ? function (v) { return "+" + Math.round(v * 100) + "%"; }
        : function (v) { return "×" + v; };
    return base + ". Рамка на рівні посилює бонус: без рамки " + fmt(t[0]) + ", срібна " + fmt(t[1]) + ", золота " + fmt(t[2]);
}

export function shopTabHints(type) {
    return (TAB_HINTS[type] || []).map(function (k) { return PERK_HINTS[k]; });
}

// Повне пояснення бонусу конкретного товару або ""
export function itemPerkHint(itemId) {
    const item = getShopItem(itemId);
    if (!item) {
        return "";
    }
    if (item.type === "skin") {
        const perk = skinPerk(item.renderType);
        return perk ? PERK_HINTS[perk] : "";
    }
    if (item.type === "trail" && TRAIL_PERKS[itemId]) {
        return PERK_HINTS.slow;
    }
    if (item.type === "explosion" && EXPLOSION_PERKS[itemId]) {
        return PERK_HINTS.zone;
    }
    if (item.type === "weapon" && weaponCoinBonus(itemId) > 1) {
        return PERK_HINTS.weapon;
    }
    const perk = accessoryPerk(itemId);
    if (perk.coins) {
        return PERK_HINTS.coins;
    }
    if (perk.chest) {
        return PERK_HINTS.chest;
    }
    if (perk.item) {
        return PERK_HINTS.item;
    }
    if (perk.hearts) {
        return PERK_HINTS.hearts;
    }
    return "";
}

// Бонус монет за зброю: кожна наступна зброя — помітна сходинка вгору.
// Ліга 1: ×1.05 … ×1.25, Ліга 2: ×1.3 … ×1.45, Ліга 3: ×1.5 … ×1.6, Ліга 4: ×1.65 … ×1.7,
// легендарна: ×1.7 … ×1.9 (значення — у полі bonus товару)
export function weaponCoinBonus(weaponId) {
    const item = weaponId ? getShopItem(weaponId) : null;
    if (!item || item.type !== "weapon" || typeof item.bonus !== "number") {
        return 1;
    }
    return item.bonus;
}

// Підсумок забігу: рядки для екрана результату та загальна сума.
// run: { hits, perfect, series, won, leagueId, firstClear, newSilver, newGold, difficulty, speed, hitWindow, weaponId }
export function computeReward(run) {
    const lines = [];
    const settingsMult = rewardMultiplier(run.difficulty, run.speed, run.hitWindow);
    const weaponMult = weaponCoinBonus(run.weaponId);
    const accessoryMult = 1 + (accessoryPerk(run.accessoryId).coins || 0);
    const leagueMult = LEAGUE_COIN_MULT[run.leagueId] || 1;
    const mult = settingsMult * weaponMult * accessoryMult * leagueMult;
    let base = 0;
    // +1 за кожен подоланий шип і ще +1, якщо це було «Ідеально»
    if (run.hits > 0) {
        lines.push({ label: "Подолані шипи", value: run.hits });
        base += run.hits;
    }
    lines.push({ label: run.weapon ? "Ідеальні удари" : "Ідеальні стрибки", value: run.perfect });
    base += run.perfect;
    if (run.series > 0) {
        lines.push({ label: "Серії", value: run.series });
        base += run.series;
    }
    // Рівні-слова: +2 за кожне слово без жодної помилки
    const wordsMult = run.wordsMult || 1;
    if (run.words > 0) {
        lines.push({ label: "Слова без помилок", value: run.words * 2 * wordsMult });
        base += run.words * 2 * wordsMult;
    }
    // Рівні-комбінації: +1 за кожен склад, перекат чи повтор без помилки
    if (run.combos > 0) {
        lines.push({ label: "Комбінації без помилок", value: run.combos * wordsMult });
        base += run.combos * wordsMult;
    }
    if (!run.won) {
        // Вибух: зберігається половина зібраного
        const total = Math.ceil(base * mult / 2);
        return { lines: lines, mult: settingsMult, weaponMult: weaponMult, accessoryMult: accessoryMult, leagueMult: leagueMult, half: true, total: total };
    }
    const finish = FINISH_BONUS[run.leagueId] || 10;
    lines.push({ label: "Фініш", value: finish });
    base += finish;
    // Разові бонуси рівня (перше проходження, рамки) не множаться:
    // множники налаштувань, зброї, аксесуара й ліги діють лише на монети, зароблені в забігу
    let flat = 0;
    if (run.firstClear) {
        const first = FIRST_CLEAR_BONUS[run.leagueId] || 20;
        lines.push({ label: "Перше проходження", value: first, flat: true });
        flat += first;
    }
    if (run.newSilver) {
        lines.push({ label: "Срібна рамка", value: SILVER_BONUS, flat: true });
        flat += SILVER_BONUS;
    }
    if (run.newGold) {
        lines.push({ label: "Золота рамка", value: GOLD_BONUS, flat: true });
        flat += GOLD_BONUS;
    }
    return { lines: lines, mult: settingsMult, weaponMult: weaponMult, accessoryMult: accessoryMult, leagueMult: leagueMult, half: false, total: Math.ceil(base * mult) + flat };
}
