// backgrounds/effects.js — реакція фону на гру (_fx), пасхалки, серпанок, земля під шипами

import { EGG_BY_THEME, EGG_DRAWERS } from "../easter_eggs.js";
import { BackgroundRenderer } from "./core.js";
import { makeCanvas, pixelBlockSize, pixelRng } from "./helpers.js";

// ---------- Реакція фону на гру, пасхалки, серпанок і земля в стилі світу ----------

// Стан гри, який передає рушій перед малюванням фону
let _fx = { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0, oops: 0 };

// Світи просто неба: до кінця рівня в них настає ніч
const DUSK_THEMES = new Set(["block_village", "night_harbor", "dino_valley", "sunset_city", "pirate_bay", "pixel_desert", "neon_highway", "sky_city", "twin_sun_planet", "stadium"]);

// Тип землі під шипами
const GROUND_BY_THEME = {
    pixel_night: "grass", digital_forest: "grass", dino_valley: "grass", block_village: "grass", jungle_temple: "grass", storm_sky: "grass", stadium: "turf", twin_sun_planet: "alien",
    pixel_snow: "snow",
    pixel_desert: "sand", pirate_bay: "sand", pixel_ocean: "sand",
    pixel_cave: "stone", crystal_cave: "stone", dragon_lair: "stone", knight_castle: "stone", treasury: "stone",
    sky_citadel: "cloud",
    pixel_nether: "lava"
};

// Яка пасхалка у світі (для підпису в preview)
BackgroundRenderer.easterEggType = function (theme) {
    const egg = EGG_BY_THEME[theme];
    return egg ? egg.name : "Комета";
};

BackgroundRenderer.setEffects = function (fx) {
    _fx = fx || { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0, oops: 0, letter: null };
};

// Ефекти поверх сцени: ніч, що настає, спалах «Ідеально», світіння серії, серпанок біля землі
BackgroundRenderer.renderSceneEffects = function (ctx, bgTheme, W, H, groundY, time, accentColor) {
    const gY = Math.round(groundY);
    if (DUSK_THEMES.has(bgTheme) && _fx.progress > 0.05) {
        const night = Math.min(1, _fx.progress);
        ctx.fillStyle = "rgba(8, 6, 40, " + (0.38 * night).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        // Зорі проступають на темнішому небі
        const rng = pixelRng(4242);
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 40; i++) {
            const x = rng() * W;
            const y = rng() * gY * 0.45;
            const tw = Math.sin(time * (1 + rng() * 2) + i) * 0.5 + 0.5;
            ctx.globalAlpha = night * (0.3 + 0.6 * tw);
            ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
        ctx.globalAlpha = 1;
    }
    this.renderStory(ctx, bgTheme, W, H, gY, time);
    this.renderWeather(ctx, _fx.weather, W, H, gY, time);
    // Серпанок біля землі додає глибини. Градієнти намальовані заздалегідь у крихітні
    // буфери й лише розтягуються — це в рази дешевше, ніж градієнт на пів екрана щокадру
    const grads = getEffectGradients(accentColor || "#00f6ff");
    const hazeH = Math.round(H * 0.18);
    ctx.drawImage(grads.haze, 0, gY - hazeH, W, hazeH);
    // Серія «Ідеально»: світіння по краях кольором рівня
    if (_fx.combo >= 3) {
        ctx.globalAlpha = Math.min(1, (_fx.combo - 2) * 0.14);
        ctx.drawImage(grads.edges, 0, 0, W, gY);
        ctx.globalAlpha = 1;
    }
    // Спалах «Ідеально»
    if (_fx.perfect > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.12 * _fx.perfect).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
    }
    if (_fx.eggT !== null && _fx.eggT >= 0 && _fx.eggT <= 1) {
        const egg = EGG_BY_THEME[bgTheme];
        this.renderEasterEgg(ctx, egg ? egg.key : "comet", _fx.eggT, W, H, gY, time);
    }
};

// Кеш маленьких буферів-градієнтів для кожного кольору рівня
const _effectGradients = {};

function getEffectGradients(accent) {
    if (_effectGradients[accent]) {
        return _effectGradients[accent];
    }
    const haze = makeCanvas(1, 64);
    const hx = haze.getContext("2d");
    const hg = hx.createLinearGradient(0, 0, 0, 64);
    hg.addColorStop(0, "rgba(0, 0, 0, 0)");
    hg.addColorStop(1, hexToRgba(accent, 0.16));
    hx.fillStyle = hg;
    hx.fillRect(0, 0, 1, 64);
    const edges = makeCanvas(64, 1);
    const ex = edges.getContext("2d");
    const eg = ex.createLinearGradient(0, 0, 64, 0);
    eg.addColorStop(0, hexToRgba(accent, 0.22));
    eg.addColorStop(0.15, "rgba(0, 0, 0, 0)");
    eg.addColorStop(0.85, "rgba(0, 0, 0, 0)");
    eg.addColorStop(1, hexToRgba(accent, 0.22));
    ex.fillStyle = eg;
    ex.fillRect(0, 0, 64, 1);
    _effectGradients[accent] = { haze: haze, edges: edges };
    return _effectGradients[accent];
}

function hexToRgba(hex, alpha) {
    const v = hex.replace("#", "");
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

// ---------- Пасхалки ----------

BackgroundRenderer.renderEasterEgg = function (ctx, type, t, W, H, gY, time) {
    const B = pixelBlockSize(H);
    const fade = Math.min(1, t * 6, (1 - t) * 6);
    ctx.save();
    ctx.globalAlpha = fade;
    // Унікальні пасхалки рівнів живуть в easter_eggs.js
    if (EGG_DRAWERS[type]) {
        EGG_DRAWERS[type](ctx, t, W, H, gY, time, B);
        ctx.restore();
        return;
    }
    if (type === "ufo") {
        const x = W * 1.1 - t * W * 1.3;
        const y = gY * 0.2 + Math.sin(time * 2) * B * 0.5;
        // Промінь
        if (Math.sin(time * 3) > -0.3) {
            ctx.fillStyle = "rgba(150, 255, 180, 0.18)";
            ctx.beginPath();
            ctx.moveTo(x - B * 0.8, y + B * 0.6);
            ctx.lineTo(x + B * 0.8, y + B * 0.6);
            ctx.lineTo(x + B * 2.5, y + B * 6);
            ctx.lineTo(x - B * 2.5, y + B * 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#9fb4c8";
        ctx.fillRect(x - B * 2, y, B * 4, B * 0.6);
        ctx.fillRect(x - B * 1.2, y - B * 0.3, B * 2.4, B * 0.3);
        ctx.fillStyle = "#7df9ff";
        ctx.fillRect(x - B * 0.7, y - B * 0.9, B * 1.4, B * 0.6);
        const blink = Math.floor(time * 6) % 3;
        const lights = ["#ff2ea6", "#ffe14d", "#39ff88"];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i === blink ? "#ffffff" : lights[i];
            ctx.fillRect(x - B * 1.4 + i * B * 1.2, y + B * 0.15, B * 0.3, B * 0.3);
        }
    } else if (type === "whale") {
        const x = W * 1.1 - t * W * 1.4;
        const y = gY * 0.55;
        ctx.fillStyle = "#2a5a8a";
        ctx.fillRect(x, y, B * 6, B * 2);
        ctx.fillRect(x + B * 0.5, y - B * 0.5, B * 4.5, B * 0.5);
        ctx.fillRect(x + B * 6, y + B * 0.3, B * 1.2, B);
        ctx.fillRect(x + B * 7, y - B * 0.4, B * 0.8, B * 1.8);
        ctx.fillStyle = "#c8dcef";
        ctx.fillRect(x + B * 0.3, y + B * 1.3, B * 4.5, B * 0.7);
        ctx.fillStyle = "#0a1a2a";
        ctx.fillRect(x + B * 1, y + B * 0.5, B * 0.35, B * 0.35);
        // Фонтан
        const spout = Math.max(0, Math.sin(t * Math.PI * 3));
        if (spout > 0.2) {
            ctx.fillStyle = "rgba(220, 245, 255, 0.8)";
            for (let k = 0; k < 4; k++) {
                ctx.fillRect(x + B * 2 + (k - 1.5) * B * 0.5 * spout, y - B * (1 + spout * 2) + Math.abs(k - 1.5) * B * 0.4, B * 0.35, B * 0.35);
            }
            ctx.fillRect(x + B * 2.1, y - B * 1.2 * spout - B * 0.5, B * 0.3, B * spout * 1.2);
        }
    } else if (type === "dragon") {
        const x = -B * 8 + t * (W + B * 16);
        const y = gY * 0.18 + Math.sin(t * Math.PI * 2) * B * 1.5;
        const flap = Math.sin(time * 8) > 0;
        ctx.fillStyle = "#1a3a1a";
        ctx.fillRect(x, y, B * 4, B * 1.2);
        ctx.fillRect(x + B * 4, y - B * 0.4, B * 1.4, B);
        ctx.fillRect(x - B * 2.5, y + B * 0.3, B * 2.5, B * 0.5);
        ctx.fillRect(x + B * 1, y + (flap ? -B * 2 : B * 1.2), B * 2, flap ? B * 2 : B * 1.2);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x + B * 4.8, y - B * 0.2, B * 0.3, B * 0.3);
        if (Math.sin(time * 1.5) > 0.6) {
            ctx.fillStyle = "#ff7a00";
            ctx.fillRect(x + B * 5.4, y, B * 2, B * 0.6);
            ctx.fillStyle = "#ffe14d";
            ctx.fillRect(x + B * 5.4, y + B * 0.15, B * 1.2, B * 0.3);
        }
    } else if (type === "meteors") {
        for (let i = 0; i < 7; i++) {
            const local = (t * 3 + i / 7) % 1;
            const sx = W * (0.2 + (i * 0.37) % 0.8) - local * W * 0.35;
            const sy = gY * 0.05 + local * gY * 0.5;
            for (let k = 0; k < 6; k++) {
                ctx.globalAlpha = fade * (1 - k / 6) * (1 - local * 0.5);
                ctx.fillStyle = k === 0 ? "#ffffff" : "#ffcc66";
                ctx.fillRect(Math.round(sx + k * B * 0.45), Math.round(sy - k * B * 0.3), Math.max(2, B / 4), Math.max(2, B / 4));
            }
        }
    } else if (type === "deer") {
        const x = W * 1.05 - t * W * 1.2;
        const leap = Math.abs(Math.sin(t * Math.PI * 6)) * B * 1.2;
        const y = gY - B * 2.2 - leap;
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(x, y, B * 2.2, B);
        ctx.fillRect(x - B * 0.3, y - B * 0.9, B * 0.8, B * 1.2);
        ctx.fillStyle = "#c8a070";
        ctx.fillRect(x + B * 1.8, y - B * 0.1, B * 0.4, B * 0.4);
        ctx.fillStyle = "#5a3a1a";
        const legs = Math.sin(time * 14) > 0 ? B * 0.3 : 0;
        ctx.fillRect(x + B * 0.2 + legs, y + B, B * 0.25, B * 1.1);
        ctx.fillRect(x + B * 1.7 - legs, y + B, B * 0.25, B * 1.1);
        ctx.fillRect(x - B * 0.5, y - B * 1.6, B * 0.2, B * 0.8);
        ctx.fillRect(x - B * 0.8, y - B * 1.6, B * 0.6, B * 0.2);
        ctx.fillRect(x + B * 0.1, y - B * 1.5, B * 0.2, B * 0.7);
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(x - B * 0.2, y - B * 0.7, B * 0.2, B * 0.2);
    } else if (type === "cat") {
        const x = W * 1.05 - t * W * 1.2;
        const y = gY - B * 1.1;
        const step = Math.sin(time * 16) > 0;
        ctx.fillStyle = "#ff9a3d";
        ctx.fillRect(x, y, B * 1.6, B * 0.7);
        ctx.fillRect(x - B * 0.6, y - B * 0.5, B * 0.8, B * 0.8);
        ctx.fillRect(x - B * 0.6, y - B * 0.75, B * 0.2, B * 0.25);
        ctx.fillRect(x - B * 0.05, y - B * 0.75, B * 0.2, B * 0.25);
        ctx.fillRect(x + B * 1.6, y - B * 0.5 + (step ? 0 : B * 0.15), B * 0.2, B * 0.7);
        ctx.fillStyle = "#c86a1a";
        ctx.fillRect(x + B * 0.4, y, B * 0.25, B * 0.7);
        ctx.fillRect(x + B * 0.9, y, B * 0.25, B * 0.7);
        ctx.fillStyle = "#ff9a3d";
        ctx.fillRect(x + B * (step ? 0.1 : 0.3), y + B * 0.7, B * 0.2, B * 0.4);
        ctx.fillRect(x + B * (step ? 1.2 : 1.0), y + B * 0.7, B * 0.2, B * 0.4);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x - B * 0.45, y - B * 0.3, B * 0.12, B * 0.12);
    } else if (type === "trex") {
        // Тиранозавр пробігає в глибині сцени
        const x = W * 1.05 - t * W * 1.3;
        const bob = Math.abs(Math.sin(time * 9)) * B * 0.3;
        const y = gY - B * 5 - bob;
        const step = Math.sin(time * 9) > 0;
        ctx.fillStyle = "#3a5a2a";
        ctx.fillRect(x, y, B * 3, B * 2.2);
        ctx.fillRect(x - B * 1.6, y - B * 1.4, B * 2.2, B * 1.6);
        ctx.fillRect(x + B * 3, y + B * 0.3, B * 2.5, B * 0.9);
        ctx.fillRect(x + B * 5.5, y + B * 0.7, B * 1.2, B * 0.5);
        ctx.fillRect(x - B * 0.2, y + B * 1.6, B * 0.8, B * 0.3);
        ctx.fillStyle = "#2a4a1f";
        ctx.fillRect(x + B * (step ? 0.4 : 1.2), y + B * 2.2, B * 0.7, B * 2.8 + bob);
        ctx.fillRect(x + B * (step ? 1.6 : 0.6), y + B * 2.2, B * 0.7, B * 2.8 + bob);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - B * 1.4, y - B * 0.1, B * 1.6, B * 0.2);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x - B * 0.9, y - B * 1.1, B * 0.3, B * 0.3);
    } else if (type === "balloons") {
        // Зв'язка повітряних кульок відлітає в небо
        const x = W * (0.35 + t * 0.4);
        const y = gY - t * gY * 1.1;
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
        for (let i = 0; i < 5; i++) {
            const bx = x + (i - 2) * B * 0.9 + Math.sin(time * 2 + i) * B * 0.2;
            const by = y - Math.abs(i - 2) * B * -0.4 - B * 2;
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillRect(Math.round(bx + B * 0.4), Math.round(by + B * 1.2), 1, Math.round(B * 1.8));
            ctx.fillStyle = colors[i];
            ctx.fillRect(Math.round(bx), Math.round(by), Math.round(B * 0.9), Math.round(B * 1.2));
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(Math.round(bx + B * 0.15), Math.round(by + B * 0.15), Math.round(B * 0.2), Math.round(B * 0.3));
        }
    } else {
        // Комета через небо
        const x = W * 1.1 - t * W * 1.3;
        const y = gY * 0.1 + t * gY * 0.25;
        for (let k = 0; k < 14; k++) {
            ctx.globalAlpha = fade * (1 - k / 14);
            ctx.fillStyle = k < 2 ? "#ffffff" : "#9fe8ff";
            const s = Math.max(2, B * (0.5 - k * 0.025));
            ctx.fillRect(Math.round(x + k * B * 0.5), Math.round(y - k * B * 0.12), s, s);
        }
    }
    ctx.restore();
};

// ---------- Земля під шипами в стилі світу ----------

BackgroundRenderer.renderGroundDetail = function (ctx, bgTheme, W, H, groundY, camX, accentColor) {
    const type = GROUND_BY_THEME[bgTheme];
    const gY = Math.round(groundY);
    const B = pixelBlockSize(H);
    const cell = Math.max(6, Math.round(B / 2));
    const offset = Math.round(camX) % (cell * 2);
    if (!type) {
        // Неонові світи: діагональні смуги, як раніше
        const step = 140;
        const off = camX % step;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -off; x <= W; x += step) {
            ctx.moveTo(x, gY + 6);
            ctx.lineTo(x - 28, gY + 34);
        }
        ctx.stroke();
        return;
    }
    const palettes = {
        grass: ["#2f7a22", "#44a332", "#4a3019", "#553820"],
        turf: ["#277a32", "#2f8a3a", "#1f5a26", "#ffffff"],
        alien: ["#6a3a8a", "#8a5aaa", "#3a1f4a", "#331a42"],
        snow: ["#f4f8ff", "#ffffff", "#8a94a8", "#7a8498"],
        sand: ["#e8c07a", "#f5d89a", "#c89a55", "#b8884a"],
        stone: ["#4a4a55", "#5a5a68", "#34343d", "#2e2e36"],
        cloud: ["#ffffff", "#f0eefa", "#ffd86a", "#e8c050"],
        lava: ["#7a2020", "#ff6a00", "#4a1010", "#551414"]
    };
    const p = palettes[type];
    // Верхній шар (трава, сніг, пісок…) і нижній шар із текстурою
    for (let x = -offset - cell * 2; x < W + cell * 2; x += cell) {
        const idx = Math.floor((x + Math.round(camX)) / cell);
        ctx.fillStyle = idx % 2 === 0 ? p[0] : p[1];
        ctx.fillRect(x, gY + 2, cell, cell * 0.8);
        ctx.fillStyle = (idx + 1) % 3 === 0 ? p[2] : p[3];
        ctx.fillRect(x, gY + 2 + cell * 0.8, cell, cell * 1.6);
        if (type === "turf" && idx % 6 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillRect(x, gY + 2 + cell * 0.2, cell, 2);
        }
        if (type === "lava" && idx % 5 === 0) {
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(x + cell * 0.3, gY + 2 + cell * 1.2, cell * 0.4, cell * 0.3);
        }
    }
    // Плавний перехід у темряву нижче
    const fade = ctx.createLinearGradient(0, gY + cell, 0, gY + cell * 3);
    fade.addColorStop(0, "rgba(7, 11, 28, 0)");
    fade.addColorStop(1, "rgba(7, 11, 28, 1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, gY + cell, W, cell * 2);
};

// Великі піксельні цифри 0–9 для табло
const BIG_DIGITS = [
    ["111", "101", "101", "101", "111"], ["010", "110", "010", "010", "111"], ["111", "001", "111", "100", "111"],
    ["111", "001", "111", "001", "111"], ["101", "101", "111", "001", "001"], ["111", "100", "111", "001", "111"],
    ["111", "100", "111", "101", "111"], ["111", "001", "010", "010", "010"], ["111", "101", "111", "101", "111"],
    ["111", "101", "111", "001", "111"]
];

function drawBigDigit(ctx, digit, x, y, px, color) {
    const rows = BIG_DIGITS[digit] || BIG_DIGITS[0];
    ctx.fillStyle = color;
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < 3; c++) {
            if (rows[r][c] === "1") {
                ctx.fillRect(Math.round(x + c * px), Math.round(y + r * px), Math.ceil(px), Math.ceil(px));
            }
        }
    }
}

export { DUSK_THEMES, GROUND_BY_THEME, _fx, drawBigDigit };
