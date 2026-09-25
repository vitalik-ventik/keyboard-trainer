// ============================================================
// shop_skins.js — скіни, які продаються в магазині за кристали
// Кожна функція малює кубик у локальних координатах (центр у 0,0),
// як і скіни рівнів у engine.js. time — мілісекунди.
// При time = 0 кожен скін має «спокійну» позу: цей кадр показується
// сірим і нерухомим, доки скін не куплено.
// ============================================================

// Прямокутник у частках розміру кубика: x, y від -0.5 до 0.5
function r(ctx, s, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x * s, y * s, w * s, h * s);
}

// Коло у частках розміру кубика
function disc(ctx, s, color, x, y, rad) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * s, y * s, Math.max(0.5, rad * s), 0, Math.PI * 2);
    ctx.fill();
}

// Трикутник у частках розміру кубика
function tri(ctx, s, color, x1, y1, x2, y2, x3, y3) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 * s, y1 * s);
    ctx.lineTo(x2 * s, y2 * s);
    ctx.lineTo(x3 * s, y3 * s);
    ctx.closePath();
    ctx.fill();
}

// Тонка рамка по краю кубика (як у скінів рівнів)
function frame(ctx, s, color) {
    var w = Math.max(2, s * 0.07);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.strokeRect(-s / 2 + w / 2, -s / 2 + w / 2, s - w, s - w);
}

// Моргання: повертає true лише на короткий час наприкінці кожного періоду,
// тож при time = 0 очі завжди відкриті
function blinking(time, period, offset) {
    return ((time + (offset || 0)) % period) > period - 140;
}

// Очі з відблиском: квадрат кольору color, зіниця зі зсувом dx
function eye(ctx, s, x, y, w, color, pupil, dx) {
    r(ctx, s, color, x, y, w, w);
    r(ctx, s, pupil, x + w * 0.3 + (dx || 0), y + w * 0.25, w * 0.45, w * 0.6);
    r(ctx, s, "#ffffff", x + w * 0.32 + (dx || 0), y + w * 0.28, w * 0.18, w * 0.18);
}

export const SHOP_SKIN_RENDERERS = {

    // ---------- Тварини ----------

    // Панда жує бамбук
    shop_panda: function (ctx, s, time) {
        r(ctx, s, "#f4f4ee", -0.5, -0.5, 1, 1);
        r(ctx, s, "#1c1c22", -0.5, -0.5, 0.22, 0.2);
        r(ctx, s, "#1c1c22", 0.28, -0.5, 0.22, 0.2);
        // Чорні плями навколо очей, трохи скошені донизу
        r(ctx, s, "#1c1c22", -0.36, -0.2, 0.24, 0.2);
        r(ctx, s, "#1c1c22", -0.4, -0.08, 0.14, 0.12);
        r(ctx, s, "#1c1c22", 0.12, -0.2, 0.24, 0.2);
        r(ctx, s, "#1c1c22", 0.26, -0.08, 0.14, 0.12);
        if (blinking(time, 3800)) {
            r(ctx, s, "#f4f4ee", -0.28, -0.1, 0.1, 0.02);
            r(ctx, s, "#f4f4ee", 0.18, -0.1, 0.1, 0.02);
        } else {
            r(ctx, s, "#f4f4ee", -0.28, -0.15, 0.1, 0.1);
            r(ctx, s, "#1c1c22", -0.24, -0.12, 0.05, 0.06);
            r(ctx, s, "#f4f4ee", 0.18, -0.15, 0.1, 0.1);
            r(ctx, s, "#1c1c22", 0.2, -0.12, 0.05, 0.06);
        }
        r(ctx, s, "#1c1c22", -0.06, 0.04, 0.12, 0.07);
        // Рот, що жує: щелепа ходить угору-вниз
        var chew = Math.sin(time * 0.012) > 0 ? 0.02 : 0;
        r(ctx, s, "#1c1c22", -0.12, 0.17 + chew, 0.2, 0.05);
        // Бамбукова паличка в роті
        r(ctx, s, "#5cbf3a", 0.02, 0.16 + chew, 0.48, 0.07);
        r(ctx, s, "#3a8a22", 0.2, 0.16 + chew, 0.03, 0.07);
        r(ctx, s, "#3a8a22", 0.38, 0.16 + chew, 0.03, 0.07);
        r(ctx, s, "#7ada4a", 0.3, 0.08 + chew, 0.08, 0.08);
        r(ctx, s, "#1c1c22", -0.5, 0.36, 1, 0.14);
        frame(ctx, s, "#d8d8d0");
    },

    // Песик з висячими вухами, що висолопив язика
    shop_dog: function (ctx, s, time) {
        r(ctx, s, "#c8884a", -0.5, -0.5, 1, 1);
        // Пляма на оці
        r(ctx, s, "#8a5426", 0.06, -0.3, 0.3, 0.28);
        var flop = Math.sin(time * 0.005) * 0.02;
        r(ctx, s, "#6a3c18", -0.5, -0.44 + flop, 0.16, 0.46);
        r(ctx, s, "#6a3c18", 0.34, -0.44 - flop, 0.16, 0.46);
        eye(ctx, s, -0.28, -0.22, 0.12, "#ffffff", "#1a1a1a");
        eye(ctx, s, 0.14, -0.22, 0.12, "#ffffff", "#1a1a1a");
        // Світла мордочка
        r(ctx, s, "#f0d0a0", -0.22, 0, 0.44, 0.32);
        r(ctx, s, "#1a1a1a", -0.08, 0.02, 0.16, 0.09);
        r(ctx, s, "#ffffff", -0.05, 0.03, 0.04, 0.03);
        r(ctx, s, "#3a2410", -0.01, 0.11, 0.02, 0.07);
        r(ctx, s, "#3a2410", -0.12, 0.17, 0.24, 0.03);
        // Язик: дихає, висолоплюючи язика то більше, то менше
        var tongue = 0.08 + Math.abs(Math.sin(time * 0.006)) * 0.06;
        r(ctx, s, "#ff6a8a", -0.06, 0.19, 0.12, tongue);
        r(ctx, s, "#d84a6a", -0.01, 0.19, 0.02, tongue * 0.7);
        // Червоний нашийник
        r(ctx, s, "#e8202a", -0.5, 0.42, 1, 0.08);
        r(ctx, s, "#ffcc33", -0.04, 0.42, 0.08, 0.08);
        frame(ctx, s, "#f0c890");
    },

    // Лисичка хитро мружиться й зиркає очима
    shop_fox: function (ctx, s, time) {
        r(ctx, s, "#ff7a1a", -0.5, -0.5, 1, 1);
        // Вушка з темними кінчиками
        tri(ctx, s, "#ff7a1a", -0.5, -0.3, -0.4, -0.66, -0.14, -0.5);
        tri(ctx, s, "#ff7a1a", 0.5, -0.3, 0.4, -0.66, 0.14, -0.5);
        tri(ctx, s, "#2a1a10", -0.44, -0.55, -0.4, -0.66, -0.33, -0.58);
        tri(ctx, s, "#2a1a10", 0.44, -0.55, 0.4, -0.66, 0.33, -0.58);
        tri(ctx, s, "#ffd8b0", -0.42, -0.42, -0.38, -0.56, -0.22, -0.48);
        tri(ctx, s, "#ffd8b0", 0.42, -0.42, 0.38, -0.56, 0.22, -0.48);
        // Білі щічки
        tri(ctx, s, "#fff4e8", -0.5, 0.02, 0, 0.5, -0.5, 0.5);
        tri(ctx, s, "#fff4e8", 0.5, 0.02, 0, 0.5, 0.5, 0.5);
        r(ctx, s, "#fff4e8", -0.2, 0.26, 0.4, 0.24);
        // Хитрі примружені очі, зіниці бігають
        var glance = Math.sin(time * 0.0018) * 0.04;
        r(ctx, s, "#2a1a10", -0.34, -0.14, 0.24, 0.1);
        r(ctx, s, "#2a1a10", 0.1, -0.14, 0.24, 0.1);
        r(ctx, s, "#ffd23a", -0.3, -0.12, 0.16, 0.06);
        r(ctx, s, "#ffd23a", 0.14, -0.12, 0.16, 0.06);
        r(ctx, s, "#1a1a1a", -0.24 + glance, -0.12, 0.04, 0.06);
        r(ctx, s, "#1a1a1a", 0.2 + glance, -0.12, 0.04, 0.06);
        // Брови «я щось задумав»
        r(ctx, s, "#b8500a", -0.36, -0.2, 0.2, 0.03);
        r(ctx, s, "#b8500a", 0.16, -0.2, 0.2, 0.03);
        r(ctx, s, "#1a1a1a", -0.06, 0.18, 0.12, 0.08);
        r(ctx, s, "#2a1a10", 0, 0.26, 0.12, 0.03);
        r(ctx, s, "#2a1a10", 0.1, 0.23, 0.03, 0.03);
        frame(ctx, s, "#ffb070");
    },

    // Пінгвін, що плескає крильцями
    shop_penguin: function (ctx, s, time) {
        var flap = Math.sin(time * 0.012) * 0.06;
        // Крильця за корпусом
        ctx.save();
        ctx.translate(-0.46 * s, 0);
        ctx.rotate(0.3 + flap * 3);
        r(ctx, s, "#1c2230", -0.06, -0.05, 0.12, 0.36);
        ctx.restore();
        ctx.save();
        ctx.translate(0.46 * s, 0);
        ctx.rotate(-0.3 - flap * 3);
        r(ctx, s, "#1c2230", -0.06, -0.05, 0.12, 0.36);
        ctx.restore();
        r(ctx, s, "#1c2230", -0.5, -0.5, 1, 1);
        // Біле черевце й личко
        r(ctx, s, "#f4f6fa", -0.32, -0.26, 0.64, 0.76);
        r(ctx, s, "#f4f6fa", -0.4, -0.06, 0.8, 0.56);
        r(ctx, s, "#1c2230", -0.04, -0.26, 0.08, 0.1);
        if (blinking(time, 3300)) {
            r(ctx, s, "#1c2230", -0.26, -0.1, 0.12, 0.03);
            r(ctx, s, "#1c2230", 0.14, -0.1, 0.12, 0.03);
        } else {
            r(ctx, s, "#1c2230", -0.24, -0.16, 0.1, 0.12);
            r(ctx, s, "#1c2230", 0.14, -0.16, 0.1, 0.12);
            r(ctx, s, "#ffffff", -0.22, -0.14, 0.04, 0.04);
            r(ctx, s, "#ffffff", 0.16, -0.14, 0.04, 0.04);
        }
        // Рожеві щічки
        r(ctx, s, "#ffb0c0", -0.34, 0, 0.1, 0.05);
        r(ctx, s, "#ffb0c0", 0.24, 0, 0.1, 0.05);
        // Помаранчевий дзьоб і лапки
        r(ctx, s, "#ff9a1a", -0.09, -0.02, 0.18, 0.06);
        r(ctx, s, "#e87a0a", -0.06, 0.04, 0.12, 0.04);
        r(ctx, s, "#ff9a1a", -0.3, 0.44, 0.2, 0.06);
        r(ctx, s, "#ff9a1a", 0.1, 0.44, 0.2, 0.06);
        frame(ctx, s, "#8aa0c8");
    },

    // Сова крутить головою й повільно кліпає
    shop_owl: function (ctx, s, time) {
        r(ctx, s, "#8a5a2a", -0.5, -0.5, 1, 1);
        // Пір'яні вушка
        tri(ctx, s, "#6a4018", -0.5, -0.5, -0.44, -0.68, -0.26, -0.5);
        tri(ctx, s, "#6a4018", 0.5, -0.5, 0.44, -0.68, 0.26, -0.5);
        // Пір'їнки-галочки на грудях
        ctx.strokeStyle = "#c89a5a";
        ctx.lineWidth = Math.max(1, s * 0.03);
        for (var row = 0; row < 2; row++) {
            for (var col = 0; col < 3; col++) {
                var fx = (-0.2 + col * 0.2) * s;
                var fy = (0.24 + row * 0.12) * s;
                ctx.beginPath();
                ctx.moveTo(fx - s * 0.05, fy);
                ctx.lineTo(fx, fy + s * 0.04);
                ctx.lineTo(fx + s * 0.05, fy);
                ctx.stroke();
            }
        }
        // Великі очі-диски; сова повертає погляд то вліво, то вправо
        var turn = Math.sin(time * 0.0012) * 0.04;
        disc(ctx, s, "#f0d8a8", -0.2, -0.12, 0.19);
        disc(ctx, s, "#f0d8a8", 0.2, -0.12, 0.19);
        disc(ctx, s, "#ffb81a", -0.2, -0.12, 0.13);
        disc(ctx, s, "#ffb81a", 0.2, -0.12, 0.13);
        if (blinking(time, 4200)) {
            r(ctx, s, "#6a4018", -0.34, -0.16, 0.28, 0.08);
            r(ctx, s, "#6a4018", 0.06, -0.16, 0.28, 0.08);
        } else {
            disc(ctx, s, "#1a1a1a", -0.2 + turn, -0.12, 0.07);
            disc(ctx, s, "#1a1a1a", 0.2 + turn, -0.12, 0.07);
            disc(ctx, s, "#ffffff", -0.22 + turn, -0.15, 0.025);
            disc(ctx, s, "#ffffff", 0.18 + turn, -0.15, 0.025);
        }
        tri(ctx, s, "#ffa21a", -0.06, 0.02, 0.06, 0.02, 0, 0.14);
        frame(ctx, s, "#c89a5a");
    },

    // Жабка надуває щоки й ловить язиком муху
    shop_frog: function (ctx, s, time) {
        var cycle = time % 3200;
        // Муха кружляє праворуч від кубика
        var flyX = 0.72 + Math.cos(time * 0.004) * 0.08;
        var flyY = -0.05 + Math.sin(time * 0.007) * 0.1;
        var caught = cycle > 2500 && cycle < 2800;
        r(ctx, s, "#4cc24a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#8ae060", -0.36, 0.1, 0.72, 0.4);
        // Очі-горбики зверху
        disc(ctx, s, "#4cc24a", -0.28, -0.46, 0.16);
        disc(ctx, s, "#4cc24a", 0.28, -0.46, 0.16);
        disc(ctx, s, "#ffffff", -0.28, -0.46, 0.11);
        disc(ctx, s, "#ffffff", 0.28, -0.46, 0.11);
        disc(ctx, s, "#1a1a1a", -0.26, -0.45, 0.055);
        disc(ctx, s, "#1a1a1a", 0.3, -0.45, 0.055);
        // Щоки надуваються
        var puff = Math.max(0, Math.sin(time * 0.004)) * 0.06;
        disc(ctx, s, "#ff9aa8", -0.34, 0.06, 0.06 + puff * 0.5);
        disc(ctx, s, "#ff9aa8", 0.34, 0.06, 0.06 + puff * 0.5);
        // Широкий усміхнений рот
        r(ctx, s, "#1e6a1e", -0.3, 0.02, 0.6, 0.04);
        r(ctx, s, "#1e6a1e", -0.34, -0.02, 0.05, 0.05);
        r(ctx, s, "#1e6a1e", 0.29, -0.02, 0.05, 0.05);
        r(ctx, s, "#1e6a1e", -0.2, -0.14, 0.04, 0.04);
        r(ctx, s, "#1e6a1e", 0.16, -0.14, 0.04, 0.04);
        if (caught) {
            // Язик вистрілює до мухи
            var k = Math.sin((cycle - 2500) / 300 * Math.PI);
            var tx = 0.1 + (flyX - 0.1) * k;
            var ty = 0.04 + (flyY - 0.04) * k;
            ctx.strokeStyle = "#ff5a7a";
            ctx.lineWidth = Math.max(1.5, s * 0.05);
            ctx.beginPath();
            ctx.moveTo(0.05 * s, 0.04 * s);
            ctx.lineTo(tx * s, ty * s);
            ctx.stroke();
            disc(ctx, s, "#ff5a7a", tx, ty, 0.04);
        } else if (cycle < 2500) {
            disc(ctx, s, "#2a2a2a", flyX, flyY, 0.035);
            var wing = Math.sin(time * 0.08) > 0 ? 0.03 : 0.015;
            r(ctx, s, "rgba(220, 240, 255, 0.85)", flyX - 0.04, flyY - 0.02 - wing, 0.04, 0.03);
            r(ctx, s, "rgba(220, 240, 255, 0.85)", flyX, flyY - 0.02 - wing, 0.04, 0.03);
        }
        frame(ctx, s, "#9aff7a");
    },

    // Акула з плавником, зубастою усмішкою й бульбашками
    shop_shark: function (ctx, s, time) {
        // Спинний плавець над кубиком
        var fin = Math.sin(time * 0.004) * 0.02;
        tri(ctx, s, "#4a6a8a", -0.1 + fin, -0.5, 0.26, -0.5, 0.08 + fin, -0.76);
        r(ctx, s, "#5a7a9a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#f0f4f8", -0.5, 0.08, 1, 0.42);
        // Зябра
        r(ctx, s, "#3a5a7a", -0.44, -0.12, 0.03, 0.14);
        r(ctx, s, "#3a5a7a", -0.38, -0.12, 0.03, 0.14);
        r(ctx, s, "#3a5a7a", -0.32, -0.12, 0.03, 0.14);
        eye(ctx, s, 0.12, -0.3, 0.14, "#ffffff", "#101820");
        r(ctx, s, "#3a5a7a", 0.1, -0.34, 0.18, 0.03);
        // Зубаста усмішка
        r(ctx, s, "#5a1a24", -0.3, 0.08, 0.66, 0.2);
        for (var i = 0; i < 6; i++) {
            var tx = -0.3 + i * 0.11;
            tri(ctx, s, "#ffffff", tx, 0.08, tx + 0.11, 0.08, tx + 0.055, 0.16);
            tri(ctx, s, "#ffffff", tx, 0.28, tx + 0.11, 0.28, tx + 0.055, 0.2);
        }
        // Бульбашки підіймаються збоку
        for (var b = 0; b < 3; b++) {
            var ph = ((time * 0.0006) + b / 3) % 1;
            var bx = 0.42 + Math.sin(ph * 12 + b) * 0.04;
            var by = 0.3 - ph * 0.9;
            ctx.strokeStyle = "rgba(200, 240, 255, " + (0.9 - ph * 0.7).toFixed(2) + ")";
            ctx.lineWidth = Math.max(1, s * 0.02);
            ctx.beginPath();
            ctx.arc(bx * s, by * s, (0.03 + b * 0.01) * s, 0, Math.PI * 2);
            ctx.stroke();
        }
        frame(ctx, s, "#9ac0e0");
    },

    // ---------- Персонажі блочного світу ----------

    // Житель: великий ніс, зрощені брови, іноді хитає головою «хмм»
    shop_villager: function (ctx, s, time) {
        var ph = time % 4000;
        var shake = ph > 3300 ? Math.sin((ph - 3300) * 0.03) * 0.03 : 0;
        r(ctx, s, "#3a7a2a", -0.5, -0.5, 1, 1);
        ctx.save();
        ctx.translate(shake * s, 0);
        r(ctx, s, "#c8906a", -0.44, -0.5, 0.88, 0.8);
        r(ctx, s, "#6a4a2a", -0.44, -0.5, 0.88, 0.1);
        // Зрощені брови
        r(ctx, s, "#4a2a1a", -0.34, -0.22, 0.68, 0.06);
        r(ctx, s, "#ffffff", -0.3, -0.14, 0.12, 0.08);
        r(ctx, s, "#ffffff", 0.18, -0.14, 0.12, 0.08);
        r(ctx, s, "#2a8a3a", -0.24, -0.14, 0.06, 0.08);
        r(ctx, s, "#2a8a3a", 0.18, -0.14, 0.06, 0.08);
        // Великий ніс
        r(ctx, s, "#a8705a", -0.08, -0.08, 0.16, 0.32);
        r(ctx, s, "#8a5a44", 0.04, -0.08, 0.04, 0.32);
        r(ctx, s, "#4a2a1a", -0.16, 0.26, 0.32, 0.04);
        ctx.restore();
        // Мантія та руки навхрест
        r(ctx, s, "#2e6a22", -0.5, 0.3, 1, 0.2);
        r(ctx, s, "#a8705a", -0.3, 0.34, 0.6, 0.1);
        // Смарагд виблискує в руці
        var shine = 0.6 + 0.4 * Math.sin(time * 0.005);
        r(ctx, s, "#1ad86a", 0.2, 0.32, 0.1, 0.12);
        r(ctx, s, "rgba(220, 255, 230, " + shine.toFixed(2) + ")", 0.22, 0.34, 0.03, 0.03);
        frame(ctx, s, "#7ac86a");
    },

    // Зомбі: зелений, похитується з боку в бік
    shop_zombie: function (ctx, s, time) {
        ctx.save();
        ctx.rotate(Math.sin(time * 0.003) * 0.06);
        r(ctx, s, "#5aa04a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#3a7a2e", -0.5, -0.5, 1, 0.14);
        r(ctx, s, "#4a8a3a", -0.38, -0.32, 0.12, 0.08);
        r(ctx, s, "#4a8a3a", 0.24, 0.02, 0.14, 0.08);
        // Порожні темні очі
        r(ctx, s, "#1a2a14", -0.32, -0.18, 0.18, 0.12);
        r(ctx, s, "#1a2a14", 0.14, -0.18, 0.18, 0.12);
        r(ctx, s, "#6a1a1a", -0.26, -0.14, 0.06, 0.05);
        r(ctx, s, "#6a1a1a", 0.2, -0.14, 0.06, 0.05);
        r(ctx, s, "#2e5a22", -0.06, -0.02, 0.12, 0.1);
        // Кривий рот
        r(ctx, s, "#1a2a14", -0.2, 0.14, 0.4, 0.06);
        r(ctx, s, "#1a2a14", -0.2, 0.1, 0.06, 0.06);
        // Порвана синя сорочка
        r(ctx, s, "#2a8aa0", -0.5, 0.3, 1, 0.2);
        r(ctx, s, "#5aa04a", -0.14, 0.3, 0.08, 0.06);
        r(ctx, s, "#5aa04a", 0.22, 0.3, 0.06, 0.08);
        frame(ctx, s, "#8ad07a");
        ctx.restore();
    },

    // Кріпер: плямистий зелений, час від часу блимає білим
    shop_creeper: function (ctx, s, time) {
        var shades = ["#4caf3a", "#5cc84a", "#3a9a2e", "#6ad458"];
        var n = 8;
        var p = 1 / n;
        for (var yy = 0; yy < n; yy++) {
            for (var xx = 0; xx < n; xx++) {
                var k = (xx * 7 + yy * 13 + xx * yy * 3) % 4;
                r(ctx, s, shades[k], -0.5 + xx * p, -0.5 + yy * p, p + 0.01, p + 0.01);
            }
        }
        // Обличчя з квадратних пікселів
        var face = "#101a10";
        r(ctx, s, face, -0.375, -0.25, 0.25, 0.25);
        r(ctx, s, face, 0.125, -0.25, 0.25, 0.25);
        r(ctx, s, face, -0.125, 0, 0.25, 0.25);
        r(ctx, s, face, -0.25, 0.125, 0.125, 0.25);
        r(ctx, s, face, 0.125, 0.125, 0.125, 0.25);
        // Спалах, наче от-от вибухне
        var ph = time % 3000;
        if (ph > 2500) {
            var a = 0.5 + 0.5 * Math.sin((ph - 2500) * 0.05);
            r(ctx, s, "rgba(255, 255, 255, " + (a * 0.6).toFixed(2) + ")", -0.5, -0.5, 1, 1);
        }
        frame(ctx, s, "#8ae07a");
    },

    // Скелет: клацає щелепою, у куточку — стріла
    shop_skeleton: function (ctx, s, time) {
        r(ctx, s, "#d8d8d0", -0.5, -0.5, 1, 1);
        r(ctx, s, "#b8b8b0", -0.5, 0.3, 1, 0.2);
        // Глибокі очниці з вогниками
        r(ctx, s, "#1a1a1e", -0.34, -0.2, 0.24, 0.2);
        r(ctx, s, "#1a1a1e", 0.1, -0.2, 0.24, 0.2);
        var glow = 0.5 + 0.5 * Math.sin(time * 0.004);
        r(ctx, s, "rgba(120, 220, 255, " + (0.4 + 0.6 * glow).toFixed(2) + ")", -0.26, -0.14, 0.08, 0.08);
        r(ctx, s, "rgba(120, 220, 255, " + (0.4 + 0.6 * glow).toFixed(2) + ")", 0.18, -0.14, 0.08, 0.08);
        tri(ctx, s, "#1a1a1e", -0.06, 0.12, 0.06, 0.12, 0, 0.02);
        // Щелепа клацає
        var jaw = Math.sin(time * 0.008) > 0.6 ? 0.04 : 0;
        r(ctx, s, "#1a1a1e", -0.28, 0.18, 0.56, 0.04 + jaw);
        for (var i = 0; i < 6; i++) {
            r(ctx, s, "#f4f4ee", -0.26 + i * 0.09, 0.14, 0.06, 0.06);
            r(ctx, s, "#f4f4ee", -0.26 + i * 0.09, 0.22 + jaw, 0.06, 0.05);
        }
        // Тріщина на черепі
        r(ctx, s, "#9a9a92", 0.2, -0.44, 0.03, 0.1);
        r(ctx, s, "#9a9a92", 0.23, -0.36, 0.03, 0.08);
        // Стріла по діагоналі в нижньому куті
        ctx.save();
        ctx.translate(0.3 * s, 0.38 * s);
        ctx.rotate(-0.6);
        r(ctx, s, "#8a6a3a", -0.2, -0.015, 0.36, 0.03);
        tri(ctx, s, "#9aa0aa", 0.16, -0.05, 0.16, 0.05, 0.24, 0);
        r(ctx, s, "#ffffff", -0.24, -0.05, 0.06, 0.03);
        r(ctx, s, "#ffffff", -0.24, 0.02, 0.06, 0.03);
        ctx.restore();
        frame(ctx, s, "#f4f4ee");
    },

    // Залізний голем — охоронець селища: очі світяться, мак погойдується
    shop_iron_golem: function (ctx, s, time) {
        r(ctx, s, "#8a8a82", -0.5, -0.5, 1, 1);
        r(ctx, s, "#a8a8a0", -0.5, -0.5, 1, 0.12);
        r(ctx, s, "#6e6e68", -0.5, 0.4, 1, 0.1);
        var rivets = [[-0.4, -0.3], [0.36, -0.3], [-0.4, 0.34], [0.36, 0.34]];
        for (var i = 0; i < rivets.length; i++) {
            r(ctx, s, "#5a5a54", rivets[i][0], rivets[i][1], 0.05, 0.05);
        }
        r(ctx, s, "#4a4a44", -0.34, -0.2, 0.28, 0.07);
        r(ctx, s, "#4a4a44", 0.06, -0.2, 0.28, 0.07);
        var glow = 0.5 + 0.5 * Math.sin(time * 0.004);
        r(ctx, s, "rgba(255, 80, 40, " + (0.25 + 0.2 * glow).toFixed(3) + ")", -0.32, -0.16, 0.22, 0.18);
        r(ctx, s, "rgba(255, 80, 40, " + (0.25 + 0.2 * glow).toFixed(3) + ")", 0.1, -0.16, 0.22, 0.18);
        r(ctx, s, "#ff2a1a", -0.28, -0.12, 0.14, 0.1);
        r(ctx, s, "#ff2a1a", 0.14, -0.12, 0.14, 0.1);
        r(ctx, s, "rgba(255, 230, 120, " + (0.5 + 0.5 * glow).toFixed(3) + ")", -0.24, -0.1, 0.05, 0.05);
        r(ctx, s, "rgba(255, 230, 120, " + (0.5 + 0.5 * glow).toFixed(3) + ")", 0.18, -0.1, 0.05, 0.05);
        // Великий ніс і рот
        r(ctx, s, "#74746c", -0.07, -0.1, 0.14, 0.3);
        r(ctx, s, "#62625c", 0.03, -0.1, 0.04, 0.3);
        r(ctx, s, "#4a4a44", -0.16, 0.26, 0.32, 0.05);
        // Ліани
        r(ctx, s, "#3a8a2a", -0.5, -0.4, 0.08, 0.34);
        r(ctx, s, "#3a8a2a", -0.44, -0.16, 0.06, 0.06);
        r(ctx, s, "#3a8a2a", 0.4, -0.5, 0.1, 0.18);
        r(ctx, s, "#4aa83a", -0.48, -0.28, 0.08, 0.05);
        // Мак, що погойдується
        var sway = Math.sin(time * 0.003) * 0.03;
        r(ctx, s, "#2f7a22", 0.3 + sway * 0.5, 0.12, 0.04, 0.26);
        r(ctx, s, "#e8202a", 0.24 + sway, 0.02, 0.16, 0.12);
        r(ctx, s, "#e8202a", 0.28 + sway, -0.02, 0.08, 0.2);
        r(ctx, s, "#1a1a1a", 0.3 + sway, 0.06, 0.04, 0.04);
        frame(ctx, s, "#c8c8c0");
    },

    // Ендермен: чорний, фіолетові очі, часом «телепортується»
    shop_enderman: function (ctx, s, time) {
        var ph = time % 5000;
        var tp = ph > 4500;
        var jx = tp ? Math.sin(ph * 0.9) * 0.06 : 0;
        var jy = tp ? Math.cos(ph * 1.3) * 0.04 : 0;
        ctx.save();
        ctx.translate(jx * s, jy * s);
        if (tp) {
            ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(ph * 0.05));
        }
        r(ctx, s, "#141418", -0.5, -0.5, 1, 1);
        r(ctx, s, "#1e1a26", -0.5, -0.5, 1, 0.1);
        // Довгі фіолетові очі
        r(ctx, s, "#d88aff", -0.42, -0.06, 0.32, 0.1);
        r(ctx, s, "#d88aff", 0.1, -0.06, 0.32, 0.1);
        r(ctx, s, "#ff66ff", -0.26, -0.06, 0.12, 0.1);
        r(ctx, s, "#ff66ff", 0.14, -0.06, 0.12, 0.1);
        r(ctx, s, "#2a2230", -0.3, 0.22, 0.6, 0.04);
        ctx.globalAlpha = 1;
        ctx.restore();
        // Фіолетові частинки, що злітають угору
        var count = tp ? 8 : 4;
        for (var i = 0; i < count; i++) {
            var t = ((time * 0.0005) + i / count) % 1;
            var px = -0.45 + ((i * 37) % 10) / 10 + Math.sin(t * 8 + i) * 0.03;
            var py = 0.5 - t * 1.2;
            r(ctx, s, "rgba(200, 90, 255, " + (0.9 * (1 - t)).toFixed(2) + ")", px, py, 0.05, 0.05);
        }
        frame(ctx, s, "#9a5acc");
    },

    // ---------- Герої та професії ----------

    // Ніндзя: маска, пов'язка з хвостиками, руків'я катани за спиною
    shop_ninja: function (ctx, s, time) {
        // Руків'я катани з-за спини
        ctx.save();
        ctx.translate(0.36 * s, -0.36 * s);
        ctx.rotate(0.7);
        r(ctx, s, "#5a3a1a", -0.04, -0.3, 0.08, 0.26);
        r(ctx, s, "#c8a040", -0.08, -0.06, 0.16, 0.04);
        ctx.restore();
        r(ctx, s, "#1a1a24", -0.5, -0.5, 1, 1);
        // Смуга відкритого обличчя з очима
        r(ctx, s, "#f0c8a0", -0.5, -0.18, 1, 0.22);
        r(ctx, s, "#1a1a1a", -0.3, -0.12, 0.14, 0.1);
        r(ctx, s, "#1a1a1a", 0.16, -0.12, 0.14, 0.1);
        r(ctx, s, "#ffffff", -0.26, -0.1, 0.04, 0.04);
        r(ctx, s, "#ffffff", 0.2, -0.1, 0.04, 0.04);
        // Рішучі брови
        tri(ctx, s, "#1a1a24", -0.36, -0.18, -0.12, -0.18, -0.12, -0.13);
        tri(ctx, s, "#1a1a24", 0.36, -0.18, 0.12, -0.18, 0.12, -0.13);
        // Червона пов'язка й хвостики, що майорять
        r(ctx, s, "#e8202a", -0.5, -0.32, 1, 0.08);
        var flutter = Math.sin(time * 0.012) * 0.05;
        tri(ctx, s, "#e8202a", -0.5, -0.32, -0.5, -0.24, -0.72, -0.3 + flutter);
        tri(ctx, s, "#c8101a", -0.5, -0.28, -0.5, -0.22, -0.66, -0.18 - flutter);
        // Складки маски
        r(ctx, s, "#2a2a36", -0.3, 0.2, 0.6, 0.03);
        r(ctx, s, "#2a2a36", -0.2, 0.3, 0.4, 0.03);
        frame(ctx, s, "#5a5a7a");
    },

    // Пожежник: червона каска, вуса, шланг бризкає водою
    shop_firefighter: function (ctx, s, time) {
        r(ctx, s, "#2a2a30", -0.5, -0.5, 1, 1);
        r(ctx, s, "#f0c8a0", -0.4, -0.2, 0.8, 0.52);
        // Каска з жовтою емблемою
        r(ctx, s, "#e8202a", -0.5, -0.5, 1, 0.3);
        r(ctx, s, "#b8101a", -0.5, -0.24, 1, 0.06);
        r(ctx, s, "#ffcc33", -0.08, -0.46, 0.16, 0.16);
        r(ctx, s, "#e8202a", -0.03, -0.42, 0.06, 0.08);
        eye(ctx, s, -0.26, -0.12, 0.1, "#ffffff", "#2a4a8a");
        eye(ctx, s, 0.16, -0.12, 0.1, "#ffffff", "#2a4a8a");
        // Пишні вуса
        r(ctx, s, "#6a3a1a", -0.22, 0.08, 0.44, 0.07);
        r(ctx, s, "#6a3a1a", -0.26, 0.12, 0.08, 0.05);
        r(ctx, s, "#6a3a1a", 0.18, 0.12, 0.08, 0.05);
        r(ctx, s, "#c87a5a", -0.1, 0.18, 0.2, 0.04);
        // Куртка зі світловідбивною смугою
        r(ctx, s, "#d8a020", -0.5, 0.32, 1, 0.18);
        r(ctx, s, "#f4f4a0", -0.5, 0.38, 1, 0.05);
        // Струмінь води зі шланга
        r(ctx, s, "#5a5a60", 0.34, 0.24, 0.16, 0.08);
        for (var i = 0; i < 6; i++) {
            var t = ((time * 0.0018) + i / 6) % 1;
            var dx = 0.52 + t * 0.4;
            var dy = 0.26 - t * 0.3 + t * t * 0.5;
            r(ctx, s, "rgba(120, 200, 255, " + (1 - t).toFixed(2) + ")", dx, dy, 0.05, 0.05);
        }
        frame(ctx, s, "#ff6a5a");
    },

    // Лицар: шолом із пером, забрало час від часу піднімається
    shop_knight: function (ctx, s, time) {
        // Червоне перо, що майорить
        var wave = Math.sin(time * 0.006) * 0.04;
        tri(ctx, s, "#e8202a", -0.06, -0.5, 0.1, -0.5, -0.2 + wave, -0.78);
        tri(ctx, s, "#ff5a5a", 0, -0.5, 0.1, -0.5, -0.08 + wave, -0.72);
        var steel = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        steel.addColorStop(0, "#e0e6f0");
        steel.addColorStop(0.5, "#9aa4b8");
        steel.addColorStop(1, "#6a7488");
        ctx.fillStyle = steel;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        r(ctx, s, "#5a6478", -0.04, -0.5, 0.08, 0.3);
        var ph = time % 5000;
        var open = ph > 3800 ? Math.min(1, (ph - 3800) / 250) * Math.min(1, (5000 - ph) / 250) : 0;
        // Обличчя під забралом
        r(ctx, s, "#1a1e28", -0.4, -0.2, 0.8, 0.34);
        if (open > 0) {
            r(ctx, s, "#f0c8a0", -0.36, -0.18, 0.72, 0.3);
            r(ctx, s, "#1a1a1a", -0.22, -0.1, 0.08, 0.08);
            r(ctx, s, "#1a1a1a", 0.14, -0.1, 0.08, 0.08);
            r(ctx, s, "#a86a4a", -0.1, 0.04, 0.2, 0.04);
        }
        // Забрало з прорізом (зсувається вгору)
        var vy = -0.2 - open * 0.26;
        ctx.fillStyle = steel;
        ctx.fillRect(-0.42 * s, vy * s, 0.84 * s, 0.34 * s);
        r(ctx, s, "#1a1e28", -0.34, vy + 0.1, 0.68, 0.06);
        r(ctx, s, "#1a1e28", -0.04, vy + 0.16, 0.08, 0.14);
        r(ctx, s, "#4a5468", -0.42, vy + 0.3, 0.84, 0.04);
        // Дихальні отвори внизу
        for (var i = 0; i < 4; i++) {
            r(ctx, s, "#3a4458", -0.24 + i * 0.14, 0.24, 0.06, 0.1);
        }
        frame(ctx, s, "#e0e6f0");
    },

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
