// ============================================================
// engine.js — ігрова логіка
// 5 ліг, 31 рівень, процедурні фони, 3 типи перешкод,
// SaveManager (localStorage), частинки, trail, демо-режим
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";

// ---------- Детермінований PRNG (фіксовані траси) ----------

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------- Конфігурація 5 ліг та 31 рівня ----------

export const LEVELS_CONFIG = [
    {
        id: 1,
        name: "Базова",
        levels: [
            { id: 1,  leagueId: 1, name: "Перші кроки",             letters: ["А","О","В","Л"], speed: 165, spikeCount: 12, seed: 2001, bgTheme: "cyber_grid",              accentColor: "#00f6ff", rhythmGroups: false },
            { id: 2,  leagueId: 1, name: "Голосний старт",          letters: ["У","К","Е","П"], speed: 172, spikeCount: 13, seed: 2002, bgTheme: "parallax_city",             accentColor: "#aa44ff", rhythmGroups: false },
            { id: 3,  leagueId: 1, name: "Ближче до країв",         letters: ["Ф","І","Д","Ж"], speed: 179, spikeCount: 14, seed: 2003, bgTheme: "starfield",                 accentColor: "#00d4aa", rhythmGroups: false },
            { id: 4,  leagueId: 1, name: "Нижній лівий фланг",     letters: ["Я","Ч","С","М"], speed: 186, spikeCount: 15, seed: 2004, bgTheme: "energy_grid",             accentColor: "#6a5acd", rhythmGroups: false },
            { id: 5,  leagueId: 1, name: "Ліва вертикаль",          letters: ["Й","Ц","Ф","І","Я","Ч"], speed: 193, spikeCount: 16, seed: 2005, bgTheme: "cyber_columns",         accentColor: "#0066ff", rhythmGroups: false,          accentColor: "#0066ff", rhythmGroups: false },
            { id: 6,  leagueId: 1, name: "Права вертикаль",         letters: ["Ш","Щ","З","Х","Ї","Ґ"], speed: 200, spikeCount: 17, seed: 2006, bgTheme: "geo_landscape",     accentColor: "#00ff41", rhythmGroups: false },
            { id: 7,  leagueId: 1, name: "Ядро клавіатури",         letters: ["Е","Н","А","П","И","Т"], speed: 207, spikeCount: 18, seed: 2007, bgTheme: "pulsar_core",            accentColor: "#ff8855", rhythmGroups: false,              accentColor: "#ff8855", rhythmGroups: false },
            { id: 8,  leagueId: 1, name: "Нижній правий фланг",     letters: ["И","Т","Ь","Б","Ю","Є"], speed: 214, spikeCount: 19, seed: 2008, bgTheme: "demon",            accentColor: "#9944dd", rhythmGroups: false,           accentColor: "#9944dd", rhythmGroups: false,     accentColor: "#9944dd", rhythmGroups: false },
            { id: 9,  leagueId: 1, name: "Ліва діагональ",          letters: ["Й","У","І","В","Я","С"], speed: 221, spikeCount: 20, seed: 2009, bgTheme: "scanline_sweep",         accentColor: "#ff2ea6", rhythmGroups: false,        accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 10, leagueId: 1, name: "Права діагональ",         letters: ["Ш","Х","Л","Д","Ь","Б"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "hyperspace_tunnel",       accentColor: "#8899bb", rhythmGroups: false },
            { id: 11, leagueId: 1, name: "Шиплячий мікс",           letters: ["Ч","Щ","Ж","Ц","Ю","Ґ"], speed: 235, spikeCount: 22, seed: 2011, bgTheme: "toxic_waste",            accentColor: "#ccccee", rhythmGroups: false,      accentColor: "#ccccee", rhythmGroups: false },
            { id: 12, leagueId: 1, name: "Вокальний лабіринт",      letters: ["У","Е","А","О","И","І"], speed: 242, spikeCount: 23, seed: 2012, bgTheme: "neon_rain",          accentColor: "#39ff14", rhythmGroups: false },
            { id: 13, leagueId: 1, name: "Далекі куточки",          letters: ["Й","Ф","Я","Х","Ї","Є"], speed: 249, spikeCount: 24, seed: 2013, bgTheme: "bezier_waves",           accentColor: "#e5ff00", rhythmGroups: false },
            { id: 14, leagueId: 1, name: "Центральні сусіди",       letters: ["К","Г","Р","Л","М","Т"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "binary_star",      accentColor: "#ff3800", rhythmGroups: false,       accentColor: "#ff3800", rhythmGroups: false,         accentColor: "#ff3800", rhythmGroups: false },
            { id: 15, leagueId: 1, name: "Неонові крила",           letters: ["Й","Ц","Ф","Х","Ї","Ґ"], speed: 263, spikeCount: 26, seed: 2015, bgTheme: "aurora_wings",           accentColor: "#00f6ff", rhythmGroups: false,     accentColor: "#00f6ff", rhythmGroups: false },
            { id: 16, leagueId: 1, name: "Базовий тріумф",          letters: ["В","А","П","Р","О","Л"], speed: 270, spikeCount: 28, seed: 2016, bgTheme: "triumph_flare",          accentColor: "#39ff88", rhythmGroups: false,          accentColor: "#39ff88", rhythmGroups: false,         accentColor: "#39ff88", rhythmGroups: false }
        ]
    },
    {
        id: 2,
        name: "Середня",
        levels: [
            { id: 17, leagueId: 2, name: "Горизонт середнього ряду", letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж"], speed: 240, spikeCount: 26, seed: 2101, bgTheme: "midnight_skyline",       accentColor: "#bb55ff", rhythmGroups: false,     accentColor: "#bb55ff", rhythmGroups: false },
            { id: 18, leagueId: 2, name: "Дах клавіатури",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї"], speed: 250, spikeCount: 28, seed: 2102, bgTheme: "rooftop_grid",           accentColor: "#ff2ea6", rhythmGroups: false,      accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 19, leagueId: 2, name: "Нижній ярус",              letters: ["Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 255, spikeCount: 30, seed: 2103, bgTheme: "deep_abyss",             accentColor: "#00ff41", rhythmGroups: false,              accentColor: "#00ff41", rhythmGroups: false },
            { id: 20, leagueId: 2, name: "Лівий сектор",             letters: ["Й","Ф","Я","Ц","І","Ч","У","В","С","К","А","М"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "matrix_flow",       accentColor: "#ff8c00", rhythmGroups: false },
            { id: 21, leagueId: 2, name: "Екватор",                  letters: ["Е","П","И","Н","Р","Т","Г","О","Ь","Ш","Л","Б"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "equator_beam",           accentColor: "#7b68ee", rhythmGroups: false,     accentColor: "#7b68ee", rhythmGroups: false },
            { id: 22, leagueId: 2, name: "Правий загін",             letters: ["Щ","Д","Ю","З","Ж","Є","Х","Ї","Ґ"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "spore_field",   accentColor: "#ff2ea6", rhythmGroups: false,           accentColor: "#ff2ea6", rhythmGroups: false,            accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 23, leagueId: 2, name: "Парад голосних",           letters: ["А","О","У","І","И","Е","Я","Ю","Є","Ї"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "vowel_waves",            accentColor: "#00f6ff", rhythmGroups: false,            accentColor: "#00f6ff", rhythmGroups: false },
            { id: 24, leagueId: 2, name: "Тверді звуки",            letters: ["Й","К","Н","Г","Ш","З","Ф","В","П","Р","Л","Д"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "diamond_matrix", accentColor: "#ff2ea6", rhythmGroups: false,          accentColor: "#ff2ea6", rhythmGroups: false,        accentColor: "#ff2ea6", rhythmGroups: false }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "equalizer",             accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж","Я","Ч","С","М","И","Т","Ь","Б"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "waterfall_cascade", accentColor: "#6644ff", rhythmGroups: false,         accentColor: "#6644ff", rhythmGroups: false,           accentColor: "#6644ff", rhythmGroups: false },
            { id: 27, leagueId: 3, name: "Дворядний бар'єр",        letters: ["Й","Ц","У","К","Е","Н","Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 340, spikeCount: 46, seed: 2203, bgTheme: "barrier_wall",           accentColor: "#00f6ff", rhythmGroups: false,     accentColor: "#00f6ff", rhythmGroups: false },
            { id: 28, leagueId: 3, name: "Хаотичний мікс",          letters: ["А","О","П","Р","В","Л","І","Д","Ф","Ж","К","Е","Н","Г","У","Ш","Ц","Щ"], speed: 360, spikeCount: 50, seed: 2204, bgTheme: "glitch_field",           accentColor: "#7fff00", rhythmGroups: false,             accentColor: "#7fff00", rhythmGroups: false }
        ]
    },
    {
        id: 4,
        name: "Майстер",
        levels: [
            { id: 29, leagueId: 4, name: "Половина Всесвіту",       letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ"], speed: 390, spikeCount: 50, seed: 2301, bgTheme: "nebula_drift",           accentColor: "#e5ff00", rhythmGroups: false,         accentColor: "#e5ff00", rhythmGroups: false },
            { id: 30, leagueId: 4, name: "Гранд Мастер",            letters: ["К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ї","І","Ґ"], speed: 418, spikeCount: 55, seed: 2302, bgTheme: "grand_hex",              accentColor: "#ff4400", rhythmGroups: false,          accentColor: "#ff4400", rhythmGroups: false }
        ]
    },
    {
        id: 5,
        name: "Бос",
        levels: [
            { id: 31, leagueId: 5, name: "ФІНАЛЬНИЙ ДЕМОН",        letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ґ"], speed: 450, spikeCount: 60, seed: 2401, bgTheme: "inferno_core",  accentColor: "#ff1111", rhythmGroups: true,                  accentColor: "#ff1111", rhythmGroups: true }
        ]
    }
];

export const ALL_LEVELS = LEVELS_CONFIG.reduce(function (acc, league) {
    return acc.concat(league.levels);
}, []);

function getLevelById(levelId) {
    return ALL_LEVELS.find(function (l) { return l.id === levelId; }) ||
           ALL_LEVELS[0];
}

// ---------- Генерація фіксованої траси ----------

function reactionTimeForLevel(levelId) {
    const t = (levelId - 1) / 30;
    return 1.2 - 0.7 * t;
}

function pickObstacleType(rng, lastTypes) {
    const roll = rng();
    let type;
    if (roll < 0.50) {
        type = "spike";
    } else if (roll < 0.80) {
        type = "double_spike";
    } else {
        type = "saw";
    }
    if (lastTypes.length >= 2 && lastTypes[0] === "saw" && lastTypes[1] === "saw" && type === "saw") {
        type = rng() < 0.5 ? "spike" : "double_spike";
    }
    return type;
}

function generateTrack(level) {
    const rng = mulberry32(level.seed);
    const spikes = [];
    const baseGapTime = reactionTimeForLevel(level.id);
    let x = level.speed * 3.0;
    let lastLetter1 = null;
    let lastLetter2 = null;
    const lastTypes = [];

    function pickLetter() {
        let letter = level.letters[Math.floor(rng() * level.letters.length)];
        let guard = 0;
        while (letter === lastLetter1 && letter === lastLetter2 && guard < 10) {
            letter = level.letters[Math.floor(rng() * level.letters.length)];
            guard++;
        }
        lastLetter2 = lastLetter1;
        lastLetter1 = letter;
        return letter;
    }

    if (level.rhythmGroups) {
        let placed = 0;
        while (placed < level.spikeCount) {
            const groupSize = Math.min(
                2 + Math.floor(rng() * 3),
                level.spikeCount - placed
            );
            for (let i = 0; i < groupSize; i++) {
                const obstacleType = pickObstacleType(rng, lastTypes);
                lastTypes.push(obstacleType);
                if (lastTypes.length > 2) {
                    lastTypes.shift();
                }
                spikes.push({
                    x: x,
                    letter: pickLetter(),
                    state: "ahead",
                    type: obstacleType,
                    rotationAngle: 0
                });
                placed++;
                if (i < groupSize - 1) {
                    x += level.speed * 0.55;
                }
            }
            x += level.speed * (1.25 + rng() * 0.5);
        }
    } else {
        for (let i = 0; i < level.spikeCount; i++) {
            const obstacleType = pickObstacleType(rng, lastTypes);
            lastTypes.push(obstacleType);
            if (lastTypes.length > 2) {
                lastTypes.shift();
            }
            spikes.push({
                x: x,
                letter: pickLetter(),
                state: "ahead",
                type: obstacleType,
                rotationAngle: 0
            });
            x += level.speed * (baseGapTime + rng() * 0.55);
        }
    }

    const finishX = spikes[spikes.length - 1].x + level.speed * 2.5;
    return { spikes: spikes, finishX: finishX };
}

// ---------- SaveManager ----------

const SAVE_KEY = "dfp_save_v1";

function defaultSaveData() {
    const levels = {};
    for (const level of ALL_LEVELS) {
        levels[String(level.id)] = { bestPct: 0, highScore: 0 };
    }
    return {
        version: 1,
        settings: { difficulty: "EASY", hitWindow: "normal", speed: "normal" },
        progress: { unlocked: 1, levels: levels }
    };
}

function sanitizeSaveData(raw) {
    const clean = defaultSaveData();
    if (!raw || typeof raw !== "object" || raw.version !== 1) {
        return clean;
    }
    if (raw.settings && (raw.settings.difficulty === "EASY" || raw.settings.difficulty === "HARD")) {
        clean.settings.difficulty = raw.settings.difficulty;
    }
    if (raw.settings && (raw.settings.hitWindow === "normal" || raw.settings.hitWindow === "large")) {
        clean.settings.hitWindow = raw.settings.hitWindow;
    }
    if (raw.settings && (raw.settings.speed === "slow" || raw.settings.speed === "normal" || raw.settings.speed === "fast")) {
        clean.settings.speed = raw.settings.speed;
    }
    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            clean.progress.unlocked = Math.min(31, Math.max(1, Math.floor(unlocked)));
        }
        if (raw.progress.levels && typeof raw.progress.levels === "object") {
            for (const level of ALL_LEVELS) {
                const key = String(level.id);
                const entry = raw.progress.levels[key];
                if (entry && typeof entry === "object") {
                    const pct = Number(entry.bestPct);
                    const score = Number(entry.highScore);
                    if (Number.isFinite(pct)) {
                        clean.progress.levels[key].bestPct = Math.min(100, Math.max(0, Math.round(pct)));
                    }
                    if (Number.isFinite(score)) {
                        clean.progress.levels[key].highScore = Math.max(0, Math.round(score));
                    }
                }
            }
        }
    }
    return clean;
}

let saveData = null;

export const save = {
    load() {
        let raw = null;
        try {
            const text = localStorage.getItem(SAVE_KEY);
            if (text) {
                raw = JSON.parse(text);
            }
        } catch (err) {
            console.warn("Локальне сховище недоступне або пошкоджене — прогрес житиме лише в цьому сеансі.", err);
            raw = null;
        }
        saveData = sanitizeSaveData(raw);
        return {
            progress: saveData.progress,
            settings: saveData.settings
        };
    },

    persist() {
        if (!saveData) {
            saveData = defaultSaveData();
        }
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        } catch (err) {
            console.warn("Не вдалося записати прогрес у локальне сховище — він збережеться лише до закриття вкладки.", err);
        }
    },

    recordResult(levelId, pct, score) {
        if (!saveData) {
            this.load();
        }
        const key = String(levelId);
        const entry = saveData.progress.levels[key];
        if (!entry) {
            return;
        }
        const cleanPct = Math.min(100, Math.max(0, Math.round(pct)));
        const cleanScore = Math.max(0, Math.round(score));
        if (cleanPct > entry.bestPct) {
            entry.bestPct = cleanPct;
        }
        if (cleanScore > entry.highScore) {
            entry.highScore = cleanScore;
        }
        if (cleanPct === 100 && levelId < 31) {
            const currentLevel = getLevelById(levelId);
            if (currentLevel) {
                const currentLeague = LEVELS_CONFIG.find(function (lg) { return lg.id === currentLevel.leagueId; });
                if (currentLeague) {
                    const idxInLeague = currentLeague.levels.indexOf(currentLevel);
                    if (idxInLeague >= 0 && idxInLeague < currentLeague.levels.length - 1) {
                        const nextLevel = currentLeague.levels[idxInLeague + 1];
                        saveData.progress.unlocked = Math.max(saveData.progress.unlocked, nextLevel.id);
                    } else if (currentLeague.id < 5) {
                        const nextLeague = LEVELS_CONFIG[currentLeague.id];
                        if (nextLeague && nextLeague.levels.length > 0) {
                            saveData.progress.unlocked = Math.max(saveData.progress.unlocked, nextLeague.levels[0].id);
                        }
                    }
                }
            }
        }
        this.persist();
    },

    setDifficulty(difficulty) {
        if (!saveData) {
            this.load();
        }
        if (difficulty === "EASY" || difficulty === "HARD") {
            saveData.settings.difficulty = difficulty;
            this.persist();
        }
    },

    getDifficulty() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.difficulty;
    },

    setHitWindow(size) {
        if (!saveData) {
            this.load();
        }
        if (size === "normal" || size === "large") {
            saveData.settings.hitWindow = size;
            this.persist();
        }
    },

    getHitWindow() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.hitWindow || "normal";
    },

    setSpeed(speed) {
        if (!saveData) {
            this.load();
        }
        if (speed === "slow" || speed === "normal" || speed === "fast") {
            saveData.settings.speed = speed;
            this.persist();
        }
    },

    getSpeed() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.speed || "normal";
    },

    getProgress() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress;
    },

    getLastPlayable() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress.unlocked;
    }
};

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

function hitWindowTimes(levelId) {
    const t = (levelId - 1) / 30;
    return {
        okTime: 0.45 - 0.17 * t,
        perfectTime: 0.16 - 0.06 * t
    };
}

// ---------- Клас Engine ----------

export class Engine {
    constructor(levelId, difficulty, demoMode, hitWindow, speed, leagueInfo) {
        const SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 };
        this.level = { ...getLevelById(levelId) };
        this.effectiveSpeed = this.level.speed * (SPEED_MULTIPLIERS[speed] ?? 1.0);
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;
        this.leagueInfo = leagueInfo || null;
        const hitWindowSetting = hitWindow === "large" ? "large" : "normal";

        this.onJump = null;
        this.onExplode = null;
        this.onVictory = null;

        const windows = hitWindowTimes(this.level.id);
        const multiplier = hitWindowSetting === "large" ? 2 : 1;
        this.okPx = this.effectiveSpeed * windows.okTime * multiplier;
        this.perfectPx = this.effectiveSpeed * windows.perfectTime * multiplier;

        this.reset();
    }

    reset() {
        BackgroundRenderer.reset();
        const track = generateTrack(this.level);
        this.spikes = track.spikes;
        this.finishX = track.finishX;

        this.player = {
            x: 0,
            y: 0,
            vy: 0,
            onGround: true,
            rotation: 0,
            alive: true,
            trail: []
        };

        this.progressPct = 0;
        this.score = 0;
        this.combo = 0;
        this.particles = [];
        this.waves = [];
        this.ripples = [];
        this.pulse = 0;
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        this.jumpBuffer = null;
    }

    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x + SPIKE_W / 2 >= this.player.x) {
                return spike;
            }
        }
        return null;
    }

    getTargetLetter() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.letter : null;
    }

    getObstacleType() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.type : null;
    }

    getState() {
        return {
            levelId: this.level.id,
            progressPct: this.progressPct,
            score: this.score,
            combo: this.combo,
            alive: this.player.alive
        };
    }

    getOutcome() {
        return this.outcome;
    }

    consumeJumpBuffer() {
        if (this.jumpBuffer === null) {
            return;
        }
        const spike = this.jumpBuffer;
        this.jumpBuffer = null;
        if (spike.state !== "ahead") {
            return;
        }
        const gap = spike.x - this.player.x;
        if (gap > 0 && gap <= this.okPx) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            spike.state = "cleared";
            this.score += 10 + (perfect ? 5 : 0);
            const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
            this.jump(distance, perfect);
        }
    }

    jump(distance, perfect) {
        const computedVy = GRAVITY * distance / (2 * this.effectiveSpeed);
        this.player.vy = computedVy > MIN_JUMP_VELOCITY ? computedVy : MIN_JUMP_VELOCITY;
        this.player.onGround = false;
        this.pulse = 1;
        if (perfect) {
            this.combo++;
        } else {
            this.combo = 0;
        }
        this.waves.push({ r: 10, alpha: 0.8 });
        if (typeof this.onJump === "function") {
            this.onJump();
        }
    }

    explode() {
        if (!this.player.alive) {
            return;
        }
        this.jumpBuffer = null;
        this.player.alive = false;
        this.deathTimer = 0;
        this.combo = 0;
        const isDemon = this.level.bgTheme === "demon";
        const palette = isDemon
            ? ["#ff1111", "#ff4400", "#ffe14d"]
            : ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
        const count = isDemon ? 35 : 17;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
        BackgroundRenderer.createParticles(gameX, gameY, count, palette);
        if (typeof this.onExplode === "function") {
            this.onExplode();
        }
    }

    handleLetter(letter) {
        if (this.demoMode || !this.player.alive || this.outcome !== "running") {
            return { result: "no_target", letter: letter };
        }
        const upperLetter = letter.toUpperCase();
        const spike = this.nearestAheadSpike();
        if (!spike) {
            if (this.difficulty === "HARD") {
                this.explode();
                return { result: "exploded", letter: letter };
            }
            return { result: "no_target", letter: letter };
        }
        const gap = spike.x - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = upperLetter === spike.letter.toUpperCase();

        if (correct && !this.player.onGround) {
            this.jumpBuffer = spike;
            return { result: "correct", letter: letter };
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            spike.state = "cleared";
            this.score += 10 + (perfect ? 5 : 0);
            const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        if (this.difficulty === "HARD") {
            this.explode();
            return { result: "exploded", letter: letter };
        }

        const inPool = this.level.letters.some(function (l) { return l.toUpperCase() === upperLetter; });
        if (!inPool) {
            return { result: "wrong", letter: letter };
        }
        return { result: "wrong", letter: letter };
    }

    update(dt) {
        if (this.outcome === "won") {
            return;
        }

        this.pulse = Math.max(0, this.pulse - dt * 2.2);
        for (const wave of this.waves) {
            wave.r += dt * 620;
            wave.alpha -= dt * 1.1;
        }
        this.waves = this.waves.filter(function (w) { return w.alpha > 0; });

        BackgroundRenderer.updateParticles(dt);

        if (!this.player.alive) {
            this.deathTimer += dt;
            if (this.demoMode) {
                this.demoRestartTimer += dt;
                if (this.demoRestartTimer >= DEMO_RESTART_DELAY) {
                    this.reset();
                }
            } else if (this.deathTimer >= DEATH_DELAY) {
                this.outcome = "dead";
            }
            return;
        }

        this.player.x += this.effectiveSpeed * dt;

        if (!this.player.onGround) {
            this.player.vy -= GRAVITY * dt;
            this.player.y += this.player.vy * dt;
            this.player.rotation += dt * 7.5;
            if (this.player.y <= 0) {
                this.player.y = 0;
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.rotation = 0;
                this.consumeJumpBuffer();
            }
        }

        this.trailTick += dt;
        if (this.trailTick >= 0.016) {
            this.trailTick = 0;
            this.player.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.55 });
            if (this.player.trail.length > TRAIL_MAX) {
                this.player.trail.shift();
            }
        }
        for (const point of this.player.trail) {
            point.alpha -= dt * 1.4;
        }
        this.player.trail = this.player.trail.filter(function (t) { return t.alpha > 0; });

        if (this.demoMode) {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5) {
                    target.state = "cleared";
                    const distance = gap + SPIKE_W / 2 + SAFE_MARGIN;
                    this.jump(distance, true);
                }
            }
        }

        if (!this.demoMode && this.difficulty === "HARD") {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - this.player.x;
                if (gap <= SPIKE_W * 0.5 + CUBE_SIZE * 0.4) {
                    this.explode();
                    return;
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.state !== "ahead") {
                continue;
            }
            const dx = Math.abs(spike.x - this.player.x);
            if (dx < (SPIKE_W + CUBE_SIZE) * 0.32 && this.player.y < SPIKE_H * 0.72) {
                spike.state = "hit";
                this.explode();
                return;
            }
            if (spike.x + SPIKE_W / 2 < this.player.x) {
                spike.state = "cleared";
            }
        }

        for (const spike of this.spikes) {
            if (spike.type === "saw" && spike.state === "ahead") {
                spike.rotationAngle += this.effectiveSpeed * 0.02 * dt;
            }
        }

        this.progressPct = Math.min(100, (this.player.x / this.finishX) * 100);
        if (this.player.x >= this.finishX) {
            this.progressPct = 100;
            if (this.demoMode) {
                this.reset();
            } else {
                this.outcome = "won";
                if (typeof this.onVictory === "function") {
                    this.onVictory();
                }
            }
        }
    }

    // ---------- Рендер ----------

    render(ctx, W, H, time) {
        const groundY = H * 0.64;
        const anchorX = W * PLAYER_ANCHOR;
        const camX = this.player.x;

        BackgroundRenderer.render(ctx, this.level.bgTheme, W, H, groundY, time, this.effectiveSpeed, this.level.accentColor, this.level.id);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        if (!this.demoMode) {
            this.renderProgressBar(ctx, W);
        }
    }

    // ---------- Фони та хвилі ----------

    renderBackground(ctx, W, H, groundY, time) {
        BackgroundRenderer.render(ctx, this.level.bgTheme, W, H, groundY, time, this.effectiveSpeed, this.level.accentColor, this.level.id);

        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // ---------- Земля, Hit Window, Фініш, Перешкоди, Гравець ----------

    renderGround(ctx, W, H, groundY, camX) {
        ctx.fillStyle = "#070b1c";
        ctx.fillRect(0, groundY, W, H - groundY);

        const accent = this.level.accentColor || "#00f6ff";
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = accent;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const step = 140;
        const offset = camX % step;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.12)";
        ctx.lineWidth = 2;
        for (let x = -offset; x <= W; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, groundY + 6);
            ctx.lineTo(x - 28, groundY + 34);
            ctx.stroke();
        }
    }

    renderHitWindow(ctx, W, groundY, anchorX, time) {
        if (!this.player.alive || !this.nearestAheadSpike()) {
            return;
        }
        const hwH = 6;
        const hwY = groundY - hwH / 2;

        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(0, 246, 255, 0.15)";
        ctx.fillStyle = "rgba(0, 246, 255, 0.15)";
        ctx.fillRect(anchorX, hwY, this.okPx, hwH);

        const pulseAlpha = 0.35 + 0.15 * (Math.sin(time * 6) + 1) / 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillStyle = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(anchorX, hwY, this.perfectPx, hwH);

        ctx.shadowBlur = 0;
    }

    renderFinish(ctx, W, groundY, anchorX, camX) {
        const screenX = this.finishX - camX + anchorX;
        if (screenX < -60 || screenX > W + 60) {
            return;
        }
        ctx.save();
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 6;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#39ff88";
        ctx.strokeRect(screenX - 8, groundY - 170, 16, 170);
        ctx.restore();
    }

    // ---------- Перешкоди (3 типи) ----------

    drawSpike(ctx, screenX, groundY, accentColor, cleared) {
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        ctx.shadowBlur = cleared ? 4 : 14;
        ctx.shadowColor = color;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(screenX - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX, groundY - SPIKE_H);
        ctx.lineTo(screenX + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared) {
        const offset = SPIKE_W * 0.45;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        ctx.shadowBlur = cleared ? 4 : 10;
        ctx.shadowColor = color;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(screenX - offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX - offset, groundY - SPIKE_H);
        ctx.lineTo(screenX - offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenX + offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX + offset, groundY - SPIKE_H);
        ctx.lineTo(screenX + offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawSaw(ctx, screenX, groundY, radius, rotationAngle, accentColor, cleared) {
        const centerY = groundY - radius;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        const teeth = 8;

        ctx.save();
        ctx.translate(screenX, centerY);
        ctx.rotate(rotationAngle);

        ctx.shadowBlur = cleared ? 4 : 12;
        ctx.shadowColor = color;

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#301030";
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius : radius * 0.65;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.6)" : "rgba(20, 10, 20, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    renderObstacles(ctx, W, groundY, anchorX, camX) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";

        for (const spike of this.spikes) {
            const screenX = spike.x - camX + anchorX;
            if (screenX < -80 || screenX > W + 80) {
                continue;
            }
            const cleared = spike.state === "cleared";
            const accentColor = this.level.accentColor || "#ff2ea6";

            if (spike.type === "saw") {
                const sawRadius = SPIKE_H * 0.6;
                this.drawSaw(ctx, screenX, groundY, sawRadius, spike.rotationAngle || 0, accentColor, cleared);
            } else if (spike.type === "double_spike") {
                this.drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared);
            } else {
                this.drawSpike(ctx, screenX, groundY, accentColor, cleared);
            }

            if (!cleared) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = "rgba(255, 225, 77, 0.8)";
                ctx.fillStyle = "#ffe14d";
                const letterY = spike.type === "saw" ? groundY - SPIKE_H * 0.6 - 20 : groundY - SPIKE_H - 12;
                ctx.fillText(spike.letter, screenX, letterY);
                ctx.shadowBlur = 0;
            }
        }
        ctx.restore();
    }

    // ---------- Кубик та частинки ----------

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        for (const point of this.player.trail) {
            const dx = point.x - this.player.x;
            const size = CUBE_SIZE * 0.55;
            ctx.fillStyle = "rgba(0, 246, 255, " + Math.max(0, point.alpha * 0.35).toFixed(3) + ")";
            ctx.fillRect(
                anchorX + dx - size / 2,
                groundY - point.y - CUBE_SIZE / 2 - size / 2,
                size,
                size
            );
        }

        const centerY = groundY - this.player.y - CUBE_SIZE / 2;
        ctx.save();
        ctx.translate(anchorX, centerY);
        ctx.rotate(this.player.rotation);
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#00f6ff";
        const gradient = ctx.createLinearGradient(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#0077ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
        ctx.strokeStyle = "#bffcff";
        ctx.lineWidth = 3;
        ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#05060f";
        ctx.fillRect(-CUBE_SIZE * 0.18, -CUBE_SIZE * 0.2, CUBE_SIZE * 0.14, CUBE_SIZE * 0.28);
        ctx.fillRect(CUBE_SIZE * 0.06, -CUBE_SIZE * 0.2, CUBE_SIZE * 0.14, CUBE_SIZE * 0.28);
        ctx.restore();
    }

    renderProgressBar(ctx, W) {
        const barW = W * 0.6;
        const barX = (W - barW) / 2;
        const barY = 30;
        const barH = 14;

        if (this.leagueInfo !== null) {
            ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00f6ff";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(0, 246, 255, 0.5)";
            ctx.fillText(
                "Ліга: " + this.leagueInfo.leagueName + " | " + this.leagueInfo.levelNumber + ": " + this.leagueInfo.levelName,
                W / 2,
                6
            );
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = "rgba(8, 10, 26, 0.8)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
        const fillW = barW * (this.progressPct / 100);
        const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#39ff88");
        ctx.fillStyle = gradient;
        ctx.fillRect(barX + 1, barY + 1, Math.max(0, fillW - 2), barH - 2);
        ctx.fillStyle = "#eaf6ff";
        ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.floor(this.progressPct) + "%", barX + barW + 12, barY + barH / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffe14d";
        ctx.fillText("Очки: " + this.score, barX - 12, barY + barH / 2);
    }
}



