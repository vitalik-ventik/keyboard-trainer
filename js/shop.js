// ============================================================
// shop.js — золоті монети та магазин: каталог товарів (SHOP_ITEMS, SHOP_TYPES)
// і точка входу для всього магазинного. Нарахування монет — shop_rewards.js,
// сердечко, монета, шлейфи й вибухи — shop_effects.js, аксесуари — shop_accessories.js,
// сундуки — shop_chests.js. Скіни магазину — shop_skins.js.
// ============================================================

// ---------- Каталог ----------

// Перший товар кожного типу безкоштовний і відкритий завжди — це «без прикрас»
// Скіни (type: "skin") носять renderType — ключ малювальника з shop_skins.js;
// надітий скін зберігається, як і скіни рівнів, у settings.activeSkin
export const SHOP_ITEMS = [
    { id: "shop_night_dragon", type: "skin", name: "Чорний дракончик", price: 120, renderType: "shop_night_dragon" },
    { id: "shop_panda", type: "skin", name: "Кубик-панда", price: 220, renderType: "shop_panda" },
    { id: "shop_dog", type: "skin", name: "Кубик-пес", price: 220, renderType: "shop_dog" },
    { id: "shop_fox", type: "skin", name: "Кубик-лисичка", price: 280, renderType: "shop_fox" },
    { id: "shop_penguin", type: "skin", name: "Кубик-пінгвін", price: 280, renderType: "shop_penguin" },
    { id: "shop_owl", type: "skin", name: "Кубик-сова", price: 280, renderType: "shop_owl" },
    { id: "shop_frog", type: "skin", name: "Кубик-жабка", price: 350, renderType: "shop_frog" },
    { id: "shop_shark", type: "skin", name: "Кубик-акула", price: 350, renderType: "shop_shark" },
    { id: "shop_villager", type: "skin", name: "Кубик-житель", price: 350, renderType: "shop_villager" },
    { id: "shop_zombie", type: "skin", name: "Кубик-зомбі", price: 350, renderType: "shop_zombie" },
    { id: "shop_axolotl", type: "skin", name: "Аксолотль", price: 350, renderType: "shop_axolotl" },
    { id: "shop_bee", type: "skin", name: "Бджілка", price: 350, renderType: "shop_bee" },
    { id: "shop_peeper", type: "skin", name: "Рибка-пішер", price: 350, renderType: "shop_peeper" },
    { id: "shop_patrick", type: "skin", name: "Морська зірка", price: 350, renderType: "shop_patrick" },
    { id: "shop_waffle", type: "skin", name: "Вафля", price: 350, renderType: "shop_waffle" },
    { id: "shop_creeper", type: "skin", name: "Кубик-кріпер", price: 450, renderType: "shop_creeper" },
    { id: "shop_skeleton", type: "skin", name: "Кубик-скелет", price: 450, renderType: "shop_skeleton" },
    { id: "shop_ninja", type: "skin", name: "Кубик-ніндзя", price: 450, renderType: "shop_ninja" },
    { id: "shop_firefighter", type: "skin", name: "Кубик-пожежник", price: 450, renderType: "shop_firefighter" },
    { id: "shop_national", type: "skin", name: "Збірна", price: 450, renderType: "shop_national" },
    { id: "shop_iron_golem", type: "skin", name: "Залізний голем", price: 600, renderType: "shop_iron_golem" },
    { id: "shop_knight", type: "skin", name: "Кубик-лицар", price: 600, renderType: "shop_knight" },
    { id: "shop_astronaut", type: "skin", name: "Кубик-астронавт", price: 600, renderType: "shop_astronaut" },
    { id: "shop_robot", type: "skin", name: "Кубик-робот", price: 600, renderType: "shop_robot" },
    { id: "shop_illager", type: "skin", name: "Ілагер", price: 600, renderType: "shop_illager" },
    { id: "shop_goalkeeper", type: "skin", name: "Воротар", price: 600, renderType: "shop_goalkeeper" },
    { id: "shop_green_ninja", type: "skin", name: "Зелений ніндзя", price: 600, renderType: "shop_green_ninja" },
    { id: "shop_enderman", type: "skin", name: "Кубик-ендермен", price: 1200, league: 2, renderType: "shop_enderman" },
    { id: "shop_wizard", type: "skin", name: "Кубик-чарівник", price: 1200, league: 2, renderType: "shop_wizard" },
    { id: "shop_gamer", type: "skin", name: "Кубик-геймер", price: 1200, league: 2, renderType: "shop_gamer" },
    { id: "shop_diver", type: "skin", name: "Водолаз", price: 1200, league: 2, renderType: "shop_diver" },
    { id: "shop_gorilla", type: "skin", name: "Горила", price: 1200, league: 2, renderType: "shop_gorilla" },
    { id: "shop_gd_spider", type: "skin", name: "GD-павук", price: 1200, league: 2, renderType: "shop_gd_spider" },
    { id: "shop_superhero", type: "skin", name: "Кубик-супергерой", price: 1500, league: 2, renderType: "shop_superhero" },
    { id: "shop_crystal_golem", type: "skin", name: "Кристальний голем", price: 1500, league: 2, renderType: "shop_crystal_golem" },
    { id: "shop_shades", type: "skin", name: "Кубик у темних окулярах", price: 1500, league: 2, renderType: "shop_shades" },
    { id: "shop_ufo", type: "skin", name: "Кубик-НЛО", price: 1950, league: 2, renderType: "shop_ufo" },
    { id: "shop_warden", type: "skin", name: "Вартовий", price: 1950, league: 2, renderType: "shop_warden" },
    { id: "shop_sharingan", type: "skin", name: "Шарінган", price: 1950, league: 2, renderType: "shop_sharingan" },
    { id: "shop_dragon", type: "skin", name: "Кубик-дракончик", price: 2400, league: 2, renderType: "shop_dragon" },
    { id: "shop_galaxy", type: "skin", name: "Кубик-галактика", price: 3000, league: 2, renderType: "shop_galaxy" },
    // Скіни пізніх ліг (league — з якої ліги відкриваються)
    { id: "shop_terminator", type: "skin", name: "Термінатор", price: 5000, league: 3, renderType: "shop_terminator" },
    { id: "shop_predator", type: "skin", name: "Хижак", price: 6000, league: 3, renderType: "shop_predator" },
    { id: "shop_kurama", type: "skin", name: "Дев'ятихвостий лис", price: 7000, league: 3, renderType: "shop_kurama" },
    { id: "shop_godzilla", type: "skin", name: "Ґодзілла", price: 12000, league: 4, renderType: "shop_godzilla" },
    { id: "shop_demogorgon", type: "skin", name: "Демогоргон", price: 15000, league: 4, renderType: "shop_demogorgon" },
    { id: "shop_reaper", type: "skin", name: "Жнець-левіафан", price: 18000, league: 4, renderType: "shop_reaper" },

    // Легендарні скіни: купуються лише після виконання умови (requirement)
    { id: "shop_phoenix", type: "skin", name: "Вогняний фенікс", price: 6000, renderType: "shop_phoenix", legendary: true, requirement: { kind: "clears", target: 25 } },
    { id: "shop_golden_ninja", type: "skin", name: "Золотий ніндзя", price: 7000, renderType: "shop_golden_ninja", legendary: true, requirement: { kind: "combo_levels" } },
    { id: "shop_rainbow", type: "skin", name: "Кубик-райдуга", price: 8000, renderType: "shop_rainbow", legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "shop_trophy", type: "skin", name: "Кубок досягнень", price: 9000, renderType: "shop_trophy", legendary: true, requirement: { kind: "achievements", target: 25 } },
    { id: "shop_golden", type: "skin", name: "Золотий кубик", price: 10000, renderType: "shop_golden", legendary: true, requirement: { kind: "gold_league", league: 1 } },

    { id: "trail_default", type: "trail", name: "Звичайний", price: 0 },
    { id: "trail_neon", type: "trail", name: "Неонова лінія", price: 200 },
    { id: "trail_bubbles", type: "trail", name: "Бульбашки", price: 280 },
    { id: "trail_rainbow", type: "trail", name: "Райдуга", price: 380 },
    { id: "trail_blocks", type: "trail", name: "Кубічні пікселі", price: 480 },
    { id: "trail_stars", type: "trail", name: "Зірочки", price: 600 },
    { id: "trail_fire", type: "trail", name: "Вогонь", price: 1500, league: 2 },
    { id: "trail_plasma", type: "trail", name: "Плазма", price: 5000, league: 3 },
    { id: "trail_comet", type: "trail", name: "Комета", price: 6400, league: 3 },
    { id: "trail_blackhole", type: "trail", name: "Чорна діра", price: 13500, league: 4 },

    { id: "boom_default", type: "explosion", name: "Звичайний", price: 0 },
    { id: "boom_confetti", type: "explosion", name: "Конфеті", price: 200 },
    { id: "boom_pixels", type: "explosion", name: "Пікселі-кубики", price: 280 },
    { id: "boom_bubbles", type: "explosion", name: "Мильні бульбашки", price: 380 },
    { id: "boom_watermelon", type: "explosion", name: "Кавун", price: 480 },
    { id: "boom_fireworks", type: "explosion", name: "Феєрверк", price: 600 },
    { id: "boom_starfall", type: "explosion", name: "Зорепад", price: 1500, league: 2 },
    { id: "boom_plasma", type: "explosion", name: "Плазмовий розряд", price: 5000, league: 3 },
    { id: "boom_supernova", type: "explosion", name: "Наднова", price: 6400, league: 3 },
    { id: "boom_atomic", type: "explosion", name: "Атомний вибух", price: 13500, league: 4 },

    { id: "weapon_none", type: "weapon", name: "Без зброї (стрибки)", price: 0 },
    { id: "weapon_sword", type: "weapon", name: "Меч", price: 200, league: 1, bonus: 1.05 },
    { id: "weapon_axe", type: "weapon", name: "Сокира-бумеранг", price: 300, league: 1, bonus: 1.1 },
    { id: "weapon_pickaxe", type: "weapon", name: "Кирка", price: 400, league: 1, bonus: 1.15 },
    { id: "weapon_bow", type: "weapon", name: "Лук", price: 500, league: 1, bonus: 1.2 },
    { id: "weapon_ball", type: "weapon", name: "Футбольний м'яч", price: 600, league: 1, bonus: 1.25 },
    { id: "weapon_pistol", type: "weapon", name: "Пістолет", price: 1350, league: 2, bonus: 1.3 },
    { id: "weapon_rifle", type: "weapon", name: "Автомат", price: 1800, league: 2, bonus: 1.35 },
    { id: "weapon_flamethrower", type: "weapon", name: "Вогнемет", price: 2250, league: 2, bonus: 1.4 },
    { id: "weapon_laser", type: "weapon", name: "Лазер", price: 2850, league: 2, bonus: 1.45 },
    { id: "weapon_saber_green", type: "weapon", name: "Світловий меч (зелений)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_saber_blue", type: "weapon", name: "Світловий меч (синій)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_saber_red", type: "weapon", name: "Світловий меч (червоний)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_rocket", type: "weapon", name: "Ракетниця", price: 6400, league: 3, bonus: 1.6 },
    { id: "weapon_plasma", type: "weapon", name: "Плазмова гармата", price: 12000, league: 4, bonus: 1.65 },
    { id: "weapon_shuriken", type: "weapon", name: "Сюрикени", price: 15000, league: 4, bonus: 1.7 },
    // Легендарна зброя: як легендарні скіни, купується лише після виконання умови
    { id: "weapon_firesword", type: "weapon", name: "Вогняний меч", price: 8000, bonus: 1.7, legendary: true, requirement: { kind: "clears", target: 15 } },
    { id: "weapon_thunder", type: "weapon", name: "Громовий молот", price: 10000, bonus: 1.8, legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "weapon_gravity", type: "weapon", name: "Гравітаційна гармата", price: 12000, bonus: 1.9, legendary: true, requirement: { kind: "gold_count", target: 20 } },

    { id: "acc_none", type: "accessory", name: "Без аксесуара", price: 0 },
    { id: "acc_cap", type: "accessory", name: "Кепка", price: 200 },
    { id: "acc_bow", type: "accessory", name: "Бант", price: 220 },
    { id: "acc_glasses", type: "accessory", name: "Сонцезахисні окуляри", price: 240 },
    { id: "acc_heart_pendant", type: "accessory", name: "Кулон-сердечко", price: 260 },
    { id: "acc_headphones", type: "accessory", name: "Навушники", price: 450 },
    { id: "acc_cowboy", type: "accessory", name: "Ковбойський капелюх", price: 480 },
    { id: "acc_horns", type: "accessory", name: "Ріжки", price: 520 },
    { id: "acc_flower_wreath", type: "accessory", name: "Квітковий вінок", price: 560 },
    { id: "acc_pirate", type: "accessory", name: "Піратський капелюх", price: 1200, league: 2 },
    { id: "acc_halo", type: "accessory", name: "Німб", price: 1275, league: 2 },
    { id: "acc_crown", type: "accessory", name: "Корона", price: 1350, league: 2 },
    { id: "acc_wings", type: "accessory", name: "Крила", price: 1500, league: 2 },
    { id: "acc_ninja_band", type: "accessory", name: "Пов'язка ніндзя", price: 5000, league: 3 },
    { id: "acc_cyber_visor", type: "accessory", name: "Кібер-візор", price: 5600, league: 3 },
    { id: "acc_heart_orbit", type: "accessory", name: "Орбіта сердець", price: 12000, league: 4 },
    { id: "acc_diamond_crown", type: "accessory", name: "Діамантова корона", price: 15000, league: 4 }
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

// Реекспорт: інші модулі імпортують усе магазинне з shop.js
export { ACCESSORY_PERKS, EXPLOSION_PERKS, FIRST_CLEAR_BONUS, GOLD_BONUS, LEAGUE_COIN_MULT, SHOP_SKIN_PERK_STEPS, SILVER_BONUS, SKIN_HEART_PERKS, SKIN_PERFECT_BONUS, SKIN_PERK_TIERS, SKIN_SERIES_MULT, SKIN_WORDS_MULT, TRAIL_PERKS, accessoryPerk, accessoryPerkText, basePrice, computeReward, explosionWindowBonus, itemPerkHint, itemPerkText, levelSkinPerkHint, rewardMultiplier, seriesBonus, shopSkinPerkValue, shopTabHints, skinPerk, skinPerkText, skinPerkValue, trailSlowdown, weaponCoinBonus } from "./shop_rewards.js";
export { EXPLOSION_DURATION, coinsText, drawCoinIcon, drawExplosion, drawHeartLife, drawTrail, heartsText } from "./shop_effects.js";
export { drawAccessory } from "./shop_accessories.js";
export { CHEST_PITY_WINS, CHEST_TYPES, NON_SKIN_ITEM_KEEP, REPLAY_CHEST_CHANCE, chestItemPool, chestsForVictory, drawChest, itemRarity, rollChest, shopTierLeague } from "./shop_chests.js";
