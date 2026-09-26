// ============================================================
// game_constants.js — фізичні константи кубика й шипів, ефекти приземлення,
// вікна влучання та система балів
// ============================================================


// ---------- Фізичні константи ----------

const GRAVITY = 2600;
const MIN_JUMP_VELOCITY = 420;
const SAFE_MARGIN = 25;
const CUBE_SIZE = 42;
const SPIKE_W = 44;
const SPIKE_H = 48;
const PLAYER_ANCHOR = 0.28;
const TRAIL_MAX = 20;
const DEATH_DELAY = 1.2;
const DEMO_RESTART_DELAY = 1.4;
const PERFECT_FLASH_TIME = 0.35;
const EASTER_EGG_DURATION = 5000;
const SHAKE_TIME = 0.45;
const TITLE_TIME = 2.6;
// Реакція світу на помилку гравця (на рівні боса — рев демона)
const OOPS_TIME = 0.7;
// Гравітаційна гармата притягує шип до точки на стільки розмірів кубика попереду нього
const GRAVITY_PULL_AHEAD = 1.6;
const FINISH_OPEN_DISTANCE = 300;

// Реакція світу на приземлення кубика
const LANDING_FX = {
    pixel_ocean: { kind: "bubbles", colors: ["rgba(200, 240, 255, 0.9)", "rgba(150, 220, 255, 0.8)"] },
    night_harbor: { kind: "splash", colors: ["#bfe8ff", "#ffffff"] },
    sea_fabricator: { kind: "sparks", colors: ["#39c6ff", "#ffffff", "#ff9a3d"] },
    pirate_bay: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    digital_forest: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    pixel_night: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    block_village: { kind: "splash", colors: ["#5ab84a", "#6a4a2a"] },
    jungle_temple: { kind: "splash", colors: ["#3aa04a", "#ff5a8a"] },
    dino_valley: { kind: "splash", colors: ["#2f8a3a", "#4fb55a"] },
    sky_citadel: { kind: "splash", colors: ["#ffffff", "#ffe8a0"] },
    luna_park: { kind: "sparks", colors: ["#ff3355", "#ffe14d", "#39c6ff", "#ff5ad8"] },
    pixel_snow: { kind: "splash", colors: ["#ffffff", "#e6f7ff"] },
    pixel_desert: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    stadium: { kind: "splash", colors: ["#2f8a3a", "#4fb55a"] },
    pixel_cave: { kind: "pebbles", colors: ["#6a6a78", "#4a4a55"] },
    crystal_cave: { kind: "pebbles", colors: ["#b35cff", "#5a4a70"] },
    dragon_lair: { kind: "pebbles", colors: ["#5a3a2a", "#3a2a1a"] },
    sunset_city: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff", "#ffe14d"] },
    neon_rooftops: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff", "#39ff88"] },
    neon_highway: { kind: "sparks", colors: ["#ff2ea6", "#00f6ff"] },
    pixel_nether: { kind: "sparks", colors: ["#ff6a00", "#ffcc33"] },
    pumpkin_pastures: { kind: "splash", colors: ["#6a8a2a", "#ff9a3d"] },
    creeper_woods: { kind: "fireflies", colors: ["#c8ff5a", "#fff4a0"] },
    redstone_mines: { kind: "pebbles", colors: ["#ff3a2a", "#4a4650"] },
    alien_freighter: { kind: "sparks", colors: ["#ffcc33", "#ffffff"] },
    hunter_jungle: { kind: "splash", colors: ["#2a7a22", "#4a3a1a"] },
    soggy_swamp: { kind: "splash", colors: ["#3a5a2a", "#8ad86a"] },
    dungeon_depths: { kind: "pebbles", colors: ["#4a4852", "#2a2830"] },
    alien_hive: { kind: "splash", colors: ["#78ffbe", "#2a443c"] },
    desert_temple: { kind: "splash", colors: ["#e8c07a", "#f5d89a"] },
    fiery_forge: { kind: "sparks", colors: ["#ff7a2a", "#ffcc33"] },
    planet_colony: { kind: "splash", colors: ["#b8703a", "#8a5a2a"] },
    hunter_ship: { kind: "sparks", colors: ["#5aff9a", "#ffffff"] },
    obsidian_peak: { kind: "pebbles", colors: ["#2a1a3a", "#b06bff"] },
    hive_queen: { kind: "splash", colors: ["#78ffbe", "#2a443c"] },
    hangar_bay: { kind: "sparks", colors: ["#ffcc33", "#ffffff"] },
    sponge_reef: { kind: "bubbles", colors: ["rgba(220, 245, 255, 0.9)", "rgba(170, 230, 255, 0.8)"] },
    kaiju_bay: { kind: "splash", colors: ["#9ad0ff", "#ffffff"] },
    strange_town: { kind: "pebbles", colors: ["#6a4a2a", "#ffcc5a"] },
    leaf_village: { kind: "fireflies", colors: ["#7aff5a", "#ffe14d"] },
    ninja_temple: { kind: "fireflies", colors: ["#ffb0d0", "#ffe0ec"] },
    machine_war: { kind: "sparks", colors: ["#ff3a2a", "#ffcc33"] }
};

function spikeHalfWidth(type) {
    if (type === "double_spike") {
        return SPIKE_W * 0.45 + SPIKE_W / 2;
    }
    if (type === "saw") {
        return SPIKE_H * 0.6;
    }
    return SPIKE_W / 2;
}

function hitWindowTimes(levelId) {
    const t = (levelId - 1) / 30;
    return {
        okTime: 0.45 - 0.17 * t,
        perfectTime: 0.16 - 0.06 * t
    };
}

// ---------- Нова система балів ----------

// Колір очок (спливаючі «+150» і напис «Очки» вгорі) — бірюзовий, щоб не плутати із золотими монетами
const POINTS_COLOR = "#5ae8ff";

function calculateHitScore(isOkZone, config, isPerfect) {
    const base = isOkZone ? 100 : 80;
    const diffBonus = config.difficulty === "HARD" ? 50 : 0;
    const zoneBonus = config.hitWindow === "normal" ? 20 : 0;
    const speedBonus = config.speed === "fast" ? 40 : config.speed === "slow" ? -20 : 0;
    const perfectBonus = isPerfect ? 30 : 0;
    return Math.max(0, base + diffBonus + zoneBonus + speedBonus + perfectBonus);
}

function calculateMaxScores(spikeCount, hitWindow, speed) {
    const zoneBonus = hitWindow === "normal" ? 20 : 0;
    const speedBonus = speed === "fast" ? 40 : speed === "slow" ? -20 : 0;
    const easyPerHit = 100 + 0 + zoneBonus + speedBonus + 30;
    const hardPerHit = 100 + 50 + zoneBonus + speedBonus + 30;
    return {
        maxEasy: spikeCount * Math.max(0, easyPerHit),
        maxHard: spikeCount * Math.max(0, hardPerHit)
    };
}

const SPIKE_POP_DISTANCE = 140;
const SPIKE_CRUMBLE_TIME = 0.35;
// Бонус монет за слово без жодної помилки
const WORD_BONUS = 2;
// Бонус за комбінацію (склад, перекат, повтор) без жодної помилки
const COMBO_BONUS = 1;

export { COMBO_BONUS, CUBE_SIZE, DEATH_DELAY, DEMO_RESTART_DELAY, EASTER_EGG_DURATION, FINISH_OPEN_DISTANCE, GRAVITY, GRAVITY_PULL_AHEAD, LANDING_FX, MIN_JUMP_VELOCITY, OOPS_TIME, PERFECT_FLASH_TIME, PLAYER_ANCHOR, POINTS_COLOR, SAFE_MARGIN, SHAKE_TIME, SPIKE_CRUMBLE_TIME, SPIKE_H, SPIKE_POP_DISTANCE, SPIKE_W, TITLE_TIME, TRAIL_MAX, WORD_BONUS, calculateHitScore, calculateMaxScores, hitWindowTimes, spikeHalfWidth };
