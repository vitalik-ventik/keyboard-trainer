// ============================================================
// shop_skins_4.js — скіни магазину, частина 4: збірна, воротар, піпер, дайвер, патрік, вафля,
// горила, окуляри, шарінган, зелений ніндзя, павук GD, галактика, золотий ніндзя, кубок
// ============================================================

import { blinking, disc, frame, r, tri } from "./shop_skins.js";

const SHOP_SKINS_4 = {

    // ---------- Нові скіни: футбол ----------

    // Збірна: жовто-синя форма з номером 10
    shop_national: function (ctx, s, time) {
        r(ctx, s, "#ffd500", -0.5, -0.5, 1, 1);
        r(ctx, s, "#1a5ad8", -0.5, 0.22, 1, 0.28);
        r(ctx, s, "#1a5ad8", -0.5, -0.5, 0.14, 0.72);
        r(ctx, s, "#1a5ad8", 0.36, -0.5, 0.14, 0.72);
        // V-подібний комір
        tri(ctx, s, "#1a5ad8", -0.14, -0.5, 0.14, -0.5, 0, -0.32);
        // Номер 10
        ctx.fillStyle = "#1a5ad8";
        ctx.font = "bold " + Math.round(s * 0.42) + "px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("10", 0, -0.02 * s);
        // Тризуб-емблема на шортах світиться при русі
        var shine = time === 0 ? 0 : 0.5 + 0.5 * Math.sin(time * 0.004);
        r(ctx, s, "rgba(255, 213, 0, " + (0.5 + shine * 0.5).toFixed(2) + ")", -0.05, 0.28, 0.1, 0.14);
        frame(ctx, s, "#ffffff");
    },

    // Воротар: у стрибку рукавиці підіймаються вгору, наче ловлять м'яч
    shop_goalkeeper: function (ctx, s, time, st) {
        var catching = st && st.onGround === false;
        var up = catching ? -0.36 : 0;
        r(ctx, s, "#2acc6a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#1a8a4a", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#1a1a1a", -0.5, 0.3, 1, 0.2);
        // Обличчя
        r(ctx, s, "#ffd0a0", -0.3, -0.36, 0.6, 0.46);
        r(ctx, s, "#1a1a1a", -0.18, -0.2, 0.08, 0.08);
        r(ctx, s, "#1a1a1a", 0.1, -0.2, 0.08, 0.08);
        r(ctx, s, catching ? "#8a2a1a" : "#6a3a1a", -0.1, catching ? -0.02 : 0.0, 0.2, catching ? 0.08 : 0.04);
        // Великі рукавиці
        r(ctx, s, "#ffffff", -0.72, -0.1 + up, 0.26, 0.28);
        r(ctx, s, "#ff6a1a", -0.72, 0.12 + up, 0.26, 0.06);
        r(ctx, s, "#ffffff", 0.46, -0.1 + up, 0.26, 0.28);
        r(ctx, s, "#ff6a1a", 0.46, 0.12 + up, 0.26, 0.06);
        if (catching) {
            disc(ctx, s, "#ffffff", 0, -0.7, 0.12);
            r(ctx, s, "#1a1a1a", -0.04, -0.74, 0.08, 0.08);
        }
        frame(ctx, s, "#ffffff");
    },

    // ---------- Нові скіни: підводний світ ----------

    // Пішер: рибка з величезним оком, пускає бульбашки
    shop_peeper: function (ctx, s, time) {
        r(ctx, s, "#ffa84a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#ffc87a", -0.5, -0.5, 1, 0.1);
        r(ctx, s, "#e8762a", -0.5, 0.24, 1, 0.26);
        // Хвостик праворуч
        tri(ctx, s, "#e8762a", 0.5, -0.2, 0.5, 0.2, 0.7, 0);
        // Величезне око займає майже все обличчя
        disc(ctx, s, "#ffffff", -0.08, -0.08, 0.3);
        var dx = Math.sin(time * 0.002) * 0.06;
        disc(ctx, s, "#39a0ff", -0.08 + dx, -0.06, 0.16);
        disc(ctx, s, "#101820", -0.08 + dx, -0.06, 0.08);
        disc(ctx, s, "#ffffff", -0.14 + dx, -0.12, 0.04);
        // Бульбашки
        if (time > 0) {
            var b = (time % 1600) / 1600;
            ctx.strokeStyle = "rgba(220, 245, 255, " + (1 - b).toFixed(2) + ")";
            ctx.lineWidth = Math.max(1, s * 0.03);
            ctx.beginPath();
            ctx.arc(-0.4 * s, (-0.6 - b * 0.4) * s, 0.06 * s, 0, Math.PI * 2);
            ctx.stroke();
        }
        frame(ctx, s, "#ffd08a");
    },

    // Водолаз: шолом зі склом, за яким ходять хвилі
    shop_diver: function (ctx, s, time) {
        r(ctx, s, "#d8a030", -0.5, -0.5, 1, 1);
        r(ctx, s, "#f0c050", -0.5, -0.5, 1, 0.08);
        // Заклепки
        for (var i = 0; i < 4; i++) {
            disc(ctx, s, "#a87020", -0.4 + i * 0.27, -0.42, 0.03);
            disc(ctx, s, "#a87020", -0.4 + i * 0.27, 0.42, 0.03);
        }
        // Кругле скло
        disc(ctx, s, "#7a5a1a", 0, 0, 0.34);
        disc(ctx, s, "#1a5a8a", 0, 0, 0.28);
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 0.28 * s, 0, Math.PI * 2);
        ctx.clip();
        for (var w = 0; w < 3; w++) {
            var wy = -0.14 + w * 0.12 + Math.sin(time * 0.003 + w) * 0.03;
            r(ctx, s, "rgba(120, 210, 255, 0.5)", -0.3, wy, 0.6, 0.04);
        }
        // Обличчя за склом
        r(ctx, s, "#ffd0a0", -0.12, -0.08, 0.24, 0.22);
        r(ctx, s, "#1a1a1a", -0.08, -0.02, 0.05, 0.05);
        r(ctx, s, "#1a1a1a", 0.04, -0.02, 0.05, 0.05);
        ctx.restore();
        r(ctx, s, "rgba(255, 255, 255, 0.6)", -0.2, -0.2, 0.08, 0.08);
        frame(ctx, s, "#a87020");
    },

    // ---------- Нові скіни: фільми й мультики ----------

    // Патрік: рожева морська зірка в зелених шортах
    shop_patrick: function (ctx, s, time) {
        r(ctx, s, "#ff9ab0", -0.5, -0.5, 1, 1);
        tri(ctx, s, "#ff9ab0", -0.2, -0.5, 0.2, -0.5, 0, -0.74);
        r(ctx, s, "#ffb8c8", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#6ad84a", -0.5, 0.22, 1, 0.28);
        // Фіолетові квіточки на шортах
        disc(ctx, s, "#8a4ac8", -0.3, 0.34, 0.05);
        disc(ctx, s, "#8a4ac8", 0.26, 0.38, 0.05);
        // Очі й брови
        if (blinking(time, 2800, 400)) {
            r(ctx, s, "#1a1a1a", -0.24, -0.18, 0.18, 0.03);
            r(ctx, s, "#1a1a1a", 0.06, -0.18, 0.18, 0.03);
        } else {
            r(ctx, s, "#ffffff", -0.24, -0.28, 0.18, 0.2);
            r(ctx, s, "#ffffff", 0.06, -0.28, 0.18, 0.2);
            r(ctx, s, "#1a1a1a", -0.18, -0.2, 0.07, 0.08);
            r(ctx, s, "#1a1a1a", 0.12, -0.2, 0.07, 0.08);
        }
        r(ctx, s, "#1a1a1a", -0.26, -0.34, 0.14, 0.03);
        r(ctx, s, "#1a1a1a", 0.12, -0.34, 0.14, 0.03);
        // Широка усмішка
        r(ctx, s, "#c8406a", -0.2, 0.02, 0.4, 0.1);
        r(ctx, s, "#ff6a8a", -0.12, 0.08, 0.24, 0.04);
        frame(ctx, s, "#e86a8a");
    },

    // Вафля: клітинки, масло тане, сироп поволі стікає
    shop_waffle: function (ctx, s, time) {
        r(ctx, s, "#e8a84a", -0.5, -0.5, 1, 1);
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                r(ctx, s, "#c8862a", -0.42 + x * 0.24, -0.42 + y * 0.24, 0.16, 0.16);
            }
        }
        // Масло зверху
        r(ctx, s, "#fff0a0", -0.12, -0.54, 0.24, 0.12);
        // Сироп: крапля довшає й відривається
        var drip = time === 0 ? 0.2 : (time % 2400) / 2400;
        r(ctx, s, "#8a4a14", -0.5, -0.5, 1, 0.1);
        r(ctx, s, "#8a4a14", 0.2, -0.5, 0.08, 0.2 + drip * 0.3);
        r(ctx, s, "#8a4a14", -0.3, -0.5, 0.07, 0.14);
        disc(ctx, s, "#8a4a14", 0.24, -0.28 + drip * 0.3, 0.05);
        // Усміхнене личко
        r(ctx, s, "#5a3010", -0.2, -0.08, 0.08, 0.08);
        r(ctx, s, "#5a3010", 0.12, -0.08, 0.08, 0.08);
        r(ctx, s, "#5a3010", -0.14, 0.14, 0.28, 0.05);
        frame(ctx, s, "#c8862a");
    },

    // Горила: могутні брови, час від часу б'є себе в груди
    shop_gorilla: function (ctx, s, time) {
        var beat = time > 0 && (time % 4000) > 3300;
        var fist = beat ? Math.abs(Math.sin(time * 0.03)) * 0.08 : 0;
        r(ctx, s, "#3a2a20", -0.5, -0.5, 1, 1);
        r(ctx, s, "#4a3a2e", -0.5, -0.5, 1, 0.1);
        // Обличчя
        r(ctx, s, "#6a5a4a", -0.34, -0.3, 0.68, 0.56);
        r(ctx, s, "#1a120c", -0.36, -0.3, 0.72, 0.1);
        r(ctx, s, "#1a1a1a", -0.22, -0.16, 0.1, 0.08);
        r(ctx, s, "#1a1a1a", 0.12, -0.16, 0.1, 0.08);
        r(ctx, s, "#ffcc33", -0.2, -0.15, 0.04, 0.04);
        r(ctx, s, "#ffcc33", 0.14, -0.15, 0.04, 0.04);
        r(ctx, s, "#3a2a20", -0.12, -0.02, 0.24, 0.1);
        r(ctx, s, "#1a1a1a", -0.1, 0.0, 0.06, 0.05);
        r(ctx, s, "#1a1a1a", 0.04, 0.0, 0.06, 0.05);
        r(ctx, s, "#1a120c", -0.16, beat ? 0.12 : 0.16, 0.32, beat ? 0.1 : 0.04);
        // Кулаки б'ють у груди
        r(ctx, s, "#2a1e16", -0.42 + fist, 0.3, 0.2, 0.18);
        r(ctx, s, "#2a1e16", 0.22 - fist, 0.3, 0.2, 0.18);
        frame(ctx, s, "#6a4a34");
    },

    // Кубик у темних окулярах: половина обличчя металева, за склом світиться червоне око
    shop_shades: function (ctx, s, time) {
        r(ctx, s, "#d8b090", -0.5, -0.5, 1, 1);
        // Права половина — метал
        r(ctx, s, "#9aa0ac", 0, -0.5, 0.5, 1);
        r(ctx, s, "#c8ced8", 0, -0.5, 0.5, 0.08);
        r(ctx, s, "#6a707c", 0.02, -0.1, 0.46, 0.03);
        disc(ctx, s, "#dce2ea", 0.38, 0.3, 0.03);
        // Коротка зачіска
        r(ctx, s, "#2a1a10", -0.5, -0.5, 0.5, 0.14);
        // Окуляри
        r(ctx, s, "#101014", -0.4, -0.26, 0.8, 0.06);
        r(ctx, s, "#101014", -0.4, -0.26, 0.34, 0.2);
        r(ctx, s, "#101014", 0.06, -0.26, 0.34, 0.2);
        r(ctx, s, "rgba(255, 255, 255, 0.25)", -0.36, -0.24, 0.08, 0.06);
        var glow = time === 0 ? 0.5 : 0.6 + 0.4 * Math.sin(time * 0.006);
        r(ctx, s, "rgba(255, 40, 40, " + glow.toFixed(2) + ")", 0.16, -0.2, 0.12, 0.08);
        // Суворий рот
        r(ctx, s, "#6a3a2a", -0.2, 0.2, 0.2, 0.04);
        r(ctx, s, "#5a606a", 0, 0.2, 0.2, 0.04);
        frame(ctx, s, "#1a1a1a");
    },

    // Шарінган: червоне око з трьома «комами», що обертаються
    shop_sharingan: function (ctx, s, time) {
        r(ctx, s, "#1a1a24", -0.5, -0.5, 1, 1);
        r(ctx, s, "#2a2a38", -0.5, -0.5, 1, 0.08);
        disc(ctx, s, "#101014", 0, 0, 0.38);
        disc(ctx, s, "#d81a1a", 0, 0, 0.34);
        ctx.strokeStyle = "#5a0a0a";
        ctx.lineWidth = Math.max(1, s * 0.025);
        ctx.beginPath();
        ctx.arc(0, 0, 0.2 * s, 0, Math.PI * 2);
        ctx.stroke();
        disc(ctx, s, "#101014", 0, 0, 0.07);
        var a0 = time * 0.003;
        for (var i = 0; i < 3; i++) {
            var a = a0 + i * Math.PI * 2 / 3;
            var tx = Math.cos(a) * 0.2;
            var ty = Math.sin(a) * 0.2;
            disc(ctx, s, "#101014", tx, ty, 0.055);
            tri(ctx, s, "#101014", tx, ty - 0.05, tx, ty + 0.05, tx + Math.cos(a + 1.3) * 0.12, ty + Math.sin(a + 1.3) * 0.12);
        }
        frame(ctx, s, "#d81a1a");
    },

    // Зелений ніндзя: зелений костюм із золотими візерунками
    shop_green_ninja: function (ctx, s, time) {
        r(ctx, s, "#2aa84a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#4ad86a", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#ffd0a0", -0.36, -0.2, 0.72, 0.24);
        var look = Math.sin(time * 0.0025) * 0.04;
        r(ctx, s, "#1a1a1a", -0.22 + look, -0.13, 0.1, 0.1);
        r(ctx, s, "#1a1a1a", 0.12 + look, -0.13, 0.1, 0.1);
        r(ctx, s, "#1a1a1a", -0.26, -0.18, 0.16, 0.03);
        r(ctx, s, "#1a1a1a", 0.1, -0.18, 0.16, 0.03);
        // Золоті візерунки
        r(ctx, s, "#ffcc33", -0.5, 0.14, 1, 0.05);
        r(ctx, s, "#ffcc33", -0.3, 0.24, 0.05, 0.2);
        r(ctx, s, "#ffcc33", 0.25, 0.24, 0.05, 0.2);
        tri(ctx, s, "#ffcc33", -0.1, 0.24, 0.1, 0.24, 0, 0.4);
        // Енергія, що мерехтить у кулаках
        var e = time === 0 ? 0 : 0.5 + 0.5 * Math.sin(time * 0.01);
        disc(ctx, s, "rgba(120, 255, 140, " + (0.4 + 0.5 * e).toFixed(2) + ")", -0.44, 0.34, 0.06 + e * 0.03);
        disc(ctx, s, "rgba(120, 255, 140, " + (0.4 + 0.5 * e).toFixed(2) + ")", 0.44, 0.34, 0.06 + e * 0.03);
        frame(ctx, s, "#ffcc33");
    },

    // ---------- Нові скіни: Geometry Dash ----------

    // GD-павук: кубик на тонких ніжках, що перебирають
    shop_gd_spider: function (ctx, s, time) {
        var step = time === 0 ? 0 : Math.sin(time * 0.015) * 0.06;
        ctx.strokeStyle = "#ff2ea6";
        ctx.lineWidth = Math.max(2, s * 0.05);
        for (var i = 0; i < 2; i++) {
            var side = i === 0 ? -1 : 1;
            ctx.beginPath();
            ctx.moveTo(side * 0.3 * s, 0.3 * s);
            ctx.lineTo(side * (0.62 + step * side) * s, 0.1 * s);
            ctx.lineTo(side * (0.7 + step * side) * s, 0.56 * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(side * 0.2 * s, 0.4 * s);
            ctx.lineTo(side * (0.4 - step * side) * s, 0.3 * s);
            ctx.lineTo(side * (0.42 - step * side) * s, 0.56 * s);
            ctx.stroke();
        }
        r(ctx, s, "#1a0a2a", -0.46, -0.46, 0.92, 0.84);
        r(ctx, s, "#ff2ea6", -0.46, -0.46, 0.92, 0.08);
        // Очі-щілини
        r(ctx, s, "#00f6ff", -0.3, -0.16, 0.2, 0.08);
        r(ctx, s, "#00f6ff", 0.1, -0.16, 0.2, 0.08);
        r(ctx, s, "#ff2ea6", -0.2, 0.12, 0.4, 0.05);
        ctx.strokeStyle = "#00f6ff";
        ctx.lineWidth = Math.max(2, s * 0.05);
        ctx.strokeRect(-0.46 * s, -0.46 * s, 0.92 * s, 0.84 * s);
    },

    // Кубик-галактика: усередині пливуть зорі й туманність
    shop_galaxy: function (ctx, s, time) {
        r(ctx, s, "#0a0620", -0.5, -0.5, 1, 1);
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.clip();
        var drift = time * 0.00004;
        // Туманність
        var g = ctx.createRadialGradient(Math.sin(drift * 20) * 0.2 * s, 0, 0, 0, 0, s * 0.6);
        g.addColorStop(0, "rgba(200, 90, 255, 0.55)");
        g.addColorStop(0.5, "rgba(60, 120, 255, 0.35)");
        g.addColorStop(1, "rgba(10, 6, 32, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Зорі повільно пропливають
        for (var i = 0; i < 14; i++) {
            var sx = (((i * 0.37 + drift * (1 + i % 3)) % 1) - 0.5);
            var sy = ((i * 0.61) % 1) - 0.5;
            var tw = 0.5 + 0.5 * Math.sin(time * 0.004 + i);
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.5 + tw * 0.5).toFixed(2) + ")";
            var sz = i % 4 === 0 ? 0.04 : 0.025;
            ctx.fillRect(sx * s, sy * s, sz * s, sz * s);
        }
        ctx.restore();
        frame(ctx, s, "#b06bff");
    },

    // ---------- Нові легендарні ----------

    // Золотий ніндзя: сяє, навколо крутиться золотий вихор
    shop_golden_ninja: function (ctx, s, time) {
        var a = time * 0.006;
        for (var i = 0; i < 6; i++) {
            var ang = a + i * Math.PI / 3;
            disc(ctx, s, "rgba(255, 220, 90, 0.7)", Math.cos(ang) * 0.68, Math.sin(ang) * 0.3 + 0.1, 0.05);
        }
        r(ctx, s, "#e8b020", -0.5, -0.5, 1, 1);
        r(ctx, s, "#ffe070", -0.5, -0.5, 1, 0.1);
        r(ctx, s, "#ffd0a0", -0.36, -0.2, 0.72, 0.24);
        r(ctx, s, "#1a1a1a", -0.22, -0.13, 0.1, 0.1);
        r(ctx, s, "#1a1a1a", 0.12, -0.13, 0.1, 0.1);
        r(ctx, s, "#1a1a1a", -0.26, -0.18, 0.16, 0.03);
        r(ctx, s, "#1a1a1a", 0.1, -0.18, 0.16, 0.03);
        r(ctx, s, "#b87a10", -0.5, 0.14, 1, 0.05);
        tri(ctx, s, "#fff4c0", -0.12, 0.24, 0.12, 0.24, 0, 0.44);
        // Відблиск, що біжить по золоту
        var sweep = ((time * 0.0007) % 1.8) - 0.4;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 240, 0.5)";
        ctx.beginPath();
        ctx.moveTo((sweep - 0.5) * s, 0.5 * s);
        ctx.lineTo((sweep - 0.35) * s, 0.5 * s);
        ctx.lineTo((sweep + 0.35) * s, -0.5 * s);
        ctx.lineTo((sweep + 0.2) * s, -0.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        frame(ctx, s, "#fff4c0");
    },

    // Кубок досягнень: кубик сидить у золотому кубку, над ним виблискують зірочки
    shop_trophy: function (ctx, s, time) {
        // Ручки кубка
        ctx.strokeStyle = "#e8b020";
        ctx.lineWidth = Math.max(2, s * 0.07);
        ctx.beginPath();
        ctx.arc(-0.5 * s, -0.1 * s, 0.16 * s, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.5 * s, -0.1 * s, 0.16 * s, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        r(ctx, s, "#ffcc33", -0.5, -0.5, 1, 0.8);
        r(ctx, s, "#fff0a0", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#e8a020", -0.16, 0.3, 0.32, 0.1);
        r(ctx, s, "#c88a10", -0.3, 0.4, 0.6, 0.1);
        // Усміхнений кубик у кубку
        r(ctx, s, "#00f6ff", -0.24, -0.4, 0.48, 0.36);
        r(ctx, s, "#071a2a", -0.18, -0.34, 0.36, 0.26);
        r(ctx, s, "#00f6ff", -0.12, -0.28, 0.06, 0.06);
        r(ctx, s, "#00f6ff", 0.06, -0.28, 0.06, 0.06);
        r(ctx, s, "#00f6ff", -0.1, -0.16, 0.2, 0.03);
        // Зірка на кубку
        r(ctx, s, "#fff4c0", -0.05, -0.02, 0.1, 0.2);
        r(ctx, s, "#fff4c0", -0.12, 0.05, 0.24, 0.06);
        // Іскри
        for (var i = 0; i < 3; i++) {
            var k = time === 0 ? 0.5 : ((time * 0.0008 + i / 3) % 1);
            ctx.fillStyle = "rgba(255, 255, 220, " + (1 - k).toFixed(2) + ")";
            ctx.fillRect((-0.4 + i * 0.4) * s, (-0.6 - k * 0.3) * s, 0.05 * s, 0.05 * s);
        }
        frame(ctx, s, "#fff0a0");
    }
};

export { SHOP_SKINS_4 };
