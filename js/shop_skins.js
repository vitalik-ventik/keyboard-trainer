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
    }
};
