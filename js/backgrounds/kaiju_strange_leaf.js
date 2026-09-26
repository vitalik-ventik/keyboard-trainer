// backgrounds/kaiju_strange_leaf.js — Ліга 1 (частина 4): затока велетнів, дивне містечко, прихована деревня

import { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS } from "./core.js";
import { drawBlockTerrain, drawFallingPixels, drawPixelDisc, drawScrollingStrip, drawStripCopies, extraStripW, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { GROUND_BY_THEME, _fx } from "./effects.js";
import { STORY_BY_THEME, drawBeam, storyOopsFlash } from "./story.js";
import { FINISH_BY_THEME, WEATHER_THEMES, WORLD_NAMES } from "./names_finish_weather.js";

// ============================================================
// Нові світи Ліги 1 (частина 4): Затока велетнів,
// Дивне містечко та Прихована деревня
// ============================================================

// ---------- Затока велетнів: ящер-кайдзю проти велетенської мавпи ----------

// Ящер-кайдзю, дивиться праворуч; (x, y) — точка на рівні води під центром тіла
function drawKaijuLizard(ctx, x, y, B, time, s, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const sway = Math.sin(time * 0.8) * B * 0.3;
    const body = "#23302a";
    const dark = "#16201b";
    // Хвіст ліворуч
    ctx.fillStyle = dark;
    ctx.fillRect(-B * 9, -B * 3, B * 5, B * 1.6);
    ctx.fillRect(-B * 11, -B * 2.2, B * 3, B * 1.2);
    // Тулуб і шия
    ctx.fillStyle = body;
    ctx.fillRect(-B * 4, -B * 10, B * 6, B * 10);
    ctx.fillRect(-B * 1 + sway, -B * 14, B * 3.4, B * 4.4);
    // Голова з пащею
    ctx.fillRect(B * 0.6 + sway, -B * 15.4, B * 4, B * 2.2);
    ctx.fillStyle = dark;
    ctx.fillRect(B * 2.2 + sway, -B * 13.6, B * 2.4, B * 0.5);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(B * 2.6 + sway, -B * 14.8, B * 0.5, B * 0.4);
    // Ручки
    ctx.fillStyle = body;
    ctx.fillRect(B * 2, -B * 9, B * 2, B * 0.9);
    ctx.fillRect(B * 3.6, -B * 9, B * 0.6, B * 1.6);
    // Спинні пластини: світяться, коли набирається атомний промінь
    const plate = "rgba(" + Math.round(40 + 100 * glow) + ", " + Math.round(60 + 170 * glow) + ", " + Math.round(80 + 175 * glow) + ", 1)";
    ctx.fillStyle = plate;
    for (let i = 0; i < 6; i++) {
        const py = -B * (2 + i * 2.1);
        const pw = B * (1.2 + (i % 2) * 0.6);
        ctx.fillRect(-B * 4 - pw, py - B * 1.2, pw, B * 1.2);
        ctx.fillRect(-B * 4 - pw * 0.5, py - B * 1.8, pw * 0.5, B * 0.6);
    }
    if (glow > 0.2) {
        ctx.fillStyle = "rgba(120, 220, 255, " + (0.25 * glow).toFixed(3) + ")";
        ctx.fillRect(-B * 7, -B * 16, B * 5, B * 15);
    }
    ctx.restore();
}

// Велетенська мавпа, дивиться ліворуч; punch — 0…1 ривок кулака, fall — 0…1 падіння назад
function drawKaijuApe(ctx, x, y, B, time, s, punch, fall) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(fall * 0.9);
    ctx.scale(s, s);
    const fur = "#4a3020";
    const dark = "#2e1e14";
    const breath = Math.sin(time * 1.5) * B * 0.2;
    // Тулуб і плечі
    ctx.fillStyle = fur;
    ctx.fillRect(-B * 3.5, -B * 11 + breath, B * 7, B * 11);
    ctx.fillRect(-B * 4.5, -B * 11 + breath, B * 9, B * 3);
    // Груди
    ctx.fillStyle = "#6a4a34";
    ctx.fillRect(-B * 2.4, -B * 9.5 + breath, B * 4.8, B * 3);
    // Голова з надбрівною дугою
    ctx.fillStyle = fur;
    ctx.fillRect(-B * 2, -B * 14 + breath, B * 4, B * 3.2);
    ctx.fillStyle = dark;
    ctx.fillRect(-B * 2.2, -B * 13.2 + breath, B * 4.4, B * 0.6);
    ctx.fillStyle = "#8a6a4a";
    ctx.fillRect(-B * 1.8, -B * 12.4 + breath, B * 2.4, B * 1.4);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-B * 1.4, -B * 12.8 + breath, B * 0.4, B * 0.3);
    ctx.fillRect(-B * 0.2, -B * 12.8 + breath, B * 0.4, B * 0.3);
    // Руки: права б'є вперед (ліворуч)
    ctx.fillStyle = dark;
    const reach = punch * B * 5;
    ctx.fillRect(-B * 5.5 - reach, -B * 10 + breath, B * 2 + reach, B * 1.4);
    ctx.fillRect(-B * 6.4 - reach, -B * 10.4 + breath, B * 1.4, B * 2.2);
    ctx.fillRect(B * 3.5, -B * 10 + breath, B * 1.6, B * 8);
    ctx.restore();
}

// Велетні далеко в морі: масштаб, щоб голови вміщалися під верхнім краєм
const KAIJU_SCALE = 0.55;

function buildKaijuBay(W, H, groundY, B) {
    const rng = pixelRng(4901);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#141a34"], [0.5, "#3a3462"], [1, "#9a5a6a"]]);
    const stripW = extraStripW(W, B);
    // Місто на березі: хмарочоси з вогниками у вікнах
    const cityH = Math.round(gY * 0.42);
    const city = makeCanvas(stripW, cityH);
    const cx = city.getContext("2d");
    for (let x = 0; x < stripW; x += B * 3) {
        const h = B * (4 + Math.floor(rng() * 10));
        cx.fillStyle = rng() < 0.5 ? "#1a1e30" : "#22263a";
        cx.fillRect(x, cityH - h, B * 2.8, h);
        for (let y = cityH - h + B; y < cityH - B * 0.5; y += B) {
            for (let wx = x + B * 0.4; wx < x + B * 2.4; wx += B * 0.8) {
                if (rng() < 0.35) {
                    cx.fillStyle = rng() < 0.7 ? "#ffd86a" : "#9ad0ff";
                    cx.fillRect(wx, y, B * 0.4, B * 0.4);
                }
            }
        }
        if (rng() < 0.15) {
            cx.fillStyle = "#ff3a3a";
            cx.fillRect(x + B * 1.2, cityH - h - B, B * 0.3, B);
        }
    }
    // Набережна з ліхтарями
    const near = makeCanvas(stripW, B * 2);
    const nx = near.getContext("2d");
    nx.fillStyle = "#3a3e4a";
    nx.fillRect(0, B, stripW, B);
    for (let x = 0; x < stripW; x += B * 10) {
        nx.fillStyle = "#6a6e7a";
        nx.fillRect(x, 0, B * 0.3, B);
        nx.fillStyle = "#ffe8a0";
        nx.fillRect(x - B * 0.2, 0, B * 0.7, B * 0.3);
    }
    return { W: W, H: H, sky: sky, city: city, near: near };
}

BackgroundRenderer.renderKaijuBay = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._kaijuBay;
    if (!st || st.W !== W || st.H !== H) {
        st = buildKaijuBay(W, H, groundY, B);
        this._kaijuBay = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Блискавки десь за хмарами
    if (Math.sin(time * 0.9) > 0.97) {
        ctx.fillStyle = "rgba(200, 210, 255, 0.15)";
        ctx.fillRect(0, 0, W, gY);
    }
    // Море від обрію до міста
    const seaY = Math.round(gY * 0.5);
    ctx.fillStyle = "#1a2a4a";
    ctx.fillRect(0, seaY, W, gY - seaY);
    ctx.fillStyle = "rgba(160, 200, 255, 0.25)";
    for (let i = 0; i < 18; i++) {
        const wx = ((i * 97 + time * 12) % (W + 60)) - 30;
        ctx.fillRect(Math.round(wx), seaY + (i % 5) * B * 0.8 + B, Math.round(B * 2), 2);
    }
    // Велетні стоять у воді (їхні ноги ховає місто попереду)
    const fight = this._kaijuFight || { glow: 0, punch: 0, fall: 0 };
    const phase = (time % 6) / 6;
    const baseGlow = phase > 0.6 ? (phase - 0.6) / 0.25 : 0;
    const glow = Math.max(Math.min(1, baseGlow), fight.glow);
    const punch = Math.max(Math.max(0, Math.sin(time * 1.7)) ** 6, fight.punch);
    drawKaijuLizard(ctx, W * 0.3, seaY + B * 3, B, time, KAIJU_SCALE, glow);
    drawKaijuApe(ctx, W * 0.7, seaY + B * 3, B, time, KAIJU_SCALE, punch, fight.fall);
    // Атомний промінь, коли пластини світяться найяскравіше
    if (phase > 0.85 && fight.fall < 0.5) {
        const mx = W * 0.3 + B * 4.5 * KAIJU_SCALE;
        const my = seaY + B * 3 - B * 14.2 * KAIJU_SCALE;
        ctx.fillStyle = "rgba(120, 220, 255, 0.85)";
        ctx.fillRect(Math.round(mx), Math.round(my - B * 0.3), Math.round(W * 0.34), Math.round(B * 0.6));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(mx), Math.round(my - B * 0.1), Math.round(W * 0.34), Math.round(B * 0.2));
    }
    drawStripCopies(ctx, st.city, W, gY - B - st.city.height, time, speed, 0.2);
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { kaiju_bay: "renderKaijuBay" });
SCENE_CACHE_KEYS.push("_kaijuBay");
GROUND_BY_THEME.kaiju_bay = "stone";
FINISH_BY_THEME.kaiju_bay = "gate";
WORLD_NAMES.kaiju_bay = "Затока велетнів";
WEATHER_THEMES.add("kaiju_bay");

// Сюжет: бій розпалюється (гелікоптери з прожекторами) — мавпа падає у воду, ящер переможно реве
STORY_BY_THEME.kaiju_bay = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    const fallK = s2 > 0 ? smoothStep((p - 0.66) / 0.15) : 0;
    // Стан бою передається сцені (вона малюється до сюжету й побачить його в наступному кадрі)
    this._kaijuFight = {
        glow: s2 > 0 ? 0.6 + 0.4 * Math.sin(time * 4) : 0,
        punch: s1 > 0 && fallK < 0.3 ? Math.max(0, Math.sin(time * 3)) ** 3 * s1 : 0,
        fall: fallK
    };
    if (s1 > 0) {
        ctx.globalAlpha = s1;
        for (let i = 0; i < 2; i++) {
            const hx = W * (0.35 + i * 0.3) + Math.sin(time * 0.7 + i * 2) * W * 0.12;
            const hy = gY * (0.12 + i * 0.06);
            drawBeam(ctx, hx, hy, Math.PI / 2 + Math.sin(time * 1.3 + i) * 0.5, gY * 0.6, 0.08, "rgba(255, 255, 220, 0.12)");
            ctx.fillStyle = "#1a1c24";
            ctx.fillRect(Math.round(hx - B * 1.2), Math.round(hy - B * 0.5), Math.round(B * 2.4), Math.round(B));
            ctx.fillRect(Math.round(hx + B * 1.2), Math.round(hy - B * 0.2), Math.round(B * 1.6), Math.round(B * 0.3));
            ctx.fillStyle = "rgba(200, 200, 220, 0.7)";
            const rot = Math.abs(Math.sin(time * 30)) * B * 2;
            ctx.fillRect(Math.round(hx - rot), Math.round(hy - B * 0.8), Math.round(rot * 2), 2);
            ctx.fillStyle = Math.floor(time * 3) % 2 ? "#ff3a3a" : "#3a0a0a";
            ctx.fillRect(Math.round(hx + B * 2.6), Math.round(hy - B * 0.3), Math.round(B * 0.3), Math.round(B * 0.3));
        }
        ctx.globalAlpha = 1;
    }
    if (s2 > 0 && fallK > 0.8) {
        // Переможний рев: промінь у небо
        const mx = W * 0.3 + B * 2.5 * KAIJU_SCALE;
        const my = gY * 0.5 + B * 3 - B * 14 * KAIJU_SCALE;
        ctx.globalAlpha = s2 * (0.6 + 0.4 * Math.sin(time * 10));
        ctx.fillStyle = "rgba(120, 220, 255, 0.85)";
        ctx.fillRect(Math.round(mx), 0, Math.round(B * 0.9), Math.round(my));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(mx + B * 0.3), 0, Math.round(B * 0.3), Math.round(my));
        ctx.globalAlpha = 1;
        // Бризки там, де впала мавпа
        ctx.fillStyle = "rgba(200, 230, 255, 0.8)";
        for (let i = 0; i < 10; i++) {
            const k = (time * 0.8 + i / 10) % 1;
            ctx.fillRect(Math.round(W * 0.78 + (i - 5) * B * 0.8), Math.round(gY * 0.5 - Math.sin(k * Math.PI) * B * 4), 3, 3);
        }
    }
    storyOopsFlash(ctx, W, gY, oops, "120, 200, 255", 0.18);
};

// ---------- Дивне містечко: вітальня 80-х і гірлянда з абеткою ----------

const STRANGE_ALPHABET = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";
const STRANGE_BULBS = ["#ff3a3a", "#39c6ff", "#ffcc33", "#39ff88", "#ff8a1a", "#ff5ad8"];

function buildStrangeTown(W, H, groundY, B) {
    const rng = pixelRng(5001);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#3a2a1a"], [1, "#2a1a10"]]);
    const stripW = extraStripW(W, B);
    // Стіна: шпалери в смужку з квіточками, дерев'яна панель унизу
    const wall = makeCanvas(stripW, gY);
    const wx = wall.getContext("2d");
    for (let x = 0; x < stripW; x += B * 2) {
        wx.fillStyle = (x / (B * 2)) % 2 === 0 ? "#8a7a4a" : "#7a6a3e";
        wx.fillRect(x, 0, B * 2, gY);
        for (let y = B; y < gY * 0.7; y += B * 3) {
            wx.fillStyle = "#a8583a";
            wx.fillRect(x + B * 0.8, y + ((x / B) % 4 === 0 ? B * 1.5 : 0), B * 0.4, B * 0.4);
        }
    }
    wx.fillStyle = "#5a3a1e";
    wx.fillRect(0, Math.round(gY * 0.72), stripW, gY - Math.round(gY * 0.72));
    wx.fillStyle = "#4a2e16";
    for (let x = 0; x < stripW; x += B * 3) {
        wx.fillRect(x, Math.round(gY * 0.72), B * 0.3, gY);
    }
    wx.fillStyle = "#6a4a2a";
    wx.fillRect(0, Math.round(gY * 0.72), stripW, B * 0.5);
    // Диван, торшер і телевізор
    for (let x = B * 4; x < stripW - B * 30; x += B * 34) {
        // Диван
        const sx = x + B * 11;
        const sy = Math.round(gY * 0.72) + B * 2;
        wx.fillStyle = "#6a3a2a";
        wx.fillRect(sx, sy - B * 4, B * 10, B * 2.4);
        wx.fillRect(sx - B, sy - B * 2.8, B * 12, B * 2.8);
        wx.fillStyle = "#8a4a3a";
        wx.fillRect(sx + B * 0.5, sy - B * 2.4, B * 4.4, B * 1.2);
        wx.fillRect(sx + B * 5.1, sy - B * 2.4, B * 4.4, B * 1.2);
        // Торшер
        const lx = x + B * 24;
        wx.fillStyle = "#3a3a3a";
        wx.fillRect(lx, sy - B * 9, B * 0.3, B * 9);
        wx.fillStyle = "#e8c070";
        wx.fillRect(lx - B * 1.4, sy - B * 11, B * 3, B * 2);
        // Телевізор на тумбі
        const tx = x + B * 27;
        wx.fillStyle = "#4a2e16";
        wx.fillRect(tx, sy - B * 2.4, B * 5, B * 2.4);
        wx.fillStyle = "#2a2a2a";
        wx.fillRect(tx + B * 0.4, sy - B * 6, B * 4.2, B * 3.6);
        wx.fillStyle = "#6a7a8a";
        wx.fillRect(tx + B * 0.8, sy - B * 5.6, B * 3, B * 2.6);
    }
    return { W: W, H: H, sky: sky, wall: wall };
}

// Гірлянда на весь екран: три ряди літер, над кожною — лампочка; світиться потрібна літера
function drawAlphabetGarland(ctx, W, gY, B, time, letter, flicker) {
    const rows = 3;
    const perRow = 11;
    const x0 = W * 0.1;
    const dx = (W * 0.8) / (perRow - 1);
    ctx.font = "bold " + Math.round(B * 1.6) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let r = 0; r < rows; r++) {
        // Нижче за панель очок і табличку слова вгорі екрана
        const y = gY * (0.3 + r * 0.15);
        // Дріт
        ctx.strokeStyle = "#1a2a14";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let c = 0; c < perRow; c++) {
            const bx = x0 + c * dx;
            const by = y - B * 1.6 + Math.sin(c * 1.3 + r) * B * 0.3;
            if (c === 0) {
                ctx.moveTo(bx - dx / 2, by - B * 0.3);
            }
            ctx.lineTo(bx, by);
        }
        ctx.stroke();
        for (let c = 0; c < perRow; c++) {
            const ch = STRANGE_ALPHABET[r * perRow + c];
            const bx = x0 + c * dx;
            const by = y - B * 1.6 + Math.sin(c * 1.3 + r) * B * 0.3;
            const color = STRANGE_BULBS[(r * perRow + c) % STRANGE_BULBS.length];
            const target = ch === letter;
            let on = target ? 1 : 0;
            // Сторонні лампочки лише зрідка спалахують слабко, щоб не заважати знайти потрібну
            if (!on && flicker > 0 && Math.sin(time * 13 + c * 3.1 + r * 7.7) > 0.985) {
                on = 0.4 * flicker;
            }
            if (on > 0) {
                const pulse = target ? 0.45 + 0.15 * Math.sin(time * 8) : 0.2;
                const halo = target ? 1.8 : 1.2;
                ctx.globalAlpha = on * pulse;
                ctx.fillStyle = color;
                ctx.fillRect(Math.round(bx - B * halo), Math.round(by - B * halo * 0.8), Math.round(B * halo * 2), Math.round(B * halo * 2.2));
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = on > 0 ? "#ffffff" : color;
            ctx.globalAlpha = on > 0 ? 1 : 0.45;
            ctx.fillRect(Math.round(bx - B * 0.3), Math.round(by), Math.round(B * 0.6), Math.round(B * 0.8));
            ctx.globalAlpha = 1;
            // Кольоровою стає лише потрібна літера — випадкові спалахи не збивають
            ctx.fillStyle = target ? color : "#1a1208";
            ctx.fillText(ch, Math.round(bx), Math.round(y + B * 0.6));
        }
    }
}

BackgroundRenderer.renderStrangeTown = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._strangeTown;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStrangeTown(W, H, groundY, B);
        this._strangeTown = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const wallW = st.wall.width;
    const off = Math.round(time * speed * 0.15) % wallW;
    for (let x = -off; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, 0);
    }
    // Гірлянда: коли кубик у рівні — світиться потрібна літера, інакше «Хтось» пише БІЖИ
    let letter = _fx.letter;
    if (!letter) {
        const demo = "БІЖИ";
        letter = demo[Math.floor(time * 1.2) % demo.length];
    }
    drawAlphabetGarland(ctx, W, gY, B, time, letter, 0);
};

Object.assign(THEME_RENDERERS, { strange_town: "renderStrangeTown" });
SCENE_CACHE_KEYS.push("_strangeTown");
FINISH_BY_THEME.strange_town = "portal";
WORLD_NAMES.strange_town = "Дивне містечко";

// Сюжет: лампочки мерехтять самі собою — кімната «перевертається» в Ізнанку: синя темрява, спори, ліани
STORY_BY_THEME.strange_town = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    if (s1 > 0) {
        // Торшер і світло в кімнаті мигтять
        if (Math.sin(time * 17) > 0.8 || Math.sin(time * 5.3) > 0.95) {
            ctx.fillStyle = "rgba(0, 0, 0, " + (0.25 * s1).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        let letter = _fx.letter;
        if (!letter) {
            letter = "БІЖИ"[Math.floor(time * 1.2) % 4];
        }
        drawAlphabetGarland(ctx, W, gY, B, time, letter, s1);
    }
    if (s2 > 0) {
        ctx.fillStyle = "rgba(20, 30, 70, " + (0.45 * s2).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        // Ліани повзуть краями стін
        ctx.fillStyle = "rgba(20, 16, 24, " + (0.9 * s2).toFixed(3) + ")";
        for (let i = 0; i < 10; i++) {
            const vx = (i % 2 === 0 ? W * 0.02 : W * 0.96) + Math.sin(i * 2.3) * B * 2;
            const len = gY * (0.3 + (i % 3) * 0.15) * s2;
            for (let k = 0; k < len; k += B * 0.6) {
                ctx.fillRect(Math.round(vx + Math.sin(k * 0.05 + i + time * 0.5) * B), Math.round(k), Math.round(B * 0.6), Math.round(B * 0.7));
            }
        }
        // Спори пливуть угору
        ctx.globalAlpha = s2;
        drawFallingPixels(ctx, W, gY, time, 40, 5002, { color: "#dce8ff", dir: -1, speedMin: 6, speedMax: 16, sizeMin: 1, sizeMax: 3, sway: 0.6, swayAmp: 18, alpha: 0.7 });
        ctx.globalAlpha = 1;
        // Гірлянда світиться й в Ізнанці
        let letter = _fx.letter;
        if (!letter) {
            letter = "БІЖИ"[Math.floor(time * 1.2) % 4];
        }
        drawAlphabetGarland(ctx, W, gY, B, time, letter, 0);
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 40, 40", 0.2);
};

// ---------- Прихована деревня: скеля з обличчями, дахи, ніндзя в стрибках ----------

// Ніндзя в стрибку (x, y — ноги), помаранчевий чи темний
function drawLeapNinja(ctx, x, y, B, color, s) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - B * 0.4 * s), Math.round(y - B * 2 * s), Math.round(B * 0.8 * s), Math.round(B * 1.4 * s));
    ctx.fillRect(Math.round(x - B * 0.9 * s), Math.round(y - B * 1.8 * s), Math.round(B * 0.5 * s), Math.round(B * 0.3 * s));
    ctx.fillRect(Math.round(x - B * 0.3 * s), Math.round(y - B * 0.6 * s), Math.round(B * 0.3 * s), Math.round(B * 0.6 * s));
    ctx.fillRect(Math.round(x + B * 0.2 * s), Math.round(y - B * 0.7 * s), Math.round(B * 0.5 * s), Math.round(B * 0.3 * s));
    ctx.fillStyle = "#ffd0a0";
    ctx.fillRect(Math.round(x - B * 0.35 * s), Math.round(y - B * 2.6 * s), Math.round(B * 0.7 * s), Math.round(B * 0.6 * s));
    ctx.fillStyle = "#1a2a5a";
    ctx.fillRect(Math.round(x - B * 0.4 * s), Math.round(y - B * 2.6 * s), Math.round(B * 0.8 * s), Math.round(B * 0.15 * s));
    ctx.fillRect(Math.round(x + B * 0.4 * s), Math.round(y - B * 2.6 * s), Math.round(B * 0.5 * s), Math.round(B * 0.1 * s));
}

function buildLeafVillage(W, H, groundY, B) {
    const rng = pixelRng(5101);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#4ab0f0"], [1, "#c8ecff"]]);
    const stripW = extraStripW(W, B);
    // Скеля з вирізьбленими обличчями
    const cliffH = Math.round(gY * 0.5);
    const cliff = makeCanvas(stripW, cliffH);
    const cx = cliff.getContext("2d");
    const cols = stripW / B;
    const hs = periodicHeights(cols, Math.round(cliffH / B) - 2, [{ amp: 1.5, k: 3, ph: 0.3 }, { amp: 1, k: 9, ph: 1 }]);
    drawBlockTerrain(cx, hs, B, cliffH, { top: "#5a8a3a", body: "#9a7a5a", body2: "#8a6a4a", speck: "#7a5a3a" }, rng);
    for (let x = B * 6; x < stripW - B * 8; x += B * 12) {
        const fy = Math.round(cliffH * 0.35);
        cx.fillStyle = "#b8987a";
        cx.fillRect(x, fy, B * 6, B * 7);
        cx.fillStyle = "#6a4a2e";
        cx.fillRect(x + B, fy + B * 2, B * 1.2, B * 0.8);
        cx.fillRect(x + B * 3.8, fy + B * 2, B * 1.2, B * 0.8);
        cx.fillRect(x + B * 2.6, fy + B * 3, B * 0.8, B * 1.6);
        cx.fillRect(x + B * 1.6, fy + B * 5.2, B * 2.8, B * 0.5);
        cx.fillStyle = "#8a6a4a";
        cx.fillRect(x, fy, B * 6, B * 1.4);
    }
    // Будинки з помаранчевими дахами, водонапірна вежа, дерева
    const midH = Math.round(gY * 0.45);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const roofs = [];
    for (let x = B * 2; x < stripW - B * 10; x += B * 9) {
        const h = B * (4 + Math.floor(rng() * 5));
        const w = B * (5 + Math.floor(rng() * 3));
        mx.fillStyle = rng() < 0.5 ? "#e8d8b8" : "#d8c8a8";
        mx.fillRect(x, midH - h, w, h);
        mx.fillStyle = rng() < 0.5 ? "#d8502a" : "#e8762a";
        mx.fillRect(x - B * 0.4, midH - h - B, w + B * 0.8, B);
        mx.fillStyle = "#6a8aa8";
        mx.fillRect(x + B, midH - h + B, B, B);
        mx.fillRect(x + w - B * 2, midH - h + B, B, B);
        roofs.push({ x: x + w / 2, y: midH - h - B });
        if (rng() < 0.4) {
            mx.fillStyle = "#3a8a2a";
            drawPixelDisc(mx, x + w + B * 1.5, midH - B * 5, B * 2.5, B, "#3a8a2a");
            mx.fillStyle = "#5a3a1a";
            mx.fillRect(x + w + B * 1.2, midH - B * 3, B * 0.6, B * 3);
        }
    }
    // Водонапірна вежа з листком-символом
    const tx = Math.round(stripW * 0.5);
    mx.fillStyle = "#c8403a";
    mx.fillRect(tx - B * 3, midH - B * 14, B * 6, B * 4);
    mx.fillStyle = "#8a2a2a";
    mx.fillRect(tx - B * 3.4, midH - B * 15, B * 6.8, B);
    mx.fillStyle = "#5a4a3a";
    mx.fillRect(tx - B * 2.4, midH - B * 10, B * 0.5, B * 10);
    mx.fillRect(tx + B * 1.9, midH - B * 10, B * 0.5, B * 10);
    mx.strokeStyle = "#ffffff";
    mx.lineWidth = Math.max(2, B * 0.3);
    mx.beginPath();
    mx.arc(tx, midH - B * 12, B, 0, Math.PI * 1.6);
    mx.stroke();
    // Дерев'яний паркан попереду
    const near = makeCanvas(stripW, B * 2);
    const nx = near.getContext("2d");
    nx.fillStyle = "#8a6a3a";
    nx.fillRect(0, B * 0.6, stripW, B * 0.4);
    for (let x = 0; x < stripW; x += B * 2) {
        nx.fillStyle = "#7a5a2a";
        nx.fillRect(x, 0, B * 0.5, B * 2);
    }
    return { W: W, H: H, sky: sky, cliff: cliff, mid: mid, roofs: roofs, near: near };
}

BackgroundRenderer.renderLeafVillage = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._leafVillage;
    if (!st || st.W !== W || st.H !== H) {
        st = buildLeafVillage(W, H, groundY, B);
        this._leafVillage = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Хмаринки
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < 4; i++) {
        const cxp = ((i * 0.3 + time * 0.005) % 1.2 - 0.1) * W;
        ctx.fillRect(Math.round(cxp), Math.round(gY * (0.08 + i * 0.05)), Math.round(B * 6), Math.round(B));
        ctx.fillRect(Math.round(cxp + B), Math.round(gY * (0.08 + i * 0.05) - B), Math.round(B * 3), Math.round(B));
    }
    drawScrollingStrip(ctx, st.cliff, W, gY - B * 6, time, speed, 0.06);
    const midTop = gY - B - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        // Ніндзя перестрибують із даху на дах
        for (let i = 0; i < st.roofs.length - 1; i += 3) {
            const a = st.roofs[i];
            const b = st.roofs[i + 1];
            const k = (time * 0.6 + i * 0.37) % 1;
            const nx = x + a.x + (b.x - a.x) * k;
            if (nx < -B * 4 || nx > W + B * 4) {
                continue;
            }
            const ny = midTop + a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * B * 4;
            drawLeapNinja(ctx, nx, ny, B, i % 2 === 0 ? "#2a2a3a" : "#3a5a3a", 0.8);
        }
    });
    // Листя кружляє
    drawFallingPixels(ctx, W, gY, time, 22, 5102, { color: "#5ac83a", dir: 1, speedMin: 15, speedMax: 30, sizeMin: 2, sizeMax: 4, sway: 1.4, swayAmp: 22, alpha: 0.85 });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

Object.assign(THEME_RENDERERS, { leaf_village: "renderLeafVillage" });
SCENE_CACHE_KEYS.push("_leafVillage");
GROUND_BY_THEME.leaf_village = "grass";
FINISH_BY_THEME.leaf_village = "gate";
WORLD_NAMES.leaf_village = "Прихована деревня";
WEATHER_THEMES.add("leaf_village");

// Хмарка «пуф» (k — 0…1 від появи до зникнення)
function drawSmokePoof(ctx, x, y, B, k) {
    ctx.globalAlpha = Math.max(0, 1 - k);
    ctx.fillStyle = "#f0f0f4";
    const r = B * (0.6 + k * 1.6);
    for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        ctx.fillRect(Math.round(x + Math.cos(a) * r - B * 0.5), Math.round(y + Math.sin(a) * r * 0.6 - B * 0.5), Math.round(B), Math.round(B));
    }
    ctx.globalAlpha = 1;
}

// Сюжет: ніндзя кидають кунаї з дахів — техніка тіньових клонів: цілий ряд помаранчевих ніндзя з хмарок диму
STORY_BY_THEME.leaf_village = function (ctx, W, H, gY, time, B, p, s1, s2, oops) {
    if (s1 > 0) {
        ctx.globalAlpha = s1;
        for (let i = 0; i < 3; i++) {
            const k = (time * 0.45 + i * 0.33) % 1;
            const x0 = W * (0.9 - i * 0.3);
            const x = x0 - k * W * 0.25;
            const y = gY * 0.55 - Math.sin(k * Math.PI) * gY * 0.25;
            drawLeapNinja(ctx, x, y, B, "#2a2a3a", 1);
            // Кунай летить униз
            const kk = (k * 2) % 1;
            ctx.fillStyle = "#c8ced8";
            ctx.fillRect(Math.round(x - kk * B * 6), Math.round(y - B + kk * B * 5), Math.round(B * 0.8), 2);
        }
        ctx.globalAlpha = 1;
    }
    if (s2 > 0) {
        const appear = smoothStep((p - 0.63) / 0.1);
        const count = 9;
        for (let i = 0; i < count; i++) {
            const t = Math.min(1, Math.max(0, appear * 1.6 - i * 0.07));
            const x = W * (0.12 + i * 0.1);
            const y = gY - B * 0.2 + Math.sin(time * 6 + i) * B * 0.15;
            if (t > 0.3) {
                ctx.globalAlpha = s2;
                drawLeapNinja(ctx, x, y, B, "#ff8a1a", 1.1);
                ctx.globalAlpha = 1;
            }
            if (t > 0 && t < 1) {
                drawSmokePoof(ctx, x, y - B * 1.4, B, t);
            }
        }
        if (appear > 0.2 && appear < 1) {
            ctx.font = "bold " + Math.round(B * 1.4) + "px monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = "#ff8a1a";
            ctx.fillText("ТЕХНІКА КЛОНІВ!", Math.round(W / 2), Math.round(gY * 0.3));
        }
    }
    storyOopsFlash(ctx, W, gY, oops, "255, 140, 30", 0.18);
};
