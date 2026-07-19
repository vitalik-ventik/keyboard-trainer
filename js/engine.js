// ============================================================
// engine.js — ігрова логіка
// 5 ліг, 31 рівень, процедурні фони, 3 типи перешкод,
// SaveManager (localStorage), частинки, trail, демо-режим
// ============================================================

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
            { id: 1,  leagueId: 1, name: "Перші кроки",             letters: ["А","О","В","Л"], speed: 165, spikeCount: 12, seed: 2001, bgTheme: "deep_grid",              accentColor: "#00f6ff", rhythmGroups: false },
            { id: 2,  leagueId: 1, name: "Голосний старт",          letters: ["У","К","Е","П"], speed: 172, spikeCount: 13, seed: 2002, bgTheme: "city_night",             accentColor: "#aa44ff", rhythmGroups: false },
            { id: 3,  leagueId: 1, name: "Ближче до країв",         letters: ["Ф","І","Д","Ж"], speed: 179, spikeCount: 14, seed: 2003, bgTheme: "horizon",                 accentColor: "#00d4aa", rhythmGroups: false },
            { id: 4,  leagueId: 1, name: "Нижній лівий фланг",     letters: ["Я","Ч","С","М"], speed: 186, spikeCount: 15, seed: 2004, bgTheme: "indigo_diag",             accentColor: "#6a5acd", rhythmGroups: false },
            { id: 5,  leagueId: 1, name: "Ліва вертикаль",          letters: ["Й","Ц","Ф","І","Я","Ч"], speed: 193, spikeCount: 16, seed: 2005, bgTheme: "deep_blue_pulse",         accentColor: "#0066ff", rhythmGroups: false },
            { id: 6,  leagueId: 1, name: "Права вертикаль",         letters: ["Ш","Щ","З","Х","Ї","Ґ"], speed: 200, spikeCount: 17, seed: 2006, bgTheme: "black_green_stripes",     accentColor: "#00ff41", rhythmGroups: false },
            { id: 7,  leagueId: 1, name: "Ядро клавіатури",         letters: ["Е","Н","А","П","И","Т"], speed: 207, spikeCount: 18, seed: 2007, bgTheme: "dim_orange",              accentColor: "#ff8855", rhythmGroups: false },
            { id: 8,  leagueId: 1, name: "Нижній правий фланг",     letters: ["И","Т","Ь","Б","Ю","Є"], speed: 214, spikeCount: 19, seed: 2008, bgTheme: "dark_purple_squares",     accentColor: "#9944dd", rhythmGroups: false },
            { id: 9,  leagueId: 1, name: "Ліва діагональ",          letters: ["Й","У","І","В","Я","С"], speed: 221, spikeCount: 20, seed: 2009, bgTheme: "burgundy_icicles",        accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 10, leagueId: 1, name: "Права діагональ",         letters: ["Ш","Х","Л","Д","Ь","Б"], speed: 228, spikeCount: 21, seed: 2010, bgTheme: "cool_gray_shimmer",       accentColor: "#8899bb", rhythmGroups: false },
            { id: 11, leagueId: 1, name: "Шиплячий мікс",           letters: ["Ч","Щ","Ж","Ц","Ю","Ґ"], speed: 235, spikeCount: 22, seed: 2011, bgTheme: "concentric_circles",      accentColor: "#ccccee", rhythmGroups: false },
            { id: 12, leagueId: 1, name: "Вокальний лабіринт",      letters: ["У","Е","А","О","И","І"], speed: 242, spikeCount: 23, seed: 2012, bgTheme: "green_diagonal",          accentColor: "#39ff14", rhythmGroups: false },
            { id: 13, leagueId: 1, name: "Далекі куточки",          letters: ["Й","Ф","Я","Х","Ї","Є"], speed: 249, spikeCount: 24, seed: 2013, bgTheme: "toxic_ripples",           accentColor: "#e5ff00", rhythmGroups: false },
            { id: 14, leagueId: 1, name: "Центральні сусіди",       letters: ["К","Г","Р","Л","М","Т"], speed: 256, spikeCount: 25, seed: 2014, bgTheme: "dark_red_bezier",         accentColor: "#ff3800", rhythmGroups: false },
            { id: 15, leagueId: 1, name: "Неонові крила",           letters: ["Й","Ц","Ф","Х","Ї","Ґ"], speed: 263, spikeCount: 26, seed: 2015, bgTheme: "neon_cyberpunk_glow",     accentColor: "#00f6ff", rhythmGroups: false },
            { id: 16, leagueId: 1, name: "Базовий тріумф",          letters: ["В","А","П","Р","О","Л"], speed: 270, spikeCount: 28, seed: 2016, bgTheme: "emerald_pillars",         accentColor: "#39ff88", rhythmGroups: false }
        ]
    },
    {
        id: 2,
        name: "Середня",
        levels: [
            { id: 17, leagueId: 2, name: "Горизонт середнього ряду", letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж"], speed: 240, spikeCount: 26, seed: 2101, bgTheme: "purple_skyscrapers",     accentColor: "#bb55ff", rhythmGroups: false },
            { id: 18, leagueId: 2, name: "Дах клавіатури",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї"], speed: 250, spikeCount: 28, seed: 2102, bgTheme: "crimson_synthwave",      accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 19, leagueId: 2, name: "Нижній ярус",              letters: ["Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 255, spikeCount: 30, seed: 2103, bgTheme: "matrix",                 accentColor: "#00ff41", rhythmGroups: false },
            { id: 20, leagueId: 2, name: "Лівий сектор",             letters: ["Й","Ф","Я","Ц","І","Ч","У","В","С","К","А","М"], speed: 260, spikeCount: 32, seed: 2104, bgTheme: "gold_speed_lines",       accentColor: "#ff8c00", rhythmGroups: false },
            { id: 21, leagueId: 2, name: "Екватор",                  letters: ["Е","П","И","Н","Р","Т","Г","О","Ь","Ш","Л","Б"], speed: 268, spikeCount: 34, seed: 2105, bgTheme: "rotating_triangles",     accentColor: "#7b68ee", rhythmGroups: false },
            { id: 22, leagueId: 2, name: "Правий загін",             letters: ["Щ","Д","Ю","З","Ж","Є","Х","Ї","Ґ"], speed: 275, spikeCount: 36, seed: 2106, bgTheme: "stalactites",            accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 23, leagueId: 2, name: "Парад голосних",           letters: ["А","О","У","І","И","Е","Я","Ю","Є","Ї"], speed: 282, spikeCount: 38, seed: 2107, bgTheme: "turquoise_pulse",         accentColor: "#00f6ff", rhythmGroups: false },
            { id: 24, leagueId: 2, name: "Тверді звуки",            letters: ["Й","К","Н","Г","Ш","З","Ф","В","П","Р","Л","Д"], speed: 295, spikeCount: 40, seed: 2108, bgTheme: "burgundy_icicles",        accentColor: "#ff2ea6", rhythmGroups: false }
        ]
    },
    {
        id: 3,
        name: "Складна",
        levels: [
            { id: 25, leagueId: 3, name: "Верхній штурм",           letters: ["Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ї","Ф","І","В","А"], speed: 310, spikeCount: 38, seed: 2201, bgTheme: "pink_cyan_eq",           accentColor: "#ff2ea6", rhythmGroups: false },
            { id: 26, leagueId: 3, name: "Великий спуск",           letters: ["Ф","І","В","А","П","Р","О","Л","Д","Ж","Я","Ч","С","М","И","Т","Ь","Б"], speed: 325, spikeCount: 42, seed: 2202, bgTheme: "indigo_circles",         accentColor: "#6644ff", rhythmGroups: false },
            { id: 27, leagueId: 3, name: "Дворядний бар'єр",        letters: ["Й","Ц","У","К","Е","Н","Я","Ч","С","М","И","Т","Ь","Б","Ю","Є","Ґ"], speed: 340, spikeCount: 46, seed: 2203, bgTheme: "tunnel",                 accentColor: "#00f6ff", rhythmGroups: false },
            { id: 28, leagueId: 3, name: "Хаотичний мікс",          letters: ["А","О","П","Р","В","Л","І","Д","Ф","Ж","К","Е","Н","Г","У","Ш","Ц","Щ"], speed: 360, spikeCount: 50, seed: 2204, bgTheme: "acid_green_rain",        accentColor: "#7fff00", rhythmGroups: false }
        ]
    },
    {
        id: 4,
        name: "Майстер",
        levels: [
            { id: 29, leagueId: 4, name: "Половина Всесвіту",       letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ"], speed: 390, spikeCount: 50, seed: 2301, bgTheme: "toxic_radiation",        accentColor: "#e5ff00", rhythmGroups: false },
            { id: 30, leagueId: 4, name: "Гранд Мастер",            letters: ["К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ї","І","Ґ"], speed: 418, spikeCount: 55, seed: 2302, bgTheme: "flame",                  accentColor: "#ff4400", rhythmGroups: false }
        ]
    },
    {
        id: 5,
        name: "Бос",
        levels: [
            { id: 31, leagueId: 5, name: "ФІНАЛЬНИЙ ДЕМОН",        letters: ["А","Б","В","Г","Д","Е","Ж","З","И","І","Ї","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ь","Ю","Я","Є","Ґ"], speed: 450, spikeCount: 60, seed: 2401, bgTheme: "demon",                  accentColor: "#ff1111", rhythmGroups: true }
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
        const rng = mulberry32(Math.floor(this.player.x) + 7);
        const count = 24 + Math.floor(rng() * 17);
        for (let i = 0; i < count; i++) {
            const angle = rng() * Math.PI * 2;
            const power = 140 + rng() * 420;
            const isDemon = this.level.bgTheme === "demon";
            const lifeMult = isDemon ? 1.5 : 1;
            const colors = isDemon
                ? (rng() < 0.5 ? "#ff1111" : (rng() < 0.5 ? "#ff4400" : "#ffe14d"))
                : (rng() < 0.5 ? "#00f6ff" : (rng() < 0.5 ? "#ff2ea6" : "#ffe14d"));
            this.particles.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE / 2,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power + 180,
                size: (isDemon ? 4 : 3) + rng() * (isDemon ? 8 : 6),
                life: lifeMult,
                color: colors
            });
        }
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

        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy -= GRAVITY * 0.55 * dt;
            p.life -= dt * 0.9;
        }
        this.particles = this.particles.filter(function (p) { return p.life > 0; });

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

        this.renderBackground(ctx, W, H, groundY, time);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        this.renderParticles(ctx, groundY, anchorX, camX);
        if (!this.demoMode) {
            this.renderProgressBar(ctx, W);
        }
    }

    // ---------- 15 процедурних фонів ----------

    renderBackground(ctx, W, H, groundY, time) {
        const theme = this.level.bgTheme;
        switch (theme) {
            case "deep_grid":             this.renderDeepGrid(ctx, W, H, groundY, time); break;
            case "city_night":            this.renderCityNight(ctx, W, H, groundY, time); break;
            case "synthwave":             this.renderSynthwave(ctx, W, H, groundY, time); break;
            case "horizon":               this.renderHorizon(ctx, W, H, groundY); break;
            case "indigo_diag":           this.renderIndigoDiag(ctx, W, H, groundY, time); break;
            case "deep_blue_pulse":       this.renderDeepBluePulse(ctx, W, H, groundY, time); break;
            case "black_green_stripes":   this.renderBlackGreenStripes(ctx, W, H, groundY); break;
            case "dim_orange":            this.renderDimOrange(ctx, W, H, groundY, time); break;
            case "dark_purple_squares":   this.renderDarkPurpleSquares(ctx, W, H, groundY); break;
            case "burgundy_icicles":      this.renderStalactites(ctx, W, H, groundY); break;
            case "cool_gray_shimmer":     this.renderCoolGrayShimmer(ctx, W, H, groundY, time); break;
            case "concentric_circles":    this.renderConcentricCircles(ctx, W, H, groundY, time); break;
            case "green_diagonal":        this.renderGreenDiagonal(ctx, W, H, groundY, time); break;
            case "toxic_ripples":         this.renderToxicRipples(ctx, W, H, groundY, time); break;
            case "dark_red_bezier":       this.renderDarkRedBezier(ctx, W, H, groundY, time); break;
            case "neon_cyberpunk_glow":   this.renderNeonCyberpunkGlow(ctx, W, H, groundY, time); break;
            case "emerald_pillars":       this.renderEmeraldPillars(ctx, W, H, groundY, time); break;
            case "purple_skyscrapers":    this.renderPurpleSkyscrapers(ctx, W, H, groundY, time); break;
            case "crimson_synthwave":     this.renderCrimsonSynthwave(ctx, W, H, groundY, time); break;
            case "gold_speed_lines":      this.renderGoldSpeedLines(ctx, W, H, groundY, time); break;
            case "rotating_triangles":    this.renderRotatingTriangles(ctx, W, H, groundY, time); break;
            case "turquoise_pulse":       this.renderTurquoisePulse(ctx, W, H, groundY, time); break;
            case "pink_cyan_eq":          this.renderPinkCyanEq(ctx, W, H, groundY, time); break;
            case "indigo_circles":        this.renderIndigoCircles(ctx, W, H, groundY, time); break;
            case "acid_green_rain":       this.renderAcidGreenRain(ctx, W, H, groundY, time); break;
            case "toxic_radiation":       this.renderToxicRadiation(ctx, W, H, groundY, time); break;
            case "equalizer":             this.renderEqualizer(ctx, W, H, groundY, time); break;
            case "pulse_grid":            this.renderPulseGrid(ctx, W, H, groundY, time); break;
            case "matrix":                this.renderMatrix(ctx, W, H, groundY, time); break;
            case "speed_lines":           this.renderSpeedLines(ctx, W, H, groundY, time); break;
            case "geometry":              this.renderGeometry(ctx, W, H, groundY, time); break;
            case "stalactites":           this.renderStalactites(ctx, W, H, groundY); break;
            case "light_pulse":           this.renderLightPulse(ctx, W, H, groundY, time); break;
            case "tunnel":                this.renderTunnel(ctx, W, H, groundY, time); break;
            case "rain":                  this.renderRain(ctx, W, H, groundY, time); break;
            case "pulse_ripples":         this.renderPulseRipples(ctx, W, H, groundY, time); break;
            case "flame":                 this.renderFlame(ctx, W, H, groundY, time); break;
            case "demon":                 this.renderDemon(ctx, W, H, groundY, time); break;
            default:                      this.renderDeepGrid(ctx, W, H, groundY, time);
        }

        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // Рівень 1: Глибокий темно-синій градієнт, рухома неонова сітка, вертикальні лінії
    renderDeepGrid(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#040820");
        gradient.addColorStop(1, "#0a1442");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const cell = 72;
        const offset = (this.player.x * 0.5) % cell;
        ctx.strokeStyle = "rgba(0, 130, 255, 0.22)";
        ctx.lineWidth = 1;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = groundY; y >= 0; y -= cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        const farCell = 180;
        const farOffset = (this.player.x * 0.2) % farCell;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.10)";
        for (let x = -farOffset; x <= W; x += farCell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }

        const verticalLines = 8;
        const vLineSpeed = 40;
        const vLinePeriod = W * 1.5;
        for (let i = 0; i < verticalLines; i++) {
            const baseX = (i / verticalLines) * vLinePeriod;
            const x = (baseX - (time * vLineSpeed * 0.3) % vLinePeriod + vLinePeriod) % vLinePeriod - vLinePeriod * 0.1;
            if (x < -10 || x > W + 10) continue;
            const alpha = 0.08 + Math.sin(time * 1.5 + i) * 0.04;
            ctx.strokeStyle = "rgba(0, 246, 255, " + alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
    }

    // Рівень 2: Темно-фіолетові тони, хмарочоси з жовтими вікнами
    renderCityNight(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0d0420");
        gradient.addColorStop(0.7, "#251048");
        gradient.addColorStop(1, "#120826");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        this.renderCityLayer(ctx, W, groundY, 0.15, 260, "rgba(58, 28, 110, 0.55)", 0.65, 17, time);
        this.renderCityLayer(ctx, W, groundY, 0.35, 190, "rgba(96, 44, 168, 0.75)", 0.85, 41, time);
    }

    renderCityLayer(ctx, W, groundY, parallax, buildingW, color, heightScale, saltSeed, time) {
        const offset = this.player.x * parallax;
        const firstIndex = Math.floor(offset / buildingW);
        const count = Math.ceil(W / buildingW) + 2;
        for (let i = 0; i < count; i++) {
            const index = firstIndex + i;
            const rng = mulberry32(index * 2654435761 + saltSeed);
            const h = (60 + rng() * 240) * heightScale;
            const x = index * buildingW - offset;
            const w = buildingW * (0.55 + rng() * 0.3);
            ctx.fillStyle = color;
            ctx.fillRect(x, groundY - h, w, h);

            const windowRows = Math.floor(h / 34);
            const windowCols = Math.max(1, Math.floor(w / 30));
            for (let r = 0; r < windowRows; r++) {
                for (let c = 0; c < windowCols; c++) {
                    if (rng() < 0.40) {
                        const windowRng = mulberry32(index * 2654435761 + saltSeed + r * 100 + c);
                        const pulse = (Math.sin(time * 3 + windowRng() * 6.28) + 1) / 2;
                        const alpha = (0.4 + pulse * 0.4).toFixed(3);
                        const colorChoice = windowRng();
                        ctx.fillStyle = colorChoice < 0.70
                            ? "rgba(255, 225, 77, " + alpha + ")"
                            : "rgba(0, 246, 255, " + alpha + ")";
                        ctx.fillRect(
                            x + 8 + c * 30,
                            groundY - h + 10 + r * 34,
                            8,
                            12
                        );
                    }
                }
            }
        }
    }

    // Рівень 3: Пурпурово-рожевий Synthwave, сонце з горизонтальних ліній
    renderSynthwave(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a0040");
        gradient.addColorStop(0.3, "rgba(255, 46, 166, 0.08)");
        gradient.addColorStop(1, "#0d0420");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const sunX = W * 0.5;
        const sunY = groundY * 0.38;
        const baseR = groundY * 0.22;
        const r = baseR + Math.sin(time * 2) * 8;
        const lineCount = 22;
        const lineGap = 3;

        ctx.save();
        for (let i = -Math.floor(r / lineGap); i <= Math.floor(r / lineGap); i++) {
            const yy = sunY + i * lineGap;
            if (yy < -10 || yy > groundY) continue;
            const halfW = Math.sqrt(Math.max(0, r * r - (i * lineGap) * (i * lineGap)));
            const tx = halfW / r;
            const r1 = Math.round(255);
            const g1 = Math.round(136 + tx * 80);
            const b1 = Math.round(85 - tx * 40);
            ctx.strokeStyle = "rgb(" + r1 + "," + g1 + "," + b1 + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sunX - halfW, yy);
            ctx.lineTo(sunX + halfW, yy);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Рівень 4: Темно-бірюзовий, стовпчики еквалайзера
    renderEqualizer(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#021a1a");
        gradient.addColorStop(1, "#064040");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const barCount = 32;
        const barW = W / barCount;
        const rng = mulberry32(42);
        for (let i = 0; i < barCount; i++) {
            const phase = time * 4 + i * 0.5;
            const amp = (Math.sin(phase) + 1) / 2;
            const baseH = 30 + rng() * 90;
            const barH = baseH + amp * 50;
            const isEven = i % 2 === 0;
            ctx.fillStyle = isEven
                ? "rgba(0, 246, 255, 0.45)"
                : "rgba(255, 46, 166, 0.30)";
            ctx.fillRect(i * barW + 1, groundY - barH, barW - 2, barH);
        }
    }

    // Рівень 5: Яскраво-рожевий та синій, пульсація globalAlpha
    renderPulseGrid(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0a0020");
        gradient.addColorStop(1, "#200040");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const pulseAlpha = 0.5 + Math.sin(time * 3) * 0.5;
        ctx.save();
        ctx.globalAlpha = pulseAlpha;

        const cell = 80;
        const offset = (this.player.x * 0.4) % cell;
        ctx.strokeStyle = "rgba(255, 46, 166, 0.30)";
        ctx.lineWidth = 1.5;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = 0; y <= groundY; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Рівень 6: Чорно-зелений, падаючі відрізки (Матриця)
    renderMatrix(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#000800");
        gradient.addColorStop(1, "#001a00");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        if (!this._matrixDrops) {
            this._matrixDrops = [];
            const dropRng = mulberry32(777);
            for (let i = 0; i < 50; i++) {
                this._matrixDrops.push({
                    x: dropRng() * W,
                    y: dropRng() * groundY,
                    length: 20 + dropRng() * 60,
                    speed: 60 + dropRng() * 100,
                    alpha: 0.2 + dropRng() * 0.5
                });
            }
        }

        for (const drop of this._matrixDrops) {
            drop.y += drop.speed * 0.016;
            if (drop.y > groundY) {
                drop.y = -drop.length;
                drop.x = (drop.x + 40) % W;
            }
            ctx.strokeStyle = "rgba(0, 255, 65, " + drop.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
        }
    }

    // Рівень 7: Темно-помаранчевий, горизонтальні швидкі лінії
    renderSpeedLines(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a0800");
        gradient.addColorStop(1, "#0a0400");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        if (!this._speedLines) {
            this._speedLines = [];
            const slRng = mulberry32(888);
            for (let i = 0; i < 18; i++) {
                this._speedLines.push({
                    y: slRng() * groundY,
                    speed: 200 + slRng() * 400,
                    length: 60 + slRng() * 140,
                    alpha: 0.3 + slRng() * 0.4
                });
            }
        }

        for (const line of this._speedLines) {
            const x = (time * line.speed) % (W + line.length * 2) - line.length;
            ctx.strokeStyle = "rgba(255, 106, 0, " + line.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, line.y);
            ctx.lineTo(x + line.length, line.y);
            ctx.stroke();
        }
    }

    // Рівень 8: Глибокий індиго, обертові геометричні фігури
    renderGeometry(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#080020");
        gradient.addColorStop(1, "#100050");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const shapes = [
            { cx: W * 0.25, cy: groundY * 0.3, size: 80, type: "square", angle: time * 0.3 },
            { cx: W * 0.75, cy: groundY * 0.45, size: 55, type: "triangle", angle: time * 0.4 + 1 },
            { cx: W * 0.5, cy: groundY * 0.6, size: 100, type: "square", angle: time * 0.25 + 2 },
            { cx: W * 0.15, cy: groundY * 0.55, size: 45, type: "triangle", angle: time * 0.35 + 3 },
            { cx: W * 0.85, cy: groundY * 0.25, size: 70, type: "square", angle: time * 0.3 + 4 }
        ];

        for (const shape of shapes) {
            ctx.save();
            ctx.translate(shape.cx, shape.cy);
            ctx.rotate(shape.angle);
            ctx.strokeStyle = "rgba(123, 104, 238, 0.20)";
            ctx.lineWidth = 2;
            const half = shape.size / 2;

            if (shape.type === "square") {
                ctx.strokeRect(-half, -half, shape.size, shape.size);
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -half);
                ctx.lineTo(half * 0.87, half * 0.5);
                ctx.lineTo(-half * 0.87, half * 0.5);
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // Рівень 9: Бордово-фіолетовий, неонові сталактити
    renderStalactites(ctx, W, H, groundY) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#200010");
        gradient.addColorStop(1, "#100020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = "rgba(255, 46, 166, 0.50)";
        ctx.lineWidth = 3;

        const topCount = 6;
        const topRng = mulberry32(555);
        for (let i = 0; i < topCount; i++) {
            const baseX = (i + 0.5) * (W / topCount) + topRng() * 30 - 15;
            const h = 60 + topRng() * 100;
            const segments = 3 + Math.floor(topRng() * 3);
            ctx.beginPath();
            ctx.moveTo(baseX - 4, -4);
            for (let s = 0; s <= segments; s++) {
                const sy = (s / segments) * h;
                const swing = (s % 2 === 0 ? 1 : -1) * (8 + topRng() * 12);
                ctx.lineTo(baseX + swing, sy);
            }
            ctx.stroke();
        }

        const bottomCount = 6;
        const bottomRng = mulberry32(666);
        ctx.strokeStyle = "rgba(255, 46, 166, 0.40)";
        for (let i = 0; i < bottomCount; i++) {
            const baseX = (i + 0.3) * (W / bottomCount) + bottomRng() * 40 - 20;
            const h = 30 + bottomRng() * 80;
            const segments = 2 + Math.floor(bottomRng() * 3);
            ctx.beginPath();
            ctx.moveTo(baseX - 4, groundY + 4);
            for (let s = 0; s <= segments; s++) {
                const sy = groundY - (s / segments) * h;
                const swing = (s % 2 === 0 ? 1 : -1) * (6 + bottomRng() * 10);
                ctx.lineTo(baseX + swing, sy);
            }
            ctx.stroke();
        }
    }

    // Рівень 10: Жовто-фіолетовий, світлові імпульси при правильному натисканні
    renderLightPulse(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a0a20");
        gradient.addColorStop(1, "#0a0020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const cell = 80;
        const offset = (this.player.x * 0.4) % cell;
        ctx.strokeStyle = "rgba(255, 225, 77, 0.15)";
        ctx.lineWidth = 1;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = 0; y <= groundY; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        if (this.pulse > 0) {
            ctx.fillStyle = "rgba(255, 225, 77, " + (this.pulse * 0.15).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, H);
        }
    }

    // Рівень 11: Холодний темно-сірий, концентричні кола-тунель
    renderTunnel(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#101010");
        gradient.addColorStop(1, "#202020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2;
        const cy = groundY * 0.5;
        const baseR = (time * 70) % 120;
        for (let i = 0; i < 12; i++) {
            const r = baseR + i * 50;
            if (r > W) break;
            const alpha = (0.08 + i * 0.01).toFixed(3);
            ctx.strokeStyle = "rgba(0, 246, 255, " + alpha + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Рівень 12: Зелений/чорний, похилий дощ під 45°
    renderRain(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#000a00");
        gradient.addColorStop(1, "#001a00");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        if (!this._rainDrops) {
            this._rainDrops = [];
            const rainRng = mulberry32(999);
            for (let i = 0; i < 40; i++) {
                this._rainDrops.push({
                    x: rainRng() * W * 1.5,
                    y: rainRng() * groundY,
                    length: 15 + rainRng() * 25,
                    speed: 200 + rainRng() * 300,
                    alpha: 0.3 + rainRng() * 0.3
                });
            }
        }

        const cos45 = Math.cos(Math.PI / 4);
        const sin45 = Math.sin(Math.PI / 4);

        for (const drop of this._rainDrops) {
            drop.x -= drop.speed * cos45 * 0.016;
            drop.y += drop.speed * sin45 * 0.016;
            if (drop.y > groundY || drop.x < -drop.length) {
                drop.y = -drop.length;
                drop.x = W + (drop.length * cos45);
            }

            ctx.strokeStyle = "rgba(57, 255, 20, " + drop.alpha.toFixed(3) + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + drop.length * cos45, drop.y - drop.length * sin45);
            ctx.stroke();
        }
    }

    // Рівень 13: Жовто-коричневий, пульсуючі кола від перешкод
    renderPulseRipples(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a1000");
        gradient.addColorStop(1, "#0a0800");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        if (!this.ripples) {
            this.ripples = [];
        }

        for (const spike of this.spikes) {
            if (spike.state !== "ahead") continue;
            const screenX = spike.x - this.player.x + W * PLAYER_ANCHOR;
            if (screenX < -200 || screenX > W + 200) continue;

            let hasRipple = false;
            for (const rp of this.ripples) {
                if (rp.obstacleX === spike.x) { hasRipple = true; break; }
            }
            if (!hasRipple) {
                this.ripples.push({
                    obstacleX: spike.x,
                    r: 5,
                    alpha: 0.5
                });
            }
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const rp = this.ripples[i];
            rp.r += 1.5;
            rp.alpha -= 0.004;
            if (rp.alpha <= 0) {
                this.ripples.splice(i, 1);
                continue;
            }

            const sx = rp.obstacleX - this.player.x + W * PLAYER_ANCHOR;
            if (sx < -50 || sx > W + 50) continue;

            ctx.strokeStyle = "rgba(255, 204, 0, " + rp.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sx, groundY - SPIKE_H / 2, rp.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        this.ripples = this.ripples.filter(function (rp) {
            return rp.alpha > 0;
        });
    }

    // Рівень 14: Темно-червоний, криві Безьє — полум'я внизу
    renderFlame(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#200808");
        gradient.addColorStop(1, "#300a0a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const flameH = 50;
        const segmentW = W / 5;

        ctx.save();
        for (let seg = 0; seg < 5; seg++) {
            const sx = seg * segmentW;
            const offset = Math.sin(time * 2 + seg * 1.3) * 12;
            const offset2 = Math.cos(time * 2.5 + seg * 1.1) * 10;

            const flameGradient = ctx.createLinearGradient(0, groundY - flameH * 2, 0, groundY + 10);
            flameGradient.addColorStop(0, "rgba(255, 68, 0, 0)");
            flameGradient.addColorStop(0.3, "rgba(255, 68, 0, 0.25)");
            flameGradient.addColorStop(0.7, "rgba(255, 136, 0, 0.15)");
            flameGradient.addColorStop(1, "rgba(255, 68, 0, 0)");

            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(sx, groundY + 10);
            const cp1x = sx + segmentW * 0.3;
            const cp1y = groundY - flameH + offset;
            const cp2x = sx + segmentW * 0.7;
            const cp2y = groundY - flameH * 1.3 + offset2;
            const ex = sx + segmentW;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, groundY + 10);
            ctx.fill();
        }
        ctx.restore();
    }

    // Рівень 15: Demon Mode — чорний, криваво-червоні лінії, пульсація
    renderDemon(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#050005";
        ctx.fillRect(0, 0, W, H);

        const cell = 60;
        const offset = (this.player.x * 0.6) % cell;
        const demonAlpha = (0.25 + Math.sin(time * 6) * 0.08).toFixed(3);
        ctx.strokeStyle = "rgba(255, 17, 17, " + demonAlpha + ")";
        ctx.lineWidth = 1.5;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = 0; y <= groundY; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        const pulseAlpha = Math.pow(Math.sin(time * 8), 2) * 0.05;
        ctx.fillStyle = "rgba(255, 17, 17, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(0, 0, W, H);
    }

    // ---------- Нові процедурні фони (рівні 1-3..4-2) ----------

    renderHorizon(ctx, W, H, groundY) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#004040");
        gradient.addColorStop(1, "#002020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const horizonY = groundY * 0.65;
        ctx.strokeStyle = "rgba(0, 212, 170, 0.6)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(0, 212, 170, 0.4)";
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(W, horizonY);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    renderIndigoDiag(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0a0020");
        gradient.addColorStop(1, "#1a0040");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const gap = 60;
        const offset = (this.player.x * 0.3) % gap;
        ctx.strokeStyle = "rgba(106, 90, 205, 0.18)";
        ctx.lineWidth = 1;
        for (let d = -W - offset; d < W + H; d += gap) {
            ctx.beginPath();
            ctx.moveTo(d, 0);
            ctx.lineTo(d + H, H);
            ctx.stroke();
        }
    }

    renderDeepBluePulse(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#000830";
        ctx.fillRect(0, 0, W, H);
        const pulseAlpha = 0.12 + Math.sin(time * 2.5) * 0.06;
        const cell = 74;
        const offset = (this.player.x * 0.5) % cell;
        ctx.strokeStyle = "rgba(0, 102, 255, " + pulseAlpha.toFixed(3) + ")";
        ctx.lineWidth = 1;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
    }

    renderBlackGreenStripes(ctx, W, H, groundY) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#000800");
        gradient.addColorStop(1, "#001402");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const stripeH = 24;
        for (let y = 0; y < groundY; y += stripeH * 2) {
            ctx.fillStyle = "rgba(0, 255, 65, 0.04)";
            ctx.fillRect(0, y, W, stripeH);
        }
    }

    renderDimOrange(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#200800");
        gradient.addColorStop(1, "#301200");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const cell = 80;
        const offset = (this.player.x * 0.4) % cell;
        ctx.strokeStyle = "rgba(255, 136, 85, 0.15)";
        ctx.lineWidth = 1;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
    }

    renderDarkPurpleSquares(ctx, W, H, groundY) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#100020");
        gradient.addColorStop(1, "#200840");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(153, 68, 221, 0.15)";
        ctx.lineWidth = 2;
        const size = 70;
        const offset = (this.player.x * 0.2) % size;
        for (let x = -offset; x <= W; x += size) {
            for (let y = 0; y < groundY; y += size) {
                ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
            }
        }
    }

    renderCoolGrayShimmer(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0a0f18");
        gradient.addColorStop(1, "#121824");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const shimmerAlpha = 0.08 + Math.sin(time * 3) * 0.04;
        const cell = 90;
        const offset = (this.player.x * 0.45) % cell;
        ctx.strokeStyle = "rgba(136, 153, 187, " + shimmerAlpha.toFixed(3) + ")";
        ctx.lineWidth = 1;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
    }

    renderConcentricCircles(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#181820";
        ctx.fillRect(0, 0, W, H);
        const cx = W / 2;
        const cy = groundY * 0.45;
        const baseR = (time * 30) % 100;
        for (let i = 0; i < 16; i++) {
            const r = baseR + i * 45;
            if (r > W) break;
            ctx.strokeStyle = "rgba(204, 204, 238, " + (0.04 + i * 0.005).toFixed(3) + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    renderGreenDiagonal(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#001200";
        ctx.fillRect(0, 0, W, H);
        const gap = 22;
        const offset = (time * 60 + this.player.x * 0.3) % (gap * 2);
        ctx.strokeStyle = "rgba(57, 255, 20, 0.2)";
        ctx.lineWidth = 1;
        for (let d = -W - offset; d < W + H; d += gap) {
            ctx.beginPath();
            ctx.moveTo(d, 0);
            ctx.lineTo(d - H, H);
            ctx.stroke();
        }
    }

    renderToxicRipples(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#1a1a00";
        ctx.fillRect(0, 0, W, H);
        if (!this._toxicRipples) {
            this._toxicRipples = [];
        }
        const anchorX = W * PLAYER_ANCHOR;
        for (const spike of this.spikes) {
            if (spike.state !== "ahead") continue;
            const sx = spike.x - this.player.x + anchorX;
            if (sx < -100 || sx > W + 100) continue;
            let exists = false;
            for (const rp of this._toxicRipples) {
                if (rp.ox === spike.x) { exists = true; break; }
            }
            if (!exists) {
                this._toxicRipples.push({ ox: spike.x, r: 8, alpha: 0.45 });
            }
        }
        for (let i = this._toxicRipples.length - 1; i >= 0; i--) {
            const rp = this._toxicRipples[i];
            rp.r += 2.0;
            rp.alpha -= 0.005;
            if (rp.alpha <= 0) { this._toxicRipples.splice(i, 1); continue; }
            const sx = rp.ox - this.player.x + anchorX;
            if (sx < -50 || sx > W + 50) continue;
            ctx.strokeStyle = "rgba(229, 255, 0, " + rp.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sx, groundY - SPIKE_H / 2, rp.r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    renderDarkRedBezier(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#140404");
        gradient.addColorStop(1, "#220606");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const waveH = 40;
        const segmentW = W / 6;
        ctx.save();
        for (let seg = 0; seg < 6; seg++) {
            const sx = seg * segmentW;
            const offset = Math.sin(time * 1.8 + seg * 1.2) * 16;
            const offset2 = Math.cos(time * 2.3 + seg * 0.9) * 12;
            const waveGradient = ctx.createLinearGradient(0, groundY - waveH, 0, groundY + 10);
            waveGradient.addColorStop(0, "rgba(255, 56, 0, 0)");
            waveGradient.addColorStop(0.5, "rgba(255, 56, 0, 0.2)");
            waveGradient.addColorStop(1, "rgba(255, 56, 0, 0)");
            ctx.fillStyle = waveGradient;
            ctx.beginPath();
            ctx.moveTo(sx, groundY + 10);
            ctx.bezierCurveTo(sx + segmentW * 0.3, groundY - waveH + offset, sx + segmentW * 0.7, groundY - waveH * 1.2 + offset2, sx + segmentW, groundY + 10);
            ctx.fill();
        }
        ctx.restore();
    }

    renderNeonCyberpunkGlow(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#020812";
        ctx.fillRect(0, 0, W, H);
        const pulseAlpha = 0.3 + Math.sin(time * 4) * 0.15;
        const cell = 64;
        const offset = (this.player.x * 0.55) % cell;
        ctx.strokeStyle = "rgba(0, 246, 255, " + pulseAlpha.toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 246, 255, " + (pulseAlpha * 0.5).toFixed(3) + ")";
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = 0; y <= groundY; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        const glowAlpha = Math.pow(Math.sin(time * 5), 2) * 0.06;
        ctx.fillStyle = "rgba(0, 246, 255, " + glowAlpha.toFixed(3) + ")";
        ctx.fillRect(0, 0, W, H);
    }

    renderEmeraldPillars(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#001a10");
        gradient.addColorStop(1, "#003020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const pillarW = 40;
        const gap = 100;
        const offset = (this.player.x * 0.3) % (pillarW + gap);
        ctx.fillStyle = "rgba(57, 255, 136, 0.12)";
        for (let x = -offset; x <= W; x += pillarW + gap) {
            const h = 40 + Math.sin(time * 1.5 + x * 0.01) * 20;
            ctx.fillRect(x, 0, pillarW, h);
            ctx.fillRect(x, groundY - h, pillarW, h);
        }
    }

    renderPurpleSkyscrapers(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0d0420");
        gradient.addColorStop(1, "#251048");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        this.renderCityLayer(ctx, W, groundY, 0.15, 260, "rgba(100, 40, 180, 0.55)", 0.65, 17, time);
        this.renderCityLayer(ctx, W, groundY, 0.35, 190, "rgba(187, 85, 255, 0.75)", 0.85, 41, time);
    }

    renderCrimsonSynthwave(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#200010");
        gradient.addColorStop(0.3, "rgba(255, 46, 166, 0.08)");
        gradient.addColorStop(1, "#100010");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const sunX = W * 0.5;
        const sunY = groundY * 0.38;
        const baseR = groundY * 0.22;
        const r = baseR + Math.sin(time * 2) * 8;
        const lineCount = 22;
        const lineGap = 3;
        ctx.save();
        for (let i = -Math.floor(r / lineGap); i <= Math.floor(r / lineGap); i++) {
            const yy = sunY + i * lineGap;
            if (yy < -10 || yy > groundY) continue;
            const halfW = Math.sqrt(Math.max(0, r * r - (i * lineGap) * (i * lineGap)));
            const tx = halfW / r;
            ctx.strokeStyle = "rgb(255," + Math.round(100 + tx * 100) + "," + Math.round(120 + tx * 80) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sunX - halfW, yy);
            ctx.lineTo(sunX + halfW, yy);
            ctx.stroke();
        }
        ctx.restore();
    }

    renderGoldSpeedLines(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a0c00");
        gradient.addColorStop(1, "#0a0600");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        if (!this._goldLines) {
            this._goldLines = [];
            const slRng = mulberry32(8888);
            for (let i = 0; i < 18; i++) {
                this._goldLines.push({
                    y: slRng() * groundY,
                    speed: 200 + slRng() * 400,
                    length: 60 + slRng() * 140,
                    alpha: 0.25 + slRng() * 0.35
                });
            }
        }
        for (const line of this._goldLines) {
            const x = (time * line.speed) % (W + line.length * 2) - line.length;
            ctx.strokeStyle = "rgba(255, 140, 0, " + line.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x, line.y);
            ctx.lineTo(x + line.length, line.y);
            ctx.stroke();
        }
    }

    renderRotatingTriangles(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#080020");
        gradient.addColorStop(1, "#100050");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const triangles = [
            { cx: W * 0.25, cy: groundY * 0.3, size: 70, angle: time * 0.5 },
            { cx: W * 0.75, cy: groundY * 0.45, size: 50, angle: time * 0.6 + 1 },
            { cx: W * 0.5, cy: groundY * 0.6, size: 90, angle: time * 0.4 + 2 },
            { cx: W * 0.15, cy: groundY * 0.55, size: 40, angle: time * 0.55 + 3 },
            { cx: W * 0.85, cy: groundY * 0.25, size: 60, angle: time * 0.45 + 4 }
        ];
        for (const tri of triangles) {
            ctx.save();
            ctx.translate(tri.cx, tri.cy);
            ctx.rotate(tri.angle);
            ctx.strokeStyle = "rgba(123, 104, 238, 0.22)";
            ctx.lineWidth = 2;
            const half = tri.size / 2;
            ctx.beginPath();
            ctx.moveTo(0, -half);
            ctx.lineTo(half * 0.87, half * 0.5);
            ctx.lineTo(-half * 0.87, half * 0.5);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }

    renderTurquoisePulse(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#002020");
        gradient.addColorStop(1, "#004040");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const pulseAlpha = 0.15 + Math.sin(time * 3.5) * 0.1;
        const cell = 70;
        const offset = (this.player.x * 0.4) % cell;
        ctx.strokeStyle = "rgba(0, 246, 255, " + pulseAlpha.toFixed(3) + ")";
        ctx.lineWidth = 1.5;
        for (let x = -offset; x <= W; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
        for (let y = 0; y <= groundY; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }

    renderPinkCyanEq(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#1a0020");
        gradient.addColorStop(1, "#002020");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const barCount = 32;
        const barW = W / barCount;
        const rng = mulberry32(4200);
        for (let i = 0; i < barCount; i++) {
            const phase = time * 4 + i * 0.5;
            const amp = (Math.sin(phase) + 1) / 2;
            const baseH = 25 + rng() * 80;
            const barH = baseH + amp * 45;
            ctx.fillStyle = i % 2 === 0
                ? "rgba(255, 46, 166, 0.40)"
                : "rgba(0, 246, 255, 0.35)";
            ctx.fillRect(i * barW + 1, groundY - barH, barW - 2, barH);
        }
    }

    renderIndigoCircles(ctx, W, H, groundY, time) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#080020");
        gradient.addColorStop(1, "#180040");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        const cx = W / 2;
        const cy = groundY * 0.45;
        for (let i = 0; i < 14; i++) {
            const baseR = 50 + i * 55;
            const pulse = Math.sin(time * 1.5 + i * 0.4) * 10;
            const r = baseR + pulse;
            if (r > W) break;
            ctx.strokeStyle = "rgba(102, 68, 255, " + (0.06 + i * 0.004).toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    renderAcidGreenRain(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#0a0a00";
        ctx.fillRect(0, 0, W, H);
        if (!this._acidRain) {
            this._acidRain = [];
            const arRng = mulberry32(5555);
            for (let i = 0; i < 44; i++) {
                this._acidRain.push({
                    x: arRng() * W * 1.5,
                    y: arRng() * groundY,
                    length: 15 + arRng() * 30,
                    speed: 220 + arRng() * 320,
                    alpha: 0.3 + arRng() * 0.35
                });
            }
        }
        const cos45 = Math.cos(Math.PI / 4);
        const sin45 = Math.sin(Math.PI / 4);
        for (const drop of this._acidRain) {
            drop.x -= drop.speed * cos45 * 0.016;
            drop.y += drop.speed * sin45 * 0.016;
            if (drop.y > groundY || drop.x < -drop.length) {
                drop.y = -drop.length;
                drop.x = W + (drop.length * cos45);
            }
            ctx.strokeStyle = "rgba(127, 255, 0, " + drop.alpha.toFixed(3) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + drop.length * cos45, drop.y - drop.length * sin45);
            ctx.stroke();
        }
    }

    renderToxicRadiation(ctx, W, H, groundY, time) {
        ctx.fillStyle = "#1a1a00";
        ctx.fillRect(0, 0, W, H);
        const anchorX = W * PLAYER_ANCHOR;
        for (const spike of this.spikes) {
            if (spike.state !== "ahead") continue;
            const sx = spike.x - this.player.x + anchorX;
            if (sx < -200 || sx > W + 200) continue;
            const phases = [0, 1, 2];
            for (const p of phases) {
                const r = (time * 80 + p * 40) % 180;
                if (r < 3) continue;
                const alpha = Math.max(0, 0.25 - r / 720).toFixed(3);
                ctx.strokeStyle = "rgba(229, 255, 0, " + alpha + ")";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(sx, groundY - SPIKE_H / 2, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // ---------- Земля, Hit Window, Фініш ----------

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

    renderParticles(ctx, groundY, anchorX, camX) {
        for (const p of this.particles) {
            const screenX = p.x - camX + anchorX;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX - p.size / 2, groundY - p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
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
