// ============================================================
// shop.js — золоті монети та магазин
// Каталог товарів (шлейфи, вибухи, аксесуари), правила нарахування
// монет за забіг і малювання всіх товарів на Canvas.
// Модуль нічого не імпортує: його використовують і рушій, і меню.
// ============================================================

// ---------- Каталог ----------

// Перший товар кожного типу безкоштовний і відкритий завжди — це «без прикрас»
// Скіни (type: "skin") носять renderType — ключ малювальника з shop_skins.js;
// надітий скін зберігається, як і скіни рівнів, у settings.activeSkin
export const SHOP_ITEMS = [
    { id: "shop_panda", type: "skin", name: "Кубик-панда", price: 100, renderType: "shop_panda" },
    { id: "shop_dog", type: "skin", name: "Кубик-пес", price: 100, renderType: "shop_dog" },
    { id: "shop_fox", type: "skin", name: "Кубик-лисичка", price: 120, renderType: "shop_fox" },
    { id: "shop_penguin", type: "skin", name: "Кубик-пінгвін", price: 120, renderType: "shop_penguin" },
    { id: "shop_owl", type: "skin", name: "Кубик-сова", price: 120, renderType: "shop_owl" },
    { id: "shop_frog", type: "skin", name: "Кубик-жабка", price: 150, renderType: "shop_frog" },
    { id: "shop_shark", type: "skin", name: "Кубик-акула", price: 150, renderType: "shop_shark" },
    { id: "shop_villager", type: "skin", name: "Кубик-житель", price: 150, renderType: "shop_villager" },
    { id: "shop_zombie", type: "skin", name: "Кубик-зомбі", price: 150, renderType: "shop_zombie" },
    { id: "shop_axolotl", type: "skin", name: "Аксолотль", price: 150, renderType: "shop_axolotl" },
    { id: "shop_bee", type: "skin", name: "Бджілка", price: 150, renderType: "shop_bee" },
    { id: "shop_peeper", type: "skin", name: "Рибка-пішер", price: 150, renderType: "shop_peeper" },
    { id: "shop_patrick", type: "skin", name: "Морська зірка", price: 150, renderType: "shop_patrick" },
    { id: "shop_waffle", type: "skin", name: "Вафля", price: 150, renderType: "shop_waffle" },
    { id: "shop_creeper", type: "skin", name: "Кубик-кріпер", price: 180, renderType: "shop_creeper" },
    { id: "shop_skeleton", type: "skin", name: "Кубик-скелет", price: 180, renderType: "shop_skeleton" },
    { id: "shop_ninja", type: "skin", name: "Кубик-ніндзя", price: 180, renderType: "shop_ninja" },
    { id: "shop_firefighter", type: "skin", name: "Кубик-пожежник", price: 180, renderType: "shop_firefighter" },
    { id: "shop_national", type: "skin", name: "Збірна", price: 180, renderType: "shop_national" },
    { id: "shop_iron_golem", type: "skin", name: "Залізний голем", price: 200, renderType: "shop_iron_golem" },
    { id: "shop_knight", type: "skin", name: "Кубик-лицар", price: 200, renderType: "shop_knight" },
    { id: "shop_astronaut", type: "skin", name: "Кубик-астронавт", price: 200, renderType: "shop_astronaut" },
    { id: "shop_robot", type: "skin", name: "Кубик-робот", price: 200, renderType: "shop_robot" },
    { id: "shop_illager", type: "skin", name: "Ілагер", price: 200, renderType: "shop_illager" },
    { id: "shop_goalkeeper", type: "skin", name: "Воротар", price: 200, renderType: "shop_goalkeeper" },
    { id: "shop_green_ninja", type: "skin", name: "Зелений ніндзя", price: 200, renderType: "shop_green_ninja" },
    { id: "shop_enderman", type: "skin", name: "Кубик-ендермен", price: 230, renderType: "shop_enderman" },
    { id: "shop_wizard", type: "skin", name: "Кубик-чарівник", price: 230, renderType: "shop_wizard" },
    { id: "shop_gamer", type: "skin", name: "Кубик-геймер", price: 230, renderType: "shop_gamer" },
    { id: "shop_diver", type: "skin", name: "Водолаз", price: 230, renderType: "shop_diver" },
    { id: "shop_gorilla", type: "skin", name: "Горила", price: 230, renderType: "shop_gorilla" },
    { id: "shop_gd_spider", type: "skin", name: "GD-павук", price: 230, renderType: "shop_gd_spider" },
    { id: "shop_superhero", type: "skin", name: "Кубик-супергерой", price: 250, renderType: "shop_superhero" },
    { id: "shop_crystal_golem", type: "skin", name: "Кристальний голем", price: 250, renderType: "shop_crystal_golem" },
    { id: "shop_shades", type: "skin", name: "Кубик у темних окулярах", price: 250, renderType: "shop_shades" },
    { id: "shop_ufo", type: "skin", name: "Кубик-НЛО", price: 280, renderType: "shop_ufo" },
    { id: "shop_warden", type: "skin", name: "Вартовий", price: 280, renderType: "shop_warden" },
    { id: "shop_sharingan", type: "skin", name: "Шарінган", price: 280, renderType: "shop_sharingan" },
    { id: "shop_dragon", type: "skin", name: "Кубик-дракончик", price: 300, renderType: "shop_dragon" },
    { id: "shop_galaxy", type: "skin", name: "Кубик-галактика", price: 350, renderType: "shop_galaxy" },

    // Легендарні скіни: купуються лише після виконання умови (requirement)
    { id: "shop_phoenix", type: "skin", name: "Вогняний фенікс", price: 800, renderType: "shop_phoenix", legendary: true, requirement: { kind: "clears", target: 25 } },
    { id: "shop_golden_ninja", type: "skin", name: "Золотий ніндзя", price: 900, renderType: "shop_golden_ninja", legendary: true, requirement: { kind: "combo_levels" } },
    { id: "shop_rainbow", type: "skin", name: "Кубик-райдуга", price: 1000, renderType: "shop_rainbow", legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "shop_trophy", type: "skin", name: "Кубок досягнень", price: 1100, renderType: "shop_trophy", legendary: true, requirement: { kind: "achievements", target: 25 } },
    { id: "shop_golden", type: "skin", name: "Золотий кубик", price: 1200, renderType: "shop_golden", legendary: true, requirement: { kind: "gold_league", league: 1 } },

    { id: "trail_default", type: "trail", name: "Звичайний", price: 0 },
    { id: "trail_neon", type: "trail", name: "Неонова лінія", price: 40 },
    { id: "trail_bubbles", type: "trail", name: "Бульбашки", price: 50 },
    { id: "trail_rainbow", type: "trail", name: "Райдуга", price: 60 },
    { id: "trail_blocks", type: "trail", name: "Кубічні пікселі", price: 75 },
    { id: "trail_stars", type: "trail", name: "Зірочки", price: 90 },
    { id: "trail_fire", type: "trail", name: "Вогонь", price: 100 },

    { id: "boom_default", type: "explosion", name: "Звичайний", price: 0 },
    { id: "boom_confetti", type: "explosion", name: "Конфеті", price: 40 },
    { id: "boom_pixels", type: "explosion", name: "Пікселі-кубики", price: 60 },
    { id: "boom_bubbles", type: "explosion", name: "Мильні бульбашки", price: 75 },
    { id: "boom_watermelon", type: "explosion", name: "Кавун", price: 90 },
    { id: "boom_fireworks", type: "explosion", name: "Феєрверк", price: 100 },
    { id: "boom_starfall", type: "explosion", name: "Зорепад", price: 120 },

    { id: "weapon_none", type: "weapon", name: "Без зброї (стрибки)", price: 0 },
    { id: "weapon_sword", type: "weapon", name: "Меч", price: 120 },
    { id: "weapon_axe", type: "weapon", name: "Сокира-бумеранг", price: 150 },
    { id: "weapon_pickaxe", type: "weapon", name: "Кирка", price: 170 },
    { id: "weapon_bow", type: "weapon", name: "Лук", price: 180 },
    { id: "weapon_ball", type: "weapon", name: "Футбольний м'яч", price: 200 },
    { id: "weapon_pistol", type: "weapon", name: "Пістолет", price: 220 },
    { id: "weapon_rifle", type: "weapon", name: "Автомат", price: 280 },
    { id: "weapon_flamethrower", type: "weapon", name: "Вогнемет", price: 320 },
    { id: "weapon_laser", type: "weapon", name: "Лазер", price: 350 },
    { id: "weapon_saber_green", type: "weapon", name: "Світловий меч (зелений)", price: 400 },
    { id: "weapon_saber_blue", type: "weapon", name: "Світловий меч (синій)", price: 400 },
    { id: "weapon_saber_red", type: "weapon", name: "Світловий меч (червоний)", price: 400 },
    { id: "weapon_rocket", type: "weapon", name: "Ракетниця", price: 450 },
    // Легендарна зброя: як легендарні скіни, купується лише після виконання умови
    { id: "weapon_firesword", type: "weapon", name: "Вогняний меч", price: 900, legendary: true, requirement: { kind: "clears", target: 15 } },
    { id: "weapon_thunder", type: "weapon", name: "Громовий молот", price: 1000, legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "weapon_gravity", type: "weapon", name: "Гравітаційна гармата", price: 1200, legendary: true, requirement: { kind: "gold_count", target: 20 } },

    { id: "acc_none", type: "accessory", name: "Без аксесуара", price: 0 },
    { id: "acc_cap", type: "accessory", name: "Кепка", price: 30 },
    { id: "acc_bow", type: "accessory", name: "Бант", price: 35 },
    { id: "acc_glasses", type: "accessory", name: "Сонцезахисні окуляри", price: 45 },
    { id: "acc_heart_pendant", type: "accessory", name: "Кулон-сердечко", price: 50 },
    { id: "acc_headphones", type: "accessory", name: "Навушники", price: 60 },
    { id: "acc_cowboy", type: "accessory", name: "Ковбойський капелюх", price: 75 },
    { id: "acc_horns", type: "accessory", name: "Ріжки", price: 100 },
    { id: "acc_flower_wreath", type: "accessory", name: "Квітковий вінок", price: 110 },
    { id: "acc_pirate", type: "accessory", name: "Піратський капелюх", price: 120 },
    { id: "acc_halo", type: "accessory", name: "Німб", price: 150 },
    { id: "acc_wings", type: "accessory", name: "Крила", price: 180 },
    { id: "acc_crown", type: "accessory", name: "Корона", price: 200 }
];

export const SHOP_TYPES = [
    { type: "skin", name: "Скіни" },
    { type: "trail", name: "Шлейфи" },
    { type: "explosion", name: "Вибухи" },
    { type: "accessory", name: "Аксесуари" },
    { type: "weapon", name: "Зброя" }
];

// Безкоштовний товар кожного типу (надітий за замовчуванням)
export const DEFAULT_ITEMS = { trail: "trail_default", explosion: "boom_default", accessory: "acc_none", weapon: "weapon_none" };

export function getShopItem(id) {
    for (const item of SHOP_ITEMS) {
        if (item.id === id) {
            return item;
        }
    }
    return null;
}

// Товар-скін за ключем малювальника (null — це не магазинний скін)
export function getShopSkinByRenderType(renderType) {
    for (const item of SHOP_ITEMS) {
        if (item.type === "skin" && item.renderType === renderType) {
            return item;
        }
    }
    return null;
}

// ---------- Нарахування монет ----------
// (у збереженні рахунок і далі зветься crystals — так зберігається старий прогрес)

// Бонус за фініш і за перше проходження залежить від ліги
const FINISH_BONUS = { 1: 10, 2: 15, 3: 20, 4: 30, 5: 50 };
export const FIRST_CLEAR_BONUS = { 1: 10, 2: 25, 3: 40, 4: 60, 5: 100 };
export const SILVER_BONUS = 15;
export const GOLD_BONUS = 30;

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
// Дорожчий аксесуар — більший бонус
export const ACCESSORY_PERKS = {
    acc_cap: { coins: 0.05 },
    acc_bow: { chest: 0.05 },
    acc_glasses: { item: 0.05 },
    acc_headphones: { coins: 0.1 },
    acc_cowboy: { chest: 0.1 },
    acc_horns: { item: 0.1 },
    acc_pirate: { chest: 0.15 },
    acc_halo: { item: 0.15 },
    acc_crown: { coins: 0.15 },
    // Шанс сердечка в сундуку
    acc_heart_pendant: { hearts: 0.05 },
    acc_flower_wreath: { hearts: 0.1 },
    acc_wings: { hearts: 0.15 }
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
// щоб на старших рівнях було більше часу помітити літеру
export const TRAIL_PERKS = {
    trail_neon: { slow: 0.03 },
    trail_bubbles: { slow: 0.04 },
    trail_rainbow: { slow: 0.05 },
    trail_blocks: { slow: 0.06 },
    trail_stars: { slow: 0.08 },
    trail_fire: { slow: 0.1 }
};

// Бонуси вибухів: ширша зона стрибка (window — на скільки частка зон «ОК» та «Ідеально» більша)
export const EXPLOSION_PERKS = {
    boom_confetti: { window: 0.05 },
    boom_pixels: { window: 0.06 },
    boom_bubbles: { window: 0.08 },
    boom_watermelon: { window: 0.1 },
    boom_fireworks: { window: 0.12 },
    boom_starfall: { window: 0.15 }
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
//   до 150 — series: монети за серії «Ідеально» ×1.5
//   до 230 — words: монети за слова й комбінації ×2
//   дорожчі — perfect: зона «Ідеально» +20%
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
    return kind === "shield" ? 1 : skinPerkValue(kind, 2);
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
    if (item.price <= 150) {
        return "series";
    }
    if (item.price <= 230) {
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
    words: "📝 Слова — монети за слова й комбінації, набрані без жодної помилки, подвоюються",
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

// Бонус монет за зброю: крутіша зброя — монети збираються швидше.
// Без зброї ×1, до 200 — ×1.1, до 350 — ×1.2, дорожча — ×1.3, легендарна — ×1.5
// Бонус росте з ціною, тож кожна дорожча зброя вигідніша за дешевшу:
// звичайна — 1 + ціна/1500 (меч ×1.08 … ракетниця ×1.3),
// легендарна — 1.4 + (ціна − 900)/2000 (вогняний меч ×1.4 … гравітаційна гармата ×1.55)
export function weaponCoinBonus(weaponId) {
    const item = weaponId ? getShopItem(weaponId) : null;
    if (!item || item.type !== "weapon" || item.price <= 0) {
        return 1;
    }
    const bonus = item.legendary ? 1.4 + (item.price - 900) / 2000 : 1 + item.price / 1500;
    return Math.round(bonus * 100) / 100;
}

// Підсумок забігу: рядки для екрана результату та загальна сума.
// run: { hits, perfect, series, won, leagueId, firstClear, newSilver, newGold, difficulty, speed, hitWindow, weaponId }
export function computeReward(run) {
    const lines = [];
    const settingsMult = rewardMultiplier(run.difficulty, run.speed, run.hitWindow);
    const weaponMult = weaponCoinBonus(run.weaponId);
    const accessoryMult = 1 + (accessoryPerk(run.accessoryId).coins || 0);
    const mult = settingsMult * weaponMult * accessoryMult;
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
        return { lines: lines, mult: settingsMult, weaponMult: weaponMult, accessoryMult: accessoryMult, half: true, total: total };
    }
    const finish = FINISH_BONUS[run.leagueId] || 10;
    lines.push({ label: "Фініш", value: finish });
    base += finish;
    // Разові бонуси рівня (перше проходження, рамки) не множаться:
    // множники налаштувань, зброї й аксесуара діють лише на монети, зароблені в забігу
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
    return { lines: lines, mult: settingsMult, weaponMult: weaponMult, accessoryMult: accessoryMult, half: false, total: Math.ceil(base * mult) + flat };
}

// ---------- Сердечко: запасне життя ----------

// Піксельне червоне сердечко, як у Minecraft (cx, cy — центр, size — розмір)
export function drawHeartLife(ctx, cx, cy, size, time) {
    const rows = [
        "0110110",
        "1221111",
        "1211111",
        "1111111",
        "0111110",
        "0011100",
        "0001000"
    ];
    const p = size / 7;
    const x0 = cx - size / 2;
    const y0 = cy - size / 2;
    // Легке «биття» сяйва
    const glow = 0.2 + 0.15 * Math.sin((time || 0) * 0.005);
    ctx.save();
    ctx.globalAlpha *= glow;
    ctx.fillStyle = "#ff3a5a";
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const v = rows[r][c];
            if (v === "0") {
                continue;
            }
            ctx.fillStyle = v === "2" ? "#ffd0d8" : (r >= 4 ? "#c8102e" : "#ff2a4a");
            ctx.fillRect(Math.round(x0 + c * p), Math.round(y0 + r * p), Math.ceil(p), Math.ceil(p));
        }
    }
}

// «1 сердечко», «2 сердечка», «5 сердечок»
export function heartsText(n) {
    const abs = Math.abs(Math.floor(n));
    const last = abs % 10;
    const lastTwo = abs % 100;
    if (last === 1 && lastTwo !== 11) {
        return n + " сердечко";
    }
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
        return n + " сердечка";
    }
    return n + " сердечок";
}

// ---------- Золота монета: значок валюти ----------

export function drawCoinIcon(ctx, x, y, s) {
    const r = s / 2;
    ctx.save();
    // Ребро, золото й внутрішнє кільце
    ctx.fillStyle = "#a8641a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffc93a";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e8961e";
    ctx.lineWidth = Math.max(1, s * 0.07);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.56, 0, Math.PI * 2);
    ctx.stroke();
    // Карбована риска посередині
    ctx.fillStyle = "#b8741a";
    ctx.fillRect(Math.round(x - s * 0.07), Math.round(y - r * 0.45), Math.max(1, Math.round(s * 0.14)), Math.max(1, Math.round(r * 0.9)));
    // Відблиск
    ctx.fillStyle = "#fff6c8";
    ctx.fillRect(Math.round(x - r * 0.55), Math.round(y - r * 0.6), Math.max(1, Math.round(s * 0.13)), Math.max(1, Math.round(s * 0.13)));
    ctx.restore();
}

// «1 монета», «3 монети», «25 монет»
export function coinsText(n) {
    const abs = Math.abs(Math.floor(n));
    const last = abs % 10;
    const lastTwo = abs % 100;
    let word = "монет";
    if (last === 1 && lastTwo !== 11) {
        word = "монета";
    } else if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
        word = "монети";
    }
    return n + " " + word;
}

// ---------- Детерміновані випадкові числа для ефектів ----------

function hashRand(n) {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
}

// ---------- Шлейфи ----------

// points — точки шлейфу { sx, sy, alpha, i }: екранні координати, яскравість (0…0.55) і номер
export function drawTrail(ctx, id, points, cube, time) {
    if (id === "trail_default" || !id) {
        for (const p of points) {
            const size = cube * 0.55;
            ctx.fillStyle = "rgba(0, 246, 255, " + Math.max(0, p.alpha * 0.35).toFixed(3) + ")";
            ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size);
        }
        return;
    }
    if (id === "trail_neon") {
        if (points.length < 2) {
            return;
        }
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 46, 166, 0.45)" : "rgba(0, 246, 255, 0.9)";
            ctx.lineWidth = pass === 0 ? cube * 0.35 : cube * 0.12;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(points[0].sx, points[0].sy);
            for (let k = 1; k < points.length; k++) {
                ctx.lineTo(points[k].sx, points[k].sy);
            }
            ctx.stroke();
        }
        ctx.lineCap = "butt";
        return;
    }
    for (const p of points) {
        const a = Math.max(0, Math.min(1, p.alpha / 0.55));
        const age = 1 - a;
        const r = hashRand(p.i);
        if (id === "trail_bubbles") {
            const rad = cube * (0.1 + age * 0.22 + r * 0.08);
            ctx.globalAlpha = a * 0.8;
            ctx.strokeStyle = "#bff0ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.sx + (r - 0.5) * cube * 0.6, p.sy - age * cube * 0.8, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.6 - rad * 0.4, p.sy - age * cube * 0.8 - rad * 0.5, 2, 2);
        } else if (id === "trail_rainbow") {
            const colors = ["#ff3355", "#ff9a3d", "#ffe14d", "#39ff88", "#39c6ff", "#b35cff"];
            const band = cube / colors.length;
            ctx.globalAlpha = a * 0.85;
            for (let c = 0; c < colors.length; c++) {
                ctx.fillStyle = colors[c];
                ctx.fillRect(p.sx - cube * 0.25, p.sy - cube / 2 + c * band, cube * 0.5, band);
            }
        } else if (id === "trail_blocks") {
            const colors = ["#5ab84a", "#8a6a3a", "#8a8a8a", "#6a4a2a"];
            const s = cube * (0.18 + r * 0.14);
            ctx.globalAlpha = a;
            ctx.fillStyle = colors[Math.floor(r * colors.length)];
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.7 - s / 2, p.sy + age * cube * 0.6 + (hashRand(p.i + 9) - 0.5) * cube * 0.5, s, s);
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.7 - s / 2, p.sy + age * cube * 0.6 + (hashRand(p.i + 9) - 0.5) * cube * 0.5 + s * 0.7, s, s * 0.3);
        } else if (id === "trail_stars") {
            if (p.i % 2 !== 0) {
                continue;
            }
            const s = cube * (0.08 + r * 0.08) * (0.6 + 0.4 * Math.sin(time * 0.02 + p.i));
            const x = p.sx + (r - 0.5) * cube * 0.8;
            const y = p.sy + (hashRand(p.i + 3) - 0.5) * cube * 0.8;
            ctx.globalAlpha = a;
            ctx.fillStyle = r < 0.5 ? "#ffe14d" : "#ffffff";
            ctx.fillRect(x - s / 2, y - s * 1.5, s, s * 3);
            ctx.fillRect(x - s * 1.5, y - s / 2, s * 3, s);
        } else if (id === "trail_fire") {
            const s = cube * (0.35 - age * 0.25) * (0.8 + r * 0.4);
            ctx.globalAlpha = a;
            ctx.fillStyle = age < 0.3 ? "#fff4a0" : age < 0.6 ? "#ffaa22" : "#ff4a1a";
            ctx.fillRect(p.sx - s / 2 + (r - 0.5) * cube * 0.3, p.sy - s / 2 - age * cube * 0.7, s, s);
        }
    }
    ctx.globalAlpha = 1;
}

// ---------- Ефекти вибуху ----------

export const EXPLOSION_DURATION = 1.4;

// t — секунди від вибуху; (x, y) — центр кубика на екрані; cube — розмір кубика
export function drawExplosion(ctx, id, t, x, y, cube) {
    if (!id || id === "boom_default" || t > EXPLOSION_DURATION) {
        return;
    }
    const k = t / EXPLOSION_DURATION;
    const fade = Math.max(0, 1 - k);
    ctx.save();
    if (id === "boom_confetti") {
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8", "#ff9a3d"];
        for (let i = 0; i < 40; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 50) * 4);
            const px = x + Math.cos(ang) * sp * t * 1.4;
            const py = y + Math.sin(ang) * sp * t * 1.4 - cube * 3 * t + cube * 6 * t * t;
            ctx.globalAlpha = fade;
            ctx.fillStyle = colors[i % colors.length];
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 10 + i);
            ctx.fillRect(-cube * 0.1, -cube * 0.05, cube * 0.2, cube * 0.1);
            ctx.restore();
        }
    } else if (id === "boom_pixels") {
        const colors = ["#5ab84a", "#8a6a3a", "#8a8a8a", "#6a4a2a", "#3a8a2a"];
        for (let i = 0; i < 24; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 20) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t - cube * 4 * t + cube * 9 * t * t;
            const s = cube * (0.18 + hashRand(i + 40) * 0.16);
            ctx.globalAlpha = fade;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(px - s / 2, py - s / 2, s, s * 0.25);
        }
    } else if (id === "boom_bubbles") {
        for (let i = 0; i < 18; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const dist = cube * (0.6 + hashRand(i + 7) * 2.2) * Math.min(1, t * 2.5);
            const px = x + Math.cos(ang) * dist;
            const py = y + Math.sin(ang) * dist - cube * 1.5 * t;
            const pop = hashRand(i + 30) * 0.6 + 0.5;
            if (t > pop) {
                if (t < pop + 0.12) {
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "#ffffff";
                    for (let d = 0; d < 4; d++) {
                        ctx.fillRect(px + Math.cos(d * 1.57) * cube * 0.25, py + Math.sin(d * 1.57) * cube * 0.25, 3, 3);
                    }
                }
                continue;
            }
            const rad = cube * (0.15 + hashRand(i + 60) * 0.25);
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = ["#bff0ff", "#ffc8f0", "#e0ffd0"][i % 3];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(px - rad * 0.45, py - rad * 0.5, 3, 3);
        }
    } else if (id === "boom_watermelon") {
        for (let i = 0; i < 16; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 11) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t - cube * 3 * t + cube * 8 * t * t;
            const s = cube * (0.3 + hashRand(i + 5) * 0.2);
            ctx.globalAlpha = fade;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 6 + i);
            ctx.fillStyle = "#2f8a3a";
            ctx.fillRect(-s / 2, s * 0.3, s, s * 0.2);
            ctx.fillStyle = "#ff4a5a";
            ctx.fillRect(-s / 2, -s / 2, s, s * 0.8);
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-s * 0.2, -s * 0.2, s * 0.12, s * 0.16);
            ctx.fillRect(s * 0.15, -s * 0.05, s * 0.12, s * 0.16);
            ctx.restore();
        }
        // Бризки соку
        ctx.globalAlpha = fade * 0.7;
        ctx.fillStyle = "#ff6a7a";
        for (let i = 0; i < 12; i++) {
            const ang = hashRand(i + 90) * Math.PI * 2;
            ctx.fillRect(x + Math.cos(ang) * cube * 3 * t, y + Math.sin(ang) * cube * 3 * t + cube * 3 * t * t, 3, 3);
        }
    } else if (id === "boom_fireworks") {
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
        for (let b = 0; b < 3; b++) {
            const start = b * 0.25;
            const tb = t - start;
            if (tb < 0) {
                continue;
            }
            const bx = x + (b - 1) * cube * 1.6;
            const by = y - cube * (1.2 + b % 2);
            const kb = Math.min(1, tb / 0.9);
            for (let r = 0; r < 14; r++) {
                const ang = r * Math.PI * 2 / 14;
                const rad = cube * 1.8 * Math.sqrt(kb);
                ctx.globalAlpha = Math.max(0, 1 - kb);
                ctx.fillStyle = colors[(b + r) % colors.length];
                ctx.fillRect(bx + Math.cos(ang) * rad - 2, by + Math.sin(ang) * rad + kb * kb * cube * 0.8 - 2, 4, 4);
                ctx.fillRect(bx + Math.cos(ang) * rad * 0.7 - 1, by + Math.sin(ang) * rad * 0.7 + kb * kb * cube * 0.6 - 1, 2, 2);
            }
        }
    } else if (id === "boom_starfall") {
        for (let i = 0; i < 20; i++) {
            const ang = -Math.PI / 2 + (hashRand(i) - 0.5) * 2.2;
            const sp = cube * (3 + hashRand(i + 3) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t + cube * 7 * t * t;
            const s = cube * (0.08 + hashRand(i + 8) * 0.08);
            ctx.globalAlpha = fade;
            ctx.fillStyle = i % 3 === 0 ? "#ffffff" : "#ffe14d";
            ctx.fillRect(px - s / 2, py - s * 1.5, s, s * 3);
            ctx.fillRect(px - s * 1.5, py - s / 2, s * 3, s);
        }
    }
    ctx.restore();
}

// ---------- Аксесуари ----------

// Малюються в системі координат кубика (центр 0,0, повернута разом із ним)
export function drawAccessory(ctx, id, size, time) {
    if (!id || id === "acc_none") {
        return;
    }
    const h = size / 2;
    if (id === "acc_cap") {
        ctx.fillStyle = "#e8202a";
        ctx.fillRect(-h * 0.8, -h - size * 0.22, size * 0.8, size * 0.24);
        ctx.fillRect(-h * 0.6, -h - size * 0.3, size * 0.6, size * 0.1);
        ctx.fillRect(-h * 0.8 + size * 0.8, -h - size * 0.04, size * 0.4, size * 0.07);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.06, -h - size * 0.18, size * 0.12, size * 0.1);
    } else if (id === "acc_bow") {
        const wiggle = Math.sin(time * 0.004) * size * 0.02;
        ctx.fillStyle = "#ff5ad8";
        ctx.fillRect(-h - size * 0.08, -h - size * 0.12 + wiggle, size * 0.22, size * 0.2);
        ctx.fillRect(-h + size * 0.2, -h - size * 0.12 - wiggle, size * 0.22, size * 0.2);
        ctx.fillStyle = "#ff9ae8";
        ctx.fillRect(-h + size * 0.12, -h - size * 0.07, size * 0.1, size * 0.12);
    } else if (id === "acc_glasses") {
        ctx.fillStyle = "#111111";
        ctx.fillRect(-h * 0.85, -size * 0.14, size * 0.36, size * 0.18);
        ctx.fillRect(size * 0.07, -size * 0.14, size * 0.36, size * 0.18);
        ctx.fillRect(-size * 0.07, -size * 0.1, size * 0.14, size * 0.05);
        ctx.fillRect(-h, -size * 0.12, size * 0.1, size * 0.04);
        ctx.fillRect(h - size * 0.1, -size * 0.12, size * 0.1, size * 0.04);
        ctx.fillStyle = "rgba(120, 200, 255, 0.8)";
        ctx.fillRect(-h * 0.85 + size * 0.04, -size * 0.12, size * 0.08, size * 0.04);
        ctx.fillRect(size * 0.11, -size * 0.12, size * 0.08, size * 0.04);
    } else if (id === "acc_headphones") {
        ctx.fillStyle = "#2a2a3a";
        ctx.fillRect(-h - size * 0.04, -h - size * 0.14, size + size * 0.08, size * 0.1);
        ctx.fillRect(-h - size * 0.1, -h - size * 0.06, size * 0.1, size * 0.3);
        ctx.fillRect(h, -h - size * 0.06, size * 0.1, size * 0.3);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(-h - size * 0.16, -size * 0.2, size * 0.18, size * 0.32);
        ctx.fillRect(h - size * 0.02, -size * 0.2, size * 0.18, size * 0.32);
        ctx.fillStyle = Math.sin(time * 0.01) > 0 ? "#39ff88" : "#1a6a3a";
        ctx.fillRect(h + size * 0.04, -size * 0.12, size * 0.06, size * 0.06);
    } else if (id === "acc_cowboy") {
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(-h - size * 0.2, -h - size * 0.08, size * 1.4, size * 0.1);
        ctx.fillRect(-h * 0.6, -h - size * 0.38, size * 0.6, size * 0.32);
        ctx.fillStyle = "#6a4018";
        ctx.fillRect(-h * 0.6, -h - size * 0.14, size * 0.6, size * 0.06);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-size * 0.04, -h - size * 0.14, size * 0.08, size * 0.06);
    } else if (id === "acc_horns") {
        ctx.fillStyle = "#e8202a";
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(side * h * 0.75, -h + size * 0.02);
            ctx.lineTo(side * h * 0.95, -h - size * 0.32);
            ctx.lineTo(side * h * 0.35, -h + size * 0.02);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#ff8a8a";
        ctx.fillRect(-h * 0.9, -h - size * 0.2, size * 0.04, size * 0.08);
        ctx.fillRect(h * 0.8, -h - size * 0.2, size * 0.04, size * 0.08);
    } else if (id === "acc_pirate") {
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.moveTo(-h - size * 0.12, -h + size * 0.02);
        ctx.lineTo(h + size * 0.12, -h + size * 0.02);
        ctx.lineTo(h * 0.5, -h - size * 0.36);
        ctx.lineTo(-h * 0.5, -h - size * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-h - size * 0.1, -h - size * 0.02, size * 1.2, size * 0.04);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.08, -h - size * 0.26, size * 0.16, size * 0.12);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-size * 0.05, -h - size * 0.22, size * 0.03, size * 0.03);
        ctx.fillRect(size * 0.02, -h - size * 0.22, size * 0.03, size * 0.03);
    } else if (id === "acc_halo") {
        const bob = Math.sin(time * 0.004) * size * 0.04;
        ctx.strokeStyle = "rgba(255, 225, 77, 0.35)";
        ctx.lineWidth = size * 0.14;
        ctx.beginPath();
        ctx.ellipse(0, -h - size * 0.2 + bob, size * 0.34, size * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#ffe14d";
        ctx.lineWidth = size * 0.06;
        ctx.stroke();
    } else if (id === "acc_heart_pendant") {
        // Ланцюжок на шиї й кулон-сердечко, що погойдується
        const sway = Math.sin(time * 0.003) * size * 0.02;
        ctx.strokeStyle = "#e8d8a0";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        ctx.moveTo(-h * 0.7, h * 0.15);
        ctx.lineTo(sway, h * 0.55);
        ctx.lineTo(h * 0.7, h * 0.15);
        ctx.stroke();
        drawHeartLife(ctx, sway, h * 0.72, size * 0.26, time);
    } else if (id === "acc_flower_wreath") {
        // Зелений вінок із кольоровими квіточками
        ctx.fillStyle = "#3aa83a";
        ctx.fillRect(-h * 0.95, -h - size * 0.06, size * 0.95, size * 0.1);
        const flowers = ["#ff5ad8", "#ffe14d", "#ffffff", "#ff8a3a", "#8ad0ff"];
        for (let k = 0; k < 5; k++) {
            const fx = -h * 0.85 + k * size * 0.2;
            const fy = -h - size * 0.07 + Math.sin(time * 0.003 + k) * size * 0.01;
            ctx.fillStyle = flowers[k];
            ctx.fillRect(fx - size * 0.05, fy - size * 0.05, size * 0.1, size * 0.1);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(fx - size * 0.02, fy - size * 0.02, size * 0.04, size * 0.04);
        }
    } else if (id === "acc_wings") {
        // Білі крила по боках повільно змахують
        const flap = Math.sin(time * 0.005) * size * 0.08;
        for (const side of [-1, 1]) {
            ctx.fillStyle = "#f4f6ff";
            ctx.beginPath();
            ctx.moveTo(side * h * 0.9, -size * 0.1);
            ctx.lineTo(side * (h + size * 0.42), -size * 0.36 - flap);
            ctx.lineTo(side * (h + size * 0.36), size * 0.02 - flap * 0.5);
            ctx.lineTo(side * (h + size * 0.22), size * 0.14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#c8d4f0";
            ctx.fillRect(side > 0 ? h + size * 0.08 : -h - size * 0.2, -size * 0.12 - flap * 0.5, size * 0.12, size * 0.04);
            ctx.fillRect(side > 0 ? h + size * 0.12 : -h - size * 0.24, -size * 0.02 - flap * 0.3, size * 0.12, size * 0.04);
        }
    } else if (id === "acc_crown") {
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-h * 0.8, -h - size * 0.12, size * 0.8, size * 0.14);
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.moveTo(-h * 0.8 + k * size * 0.27, -h - size * 0.12);
            ctx.lineTo(-h * 0.8 + k * size * 0.27 + size * 0.13, -h - size * 0.34);
            ctx.lineTo(-h * 0.8 + k * size * 0.27 + size * 0.26, -h - size * 0.12);
            ctx.closePath();
            ctx.fill();
        }
        const gems = ["#ff3355", "#39c6ff", "#39ff88"];
        for (let k = 0; k < 3; k++) {
            ctx.fillStyle = gems[k];
            ctx.fillRect(-h * 0.8 + k * size * 0.27 + size * 0.09, -h - size * 0.09, size * 0.08, size * 0.08);
        }
        const glint = (time * 0.001) % 2;
        if (glint < 0.2) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-h * 0.8 + glint * size * 3.5, -h - size * 0.1, size * 0.04, size * 0.1);
        }
    }
}

// ---------- Сундуки ----------

// Типи сундуків: шанс предмета (інакше монети), діапазон монет,
// найдорожчий предмет, який може випасти, і наскільки сундук «тягне» до дорогих речей
// (rarityPower: чим менше, тим частіше випадають дорогі; 1 — вага обернено пропорційна ціні).
// legendaryChance — окремий крихітний шанс легендарного предмета: він випадає навіть
// без виконання умови (пройти Боса, золоті рамки) — справжня удача
export const CHEST_TYPES = {
    wood: { name: "Дерев'яний сундук", itemChance: 0.35, crystals: [15, 40], maxPrice: 200, rarityPower: 1.2, legendaryChance: 0.003, heartChance: 0.12 },
    silver: { name: "Срібний сундук", itemChance: 0.55, crystals: [40, 100], maxPrice: 300, rarityPower: 0.8, legendaryChance: 0.01, heartChance: 0.18 },
    gold: { name: "Золотий сундук", itemChance: 0.8, crystals: [100, 220], maxPrice: 450, rarityPower: 0.4, legendaryChance: 0.03, heartChance: 0.25 }
};

// Шанс сундука за повторну перемогу й гарантія: не більше 4 перемог поспіль без сундука
export const REPLAY_CHEST_CHANCE = 0.25;
export const CHEST_PITY_WINS = 5;

// Рідкість предмета за ціною — для підпису під нагородою
export function itemRarity(item) {
    if (item && item.legendary) {
        return { name: "⭐ ЛЕГЕНДАРНИЙ", color: "#ffcc33" };
    }
    if (!item || item.price < 100) {
        return { name: "Звичайний", color: "#c8d0e0" };
    }
    if (item.price < 200) {
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
    // Нова золота рамка — дерев'яний сундук (за срібну — лише монети)
    if (win.newGold) {
        chests.push("wood");
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
// до 200 — одразу, до 350 — з Ліги 2, дорожчі — з Ліги 3 (легендарні — за своїми умовами)
export function shopTierLeague(item) {
    if (!item || item.legendary || item.price <= 200) {
        return 1;
    }
    return item.price <= 350 ? 2 : 3;
}

// Предмети, які можуть випасти із сундука: ще не куплені, не безкоштовні,
// не легендарні й не дорожчі за межу сундука. Вага — обернено до ціни.
export function chestItemPool(type, isOwned) {
    const chest = CHEST_TYPES[type] || CHEST_TYPES.wood;
    const pool = [];
    for (const item of SHOP_ITEMS) {
        if (item.price <= 0 || item.legendary || item.price > chest.maxPrice || isOwned(item.id)) {
            continue;
        }
        pool.push({ item: item, weight: 1 / Math.pow(item.price, chest.rarityPower) });
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
        for (const p of pool) {
            r -= p.chance;
            if (r <= 0) {
                return { kind: "item", id: p.item.id };
            }
        }
        return { kind: "item", id: pool[pool.length - 1].item.id };
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
