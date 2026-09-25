// ============================================================
// level_skins_extra.js — скіни нових рівнів Ліги 1
// (відкриваються проходженням рівня, як і решта скінів рівнів).
// Малюються в локальних координатах кубика (центр 0,0), time — мс.
// ============================================================

// Прямокутник у частках розміру кубика: x, y від -0.5 до 0.5
function r(ctx, s, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x * s, y * s, w * s, h * s);
}

function disc(ctx, s, color, x, y, rad) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * s, y * s, Math.max(0.5, rad * s), 0, Math.PI * 2);
    ctx.fill();
}

function tri(ctx, s, color, x1, y1, x2, y2, x3, y3) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 * s, y1 * s);
    ctx.lineTo(x2 * s, y2 * s);
    ctx.lineTo(x3 * s, y3 * s);
    ctx.closePath();
    ctx.fill();
}

function frame(ctx, s, color) {
    const w = Math.max(2, s * 0.07);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.strokeRect(-s / 2 + w / 2, -s / 2 + w / 2, s - w, s - w);
}

export const EXTRA_LEVEL_SKINS = {

    // Гарбуз-ліхтар: вирізане обличчя, всередині мерехтить свічка
    pumpkin_lantern: function (ctx, s, time) {
        r(ctx, s, "#ff8a1a", -0.5, -0.5, 1, 1);
        // Ребра гарбуза
        r(ctx, s, "#d86a0a", -0.26, -0.5, 0.06, 1);
        r(ctx, s, "#d86a0a", 0.2, -0.5, 0.06, 1);
        r(ctx, s, "#ffa64a", -0.46, -0.44, 0.1, 0.3);
        // Хвостик і листок
        r(ctx, s, "#4a7a22", -0.05, -0.64, 0.1, 0.16);
        r(ctx, s, "#6ab83a", 0.05, -0.62, 0.16, 0.07);
        // Світло свічки у вирізах
        const flick = 0.75 + 0.25 * Math.sin(time * 0.02) * Math.sin(time * 0.013);
        const glow = "rgba(255, " + Math.round(200 + 40 * flick) + ", 80, 1)";
        tri(ctx, s, glow, -0.34, -0.02, -0.12, -0.02, -0.23, -0.22);
        tri(ctx, s, glow, 0.12, -0.02, 0.34, -0.02, 0.23, -0.22);
        tri(ctx, s, glow, -0.06, 0.1, 0.06, 0.1, 0, 0.0);
        // Зубаста усмішка
        r(ctx, s, glow, -0.32, 0.18, 0.64, 0.14);
        r(ctx, s, "#ff8a1a", -0.18, 0.18, 0.08, 0.06);
        r(ctx, s, "#ff8a1a", 0.1, 0.18, 0.08, 0.06);
        r(ctx, s, "#ff8a1a", -0.04, 0.26, 0.08, 0.06);
        frame(ctx, s, "#ffd08a");
    },

    // Кубик-гриб із лісу кріперів: червоний капелюх у білих цятках, моргає
    mushroom_cube: function (ctx, s, time) {
        r(ctx, s, "#f0e6d0", -0.5, -0.5, 1, 1);
        // Капелюх займає верхню половину
        r(ctx, s, "#d8202a", -0.5, -0.5, 1, 0.5);
        r(ctx, s, "#ff4a4a", -0.5, -0.5, 1, 0.08);
        r(ctx, s, "#ffffff", -0.38, -0.4, 0.14, 0.12);
        r(ctx, s, "#ffffff", 0.08, -0.44, 0.18, 0.14);
        r(ctx, s, "#ffffff", -0.1, -0.22, 0.12, 0.1);
        r(ctx, s, "#ffffff", 0.3, -0.2, 0.1, 0.1);
        r(ctx, s, "#a8101a", -0.5, -0.04, 1, 0.06);
        // Обличчя на ніжці
        const blink = (time % 3400) > 3260;
        if (blink) {
            r(ctx, s, "#3a2a1a", -0.24, 0.14, 0.12, 0.03);
            r(ctx, s, "#3a2a1a", 0.12, 0.14, 0.12, 0.03);
        } else {
            r(ctx, s, "#3a2a1a", -0.22, 0.08, 0.08, 0.1);
            r(ctx, s, "#3a2a1a", 0.14, 0.08, 0.08, 0.1);
        }
        r(ctx, s, "#ff9aa8", -0.34, 0.24, 0.1, 0.05);
        r(ctx, s, "#ff9aa8", 0.24, 0.24, 0.1, 0.05);
        r(ctx, s, "#3a2a1a", -0.08, 0.28, 0.16, 0.04);
        // Спори, що злітають
        for (let i = 0; i < 3; i++) {
            const k = ((time * 0.0006) + i / 3) % 1;
            r(ctx, s, "rgba(255, 255, 200, " + (0.8 * (1 - k)).toFixed(2) + ")", -0.3 + i * 0.3, -0.52 - k * 0.3, 0.04, 0.04);
        }
        frame(ctx, s, "#ffb0b0");
    },

    // Рудокоп червоних шахт: каска з ліхтарем, у ліхтарі пульсує червона руда
    redstone_miner: function (ctx, s, time) {
        r(ctx, s, "#5a5a64", -0.5, -0.5, 1, 1);
        // Цятки руди на камені
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.005);
        const ore = "rgba(255, " + Math.round(40 + 40 * pulse) + ", 40, 1)";
        r(ctx, s, ore, -0.42, 0.28, 0.08, 0.08);
        r(ctx, s, ore, 0.3, 0.34, 0.08, 0.08);
        r(ctx, s, ore, 0.36, 0.12, 0.06, 0.06);
        // Обличчя
        r(ctx, s, "#e0b890", -0.36, -0.12, 0.72, 0.36);
        r(ctx, s, "#2a1a10", -0.22, -0.04, 0.1, 0.1);
        r(ctx, s, "#2a1a10", 0.12, -0.04, 0.1, 0.1);
        r(ctx, s, "#6a3a1a", -0.14, 0.12, 0.28, 0.04);
        // Жовта каска з ліхтарем
        r(ctx, s, "#ffcc33", -0.5, -0.5, 1, 0.34);
        r(ctx, s, "#d8a010", -0.5, -0.2, 1, 0.08);
        r(ctx, s, "#3a3a44", -0.1, -0.44, 0.2, 0.18);
        r(ctx, s, "rgba(255, 240, 180, " + (0.7 + 0.3 * pulse).toFixed(2) + ")", -0.07, -0.41, 0.14, 0.12);
        // Промінь ліхтаря
        ctx.fillStyle = "rgba(255, 240, 180, 0.18)";
        ctx.beginPath();
        ctx.moveTo(0.07 * s, -0.42 * s);
        ctx.lineTo(0.9 * s, -0.7 * s);
        ctx.lineTo(0.9 * s, -0.1 * s);
        ctx.closePath();
        ctx.fill();
        frame(ctx, s, "#ff6a5a");
    },

    // Космодесантник: шолом із візором, на плечі — детектор руху з біпом
    space_marine: function (ctx, s, time) {
        r(ctx, s, "#4a5a3a", -0.5, -0.5, 1, 1);
        r(ctx, s, "#3a4a2e", -0.5, 0.3, 1, 0.2);
        // Шолом і візор
        r(ctx, s, "#6a7a5a", -0.44, -0.5, 0.88, 0.28);
        r(ctx, s, "#1a2a3a", -0.36, -0.2, 0.72, 0.3);
        r(ctx, s, "rgba(120, 200, 255, 0.35)", -0.34, -0.18, 0.2, 0.08);
        r(ctx, s, "#ffcc33", -0.3, -0.06, 0.12, 0.06);
        r(ctx, s, "#ffcc33", 0.18, -0.06, 0.12, 0.06);
        // Номер на броні
        r(ctx, s, "#d8d8c0", -0.1, 0.16, 0.2, 0.08);
        // Екран детектора руху: зелене коло з біпом, що наближається
        r(ctx, s, "#1a1a1a", 0.14, 0.26, 0.3, 0.2);
        const k = (time % 1600) / 1600;
        ctx.strokeStyle = "rgba(90, 255, 120, " + (1 - k).toFixed(2) + ")";
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.arc(0.29 * s, 0.46 * s, (0.04 + k * 0.16) * s, Math.PI, Math.PI * 2);
        ctx.stroke();
        r(ctx, s, "#5aff78", 0.27, 0.36 - (time % 4800) / 4800 * 0.06, 0.04, 0.04);
        frame(ctx, s, "#a8c890");
    },

    // Мисливець у джунглях: маска з металу, «дреди», три червоні точки прицілу
    jungle_hunter: function (ctx, s, time) {
        r(ctx, s, "#5a4a2a", -0.5, -0.5, 1, 1);
        // «Дреди» по боках
        for (let i = 0; i < 4; i++) {
            const sway = Math.sin(time * 0.004 + i) * 0.02;
            r(ctx, s, "#2a2014", -0.5 + sway, -0.3 + i * 0.18, 0.1, 0.14);
            r(ctx, s, "#2a2014", 0.4 - sway, -0.3 + i * 0.18, 0.1, 0.14);
        }
        // Металева маска
        r(ctx, s, "#b8b8a8", -0.36, -0.42, 0.72, 0.7);
        r(ctx, s, "#8a8a7a", -0.36, -0.14, 0.72, 0.06);
        r(ctx, s, "#8a8a7a", -0.03, -0.42, 0.06, 0.7);
        // Щілини-очі, що світяться
        r(ctx, s, "#1a1a1a", -0.28, -0.3, 0.2, 0.1);
        r(ctx, s, "#1a1a1a", 0.08, -0.3, 0.2, 0.1);
        const glow = 0.6 + 0.4 * Math.sin(time * 0.006);
        r(ctx, s, "rgba(255, 200, 60, " + glow.toFixed(2) + ")", -0.24, -0.28, 0.12, 0.05);
        r(ctx, s, "rgba(255, 200, 60, " + glow.toFixed(2) + ")", 0.12, -0.28, 0.12, 0.05);
        r(ctx, s, "#6a6a5a", -0.2, 0.1, 0.4, 0.08);
        // Три червоні точки прицілу трикутником, повільно обертаються
        const a = time * 0.002;
        for (let i = 0; i < 3; i++) {
            const ang = a + i * Math.PI * 2 / 3;
            disc(ctx, s, "#ff2020", Math.cos(ang) * 0.1, 0.3 + Math.sin(ang) * 0.08, 0.035);
        }
        frame(ctx, s, "#c8b890");
    },

    // Болотяний дух: трухлявий пень із мохом, світні очі, світлячки довкола
    swamp_stump: function (ctx, s, time) {
        r(ctx, s, "#5a4028", -0.5, -0.5, 1, 1);
        // Кільця деревини зверху й мох
        r(ctx, s, "#8a6a40", -0.5, -0.5, 1, 0.14);
        r(ctx, s, "#6a5030", -0.3, -0.47, 0.6, 0.06);
        r(ctx, s, "#4a8a2a", -0.5, -0.38, 0.3, 0.1);
        r(ctx, s, "#5aa03a", 0.2, -0.38, 0.3, 0.14);
        r(ctx, s, "#4a8a2a", -0.5, 0.3, 1, 0.2);
        // Тріщини кори
        r(ctx, s, "#3a2818", -0.3, -0.2, 0.04, 0.4);
        r(ctx, s, "#3a2818", 0.28, -0.1, 0.04, 0.34);
        // Очі-вогники в дуплах
        const glow = 0.5 + 0.5 * Math.sin(time * 0.004);
        r(ctx, s, "#1a120a", -0.24, -0.14, 0.16, 0.16);
        r(ctx, s, "#1a120a", 0.08, -0.14, 0.16, 0.16);
        r(ctx, s, "rgba(150, 255, 120, " + (0.6 + 0.4 * glow).toFixed(2) + ")", -0.2, -0.1, 0.08, 0.08);
        r(ctx, s, "rgba(150, 255, 120, " + (0.6 + 0.4 * glow).toFixed(2) + ")", 0.12, -0.1, 0.08, 0.08);
        r(ctx, s, "#1a120a", -0.12, 0.1, 0.24, 0.1);
        // Світлячки кружляють
        for (let i = 0; i < 3; i++) {
            const ang = time * 0.0015 + i * 2.1;
            const fx = Math.cos(ang) * 0.62;
            const fy = Math.sin(ang * 1.3) * 0.4 - 0.1;
            r(ctx, s, "rgba(230, 255, 120, " + (0.5 + 0.5 * Math.sin(time * 0.01 + i)).toFixed(2) + ")", fx, fy, 0.05, 0.05);
        }
        frame(ctx, s, "#8ad86a");
    },

    // Страж підземелля: залізний шолом із забралом, на грудях сяє руна
    dungeon_guard: function (ctx, s, time) {
        const steel = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        steel.addColorStop(0, "#8a92a0");
        steel.addColorStop(1, "#4a505c");
        ctx.fillStyle = steel;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Заклепки
        for (const p of [[-0.42, -0.42], [0.36, -0.42], [-0.42, 0.36], [0.36, 0.36]]) {
            r(ctx, s, "#2a2e36", p[0], p[1], 0.06, 0.06);
        }
        // Забрало з прорізом, у якому світяться очі
        r(ctx, s, "#2a2e36", -0.36, -0.26, 0.72, 0.12);
        const eye = 0.6 + 0.4 * Math.sin(time * 0.005);
        r(ctx, s, "rgba(90, 200, 255, " + eye.toFixed(2) + ")", -0.26, -0.23, 0.12, 0.06);
        r(ctx, s, "rgba(90, 200, 255, " + eye.toFixed(2) + ")", 0.14, -0.23, 0.12, 0.06);
        for (let i = 0; i < 5; i++) {
            r(ctx, s, "#2a2e36", -0.3 + i * 0.13, -0.06, 0.05, 0.14);
        }
        // Руна на грудях
        const rune = 0.5 + 0.5 * Math.sin(time * 0.003);
        ctx.strokeStyle = "rgba(90, 200, 255, " + (0.5 + 0.5 * rune).toFixed(2) + ")";
        ctx.lineWidth = Math.max(1.5, s * 0.04);
        ctx.beginPath();
        ctx.moveTo(-0.1 * s, 0.14 * s);
        ctx.lineTo(0, 0.38 * s);
        ctx.lineTo(0.1 * s, 0.14 * s);
        ctx.moveTo(-0.12 * s, 0.26 * s);
        ctx.lineTo(0.12 * s, 0.26 * s);
        ctx.stroke();
        frame(ctx, s, "#c8d0e0");
    },

    // Інопланетне яйце з вулика: шкірясте, пульсує, «пелюстки» зверху трохи розкриваються
    alien_egg: function (ctx, s, time) {
        const k = 0.5 + 0.5 * Math.sin(time * 0.003);
        r(ctx, s, "#3a4a3a", -0.5, -0.5, 1, 1);
        // Внутрішнє світіння
        const g = ctx.createRadialGradient(0, -0.3 * s, 0, 0, -0.3 * s, 0.6 * s);
        g.addColorStop(0, "rgba(150, 255, 200, " + (0.3 + 0.4 * k).toFixed(2) + ")");
        g.addColorStop(1, "rgba(150, 255, 200, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // Жилки
        ctx.strokeStyle = "#5a6a4a";
        ctx.lineWidth = Math.max(1, s * 0.03);
        ctx.beginPath();
        ctx.moveTo(-0.4 * s, 0.4 * s);
        ctx.quadraticCurveTo(-0.3 * s, 0, -0.1 * s, -0.2 * s);
        ctx.moveTo(0.4 * s, 0.4 * s);
        ctx.quadraticCurveTo(0.3 * s, 0.05 * s, 0.12 * s, -0.2 * s);
        ctx.moveTo(0, 0.45 * s);
        ctx.lineTo(0, 0.1 * s);
        ctx.stroke();
        // Пелюстки, що розкриваються
        const open = 0.06 + 0.06 * k;
        tri(ctx, s, "#4a5a4a", -0.5, -0.5, 0, -0.5, -0.25 - open, -0.2);
        tri(ctx, s, "#4a5a4a", 0, -0.5, 0.5, -0.5, 0.25 + open, -0.2);
        tri(ctx, s, "#2a3a2a", -0.2, -0.5, 0.2, -0.5, 0, -0.3 + open);
        // Два очі-цятки, щоб яйце було «живим», а не страшним
        r(ctx, s, "#cfffe0", -0.2, 0.08, 0.1, 0.1);
        r(ctx, s, "#cfffe0", 0.1, 0.08, 0.1, 0.1);
        r(ctx, s, "#1a2a1a", -0.17, 0.11, 0.05, 0.06);
        r(ctx, s, "#1a2a1a", 0.13, 0.11, 0.05, 0.06);
        // Крапля слизу
        const drip = (time % 2200) / 2200;
        r(ctx, s, "rgba(150, 255, 200, 0.8)", 0.3, 0.3 + drip * 0.25, 0.05, 0.05 + drip * 0.05);
        frame(ctx, s, "#8affc0");
    }
};
