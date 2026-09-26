// ============================================================
// shop_skins_3.js — скіни магазину, частина 3: курама, ґодзила, демогоргон, жнець, фенікс,
// веселка, золотий, аксолотль, бджола, варден, ілагер
// ============================================================

import { blinking, disc, eye, frame, r, tri } from "./shop_skins.js";

const SHOP_SKINS_3 = {

    // Дев'ятихвостий лис: дев'ять хвостів віялом махають позаду,
    // червоні очі з вертикальною зіницею, вусики-смужки на щоках
    shop_kurama: function (ctx, s, time) {
        // Дев'ять пухнастих хвостів віялом виростають позаду справа-знизу
        var ox = 0.3;
        var oy = 0.3;
        for (var pass = 0; pass < 2; pass++) {
            for (var i = 0; i < 9; i++) {
                var ang = -2.0 + i * 0.27 + Math.sin(time * 0.003 + i * 0.7) * 0.07;
                var len = pass === 0 ? 0.8 : 0.75;
                var wid = pass === 0 ? 0.13 : 0.1;
                var ca = Math.cos(ang);
                var sa = Math.sin(ang);
                var tipx = ox + ca * len;
                var tipy = oy + sa * len;
                var mx = ox + ca * len * 0.55;
                var my = oy + sa * len * 0.55;
                ctx.fillStyle = pass === 0 ? "#a8340a" : (i % 2 === 0 ? "#ff8a2a" : "#ff9e40");
                ctx.beginPath();
                ctx.moveTo((ox - sa * 0.04) * s, (oy + ca * 0.04) * s);
                ctx.quadraticCurveTo((mx - sa * wid * 1.7) * s, (my + ca * wid * 1.7) * s, tipx * s, tipy * s);
                ctx.quadraticCurveTo((mx + sa * wid * 1.7) * s, (my - ca * wid * 1.7) * s, (ox + sa * 0.04) * s, (oy - ca * 0.04) * s);
                ctx.closePath();
                ctx.fill();
                if (pass === 1) {
                    disc(ctx, s, "#ffd2a0", ox + ca * len * 0.86, oy + sa * len * 0.86, 0.035);
                }
            }
        }
        // Вуха
        tri(ctx, s, "#ff7a1a", -0.48, -0.46, -0.14, -0.46, -0.42, -0.84);
        tri(ctx, s, "#ff7a1a", 0.48, -0.46, 0.14, -0.46, 0.42, -0.84);
        tri(ctx, s, "#5a1a0a", -0.4, -0.46, -0.22, -0.46, -0.38, -0.7);
        tri(ctx, s, "#5a1a0a", 0.4, -0.46, 0.22, -0.46, 0.38, -0.7);
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#ff9a3a");
        body.addColorStop(1, "#e0561a");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Темні мітки навколо очей
        tri(ctx, s, "#7a1a0a", -0.44, -0.24, -0.06, -0.12, -0.4, -0.02);
        tri(ctx, s, "#7a1a0a", 0.44, -0.24, 0.06, -0.12, 0.4, -0.02);
        // Очі
        tri(ctx, s, "#ffcc33", -0.36, -0.18, -0.1, -0.1, -0.34, -0.05);
        tri(ctx, s, "#ffcc33", 0.36, -0.18, 0.1, -0.1, 0.34, -0.05);
        var pupil = 0.012 + 0.008 * Math.sin(time * 0.004);
        r(ctx, s, "#1a0505", -0.24 - pupil, -0.15, pupil * 2, 0.08);
        r(ctx, s, "#1a0505", 0.24 - pupil, -0.15, pupil * 2, 0.08);
        // Вусики-смужки на щоках
        for (var w = 0; w < 3; w++) {
            r(ctx, s, "#3a0a05", -0.46, 0.04 + w * 0.06, 0.16, 0.02);
            r(ctx, s, "#3a0a05", 0.3, 0.04 + w * 0.06, 0.16, 0.02);
        }
        // Широка усмішка з іклами
        ctx.fillStyle = "#5a0a0a";
        ctx.beginPath();
        ctx.moveTo(-0.24 * s, 0.18 * s);
        ctx.quadraticCurveTo(0, 0.44 * s, 0.24 * s, 0.18 * s);
        ctx.closePath();
        ctx.fill();
        tri(ctx, s, "#ffffff", -0.2, 0.19, -0.13, 0.2, -0.16, 0.28);
        tri(ctx, s, "#ffffff", 0.2, 0.19, 0.13, 0.2, 0.16, 0.28);
        tri(ctx, s, "#ffffff", -0.06, 0.3, 0.06, 0.3, 0, 0.24);
        frame(ctx, s, "#ff8a1a");
    },

    // Ґодзілла: темна луска, спинні пластини спалахують атомним синім
    // хвилею від краю до краю; у пащі теж жевріє світло
    shop_godzilla: function (ctx, s, time) {
        var plates = [-0.34, -0.17, 0, 0.17, 0.34];
        for (var p = 0; p < plates.length; p++) {
            var tall = p === 2 ? 0.42 : (p % 2 === 0 ? 0.3 : 0.36);
            var glow = time > 0 ? Math.max(0, Math.sin(time * 0.004 - p * 0.6)) : 0;
            tri(ctx, s, "#4e5e58", plates[p] - 0.1, -0.46, plates[p] + 0.1, -0.46, plates[p], -0.46 - tall);
            tri(ctx, s, "rgba(110, 210, 255, " + (0.4 + 0.6 * glow).toFixed(2) + ")", plates[p] - 0.055, -0.46, plates[p] + 0.055, -0.46, plates[p], -0.46 - tall * 0.75);
        }
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#4a5a50");
        body.addColorStop(1, "#242c28");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Луска
        for (var yy = 0; yy < 4; yy++) {
            for (var xx = 0; xx < 5; xx++) {
                r(ctx, s, "#36423a", -0.44 + xx * 0.2 + (yy % 2) * 0.1, -0.44 + yy * 0.08, 0.08, 0.035);
            }
        }
        // Брова й люті жовті очі
        r(ctx, s, "#1c2420", -0.44, -0.24, 0.88, 0.07);
        r(ctx, s, "#ffd23a", -0.32, -0.16, 0.16, 0.07);
        r(ctx, s, "#ffd23a", 0.16, -0.16, 0.16, 0.07);
        r(ctx, s, "#1a1a1a", -0.22, -0.16, 0.04, 0.07);
        r(ctx, s, "#1a1a1a", 0.18, -0.16, 0.04, 0.07);
        // Ніздрі
        r(ctx, s, "#1a201c", -0.1, 0.02, 0.05, 0.04);
        r(ctx, s, "#1a201c", 0.05, 0.02, 0.05, 0.04);
        // Паща з іклами й атомним світлом
        var breath = time > 0 ? Math.max(0, Math.sin(time * 0.004 - 3.2)) : 0;
        r(ctx, s, "#140a0a", -0.32, 0.14, 0.64, 0.2);
        r(ctx, s, "rgba(110, 210, 255, " + (0.7 * breath).toFixed(2) + ")", -0.26, 0.18, 0.52, 0.12);
        for (var t = 0; t < 6; t++) {
            tri(ctx, s, "#f0ece0", -0.3 + t * 0.11, 0.14, -0.22 + t * 0.11, 0.14, -0.26 + t * 0.11, 0.21);
            tri(ctx, s, "#f0ece0", -0.3 + t * 0.11, 0.34, -0.22 + t * 0.11, 0.34, -0.26 + t * 0.11, 0.28);
        }
        frame(ctx, s, "#5ad0ff");
    },

    // Демогоргон: безлика голова розкривається, як квітка з п'яти пелюсток,
    // усередині — ряди зубів
    shop_demogorgon: function (ctx, s, time) {
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#6a5652");
        body.addColorStop(1, "#3a2c2a");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Прожилки
        ctx.strokeStyle = "#4a3836";
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.moveTo(-0.46 * s, 0.3 * s);
        ctx.quadraticCurveTo(-0.3 * s, 0.1 * s, -0.36 * s, -0.2 * s);
        ctx.moveTo(0.46 * s, 0.34 * s);
        ctx.quadraticCurveTo(0.28 * s, 0.2 * s, 0.38 * s, -0.24 * s);
        ctx.stroke();
        // Пелюстки розкриваються й закриваються
        var open = 0.5 + 0.5 * Math.sin(time * 0.0018);
        var cy = -0.02;
        var R = 0.22 + 0.24 * open;
        disc(ctx, s, "#2a0808", 0, cy, 0.06 + 0.1 * open);
        for (var i = 0; i < 5; i++) {
            var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
            var w = 0.4 + 0.2 * open;
            var bx1 = Math.cos(a - w) * 0.1;
            var by1 = cy + Math.sin(a - w) * 0.1;
            var bx2 = Math.cos(a + w) * 0.1;
            var by2 = cy + Math.sin(a + w) * 0.1;
            var tx = Math.cos(a) * R;
            var ty = cy + Math.sin(a) * R;
            tri(ctx, s, "#8a6a64", bx1, by1, bx2, by2, tx, ty);
            tri(ctx, s, "#d8484a", bx1 * 0.8, cy + (by1 - cy) * 0.8, bx2 * 0.8, cy + (by2 - cy) * 0.8, tx * 0.8, cy + (ty - cy) * 0.8);
            // Зубки вздовж пелюстки
            for (var k = 1; k <= 3; k++) {
                var f = k / 4;
                disc(ctx, s, "#f4ece0", tx * 0.8 * f, cy + (ty - cy) * 0.8 * f, 0.012 + 0.008 * open);
            }
        }
        // Крапля слизу стікає донизу
        var drip = (time * 0.0004) % 1;
        disc(ctx, s, "rgba(200, 220, 160, 0.7)", 0.12, 0.2 + drip * 0.28, 0.02);
        frame(ctx, s, "#e8202a");
    },

    // Жнець-левіафан: блідий, зі смугами, чотири щелепи-клешні клацають,
    // навколо здіймаються бульбашки
    shop_reaper: function (ctx, s, time) {
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#9aa8b4");
        body.addColorStop(1, "#4a5866");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        r(ctx, s, "#d8dce0", -0.5, 0.18, 1, 0.32);
        for (var st = 0; st < 3; st++) {
            r(ctx, s, "#3a4654", -0.5, -0.42 + st * 0.12, 1, 0.035);
        }
        // Маленькі червоні очі
        var glow = 0.7 + 0.3 * Math.sin(time * 0.005);
        disc(ctx, s, "rgba(255, 80, 50, " + (0.35 * glow).toFixed(2) + ")", -0.34, -0.2, 0.06);
        disc(ctx, s, "rgba(255, 80, 50, " + (0.35 * glow).toFixed(2) + ")", 0.34, -0.2, 0.06);
        disc(ctx, s, "#ff5a3a", -0.34, -0.2, 0.03);
        disc(ctx, s, "#ff5a3a", 0.34, -0.2, 0.03);
        // Паща з кільцем зубів
        disc(ctx, s, "#140c10", 0, 0.1, 0.13);
        for (var t = 0; t < 10; t++) {
            var ta = t * Math.PI / 5;
            disc(ctx, s, "#f0ece4", Math.cos(ta) * 0.11, 0.1 + Math.sin(ta) * 0.11, 0.018);
        }
        // Чотири щелепи-клешні клацають
        var snap = time > 0 ? Math.max(0, Math.sin(time * 0.005)) : 0;
        var claws = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (var c = 0; c < 4; c++) {
            var sx = claws[c][0];
            var sy = claws[c][1];
            var bx = sx * 0.3;
            var by = 0.1 + sy * 0.2;
            var tipx = sx * (0.1 + 0.1 * snap);
            var tipy = 0.1 + sy * (0.04 + 0.1 * snap);
            tri(ctx, s, "#e8e0d0", bx - 0.05, by, bx + 0.05, by + sy * 0.06, tipx, tipy);
            disc(ctx, s, "#5a4a3a", tipx, tipy, 0.015);
        }
        // Бульбашки
        for (var b = 0; b < 4; b++) {
            var bt = ((time * 0.0005) + b / 4) % 1;
            var bxp = -0.4 + b * 0.27 + Math.sin(bt * 8 + b) * 0.03;
            ctx.strokeStyle = "rgba(200, 240, 255, " + (0.8 * (1 - bt)).toFixed(2) + ")";
            ctx.lineWidth = Math.max(1, s * 0.015);
            ctx.beginPath();
            ctx.arc(bxp * s, (0.5 - bt * 1.1) * s, (0.02 + 0.015 * b % 2) * s, 0, Math.PI * 2);
            ctx.stroke();
        }
        frame(ctx, s, "#3ad0c8");
    },

    // ---------- Легендарні ----------

    // Вогняний фенікс: язики полум'я по краях, палаючі очі
    shop_phoenix: function (ctx, s, time) {
        // Полум'я довкола кубика, що мерехтить
        for (var i = 0; i < 12; i++) {
            var side = i % 4;
            var pos = -0.36 + Math.floor(i / 4) * 0.36;
            var flick = 0.12 + 0.08 * Math.abs(Math.sin(time * 0.009 + i * 1.7));
            var col = i % 2 === 0 ? "#ff5a1a" : "#ffb81a";
            if (side === 0) { tri(ctx, s, col, pos - 0.1, -0.48, pos + 0.1, -0.48, pos, -0.5 - flick); }
            else if (side === 1) { tri(ctx, s, col, 0.48, pos - 0.1, 0.48, pos + 0.1, 0.5 + flick, pos); }
            else if (side === 2) { tri(ctx, s, col, pos - 0.1, 0.48, pos + 0.1, 0.48, pos, 0.5 + flick * 0.6); }
            else { tri(ctx, s, col, -0.48, pos - 0.1, -0.48, pos + 0.1, -0.5 - flick, pos); }
        }
        var body = ctx.createLinearGradient(0, s / 2, 0, -s / 2);
        body.addColorStop(0, "#ffd23a");
        body.addColorStop(0.45, "#ff7a1a");
        body.addColorStop(1, "#c8101a");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Пір'я-гребінь
        tri(ctx, s, "#ffe680", -0.16, -0.5, 0, -0.5, -0.1, -0.3);
        tri(ctx, s, "#ffe680", 0, -0.5, 0.16, -0.5, 0.08, -0.3);
        // Крила-смуги на щоках
        tri(ctx, s, "#ffb81a", -0.5, 0.05, -0.2, 0.2, -0.5, 0.35);
        tri(ctx, s, "#ffb81a", 0.5, 0.05, 0.2, 0.2, 0.5, 0.35);
        // Палаючі очі
        var glow = 0.6 + 0.4 * Math.sin(time * 0.01);
        r(ctx, s, "#3a0a0a", -0.32, -0.18, 0.22, 0.14);
        r(ctx, s, "#3a0a0a", 0.1, -0.18, 0.22, 0.14);
        r(ctx, s, "rgba(255, 255, 160, " + glow.toFixed(2) + ")", -0.28, -0.15, 0.14, 0.08);
        r(ctx, s, "rgba(255, 255, 160, " + glow.toFixed(2) + ")", 0.14, -0.15, 0.14, 0.08);
        // Дзьоб
        tri(ctx, s, "#ffe680", -0.08, 0.02, 0.08, 0.02, 0, 0.16);
        tri(ctx, s, "#c88a0a", -0.03, 0.1, 0.03, 0.1, 0, 0.16);
        // Іскри, що злітають угору
        for (var k = 0; k < 6; k++) {
            var ph = ((time * 0.0008) + k / 6) % 1;
            var sx = -0.4 + ((k * 0.37) % 0.8) + Math.sin(ph * 9 + k) * 0.04;
            var sy = 0.4 - ph * 1.1;
            r(ctx, s, "rgba(255, " + Math.round(200 - ph * 120) + ", 40, " + (1 - ph).toFixed(2) + ")", sx, sy, 0.035, 0.035);
        }
        frame(ctx, s, "#ffe680");
    },

    // Кубик-райдуга: смуги всіх кольорів пливуть по кубику
    shop_rainbow: function (ctx, s, time) {
        var n = 7;
        var shift = (time * 0.00012) % 1;
        // Смуги зсуваються, тож малюємо їх лише в межах кубика
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.clip();
        for (var i = -1; i < n; i++) {
            var hue = ((i / n + shift) % 1) * 360;
            ctx.fillStyle = "hsl(" + hue.toFixed(0) + ", 95%, 58%)";
            var y0 = -0.5 + ((i + shift * n) / n);
            ctx.fillRect(-s / 2, y0 * s, s, s / n + 1);
        }
        ctx.restore();
        // Усміхнене обличчя
        r(ctx, s, "#ffffff", -0.3, -0.18, 0.16, 0.16);
        r(ctx, s, "#ffffff", 0.14, -0.18, 0.16, 0.16);
        r(ctx, s, "#1a1a2a", -0.24, -0.14, 0.08, 0.1);
        r(ctx, s, "#1a1a2a", 0.2, -0.14, 0.08, 0.1);
        r(ctx, s, "#1a1a2a", -0.2, 0.12, 0.4, 0.05);
        r(ctx, s, "#1a1a2a", -0.24, 0.07, 0.05, 0.06);
        r(ctx, s, "#1a1a2a", 0.19, 0.07, 0.05, 0.06);
        // Блискітки
        for (var k = 0; k < 4; k++) {
            var tw = Math.max(0, Math.sin(time * 0.004 + k * 1.6));
            var sx = [-0.36, 0.3, -0.3, 0.34][k];
            var sy = [-0.38, -0.36, 0.34, 0.3][k];
            r(ctx, s, "rgba(255, 255, 255, " + tw.toFixed(2) + ")", sx - 0.01, sy - 0.04, 0.02, 0.1);
            r(ctx, s, "rgba(255, 255, 255, " + tw.toFixed(2) + ")", sx - 0.04, sy - 0.01, 0.1, 0.02);
        }
        var hueFrame = ((time * 0.05) % 360).toFixed(0);
        frame(ctx, s, "hsl(" + hueFrame + ", 100%, 80%)");
    },

    // Золотий кубик: суцільне золото з діамантовими очима
    shop_golden: function (ctx, s, time) {
        var gold = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        gold.addColorStop(0, "#fff7cc");
        gold.addColorStop(0.3, "#ffd700");
        gold.addColorStop(0.6, "#c8960a");
        gold.addColorStop(1, "#8b6914");
        ctx.fillStyle = gold;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Карбований внутрішній квадрат
        ctx.strokeStyle = "rgba(139, 105, 20, 0.7)";
        ctx.lineWidth = Math.max(1, s * 0.03);
        ctx.strokeRect(-0.36 * s, -0.36 * s, 0.72 * s, 0.72 * s);
        // Діамантові очі, що переливаються
        var hue = (time * 0.08) % 360;
        for (var e = 0; e < 2; e++) {
            var ex = e === 0 ? -0.2 : 0.2;
            ctx.fillStyle = "hsl(" + ((hue + e * 60) % 360).toFixed(0) + ", 80%, 85%)";
            ctx.beginPath();
            ctx.moveTo(ex * s, -0.24 * s);
            ctx.lineTo((ex + 0.1) * s, -0.12 * s);
            ctx.lineTo(ex * s, 0);
            ctx.lineTo((ex - 0.1) * s, -0.12 * s);
            ctx.closePath();
            ctx.fill();
            r(ctx, s, "#ffffff", ex - 0.04, -0.18, 0.04, 0.04);
        }
        // Усмішка з темного золота
        r(ctx, s, "#8b6914", -0.18, 0.14, 0.36, 0.05);
        r(ctx, s, "#8b6914", -0.22, 0.09, 0.05, 0.06);
        r(ctx, s, "#8b6914", 0.17, 0.09, 0.05, 0.06);
        // Відблиск, що пробігає по золоту
        var sweep = ((time * 0.0006) % 1.8) - 0.4;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 240, 0.55)";
        ctx.beginPath();
        ctx.moveTo((sweep - 0.5) * s, 0.5 * s);
        ctx.lineTo((sweep - 0.35) * s, 0.5 * s);
        ctx.lineTo((sweep + 0.35) * s, -0.5 * s);
        ctx.lineTo((sweep + 0.2) * s, -0.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        frame(ctx, s, "#fff7cc");
    },

    // ---------- Нові скіни: Minecraft ----------

    // Аксолотль: рожевий, з пір'ястими зябрами, що ворушаться; кліпає
    shop_axolotl: function (ctx, s, time) {
        var wig = Math.sin(time * 0.006) * 0.03;
        // Зябра з обох боків
        for (var i = 0; i < 3; i++) {
            r(ctx, s, "#e8508a", -0.66, -0.4 + i * 0.16 + wig, 0.18, 0.08);
            r(ctx, s, "#e8508a", 0.48, -0.4 + i * 0.16 - wig, 0.18, 0.08);
        }
        r(ctx, s, "#ffb0d0", -0.5, -0.5, 1, 1);
        r(ctx, s, "#ffc8e0", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#ff90b8", -0.5, 0.3, 1, 0.2);
        if (blinking(time, 3200, 0)) {
            r(ctx, s, "#3a1a2a", -0.3, -0.08, 0.16, 0.04);
            r(ctx, s, "#3a1a2a", 0.14, -0.08, 0.16, 0.04);
        } else {
            r(ctx, s, "#3a1a2a", -0.3, -0.14, 0.14, 0.14);
            r(ctx, s, "#3a1a2a", 0.16, -0.14, 0.14, 0.14);
            r(ctx, s, "#ffffff", -0.27, -0.12, 0.05, 0.05);
            r(ctx, s, "#ffffff", 0.19, -0.12, 0.05, 0.05);
        }
        // Усмішка
        r(ctx, s, "#c8507a", -0.14, 0.1, 0.28, 0.04);
        r(ctx, s, "#c8507a", -0.18, 0.06, 0.05, 0.05);
        r(ctx, s, "#c8507a", 0.13, 0.06, 0.05, 0.05);
        frame(ctx, s, "#ff6aa8");
    },

    // Бджілка: смужки, крильця тремтять, жало ззаду
    shop_bee: function (ctx, s, time) {
        var flap = Math.abs(Math.sin(time * 0.05));
        r(ctx, s, "rgba(220, 240, 255, 0.85)", -0.3, -0.62 - flap * 0.1, 0.26, 0.2 + flap * 0.1);
        r(ctx, s, "rgba(220, 240, 255, 0.85)", 0.04, -0.62 - flap * 0.1, 0.26, 0.2 + flap * 0.1);
        r(ctx, s, "#ffcc33", -0.5, -0.5, 1, 1);
        r(ctx, s, "#3a2a10", -0.5, -0.5, 1, 0.12);
        r(ctx, s, "#3a2a10", -0.5, 0.16, 1, 0.12);
        r(ctx, s, "#3a2a10", -0.5, 0.4, 1, 0.1);
        tri(ctx, s, "#3a2a10", 0.5, 0.2, 0.5, 0.36, 0.66, 0.28);
        // Великі очі й вусики
        eye(ctx, s, -0.34, -0.3, 0.2, "#1a1a1a", "#1a1a1a", 0);
        eye(ctx, s, 0.14, -0.3, 0.2, "#1a1a1a", "#1a1a1a", 0);
        r(ctx, s, "#ffffff", -0.3, -0.26, 0.06, 0.06);
        r(ctx, s, "#ffffff", 0.18, -0.26, 0.06, 0.06);
        r(ctx, s, "#1a1a1a", -0.1, 0.02, 0.2, 0.04);
        frame(ctx, s, "#e8a020");
    },

    // Вартовий: темний, без очей, у грудях пульсує бірюзове серце
    shop_warden: function (ctx, s, time) {
        var beat = time === 0 ? 0.5 : Math.pow(Math.max(0, Math.sin(time * 0.006)), 6);
        // «Роги»-сенсори
        r(ctx, s, "#0e3a3a", -0.46, -0.72, 0.14, 0.24);
        r(ctx, s, "#0e3a3a", 0.32, -0.72, 0.14, 0.24);
        r(ctx, s, "rgba(80, 230, 220, " + (0.4 + beat * 0.6).toFixed(2) + ")", -0.44, -0.68, 0.1, 0.1);
        r(ctx, s, "rgba(80, 230, 220, " + (0.4 + beat * 0.6).toFixed(2) + ")", 0.34, -0.68, 0.1, 0.1);
        r(ctx, s, "#0e2a30", -0.5, -0.5, 1, 1);
        r(ctx, s, "#163a40", -0.5, -0.5, 1, 0.1);
        // Щелепа
        r(ctx, s, "#0a1c20", -0.3, -0.2, 0.6, 0.12);
        r(ctx, s, "#c8d8d0", -0.26, -0.2, 0.06, 0.06);
        r(ctx, s, "#c8d8d0", 0.2, -0.2, 0.06, 0.06);
        // Серце-душі в грудях
        var glow = 0.3 + beat * 0.7;
        r(ctx, s, "rgba(80, 230, 220, " + (0.25 * glow).toFixed(2) + ")", -0.3, -0.02, 0.6, 0.5);
        r(ctx, s, "rgba(120, 255, 240, " + glow.toFixed(2) + ")", -0.12, 0.08, 0.24, 0.26);
        r(ctx, s, "#e8fffa", -0.05, 0.14, 0.1, 0.1);
        frame(ctx, s, "#2a8a8a");
    },

    // Ілагер: сіре обличчя, насуплені брови, великий ніс, арбалет за плечем
    shop_illager: function (ctx, s, time) {
        r(ctx, s, "#6a4a2a", 0.3, -0.62, 0.08, 0.4);
        r(ctx, s, "#4a3a2a", 0.16, -0.6, 0.34, 0.06);
        r(ctx, s, "#9aa0a4", -0.5, -0.5, 1, 1);
        r(ctx, s, "#3a3a44", -0.5, -0.5, 1, 0.16);
        // Брови сходяться донизу
        tri(ctx, s, "#2a2a30", -0.36, -0.2, -0.04, -0.12, -0.36, -0.14);
        tri(ctx, s, "#2a2a30", 0.36, -0.2, 0.04, -0.12, 0.36, -0.14);
        var look = Math.sin(time * 0.002) * 0.03;
        r(ctx, s, "#ffffff", -0.3, -0.1, 0.16, 0.08);
        r(ctx, s, "#ffffff", 0.14, -0.1, 0.16, 0.08);
        r(ctx, s, "#2a8a3a", -0.24 + look, -0.1, 0.07, 0.08);
        r(ctx, s, "#2a8a3a", 0.2 + look, -0.1, 0.07, 0.08);
        // Ніс і рот
        r(ctx, s, "#80868a", -0.07, -0.04, 0.14, 0.3);
        r(ctx, s, "#3a3a44", -0.18, 0.32, 0.36, 0.05);
        // Темний одяг
        r(ctx, s, "#3a3a44", -0.5, 0.4, 1, 0.1);
        frame(ctx, s, "#5a5a64");
    },
};

export { SHOP_SKINS_3 };
