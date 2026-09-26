// ============================================================
// spike_styles.js — вигляд шипів під тему світу й клавіші-підказки над ними
// ============================================================

import { SPIKE_H, SPIKE_W } from "./game_constants.js";

// ---------- Стиль перешкод під світ рівня ----------

// Вигляд шипів змінюється під тему фону; розміри й зона зіткнення — ті самі
const SPIKE_STYLE_BY_THEME = {
    pixel_snow: "ice",
    pixel_desert: "cactus",
    pixel_ocean: "urchin",
    night_harbor: "urchin",
    pirate_bay: "urchin",
    knight_castle: "iron",
    sky_citadel: "iron",
    treasury: "iron",
    crystal_cave: "crystal",
    pixel_cave: "crystal",
    pixel_islands: "crystal",
    pixel_nether: "lava",
    dragon_lair: "lava",
    pixel_night: "pixel",
    digital_forest: "pixel",
    dino_valley: "pixel",
    block_village: "pixel",
    pumpkin_pastures: "pixel",
    creeper_woods: "pixel",
    hunter_jungle: "pixel",
    redstone_mines: "crystal",
    alien_freighter: "iron",
    dungeon_depths: "iron",
    soggy_swamp: "urchin",
    alien_hive: "urchin",
    desert_temple: "cactus",
    fiery_forge: "lava",
    planet_colony: "iron",
    hunter_ship: "crystal",
    obsidian_peak: "crystal",
    hive_queen: "urchin",
    hangar_bay: "iron",
    sponge_reef: "urchin",
    kaiju_bay: "crystal",
    strange_town: "iron",
    leaf_village: "iron",
    ninja_temple: "iron",
    machine_war: "iron"
};

// Основні кольори кожного стилю (для уламків, коли шип розсипається)
const SPIKE_STYLE_COLORS = {
    ice: ["#bfe9ff", "#ffffff", "#7cc8f0"],
    cactus: ["#2f8a3a", "#4fb55a", "#ffffff"],
    urchin: ["#6a2a8a", "#b06bff", "#e0c0ff"],
    iron: ["#6a7080", "#b8c0d0", "#40444f"],
    crystal: ["#b35cff", "#5cc8ff", "#e6bfff"],
    lava: ["#ff6a00", "#ffcc33", "#3a1a0a"],
    pixel: ["#ff2ea6", "#ffffff", "#4a1030"]
};

const KEYCAP_SIZE = 34;

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Один шип заданого стилю: основа в (0, 0), вершина в (0, -SPIKE_H)
function drawStyledSpikeShape(ctx, style, accent, time) {
    const hw = SPIKE_W / 2;
    const H = SPIKE_H;
    if (style === "ice") {
        ctx.fillStyle = "#7cc8f0";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#bfe9ff";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-3, -H + 6, 3, 12);
        ctx.strokeStyle = "#e6f7ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.stroke();
    } else if (style === "cactus") {
        ctx.fillStyle = "#2f8a3a";
        ctx.fillRect(-7, -H, 14, H);
        ctx.fillRect(-18, -H * 0.6, 7, H * 0.35);
        ctx.fillRect(-18, -H * 0.3, 14, 7);
        ctx.fillRect(11, -H * 0.8, 7, H * 0.4);
        ctx.fillRect(4, -H * 0.45, 14, 7);
        ctx.fillStyle = "#4fb55a";
        ctx.fillRect(-4, -H, 3, H);
        ctx.fillStyle = "#ffffff";
        const spines = [[-9, -H * 0.8], [9, -H * 0.65], [-9, -H * 0.4], [9, -H * 0.2], [-20, -H * 0.5], [20, -H * 0.7], [0, -H - 3]];
        for (const sp of spines) {
            ctx.fillRect(sp[0] - 1, sp[1] - 1, 3, 3);
        }
        ctx.strokeStyle = "#1a5a24";
        ctx.lineWidth = 2;
        ctx.strokeRect(-7, -H, 14, H);
    } else if (style === "urchin") {
        const r = 15;
        ctx.strokeStyle = "#e0c0ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            const len = i % 2 === 0 ? H - r : H * 0.6 - r;
            ctx.moveTo(Math.cos(a) * r, -r + Math.sin(a) * r);
            ctx.lineTo(Math.cos(a) * (r + len), -r + Math.sin(a) * (r + len));
        }
        ctx.stroke();
        ctx.fillStyle = "#6a2a8a";
        ctx.beginPath();
        ctx.arc(0, -r, r, Math.PI, 0);
        ctx.lineTo(r, 0);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b06bff";
        ctx.fillRect(-6, -r - 6, 4, 4);
        ctx.fillRect(3, -r - 2, 3, 3);
    } else if (style === "iron") {
        ctx.fillStyle = "#40444f";
        ctx.fillRect(-hw, -5, SPIKE_W, 5);
        ctx.fillStyle = "#6a7080";
        ctx.beginPath();
        ctx.moveTo(-hw + 6, -5);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw - 6, -5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b8c0d0";
        ctx.beginPath();
        ctx.moveTo(-hw + 6, -5);
        ctx.lineTo(0, -H);
        ctx.lineTo(-3, -5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d8dce8";
        ctx.fillRect(-hw + 3, -4, 3, 3);
        ctx.fillRect(hw - 6, -4, 3, 3);
    } else if (style === "crystal") {
        const shards = [[-10, 0.7, "#5cc8ff", "#c8f0ff"], [8, 0.8, "#ff4fd8", "#ffc0f0"], [0, 1, "#b35cff", "#e6bfff"]];
        for (const sh of shards) {
            const h = H * sh[1];
            ctx.fillStyle = sh[2];
            ctx.beginPath();
            ctx.moveTo(sh[0] - 8, 0);
            ctx.lineTo(sh[0] - 6, -h * 0.75);
            ctx.lineTo(sh[0], -h);
            ctx.lineTo(sh[0] + 6, -h * 0.75);
            ctx.lineTo(sh[0] + 8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = sh[3];
            ctx.beginPath();
            ctx.moveTo(sh[0] - 6, -h * 0.75);
            ctx.lineTo(sh[0], -h);
            ctx.lineTo(sh[0] - 1, -h * 0.2);
            ctx.closePath();
            ctx.fill();
        }
    } else if (style === "lava") {
        const glow = 0.6 + 0.4 * Math.sin(time * 0.006);
        ctx.fillStyle = "#2a120a";
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(0, -H);
        ctx.lineTo(hw, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, " + Math.round(110 + 90 * glow) + ", 0, " + glow.toFixed(2) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -H + 4);
        ctx.lineTo(-4, -H * 0.6);
        ctx.lineTo(3, -H * 0.4);
        ctx.lineTo(-6, 0);
        ctx.moveTo(-4, -H * 0.6);
        ctx.lineTo(-12, -H * 0.25);
        ctx.moveTo(3, -H * 0.4);
        ctx.lineTo(12, -H * 0.15);
        ctx.stroke();
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-2, -H, 4, 5);
    } else if (style === "pixel") {
        const b = 8;
        for (let row = 0; row < 6; row++) {
            const w = SPIKE_W - row * b * 0.9;
            ctx.fillStyle = row % 2 === 0 ? "#4a1030" : "#5a1438";
            ctx.fillRect(-w / 2, -(row + 1) * b, w, b);
        }
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let row = 0; row < 6; row++) {
            const w = SPIKE_W - row * b * 0.9;
            ctx.moveTo(-w / 2, -row * b);
            ctx.lineTo(-w / 2, -(row + 1) * b);
            ctx.lineTo(-w / 2 + b * 0.45, -(row + 1) * b);
            ctx.moveTo(w / 2, -row * b);
            ctx.lineTo(w / 2, -(row + 1) * b);
            ctx.lineTo(w / 2 - b * 0.45, -(row + 1) * b);
        }
        ctx.stroke();
    }
}

// Клавіша з літерою над перешкодою — як на справжній клавіатурі
function drawKeycap(ctx, cx, bottomY, letter, state) {
    const s = KEYCAP_SIZE;
    const x = cx - s / 2;
    const y = bottomY - s;
    const depth = 5;
    const colors = {
        idle: { top: "#2a2f45", side: "#141726", border: "rgba(160, 170, 210, 0.55)", text: "#e8ecf8" },
        target: { top: "#3a3f5c", side: "#1a1d30", border: "#ffe14d", text: "#ffe14d" },
        ok: { top: "#123a44", side: "#08222a", border: "#00f6ff", text: "#ffffff" },
        perfect: { top: "#12442a", side: "#082a18", border: "#39ff88", text: "#ffffff" }
    }[state];
    ctx.fillStyle = colors.side;
    roundedRectPath(ctx, x, y + depth, s, s, 6);
    ctx.fill();
    ctx.fillStyle = colors.top;
    roundedRectPath(ctx, x, y, s, s, 6);
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = state === "idle" ? 1.5 : 2.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    roundedRectPath(ctx, x + 3, y + 3, s - 6, s * 0.35, 4);
    ctx.fill();
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(5, 5, 20, 0.85)";
    ctx.strokeText(letter, cx, y + s / 2 + 1);
    ctx.fillStyle = colors.text;
    ctx.fillText(letter, cx, y + s / 2 + 1);
}

export { SPIKE_STYLE_BY_THEME, SPIKE_STYLE_COLORS, drawKeycap, drawStyledSpikeShape, roundedRectPath };
