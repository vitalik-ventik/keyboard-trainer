// ============================================================
// engine.js — ігрова логіка
// Рівні та фіксовані траси, SaveManager (localStorage),
// клас Engine: кубик, шипи, колізії, EASY/HARD, частинки,
// trail, процедурні паралакс-фони, демо-режим для меню
// ============================================================

// ---------- Детермінований PRNG (фіксовані траси, R6) ----------

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

// ---------- Константи рівнів (data-model.md §2) ----------

export const LEVELS = [
    {
        id: 1,
        name: "Рівень 1",
        letters: ["А", "О"],
        newLetters: ["А", "О"],
        speed: 180,
        spikeCount: 15,
        seed: 101,
        bgTheme: "grid",
        rhythmGroups: false
    },
    {
        id: 2,
        name: "Рівень 2",
        letters: ["А", "О", "В", "Л"],
        newLetters: ["В", "Л"],
        speed: 200,
        spikeCount: 20,
        seed: 202,
        bgTheme: "grid",
        rhythmGroups: false
    },
    {
        id: 3,
        name: "Рівень 3",
        letters: ["А", "О", "В", "Л", "І", "Д"],
        newLetters: ["І", "Д"],
        speed: 240,
        spikeCount: 26,
        seed: 303,
        bgTheme: "city",
        rhythmGroups: false
    },
    {
        id: 4,
        name: "Рівень 4",
        letters: ["Ф", "І", "В", "А", "О", "Л", "Д", "Ж"],
        newLetters: ["Ф", "Ж"],
        speed: 260,
        spikeCount: 32,
        seed: 404,
        bgTheme: "city",
        rhythmGroups: false
    },
    {
        id: 5,
        name: "Рівень 5",
        letters: ["Ф", "І", "В", "А", "О", "Л", "Д", "Ж", "Е", "Н", "Г", "Ш"],
        newLetters: ["Е", "Н", "Г", "Ш"],
        speed: 300,
        spikeCount: 40,
        seed: 505,
        bgTheme: "boss",
        rhythmGroups: false
    },
    {
        id: 6,
        name: "БОС",
        letters: ["Ґ", "Є", "Ї", "Ю", "Я"],
        newLetters: ["Ґ", "Є", "Ї", "Ю", "Я"],
        speed: 360,
        spikeCount: 52,
        seed: 606,
        bgTheme: "boss",
        rhythmGroups: true
    }
];

// ---------- Генерація фіксованої траси ----------

// Час реакції між шипами: від 1.1 с (Рівень 1) до 0.5 с (Рівень 6)
function reactionTimeForLevel(levelId) {
    const t = (levelId - 1) / 5;
    return 1.1 - 0.6 * t;
}

function generateTrack(level) {
    const rng = mulberry32(level.seed);
    const spikes = [];
    const baseGapTime = reactionTimeForLevel(level.id);
    let x = level.speed * 3.0; // розгін перед першим шипом
    let last1 = null;
    let last2 = null;

    function pickLetter() {
        let letter = level.letters[Math.floor(rng() * level.letters.length)];
        // Не допускаємо трьох однакових літер поспіль
        let guard = 0;
        while (letter === last1 && letter === last2 && guard < 10) {
            letter = level.letters[Math.floor(rng() * level.letters.length)];
            guard++;
        }
        last2 = last1;
        last1 = letter;
        return letter;
    }

    if (level.rhythmGroups) {
        // Режим Бос: шипи ритмічними групами по 2–4
        let placed = 0;
        while (placed < level.spikeCount) {
            const groupSize = Math.min(
                2 + Math.floor(rng() * 3),
                level.spikeCount - placed
            );
            for (let i = 0; i < groupSize; i++) {
                spikes.push({ x: x, letter: pickLetter(), state: "ahead" });
                placed++;
                if (i < groupSize - 1) {
                    x += level.speed * 0.55; // ритмічний крок усередині групи
                }
            }
            x += level.speed * (1.25 + rng() * 0.5); // пауза між групами
        }
    } else {
        for (let i = 0; i < level.spikeCount; i++) {
            spikes.push({ x: x, letter: pickLetter(), state: "ahead" });
            x += level.speed * (baseGapTime + rng() * 0.55);
        }
    }

    const finishX = spikes[spikes.length - 1].x + level.speed * 2.5;
    return { spikes: spikes, finishX: finishX };
}

// ---------- SaveManager (contracts/storage-schema.md) ----------

const SAVE_KEY = "dfp_save_v1";

function defaultSaveData() {
    const levels = {};
    for (const level of LEVELS) {
        levels[String(level.id)] = { bestPct: 0, highScore: 0 };
    }
    return {
        version: 1,
        settings: { difficulty: "EASY" },
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
    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            clean.progress.unlocked = Math.min(6, Math.max(1, Math.floor(unlocked)));
        }
        if (raw.progress.levels && typeof raw.progress.levels === "object") {
            for (const level of LEVELS) {
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

// Дані живуть у пам'яті; localStorage — лише дзеркало (fallback, R5)
let saveData = null;

export const save = {
    // Читає збереження; ніколи не кидає. Битий JSON/недоступний storage → дефолт
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

    // Персистує поточний стан; ніколи не кидає (in-memory fallback)
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

    // Записує результат забігу: рекорди лише на краще, 100% відкриває наступний рівень
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
        if (cleanPct === 100 && levelId < 6) {
            saveData.progress.unlocked = Math.max(saveData.progress.unlocked, levelId + 1);
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

    getProgress() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress;
    },

    // Останній відкритий рівень — для кнопки «СТАРТ»
    getLastPlayable() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress.unlocked;
    }
};

// ---------- Фізичні константи світу ----------

const GRAVITY = 2600;        // прискорення падіння, лог. px/с²
const JUMP_VELOCITY = 660;   // початкова швидкість стрибка, лог. px/с
const CUBE_SIZE = 42;        // сторона кубика, лог. px
const SPIKE_W = 44;          // ширина основи шипа
const SPIKE_H = 48;          // висота шипа
const PLAYER_ANCHOR = 0.28;  // екранна позиція кубика (частка ширини)
const TRAIL_MAX = 20;        // максимум точок сліду
const DEATH_DELAY = 1.2;     // сек. показу вибуху до переходу в GAMEOVER
const DEMO_RESTART_DELAY = 1.4;

// Часове вікно зарахування стрибка: ширше на повільних рівнях
function hitWindowTimes(levelId) {
    const t = (levelId - 1) / 5;
    return {
        okTime: 0.45 - 0.15 * t,      // повне вікно (FR-021)
        perfectTime: 0.16 - 0.05 * t  // вікно «ідеально» (бонус очок)
    };
}

// ---------- Клас Engine ----------

export class Engine {
    /**
     * @param {number} levelId 1–6
     * @param {"EASY"|"HARD"} difficulty
     * @param {boolean} demoMode — заставка меню: автогра, без прогресу
     */
    constructor(levelId, difficulty, demoMode) {
        this.level = LEVELS.find(function (l) { return l.id === levelId; }) || LEVELS[0];
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;

        // Колбеки для звуку/музики (підключає main.js)
        this.onJump = null;
        this.onExplode = null;
        this.onVictory = null;

        const windows = hitWindowTimes(this.level.id);
        this.okPx = this.level.speed * windows.okTime;
        this.perfectPx = this.level.speed * windows.perfectTime;

        this.reset();
    }

    // Повне скидання забігу (старт і рестарт демо)
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
        this.waves = [];        // світлові хвилі (Бос-фон)
        this.pulse = 0;         // пульс у такт правильних натискань
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        // Буфер стрибка: посилання на шип, для якого гравець натиснув
        // правильну літеру в повітрі; живе лише в межах забігу (FR-041),
        // НЕ серіалізується в localStorage
        this.jumpBuffer = null;
    }

    // Найближчий шип попереду зі станом 'ahead'
    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x + SPIKE_W / 2 >= this.player.x) {
                return spike;
            }
        }
        return null;
    }

    // Літера найближчого шипа (підсвітка 'target' на клавіатурі)
    getTargetLetter() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.letter : null;
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

    // 'running' | 'dead' (вибух показано) | 'won'
    getOutcome() {
        return this.outcome;
    }

    // Перевірка буфера стрибка в кадрі приземлення (research.md R3).
    // Споживає буфер завжди: або виконує автостибок (шип попереду і в
    // межах вікна — FR-038), або тихо скасовує (шип пройдено/недосяжний —
    // FR-040, Assumption зі spec)
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
            this.jump(perfect);
        }
    }

    // Стрибок кубика
    jump(perfect) {
        this.player.vy = JUMP_VELOCITY;
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

    // Вибух кубика: частинки + завершення забігу
    explode() {
        if (!this.player.alive) {
            return;
        }
        // Скасування буфера стрибка при будь-якому вибуху (FR-040а)
        this.jumpBuffer = null;
        this.player.alive = false;
        this.deathTimer = 0;
        this.combo = 0;
        const rng = mulberry32(Math.floor(this.player.x) + 7);
        const count = 24 + Math.floor(rng() * 17);
        for (let i = 0; i < count; i++) {
            const angle = rng() * Math.PI * 2;
            const power = 140 + rng() * 420;
            this.particles.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE / 2,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power + 180,
                size: 3 + rng() * 6,
                life: 1,
                color: rng() < 0.5 ? "#00f6ff" : (rng() < 0.5 ? "#ff2ea6" : "#ffe14d")
            });
        }
        if (typeof this.onExplode === "function") {
            this.onExplode();
        }
    }

    /**
     * Обробка натиснутої літери (від keyboard.js). Ігнорується в demoMode.
     * EASY: помилки/завчасні натискання ігноруються (FR-009)
     * HARD: будь-яка помилка — миттєвий вибух (FR-010)
     */
    handleLetter(letter) {
        if (this.demoMode || !this.player.alive || this.outcome !== "running") {
            return;
        }
        const spike = this.nearestAheadSpike();
        if (!spike) {
            if (this.difficulty === "HARD") {
                this.explode();
            }
            return;
        }
        const gap = spike.x - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = letter === spike.letter;

        // Буферизація стрибка: правильна літера, натиснута В ПОВІТРІ,
        // запам'ятовується замість ігнорування (EASY) чи вибуху (HARD) —
        // FR-037; нове натискання перезаписує буфер (FR-039).
        // Стрибок виконається автоматично в кадрі приземлення.
        if (correct && !this.player.onGround) {
            this.jumpBuffer = spike;
            return;
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            spike.state = "cleared";
            this.score += 10 + (perfect ? 5 : 0);
            this.jump(perfect);
            return;
        }

        if (this.difficulty === "HARD") {
            // Не та літера або правильна, але поза вікном — миттєвий вибух
            this.explode();
        }
        // EASY: ігноруємо помилку повністю
    }

    // Крок симуляції; dt вже клампнутий у main.js (R4)
    update(dt) {
        if (this.outcome === "won") {
            return;
        }

        // Згасання пульсу та хвиль (фон Боса)
        this.pulse = Math.max(0, this.pulse - dt * 2.2);
        for (const wave of this.waves) {
            wave.r += dt * 620;
            wave.alpha -= dt * 1.1;
        }
        this.waves = this.waves.filter(function (w) { return w.alpha > 0; });

        // Частинки вибуху живуть і після смерті кубика
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

        // Рух світу
        this.player.x += this.level.speed * dt;

        // Вертикальна фізика (y — висота над землею, вгору додатна)
        if (!this.player.onGround) {
            this.player.vy -= GRAVITY * dt;
            this.player.y += this.player.vy * dt;
            this.player.rotation += dt * 7.5;
            if (this.player.y <= 0) {
                this.player.y = 0;
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.rotation = 0;
                // Перехід onGround: false → true — єдина точка спрацювання
                // буфера стрибка; ДО перевірки пропуску HARD та колізій,
                // щоб автостибок устиг урятувати кубик у цьому ж кадрі
                this.consumeJumpBuffer();
            }
        }

        // Слід кубика
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

        // Демо-автогра: ідеальний стрибок у вікні
        if (this.demoMode) {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5) {
                    target.state = "cleared";
                    this.jump(true);
                }
            }
        }

        // HARD: пропуск таймінгу — вибух ще до фізичного контакту
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

        // Фізичні колізії з шипами (актуально для EASY та демо-збоїв)
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
            // Шип пройдено поверху без зарахованого стрибка (EASY, завчасний стрибок)
            if (spike.x + SPIKE_W / 2 < this.player.x) {
                spike.state = "cleared";
            }
        }

        // Прогрес та перемога
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

    /**
     * Повний кадр світу: фон → земля → фініш → шипи → кубик → частинки → прогрес.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} W — логічна ширина
     * @param {number} H — логічна висота
     * @param {number} time — секунди від старту застосунку
     */
    render(ctx, W, H, time) {
        const groundY = H * 0.64;
        const anchorX = W * PLAYER_ANCHOR;
        const camX = this.player.x;

        this.renderBackground(ctx, W, H, groundY, time);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderSpikes(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        this.renderParticles(ctx, groundY, anchorX, camX);
        if (!this.demoMode) {
            this.renderProgressBar(ctx, W);
        }
    }

    renderBackground(ctx, W, H, groundY, time) {
        const theme = this.level.bgTheme;
        if (theme === "grid") {
            this.renderGridBackground(ctx, W, H, groundY);
        } else if (theme === "city") {
            this.renderCityBackground(ctx, W, H, groundY);
        } else {
            this.renderBossBackground(ctx, W, H, groundY, time);
        }
        // Світлові хвилі від правильних натискань (усі теми, найяскравіші в Боса)
        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // Рівні 1–2: рухома темно-синя неонова сітка
    renderGridBackground(ctx, W, H, groundY) {
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
        // Далекий шар сітки (повільніший паралакс)
        const farCell = 180;
        const farOffset = (this.player.x * 0.2) % farCell;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.10)";
        for (let x = -farOffset; x <= W; x += farCell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }
    }

    // Рівні 3–4: далекі фіолетові хмарочоси з сяючими вікнами
    renderCityBackground(ctx, W, H, groundY) {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, "#0d0420");
        gradient.addColorStop(0.7, "#251048");
        gradient.addColorStop(1, "#120826");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Два шари силуетів із різним паралаксом
        this.renderCityLayer(ctx, W, groundY, 0.15, 260, "rgba(58, 28, 110, 0.55)", 0.65, 17);
        this.renderCityLayer(ctx, W, groundY, 0.35, 190, "rgba(96, 44, 168, 0.75)", 0.85, 41);
    }

    renderCityLayer(ctx, W, groundY, parallax, buildingW, color, heightScale, saltSeed) {
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
            // Сяючі вікна
            const windowRows = Math.floor(h / 34);
            const windowCols = Math.max(1, Math.floor(w / 30));
            for (let r = 0; r < windowRows; r++) {
                for (let c = 0; c < windowCols; c++) {
                    if (rng() < 0.32) {
                        ctx.fillStyle = rng() < 0.5
                            ? "rgba(255, 225, 77, 0.7)"
                            : "rgba(0, 246, 255, 0.6)";
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

    // Рівні 5–6: пульсуюче рожево-бірюзове тло, еквалайзер у такт
    renderBossBackground(ctx, W, H, groundY, time) {
        const pulseGlow = 0.12 + this.pulse * 0.25;
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, "rgba(" + Math.round(60 + this.pulse * 80) + ", 8, 60, 1)");
        gradient.addColorStop(0.5, "#12041f");
        gradient.addColorStop(1, "rgba(4, " + Math.round(40 + this.pulse * 60) + ", 66, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Лінії еквалайзера, що рухаються в такт
        const barCount = 28;
        const barW = W / barCount;
        for (let i = 0; i < barCount; i++) {
            const phase = time * 6 + i * 0.7;
            const amp = (Math.sin(phase) + 1) / 2;
            const boost = 0.35 + this.pulse * 0.9 + Math.min(this.combo, 10) * 0.04;
            const barH = (24 + amp * 120) * boost;
            const hue = i % 2 === 0;
            ctx.fillStyle = hue
                ? "rgba(255, 46, 166, " + (pulseGlow + amp * 0.25).toFixed(3) + ")"
                : "rgba(0, 246, 255, " + (pulseGlow + amp * 0.25).toFixed(3) + ")";
            ctx.fillRect(i * barW + 2, groundY - barH, barW - 4, barH);
        }
    }

    renderGround(ctx, W, H, groundY, camX) {
        ctx.fillStyle = "#070b1c";
        ctx.fillRect(0, groundY, W, H - groundY);
        // Неонова лінія землі
        ctx.strokeStyle = this.level.bgTheme === "boss" ? "#ff2ea6" : "#00f6ff";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Розмітка землі, що рухається
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

        // OK-зона (зовнішня) — статичний ціан
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(0, 246, 255, 0.15)";
        ctx.fillStyle = "rgba(0, 246, 255, 0.15)";
        ctx.fillRect(anchorX, hwY, this.okPx, hwH);

        // Perfect-зона (внутрішня) — пульсуючий зелений поверх OK-зони
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
        // Фінішний неоновий портал
        ctx.save();
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 6;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#39ff88";
        ctx.strokeRect(screenX - 8, groundY - 170, 16, 170);
        ctx.restore();
    }

    renderSpikes(ctx, W, groundY, anchorX, camX) {
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
            const color = cleared ? "rgba(57, 255, 136, 0.5)" : "#ff2ea6";
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
            // Літера над шипом
            if (!cleared) {
                ctx.fillStyle = "#ffe14d";
                ctx.shadowBlur = 8;
                ctx.shadowColor = "rgba(255, 225, 77, 0.8)";
                ctx.fillText(spike.letter, screenX, groundY - SPIKE_H - 12);
                ctx.shadowBlur = 0;
            }
        }
        ctx.restore();
    }

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        // Слід (trail)
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
        // Кубик
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
        // «Око» кубика в стилі GD
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
        const barY = 18;
        const barH = 14;
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
        // Рахунок
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffe14d";
        ctx.fillText("Очки: " + this.score, barX - 12, barY + barH / 2);
    }
}
