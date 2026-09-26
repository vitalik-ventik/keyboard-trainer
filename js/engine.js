// ============================================================
// engine.js — ігрова логіка: клас Engine (стан забігу, фізика кубика, введення,
// колізії, бали, демо-режим, статистика літер, update). Методи зброї й рендера —
// engine_weapons.js, engine_render.js, engine_render_objects.js. Константи й бали —
// game_constants.js, рівні — levels.js, траси — track.js, скіни — skins.js і
// skin_renderers.js, збереження — save.js, вигляд шипів — spike_styles.js
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";
import { BackgroundCache } from "./cache.js";
import { EXPLOSION_DURATION, explosionWindowBonus, seriesBonus, trailSlowdown } from "./shop.js";
import { GRAVITY_LIFT, getWeaponSpec, gravityGrabTime } from "./weapons.js";
import { COMBO_KINDS, getLevelById } from "./levels.js";
import { activeSkinPerk, sampleSkinColors } from "./skins.js";
import { SKIN_RENDERERS } from "./skin_renderers.js";
import { COMBO_BONUS, CUBE_SIZE, DEATH_DELAY, DEMO_RESTART_DELAY, GRAVITY, LANDING_FX, MIN_JUMP_VELOCITY, OOPS_TIME, PERFECT_FLASH_TIME, SAFE_MARGIN, SHAKE_TIME, SPIKE_H, SPIKE_POP_DISTANCE, SPIKE_W, TRAIL_MAX, WORD_BONUS, calculateHitScore, calculateMaxScores, hitWindowTimes, spikeHalfWidth } from "./game_constants.js";
import { generateTrack, mulberry32 } from "./track.js";
import { save } from "./save.js";
import { SPIKE_STYLE_BY_THEME, SPIKE_STYLE_COLORS } from "./spike_styles.js";
import { EngineWeapons } from "./engine_weapons.js";
import { EngineRender } from "./engine_render.js";
import { EngineRenderObjects } from "./engine_render_objects.js";

// ---------- Клас Engine ----------

export class Engine {
    constructor(levelId, difficulty, demoMode, hitWindow, speed, leagueInfo) {
        const SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 };
        this.level = { ...getLevelById(levelId) };
        // Тренування помилок: літери рівня — ті, на яких гравець помиляється найчастіше
        // (поки даних замало — звичайні літери рівня)
        if (this.level.adaptive) {
            const weak = save.getWeakLetters(this.level.adaptive.pool, this.level.adaptive.count);
            if (weak) {
                this.level.letters = weak;
            }
            this.adaptiveFromStats = !!weak;
        }
        this.effectiveSpeed = this.level.speed * (SPEED_MULTIPLIERS[speed] ?? 1.0);
        // Бонуси з магазину (лише в справжній грі): шлейф сповільнює трасу, вибух розширює зону стрибка
        const trailSlow = demoMode ? 0 : trailSlowdown(save.getEquipped("trail"));
        const windowBonus = demoMode ? 0 : explosionWindowBonus(save.getEquipped("explosion"));
        this.effectiveSpeed *= 1 - trailSlow;
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;
        this.leagueInfo = leagueInfo || null;
        this.hitWindowSetting = hitWindow === "large" ? "large" : "normal";
        this.speedSetting = speed === "slow" || speed === "fast" ? speed : "normal";

        this.onJump = null;
        // Звук зброї: onSound(cue) з WEAPON_SOUNDS (у демо в меню не призначається — тиша)
        this.onSound = null;
        this.onExplode = null;
        this.onVictory = null;
        this.currentTime = 0;

        const windows = hitWindowTimes(this.level.tuneAs || this.level.id);
        const multiplier = (this.hitWindowSetting === "large" ? 2 : 1) * (1 + windowBonus);
        this.okPx = this.effectiveSpeed * windows.okTime * multiplier;
        this.perfectPx = this.effectiveSpeed * windows.perfectTime * multiplier;
        // Бонус скіна з магазину: серії, слова, ширша зона «Ідеально» або щит
        const perkInfo = demoMode ? null : activeSkinPerk(save.getActiveSkin());
        this.skinPerk = perkInfo ? perkInfo.kind : null;
        this.skinPerkValue = perkInfo ? perkInfo.value : 0;
        if (this.skinPerk === "perfect") {
            this.perfectPx = Math.min(this.okPx * 0.9, this.perfectPx * (1 + this.skinPerkValue));
        }
        this.shieldReady = this.skinPerk === "shield";
        this.shieldFlash = 0;
        // Пропозиція сердечка: гра на паузі, доки гравець не вирішить
        this.onReviveOffer = null;
        this.pendingRevive = null;
        this.paused = false;
        // Причина паузи: "start" (перед стартом рівня), "user" (Пробіл), "resume" (після сердечка),
        // "revive" (вікно «Друге життя?»)
        this.pauseReason = null;
        this.pauseStart = null;
        this.pausedTotal = 0;
        this.heartFlash = 0;

        this.cameraMotion = save.getCameraMotion();

        this.scoreConfig = {
            difficulty: this.difficulty,
            hitWindow: this.hitWindowSetting,
            speed: this.speedSetting
        };

        this.bgCache = new BackgroundCache();

        this.reset();
    }

    reset() {
        BackgroundRenderer.reset();
        this.bgCache.reset();
        const track = generateTrack(this.level, this.effectiveSpeed, this.okPx);
        this.spikes = track.spikes;
        this.finishX = track.finishX;
        // Максимум очок — за справжньою кількістю шипів: на рівнях зі словами
        // останнє слово добудовується повністю, тож шипів буває більше за spikeCount
        const maxScores = calculateMaxScores(this.spikes.length, this.hitWindowSetting, this.speedSetting);
        this.maxEasy = maxScores.maxEasy;
        this.maxHard = maxScores.maxHard;

        this.player = {
            x: 0,
            y: 0,
            vy: 0,
            onGround: true,
            rotation: 0,
            alive: true,
            trail: [],
            meteorTrail: [],
            goldTrail: []
        };

        this.progressPct = 0;
        this.score = 0;
        this.combo = 0;
        this.particles = [];
        this.perfectParticles = [];
        this.perfectPopups = [];
        this.waves = [];
        this.ripples = [];
        this.pulse = 0;
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        this.jumpBuffer = null;
        // Уламки вибуху та пил приземлення (квадратні «блоки»)
        this.debris = [];
        this.perfectFlash = 0;
        this.scorePopups = [];
        this.spikeStyle = SPIKE_STYLE_BY_THEME[this.level.bgTheme] || "neon";
        // Пасхалка: з'являється один раз, коли гравець пройде випадкову частину рівня (30–70%)
        this.eggAt = 0.3 + mulberry32(this.level.seed + 7)() * 0.4;
        this.eggStart = null;
        this.weather = BackgroundRenderer.pickWeather(this.level.bgTheme);
        this.shakeTime = 0;
        this.oopsTime = 0;
        this.elapsed = 0;
        // Кристали за цей забіг (без множника налаштувань) і ефект вибуху з магазину
        // Статистика літер цього забігу (влучання й помилки) — для тренування помилок
        this.letterStats = {};
        this.runWords = 0;
        this.runCombos = 0;
        this.runHits = 0;
        this.runPerfect = 0;
        this.runSeries = 0;
        // Для досягнень: найдовша серія «Ідеально» та шипи, знищені зброєю
        this.runMaxCombo = 0;
        this.runWeaponHits = 0;
        this.boom = null;
        // Зброя з магазину: замість стрибка кубик знищує шип
        this.weaponId = save.getEquipped("weapon");
        this.weaponSpec = getWeaponSpec(this.weaponId);
        this.attacks = [];
        this.shots = [];
        this.stuckArrows = [];
        this.weaponRecoil = 0;
    }

    // Тип скіна, яким зараз малюється кубик (вибраний гравцем або скін рівня)
    getSkinRenderType() {
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            return activeSkinId;
        }
        if (this.level.skin && SKIN_RENDERERS[this.level.skin.renderType]) {
            return this.level.skin.renderType;
        }
        return "neon_base";
    }

    // Шип подолано: він розсипається на уламки, над ним спливають зароблені очки
    markSpikeCleared(spike, points) {
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        this.spawnDebris(10, {
            x: spike.x,
            y: SPIKE_H * 0.4,
            spread: SPIKE_W * 0.6,
            angleMin: Math.PI * 0.1,
            angleMax: Math.PI * 0.9,
            speedMin: 90,
            speedMax: 220,
            sizeMin: 4,
            sizeMax: 8,
            spin: 10,
            colors: colors,
            gravity: 700,
            life: 0.7,
            outline: true
        });
        if (points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 12, text: "+" + points, life: 0.9, maxLife: 0.9, points: true });
        }
    }

    // Світ відповідає на приземлення: бульбашки, світлячки, сніг, пісок, камінці, іскри
    spawnLandingReaction() {
        const fx = LANDING_FX[this.level.bgTheme];
        if (!fx) {
            return;
        }
        const base = { x: this.player.x, spin: 3, outline: false, colors: fx.colors };
        if (fx.kind === "bubbles") {
            this.spawnDebris(6, Object.assign(base, { y: 6, spread: CUBE_SIZE, angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 80, sizeMin: 3, sizeMax: 6, gravity: -160, life: 1.1 }));
        } else if (fx.kind === "fireflies") {
            this.spawnDebris(5, Object.assign(base, { y: 8, spread: CUBE_SIZE * 2, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 20, speedMax: 60, sizeMin: 3, sizeMax: 4, gravity: -40, life: 1.4 }));
        } else if (fx.kind === "splash") {
            this.spawnDebris(10, Object.assign(base, { y: 3, spread: CUBE_SIZE, angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 60, speedMax: 170, sizeMin: 3, sizeMax: 5, gravity: 400, life: 0.6 }));
        } else if (fx.kind === "pebbles") {
            this.spawnDebris(4, Object.assign(base, { x: this.player.x + 60, y: 380, spread: 260, angleMin: -Math.PI * 0.55, angleMax: -Math.PI * 0.45, speedMin: 10, speedMax: 40, sizeMin: 4, sizeMax: 7, gravity: 900, life: 1.2, outline: true }));
        } else if (fx.kind === "sparks") {
            this.spawnDebris(7, Object.assign(base, { y: 4, spread: CUBE_SIZE, angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 220, sizeMin: 2, sizeMax: 4, gravity: 500, life: 0.5 }));
        }
    }

    spawnDebris(count, options) {
        for (var i = 0; i < count; i++) {
            var angle = options.angleMin + Math.random() * (options.angleMax - options.angleMin);
            var speed = options.speedMin + Math.random() * (options.speedMax - options.speedMin);
            this.debris.push({
                x: options.x + (Math.random() - 0.5) * options.spread,
                y: options.y + (Math.random() - 0.5) * options.spread,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * options.spin,
                size: options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin),
                color: options.colors[Math.floor(Math.random() * options.colors.length)],
                gravity: options.gravity,
                life: options.life,
                maxLife: options.life,
                outline: options.outline
            });
        }
        if (this.debris.length > 80) {
            this.debris.splice(0, this.debris.length - 80);
        }
    }

    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x - spikeHalfWidth(spike.type) + 0.01 >= this.player.x) {
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
            runHits: this.runHits,
            runWords: this.runWords,
            runCombos: this.runCombos,
            wordsMult: this.wordsMult(),
            runPerfect: this.runPerfect,
            runSeries: this.runSeries,
            runMaxCombo: this.runMaxCombo,
            runWeaponHits: this.runWeaponHits,
            // Пасхалку зараховуємо, якщо її показували хоча б секунду
            eggSeen: this.eggStart !== null && this.currentTime - this.eggStart >= 1000,
            bgTheme: this.level.bgTheme,
            weapon: !!this.weaponSpec,
            weaponId: this.weaponSpec ? this.weaponId : null,
            alive: this.player.alive,
            maxEasy: this.maxEasy,
            maxHard: this.maxHard,
            difficulty: this.difficulty
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
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        if (gap > 0 && gap <= this.okPx) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
        }
    }

    jump(distance, perfect) {
        const computedVy = GRAVITY * distance / (2 * this.effectiveSpeed);
        this.player.vy = computedVy > MIN_JUMP_VELOCITY ? computedVy : MIN_JUMP_VELOCITY;
        this.player.onGround = false;
        this.registerHit(perfect);
    }

    // Успішна дія (стрибок або удар зброєю): серія, монети, «Ідеально», звук
    registerHit(perfect) {
        this.pulse = 1;
        if (!this.demoMode) {
            // Кристал за кожен подоланий шип; «Ідеально» — ще +1 і бонус за серію
            this.runHits++;
            if (this.weaponSpec) {
                this.runWeaponHits++;
            }
            let gain = 1;
            let bonus = 0;
            if (perfect) {
                this.runPerfect++;
                bonus = seriesBonus(this.combo + 1);
                if (bonus > 0 && this.skinPerk === "series") {
                    bonus = Math.round(bonus * this.skinPerkValue);
                }
                this.runSeries += bonus;
                gain += 1 + bonus;
            }
            this.scorePopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE * 2.4,
                text: bonus > 0 ? "Серія ×" + (this.combo + 1) + "! +" + gain : "+" + gain,
                life: bonus > 0 ? 1.4 : 0.8,
                maxLife: bonus > 0 ? 1.4 : 0.8,
                crystal: true
            });
        }
        if (perfect) {
            this.combo++;
            if (this.combo > this.runMaxCombo) {
                this.runMaxCombo = this.combo;
            }
            const count = 8 + Math.floor(Math.random() * 5);
            const isHard = this.difficulty === "HARD";
            const silverColors = ["#f0f4ff", "#c8d0e0", "#e8ecf2", "#d4dce8", "#88aacc"];
            const goldColors = ["#ffd700", "#ffaa00", "#ffe14d", "#ff8c00", "#ffcc44"];
            const palette = isHard ? goldColors : silverColors;
            for (var pi = 0; pi < count; pi++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = 40 + Math.random() * 120;
                this.perfectParticles.push({
                    x: this.player.x,
                    y: this.player.y + CUBE_SIZE / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.2,
                    maxLife: 1.2,
                    size: 2 + Math.random() * 3,
                    color: palette[Math.floor(Math.random() * palette.length)]
                });
            }
            this.perfectPopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE,
                life: 1.5,
                maxLife: 1.5
            });
            this.perfectFlash = PERFECT_FLASH_TIME;
        } else {
            this.combo = 0;
        }
        this.waves.push({ r: 10, alpha: 0.8 });
        // Зі зброєю звук стрибка не граємо — у зброї свої звуки
        if (typeof this.onJump === "function" && !this.weaponSpec) {
            this.onJump();
        }
    }

    // Множник монет за слова й комбінації (бонус скіна)
    wordsMult() {
        return this.skinPerk === "words" ? this.skinPerkValue : 1;
    }

    // Щит легендарного скіна: пробачає одну помилку чи зіткнення за рівень.
    // Повертає true, якщо щит спрацював (тоді вибуху немає)
    useShield() {
        if (!this.shieldReady || this.demoMode || !this.player.alive) {
            return false;
        }
        this.shieldReady = false;
        this.shieldFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "🛡 Щит!",
            life: 1.3,
            maxLife: 1.3
        });
        return true;
    }

    // Помилка, що мала б закінчитися вибухом. kind: "wrong" (не та літера на HARD),
    // "late" (запізнення на HARD), "collision" (зіткнення з шипом).
    // Спершу безкоштовний щит скіна, потім пропозиція сердечка, інакше — вибух
    failAt(kind, spike, gap) {
        if (this.useShield()) {
            this.forgiveMistake(kind, spike, gap);
            return "forgiven";
        }
        if (!this.demoMode && typeof this.onReviveOffer === "function" && save.getHearts() > 0 && this.player.alive) {
            this.pendingRevive = { kind: kind, spike: spike, gap: gap };
            this.paused = true;
            this.pauseReason = "revive";
            this.onReviveOffer(save.getHearts());
            return "paused";
        }
        if (kind === "collision" && spike) {
            spike.state = "hit";
        }
        this.explode();
        return "exploded";
    }

    // Пробачена помилка: після запізнення кубик сам перестрибує шип, після зіткнення
    // шип розбивається; після не тієї літери можна просто натиснути правильну
    forgiveMistake(kind, spike, gap) {
        if (!spike) {
            return;
        }
        if (kind === "late") {
            this.markSpikeCleared(spike, 0);
            this.jump(Math.max(0, gap) + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN, false);
        } else if (kind === "collision") {
            this.markSpikeCleared(spike, 0);
        }
    }

    // Гравець погодився використати сердечко (Enter). Гра лишається на паузі,
    // доки гравець не натисне Пробіл — встигне приготуватися
    acceptRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = true;
        this.pauseReason = "resume";
        save.useHeart();
        this.heartFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "❤ Друге життя!",
            life: 1.4,
            maxLife: 1.4
        });
        this.forgiveMistake(r.kind, r.spike, r.gap);
    }

    // Гравець відмовився (Esc) — вибух, як зазвичай
    declineRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = false;
        this.pauseReason = null;
        if (r.kind === "collision" && r.spike) {
            r.spike.state = "hit";
        }
        this.explode();
    }

    // Пауза гравця: перед стартом рівня ("start"), Пробілом ("user") чи після сердечка ("resume").
    // Під час вікна «Друге життя?» не вмикається й не знімається
    pauseGame(reason) {
        if (this.demoMode || this.outcome !== "running" || !this.player.alive || this.pendingRevive) {
            return false;
        }
        this.paused = true;
        this.pauseReason = reason || "user";
        return true;
    }

    resumeGame() {
        if (!this.paused || this.pendingRevive) {
            return false;
        }
        this.paused = false;
        this.pauseReason = null;
        return true;
    }

    // Чи стоїть гра на паузі гравця (не вікно сердечка)
    isUserPaused() {
        return this.paused && !this.pendingRevive;
    }

    explode() {
        if (!this.player.alive) {
            return;
        }
        this.jumpBuffer = null;
        this.player.alive = false;
        this.deathTimer = 0;
        this.combo = 0;
        const isDemon = this.level.bgTheme === "pixel_nether";
        const palette = isDemon
            ? ["#ff1111", "#ff4400", "#ffe14d"]
            : ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
        if (this.cameraMotion) {
            this.shakeTime = SHAKE_TIME;
        }
        const count = isDemon ? 20 : 8;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
        // Ефект вибуху, куплений у магазині
        this.boom = { id: save.getEquipped("explosion"), t: 0, x: gameX, y: gameY };
        BackgroundRenderer.createParticles(gameX, gameY, count, palette);
        // Кубик розлітається на квадратні уламки кольорів свого скіна
        this.spawnDebris(22, {
            x: gameX,
            y: gameY,
            spread: CUBE_SIZE * 0.6,
            angleMin: 0,
            angleMax: Math.PI * 2,
            speedMin: 120,
            speedMax: 380,
            sizeMin: CUBE_SIZE * 0.14,
            sizeMax: CUBE_SIZE * 0.3,
            spin: 14,
            colors: sampleSkinColors(this.getSkinRenderType()),
            gravity: 900,
            life: 1.1,
            outline: true
        });
        if (typeof this.onExplode === "function") {
            this.onExplode();
        }
    }

    handleLetter(letter) {
        if (this.paused) {
            return { result: "paused", letter: letter };
        }
        if (this.demoMode || !this.player.alive || this.outcome !== "running") {
            return { result: "no_target", letter: letter };
        }
        const upperLetter = letter.toUpperCase();
        const spike = this.nearestAheadSpike();
        if (!spike) {
            // Після останнього шипа цілі немає — натискання ні на що не впливає навіть у HARD
            return { result: "no_target", letter: letter };
        }
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = upperLetter === spike.letter.toUpperCase();

        // У повітрі правильна літера запам'ятовується лише тоді, коли шип уже в зоні.
        // Траса будується так, що приземлення завжди відбувається до початку зони
        // наступного шипа, тож натискання в повітрі — це зарано (як і на землі).
        if (correct && !this.player.onGround && gap > 0 && gap <= this.okPx) {
            this.jumpBuffer = spike;
            return { result: "correct", letter: letter };
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            if (this.weaponSpec) {
                this.strike(spike, gap, perfect, points);
                return { result: "correct", letter: letter };
            }
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        // Не та літера (або правильна, але зарано) — помилка на цьому шипі
        if (!correct) {
            this.noteSpikeMiss(spike);
        }
        this.worldReact();
        if (this.difficulty === "HARD") {
            const fate = this.failAt("wrong", spike, 0);
            if (fate === "exploded") {
                return { result: "exploded", letter: letter };
            }
            return { result: fate === "paused" ? "paused" : "wrong", letter: letter };
        }

        return { result: "wrong", letter: letter };
    }

    // ---------- Зброя ----------

    // Правильна літера зі зброєю: шип «приречений» (більше не може зачепити кубик
    // і не є ціллю), а сама атака добігає своїм ходом — удар, снаряд або промінь
    strike(spike, gap, perfect, points) {
        spike.state = "doomed";
        spike.points = points;
        spike.chunks = 0;
        this.registerHit(perfect);
        const spec = this.weaponSpec;
        const muzzleX = this.player.x + CUBE_SIZE * 0.6;
        const muzzleY = CUBE_SIZE * 0.55;
        const targetY = spike.type === "saw" ? SPIKE_H * 0.6 : SPIKE_H * 0.4;
        if (spec.mode === "melee" || (spec.mode === "axe" && gap <= spec.reach)) {
            // Замах одразу; удар — коли шип підійде на відстань руки
            this.attacks.push({ kind: "melee", spike: spike, stage: "wait", t: 0, hit: false });
        } else if (spec.mode === "beam") {
            const beamAttack = { kind: "beam", spike: spike, stage: "beam", t: 0, hit: false };
            if (spec.beam === "gravity") {
                // Промінь гравітаційної гармати дотягується тим швидше, чим ближче шип
                beamAttack.hitAt = gravityGrabTime(spike.x - muzzleX);
                beamAttack.time = beamAttack.hitAt + GRAVITY_LIFT;
            }
            this.attacks.push(beamAttack);
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        } else {
            const count = spec.mode === "burst" ? spec.count : 1;
            for (let i = 0; i < count; i++) {
                this.shots.push({
                    kind: spec.mode === "axe" ? (spec.saber ? "saber" : "axe") : spec.projectile,
                    color: spec.saber || null,
                    spike: spike,
                    t: -(spec.gap || 0) * i,
                    index: i,
                    last: i === count - 1,
                    fromX: muzzleX,
                    fromY: muzzleY,
                    toX: spike.x,
                    toY: targetY,
                    arc: spec.arc || 0,
                    dur: Math.max(0.06, (spike.x - muzzleX) / spec.speed),
                    returning: false,
                    prev: []
                });
            }
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        }
    }

    // Облік літери для статистики помилок (у демо не ведеться)
    noteLetter(letter, ok) {
        if (this.demoMode || !letter) {
            return;
        }
        const s = this.letterStats[letter] || (this.letterStats[letter] = { ok: 0, miss: 0 });
        if (ok) {
            s.ok++;
        } else {
            s.miss++;
        }
    }

    // Помилка на шипі (не та літера, запізнення, зіткнення) — рахується один раз на шип
    noteSpikeMiss(spike) {
        if (spike && !spike.missed) {
            spike.missed = true;
            this.noteLetter(spike.letter, false);
        }
    }

    // Шип подолано правильною літерою: статистика й бонус за слово без помилок
    noteSpikeDone(spike) {
        if (!spike.missed) {
            this.noteLetter(spike.letter, true);
        }
        if (this.demoMode || spike.word === undefined || spike.charIdx !== spike.word.length - 1) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === spike.wordIdx; });
        if (spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runCombos++;
            const kind = COMBO_KINDS[spike.combo];
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: (kind ? kind.unit : "Комбо") + " «" + spike.word + "»! +" + COMBO_BONUS * this.wordsMult(),
                life: 1.3,
                maxLife: 1.3,
                crystal: true
            });
        } else if (!spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runWords++;
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: "Слово «" + spike.word + "»! +" + WORD_BONUS * this.wordsMult(),
                life: 1.5,
                maxLife: 1.5,
                crystal: true
            });
        }
    }

    // Статистика літер за забіг (main зберігає її після завершення)
    getLetterStats() {
        return this.letterStats;
    }

    // Світ реагує на кожну помилку: гуркіт грому, гудіння трибун, спалах очей дракона…
    // На рівні боса демон реве, а екран ледь здригається
    worldReact() {
        this.oopsTime = OOPS_TIME;
        if (this.level.bgTheme === "pixel_nether" && this.cameraMotion) {
            this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.4);
        }
    }

    update(dt) {
        if (this.outcome === "won") {
            return;
        }
        // Пауза, поки гравець вирішує щодо сердечка
        if (this.paused) {
            return;
        }

        this.currentTime = performance.now();
        this.pulse = Math.max(0, this.pulse - dt * 2.2);
        for (const wave of this.waves) {
            wave.r += dt * 620;
            wave.alpha -= dt * 1.1;
        }
        this.waves = this.waves.filter(function (w) { return w.alpha > 0; });

        BackgroundRenderer.updateParticles(dt);

        for (var ppi = this.perfectParticles.length - 1; ppi >= 0; ppi--) {
            var pp = this.perfectParticles[ppi];
            pp.life -= dt;
            if (pp.life <= 0) {
                this.perfectParticles.splice(ppi, 1);
                continue;
            }
            pp.x += pp.vx * dt;
            pp.y += pp.vy * dt;
            pp.vy += 400 * dt;
        }
        for (var poi = this.perfectPopups.length - 1; poi >= 0; poi--) {
            var po = this.perfectPopups[poi];
            po.life -= dt;
            if (po.life <= 0) {
                this.perfectPopups.splice(poi, 1);
                continue;
            }
            po.y += 80 * dt;
        }
        for (var di = this.debris.length - 1; di >= 0; di--) {
            var db = this.debris[di];
            db.life -= dt;
            if (db.life <= 0) {
                this.debris.splice(di, 1);
                continue;
            }
            db.x += db.vx * dt;
            db.y += db.vy * dt;
            db.vy -= db.gravity * dt;
            db.rot += db.vr * dt;
            if (db.y < db.size / 2) {
                db.y = db.size / 2;
                db.vy = -db.vy * 0.35;
                db.vx *= 0.7;
            }
        }
        this.perfectFlash = Math.max(0, this.perfectFlash - dt);
        this.shieldFlash = Math.max(0, (this.shieldFlash || 0) - dt * 1.2);
        this.heartFlash = Math.max(0, (this.heartFlash || 0) - dt * 1.2);
        if (this.boom) {
            this.boom.t += dt;
            if (this.boom.t > EXPLOSION_DURATION) {
                this.boom = null;
            }
        }
        this.shakeTime = Math.max(0, this.shakeTime - dt);
        this.oopsTime = Math.max(0, this.oopsTime - dt);
        this.elapsed += dt;
        for (var si = this.scorePopups.length - 1; si >= 0; si--) {
            var sp = this.scorePopups[si];
            sp.life -= dt;
            sp.y += 60 * dt;
            if (sp.life <= 0) {
                this.scorePopups.splice(si, 1);
            }
        }

        if (this.weaponSpec) {
            this.updateWeapons(dt);
        }

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
                // Пил із-під кубика при приземленні
                this.spawnDebris(8, {
                    x: this.player.x,
                    y: 2,
                    spread: CUBE_SIZE * 0.8,
                    angleMin: Math.PI * 0.05,
                    angleMax: Math.PI * 0.95,
                    speedMin: 40,
                    speedMax: 130,
                    sizeMin: 3,
                    sizeMax: 6,
                    spin: 4,
                    colors: ["rgba(200, 210, 230, 0.9)", this.level.accentColor || "#00f6ff"],
                    gravity: 260,
                    life: 0.45,
                    outline: false
                });
                this.spawnLandingReaction();
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

        if (!this.player.onGround) {
            this.player.meteorTrail.unshift({ x: this.player.x, y: this.player.y, alpha: 1 });
            if (this.player.meteorTrail.length > 2) {
                this.player.meteorTrail.pop();
            }
        } else if (this.player.meteorTrail.length > 0) {
            for (var mt = 0; mt < this.player.meteorTrail.length; mt++) {
                this.player.meteorTrail[mt].alpha -= dt * 3;
            }
            this.player.meteorTrail = this.player.meteorTrail.filter(function (t) { return t.alpha > 0; });
        }

        if (this.demoMode) {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5 && this.weaponSpec) {
                    // Демо в меню показує куплену зброю
                    this.strike(target, gap, true, 0);
                } else if (gap > 0 && gap <= this.okPx * 0.5) {
                    this.markSpikeCleared(target, 0);
                    const distance = gap + 2 * spikeHalfWidth(target.type) + SAFE_MARGIN;
                    this.jump(distance, true);
                }
            }
        }

        if (!this.demoMode && this.difficulty === "HARD") {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap <= CUBE_SIZE * 0.4) {
                    this.noteSpikeMiss(target);
                    // Щит або сердечко перестрибують шип замість вибуху
                    if (this.failAt("late", target, gap) !== "forgiven") {
                        return;
                    }
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.state !== "ahead") {
                continue;
            }
            const dx = Math.abs(spike.x - this.player.x);
            const halfW = spikeHalfWidth(spike.type);
            if (dx < halfW + CUBE_SIZE * 0.32 && this.player.y < SPIKE_H * 0.72) {
                this.noteSpikeMiss(spike);
                // Щит або сердечко розбивають шип, і кубик їде далі
                if (this.failAt("collision", spike, 0) !== "forgiven") {
                    return;
                }
                continue;
            }
            if (spike.x + halfW < this.player.x) {
                spike.state = "cleared";
                if (spike.clearedAt === undefined) {
                    spike.clearedAt = this.currentTime;
                }
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
}

// Методи Engine розкладено по файлах: зброя — engine_weapons.js, рендер кадру й HUD —
// engine_render.js, малювання перешкод, кубика й ефектів — engine_render_objects.js.
// Вони описані як класи-частини й переносяться в Engine.prototype тими самими
// неперелічуваними властивостями, які мають звичайні методи класу.
function installMethods(target, part) {
    for (const name of Object.getOwnPropertyNames(part.prototype)) {
        if (name !== "constructor") {
            Object.defineProperty(target.prototype, name, Object.getOwnPropertyDescriptor(part.prototype, name));
        }
    }
}

installMethods(Engine, EngineWeapons);
installMethods(Engine, EngineRender);
installMethods(Engine, EngineRenderObjects);

// Реекспорт для сумісності: main.js, preview.js і shop_preview.js імпортують це з engine.js
export { ALL_LEVELS, BOSS_LEVEL_ID, COMBO_KINDS, DEFAULT_SKIN, LEVELS_CONFIG, levelOrderIndex, nextLevelOf } from "./levels.js";
export { activeSkinPerk, drawAchievementFrame, levelSkinPerk } from "./skins.js";
export { SKIN_RENDERERS } from "./skin_renderers.js";
export { save } from "./save.js";
