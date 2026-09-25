// ============================================================
// engine.js — ігрова логіка
// 5 ліг, 31 рівень, процедурні фони, 3 типи перешкод,
// SaveManager (localStorage), частинки, trail, демо-режим
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";
import { BackgroundCache } from "./cache.js";
import { KEYS } from "./keyboard.js";

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
            { id: 1,  leagueId: 1, name: "Перші кроки",             letters: ["А","П","Р","О"], speed: 165, spikeCount: 12, seed: 2001, bgTheme: "neon_start",              accentColor: "#00f6ff", rhythmGroups: false, skin: { id: "skin_1_1", name: "Стандартний Неон", renderType: "neon_base" } },
            { id: 2,  leagueId: 1, name: "Сусіди центру",           letters: ["В","І","Л","Д"], speed: 172, spikeCount: 13, seed: 2002, bgTheme: "sunset_city",             accentColor: "#ff9ed0", rhythmGroups: false, skin: { id: "skin_1_2", name: "Кібер-Око", renderType: "cyber_eye" } },
            { id: 3,  leagueId: 1, name: "Верхній центр",           letters: ["К","Е","Н","Г"], speed: 179, spikeCount: 14, seed: 2003, bgTheme: "cosmodrome",                 accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_1_3", name: "Прибулець", renderType: "retro_gamer" } },
            { id: 4,  leagueId: 1, name: "Нижній центр",            letters: ["М","И","Т","Ь"], speed: 186, spikeCount: 15, seed: 2004, bgTheme: "neon_highway",             accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_1_4", name: "Ніндзя", renderType: "throne" } },
            { id: 5,  leagueId: 1, name: "Верхні сусіди",           letters: ["У","Ц","Ш","Щ"], speed: 193, spikeCount: 16, seed: 2005, bgTheme: "laser_range",         accentColor: "#ff3355", rhythmGroups: false, skin: { id: "skin_1_5", name: "Лазерний приціл", renderType: "crosshair" } },
            { id: 6,  leagueId: 1, name: "Нижні сусіди",            letters: ["С","Ч","Б","Ю"], speed: 200, spikeCount: 17, seed: 2006, bgTheme: "digital_forest",     accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_6", name: "Матричний Піксель", renderType: "matrix_pixel" } },
            { id: 7,  leagueId: 1, name: "Краї середнього ряду",    letters: ["Ф","І","Ж","Є"], speed: 207, spikeCount: 18, seed: 2007, bgTheme: "storm_sky",            accentColor: "#9fb4ff", rhythmGroups: false, skin: { id: "skin_1_7", name: "Блискавка", renderType: "slice" } },
            { id: 8,  leagueId: 1, name: "Краї верхнього ряду",     letters: ["Й","Ц","З","Х"], speed: 214, spikeCount: 19, seed: 2008, bgTheme: "crystal_cave",            accentColor: "#b35cff", rhythmGroups: false, skin: { id: "skin_1_8", name: "Сяючий Кристал", renderType: "shining_diamond" } },
            { id: 9,  leagueId: 1, name: "Далекі кути",             letters: ["Я","Ч","Х","Ї"], speed: 221, spikeCount: 20, seed: 2009, bgTheme: "retro_arcade",         accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_1_9", name: "Джойстик", renderType: "double_frame" } },
            { id: 10, leagueId: 1, name: "Остання літера",          letters: ["А","В","Є","Ґ"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "pixel_night",             accentColor: "#62c13a", rhythmGroups: false, skin: { id: "skin_1_10", name: "Блок трави", renderType: "monolith" } },
            { id: 11, leagueId: 1, name: "Середній ряд",            letters: ["В","А","П","Р","О","Л"], speed: 235, spikeCount: 22, seed: 2011, bgTheme: "secret_base",            accentColor: "#39ffd0", rhythmGroups: false, skin: { id: "skin_1_11", name: "Радар", renderType: "radar" } },
            { id: 12, leagueId: 1, name: "Верхній ряд",             letters: ["У","К","Е","Н","Г","Ш"], speed: 242, spikeCount: 23, seed: 2012, bgTheme: "metro_tunnel",          accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_12", name: "Стріла Швидкості", renderType: "speed_arrow" } },
            { id: 13, leagueId: 1, name: "Нижній ряд",              letters: ["С","М","И","Т","Ь","Б"], speed: 249, spikeCount: 24, seed: 2013, bgTheme: "robot_factory",           accentColor: "#ffcc00", rhythmGroups: false, skin: { id: "skin_1_13", name: "Робот", renderType: "neon_cross" } },
            { id: 14, leagueId: 1, name: "Широкий середній ряд",    letters: ["Ф","І","В","Ж","Є","Ґ"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "twin_sun_planet",      accentColor: "#ff5a8a", rhythmGroups: false, skin: { id: "skin_1_14", name: "Слиз", renderType: "liquid_gradient" } },
            { id: 15, leagueId: 1, name: "Широкий верхній ряд",     letters: ["Й","Ц","У","Щ","З","Х"], speed: 263, spikeCount: 26, seed: 2015, bgTheme: "sky_city",           accentColor: "#bfe0ff", rhythmGroups: false, skin: { id: "skin_1_15", name: "Крилатий", renderType: "winged" } },
            { id: 16, leagueId: 1, name: "Широкий нижній ряд",      letters: ["Я","Ч","С","Ю","Є","Ї"], speed: 270, spikeCount: 28, seed: 2016, bgTheme: "stadium",          accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_16", name: "Кубок", renderType: "light_cup" } }
        ]
    },
    {
        id: 2,
        name: "Середня",
        levels: [
            { id: 17, leagueId: 2, name: "Зигзаг: верх і середина",  letters: ["Ц","В","К","П","Р","Г","Л","Щ"], speed: 240, spikeCount: 26, seed: 2101, bgTheme: "neon_rooftops", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_2_1", name: "Ретро-сонце", renderType: "synthwave_sun" } },
            { id: 18, leagueId: 2, name: "Зигзаг: середина і низ",   letters: ["І","С","А","И","Т","О","Б","Д"], speed: 250, spikeCount: 28, seed: 2102, bgTheme: "night_harbor", accentColor: "#66e0ff", rhythmGroups: false, skin: { id: "skin_2_2", name: "Кіберпанк Горизонт", renderType: "cyberpunk_horizon" } },
            { id: 19, leagueId: 2, name: "Зигзаг: верх і низ",       letters: ["Ч","У","М","Е","Н","Ь","Ш","Ю"], speed: 255, spikeCount: 30, seed: 2103, bgTheme: "pirate_bay", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_2_3", name: "Пірат", renderType: "glitch_cube" } },
            { id: 20, leagueId: 2, name: "Перші краї",               letters: ["Й","І","С","К","Д","З","Є","Ґ"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "treasury", accentColor: "#ffcc33", rhythmGroups: false, skin: { id: "skin_2_4", name: "Золотий Злиток", renderType: "gold_ingot" } },
            { id: 21, leagueId: 2, name: "П'ять на п'ять",           letters: ["Ф","Ч","У","А","И","Н","О","Б","Ж","Х"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "orbit_view", accentColor: "#39c6ff", rhythmGroups: false, skin: { id: "skin_2_5", name: "Орбіта", renderType: "orbit" } },
            { id: 22, leagueId: 2, name: "Усі стовпці",              letters: ["Я","Ц","В","М","Е","Р","Ь","Ш","Ю","Ї"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "dragon_lair", accentColor: "#ff7a3d", rhythmGroups: false, skin: { id: "skin_2_6", name: "Дракон", renderType: "stalagmite" } },
            { id: 23, leagueId: 2, name: "Далекі сусіди",            letters: ["Й","І","С","К","П","Т","Г","Л","Щ","Є"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "pixel_cave", accentColor: "#33d6d0", rhythmGroups: false, skin: { id: "skin_2_7", name: "Алмазна руда", renderType: "equalizer" } },
            { id: 24, leagueId: 2, name: "Фінал ліги",               letters: ["Ф","Ц","С","А","Е","О","Ш","Ю","З","Ґ"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "knight_castle", accentColor: "#8fa3ff", rhythmGroups: false, skin: { id: "skin_2_8", name: "Лицарський щит", renderType: "shield" } }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Ц","У","К","Ф","В","П","Н","Ш","З","О","Д","Є"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "pixel_snow", accentColor: "#bff4ff", rhythmGroups: false, skin: { id: "skin_3_1", name: "Льодовий блок", renderType: "plasma" } },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["І","А","Я","С","И","М","Р","Л","Ж","Ь","Ю","Ґ"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "pixel_ocean", accentColor: "#39ffd0", rhythmGroups: false, skin: { id: "skin_3_2", name: "Батискаф", renderType: "vortex" } },
            { id: 27, leagueId: 3, name: "Три поверхи",             letters: ["Й","У","Е","Ф","А","Ч","М","Г","Щ","Х","Ї","Р","Т","Б"], speed: 340, spikeCount: 46, seed: 2203, bgTheme: "pixel_desert", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_3_3", name: "Скриня зі скарбом", renderType: "quantum_barrier" } },
            { id: 28, leagueId: 3, name: "Хаотичний мікс",          letters: ["Ц","К","В","П","Я","С","И","Й","Н","Ш","З","Ї","О","Д","Є","Б"], speed: 360, spikeCount: 50, seed: 2204, bgTheme: "pixel_islands", accentColor: "#d68bff", rhythmGroups: false, skin: { id: "skin_3_4", name: "Метеор", renderType: "meteor" } }
        ]
    },
    {
        id: 4,
        name: "Майстер",
        levels: [
            { id: 29, leagueId: 4, name: "Серце клавіатури",        letters: ["Ц","У","К","Е","І","В","А","П","Ч","С","М","И","Н","Г","Ш","Щ","Р","О","Л","Д","Т","Ь","Б","Ю"], speed: 390, spikeCount: 50, seed: 2301, bgTheme: "black_hole", accentColor: "#ffb35c", rhythmGroups: false, skin: { id: "skin_4_1", name: "Галактика", renderType: "galaxy" } },
            { id: 30, leagueId: 4, name: "Гранд Мастер",            letters: ["Й","Ц","У","К","Е","Ф","І","В","А","П","Я","Ч","С","М","И","Н","Г","Ш","З","Х","Р","О","Л","Д","Ж","Є","Т","Ь","Б","Ю"], speed: 418, spikeCount: 55, seed: 2302, bgTheme: "throne_room", accentColor: "#ffd700", rhythmGroups: false, skin: { id: "skin_4_2", name: "Корона Майстра", renderType: "master_crown" } }
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

export const ALL_LEVELS = LEVELS_CONFIG.reduce(function (acc, league) {
    return acc.concat(league.levels);
}, []);

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

    // Кібер-Око: механічне око, зіниця роззирається, повіка іноді кліпає
    cyber_eye: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#101828";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#1c2a40";
        ctx.fillRect(-h, -h, size, size * 0.14);
        ctx.fillRect(-h, h - size * 0.14, size, size * 0.14);
        ctx.fillStyle = "#e8f6ff";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        var lookX = Math.sin(time * 0.0017) * size * 0.1;
        var lookY = Math.sin(time * 0.0011 + 1) * size * 0.05;
        ctx.fillStyle = "#00ffcc";
        ctx.beginPath();
        ctx.arc(lookX, lookY, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#001a14";
        ctx.beginPath();
        ctx.arc(lookX, lookY, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(lookX - size * 0.09, lookY - size * 0.09, size * 0.05, size * 0.05);
        // Кліпання: повіка на мить закриває око
        if ((time % 4000) < 150) {
            ctx.fillStyle = "#1c2a40";
            ctx.fillRect(-size * 0.32, -size * 0.32, size * 0.64, size * 0.64);
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(-size * 0.3, -size * 0.02, size * 0.6, size * 0.04);
        }
        drawSkinFrame(ctx, size, "#00ffcc");
    },

    // Прибулець: піксельний зелений інопланетянин, ніжки перебирають
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

    // Ніндзя: фіолетовий кубик із червоною пов'язкою та злими білими очима в прорізі маски
    throne: function (ctx, size, time) {
        var h = size / 2;
        var body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0, "#4a2475");
        body.addColorStop(1, "#1c0b33");
        ctx.fillStyle = body;
        ctx.fillRect(-h, -h, size, size);
        // Червона пов'язка з вузликом праворуч
        ctx.fillStyle = "#e8173c";
        ctx.fillRect(-h, -size * 0.38, size, size * 0.13);
        ctx.fillStyle = "#ff5a70";
        ctx.fillRect(-h, -size * 0.38, size, size * 0.03);
        var wave = Math.sin(time * 0.008) * size * 0.03;
        ctx.fillStyle = "#c10f2e";
        ctx.beginPath();
        ctx.moveTo(size * 0.3, -size * 0.32);
        ctx.lineTo(size * 0.46, -size * 0.2 + wave);
        ctx.lineTo(size * 0.38, -size * 0.16 + wave);
        ctx.closePath();
        ctx.fill();
        // Проріз маски
        ctx.fillStyle = "#07040d";
        ctx.fillRect(-h + size * 0.06, -size * 0.12, size - size * 0.12, size * 0.26);
        // Злі очі
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-size * 0.36, -size * 0.07);
        ctx.lineTo(-size * 0.07, size * 0.0);
        ctx.lineTo(-size * 0.09, size * 0.09);
        ctx.lineTo(-size * 0.34, size * 0.07);
        ctx.closePath();
        ctx.moveTo(size * 0.36, -size * 0.07);
        ctx.lineTo(size * 0.07, size * 0.0);
        ctx.lineTo(size * 0.09, size * 0.09);
        ctx.lineTo(size * 0.34, size * 0.07);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#07040d";
        ctx.fillRect(-size * 0.17, size * 0.01, size * 0.07, size * 0.07);
        ctx.fillRect(size * 0.1, size * 0.01, size * 0.07, size * 0.07);
        // Нижня частина маски
        ctx.fillStyle = "#2a1244";
        ctx.fillRect(-h, size * 0.24, size, size * 0.26);
        drawSkinFrame(ctx, size, "#bb55ff");
    },

    // Лазерний приціл: кільце з рисками обертається, центр пульсує, лазерна точка
    crosshair: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#14060a";
        ctx.fillRect(-h, -h, size, size);
        ctx.save();
        ctx.rotate(time * 0.0015);
        ctx.strokeStyle = "#ff3355";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.28, 0.25, Math.PI / 2 - 0.25);
        ctx.moveTo(Math.cos(Math.PI / 2 + 0.25) * size * 0.28, Math.sin(Math.PI / 2 + 0.25) * size * 0.28);
        ctx.arc(0, 0, size * 0.28, Math.PI / 2 + 0.25, Math.PI - 0.25);
        ctx.moveTo(Math.cos(Math.PI + 0.25) * size * 0.28, Math.sin(Math.PI + 0.25) * size * 0.28);
        ctx.arc(0, 0, size * 0.28, Math.PI + 0.25, Math.PI * 1.5 - 0.25);
        ctx.moveTo(Math.cos(Math.PI * 1.5 + 0.25) * size * 0.28, Math.sin(Math.PI * 1.5 + 0.25) * size * 0.28);
        ctx.arc(0, 0, size * 0.28, Math.PI * 1.5 + 0.25, Math.PI * 2 - 0.25);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#ff3355";
        var t = size * 0.05;
        ctx.fillRect(-t / 2, -h + size * 0.1, t, size * 0.18);
        ctx.fillRect(-t / 2, h - size * 0.28, t, size * 0.18);
        ctx.fillRect(-h + size * 0.1, -t / 2, size * 0.18, t);
        ctx.fillRect(h - size * 0.28, -t / 2, size * 0.18, t);
        var pulse = 0.5 + 0.5 * Math.sin(time * 0.01);
        ctx.fillStyle = "rgba(255, 60, 90, " + (0.3 + 0.3 * pulse).toFixed(2) + ")";
        ctx.fillRect(-size * 0.1, -size * 0.1, size * 0.2, size * 0.2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.08, size * 0.08);
        drawSkinFrame(ctx, size, "#ff3355");
    },

    // Матричний Піксель: по кубику біжать зелені стовпчики «коду»
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

    // Джойстик: кубик-геймпад із хрестовиною та кнопками, що натискаються
    double_frame: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#2a2f3a";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#1a1e26";
        ctx.fillRect(-h + size * 0.08, -size * 0.2, size * 0.84, size * 0.42);
        // Хрестовина
        var dx = -size * 0.22;
        var d = size * 0.08;
        ctx.fillStyle = "#e8ecf2";
        ctx.fillRect(dx - d / 2, -d * 1.5, d, d * 3);
        ctx.fillRect(dx - d * 1.5, -d / 2, d * 3, d);
        // Чотири кнопки: одна «натиснута» по черзі
        var pressed = Math.floor(time / 250) % 4;
        var bx = size * 0.22;
        var buttons = [[0, -size * 0.1, "#ffe14d"], [size * 0.1, 0, "#ff3355"], [0, size * 0.1, "#39ff88"], [-size * 0.1, 0, "#00b4ff"]];
        for (var i = 0; i < buttons.length; i++) {
            var r = size * (i === pressed ? 0.04 : 0.055);
            ctx.fillStyle = buttons[i][2];
            ctx.beginPath();
            ctx.arc(bx + buttons[i][0], buttons[i][1], r, 0, Math.PI * 2);
            ctx.fill();
        }
        // Екран-смужка зверху та світлодіод
        ctx.fillStyle = "#0a0f14";
        ctx.fillRect(-size * 0.3, -h + size * 0.1, size * 0.6, size * 0.12);
        ctx.fillStyle = "#39ff88";
        ctx.fillRect(-size * 0.28 + ((time * 0.0005) % 1) * size * 0.5, -h + size * 0.12, size * 0.06, size * 0.08);
        ctx.fillStyle = Math.sin(time * 0.006) > 0 ? "#ff3355" : "#551122";
        ctx.fillRect(-size * 0.04, size * 0.3, size * 0.08, size * 0.06);
        drawSkinFrame(ctx, size, "#ff4488");
    },

    // Блок трави: піксельний блок у стилі блочного світу — трава зверху, земля знизу
    monolith: function (ctx, size, time) {
        drawPixelArt(ctx, size, [
            "GgGGGgGG",
            "GGgGgGGg",
            "gdGgdGgd",
            "ddDdddsd",
            "dsddDddd",
            "dddsddDd",
            "Ddddddsd",
            "ddDsdddd"
        ], { G: "#62c13a", g: "#4e9e2c", d: "#8a5a33", D: "#6b4424", s: "#a47148" });
        drawSkinFrame(ctx, size, "#9be86f");
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

    // Стріла Швидкості: жирні подвійні шеврони, що мчать уперед
    speed_arrow: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#1f1a00";
        ctx.fillRect(-h, -h, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.rect(-h, -h, size, size);
        ctx.clip();
        var shift = ((time * 0.0012) % 1) * size * 0.34;
        for (var i = -1; i < 3; i++) {
            var x = -size * 0.42 + i * size * 0.34 + shift;
            ctx.fillStyle = i % 2 === 0 ? "#ffff00" : "#ffb800";
            ctx.beginPath();
            ctx.moveTo(x, -size * 0.32);
            ctx.lineTo(x + size * 0.14, -size * 0.32);
            ctx.lineTo(x + size * 0.32, 0);
            ctx.lineTo(x + size * 0.14, size * 0.32);
            ctx.lineTo(x, size * 0.32);
            ctx.lineTo(x + size * 0.18, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        drawSkinFrame(ctx, size, "#ffff00");
    },

    // Робот: металевий кубик із візором, світними очима (кліпають) і LED-ротом
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

    // Кубок: блискучий золотий трофей із зіркою — нагорода за фінал Ліги 1
    light_cup: function (ctx, size, time) {
        var h = size / 2;
        var bg = ctx.createLinearGradient(0, -h, 0, h);
        bg.addColorStop(0, "#0a4a2e");
        bg.addColorStop(1, "#04200f");
        ctx.fillStyle = bg;
        ctx.fillRect(-h, -h, size, size);
        var gold = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
        gold.addColorStop(0, "#c98a00");
        gold.addColorStop(0.4, "#fff2a0");
        gold.addColorStop(1, "#d99a00");
        ctx.fillStyle = gold;
        // Чаша
        ctx.beginPath();
        ctx.moveTo(-size * 0.26, -size * 0.3);
        ctx.lineTo(size * 0.26, -size * 0.3);
        ctx.lineTo(size * 0.2, size * 0.02);
        ctx.quadraticCurveTo(0, size * 0.14, -size * 0.2, size * 0.02);
        ctx.closePath();
        ctx.fill();
        // Ручки
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = Math.max(1.5, size * 0.05);
        ctx.beginPath();
        ctx.arc(-size * 0.27, -size * 0.17, size * 0.09, Math.PI * 0.5, Math.PI * 1.5);
        ctx.moveTo(size * 0.27, -size * 0.26);
        ctx.arc(size * 0.27, -size * 0.17, size * 0.09, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        // Ніжка та підставка
        ctx.fillStyle = "#d99a00";
        ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.14);
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(-size * 0.2, size * 0.22, size * 0.4, size * 0.14);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-size * 0.14, size * 0.26, size * 0.28, size * 0.05);
        // Зірка на чаші
        ctx.fillStyle = "#ffffff";
        var outerR = size * 0.09;
        var innerR = size * 0.04;
        ctx.beginPath();
        for (var i = 0; i < 10; i++) {
            var r = i % 2 === 0 ? outerR : innerR;
            var a = -Math.PI / 2 + i * Math.PI / 5;
            if (i === 0) { ctx.moveTo(Math.cos(a) * r, -size * 0.13 + Math.sin(a) * r); }
            else { ctx.lineTo(Math.cos(a) * r, -size * 0.13 + Math.sin(a) * r); }
        }
        ctx.closePath();
        ctx.fill();
        // Відблиск, що перебігає
        var glint = (time * 0.0009) % 1.6;
        if (glint < 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(-size * 0.24 + glint * size * 0.44, -size * 0.28, size * 0.05, size * 0.26);
        }
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
        var gradient = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
        gradient.addColorStop(0, "#220066");
        gradient.addColorStop(0.4, "#9944ff");
        gradient.addColorStop(0.7, "#ffaa00");
        gradient.addColorStop(1, "#ffdd44");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        renderSkinGlow(ctx, size, "#00ddff", 10);
        ctx.strokeStyle = "#00ddff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size * 0.15);
        ctx.lineTo(size / 2, -size * 0.15);
        ctx.stroke();
    },

    // Пірат: кубик із червоною банданою, пов'язкою на оці, вусами та золотим зубом
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

    // Скриня зі скарбом: дерев'яна скриня із золотими оковами й замком, що виблискує
    quantum_barrier: function (ctx, size, time) {
        var h = size / 2;
        ctx.fillStyle = "#8a4b1c";
        ctx.fillRect(-h, -h, size, size);
        ctx.fillStyle = "#6b3812";
        for (var i = 0; i < 4; i++) {
            ctx.fillRect(-h, -h + size * 0.08 + i * size * 0.25, size, size * 0.04);
        }
        // Кришка
        ctx.fillStyle = "#a35d25";
        ctx.fillRect(-h, -h, size, size * 0.36);
        ctx.fillStyle = "#5a2e0e";
        ctx.fillRect(-h, -h + size * 0.34, size, size * 0.05);
        // Золоті окови
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-h + size * 0.1, -h, size * 0.1, size);
        ctx.fillRect(h - size * 0.2, -h, size * 0.1, size);
        // Замок
        ctx.fillStyle = "#ffd84a";
        ctx.fillRect(-size * 0.1, -size * 0.2, size * 0.2, size * 0.24);
        ctx.fillStyle = "#3a2000";
        ctx.fillRect(-size * 0.025, -size * 0.12, size * 0.05, size * 0.1);
        // Відблиск
        var glint = Math.max(0, Math.sin(time * 0.004));
        if (glint > 0.2) {
            ctx.fillStyle = "rgba(255, 255, 255, " + glint.toFixed(2) + ")";
            var gs = size * 0.04;
            ctx.fillRect(size * 0.05 - gs / 2, -size * 0.24 - gs * 1.5, gs, gs * 3);
            ctx.fillRect(size * 0.05 - gs * 1.5, -size * 0.24 - gs / 2, gs * 3, gs);
        }
        drawSkinFrame(ctx, size, "#ffcc33");
    },

    // Метеор: розпечений камінь із тріщинами лави та вогняним хвостом
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

// Скіни, які малюються на темному тлі без власної рамки й зливаються з фоном:
// обгортаємо їх, додаючи неонову рамку в кольорі скіна
const FRAMELESS_SKIN_COLORS = {
    cyberpunk_horizon: "#00ddff"
};

for (const skinKey of Object.keys(FRAMELESS_SKIN_COLORS)) {
    const baseRenderer = SKIN_RENDERERS[skinKey];
    const frameColor = FRAMELESS_SKIN_COLORS[skinKey];
    SKIN_RENDERERS[skinKey] = function (ctx, size, time, player) {
        baseRenderer(ctx, size, time, player);
        drawSkinFrame(ctx, size, frameColor);
    };
}

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
    const baseGapTime = reactionTimeForLevel(level.id);
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
        const switchHand = rng() < HAND_SWITCH_CHANCE;
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

    if (level.rhythmGroups) {
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
        settings: { difficulty: "EASY", hitWindow: "normal", speed: "normal", activeSkin: null },
        progress: { unlocked: 1, unlockedSkins: [], levels: levels }
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
    if (raw.settings && typeof raw.settings.activeSkin === "string" && raw.settings.activeSkin.length > 0) {
        clean.settings.activeSkin = raw.settings.activeSkin;
    }
    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            clean.progress.unlocked = Math.min(31, Math.max(1, Math.floor(unlocked)));
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
            if (levelId < 31) {
                const currentLevel = getLevelById(levelId);
                if (currentLevel) {
                    const currentLeague = LEVELS_CONFIG.find(function (lg) { return lg.id === currentLevel.leagueId; });
                    if (currentLeague) {
                        const idxInLeague = currentLeague.levels.indexOf(currentLevel);
                        if (idxInLeague >= 0 && idxInLeague < currentLeague.levels.length - 1) {
                            const nextLevel = currentLeague.levels[idxInLeague + 1];
                            saveData.progress.unlocked = Math.max(saveData.progress.unlocked, nextLevel.id);
                        } else if (currentLeague.id < 5) {
                            const nextLeague = LEVELS_CONFIG[currentLeague.id];
                            if (nextLeague && nextLeague.levels.length > 0) {
                                saveData.progress.unlocked = Math.max(saveData.progress.unlocked, nextLeague.levels[0].id);
                            }
                        }
                    }
                }
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

    getActiveSkin() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.activeSkin || null;
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

    getLevelAchievement(levelId) {
        if (!saveData) {
            this.load();
        }
        const entry = saveData.progress.levels[String(levelId)];
        return (entry && entry.perfect) || null;
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
        this.effectiveSpeed = this.level.speed * (SPEED_MULTIPLIERS[speed] ?? 1.0);
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;
        this.leagueInfo = leagueInfo || null;
        this.hitWindowSetting = hitWindow === "large" ? "large" : "normal";
        this.speedSetting = speed === "slow" || speed === "fast" ? speed : "normal";

        this.onJump = null;
        this.onExplode = null;
        this.onVictory = null;
        this.currentTime = 0;

        const windows = hitWindowTimes(this.level.id);
        const multiplier = this.hitWindowSetting === "large" ? 2 : 1;
        this.okPx = this.effectiveSpeed * windows.okTime * multiplier;
        this.perfectPx = this.effectiveSpeed * windows.perfectTime * multiplier;

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
            spike.state = "cleared";
            this.score += calculateHitScore(true, this.scoreConfig, perfect);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
        }
    }

    jump(distance, perfect) {
        const computedVy = GRAVITY * distance / (2 * this.effectiveSpeed);
        this.player.vy = computedVy > MIN_JUMP_VELOCITY ? computedVy : MIN_JUMP_VELOCITY;
        this.player.onGround = false;
        this.pulse = 1;
        if (perfect) {
            this.combo++;
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
        if (typeof this.onJump === "function") {
            this.onJump();
        }
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
        const count = isDemon ? 20 : 8;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
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
            spike.state = "cleared";
            this.score += calculateHitScore(true, this.scoreConfig, perfect);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        if (this.difficulty === "HARD") {
            this.explode();
            return { result: "exploded", letter: letter };
        }

        return { result: "wrong", letter: letter };
    }

    update(dt) {
        if (this.outcome === "won") {
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
                if (gap > 0 && gap <= this.okPx * 0.5) {
                    target.state = "cleared";
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
                    this.explode();
                    return;
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
                spike.state = "hit";
                this.explode();
                return;
            }
            if (spike.x + halfW < this.player.x) {
                spike.state = "cleared";
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
        var groundY = H * 0.64;
        var anchorX = W * PLAYER_ANCHOR;
        var camX = this.player.x;

        this.bgCache.setTheme(this.level.bgTheme);
        this.bgCache.resize(W, H);
        if (this.bgCache.shouldUpdate(time)) {
            var self = this;
            this.bgCache.render(function (cacheCtx) {
                BackgroundRenderer.render(cacheCtx, self.level.bgTheme, W, H, groundY, time, self.effectiveSpeed, self.level.accentColor, self.level.id);
            }, time);
        }
        this.bgCache.drawImage(ctx);
        this.renderWaves(ctx, W, groundY);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        this.renderDebris(ctx, groundY, anchorX, camX);
        this.renderPerfectParticles(ctx, groundY, anchorX, camX);
        this.renderPerfectPopups(ctx, groundY, anchorX, camX);
        if (!this.demoMode) {
            this.renderProgressBar(ctx, W);
        }
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

        const step = 140;
        const offset = camX % step;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.12)";
        ctx.lineWidth = 2;
        for (let x = -offset; x <= W; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, groundY + 6);
            ctx.lineTo(x - 28, groundY + 34);
            ctx.stroke();
        }
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
        if (screenX < -60 || screenX > W + 60) {
            return;
        }
        var finishGrad = ctx.createLinearGradient(screenX - 8, 0, screenX + 8, 0);
        finishGrad.addColorStop(0, "transparent");
        finishGrad.addColorStop(0.5, "rgba(57, 255, 136, 0.6)");
        finishGrad.addColorStop(1, "transparent");
        ctx.fillStyle = finishGrad;
        ctx.fillRect(screenX - 22, groundY - 170, 44, 170);
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 6;
        ctx.strokeRect(screenX - 8, groundY - 170, 16, 170);
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

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.6)" : "rgba(20, 10, 20, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    renderObstacles(ctx, W, groundY, anchorX, camX) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";

        for (const spike of this.spikes) {
            const screenX = spike.x - camX + anchorX;
            if (screenX < -80 || screenX > W + 80) {
                continue;
            }
            const cleared = spike.state === "cleared";
            const accentColor = this.level.accentColor || "#ff2ea6";

            if (spike.type === "saw") {
                const sawRadius = SPIKE_H * 0.6;
                this.drawSaw(ctx, screenX, groundY, sawRadius, spike.rotationAngle || 0, accentColor, cleared);
            } else if (spike.type === "double_spike") {
                this.drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared);
            } else {
                this.drawSpike(ctx, screenX, groundY, accentColor, cleared);
            }

            if (!cleared) {
                var letterY = spike.type === "saw" ? groundY - SPIKE_H * 0.6 - 20 : groundY - SPIKE_H - 12;
                // Темна обводка — літеру добре видно на будь-якому фоні (пісок, сніг, небо)
                ctx.lineJoin = "round";
                ctx.lineWidth = 5;
                ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
                ctx.strokeText(spike.letter, screenX, letterY);
                ctx.fillStyle = "#ffe14d";
                ctx.fillText(spike.letter, screenX, letterY);
            }
        }
        ctx.restore();
    }

    // ---------- Кубик та частинки ----------

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        for (const point of this.player.trail) {
            const dx = point.x - this.player.x;
            const size = CUBE_SIZE * 0.55;
            ctx.fillStyle = "rgba(0, 246, 255, " + Math.max(0, point.alpha * 0.35).toFixed(3) + ")";
            ctx.fillRect(
                anchorX + dx - size / 2,
                groundY - point.y - CUBE_SIZE / 2 - size / 2,
                size,
                size
            );
        }

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

        if (achievement === "hard") {
            var goldGlow = ctx.createRadialGradient(0, 0, CUBE_SIZE * 0.3, 0, 0, CUBE_SIZE * 0.9);
            goldGlow.addColorStop(0, "rgba(255, 170, 0, 0.5)");
            goldGlow.addColorStop(1, "transparent");
            ctx.fillStyle = goldGlow;
            ctx.fillRect(-CUBE_SIZE * 0.9, -CUBE_SIZE * 0.9, CUBE_SIZE * 1.8, CUBE_SIZE * 1.8);
            ctx.strokeStyle = "rgba(255, 170, 0, 0.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
        }

        if (achievement === "easy") {
            ctx.strokeStyle = "#d4dce8";
            ctx.lineWidth = 1.8;
            ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
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



