// ============================================================
// levels.js — конфігурація 5 ліг і 31 рівня, бос, порядок рівнів
// ============================================================


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
            { id: 10, leagueId: 1, name: "Правий мізинець",         letters: ["А","В","Є","Ж"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "pixel_night",             accentColor: "#62c13a", rhythmGroups: false, skin: { id: "skin_1_10", name: "Нічна сова", renderType: "monolith" } },
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
            { id: 14, leagueId: 1, name: "Широкий середній ряд",    letters: ["Ф","І","В","Ж","Є","Д"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "twin_sun_planet",      accentColor: "#ff5a8a", rhythmGroups: false, skin: { id: "skin_1_14", name: "Слиз", renderType: "liquid_gradient" } },
            { id: 50, leagueId: 1, name: "Слова-послання",          words: ["СВІТЛО","СВІТ","ЛІТО","ЛІС","СЛОВО","ТІЛО","СТІЛ","СОЛО"], speed: 254, spikeCount: 26, seed: 2035, tuneAs: 14, bgTheme: "strange_town", accentColor: "#ff3a3a", rhythmGroups: false, skin: { id: "skin_1_x13", name: "Рація", renderType: "walkie_cube" } },
            { id: 38, leagueId: 1, name: "Тренування помилок",      letters: ["Ж","Є","Х","Ї","Щ","Ю"], adaptive: { pool: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А","П","Р","О","Л","Д","Ж","Є","Я","Ч","С","М","И","Т","Ь","Б","Ю"], count: 6 }, speed: 256, spikeCount: 24, seed: 2023, tuneAs: 14, bgTheme: "dungeon_depths", accentColor: "#5ac8ff", rhythmGroups: false, skin: { id: "skin_1_x7", name: "Страж підземелля", renderType: "dungeon_guard" } },
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
            { id: 20, leagueId: 2, name: "Перші краї",               letters: ["Й","І","С","К","Д","З","Є","Ї"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "treasury", accentColor: "#ffcc33", rhythmGroups: false, skin: { id: "skin_2_4", name: "Золотий Злиток", renderType: "gold_ingot" } },
            { id: 41, leagueId: 2, name: "Стрибки між рядами",       letters: ["У","В","С","К","А","М","Н","Р","Т"], columnJumps: true, speed: 261, spikeCount: 29, seed: 2026, tuneAs: 20, bgTheme: "fiery_forge", accentColor: "#ff7a2a", rhythmGroups: false, skin: { id: "skin_2_x2", name: "Коваль", renderType: "blacksmith" } },
            { id: 42, leagueId: 2, name: "Довгі слова",              words: ["КАПСУЛА","КРАТЕР","АНТЕНА","ПЛАНЕТА","РАКЕТА","ПЕРЕКУС","КЛАПАН","СТАКАН"], speed: 262, spikeCount: 33, seed: 2027, tuneAs: 20, bgTheme: "planet_colony", accentColor: "#ffa24a", rhythmGroups: false, skin: { id: "skin_2_x3", name: "Робот-вантажник", renderType: "power_loader" } },
            { id: 21, leagueId: 2, name: "П'ять на п'ять",           letters: ["Ф","Ч","У","А","И","Н","О","Б","Ж","Х"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "orbit_view", accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_2_5", name: "Орбіта", renderType: "orbit" } },
            { id: 43, leagueId: 2, name: "Рідкісні літери",          letters: ["Ц","Є","Ї","Щ","Ю","Я","Ь","Ж","Ф","Х"], speed: 270, spikeCount: 34, seed: 2028, tuneAs: 21, bgTheme: "hunter_ship", accentColor: "#5aff9a", rhythmGroups: false, skin: { id: "skin_2_x4", name: "Інопланетний артефакт", renderType: "alien_artifact" } },
            { id: 22, leagueId: 2, name: "Усі стовпці",              letters: ["Я","Ц","В","М","Е","Р","Ь","Ш","Ю","Ї"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "dragon_lair", accentColor: "#ff7a3d", rhythmGroups: false, skin: { id: "skin_2_6", name: "Дракон", renderType: "stalagmite" } },
            { id: 23, leagueId: 2, name: "Далекі сусіди",            letters: ["Й","І","С","К","П","Т","Г","Л","Щ","Є"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "pixel_cave", accentColor: "#33d6d0", rhythmGroups: false, skin: { id: "skin_2_7", name: "Алмазна руда", renderType: "equalizer" } },
            { id: 44, leagueId: 2, name: "Тренування помилок: вершина", letters: ["Ж","Є","Х","Ї","Щ","Ш","Ю","Ф","Ц","Я"], adaptive: { pool: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А","П","Р","О","Л","Д","Ж","Є","Я","Ч","С","М","И","Т","Ь","Б","Ю"], count: 10 }, speed: 282, spikeCount: 38, seed: 2029, tuneAs: 23, bgTheme: "obsidian_peak", accentColor: "#b06bff", rhythmGroups: false, skin: { id: "skin_2_x5", name: "Обсидіановий голем", renderType: "obsidian_golem" } },
            { id: 24, leagueId: 2, name: "Фінал ліги",               letters: ["Ф","Ц","С","А","Е","О","Ш","Ю","З","Ї"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "knight_castle", accentColor: "#8fa3ff", rhythmGroups: false, skin: { id: "skin_2_8", name: "Лицарський щит", renderType: "shield" } },
            { id: 45, leagueId: 2, name: "Битва в ангарі",           words: ["КОРОЛЕВА","ВУЛИК","КРИЛО","НАВКОЛО","ВОРОН","КАРАВАН","РУКАВ","ВИЛКА","НОРКА","ЛАВИНА"], speed: 300, spikeCount: 42, seed: 2030, tuneAs: 24, bgTheme: "hangar_bay", accentColor: "#ffa21a", rhythmGroups: false, skin: { id: "skin_2_x6", name: "Корона вулика", renderType: "hive_crown" } }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Ц","У","К","Ф","В","П","Н","Ш","З","О","Д","Є"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "pixel_snow", accentColor: "#bff4ff", rhythmGroups: false, skin: { id: "skin_3_1", name: "Льодовий блок", renderType: "plasma" } },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["І","А","Я","С","И","М","Р","Л","Ж","Ь","Ю","Б"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "pixel_ocean", accentColor: "#39ffd0", rhythmGroups: false, skin: { id: "skin_3_2", name: "Батискаф", renderType: "vortex" } },
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
            { id: 31, leagueId: 5, name: "ФІНАЛЬНИЙ ДЕМОН",        letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є"], speed: 450, spikeCount: 60, seed: 2401, bgTheme: "pixel_nether", accentColor: "#ff1111", rhythmGroups: true, skin: { id: "skin_5_1", name: "ЛОРД ДЕМОНІВ", renderType: "demon_lord" } }
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

export { getLevelById };
