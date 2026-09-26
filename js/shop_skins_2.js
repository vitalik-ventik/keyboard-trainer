// ============================================================
// shop_skins_2.js — скіни магазину, частина 2: астронавт, чарівник, супергерой, робот,
// геймер, кришталевий голем, НЛО, дракони, термінатор, хижак
// ============================================================

import { disc, frame, r, tri } from "./shop_skins.js";

const SHOP_SKINS_2 = {

    // Астронавт: шолом, у склі пропливають зорі
    shop_astronaut: function (ctx, s, time) {
        r(ctx, s, "#f4f6fa", -0.5, -0.5, 1, 1);
        r(ctx, s, "#c8ccd8", -0.5, 0.36, 1, 0.14);
        // Антена з вогником
        r(ctx, s, "#9aa0aa", 0.3, -0.62, 0.03, 0.14);
        var blink = Math.sin(time * 0.006) > 0;
        disc(ctx, s, blink ? "#ff3a3a" : "#8a2020", 0.315, -0.64, 0.04);
        // Скло шолома
        var vx = -0.38, vyy = -0.3, vw = 0.76, vh = 0.54;
        var glass = ctx.createLinearGradient(0, vyy * s, 0, (vyy + vh) * s);
        glass.addColorStop(0, "#1a2a6a");
        glass.addColorStop(1, "#0a1030");
        ctx.fillStyle = glass;
        ctx.fillRect(vx * s, vyy * s, vw * s, vh * s);
        // Зорі у відображенні повільно пливуть
        ctx.save();
        ctx.beginPath();
        ctx.rect(vx * s, vyy * s, vw * s, vh * s);
        ctx.clip();
        for (var i = 0; i < 9; i++) {
            var sx = vx + ((i * 0.29 + time * 0.00004) % 1) * vw;
            var sy = vyy + ((i * 0.43) % 1) * vh;
            var tw = 0.5 + 0.5 * Math.sin(time * 0.005 + i * 1.7);
            r(ctx, s, "rgba(255, 255, 255, " + (0.4 + 0.6 * tw).toFixed(2) + ")", sx, sy, 0.03, 0.03);
        }
        // Маленька планета у відображенні
        disc(ctx, s, "#ff9a3d", vx + vw * 0.75, vyy + vh * 0.7, 0.06);
        ctx.restore();
        // Відблиск
        r(ctx, s, "rgba(255, 255, 255, 0.55)", -0.34, -0.26, 0.2, 0.04);
        r(ctx, s, "rgba(255, 255, 255, 0.35)", -0.34, -0.2, 0.06, 0.1);
        // Нашивка з прапорцем
        r(ctx, s, "#0057b7", -0.4, 0.38, 0.16, 0.05);
        r(ctx, s, "#ffd700", -0.4, 0.43, 0.16, 0.05);
        frame(ctx, s, "#c8d8ff");
    },

    // Чарівник: ковпак із зорями, біла борода, іскри з палички
    shop_wizard: function (ctx, s, time) {
        // Високий ковпак над кубиком
        tri(ctx, s, "#4a2a9a", -0.42, -0.36, 0.42, -0.36, 0.14, -0.86);
        r(ctx, s, "#ffd23a", 0, -0.62, 0.05, 0.05);
        r(ctx, s, "#ffd23a", -0.18, -0.46, 0.04, 0.04);
        r(ctx, s, "#5a3aba", -0.5, -0.5, 1, 1);
        r(ctx, s, "#3a1a7a", -0.5, -0.4, 1, 0.08);
        r(ctx, s, "#ffd23a", -0.16, -0.4, 0.04, 0.04);
        r(ctx, s, "#ffd23a", 0.22, -0.39, 0.04, 0.04);
        // Обличчя
        r(ctx, s, "#f0c8a0", -0.3, -0.3, 0.6, 0.3);
        r(ctx, s, "#dcdcdc", -0.28, -0.24, 0.2, 0.04);
        r(ctx, s, "#dcdcdc", 0.08, -0.24, 0.2, 0.04);
        r(ctx, s, "#2a4a9a", -0.22, -0.18, 0.08, 0.08);
        r(ctx, s, "#2a4a9a", 0.14, -0.18, 0.08, 0.08);
        r(ctx, s, "#d8a080", -0.04, -0.14, 0.08, 0.1);
        // Довга борода
        r(ctx, s, "#f4f4f4", -0.3, -0.02, 0.6, 0.3);
        r(ctx, s, "#f4f4f4", -0.2, 0.28, 0.4, 0.12);
        r(ctx, s, "#f4f4f4", -0.1, 0.4, 0.2, 0.08);
        r(ctx, s, "#d8d8d8", -0.12, 0.02, 0.24, 0.04);
        // Чарівна паличка з іскрами
        ctx.save();
        ctx.translate(0.44 * s, 0.22 * s);
        ctx.rotate(-0.5);
        r(ctx, s, "#6a3a1a", -0.02, -0.3, 0.04, 0.3);
        r(ctx, s, "#ffffff", -0.025, -0.33, 0.05, 0.05);
        ctx.restore();
        for (var i = 0; i < 5; i++) {
            var t = ((time * 0.001) + i / 5) % 1;
            var a = i * 1.3 + t * 2;
            var sx = 0.58 + Math.cos(a) * t * 0.22;
            var sy = -0.06 + Math.sin(a) * t * 0.22 - t * 0.1;
            var colors = ["#ffd23a", "#7ad8ff", "#ff7ae0"];
            ctx.globalAlpha = 1 - t;
            r(ctx, s, colors[i % 3], sx, sy, 0.04, 0.04);
        }
        ctx.globalAlpha = 1;
        frame(ctx, s, "#b89aff");
    },

    // Супергерой: плащ майорить, маска, емблема-блискавка
    shop_superhero: function (ctx, s, time) {
        // Плащ позаду, хвилюється на вітрі
        ctx.fillStyle = "#c8101a";
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, -0.4 * s);
        for (var i = 0; i <= 6; i++) {
            var yy = -0.4 + i * 0.15;
            var xx = -0.5 - 0.12 - i * 0.03 + Math.sin(time * 0.008 + i * 0.9) * 0.05;
            ctx.lineTo(xx * s, yy * s);
        }
        ctx.lineTo(-0.5 * s, 0.5 * s);
        ctx.closePath();
        ctx.fill();
        r(ctx, s, "#1a5aca", -0.5, -0.5, 1, 1);
        r(ctx, s, "#f0c8a0", -0.36, -0.36, 0.72, 0.42);
        r(ctx, s, "#1a1a2a", -0.36, -0.44, 0.72, 0.12);
        // Маска з білими очима
        r(ctx, s, "#e8202a", -0.4, -0.22, 0.8, 0.14);
        r(ctx, s, "#ffffff", -0.28, -0.2, 0.14, 0.08);
        r(ctx, s, "#ffffff", 0.14, -0.2, 0.14, 0.08);
        r(ctx, s, "#c87a5a", -0.12, -0.02, 0.24, 0.04);
        r(ctx, s, "#c87a5a", -0.14, -0.04, 0.04, 0.04);
        r(ctx, s, "#c87a5a", 0.1, -0.04, 0.04, 0.04);
        // Емблема-блискавка на грудях
        r(ctx, s, "#ffcc33", -0.18, 0.12, 0.36, 0.32);
        ctx.fillStyle = "#e8202a";
        ctx.beginPath();
        ctx.moveTo(0.04 * s, 0.14 * s);
        ctx.lineTo(-0.1 * s, 0.3 * s);
        ctx.lineTo(0, 0.3 * s);
        ctx.lineTo(-0.04 * s, 0.42 * s);
        ctx.lineTo(0.1 * s, 0.26 * s);
        ctx.lineTo(0, 0.26 * s);
        ctx.closePath();
        ctx.fill();
        var shine = (time * 0.0006) % 1.6;
        if (shine < 1) {
            r(ctx, s, "rgba(255, 255, 255, 0.5)", -0.18 + shine * 0.32, 0.12, 0.04, 0.32);
        }
        frame(ctx, s, "#ffcc33");
    },

    // ---------- Техніка й фантастика ----------

    // Робот: візор зі сканувальним оком, антена з лампочкою
    shop_robot: function (ctx, s, time) {
        r(ctx, s, "#6a7a8a", 0.3, -0.66, 0.04, 0.18);
        var lamp = (time % 1400) > 700;
        disc(ctx, s, lamp ? "#ff3a3a" : "#7a1a1a", 0.32, -0.68, 0.05);
        var metal = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        metal.addColorStop(0, "#b8c4d0");
        metal.addColorStop(1, "#6a7a8a");
        ctx.fillStyle = metal;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Болти
        var bolts = [[-0.42, -0.42], [0.36, -0.42], [-0.42, 0.36], [0.36, 0.36]];
        for (var i = 0; i < 4; i++) {
            r(ctx, s, "#4a5a6a", bolts[i][0], bolts[i][1], 0.06, 0.06);
        }
        // Візор і око, що бігає туди-сюди
        r(ctx, s, "#0a0e18", -0.38, -0.24, 0.76, 0.2);
        var scan = Math.sin(time * 0.003) * 0.26;
        r(ctx, s, "rgba(0, 246, 255, 0.35)", -0.08 + scan, -0.24, 0.16, 0.2);
        r(ctx, s, "#00f6ff", -0.05 + scan, -0.19, 0.1, 0.1);
        // Решітка динаміка
        r(ctx, s, "#3a4a5a", -0.24, 0.1, 0.48, 0.2);
        for (var g = 0; g < 5; g++) {
            r(ctx, s, "#8a9aaa", -0.22 + g * 0.1, 0.12, 0.04, 0.16);
        }
        // Індикатори на щоках
        var led = Math.floor(time / 300) % 3;
        r(ctx, s, led === 0 ? "#39ff88" : "#1a5a3a", -0.44, 0.08, 0.08, 0.06);
        r(ctx, s, led === 1 ? "#ffcc33" : "#5a4a1a", -0.44, 0.18, 0.08, 0.06);
        r(ctx, s, led === 2 ? "#39ff88" : "#1a5a3a", 0.36, 0.08, 0.08, 0.06);
        frame(ctx, s, "#dce6f0");
    },

    // Геймер: великі навушники, на щоці відсвічує екран
    shop_gamer: function (ctx, s, time) {
        r(ctx, s, "#f0c8a0", -0.5, -0.5, 1, 1);
        // Кепка козирком назад
        r(ctx, s, "#2a2a3a", -0.5, -0.5, 1, 0.22);
        r(ctx, s, "#2a2a3a", 0.3, -0.34, 0.2, 0.06);
        // Відсвіт екрана: колір змінюється, наче там гра
        var hue = Math.floor(time / 400) % 3;
        var screen = ["rgba(0, 246, 255, 0.14)", "rgba(255, 46, 166, 0.13)", "rgba(255, 220, 60, 0.13)"][hue];
        r(ctx, s, screen, -0.5, -0.28, 1, 0.78);
        // Зосереджені очі з відблиском екрана
        r(ctx, s, "#ffffff", -0.3, -0.14, 0.18, 0.1);
        r(ctx, s, "#ffffff", 0.12, -0.14, 0.18, 0.1);
        var look = Math.sin(time * 0.01) * 0.02;
        r(ctx, s, "#2a1a10", -0.24 + look, -0.14, 0.08, 0.1);
        r(ctx, s, "#2a1a10", 0.18 + look, -0.14, 0.08, 0.1);
        r(ctx, s, "#5a3a1a", -0.32, -0.2, 0.2, 0.03);
        r(ctx, s, "#5a3a1a", 0.12, -0.2, 0.2, 0.03);
        // Язик набік — повна зосередженість
        r(ctx, s, "#8a4a3a", -0.1, 0.16, 0.2, 0.04);
        r(ctx, s, "#ff6a8a", 0.04, 0.19, 0.06, 0.05);
        // Навушники: дужка й великі чашки з підсвіткою
        r(ctx, s, "#1a1a24", -0.5, -0.32, 1, 0.06);
        r(ctx, s, "#1a1a24", -0.56, -0.2, 0.18, 0.34);
        r(ctx, s, "#1a1a24", 0.38, -0.2, 0.18, 0.34);
        var pulse = 0.5 + 0.5 * Math.sin(time * 0.008);
        r(ctx, s, "rgba(255, 46, 166, " + (0.5 + 0.5 * pulse).toFixed(2) + ")", -0.52, -0.1, 0.06, 0.14);
        r(ctx, s, "rgba(0, 246, 255, " + (0.5 + 0.5 * pulse).toFixed(2) + ")", 0.46, -0.1, 0.06, 0.14);
        // Мікрофон
        r(ctx, s, "#1a1a24", 0.3, 0.1, 0.12, 0.03);
        r(ctx, s, "#3a3a4a", 0.22, 0.08, 0.08, 0.07);
        frame(ctx, s, "#ff5ad8");
    },

    // Кристальний голем: світиться зсередини, по гранях біжить відблиск
    shop_crystal_golem: function (ctx, s, time) {
        var pulse = 0.5 + 0.5 * Math.sin(time * 0.003);
        var body = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        body.addColorStop(0, "#9af4ff");
        body.addColorStop(0.5, "#3ab8e8");
        body.addColorStop(1, "#6a5aff");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Грані кристала
        tri(ctx, s, "rgba(255, 255, 255, 0.25)", -0.5, -0.5, 0.1, -0.5, -0.5, 0.1);
        tri(ctx, s, "rgba(40, 20, 120, 0.25)", 0.5, 0.5, -0.1, 0.5, 0.5, -0.1);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, 0.1 * s);
        ctx.lineTo(-0.1 * s, -0.1 * s);
        ctx.lineTo(0.1 * s, -0.5 * s);
        ctx.moveTo(-0.1 * s, -0.1 * s);
        ctx.lineTo(0.2 * s, 0.2 * s);
        ctx.lineTo(0.5 * s, -0.1 * s);
        ctx.moveTo(0.2 * s, 0.2 * s);
        ctx.lineTo(-0.1 * s, 0.5 * s);
        ctx.stroke();
        // Серце-ядро, що пульсує
        var core = ctx.createRadialGradient(0, 0.1 * s, 0, 0, 0.1 * s, s * 0.35);
        core.addColorStop(0, "rgba(255, 255, 255, " + (0.5 + 0.4 * pulse).toFixed(2) + ")");
        core.addColorStop(1, "rgba(120, 220, 255, 0)");
        ctx.fillStyle = core;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Сяючі очі й рот
        r(ctx, s, "#ffffff", -0.3, -0.18, 0.16, 0.1);
        r(ctx, s, "#ffffff", 0.14, -0.18, 0.16, 0.1);
        r(ctx, s, "rgba(0, 60, 120, 0.6)", -0.14, 0.14, 0.28, 0.05);
        // Відблиск, що пробігає діагоналлю
        var sweep = ((time * 0.0005) % 1.5) - 0.25;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo((sweep - 0.6) * s, 0.5 * s);
        ctx.lineTo((sweep - 0.45) * s, 0.5 * s);
        ctx.lineTo((sweep + 0.45) * s, -0.5 * s);
        ctx.lineTo((sweep + 0.3) * s, -0.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        frame(ctx, s, "rgba(220, 250, 255, " + (0.7 + 0.3 * pulse).toFixed(2) + ")");
    },

    // НЛО: тарілка з прибульцем під куполом, вогники й промінь
    shop_ufo: function (ctx, s, time) {
        r(ctx, s, "#0a0a2a", -0.5, -0.5, 1, 1);
        for (var i = 0; i < 7; i++) {
            var tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.003 + i * 2.1));
            r(ctx, s, "rgba(255, 255, 255, " + tw.toFixed(2) + ")", -0.44 + ((i * 0.37) % 0.9), -0.44 + ((i * 0.61) % 0.5), 0.025, 0.025);
        }
        var bob = Math.sin(time * 0.004) * 0.03;
        // Промінь тягне вгору маленький кубик
        var beam = 0.3 + 0.15 * Math.sin(time * 0.01);
        ctx.fillStyle = "rgba(255, 240, 120, " + beam.toFixed(2) + ")";
        ctx.beginPath();
        ctx.moveTo(-0.14 * s, (0.08 + bob) * s);
        ctx.lineTo(0.14 * s, (0.08 + bob) * s);
        ctx.lineTo(0.3 * s, 0.5 * s);
        ctx.lineTo(-0.3 * s, 0.5 * s);
        ctx.closePath();
        ctx.fill();
        var lift = (time * 0.0004) % 1;
        r(ctx, s, "#39ff88", -0.04, 0.42 - lift * 0.3, 0.08, 0.08);
        // Купол із прибульцем
        ctx.fillStyle = "rgba(150, 230, 255, 0.45)";
        ctx.beginPath();
        ctx.arc(0, (-0.06 + bob) * s, 0.2 * s, Math.PI, 0);
        ctx.fill();
        disc(ctx, s, "#5ad85a", 0, -0.1 + bob, 0.09);
        r(ctx, s, "#101010", -0.06, -0.12 + bob, 0.05, 0.04);
        r(ctx, s, "#101010", 0.01, -0.12 + bob, 0.05, 0.04);
        // Тарілка
        ctx.fillStyle = "#9aa4b8";
        ctx.beginPath();
        ctx.ellipse(0, (0.02 + bob) * s, 0.46 * s, 0.1 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        r(ctx, s, "#6a7488", -0.36, 0.04 + bob, 0.72, 0.04);
        // Вогники по черзі
        var active = Math.floor(time / 200) % 5;
        var lights = ["#ff3a3a", "#ffcc33", "#39ff88", "#00f6ff", "#ff5ad8"];
        for (var l = 0; l < 5; l++) {
            disc(ctx, s, l === active ? lights[l] : "#3a3a4a", -0.3 + l * 0.15, 0.02 + bob, 0.03);
        }
        frame(ctx, s, "#7a8aff");
    },

    // Чорний дракончик: великі зелені очі, вушка-плавці, беззуба усмішка,
    // крильця махають, зіниці то звужуються, то розширюються, іноді кліпає
    shop_night_dragon: function (ctx, s, time) {
        var flap = Math.sin(time * 0.006) * 0.08;
        var wiggle = Math.sin(time * 0.004) * 0.03;
        // Хвіст із червоним плавцем позаду кубика
        tri(ctx, s, "#15161d", 0.3, 0.3, 0.72, 0.28, 0.5, 0.48);
        tri(ctx, s, "#d8302a", 0.62, 0.2, 0.8, 0.22, 0.7, 0.4);
        tri(ctx, s, "#15161d", 0.6, 0.3, 0.76, 0.46, 0.64, 0.5);
        // Крильця позаду махають
        tri(ctx, s, "#2e3346", -0.46, -0.16, -0.84, -0.4 - flap, -0.7, 0.14);
        tri(ctx, s, "#2e3346", 0.46, -0.16, 0.84, -0.4 - flap, 0.7, 0.14);
        tri(ctx, s, "#4a5270", -0.5, -0.08, -0.74, -0.3 - flap, -0.64, 0.08);
        tri(ctx, s, "#4a5270", 0.5, -0.08, 0.74, -0.3 - flap, 0.64, 0.08);
        // Вушка-плавці: великі по краях, маленькі ближче до центру
        tri(ctx, s, "#2e3346", -0.44, -0.48, -0.22, -0.48, -0.56 - wiggle, -0.76);
        tri(ctx, s, "#2e3346", 0.44, -0.48, 0.22, -0.48, 0.56 + wiggle, -0.76);
        tri(ctx, s, "#2e3346", -0.2, -0.48, -0.06, -0.48, -0.2 - wiggle, -0.66);
        tri(ctx, s, "#2e3346", 0.2, -0.48, 0.06, -0.48, 0.2 + wiggle, -0.66);
        tri(ctx, s, "#4a5270", -0.4, -0.48, -0.28, -0.48, -0.5 - wiggle, -0.68);
        tri(ctx, s, "#4a5270", 0.4, -0.48, 0.28, -0.48, 0.5 + wiggle, -0.68);
        // Тіло: чорне з синюватим полиском
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#2a2e3c");
        body.addColorStop(1, "#111218");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        r(ctx, s, "rgba(120, 150, 255, 0.12)", -0.46, -0.46, 0.92, 0.06);
        // Лусочки-цяточки
        r(ctx, s, "#353a4c", -0.38, -0.36, 0.04, 0.04);
        r(ctx, s, "#353a4c", 0.3, -0.38, 0.04, 0.04);
        r(ctx, s, "#353a4c", -0.02, -0.4, 0.04, 0.04);
        // Рум'янець
        disc(ctx, s, "rgba(255, 120, 160, 0.42)", -0.34, 0.14, 0.07);
        disc(ctx, s, "rgba(255, 120, 160, 0.42)", 0.34, 0.14, 0.07);
        // Великі зелені очі
        var blink = time > 0 && (time % 3600) < 140;
        var pupil = 0.035 + 0.025 * (0.5 + 0.5 * Math.sin(time * 0.0025));
        for (var e = -1; e <= 1; e += 2) {
            var ex = e * 0.2;
            if (blink) {
                r(ctx, s, "#9be83a", ex - 0.12, -0.06, 0.24, 0.03);
                continue;
            }
            disc(ctx, s, "#6cc82a", ex, -0.06, 0.14);
            disc(ctx, s, "#b8f050", ex, -0.06, 0.11);
            ctx.fillStyle = "#0c0d12";
            ctx.beginPath();
            ctx.ellipse(ex * s, -0.06 * s, pupil * s, 0.09 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            // Блиски
            disc(ctx, s, "#ffffff", ex - 0.05, -0.12, 0.03);
            disc(ctx, s, "#ffffff", ex + 0.05, -0.01, 0.015);
        }
        // Ніздрі
        disc(ctx, s, "#050507", -0.06, 0.13, 0.02);
        disc(ctx, s, "#050507", 0.06, 0.13, 0.02);
        // Беззуба усмішка: рожеві ясна
        ctx.fillStyle = "#e8849e";
        ctx.beginPath();
        ctx.moveTo(-0.18 * s, 0.22 * s);
        ctx.quadraticCurveTo(0, 0.4 * s, 0.18 * s, 0.22 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#050507";
        ctx.lineWidth = Math.max(1, s * 0.025);
        ctx.beginPath();
        ctx.moveTo(-0.2 * s, 0.21 * s);
        ctx.quadraticCurveTo(0, 0.42 * s, 0.2 * s, 0.21 * s);
        ctx.stroke();
        frame(ctx, s, "#4ab0ff");
    },

    // Дракончик: ріжки, крильця, з ніздрів іде димок
    shop_dragon: function (ctx, s, time) {
        // Крильця позаду махають
        var flap = Math.sin(time * 0.007) * 0.08;
        tri(ctx, s, "#2a7a4a", -0.46, -0.2, -0.78, -0.42 - flap, -0.66, 0.1);
        tri(ctx, s, "#2a7a4a", 0.46, -0.2, 0.78, -0.42 - flap, 0.66, 0.1);
        tri(ctx, s, "#5ad88a", -0.5, -0.1, -0.7, -0.3 - flap, -0.62, 0.04);
        tri(ctx, s, "#5ad88a", 0.5, -0.1, 0.7, -0.3 - flap, 0.62, 0.04);
        // Ріжки
        tri(ctx, s, "#f0e0b0", -0.36, -0.5, -0.2, -0.5, -0.34, -0.72);
        tri(ctx, s, "#f0e0b0", 0.36, -0.5, 0.2, -0.5, 0.34, -0.72);
        r(ctx, s, "#3aa86a", -0.5, -0.5, 1, 1);
        // Лусочки
        for (var yy = 0; yy < 3; yy++) {
            for (var xx = 0; xx < 4; xx++) {
                r(ctx, s, "#2e8a56", -0.42 + xx * 0.24 + (yy % 2) * 0.12, -0.44 + yy * 0.1, 0.1, 0.04);
            }
        }
        // Світле черевце й гребінь
        r(ctx, s, "#f0e0a0", -0.26, 0.2, 0.52, 0.3);
        r(ctx, s, "#d8c080", -0.26, 0.3, 0.52, 0.02);
        r(ctx, s, "#d8c080", -0.26, 0.4, 0.52, 0.02);
        // Жовті очі з вертикальною зіницею
        r(ctx, s, "#ffd23a", -0.32, -0.16, 0.18, 0.14);
        r(ctx, s, "#ffd23a", 0.14, -0.16, 0.18, 0.14);
        r(ctx, s, "#1a1a1a", -0.25, -0.16, 0.04, 0.14);
        r(ctx, s, "#1a1a1a", 0.21, -0.16, 0.04, 0.14);
        r(ctx, s, "#1e6a3e", -0.34, -0.21, 0.2, 0.04);
        r(ctx, s, "#1e6a3e", 0.14, -0.21, 0.2, 0.04);
        // Ніздрі та зубки
        r(ctx, s, "#1e5a36", -0.12, 0.04, 0.06, 0.04);
        r(ctx, s, "#1e5a36", 0.06, 0.04, 0.06, 0.04);
        r(ctx, s, "#1e5a36", -0.2, 0.12, 0.4, 0.04);
        tri(ctx, s, "#ffffff", -0.16, 0.12, -0.1, 0.12, -0.13, 0.18);
        tri(ctx, s, "#ffffff", 0.1, 0.12, 0.16, 0.12, 0.13, 0.18);
        // Димок із ніздрів
        for (var i = 0; i < 4; i++) {
            var t = ((time * 0.0007) + i / 4) % 1;
            var side = i % 2 === 0 ? -0.09 : 0.09;
            var px = side * (1 + t * 3) + Math.sin(t * 6 + i) * 0.03;
            var py = 0.02 - t * 0.5;
            ctx.fillStyle = "rgba(200, 200, 210, " + (0.6 * (1 - t)).toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(px * s, py * s, (0.03 + t * 0.06) * s, 0, Math.PI * 2);
            ctx.fill();
        }
        frame(ctx, s, "#8affb0");
    },

    // ---------- Скіни Ліг 3–4 ----------

    // Термінатор: хромований череп, червоні очі, сталеві зуби;
    // час від часу червона смуга сканує все, що бачить
    shop_terminator: function (ctx, s, time) {
        var body = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
        body.addColorStop(0, "#e4e8ee");
        body.addColorStop(1, "#6e7480");
        ctx.fillStyle = body;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Пластини лоба та болти на скронях
        r(ctx, s, "#9aa0ac", -0.4, -0.34, 0.8, 0.03);
        r(ctx, s, "#b8bec8", -0.02, -0.5, 0.04, 0.16);
        disc(ctx, s, "#5a606a", -0.4, -0.4, 0.03);
        disc(ctx, s, "#5a606a", 0.4, -0.4, 0.03);
        // Очниці
        r(ctx, s, "#1a1c22", -0.36, -0.24, 0.26, 0.18);
        r(ctx, s, "#1a1c22", 0.1, -0.24, 0.26, 0.18);
        // Червоні очі світяться
        var glow = 0.75 + 0.25 * Math.sin(time * 0.006);
        for (var e = -1; e <= 1; e += 2) {
            var ex = e * 0.23;
            disc(ctx, s, "rgba(255, 40, 40, " + (0.4 * glow).toFixed(2) + ")", ex, -0.15, 0.11);
            disc(ctx, s, "#ff2a2a", ex, -0.15, 0.055);
            disc(ctx, s, "#ffd0d0", ex - 0.015, -0.165, 0.018);
        }
        // Носова порожнина та вилиці
        tri(ctx, s, "#2a2c32", -0.06, 0.1, 0.06, 0.1, 0, -0.02);
        r(ctx, s, "#8a909c", -0.46, 0.04, 0.22, 0.03);
        r(ctx, s, "#8a909c", 0.24, 0.04, 0.22, 0.03);
        // Щелепа з поршнями та сталевими зубами
        r(ctx, s, "#5a606a", -0.46, 0.14, 0.08, 0.26);
        r(ctx, s, "#5a606a", 0.38, 0.14, 0.08, 0.26);
        r(ctx, s, "#2e3238", -0.32, 0.18, 0.64, 0.22);
        for (var t = 0; t < 7; t++) {
            r(ctx, s, "#eceef2", -0.3 + t * 0.086, 0.2, 0.068, 0.08);
            r(ctx, s, "#d0d4da", -0.3 + t * 0.086, 0.3, 0.068, 0.08);
        }
        // Смуга сканування
        var scan = (time % 3200) / 3200;
        if (time > 0 && scan < 0.35) {
            r(ctx, s, "rgba(255, 50, 50, 0.45)", -0.5, -0.5 + scan / 0.35, 1, 0.025);
        }
        frame(ctx, s, "#ff3a3a");
    },

    // Хижак: дреди, металева маска з вузькими прорізами очей,
    // три червоні точки прицілу повзають лобом
    shop_predator: function (ctx, s, time) {
        // Дреди звисають по боках (позаду кубика)
        for (var d = 0; d < 5; d++) {
            var sway = Math.sin(time * 0.003 + d) * 0.02;
            for (var side = -1; side <= 1; side += 2) {
                var dx = side * (0.44 + d * 0.035) - 0.025 + sway;
                var len = 0.55 + (d % 2) * 0.15;
                r(ctx, s, "#4a4a30", dx, -0.46 + d * 0.02, 0.05, len);
                r(ctx, s, "#2e2e1c", dx + 0.035, -0.46 + d * 0.02, 0.015, len);
                r(ctx, s, "#b89a4a", dx, -0.3 + d * 0.06, 0.05, 0.03);
            }
        }
        r(ctx, s, "#5a6a3a", -0.5, -0.5, 1, 1);
        disc(ctx, s, "#3e4a28", -0.36, 0.34, 0.05);
        disc(ctx, s, "#3e4a28", 0.34, 0.3, 0.04);
        disc(ctx, s, "#3e4a28", 0.3, -0.42, 0.03);
        // Маска
        var mask = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.42);
        mask.addColorStop(0, "#c8c2a8");
        mask.addColorStop(1, "#6e6852");
        ctx.fillStyle = mask;
        ctx.beginPath();
        ctx.moveTo(-0.4 * s, -0.4 * s);
        ctx.lineTo(0.4 * s, -0.4 * s);
        ctx.lineTo(0.44 * s, 0.08 * s);
        ctx.lineTo(0.2 * s, 0.42 * s);
        ctx.lineTo(-0.2 * s, 0.42 * s);
        ctx.lineTo(-0.44 * s, 0.08 * s);
        ctx.closePath();
        ctx.fill();
        r(ctx, s, "#7a7460", -0.02, -0.4, 0.04, 0.82);
        // Прорізи очей
        tri(ctx, s, "#15150e", -0.38, -0.14, -0.08, -0.06, -0.36, -0.01);
        tri(ctx, s, "#15150e", 0.38, -0.14, 0.08, -0.06, 0.36, -0.01);
        r(ctx, s, "rgba(255, 170, 60, 0.55)", -0.3, -0.08, 0.06, 0.03);
        r(ctx, s, "rgba(255, 170, 60, 0.55)", 0.24, -0.08, 0.06, 0.03);
        // Решітка дихання
        for (var v = 0; v < 3; v++) {
            r(ctx, s, "#4a4636", -0.14, 0.18 + v * 0.07, 0.28, 0.025);
        }
        // Три червоні точки прицілу
        var cx = Math.sin(time * 0.002) * 0.14;
        var cy = -0.28 + Math.sin(time * 0.0031) * 0.03;
        var dots = [[0, -0.045], [-0.04, 0.025], [0.04, 0.025]];
        for (var k = 0; k < 3; k++) {
            disc(ctx, s, "rgba(255, 30, 30, 0.35)", cx + dots[k][0], cy + dots[k][1], 0.03);
            disc(ctx, s, "#ff2020", cx + dots[k][0], cy + dots[k][1], 0.014);
        }
        frame(ctx, s, "#9aff3a");
    },
};

export { SHOP_SKINS_2 };
