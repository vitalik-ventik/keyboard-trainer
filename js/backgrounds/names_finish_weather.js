// backgrounds/names_finish_weather.js — назви світів, фінішні ворота, погода

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, makeCanvas, pixelBlockSize } from "./helpers.js";

// ---------- Назви світів, фініші, погода ----------

const WORLD_NAMES = {
    block_village: "Кубічне селище", sunset_city: "Місто на заході сонця", cosmodrome: "Космодром",
    neon_highway: "Неонова траса", jungle_temple: "Джунглі з храмом", digital_forest: "Цифровий ліс",
    storm_sky: "Грозове небо", crystal_cave: "Кришталева печера", dino_valley: "Долина динозаврів",
    pixel_night: "Нічні пагорби", secret_base: "Секретна база", luna_park: "Луна-парк уночі",
    sea_fabricator: "Підводна фабрика", twin_sun_planet: "Планета двох сонць", sky_city: "Місто над хмарами",
    stadium: "Футбольний стадіон", neon_rooftops: "Нічне неонове місто", night_harbor: "Морський порт",
    pirate_bay: "Піратська бухта", treasury: "Скарбниця", orbit_view: "Орбіта",
    dragon_lair: "Лігво дракона", pixel_cave: "Рудна печера", knight_castle: "Лицарський замок",
    pixel_snow: "Сніжні гори", pixel_ocean: "Інопланетний океан", pixel_desert: "Пустеля",
    pixel_islands: "Парящі острови", black_hole: "Чорна діра", sky_citadel: "Небесна цитадель",
    pixel_nether: "Вогняний світ"
};

BackgroundRenderer.worldName = function (theme) {
    return WORLD_NAMES[theme] || "";
};

// Вид фінішу кожного світу
const FINISH_BY_THEME = {
    pirate_bay: "chest", treasury: "chest", pixel_desert: "chest",
    knight_castle: "gate", sky_citadel: "gate", dragon_lair: "gate", pixel_cave: "gate", crystal_cave: "gate",
    orbit_view: "portal", black_hole: "portal", pixel_islands: "portal", cosmodrome: "portal", twin_sun_planet: "portal",
    stadium: "goal",
    dino_valley: "egg",
    pixel_nether: "demon"
};

// Фініш у стилі світу. open — від 0 (далеко) до 1 (кубик на фініші)
BackgroundRenderer.renderFinishGate = function (ctx, theme, x, gY, open, time) {
    const type = FINISH_BY_THEME[theme] || "flag";
    ctx.save();
    if (type === "chest") {
        // Скриня відчиняється, з неї летять монети
        ctx.fillStyle = "#8a4b1c";
        ctx.fillRect(x - 30, gY - 36, 60, 36);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(x - 24, gY - 36, 8, 36);
        ctx.fillRect(x + 16, gY - 36, 8, 36);
        const lid = open * 1.9;
        ctx.save();
        ctx.translate(x - 30, gY - 36);
        ctx.rotate(-lid);
        ctx.fillStyle = "#a35d25";
        ctx.fillRect(0, -16, 60, 16);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(6, -16, 8, 16);
        ctx.fillRect(46, -16, 8, 16);
        ctx.restore();
        ctx.fillStyle = "#ffd84a";
        ctx.fillRect(x - 5, gY - 30, 10, 12);
        if (open > 0.5) {
            const k = (open - 0.5) * 2;
            ctx.fillStyle = "rgba(255, 220, 80, " + (0.35 * k).toFixed(3) + ")";
            ctx.fillRect(x - 40, gY - 110, 80, 76);
            for (let i = 0; i < 8; i++) {
                const a = -Math.PI / 2 + (i - 3.5) * 0.25;
                const r = 30 + k * 60 + (i % 3) * 8;
                ctx.fillStyle = i % 2 === 0 ? "#ffd700" : "#fff2a0";
                ctx.fillRect(x + Math.cos(a) * r - 4, gY - 40 + Math.sin(a) * r - 4, 8, 8);
            }
        }
    } else if (type === "gate") {
        // Замкова брама, решітка піднімається
        ctx.fillStyle = "#555a70";
        ctx.fillRect(x - 46, gY - 130, 20, 130);
        ctx.fillRect(x + 26, gY - 130, 20, 130);
        ctx.fillRect(x - 46, gY - 146, 92, 20);
        for (let k = 0; k < 5; k++) {
            ctx.fillRect(x - 46 + k * 20, gY - 158, 12, 12);
        }
        ctx.fillStyle = "#0c0a10";
        ctx.fillRect(x - 26, gY - 126, 52, 126);
        const lift = open * 110;
        ctx.fillStyle = "#3a3f52";
        for (let k = 0; k < 5; k++) {
            ctx.fillRect(x - 24 + k * 12, gY - 126, 4, 126 - lift);
        }
        for (let k = 0; k < 6; k++) {
            const y = gY - 120 + k * 22 - lift;
            if (y > gY - 126) {
                ctx.fillRect(x - 26, y, 52, 4);
            }
        }
        ctx.fillStyle = "rgba(255, 200, 80, " + (0.25 * open).toFixed(3) + ")";
        ctx.fillRect(x - 26, gY - 126, 52, 126);
    } else if (type === "portal") {
        // Кружляючий портал, що розкривається
        const r = 40 + open * 24;
        for (let k = 0; k < 4; k++) {
            ctx.strokeStyle = ["#b35cff", "#5cc8ff", "#ff4fd8", "#ffffff"][k];
            ctx.lineWidth = 4;
            ctx.beginPath();
            const rot = time * (2 + k * 0.7) * (k % 2 === 0 ? 1 : -1);
            const rk = Math.max(1, r - k * 6);
            ctx.ellipse(x, gY - 70, rk, rk * 1.6, 0, rot, rot + Math.PI * 1.3);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(180, 120, 255, " + (0.2 + 0.4 * open).toFixed(3) + ")";
        ctx.beginPath();
        ctx.ellipse(x, gY - 70, r * 0.6, r * 1.0, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === "goal") {
        // Ворота: м'яч залітає в сітку, коли кубик фінішує
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 6, gY - 110, 6, 110);
        ctx.fillRect(x - 6, gY - 110, 70, 6);
        ctx.fillRect(x + 60, gY - 110, 6, 110);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 1; k < 6; k++) {
            ctx.moveTo(x + k * 11, gY - 104);
            ctx.lineTo(x + k * 11, gY);
            ctx.moveTo(x, gY - 104 + k * 18);
            ctx.lineTo(x + 60, gY - 104 + k * 18);
        }
        ctx.stroke();
        if (open > 0.3) {
            const k = (open - 0.3) / 0.7;
            const bx = x - 120 + k * 150;
            const by = gY - 20 - Math.sin(k * Math.PI) * 70;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bx - 9, by - 9, 18, 18);
            ctx.fillStyle = "#111111";
            ctx.fillRect(bx - 3, by - 3, 6, 6);
            if (k > 0.9) {
                ctx.fillStyle = "#ffe14d";
                ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("ГОЛ!", x + 30, gY - 130);
            }
        }
    } else if (type === "demon") {
        // Голова демона розсипається на пікселі
        const pieces = 6;
        const blast = Math.max(0, open - 0.5) * 2;
        for (let i = 0; i < pieces; i++) {
            for (let j = 0; j < pieces; j++) {
                const px = x - 48 + i * 16;
                const py = gY - 150 + j * 16;
                const dx = (i - 2.5) * blast * 30;
                const dy = (j - 2.5) * blast * 30 - blast * 20;
                const isEye = j === 2 && (i === 1 || i === 4);
                const isMouth = j === 4 && i > 0 && i < 5;
                ctx.fillStyle = isEye ? "#ffea00" : isMouth ? "#4a0000" : (i + j) % 2 === 0 ? "#3a0d0a" : "#2a0805";
                ctx.globalAlpha = 1 - blast;
                ctx.fillRect(px + dx, py + dy, 16, 16);
            }
        }
        ctx.globalAlpha = 1 - blast;
        ctx.fillStyle = "#ff6a00";
        ctx.beginPath();
        ctx.moveTo(x - 48, gY - 150);
        ctx.lineTo(x - 60, gY - 190);
        ctx.lineTo(x - 30, gY - 150);
        ctx.moveTo(x + 48, gY - 150);
        ctx.lineTo(x + 60, gY - 190);
        ctx.lineTo(x + 30, gY - 150);
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (type === "egg") {
        // Велике яйце динозавра тріскає, і з нього визирає динозаврик
        const crack = Math.min(1, open * 1.4);
        const shake = open > 0.4 && open < 0.95 ? Math.sin(time * 40) * 2 : 0;
        const hatched = open > 0.85;
        ctx.translate(shake, 0);
        ctx.fillStyle = "#f4ecd8";
        const rows = [[-16, 16, 0], [-24, 24, 12], [-28, 28, 24], [-30, 30, 36], [-30, 30, 48], [-28, 28, 60], [-22, 22, 72]];
        for (const r of rows) {
            if (hatched && r[2] < 30) {
                continue;
            }
            ctx.fillRect(x + r[0], gY - 84 + r[2], r[1] - r[0], 12);
        }
        ctx.fillStyle = "#7ab85a";
        ctx.fillRect(x - 18, gY - 60, 8, 8);
        ctx.fillRect(x + 10, gY - 40, 10, 10);
        ctx.fillRect(x - 8, gY - 24, 8, 8);
        if (crack > 0.1) {
            ctx.fillStyle = "#5a4a3a";
            const n = Math.round(crack * 7);
            for (let k = 0; k < n; k++) {
                ctx.fillRect(x - 24 + k * 7, gY - 58 + (k % 2 === 0 ? 0 : 5), 7, 3);
            }
        }
        if (hatched) {
            const up = Math.min(1, (open - 0.85) / 0.15);
            // Верхня половинка шкаралупи злітає
            ctx.fillStyle = "#f4ecd8";
            ctx.fillRect(x - 24 + up * 30, gY - 96 - up * 40, 48, 30);
            ctx.fillStyle = "#6ab84a";
            ctx.fillRect(x - 12, gY - 58 - up * 22, 24, 22);
            ctx.fillRect(x + 6, gY - 66 - up * 22, 16, 12);
            ctx.fillStyle = "#111111";
            ctx.fillRect(x + 12, gY - 62 - up * 22, 4, 4);
        }
    } else {
        // Картатий фінішний прапор, що майорить
        ctx.fillStyle = "#39ff88";
        ctx.fillRect(x - 3, gY - 170, 6, 170);
        const cell = 10;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 6; c++) {
                const wave = Math.sin(time * 6 + c * 0.7) * 4;
                ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#111111";
                ctx.fillRect(x + 3 + c * cell, gY - 168 + r * cell + wave, cell, cell);
            }
        }
        ctx.fillStyle = "rgba(57, 255, 136, " + (0.15 + 0.35 * open).toFixed(3) + ")";
        ctx.fillRect(x - 20, gY - 170, 40, 170);
    }
    ctx.restore();
};

// ---------- Погода, яка змінюється від спроби до спроби ----------

// Світи просто неба, де може бути дощ, туман або сніг
const WEATHER_THEMES = new Set([
    "block_village", "jungle_temple", "sunset_city", "neon_highway", "digital_forest", "pixel_night", "secret_base",
    "sky_city", "stadium", "night_harbor", "dino_valley", "luna_park", "pirate_bay", "knight_castle", "pixel_snow",
    "pixel_desert", "twin_sun_planet", "cosmodrome"
]);

// Вибір погоди для спроби (рушій викликає під час скидання рівня)
BackgroundRenderer.pickWeather = function (theme) {
    if (!WEATHER_THEMES.has(theme)) {
        return "clear";
    }
    const roll = Math.random();
    if (theme === "pixel_snow") {
        return roll < 0.35 ? "fog" : "clear";
    }
    if (theme === "pixel_desert") {
        return roll < 0.35 ? "sandstorm" : "clear";
    }
    if (roll < 0.5) {
        return "clear";
    }
    if (roll < 0.7) {
        return "rain";
    }
    if (roll < 0.85) {
        return "fog";
    }
    return "snow";
};

const _fogCache = {};

function getFogBand(color) {
    if (_fogCache[color]) {
        return _fogCache[color];
    }
    const c = makeCanvas(1, 64);
    const cx = c.getContext("2d");
    const g = cx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(" + color + ", 0)");
    g.addColorStop(0.6, "rgba(" + color + ", 0.35)");
    g.addColorStop(1, "rgba(" + color + ", 0.5)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 1, 64);
    _fogCache[color] = c;
    return c;
}

BackgroundRenderer.renderWeather = function (ctx, weather, W, H, gY, time) {
    if (!weather || weather === "clear") {
        return;
    }
    const B = pixelBlockSize(H);
    if (weather === "rain") {
        drawFallingPixels(ctx, W, gY, time, 90, 9001, {
            color: "#a8c4ff", dir: 1, speedMin: 500, speedMax: 700, sizeMin: 1, sizeMax: 2,
            sway: 0, swayAmp: 0, alpha: 0.45, stretch: 9
        });
        ctx.fillStyle = "rgba(20, 30, 60, 0.18)";
        ctx.fillRect(0, 0, W, gY);
    } else if (weather === "snow") {
        drawFallingPixels(ctx, W, gY, time, 80, 9002, {
            color: "#ffffff", dir: 1, speedMin: 25, speedMax: 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
            sway: 1.3, swayAmp: B * 0.6, alpha: 0.85
        });
    } else if (weather === "fog" || weather === "sandstorm") {
        const color = weather === "fog" ? "200, 210, 230" : "230, 190, 120";
        const band = getFogBand(color);
        const drift = Math.sin(time * 0.3) * 0.05;
        ctx.drawImage(band, 0, gY * (0.25 + drift), W, gY * (0.75 - drift));
        if (weather === "sandstorm") {
            drawFallingPixels(ctx, W, gY, time, 60, 9003, {
                color: "#ffe0a0", dir: 1, speedMin: 5, speedMax: 12, sizeMin: 2, sizeMax: 3,
                sway: 1.5, swayAmp: W * 0.5, alpha: 0.6
            });
        }
    }
};

export { FINISH_BY_THEME, WEATHER_THEMES, WORLD_NAMES };
