// ============================================================
// skin_renderers_2.js — скіни рівнів, частина 2: від сонця синтвейву до володаря демонів
// ============================================================

import { drawPixelArt, drawSkinFrame, renderSkinGlow } from "./skins.js";

const LEVEL_SKINS_2 = {

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

export { LEVEL_SKINS_2 };
