// ============================================================
// engine.js — ігрова логіка
// 5 ліг, 31 рівень, процедурні фони, 3 типи перешкод,
// SaveManager (localStorage), частинки, trail, демо-режим
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";

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
            { id: 1,  leagueId: 1, name: "Перші кроки",             letters: ["А","О","В","Л"], speed: 165, spikeCount: 12, seed: 2001, bgTheme: "cyber_grid",              accentColor: "#00f6ff", rhythmGroups: false, skin: { id: "skin_1_1", name: "Стандартний Неон", renderType: "neon_base" } },
            { id: 2,  leagueId: 1, name: "Голосний старт",          letters: ["У","К","Е","П"], speed: 172, spikeCount: 13, seed: 2002, bgTheme: "parallax_city",             accentColor: "#aa44ff", rhythmGroups: false, skin: { id: "skin_1_2", name: "Кібер-Око", renderType: "cyber_eye" } },
            { id: 3,  leagueId: 1, name: "Ближче до країв",         letters: ["Ф","І","Д","Ж"], speed: 179, spikeCount: 14, seed: 2003, bgTheme: "starfield",                 accentColor: "#00d4aa", rhythmGroups: false, skin: { id: "skin_1_3", name: "Ретро-Геймер", renderType: "retro_gamer" } },
            { id: 4,  leagueId: 1, name: "Нижній лівий фланг",     letters: ["Я","Ч","С","М"], speed: 186, spikeCount: 15, seed: 2004, bgTheme: "energy_grid",             accentColor: "#6a5acd", rhythmGroups: false, skin: { id: "skin_1_4", name: "Трон", renderType: "throne" } },
            { id: 5,  leagueId: 1, name: "Ліва вертикаль",          letters: ["Й","Ц","Ф","І","Я","Ч"], speed: 193, spikeCount: 16, seed: 2005, bgTheme: "cyber_columns",         accentColor: "#0066ff", rhythmGroups: false, skin: { id: "skin_1_5", name: "Приціл", renderType: "crosshair" } },
            { id: 6,  leagueId: 1, name: "Права вертикаль",         letters: ["Ш","Щ","З","Х","Ї","Ґ"], speed: 200, spikeCount: 17, seed: 2006, bgTheme: "geo_landscape",     accentColor: "#00ff41", rhythmGroups: false, skin: { id: "skin_1_6", name: "Матричний Піксель", renderType: "matrix_pixel" } },
            { id: 7,  leagueId: 1, name: "Ядро клавіатури",         letters: ["Е","Н","А","П","И","Т"], speed: 207, spikeCount: 18, seed: 2007, bgTheme: "pulsar_core",            accentColor: "#ff8855", rhythmGroups: false, skin: { id: "skin_1_7", name: "Слайс", renderType: "slice" } },
            { id: 8,  leagueId: 1, name: "Нижній правий фланг",     letters: ["И","Т","Ь","Б","Ю","Є"], speed: 214, spikeCount: 19, seed: 2008, bgTheme: "demon",            accentColor: "#9944dd", rhythmGroups: false, skin: { id: "skin_1_8", name: "Сяючий Алмаз", renderType: "shining_diamond" } },
            { id: 9,  leagueId: 1, name: "Ліва діагональ",          letters: ["Й","У","І","В","Я","С"], speed: 221, spikeCount: 20, seed: 2009, bgTheme: "scanline_sweep",         accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_1_9", name: "Подвійна Рамка", renderType: "double_frame" } },
            { id: 10, leagueId: 1, name: "Права діагональ",         letters: ["Ш","Х","Л","Д","Ь","Б"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "hyperspace_tunnel",       accentColor: "#8899bb", rhythmGroups: false, skin: { id: "skin_1_10", name: "Моноліт", renderType: "monolith" } },
            { id: 11, leagueId: 1, name: "Шиплячий мікс",           letters: ["Ч","Щ","Ж","Ц","Ю","Ґ"], speed: 235, spikeCount: 22, seed: 2011, bgTheme: "toxic_waste",            accentColor: "#ccccee", rhythmGroups: false, skin: { id: "skin_1_11", name: "Радар", renderType: "radar" } },
            { id: 12, leagueId: 1, name: "Вокальний лабіринт",      letters: ["У","Е","А","О","И","І"], speed: 242, spikeCount: 23, seed: 2012, bgTheme: "neon_rain",          accentColor: "#39ff14", rhythmGroups: false, skin: { id: "skin_1_12", name: "Стріла Швидкості", renderType: "speed_arrow" } },
            { id: 13, leagueId: 1, name: "Далекі куточки",          letters: ["Й","Ф","Я","Х","Ї","Є"], speed: 249, spikeCount: 24, seed: 2013, bgTheme: "bezier_waves",           accentColor: "#e5ff00", rhythmGroups: false, skin: { id: "skin_1_13", name: "Неоновий Хрест", renderType: "neon_cross" } },
            { id: 14, leagueId: 1, name: "Центральні сусіди",       letters: ["К","Г","Р","Л","М","Т"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "binary_star",      accentColor: "#ff3800", rhythmGroups: false, skin: { id: "skin_1_14", name: "Рідкий Градієнт", renderType: "liquid_gradient" } },
            { id: 15, leagueId: 1, name: "Неонові крила",           letters: ["Й","Ц","Ф","Х","Ї","Ґ"], speed: 263, spikeCount: 26, seed: 2015, bgTheme: "aurora_wings",           accentColor: "#00f6ff", rhythmGroups: false, skin: { id: "skin_1_15", name: "Крилатий", renderType: "winged" } },
            { id: 16, leagueId: 1, name: "Базовий тріумф",          letters: ["В","А","П","Р","О","Л"], speed: 270, spikeCount: 28, seed: 2016, bgTheme: "triumph_flare",          accentColor: "#39ff88", rhythmGroups: false, skin: { id: "skin_1_16", name: "Кубок Світла", renderType: "light_cup" } }
        ]
    },
    {
        id: 2,
        name: "Середня",
        levels: [
            { id: 17, leagueId: 2, name: "Горизонт середнього ряду", letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж"], speed: 240, spikeCount: 26, seed: 2101, bgTheme: "midnight_skyline", accentColor: "#bb55ff", rhythmGroups: false, skin: { id: "skin_2_1", name: "Synthwave Sun", renderType: "synthwave_sun" } },
            { id: 18, leagueId: 2, name: "Дах клавіатури",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї"], speed: 250, spikeCount: 28, seed: 2102, bgTheme: "rooftop_grid", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_2_2", name: "Кіберпанк Горизонт", renderType: "cyberpunk_horizon" } },
            { id: 19, leagueId: 2, name: "Нижній ярус",              letters: ["Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 255, spikeCount: 30, seed: 2103, bgTheme: "deep_abyss", accentColor: "#00ff41", rhythmGroups: false, skin: { id: "skin_2_3", name: "Глітч-Куб", renderType: "glitch_cube" } },
            { id: 20, leagueId: 2, name: "Лівий сектор",             letters: ["Й","Ф","Я","Ц","І","Ч","У","В","С","К","А","М"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "matrix_flow", accentColor: "#ff8c00", rhythmGroups: false, skin: { id: "skin_2_4", name: "Золотий Злиток", renderType: "gold_ingot" } },
            { id: 21, leagueId: 2, name: "Екватор",                  letters: ["Е","П","И","Н","Р","Т","Г","О","Ь","Ш","Л","Б"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "equator_beam", accentColor: "#7b68ee", rhythmGroups: false, skin: { id: "skin_2_5", name: "Орбіта", renderType: "orbit" } },
            { id: 22, leagueId: 2, name: "Правий загін",             letters: ["Щ","Д","Ю","З","Ж","Є","Х","Ї","Ґ"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "spore_field", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_2_6", name: "Сталагміт", renderType: "stalagmite" } },
            { id: 23, leagueId: 2, name: "Парад голосних",           letters: ["А","О","У","І","И","Е","Я","Ю","Є","Ї"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "vowel_waves", accentColor: "#00f6ff", rhythmGroups: false, skin: { id: "skin_2_7", name: "Еквалайзер", renderType: "equalizer" } },
            { id: 24, leagueId: 2, name: "Тверді звуки",            letters: ["Й","К","Н","Г","Ш","З","Ф","В","П","Р","Л","Д"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "diamond_matrix", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_2_8", name: "Щит", renderType: "shield" } }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "equalizer", accentColor: "#ff2ea6", rhythmGroups: false, skin: { id: "skin_3_1", name: "Плазма", renderType: "plasma" } },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж","Я","Ч","С","М","И","Т","Ь","Б"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "waterfall_cascade", accentColor: "#6644ff", rhythmGroups: false, skin: { id: "skin_3_2", name: "Вортекс", renderType: "vortex" } },
            { id: 27, leagueId: 3, name: "Дворядний бар'єр",        letters: ["Й","Ц","У","К","Е","Н","Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 340, spikeCount: 46, seed: 2203, bgTheme: "barrier_wall", accentColor: "#00f6ff", rhythmGroups: false, skin: { id: "skin_3_3", name: "Квантовий Бар'єр", renderType: "quantum_barrier" } },
            { id: 28, leagueId: 3, name: "Хаотичний мікс",          letters: ["А","О","П","Р","В","Л","І","Д","Ф","Ж","К","Е","Н","Г","У","Ш","Ц","Щ"], speed: 360, spikeCount: 50, seed: 2204, bgTheme: "glitch_field", accentColor: "#7fff00", rhythmGroups: false, skin: { id: "skin_3_4", name: "Метеор", renderType: "meteor" } }
        ]
    },
    {
        id: 4,
        name: "Майстер",
        levels: [
            { id: 29, leagueId: 4, name: "Половина Всесвіту",       letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ"], speed: 390, spikeCount: 50, seed: 2301, bgTheme: "nebula_drift", accentColor: "#e5ff00", rhythmGroups: false, skin: { id: "skin_4_1", name: "Галактика", renderType: "galaxy" } },
            { id: 30, leagueId: 4, name: "Гранд Мастер",            letters: ["К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ї","І","Ґ"], speed: 418, spikeCount: 55, seed: 2302, bgTheme: "grand_hex", accentColor: "#ff4400", rhythmGroups: false, skin: { id: "skin_4_2", name: "Корона Майстра", renderType: "master_crown" } }
        ]
    },
    {
        id: 5,
        name: "Бос",
        levels: [
            { id: 31, leagueId: 5, name: "ФІНАЛЬНИЙ ДЕМОН",        letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ґ"], speed: 450, spikeCount: 60, seed: 2401, bgTheme: "inferno_core", accentColor: "#ff1111", rhythmGroups: true, skin: { id: "skin_5_1", name: "ЛОРД ДЕМОНІВ", renderType: "demon_lord" } }
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

// ---------- Реєстр функцій рендерингу скінів ----------

export const SKIN_RENDERERS = {

    // === ГРУПА 1: БАЗОВА ЛІГА ===

    neon_base: function (ctx, size, time) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#00f6ff";
        var gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#0077ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#bffcff";
        ctx.lineWidth = 3;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 0;
    },

    cyber_eye: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#00ffcc";
        ctx.fillStyle = "#00ffcc";
        ctx.beginPath();
        ctx.arc(size * 0.18, 0, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#001010";
        ctx.beginPath();
        ctx.arc(size * 0.22, 0, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    retro_gamer: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ff41";
        ctx.strokeStyle = "#00ff41";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.3);
        ctx.lineTo(-size * 0.3, size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(size * 0.3, -size * 0.3);
        ctx.lineTo(size * 0.3, size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, size * 0.25);
        ctx.lineTo(size * 0.15, size * 0.25);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    throne: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#9944dd";
        ctx.strokeStyle = "#bb55ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(size / 2, -size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    crosshair: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ff2222";
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.28, 0);
        ctx.lineTo(size * 0.28, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.28);
        ctx.lineTo(0, size * 0.28);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    matrix_pixel: function (ctx, size, time) {
        ctx.fillStyle = "#003300";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#00ff41";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#00ff41";
        var px1x = -size * 0.25, px1y = -size * 0.20;
        var px2x = size * 0.08, px2y = size * 0.12;
        var px3x = -size * 0.08, px3y = size * 0.28;
        var pxSize = size * 0.14;
        ctx.fillRect(px1x, px1y, pxSize, pxSize);
        ctx.fillRect(px2x, px2y, pxSize, pxSize);
        ctx.fillRect(px3x, px3y, pxSize, pxSize);
        ctx.shadowBlur = 0;
    },

    slice: function (ctx, size, time) {
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-size / 2, size / 2);
        ctx.lineTo(size / 2, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "#ff7b00";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
        ctx.strokeStyle = "#ffaa44";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size / 2, size / 2);
        ctx.lineTo(size / 2, -size / 2);
        ctx.stroke();
    },

    shining_diamond: function (ctx, size, time) {
        ctx.fillStyle = "#1a1a30";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#9944dd";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#cc88ff";
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#bb77ee";
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.38);
        ctx.lineTo(size * 0.38, 0);
        ctx.lineTo(0, size * 0.38);
        ctx.lineTo(-size * 0.38, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    double_frame: function (ctx, size, time) {
        ctx.fillStyle = "#4a0020";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        var pulse = 2 + Math.sin(time * 0.005) * 2;
        ctx.strokeStyle = "#cc1155";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2 + pulse, -size / 2 + pulse, size - pulse * 2, size - pulse * 2);
        ctx.strokeStyle = "#ff4488";
        ctx.lineWidth = 1.5;
        var pulse2 = pulse + 5;
        ctx.strokeRect(-size / 2 + pulse2, -size / 2 + pulse2, size - pulse2 * 2, size - pulse2 * 2);
    },

    monolith: function (ctx, size, time) {
        ctx.fillStyle = "#555555";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#eeffff";
        var barW = size * 0.2;
        ctx.fillRect(-barW / 2, -size / 2, barW, size);
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
    },

    radar: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "rgba(200,200,220,0.5)";
        ctx.lineWidth = 1;
        for (var r = size * 0.12; r <= size * 0.55; r += size * 0.13) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
    },

    speed_arrow: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ffff00";
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 2.5;
        var ay = -size * 0.12;
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, ay - size * 0.16);
        ctx.lineTo(size * 0.08, ay);
        ctx.lineTo(-size * 0.15, ay + size * 0.16);
        ctx.stroke();
        ay = size * 0.15;
        ctx.beginPath();
        ctx.moveTo(-size * 0.28, ay - size * 0.16);
        ctx.lineTo(-size * 0.05, ay);
        ctx.lineTo(-size * 0.28, ay + size * 0.16);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    neon_cross: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#e5ff00";
        ctx.fillStyle = "#e5ff00";
        var crossW = size * 0.2;
        ctx.fillRect(-crossW / 2, -size / 2, crossW, size);
        ctx.fillRect(-size / 2, -crossW / 2, size, crossW);
        ctx.shadowBlur = 0;
    },

    liquid_gradient: function (ctx, size, time) {
        var gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "#cc0000");
        gradient.addColorStop(0.5, "#990066");
        gradient.addColorStop(1, "#4400cc");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#ff88cc";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
    },

    winged: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#00f6ff";
        ctx.fillStyle = "#0066cc";
        ctx.fillRect(-size * 0.35, -size * 0.4, size * 0.7, size * 0.8);
        ctx.strokeStyle = "#00f6ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#00ccff";
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size * 0.1);
        ctx.lineTo(-size / 2 - 6, -size * 0.3);
        ctx.lineTo(-size / 2, size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size / 2, -size * 0.1);
        ctx.lineTo(size / 2 + 6, -size * 0.3);
        ctx.lineTo(size / 2, size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    light_cup: function (ctx, size, time) {
        ctx.fillStyle = "#004d33";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffd700";
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#ffd700";
        var outerR = size * 0.28;
        var innerR = size * 0.12;
        var points = 5;
        ctx.beginPath();
        for (var i = 0; i < points * 2; i++) {
            var r = i % 2 === 0 ? outerR : innerR;
            var angle = (Math.PI / 2 * 3) + (i * Math.PI / points);
            var sx = Math.cos(angle) * r;
            var sy = Math.sin(angle) * r;
            if (i === 0) { ctx.moveTo(sx, sy); }
            else { ctx.lineTo(sx, sy); }
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    // === ГРУПА 2: СЕРЕДНЯ ЛІГА ===

    synthwave_sun: function (ctx, size, time) {
        var gradient = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
        gradient.addColorStop(0, "#ff44aa");
        gradient.addColorStop(0.48, "#ff8844");
        gradient.addColorStop(0.52, "#000000");
        gradient.addColorStop(1, "#000000");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#110033";
        var stripH = size * 0.04;
        for (var i = 0; i < 3; i++) {
            ctx.fillRect(-size / 2, size * 0.08 + i * size * 0.15, size, stripH);
        }
    },

    cyberpunk_horizon: function (ctx, size, time) {
        var gradient = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
        gradient.addColorStop(0, "#220066");
        gradient.addColorStop(0.4, "#9944ff");
        gradient.addColorStop(0.7, "#ffaa00");
        gradient.addColorStop(1, "#ffdd44");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#00ddff";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ddff";
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size * 0.15);
        ctx.lineTo(size / 2, -size * 0.15);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    glitch_cube: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 3;
        ctx.strokeRect(-size / 2 - 3, -size / 2 - 2, size, size);
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 3;
        ctx.strokeRect(-size / 2 + 3, -size / 2 + 2, size, size);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
    },

    gold_ingot: function (ctx, size, time) {
        var gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "#ffd700");
        gradient.addColorStop(0.3, "#ffec80");
        gradient.addColorStop(0.6, "#cc9900");
        gradient.addColorStop(1, "#ffd700");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#aa7700";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.4);
        ctx.lineTo(-size * 0.22, -size * 0.48);
        ctx.lineTo(-size * 0.14, -size * 0.4);
        ctx.lineTo(-size * 0.22, -size * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    orbit: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#ff8c00";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff8c00";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = "#ffcc44";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    },

    stalagmite: function (ctx, size, time) {
        ctx.fillStyle = "#2a2040";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#5522aa";
        ctx.beginPath();
        ctx.moveTo(-size / 2, size / 2);
        var teeth = 4;
        for (var i = 0; i <= teeth; i++) {
            var tx = -size / 2 + (size / teeth) * i;
            ctx.lineTo(tx - size * 0.06, size * 0.05);
            ctx.lineTo(tx, -size * 0.1);
            ctx.lineTo(tx + size * 0.06, size * 0.05);
        }
        ctx.lineTo(size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#8844ff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    },

    equalizer: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        var barW = size * 0.16;
        var gap = size * 0.06;
        var totalW = barW * 3 + gap * 2;
        var startX = -totalW / 2;
        var heights = [size * 0.5, size * 0.75, size * 0.35];
        var colors = ["#ff2ea6", "#00f6ff", "#39ff14"];
        for (var i = 0; i < 3; i++) {
            ctx.fillStyle = colors[i];
            ctx.shadowBlur = 6;
            ctx.shadowColor = colors[i];
            ctx.fillRect(startX + i * (barW + gap), size / 2 - heights[i], barW, heights[i]);
        }
        ctx.shadowBlur = 0;
    },

    shield: function (ctx, size, time) {
        ctx.fillStyle = "#3a3a4a";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#666677";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#888899";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#aaaacc";
        var dotR = size * 0.07;
        var margin = size * 0.16;
        var corners = [
            [-size / 2 + margin, -size / 2 + margin],
            [size / 2 - margin, -size / 2 + margin],
            [-size / 2 + margin, size / 2 - margin],
            [size / 2 - margin, size / 2 - margin]
        ];
        for (var i = 0; i < corners.length; i++) {
            ctx.beginPath();
            ctx.arc(corners[i][0], corners[i][1], dotR, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    },

    // === ГРУПА 3: СКЛАДНА ЛІГА ===

    plasma: function (ctx, size, time) {
        var pulseR = size / 2 + Math.sin(time * 0.003) * 8;
        var gradient = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, pulseR);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.3, "#ff2ea6");
        gradient.addColorStop(0.6, "#6644ff");
        gradient.addColorStop(1, "#0a0a30");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
    },

    vortex: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ffcc";
        ctx.beginPath();
        var turns = 3;
        var steps = 20;
        var maxR = size * 0.48;
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var angle = t * turns * Math.PI * 2;
            var r = t * maxR;
            var sx = Math.cos(angle) * r;
            var sy = Math.sin(angle) * r;
            if (i === 0) { ctx.moveTo(sx, sy); }
            else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    quantum_barrier: function (ctx, size, time) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 0;
    },

    meteor: function (ctx, size, time, player) {
        if (player && player.meteorTrail) {
            for (var t = player.meteorTrail.length - 1; t >= 0; t--) {
                var pt = player.meteorTrail[t];
                var ox = pt.x - player.x;
                var oy = -(pt.y - player.y);
                ctx.globalAlpha = pt.alpha * 0.35;
                ctx.fillStyle = "#ff4400";
                ctx.fillRect(-size * 0.35 + ox, -size * 0.35 + oy, size * 0.7, size * 0.7);
                ctx.shadowBlur = 6;
                ctx.shadowColor = "#ff6600";
                ctx.strokeStyle = "#ff8844";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-size / 2 + ox, -size / 2 + oy, size, size);
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = "#1a0a00";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#ff6600";
        ctx.fillStyle = "#ff4400";
        ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);
        ctx.strokeStyle = "#ffaa44";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 0;
    },

    // === ГРУПА 4: ЛІГА МАЙСТРІВ ===

    galaxy: function (ctx, size, time) {
        var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
        gradient.addColorStop(0, "#220055");
        gradient.addColorStop(0.5, "#110033");
        gradient.addColorStop(1, "#080820");
        ctx.fillStyle = gradient;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = "#ffffff";
        var stars = [
            { x: -size * 0.3, y: -size * 0.25, r: size * 0.04 },
            { x: size * 0.2, y: -size * 0.35, r: size * 0.025 },
            { x: -size * 0.15, y: size * 0.15, r: size * 0.03 },
            { x: size * 0.3, y: size * 0.25, r: size * 0.035 },
            { x: size * 0.05, y: -size * 0.4, r: size * 0.02 },
            { x: -size * 0.38, y: size * 0.3, r: size * 0.028 }
        ];
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    master_crown: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a20";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffd700";
        ctx.fillStyle = "#ffd700";
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5;
        var crownBaseY = -size / 2 - 1;
        var crownTopY = crownBaseY - size * 0.28;
        ctx.fillRect(size * 0.08, crownBaseY - size * 0.06, size * 0.84, size * 0.06);
        ctx.beginPath();
        ctx.moveTo(size * 0.1, crownBaseY);
        ctx.lineTo(size * 0.1, crownTopY);
        ctx.lineTo(size * 0.25, crownBaseY - size * 0.1);
        ctx.lineTo(size * 0.4, crownTopY);
        ctx.lineTo(size * 0.5, crownBaseY - size * 0.12);
        ctx.lineTo(size * 0.6, crownTopY);
        ctx.lineTo(size * 0.75, crownBaseY - size * 0.1);
        ctx.lineTo(size * 0.9, crownTopY);
        ctx.lineTo(size * 0.9, crownBaseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    // === ГРУПА 5: ЛІГА БОСА ===

    demon_lord: function (ctx, size, time) {
        ctx.fillStyle = "#0a0a08";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#ff1111";
        ctx.fillStyle = "#ff1111";
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size * 0.12);
        ctx.lineTo(-size * 0.08, size * 0.12);
        ctx.lineTo(-size * 0.32, size * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size * 0.2, -size * 0.12);
        ctx.lineTo(size * 0.08, size * 0.12);
        ctx.lineTo(size * 0.32, size * 0.12);
        ctx.closePath();
        ctx.fill();
        var hornY = -size / 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.25, hornY);
        ctx.lineTo(-size * 0.3, hornY - size * 0.28);
        ctx.lineTo(-size * 0.1, hornY);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size * 0.25, hornY);
        ctx.lineTo(size * 0.3, hornY - size * 0.28);
        ctx.lineTo(size * 0.1, hornY);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#440000";
        ctx.lineWidth = 1;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
    }
};

// ---------- Генерація фіксованої траси ----------

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

function generateTrack(level) {
    const rng = mulberry32(level.seed);
    const spikes = [];
    const baseGapTime = reactionTimeForLevel(level.id);
    let x = level.speed * 3.0;
    let lastLetter1 = null;
    let lastLetter2 = null;
    const lastTypes = [];

    function pickLetter() {
        let letter = level.letters[Math.floor(rng() * level.letters.length)];
        let guard = 0;
        while (letter === lastLetter1 && letter === lastLetter2 && guard < 10) {
            letter = level.letters[Math.floor(rng() * level.letters.length)];
            guard++;
        }
        lastLetter2 = lastLetter1;
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

function hitWindowTimes(levelId) {
    const t = (levelId - 1) / 30;
    return {
        okTime: 0.45 - 0.17 * t,
        perfectTime: 0.16 - 0.06 * t
    };
}

// ---------- Нова система балів ----------

function calculateHitScore(isOkZone, config) {
    const base = isOkZone ? 100 : 80;
    const diffBonus = config.difficulty === "HARD" ? 50 : 0;
    const zoneBonus = config.hitWindow === "normal" ? 20 : 0;
    const speedBonus = config.speed === "fast" ? 40 : config.speed === "slow" ? -20 : 0;
    return Math.max(0, base + diffBonus + zoneBonus + speedBonus);
}

function calculateMaxScores(spikeCount, hitWindow, speed) {
    const zoneBonus = hitWindow === "normal" ? 20 : 0;
    const speedBonus = speed === "fast" ? 40 : speed === "slow" ? -20 : 0;
    const easyPerHit = 100 + 0 + zoneBonus + speedBonus;
    const hardPerHit = 100 + 50 + zoneBonus + speedBonus;
    return {
        maxEasy: spikeCount * Math.max(0, easyPerHit),
        maxHard: spikeCount * Math.max(0, hardPerHit)
    };
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

        this.reset();
    }

    reset() {
        BackgroundRenderer.reset();
        const track = generateTrack(this.level);
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
        this.waves = [];
        this.ripples = [];
        this.pulse = 0;
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        this.jumpBuffer = null;
    }

    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x + SPIKE_W / 2 >= this.player.x) {
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
        const gap = spike.x - this.player.x;
        if (gap > 0 && gap <= this.okPx) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            spike.state = "cleared";
            this.score += calculateHitScore(true, this.scoreConfig);
            const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
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
        const isDemon = this.level.bgTheme === "demon";
        const palette = isDemon
            ? ["#ff1111", "#ff4400", "#ffe14d"]
            : ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
        const count = isDemon ? 35 : 17;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
        BackgroundRenderer.createParticles(gameX, gameY, count, palette);
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
            if (this.difficulty === "HARD") {
                this.explode();
                return { result: "exploded", letter: letter };
            }
            return { result: "no_target", letter: letter };
        }
        const gap = spike.x - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = upperLetter === spike.letter.toUpperCase();

        if (correct && !this.player.onGround) {
            this.jumpBuffer = spike;
            return { result: "correct", letter: letter };
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            spike.state = "cleared";
            this.score += calculateHitScore(true, this.scoreConfig);
            const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        if (this.difficulty === "HARD") {
            this.explode();
            return { result: "exploded", letter: letter };
        }

        const inPool = this.level.letters.some(function (l) { return l.toUpperCase() === upperLetter; });
        if (!inPool) {
            return { result: "wrong", letter: letter };
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
                const gap = target.x - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5) {
                    target.state = "cleared";
                    const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
                    this.jump(distance, true);
                }
            }
        }

        if (!this.demoMode && this.difficulty === "HARD") {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - this.player.x;
                if (gap <= SPIKE_W * 0.5 + CUBE_SIZE * 0.4) {
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
            if (dx < (SPIKE_W + CUBE_SIZE) * 0.32 && this.player.y < SPIKE_H * 0.72) {
                spike.state = "hit";
                this.explode();
                return;
            }
            if (spike.x + SPIKE_W / 2 < this.player.x) {
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
        const groundY = H * 0.64;
        const anchorX = W * PLAYER_ANCHOR;
        const camX = this.player.x;

        BackgroundRenderer.render(ctx, this.level.bgTheme, W, H, groundY, time, this.effectiveSpeed, this.level.accentColor, this.level.id);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        if (!this.demoMode) {
            this.renderProgressBar(ctx, W);
        }
    }

    // ---------- Фони та хвилі ----------

    renderBackground(ctx, W, H, groundY, time) {
        BackgroundRenderer.render(ctx, this.level.bgTheme, W, H, groundY, time, this.effectiveSpeed, this.level.accentColor, this.level.id);

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
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = accent;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

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
        if (!this.player.alive || !this.nearestAheadSpike()) {
            return;
        }
        const hwH = 6;
        const hwY = groundY - hwH / 2;

        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(0, 246, 255, 0.15)";
        ctx.fillStyle = "rgba(0, 246, 255, 0.15)";
        ctx.fillRect(anchorX, hwY, this.okPx, hwH);

        const pulseAlpha = 0.35 + 0.15 * (Math.sin(time * 6) + 1) / 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillStyle = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(anchorX, hwY, this.perfectPx, hwH);

        ctx.shadowBlur = 0;
    }

    renderFinish(ctx, W, groundY, anchorX, camX) {
        const screenX = this.finishX - camX + anchorX;
        if (screenX < -60 || screenX > W + 60) {
            return;
        }
        ctx.save();
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 6;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#39ff88";
        ctx.strokeRect(screenX - 8, groundY - 170, 16, 170);
        ctx.restore();
    }

    // ---------- Перешкоди (3 типи) ----------

    drawSpike(ctx, screenX, groundY, accentColor, cleared) {
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        ctx.shadowBlur = cleared ? 4 : 14;
        ctx.shadowColor = color;
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
        ctx.shadowBlur = 0;
    }

    drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared) {
        const offset = SPIKE_W * 0.45;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        ctx.shadowBlur = cleared ? 4 : 10;
        ctx.shadowColor = color;
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
        ctx.shadowBlur = 0;
    }

    drawSaw(ctx, screenX, groundY, radius, rotationAngle, accentColor, cleared) {
        const centerY = groundY - radius;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        const teeth = 8;

        ctx.save();
        ctx.translate(screenX, centerY);
        ctx.rotate(rotationAngle);

        ctx.shadowBlur = cleared ? 4 : 12;
        ctx.shadowColor = color;

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
        ctx.shadowBlur = 0;

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
                ctx.shadowBlur = 8;
                ctx.shadowColor = "rgba(255, 225, 77, 0.8)";
                ctx.fillStyle = "#ffe14d";
                const letterY = spike.type === "saw" ? groundY - SPIKE_H * 0.6 - 20 : groundY - SPIKE_H - 12;
                ctx.fillText(spike.letter, screenX, letterY);
                ctx.shadowBlur = 0;
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
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#ffaa00";
            ctx.strokeStyle = "rgba(255, 170, 0, 0.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
            ctx.shadowBlur = 0;
        }

        if (achievement === "easy") {
            ctx.strokeStyle = "#d4dce8";
            ctx.lineWidth = 1.8;
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(200, 210, 225, 0.6)";
            ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    renderProgressBar(ctx, W) {
        const barW = W * 0.6;
        const barX = (W - barW) / 2;
        const barY = 30;
        const barH = 14;

        if (this.leagueInfo !== null) {
            ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00f6ff";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(0, 246, 255, 0.5)";
            ctx.fillText(
                "Ліга: " + this.leagueInfo.leagueName + " | " + this.leagueInfo.levelNumber + ": " + this.leagueInfo.levelName,
                W / 2,
                6
            );
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = "rgba(8, 10, 26, 0.8)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
        const fillW = barW * (this.progressPct / 100);
        const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
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
        const maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy;
        ctx.fillText("Очки: " + this.score + " / " + maxForMode, barX - 12, barY + barH / 2);
    }
}



