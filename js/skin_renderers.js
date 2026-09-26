// ============================================================
// skin_renderers.js — реєстр SKIN_RENDERERS: рендеринг кожного скіна кубика
// (плюс скіни з магазину й нових рівнів Ліги 1)
// ============================================================

import { EXTRA_LEVEL_SKINS } from "./level_skins_extra.js";
import { SHOP_SKIN_RENDERERS } from "./shop_skins.js";
import { drawPixelArt, drawSkinFrame, renderSkinGlow } from "./skins.js";

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
