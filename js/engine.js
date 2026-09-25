// ============================================================
// engine.js — ігрова логіка
// 5 ліг, 31 рівень, процедурні фони, 3 типи перешкод,
// SaveManager (localStorage), частинки, trail, демо-режим
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";
import { BackgroundCache } from "./cache.js";
import { KEYS } from "./keyboard.js";
import { DEFAULT_ITEMS, CHEST_TYPES, rollChest, drawHeartLife, accessoryPerk, trailSlowdown, explosionWindowBonus, skinPerk, skinPerkValue, shopSkinPerkValue, getShopItem, getShopSkinByRenderType, FIRST_CLEAR_BONUS, SILVER_BONUS, GOLD_BONUS, seriesBonus, drawTrail, drawExplosion, drawAccessory, drawCoinIcon, EXPLOSION_DURATION } from "./shop.js";
import { SHOP_SKIN_RENDERERS } from "./shop_skins.js";
import { EXTRA_LEVEL_SKINS } from "./level_skins_extra.js";
import { ACHIEVEMENTS, achievementProgress, defaultAchievementData, sanitizeAchievementData, localDayKey } from "./achievements.js";
import { EGG_BY_THEME } from "./easter_eggs.js";
import { getWeaponSpec, drawHeldWeapon, drawProjectile, drawBeam, beamTiming, drawStuckArrow, drawSpikeDestruction, DESTRUCTION_TIME, SWING_TIME, SWING_HIT, BOLT_TIME, MELEE_CONTACT, meleeTriggerGap, gravityHoldOffset, gravityGrabTime, GRAVITY_LIFT, getWeaponSound } from "./weapons.js";

// ---------- Детермінований PRNG (фіксовані траси) ----------

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------- Конфігурація 5 ліг та 31 рівня ----------

export const LEVELS_CONFIG = [
    {
        id: 1,
        name: "Базова",
        levels: [
            { id: 1,  leagueId: 1, name: "Перші кроки",             letters: ["А","П","Р","О"], speed: 165, spikeCount: 12, seed: 2001, bgTheme: "block_village",           accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_1_1", name: "Кубик-кіт", renderType: "block_cat" } },
            { id: 2,  leagueId: 1, name: "Сусіди центру",           letters: ["В","І","Л","Д"], speed: 172, spikeCount: 13, seed: 2002, bgTheme: "sunset_city",             accentColor: "#ff9ed0", rhythmGroups: false, skin: { id: "skin_1_2", name: "Серфер", renderType: "cyber_eye" } },
            { id: 32, leagueId: 1, name: "Перші слова",             words: ["ПАРА","ПОРА","ОПОРА","ПАПА","ПАР"], speed: 172, spikeCount: 14, seed: 2017, tuneAs: 2, bgTheme: "pumpkin_pastures", accentColor: "#ff9a3d", rhythmGroups: false, skin: { id: "skin_1_x1", name: "Гарбуз-ліхтар", renderType: "pumpkin_lantern" } },
            { id: 3,  leagueId: 1, name: "Верхній центр",           letters: ["К","Е","Н","Г"], speed: 179, spikeCount: 14, seed: 2003, bgTheme: "cosmodrome",                 accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_1_3", name: "Прибулець", renderType: "retro_gamer" } },
            { id: 4,  leagueId: 1, name: "Нижній центр",            letters: ["М","И","Т","Ь"], speed: 186, spikeCount: 15, seed: 2004, bgTheme: "neon_highway",             accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_1_4", name: "Гонщик", renderType: "throne" } },
            { id: 33, leagueId: 1, name: "Дзеркальні пари",         letters: ["А","О","В","Л"], speed: 186, spikeCount: 16, seed: 2018, tuneAs: 4, bgTheme: "creeper_woods", accentColor: "#6aff5a", rhythmGroups: false, skin: { id: "skin_1_x2", name: "Кубик-гриб", renderType: "mushroom_cube" } },
            { id: 5,  leagueId: 1, name: "Верхні сусіди",           letters: ["У","Ц","Ш","Щ"], speed: 193, spikeCount: 16, seed: 2005, bgTheme: "jungle_temple",       accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_5", name: "Золотий ідол", renderType: "crosshair" } },
            { id: 6,  leagueId: 1, name: "Нижні сусіди",            letters: ["С","Ч","Б","Ю"], speed: 200, spikeCount: 17, seed: 2006, bgTheme: "digital_forest",     accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_6", name: "Матричний Піксель", renderType: "matrix_pixel" } },
            { id: 7,  leagueId: 1, name: "Краї середнього ряду",    letters: ["Ф","І","Ж","Є"], speed: 207, spikeCount: 18, seed: 2007, bgTheme: "storm_sky",            accentColor: "#9fb4ff", rhythmGroups: false, skin: { id: "skin_1_7", name: "Блискавка", renderType: "slice" } },
            { id: 8,  leagueId: 1, name: "Краї верхнього ряду",     letters: ["Й","Ц","З","Х"], speed: 214, spikeCount: 19, seed: 2008, bgTheme: "crystal_cave",            accentColor: "#b35cff", rhythmGroups: false, skin: { id: "skin_1_8", name: "Сяючий Кристал", renderType: "shining_diamond" } },
            { id: 9,  leagueId: 1, name: "Далекі кути",             letters: ["Я","Ч","Х","Ї"], speed: 221, spikeCount: 20, seed: 2009, bgTheme: "dino_valley",          accentColor: "#ff9a3d", rhythmGroups: false, skin: { id: "skin_1_9", name: "Динозаврик", renderType: "double_frame" } },
            { id: 10, leagueId: 1, name: "Остання літера",          letters: ["А","В","Є","Ґ"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "pixel_night",             accentColor: "#62c13a", rhythmGroups: false, skin: { id: "skin_1_10", name: "Нічна сова", renderType: "monolith" } },
            { id: 46, leagueId: 1, name: "Склади",                  words: ["НА","КО","ПО","НО","КА","ПА","ОН","ОК"], combo: "syllables", speed: 228, spikeCount: 18, seed: 2031, tuneAs: 10, bgTheme: "sponge_reef", accentColor: "#ffe14d", rhythmGroups: false, skin: { id: "skin_1_x9", name: "Губка", renderType: "sponge_cube" } },
            { id: 47, leagueId: 1, name: "Перекати пальцями",       words: ["ВАПР","АПРО","РПАВ","ОРПА","ВАП","ПРО"], combo: "rolls", speed: 230, spikeCount: 20, seed: 2032, tuneAs: 10, bgTheme: "ninja_temple", accentColor: "#ff4a3a", rhythmGroups: false, skin: { id: "skin_1_x10", name: "Кубик-ніндзя", renderType: "ninja_cube" } },
            { id: 35, leagueId: 1, name: "Найчастіші літери",       letters: ["О","А","Н","І","Т"], speed: 232, spikeCount: 20, seed: 2020, tuneAs: 10, bgTheme: "alien_freighter", accentColor: "#5aff78", rhythmGroups: false, skin: { id: "skin_1_x4", name: "Космодесантник", renderType: "space_marine" } },
            { id: 48, leagueId: 1, name: "Двічі поспіль",           words: ["ТТ","НН","ММ","ТОННА","МАННА"], combo: "doubles", speed: 234, spikeCount: 22, seed: 2033, tuneAs: 10, bgTheme: "machine_war", accentColor: "#ff2a3a", rhythmGroups: false, skin: { id: "skin_1_x11", name: "Кіборг", renderType: "endo_skull" } },
            { id: 11, leagueId: 1, name: "Середній ряд",            letters: ["В","А","П","Р","О","Л"], speed: 235, spikeCount: 22, seed: 2011, bgTheme: "secret_base",            accentColor: "#39ffd0", rhythmGroups: false, skin: { id: "skin_1_11", name: "Радар", renderType: "radar" } },
            { id: 34, leagueId: 1, name: "Вказівні пальці",         letters: ["К","А","М","Н","О","Т"], speed: 238, spikeCount: 18, seed: 2019, tuneAs: 11, bgTheme: "redstone_mines", accentColor: "#ff4a3a", rhythmGroups: false, skin: { id: "skin_1_x3", name: "Рудокоп", renderType: "redstone_miner" } },
            { id: 12, leagueId: 1, name: "Верхній ряд",             letters: ["У","К","Е","Н","Г","Ш"], speed: 242, spikeCount: 23, seed: 2012, bgTheme: "luna_park",             accentColor: "#ff5ad8", rhythmGroups: false, skin: { id: "skin_1_12", name: "Клоун", renderType: "speed_arrow" } },
            { id: 49, leagueId: 1, name: "Далекі стрибки",          words: ["ЙХ","ФЖ","ЯЮ","ХЙ","ЖФ","ЮЯ","ЙЮ","ЯХ"], combo: "farJumps", speed: 242, spikeCount: 24, seed: 2034, tuneAs: 12, bgTheme: "kaiju_bay", accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_1_x12", name: "Кайдзю", renderType: "kaiju_cube" } },
            { id: 36, leagueId: 1, name: "Слова з верхнім рядом",   words: ["КІНО","НЕБО","БІК","КОНІ","ОКО"], speed: 244, spikeCount: 22, seed: 2021, tuneAs: 12, bgTheme: "hunter_jungle", accentColor: "#ff3a2a", rhythmGroups: false, skin: { id: "skin_1_x5", name: "Мисливець", renderType: "jungle_hunter" } },
            { id: 13, leagueId: 1, name: "Нижній ряд",              letters: ["С","М","И","Т","Ь","Б"], speed: 249, spikeCount: 24, seed: 2013, bgTheme: "sea_fabricator",          accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_1_13", name: "Дрон-будівельник", renderType: "neon_cross" } },
            { id: 37, leagueId: 1, name: "Мізинці",                 letters: ["Й","Ф","Я","Х","Ж","Є"], speed: 249, spikeCount: 23, seed: 2022, tuneAs: 13, bgTheme: "soggy_swamp", accentColor: "#8ad86a", rhythmGroups: false, skin: { id: "skin_1_x6", name: "Болотяний дух", renderType: "swamp_stump" } },
            { id: 14, leagueId: 1, name: "Широкий середній ряд",    letters: ["Ф","І","В","Ж","Є","Ґ"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "twin_sun_planet",      accentColor: "#ff5a8a", rhythmGroups: false, skin: { id: "skin_1_14", name: "Слиз", renderType: "liquid_gradient" } },
            { id: 50, leagueId: 1, name: "Слова-послання",          words: ["СВІТЛО","СВІТ","ЛІТО","ЛІС","СЛОВО","ТІЛО","СТІЛ","СОЛО"], speed: 254, spikeCount: 26, seed: 2035, tuneAs: 14, bgTheme: "strange_town", accentColor: "#ff3a3a", rhythmGroups: false, skin: { id: "skin_1_x13", name: "Рація", renderType: "walkie_cube" } },
            { id: 38, leagueId: 1, name: "Тренування помилок",      letters: ["Ж","Є","Х","Ї","Щ","Ґ"], adaptive: { pool: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А","П","Р","О","Л","Д","Ж","Є","Ґ","Я","Ч","С","М","И","Т","Ь","Б","Ю"], count: 6 }, speed: 256, spikeCount: 24, seed: 2023, tuneAs: 14, bgTheme: "dungeon_depths", accentColor: "#5ac8ff", rhythmGroups: false, skin: { id: "skin_1_x7", name: "Страж підземелля", renderType: "dungeon_guard" } },
            { id: 15, leagueId: 1, name: "Широкий верхній ряд",     letters: ["Й","Ц","У","Щ","З","Х"], speed: 263, spikeCount: 26, seed: 2015, bgTheme: "sky_city",           accentColor: "#bfe0ff", rhythmGroups: false, skin: { id: "skin_1_15", name: "Крилатий", renderType: "winged" } },
            { id: 51, leagueId: 1, name: "Печатки",                 words: ["ТИГТИГ","БИКБИК","КАБКАБ","ТАКТАК","БАКБАК","КИТКИТ"], combo: "seals", speed: 263, spikeCount: 30, seed: 2036, tuneAs: 15, bgTheme: "leaf_village", accentColor: "#ff8a1a", rhythmGroups: false, skin: { id: "skin_1_x14", name: "Протектор", renderType: "headband_cube" } },
            { id: 16, leagueId: 1, name: "Широкий нижній ряд",      letters: ["Я","Ч","С","Ю","Є","Ї"], speed: 270, spikeCount: 28, seed: 2016, bgTheme: "stadium",          accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_16", name: "Футбольний м'яч", renderType: "light_cup" } },
            { id: 39, leagueId: 1, name: "Слова-ракети",   words: ["РАКЕТА","КАРТА","НЕКТАР","ТАНК","ТЕРКА","РАНА","КРАН","ТРАКТ"], speed: 272, spikeCount: 30, seed: 2024, tuneAs: 16, bgTheme: "alien_hive", accentColor: "#78ffbe", rhythmGroups: false, skin: { id: "skin_1_x8", name: "Яйце з вулика", renderType: "alien_egg" } }
        ]
    },
    {
        id: 2,
        name: "Середня",
        levels: [
            { id: 17, leagueId: 2, name: "Зигзаг: верх і середина",  letters: ["Ц","В","К","П","Р","Г","Л","Щ"], speed: 240, spikeCount: 26, seed: 2101, bgTheme: "neon_rooftops", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_2_1", name: "Ретро-сонце", renderType: "synthwave_sun" } },
            { id: 40, leagueId: 2, name: "Руки по черзі",            letters: ["В","А","К","С","О","Л","Н","Т"], handSwitch: 1, speed: 245, spikeCount: 27, seed: 2025, tuneAs: 17, bgTheme: "desert_temple", accentColor: "#ffcc5a", rhythmGroups: false, skin: { id: "skin_2_x1", name: "Скарабей", renderType: "scarab_cube" } },
            { id: 18, leagueId: 2, name: "Зигзаг: середина і низ",   letters: ["І","С","А","И","Т","О","Б","Д"], speed: 250, spikeCount: 28, seed: 2102, bgTheme: "night_harbor", accentColor: "#66e0ff", rhythmGroups: false, skin: { id: "skin_2_2", name: "Капітан порту", renderType: "cyberpunk_horizon" } },
            { id: 19, leagueId: 2, name: "Зигзаг: верх і низ",       letters: ["Ч","У","М","Е","Н","Ь","Ш","Ю"], speed: 255, spikeCount: 30, seed: 2103, bgTheme: "pirate_bay", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_2_3", name: "Пірат", renderType: "glitch_cube" } },
            { id: 20, leagueId: 2, name: "Перші краї",               letters: ["Й","І","С","К","Д","З","Є","Ґ"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "treasury", accentColor: "#ffcc33", rhythmGroups: false, skin: { id: "skin_2_4", name: "Золотий Злиток", renderType: "gold_ingot" } },
            { id: 41, leagueId: 2, name: "Стрибки між рядами",       letters: ["У","В","С","К","А","М","Н","Р","Т"], columnJumps: true, speed: 261, spikeCount: 29, seed: 2026, tuneAs: 20, bgTheme: "fiery_forge", accentColor: "#ff7a2a", rhythmGroups: false, skin: { id: "skin_2_x2", name: "Коваль", renderType: "blacksmith" } },
            { id: 42, leagueId: 2, name: "Довгі слова",              words: ["КАПСУЛА","КРАТЕР","АНТЕНА","ПЛАНЕТА","РАКЕТА","ПЕРЕКУС","КЛАПАН","СТАКАН"], speed: 262, spikeCount: 33, seed: 2027, tuneAs: 20, bgTheme: "planet_colony", accentColor: "#ffa24a", rhythmGroups: false, skin: { id: "skin_2_x3", name: "Робот-вантажник", renderType: "power_loader" } },
            { id: 21, leagueId: 2, name: "П'ять на п'ять",           letters: ["Ф","Ч","У","А","И","Н","О","Б","Ж","Х"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "orbit_view", accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_2_5", name: "Орбіта", renderType: "orbit" } },
            { id: 43, leagueId: 2, name: "Рідкісні літери",          letters: ["Ґ","Є","Ї","Щ","Ю","Я","Ь","Ж","Ф","Х"], speed: 270, spikeCount: 34, seed: 2028, tuneAs: 21, bgTheme: "hunter_ship", accentColor: "#5aff9a", rhythmGroups: false, skin: { id: "skin_2_x4", name: "Інопланетний артефакт", renderType: "alien_artifact" } },
            { id: 22, leagueId: 2, name: "Усі стовпці",              letters: ["Я","Ц","В","М","Е","Р","Ь","Ш","Ю","Ї"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "dragon_lair", accentColor: "#ff7a3d", rhythmGroups: false, skin: { id: "skin_2_6", name: "Дракон", renderType: "stalagmite" } },
            { id: 23, leagueId: 2, name: "Далекі сусіди",            letters: ["Й","І","С","К","П","Т","Г","Л","Щ","Є"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "pixel_cave", accentColor: "#33d6d0", rhythmGroups: false, skin: { id: "skin_2_7", name: "Алмазна руда", renderType: "equalizer" } },
            { id: 44, leagueId: 2, name: "Тренування помилок: вершина", letters: ["Ж","Є","Х","Ї","Щ","Ґ","Ю","Ф","Ц","Я"], adaptive: { pool: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А","П","Р","О","Л","Д","Ж","Є","Ґ","Я","Ч","С","М","И","Т","Ь","Б","Ю"], count: 10 }, speed: 282, spikeCount: 38, seed: 2029, tuneAs: 23, bgTheme: "obsidian_peak", accentColor: "#b06bff", rhythmGroups: false, skin: { id: "skin_2_x5", name: "Обсидіановий голем", renderType: "obsidian_golem" } },
            { id: 24, leagueId: 2, name: "Фінал ліги",               letters: ["Ф","Ц","С","А","Е","О","Ш","Ю","З","Ґ"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "knight_castle", accentColor: "#8fa3ff", rhythmGroups: false, skin: { id: "skin_2_8", name: "Лицарський щит", renderType: "shield" } },
            { id: 45, leagueId: 2, name: "Битва в ангарі",           words: ["КОРОЛЕВА","ВУЛИК","КРИЛО","НАВКОЛО","ВОРОН","КАРАВАН","РУКАВ","ВИЛКА","НОРКА","ЛАВИНА"], speed: 300, spikeCount: 42, seed: 2030, tuneAs: 24, bgTheme: "hangar_bay", accentColor: "#ffa21a", rhythmGroups: false, skin: { id: "skin_2_x6", name: "Корона вулика", renderType: "hive_crown" } }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Ц","У","К","Ф","В","П","Н","Ш","З","О","Д","Є"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "pixel_snow", accentColor: "#bff4ff", rhythmGroups: false, skin: { id: "skin_3_1", name: "Льодовий блок", renderType: "plasma" } },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["І","А","Я","С","И","М","Р","Л","Ж","Ь","Ю","Ґ"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "pixel_ocean", accentColor: "#39ffd0", rhythmGroups: false, skin: { id: "skin_3_2", name: "Батискаф", renderType: "vortex" } },
            { id: 27, leagueId: 3, name: "Три поверхи",             letters: ["Й","У","Е","Ф","А","Ч","М","Г","Щ","Х","Ї","Р","Т","Б"], speed: 340, spikeCount: 46, seed: 2203, bgTheme: "pixel_desert", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_3_3", name: "Мумія", renderType: "quantum_barrier" } },
            { id: 28, leagueId: 3, name: "Хаотичний мікс",          letters: ["Ц","К","В","П","Я","С","И","Й","Н","Ш","З","Ї","О","Д","Є","Б"], speed: 360, spikeCount: 50, seed: 2204, bgTheme: "pixel_islands", accentColor: "#d68bff", rhythmGroups: false, skin: { id: "skin_3_4", name: "Метеор", renderType: "meteor" } }
        ]
    },
    {
        id: 4,
        name: "Майстер",
        levels: [
            { id: 29, leagueId: 4, name: "Серце клавіатури",        letters: ["Ц","У","К","Е","І","В","А","П","Ч","С","М","И","Н","Г","Ш","Щ","Р","О","Л","Д","Т","Ь","Б","Ю"], speed: 390, spikeCount: 50, seed: 2301, bgTheme: "black_hole", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_4_1", name: "Галактика", renderType: "galaxy" } },
            { id: 30, leagueId: 4, name: "Гранд Мастер",            letters: ["Й","Ц","У","К","Е","Ф","І","В","А","П","Я","Ч","С","М","И","Н","Г","Ш","З","Х","Р","О","Л","Д","Ж","Є","Т","Ь","Б","Ю"], speed: 418, spikeCount: 55, seed: 2302, bgTheme: "sky_citadel", accentColor: "#ffd700", rhythmGroups: false, skin: { id: "skin_4_2", name: "Корона Майстра", renderType: "master_crown" } }
        ]
    },
    {
        id: 5,
        name: "Бос",
        levels: [
            { id: 31, leagueId: 5, name: "ФІНАЛЬНИЙ ДЕМОН",        letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ґ"], speed: 450, spikeCount: 60, seed: 2401, bgTheme: "pixel_nether", accentColor: "#ff1111", rhythmGroups: true, skin: { id: "skin_5_1", name: "ЛОРД ДЕМОНІВ", renderType: "demon_lord" } }
        ]
    }
];

// Стартовий скін, яким кубик малюється до першого вибору (завжди відкритий, не належить рівню)
export const DEFAULT_SKIN = "neon_base";

// Рівень боса (фінал гри)
export const BOSS_LEVEL_ID = 31;

// Рівні-комбінації: шипи складають не слова, а зв'язки клавіш певного типу
// (набираються так само, як слова, але бонус і підписи — свої)
export const COMBO_KINDS = {
    syllables: { name: "Склади", unit: "Склад" },
    rolls: { name: "Перекати", unit: "Перекат" },
    doubles: { name: "Двічі поспіль", unit: "Повтор" },
    farJumps: { name: "Далекі стрибки", unit: "Стрибок" },
    seals: { name: "Печатки", unit: "Печатка" }
};

export const ALL_LEVELS = LEVELS_CONFIG.reduce(function (acc, league) {
    return acc.concat(league.levels);
}, []);

// Рівні-слова: літери рівня — усі літери його слів (для клавіатури й підказок)
for (const lvl of ALL_LEVELS) {
    if (Array.isArray(lvl.words) && lvl.words.length > 0 && !lvl.letters) {
        const set = [];
        for (const w of lvl.words) {
            for (const ch of w) {
                if (set.indexOf(ch) === -1) {
                    set.push(ch);
                }
            }
        }
        lvl.letters = set;
    }
}

// Порядок проходження: ліга за лігою, у лізі — за порядком у масиві.
// Відкриття рівнів спирається на цей порядок, а не на номер (id), тож нові рівні
// можна вставляти будь-куди, не ламаючи збереження
export function levelOrderIndex(levelId) {
    return ALL_LEVELS.findIndex(function (l) { return l.id === levelId; });
}

export function nextLevelOf(levelId) {
    const i = levelOrderIndex(levelId);
    return i >= 0 && i < ALL_LEVELS.length - 1 ? ALL_LEVELS[i + 1] : null;
}

function getLevelById(levelId) {
    return ALL_LEVELS.find(function (l) { return l.id === levelId; }) ||
           ALL_LEVELS[0];
}

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

export const SKIN_RENDERERS = {

    // === ГРУПА 1: БАЗОВА ЛІГА ===

    // Стандартний Неон: класичний кубик GD — неоновий корпус, темна вставка й обличчя
    neon_base: function (ctx, size, time) {
        var h = size / 2;
        renderSkinGlow(ctx, size, "#00f6ff", 14);
        var body = ctx.createLinearGradient(-h, -h, h, h);
        body.addColorStop(0, "#00f6ff");
        body.addColorStop(1, "#0077ff");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        var inset = size * 0.2;
        ctx.fillStyle = "#06284a";
        ctx.fillRect(-h + inset, -h + inset, size - inset * 2, size - inset * 2);
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(-size * 0.2, -size * 0.14, size * 0.12, size * 0.14);
        ctx.fillRect(size * 0.08, -size * 0.14, size * 0.12, size * 0.14);
        ctx.fillRect(-size * 0.16, size * 0.08, size * 0.32, size * 0.07);
        drawSkinFrame(ctx, size, "#bffcff");
    },

    block_cat: function (ctx, size, time) {
        // Кубик-кіт із пасхалки «Кубічного селища»: рудий смугастий, щурить зелені
        // очі, ворушить вусами й смикає вушком
        var h = size / 2;
        ctx.fillStyle = "#ff9a3d";
        ctx.fillRect(-h, -h, size, size);
        // Вушка у верхніх кутах
        var twitch = (time % 4200) < 180 ? size * 0.04 : 0;
        ctx.fillStyle = "#c86a1a";
        ctx.fillRect(-h, -h - twitch, size * 0.24, size * 0.22);
        ctx.fillRect(h - size * 0.24, -h, size * 0.24, size * 0.22);
        ctx.fillStyle = "#ffb0b8";
        ctx.fillRect(-h + size * 0.06, -h + size * 0.05 - twitch, size * 0.12, size * 0.12);
        ctx.fillRect(h - size * 0.18, -h + size * 0.05, size * 0.12, size * 0.12);
        // Смужки на лобі
        ctx.fillStyle = "#c86a1a";
        ctx.fillRect(-size * 0.04, -h, size * 0.08, size * 0.22);
        ctx.fillRect(-size * 0.18, -h, size * 0.06, size * 0.14);
        ctx.fillRect(size * 0.12, -h, size * 0.06, size * 0.14);
        ctx.fillRect(-h, -size * 0.02, size * 0.1, size * 0.05);
        ctx.fillRect(h - size * 0.1, -size * 0.02, size * 0.1, size * 0.05);
        // Світла мордочка
        ctx.fillStyle = "#fff0dc";
        ctx.fillRect(-size * 0.24, size * 0.1, size * 0.48, size * 0.3);
        // Зелені очі з вертикальними зіницями; кіт іноді повільно щурить їх
        var squint = (time % 3600) < 420;
        if (squint) {
            ctx.fillStyle = "#3a2410";
            ctx.fillRect(-size * 0.32, -size * 0.08, size * 0.2, size * 0.04);
            ctx.fillRect(size * 0.12, -size * 0.08, size * 0.2, size * 0.04);
        } else {
            ctx.fillStyle = "#6aff5a";
            ctx.fillRect(-size * 0.32, -size * 0.16, size * 0.2, size * 0.16);
            ctx.fillRect(size * 0.12, -size * 0.16, size * 0.2, size * 0.16);
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-size * 0.24, -size * 0.16, size * 0.05, size * 0.16);
            ctx.fillRect(size * 0.2, -size * 0.16, size * 0.05, size * 0.16);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-size * 0.3, -size * 0.14, size * 0.04, size * 0.04);
            ctx.fillRect(size * 0.14, -size * 0.14, size * 0.04, size * 0.04);
        }
        // Рожевий носик і рот «:3»
        ctx.fillStyle = "#ff7a9a";
        ctx.fillRect(-size * 0.05, size * 0.1, size * 0.1, size * 0.06);
        ctx.fillStyle = "#3a2410";
        ctx.fillRect(-size * 0.01, size * 0.16, size * 0.02, size * 0.06);
        ctx.fillRect(-size * 0.1, size * 0.22, size * 0.09, size * 0.03);
        ctx.fillRect(size * 0.01, size * 0.22, size * 0.09, size * 0.03);
        // Вуса, що ворушаться
        var wig = Math.sin(time * 0.006) * size * 0.02;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-h + size * 0.02, size * 0.12 - wig, size * 0.24, size * 0.02);
        ctx.fillRect(-h + size * 0.02, size * 0.2 + wig, size * 0.24, size * 0.02);
        ctx.fillRect(h - size * 0.26, size * 0.12 - wig, size * 0.24, size * 0.02);
        ctx.fillRect(h - size * 0.26, size * 0.2 + wig, size * 0.24, size * 0.02);
        drawSkinFrame(ctx, size, "#ffcf8a");
    },    cyber_eye: function (ctx, size, time) {
        // Серфер на тлі заходу сонця: засмага, сонцезахисні окуляри, біляве волосся
        var h = size / 2;
        var sky = ctx.createLinearGradient(0, -h, 0, h);
        sky.addColorStop(0, "#ff5a8a");
        sky.addColorStop(0.55, "#ffb35c");
        sky.addColorStop(1, "#ff9ed0");
        ctx.fillStyle = sky;
        ctx.fillRect(-h, -h, size, size);
        // Сонце й хвиля позаду
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(size * 0.12, -h + size * 0.08, size * 0.26, size * 0.26);
        var wave = Math.sin(time * 0.004) * size * 0.03;
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(-h, h - size * 0.18 + wave, size, size * 0.18 - wave);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-h, h - size * 0.18 + wave, size, size * 0.04);
        // Обличчя
        ctx.fillStyle = "#d8905a";
        ctx.fillRect(-size * 0.3, -size * 0.22, size * 0.6, size * 0.5);
        // Біляве волосся
        ctx.fillStyle = "#ffe8a0";
        ctx.fillRect(-size * 0.34, -size * 0.34, size * 0.68, size * 0.16);
        ctx.fillRect(-size * 0.34, -size * 0.2, size * 0.1, size * 0.14);
        ctx.fillRect(size * 0.12, -size * 0.4, size * 0.16, size * 0.08);
        // Окуляри з відблиском
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(-size * 0.28, -size * 0.1, size * 0.24, size * 0.12);
        ctx.fillRect(size * 0.04, -size * 0.1, size * 0.24, size * 0.12);
        ctx.fillRect(-size * 0.04, -size * 0.08, size * 0.08, size * 0.03);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(-size * 0.25, -size * 0.08, size * 0.06, size * 0.03);
        ctx.fillRect(size * 0.07, -size * 0.08, size * 0.06, size * 0.03);
        // Усмішка
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.14, size * 0.1, size * 0.28, size * 0.07);
        ctx.fillStyle = "#8a3a2a";
        ctx.fillRect(-size * 0.14, size * 0.17, size * 0.28, size * 0.03);
        drawSkinFrame(ctx, size, "#ff9ed0");
    },
    retro_gamer: function (ctx, size, time) {
        var step = Math.floor(time / 300) % 2 === 0;
        drawPixelArt(ctx, size, [
            "kgkkkkgk",
            "kkgkkgkk",
            "kggggggk",
            "ggwgggwg",
            "ggpgggpg",
            "gggggggg",
            step ? "kggkkggk" : "kgkggkgk",
            step ? "kgkkkkgk" : "gkkkkkkg"
        ], { k: "#0a0a20", g: "#39ff14", w: "#ffffff", p: "#003300" });
        drawSkinFrame(ctx, size, "#00ff41");
    },

    throne: function (ctx, size, time) {
        // Гонщик у шоломі з візором і гоночними смугами
        var h = size / 2;
        ctx.fillStyle = "#1a0a34";
        ctx.fillRect(-h, -h, size, size);
        // Шолом
        ctx.fillStyle = "#ff2ea6";
        ctx.fillRect(-size * 0.4, -size * 0.38, size * 0.8, size * 0.72);
        ctx.fillRect(-size * 0.32, -size * 0.44, size * 0.64, size * 0.08);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.06, -size * 0.44, size * 0.12, size * 0.78);
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(-size * 0.02, -size * 0.44, size * 0.04, size * 0.78);
        // Візор із бігучим відблиском
        ctx.fillStyle = "#0a1030";
        ctx.fillRect(-size * 0.34, -size * 0.14, size * 0.68, size * 0.2);
        var glint = ((time * 0.0006) % 1) * size * 0.9 - size * 0.4;
        ctx.fillStyle = "rgba(0, 246, 255, 0.8)";
        ctx.fillRect(Math.max(-size * 0.34, glint), -size * 0.12, size * 0.08, size * 0.16);
        ctx.fillStyle = "rgba(255, 225, 77, 0.8)";
        ctx.fillRect(-size * 0.3, -size * 0.12, size * 0.14, size * 0.04);
        // Номер на підборідді
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(-size * 0.14, size * 0.14, size * 0.28, size * 0.14);
        ctx.fillStyle = "#1a0a34";
        ctx.fillRect(-size * 0.02, size * 0.16, size * 0.04, size * 0.1);
        // Шашечки внизу
        for (var i = 0; i < 8; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#111111";
            ctx.fillRect(-h + i * size / 8, h - size * 0.08, size / 8, size * 0.08);
        }
        drawSkinFrame(ctx, size, "#ff2ea6");
    },
    crosshair: function (ctx, size, time) {
        // Золотий ідол із храму в джунглях: маска з очима-смарагдами
        var h = size / 2;
        ctx.fillStyle = "#2a5a2a";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#3a8a3a";
        ctx.fillRect(-h, -h, size * 0.2, size * 0.3);
        ctx.fillRect(h - size * 0.24, h - size * 0.3, size * 0.24, size * 0.3);
        // Маска
        ctx.fillStyle = "#e8a818";
        ctx.fillRect(-size * 0.36, -size * 0.36, size * 0.72, size * 0.76);
        ctx.fillStyle = "#ffd24a";
        ctx.fillRect(-size * 0.36, -size * 0.36, size * 0.72, size * 0.08);
        ctx.fillRect(-size * 0.36, -size * 0.36, size * 0.08, size * 0.76);
        // Корона з пір'я
        ctx.fillStyle = "#c88a10";
        for (var i = 0; i < 5; i++) {
            ctx.fillRect(-size * 0.34 + i * size * 0.15, -size * 0.46 - (i % 2) * size * 0.04, size * 0.1, size * 0.12);
        }
        // Очі-смарагди, що мерехтять
        var glow = 0.6 + 0.4 * Math.sin(time * 0.004);
        ctx.fillStyle = "rgba(57, 255, 136, " + glow.toFixed(3) + ")";
        ctx.fillRect(-size * 0.24, -size * 0.14, size * 0.16, size * 0.12);
        ctx.fillRect(size * 0.08, -size * 0.14, size * 0.16, size * 0.12);
        ctx.fillStyle = "#8a5a08";
        ctx.fillRect(-size * 0.28, -size * 0.2, size * 0.24, size * 0.04);
        ctx.fillRect(size * 0.04, -size * 0.2, size * 0.24, size * 0.04);
        // Ніс і рот із зубцями
        ctx.fillStyle = "#c88a10";
        ctx.fillRect(-size * 0.05, -size * 0.02, size * 0.1, size * 0.16);
        ctx.fillStyle = "#6a4008";
        ctx.fillRect(-size * 0.2, size * 0.2, size * 0.4, size * 0.1);
        ctx.fillStyle = "#ffd24a";
        for (var k = 0; k < 4; k++) {
            ctx.fillRect(-size * 0.18 + k * size * 0.1, size * 0.2, size * 0.05, size * 0.05);
        }
        drawSkinFrame(ctx, size, "#ffd24a");
    },
    matrix_pixel: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#001a06";
        ctx.fillRect(-h, -h, size, size);
        var cols = 6;
        var cell = size / cols;
        for (var c = 0; c < cols; c++) {
            var speed = 0.0025 + (c * 37 % 5) * 0.0006;
            var head = ((time * speed + c * 1.7) % 1.6) * cols - 2;
            for (var k = 0; k < 4; k++) {
                var row = Math.floor(head) - k;
                if (row < 0 || row >= cols) {
                    continue;
                }
                ctx.fillStyle = k === 0 ? "#d8ffe0" : "rgba(0, 255, 65, " + (0.9 - k * 0.22).toFixed(2) + ")";
                ctx.fillRect(-h + c * cell + cell * 0.2, -h + row * cell + cell * 0.2, cell * 0.6, cell * 0.6);
            }
        }
        drawSkinFrame(ctx, size, "#00ff41");
    },

    // Блискавка: помаранчевий кубик із темною вставкою та яскравою блискавкою
    slice: function (ctx, size, time) {
        var h = size / 2;
        var body = ctx.createLinearGradient(-h, -h, h, h);
        body.addColorStop(0, "#ffcc00");
        body.addColorStop(1, "#ff5a00");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        var inset = size * 0.13;
        ctx.fillStyle = "#2a1200";
        ctx.fillRect(-h + inset, -h + inset, size - inset * 2, size - inset * 2);
        // Спалах: ореол за блискавкою пульсує
        var flash = Math.max(0, Math.sin(time * 0.012));
        ctx.fillStyle = "rgba(255, 225, 77, " + (0.12 + 0.2 * flash).toFixed(3) + ")";
        ctx.fillRect(-h + inset, -h + inset, size - inset * 2, size - inset * 2);
        ctx.fillStyle = "#ffe14d";
        ctx.beginPath();
        ctx.moveTo(size * 0.1, -size * 0.36);
        ctx.lineTo(-size * 0.2, size * 0.05);
        ctx.lineTo(-size * 0.02, size * 0.05);
        ctx.lineTo(-size * 0.11, size * 0.36);
        ctx.lineTo(size * 0.22, -size * 0.09);
        ctx.lineTo(size * 0.04, -size * 0.09);
        ctx.lineTo(size * 0.14, -size * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.stroke();
        drawSkinFrame(ctx, size, "#fff3a0");
    },

    // Сяючий Кристал: огранований фіолетовий кристал із гранями та відблисками
    shining_diamond: function (ctx, size, time) {
        var h = size / 2;
        var bg = ctx.createLinearGradient(0, -h, 0, h);
        bg.addColorStop(0, "#2a1045");
        bg.addColorStop(1, "#140822");
        ctx.fillStyle = bg;
        ctx.fillRect(-h, -h, size, size);
        var top = -size * 0.34;
        var girdle = -size * 0.1;
        var bottom = size * 0.38;
        var w = size * 0.36;
        // Верхні грані
        ctx.fillStyle = "#e0b0ff";
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, top);
        ctx.lineTo(w * 0.5, top);
        ctx.lineTo(w, girdle);
        ctx.lineTo(-w, girdle);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c77dff";
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, top);
        ctx.lineTo(0, girdle);
        ctx.lineTo(-w, girdle);
        ctx.closePath();
        ctx.moveTo(w * 0.5, top);
        ctx.lineTo(w, girdle);
        ctx.lineTo(0, girdle);
        ctx.closePath();
        ctx.fill();
        // Нижні грані
        ctx.fillStyle = "#9b3dea";
        ctx.beginPath();
        ctx.moveTo(-w, girdle);
        ctx.lineTo(0, girdle);
        ctx.lineTo(0, bottom);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#7a22c9";
        ctx.beginPath();
        ctx.moveTo(w, girdle);
        ctx.lineTo(0, girdle);
        ctx.lineTo(0, bottom);
        ctx.closePath();
        ctx.fill();
        // Відблиск, що перебігає, і іскра
        var glint = (time * 0.0008) % 1.5;
        if (glint < 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            var gx = -w + glint * w * 2;
            ctx.fillRect(gx - size * 0.03, top + size * 0.04, size * 0.06, size * 0.18);
        }
        var spark = Math.max(0, Math.sin(time * 0.005));
        ctx.fillStyle = "rgba(255, 255, 255, " + spark.toFixed(2) + ")";
        var ss = size * 0.04;
        ctx.fillRect(w * 0.6 - ss / 2, top - ss * 1.5, ss, ss * 3);
        ctx.fillRect(w * 0.6 - ss * 1.5, top - ss / 2, ss * 3, ss);
        drawSkinFrame(ctx, size, "#c77dff");
    },

    double_frame: function (ctx, size, time) {
        // Динозаврик: зелена морда, великі очі, зубки й шипи на голові
        var h = size / 2;
        ctx.fillStyle = "#ffb35c";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#5ac84a";
        ctx.fillRect(-size * 0.42, -size * 0.3, size * 0.84, size * 0.72);
        ctx.fillStyle = "#4aa83a";
        ctx.fillRect(-size * 0.42, size * 0.1, size * 0.84, size * 0.32);
        // Шипи на голові
        ctx.fillStyle = "#ff7a3d";
        for (var i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-size * 0.34 + i * size * 0.2, -size * 0.3);
            ctx.lineTo(-size * 0.26 + i * size * 0.2, -size * 0.46);
            ctx.lineTo(-size * 0.18 + i * size * 0.2, -size * 0.3);
            ctx.closePath();
            ctx.fill();
        }
        // Очі, що кліпають
        var blink = (time % 3200) < 160;
        ctx.fillStyle = "#ffffff";
        if (blink) {
            ctx.fillStyle = "#2a5a2a";
            ctx.fillRect(-size * 0.3, -size * 0.1, size * 0.2, size * 0.04);
            ctx.fillRect(size * 0.1, -size * 0.1, size * 0.2, size * 0.04);
        } else {
            ctx.fillRect(-size * 0.3, -size * 0.2, size * 0.2, size * 0.2);
            ctx.fillRect(size * 0.1, -size * 0.2, size * 0.2, size * 0.2);
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-size * 0.2, -size * 0.14, size * 0.08, size * 0.12);
            ctx.fillRect(size * 0.2, -size * 0.14, size * 0.08, size * 0.12);
        }
        // Ніздрі
        ctx.fillStyle = "#2a6a2a";
        ctx.fillRect(-size * 0.12, size * 0.06, size * 0.06, size * 0.04);
        ctx.fillRect(size * 0.06, size * 0.06, size * 0.06, size * 0.04);
        // Паща з зубками
        ctx.fillStyle = "#3a1a1a";
        ctx.fillRect(-size * 0.3, size * 0.2, size * 0.6, size * 0.1);
        ctx.fillStyle = "#ffffff";
        for (var k = 0; k < 5; k++) {
            ctx.fillRect(-size * 0.28 + k * size * 0.12, size * 0.2, size * 0.06, size * 0.06);
        }
        drawSkinFrame(ctx, size, "#5ac84a");
    },
    monolith: function (ctx, size, time) {
        var blink = (time % 3500) < 160;
        ctx.fillStyle = "#0b1030";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        // Сова трохи менша за кубик, щоб рамка не закривала вушка
        ctx.save();
        ctx.scale(0.76, 0.76);
        drawPixelArt(ctx, size, [
            "bbkkkkbb",
            "bbbbbbbb",
            "bwwbbwwb",
            blink ? "bbbbbbbb" : "bwpbbpwb",
            "bbbooobb",
            "bbffffbb",
            "bfbffbfb",
            "bboffobb"
        ], { k: "#0b1030", b: "#8a5a33", w: "#ffe14d", p: "#1a0e06", o: "#ff9a3d", f: "#c8966a" });
        ctx.restore();
        drawSkinFrame(ctx, size, "#ffe14d");
    },

    // Радар: промінь обертається й підсвічує цілі
    radar: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#03140c";
        ctx.fillRect(-h, -h, size, size);
        ctx.strokeStyle = "rgba(0, 255, 136, 0.35)";
        ctx.lineWidth = Math.max(1, size * 0.02);
        ctx.beginPath();
        for (var r = size * 0.13; r < size * 0.45; r += size * 0.13) {
            ctx.moveTo(r, 0);
            ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.moveTo(-size * 0.4, 0);
        ctx.lineTo(size * 0.4, 0);
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(0, size * 0.4);
        ctx.stroke();
        var sweep = (time * 0.003) % (Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 136, 0.3)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, size * 0.42, sweep - 0.7, sweep);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#7dffc0";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sweep) * size * 0.42, Math.sin(sweep) * size * 0.42);
        ctx.stroke();
        var blips = [[0.25, 0.8], [0.32, 2.6], [0.18, 4.4]];
        for (var i = 0; i < blips.length; i++) {
            var ang = blips[i][1];
            var diff = (sweep - ang + Math.PI * 4) % (Math.PI * 2);
            var bright = Math.max(0, 1 - diff / 2.5);
            if (bright <= 0) {
                continue;
            }
            ctx.fillStyle = "rgba(180, 255, 210, " + bright.toFixed(2) + ")";
            var br = size * 0.05;
            ctx.fillRect(Math.cos(ang) * size * blips[i][0] - br / 2, Math.sin(ang) * size * blips[i][0] - br / 2, br, br);
        }
        drawSkinFrame(ctx, size, "#00ff88");
    },

    speed_arrow: function (ctx, size, time) {
        // Клоун із луна-парку: кольорові кучері, червоний ніс, широка усмішка
        var h = size / 2;
        ctx.fillStyle = "#2a1450";
        ctx.fillRect(-h, -h, size, size);
        // Кучері з двох боків
        var colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88"];
        for (var i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(-h, -size * 0.3 + i * size * 0.14, size * 0.18, size * 0.14);
            ctx.fillRect(h - size * 0.18, -size * 0.3 + i * size * 0.14, size * 0.18, size * 0.14);
        }
        // Обличчя
        ctx.fillStyle = "#fff4ec";
        ctx.fillRect(-size * 0.32, -size * 0.32, size * 0.64, size * 0.72);
        // Капелюшок
        ctx.fillStyle = "#ff5ad8";
        ctx.fillRect(-size * 0.14, -h, size * 0.28, size * 0.2);
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(-size * 0.04, -h, size * 0.08, size * 0.06);
        // Очі-зірочки
        ctx.fillStyle = "#3a6aff";
        ctx.fillRect(-size * 0.24, -size * 0.14, size * 0.14, size * 0.04);
        ctx.fillRect(-size * 0.19, -size * 0.19, size * 0.04, size * 0.14);
        ctx.fillRect(size * 0.1, -size * 0.14, size * 0.14, size * 0.04);
        ctx.fillRect(size * 0.15, -size * 0.19, size * 0.04, size * 0.14);
        // Ніс, що пульсує
        var pulse = size * (0.14 + 0.02 * Math.sin(time * 0.006));
        ctx.fillStyle = "#ff2233";
        ctx.fillRect(-pulse / 2, -pulse / 2 + size * 0.04, pulse, pulse);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-pulse / 2 + 2, -pulse / 2 + size * 0.04 + 2, size * 0.03, size * 0.03);
        // Широка усмішка
        ctx.fillStyle = "#ff2233";
        ctx.fillRect(-size * 0.24, size * 0.2, size * 0.48, size * 0.06);
        ctx.fillRect(-size * 0.28, size * 0.14, size * 0.06, size * 0.08);
        ctx.fillRect(size * 0.22, size * 0.14, size * 0.06, size * 0.08);
        drawSkinFrame(ctx, size, "#ff5ad8");
    },
    neon_cross: function (ctx, size, time) {
        var h = size / 2;
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#8fe3ff");
        body.addColorStop(1, "#2a6f9e");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        // Болти в кутах
        ctx.fillStyle = "#dff6ff";
        var b = size * 0.06;
        var m = size * 0.1;
        ctx.fillRect(-h + m - b / 2, -h + m - b / 2, b, b);
        ctx.fillRect(h - m - b / 2, -h + m - b / 2, b, b);
        ctx.fillRect(-h + m - b / 2, h - m - b / 2, b, b);
        ctx.fillRect(h - m - b / 2, h - m - b / 2, b, b);
        // Візор
        ctx.fillStyle = "#061722";
        ctx.fillRect(-size * 0.36, -size * 0.24, size * 0.72, size * 0.24);
        var blink = (time % 3200) < 140;
        var eyeH = blink ? size * 0.03 : size * 0.12;
        ctx.fillStyle = "#39ffea";
        ctx.fillRect(-size * 0.26, -size * 0.12 - eyeH / 2, size * 0.16, eyeH);
        ctx.fillRect(size * 0.1, -size * 0.12 - eyeH / 2, size * 0.16, eyeH);
        // LED-рот
        ctx.fillStyle = "#061722";
        ctx.fillRect(-size * 0.24, size * 0.12, size * 0.48, size * 0.14);
        var lit = Math.floor(time / 180) % 4;
        for (var i = 0; i < 4; i++) {
            ctx.fillStyle = i === lit ? "#ffffff" : "#39ffea";
            ctx.fillRect(-size * 0.21 + i * size * 0.11, size * 0.15, size * 0.08, size * 0.08);
        }
        drawSkinFrame(ctx, size, "#dff6ff");
    },

    // Слиз: зелений кубик-слайм, верх колишеться, всередині бульбашки, милі очі
    liquid_gradient: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#0b2410";
        ctx.fillRect(-h, -h, size, size);
        var wobble = Math.sin(time * 0.006) * size * 0.05;
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#9dff5a");
        body.addColorStop(1, "#2fb83a");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(-h, h);
        ctx.lineTo(-h, -h + size * 0.18 + wobble);
        ctx.quadraticCurveTo(-size * 0.25, -h - wobble, 0, -h + size * 0.14);
        ctx.quadraticCurveTo(size * 0.25, -h + size * 0.28 + wobble, h, -h + size * 0.16 - wobble);
        ctx.lineTo(h, h);
        ctx.closePath();
        ctx.fill();
        // Бульбашки
        ctx.fillStyle = "rgba(220, 255, 200, 0.55)";
        for (var b = 0; b < 3; b++) {
            var ph = ((time * 0.0004) + b * 0.33) % 1;
            var bx = -size * 0.25 + b * size * 0.25;
            var by = h - size * 0.1 - ph * size * 0.55;
            ctx.fillRect(bx, by, size * 0.07, size * 0.07);
        }
        // Очі та усмішка
        ctx.fillStyle = "#0b2410";
        ctx.fillRect(-size * 0.2, -size * 0.02, size * 0.1, size * 0.14);
        ctx.fillRect(size * 0.1, -size * 0.02, size * 0.1, size * 0.14);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.18, 0, size * 0.04, size * 0.04);
        ctx.fillRect(size * 0.12, 0, size * 0.04, size * 0.04);
        ctx.fillStyle = "#0b2410";
        ctx.fillRect(-size * 0.1, size * 0.2, size * 0.2, size * 0.04);
        ctx.fillRect(-size * 0.14, size * 0.16, size * 0.04, size * 0.04);
        ctx.fillRect(size * 0.1, size * 0.16, size * 0.04, size * 0.04);
        drawSkinFrame(ctx, size, "#9dff5a");
    },

    // Крилатий: синій кубик-птах із крилами, що махають, і пір'ям
    winged: function (ctx, size, time) {
        var h = size / 2;
        var flap = Math.sin(time * 0.012);
        // Крила позаду кубика
        function wing(dir) {
            ctx.fillStyle = "#bff4ff";
            ctx.beginPath();
            ctx.moveTo(dir * h * 0.8, -size * 0.1);
            ctx.lineTo(dir * (h + size * 0.35), -size * 0.3 - flap * size * 0.25);
            ctx.lineTo(dir * (h + size * 0.3), -size * 0.05 - flap * size * 0.12);
            ctx.lineTo(dir * (h + size * 0.22), size * 0.08);
            ctx.lineTo(dir * h * 0.8, size * 0.12);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#00c8ff";
            ctx.fillRect(dir > 0 ? h : -h - size * 0.18, -size * 0.04 - flap * size * 0.06, size * 0.18, size * 0.05);
        }
        wing(-1);
        wing(1);
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#3aa8ff");
        body.addColorStop(1, "#0a4fb0");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        // Пір'я-лусочки на грудях
        ctx.fillStyle = "rgba(191, 244, 255, 0.35)";
        for (var r = 0; r < 2; r++) {
            for (var c = 0; c < 3; c++) {
                ctx.fillRect(-size * 0.27 + c * size * 0.2 + (r % 2) * size * 0.1, size * 0.14 + r * size * 0.14, size * 0.12, size * 0.08);
            }
        }
        // Очі та дзьоб
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.24, -size * 0.2, size * 0.14, size * 0.14);
        ctx.fillRect(size * 0.1, -size * 0.2, size * 0.14, size * 0.14);
        ctx.fillStyle = "#06142a";
        ctx.fillRect(-size * 0.17, -size * 0.16, size * 0.07, size * 0.08);
        ctx.fillRect(size * 0.17, -size * 0.16, size * 0.07, size * 0.08);
        ctx.fillStyle = "#ffb300";
        ctx.beginPath();
        ctx.moveTo(-size * 0.08, -size * 0.02);
        ctx.lineTo(size * 0.08, -size * 0.02);
        ctx.lineTo(0, size * 0.1);
        ctx.closePath();
        ctx.fill();
        drawSkinFrame(ctx, size, "#bff4ff");
    },

    // Футбольний м'яч: кубик із класичним візерунком м'яча, що повільно крутиться
    light_cup: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#f4f6fa";
        ctx.fillRect(-h, -h, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, -h, size, size);
        ctx.clip();
        ctx.rotate(time * 0.0012);
        // Центральний п'ятикутник і шви до сусідніх
        function pentagon(cx, cy, r) {
            ctx.beginPath();
            for (var i = 0; i < 5; i++) {
                var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
                if (i === 0) { ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
                else { ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#15181f";
        pentagon(0, 0, size * 0.17);
        ctx.strokeStyle = "#15181f";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        for (var k = 0; k < 5; k++) {
            var ang = -Math.PI / 2 + k * Math.PI * 2 / 5;
            ctx.moveTo(Math.cos(ang) * size * 0.17, Math.sin(ang) * size * 0.17);
            ctx.lineTo(Math.cos(ang) * size * 0.38, Math.sin(ang) * size * 0.38);
        }
        ctx.stroke();
        for (var j = 0; j < 5; j++) {
            var a2 = -Math.PI / 2 + j * Math.PI * 2 / 5;
            pentagon(Math.cos(a2) * size * 0.52, Math.sin(a2) * size * 0.52, size * 0.15);
        }
        ctx.restore();
        drawSkinFrame(ctx, size, "#39ff88");
    },

    // === ГРУПА 2: СЕРЕДНЯ ЛІГА ===

    // Ретро-сонце: неонове сонце з прорізами над сіткою в стилі synthwave
    synthwave_sun: function (ctx, size, time) {
        var h = size / 2;
        var horizon = size * 0.12;
        var sky = ctx.createLinearGradient(0, -h, 0, horizon);
        sky.addColorStop(0, "#1a0033");
        sky.addColorStop(1, "#6a1275");
        ctx.fillStyle = sky;
        ctx.fillRect(-h, -h, size, horizon + h);
        // Сонце: верхня половина кола з горизонтальними прорізами
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, -h, size, horizon + h);
        ctx.clip();
        var sun = ctx.createLinearGradient(0, -size * 0.32, 0, horizon);
        sun.addColorStop(0, "#ffe14d");
        sun.addColorStop(1, "#ff2ea6");
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(0, horizon, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6a1275";
        for (var i = 0; i < 3; i++) {
            var sy = horizon - size * 0.06 - i * size * 0.09;
            ctx.fillRect(-h, sy, size, size * (0.025 + (2 - i) * 0.01));
        }
        ctx.restore();
        // Неонова підлога з сіткою, що рухається (обрізана межами кубика)
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, horizon - size * 0.02, size, h - horizon + size * 0.02);
        ctx.clip();
        ctx.fillStyle = "#0a0018";
        ctx.fillRect(-h, horizon, size, h - horizon);
        ctx.strokeStyle = "#00f6ff";
        ctx.lineWidth = Math.max(1, size * 0.025);
        ctx.beginPath();
        ctx.moveTo(-h, horizon);
        ctx.lineTo(h, horizon);
        var shift = (time * 0.0006) % 1;
        for (var r = 0; r < 3; r++) {
            var t = (r + shift) / 3;
            var ly = horizon + (h - horizon) * t * t;
            ctx.moveTo(-h, ly);
            ctx.lineTo(h, ly);
        }
        for (var c = -2; c <= 2; c++) {
            ctx.moveTo(c * size * 0.08, horizon);
            ctx.lineTo(c * size * 0.3, h);
        }
        ctx.stroke();
        ctx.restore();
        drawSkinFrame(ctx, size, "#ff2ea6");
    },

    cyberpunk_horizon: function (ctx, size, time) {
        // Капітан порту: кашкет із якорем, борода, смугаста тільняшка
        var h = size / 2;
        ctx.fillStyle = "#3a9ad8";
        ctx.fillRect(-h, -h, size, size);
        // Тільняшка
        for (var i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#1a3a8a";
            ctx.fillRect(-h, h - size * 0.24 + i * size * 0.06, size, size * 0.06);
        }
        // Обличчя
        ctx.fillStyle = "#f0c090";
        ctx.fillRect(-size * 0.3, -size * 0.2, size * 0.6, size * 0.46);
        // Кашкет
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.36, -size * 0.42, size * 0.72, size * 0.18);
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(-size * 0.38, -size * 0.26, size * 0.76, size * 0.07);
        ctx.fillStyle = "#ffd24a";
        ctx.fillRect(-size * 0.02, -size * 0.4, size * 0.04, size * 0.12);
        ctx.fillRect(-size * 0.08, -size * 0.36, size * 0.16, size * 0.03);
        ctx.fillRect(-size * 0.08, -size * 0.3, size * 0.16, size * 0.03);
        // Очі (одне підморгує)
        var wink = (time % 3600) < 200;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-size * 0.2, -size * 0.1, size * 0.1, wink ? size * 0.03 : size * 0.08);
        ctx.fillRect(size * 0.1, -size * 0.1, size * 0.1, size * 0.08);
        // Біла борода й люлька
        ctx.fillStyle = "#e8e8e8";
        ctx.fillRect(-size * 0.32, size * 0.06, size * 0.64, size * 0.2);
        ctx.fillRect(-size * 0.22, size * 0.26, size * 0.44, size * 0.06);
        ctx.fillStyle = "#c86a6a";
        ctx.fillRect(-size * 0.1, size * 0.1, size * 0.2, size * 0.05);
        ctx.fillStyle = "#6a3a1a";
        ctx.fillRect(size * 0.1, size * 0.12, size * 0.2, size * 0.04);
        ctx.fillRect(size * 0.26, size * 0.04, size * 0.08, size * 0.1);
        var puff = (time * 0.0008) % 1;
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.7 * (1 - puff)).toFixed(3) + ")";
        ctx.fillRect(size * 0.28, size * 0.02 - puff * size * 0.2, size * 0.06, size * 0.06);
        drawSkinFrame(ctx, size, "#ffffff");
    },
    glitch_cube: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#f0c090";
        ctx.fillRect(-h, -h, size, size);
        // Бандана в горошок із вузлом
        ctx.fillStyle = "#d8203a";
        ctx.fillRect(-h, -h, size, size * 0.3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.3, -h + size * 0.06, size * 0.07, size * 0.07);
        ctx.fillRect(-size * 0.05, -h + size * 0.14, size * 0.07, size * 0.07);
        ctx.fillRect(size * 0.2, -h + size * 0.06, size * 0.07, size * 0.07);
        var flutter = Math.sin(time * 0.01) * size * 0.04;
        ctx.fillStyle = "#b01830";
        ctx.fillRect(h - size * 0.1, -h + size * 0.18, size * 0.14, size * 0.1 + flutter);
        ctx.fillRect(h - size * 0.02, -h + size * 0.24, size * 0.1, size * 0.14 - flutter);
        // Пов'язка на оці з ремінцем
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-h, -size * 0.14, size, size * 0.04);
        ctx.fillRect(size * 0.06, -size * 0.14, size * 0.22, size * 0.16);
        // Друге око підморгує
        var wink = (time % 3000) < 180;
        ctx.fillStyle = "#ffffff";
        if (wink) {
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-size * 0.28, -size * 0.06, size * 0.18, size * 0.04);
        } else {
            ctx.fillRect(-size * 0.28, -size * 0.12, size * 0.18, size * 0.14);
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-size * 0.2, -size * 0.08, size * 0.08, size * 0.08);
        }
        // Вуса та усмішка із золотим зубом
        ctx.fillStyle = "#5a2e10";
        ctx.fillRect(-size * 0.26, size * 0.1, size * 0.22, size * 0.07);
        ctx.fillRect(size * 0.04, size * 0.1, size * 0.22, size * 0.07);
        ctx.fillStyle = "#3a0a0a";
        ctx.fillRect(-size * 0.16, size * 0.22, size * 0.32, size * 0.1);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.12, size * 0.22, size * 0.08, size * 0.05);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(size * 0.02, size * 0.22, size * 0.08, size * 0.05);
        // Щетина
        ctx.fillStyle = "rgba(90, 46, 16, 0.35)";
        ctx.fillRect(-h + size * 0.06, size * 0.36, size * 0.88, size * 0.08);
        drawSkinFrame(ctx, size, "#ffb35c");
    },

    // Золотий Злиток: об'ємний злиток із гранями та відблиском, що пробігає
    gold_ingot: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#3a2600";
        ctx.fillRect(-h, -h, size, size);
        // Верхня грань
        ctx.fillStyle = "#fff2a0";
        ctx.beginPath();
        ctx.moveTo(-size * 0.28, -size * 0.26);
        ctx.lineTo(size * 0.28, -size * 0.26);
        ctx.lineTo(size * 0.4, -size * 0.06);
        ctx.lineTo(-size * 0.4, -size * 0.06);
        ctx.closePath();
        ctx.fill();
        // Передня грань
        var front = ctx.createLinearGradient(0, -size * 0.06, 0, size * 0.3);
        front.addColorStop(0, "#ffd700");
        front.addColorStop(1, "#c98a00");
        ctx.fillStyle = front;
        ctx.fillRect(-size * 0.4, -size * 0.06, size * 0.8, size * 0.36);
        ctx.fillStyle = "#a36a00";
        ctx.fillRect(-size * 0.4, size * 0.26, size * 0.8, size * 0.04);
        // Штамп
        ctx.strokeStyle = "#a36a00";
        ctx.lineWidth = Math.max(1, size * 0.025);
        ctx.strokeRect(-size * 0.2, size * 0.02, size * 0.4, size * 0.18);
        // Відблиск
        var glint = (time * 0.0009) % 1.6;
        if (glint < 1) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(-size * 0.4, -size * 0.26, size * 0.8, size * 0.56);
            ctx.clip();
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            var gx = -size * 0.5 + glint * size;
            ctx.beginPath();
            ctx.moveTo(gx, -size * 0.3);
            ctx.lineTo(gx + size * 0.1, -size * 0.3);
            ctx.lineTo(gx - size * 0.05, size * 0.32);
            ctx.lineTo(gx - size * 0.15, size * 0.32);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        var spark = Math.max(0, Math.sin(time * 0.005));
        ctx.fillStyle = "rgba(255, 255, 255, " + spark.toFixed(2) + ")";
        var ss = size * 0.035;
        ctx.fillRect(size * 0.26 - ss / 2, -size * 0.3 - ss * 1.5, ss, ss * 3);
        ctx.fillRect(size * 0.26 - ss * 1.5, -size * 0.3 - ss / 2, ss * 3, ss);
        drawSkinFrame(ctx, size, "#ffd700");
    },

    // Орбіта: планета з кільцем, навколо літає супутник
    orbit: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#08081c";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.36, -size * 0.34, size * 0.03, size * 0.03);
        ctx.fillRect(size * 0.3, size * 0.3, size * 0.03, size * 0.03);
        ctx.fillRect(size * 0.28, -size * 0.38, size * 0.02, size * 0.02);
        var moonAngle = time * 0.002;
        var moonX = Math.cos(moonAngle) * size * 0.36;
        var moonY = Math.sin(moonAngle) * size * 0.14;
        var moonBehind = Math.sin(moonAngle) < 0;
        function drawMoon() {
            ctx.fillStyle = "#cfd8ff";
            ctx.beginPath();
            ctx.arc(moonX, moonY, size * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.rotate(-0.35);
        ctx.strokeStyle = "#ffcc44";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        // Задня половина кільця
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.38, size * 0.11, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (moonBehind) {
            drawMoon();
        }
        var planet = ctx.createRadialGradient(-size * 0.06, -size * 0.06, size * 0.02, 0, 0, size * 0.22);
        planet.addColorStop(0, "#ffd08a");
        planet.addColorStop(1, "#ff6a00");
        ctx.fillStyle = planet;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.rotate(-0.35);
        ctx.strokeStyle = "#ffcc44";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        // Передня половина кільця
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.38, size * 0.11, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
        if (!moonBehind) {
            drawMoon();
        }
        drawSkinFrame(ctx, size, "#ff8c00");
    },

    // Дракон: лускатий зелений кубик із вогняними очима-щілинами та іклами
    stalagmite: function (ctx, size, time) {
        var h = size / 2;
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#2fa84f");
        body.addColorStop(1, "#0d3b1c");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        // Луска (обрізана межами кубика)
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, -h, size, size);
        ctx.clip();
        ctx.strokeStyle = "rgba(10, 40, 18, 0.55)";
        ctx.lineWidth = Math.max(1, size * 0.02);
        ctx.beginPath();
        var sc = size * 0.14;
        for (var ry = 0; ry < 3; ry++) {
            for (var rx = 0; rx < 4; rx++) {
                var cx = -h + sc / 2 + rx * sc * 2 + (ry % 2) * sc;
                var cy = -h + size * 0.12 + ry * sc;
                ctx.moveTo(cx + sc, cy);
                ctx.arc(cx, cy, sc, 0, Math.PI);
            }
        }
        ctx.stroke();
        ctx.restore();
        // Роги
        ctx.fillStyle = "#e8e0c0";
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -h);
        ctx.lineTo(-size * 0.3, -h + size * 0.2);
        ctx.lineTo(-size * 0.2, -h);
        ctx.moveTo(size * 0.4, -h);
        ctx.lineTo(size * 0.3, -h + size * 0.2);
        ctx.lineTo(size * 0.2, -h);
        ctx.fill();
        // Очі з вертикальною зіницею
        var glow = 0.75 + 0.25 * Math.sin(time * 0.005);
        ctx.fillStyle = "rgba(255, 210, 0, " + glow.toFixed(2) + ")";
        ctx.beginPath();
        ctx.moveTo(-size * 0.34, -size * 0.02);
        ctx.lineTo(-size * 0.08, size * 0.02);
        ctx.lineTo(-size * 0.1, size * 0.12);
        ctx.lineTo(-size * 0.32, size * 0.08);
        ctx.closePath();
        ctx.moveTo(size * 0.34, -size * 0.02);
        ctx.lineTo(size * 0.08, size * 0.02);
        ctx.lineTo(size * 0.1, size * 0.12);
        ctx.lineTo(size * 0.32, size * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1a0a00";
        ctx.fillRect(-size * 0.22, -size * 0.01, size * 0.04, size * 0.12);
        ctx.fillRect(size * 0.18, -size * 0.01, size * 0.04, size * 0.12);
        // Ніздрі та ікла
        ctx.fillRect(-size * 0.1, size * 0.2, size * 0.05, size * 0.04);
        ctx.fillRect(size * 0.05, size * 0.2, size * 0.05, size * 0.04);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.32);
        ctx.lineTo(-size * 0.22, size * 0.44);
        ctx.lineTo(-size * 0.14, size * 0.32);
        ctx.moveTo(size * 0.14, size * 0.32);
        ctx.lineTo(size * 0.22, size * 0.44);
        ctx.lineTo(size * 0.3, size * 0.32);
        ctx.fill();
        drawSkinFrame(ctx, size, "#7dff5a");
    },

    // Алмазна руда: піксельний кам'яний блок з алмазами, що виблискують
    equalizer: function (ctx, size, time) {
        var rows = [
            "sSssssSs",
            "ssCcsssS",
            "sCwcSsss",
            "ssCsssCs",
            "SssssCcs",
            "ssCssCwS",
            "sCcssSss",
            "sssSssss"
        ];
        drawPixelArt(ctx, size, rows, { s: "#8a8a8a", S: "#6f6f6f", c: "#33d6d0", C: "#1a9e9a", w: "#e8ffff" });
        // Відблиск на алмазах
        var p = size / 8;
        var sparkle = Math.max(0, Math.sin(time * 0.004));
        ctx.globalAlpha = sparkle * 0.9;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size / 2 + 2 * p, -size / 2 + 2 * p, p, p);
        ctx.globalAlpha = Math.max(0, Math.sin(time * 0.004 + 2)) * 0.9;
        ctx.fillRect(-size / 2 + 6 * p, -size / 2 + 5 * p, p, p);
        ctx.globalAlpha = 1;
        drawSkinFrame(ctx, size, "#7ff5f0");
    },

    // Лицарський щит: геральдичний щит із хрестом і левовою короною
    shield: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#1a1e2e";
        ctx.fillRect(-h, -h, size, size);
        // Форма щита
        function shieldPath() {
            ctx.beginPath();
            ctx.moveTo(-size * 0.34, -size * 0.36);
            ctx.lineTo(size * 0.34, -size * 0.36);
            ctx.lineTo(size * 0.34, size * 0.02);
            ctx.quadraticCurveTo(size * 0.3, size * 0.3, 0, size * 0.42);
            ctx.quadraticCurveTo(-size * 0.3, size * 0.3, -size * 0.34, size * 0.02);
            ctx.closePath();
        }
        ctx.save();
        shieldPath();
        ctx.clip();
        // Четвертини: синій і срібний
        ctx.fillStyle = "#2a5aff";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#d8dce8";
        ctx.fillRect(0, -h, h, size * 0.44);
        ctx.fillRect(-h, -size * 0.06, h, h + size * 0.06);
        // Золотий хрест
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-size * 0.05, -h, size * 0.1, size);
        ctx.fillRect(-h, -size * 0.1, size, size * 0.1);
        ctx.restore();
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        shieldPath();
        ctx.stroke();
        // Блиск по краю
        var glint = (time * 0.0008) % 1.5;
        if (glint < 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(-size * 0.34 + glint * size * 0.64, -size * 0.38, size * 0.06, size * 0.05);
        }
        drawSkinFrame(ctx, size, "#8fa3ff");
    },

    // === ГРУПА 3: СКЛАДНА ЛІГА ===

    // Льодовий блок: піксельний лід із відблиском, що пробігає по діагоналі
    plasma: function (ctx, size, time) {
        drawPixelArt(ctx, size, [
            "LlLLlLLL",
            "lLLwLLlL",
            "LLwLLLLl",
            "LlLLLlLL",
            "LLLlLLwL",
            "lLLLLwLL",
            "LLlLLLLl",
            "LLLLlLLL"
        ], { L: "#8fd3ff", l: "#6ab8f0", w: "#e6f7ff" });
        var h = size / 2;
        var t = ((time * 0.0005) % 1.6) - 0.3;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, -h, size, size);
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        var x = -h + t * size * 1.4;
        ctx.moveTo(x, -h);
        ctx.lineTo(x + size * 0.18, -h);
        ctx.lineTo(x - size * 0.6, h);
        ctx.lineTo(x - size * 0.78, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawSkinFrame(ctx, size, "#e6f7ff");
    },

    // Батискаф: жовтий підводний кубик з ілюмінатором і бульбашками
    vortex: function (ctx, size, time) {
        var h = size / 2;
        var hull = ctx.createLinearGradient(0, -h, 0, h);
        hull.addColorStop(0, "#ffd84a");
        hull.addColorStop(1, "#e59a00");
        ctx.fillStyle = hull;
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(-h, size * 0.3, size, size * 0.08);
        // Заклепки
        ctx.fillStyle = "#a36a00";
        var rv = size * 0.05;
        var positions = [[-0.38, -0.38], [0.33, -0.38], [-0.38, 0.18], [0.33, 0.18]];
        for (var i = 0; i < positions.length; i++) {
            ctx.fillRect(positions[i][0] * size, positions[i][1] * size, rv, rv);
        }
        // Ілюмінатор
        ctx.fillStyle = "#5c5c5c";
        ctx.beginPath();
        ctx.arc(0, -size * 0.04, size * 0.26, 0, Math.PI * 2);
        ctx.fill();
        var glass = ctx.createRadialGradient(-size * 0.06, -size * 0.1, size * 0.02, 0, -size * 0.04, size * 0.2);
        glass.addColorStop(0, "#9ff6ff");
        glass.addColorStop(1, "#0a6f8a");
        ctx.fillStyle = glass;
        ctx.beginPath();
        ctx.arc(0, -size * 0.04, size * 0.19, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(-size * 0.11, -size * 0.16, size * 0.06, size * 0.06);
        // Бульбашки піднімаються
        ctx.strokeStyle = "rgba(220, 250, 255, 0.85)";
        ctx.lineWidth = Math.max(1, size * 0.025);
        ctx.beginPath();
        for (var b = 0; b < 3; b++) {
            var phase = ((time * 0.0008) + b * 0.33) % 1;
            var bx = size * (0.28 + 0.06 * Math.sin(phase * 8 + b));
            var by = h * 0.6 - phase * size * 0.9;
            var br = size * (0.03 + b * 0.012);
            ctx.moveTo(bx + br, by);
            ctx.arc(bx, by, br, 0, Math.PI * 2);
        }
        ctx.stroke();
        drawSkinFrame(ctx, size, "#fff0a0");
    },

    quantum_barrier: function (ctx, size, time) {
        // Мумія з пустельної піраміди: бинти навскоси й зелені очі, що світяться
        var h = size / 2;
        ctx.fillStyle = "#c89a55";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#e8dcc0";
        ctx.fillRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8);
        // Бинти
        var bands = ["#d8ccb0", "#f4ecd8", "#c8bca0"];
        for (var i = 0; i < 7; i++) {
            ctx.fillStyle = bands[i % 3];
            ctx.fillRect(-size * 0.4, -size * 0.4 + i * size * 0.115, size * 0.8, size * 0.06);
        }
        ctx.fillStyle = "#b8ac90";
        ctx.fillRect(-size * 0.4, -size * 0.12, size * 0.34, size * 0.04);
        ctx.fillRect(size * 0.1, size * 0.18, size * 0.3, size * 0.04);
        // Щілина для очей
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(-size * 0.34, -size * 0.12, size * 0.68, size * 0.16);
        var glow = 0.6 + 0.4 * Math.sin(time * 0.005);
        ctx.fillStyle = "rgba(90, 255, 120, " + glow.toFixed(3) + ")";
        ctx.fillRect(-size * 0.24, -size * 0.08, size * 0.12, size * 0.08);
        ctx.fillRect(size * 0.12, -size * 0.08, size * 0.12, size * 0.08);
        // Бинт, що звисає й гойдається
        var sway = Math.sin(time * 0.004) * size * 0.04;
        ctx.fillStyle = "#e8dcc0";
        ctx.fillRect(size * 0.26 + sway, size * 0.3, size * 0.08, size * 0.18);
        drawSkinFrame(ctx, size, "#e8c07a");
    },
    meteor: function (ctx, size, time, player) {
        var h = size / 2;
        if (player && player.meteorTrail) {
            for (var t = player.meteorTrail.length - 1; t >= 0; t--) {
                var pt = player.meteorTrail[t];
                var ox = pt.x - player.x;
                var oy = -(pt.y - player.y);
                ctx.globalAlpha = pt.alpha * 0.35;
                ctx.fillStyle = "#ff4400";
                ctx.fillRect(-size * 0.35 + ox, -size * 0.35 + oy, size * 0.7, size * 0.7);
                ctx.globalAlpha = 1;
            }
        }
        // Вогняний хвіст ліворуч (напрям руху — праворуч)
        for (var f = 0; f < 4; f++) {
            var flick = Math.sin(time * 0.02 + f * 1.7) * size * 0.05;
            ctx.fillStyle = f % 2 === 0 ? "rgba(255, 120, 0, 0.8)" : "rgba(255, 220, 60, 0.8)";
            ctx.beginPath();
            var fy = -h + size * 0.15 + f * size * 0.22;
            ctx.moveTo(-h, fy - size * 0.08);
            ctx.lineTo(-h - size * (0.25 + (f % 2) * 0.12) + flick, fy);
            ctx.lineTo(-h, fy + size * 0.08);
            ctx.fill();
        }
        ctx.fillStyle = "#3a1a0a";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#26100a";
        ctx.beginPath();
        ctx.arc(-size * 0.2, -size * 0.18, size * 0.1, 0, Math.PI * 2);
        ctx.arc(size * 0.22, size * 0.2, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        var heat = 0.7 + 0.3 * Math.sin(time * 0.008);
        ctx.strokeStyle = "rgba(255, " + Math.round(120 + 80 * heat) + ", 0, " + heat.toFixed(2) + ")";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        ctx.beginPath();
        ctx.moveTo(-h, size * 0.05);
        ctx.lineTo(-size * 0.15, size * 0.02);
        ctx.lineTo(0, -size * 0.2);
        ctx.lineTo(size * 0.18, -size * 0.12);
        ctx.lineTo(h, -size * 0.3);
        ctx.moveTo(0, -size * 0.2);
        ctx.lineTo(size * 0.05, size * 0.2);
        ctx.lineTo(-size * 0.12, h);
        ctx.stroke();
        drawSkinFrame(ctx, size, "#ffaa44");
    },

    // === ГРУПА 4: ЛІГА МАЙСТРІВ ===

    // Галактика: спіральна галактика обертається, зорі мерехтять
    galaxy: function (ctx, size, time) {
        var h = size / 2;
        var bg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
        bg.addColorStop(0, "#2a0a5e");
        bg.addColorStop(1, "#06061a");
        ctx.fillStyle = bg;
        ctx.fillRect(-h, -h, size, size);
        var rot = time * 0.0008;
        for (var arm = 0; arm < 2; arm++) {
            for (var i = 1; i <= 10; i++) {
                var t = i / 10;
                var ang = rot + arm * Math.PI + t * Math.PI * 1.4;
                var r = t * size * 0.4;
                var ds = size * (0.07 - t * 0.04);
                ctx.fillStyle = i % 3 === 0 ? "#ff9ef5" : "#b9a6ff";
                ctx.globalAlpha = 1 - t * 0.6;
                ctx.fillRect(Math.cos(ang) * r - ds / 2, Math.sin(ang) * r * 0.75 - ds / 2, ds, ds);
            }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
        var stars = [[-0.36, -0.32, 0], [0.3, -0.36, 1.5], [0.34, 0.3, 3], [-0.32, 0.34, 4.5]];
        for (var s = 0; s < stars.length; s++) {
            ctx.globalAlpha = 0.4 + 0.6 * (Math.sin(time * 0.004 + stars[s][2]) * 0.5 + 0.5);
            ctx.fillRect(stars[s][0] * size, stars[s][1] * size, size * 0.035, size * 0.035);
        }
        ctx.globalAlpha = 1;
        drawSkinFrame(ctx, size, "#aa66ff");
    },

    // Корона Майстра: королівський оксамитовий кубик із золотою короною всередині
    master_crown: function (ctx, size, time) {
        var h = size / 2;
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#4b0f8a");
        body.addColorStop(1, "#1a0433");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        // Корона по центру: п'ять зубців із кульками, обідок і коштовності
        var baseBottom = size * 0.3;
        var rimTop = size * 0.12;
        var gold = ctx.createLinearGradient(0, -size * 0.34, 0, baseBottom);
        gold.addColorStop(0, "#fff2a0");
        gold.addColorStop(0.5, "#ffd700");
        gold.addColorStop(1, "#c98a00");
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.moveTo(-size * 0.36, baseBottom);
        ctx.lineTo(-size * 0.36, -size * 0.2);
        ctx.lineTo(-size * 0.22, -size * 0.02);
        ctx.lineTo(-size * 0.14, -size * 0.28);
        ctx.lineTo(-size * 0.06, -size * 0.04);
        ctx.lineTo(0, -size * 0.34);
        ctx.lineTo(size * 0.06, -size * 0.04);
        ctx.lineTo(size * 0.14, -size * 0.28);
        ctx.lineTo(size * 0.22, -size * 0.02);
        ctx.lineTo(size * 0.36, -size * 0.2);
        ctx.lineTo(size * 0.36, baseBottom);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#7a5200";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.stroke();
        // Обідок
        ctx.fillStyle = "#b37700";
        ctx.fillRect(-size * 0.36, rimTop, size * 0.72, size * 0.05);
        // Коштовності на обідку
        var shine = 0.7 + 0.3 * Math.sin(time * 0.006);
        ctx.globalAlpha = shine;
        ctx.fillStyle = "#ff2244";
        ctx.beginPath();
        ctx.arc(0, size * 0.22, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#33ccff";
        ctx.beginPath();
        ctx.arc(-size * 0.22, size * 0.22, size * 0.045, 0, Math.PI * 2);
        ctx.arc(size * 0.22, size * 0.22, size * 0.045, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Кульки на зубцях
        ctx.fillStyle = "#ffffff";
        var tips = [[-size * 0.36, -size * 0.2], [-size * 0.14, -size * 0.28], [0, -size * 0.34], [size * 0.14, -size * 0.28], [size * 0.36, -size * 0.2]];
        ctx.beginPath();
        for (var ti = 0; ti < tips.length; ti++) {
            ctx.moveTo(tips[ti][0] + size * 0.035, tips[ti][1]);
            ctx.arc(tips[ti][0], tips[ti][1], size * 0.035, 0, Math.PI * 2);
        }
        ctx.fill();
        drawSkinFrame(ctx, size, "#ffd700");
    },

    // === ГРУПА 5: ЛІГА БОСА ===

    // Лорд Демонів: магмовий демон — базальт із тріщинами лави, палаючі очі, ікла й роги
    demon_lord: function (ctx, size, time) {
        var h = size / 2;
        var pulse = 0.6 + 0.4 * Math.sin(time * 0.006);
        renderSkinGlow(ctx, size, "#ff2200", 10 + pulse * 10);
        // Роги з вогняним градієнтом
        var hornGrad = ctx.createLinearGradient(0, -h - size * 0.3, 0, -h);
        hornGrad.addColorStop(0, "#ffe14d");
        hornGrad.addColorStop(1, "#b30000");
        ctx.fillStyle = hornGrad;
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -h);
        ctx.lineTo(-size * 0.42, -h - size * 0.3);
        ctx.lineTo(-size * 0.18, -h);
        ctx.moveTo(size * 0.4, -h);
        ctx.lineTo(size * 0.42, -h - size * 0.3);
        ctx.lineTo(size * 0.18, -h);
        ctx.fill();
        ctx.fillStyle = "#1a0d0a";
        ctx.fillRect(-h, -h, size, size);
        // Тріщини лави
        ctx.strokeStyle = "rgba(255, " + Math.round(80 + 100 * pulse) + ", 0, " + (0.5 + 0.5 * pulse).toFixed(2) + ")";
        ctx.lineWidth = Math.max(1, size * 0.035);
        ctx.beginPath();
        ctx.moveTo(-h, -size * 0.3);
        ctx.lineTo(-size * 0.3, -size * 0.22);
        ctx.lineTo(-size * 0.36, -size * 0.36);
        ctx.moveTo(h, size * 0.1);
        ctx.lineTo(size * 0.32, size * 0.18);
        ctx.lineTo(size * 0.4, h);
        ctx.moveTo(-size * 0.2, h);
        ctx.lineTo(-size * 0.28, size * 0.3);
        ctx.stroke();
        // Злі палаючі очі
        ctx.fillStyle = "#ffea00";
        ctx.beginPath();
        ctx.moveTo(-size * 0.36, -size * 0.12);
        ctx.lineTo(-size * 0.06, -size * 0.02);
        ctx.lineTo(-size * 0.1, size * 0.08);
        ctx.lineTo(-size * 0.34, size * 0.02);
        ctx.closePath();
        ctx.moveTo(size * 0.36, -size * 0.12);
        ctx.lineTo(size * 0.06, -size * 0.02);
        ctx.lineTo(size * 0.1, size * 0.08);
        ctx.lineTo(size * 0.34, size * 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff2200";
        ctx.fillRect(-size * 0.2, -size * 0.04, size * 0.07, size * 0.08);
        ctx.fillRect(size * 0.13, -size * 0.04, size * 0.07, size * 0.08);
        // Паща з іклами
        ctx.fillStyle = "#4a0000";
        ctx.fillRect(-size * 0.26, size * 0.18, size * 0.52, size * 0.16);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-size * 0.24, size * 0.18);
        ctx.lineTo(-size * 0.17, size * 0.32);
        ctx.lineTo(-size * 0.1, size * 0.18);
        ctx.moveTo(size * 0.1, size * 0.18);
        ctx.lineTo(size * 0.17, size * 0.32);
        ctx.lineTo(size * 0.24, size * 0.18);
        ctx.fill();
        drawSkinFrame(ctx, size, "#ff1111");
    }
};

// Скіни з магазину малюються так само, як скіни рівнів
Object.assign(SKIN_RENDERERS, SHOP_SKIN_RENDERERS);
// Скіни нових рівнів Ліги 1
Object.assign(SKIN_RENDERERS, EXTRA_LEVEL_SKINS);

// ---------- Генерація фіксованої траси ----------

// Ліва половина розкладки ЙЦУКЕН (набирається лівою рукою), решта — правою
const LEFT_HAND_LETTERS = new Set([
    "Й","Ц","У","К","Е",
    "Ф","І","В","А","П",
    "Я","Ч","С","М","И"
]);

// Стовпець кожної літери на клавіатурі (для уникнення стрибків «вгору-вниз» одним пальцем)
const LETTER_COLUMN = {};
for (const key of KEYS) {
    LETTER_COLUMN[key.letter] = key.col;
}

// Ймовірність, що наступна літера буде з протилежного боку клавіатури
const HAND_SWITCH_CHANCE = 0.7;

function reactionTimeForLevel(levelId) {
    const t = (levelId - 1) / 30;
    return 1.2 - 0.7 * t;
}

function pickObstacleType(rng, lastTypes) {
    const roll = rng();
    let type;
    if (roll < 0.50) {
        type = "spike";
    } else if (roll < 0.80) {
        type = "double_spike";
    } else {
        type = "saw";
    }
    if (lastTypes.length >= 2 && lastTypes[0] === "saw" && lastTypes[1] === "saw" && type === "saw") {
        type = rng() < 0.5 ? "spike" : "double_spike";
    }
    return type;
}

// Час після приземлення, перш ніж наступний шип увійде в зону натискання
const LANDING_REACTION_TIME = 0.12;

// Максимальна відстань від центру шипа до точки приземлення після стрибка через нього.
// Зазвичай кубик приземляється на SAFE_MARGIN за правим краєм шипа, але мінімальна
// швидкість стрибка може зробити політ довшим.
function landingOffset(type, effectiveSpeed) {
    const halfW = spikeHalfWidth(type);
    const minFlight = effectiveSpeed * 2 * MIN_JUMP_VELOCITY / GRAVITY;
    return Math.max(halfW + SAFE_MARGIN, minFlight - halfW);
}

// Мінімальна відстань між центрами сусідніх шипів: кубик має приземлитися
// до того, як наступний шип увійде в зону «ОК», і ще встигнути помітити літеру
function minSpikeSpacing(prevType, nextType, effectiveSpeed, okPx) {
    return landingOffset(prevType, effectiveSpeed) +
        spikeHalfWidth(nextType) +
        okPx +
        effectiveSpeed * LANDING_REACTION_TIME;
}

function generateTrack(level, effectiveSpeed, okPx) {
    const rng = mulberry32(level.seed);
    const spikes = [];
    const moveSpeed = effectiveSpeed || level.speed;
    const windowPx = okPx || 0;

    function placeAt(candidateX, obstacleType) {
        if (spikes.length === 0) {
            return candidateX;
        }
        const prev = spikes[spikes.length - 1];
        return Math.max(candidateX, prev.x + minSpikeSpacing(prev.type, obstacleType, moveSpeed, windowPx));
    }
    // Нові рівні, вставлені всередину ліги, мають складність сусіднього (tuneAs)
    const baseGapTime = reactionTimeForLevel(level.tuneAs || level.id);
    let x = level.speed * 3.0;
    let lastLetter1 = null;
    const lastTypes = [];

    const leftPool = level.letters.filter(function (l) { return LEFT_HAND_LETTERS.has(l); });
    const rightPool = level.letters.filter(function (l) { return !LEFT_HAND_LETTERS.has(l); });
    const canAlternate = leftPool.length > 0 && rightPool.length > 0;

    // Вибір пулу: переважно чергуємо руки, щоб літери не йшли довгою серією з одного боку
    function choosePool() {
        if (!canAlternate || lastLetter1 === null) {
            return level.letters;
        }
        const lastWasLeft = LEFT_HAND_LETTERS.has(lastLetter1);
        // handSwitch у рівні: 1 — руки строго по черзі
        const switchHand = rng() < (typeof level.handSwitch === "number" ? level.handSwitch : HAND_SWITCH_CHANCE);
        if (lastWasLeft === switchHand) {
            return rightPool;
        }
        return leftPool;
    }

    // «Мішок» для кожного пулу: літери видаються без повторів, доки не вичерпаються всі,
    // тож кожна літера рівня гарантовано трапляється і тренується порівну
    const bags = new Map();

    function drawFromBag(pool) {
        let bag = bags.get(pool);
        if (!bag || bag.length === 0) {
            bag = pool.slice();
            bags.set(pool, bag);
        }
        // Спершу — літери з іншого стовпця, ніж попередня (не «одна під одною»),
        // потім — будь-яка інша літера, і лише в крайньому разі — та сама
        const lastColumn = lastLetter1 === null ? null : LETTER_COLUMN[lastLetter1];
        let candidates = [];
        // Рівень «стрибки між рядами»: наступна літера — з того самого стовпця, але з іншого ряду
        if (level.columnJumps && lastColumn !== null) {
            for (let i = 0; i < bag.length; i++) {
                if (bag[i] !== lastLetter1 && LETTER_COLUMN[bag[i]] === lastColumn) {
                    candidates.push(i);
                }
            }
            if (candidates.length > 0) {
                const pick = candidates[Math.floor(rng() * candidates.length)];
                return bag.splice(pick, 1)[0];
            }
        }
        for (let i = 0; i < bag.length; i++) {
            if (bag[i] !== lastLetter1 && LETTER_COLUMN[bag[i]] !== lastColumn) {
                candidates.push(i);
            }
        }
        if (candidates.length === 0) {
            for (let i = 0; i < bag.length; i++) {
                if (bag[i] !== lastLetter1) {
                    candidates.push(i);
                }
            }
        }
        if (candidates.length === 0) {
            for (let i = 0; i < bag.length; i++) {
                candidates.push(i);
            }
        }
        const idx = candidates[Math.floor(rng() * candidates.length)];
        return bag.splice(idx, 1)[0];
    }

    function pickLetter() {
        const letter = drawFromBag(choosePool());
        lastLetter1 = letter;
        return letter;
    }

    if (Array.isArray(level.words) && level.words.length > 0) {
        // Рівень-слова: шипи по черзі складають справжні слова; між словами — пауза
        const order = level.words.slice();
        let wordIdx = 0;
        let placed = 0;
        while (placed < level.spikeCount) {
            if (wordIdx % order.length === 0) {
                // Кожне коло слів — у новому випадковому порядку
                for (let i = order.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    const tmp = order[i];
                    order[i] = order[j];
                    order[j] = tmp;
                }
            }
            const word = order[wordIdx % order.length];
            for (let c = 0; c < word.length; c++) {
                const obstacleType = pickObstacleType(rng, lastTypes);
                lastTypes.push(obstacleType);
                if (lastTypes.length > 2) {
                    lastTypes.shift();
                }
                x = placeAt(x, obstacleType);
                spikes.push({
                    x: x,
                    letter: word[c],
                    state: "ahead",
                    type: obstacleType,
                    rotationAngle: 0,
                    word: word,
                    wordIdx: wordIdx,
                    charIdx: c,
                    combo: level.combo || null
                });
                placed++;
                x += level.speed * (baseGapTime + rng() * 0.35);
            }
            // Між словами — пауза; між короткими складами — трохи менша, щоб тримати ритм
            x += level.speed * (level.combo === "syllables" ? 0.5 : 0.7);
            wordIdx++;
        }
    } else if (level.rhythmGroups) {
        let placed = 0;
        while (placed < level.spikeCount) {
            const groupSize = Math.min(
                2 + Math.floor(rng() * 3),
                level.spikeCount - placed
            );
            for (let i = 0; i < groupSize; i++) {
                const obstacleType = pickObstacleType(rng, lastTypes);
                lastTypes.push(obstacleType);
                if (lastTypes.length > 2) {
                    lastTypes.shift();
                }
                x = placeAt(x, obstacleType);
                spikes.push({
                    x: x,
                    letter: pickLetter(),
                    state: "ahead",
                    type: obstacleType,
                    rotationAngle: 0
                });
                placed++;
                if (i < groupSize - 1) {
                    x += level.speed * 0.55;
                }
            }
            x += level.speed * (1.25 + rng() * 0.5);
        }
    } else {
        for (let i = 0; i < level.spikeCount; i++) {
            const obstacleType = pickObstacleType(rng, lastTypes);
            lastTypes.push(obstacleType);
            if (lastTypes.length > 2) {
                lastTypes.shift();
            }
            x = placeAt(x, obstacleType);
            spikes.push({
                x: x,
                letter: pickLetter(),
                state: "ahead",
                type: obstacleType,
                rotationAngle: 0
            });
            x += level.speed * (baseGapTime + rng() * 0.55);
        }
    }

    const finishX = spikes[spikes.length - 1].x + level.speed * 2.5;
    return { spikes: spikes, finishX: finishX };
}

// ---------- SaveManager ----------

const SAVE_KEY = "dfp_save_v1";

function defaultSaveData() {
    const levels = {};
    for (const level of ALL_LEVELS) {
        levels[String(level.id)] = { bestPct: 0, highScore: 0, perfect: null };
    }
    return {
        version: 1,
        settings: { difficulty: "EASY", hitWindow: "normal", speed: "normal", activeSkin: null, cameraMotion: true },
        progress: { unlocked: 1, unlockedSkins: [], levels: levels, letterStats: {} },
        // Кристали, куплені товари, надіте та вже виплачені разові бонуси рівнів
        shop: {
            crystals: 0,
            owned: [],
            equipped: { trail: DEFAULT_ITEMS.trail, explosion: DEFAULT_ITEMS.explosion, accessory: DEFAULT_ITEMS.accessory, weapon: DEFAULT_ITEMS.weapon },
            paid: {},
            // Ще не відкриті сундуки та скільки перемог поспіль минуло без сундука
            chests: [],
            winsWithoutChest: 0,
            // Сердечка — запасні життя з сундуків
            hearts: 0
        },
        // Відкриті досягнення й лічильники для них
        achievements: defaultAchievementData()
    };
}

function sanitizeSaveData(raw) {
    const clean = defaultSaveData();
    if (!raw || typeof raw !== "object" || raw.version !== 1) {
        return clean;
    }
    if (raw.settings && (raw.settings.difficulty === "EASY" || raw.settings.difficulty === "HARD")) {
        clean.settings.difficulty = raw.settings.difficulty;
    }
    if (raw.settings && (raw.settings.hitWindow === "normal" || raw.settings.hitWindow === "large")) {
        clean.settings.hitWindow = raw.settings.hitWindow;
    }
    if (raw.settings && (raw.settings.speed === "slow" || raw.settings.speed === "normal" || raw.settings.speed === "fast")) {
        clean.settings.speed = raw.settings.speed;
    }
    if (raw.settings && typeof raw.settings.cameraMotion === "boolean") {
        clean.settings.cameraMotion = raw.settings.cameraMotion;
    }
    if (raw.settings && typeof raw.settings.activeSkin === "string" && raw.settings.activeSkin.length > 0) {
        clean.settings.activeSkin = raw.settings.activeSkin;
    }
    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            // Невідомий рівень у збереженні — починаємо з першого
            clean.progress.unlocked = levelOrderIndex(Math.floor(unlocked)) >= 0 ? Math.floor(unlocked) : ALL_LEVELS[0].id;
        }
        if (raw.progress.letterStats && typeof raw.progress.letterStats === "object") {
            for (const letter of Object.keys(raw.progress.letterStats)) {
                const s = raw.progress.letterStats[letter];
                const ok = Number(s && s.ok);
                const miss = Number(s && s.miss);
                if (letter.length === 1 && Number.isFinite(ok) && Number.isFinite(miss) && ok >= 0 && miss >= 0) {
                    clean.progress.letterStats[letter] = { ok: Math.min(ok, 1000), miss: Math.min(miss, 1000) };
                }
            }
        }
        if (Array.isArray(raw.progress.unlockedSkins)) {
            clean.progress.unlockedSkins = raw.progress.unlockedSkins.filter(function (s) { return typeof s === "string"; });
        }
        if (raw.progress.levels && typeof raw.progress.levels === "object") {
            for (const level of ALL_LEVELS) {
                const key = String(level.id);
                const entry = raw.progress.levels[key];
                if (entry && typeof entry === "object") {
                    const pct = Number(entry.bestPct);
                    const score = Number(entry.highScore);
                    if (Number.isFinite(pct)) {
                        clean.progress.levels[key].bestPct = Math.min(100, Math.max(0, Math.round(pct)));
                    }
                    if (Number.isFinite(score)) {
                        clean.progress.levels[key].highScore = Math.max(0, Math.round(score));
                    }
                    if (entry.perfect === "easy" || entry.perfect === "hard") {
                        clean.progress.levels[key].perfect = entry.perfect;
                    }
                }
            }
        }
    }
    if (raw.shop && typeof raw.shop === "object") {
        const crystals = Number(raw.shop.crystals);
        if (Number.isFinite(crystals)) {
            clean.shop.crystals = Math.max(0, Math.floor(crystals));
        }
        if (Array.isArray(raw.shop.owned)) {
            clean.shop.owned = raw.shop.owned.filter(function (id, idx, arr) {
                const item = typeof id === "string" ? getShopItem(id) : null;
                return item && item.price > 0 && arr.indexOf(id) === idx;
            });
        }
        if (raw.shop.equipped && typeof raw.shop.equipped === "object") {
            for (const type of Object.keys(DEFAULT_ITEMS)) {
                const id = raw.shop.equipped[type];
                const item = typeof id === "string" ? getShopItem(id) : null;
                if (item && item.type === type && (item.price === 0 || clean.shop.owned.indexOf(id) !== -1)) {
                    clean.shop.equipped[type] = id;
                }
            }
        }
        if (raw.shop.paid && typeof raw.shop.paid === "object") {
            for (const level of ALL_LEVELS) {
                const entry = raw.shop.paid[String(level.id)];
                if (entry && typeof entry === "object") {
                    clean.shop.paid[String(level.id)] = { first: entry.first === true, silver: entry.silver === true, gold: entry.gold === true };
                }
            }
        }
        if (Array.isArray(raw.shop.chests)) {
            clean.shop.chests = raw.shop.chests.filter(function (c) { return typeof c === "string" && CHEST_TYPES[c]; }).slice(0, 50);
        }
        const hearts = Number(raw.shop.hearts);
        if (Number.isFinite(hearts)) {
            clean.shop.hearts = Math.max(0, Math.min(99, Math.floor(hearts)));
        }
        const wins = Number(raw.shop.winsWithoutChest);
        if (Number.isFinite(wins)) {
            clean.shop.winsWithoutChest = Math.max(0, Math.min(100, Math.floor(wins)));
        }
    }
    clean.achievements = sanitizeAchievementData(raw.achievements);
    return clean;
}

let saveData = null;

export const save = {
    load() {
        let raw = null;
        try {
            const text = localStorage.getItem(SAVE_KEY);
            if (text) {
                raw = JSON.parse(text);
            }
        } catch (err) {
            console.warn("Локальне сховище недоступне або пошкоджене — прогрес житиме лише в цьому сеансі.", err);
            raw = null;
        }
        saveData = sanitizeSaveData(raw);
        return {
            progress: saveData.progress,
            settings: saveData.settings
        };
    },

    persist() {
        if (!saveData) {
            saveData = defaultSaveData();
        }
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        } catch (err) {
            console.warn("Не вдалося записати прогрес у локальне сховище — він збережеться лише до закриття вкладки.", err);
        }
    },

    recordResult(levelId, pct, score, options) {
        if (!saveData) {
            this.load();
        }
        const key = String(levelId);
        const entry = saveData.progress.levels[key];
        if (!entry) {
            return;
        }
        const cleanPct = Math.min(100, Math.max(0, Math.round(pct)));
        const cleanScore = Math.max(0, Math.round(score));
        let skinUnlocked = null;
        let achievementUnlocked = null;
        if (cleanPct > entry.bestPct) {
            entry.bestPct = cleanPct;
        }
        if (cleanScore > entry.highScore) {
            entry.highScore = cleanScore;
        }
        if (cleanPct === 100 && options) {
            const currentPerfect = entry.perfect || null;
            const maxHard = Number(options.maxHard) || 0;
            const maxEasy = Number(options.maxEasy) || 0;
            const difficulty = options.difficulty || "EASY";
            if (maxHard > 0 && difficulty === "HARD" && cleanScore >= maxHard && currentPerfect !== "hard") {
                entry.perfect = "hard";
                achievementUnlocked = "hard";
            } else if (maxEasy > 0 && difficulty === "EASY" && cleanScore >= maxEasy && !currentPerfect) {
                entry.perfect = "easy";
                achievementUnlocked = "easy";
            }
        }
        if (cleanPct === 100) {
            // Відкриваємо наступний за порядком рівень (якщо він ще не відкритий)
            const next = nextLevelOf(levelId);
            if (next && levelOrderIndex(next.id) > levelOrderIndex(saveData.progress.unlocked)) {
                saveData.progress.unlocked = next.id;
            }
            const level = getLevelById(levelId);
            if (level && level.skin && !saveData.progress.unlockedSkins.includes(level.skin.id)) {
                saveData.progress.unlockedSkins.push(level.skin.id);
                skinUnlocked = level.skin;
            }
        }
        this.persist();
        const result = {};
        if (skinUnlocked) {
            result.skinUnlocked = skinUnlocked;
        }
        if (achievementUnlocked) {
            result.achievementUnlocked = achievementUnlocked;
        }
        return (result.skinUnlocked || result.achievementUnlocked) ? result : undefined;
    },

    setDifficulty(difficulty) {
        if (!saveData) {
            this.load();
        }
        if (difficulty === "EASY" || difficulty === "HARD") {
            saveData.settings.difficulty = difficulty;
            this.persist();
        }
    },

    getDifficulty() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.difficulty;
    },

    setHitWindow(size) {
        if (!saveData) {
            this.load();
        }
        if (size === "normal" || size === "large") {
            saveData.settings.hitWindow = size;
            this.persist();
        }
    },

    getHitWindow() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.hitWindow || "normal";
    },

    setSpeed(speed) {
        if (!saveData) {
            this.load();
        }
        if (speed === "slow" || speed === "normal" || speed === "fast") {
            saveData.settings.speed = speed;
            this.persist();
        }
    },

    getSpeed() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.speed || "normal";
    },

    // Рух камери: стеження за стрибком і струс при вибуху
    setCameraMotion(enabled) {
        if (!saveData) {
            this.load();
        }
        saveData.settings.cameraMotion = !!enabled;
        this.persist();
    },

    getCameraMotion() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.cameraMotion !== false;
    },

    getActiveSkin() {
        if (!saveData) {
            this.load();
        }
        // Скін, якого більше немає в грі, замінюємо стартовим
        const stored = saveData.settings.activeSkin;
        if (stored && !SKIN_RENDERERS[stored]) {
            return DEFAULT_SKIN;
        }
        // Магазинний скін, який не куплено (наприклад, після підробки збереження)
        const shopSkin = stored ? getShopSkinByRenderType(stored) : null;
        if (shopSkin && !this.isOwned(shopSkin.id)) {
            return DEFAULT_SKIN;
        }
        // Поки гравець нічого не вибрав, кубик носить стартовий скін (завжди відкритий)
        return saveData.settings.activeSkin || DEFAULT_SKIN;
    },

    setActiveSkin(skinId) {
        if (!saveData) {
            this.load();
        }
        saveData.settings.activeSkin = skinId || null;
        this.persist();
    },

    getProgress() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress;
    },

    getLastPlayable() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress.unlocked;
    },

    // Чи відкритий рівень: він не далі за найдальший відкритий у порядку проходження
    isLevelUnlocked(levelId) {
        if (!saveData) {
            this.load();
        }
        const idx = levelOrderIndex(levelId);
        return idx >= 0 && idx <= levelOrderIndex(saveData.progress.unlocked);
    },

    // ---------- Статистика літер (для тренування помилок) ----------

    // stats: { "Ж": { ok: 3, miss: 2 }, … } за один забіг
    recordLetterStats(stats) {
        if (!saveData) {
            this.load();
        }
        const all = saveData.progress.letterStats;
        for (const letter of Object.keys(stats)) {
            const cur = all[letter] || { ok: 0, miss: 0 };
            cur.ok += stats[letter].ok || 0;
            cur.miss += stats[letter].miss || 0;
            // Пам'ятаємо лише недавнє: коли спроб багато, старі поступово «забуваються»,
            // і вивчена літера перестає вважатися складною
            const total = cur.ok + cur.miss;
            if (total > LETTER_MEMORY) {
                const k = LETTER_MEMORY / total;
                cur.ok = Math.round(cur.ok * k * 10) / 10;
                cur.miss = Math.round(cur.miss * k * 10) / 10;
            }
            all[letter] = cur;
        }
        this.persist();
    },

    // Частка помилок на літері (зі згладжуванням, щоб одна помилка не робила літеру «найгіршою»)
    letterErrorRate(letter) {
        if (!saveData) {
            this.load();
        }
        const s = saveData.progress.letterStats[letter];
        if (!s) {
            return 0;
        }
        return (s.miss + 0.3) / (s.ok + s.miss + 3);
    },

    // Найскладніші літери з pool: ті, де помилок найбільше. null — якщо даних ще замало
    getWeakLetters(pool, count) {
        if (!saveData) {
            this.load();
        }
        const self = this;
        const stats = saveData.progress.letterStats;
        const known = pool.filter(function (l) {
            const s = stats[l];
            return s && s.ok + s.miss >= 3 && s.miss > 0;
        });
        if (known.length < 3) {
            return null;
        }
        known.sort(function (a, b) { return self.letterErrorRate(b) - self.letterErrorRate(a); });
        return known.slice(0, count);
    },

    // Звіт для налаштувань: до n найскладніших літер із відсотком помилок
    getLetterReport(n) {
        if (!saveData) {
            this.load();
        }
        const self = this;
        const stats = saveData.progress.letterStats;
        return Object.keys(stats)
            .filter(function (l) { return stats[l].ok + stats[l].miss >= 3 && stats[l].miss > 0; })
            .sort(function (a, b) { return self.letterErrorRate(b) - self.letterErrorRate(a); })
            .slice(0, n)
            .map(function (l) {
                const s = stats[l];
                return { letter: l, missPct: Math.round(100 * s.miss / (s.ok + s.miss)) };
            });
    },

    getLevelAchievement(levelId) {
        if (!saveData) {
            this.load();
        }
        const entry = saveData.progress.levels[String(levelId)];
        return (entry && entry.perfect) || null;
    },

    // ---------- Кристали й магазин ----------

    getCrystals() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.crystals;
    },

    addCrystals(amount) {
        if (!saveData) {
            this.load();
        }
        const n = Math.max(0, Math.floor(Number(amount) || 0));
        saveData.shop.crystals += n;
        this.persist();
        return saveData.shop.crystals;
    },

    isOwned(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        return !!item && (item.price === 0 || saveData.shop.owned.indexOf(itemId) !== -1);
    },

    // Купівля: true — куплено, false — не вистачає монет або товар уже є
    buyItem(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        if (!item || this.isOwned(itemId) || saveData.shop.crystals < item.price) {
            return false;
        }
        // Легендарний товар продається лише після виконання умови
        if (!this.getRequirementProgress(item).met) {
            return false;
        }
        saveData.shop.crystals -= item.price;
        saveData.shop.owned.push(itemId);
        this.persist();
        return true;
    },

    getEquipped(type) {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.equipped[type] || DEFAULT_ITEMS[type];
    },

    equipItem(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        if (!item || !this.isOwned(itemId)) {
            return false;
        }
        if (item.type === "skin") {
            // Скін одягається так само, як скіни рівнів
            saveData.settings.activeSkin = item.renderType;
        } else {
            saveData.shop.equipped[item.type] = itemId;
        }
        this.persist();
        return true;
    },

    // Разові бонуси рівня: перше проходження, срібна й золота рамки
    getPaid(levelId) {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.paid[String(levelId)] || { first: false, silver: false, gold: false };
    },

    markPaid(levelId, flags) {
        if (!saveData) {
            this.load();
        }
        const current = this.getPaid(levelId);
        saveData.shop.paid[String(levelId)] = {
            first: current.first || !!flags.first,
            silver: current.silver || !!flags.silver,
            gold: current.gold || !!flags.gold
        };
        this.persist();
    },

    // ---------- Сундуки ----------

    getPendingChests() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.chests.slice();
    },

    addChests(types) {
        if (!saveData) {
            this.load();
        }
        for (const type of types) {
            if (CHEST_TYPES[type]) {
                saveData.shop.chests.push(type);
            }
        }
        this.persist();
    },

    getWinsWithoutChest() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.winsWithoutChest || 0;
    },

    setWinsWithoutChest(n) {
        if (!saveData) {
            this.load();
        }
        saveData.shop.winsWithoutChest = Math.max(0, Math.floor(n) || 0);
        this.persist();
    },

    // Відкриває перший сундук у черзі: предмет одразу стає купленим, монети — на рахунок.
    // Повертає { type, result: { kind: "item", id } | { kind: "crystals", amount } } або null
    openNextChest() {
        if (!saveData) {
            this.load();
        }
        if (saveData.shop.chests.length === 0) {
            return null;
        }
        const type = saveData.shop.chests.shift();
        saveData.achievements.stats.chestsOpened++;
        const self = this;
        // Аксесуар може підвищити шанс, що з сундука випаде річ;
        // скін і аксесуар із бонусом «сердечка» — шанс сердечка
        const accPerk = accessoryPerk(this.getEquipped("accessory"));
        const itemBonus = accPerk.item || 0;
        const skin = activeSkinPerk(this.getActiveSkin());
        const heartBonus = (accPerk.hearts || 0) + (skin && skin.kind === "hearts" ? skin.value : 0);
        const result = rollChest(type, function (id) { return self.isOwned(id); }, undefined, itemBonus, heartBonus);
        if (result.kind === "item") {
            saveData.shop.owned.push(result.id);
        } else if (result.kind === "heart") {
            saveData.shop.hearts = Math.min(99, (saveData.shop.hearts || 0) + result.amount);
        } else {
            saveData.shop.crystals += result.amount;
        }
        this.persist();
        return { type: type, result: result };
    },

    // ---------- Сердечка (запасні життя) ----------

    getHearts() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.hearts || 0;
    },

    addHearts(n) {
        if (!saveData) {
            this.load();
        }
        saveData.shop.hearts = Math.max(0, Math.min(99, (saveData.shop.hearts || 0) + Math.floor(n)));
        this.persist();
    },

    // Витратити одне сердечко: true — вдалося
    useHeart() {
        if (!saveData) {
            this.load();
        }
        if ((saveData.shop.hearts || 0) <= 0) {
            return false;
        }
        saveData.shop.hearts--;
        this.persist();
        return true;
    },

    // Умова легендарного товару: { met, current, target, text }.
    // Для звичайних товарів умова завжди виконана.
    getRequirementProgress(item) {
        if (!saveData) {
            this.load();
        }
        const req = item && item.requirement;
        if (!req) {
            return { met: true, current: 0, target: 0, text: "" };
        }
        const levels = saveData.progress.levels;
        if (req.kind === "boss") {
            const boss = levels[String(BOSS_LEVEL_ID)];
            const done = !!boss && boss.bestPct === 100;
            return { met: done, current: done ? 1 : 0, target: 1, text: "Пройди Боса (5-1)" };
        }
        if (req.kind === "gold_count") {
            let golds = 0;
            for (const level of ALL_LEVELS) {
                const entry = levels[String(level.id)];
                if (entry && entry.perfect === "hard") {
                    golds++;
                }
            }
            return { met: golds >= req.target, current: Math.min(golds, req.target), target: req.target, text: "Золоті рамки" };
        }
        if (req.kind === "gold_league") {
            const leagueLevels = ALL_LEVELS.filter(function (l) { return l.leagueId === req.league; });
            let golds = 0;
            for (const level of leagueLevels) {
                const entry = levels[String(level.id)];
                if (entry && entry.perfect === "hard") {
                    golds++;
                }
            }
            return { met: golds >= leagueLevels.length, current: golds, target: leagueLevels.length, text: "Золото на всіх рівнях Ліги " + req.league };
        }
        if (req.kind === "clears") {
            // Скільки будь-яких рівнів пройдено до кінця
            let cleared = 0;
            for (const level of ALL_LEVELS) {
                const entry = levels[String(level.id)];
                if (entry && entry.bestPct === 100) {
                    cleared++;
                }
            }
            return { met: cleared >= req.target, current: Math.min(cleared, req.target), target: req.target, text: "Пройдені рівні" };
        }
        if (req.kind === "combo_levels") {
            // Усі рівні-комбінації (склади, перекати, печатки…)
            const comboLevels = ALL_LEVELS.filter(function (l) { return !!l.combo; });
            let done = 0;
            for (const level of comboLevels) {
                const entry = levels[String(level.id)];
                if (entry && entry.bestPct === 100) {
                    done++;
                }
            }
            return { met: done >= comboLevels.length, current: done, target: comboLevels.length, text: "Пройди всі рівні-комбінації" };
        }
        if (req.kind === "achievements") {
            const got = saveData.achievements.done.length;
            return { met: got >= req.target, current: Math.min(got, req.target), target: req.target, text: "Досягнення" };
        }
        return { met: false, current: 0, target: 1, text: "" };
    },

    // ---------- Досягнення ----------

    // Підсумок забігу для лічильників досягнень.
    // run: { hits, words, maxCombo, weaponHits, won, flawless, leagueId, eggTheme, exploded }
    recordRunForAchievements(run) {
        if (!saveData) {
            this.load();
        }
        const st = saveData.achievements.stats;
        st.letters += Math.max(0, Math.floor(run.hits) || 0);
        st.words += Math.max(0, Math.floor(run.words) || 0);
        st.bestCombo = Math.max(st.bestCombo, Math.floor(run.maxCombo) || 0);
        st.weaponHits += Math.max(0, Math.floor(run.weaponHits) || 0);
        const league = Math.floor(run.leagueId) || 0;
        if (run.won && run.flawless && league >= 1 && league <= 9 && st.flawlessLeagues.indexOf(league) === -1) {
            st.flawlessLeagues.push(league);
        }
        if (run.exploded) {
            st.explosions++;
        }
        if (run.eggTheme && EGG_BY_THEME[run.eggTheme] && st.eggs.indexOf(run.eggTheme) === -1) {
            st.eggs.push(run.eggTheme);
        }
        this.markPlayDay();
    },

    // Рахує різні дні, у які грали (не обов'язково поспіль)
    markPlayDay() {
        if (!saveData) {
            this.load();
        }
        const st = saveData.achievements.stats;
        const today = localDayKey();
        if (st.lastDay !== today) {
            st.lastDay = today;
            st.days++;
        }
        this.persist();
    },

    // Знімок усього, від чого залежать досягнення
    getAchievementSnapshot() {
        if (!saveData) {
            this.load();
        }
        const levels = saveData.progress.levels;
        const st = saveData.achievements.stats;
        const leagueDone = {};
        const leagueLeft = {};
        let clears = 0;
        let silvers = 0;
        let golds = 0;
        const themes = [];
        for (const level of ALL_LEVELS) {
            const entry = levels[String(level.id)];
            const cleared = !!entry && entry.bestPct === 100;
            if (cleared) {
                clears++;
            }
            if (entry && entry.perfect) {
                silvers++;
            }
            if (entry && entry.perfect === "hard") {
                golds++;
            }
            leagueLeft[level.leagueId] = (leagueLeft[level.leagueId] || 0) + (cleared ? 0 : 1);
            if (EGG_BY_THEME[level.bgTheme] && themes.indexOf(level.bgTheme) === -1) {
                themes.push(level.bgTheme);
            }
        }
        for (const id of Object.keys(leagueLeft)) {
            leagueDone[id] = leagueLeft[id] === 0;
        }
        const boss = levels[String(BOSS_LEVEL_ID)];
        let mastered = 0;
        for (const key of KEYS) {
            const s = saveData.progress.letterStats[key.letter];
            if (s && s.ok + s.miss >= 10 && s.miss / (s.ok + s.miss) < 0.1) {
                mastered++;
            }
        }
        let weapons = 0;
        let legendary = 0;
        let shopSkins = 0;
        for (const id of saveData.shop.owned) {
            const item = getShopItem(id);
            if (!item) {
                continue;
            }
            if (item.type === "weapon") {
                weapons++;
            }
            if (item.type === "skin") {
                shopSkins++;
            }
            if (item.legendary) {
                legendary++;
            }
        }
        return {
            clears: clears,
            leagueDone: leagueDone,
            bossDone: !!boss && boss.bestPct === 100,
            silvers: silvers,
            golds: golds,
            totalLevels: ALL_LEVELS.length,
            flawlessLeagues: st.flawlessLeagues.reduce(function (acc, id) { acc[id] = true; return acc; }, {}),
            bestCombo: st.bestCombo,
            letters: st.letters,
            words: st.words,
            masteredLetters: mastered,
            eggs: st.eggs.filter(function (t) { return themes.indexOf(t) !== -1; }).length,
            totalEggs: themes.length,
            itemsOwned: saveData.shop.owned.length,
            weaponsOwned: weapons,
            skins: saveData.progress.unlockedSkins.length + shopSkins,
            chestsOpened: st.chestsOpened,
            legendaryOwned: legendary,
            days: st.days,
            explosions: st.explosions,
            weaponHits: st.weaponHits
        };
    },

    // Відкриває всі виконані досягнення, кладе сундуки-нагороди в чергу.
    // Повертає масив щойно відкритих досягнень (порожній, якщо нових немає)
    checkAchievements() {
        if (!saveData) {
            this.load();
        }
        const snapshot = this.getAchievementSnapshot();
        const done = saveData.achievements.done;
        const fresh = [];
        for (const ach of ACHIEVEMENTS) {
            if (done.indexOf(ach.id) !== -1) {
                continue;
            }
            if (achievementProgress(ach, snapshot).done) {
                done.push(ach.id);
                if (CHEST_TYPES[ach.chest]) {
                    saveData.shop.chests.push(ach.chest);
                }
                fresh.push(ach);
            }
        }
        if (fresh.length > 0) {
            this.persist();
        }
        return fresh;
    },

    isAchievementDone(id) {
        if (!saveData) {
            this.load();
        }
        return saveData.achievements.done.indexOf(id) !== -1;
    },

    // Кристали задним числом за рівні, пройдені ще до появи магазину:
    // перше проходження, срібна й золота рамки. Кожен бонус видається один раз
    // (позначки в shop.paid), тож повторний виклик нічого не додає.
    grantRetroactive() {
        if (!saveData) {
            this.load();
        }
        let total = 0;
        let levelsCount = 0;
        for (const level of ALL_LEVELS) {
            const entry = saveData.progress.levels[String(level.id)];
            if (!entry || entry.bestPct !== 100) {
                continue;
            }
            const paid = this.getPaid(level.id);
            let add = 0;
            if (!paid.first) {
                add += FIRST_CLEAR_BONUS[level.leagueId] || 0;
            }
            if (entry.perfect && !paid.silver) {
                add += SILVER_BONUS;
            }
            if (entry.perfect === "hard" && !paid.gold) {
                add += GOLD_BONUS;
            }
            if (add > 0) {
                total += add;
                levelsCount++;
                saveData.shop.paid[String(level.id)] = {
                    first: true,
                    silver: paid.silver || !!entry.perfect,
                    gold: paid.gold || entry.perfect === "hard"
                };
            }
        }
        if (total > 0) {
            saveData.shop.crystals += total;
            this.persist();
        }
        return { total: total, levels: levelsCount };
    }
};

// ---------- Фізичні константи ----------

const GRAVITY = 2600;
const MIN_JUMP_VELOCITY = 420;
const SAFE_MARGIN = 25;
const CUBE_SIZE = 42;
const SPIKE_W = 44;
const SPIKE_H = 48;
const PLAYER_ANCHOR = 0.28;
const TRAIL_MAX = 20;
const DEATH_DELAY = 1.2;
const DEMO_RESTART_DELAY = 1.4;
const PERFECT_FLASH_TIME = 0.35;
const EASTER_EGG_DURATION = 5000;
const SHAKE_TIME = 0.45;
const TITLE_TIME = 2.6;
// Реакція світу на помилку гравця (на рівні боса — рев демона)
const OOPS_TIME = 0.7;
// Гравітаційна гармата притягує шип до точки на стільки розмірів кубика попереду нього
const GRAVITY_PULL_AHEAD = 1.6;
const FINISH_OPEN_DISTANCE = 300;

// Реакція світу на приземлення кубика
const LANDING_FX = {
    pixel_ocean: { kind: "bubbles", colors: ["rgba(200, 240, 255, 0.9)", "rgba(150, 220, 255, 0.8)"] },
    night_harbor: { kind: "splash", colors: ["#bfe8ff", "#ffffff"] },
    sea_fabricator: { kind: "sparks", colors: ["#39c6ff", "#ffffff", "#ff9a3d"] },
    pirate_bay: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    digital_forest: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    pixel_night: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    block_village: { kind: "splash", colors: ["#5ab84a", "#6a4a2a"] },
    jungle_temple: { kind: "splash", colors: ["#3aa04a", "#ff5a8a"] },
    dino_valley: { kind: "splash", colors: ["#2f8a3a", "#4fb55a"] },
    sky_citadel: { kind: "splash", colors: ["#ffffff", "#ffe8a0"] },
    luna_park: { kind: "sparks", colors: ["#ff3355", "#ffe14d", "#39c6ff", "#ff5ad8"] },
    pixel_snow: { kind: "splash", colors: ["#ffffff", "#e6f7ff"] },
    pixel_desert: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    stadium: { kind: "splash", colors: ["#2f8a3a", "#4fb55a"] },
    pixel_cave: { kind: "pebbles", colors: ["#6a6a78", "#4a4a55"] },
    crystal_cave: { kind: "pebbles", colors: ["#b35cff", "#5a4a70"] },
    dragon_lair: { kind: "pebbles", colors: ["#5a3a2a", "#3a2a1a"] },
    sunset_city: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff", "#ffe14d"] },
    neon_rooftops: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff", "#39ff88"] },
    neon_highway: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff"] },
    pixel_nether: { kind: "sparks", colors: ["#ff6a00", "#ffcc33"] },
    pumpkin_pastures: { kind: "splash", colors: ["#6a8a2a", "#ff9a3d"] },
    creeper_woods: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    redstone_mines: { kind: "pebbles", colors: ["#ff3a2a", "#4a4650"] },
    alien_freighter: { kind: "sparks", colors: ["#ffcc33", "#ffffff"] },
    hunter_jungle: { kind: "splash", colors: ["#2a7a22", "#4a3a1a"] },
    soggy_swamp: { kind: "splash", colors: ["#3a5a2a", "#8ad86a"] },
    dungeon_depths: { kind: "pebbles", colors: ["#4a4852", "#2a2830"] },
    alien_hive: { kind: "splash", colors: ["#78ffbe", "#2a443c"] },
    desert_temple: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    fiery_forge: { kind: "sparks", colors: ["#ff7a2a", "#ffcc33"] },
    planet_colony: { kind: "splash", colors: ["#b8703a", "#8a5a2a"] },
    hunter_ship: { kind: "sparks", colors: ["#5aff9a", "#ffffff"] },
    obsidian_peak: { kind: "pebbles", colors: ["#2a1a3a", "#b06bff"] },
    hive_queen: { kind: "splash", colors: ["#78ffbe", "#2a443c"] },
    hangar_bay: { kind: "sparks", colors: ["#ffcc33", "#ffffff"] },
    sponge_reef: { kind: "bubbles", colors: ["rgba(220, 245, 255, 0.9)", "rgba(170, 230, 255, 0.8)"] },
    kaiju_bay: { kind: "splash", colors: ["#9ad0ff", "#ffffff"] },
    strange_town: { kind: "pebbles", colors: ["#6a4a2a", "#ffcc5a"] },
    leaf_village: { kind: "fireflies", colors: ["#7aff5a", "#ffe14d"] },
    ninja_temple: { kind: "fireflies", colors: ["#ffb0d0", "#ffe0ec"] },
    machine_war: { kind: "sparks", colors: ["#ff3a2a", "#ffcc33"] }
};

function spikeHalfWidth(type) {
    if (type === "double_spike") {
        return SPIKE_W * 0.45 + SPIKE_W / 2;
    }
    if (type === "saw") {
        return SPIKE_H * 0.6;
    }
    return SPIKE_W / 2;
}

function hitWindowTimes(levelId) {
    const t = (levelId - 1) / 30;
    return {
        okTime: 0.45 - 0.17 * t,
        perfectTime: 0.16 - 0.06 * t
    };
}

// ---------- Нова система балів ----------

function calculateHitScore(isOkZone, config, isPerfect) {
    const base = isOkZone ? 100 : 80;
    const diffBonus = config.difficulty === "HARD" ? 50 : 0;
    const zoneBonus = config.hitWindow === "normal" ? 20 : 0;
    const speedBonus = config.speed === "fast" ? 40 : config.speed === "slow" ? -20 : 0;
    const perfectBonus = isPerfect ? 30 : 0;
    return Math.max(0, base + diffBonus + zoneBonus + speedBonus + perfectBonus);
}

function calculateMaxScores(spikeCount, hitWindow, speed) {
    const zoneBonus = hitWindow === "normal" ? 20 : 0;
    const speedBonus = speed === "fast" ? 40 : speed === "slow" ? -20 : 0;
    const easyPerHit = 100 + 0 + zoneBonus + speedBonus + 30;
    const hardPerHit = 100 + 50 + zoneBonus + speedBonus + 30;
    return {
        maxEasy: spikeCount * Math.max(0, easyPerHit),
        maxHard: spikeCount * Math.max(0, hardPerHit)
    };
}

// ---------- Стиль перешкод під світ рівня ----------

// Вигляд шипів змінюється під тему фону; розміри й зона зіткнення — ті самі
const SPIKE_STYLE_BY_THEME = {
    pixel_snow: "ice",
    pixel_desert: "cactus",
    pixel_ocean: "urchin",
    night_harbor: "urchin",
    pirate_bay: "urchin",
    knight_castle: "iron",
    sky_citadel: "iron",
    treasury: "iron",
    crystal_cave: "crystal",
    pixel_cave: "crystal",
    pixel_islands: "crystal",
    pixel_nether: "lava",
    dragon_lair: "lava",
    pixel_night: "pixel",
    digital_forest: "pixel",
    dino_valley: "pixel",
    block_village: "pixel",
    pumpkin_pastures: "pixel",
    creeper_woods: "pixel",
    hunter_jungle: "pixel",
    redstone_mines: "crystal",
    alien_freighter: "iron",
    dungeon_depths: "iron",
    soggy_swamp: "urchin",
    alien_hive: "urchin",
    desert_temple: "cactus",
    fiery_forge: "lava",
    planet_colony: "iron",
    hunter_ship: "crystal",
    obsidian_peak: "crystal",
    hive_queen: "urchin",
    hangar_bay: "iron",
    sponge_reef: "urchin",
    kaiju_bay: "crystal",
    strange_town: "iron",
    leaf_village: "iron",
    ninja_temple: "iron",
    machine_war: "iron"
};

// Основні кольори кожного стилю (для уламків, коли шип розсипається)
const SPIKE_STYLE_COLORS = {
    ice: ["#bfe9ff", "#ffffff", "#7cc8f0"],
    cactus: ["#2f8a3a", "#4fb55a", "#ffffff"],
    urchin: ["#6a2a8a", "#b06bff", "#e0c0ff"],
    iron: ["#6a7080", "#b8c0d0", "#40444f"],
    crystal: ["#b35cff", "#5cc8ff", "#e6bfff"],
    lava: ["#ff6a00", "#ffcc33", "#3a1a0a"],
    pixel: ["#ff2ea6", "#ffffff", "#4a1030"]
};

const SPIKE_POP_DISTANCE = 140;
const SPIKE_CRUMBLE_TIME = 0.35;
// Скільки останніх спроб на літеру пам'ятає статистика помилок
const LETTER_MEMORY = 40;
// Бонус монет за слово без жодної помилки
const WORD_BONUS = 2;
// Бонус за комбінацію (склад, перекат, повтор) без жодної помилки
const COMBO_BONUS = 1;
const KEYCAP_SIZE = 34;

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Один шип заданого стилю: основа в (0, 0), вершина в (0, -SPIKE_H)
function drawStyledSpikeShape(ctx, style, accent, time) {
    const hw = SPIKE_W / 2;
    const H = SPIKE_H;
    if (style === "ice") {
        ctx.fillStyle = "#7cc8f0";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#bfe9ff";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-3, -H + 6, 3, 12);
        ctx.strokeStyle = "#e6f7ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.stroke();
    } else if (style === "cactus") {
        ctx.fillStyle = "#2f8a3a";
        ctx.fillRect(-7, -H, 14, H);
        ctx.fillRect(-18, -H * 0.6, 7, H * 0.35);
        ctx.fillRect(-18, -H * 0.3, 14, 7);
        ctx.fillRect(11, -H * 0.8, 7, H * 0.4);
        ctx.fillRect(4, -H * 0.45, 14, 7);
        ctx.fillStyle = "#4fb55a";
        ctx.fillRect(-4, -H, 3, H);
        ctx.fillStyle = "#ffffff";
        const spines = [[-9, -H * 0.8], [9, -H * 0.65], [-9, -H * 0.4], [9, -H * 0.2], [-20, -H * 0.5], [20, -H * 0.7], [0, -H - 3]];
        for (const sp of spines) {
            ctx.fillRect(sp[0] - 1, sp[1] - 1, 3, 3);
        }
        ctx.strokeStyle = "#1a5a24";
        ctx.lineWidth = 2;
        ctx.strokeRect(-7, -H, 14, H);
    } else if (style === "urchin") {
        const r = 15;
        ctx.strokeStyle = "#e0c0ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            const len = i % 2 === 0 ? H - r : H * 0.6 - r;
            ctx.moveTo(Math.cos(a) * r, -r + Math.sin(a) * r);
            ctx.lineTo(Math.cos(a) * (r + len), -r + Math.sin(a) * (r + len));
        }
        ctx.stroke();
        ctx.fillStyle = "#6a2a8a";
        ctx.beginPath();
        ctx.arc(0, -r, r, Math.PI, 0);
        ctx.lineTo(r, 0);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b06bff";
        ctx.fillRect(-6, -r - 6, 4, 4);
        ctx.fillRect(3, -r - 2, 3, 3);
    } else if (style === "iron") {
        ctx.fillStyle = "#40444f";
        ctx.fillRect(-hw, -5, SPIKE_W, 5);
        ctx.fillStyle = "#6a7080";
        ctx.beginPath();
        ctx.moveTo(-hw + 6, -5);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw - 6, -5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b8c0d0";
        ctx.beginPath();
        ctx.moveTo(-hw + 6, -5);
        ctx.lineTo(0, -H);
        ctx.lineTo(-3, -5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d8dce8";
        ctx.fillRect(-hw + 3, -4, 3, 3);
        ctx.fillRect(hw - 6, -4, 3, 3);
    } else if (style === "crystal") {
        const shards = [[-10, 0.7, "#5cc8ff", "#c8f0ff"], [8, 0.8, "#ff4fd8", "#ffc0f0"], [0, 1, "#b35cff", "#e6bfff"]];
        for (const sh of shards) {
            const h = H * sh[1];
            ctx.fillStyle = sh[2];
            ctx.beginPath();
            ctx.moveTo(sh[0] - 8, 0);
            ctx.lineTo(sh[0] - 6, -h * 0.75);
            ctx.lineTo(sh[0], -h);
            ctx.lineTo(sh[0] + 6, -h * 0.75);
            ctx.lineTo(sh[0] + 8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = sh[3];
            ctx.beginPath();
            ctx.moveTo(sh[0] - 6, -h * 0.75);
            ctx.lineTo(sh[0], -h);
            ctx.lineTo(sh[0] - 1, -h * 0.2);
            ctx.closePath();
            ctx.fill();
        }
    } else if (style === "lava") {
        const glow = 0.6 + 0.4 * Math.sin(time * 0.006);
        ctx.fillStyle = "#2a120a";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, " + Math.round(110 + 90 * glow) + ", 0, " + glow.toFixed(2) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -H + 4);
        ctx.lineTo(-4, -H * 0.6);
        ctx.lineTo(3, -H * 0.4);
        ctx.lineTo(-6, 0);
        ctx.moveTo(-4, -H * 0.6);
        ctx.lineTo(-12, -H * 0.25);
        ctx.moveTo(3, -H * 0.4);
        ctx.lineTo(12, -H * 0.15);
        ctx.stroke();
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-2, -H, 4, 5);
    } else if (style === "pixel") {
        const b = 8;
        for (let row = 0; row < 6; row++) {
            const w = SPIKE_W - row * b * 0.9;
            ctx.fillStyle = row % 2 === 0 ? "#4a1030" : "#5a1438";
            ctx.fillRect(-w / 2, -(row + 1) * b, w, b);
        }
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let row = 0; row < 6; row++) {
            const w = SPIKE_W - row * b * 0.9;
            ctx.moveTo(-w / 2, -row * b);
            ctx.lineTo(-w / 2, -(row + 1) * b);
            ctx.lineTo(-w / 2 + b * 0.45, -(row + 1) * b);
            ctx.moveTo(w / 2, -row * b);
            ctx.lineTo(w / 2, -(row + 1) * b);
            ctx.lineTo(w / 2 - b * 0.45, -(row + 1) * b);
        }
        ctx.stroke();
    }
}

// Клавіша з літерою над перешкодою — як на справжній клавіатурі
function drawKeycap(ctx, cx, bottomY, letter, state) {
    const s = KEYCAP_SIZE;
    const x = cx - s / 2;
    const y = bottomY - s;
    const depth = 5;
    const colors = {
        idle: { top: "#2a2f45", side: "#141726", border: "rgba(160, 170, 210, 0.55)", text: "#e8ecf8" },
        target: { top: "#3a3f5c", side: "#1a1d30", border: "#ffe14d", text: "#ffe14d" },
        ok: { top: "#123a44", side: "#08222a", border: "#00f6ff", text: "#ffffff" },
        perfect: { top: "#12442a", side: "#082a18", border: "#39ff88", text: "#ffffff" }
    }[state];
    ctx.fillStyle = colors.side;
    roundedRectPath(ctx, x, y + depth, s, s, 6);
    ctx.fill();
    ctx.fillStyle = colors.top;
    roundedRectPath(ctx, x, y, s, s, 6);
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = state === "idle" ? 1.5 : 2.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    roundedRectPath(ctx, x + 3, y + 3, s - 6, s * 0.35, 4);
    ctx.fill();
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(5, 5, 20, 0.85)";
    ctx.strokeText(letter, cx, y + s / 2 + 1);
    ctx.fillStyle = colors.text;
    ctx.fillText(letter, cx, y + s / 2 + 1);
}

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

// ---------- Клас Engine ----------

export class Engine {
    constructor(levelId, difficulty, demoMode, hitWindow, speed, leagueInfo) {
        const SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 };
        this.level = { ...getLevelById(levelId) };
        // Тренування помилок: літери рівня — ті, на яких гравець помиляється найчастіше
        // (поки даних замало — звичайні літери рівня)
        if (this.level.adaptive) {
            const weak = save.getWeakLetters(this.level.adaptive.pool, this.level.adaptive.count);
            if (weak) {
                this.level.letters = weak;
            }
            this.adaptiveFromStats = !!weak;
        }
        this.effectiveSpeed = this.level.speed * (SPEED_MULTIPLIERS[speed] ?? 1.0);
        // Бонуси з магазину (лише в справжній грі): шлейф сповільнює трасу, вибух розширює зону стрибка
        const trailSlow = demoMode ? 0 : trailSlowdown(save.getEquipped("trail"));
        const windowBonus = demoMode ? 0 : explosionWindowBonus(save.getEquipped("explosion"));
        this.effectiveSpeed *= 1 - trailSlow;
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;
        this.leagueInfo = leagueInfo || null;
        this.hitWindowSetting = hitWindow === "large" ? "large" : "normal";
        this.speedSetting = speed === "slow" || speed === "fast" ? speed : "normal";

        this.onJump = null;
        // Звук зброї: onSound(cue) з WEAPON_SOUNDS (у демо в меню не призначається — тиша)
        this.onSound = null;
        this.onExplode = null;
        this.onVictory = null;
        this.currentTime = 0;

        const windows = hitWindowTimes(this.level.tuneAs || this.level.id);
        const multiplier = (this.hitWindowSetting === "large" ? 2 : 1) * (1 + windowBonus);
        this.okPx = this.effectiveSpeed * windows.okTime * multiplier;
        this.perfectPx = this.effectiveSpeed * windows.perfectTime * multiplier;
        // Бонус скіна з магазину: серії, слова, ширша зона «Ідеально» або щит
        const perkInfo = demoMode ? null : activeSkinPerk(save.getActiveSkin());
        this.skinPerk = perkInfo ? perkInfo.kind : null;
        this.skinPerkValue = perkInfo ? perkInfo.value : 0;
        if (this.skinPerk === "perfect") {
            this.perfectPx = Math.min(this.okPx * 0.9, this.perfectPx * (1 + this.skinPerkValue));
        }
        this.shieldReady = this.skinPerk === "shield";
        this.shieldFlash = 0;
        // Пропозиція сердечка: гра на паузі, доки гравець не вирішить
        this.onReviveOffer = null;
        this.pendingRevive = null;
        this.paused = false;
        this.pauseStart = null;
        this.pausedTotal = 0;
        this.heartFlash = 0;

        this.cameraMotion = save.getCameraMotion();

        this.scoreConfig = {
            difficulty: this.difficulty,
            hitWindow: this.hitWindowSetting,
            speed: this.speedSetting
        };

        const maxScores = calculateMaxScores(this.level.spikeCount, this.hitWindowSetting, this.speedSetting);
        this.maxEasy = maxScores.maxEasy;
        this.maxHard = maxScores.maxHard;

        this.bgCache = new BackgroundCache();

        this.reset();
    }

    reset() {
        BackgroundRenderer.reset();
        this.bgCache.reset();
        const track = generateTrack(this.level, this.effectiveSpeed, this.okPx);
        this.spikes = track.spikes;
        this.finishX = track.finishX;

        this.player = {
            x: 0,
            y: 0,
            vy: 0,
            onGround: true,
            rotation: 0,
            alive: true,
            trail: [],
            meteorTrail: [],
            goldTrail: []
        };

        this.progressPct = 0;
        this.score = 0;
        this.combo = 0;
        this.particles = [];
        this.perfectParticles = [];
        this.perfectPopups = [];
        this.waves = [];
        this.ripples = [];
        this.pulse = 0;
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        this.jumpBuffer = null;
        // Уламки вибуху та пил приземлення (квадратні «блоки»)
        this.debris = [];
        this.perfectFlash = 0;
        this.scorePopups = [];
        this.spikeStyle = SPIKE_STYLE_BY_THEME[this.level.bgTheme] || "neon";
        // Пасхалка: з'являється один раз, коли гравець пройде випадкову частину рівня (30–70%)
        this.eggAt = 0.3 + mulberry32(this.level.seed + 7)() * 0.4;
        this.eggStart = null;
        this.weather = BackgroundRenderer.pickWeather(this.level.bgTheme);
        this.shakeTime = 0;
        this.oopsTime = 0;
        this.elapsed = 0;
        // Кристали за цей забіг (без множника налаштувань) і ефект вибуху з магазину
        // Статистика літер цього забігу (влучання й помилки) — для тренування помилок
        this.letterStats = {};
        this.runWords = 0;
        this.runCombos = 0;
        this.runHits = 0;
        this.runPerfect = 0;
        this.runSeries = 0;
        // Для досягнень: найдовша серія «Ідеально» та шипи, знищені зброєю
        this.runMaxCombo = 0;
        this.runWeaponHits = 0;
        this.boom = null;
        // Зброя з магазину: замість стрибка кубик знищує шип
        this.weaponId = save.getEquipped("weapon");
        this.weaponSpec = getWeaponSpec(this.weaponId);
        this.attacks = [];
        this.shots = [];
        this.stuckArrows = [];
        this.weaponRecoil = 0;
    }

    // Тип скіна, яким зараз малюється кубик (вибраний гравцем або скін рівня)
    getSkinRenderType() {
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            return activeSkinId;
        }
        if (this.level.skin && SKIN_RENDERERS[this.level.skin.renderType]) {
            return this.level.skin.renderType;
        }
        return "neon_base";
    }

    // Шип подолано: він розсипається на уламки, над ним спливають зароблені очки
    markSpikeCleared(spike, points) {
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        this.spawnDebris(10, {
            x: spike.x,
            y: SPIKE_H * 0.4,
            spread: SPIKE_W * 0.6,
            angleMin: Math.PI * 0.1,
            angleMax: Math.PI * 0.9,
            speedMin: 90,
            speedMax: 220,
            sizeMin: 4,
            sizeMax: 8,
            spin: 10,
            colors: colors,
            gravity: 700,
            life: 0.7,
            outline: true
        });
        if (points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 50, text: "+" + points, life: 0.9, maxLife: 0.9 });
        }
    }

    // Світ відповідає на приземлення: бульбашки, світлячки, сніг, пісок, камінці, іскри
    spawnLandingReaction() {
        const fx = LANDING_FX[this.level.bgTheme];
        if (!fx) {
            return;
        }
        const base = { x: this.player.x, spin: 3, outline: false, colors: fx.colors };
        if (fx.kind === "bubbles") {
            this.spawnDebris(6, Object.assign(base, { y: 6, spread: CUBE_SIZE, angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 80, sizeMin: 3, sizeMax: 6, gravity: -160, life: 1.1 }));
        } else if (fx.kind === "fireflies") {
            this.spawnDebris(5, Object.assign(base, { y: 8, spread: CUBE_SIZE * 2, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 20, speedMax: 60, sizeMin: 3, sizeMax: 4, gravity: -40, life: 1.4 }));
        } else if (fx.kind === "splash") {
            this.spawnDebris(10, Object.assign(base, { y: 3, spread: CUBE_SIZE, angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 60, speedMax: 170, sizeMin: 3, sizeMax: 5, gravity: 400, life: 0.6 }));
        } else if (fx.kind === "pebbles") {
            this.spawnDebris(4, Object.assign(base, { x: this.player.x + 60, y: 380, spread: 260, angleMin: -Math.PI * 0.55, angleMax: -Math.PI * 0.45, speedMin: 10, speedMax: 40, sizeMin: 4, sizeMax: 7, gravity: 900, life: 1.2, outline: true }));
        } else if (fx.kind === "sparks") {
            this.spawnDebris(7, Object.assign(base, { y: 4, spread: CUBE_SIZE, angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 220, sizeMin: 2, sizeMax: 4, gravity: 500, life: 0.5 }));
        }
    }

    spawnDebris(count, options) {
        for (var i = 0; i < count; i++) {
            var angle = options.angleMin + Math.random() * (options.angleMax - options.angleMin);
            var speed = options.speedMin + Math.random() * (options.speedMax - options.speedMin);
            this.debris.push({
                x: options.x + (Math.random() - 0.5) * options.spread,
                y: options.y + (Math.random() - 0.5) * options.spread,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * options.spin,
                size: options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin),
                color: options.colors[Math.floor(Math.random() * options.colors.length)],
                gravity: options.gravity,
                life: options.life,
                maxLife: options.life,
                outline: options.outline
            });
        }
        if (this.debris.length > 80) {
            this.debris.splice(0, this.debris.length - 80);
        }
    }

    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x - spikeHalfWidth(spike.type) + 0.01 >= this.player.x) {
                return spike;
            }
        }
        return null;
    }

    getTargetLetter() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.letter : null;
    }

    getObstacleType() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.type : null;
    }

    getState() {
        return {
            levelId: this.level.id,
            progressPct: this.progressPct,
            score: this.score,
            combo: this.combo,
            runHits: this.runHits,
            runWords: this.runWords,
            runCombos: this.runCombos,
            wordsMult: this.wordsMult(),
            runPerfect: this.runPerfect,
            runSeries: this.runSeries,
            runMaxCombo: this.runMaxCombo,
            runWeaponHits: this.runWeaponHits,
            // Пасхалку зараховуємо, якщо її показували хоча б секунду
            eggSeen: this.eggStart !== null && this.currentTime - this.eggStart >= 1000,
            bgTheme: this.level.bgTheme,
            weapon: !!this.weaponSpec,
            weaponId: this.weaponSpec ? this.weaponId : null,
            alive: this.player.alive,
            maxEasy: this.maxEasy,
            maxHard: this.maxHard,
            difficulty: this.difficulty
        };
    }

    getOutcome() {
        return this.outcome;
    }

    consumeJumpBuffer() {
        if (this.jumpBuffer === null) {
            return;
        }
        const spike = this.jumpBuffer;
        this.jumpBuffer = null;
        if (spike.state !== "ahead") {
            return;
        }
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        if (gap > 0 && gap <= this.okPx) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
        }
    }

    jump(distance, perfect) {
        const computedVy = GRAVITY * distance / (2 * this.effectiveSpeed);
        this.player.vy = computedVy > MIN_JUMP_VELOCITY ? computedVy : MIN_JUMP_VELOCITY;
        this.player.onGround = false;
        this.registerHit(perfect);
    }

    // Успішна дія (стрибок або удар зброєю): серія, монети, «Ідеально», звук
    registerHit(perfect) {
        this.pulse = 1;
        if (!this.demoMode) {
            // Кристал за кожен подоланий шип; «Ідеально» — ще +1 і бонус за серію
            this.runHits++;
            if (this.weaponSpec) {
                this.runWeaponHits++;
            }
            let gain = 1;
            let bonus = 0;
            if (perfect) {
                this.runPerfect++;
                bonus = seriesBonus(this.combo + 1);
                if (bonus > 0 && this.skinPerk === "series") {
                    bonus = Math.round(bonus * this.skinPerkValue);
                }
                this.runSeries += bonus;
                gain += 1 + bonus;
            }
            this.scorePopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE * 2.4,
                text: bonus > 0 ? "Серія ×" + (this.combo + 1) + "! +" + gain : "+" + gain,
                life: bonus > 0 ? 1.4 : 0.8,
                maxLife: bonus > 0 ? 1.4 : 0.8,
                crystal: true
            });
        }
        if (perfect) {
            this.combo++;
            if (this.combo > this.runMaxCombo) {
                this.runMaxCombo = this.combo;
            }
            const count = 8 + Math.floor(Math.random() * 5);
            const isHard = this.difficulty === "HARD";
            const silverColors = ["#f0f4ff", "#c8d0e0", "#e8ecf2", "#d4dce8", "#88aacc"];
            const goldColors = ["#ffd700", "#ffaa00", "#ffe14d", "#ff8c00", "#ffcc44"];
            const palette = isHard ? goldColors : silverColors;
            for (var pi = 0; pi < count; pi++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = 40 + Math.random() * 120;
                this.perfectParticles.push({
                    x: this.player.x,
                    y: this.player.y + CUBE_SIZE / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.2,
                    maxLife: 1.2,
                    size: 2 + Math.random() * 3,
                    color: palette[Math.floor(Math.random() * palette.length)]
                });
            }
            this.perfectPopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE,
                life: 1.5,
                maxLife: 1.5
            });
            this.perfectFlash = PERFECT_FLASH_TIME;
        } else {
            this.combo = 0;
        }
        this.waves.push({ r: 10, alpha: 0.8 });
        // Зі зброєю звук стрибка не граємо — у зброї свої звуки
        if (typeof this.onJump === "function" && !this.weaponSpec) {
            this.onJump();
        }
    }

    // Множник монет за слова й комбінації (бонус скіна)
    wordsMult() {
        return this.skinPerk === "words" ? this.skinPerkValue : 1;
    }

    // Щит легендарного скіна: пробачає одну помилку чи зіткнення за рівень.
    // Повертає true, якщо щит спрацював (тоді вибуху немає)
    useShield() {
        if (!this.shieldReady || this.demoMode || !this.player.alive) {
            return false;
        }
        this.shieldReady = false;
        this.shieldFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "🛡 Щит!",
            life: 1.3,
            maxLife: 1.3
        });
        return true;
    }

    // Помилка, що мала б закінчитися вибухом. kind: "wrong" (не та літера на HARD),
    // "late" (запізнення на HARD), "collision" (зіткнення з шипом).
    // Спершу безкоштовний щит скіна, потім пропозиція сердечка, інакше — вибух
    failAt(kind, spike, gap) {
        if (this.useShield()) {
            this.forgiveMistake(kind, spike, gap);
            return "forgiven";
        }
        if (!this.demoMode && typeof this.onReviveOffer === "function" && save.getHearts() > 0 && this.player.alive) {
            this.pendingRevive = { kind: kind, spike: spike, gap: gap };
            this.paused = true;
            this.onReviveOffer(save.getHearts());
            return "paused";
        }
        if (kind === "collision" && spike) {
            spike.state = "hit";
        }
        this.explode();
        return "exploded";
    }

    // Пробачена помилка: після запізнення кубик сам перестрибує шип, після зіткнення
    // шип розбивається; після не тієї літери можна просто натиснути правильну
    forgiveMistake(kind, spike, gap) {
        if (!spike) {
            return;
        }
        if (kind === "late") {
            this.markSpikeCleared(spike, 0);
            this.jump(Math.max(0, gap) + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN, false);
        } else if (kind === "collision") {
            this.markSpikeCleared(spike, 0);
        }
    }

    // Гравець погодився використати сердечко (Пробіл)
    acceptRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = false;
        save.useHeart();
        this.heartFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "❤ Друге життя!",
            life: 1.4,
            maxLife: 1.4
        });
        this.forgiveMistake(r.kind, r.spike, r.gap);
    }

    // Гравець відмовився (Esc) — вибух, як зазвичай
    declineRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = false;
        if (r.kind === "collision" && r.spike) {
            r.spike.state = "hit";
        }
        this.explode();
    }

    explode() {
        if (!this.player.alive) {
            return;
        }
        this.jumpBuffer = null;
        this.player.alive = false;
        this.deathTimer = 0;
        this.combo = 0;
        const isDemon = this.level.bgTheme === "pixel_nether";
        const palette = isDemon
            ? ["#ff1111", "#ff4400", "#ffe14d"]
            : ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
        if (this.cameraMotion) {
            this.shakeTime = SHAKE_TIME;
        }
        const count = isDemon ? 20 : 8;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
        // Ефект вибуху, куплений у магазині
        this.boom = { id: save.getEquipped("explosion"), t: 0, x: gameX, y: gameY };
        BackgroundRenderer.createParticles(gameX, gameY, count, palette);
        // Кубик розлітається на квадратні уламки кольорів свого скіна
        this.spawnDebris(22, {
            x: gameX,
            y: gameY,
            spread: CUBE_SIZE * 0.6,
            angleMin: 0,
            angleMax: Math.PI * 2,
            speedMin: 120,
            speedMax: 380,
            sizeMin: CUBE_SIZE * 0.14,
            sizeMax: CUBE_SIZE * 0.3,
            spin: 14,
            colors: sampleSkinColors(this.getSkinRenderType()),
            gravity: 900,
            life: 1.1,
            outline: true
        });
        if (typeof this.onExplode === "function") {
            this.onExplode();
        }
    }

    handleLetter(letter) {
        if (this.paused) {
            return { result: "paused", letter: letter };
        }
        if (this.demoMode || !this.player.alive || this.outcome !== "running") {
            return { result: "no_target", letter: letter };
        }
        const upperLetter = letter.toUpperCase();
        const spike = this.nearestAheadSpike();
        if (!spike) {
            // Після останнього шипа цілі немає — натискання ні на що не впливає навіть у HARD
            return { result: "no_target", letter: letter };
        }
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = upperLetter === spike.letter.toUpperCase();

        // У повітрі правильна літера запам'ятовується лише тоді, коли шип уже в зоні.
        // Траса будується так, що приземлення завжди відбувається до початку зони
        // наступного шипа, тож натискання в повітрі — це зарано (як і на землі).
        if (correct && !this.player.onGround && gap > 0 && gap <= this.okPx) {
            this.jumpBuffer = spike;
            return { result: "correct", letter: letter };
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            if (this.weaponSpec) {
                this.strike(spike, gap, perfect, points);
                return { result: "correct", letter: letter };
            }
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        // Не та літера (або правильна, але зарано) — помилка на цьому шипі
        if (!correct) {
            this.noteSpikeMiss(spike);
        }
        this.worldReact();
        if (this.difficulty === "HARD") {
            const fate = this.failAt("wrong", spike, 0);
            if (fate === "exploded") {
                return { result: "exploded", letter: letter };
            }
            return { result: fate === "paused" ? "paused" : "wrong", letter: letter };
        }

        return { result: "wrong", letter: letter };
    }

    // ---------- Зброя ----------

    // Правильна літера зі зброєю: шип «приречений» (більше не може зачепити кубик
    // і не є ціллю), а сама атака добігає своїм ходом — удар, снаряд або промінь
    strike(spike, gap, perfect, points) {
        spike.state = "doomed";
        spike.points = points;
        spike.chunks = 0;
        this.registerHit(perfect);
        const spec = this.weaponSpec;
        const muzzleX = this.player.x + CUBE_SIZE * 0.6;
        const muzzleY = CUBE_SIZE * 0.55;
        const targetY = spike.type === "saw" ? SPIKE_H * 0.6 : SPIKE_H * 0.4;
        if (spec.mode === "melee" || (spec.mode === "axe" && gap <= spec.reach)) {
            // Замах одразу; удар — коли шип підійде на відстань руки
            this.attacks.push({ kind: "melee", spike: spike, stage: "wait", t: 0, hit: false });
        } else if (spec.mode === "beam") {
            const beamAttack = { kind: "beam", spike: spike, stage: "beam", t: 0, hit: false };
            if (spec.beam === "gravity") {
                // Промінь гравітаційної гармати дотягується тим швидше, чим ближче шип
                beamAttack.hitAt = gravityGrabTime(spike.x - muzzleX);
                beamAttack.time = beamAttack.hitAt + GRAVITY_LIFT;
            }
            this.attacks.push(beamAttack);
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        } else {
            const count = spec.mode === "burst" ? spec.count : 1;
            for (let i = 0; i < count; i++) {
                this.shots.push({
                    kind: spec.mode === "axe" ? (spec.saber ? "saber" : "axe") : spec.projectile,
                    color: spec.saber || null,
                    spike: spike,
                    t: -(spec.gap || 0) * i,
                    index: i,
                    last: i === count - 1,
                    fromX: muzzleX,
                    fromY: muzzleY,
                    toX: spike.x,
                    toY: targetY,
                    arc: spec.arc || 0,
                    dur: Math.max(0.06, (spike.x - muzzleX) / spec.speed),
                    returning: false,
                    prev: []
                });
            }
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        }
    }

    // Облік літери для статистики помилок (у демо не ведеться)
    noteLetter(letter, ok) {
        if (this.demoMode || !letter) {
            return;
        }
        const s = this.letterStats[letter] || (this.letterStats[letter] = { ok: 0, miss: 0 });
        if (ok) {
            s.ok++;
        } else {
            s.miss++;
        }
    }

    // Помилка на шипі (не та літера, запізнення, зіткнення) — рахується один раз на шип
    noteSpikeMiss(spike) {
        if (spike && !spike.missed) {
            spike.missed = true;
            this.noteLetter(spike.letter, false);
        }
    }

    // Шип подолано правильною літерою: статистика й бонус за слово без помилок
    noteSpikeDone(spike) {
        if (!spike.missed) {
            this.noteLetter(spike.letter, true);
        }
        if (this.demoMode || spike.word === undefined || spike.charIdx !== spike.word.length - 1) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === spike.wordIdx; });
        if (spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runCombos++;
            const kind = COMBO_KINDS[spike.combo];
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: (kind ? kind.unit : "Комбо") + " «" + spike.word + "»! +" + COMBO_BONUS * this.wordsMult(),
                life: 1.3,
                maxLife: 1.3,
                crystal: true
            });
        } else if (!spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runWords++;
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: "Слово «" + spike.word + "»! +" + WORD_BONUS * this.wordsMult(),
                life: 1.5,
                maxLife: 1.5,
                crystal: true
            });
        }
    }

    // Статистика літер за забіг (main зберігає її після завершення)
    getLetterStats() {
        return this.letterStats;
    }

    // Звук зброї для події «fire» / «swing» / «hit»
    emitWeaponSound(event) {
        if (typeof this.onSound !== "function" || !this.weaponSpec) {
            return;
        }
        const cue = getWeaponSound(this.weaponId, event);
        if (cue) {
            this.onSound(cue);
        }
    }

    // Шип знищено: запускаємо анімацію руйнування й уламки під конкретну зброю
    destroySpike(spike) {
        if (spike.state === "cleared") {
            return;
        }
        const fx = this.weaponSpec ? this.weaponSpec.fx : "shatter";
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        spike.fx = { kind: fx, t0: this.currentTime };
        this.emitWeaponSound("hit");
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        const base = { x: spike.x, y: SPIKE_H * 0.4, spread: SPIKE_W * 0.6, spin: 10, colors: colors, outline: true };
        if (fx === "shatter" || fx === "pop") {
            this.spawnDebris(fx === "shatter" ? 16 : 10, Object.assign(base, { angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 120, speedMax: 300, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (fx === "shatter") {
                this.stuckArrows.push({ x: spike.x + SPIKE_W * 0.3, t: 0 });
            }
        } else if (fx === "split") {
            this.spawnDebris(8, Object.assign(base, { colors: ["#c8883a", "#8a5a2a", colors[0]], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 200, sizeMin: 3, sizeMax: 5, gravity: 700, life: 0.7 }));
        } else if (fx === "slice") {
            this.spawnDebris(6, Object.assign(base, { colors: ["#ffffff", "#8ad8ff"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.6, speedMin: 120, speedMax: 260, sizeMin: 2, sizeMax: 4, gravity: 600, life: 0.5, outline: false }));
        } else if (fx === "crumble") {
            this.spawnDebris(8, Object.assign(base, { y: SPIKE_H * 0.15, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 60, speedMax: 150, sizeMin: 3, sizeMax: 6, gravity: 700, life: 0.6 }));
        } else if (fx === "melt") {
            this.spawnDebris(12, Object.assign(base, { colors: ["rgba(80, 80, 90, 0.9)", "rgba(140, 140, 150, 0.8)", "#ff8a2a"], angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 90, sizeMin: 2, sizeMax: 5, gravity: -120, life: 1.2, outline: false, spin: 3 }));
        } else if (fx === "blast") {
            this.spawnDebris(22, Object.assign(base, { colors: colors.concat(["#ffb81a", "#3a2a1a"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 200, speedMax: 480, sizeMin: 4, sizeMax: 9, gravity: 900, life: 1.1, spin: 16 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.6);
            }
        } else if (fx === "burn") {
            this.spawnDebris(14, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#ffe680", "rgba(60, 50, 50, 0.9)"], angleMin: Math.PI * 0.3, angleMax: Math.PI * 0.7, speedMin: 40, speedMax: 120, sizeMin: 2, sizeMax: 4, gravity: -140, life: 1.4, outline: false, spin: 3 }));
        } else if (fx === "saber_green" || fx === "saber_blue" || fx === "saber_red") {
            const glow = this.weaponSpec.saber || "#ffffff";
            this.spawnDebris(10, Object.assign(base, { colors: [glow, "#ffffff", colors[0]], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 300, life: 0.7, outline: false }));
        } else if (fx === "fireslice") {
            this.spawnDebris(12, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#fff4a0"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 200, life: 0.8, outline: false }));
        } else if (fx === "zap") {
            this.spawnDebris(16, Object.assign(base, { colors: colors.concat(["#bff4ff", "#ffffff"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 140, speedMax: 340, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.35);
            }
        } else if (fx === "fling") {
            this.spawnDebris(10, Object.assign(base, { colors: ["#c8a8ff", "#8a6aff", "#ffffff"], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 30, speedMax: 110, sizeMin: 2, sizeMax: 4, gravity: -60, life: 1.0, outline: false, spin: 4 }));
        } else if (fx === "break") {
            this.spawnDebris(12, Object.assign(base, { angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 240, sizeMin: 5, sizeMax: 9, gravity: 900, life: 0.8, spin: 6 }));
        }
        if (spike.points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 50, text: "+" + spike.points, life: 0.9, maxLife: 0.9 });
        }
    }

    // Політ снарядів, удари ближнього бою й промінь лазера
    updateWeapons(dt) {
        this.weaponRecoil = Math.max(0, this.weaponRecoil - dt * 3.2);
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const a = this.attacks[i];
            if (a.kind === "melee") {
                if (a.stage === "wait") {
                    const gap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                    if (gap <= meleeTriggerGap(CUBE_SIZE, this.effectiveSpeed)) {
                        a.stage = "swing";
                        this.emitWeaponSound("swing");
                        a.t = 0;
                    }
                    continue;
                }
                a.t += dt;
                // Лезо влучає, коли шип дійшов майже впритул (з поправкою на пів кадру),
                // а не за таймером — тоді проміжок однаковий на будь-якій швидкості
                const hitGap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                const contactGap = CUBE_SIZE / 2 + MELEE_CONTACT + this.effectiveSpeed * dt * 0.5;
                if (!a.hit && (hitGap <= contactGap || a.t >= SWING_HIT * 2)) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                    if (this.weaponSpec.bolt) {
                        // Громовий молот: у мить удару з неба б'є блискавка
                        this.attacks.push({ kind: "bolt", spike: a.spike, stage: "bolt", t: 0, hit: true });
                    }
                }
                if (a.t >= SWING_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else if (a.kind === "bolt") {
                a.t += dt;
                if (a.t >= BOLT_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else {
                a.t += dt;
                const timing = a.time ? { time: a.time, hit: a.hitAt } : beamTiming(this.weaponSpec);
                // Поки діє струмінь чи промінь, зброя лишається «в роботі»
                this.weaponRecoil = Math.max(this.weaponRecoil, 1 - a.t / timing.time);
                if (!a.hit && a.t >= timing.hit) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                }
                if (a.t >= timing.time) {
                    this.attacks.splice(i, 1);
                }
            }
        }
        for (let i = this.shots.length - 1; i >= 0; i--) {
            const s = this.shots[i];
            s.t += dt;
            if (s.t < 0) {
                continue;
            }
            if (s.index > 0 && s.t - dt < 0) {
                // Наступна куля черги вилітає з дула — рухаємо старт разом із кубиком
                s.fromX = this.player.x + CUBE_SIZE * 0.6;
                s.dur = Math.max(0.05, (s.toX - s.fromX) / this.weaponSpec.speed);
                this.weaponRecoil = 1;
            }
            const pos = this.shotPosition(s);
            s.prev.unshift({ x: pos.x, y: pos.y });
            if (s.prev.length > 8) {
                s.prev.pop();
            }
            if (!s.returning && s.t >= s.dur) {
                if (s.kind === "bullet" && !s.last) {
                    // Куля черги відколює шматок зверху
                    s.spike.chunks = Math.max(s.spike.chunks || 0, s.index + 1);
                    this.spawnDebris(4, { x: s.spike.x, y: SPIKE_H * (1 - (s.index + 1) * 0.22), spread: SPIKE_W * 0.4, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 80, speedMax: 180, sizeMin: 3, sizeMax: 5, spin: 8, colors: SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6"], gravity: 700, life: 0.5, outline: true });
                } else {
                    this.destroySpike(s.spike);
                }
                if (s.kind === "axe" || s.kind === "saber") {
                    // Сокира-бумеранг і світловий меч повертаються в руку
                    s.returning = true;
                    s.t = 0;
                    s.dur = 0.32;
                    s.fromX = s.toX;
                    s.fromY = s.toY;
                } else {
                    this.shots.splice(i, 1);
                }
                continue;
            }
            if (s.returning && s.t >= s.dur) {
                this.shots.splice(i, 1);
            }
        }
        for (let i = this.stuckArrows.length - 1; i >= 0; i--) {
            this.stuckArrows[i].t += dt;
            if (this.stuckArrows[i].t > 2) {
                this.stuckArrows.splice(i, 1);
            }
        }
    }

    // Позиція снаряда в ігрових координатах (y — вгору від землі)
    shotPosition(s) {
        const u = Math.min(1, Math.max(0, s.t / s.dur));
        if (s.returning) {
            // Назад — до руки кубика, що біжить уперед
            const hx = this.player.x + CUBE_SIZE * 0.5;
            const hy = CUBE_SIZE * 0.6;
            return {
                x: s.fromX + (hx - s.fromX) * u,
                y: s.fromY + (hy - s.fromY) * u + Math.sin(Math.PI * u) * 30,
                u: u
            };
        }
        return {
            x: s.fromX + (s.toX - s.fromX) * u,
            y: s.fromY + (s.toY - s.fromY) * u + Math.sin(Math.PI * u) * s.arc,
            u: u
        };
    }

    // Поза зброї в руці: замах, фаза удару, віддача, чи кинуто сокиру
    weaponPose() {
        let raise = 0;
        let swing = -1;
        for (const a of this.attacks) {
            if (a.kind !== "melee") {
                continue;
            }
            if (a.stage === "wait") {
                raise = 1;
            } else {
                swing = Math.max(swing, a.t / SWING_TIME);
            }
        }
        let away = false;
        for (const s of this.shots) {
            if (s.kind === "axe" || s.kind === "saber") {
                away = true;
            }
        }
        return { raise: raise, swing: swing, recoil: this.weaponRecoil, away: away };
    }

    // Снаряди, промінь лазера й стріли в землі
    renderWeapons(ctx, groundY, anchorX, camX) {
        if (!this.weaponSpec) {
            return;
        }
        const time = this.currentTime;
        for (const arrow of this.stuckArrows) {
            drawStuckArrow(ctx, anchorX + arrow.x - camX, groundY, arrow.t, CUBE_SIZE);
        }
        for (const a of this.attacks) {
            if (a.kind === "beam") {
                const x1 = anchorX + CUBE_SIZE * 0.6 + CUBE_SIZE * 0.08;
                const y1 = groundY - this.player.y - CUBE_SIZE / 2 - CUBE_SIZE * 0.03;
                let x2 = anchorX + a.spike.x - camX;
                let y2 = groundY - SPIKE_H * 0.45;
                if (this.weaponSpec.beam === "gravity" && a.spike.fx) {
                    // Кінець променя тримає шип, що піднімається й підтягується до кубика
                    const hold = gravityHoldOffset((this.currentTime - a.spike.fx.t0) / 1000, SPIKE_H, anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD - x2);
                    x2 += hold.dx;
                    y2 += hold.dy;
                }
                const beamTime = a.time || beamTiming(this.weaponSpec).time;
                drawBeam(ctx, this.weaponSpec.beam, x1, y1, x2, y2, a.t / beamTime, time, a.time ? a.hitAt / a.time : undefined);
            } else if (a.kind === "bolt") {
                const bx = anchorX + a.spike.x - camX;
                const by = groundY - SPIKE_H * 0.45;
                drawBeam(ctx, "thunder", bx, by, bx, by, a.t / BOLT_TIME, time);
            }
        }
        for (const s of this.shots) {
            if (s.t < 0) {
                continue;
            }
            const pos = this.shotPosition(s);
            const prev = s.prev.length > 1 ? s.prev[1] : { x: s.fromX, y: s.fromY };
            const angle = Math.atan2(-(pos.y - prev.y), pos.x - prev.x);
            const trail = s.prev.map(function (p) { return { x: anchorX + p.x - camX, y: groundY - p.y }; });
            drawProjectile(ctx, s.kind, anchorX + pos.x - camX, groundY - pos.y, angle, s.t, CUBE_SIZE, trail, s.color);
        }
    }

    // Світ реагує на кожну помилку: гуркіт грому, гудіння трибун, спалах очей дракона…
    // На рівні боса демон реве, а екран ледь здригається
    worldReact() {
        this.oopsTime = OOPS_TIME;
        if (this.level.bgTheme === "pixel_nether" && this.cameraMotion) {
            this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.4);
        }
    }

    update(dt) {
        if (this.outcome === "won") {
            return;
        }
        // Пауза, поки гравець вирішує щодо сердечка
        if (this.paused) {
            return;
        }

        this.currentTime = performance.now();
        this.pulse = Math.max(0, this.pulse - dt * 2.2);
        for (const wave of this.waves) {
            wave.r += dt * 620;
            wave.alpha -= dt * 1.1;
        }
        this.waves = this.waves.filter(function (w) { return w.alpha > 0; });

        BackgroundRenderer.updateParticles(dt);

        for (var ppi = this.perfectParticles.length - 1; ppi >= 0; ppi--) {
            var pp = this.perfectParticles[ppi];
            pp.life -= dt;
            if (pp.life <= 0) {
                this.perfectParticles.splice(ppi, 1);
                continue;
            }
            pp.x += pp.vx * dt;
            pp.y += pp.vy * dt;
            pp.vy += 400 * dt;
        }
        for (var poi = this.perfectPopups.length - 1; poi >= 0; poi--) {
            var po = this.perfectPopups[poi];
            po.life -= dt;
            if (po.life <= 0) {
                this.perfectPopups.splice(poi, 1);
                continue;
            }
            po.y += 80 * dt;
        }
        for (var di = this.debris.length - 1; di >= 0; di--) {
            var db = this.debris[di];
            db.life -= dt;
            if (db.life <= 0) {
                this.debris.splice(di, 1);
                continue;
            }
            db.x += db.vx * dt;
            db.y += db.vy * dt;
            db.vy -= db.gravity * dt;
            db.rot += db.vr * dt;
            if (db.y < db.size / 2) {
                db.y = db.size / 2;
                db.vy = -db.vy * 0.35;
                db.vx *= 0.7;
            }
        }
        this.perfectFlash = Math.max(0, this.perfectFlash - dt);
        this.shieldFlash = Math.max(0, (this.shieldFlash || 0) - dt * 1.2);
        this.heartFlash = Math.max(0, (this.heartFlash || 0) - dt * 1.2);
        if (this.boom) {
            this.boom.t += dt;
            if (this.boom.t > EXPLOSION_DURATION) {
                this.boom = null;
            }
        }
        this.shakeTime = Math.max(0, this.shakeTime - dt);
        this.oopsTime = Math.max(0, this.oopsTime - dt);
        this.elapsed += dt;
        for (var si = this.scorePopups.length - 1; si >= 0; si--) {
            var sp = this.scorePopups[si];
            sp.life -= dt;
            sp.y += 60 * dt;
            if (sp.life <= 0) {
                this.scorePopups.splice(si, 1);
            }
        }

        if (this.weaponSpec) {
            this.updateWeapons(dt);
        }

        if (!this.player.alive) {
            this.deathTimer += dt;
            if (this.demoMode) {
                this.demoRestartTimer += dt;
                if (this.demoRestartTimer >= DEMO_RESTART_DELAY) {
                    this.reset();
                }
            } else if (this.deathTimer >= DEATH_DELAY) {
                this.outcome = "dead";
            }
            return;
        }

        this.player.x += this.effectiveSpeed * dt;

        if (!this.player.onGround) {
            this.player.vy -= GRAVITY * dt;
            this.player.y += this.player.vy * dt;
            this.player.rotation += dt * 7.5;
            if (this.player.y <= 0) {
                this.player.y = 0;
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.rotation = 0;
                // Пил із-під кубика при приземленні
                this.spawnDebris(8, {
                    x: this.player.x,
                    y: 2,
                    spread: CUBE_SIZE * 0.8,
                    angleMin: Math.PI * 0.05,
                    angleMax: Math.PI * 0.95,
                    speedMin: 40,
                    speedMax: 130,
                    sizeMin: 3,
                    sizeMax: 6,
                    spin: 4,
                    colors: ["rgba(200, 210, 230, 0.9)", this.level.accentColor || "#00f6ff"],
                    gravity: 260,
                    life: 0.45,
                    outline: false
                });
                this.spawnLandingReaction();
                this.consumeJumpBuffer();
            }
        }

        this.trailTick += dt;
        if (this.trailTick >= 0.016) {
            this.trailTick = 0;
            this.player.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.55 });
            if (this.player.trail.length > TRAIL_MAX) {
                this.player.trail.shift();
            }
        }
        for (const point of this.player.trail) {
            point.alpha -= dt * 1.4;
        }
        this.player.trail = this.player.trail.filter(function (t) { return t.alpha > 0; });

        if (!this.player.onGround) {
            this.player.meteorTrail.unshift({ x: this.player.x, y: this.player.y, alpha: 1 });
            if (this.player.meteorTrail.length > 2) {
                this.player.meteorTrail.pop();
            }
        } else if (this.player.meteorTrail.length > 0) {
            for (var mt = 0; mt < this.player.meteorTrail.length; mt++) {
                this.player.meteorTrail[mt].alpha -= dt * 3;
            }
            this.player.meteorTrail = this.player.meteorTrail.filter(function (t) { return t.alpha > 0; });
        }

        if (this.demoMode) {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5 && this.weaponSpec) {
                    // Демо в меню показує куплену зброю
                    this.strike(target, gap, true, 0);
                } else if (gap > 0 && gap <= this.okPx * 0.5) {
                    this.markSpikeCleared(target, 0);
                    const distance = gap + 2 * spikeHalfWidth(target.type) + SAFE_MARGIN;
                    this.jump(distance, true);
                }
            }
        }

        if (!this.demoMode && this.difficulty === "HARD") {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap <= CUBE_SIZE * 0.4) {
                    this.noteSpikeMiss(target);
                    // Щит або сердечко перестрибують шип замість вибуху
                    if (this.failAt("late", target, gap) !== "forgiven") {
                        return;
                    }
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.state !== "ahead") {
                continue;
            }
            const dx = Math.abs(spike.x - this.player.x);
            const halfW = spikeHalfWidth(spike.type);
            if (dx < halfW + CUBE_SIZE * 0.32 && this.player.y < SPIKE_H * 0.72) {
                this.noteSpikeMiss(spike);
                // Щит або сердечко розбивають шип, і кубик їде далі
                if (this.failAt("collision", spike, 0) !== "forgiven") {
                    return;
                }
                continue;
            }
            if (spike.x + halfW < this.player.x) {
                spike.state = "cleared";
                if (spike.clearedAt === undefined) {
                    spike.clearedAt = this.currentTime;
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.type === "saw" && spike.state === "ahead") {
                spike.rotationAngle += this.effectiveSpeed * 0.02 * dt;
            }
        }

        this.progressPct = Math.min(100, (this.player.x / this.finishX) * 100);
        if (this.player.x >= this.finishX) {
            this.progressPct = 100;
            if (this.demoMode) {
                this.reset();
            } else {
                this.outcome = "won";
                if (typeof this.onVictory === "function") {
                    this.onVictory();
                }
            }
        }
    }

    // ---------- Рендер ----------

    render(ctx, W, H, time) {
        // Під час паузи фон і всі анімації завмирають: час рендера не йде вперед
        if (this.paused) {
            if (this.pauseStart === null) {
                this.pauseStart = time;
            }
            time = this.pauseStart - this.pausedTotal;
        } else {
            if (this.pauseStart !== null) {
                this.pausedTotal += time - this.pauseStart;
                this.pauseStart = null;
            }
            time -= this.pausedTotal;
        }
        var groundY = H * 0.64;
        var anchorX = W * PLAYER_ANCHOR;
        var camX = this.player.x;

        this.bgCache.setTheme(this.level.bgTheme);
        this.bgCache.resize(W, H);
        if (this.eggStart === null && this.progressPct / 100 >= this.eggAt) {
            this.eggStart = this.currentTime;
        }
        var eggT = this.eggStart === null ? null : (this.currentTime - this.eggStart) / EASTER_EGG_DURATION;
        BackgroundRenderer.setEffects({
            progress: this.progressPct / 100,
            combo: this.combo,
            perfect: this.perfectFlash / PERFECT_FLASH_TIME,
            eggT: eggT !== null && eggT <= 1 ? eggT : null,
            weather: this.weather,
            camY: this.cameraMotion ? this.player.y * 0.35 : 0,
            oops: this.oopsTime / OOPS_TIME,
            // Літера, яку треба натиснути зараз (гірлянда з абеткою в «Дивному містечку»)
            letter: this.getTargetLetter()
        });
        if (this.bgCache.shouldUpdate(time)) {
            var self = this;
            this.bgCache.render(function (cacheCtx) {
                BackgroundRenderer.render(cacheCtx, self.level.bgTheme, W, H, groundY, time, self.effectiveSpeed, self.level.accentColor, self.level.id);
            }, time);
        }
        // Струс екрана після вибуху (лише ігрова сцена, клавіатура нерухома)
        ctx.save();
        if (this.shakeTime > 0) {
            const amp = 9 * this.shakeTime / SHAKE_TIME;
            ctx.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp * 2);
        }
        this.bgCache.drawImage(ctx);
        this.renderWaves(ctx, W, groundY);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderCubeLight(ctx, groundY, anchorX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        this.renderWeapons(ctx, groundY, anchorX, camX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        this.renderDebris(ctx, groundY, anchorX, camX);
        if (this.boom) {
            drawExplosion(ctx, this.boom.id, this.boom.t, anchorX + this.boom.x - camX, groundY - this.boom.y, CUBE_SIZE);
        }
        this.renderPerfectParticles(ctx, groundY, anchorX, camX);
        this.renderPerfectPopups(ctx, groundY, anchorX, camX);
        this.renderScorePopups(ctx, groundY, anchorX, camX);
        ctx.restore();
        if (!this.demoMode) {
            this.renderWordBar(ctx, W);
            this.renderWorldTitle(ctx, W, H);
            this.renderProgressBar(ctx, W);
            this.renderHearts(ctx);
        }
    }

    // Запас сердечок — у лівому верхньому куті під панеллю
    renderHearts(ctx) {
        const count = save.getHearts();
        if (count <= 0 && this.heartFlash <= 0) {
            return;
        }
        const x = 26;
        const y = 78;
        ctx.save();
        const pulse = 1 + (this.heartFlash || 0) * 0.5;
        drawHeartLife(ctx, x, y, 28 * pulse, performance.now());
        ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
        ctx.strokeText("×" + count, x + 18, y + 2);
        ctx.fillStyle = "#ffe14d";
        ctx.fillText("×" + count, x + 18, y + 2);
        ctx.restore();
    }

    // Рівень-слова: під панеллю прогресу — поточне слово, набрані літери зелені,
    // потрібна зараз — жовта, решта — білі
    renderWordBar(ctx, W) {
        if (!Array.isArray(this.level.words) || this.spikes.length === 0) {
            return;
        }
        let current = this.nearestAheadSpike();
        if (!current) {
            for (let i = this.spikes.length - 1; i >= 0; i--) {
                if (this.spikes[i].state !== "ahead") {
                    current = this.spikes[i];
                    break;
                }
            }
        }
        if (!current || current.word === undefined) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === current.wordIdx; });
        const cell = 34;
        const gapPx = 6;
        const total = wordSpikes.length * cell + (wordSpikes.length - 1) * gapPx;
        const x0 = Math.round(W / 2 - total / 2);
        const y0 = 64;
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 20, 0.72)";
        roundedRectPath(ctx, x0 - 14, y0 - 8, total + 28, cell + 16, 10);
        ctx.fill();
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < wordSpikes.length; i++) {
            const s = wordSpikes[i];
            const x = x0 + i * (cell + gapPx);
            const done = s.state !== "ahead";
            const isCurrent = s === current && s.state === "ahead";
            ctx.fillStyle = done ? (s.missed ? "rgba(120, 40, 60, 0.9)" : "rgba(20, 90, 50, 0.95)") : isCurrent ? "rgba(90, 80, 20, 0.95)" : "rgba(40, 44, 70, 0.9)";
            roundedRectPath(ctx, x, y0, cell, cell, 6);
            ctx.fill();
            ctx.strokeStyle = done ? (s.missed ? "#ff4466" : "#39ff88") : isCurrent ? "#ffe14d" : "rgba(160, 170, 210, 0.5)";
            ctx.lineWidth = isCurrent ? 2.5 : 1.5;
            ctx.stroke();
            ctx.fillStyle = done ? "#ffffff" : isCurrent ? "#ffe14d" : "#e8ecf8";
            ctx.fillText(s.letter, x + cell / 2, y0 + cell / 2 + 1);
        }
        ctx.restore();
    }

    // Світло від кубика кольору скіна підсвічує землю й найближчі шипи
    renderCubeLight(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        let base = sampleSkinColors(this.getSkinRenderType())[0] || "rgb(0, 246, 255)";
        if (base.charAt(0) === "#") {
            base = "rgb(" + parseInt(base.slice(1, 3), 16) + ", " + parseInt(base.slice(3, 5), 16) + ", " + parseInt(base.slice(5, 7), 16) + ")";
        }
        const color = base.replace("rgb(", "rgba(").replace(")", ", 0.28)");
        const cy = groundY - this.player.y - CUBE_SIZE / 2;
        const r = 150;
        const light = ctx.createRadialGradient(anchorX, cy, 10, anchorX, cy, r);
        light.addColorStop(0, color);
        light.addColorStop(1, base.replace("rgb(", "rgba(").replace(")", ", 0)"));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = light;
        ctx.fillRect(anchorX - r, cy - r, r * 2, r * 2);
        ctx.restore();
    }

    // Заставка світу: назва плавно з'являється на початку рівня й зникає
    renderWorldTitle(ctx, W, H) {
        if (this.elapsed >= TITLE_TIME) {
            return;
        }
        const name = BackgroundRenderer.worldName(this.level.bgTheme);
        if (!name) {
            return;
        }
        const t = this.elapsed;
        const alpha = Math.min(1, t / 0.35, (TITLE_TIME - t) / 0.6);
        const rise = (1 - Math.min(1, t / 0.35)) * 20;
        const accent = this.level.accentColor || "#00f6ff";
        let y = H * 0.24 + rise;
        let jitterX = 0;
        // Заставка боса тремтить, а над нею розплющується око демона
        const isBoss = this.level.bgTheme === "pixel_nether";
        if (isBoss) {
            jitterX = (Math.random() - 0.5) * 6;
            y += (Math.random() - 0.5) * 6;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 " + Math.round(H * 0.07) + "px 'Segoe UI', Arial, sans-serif";
        // Піксельна «об'ємна» тінь
        ctx.fillStyle = "rgba(5, 5, 20, 0.9)";
        for (let k = 4; k >= 1; k--) {
            ctx.fillText(name.toUpperCase(), W / 2 + k * 2, y + k * 2);
        }
        ctx.fillStyle = accent;
        ctx.fillText(name.toUpperCase(), W / 2 + 2 + jitterX, y);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name.toUpperCase(), W / 2 + jitterX, y - 2);
        if (isBoss) {
            const eyeOpen = Math.min(1, t / 1.2);
            const eh = Math.max(2, H * 0.03 * eyeOpen);
            const ey = y - H * 0.1;
            ctx.fillStyle = "rgba(255, 40, 0, 0.35)";
            ctx.fillRect(W / 2 - H * 0.09, ey - eh, H * 0.18, eh * 2);
            ctx.fillStyle = "#ffea00";
            ctx.fillRect(W / 2 - H * 0.06, ey - eh / 2, H * 0.12, eh);
            ctx.fillStyle = "#8a0000";
            ctx.fillRect(W / 2 - H * 0.008, ey - eh / 2, H * 0.016, eh);
        }
        if (this.leagueInfo) {
            ctx.font = "bold " + Math.round(H * 0.028) + "px 'Segoe UI', Arial, sans-serif";
            // Темна тінь під підписом — щоб читався й на світлому тлі
            ctx.fillStyle = "rgba(5, 5, 20, 0.85)";
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2 + 2, y + H * 0.065 + 2);
            ctx.fillStyle = accent;
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2, y + H * 0.065);
        }
        ctx.restore();
    }

    // ---------- Хвилі стрибка ----------

    renderWaves(ctx, W, groundY) {
        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // ---------- Земля, Hit Window, Фініш, Перешкоди, Гравець ----------

    renderGround(ctx, W, H, groundY, camX) {
        ctx.fillStyle = "#070b1c";
        ctx.fillRect(0, groundY, W, H - groundY);

        const accent = this.level.accentColor || "#00f6ff";
        var groundGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 6);
        groundGrad.addColorStop(0, "transparent");
        groundGrad.addColorStop(0.5, accent);
        groundGrad.addColorStop(1, "transparent");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY - 6, W, 12);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();

        // Земля під шипами в стилі світу (трава, сніг, пісок, камінь, лава…)
        BackgroundRenderer.renderGroundDetail(ctx, this.level.bgTheme, W, H, groundY, camX, accent);
        // Неонова лінія землі поверх текстури
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
    }

    renderHitWindow(ctx, W, groundY, anchorX, time) {
        if (!this.player.alive) {
            return;
        }
        const spike = this.nearestAheadSpike();
        if (!spike) {
            return;
        }
        const hwH = 5;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;
        const okWidth = this.okPx;
        const pulseAlpha = 0.4 + 0.2 * (Math.sin(time * 6) + 1) / 2;

        const topY = groundY - hwH - 2;
        const botY = groundY + 2;

        ctx.fillStyle = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(anchorX, topY, perfectWidth, hwH);

        ctx.fillStyle = "rgba(0, 246, 255, 0.2)";
        ctx.fillRect(anchorX, botY, okWidth, hwH);
    }

    renderFinish(ctx, W, groundY, anchorX, camX) {
        const screenX = this.finishX - camX + anchorX;
        if (screenX < -120 || screenX > W + 120) {
            return;
        }
        // Фініш у стилі світу «відчиняється», коли кубик підбігає
        const open = Math.min(1, Math.max(0, 1 - (this.finishX - this.player.x) / FINISH_OPEN_DISTANCE));
        BackgroundRenderer.renderFinishGate(ctx, this.level.bgTheme, screenX, groundY, open, this.currentTime / 1000);
    }

    // ---------- Перешкоди (3 типи) ----------

    drawSpike(ctx, screenX, groundY, accentColor, cleared) {
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 20 : 40;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR, groundY - SPIKE_H - glowR * 0.5, glowR * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(screenX - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX, groundY - SPIKE_H);
        ctx.lineTo(screenX + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared) {
        const offset = SPIKE_W * 0.45;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 18 : 36;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR - offset, groundY - SPIKE_H - glowR * 0.5, (glowR + offset) * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(screenX - offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX - offset, groundY - SPIKE_H);
        ctx.lineTo(screenX - offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenX + offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX + offset, groundY - SPIKE_H);
        ctx.lineTo(screenX + offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawSaw(ctx, screenX, groundY, radius, rotationAngle, accentColor, cleared) {
        const centerY = groundY - radius;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        const teeth = 8;

        var glowR = cleared ? radius * 0.8 : radius * 1.2;
        var glowGrad = ctx.createRadialGradient(screenX, centerY, radius * 0.2, screenX, centerY, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenX, centerY, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(screenX, centerY);
        ctx.rotate(rotationAngle);

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#301030";
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius : radius * 0.65;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Світні кінчики зубців і «слід» обертання
        if (!cleared) {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < teeth; i++) {
                const angle = (i / teeth) * Math.PI * 2;
                ctx.fillRect(Math.cos(angle) * radius - 1.5, Math.sin(angle) * radius - 1.5, 3, 3);
            }
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.12, 0, Math.PI * 0.6);
            ctx.moveTo(Math.cos(Math.PI) * radius * 1.12, Math.sin(Math.PI) * radius * 1.12);
            ctx.arc(0, 0, radius * 1.12, Math.PI, Math.PI * 1.6);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.6)" : "rgba(20, 10, 20, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    // Тіло перешкоди (шип, подвійний шип або пилка) у стилі світу
    drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared) {
        if (spike.type === "saw") {
            this.drawSaw(ctx, screenX, groundY, SPIKE_H * 0.6, spike.rotationAngle || 0, accentColor, cleared);
        } else if (this.spikeStyle === "neon") {
            if (spike.type === "double_spike") {
                this.drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared);
            } else {
                this.drawSpike(ctx, screenX, groundY, accentColor, cleared);
            }
        } else {
            const offsets = spike.type === "double_spike" ? [-SPIKE_W * 0.45, SPIKE_W * 0.45] : [0];
            // «Небезпечна» аура: перешкоду завжди видно на тлі схожих декорацій світу
            if (!cleared) {
                const auraW = spike.type === "double_spike" ? SPIKE_W * 1.6 : SPIKE_W;
                const aura = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.35, 4, screenX, groundY - SPIKE_H * 0.35, auraW);
                aura.addColorStop(0, "rgba(255, 40, 80, 0.45)");
                aura.addColorStop(1, "rgba(255, 40, 80, 0)");
                ctx.fillStyle = aura;
                ctx.fillRect(screenX - auraW, groundY - SPIKE_H * 1.3, auraW * 2, SPIKE_H * 1.3);
            }
            for (const off of offsets) {
                ctx.save();
                ctx.translate(screenX + off, groundY);
                drawStyledSpikeShape(ctx, this.spikeStyle, accentColor, this.currentTime);
                // Червона «лінія небезпеки» біля основи
                ctx.fillStyle = "rgba(255, 40, 80, 0.85)";
                ctx.fillRect(-SPIKE_W / 2, -3, SPIKE_W, 3);
                ctx.restore();
            }
        }
    }

    renderObstacles(ctx, W, groundY, anchorX, camX) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        const accentColor = this.level.accentColor || "#ff2ea6";
        const target = this.player.alive ? this.nearestAheadSpike() : null;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;

        for (const spike of this.spikes) {
            const screenX = spike.x - camX + anchorX;
            if (screenX < -80 || screenX > W + 80) {
                continue;
            }
            const cleared = spike.state === "cleared";
            // Шип, знищений зброєю, показує свою анімацію руйнування
            if (cleared && spike.fx) {
                const ft = (this.currentTime - spike.fx.t0) / 1000;
                if (ft <= (DESTRUCTION_TIME[spike.fx.kind] || 0.5)) {
                    const self = this;
                    const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                    // Уламки не провалюються під землю (там клавіатура)
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(screenX - 400, 0, 800, groundY + 8);
                    ctx.clip();
                    drawSpikeDestruction(ctx, spike.fx.kind, ft, screenX, groundY, spikeHalfWidth(spike.type), spikeTop, function (c) {
                        self.drawObstacleBody(c, spike, screenX, groundY, accentColor, false);
                    }, { pullX: anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD });
                    ctx.restore();
                }
                continue;
            }
            // Подоланий шип за мить «осідає» в землю
            let crumble = 1;
            if (cleared) {
                const since = spike.clearedAt === undefined ? 1 : (this.currentTime - spike.clearedAt) / 1000;
                crumble = 1 - since / SPIKE_CRUMBLE_TIME;
                if (crumble <= 0) {
                    continue;
                }
            }
            // Поява: шип «виростає» із землі, коли заходить на екран
            const appear = Math.min(1, Math.max(0, (W + 40 - screenX) / SPIKE_POP_DISTANCE));
            const grow = (1 - Math.pow(1 - appear, 3)) * crumble;
            if (grow <= 0.01) {
                continue;
            }

            // Підсвітка моменту натискання для цільового шипа
            let zone = null;
            if (spike === target) {
                const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
                if (gap > 0 && gap <= perfectWidth) {
                    zone = "perfect";
                } else if (gap > 0 && gap <= this.okPx) {
                    zone = "ok";
                }
            }
            if (zone) {
                const zoneColor = zone === "perfect" ? "57, 255, 136" : "0, 246, 255";
                const glow = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.45, 4, screenX, groundY - SPIKE_H * 0.45, SPIKE_H * 1.1);
                glow.addColorStop(0, "rgba(" + zoneColor + ", 0.55)");
                glow.addColorStop(1, "rgba(" + zoneColor + ", 0)");
                ctx.fillStyle = glow;
                ctx.fillRect(screenX - SPIKE_H * 1.1, groundY - SPIKE_H * 1.6, SPIKE_H * 2.2, SPIKE_H * 1.6);
            }

            ctx.save();
            ctx.translate(screenX, groundY);
            ctx.scale(1, grow);
            ctx.translate(-screenX, -groundY);
            if (spike.chunks > 0) {
                // Кулі автомата вже відкололи верхні шматки
                const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                ctx.beginPath();
                ctx.rect(screenX - 200, groundY - spikeTop * (1 - spike.chunks * 0.22), 400, spikeTop * 2);
                ctx.clip();
            }
            this.drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared);
            ctx.restore();

            // Клавіша з літерою над перешкодою
            if (!cleared) {
                const topY = spike.type === "saw" ? groundY - SPIKE_H * 1.2 : groundY - SPIKE_H;
                // Шип, по якому вже вдарила зброя, світиться зеленим до руйнування
                const state = spike.state === "doomed" ? "perfect" : zone ? zone : spike === target ? "target" : "idle";
                ctx.globalAlpha = grow;
                drawKeycap(ctx, screenX, topY - 12, spike.letter, state);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();
    }

    renderScorePopups(ctx, groundY, anchorX, camX) {
        if (this.scorePopups.length === 0) {
            return;
        }
        ctx.save();
        ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.lineJoin = "round";
        for (const sp of this.scorePopups) {
            ctx.globalAlpha = Math.min(1, sp.life / sp.maxLife * 1.5);
            const x = sp.x - camX + anchorX;
            const y = groundY - sp.y;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
            ctx.strokeText(sp.text, x, y);
            ctx.fillStyle = sp.crystal ? "#ffd84a" : "#ffe14d";
            ctx.fillText(sp.text, x, y);
            if (sp.crystal) {
                // Значок монети праворуч від напису
                const w = ctx.measureText(sp.text).width;
                drawCoinIcon(ctx, x + w / 2 + 11, y - 10, 16);
            }
        }
        ctx.restore();
    }

    // ---------- Кубик та частинки ----------

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        // Шлейф (звичайний або куплений у магазині)
        const trailPoints = [];
        for (let ti = 0; ti < this.player.trail.length; ti++) {
            const point = this.player.trail[ti];
            if (point.seq === undefined) {
                point.seq = this.trailSeq = (this.trailSeq || 0) + 1;
            }
            trailPoints.push({
                sx: anchorX + point.x - this.player.x,
                sy: groundY - point.y - CUBE_SIZE / 2,
                alpha: point.alpha,
                i: point.seq
            });
        }
        drawTrail(ctx, save.getEquipped("trail"), trailPoints, CUBE_SIZE, this.currentTime);

        // Gold trail for perfectHard
        var achievementLevelId = this.level.id;
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId) {
            var skinLevel = ALL_LEVELS.find(function (l) { return l.skin && l.skin.renderType === activeSkinId; });
            if (skinLevel) {
                achievementLevelId = skinLevel.id;
            }
        }
        const achievement = save.getLevelAchievement ? save.getLevelAchievement(achievementLevelId) : null;
        if (achievement === "hard" && !this.player.onGround && this.player.vy !== 0) {
            this.player.goldTrail = this.player.goldTrail || [];
            this.player.goldTrail.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE / 2,
                alpha: 1.0,
                time: this.currentTime
            });
            for (var gi = this.player.goldTrail.length - 1; gi >= 0; gi--) {
                var gp = this.player.goldTrail[gi];
                var gage = (this.currentTime - gp.time) / 1000;
                gp.alpha = Math.max(0, 1.0 - gage / 0.4);
                if (gp.alpha <= 0) {
                    this.player.goldTrail.splice(gi, 1);
                    continue;
                }
                var gpx = anchorX + (gp.x - this.player.x);
                var gpy = groundY - gp.y - CUBE_SIZE / 2;
                ctx.fillStyle = "rgba(255, 200, 40, " + (gp.alpha * 0.5).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(gpx, gpy, 4 * gp.alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            if (this.player.goldTrail.length > 15) {
                this.player.goldTrail.splice(0, this.player.goldTrail.length - 15);
            }
        }

        const centerY = groundY - this.player.y - CUBE_SIZE / 2;
        ctx.save();
        ctx.translate(anchorX, centerY);
        ctx.rotate(this.player.rotation);

        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;

        const skinConfig = this.level.skin;
        var effectiveSkinConfig = skinConfig;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            effectiveSkinConfig = { renderType: activeSkinId };
        }
        const renderFn = effectiveSkinConfig ? SKIN_RENDERERS[effectiveSkinConfig.renderType] : null;
        if (renderFn) {
            renderFn(ctx, CUBE_SIZE, this.currentTime, this.player);
        } else {
            SKIN_RENDERERS.neon_base(ctx, CUBE_SIZE, this.currentTime, this.player);
        }

        drawAchievementFrame(ctx, CUBE_SIZE, achievement, this.currentTime);
        drawAccessory(ctx, save.getEquipped("accessory"), CUBE_SIZE, this.currentTime);
        if (this.weaponSpec) {
            drawHeldWeapon(ctx, this.weaponId, CUBE_SIZE, this.weaponPose(), this.currentTime);
        }

        // Щит: поки не використаний — ледь помітна бульбашка; спрацював — яскравий спалах, що гасне
        if (this.shieldReady || this.shieldFlash > 0) {
            const flash = this.shieldFlash || 0;
            const r = CUBE_SIZE * (0.85 + flash * 0.4);
            ctx.strokeStyle = "rgba(140, 220, 255, " + (this.shieldReady ? 0.35 + 0.15 * Math.sin(this.currentTime * 0.004) : flash).toFixed(3) + ")";
            ctx.lineWidth = this.shieldReady ? 2 : 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Спалах рамки після «Ідеально»
        if (this.perfectFlash > 0) {
            var flashT = this.perfectFlash / PERFECT_FLASH_TIME;
            var grow = (1 - flashT) * 8;
            ctx.strokeStyle = "rgba(255, 255, 255, " + (flashT * 0.9).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(-CUBE_SIZE / 2 - grow, -CUBE_SIZE / 2 - grow, CUBE_SIZE + grow * 2, CUBE_SIZE + grow * 2);
        }

        ctx.restore();
    }

    renderProgressBar(ctx, W) {
        var barW = W * 0.6;
        var barX = (W - barW) / 2;
        var barY = 30;
        var barH = 14;

        // Темна підкладка, щоб написи читалися й на світлому денному небі
        var panelX = Math.max(4, barX - 150);
        var panelR = Math.min(W - 4, barX + barW + 128);
        ctx.fillStyle = "rgba(5, 8, 20, 0.55)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, 2, panelR - panelX, barY + barH + 8, 8);
        } else {
            ctx.rect(panelX, 2, panelR - panelX, barY + barH + 8);
        }
        ctx.fill();

        if (this.leagueInfo !== null) {
            ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00f6ff";
            ctx.fillText(
                "Ліга: " + this.leagueInfo.leagueName + " | " + this.leagueInfo.levelNumber + ": " + this.leagueInfo.levelName,
                W / 2,
                6
            );
        }

        ctx.fillStyle = "rgba(8, 10, 26, 0.8)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
        var fillW = barW * (this.progressPct / 100);
        var gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#39ff88");
        ctx.fillStyle = gradient;
        ctx.fillRect(barX + 1, barY + 1, Math.max(0, fillW - 2), barH - 2);
        ctx.fillStyle = "#eaf6ff";
        ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.floor(this.progressPct) + "%", barX + barW + 12, barY + barH / 2);
        // Монети, зібрані в цьому забігу
        drawCoinIcon(ctx, barX + barW + 70, barY + barH / 2, 16);
        ctx.fillStyle = "#ffd84a";
        ctx.fillText(String(this.runHits + this.runPerfect + this.runSeries + (this.runWords * WORD_BONUS + this.runCombos * COMBO_BONUS) * this.wordsMult()), barX + barW + 82, barY + barH / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffe14d";
        var maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy;
        ctx.fillText("Очки: " + this.score + " / " + maxForMode, barX - 12, barY + barH / 2);
    }

    renderPerfectParticles(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.perfectParticles.length; i++) {
            var pp = this.perfectParticles[i];
            var alpha = pp.life / pp.maxLife;
            var sx = pp.x - camX + anchorX;
            var sy = groundY - pp.y;
            // Піксельна зірочка «плюсом»
            var ps = Math.max(1.5, pp.size * (0.5 + alpha * 0.5));
            ctx.fillStyle = pp.color;
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillRect(sx - ps / 2, sy - ps * 1.5, ps, ps * 3);
            ctx.fillRect(sx - ps * 1.5, sy - ps / 2, ps * 3, ps);
        }
        ctx.globalAlpha = 1;
    }

    renderDebris(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.debris.length; i++) {
            var db = this.debris[i];
            var alpha = Math.min(1, db.life / db.maxLife * 1.5);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(db.x - camX + anchorX, groundY - db.y);
            ctx.rotate(db.rot);
            ctx.fillStyle = db.color;
            ctx.fillRect(-db.size / 2, -db.size / 2, db.size, db.size);
            if (db.outline) {
                ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-db.size / 2, -db.size / 2, db.size, db.size);
            }
            ctx.restore();
        }
    }

    renderPerfectPopups(ctx, groundY, anchorX, camX) {
        var isHard = this.difficulty === "HARD";
        var popColor = isHard ? "#ffd700" : "#e8ecf2";
        for (var i = 0; i < this.perfectPopups.length; i++) {
            var po = this.perfectPopups[i];
            var alpha = po.life / po.maxLife;
            var sx = po.x - camX + anchorX;
            var sy = groundY - po.y;
            ctx.save();
            ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.globalAlpha = alpha;
            ctx.fillStyle = popColor;
            ctx.fillText("PERFECT!", sx, sy);
            ctx.restore();
        }
    }
}



