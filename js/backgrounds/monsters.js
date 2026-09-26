// backgrounds/monsters.js — монстри в стилі «Чужого» й «Хижака» та extendStory для їхніх світів

import { STORY_BY_THEME } from "./story.js";

// ============================================================
// Монстри в стилі «Чужого» й «Хижака»: упізнавані силуети без жорстокості
// ============================================================

// Ксеноморф збоку: видовжена блискуча голова, трубки на спині, хвіст-лезо.
// (x, y) — точка під задніми лапами на підлозі; dir: 1 — дивиться праворуч
function drawXeno(ctx, x, y, B, time, s, dir, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.translate(x, y);
    ctx.scale(dir * s, s);
    const walk = Math.sin(time * 6);
    const body = "#0c1214";
    const shine = "#3a5058";
    // Хвіст, що хвилюється
    ctx.strokeStyle = body;
    ctx.lineWidth = B * 0.5;
    ctx.beginPath();
    ctx.moveTo(-B * 0.5, -B * 3.2);
    ctx.quadraticCurveTo(-B * 5, -B * 1 + Math.sin(time * 2.5) * B, -B * 8, -B * 3.5 + Math.sin(time * 2.5 + 1) * B * 1.5);
    ctx.stroke();
    const tx = -B * 8;
    const ty = -B * 3.5 + Math.sin(time * 2.5 + 1) * B * 1.5;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(tx, ty - B * 0.5);
    ctx.lineTo(tx - B * 1.3, ty);
    ctx.lineTo(tx, ty + B * 0.5);
    ctx.closePath();
    ctx.fill();
    // Лапи (задні й передні), що крокують
    ctx.lineWidth = B * 0.35;
    ctx.beginPath();
    ctx.moveTo(0, -B * 3);
    ctx.lineTo(B * 0.6 + walk * B * 0.6, -B * 1.4);
    ctx.lineTo(walk * B * 0.8, 0);
    ctx.moveTo(B * 0.6, -B * 3);
    ctx.lineTo(B * 1.4 - walk * B * 0.6, -B * 1.4);
    ctx.lineTo(B * 0.8 - walk * B * 0.8, 0);
    ctx.moveTo(B * 3.4, -B * 3.6);
    ctx.lineTo(B * 4.2 - walk * B * 0.5, -B * 1.8);
    ctx.lineTo(B * 4.4 - walk * B * 0.8, 0);
    ctx.moveTo(B * 3.8, -B * 3.6);
    ctx.lineTo(B * 4.8 + walk * B * 0.5, -B * 1.8);
    ctx.lineTo(B * 5 + walk * B * 0.8, 0);
    ctx.stroke();
    // Тулуб
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-B * 0.8, -B * 3.6);
    ctx.quadraticCurveTo(B * 2, -B * 5, B * 4.6, -B * 4.6);
    ctx.lineTo(B * 4.6, -B * 3.2);
    ctx.quadraticCurveTo(B * 2, -B * 2.6, -B * 0.8, -B * 2.8);
    ctx.closePath();
    ctx.fill();
    // Ребра й трубки на спині
    ctx.fillStyle = shine;
    for (let k = 0; k < 4; k++) {
        ctx.fillRect(B * (0.4 + k * 0.9), -B * (3.9 + k * 0.15), B * 0.2, B * 0.9);
    }
    ctx.fillStyle = body;
    for (let k = 0; k < 2; k++) {
        ctx.save();
        ctx.translate(B * (2.6 + k * 0.9), -B * 4.6);
        ctx.rotate(-0.9);
        ctx.fillRect(0, -B * 0.25, B * 1.8, B * 0.4);
        ctx.restore();
    }
    // Видовжена голова з блиском
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(B * 4.2, -B * 4.8);
    ctx.quadraticCurveTo(B * 5.5, -B * 6.2, B * 3.2, -B * 7.4);
    ctx.quadraticCurveTo(B * 6.5, -B * 7.2, B * 8.2, -B * 4.4);
    ctx.lineTo(B * 7.6, -B * 3.8);
    ctx.quadraticCurveTo(B * 6, -B * 3.6, B * 4.6, -B * 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(160, 200, 210, 0.7)";
    ctx.lineWidth = Math.max(1, B * 0.15);
    ctx.beginPath();
    ctx.moveTo(B * 4.2, -B * 6.6);
    ctx.quadraticCurveTo(B * 6, -B * 6.6, B * 7.4, -B * 4.8);
    ctx.stroke();
    // Зуби, що ледь видно
    ctx.fillStyle = "#c8d8d0";
    for (let k = 0; k < 3; k++) {
        ctx.fillRect(B * (6.4 + k * 0.4), -B * 4, B * 0.15, B * 0.25);
    }
    ctx.restore();
}

// Королева: широкий гребінь-корона, довга голова, багато лап
function drawXenoQueen(ctx, x, y, B, time, s, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    const body = "#0a1012";
    drawXeno(ctx, 0, 0, B * 1.4, time, 1, 1, 1);
    // Гребінь-корона над головою
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(B * 5.5, -B * 8.5);
    ctx.lineTo(B * 1, -B * 15);
    ctx.lineTo(B * 5, -B * 13);
    ctx.lineTo(B * 7, -B * 16);
    ctx.lineTo(B * 9, -B * 12);
    ctx.lineTo(B * 11.5, -B * 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(90, 130, 140, 0.8)";
    ctx.lineWidth = Math.max(1, B * 0.2);
    for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(B * (6 + k * 0.8), -B * 8.6);
        ctx.lineTo(B * (2.5 + k * 1.8), -B * (13.5 + (k % 2)));
        ctx.stroke();
    }
    // Очі-вогники
    ctx.fillStyle = "rgba(120, 255, 190, " + (0.6 + 0.4 * Math.sin(time * 4)).toFixed(3) + ")";
    ctx.fillRect(B * 9, -B * 7.6, B * 0.9, B * 0.35);
    ctx.restore();
}

// Лицехват: блідий, з пальцями-лапками й довгим хвостом; бігає підлогою
function drawFacehugger(ctx, x, y, B, time, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const skin = "#d8c8a0";
    ctx.strokeStyle = skin;
    ctx.lineWidth = B * 0.25;
    for (let k = 0; k < 4; k++) {
        const ph = Math.sin(time * 18 + k * 1.3) * B * 0.4;
        ctx.beginPath();
        ctx.moveTo(-B * 0.6 + k * B * 0.4, -B * 0.8);
        ctx.lineTo(-B * 1.2 + k * B * 0.8 + ph, -B * 0.4);
        ctx.lineTo(-B * 1.4 + k * B * 0.9 + ph, 0);
        ctx.stroke();
    }
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(0, -B * 0.9, B * 1.1, B * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b8a880";
    ctx.fillRect(-B * 0.6, -B * 1.2, B * 1.2, B * 0.2);
    ctx.strokeStyle = skin;
    ctx.lineWidth = B * 0.3;
    ctx.beginPath();
    ctx.moveTo(B * 1, -B * 0.9);
    ctx.quadraticCurveTo(B * 2.5, -B * 0.3 + Math.sin(time * 10) * B * 0.6, B * 4, -B * 0.8);
    ctx.stroke();
    ctx.restore();
}

// Мисливець: високий, металева маска, «дреди», наплічна гармата.
// cloak — 0 (видно) … 1 (невидимий, лише мерехтливий контур)
function drawHunterFigure(ctx, x, y, B, time, s, cloak) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const visible = 1 - cloak * 0.9;
    ctx.globalAlpha = visible;
    const skin = "#6a6a3a";
    const armor = "#8a8a94";
    // Ноги
    ctx.fillStyle = skin;
    ctx.fillRect(-B * 1.2, -B * 3.5, B * 0.9, B * 3.5);
    ctx.fillRect(B * 0.3, -B * 3.5, B * 0.9, B * 3.5);
    ctx.fillStyle = armor;
    ctx.fillRect(-B * 1.3, -B * 1.4, B * 1.1, B * 0.6);
    ctx.fillRect(B * 0.2, -B * 1.4, B * 1.1, B * 0.6);
    // Тулуб із сіткою й обладунком
    ctx.fillStyle = skin;
    ctx.fillRect(-B * 1.6, -B * 7, B * 3.2, B * 3.6);
    ctx.strokeStyle = "rgba(20, 20, 20, 0.6)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(-B * 1.6, -B * 7 + k * B * 0.8);
        ctx.lineTo(B * 1.6, -B * 6.4 + k * B * 0.8);
        ctx.stroke();
    }
    ctx.fillStyle = armor;
    ctx.fillRect(-B * 1.8, -B * 7.2, B * 3.6, B * 0.8);
    // Руки
    ctx.fillStyle = skin;
    ctx.fillRect(-B * 2.4, -B * 6.8, B * 0.8, B * 3.2);
    ctx.fillRect(B * 1.6, -B * 6.8, B * 0.8, B * 3.2);
    ctx.fillStyle = armor;
    ctx.fillRect(B * 1.5, -B * 4.6, B * 1, B * 0.8);
    // «Дреди» й маска
    ctx.fillStyle = "#1a1a10";
    for (let k = 0; k < 6; k++) {
        const sway = Math.sin(time * 2 + k) * B * 0.15;
        ctx.fillRect(-B * 1.2 + k * B * 0.45 + sway, -B * 8.8, B * 0.25, B * 2.4);
    }
    ctx.fillStyle = "#b8b8a8";
    ctx.beginPath();
    ctx.moveTo(-B * 1, -B * 9.6);
    ctx.lineTo(B * 1, -B * 9.6);
    ctx.lineTo(B * 0.8, -B * 7.6);
    ctx.lineTo(0, -B * 7.2);
    ctx.lineTo(-B * 0.8, -B * 7.6);
    ctx.closePath();
    ctx.fill();
    const eye = 0.6 + 0.4 * Math.sin(time * 5);
    ctx.fillStyle = "rgba(255, 170, 40, " + eye.toFixed(3) + ")";
    ctx.fillRect(-B * 0.7, -B * 9, B * 0.5, B * 0.25);
    ctx.fillRect(B * 0.2, -B * 9, B * 0.5, B * 0.25);
    // Наплічна гармата
    ctx.fillStyle = "#5a5a64";
    ctx.fillRect(-B * 2.2, -B * 8.4, B * 1.8, B * 0.7);
    ctx.fillRect(-B * 2.8, -B * 8.3, B * 0.6, B * 0.4);
    ctx.globalAlpha = 1;
    // Невидимість: мерехтливий контур
    if (cloak > 0.05) {
        ctx.strokeStyle = "rgba(220, 255, 230, " + (0.45 * cloak).toFixed(3) + ")";
        ctx.lineWidth = 2;
        const j = function () { return (Math.random() - 0.5) * B * 0.3; };
        ctx.beginPath();
        ctx.moveTo(-B * 1.2 + j(), 0);
        ctx.lineTo(-B * 1.6 + j(), -B * 7);
        ctx.lineTo(-B * 1 + j(), -B * 9.6);
        ctx.lineTo(B * 1 + j(), -B * 9.6);
        ctx.lineTo(B * 1.6 + j(), -B * 7);
        ctx.lineTo(B * 1.2 + j(), 0);
        ctx.stroke();
    }
    ctx.restore();
}

// Три червоні точки прицілу навколо (x, y)
function drawTripleLaser(ctx, x, y, B, time, alpha) {
    ctx.fillStyle = "rgba(255, 30, 30, " + alpha.toFixed(3) + ")";
    for (let k = 0; k < 3; k++) {
        const a = time * 1.5 + k * Math.PI * 2 / 3;
        ctx.fillRect(Math.round(x + Math.cos(a) * B * 0.5 - 2), Math.round(y + Math.sin(a) * B * 0.5 - 2), 4, 4);
    }
}

// Додає до сюжету світу ще одне малювання (поверх наявного)
function extendStory(theme, extra) {
    const prev = STORY_BY_THEME[theme];
    STORY_BY_THEME[theme] = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (prev) {
            prev.call(this, ctx, W, H, gY, time, B, p, s1, s2, oops);
        }
        extra.call(this, ctx, W, H, gY, time, B, p, s1, s2, oops);
    };
}

// 1-12 Космічний вантажник: лицехват пробігає підлогою; ксеноморф крадеться коридором
// й повзе стелею
extendStory("alien_freighter", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const fk = (time * 0.11) % 1;
    if (fk < 0.4) {
        drawFacehugger(ctx, W * (1.05 - fk / 0.4 * 1.2), gY - B * 0.3, B, time, 0.6);
    }
    if (s1 > 0) {
        const k = (time * 0.035) % 1;
        drawXeno(ctx, -B * 12 + k * (W + B * 24), gY - B * 1.2, B, time, 0.9, 1, 0.9 * s1);
    }
    if (s2 > 0) {
        // Під стелею догори ногами
        const k = (time * 0.05 + 0.4) % 1;
        ctx.save();
        ctx.translate(0, gY * 0.12 + B * 2);
        ctx.scale(1, -1);
        drawXeno(ctx, W + B * 10 - k * (W + B * 24), 0, B, time, 0.7, -1, s2);
        ctx.restore();
    }
});

// 1-15 Джунглі мисливця: на гілці сидить мисливець — спершу лише очі в листі,
// потім мерехтливий контур, а наприкінці він проявляється й цілиться
extendStory("hunter_jungle", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const hx = W * 0.74;
    const hy = gY * 0.46;
    ctx.fillStyle = "#4a3a1a";
    ctx.fillRect(Math.round(hx - B * 6), Math.round(hy), Math.round(B * 12), Math.round(B * 0.8));
    ctx.fillStyle = "#2a6a1a";
    for (let k = 0; k < 6; k++) {
        ctx.fillRect(Math.round(hx - B * 6 + k * B * 2.2), Math.round(hy - B * (1 + (k % 2))), Math.round(B * 2), Math.round(B * 1.4));
    }
    if (s1 <= 0) {
        if (Math.sin(time * 0.9) > 0.6) {
            ctx.fillStyle = "rgba(255, 170, 40, 0.9)";
            ctx.fillRect(Math.round(hx - B * 0.6), Math.round(hy - B * 6.5), Math.round(B * 0.4), Math.round(B * 0.2));
            ctx.fillRect(Math.round(hx + B * 0.2), Math.round(hy - B * 6.5), Math.round(B * 0.4), Math.round(B * 0.2));
        }
        return;
    }
    const cloak = 1 - s2;
    drawHunterFigure(ctx, hx, hy, B, time, 0.75, cloak);
    if (s2 > 0) {
        // Промінь гармати й три точки біля кубика
        const tx = W * 0.3 + Math.sin(time * 1.3) * B * 3;
        const ty = gY - B * 1.5;
        ctx.strokeStyle = "rgba(255, 40, 40, " + (0.25 * s2).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx - B * 1.6, hy - B * 6.2);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        drawTripleLaser(ctx, tx, ty, B, time, s2);
    }
});

// 1-24 Вулик: голови ксеноморфів визирають зі стін, лицехват вистрибує з яйця,
// ксеноморф повзе стелею
extendStory("alien_hive", function (ctx, W, H, gY, time, B, p, s1, s2) {
    for (let i = 0; i < 3; i++) {
        const ph = ((time * 0.2 + i * 0.37) % 1);
        const k = ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) : 0;
        if (k <= 0) {
            continue;
        }
        const x = W * (0.15 + i * 0.3);
        const y = gY * (0.3 + (i % 2) * 0.15);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - B * 2, y - B * 8, B * 12, B * 12);
        ctx.clip();
        drawXeno(ctx, x - B * 8 + k * B * 4, y + B * 4, B, time, 0.7, 1, 0.95);
        ctx.restore();
    }
    if (s1 > 0) {
        const k = (time * 0.3) % 1.6;
        if (k < 1) {
            const x = W * 0.5 + k * W * 0.25;
            const y = gY - B * 0.5 - Math.sin(k * Math.PI) * gY * 0.25;
            drawFacehugger(ctx, x, y, B, time, 0.7);
        }
        const c = (time * 0.04) % 1;
        ctx.save();
        ctx.translate(0, B * 3);
        ctx.scale(1, -1);
        drawXeno(ctx, -B * 12 + c * (W + B * 24), 0, B, time, 0.8, 1, s1);
        ctx.restore();
    }
});

// 2-9 Трофейний корабель: стіна трофейних шоломів, мисливець біля пульта
extendStory("hunter_ship", function (ctx, W, H, gY, time, B, p, s1, s2) {
    const row = gY * 0.2;
    const colors = ["#8a8a94", "#6a7a5a", "#9a7a4a", "#5a6a8a", "#8a5a5a"];
    const off = (time * B * 1.5) % (B * 6);
    for (let x = -off, i = 0; x < W + B * 6; x += B * 6, i++) {
        const idx = (Math.floor(time * B * 1.5 / (B * 6)) + i) % colors.length;
        ctx.fillStyle = "#2a3a30";
        ctx.fillRect(Math.round(x + B * 1.6), Math.round(row - B * 0.4), Math.round(B * 1.8), Math.round(B * 0.4));
        ctx.fillStyle = colors[(idx + colors.length) % colors.length];
        ctx.fillRect(Math.round(x + B), Math.round(row), Math.round(B * 3), Math.round(B * 2.4));
        ctx.fillStyle = "rgba(90, 255, 150, 0.6)";
        ctx.fillRect(Math.round(x + B * 1.4), Math.round(row + B * 0.9), Math.round(B * 0.8), Math.round(B * 0.3));
        ctx.fillRect(Math.round(x + B * 2.6), Math.round(row + B * 0.9), Math.round(B * 0.8), Math.round(B * 0.3));
    }
    const hx = W * 0.8;
    const hy = gY - B * 1.2;
    ctx.fillStyle = "#26382c";
    ctx.fillRect(Math.round(hx - B * 6), Math.round(hy - B * 4), Math.round(B * 4), Math.round(B * 4));
    ctx.fillStyle = Math.sin(time * 4) > 0 ? "#5aff9a" : "#2a8a4a";
    ctx.fillRect(Math.round(hx - B * 5.5), Math.round(hy - B * 3.6), Math.round(B * 3), Math.round(B * 1.2));
    drawHunterFigure(ctx, hx, hy, B, time, 0.7, s1 > 0.5 && s2 < 0.5 ? 0.6 : 0);
    if (s2 > 0) {
        drawTripleLaser(ctx, W * 0.32, gY - B * 1.4, B, time, s2);
    }
});

export { drawFacehugger, drawXeno, drawXenoQueen, extendStory };
